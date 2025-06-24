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

router.use(authMiddleware);

// Standalone document creation (no project)
router.route('/documents')
  .post(createStandaloneDocument);

// Project-based document creation and fetch
router.route('/projects/:projectId/documents')
  .post(createDocument)
  .get(getProjectDocuments);

router.route('/documents/:documentId')
  .get(getDocumentById)
  .put(updateDocument)
  .delete(deleteDocument);

export default router;
