import bcrypt from 'bcryptjs';
import pool from './db.js';

async function seed() {
  try {
    const hash = await bcrypt.hash('Admin@12345', 10);

    // 1. Universities
    await pool.query("INSERT IGNORE INTO universities (id, name, code, domain) VALUES (1, 'Global Tech University', 'GTU', 'gtu.edu'), (2, 'State Science University', 'SSU', 'ssu.edu')");

    // 2. Super Admin & University Admin
    await pool.query(`
      INSERT INTO users (id, university_id, full_name, email, password_hash, role)
      VALUES 
        (1, NULL, 'Global Super Admin', 'superadmin@example.com', ?, 'Super Admin'),
        (2, 1, 'GTU Admin', 'admin@gtu.edu', ?, 'University Admin')
      ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), role=VALUES(role)
    `, [hash, hash]);

    // 3. Departments
    await pool.query(`
      INSERT IGNORE INTO departments (id, university_id, name, code, description) VALUES
      (1, 1, 'Computer Science & Engineering', 'CSE', 'Department of Computer Science and Software Engineering'),
      (2, 1, 'Electronics & Communication', 'ECE', 'Department of Electronics and Telecommunications'),
      (3, 1, 'Mechanical Engineering', 'MECH', 'Department of Mechanical and Industrial Systems')
    `);

    // 4. Academic Years
    await pool.query(`
      INSERT IGNORE INTO academic_years (id, university_id, year_name, start_date, end_date, is_current) VALUES
      (1, 1, '2025-2026', '2025-08-01', '2026-06-30', 1),
      (2, 1, '2026-2027', '2026-08-01', '2027-06-30', 0)
    `);

    // 5. Semesters
    await pool.query(`
      INSERT IGNORE INTO semesters (id, university_id, academic_year_id, name, term, start_date, end_date) VALUES
      (1, 1, 1, 'Semester 1', 'Fall', '2025-08-01', '2025-12-20'),
      (2, 1, 1, 'Semester 2', 'Spring', '2026-01-10', '2026-05-30')
    `);

    // 6. Courses
    await pool.query(`
      INSERT IGNORE INTO courses (id, university_id, department_id, name, code, duration_years, total_semesters) VALUES
      (1, 1, 1, 'B.Tech in Computer Science', 'BT-CSE', 4, 8),
      (2, 1, 1, 'M.Tech in Artificial Intelligence', 'MT-AI', 2, 4),
      (3, 1, 2, 'B.Tech in Electronics', 'BT-ECE', 4, 8)
    `);

    // 7. Subjects
    await pool.query(`
      INSERT IGNORE INTO subjects (id, university_id, course_id, semester_id, name, code, credits, type) VALUES
      (1, 1, 1, 1, 'Data Structures & Algorithms', 'CS101', 4, 'Theory & Practical'),
      (2, 1, 1, 1, 'Database Management Systems', 'CS102', 4, 'Theory & Practical'),
      (3, 1, 1, 2, 'Operating Systems', 'CS201', 3, 'Theory'),
      (4, 1, 2, 1, 'Machine Learning & Deep Neural Nets', 'AI501', 4, 'Theory & Practical')
    `);

    // 8. Faculty Users
    await pool.query(`
      INSERT INTO users (id, university_id, full_name, email, password_hash, role)
      VALUES 
        (3, 1, 'Dr. Alan Turing', 'turing@gtu.edu', ?, 'Faculty'),
        (5, 1, 'Dr. Grace Hopper', 'hopper@gtu.edu', ?, 'Faculty')
      ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), role=VALUES(role)
    `, [hash, hash]);

    // 9. Student Users
    await pool.query(`
      INSERT INTO users (id, university_id, full_name, email, password_hash, role)
      VALUES 
        (4, 1, 'Alice Smith', 'alice@gtu.edu', ?, 'Student'),
        (6, 1, 'Bob Johnson', 'bob@gtu.edu', ?, 'Student')
      ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), role=VALUES(role)
    `, [hash, hash]);

    // 10. Student Mappings
    await pool.query(`
      INSERT IGNORE INTO student_mappings (id, university_id, student_id, department_id, course_id, academic_year_id, semester_id, roll_number) VALUES
      (1, 1, 4, 1, 1, 1, 1, 'GTU-2025-CS-001'),
      (2, 1, 6, 1, 1, 1, 1, 'GTU-2025-CS-002')
    `);

    // 11. Faculty Assignments
    await pool.query(`
      INSERT IGNORE INTO faculty_assignments (id, university_id, faculty_id, subject_id, semester_id, role_title) VALUES
      (1, 1, 3, 1, 1, 'Lead Instructor'),
      (2, 1, 5, 2, 1, 'Associate Professor')
    `);

    console.log('[Seed] Full academic data, courses, subjects, and mappings seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error:', err);
    process.exit(1);
  }
}

seed();
