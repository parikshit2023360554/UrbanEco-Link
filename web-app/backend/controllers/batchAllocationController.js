import pool, { query } from '../config/db.js';
import { getS2Token, getS2CellWithNeighbors, getHaversineDistanceKm } from '../utils/s2Helper.js';

/**
 * Google S2 Geometry Dynamic Auto-Assignment & Pooling Engine
 * Supports:
 * 1. Single Society Batch -> Multi-Factory Drop Split (Waterfall Allocation)
 * 2. Multi-Society Batch Pooling -> Single/Multi Factory Drops (S2 Neighborhood Pooling)
 */

/**
 * @desc    1. Waterfall Split Allocation (Single Society Batch -> Multi-Factory Drops)
 *          Automatically distributes a large society batch (e.g. 40kg) across nearest candidate factories (e.g. 20kg + 20kg)
 * @route   POST /api/batches/auto-assign (also /api/v1/batches/auto-assign)
 * @access  Public / Private
 */
export const autoAssignBatch = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { batch_id, society_user_id, waste_category, total_weight_kg } = req.body;

    if (!total_weight_kg || isNaN(parseFloat(total_weight_kg)) || parseFloat(total_weight_kg) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid total_weight_kg positive number is required for auto-allocation.',
      });
    }

    const totalWeightKg = parseFloat(total_weight_kg);
    const category = (waste_category || 'PLASTIC').toUpperCase();

    let societyLat = null;
    let societyLng = null;
    let societyName = 'Registered Society';
    let targetBatchId = batch_id || null;

    // Retrieve Society details & location
    if (society_user_id) {
      const addrRes = await client.query(
        `SELECT a.latitude, a.longitude, u.society_name, u.name, u.full_name 
         FROM users u 
         LEFT JOIN addresses a ON u.id = a.user_id 
         WHERE u.id = $1 LIMIT 1`,
        [society_user_id]
      );
      if (addrRes.rows.length > 0) {
        const row = addrRes.rows[0];
        societyName = row.society_name || row.name || row.full_name || societyName;
        if (row.latitude && row.longitude) {
          societyLat = parseFloat(row.latitude);
          societyLng = parseFloat(row.longitude);
        }
      }
    }

    if ((!societyLat || !societyLng) && targetBatchId) {
      const batchRes = await client.query(
        `SELECT b.id, b.society_id, b.society_name, a.latitude, a.longitude 
         FROM batches b 
         LEFT JOIN addresses a ON (b.society_id = a.user_id OR b.user_id = a.user_id) 
         WHERE b.id::text = $1 LIMIT 1`,
        [String(targetBatchId)]
      );
      if (batchRes.rows.length > 0) {
        const bRow = batchRes.rows[0];
        if (bRow.society_name) societyName = bRow.society_name;
        if (bRow.latitude && bRow.longitude) {
          societyLat = parseFloat(bRow.latitude);
          societyLng = parseFloat(bRow.longitude);
        }
      }
    }

    // Default S2 Hub (New Delhi center) if non-geocoded
    if (!societyLat || !societyLng) {
      societyLat = 28.613939;
      societyLng = 77.209021;
    }

    // Compute S2 Cell Token (Level 13 ~ 0.5km^2) and 8 surrounding spatial neighbors
    const societyS2Token = getS2Token(societyLat, societyLng, 13);
    const targetS2Tokens = getS2CellWithNeighbors(societyLat, societyLng, 13);

    if (society_user_id) {
      await client.query(
        'UPDATE addresses SET s2_cell_token = $1 WHERE user_id = $2',
        [societyS2Token, society_user_id]
      );
    }

    // Query active candidate factories (if remaining_quota_kg is 0, fall back to weekly_quota_kg)
    const factoryQuery = `
      SELECT 
        u.id as factory_user_id,
        u.name as user_name,
        fp.factory_name,
        fp.contact_person,
        CASE 
          WHEN COALESCE(fp.remaining_quota_kg, 0) > 0 THEN fp.remaining_quota_kg
          ELSE COALESCE(fp.weekly_quota_kg, 1000)
        END as remaining_quota_kg,
        COALESCE(fp.weekly_quota_kg, 1000) as weekly_quota_kg,
        a.latitude,
        a.longitude,
        a.s2_cell_token
      FROM users u
      LEFT JOIN factory_profiles fp ON (u.id = fp.user_id OR u.id::text = fp.user_id::text)
      LEFT JOIN addresses a ON (u.id = a.user_id OR u.id::text = a.user_id::text)
      WHERE u.role = 'FACTORY' OR u.role = 'ORG'
    `;

    const factoryRes = await client.query(factoryQuery);
    let candidateFactories = factoryRes.rows;

    // Prioritize spatial matches while keeping all registered factories eligible
    const spatialMatchedFactories = candidateFactories.filter(
      (f) => f.s2_cell_token && targetS2Tokens.includes(f.s2_cell_token)
    );

    const otherFactories = candidateFactories.filter(
      (f) => !f.s2_cell_token || !targetS2Tokens.includes(f.s2_cell_token)
    );

    candidateFactories = [...spatialMatchedFactories, ...otherFactories];

    if (candidateFactories.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No candidate factories found in database.`,
        s2_cell_token: societyS2Token,
      });
    }

    // Map candidate factories with location & capacity details
    candidateFactories = candidateFactories.map((factory, idx) => {
      const fLat = factory.latitude ? parseFloat(factory.latitude) : societyLat + (0.01 * (idx + 1));
      const fLng = factory.longitude ? parseFloat(factory.longitude) : societyLng + (0.01 * (idx + 1));
      const dist = parseFloat(getHaversineDistanceKm(societyLat, societyLng, fLat, fLng).toFixed(2));
      const factoryS2 = getS2Token(fLat, fLng, 13);
      return {
        ...factory,
        latitude: fLat,
        longitude: fLng,
        distance_km: dist,
        s2_cell_token: factory.s2_cell_token || factoryS2,
        remaining_quota_kg: parseFloat(factory.remaining_quota_kg),
      };
    });

    // Execute Waterfall Split Allocation in Postgres Transaction
    await client.query('BEGIN');

    let unallocatedWeight = totalWeightKg;
    const allocations = [];

    // Check if any single factory can take 100% of totalWeightKg
    const singleFitFactory = candidateFactories.find(
      (f) => parseFloat(f.remaining_quota_kg || 0) >= totalWeightKg
    );

    // If a single factory can take the full payload, deliver 100% to that factory.
    // Otherwise, split across 2, 3, or 4 candidate factories based on capacity.
    const maxPerFactory = singleFitFactory 
      ? totalWeightKg 
      : Math.max(10, Math.ceil(totalWeightKg / Math.min(Math.max(candidateFactories.length, 1), 3)));

    const routeStops = [
      {
        stop_number: 1,
        type: 'PICKUP',
        title: `Pickup from ${societyName}`,
        society_name: societyName,
        society_user_id,
        latitude: societyLat,
        longitude: societyLng,
        weight_kg: totalWeightKg,
        s2_cell_token: societyS2Token,
      },
    ];

    let dropIndex = 1;
    for (const factory of candidateFactories) {
      if (unallocatedWeight <= 0) break;

      const availableQuota = factory.remaining_quota_kg;
      if (availableQuota <= 0) continue;

      const assignedAmount = parseFloat(Math.min(unallocatedWeight, availableQuota, maxPerFactory).toFixed(2));
      const newRemainingQuota = parseFloat((availableQuota - assignedAmount).toFixed(2));

      // Decrement factory remaining daily quota
      await client.query(
        `UPDATE factory_profiles 
         SET remaining_quota_kg = $1, s2_cell_token = $2 
         WHERE user_id::text = $3::text OR id::text = $3::text`,
        [newRemainingQuota, factory.s2_cell_token, String(factory.factory_user_id)]
      );

      // Insert split allocation record
      const allocInsertRes = await client.query(
        `INSERT INTO batch_allocations (
           batch_id, factory_user_id, factory_id, allocated_weight_kg, distance_km, s2_cell_token, drop_order, status
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'ASSIGNED')
         RETURNING id, allocated_at`,
        [
          targetBatchId || null,
          String(factory.factory_user_id),
          String(factory.factory_user_id),
          assignedAmount,
          factory.distance_km,
          factory.s2_cell_token,
          dropIndex,
        ]
      );

      unallocatedWeight = parseFloat((unallocatedWeight - assignedAmount).toFixed(2));

      const factoryDisplayName = factory.factory_name || factory.user_name || `Recycling Factory ${dropIndex}`;

      allocations.push({
        allocation_id: allocInsertRes.rows[0].id,
        drop_order: dropIndex,
        factory_user_id: factory.factory_user_id,
        factory_name: factoryDisplayName,
        allocated_weight_kg: assignedAmount,
        distance_km: factory.distance_km,
        remaining_quota_kg: newRemainingQuota,
        s2_cell_token: factory.s2_cell_token,
      });

      routeStops.push({
        stop_number: dropIndex + 1,
        type: 'DROP',
        drop_order: dropIndex,
        title: `Drop ${dropIndex} at ${factoryDisplayName}`,
        factory_name: factoryDisplayName,
        factory_user_id: factory.factory_user_id,
        allocated_weight_kg: assignedAmount,
        distance_km: factory.distance_km,
        latitude: factory.latitude,
        longitude: factory.longitude,
        s2_cell_token: factory.s2_cell_token,
      });

      dropIndex++;
    }

    // Update batch status to PENDING_PICKUP awaiting driver scan
    if (targetBatchId) {
      await client.query(
        "UPDATE batches SET status = 'PENDING_PICKUP', factory_id = $1 WHERE id::text = $2",
        [allocations[0]?.factory_user_id || null, String(targetBatchId)]
      );
    }

    // Create single unified Delivery Route for driver with ordered stops
    const routeInsertRes = await client.query(
      `INSERT INTO delivery_routes (route_name, s2_cell_token, stops, total_weight_kg, total_distance_km, status)
       VALUES ($1, $2, $3, $4, $5, 'ASSIGNED')
       RETURNING id, created_at`,
      [
        `Dynamic Route: ${societyName} -> ${allocations.length} Factory Drops`,
        societyS2Token,
        JSON.stringify(routeStops),
        totalWeightKg,
        allocations.reduce((sum, a) => sum + a.distance_km, 0),
      ]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: `Waterfall split complete! Assigned 1 batch across ${allocations.length} factory delivery drop(s).`,
      route_id: routeInsertRes.rows[0].id,
      batch_id: targetBatchId,
      total_weight_kg: totalWeightKg,
      unallocated_weight_kg: unallocatedWeight,
      is_fully_allocated: unallocatedWeight === 0,
      society_info: {
        society_name: societyName,
        latitude: societyLat,
        longitude: societyLng,
        s2_cell_token: societyS2Token,
      },
      drops_count: allocations.length,
      allocations,
      route_waypoints: routeStops,
    });

  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

/**
 * @desc    2. S2 Spatial Multi-Society Batch Pooling Engine
 *          Pools multiple smaller society batches (e.g. 20kg Society A + 20kg Society B) into 1 multi-pickup route for a factory (40kg)
 * @route   POST /api/batches/pool-s2 (also /api/v1/batches/pool-s2)
 * @access  Public / Private
 */
export const poolS2Batches = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { waste_category, latitude, longitude, target_factory_id } = req.body;
    const category = (waste_category || 'PLASTIC').toUpperCase();

    const centerLat = latitude ? parseFloat(latitude) : 28.613939;
    const centerLng = longitude ? parseFloat(longitude) : 77.209021;

    const s2Token = getS2Token(centerLat, centerLng, 13);
    const s2Neighbors = getS2CellWithNeighbors(centerLat, centerLng, 13);

    // Find all unassigned society batches in the S2 spatial neighborhood
    const batchQuery = `
      SELECT 
        b.id,
        b.society_id,
        COALESCE(b.society_name, u.society_name, u.name, 'Registered Society') as society_name,
        COALESCE(b.weight_kg, b.total_weight_kg, 20) as weight_kg,
        COALESCE(b.stream_category, b.waste_category, 'PLASTIC') as stream_category,
        b.qr_code,
        a.latitude,
        a.longitude,
        a.s2_cell_token
      FROM batches b
      LEFT JOIN users u ON (b.society_id = u.id OR b.user_id = u.id)
      LEFT JOIN addresses a ON (b.society_id = a.user_id OR b.user_id = a.user_id)
      WHERE b.status IN ('PENDING_PICKUP', 'REQUESTED')
        AND (UPPER(COALESCE(b.stream_category, b.waste_category, 'PLASTIC')) = $1 OR $1 = 'ALL')
      ORDER BY b.created_at ASC
    `;

    const batchRes = await client.query(batchQuery, [category]);
    let pendingBatches = batchRes.rows;

    if (pendingBatches.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No unassigned society batches found in S2 neighborhood for waste stream '${category}'.`,
      });
    }

    // Filter by spatial S2 neighborhood
    const spatialBatches = pendingBatches.filter(
      (b) => !b.s2_cell_token || s2Neighbors.includes(b.s2_cell_token)
    );

    if (spatialBatches.length > 0) {
      pendingBatches = spatialBatches;
    }

    // Find candidate factory for pooled delivery
    let factoryQuery = `
      SELECT 
        u.id as factory_user_id,
        fp.factory_name,
        COALESCE(fp.remaining_quota_kg, fp.daily_quota_kg, 1000) as remaining_quota_kg,
        a.latitude,
        a.longitude
      FROM users u
      JOIN factory_profiles fp ON u.id = fp.user_id
      LEFT JOIN addresses a ON u.id = a.user_id
      WHERE (UPPER(fp.accepted_waste_category) = $1 OR UPPER(fp.accepted_waste_category) = 'PLASTIC' OR $1 = 'ALL')
        AND COALESCE(fp.remaining_quota_kg, fp.daily_quota_kg, 1000) > 0
    `;
    if (target_factory_id) {
      factoryQuery += ` AND u.id::text = '${target_factory_id}'`;
    }
    factoryQuery += ` LIMIT 1`;

    const factoryRes = await client.query(factoryQuery, [category]);
    const factory = factoryRes.rows[0] || {
      factory_user_id: null,
      factory_name: 'Central Eco Recycling Plant',
      remaining_quota_kg: 1000,
      latitude: centerLat + 0.03,
      longitude: centerLng + 0.03,
    };

    await client.query('BEGIN');

    let totalPooledWeight = 0;
    const pooledStops = [];
    let stopCounter = 1;

    for (const b of pendingBatches) {
      const bWeight = parseFloat(b.weight_kg);
      if (totalPooledWeight + bWeight > parseFloat(factory.remaining_quota_kg)) {
        break;
      }

      totalPooledWeight += bWeight;

      // Update batch status to ALLOCATED
      await client.query(
        `UPDATE batches SET status = 'ALLOCATED', factory_id = $1 WHERE id::text = $2`,
        [factory.factory_user_id, String(b.id)]
      );

      pooledStops.push({
        stop_number: stopCounter++,
        type: 'PICKUP',
        batch_id: b.id,
        title: `Pickup ${stopCounter - 1}: ${b.society_name}`,
        society_name: b.society_name,
        weight_kg: bWeight,
        qr_code: b.qr_code,
        latitude: b.latitude ? parseFloat(b.latitude) : centerLat,
        longitude: b.longitude ? parseFloat(b.longitude) : centerLng,
      });
    }

    if (pooledStops.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Insufficient factory quota to pool pending society batches.',
      });
    }

    // Add final Drop Stop at Factory
    pooledStops.push({
      stop_number: stopCounter,
      type: 'DROP',
      title: `Final Delivery: Drop ${totalPooledWeight}kg at ${factory.factory_name}`,
      factory_name: factory.factory_name,
      factory_user_id: factory.factory_user_id,
      weight_kg: totalPooledWeight,
      latitude: factory.latitude ? parseFloat(factory.latitude) : centerLat + 0.03,
      longitude: factory.longitude ? parseFloat(factory.longitude) : centerLng + 0.03,
    });

    // Create pooled delivery route in database
    const routeInsertRes = await client.query(
      `INSERT INTO delivery_routes (route_name, s2_cell_token, stops, total_weight_kg, total_distance_km, status)
       VALUES ($1, $2, $3, $4, $5, 'ASSIGNED')
       RETURNING id, created_at`,
      [
        `Multi-Society Route: ${pooledStops.length - 1} Pickups -> 1 Factory Drop`,
        s2Token,
        JSON.stringify(pooledStops),
        totalPooledWeight,
        3.5,
      ]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: `Pooled ${pooledStops.length - 1} society batch(es) into 1 multi-pickup delivery route!`,
      route_id: routeInsertRes.rows[0].id,
      total_pooled_weight_kg: totalPooledWeight,
      pickups_count: pooledStops.length - 1,
      target_factory: factory.factory_name,
      s2_neighborhood: s2Neighbors,
      route_waypoints: pooledStops,
    });

  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

/**
 * @desc    3. Get All Dynamic Driver Multi-Stop Routes
 * @route   GET /api/batches/routes (also /api/v1/batches/routes)
 * @access  Public / Private
 */
export const getDeliveryRoutes = async (req, res, next) => {
  try {
    const routesRes = await query(`
      SELECT 
        r.id,
        r.driver_id,
        COALESCE(r.route_name, 'Multi-Stop Delivery Route') as route_name,
        r.s2_cell_token,
        r.stops,
        r.total_weight_kg,
        r.total_distance_km,
        r.status,
        r.created_at
      FROM delivery_routes r
      ORDER BY r.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: routesRes.rows.length,
      routes: routesRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

export default { autoAssignBatch, poolS2Batches, getDeliveryRoutes };
