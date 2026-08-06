import express from 'express';
import { createCivicReport, getNearbyTasks, getAllCivicReports } from '../controllers/civic.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateCivicReport } from '../middleware/validation.middleware.js';

const router = express.Router();

// All civic routes require authentication
router.use(protect);

/**
 * Pillar 2: Crowdsourced Geofenced Civic Reports Routes
 */

// POST /api/v1/civic/report: Submit street report with PostGIS geography indexing
router.post('/report', validateCivicReport, createCivicReport);

// GET /api/v1/civic/reports: Query all street reports
router.get('/reports', getAllCivicReports);

// GET /api/v1/civic/nearby-tasks: Query reports within 2000m (2km) using PostGIS ST_DWithin
router.get('/nearby-tasks', getNearbyTasks);


export default router;
