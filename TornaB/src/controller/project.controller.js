import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Project } from "../models/project.model.js";
import { Document } from "../models/document.model.js";
import { User } from "../models/user.model.js"; // Needed for updating user's project limit

// Helper function to update user's total projects count (optional, can be derived)
// If we want to strictly enforce project limits, this is important.
const updateUserProjectCount = async (userId) => {
    const totalProjects = await Project.countDocuments({ owner: userId });
    await User.findByIdAndUpdate(userId, { totalProjectsCount: totalProjects }, { new: true });
};


// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
export const createProject = asyncHandler(async (req, res) => {
  const { name, description, targetWordCount, dueDate, tags } = req.body;
  const ownerId = req.user?._id; // Extracted from authMiddleware

  if (!ownerId) {
    throw new ApiError(401, "Unauthorized: User not logged in.");
  }

  if (!name || name.trim() === "") {
    throw new ApiError(400, "Project name is required.");
  }

  // Optional: Check if user has reached their project limit
  const user = await User.findById(ownerId).select('subscription.projectLimit');
  if (!user) {
      throw new ApiError(404, "User not found.");
  }

  const projectCount = await Project.countDocuments({ owner: ownerId });
  if (user.subscription.projectLimit !== -1 && projectCount >= user.subscription.projectLimit) {
      throw new ApiError(403, `You have reached your project limit (${user.subscription.projectLimit} projects). Upgrade your plan to create more.`);
  }

  const project = await Project.create({
    owner: ownerId,
    name: name.trim(),
    description: description?.trim(),
    targetWordCount: targetWordCount || 0,
    dueDate: dueDate ? new Date(dueDate) : null,
    tags: tags || [],
  });

  if (!project) {
    throw new ApiError(500, "Failed to create project.");
  }

  // Update user's achievements if this is their first project
  // This logic can be more sophisticated (e.g., use a dedicated achievement service)
  const userProjects = await Project.countDocuments({ owner: ownerId });
  if (userProjects === 1) { // This is their first project
    const existingAchievement = user.achievements.find(ach => ach.id === "first_project");
    if (!existingAchievement) {
      user.achievements.push({
        id: "first_project",
        name: "First Project Created",
        description: "You've taken the first step!",
        icon: "RocketLaunchIcon", // Corresponds to the Heroicon name
        unlockedAt: Date.now(),
      });
      user.markModified('achievements'); // Important for saving array modifications
      await user.save({ validateBeforeSave: false }); // Save user without full re-validation
    }
  }

  return res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully."));
});

// @desc    Get all projects for the authenticated user
// @route   GET /api/projects
// @access  Private
export const getUserProjects = asyncHandler(async (req, res) => {
  const ownerId = req.user?._id;
  const { status, search, sortBy, sortOrder } = req.query; // Query parameters for filtering and sorting

  if (!ownerId) {
    throw new ApiError(401, "Unauthorized: User not logged in.");
  }

  let query = { owner: ownerId };

  // Filter by status if provided
  if (status) {
    query.status = status;
  }

  // Search by name or description
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  let sort = {};
  if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  } else {
      sort = { updatedAt: -1 }; // Default sort by most recently updated
  }

  const projects = await Project.find(query)
    .sort(sort)
    .populate("documents", "title wordCount lastEdited status") // Populate with basic document info
    .populate("collaborators", "fullName avatar") // Populate with collaborator info
    .lean(); // Use .lean() for faster query results if not saving/modifying documents afterwards

  // Frontend expects totalDocuments, so calculate here
  const projectsWithDocumentCount = projects.map(project => ({
    ...project,
    totalDocuments: project.documents ? project.documents.length : 0,
    documents: undefined // Optionally remove populated documents if not needed on summary list
  }));


  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectsWithDocumentCount,
        "User projects fetched successfully."
      )
    );
});

// @desc    Get a single project by ID
// @route   GET /api/projects/:projectId
// @access  Private
export const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const ownerId = req.user?._id;

  if (!ownerId) {
    throw new ApiError(401, "Unauthorized: User not logged in.");
  }

  const project = await Project.findOne({
    _id: projectId,
    owner: ownerId, // Ensure the project belongs to the authenticated user
  })
    .populate("documents") // Populate full document details for editing/viewing
    .populate("collaborators", "fullName avatar");

  if (!project) {
    throw new ApiError(404, "Project not found or you don't have access.");
  }

  // Add totalDocuments for frontend consistency
  const projectWithDocumentCount = {
    ...project.toObject(),
    totalDocuments: project.documents ? project.documents.length : 0
  };


  return res
    .status(200)
    .json(new ApiResponse(200, projectWithDocumentCount, "Project fetched successfully."));
});

// @desc    Update an existing project
// @route   PUT /api/projects/:projectId
// @access  Private
export const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const ownerId = req.user?._id;
  const { name, description, status, targetWordCount, dueDate, tags } = req.body;

  if (!ownerId) {
    throw new ApiError(401, "Unauthorized: User not logged in.");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID.");
  }

  const project = await Project.findOne({ _id: projectId, owner: ownerId });

  if (!project) {
    throw new ApiError(404, "Project not found or you don't have permission to update it.");
  }

  // Update fields
  if (name !== undefined) project.name = name.trim();
  if (description !== undefined) project.description = description?.trim();
  if (status !== undefined) project.status = status;
  if (targetWordCount !== undefined) project.targetWordCount = targetWordCount;
  if (dueDate !== undefined) project.dueDate = dueDate ? new Date(dueDate) : null;
  if (tags !== undefined) project.tags = tags;

  await project.save({ validateBeforeSave: true }); // Validate to ensure enums, min/max lengths are adhered to

  // Re-fetch project to ensure populated fields are consistent
  const updatedProject = await Project.findById(project._id)
                                    .populate("documents")
                                    .populate("collaborators", "fullName avatar");

  // Add totalDocuments for frontend consistency
  const updatedProjectWithDocCount = {
    ...updatedProject.toObject(),
    totalDocuments: updatedProject.documents ? updatedProject.documents.length : 0
  };

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProjectWithDocCount, "Project updated successfully."));
});

// @desc    Delete a project and its associated documents
// @route   DELETE /api/projects/:projectId
// @access  Private
export const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const ownerId = req.user?._id;

  if (!ownerId) {
    throw new ApiError(401, "Unauthorized: User not logged in.");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID.");
  }

  const project = await Project.findOne({ _id: projectId, owner: ownerId });

  if (!project) {
    throw new ApiError(404, "Project not found or you don't have permission to delete it.");
  }

  // Delete all documents associated with this project first
  await Document.deleteMany({ project: projectId });

  // Then delete the project itself
  const deleteResult = await project.deleteOne(); // Use deleteOne() from the document instance

  if (!deleteResult.acknowledged) { // Check acknowledgement for Mongoose 6+
    throw new ApiError(500, "Failed to delete project.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project and associated documents deleted successfully."));
});

// @desc    Add a collaborator to a project
// @route   PUT /api/projects/:projectId/collaborators
// @access  Private (Owner only)
export const addCollaboratorToProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { collaboratorEmail } = req.body;
  const ownerId = req.user?._id;

  if (!ownerId) {
    throw new ApiError(401, "Unauthorized: User not logged in.");
  }

  if (!collaboratorEmail || collaboratorEmail.trim() === "") {
    throw new ApiError(400, "Collaborator email is required.");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID.");
  }

  const project = await Project.findOne({ _id: projectId, owner: ownerId });

  if (!project) {
    throw new ApiError(404, "Project not found or you don't own this project.");
  }

  const collaboratorUser = await User.findOne({ email: collaboratorEmail.toLowerCase() });

  if (!collaboratorUser) {
    throw new ApiError(404, "Collaborator user not found with that email.");
  }

  if (project.collaborators.includes(collaboratorUser._id)) {
    throw new ApiError(409, "User is already a collaborator on this project.");
  }

  if (collaboratorUser._id.equals(ownerId)) {
    throw new ApiError(400, "You cannot add yourself as a collaborator.");
  }

  project.collaborators.push(collaboratorUser._id);
  await project.save();

  // Optionally send a notification to the added collaborator
  // await sendNotificationToUser(collaboratorUser._id, `You have been added as a collaborator to project: "${project.name}"`);

  const updatedProject = await Project.findById(project._id)
                                    .populate("documents")
                                    .populate("collaborators", "fullName avatar");

  const updatedProjectWithDocCount = {
    ...updatedProject.toObject(),
    totalDocuments: updatedProject.documents ? updatedProject.documents.length : 0
  };

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProjectWithDocCount, "Collaborator added successfully."));
});

// @desc    Remove a collaborator from a project
// @route   DELETE /api/projects/:projectId/collaborators/:collaboratorId
// @access  Private (Owner only)
export const removeCollaboratorFromProject = asyncHandler(async (req, res) => {
  const { projectId, collaboratorId } = req.params;
  const ownerId = req.user?._id;

  if (!ownerId) {
    throw new ApiError(401, "Unauthorized: User not logged in.");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(collaboratorId)) {
    throw new ApiError(400, "Invalid project or collaborator ID.");
  }

  const project = await Project.findOne({ _id: projectId, owner: ownerId });

  if (!project) {
    throw new ApiError(404, "Project not found or you don't own this project.");
  }

  // Ensure the collaborator to be removed is not the owner
  if (collaboratorId === ownerId.toString()) { // Compare string IDs
    throw new ApiError(400, "You cannot remove the project owner as a collaborator.");
  }

  const initialLength = project.collaborators.length;
  project.collaborators = project.collaborators.filter(
    (id) => id.toString() !== collaboratorId
  );

  if (project.collaborators.length === initialLength) {
    throw new ApiError(404, "Collaborator not found on this project.");
  }

  await project.save();

  const updatedProject = await Project.findById(project._id)
                                    .populate("documents")
                                    .populate("collaborators", "fullName avatar");

  const updatedProjectWithDocCount = {
    ...updatedProject.toObject(),
    totalDocuments: updatedProject.documents ? updatedProject.documents.length : 0
  };

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProjectWithDocCount, "Collaborator removed successfully."));
});