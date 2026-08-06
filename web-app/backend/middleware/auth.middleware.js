import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

/**
 * Authentication Middleware - JWT Token Verifier & Extractor
 * Verifies JWT from Authorization header ('Bearer <token>') and populates req.user
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route. Bearer token missing.',
    });
  }

  try {
    // Verify JWT Token payload
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'urbaneco_super_secret_jwt_key_2026_swm_rules_prod'
    );

    // Fetch user details from DB matching user id
    const result = await query(
      'SELECT id, name, email, role, society_name, trust_score FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User belonging to this token no longer exists.',
      });
    }

    // Attach user payload to request object
    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    return res.status(401).json({
      success: false,
      error: 'Not authorized. Invalid or expired token.',
    });
  }
};
