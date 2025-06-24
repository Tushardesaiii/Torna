import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Document } from "../models/document.model.js";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js"; // Needed for document limits and total words written
import mongoose from "mongoose";

// Helper function to calculate word count
const calculateWordCount = (text) => {
  if (!text) return 0;
  // Simple word count: split by whitespace and filter out empty strings
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// @desc    Create a new document within a project
// @route   POST /api/projects/:projectId/documents
// @access  Private
// controller/document.controller.js

export const createDocument = async (req, res) => {
  try {
    const { title } = req.body;
    const { projectId } = req.params;
    // You may want to add owner: req.user._id if you use authentication
    const newDoc = await Document.create({ title, project: projectId, owner: req.user._id });
    res.status(201).json({ success: true, data: newDoc });
  } catch (err) {
    console.error('Error creating document:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// For creating a document WITHOUT a project
export const createStandaloneDocument = async (req, res) => {
  try {
    const { title } = req.body;
    // You may want to add owner: req.user._id if you use authentication
    const newDoc = await Document.create({ title, owner: req.user._id });
    res.status(201).json({ success: true, data: newDoc });
  } catch (err) {
    console.error('Error creating standalone document:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Get all documents for a specific project
// @route   GET /api/projects/:projectId/documents
// @access  Private
export const getProjectDocuments = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const ownerId = req.user?._id;

  if (!ownerId) {
    throw new ApiError(401, "Unauthorized: User not logged in.");
  }

  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid or missing project ID.");
  }

  // Ensure user has access to the project
  const project = await Project.findOne({
    _id: projectId,
    $or: [{ owner: ownerId }, { collaborators: ownerId }],
  });

  if (!project) {
    throw new ApiError(404, "Project not found or you don't have access to it.");
  }

  const documents = await Document.find({ project: projectId, owner: ownerId }) // Ensure documents belong to owner within the project
    .sort({ updatedAt: -1 })
    .lean(); // Use .lean() for faster results

  return res
    .status(200)
    .json(new ApiResponse(200, documents, "Documents fetched successfully."));
});

// controller/document.controller.js






// @desc    Get a single document by ID
// @route   GET /api/documents/:documentId
// @access  Private
export const getDocumentById = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const ownerId = req.user?._id;

  if (!ownerId) {
    throw new ApiError(401, "Unauthorized: User not logged in.");
  }

  if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
    throw new ApiError(400, "Invalid or missing document ID.");
  }

  const document = await Document.findOne({ _id: documentId, owner: ownerId }).populate(
    "project",
    "name owner"
  ); // Populate project name and owner for context

  if (!document) {
    throw new ApiError(404, "Document not found or you don't have access to it.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, document, "Document fetched successfully."));
});

// @desc    Update an existing document
// @route   PUT /api/documents/:documentId
// @access  Private
export const updateDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const { title, content, status } = req.body;
  const ownerId = req.user?._id;

  if (!ownerId) {
    throw new ApiError(401, "Unauthorized: User not logged in.");
  }

  if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
    throw new ApiError(400, "Invalid or missing document ID.");
  }

  const document = await Document.findOne({ _id: documentId, owner: ownerId });

  if (!document) {
    throw new ApiError(404, "Document not found or you don't have permission to update it.");
  }

  // Update fields if provided
  if (title !== undefined) document.title = title.trim();
  if (content !== undefined) document.content = content;
  if (status !== undefined) document.status = status;

  // Recalculate word count if content changed
  const newWordCount = calculateWordCount(document.content);
  const oldWordCount = document.wordCount; // Store old word count to update user's totalWordsWritten

  if (document.isModified('content')) {
    document.wordCount = newWordCount;
    // Add current version to history (optional, can be done more granularly)
    document.history.push({
      content: document.content,
      wordCount: newWordCount,
      savedAt: Date.now()
    });
  }

  await document.save({ validateBeforeSave: true }); // Validate to ensure enums, min/max lengths are adhered to

  // Update user's totalWordsWritten and daily word count history
  const user = await User.findById(ownerId);
  if (user) {
    // Update overall total words written
    const wordDiff = newWordCount - oldWordCount;
    if (wordDiff !== 0) {
      user.totalWordsWritten = Math.max(0, user.totalWordsWritten + wordDiff);
    }

    // Update today's word count in history
    const today = new Date().setHours(0, 0, 0, 0);
    let todayEntry = user.wordCountHistory.find(entry => new Date(entry.date).setHours(0, 0, 0, 0) === today);

    if (todayEntry) {
      // Assuming this update is cumulative for the day, so add the diff
      // This is a simplified approach. A more robust system would recalculate daily totals from all documents.
      todayEntry.words = Math.max(0, todayEntry.words + wordDiff);
      todayEntry.goalAchieved = (todayEntry.words >= user.dailyWordGoal);
    } else {
      // If no entry for today, create one with the current document's word count
      user.wordCountHistory.push({
        date: today,
        words: newWordCount, // For the first save of the day for this document
        goalAchieved: (newWordCount >= user.dailyWordGoal)
      });
    }

    user.markModified('wordCountHistory'); // Mark the array as modified
    await user.save({ validateBeforeSave: false }); // Save user without full re-validation
  }

  // Trigger achievement for word count milestones (e.g., 1000 words, 10000 words)
  // This could be a separate helper function or microservice
  if (user && user.totalWordsWritten >= 1000) {
    const existingAchievement = user.achievements.find(ach => ach.id === "1000_words");
    if (!existingAchievement) {
      user.achievements.push({
        id: "1000_words",
        name: "1,000 Words Milestone",
        description: "You've written your first thousand words!",
        icon: "FeatherIcon", // Example Heroicon
        unlockedAt: Date.now(),
      });
      user.markModified('achievements');
      await user.save({ validateBeforeSave: false });
    }
  }


  return res
    .status(200)
    .json(new ApiResponse(200, document, "Document updated successfully."));
});

// @desc    Delete a document
// @route   DELETE /api/documents/:documentId
// @access  Private
export const deleteDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const ownerId = req.user?._id;

  if (!ownerId) {
    throw new ApiError(401, "Unauthorized: User not logged in.");
  }

  if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
    throw new ApiError(400, "Invalid or missing document ID.");
  }

  const document = await Document.findOne({ _id: documentId, owner: ownerId });

  if (!document) {
    throw new ApiError(404, "Document not found or you don't have permission to delete it.");
  }

  const projectId = document.project;
  const deletedWordCount = document.wordCount; // Store word count before deletion

  // The post('deleteOne') hook on the Document model will handle:
  // 1. Removing reference from project's documents array
  // 2. Decrementing project's currentWordCount
  const deleteResult = await document.deleteOne(); // Use deleteOne() from the document instance

  if (!deleteResult.acknowledged) {
    throw new ApiError(500, "Failed to delete document.");
  }

  // Update user's totalWordsWritten after document deletion
  const user = await User.findById(ownerId);
  if (user) {
    user.totalWordsWritten = Math.max(0, user.totalWordsWritten - deletedWordCount);
    // Optionally update today's word count if it was part of today's progress
    const today = new Date().setHours(0, 0, 0, 0);
    let todayEntry = user.wordCountHistory.find(entry => new Date(entry.date).setHours(0,0,0,0) === today);
    if (todayEntry) {
        todayEntry.words = Math.max(0, todayEntry.words - deletedWordCount);
        todayEntry.goalAchached = (todayEntry.words >= user.dailyWordGoal);
        user.markModified('wordCountHistory');
    }
    await user.save({ validateBeforeSave: false });
  }


  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Document deleted successfully."));
});