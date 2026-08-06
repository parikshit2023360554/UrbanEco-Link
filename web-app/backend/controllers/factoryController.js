import pool, { query } from '../config/db.js';

/**
 * Factory Data Isolation, Quota Settings & Delivery Confirmation Controller
 */

/**
 * @desc    1. Isolated Factory Incoming Shipments
 *          STRICT DATA ISOLATION: A factory MUST ONLY see shipments specifically assigned to them!
 * @route   GET /api/factory/shipments (also /api/v1/factory/shipments)
 * @access  Private (FACTORY)
 */
export const getFactoryShipments = async (req, res, next) => {
  try {
    const factoryId = String(req.user?.id || req.user?.user_id || '').trim();

    if (!factoryId) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Factory identity missing.' });
    }

    const selectQuery = `
      SELECT 
        ba.id AS allocation_id,
        ba.batch_id,
        ba.allocated_weight_kg,
        ba.drop_order,
        COALESCE(ba.status, 'ASSIGNED') AS shipment_status,
        COALESCE(ba.status, 'ASSIGNED') AS allocation_status,
        ba.allocated_at,
        ba.confirmed_at,
        b.qr_code,
        b.status AS batch_status,
        COALESCE(b.stream_category, b.waste_category, 'PLASTIC') AS waste_category,
        COALESCE(b.stream_category, b.waste_category, 'PLASTIC') AS stream_category,
        COALESCE(b.society_name, u.society_name, u.name, u.full_name, 'Registered Society') AS society_name,
        a.street_address AS pickup_address,
        a.latitude AS pickup_lat,
        a.longitude AS pickup_lng
      FROM batch_allocations ba
      JOIN batches b ON (ba.batch_id::text = b.id::text)
      LEFT JOIN users u ON (b.society_id::text = u.id::text OR b.society_user_id::text = u.id::text OR b.user_id::text = u.id::text)
      LEFT JOIN addresses a ON (b.society_id::text = a.user_id::text OR b.society_user_id::text = a.user_id::text OR b.user_id::text = a.user_id::text)
      WHERE (ba.factory_user_id::text = $1::text OR ba.factory_id::text = $1::text)
        AND ba.status IN ('ASSIGNED', 'IN_TRANSIT', 'DELIVERED')
      ORDER BY ba.allocated_at DESC;
    `;

    const result = await query(selectQuery, [factoryId]);

    const totalWeight = result.rows.reduce((sum, item) => sum + parseFloat(item.allocated_weight_kg || 0), 0);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      incoming_trucks_count: result.rows.length,
      total_incoming_weight_kg: totalWeight,
      pickups: result.rows,
      shipments: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    2. Factory Portal Settings (Weekly Waste Requirement & Quotas)
 * @route   PUT /api/factory/settings (also /api/v1/factory/settings)
 * @access  Private (FACTORY)
 */
export const updateFactorySettings = async (req, res, next) => {
  try {
    const factoryId = String(req.user?.id || req.user?.user_id || '').trim();
    const { weekly_quota_kg } = req.body;

    if (!factoryId) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const weeklyQuota = weekly_quota_kg ? parseFloat(weekly_quota_kg) : 1000;

    const updateQuery = `
      UPDATE factory_profiles
      SET 
        weekly_quota_kg = $1,
        remaining_quota_kg = COALESCE(remaining_quota_kg, $1)
      WHERE user_id::text = $2
      RETURNING *
    `;

    const result = await query(updateQuery, [weeklyQuota, factoryId]);

    if (result.rows.length === 0) {
      await query(
        `INSERT INTO factory_profiles (user_id, weekly_quota_kg, remaining_quota_kg)
         VALUES ($1, $2, $2)`,
        [factoryId, weeklyQuota]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Factory weekly quota requirement saved successfully!',
      settings: {
        weekly_quota_kg: weeklyQuota,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    3. Multi-Factory Independent Delivery Confirmation Controller
 *          Batch marks COMPLETED ONLY when ALL assigned factories confirm receipt!
 * @route   POST /api/factory/confirm-delivery (also /api/v1/factory/confirm-delivery)
 * @access  Private (FACTORY)
 */
export const confirmFactoryDelivery = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const factoryId = String(req.user?.id || req.user?.user_id || '').trim();
    const { allocation_id, batch_id, qr_code } = req.body;

    if (!factoryId) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Factory identity missing.' });
    }

    await client.query('BEGIN');

    // 1. Locate target allocation
    let allocRes;
    if (allocation_id) {
      allocRes = await client.query(
        `SELECT * FROM batch_allocations WHERE id::text = $1::text`,
        [String(allocation_id)]
      );
    } 
    
    if (!allocRes?.rows?.[0] && (batch_id || qr_code)) {
      allocRes = await client.query(
        `SELECT ba.* FROM batch_allocations ba
         JOIN batches b ON (ba.batch_id::text = b.id::text)
         WHERE (b.id::text = $1::text OR b.qr_code = $2) 
           AND (ba.factory_user_id::text = $3::text OR ba.factory_id::text = $3::text)`,
        [String(batch_id || ''), qr_code || '', factoryId]
      );
    }

    let targetAllocation = allocRes?.rows[0];

    if (!targetAllocation) {
      const fallbackRes = await client.query(
        `SELECT * FROM batch_allocations 
         WHERE (factory_user_id::text = $1::text OR factory_id::text = $1::text) 
         ORDER BY allocated_at DESC LIMIT 1`,
        [factoryId]
      );
      targetAllocation = fallbackRes.rows[0];
    }

    if (!targetAllocation) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'No matching pending shipment allocation found for this factory.' });
    }

    // Handle idempotency if already delivered
    if (targetAllocation.status === 'DELIVERED') {
      await client.query('COMMIT');
      return res.status(200).json({
        success: true,
        message: 'Delivery for this shipment has already been confirmed! ✅',
        overall_batch_status: 'COMPLETED'
      });
    }

    // Step A: Mark Factory Allocation as Delivered
    await client.query(
      `UPDATE batch_allocations 
       SET status = 'DELIVERED', confirmed_at = CURRENT_TIMESTAMP 
       WHERE id::text = $1 AND (factory_user_id::text = $2 OR factory_id::text = $2)`,
      [String(targetAllocation.id), factoryId]
    );

    const targetBatchId = targetAllocation.batch_id;

    // Step B: Multi-Factory Completion Logic
    // Automatically set Batch status to 'COMPLETED' ONLY if ALL allocations for this batch are 'DELIVERED'
    let overallBatchStatus = 'PARTIALLY_DELIVERED';
    let isFullyCompleted = false;

    if (targetBatchId) {
      const batchUpdateRes = await client.query(
        `UPDATE batches 
         SET 
           status = CASE 
             WHEN NOT EXISTS (
               SELECT 1 FROM batch_allocations 
               WHERE batch_id::text = $1::text AND status != 'DELIVERED'
             ) THEN 'COMPLETED'
             ELSE 'PARTIALLY_DELIVERED'
           END,
           delivered_at = CASE 
             WHEN NOT EXISTS (
               SELECT 1 FROM batch_allocations 
               WHERE batch_id::text = $1::text AND status != 'DELIVERED'
             ) THEN CURRENT_TIMESTAMP
             ELSE delivered_at
           END
         WHERE id::text = $1::text
         RETURNING status`,
        [String(targetBatchId)]
      );

      overallBatchStatus = batchUpdateRes.rows[0]?.status || 'PARTIALLY_DELIVERED';
      isFullyCompleted = overallBatchStatus === 'COMPLETED';
    }

    // Award 50 Eco-Points to society user if overall batch completes
    if (isFullyCompleted) {
      await client.query(
        `UPDATE users 
         SET eco_points = COALESCE(eco_points, 0) + 50 
         WHERE id::text = (SELECT society_id::text FROM batches WHERE id::text = $1 LIMIT 1)`,
        [String(targetBatchId)]
      );
    }

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: isFullyCompleted 
        ? 'All multi-factory split deliveries confirmed! Batch marked COMPLETED & 50 Eco-Points awarded.' 
        : 'Factory delivery confirmed! Batch status updated to PARTIALLY_DELIVERED pending remaining factory confirmation.',
      allocation_id: targetAllocation.id,
      batch_id: targetBatchId,
      overall_batch_status: overallBatchStatus,
      is_fully_completed: isFullyCompleted,
    });

  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

/**
 * @desc    4. Factory Live Telemetry Stats
 * @route   GET /api/factory/stats (also /api/v1/factory/stats)
 * @access  Private (FACTORY)
 */
export const getFactoryStats = async (req, res, next) => {
  try {
    const factoryId = String(req.user?.id || req.user?.user_id || '').trim();

    if (!factoryId) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const profileRes = await query(
      `SELECT daily_quota_kg, weekly_quota_kg, remaining_quota_kg, accepted_waste_category 
       FROM factory_profiles WHERE user_id::text = $1`,
      [factoryId]
    );

    const profile = profileRes.rows[0] || {};

    const allocRes = await query(
      `SELECT status, allocated_weight_kg FROM batch_allocations WHERE factory_user_id::text = $1 OR factory_id::text = $1`,
      [factoryId]
    );

    const rows = allocRes.rows;
    const totalProcessed = rows
      .filter((r) => r.status === 'DELIVERED')
      .reduce((sum, r) => sum + parseFloat(r.allocated_weight_kg || 0), 0);

    const pendingIncoming = rows.filter((r) => r.status !== 'DELIVERED').length;

    return res.status(200).json({
      success: true,
      stats: {
        daily_quota_kg: parseFloat(profile.daily_quota_kg || 1000),
        weekly_quota_kg: parseFloat(profile.weekly_quota_kg || 7000),
        remaining_quota_kg: parseFloat(profile.remaining_quota_kg || 1000),
        accepted_waste_category: profile.accepted_waste_category || 'PLASTIC',
        total_weight_processed_kg: totalProcessed,
        pending_incoming_trucks: pendingIncoming,
        completed_deliveries_count: rows.filter((r) => r.status === 'DELIVERED').length,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getFactoryShipments,
  updateFactorySettings,
  confirmFactoryDelivery,
  getFactoryStats,
};
