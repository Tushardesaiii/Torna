import express from 'express';
import {
  createDocument,
  getProjectDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument
} from '../controller/document.controller.js'; // Ensure all document controllers are imported
import { authMiddleware } from '../middleware/auth.middleware.js'; // Assuming you have this middleware

const router = express.Router();

// Apply authMiddleware to all routes defined after this line,
// as all document operations require an authenticated user.
router.use(authMiddleware);

// Routes for documents within a specific project
router.route('/projects/:projectId/documents')
  .post(createDocument)      // Create a new document in a project
  .get(getProjectDocuments); // Get all documents for a specific project

// Routes for individual documents (by documentId)
router.route('/documents/:documentId')
  .get(getDocumentById)     // Get a specific document by its ID
  .put(updateDocument)      // Update a specific document by its ID
  .delete(deleteDocument);  // Delete a specific document by its ID


export default router;