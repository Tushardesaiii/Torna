import express from 'express';
import {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addCollaboratorToProject,    // For future/optional collaboration feature
  removeCollaboratorFromProject // For future/optional collaboration feature
} from '../controller/project.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js'; // Assuming you have this middleware

const router = express.Router();

// All project routes require authentication
router.use(authMiddleware); // Apply authMiddleware to all routes defined after this line

// Project CRUD Operations
router.route('/')
  .post(createProject)    // Create a new project
  .get(getUserProjects);  // Get all projects for the authenticated user

router.route('/:projectId')
  .get(getProjectById)    // Get a specific project by ID
  .put(updateProject)     // Update a specific project by ID
  .delete(deleteProject); // Delete a specific project by ID

// Collaborator Management (Optional/Future Features)
router.route('/:projectId/collaborators')
  .put(addCollaboratorToProject); // Add a collaborator to a project

router.route('/:projectId/collaborators/:collaboratorId')
  .delete(removeCollaboratorFromProject); // Remove a collaborator from a project


export default router;