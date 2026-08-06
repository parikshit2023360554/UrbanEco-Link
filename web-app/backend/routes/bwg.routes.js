import express from 'express';
import { createWasteLog, getComplianceReport } from '../controllers/bwg.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateWasteLog } from '../middleware/validation.middleware.js';

const router = express.Router();

// All BWG routes require JWT protection
router.use(protect);

/**
 * Pillar 1: Bulk Waste Management Routes
 */

// POST /api/v1/bwg/waste-log: Log daily bag volume & calculate mass via statutory density engine
router.post(
  '/waste-log',
  authorize('SOCIETY_ADMIN', 'FACTORY', 'RESIDENT'),
  validateWasteLog,
  createWasteLog
);

// GET /api/v1/bwg/compliance-report: Aggregated 30-day compliance metrics & CPCB status
router.get(
  '/compliance-report',
  authorize('SOCIETY_ADMIN', 'FACTORY', 'RESIDENT'),
  getComplianceReport
);

export default router;
