import pool from '../config/db.js';

function getScopedUniversityId(req) {
  if (req.user.role === 'Super Admin') {
    return req.query.university_id || req.body.university_id || req.user.university_id || 1;
  }
  return req.user.university_id;
}

// ==========================================
// 1. DEPARTMENTS
// ==========================================

export async function getDepartments(req, res) {
  try {
    const universityId = getScopedUniversityId(req);
    const { search, status, page = 1, limit = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    let query = `
      SELECT d.*, 
             COUNT(DISTINCT c.id) AS total_courses,
             COUNT(DISTINCT sm.student_id) AS total_students
      FROM departments d
      LEFT JOIN courses c ON d.id = c.department_id
      LEFT JOIN student_mappings sm ON d.id = sm.department_id
      WHERE d.university_id = ?
    `;
    const params = [universityId];

    if (status) {
      query += ` AND d.status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (d.name LIKE ? OR d.code LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ` GROUP BY d.id ORDER BY d.id DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(query, params);

    // Count for pagination
    let countQuery = `SELECT COUNT(*) AS total FROM departments WHERE university_id = ?`;
    const countParams = [universityId];
    if (status) {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }
    if (search) {
      countQuery += ` AND (name LIKE ? OR code LIKE ?)`;
      countParams.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }
    const [countRows] = await pool.query(countQuery, countParams);

    return res.json({
      success: true,
      data: rows,
      pagination: {
        total: countRows[0].total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(countRows[0].total / Number(limit))
      }
    });
  } catch (err) {
    console.error('getDepartments error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve departments' });
  }
}

export async function createDepartment(req, res) {
  try {
    const universityId = getScopedUniversityId(req);
    const { name, code, description, status = 'active' } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, error: 'Name and code are required' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM departments WHERE university_id = ? AND code = ?',
      [universityId, code.trim().toUpperCase()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: `Department code '${code}' already exists.` });
    }

    const [result] = await pool.query(
      `INSERT INTO departments (university_id, name, code, description, status)
       VALUES (?, ?, ?, ?, ?)`,
      [universityId, name.trim(), code.trim().toUpperCase(), description || null, status]
    );

    const [newDept] = await pool.query('SELECT * FROM departments WHERE id = ?', [result.insertId]);
    return res.status(201).json({ success: true, data: newDept[0] });
  } catch (err) {
    console.error('createDepartment error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create department' });
  }
}

export async function updateDepartment(req, res) {
  try {
    const universityId = getScopedUniversityId(req);
    const deptId = req.params.id;
    const { name, code, description, status } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM departments WHERE id = ? AND university_id = ?',
      [deptId, universityId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }

    if (code) {
      const [duplicate] = await pool.query(
        'SELECT id FROM departments WHERE university_id = ? AND code = ? AND id != ?',
        [universityId, code.trim().toUpperCase(), deptId]
      );
      if (duplicate.length > 0) {
        return res.status(409).json({ success: false, error: `Department code '${code}' already in use.` });
      }
    }

    const updates = [];
    const params = [];
    if (name) { updates.push('name = ?'); params.push(name.trim()); }
    if (code) { updates.push('code = ?'); params.push(code.trim().toUpperCase()); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (status) { updates.push('status = ?'); params.push(status); }

    if (updates.length > 0) {
      params.push(deptId, universityId);
      await pool.query(
        `UPDATE departments SET ${updates.join(', ')} WHERE id = ? AND university_id = ?`,
        params
      );
    }

    const [updated] = await pool.query('SELECT * FROM departments WHERE id = ?', [deptId]);
    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('updateDepartment error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update department' });
  }
}

export async function deleteDepartment(req, res) {
  try {
    const universityId = getScopedUniversityId(req);
    const deptId = req.params.id;

    const [result] = await pool.query(
      'DELETE FROM departments WHERE id = ? AND university_id = ?',
      [deptId, universityId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }

    return res.json({ success: true, message: 'Department deleted successfully' });
  } catch (err) {
    console.error('deleteDepartment error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete department (may have linked courses)' });
  }
}

// ==========================================
// 2. ACADEMIC YEARS & SEMESTERS
// ==========================================

export async function getAcademicYears(req, res) {
  try {
    const universityId = getScopedUniversityId(req);
    const [rows] = await pool.query(
      `SELECT ay.*, COUNT(s.id) AS total_semesters
       FROM academic_years ay
       LEFT JOIN semesters s ON ay.id = s.academic_year_id
       WHERE ay.university_id = ?
       GROUP BY ay.id
       ORDER BY ay.start_date DESC`,
      [universityId]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getAcademicYears error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve academic years' });
  }
}

export async function createAcademicYear(req, res) {
  try {
    const universityId = getScopedUniversityId(req);
    const { year_name, start_date, end_date, is_current = false, status = 'active' } = req.body;

    if (!year_name || !start_date || !end_date) {
      return res.status(400).json({ success: false, error: 'Year name, start date, and end date are required' });
    }

    if (is_current) {
      await pool.query('UPDATE academic_years SET is_current = FALSE WHERE university_id = ?', [universityId]);
    }

    const [result] = await pool.query(
      `INSERT INTO academic_years (university_id, year_name, start_date, end_date, is_current, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [universityId, year_name.trim(), start_date, end_date, is_current ? 1 : 0, status]
    );

    const [newYear] = await pool.query('SELECT * FROM academic_years WHERE id = ?', [result.insertId]);
    return res.status(201).json({ success: true, data: newYear[0] });
  } catch (err) {
    console.error('createAcademicYear error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create academic year' });
  }
}

export async function getSemesters(req, res) {
  try {
    const universityId = getScopedUniversityId(req);
    const { academic_year_id } = req.query;

    let query = `
      SELECT s.*, ay.year_name, COUNT(DISTINCT sub.id) AS total_subjects
      FROM semesters s
      JOIN academic_years ay ON s.academic_year_id = ay.id
      LEFT JOIN subjects sub ON s.id = sub.semester_id
      WHERE s.university_id = ?
    `;
    const params = [universityId];

    if (academic_year_id) {
      query += ` AND s.academic_year_id = ?`;
      params.push(academic_year_id);
    }

    query += ` GROUP BY s.id ORDER BY s.id ASC`;
    const [rows] = await pool.query(query, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getSemesters error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve semesters' });
  }
}

export async function createSemester(req, res) {
  try {
    const universityId = getScopedUniversityId(req);
    const { academic_year_id, name, term = 'Fall', start_date, end_date, status = 'active' } = req.body;

    if (!academic_year_id || !name) {
      return res.status(400).json({ success: false, error: 'Academic year and semester name are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO semesters (university_id, academic_year_id, name, term, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [universityId, academic_year_id, name.trim(), term, start_date || null, end_date || null, status]
    );

    const [newSem] = await pool.query('SELECT * FROM semesters WHERE id = ?', [result.insertId]);
    return res.status(201).json({ success: true, data: newSem[0] });
  } catch (err) {
    console.error('createSemester error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create semester' });
  }
}

// ==========================================
// 3. COURSES & SUBJECTS
// ==========================================

export async function getCourses(req, res) {
  try {
    const universityId = getScopedUniversityId(req);
    const { department_id, search, status, page = 1, limit = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    let query = `
      SELECT c.*, d.name AS department_name, d.code AS department_code,
             COUNT(DISTINCT s.id) AS total_subjects,
             COUNT(DISTINCT sm.student_id) AS enrolled_students
      FROM courses c
      JOIN departments d ON c.department_id = d.id
      LEFT JOIN subjects s ON c.id = s.course_id
      LEFT JOIN student_mappings sm ON c.id = sm.course_id
      WHERE c.university_id = ?
    `;
    const params = [universityId];

    if (department_id) {
      query += ` AND c.department_id = ?`;
      params.push(department_id);
    }
    if (status) {
      query += ` AND c.status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (c.name LIKE ? OR c.code LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ` GROUP BY c.id ORDER BY c.id DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(query, params);

    // Total Count
    let countQuery = `SELECT COUNT(*) AS total FROM courses WHERE university_id = ?`;
    const countParams = [universityId];
    if (department_id) { countQuery += ` AND department_id = ?`; countParams.push(department_id); }
    if (status) { countQuery += ` AND status = ?`; countParams.push(status); }
    if (search) { countQuery += ` AND (name LIKE ? OR code LIKE ?)`; countParams.push(`%${search.trim()}%`, `%${search.trim()}%`); }
    const [countRows] = await pool.query(countQuery, countParams);

    return res.json({
      success: true,
      data: rows,
      pagination: {
        total: countRows[0].total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(countRows[0].total / Number(limit))
      }
    });
  } catch (err) {
    console.error('getCourses error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve courses' });
  }
}

export async function createCourse(req, res) {
  try {
    const universityId = getScopedUniversityId(req);
    const { department_id, name, code, duration_years = 4, total_semesters = 8, description, status = 'active' } = req.body;

    if (!department_id || !name || !code) {
      return res.status(400).json({ success: false, error: 'Department, course name, and code are required' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM courses WHERE university_id = ? AND code = ?',
      [universityId, code.trim().toUpperCase()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: `Course code '${code}' already exists.` });
    }

    const [result] = await pool.query(
      `INSERT INTO courses (university_id, department_id, name, code, duration_years, total_semesters, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [universityId, department_id, name.trim(), code.trim().toUpperCase(), duration_years, total_semesters, description || null, status]
    );

    const [newCourse] = await pool.query(
      `SELECT c.*, d.name AS department_name FROM courses c JOIN departments d ON c.department_id = d.id WHERE c.id = ?`,
      [result.insertId]
    );
    return res.status(201).json({ success: true, data: newCourse[0] });
  } catch (err) {
    console.error('createCourse error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create course' });
  }
}

export async function getSubjects(req, res) {
  try {
    const universityId = getScopedUniversityId(req);
    const { course_id, semester_id, search, page = 1, limit = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    let query = `
      SELECT sub.*, c.name AS course_name, c.code AS course_code,
             sem.name AS semester_name,
             GROUP_CONCAT(DISTINCT u.full_name SEPARATOR ', ') AS assigned_faculty
      FROM subjects sub
      JOIN courses c ON sub.course_id = c.id
      LEFT JOIN semesters sem ON sub.semester_id = sem.id
      LEFT JOIN faculty_assignments fa ON sub.id = fa.subject_id AND fa.status = 'active'
      LEFT JOIN users u ON fa.faculty_id = u.id
      WHERE sub.university_id = ?
    `;
    const params = [universityId];

    if (course_id) {
      query += ` AND sub.course_id = ?`;
      params.push(course_id);
    }
    if (semester_id) {
      query += ` AND sub.semester_id = ?`;
      params.push(semester_id);
    }
    if (search) {
      query += ` AND (sub.name LIKE ? OR sub.code LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ` GROUP BY sub.id ORDER BY sub.id DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(query, params);

    // Total Count
    let countQuery = `SELECT COUNT(*) AS total FROM subjects WHERE university_id = ?`;
    const countParams = [universityId];
    if (course_id) { countQuery += ` AND course_id = ?`; countParams.push(course_id); }
    if (semester_id) { countQuery += ` AND semester_id = ?`; countParams.push(semester_id); }
    if (search) { countQuery += ` AND (name LIKE ? OR code LIKE ?)`; countParams.push(`%${search.trim()}%`, `%${search.trim()}%`); }
    const [countRows] = await pool.query(countQuery, countParams);

    return res.json({
      success: true,
      data: rows,
      pagination: {
        total: countRows[0].total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(countRows[0].total / Number(limit))
      }
    });
  } catch (err) {
    console.error('getSubjects error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve subjects' });
  }
}

export async function createSubject(req, res) {
  try {
    const universityId = getScopedUniversityId(req);
    const { course_id, semester_id, name, code, credits = 3, type = 'Theory', description, status = 'active' } = req.body;

    if (!course_id || !name || !code) {
      return res.status(400).json({ success: false, error: 'Course, subject name, and code are required' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM subjects WHERE course_id = ? AND code = ?',
      [course_id, code.trim().toUpperCase()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: `Subject code '${code}' already exists in this course.` });
    }

    const [result] = await pool.query(
      `INSERT INTO subjects (university_id, course_id, semester_id, name, code, credits, type, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [universityId, course_id, semester_id || null, name.trim(), code.trim().toUpperCase(), credits, type, description || null, status]
    );

    const [newSub] = await pool.query('SELECT * FROM subjects WHERE id = ?', [result.insertId]);
    return res.status(201).json({ success: true, data: newSub[0] });
  } catch (err) {
    console.error('createSubject error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create subject' });
  }
}

// ==========================================
// 4. USER MAPPINGS (STUDENTS & FACULTY)
// ==========================================

export async function getStudentMappings(req, res) {
  try {
    const universityId = getScopedUniversityId(req);
    const { department_id, course_id, semester_id, search, page = 1, limit = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    let query = `
      SELECT sm.*, 
             u.full_name AS student_name, u.email AS student_email, u.phone AS student_phone,
             d.name AS department_name, c.name AS course_name, 
             ay.year_name, sem.name AS semester_name
      FROM student_mappings sm
      JOIN users u ON sm.student_id = u.id
      JOIN departments d ON sm.department_id = d.id
      JOIN courses c ON sm.course_id = c.id
      JOIN academic_years ay ON sm.academic_year_id = ay.id
      JOIN semesters sem ON sm.semester_id = sem.id
      WHERE sm.university_id = ?
    `;
    const params = [universityId];

    if (department_id) { query += ` AND sm.department_id = ?`; params.push(department_id); }
    if (course_id) { query += ` AND sm.course_id = ?`; params.push(course_id); }
    if (semester_id) { query += ` AND sm.semester_id = ?`; params.push(semester_id); }
    if (search) {
      query += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR sm.roll_number LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ` ORDER BY sm.id DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(query, params);

    // Count
    let countQuery = `
      SELECT COUNT(*) AS total 
      FROM student_mappings sm 
      JOIN users u ON sm.student_id = u.id 
      WHERE sm.university_id = ?
    `;
    const countParams = [universityId];
    if (department_id) { countQuery += ` AND sm.department_id = ?`; countParams.push(department_id); }
    if (course_id) { countQuery += ` AND sm.course_id = ?`; countParams.push(course_id); }
    if (semester_id) { countQuery += ` AND sm.semester_id = ?`; countParams.push(semester_id); }
    if (search) {
      countQuery += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR sm.roll_number LIKE ?)`;
      countParams.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    const [countRows] = await pool.query(countQuery, countParams);

    return res.json({
      success: true,
      data: rows,
      pagination: {
        total: countRows[0].total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(countRows[0].total / Number(limit))
      }
    });
  } catch (err) {
    console.error('getStudentMappings error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve student mappings' });
  }
}

export async function mapStudent(req, res) {
  try {
    const universityId = getScopedUniversityId(req);
    const { student_id, department_id, course_id, academic_year_id, semester_id, roll_number, enrollment_date } = req.body;

    if (!student_id || !department_id || !course_id || !academic_year_id || !semester_id) {
      return res.status(400).json({ success: false, error: 'Student, department, course, academic year, and semester are required.' });
    }

    // Verify student exists and belongs to this university
    const [userRows] = await pool.query(
      'SELECT id, role FROM users WHERE id = ? AND university_id = ? AND role = "Student"',
      [student_id, universityId]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Valid student user not found in this university' });
    }

    const [result] = await pool.query(
      `INSERT INTO student_mappings 
        (university_id, student_id, department_id, course_id, academic_year_id, semester_id, roll_number, enrollment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        department_id = VALUES(department_id),
        academic_year_id = VALUES(academic_year_id),
        roll_number = VALUES(roll_number)`,
      [universityId, student_id, department_id, course_id, academic_year_id, semester_id, roll_number || null, enrollment_date || new Date()]
    );

    return res.status(201).json({ success: true, message: 'Student successfully mapped to academic program' });
  } catch (err) {
    console.error('mapStudent error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create student mapping' });
  }
}

export async function getFacultyAssignments(req, res) {
  try {
    const universityId = getScopedUniversityId(req);
    const { faculty_id, subject_id, semester_id, search, page = 1, limit = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    let query = `
      SELECT fa.*, 
             u.full_name AS faculty_name, u.email AS faculty_email, u.phone AS faculty_phone,
             sub.name AS subject_name, sub.code AS subject_code,
             c.name AS course_name, sem.name AS semester_name
      FROM faculty_assignments fa
      JOIN users u ON fa.faculty_id = u.id
      JOIN subjects sub ON fa.subject_id = sub.id
      JOIN courses c ON sub.course_id = c.id
      LEFT JOIN semesters sem ON fa.semester_id = sem.id
      WHERE fa.university_id = ?
    `;
    const params = [universityId];

    if (faculty_id) { query += ` AND fa.faculty_id = ?`; params.push(faculty_id); }
    if (subject_id) { query += ` AND fa.subject_id = ?`; params.push(subject_id); }
    if (semester_id) { query += ` AND fa.semester_id = ?`; params.push(semester_id); }
    if (search) {
      query += ` AND (u.full_name LIKE ? OR sub.name LIKE ? OR sub.code LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ` ORDER BY fa.id DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(query, params);

    // Count
    let countQuery = `
      SELECT COUNT(*) AS total 
      FROM faculty_assignments fa
      JOIN users u ON fa.faculty_id = u.id
      JOIN subjects sub ON fa.subject_id = sub.id
      WHERE fa.university_id = ?
    `;
    const countParams = [universityId];
    if (faculty_id) { countQuery += ` AND fa.faculty_id = ?`; countParams.push(faculty_id); }
    if (subject_id) { countQuery += ` AND fa.subject_id = ?`; countParams.push(subject_id); }
    if (semester_id) { countQuery += ` AND fa.semester_id = ?`; countParams.push(semester_id); }
    if (search) {
      countQuery += ` AND (u.full_name LIKE ? OR sub.name LIKE ? OR sub.code LIKE ?)`;
      countParams.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    const [countRows] = await pool.query(countQuery, countParams);

    return res.json({
      success: true,
      data: rows,
      pagination: {
        total: countRows[0].total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(countRows[0].total / Number(limit))
      }
    });
  } catch (err) {
    console.error('getFacultyAssignments error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve faculty assignments' });
  }
}

export async function assignFaculty(req, res) {
  try {
    const universityId = getScopedUniversityId(req);
    const { faculty_id, subject_id, semester_id, role_title = 'Lead Instructor', status = 'active' } = req.body;

    if (!faculty_id || !subject_id) {
      return res.status(400).json({ success: false, error: 'Faculty and subject are required' });
    }

    // Verify faculty
    const [userRows] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND university_id = ? AND role = "Faculty"',
      [faculty_id, universityId]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Valid faculty member not found in this university' });
    }

    const [result] = await pool.query(
      `INSERT INTO faculty_assignments (university_id, faculty_id, subject_id, semester_id, role_title, status)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE role_title = VALUES(role_title), status = VALUES(status)`,
      [universityId, faculty_id, subject_id, semester_id || null, role_title, status]
    );

    return res.status(201).json({ success: true, message: 'Faculty assigned to subject successfully' });
  } catch (err) {
    console.error('assignFaculty error:', err);
    return res.status(500).json({ success: false, error: 'Failed to assign faculty to subject' });
  }
}

