import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

/**
 * GET /api/university-admin/profile
 * Get University Admin profile and associated university info
 */
export async function getAdminProfile(req, res) {
  try {
    const adminId = req.user.id;

    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.status, u.created_at, u.updated_at,
              un.id as university_id, un.name as university_name, un.code as university_code,
              un.domain as university_domain, un.status as university_status
       FROM users u
       LEFT JOIN universities un ON u.university_id = un.id
       WHERE u.id = ? AND u.role IN ('University Admin', 'Super Admin')`,
      [adminId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'University Admin profile not found.'
      });
    }

    const row = rows[0];

    return res.status(200).json({
      success: true,
      profile: {
        id: row.id,
        full_name: row.full_name,
        email: row.email,
        phone: row.phone,
        role: row.role,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        university: row.university_id ? {
          id: row.university_id,
          name: row.university_name,
          code: row.university_code,
          domain: row.university_domain,
          status: row.university_status
        } : null
      }
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve admin profile.'
    });
  }
}

/**
 * PUT /api/university-admin/profile
 * Update University Admin personal profile information
 */
export async function updateAdminProfile(req, res) {
  try {
    const adminId = req.user.id;
    const { full_name, phone, current_password, new_password } = req.body;

    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [adminId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found.'
      });
    }

    const user = existing[0];
    const updates = [];
    const params = [];

    if (full_name) {
      updates.push('full_name = ?');
      params.push(full_name.trim());
    }

    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone ? phone.trim() : null);
    }

    // Optional password change
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({
          success: false,
          error: 'Current password is required to set a new password.'
        });
      }

      if (new_password.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 8 characters long.'
        });
      }

      const isMatch = await bcrypt.compare(current_password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          error: 'Incorrect current password.'
        });
      }

      const newHash = await bcrypt.hash(new_password, 12);
      updates.push('password_hash = ?');
      params.push(newHash);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No profile updates provided.'
      });
    }

    params.push(adminId);
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const [updatedRows] = await pool.query(
      'SELECT id, full_name, email, phone, role, status FROM users WHERE id = ?',
      [adminId]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile: updatedRows[0]
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update admin profile.'
    });
  }
}

/**
 * PUT /api/university-admin/university
 * Update the university details managed by the University Admin
 */
export async function updateAdminUniversityDetails(req, res) {
  try {
    const universityId = req.user.university_id;

    if (!universityId) {
      return res.status(400).json({
        success: false,
        error: 'User is not assigned to a university.'
      });
    }

    const { name, domain } = req.body;
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name.trim());
    }

    if (domain !== undefined) {
      updates.push('domain = ?');
      params.push(domain ? domain.trim().toLowerCase() : null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No university details to update.'
      });
    }

    params.push(universityId);
    await pool.query(
      `UPDATE universities SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const [updated] = await pool.query('SELECT * FROM universities WHERE id = ?', [universityId]);

    return res.status(200).json({
      success: true,
      message: 'University details updated successfully.',
      university: updated[0]
    });
  } catch (error) {
    console.error('Update university details error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update university details.'
    });
  }
}

