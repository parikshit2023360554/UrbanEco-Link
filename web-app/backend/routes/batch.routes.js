import express from 'express';
import {
  createBatch,
  getMyBatches,
  getDeliveryAvailableBatches,
  deliveryScanBatch,
  getFactoryIncomingBatches,
  factoryScanBatch,
  getFactoryCompletedBatches,
} from '../controllers/batch.controller.js';
import { autoAssignBatch, poolS2Batches, getDeliveryRoutes } from '../controllers/batchAllocationController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * 1. Society Portal: Batch Creation, My-Batches, S2 Auto-Assignment & Pooling
 */
router.post('/auto-assign', autoAssignBatch);
router.post('/pool-s2', poolS2Batches);
router.get('/routes', getDeliveryRoutes);
router.post('/create', protect, createBatch);
router.get('/my-batches', protect, getMyBatches);

/**
 * 2. Delivery Partner Portal: Fetch Available Batches & QR Scan
 */
router.get('/delivery-available', getDeliveryAvailableBatches);
router.get('/delivery-active', getDeliveryAvailableBatches); // Alias for compatibility
router.post('/delivery-scan', deliveryScanBatch);
router.post('/scan-pickup', deliveryScanBatch);

/**
 * 3. Factory Portal: Fetch Incoming Shipments & Verify QR Intake
 */
router.get('/factory-incoming', getFactoryIncomingBatches);
router.post('/factory-scan', factoryScanBatch);
router.get('/factory-completed', getFactoryCompletedBatches);

export default router;
