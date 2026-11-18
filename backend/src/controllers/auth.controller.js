import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_default_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const COOKIE_MAX_AGE_MS = Number(process.env.COOKIE_MAX_AGE_MS) || 24 * 60 * 60 * 1000; // 24 hours

// Helper to configure HTTP-only cookie options
function getAuthCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true, // Prevents client-side JavaScript access (XSS mitigation)
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'strict' : 'lax', // CSRF mitigation
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/'
  };
}

/**
 * POST /api/auth/register
 * Register a new user account (with university association)
 */
export async function register(req, res) {
  try {
    const { full_name, email, phone, password, role, university_code } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email, and password are required.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long.'
      });
    }

    // Check if email already registered
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
    }

    // Resolve university_id if provided
    let universityId = null;
    if (university_code) {
      const [uniRows] = await pool.query('SELECT id FROM universities WHERE code = ?', [university_code.trim().toUpperCase()]);
      if (uniRows.length > 0) {
        universityId = uniRows[0].id;
      }
    }

    // Validate role
    const validRoles = ['Super Admin', 'University Admin', 'Faculty', 'Student'];
    const assignedRole = validRoles.includes(role) ? role : 'Student';

    // Hash password with bcrypt (12 salt rounds)
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.query(
      `INSERT INTO users (university_id, full_name, email, phone, password_hash, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [universityId, full_name.trim(), email.trim().toLowerCase(), phone || null, password_hash, assignedRole]
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during registration.'
    });
  }
}

/**
 * POST /api/auth/login
 * Authenticates user credentials and sets secure HTTP-only cookie
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    // Query user with university details
    const [rows] = await pool.query(
      `SELECT u.id, u.university_id, u.full_name, u.email, u.password_hash, u.role, u.status,
              un.name as university_name, un.code as university_code
       FROM users u
       LEFT JOIN universities un ON u.university_id = un.id
       WHERE u.email = ? LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const user = rows[0];

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: `Account is ${user.status}. Please contact an administrator.`
      });
    }

    // Verify bcrypt password hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      universityId: user.university_id
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Set secure HTTP-only cookie
    res.cookie('auth_token', token, getAuthCookieOptions());

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        university: user.university_id ? {
          id: user.university_id,
          name: user.university_name,
          code: user.university_code
        } : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during login.'
    });
  }
}

/**
 * POST /api/auth/logout
 * Clears HTTP-only authentication cookie
 */
export function logout(req, res) {
  res.clearCookie('auth_token', {
    httpOnly: true,
    path: '/'
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
}

/**
 * GET /api/auth/me
 * Retrieves the authenticated user's current session data
 */
export function getCurrentUser(req, res) {
  const user = req.user;

  return res.status(200).json({
    success: true,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      status: user.status,
      university: user.university_id ? {
        id: user.university_id,
        name: user.university_name,
        code: user.university_code
      } : null
    }
  });
}
