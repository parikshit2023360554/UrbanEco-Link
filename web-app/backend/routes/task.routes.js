import express from 'express';
import { assignTask, verifyCleanupTask } from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateTaskVerification } from '../middleware/validation.middleware.js';

const router = express.Router();

// All task routes require JWT protection and NGO role authorization
router.use(protect);

/**
 * Pillar 3: Anti-Fraud & Task Engine Routes
 */

// POST /api/v1/tasks/assign: NGO claims task for cleanup
router.post('/assign', authorize('NGO'), assignTask);

// POST /api/v1/tasks/verify-cleanup: Verify NGO cleanup photo via PostGIS GPS proximity (<10m tolerance)
router.post(
  '/verify-cleanup',
  authorize('NGO'),
  validateTaskVerification,
  verifyCleanupTask
);

export default router;
