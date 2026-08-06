import express from 'express';
import {
  createPickupRequest,
  getAllPickupsAdmin,
  scanPickupQR,
  getIncomingFactoryPickups,
  completeFactoryPickup,
  assignPickupDriver,
  getSocietyPickups,
  getDeliveryPartnerPickups,
} from '../controllers/pickup.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// 1. Request waste pickup (BWG / Society Portal)
router.post('/request', protect, createPickupRequest);
router.get('/society', protect, getSocietyPickups);

// 2. Administrative View - Get all requested pickups
router.get('/admin/all', protect, getAllPickupsAdmin);

// 3. Delivery Partner Scanner View - Verify QR code scan & fetch active
router.post('/scan-qr', protect, scanPickupQR);
router.get('/delivery-partner', protect, getDeliveryPartnerPickups);

// 4. Factory Dashboard View - Get all incoming shipments (status = OUT_FOR_DELIVERY)
router.get('/factory/incoming', protect, getIncomingFactoryPickups);


// Additional lifecycle management endpoints
router.put('/:id/complete', protect, completeFactoryPickup);
router.put('/:id/assign', protect, assignPickupDriver);

export default router;
