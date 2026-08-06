import { query } from '../config/db.js';
import {
  calculateMass,
  checkBWGCapacityThreshold,
  STATUTORY_BWG_THRESHOLD_KG,
} from '../utils/densityEngine.js';

/**
 * @desc    Pillar 1: Log Daily Bulk Waste Bag & Calculate Mass via Density Engine
 * @route   POST /api/v1/bwg/waste-log
 * @access  Private (SOCIETY_ADMIN, FACTORY, RESIDENT)
 */
export const createWasteLog = async (req, res, next) => {
  try {
    const { stream_category, estimated_volume_liters, notes } = req.body;
    const userId = req.user.id;

    // 1. Calculate Estimated Mass (KG) via Statutory Density Coefficients Engine
    const { mass_kg, coefficient } = calculateMass(stream_category, estimated_volume_liters);

    // 2. Fetch today's cumulative waste mass for this user/society to check 100kg/day trigger
    const todayLogsQuery = `
      SELECT COALESCE(SUM(estimated_mass_kg), 0) AS total_today_kg
      SELECT COALESCE(SUM(estimated_mass_kg), 0) AS total_today_kg
      FROM waste_logs
      WHERE user_id = $1 AND logged_at::date = CURRENT_DATE
    `;
    const todayResult = await query(
      `SELECT COALESCE(SUM(estimated_mass_kg), 0) AS total_today_kg
       FROM waste_logs
       WHERE user_id = $1 AND logged_at::date = CURRENT_DATE`,
      [userId]
    );

    const existingTodayKg = parseFloat(todayResult.rows[0].total_today_kg);
    const newCumulativeDailyKg = existingTodayKg + mass_kg;

    // 3. Evaluate Statutory BWG Capacity Alert Trigger (100 kg/day SWM 2026 limit)
    const thresholdEvaluation = checkBWGCapacityThreshold(newCumulativeDailyKg);

    // 4. Save Record in PostgreSQL waste_logs table
    const insertQuery = `
      INSERT INTO waste_logs (
        user_id, stream_category, estimated_volume_liters, estimated_mass_kg,
        density_coefficient, capacity_triggered, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, stream_category, estimated_volume_liters, estimated_mass_kg,
                density_coefficient, capacity_triggered, notes, logged_at
    `;

    const result = await query(insertQuery, [
      userId,
      stream_category,
      estimated_volume_liters,
      mass_kg,
      coefficient,
      thresholdEvaluation.alertTriggered,
      notes || null,
    ]);

    const newLog = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Waste log recorded successfully.',
      log: newLog,
      density_analysis: {
        stream_category,
        input_volume_liters: estimated_volume_liters,
        coefficient_used: coefficient,
        calculated_mass_kg: mass_kg,
      },
      capacity_trigger: {
        total_daily_mass_kg: newCumulativeDailyKg,
        statutory_threshold_kg: STATUTORY_BWG_THRESHOLD_KG,
        alert_triggered: thresholdEvaluation.alertTriggered,
        alert_message: thresholdEvaluation.alertMessage,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Pillar 1: Get Aggregated Compliance Report & CPCB SWM 2026 Metrics
 * @route   GET /api/v1/bwg/compliance-report
 * @access  Private (SOCIETY_ADMIN, FACTORY, RESIDENT)
 */
export const getComplianceReport = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Query 1: Aggregate Total Waste Mass by Category for the past 30 days
    const categoryTotalsQuery = `
      SELECT 
        stream_category,
        COUNT(*) as total_logs,
        COALESCE(SUM(estimated_volume_liters), 0) as total_volume_liters,
        COALESCE(SUM(estimated_mass_kg), 0) as total_mass_kg
      FROM waste_logs
      WHERE user_id = $1 AND logged_at >= NOW() - INTERVAL '30 days'
      GROUP BY stream_category
    `;
    const categoryResult = await query(categoryTotalsQuery, [userId]);

    // Query 2: Daily Totals for past 7 days to calculate variance
    const dailyTotalsQuery = `
      SELECT 
        logged_at::date as log_date,
        COALESCE(SUM(estimated_mass_kg), 0) as daily_mass_kg,
        BOOL_OR(capacity_triggered) as capacity_alert
      FROM waste_logs
      WHERE user_id = $1 AND logged_at >= NOW() - INTERVAL '7 days'
      GROUP BY logged_at::date
      ORDER BY log_date DESC
    `;
    const dailyResult = await query(dailyTotalsQuery, [userId]);

    // Compute metrics
    let wetMass = 0;
    let dryMass = 0;
    let sanitaryMass = 0;
    let hazardousMass = 0;

    categoryResult.rows.forEach((row) => {
      const mass = parseFloat(row.total_mass_kg);
      if (row.stream_category === 'WET') wetMass = mass;
      if (row.stream_category === 'DRY') dryMass = mass;
      if (row.stream_category === 'SANITARY') sanitaryMass = mass;
      if (row.stream_category === 'HAZARDOUS') hazardousMass = mass;
    });

    const totalMassKg = wetMass + dryMass + sanitaryMass + hazardousMass;
    
    // Segregation Efficiency %: Ratio of properly classified wet/dry waste versus unsegregated/sanitary
    const segregatedMass = wetMass + dryMass;
    const segregationEfficiencyPct = totalMassKg > 0 ? ((segregatedMass / totalMassKg) * 100).toFixed(1) : 100.0;

    // Determine CPCB (Central Pollution Control Board) SWM Rules 2026 Compliance Status
    let cpcbStatus = 'COMPLIANT';
    let complianceNotes = 'Fully compliant with India SWM Rules 2026 statutory segregation standards.';

    if (parseFloat(segregationEfficiencyPct) < 70.0) {
      cpcbStatus = 'NON_COMPLIANT';
      complianceNotes = 'WARNING: Segregation efficiency fell below 70% statutory threshold.';
    } else if (dailyResult.rows.some((d) => d.capacity_alert)) {
      cpcbStatus = 'WARNING';
      complianceNotes = 'Bulk Waste Generator 100kg/day threshold exceeded on recent days. Mandatory on-site processing required.';
    }

    return res.status(200).json({
      success: true,
      report_period: 'Last 30 Days',
      user: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role,
        society_name: req.user.society_name,
      },
      cpcb_swm_2026_compliance: {
        status: cpcbStatus,
        segregation_efficiency_percentage: parseFloat(segregationEfficiencyPct),
        statutory_threshold_kg: STATUTORY_BWG_THRESHOLD_KG,
        notes: complianceNotes,
      },
      aggregated_metrics: {
        total_mass_kg: parseFloat(totalMassKg.toFixed(2)),
        wet_waste_kg: parseFloat(wetMass.toFixed(2)),
        dry_waste_kg: parseFloat(dryMass.toFixed(2)),
        sanitary_waste_kg: parseFloat(sanitaryMass.toFixed(2)),
        hazardous_waste_kg: parseFloat(hazardousMass.toFixed(2)),
      },
      daily_breakdown_last_7_days: dailyResult.rows.map((row) => ({
        date: row.log_date,
        daily_mass_kg: parseFloat(row.daily_mass_kg),
        capacity_triggered: row.capacity_alert,
      })),
    });
  } catch (err) {
    next(err);
  }
};
