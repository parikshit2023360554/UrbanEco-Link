/**
 * Request Payload Sanitizer & Validation Middleware
 */

// Sanitizes text strings to prevent basic injection / malformed scripts
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim();
};

/**
 * Validate Signup Payload
 */
export const validateSignup = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const validRoles = ['RESIDENT', 'SOCIETY_ADMIN', 'NGO', 'FACTORY', 'DELIVERY_PARTNER'];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Valid full name is required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Valid email address is required.' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
  }

  if (role && !validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      error: `Invalid role specified. Must be one of: ${validRoles.join(', ')}`,
    });
  }

  req.body.name = sanitizeString(name);
  req.body.email = sanitizeString(email).toLowerCase();
  next();
};

/**
 * Validate Login Payload
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide both email and password.' });
  }

  req.body.email = sanitizeString(email).toLowerCase();
  next();
};

/**
 * Validate Waste Log Payload (Pillar 1)
 */
export const validateWasteLog = (req, res, next) => {
  const { stream_category, estimated_volume_liters } = req.body;
  const validStreams = ['WET', 'DRY', 'SANITARY', 'HAZARDOUS'];

  if (!stream_category || !validStreams.includes(stream_category.toUpperCase())) {
    return res.status(400).json({
      success: false,
      error: `Invalid stream category. Must be one of: ${validStreams.join(', ')}`,
    });
  }

  const volume = parseFloat(estimated_volume_liters);
  if (isNaN(volume) || volume <= 0) {
    return res.status(400).json({
      success: false,
      error: 'estimated_volume_liters must be a positive numeric value.',
    });
  }

  req.body.stream_category = stream_category.toUpperCase();
  req.body.estimated_volume_liters = volume;
  next();
};

/**
 * Validate Civic Report Payload (Pillar 2)
 */
export const validateCivicReport = (req, res, next) => {
  const { latitude, longitude, before_image_url } = req.body;

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (isNaN(lat) || lat < -90 || lat > 90) {
    return res.status(400).json({ success: false, error: 'Invalid latitude (-90 to 90).' });
  }

  if (isNaN(lng) || lng < -180 || lng > 180) {
    return res.status(400).json({ success: false, error: 'Invalid longitude (-180 to 180).' });
  }

  if (!before_image_url || typeof before_image_url !== 'string' || before_image_url.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'before_image_url is required.' });
  }

  req.body.latitude = lat;
  req.body.longitude = lng;
  req.body.before_image_url = sanitizeString(before_image_url);
  next();
};

/**
 * Validate Task Verification Cleanup Payload (Pillar 3)
 */
export const validateTaskVerification = (req, res, next) => {
  const { report_id, latitude, longitude, after_image_url } = req.body;

  const reportIdInt = parseInt(report_id, 10);
  if (isNaN(reportIdInt) || reportIdInt <= 0) {
    return res.status(400).json({ success: false, error: 'Valid report_id integer is required.' });
  }

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (isNaN(lat) || lat < -90 || lat > 90) {
    return res.status(400).json({ success: false, error: 'Invalid latitude (-90 to 90).' });
  }

  if (isNaN(lng) || lng < -180 || lng > 180) {
    return res.status(400).json({ success: false, error: 'Invalid longitude (-180 to 180).' });
  }

  if (!after_image_url || typeof after_image_url !== 'string' || after_image_url.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'after_image_url is required for anti-fraud verification.' });
  }

  req.body.report_id = reportIdInt;
  req.body.latitude = lat;
  req.body.longitude = lng;
  req.body.after_image_url = sanitizeString(after_image_url);
  next();
};
