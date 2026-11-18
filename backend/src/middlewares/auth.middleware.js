import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_default_change_in_production';

/**
 * Middleware: Verify HTTP-only cookie JWT and attach user payload to req.user
 */
export async function authenticateToken(req, res, next) {
  try {
    const token = req.cookies?.auth_token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. No session token provided.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user still exists and is active in database
    const [rows] = await pool.query(
      `SELECT u.id, u.university_id, u.full_name, u.email, u.role, u.status,
              un.name as university_name, un.code as university_code
       FROM users u
       LEFT JOIN universities un ON u.university_id = un.id
       WHERE u.id = ? LIMIT 1`,
      [decoded.userId]
    );

    if (rows.length === 0) {
      res.clearCookie('auth_token');
      return res.status(401).json({
        success: false,
        error: 'User account no longer exists.'
      });
    }

    const user = rows[0];

    if (user.status !== 'active') {
      res.clearCookie('auth_token');
      return res.status(403).json({
        success: false,
        error: `User account is ${user.status}. Please contact an administrator.`
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.clearCookie('auth_token');
      return res.status(401).json({
        success: false,
        error: 'Session expired. Please log in again.'
      });
    }

    return res.status(403).json({
      success: false,
      error: 'Invalid authentication token.'
    });
  }
}

/**
 * Middleware: Enforce Role-Based Access Control
 * @param  {...string} allowedRoles Roles allowed to access the endpoint
 */
export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Please log in.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access forbidden: Requires one of [${allowedRoles.join(', ')}] role.`
      });
    }

    next();
  };
}

/**
 * Middleware: Enforce University-Scope Data Isolation
 * Prevents unauthorized cross-tenant data access by manipulating IDs or URL parameters.
 * Super Admin bypasses restrictions; others must match req.user.university_id.
 * 
 * @param {string} paramKey The route parameter key (e.g. 'universityId') or body/query key
 */
export function enforceUniversityScope(paramKey = 'universityId') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized.'
      });
    }

    // Super Admin has global cross-university visibility
    if (req.user.role === 'Super Admin') {
      return next();
    }

    // Target university ID from route params, query, or body
    const targetUniversityId = Number(
      req.params[paramKey] || req.query[paramKey] || req.body[paramKey]
    );

    // If an explicit university ID is provided, verify it matches the user's assigned university
    if (targetUniversityId && targetUniversityId !== Number(req.user.university_id)) {
      return res.status(403).json({
        success: false,
        error: "Access denied: Cross-university data access is restricted to user's university."
      });
    }

    // Attach scoped university ID for database queries
    req.scopedUniversityId = req.user.university_id;
    next();
  };
}
