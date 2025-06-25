import express from 'express';
import {
  createDocument,
  createStandaloneDocument,
  getProjectDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument
} from '../controller/document.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// ✅ Protected routes - all routes below require auth
router.use(authMiddleware);

// ✅ Create a standalone document (not linked to a project)
router.post('/documents', createStandaloneDocument);

// ✅ Create/fetch documents within a specific project
router
  .route('/projects/:projectId/documents')
  .post(createDocument)
  .get(getProjectDocuments);

// ✅ Get, update, or delete a specific document
router
  .route('/documents/:documentId')
  .get(getDocumentById)
  .put(updateDocument)
  .delete(deleteDocument);

export default router;
