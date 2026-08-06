import pool, { query } from '../config/db.js';

/**
 * Pillar 1: Batch Creation & Multi-Portal QR Scanning Lifecycle Controller
 */

/**
 * @desc    1. Create Waste Batch (Society Portal)
 *          Saves batch into PostgreSQL database with status = 'PENDING_PICKUP'
 * @route   POST /api/v1/batches/create
 * @access  Private (SOCIETY_ADMIN)
 */
export const createBatch = async (req, res, next) => {
  try {
    const society_id = req.user?.user_id || req.user?.id;
    const { stream_category, weight_kg, estimated_weight_kg } = req.body;

    const finalWeight = parseFloat(weight_kg || estimated_weight_kg);
    const finalStream = stream_category ? String(stream_category).toUpperCase() : null;

    if (!finalStream || isNaN(finalWeight)) {
      return res.status(400).json({ 
        success: false, 
        error: "Please provide stream_category and weight_kg" 
      });
    }

    const societyName = req.user?.society_name || req.user?.name || req.user?.full_name || 'Skyline Heights RWA';
    const qr_code = `QR_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const sql = `
      INSERT INTO batches (
        society_id, society_user_id, user_id, society_name, 
        stream_category, waste_category, weight_kg, total_weight_kg, unallocated_weight_kg, 
        qr_code, status, driver_id, factory_id, created_at
      )
      VALUES ($1, $1, $1, $2, $3, $3, $4, $4, $4, $5, 'PENDING_PICKUP', NULL, NULL, NOW())
      RETURNING *;
    `;

    const result = await query(sql, [
      society_id,
      societyName,
      finalStream,
      finalWeight,
      qr_code,
    ]);

    const createdBatch = result.rows[0];

    // Mirror to pickups table for backwards compatibility
    try {
      await query(
        `INSERT INTO pickups (user_id, society_name, stream_category, estimated_weight_kg, qr_code_token, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'REQUESTED', NOW())`,
        [society_id, societyName, finalStream, finalWeight, qr_code]
      );
    } catch (e) {}

    // Automatically perform S2 Waterfall Split Auto-Allocation across candidate factories
    try {
      const { autoAssignBatch } = await import('./batchAllocationController.js');
      if (autoAssignBatch) {
        const mockReq = { body: { batch_id: createdBatch.id, society_user_id: society_id, total_weight_kg: finalWeight, waste_category: finalStream } };
        const mockRes = { status: () => ({ json: () => {} }) };
        await autoAssignBatch(mockReq, mockRes, () => {});
      }
    } catch (allocErr) {
      console.warn('⚡ Automatic S2 batch allocation notice:', allocErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Batch created & automatically split-allocated across candidate factories!",
      qr_code: createdBatch.qr_code,
      batch: createdBatch,
    });
  } catch (error) {
    console.error("Error creating batch:", error);
    next(error);
  }
};

/**
 * @desc    Fetch Society's Registered Batches & Eco-Points
 * @route   GET /api/v1/batches/my-batches
 * @access  Private (SOCIETY_ADMIN)
 */
export const getMyBatches = async (req, res, next) => {
  try {
    const societyId = req.user?.user_id || req.user?.id;
    if (!societyId) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Society identity missing.' });
    }

    const selectQuery = `
      SELECT 
        b.id,
        b.society_id,
        COALESCE(b.society_name, u.society_name, u.name, u.full_name, 'Skyline Heights RWA') as society_name,
        b.stream_category,
        b.waste_category,
        b.weight_kg,
        b.total_weight_kg,
        b.qr_code,
        b.status,
        COALESCE(b.driver_name, 'Unassigned Driver') as driver_name,
        COALESCE(b.points_awarded, 0) as points_awarded,
        b.created_at,
        b.picked_up_at,
        b.delivered_at
      FROM batches b
      LEFT JOIN users u ON (b.society_id::text = u.id::text OR b.society_user_id::text = u.id::text OR b.user_id::text = u.id::text)
      WHERE b.society_id::text = $1::text OR b.society_user_id::text = $1::text OR b.user_id::text = $1::text OR u.id::text = $1::text
      ORDER BY b.created_at DESC
    `;

    const batchResult = await query(selectQuery, [String(societyId)]);

    // Join batches with batch_allocations and factory_profiles to return assigned factories array with allocated weight and confirmation status
    const batches = await Promise.all(
      batchResult.rows.map(async (batch) => {
        try {
          const allocRes = await query(
            `SELECT 
               ba.id as allocation_id,
               ba.allocated_weight_kg,
               ba.drop_order,
               COALESCE(ba.status, 'ASSIGNED') as status,
               ba.allocated_at,
               ba.confirmed_at,
               COALESCE(fp.factory_name, u_fac.name, 'Recycling Factory') as factory_name,
               u_fac.id as factory_user_id
             FROM batch_allocations ba
             LEFT JOIN factory_profiles fp ON (ba.factory_user_id::text = fp.user_id::text OR ba.factory_id::text = fp.user_id::text)
             LEFT JOIN users u_fac ON (ba.factory_user_id::text = u_fac.id::text OR ba.factory_id::text = u_fac.id::text)
             WHERE ba.batch_id::text = $1::text
             ORDER BY ba.drop_order ASC`,
            [String(batch.id)]
          );
          return {
            ...batch,
            assigned_factories: allocRes.rows,
            allocations: allocRes.rows,
          };
        } catch (e) {
          return { ...batch, assigned_factories: [], allocations: [] };
        }
      })
    );

    const userQuery = `SELECT COALESCE(eco_points, 0) as eco_points FROM users WHERE id::text = $1::text`;
    const userResult = await query(userQuery, [societyId ? String(societyId) : null]);
    const ecoPoints = userResult.rows[0]?.eco_points || 0;

    return res.status(200).json({
      success: true,
      count: batches.length,
      eco_points: ecoPoints,
      batches: batches,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Fetch Available Batches for Delivery Partner
 * @route   GET /api/v1/batches/delivery-available
 * @access  Private (DELIVERY_PARTNER)
 */
export const getDeliveryAvailableBatches = async (req, res, next) => {
  try {
    const driverId = req.user?.user_id || req.user?.id;

    const selectQuery = `
      SELECT 
        b.id,
        b.society_id,
        COALESCE(b.society_name, u.society_name, u.name, u.full_name, 'Registered Society') as society_name,
        COALESCE(b.stream_category, b.waste_category, 'WET') as stream_category,
        COALESCE(b.weight_kg, b.total_weight_kg, 150) as weight_kg,
        b.qr_code,
        b.status,
        b.driver_id,
        COALESCE(b.driver_name, 'Unassigned Driver') as driver_name,
        b.created_at,
        b.picked_up_at
      FROM batches b
      LEFT JOIN users u ON (b.society_id = u.id OR b.user_id = u.id)
      WHERE b.status = 'PENDING_PICKUP' OR b.driver_id::text = $1::text OR b.driver_id IS NULL
      ORDER BY b.created_at DESC
    `;

    const result = await query(selectQuery, [driverId ? String(driverId) : null]);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      batches: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delivery Driver Scan Controller (POST /api/delivery/scan-pickup)
 *          Updates batches.status = 'IN_TRANSIT' and all linked batch_allocations rows to 'IN_TRANSIT'
 * @route   POST /api/delivery/scan-pickup (also /api/v1/batches/delivery-scan)
 * @access  Private (DELIVERY_PARTNER)
 */
export const deliveryScanBatch = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { batch_id, driver_id, qr_code, qr_code_token } = req.body;
    const targetToken = (batch_id || qr_code || qr_code_token || '').trim();

    if (!targetToken) {
      return res.status(400).json({ success: false, error: 'Batch ID or QR code token is required for pickup scan.' });
    }

    const driverId = driver_id || req.user?.user_id || req.user?.id || null;
    const driverName = req.user?.name || req.user?.full_name || 'Driver Alex Rivera';

    await client.query('BEGIN');

    // a. Set batches.status = 'IN_TRANSIT', driver_id, driver_name, picked_up_at = NOW()
    const updateBatchQuery = `
      UPDATE batches
      SET 
        status = 'IN_TRANSIT',
        driver_id = COALESCE($1, driver_id),
        driver_name = $3,
        picked_up_at = CURRENT_TIMESTAMP
      WHERE (id::text = $2::text OR qr_code = $2)
      RETURNING *;
    `;

    const batchRes = await client.query(updateBatchQuery, [
      driverId ? String(driverId) : null,
      targetToken,
      driverName,
    ]);

    const updatedBatch = batchRes.rows[0];
    let targetBatchId = updatedBatch?.id || targetToken;

    // b. Update all linked batch_allocations rows for this batch: status = 'IN_TRANSIT'
    await client.query(
      `UPDATE batch_allocations 
       SET status = 'IN_TRANSIT' 
       WHERE batch_id::text = $1::text OR batch_id::text IN (SELECT id::text FROM batches WHERE qr_code = $2)`,
      [String(targetBatchId), targetToken]
    );

    // c. Assign driver to delivery_routes
    if (driverId) {
      await client.query(
        `UPDATE delivery_routes 
         SET driver_id = $1::text, status = 'IN_TRANSIT' 
         WHERE status = 'ASSIGNED' AND (stops::text LIKE '%' || $2 || '%' OR id::text = $2::text)`,
        [String(driverId), String(targetBatchId)]
      ).catch(() => {});
    }

    // Mirror to pickups table for backwards compatibility
    await client.query(
      `UPDATE pickups 
       SET status = 'OUT_FOR_DELIVERY', scanned_at = CURRENT_TIMESTAMP 
       WHERE qr_code_token = $1`,
      [targetToken]
    ).catch(() => {});

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'Driver scan verified! Batch and all allocated factory drops marked IN_TRANSIT.',
      batch: updatedBatch || { id: targetBatchId, status: 'IN_TRANSIT', driver_name: driverName },
    });

  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

/**
 * @desc    Fetch Incoming Shipments for Factory (status = IN_TRANSIT)
 * @route   GET /api/v1/batches/factory-incoming
 * @access  Private (FACTORY)
 */
export const getFactoryIncomingBatches = async (req, res, next) => {
  try {
    const selectQuery = `
      SELECT 
        b.id,
        COALESCE(b.society_id, b.society_user_id, b.user_id) as society_id,
        COALESCE(b.society_name, u.society_name, u.name, u.full_name, 'UrbanEco RWA') as society_name,
        COALESCE(b.driver_name, d.name, d.full_name, 'Logistics Driver') as driver_name,
        COALESCE(b.driver_name, d.name, d.full_name, 'Logistics Driver') as assigned_driver,
        COALESCE(b.stream_category, b.waste_category, 'PLASTIC') as stream_category,
        COALESCE(b.weight_kg, b.total_weight_kg, 0) as weight_kg,
        COALESCE(b.weight_kg, b.total_weight_kg, 0) as estimated_weight_kg,
        COALESCE(b.qr_code, 'QR_TRANSIT_PENDING') as qr_code,
        COALESCE(b.qr_code, 'QR_TRANSIT_PENDING') as qr_code_token,
        b.status,
        b.created_at,
        b.picked_up_at
      FROM batches b
      LEFT JOIN users u ON (b.society_id = u.id OR b.society_user_id = u.id OR b.user_id = u.id)
      LEFT JOIN users d ON (b.driver_id = d.id)
      WHERE b.status IN ('IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PENDING_PICKUP', 'REQUESTED', 'ALLOCATED')
      ORDER BY b.picked_up_at DESC NULLS LAST, b.created_at DESC
    `;

    const result = await query(selectQuery);
    const incomingTrucks = result.rows.length;
    const totalWeight = result.rows.reduce((sum, b) => sum + parseFloat(b.weight_kg || 0), 0);

    return res.status(200).json({
      success: true,
      count: incomingTrucks,
      incoming_trucks_count: incomingTrucks,
      total_incoming_weight_kg: totalWeight,
      pickups: result.rows,
      batches: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Factory Scans QR & Awards 50 Eco-Points
 * @route   POST /api/v1/batches/factory-scan
 * @access  Private (FACTORY)
 */
export const factoryScanBatch = async (req, res, next) => {
  try {
    const { qr_code, qr_code_token, pickupId } = req.body;
    const targetToken = (qr_code || qr_code_token || '').trim();
    const factoryId = req.user?.user_id || req.user?.id;

    const targetIdStr = String(pickupId || targetToken || '').trim();

    const updateBatchQuery = `
      UPDATE batches
      SET 
        status = 'COMPLETED',
        factory_id = $1,
        delivered_at = NOW(),
        points_awarded = 50
      WHERE qr_code = $2 OR id::text = $3
      RETURNING society_id, weight_kg, stream_category, qr_code
    `;

    const result = await query(updateBatchQuery, [factoryId, targetToken, targetIdStr]);
    let batch = result.rows[0];
    let targetSocietyId = batch?.society_id;

    if (!batch && targetToken) {
      const pickupQuery = await query(`SELECT * FROM pickups WHERE qr_code_token = $1 OR id::text = $2`, [targetToken, targetIdStr]);
      if (pickupQuery.rows.length > 0) {
        const p = pickupQuery.rows[0];
        targetSocietyId = p.user_id;
        await query(`UPDATE pickups SET status = 'DELIVERED' WHERE id::text = $1 OR qr_code_token = $1`, [String(p.id)]);
        batch = {
          id: p.id,
          qr_code: p.qr_code_token,
          society_id: p.user_id,
          stream_category: p.stream_category,
          weight_kg: p.estimated_weight_kg,
          status: 'COMPLETED',
          points_awarded: 50,
        };
      }
    }

    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found for provided QR code.' });
    }

    let updatedPoints = 50;
    if (targetSocietyId) {
      const updatePointsQuery = `
        UPDATE users
        SET eco_points = COALESCE(eco_points, 0) + 50
        WHERE id = $1
        RETURNING eco_points
      `;
      const pointsResult = await query(updatePointsQuery, [targetSocietyId]);
      if (pointsResult.rows.length > 0) {
        updatedPoints = pointsResult.rows[0].eco_points;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Factory intake verified! 50 Eco-Points awarded to society.',
      batch,
      points_awarded: 50,
      updated_society_points: updatedPoints,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch Completed Batches for Factory (status = COMPLETED)
 */
export const getFactoryCompletedBatches = async (req, res, next) => {
  try {
    const selectQuery = `
      SELECT 
        b.id,
        b.society_id,
        COALESCE(b.society_name, u.society_name, u.name, u.full_name, 'Skyline Heights RWA') as society_name,
        b.stream_category,
        b.weight_kg,
        b.qr_code,
        b.status,
        COALESCE(b.driver_name, d.name, d.full_name, 'Driver Alex Rivera') as driver_name,
        b.points_awarded,
        b.created_at,
        b.delivered_at
      FROM batches b
      LEFT JOIN users u ON (b.society_id = u.user_id OR b.society_id = u.id)
      LEFT JOIN users d ON (b.driver_id = d.user_id OR b.driver_id = d.id)
      WHERE b.status IN ('COMPLETED', 'DELIVERED')
      ORDER BY b.delivered_at DESC NULLS LAST
    `;

    const result = await query(selectQuery);
    return res.status(200).json({ success: true, count: result.rows.length, batches: result.rows });
  } catch (err) { next(err); }
};
