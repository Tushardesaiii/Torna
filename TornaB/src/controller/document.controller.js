import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Document } from "../models/document.model.js";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

// Helper: Count words in text
const calculateWordCount = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

// 📄 Create a document inside a project
export const createDocument = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const { projectId } = req.params;
  const newDoc = await Document.create({ title, project: projectId, owner: req.user._id });
  res.status(201).json(new ApiResponse(201, newDoc, "Document created successfully."));
});

// 📄 Create a standalone document (not linked to a project)
export const createStandaloneDocument = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const newDoc = await Document.create({ title, owner: req.user._id });
  res.status(201).json(new ApiResponse(201, newDoc, "Standalone document created."));
});

// 📁 Get all documents in a project
export const getProjectDocuments = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const ownerId = req.user?._id;

  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid or missing project ID.");
  }

  const project = await Project.findOne({
    _id: projectId,
    $or: [{ owner: ownerId }, { collaborators: ownerId }],
  });

  if (!project) {
    throw new ApiError(404, "Project not found or unauthorized.");
  }

  const documents = await Document.find({ project: projectId, owner: ownerId })
    .sort({ updatedAt: -1 })
    .lean();

  res.status(200).json(new ApiResponse(200, documents, "Documents fetched successfully."));
});

// 📄 Get a document by ID
export const getDocumentById = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const ownerId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw new ApiError(400, "Invalid document ID.");
  }

  const document = await Document.findOne({ _id: documentId, owner: ownerId }).populate(
    "project",
    "name owner"
  );

  if (!document) {
    throw new ApiError(404, "Document not found or unauthorized.");
  }

  res.status(200).json(new ApiResponse(200, document, "Document fetched successfully."));
});

// 🛠️ Update a document
export const updateDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const {
    title,
    wordGoal,
    type,
    notes = [],
    pages = [],
    worldBuilding = {}
  } = req.body;

  const doc = await Document.findById(documentId); // ✅ uses correct param
  if (!doc) {
    throw new ApiError(404, "Document not found");
  }

  doc.title = title ?? doc.title;
  doc.wordGoal = wordGoal ?? doc.wordGoal;
  doc.type = type ?? doc.type;

  doc.notes = Array.isArray(notes) ? notes : [];
  doc.pages = Array.isArray(pages) ? pages : [];

  doc.worldBuilding = {
    ...doc.worldBuilding,
    locations: Array.isArray(worldBuilding.locations) ? worldBuilding.locations : [],
    characters: Array.isArray(worldBuilding.characters) ? worldBuilding.characters : [],
    loreWiki: Array.isArray(worldBuilding.loreWiki) ? worldBuilding.loreWiki : [],
  };

  await doc.save();

  res.status(200).json(
    new ApiResponse(200, doc, "Document updated successfully")
  );
});


// 🗑️ Delete a document
export const deleteDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const ownerId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw new ApiError(400, "Invalid document ID.");
  }

  const document = await Document.findOne({ _id: documentId, owner: ownerId });
  if (!document) throw new ApiError(404, "Document not found or unauthorized.");

  const deletedWordCount = document.wordCount;
  await document.deleteOne();

  const user = await User.findById(ownerId);
  if (user) {
    user.totalWordsWritten = Math.max(0, user.totalWordsWritten - deletedWordCount);

    const today = new Date().setHours(0, 0, 0, 0);
    const todayEntry = user.wordCountHistory.find(entry =>
      new Date(entry.date).setHours(0, 0, 0, 0) === today
    );

    if (todayEntry) {
      todayEntry.words = Math.max(0, todayEntry.words - deletedWordCount);
      todayEntry.goalAchieved = todayEntry.words >= user.dailyWordGoal;
      user.markModified("wordCountHistory");
    }

    await user.save({ validateBeforeSave: false });
  }

  res.status(200).json(new ApiResponse(200, {}, "Document deleted successfully."));
});
