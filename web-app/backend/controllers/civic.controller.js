import { query } from '../config/db.js';

/**
 * @desc    Pillar 2: Submit Crowdsourced Geofenced Street Report with PostGIS Geography Insertion
 * @route   POST /api/v1/civic/report
 * @access  Private (RESIDENT, SOCIETY_ADMIN, NGO)
 */
export const createCivicReport = async (req, res, next) => {
  try {
    const { latitude, longitude, before_image_url, description, waste_type = 'DRY' } = req.body;
    const reporterId = req.user.id;

    /**
     * PostGIS Spatial Insertion Query:
     * Note: PostGIS ST_MakePoint accepts (longitude, latitude) in WGS84 geography SRID 4326.
     * We cast to geography using ::geography for meter-based distance calculations.
     */
    const insertQuery = `
      INSERT INTO civic_reports (
        reporter_id, description, waste_type, before_image_url, location, status
      )
      VALUES (
        $1, $2, $3, $4, ST_MakePoint($5, $6)::geography, 'PENDING'
      )
      RETURNING id, reporter_id, description, waste_type, before_image_url,
                ST_Y(location::geometry) as latitude,
                ST_X(location::geometry) as longitude,
                status, created_at
    `;

    const result = await query(insertQuery, [
      reporterId,
      description || 'Crowdsourced street waste issue reported',
      waste_type,
      before_image_url,
      longitude, // $5 = Longitude
      latitude,  // $6 = Latitude
    ]);

    const report = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Civic waste report filed successfully. Location indexed with PostGIS geography.',
      report: {
        id: report.id,
        reporter_id: report.reporter_id,
        description: report.description,
        waste_type: report.waste_type,
        before_image_url: report.before_image_url,
        coordinates: {
          latitude: parseFloat(report.latitude),
          longitude: parseFloat(report.longitude),
        },
        status: report.status,
        created_at: report.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Pillar 2: Query Nearby Tasks / Waste Reports within 2000m (2km) Radius using PostGIS ST_DWithin
 * @route   GET /api/v1/civic/nearby-tasks
 * @access  Private (NGO, SOCIETY_ADMIN, FACTORY, RESIDENT)
 */
export const getNearbyTasks = async (req, res, next) => {
  try {
    const latitude = parseFloat(req.query.latitude);
    const longitude = parseFloat(req.query.longitude);
    const radiusMeters = parseFloat(req.query.radius) || 2000; // Default 2000m (2km)

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide valid query parameters: ?latitude=...&longitude=...',
      });
    }

    /**
     * PostGIS Spatial Radius Query:
     * - ST_DWithin(location, ST_MakePoint($1, $2)::geography, $3) checks if location is within $3 meters.
     * - ST_Distance(location, ST_MakePoint($1, $2)::geography) calculates distance in meters.
     */
    const nearbyQuery = `
      SELECT 
        r.id,
        r.description,
        r.waste_type,
        r.before_image_url,
        r.status,
        r.created_at,
        ST_Y(r.location::geometry) as latitude,
        ST_X(r.location::geometry) as longitude,
        ST_Distance(r.location, ST_MakePoint($1, $2)::geography) as distance_meters,
        u.name as reporter_name,
        u.trust_score as reporter_trust_score
      FROM civic_reports r
      JOIN users u ON r.reporter_id = u.id
      WHERE ST_DWithin(r.location, ST_MakePoint($1, $2)::geography, $3)
        AND r.status IN ('PENDING', 'ASSIGNED')
      ORDER BY distance_meters ASC
    `;

    const result = await query(nearbyQuery, [
      longitude,    // $1 = Longitude
      latitude,     // $2 = Latitude
      radiusMeters, // $3 = Radius in meters (default 2000)
    ]);

    return res.status(200).json({
      success: true,
      query_center: { latitude, longitude },
      search_radius_meters: radiusMeters,
      total_found: result.rows.length,
      tasks: result.rows.map((row) => ({
        id: row.id,
        description: row.description,
        waste_type: row.waste_type,
        before_image_url: row.before_image_url,
        status: row.status,
        coordinates: {
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude),
        },
        distance_meters: Math.round(parseFloat(row.distance_meters) * 100) / 100,
        distance_km: Math.round((parseFloat(row.distance_meters) / 1000) * 100) / 100,
        reporter: {
          name: row.reporter_name,
          trust_score: row.reporter_trust_score,
        },
        created_at: row.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all crowdsourced civic reports for Admin / NGO Portal
 * @route   GET /api/v1/civic/reports
 * @access  Private (NGO, Admin, All Authorized)
 */
export const getAllCivicReports = async (req, res, next) => {
  try {
    const selectQuery = `
      SELECT 
        COALESCE(r.id, r.report_id) as id,
        COALESCE(r.description, 'Crowdsourced waste report') as description,
        COALESCE(r.waste_type, 'DRY') as waste_type,
        r.before_image_url,
        r.status,
        COALESCE(r.created_at, r.reported_at) as created_at,
        ST_Y(r.location::geometry) as latitude,
        ST_X(r.location::geometry) as longitude,
        COALESCE(u.name, 'Anonymous Resident') as reporter_name
      FROM civic_reports r
      LEFT JOIN users u ON r.reporter_id = u.id
      ORDER BY COALESCE(r.created_at, r.reported_at) DESC NULLS LAST
    `;

    const result = await query(selectQuery);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      reports: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

