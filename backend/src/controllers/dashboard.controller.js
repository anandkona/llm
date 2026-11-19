import pool from '../config/db.js';

export async function getDashboardOverview(req, res) {
  try {
    const user = req.user;
    const role = user.role;
    const universityId = user.university_id;

    if (role === 'Super Admin') {
      const [uniCount] = await pool.query('SELECT COUNT(*) AS total FROM universities');
      const [userCount] = await pool.query('SELECT COUNT(*) AS total FROM users');
      const [adminCount] = await pool.query('SELECT COUNT(*) AS total FROM users WHERE role = "University Admin"');
      const [unis] = await pool.query(`
        SELECT u.id, u.name, u.code, u.status, COUNT(usr.id) as user_count
        FROM universities u
        LEFT JOIN users usr ON u.id = usr.university_id
        GROUP BY u.id
        LIMIT 5
      `);

      return res.json({
        success: true,
        role: 'Super Admin',
        stats: {
          totalUniversities: uniCount[0].total,
          totalUsers: userCount[0].total,
          totalUniversityAdmins: adminCount[0].total,
        },
        recentUniversities: unis
      });
    }

    if (role === 'University Admin') {
      const [deptCount] = await pool.query('SELECT COUNT(*) AS total FROM departments WHERE university_id = ?', [universityId]);
      const [courseCount] = await pool.query('SELECT COUNT(*) AS total FROM courses WHERE university_id = ?', [universityId]);
      const [facultyCount] = await pool.query('SELECT COUNT(*) AS total FROM users WHERE university_id = ? AND role = "Faculty"', [universityId]);
      const [studentCount] = await pool.query('SELECT COUNT(*) AS total FROM users WHERE university_id = ? AND role = "Student"', [universityId]);

      return res.json({
        success: true,
        role: 'University Admin',
        universityName: user.university_name,
        stats: {
          totalDepartments: deptCount[0].total,
          totalCourses: courseCount[0].total,
          totalFaculty: facultyCount[0].total,
          totalStudents: studentCount[0].total,
        }
      });
    }

    if (role === 'Faculty') {
      const [assignedSubjects] = await pool.query(`
        SELECT fa.role_title, s.name AS subject_name, s.code AS subject_code, s.credits, s.type,
               c.name AS course_name, sem.name AS semester_name
        FROM faculty_assignments fa
        JOIN subjects s ON fa.subject_id = s.id
        JOIN courses c ON s.course_id = c.id
        LEFT JOIN semesters sem ON fa.semester_id = sem.id
        WHERE fa.faculty_id = ? AND fa.status = 'active'
      `, [user.id]);

      return res.json({
        success: true,
        role: 'Faculty',
        universityName: user.university_name,
        stats: {
          totalAssignedSubjects: assignedSubjects.length
        },
        subjects: assignedSubjects
      });
    }

    if (role === 'Student') {
      const [enrollment] = await pool.query(`
        SELECT sm.roll_number, sm.status, d.name AS department_name, c.name AS course_name,
               ay.year_name, sem.name AS semester_name, sm.course_id
        FROM student_mappings sm
        JOIN departments d ON sm.department_id = d.id
        JOIN courses c ON sm.course_id = c.id
        JOIN academic_years ay ON sm.academic_year_id = ay.id
        JOIN semesters sem ON sm.semester_id = sem.id
        WHERE sm.student_id = ? AND sm.status = 'active'
        LIMIT 1
      `, [user.id]);

      let enrolledSubjects = [];
      if (enrollment.length > 0) {
        const [subList] = await pool.query(`
          SELECT s.id, s.name, s.code, s.credits, s.type
          FROM subjects s
          WHERE s.course_id = ?
        `, [enrollment[0].course_id]);
        enrolledSubjects = subList;
      }

      return res.json({
        success: true,
        role: 'Student',
        universityName: user.university_name,
        enrollment: enrollment[0] || null,
        subjects: enrolledSubjects
      });
    }

    return res.status(400).json({ success: false, error: 'Unrecognized user role' });
  } catch (err) {
    console.error('getDashboardOverview error:', err);
    return res.status(500).json({ success: false, error: 'Failed to load dashboard overview' });
  }
}
