import { query } from '../config/db.js';

/**
 * @desc    Request a new Waste Pickup (BWG / Society Portal)
 * @route   POST /api/v1/pickups/request
 * @access  Private (SOCIETY_ADMIN, RESIDENT, etc.)
 */
export const createPickupRequest = async (req, res, next) => {
  try {
    const { createBatch } = await import('./batch.controller.js');
    return createBatch(req, res, next);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all pickup requests for Admin Portal
 * @route   GET /api/v1/pickups/admin/all
 * @access  Private (Admin / All Authorized)
 */
export const getAllPickupsAdmin = async (req, res, next) => {
  try {
    const selectQuery = `
      SELECT 
        id,
        user_id,
        COALESCE(society_name, 'Skyline Heights RWA') as society_name,
        stream_category,
        estimated_weight_kg,
        qr_code_token,
        status,
        COALESCE(assigned_driver, 'Unassigned') as assigned_driver,
        created_at,
        scanned_at
      FROM pickups
      ORDER BY created_at DESC
    `;

    const result = await query(selectQuery);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      pickups: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Scan QR Code & update pickup status to IN_TRANSIT across all linked factory allocations
 * @route   POST /api/v1/pickups/scan-qr
 * @access  Private (DELIVERY_PARTNER / Driver)
 */
export const scanPickupQR = async (req, res, next) => {
  try {
    const { deliveryScanBatch } = await import('./batch.controller.js');
    return deliveryScanBatch(req, res, next);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get incoming pickups for Factory Dashboard (status = OUT_FOR_DELIVERY)
 * @route   GET /api/v1/pickups/factory/incoming
 * @access  Private (FACTORY / Admin)
 */
export const getIncomingFactoryPickups = async (req, res, next) => {
  try {
    const selectQuery = `
      SELECT 
        id,
        user_id,
        COALESCE(society_name, 'Skyline Heights RWA') as society_name,
        stream_category,
        estimated_weight_kg,
        qr_code_token,
        status,
        COALESCE(assigned_driver, 'Unassigned') as assigned_driver,
        created_at,
        scanned_at
      FROM pickups
      WHERE status = 'OUT_FOR_DELIVERY'
      ORDER BY scanned_at DESC NULLS LAST
    `;

    const result = await query(selectQuery);
    const pickups = result.rows;

    const totalWeight = pickups.reduce(
      (sum, p) => sum + parseFloat(p.estimated_weight_kg || 0),
      0
    );

    return res.status(200).json({
      success: true,
      count: pickups.length,
      incoming_trucks_count: pickups.length,
      total_incoming_weight_kg: parseFloat(totalWeight.toFixed(2)),
      pickups,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Complete Pickup Intake at Factory (status = DELIVERED)
 * @route   PUT /api/v1/pickups/:id/complete
 * @access  Private (FACTORY)
 */
export const completeFactoryPickup = async (req, res, next) => {
  try {
    const { confirmFactoryDelivery } = await import('./factoryController.js');
    return confirmFactoryDelivery(req, res, next);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Assign Driver to Pickup (Admin Portal)
 * @route   PUT /api/v1/pickups/:id/assign
 * @access  Private (Admin)
 */
export const assignPickupDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assigned_driver } = req.body;
    const targetId = String(id || '').trim();

    const updateQuery = `
      UPDATE pickups
      SET assigned_driver = $2
      WHERE id::text = $1 OR qr_code_token = $1
      RETURNING *
    `;

    const result = await query(updateQuery, [targetId, assigned_driver || 'Driver Alex Rivera']);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Pickup record not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Driver assigned successfully.',
      pickup: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get pickups for current Society
 * @route   GET /api/v1/pickups/society
 * @access  Private (SOCIETY_ADMIN)
 */
export const getSocietyPickups = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const societyName = req.user?.society_name;

    const selectQuery = `
      SELECT 
        id,
        user_id,
        COALESCE(society_name, 'Skyline Heights RWA') as society_name,
        stream_category,
        estimated_weight_kg,
        qr_code_token,
        status,
        COALESCE(assigned_driver, 'Unassigned') as assigned_driver,
        created_at,
        scanned_at
      FROM pickups
      WHERE user_id::text = $1::text OR society_name = $2
      ORDER BY created_at DESC
    `;

    const result = await query(selectQuery, [String(userId), societyName]);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      pickups: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get active pickups for Delivery Partner
 * @route   GET /api/v1/pickups/delivery-partner
 * @access  Private (DELIVERY_PARTNER)
 */
export const getDeliveryPartnerPickups = async (req, res, next) => {
  try {
    const selectQuery = `
      SELECT 
        id,
        user_id,
        COALESCE(society_name, 'Skyline Heights RWA') as society_name,
        stream_category,
        estimated_weight_kg,
        qr_code_token,
        status,
        COALESCE(assigned_driver, 'Unassigned') as assigned_driver,
        created_at,
        scanned_at
      FROM pickups
      WHERE status IN ('REQUESTED', 'OUT_FOR_DELIVERY')
      ORDER BY created_at DESC
    `;

    const result = await query(selectQuery);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      pickups: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

