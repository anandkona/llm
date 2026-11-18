import pool from '../config/db.js';

/**
 * POST /api/admin/universities
 * Create a new university (Super Admin only)
 */
export async function createUniversity(req, res) {
  try {
    const { name, code, domain, status } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        error: 'University name and code are required.'
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();
    const cleanDomain = domain ? domain.trim().toLowerCase() : null;
    const initialStatus = ['active', 'inactive', 'suspended'].includes(status) ? status : 'active';

    // Check code uniqueness
    const [existing] = await pool.query('SELECT id FROM universities WHERE code = ?', [cleanCode]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: `University code '${cleanCode}' is already registered.`
      });
    }

    const [result] = await pool.query(
      `INSERT INTO universities (name, code, domain, status)
       VALUES (?, ?, ?, ?)`,
      [cleanName, cleanCode, cleanDomain, initialStatus]
    );

    const [createdRows] = await pool.query('SELECT * FROM universities WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'University created successfully.',
      university: createdRows[0]
    });
  } catch (error) {
    console.error('Create university error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create university.'
    });
  }
}

/**
 * GET /api/admin/universities
 * List all universities with optional filtering and metrics (Super Admin only)
 */
export async function getAllUniversities(req, res) {
  try {
    const { status, search } = req.query;

    let query = `
      SELECT u.id, u.name, u.code, u.domain, u.status, u.created_at, u.updated_at,
             COUNT(DISTINCT usr.id) as total_users,
             SUM(CASE WHEN usr.role = 'University Admin' THEN 1 ELSE 0 END) as total_admins,
             SUM(CASE WHEN usr.role = 'Faculty' THEN 1 ELSE 0 END) as total_faculty,
             SUM(CASE WHEN usr.role = 'Student' THEN 1 ELSE 0 END) as total_students
      FROM universities u
      LEFT JOIN users usr ON u.id = usr.university_id
    `;

    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('u.status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(u.name LIKE ? OR u.code LIKE ? OR u.domain LIKE ?)');
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' GROUP BY u.id ORDER BY u.created_at DESC';

    const [rows] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      count: rows.length,
      universities: rows
    });
  } catch (error) {
    console.error('Get universities error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve universities.'
    });
  }
}

/**
 * GET /api/admin/universities/:id
 * Get single university by ID (Super Admin only)
 */
export async function getUniversityById(req, res) {
  try {
    const universityId = Number(req.params.id);

    const [rows] = await pool.query(
      `SELECT u.*,
              COUNT(DISTINCT usr.id) as total_users
       FROM universities u
       LEFT JOIN users usr ON u.id = usr.university_id
       WHERE u.id = ?
       GROUP BY u.id`,
      [universityId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'University not found.'
      });
    }

    return res.status(200).json({
      success: true,
      university: rows[0]
    });
  } catch (error) {
    console.error('Get university by id error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve university details.'
    });
  }
}

/**
 * PUT /api/admin/universities/:id
 * Update university details (Super Admin only)
 */
export async function updateUniversity(req, res) {
  try {
    const universityId = Number(req.params.id);
    const { name, domain, status, code } = req.body;

    const [existing] = await pool.query('SELECT * FROM universities WHERE id = ?', [universityId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'University not found.'
      });
    }

    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name.trim());
    }

    if (code) {
      const newCode = code.trim().toUpperCase();
      const [duplicate] = await pool.query(
        'SELECT id FROM universities WHERE code = ? AND id != ?',
        [newCode, universityId]
      );
      if (duplicate.length > 0) {
        return res.status(409).json({
          success: false,
          error: `University code '${newCode}' is already in use by another institution.`
        });
      }
      updates.push('code = ?');
      params.push(newCode);
    }

    if (domain !== undefined) {
      updates.push('domain = ?');
      params.push(domain ? domain.trim().toLowerCase() : null);
    }

    if (status) {
      if (!['active', 'inactive', 'suspended'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Status must be 'active', 'inactive', or 'suspended'."
        });
      }
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid update fields provided.'
      });
    }

    params.push(universityId);
    await pool.query(
      `UPDATE universities SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const [updatedRows] = await pool.query('SELECT * FROM universities WHERE id = ?', [universityId]);

    return res.status(200).json({
      success: true,
      message: 'University updated successfully.',
      university: updatedRows[0]
    });
  } catch (error) {
    console.error('Update university error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update university.'
    });
  }
}

/**
 * PATCH /api/admin/universities/:id/deactivate
 * Deactivate or toggle status of a university (Super Admin only)
 */
export async function toggleUniversityStatus(req, res) {
  try {
    const universityId = Number(req.params.id);
    const { status } = req.body;

    const targetStatus = status || 'inactive';

    if (!['active', 'inactive', 'suspended'].includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        error: "Status must be 'active', 'inactive', or 'suspended'."
      });
    }

    const [result] = await pool.query(
      'UPDATE universities SET status = ? WHERE id = ?',
      [targetStatus, universityId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'University not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `University status updated to '${targetStatus}'.`,
      status: targetStatus
    });
  } catch (error) {
    console.error('Toggle university status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to change university status.'
    });
  }
}
