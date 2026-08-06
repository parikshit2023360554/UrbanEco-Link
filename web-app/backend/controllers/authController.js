import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool, { query } from '../config/db.js';
import { getS2Token } from '../utils/s2Helper.js';

/**
 * Generate JWT Token helper
 */
const generateToken = (id, email, role) => {
  return jwt.sign(
    { id, email, role },
    process.env.JWT_SECRET || 'urbaneco_super_secret_jwt_key_2026_swm_rules_prod',
    { expiresIn: '24h' }
  );
};

/**
 * @desc    Register a new multi-role user with Geolocation and Address data (Atomic Transaction)
 * @route   POST /api/auth/register (also /api/auth/signup, /api/v1/auth/register, /api/v1/auth/signup)
 * @access  Public
 */
export const register = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const {
      name,
      full_name,
      email,
      password,
      role = 'SOCIETY_INDIVIDUAL',
      phone_number,
      contact_number,
      
      // Address & Geolocation fields
      street_address,
      street,
      city,
      state,
      pincode,
      country = 'India',
      latitude,
      longitude,

      // Role 1 (Society / Individual) Extra Fields
      org_name,
      society_name,
      building_type,

      // Role 2 (NGO) Extra Fields
      ngo_name,
      darpan_id,
      focus_area,

      // Role 3 (Factory) Extra Fields
      factory_name,
      contact_person,
      accepted_waste_category,
      daily_quota_kg,

      // Role 4 (Delivery Partner) Extra Fields
      driver_name,
      vehicle_type,
      vehicle_number,
    } = req.body;

    const userName = (name || full_name || ngo_name || driver_name || contact_person || factory_name || org_name || 'UrbanEco User').trim();
    const userEmail = (email || '').trim().toLowerCase();
    const userRole = (role || 'SOCIETY_INDIVIDUAL').toUpperCase();
    const userPhone = phone_number || contact_number || null;

    // 1. Mandatory Field Validations
    if (!userEmail || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both a valid email address and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.',
      });
    }

    // 2. Validate Geolocation for Society/Individual, NGO, and Factory Roles
    const requiresGeoLocation =
      userRole === 'SOCIETY_INDIVIDUAL' ||
      userRole === 'RESIDENT' ||
      userRole === 'SOCIETY_ADMIN' ||
      userRole === 'NGO' ||
      userRole === 'FACTORY';

    const parsedLat = latitude !== undefined && latitude !== null && latitude !== '' ? parseFloat(latitude) : null;
    const parsedLng = longitude !== undefined && longitude !== null && longitude !== '' ? parseFloat(longitude) : null;

    if (requiresGeoLocation) {
      if (parsedLat === null || parsedLng === null || isNaN(parsedLat) || isNaN(parsedLng)) {
        return res.status(400).json({
          success: false,
          error: `Latitude and Longitude are mandatory for ${userRole === 'FACTORY' ? 'Factory' : 'Society / Individual'} registration. Please click 'Detect Current Location' or enter GPS coordinates.`,
        });
      }

      if (parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
        return res.status(400).json({
          success: false,
          error: 'Latitude must be between -90 and 90, and Longitude must be between -180 and 180.',
        });
      }
    }

    // 3. Check for existing user email
    const userCheck = await client.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [userEmail]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'A user with this email address already exists. Please login instead.',
      });
    }

    // 4. Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 5. Start PostgreSQL Atomic Transaction
    await client.query('BEGIN');

    // Dynamically check columns on users table
    const colsRes = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"
    );
    const availableCols = colsRes.rows.map((c) => c.column_name);

    const hasName = availableCols.includes('name');
    const hasFullName = availableCols.includes('full_name');
    const hasSocietyName = availableCols.includes('society_name');

    const finalSocietyName = society_name || org_name || null;
    const nameCol = hasName ? 'name' : (hasFullName ? 'full_name' : 'name');

    let colsToInsert = [];
    let valsToInsert = [];
    let userParams = [];

    // Name column
    if (hasName) {
      colsToInsert.push('name');
      userParams.push(userName);
      valsToInsert.push(`$${userParams.length}`);
    }
    if (hasFullName) {
      colsToInsert.push('full_name');
      userParams.push(userName);
      valsToInsert.push(`$${userParams.length}`);
    }

    // Email
    colsToInsert.push('email');
    userParams.push(userEmail);
    valsToInsert.push(`$${userParams.length}`);

    // Password Hash
    colsToInsert.push('password_hash');
    userParams.push(passwordHash);
    valsToInsert.push(`$${userParams.length}`);

    // Role
    colsToInsert.push('role');
    userParams.push(userRole);
    valsToInsert.push(`$${userParams.length}`);

    // Society Name (if column exists)
    if (hasSocietyName) {
      colsToInsert.push('society_name');
      userParams.push(finalSocietyName);
      valsToInsert.push(`$${userParams.length}`);
    }

    const insertUserSql = `
      INSERT INTO users (${colsToInsert.join(', ')})
      VALUES (${valsToInsert.join(', ')})
      RETURNING id, email, role, created_at ${hasSocietyName ? ', society_name' : ''}
    `;

    const userResult = await client.query(insertUserSql, userParams);
    const newUser = userResult.rows[0];
    const userId = newUser.id;

    // b. Insert Role Profile
    let profileDetails = null;

    if (
      userRole === 'SOCIETY_INDIVIDUAL' ||
      userRole === 'SOCIETY_ADMIN' ||
      userRole === 'RESIDENT'
    ) {
      const insertProfileSql = `
        INSERT INTO society_profiles (user_id, society_name, org_name, building_type, phone_number, contact_number)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, society_name, org_name, building_type, phone_number
      `;
      const profileRes = await client.query(insertProfileSql, [
        userId,
        finalSocietyName,
        org_name || null,
        building_type || 'Gated Society',
        userPhone || '0000000000',
        userPhone || '0000000000',
      ]);
      profileDetails = profileRes.rows[0];
    } else if (userRole === 'NGO') {
      const insertProfileSql = `
        INSERT INTO ngo_profiles (user_id, ngo_name, darpan_id, focus_area, contact_person, phone_number)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, ngo_name, darpan_id, focus_area, contact_person, phone_number
      `;
      const profileRes = await client.query(insertProfileSql, [
        userId,
        ngo_name || org_name || userName,
        darpan_id || null,
        focus_area || 'CIVIC_CLEANUP',
        contact_person || userName,
        userPhone || '0000000000',
      ]);
      profileDetails = profileRes.rows[0];
    } else if (userRole === 'FACTORY') {
      let computedS2Token = null;
      if (parsedLat !== null && parsedLng !== null && !isNaN(parsedLat) && !isNaN(parsedLng)) {
        try {
          computedS2Token = getS2Token(parsedLat, parsedLng, 13);
        } catch (e) {
          computedS2Token = '390ce2b400000000';
        }
      }
      const quotaVal = daily_quota_kg ? parseFloat(daily_quota_kg) : 1000;
      const insertProfileSql = `
        INSERT INTO factory_profiles (
          user_id, factory_name, contact_person, phone_number, contact_number, accepted_waste_category, daily_quota_kg, remaining_quota_kg, s2_cell_token
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, factory_name, contact_person, phone_number, accepted_waste_category, daily_quota_kg, remaining_quota_kg
      `;
      const profileRes = await client.query(insertProfileSql, [
        userId,
        factory_name || userName,
        contact_person || userName,
        userPhone || '0000000000',
        userPhone || '0000000000',
        accepted_waste_category || 'PLASTIC',
        quotaVal,
        quotaVal,
        computedS2Token,
      ]);
      profileDetails = profileRes.rows[0];
    } else if (userRole === 'DELIVERY_PARTNER') {
      const insertProfileSql = `
        INSERT INTO delivery_partner_profiles (
          user_id, driver_name, phone_number, vehicle_type, vehicle_number, current_latitude, current_longitude, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE')
        RETURNING id, driver_name, phone_number, vehicle_type, vehicle_number, current_latitude, current_longitude, status
      `;
      const profileRes = await client.query(insertProfileSql, [
        userId,
        driver_name || userName,
        userPhone || '0000000000',
        vehicle_type || 'Mini Truck',
        vehicle_number || null,
        parsedLat,
        parsedLng,
      ]);
      profileDetails = profileRes.rows[0];
    }

    // c. Insert Address & Geolocation Data (if provided or mandatory)
    let addressDetails = null;
    const finalStreet = street_address || street || null;

    if (finalStreet || city || state || pincode || parsedLat !== null || parsedLng !== null) {
      let computedS2Token = null;
      if (parsedLat !== null && parsedLng !== null && !isNaN(parsedLat) && !isNaN(parsedLng)) {
        try {
          computedS2Token = getS2Token(parsedLat, parsedLng, 13);
        } catch (e) {
          computedS2Token = '390ce2b400000000';
        }
      }
      const insertAddressSql = `
        INSERT INTO addresses (user_id, street, street_address, city, state, pincode, country, latitude, longitude, s2_cell_token)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, street_address, city, state, pincode, country, latitude, longitude, s2_cell_token
      `;
      const addressRes = await client.query(insertAddressSql, [
        userId,
        finalStreet,
        finalStreet,
        city || null,
        state || null,
        pincode || null,
        country || 'India',
        parsedLat,
        parsedLng,
        computedS2Token,
      ]);
      addressDetails = addressRes.rows[0];
    }

    // d. Commit Transaction
    await client.query('COMMIT');

    // 6. Sign JWT Token
    const token = generateToken(newUser.id, newUser.email, newUser.role);

    // 7. Return HTTP 201 Created Response
    return res.status(201).json({
      success: true,
      message: 'User registered successfully with address and geolocation metadata.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profile_details: profileDetails,
        address_details: addressDetails,
      },
    });

  } catch (err) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    next(err);
  } finally {
    // Always release database client back to the pool
    client.release();
  }
};

/**
 * @desc    Authenticate User & Get JWT Token with Role-Based Profile Metadata
 * @route   POST /api/auth/login (also /api/v1/auth/login)
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both email and password.',
      });
    }

    const userResult = await query(
      'SELECT id, name, email, password_hash, role, society_name, trust_score, created_at FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. User not found.',
      });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Password incorrect.',
      });
    }

    let profile_details = null;
    let address_details = null;

    const normalizedRole = user.role ? user.role.toUpperCase() : 'SOCIETY_INDIVIDUAL';

    if (
      normalizedRole === 'SOCIETY_INDIVIDUAL' ||
      normalizedRole === 'SOCIETY_ADMIN' ||
      normalizedRole === 'RESIDENT'
    ) {
      const profileQuery = `
        SELECT 
          sp.id as society_profile_id,
          sp.society_name,
          sp.org_name,
          sp.building_type,
          sp.total_flats,
          sp.contact_number,
          sp.phone_number,
          a.id as address_id,
          a.street,
          a.street_address,
          a.city,
          a.state,
          a.pincode,
          a.country,
          a.latitude,
          a.longitude
        FROM users u
        LEFT JOIN society_profiles sp ON u.id = sp.user_id
        LEFT JOIN addresses a ON u.id = a.user_id
        WHERE u.id = $1
      `;
      const profileResult = await query(profileQuery, [user.id]);
      if (profileResult.rows.length > 0) {
        const row = profileResult.rows[0];
        profile_details = {
          society_name: row.society_name || user.society_name || null,
          org_name: row.org_name || null,
          building_type: row.building_type || null,
          contact_number: row.contact_number || row.phone_number || null,
        };
        if (row.street_address || row.city || row.state || row.latitude) {
          address_details = {
            street_address: row.street_address || row.street || null,
            city: row.city || null,
            state: row.state || null,
            pincode: row.pincode || null,
            country: row.country || 'India',
            latitude: row.latitude ? parseFloat(row.latitude) : null,
            longitude: row.longitude ? parseFloat(row.longitude) : null,
          };
        }
      }
    } else if (normalizedRole === 'NGO') {
      const profileQuery = `
        SELECT 
          np.id as ngo_profile_id,
          np.ngo_name,
          np.darpan_id,
          np.focus_area,
          np.contact_person,
          np.phone_number,
          a.id as address_id,
          a.street,
          a.street_address,
          a.city,
          a.state,
          a.pincode,
          a.country,
          a.latitude,
          a.longitude
        FROM users u
        LEFT JOIN ngo_profiles np ON u.id = np.user_id
        LEFT JOIN addresses a ON u.id = a.user_id
        WHERE u.id = $1
      `;
      const profileResult = await query(profileQuery, [user.id]);
      if (profileResult.rows.length > 0) {
        const row = profileResult.rows[0];
        profile_details = {
          ngo_name: row.ngo_name || user.name || null,
          darpan_id: row.darpan_id || null,
          focus_area: row.focus_area || null,
          contact_person: row.contact_person || null,
          phone_number: row.phone_number || null,
        };
        if (row.street_address || row.city || row.state || row.latitude) {
          address_details = {
            street_address: row.street_address || row.street || null,
            city: row.city || null,
            state: row.state || null,
            pincode: row.pincode || null,
            country: row.country || 'India',
            latitude: row.latitude ? parseFloat(row.latitude) : null,
            longitude: row.longitude ? parseFloat(row.longitude) : null,
          };
        }
      }
    } else if (normalizedRole === 'FACTORY') {
      const profileQuery = `
        SELECT 
          fp.id as factory_profile_id,
          fp.factory_name,
          fp.license_number,
          fp.processing_capacity_tons,
          fp.accepted_waste_category,
          fp.daily_quota_kg,
          fp.contact_person,
          fp.contact_number,
          a.id as address_id,
          a.street,
          a.street_address,
          a.city,
          a.state,
          a.pincode,
          a.country,
          a.latitude,
          a.longitude
        FROM users u
        LEFT JOIN factory_profiles fp ON u.id = fp.user_id
        LEFT JOIN addresses a ON u.id = a.user_id
        WHERE u.id = $1
      `;
      const profileResult = await query(profileQuery, [user.id]);
      if (profileResult.rows.length > 0) {
        const row = profileResult.rows[0];
        profile_details = {
          factory_name: row.factory_name || null,
          license_number: row.license_number || null,
          processing_capacity_tons: row.processing_capacity_tons ? parseFloat(row.processing_capacity_tons) : null,
          accepted_waste_category: row.accepted_waste_category || null,
          daily_quota_kg: row.daily_quota_kg ? parseFloat(row.daily_quota_kg) : null,
          contact_person: row.contact_person || null,
          contact_number: row.contact_number || null,
        };
        if (row.street_address || row.city || row.state || row.latitude) {
          address_details = {
            street_address: row.street_address || row.street || null,
            city: row.city || null,
            state: row.state || null,
            pincode: row.pincode || null,
            country: row.country || 'India',
            latitude: row.latitude ? parseFloat(row.latitude) : null,
            longitude: row.longitude ? parseFloat(row.longitude) : null,
          };
        }
      }
    } else if (normalizedRole === 'DELIVERY_PARTNER') {
      const profileQuery = `
        SELECT 
          dp.id as delivery_profile_id,
          dp.driver_name,
          dp.vehicle_type,
          dp.vehicle_number,
          dp.phone_number,
          dp.status,
          dp.current_latitude,
          dp.current_longitude
        FROM users u
        LEFT JOIN delivery_partner_profiles dp ON u.id = dp.user_id
        WHERE u.id = $1
      `;
      const profileResult = await query(profileQuery, [user.id]);
      if (profileResult.rows.length > 0) {
        const row = profileResult.rows[0];
        profile_details = {
          driver_name: row.driver_name || null,
          vehicle_type: row.vehicle_type || null,
          vehicle_number: row.vehicle_number || null,
          phone_number: row.phone_number || null,
          status: row.status || 'ACTIVE',
          current_latitude: row.current_latitude ? parseFloat(row.current_latitude) : null,
          current_longitude: row.current_longitude ? parseFloat(row.current_longitude) : null,
        };
      }
    }

    const token = generateToken(user.id, user.email, user.role);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_details,
        address_details,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get Current Logged-in User Profile
 * @route   GET /api/v1/auth/me (also /api/auth/me)
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
};

export default { register, login, getProfile };


