import express from 'express';
import {
  getFactoryShipments,
  updateFactorySettings,
  confirmFactoryDelivery,
  getFactoryStats,
} from '../controllers/factoryController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Factory Data Isolation, Quota Settings & Delivery Confirmation Routes
 */
router.get('/shipments', protect, getFactoryShipments);
router.put('/settings', protect, updateFactorySettings);
router.post('/confirm-delivery', protect, confirmFactoryDelivery);
router.get('/stats', protect, getFactoryStats);

export default router;
