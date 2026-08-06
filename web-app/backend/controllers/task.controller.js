import { query } from '../config/db.js';
import { MAX_CLEANUP_PROXIMITY_METERS } from '../utils/geoUtils.js';

/**
 * @desc    Pillar 3: NGO Task Assignment - Claim a civic waste report for cleanup
 * @route   POST /api/v1/tasks/assign
 * @access  Private (NGO)
 */
export const assignTask = async (req, res, next) => {
  try {
    const { report_id } = req.body;
    const ngoId = req.user.id;

    // Check if report exists and is pending
    const reportResult = await query('SELECT * FROM civic_reports WHERE id = $1', [report_id]);
    if (reportResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Civic report not found.' });
    }

    const report = reportResult.rows[0];
    if (report.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Report cannot be assigned. Current status: ${report.status}`,
      });
    }

    // Begin Transaction to assign task and update report status
    await query('BEGIN');

    const insertTask = `
      INSERT INTO cleanup_tasks (report_id, ngo_id, status, assigned_at)
      VALUES ($1, $2, 'ASSIGNED', CURRENT_TIMESTAMP)
      RETURNING id, report_id, ngo_id, status, assigned_at
    `;
    const taskResult = await query(insertTask, [report_id, ngoId]);

    await query("UPDATE civic_reports SET status = 'ASSIGNED' WHERE id = $1", [report_id]);
    await query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Cleanup task successfully assigned to NGO.',
      task: taskResult.rows[0],
    });
  } catch (err) {
    await query('ROLLBACK');
    next(err);
  }
};

/**
 * @desc    Pillar 3: Anti-Fraud GPS & Visual Task Verification
 * @route   POST /api/v1/tasks/verify-cleanup
 * @access  Private (NGO)
 */
export const verifyCleanupTask = async (req, res, next) => {
  try {
    const { report_id, latitude, longitude, after_image_url } = req.body;
    const ngoId = req.user.id;

    /**
     * PostGIS Proximity Check SQL Query:
     * Calculates exact meter distance between original reported spot (r.location)
     * and the submitted 'After' photo GPS coordinates (ST_MakePoint($1, $2)::geography).
     */
    const proximityQuery = `
      SELECT 
        r.id as report_id,
        r.before_image_url,
        r.status as report_status,
        t.id as task_id,
        t.ngo_id,
        ST_Y(r.location::geometry) as original_lat,
        ST_X(r.location::geometry) as original_lng,
        ST_Distance(r.location, ST_MakePoint($1, $2)::geography) as distance_meters
      FROM civic_reports r
      LEFT JOIN cleanup_tasks t ON r.id = t.report_id
      WHERE r.id = $3
    `;

    const result = await query(proximityQuery, [
      longitude, // $1 = Submitted Longitude
      latitude,  // $2 = Submitted Latitude
      report_id, // $3 = Report ID
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Target report not found.' });
    }

    const taskData = result.rows[0];
    const distanceMeters = parseFloat(taskData.distance_meters);
    const isWithinProximity = distanceMeters <= MAX_CLEANUP_PROXIMITY_METERS; // <10m tolerance

    await query('BEGIN');

    if (isWithinProximity) {
      // ✅ SUCCESSFUL VERIFICATION (GPS < 10 meters)
      const updateReport = `
        UPDATE civic_reports
        SET status = 'VERIFIED'
        WHERE id = $1
      `;
      await query(updateReport, [report_id]);

      const updateTask = `
        UPDATE cleanup_tasks
        SET after_image_url = $1,
            submission_location = ST_MakePoint($2, $3)::geography,
            verification_distance_meters = $4,
            status = 'VERIFIED',
            submitted_at = CURRENT_TIMESTAMP,
            verified_at = CURRENT_TIMESTAMP,
            verification_notes = 'GPS Proximity Verified (<10m tolerance).'
        WHERE report_id = $5
      `;
      await query(updateTask, [after_image_url, longitude, latitude, distanceMeters, report_id]);

      // Reward NGO with +10 trust score points
      await query('UPDATE users SET trust_score = trust_score + 10 WHERE id = $1', [ngoId]);

      await query('COMMIT');

      return res.status(200).json({
        success: true,
        verification_status: 'VERIFIED',
        anti_fraud_passed: true,
        proximity_metrics: {
          distance_meters: Math.round(distanceMeters * 100) / 100,
          tolerance_threshold_meters: MAX_CLEANUP_PROXIMITY_METERS,
        },
        reward: {
          trust_score_delta: '+10 Points',
          new_trust_score: req.user.trust_score + 10,
        },
        message: 'Cleanup verified! GPS location matched original site within 10 meters.',
      });
    } else {
      // 🚨 FRAUD FLAG & PENALTY SLASHING (GPS > 10 meters)
      const penaltyPoints = 25;
      const fraudReason = `Fraudulent cleanup photo submission detected: GPS distance (${distanceMeters.toFixed(1)}m) exceeded mandatory 10m tolerance threshold.`;

      // Mark report and task as FLAGGED_FRAUD
      await query("UPDATE civic_reports SET status = 'FLAGGED_FRAUD' WHERE id = $1", [report_id]);

      const updateTaskFraud = `
        UPDATE cleanup_tasks
        SET after_image_url = $1,
            submission_location = ST_MakePoint($2, $3)::geography,
            verification_distance_meters = $4,
            status = 'FLAGGED_FRAUD',
            submitted_at = CURRENT_TIMESTAMP,
            verification_notes = $5
        WHERE report_id = $6
      `;
      await query(updateTaskFraud, [
        after_image_url,
        longitude,
        latitude,
        distanceMeters,
        fraudReason,
        report_id,
      ]);

      // Slash user/NGO trust score (-25 points, min score 0)
      await query(
        'UPDATE users SET trust_score = GREATEST(0, trust_score - $1) WHERE id = $2',
        [penaltyPoints, ngoId]
      );

      // Record slashing audit log
      const insertSlashing = `
        INSERT INTO slashing_logs (user_id, task_id, penalty_points, reason)
        VALUES ($1, $2, $3, $4)
      `;
      await query(insertSlashing, [
        ngoId,
        taskData.task_id || null,
        penaltyPoints,
        fraudReason,
      ]);

      await query('COMMIT');

      return res.status(400).json({
        success: false,
        verification_status: 'FLAGGED_FRAUD',
        anti_fraud_passed: false,
        error: 'Cleanup verification failed due to GPS distance mismatch.',
        proximity_metrics: {
          distance_meters: Math.round(distanceMeters * 100) / 100,
          tolerance_threshold_meters: MAX_CLEANUP_PROXIMITY_METERS,
        },
        slashing_penalty: {
          trust_score_deducted: `- ${penaltyPoints} Points`,
          reason: fraudReason,
        },
      });
    }
  } catch (err) {
    await query('ROLLBACK');
    next(err);
  }
};
