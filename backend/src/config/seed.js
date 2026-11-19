import bcrypt from 'bcryptjs';
import pool from './db.js';

async function seed() {
  try {
    const defaultPassword = 'password123';
    const hash = await bcrypt.hash(defaultPassword, 10);

    // 1. Universities
    await pool.query(`
      INSERT INTO universities (id, name, code, domain, status)
      VALUES 
        (1, 'Agnes University of Technology', 'AUT', 'agnes.edu', 'active'),
        (2, 'Metro State University', 'MSU', 'metro.edu', 'active')
      ON DUPLICATE KEY UPDATE name=VALUES(name), domain=VALUES(domain), status=VALUES(status)
    `);

    // 2. Simplified Users for all 4 roles
    // superadmin@lms.com / password123
    // admin@lms.com      / password123
    // faculty@lms.com    / password123
    // student@lms.com    / password123
    const users = [
      { id: 1, uni: null, name: 'Super Administrator', email: 'superadmin@lms.com', role: 'Super Admin' },
      { id: 2, uni: 1,    name: 'University Admin',     email: 'admin@lms.com',      role: 'University Admin' },
      { id: 3, uni: 1,    name: 'Prof. Alan Turing',    email: 'faculty@lms.com',    role: 'Faculty' },
      { id: 4, uni: 1,    name: 'Alice Smith',          email: 'student@lms.com',    role: 'Student' }
    ];

    for (const u of users) {
      await pool.query(`
        INSERT INTO users (id, university_id, full_name, email, password_hash, role, status)
        VALUES (?, ?, ?, ?, ?, ?, 'active')
        ON DUPLICATE KEY UPDATE 
          university_id = VALUES(university_id),
          full_name = VALUES(full_name),
          password_hash = VALUES(password_hash),
          role = VALUES(role),
          status = 'active'
      `, [u.id, u.uni, u.name, u.email, hash, u.role]);
    }

    // 3. Departments
    await pool.query(`
      INSERT INTO departments (id, university_id, name, code, description, status) VALUES
      (1, 1, 'Computer Science & Engineering', 'CSE', 'Software Engineering and Computer Systems', 'active'),
      (2, 1, 'Electronics & Communication', 'ECE', 'Hardware, VLSI, and Communications', 'active'),
      (3, 1, 'Business Administration', 'BBA', 'Management, Finance, and Marketing', 'active')
      ON DUPLICATE KEY UPDATE name=VALUES(name)
    `);

    // 4. Academic Years
    await pool.query(`
      INSERT INTO academic_years (id, university_id, year_name, start_date, end_date, is_current, status) VALUES
      (1, 1, '2025-2026', '2025-08-01', '2026-06-30', 1, 'active'),
      (2, 1, '2026-2027', '2026-08-01', '2027-06-30', 0, 'active')
      ON DUPLICATE KEY UPDATE year_name=VALUES(year_name)
    `);

    // 5. Semesters
    await pool.query(`
      INSERT INTO semesters (id, university_id, academic_year_id, name, term, start_date, end_date, status) VALUES
      (1, 1, 1, 'Semester 1', 'Fall', '2025-08-01', '2025-12-20', 'active'),
      (2, 1, 1, 'Semester 2', 'Spring', '2026-01-10', '2026-05-30', 'active')
      ON DUPLICATE KEY UPDATE name=VALUES(name)
    `);

    // 6. Courses
    await pool.query(`
      INSERT INTO courses (id, university_id, department_id, name, code, duration_years, total_semesters, status) VALUES
      (1, 1, 1, 'B.Tech Computer Science', 'BT-CSE', 4, 8, 'active'),
      (2, 1, 1, 'M.Tech Artificial Intelligence', 'MT-AI', 2, 4, 'active'),
      (3, 1, 2, 'B.Tech Electronics & Comm', 'BT-ECE', 4, 8, 'active')
      ON DUPLICATE KEY UPDATE name=VALUES(name)
    `);

    // 7. Subjects
    await pool.query(`
      INSERT INTO subjects (id, university_id, course_id, semester_id, name, code, credits, type, status) VALUES
      (1, 1, 1, 1, 'Data Structures & Algorithms', 'CS101', 4, 'Theory & Practical', 'active'),
      (2, 1, 1, 1, 'Database Management Systems', 'CS102', 4, 'Theory & Practical', 'active'),
      (3, 1, 1, 2, 'Operating Systems', 'CS201', 3, 'Theory', 'active')
      ON DUPLICATE KEY UPDATE name=VALUES(name)
    `);

    // 8. Student Mapping
    await pool.query(`
      INSERT INTO student_mappings (id, university_id, student_id, department_id, course_id, academic_year_id, semester_id, roll_number, status)
      VALUES (1, 1, 4, 1, 1, 1, 1, 'AUT-2025-001', 'active')
      ON DUPLICATE KEY UPDATE roll_number=VALUES(roll_number)
    `);

    // 9. Faculty Assignment
    await pool.query(`
      INSERT INTO faculty_assignments (id, university_id, faculty_id, subject_id, semester_id, role_title, status)
      VALUES 
        (1, 1, 3, 1, 1, 'Lead Instructor', 'active'),
        (2, 1, 3, 2, 1, 'Professor In-Charge', 'active')
      ON DUPLICATE KEY UPDATE role_title=VALUES(role_title)
    `);

    console.log('===========================================================');
    console.log('🎉 Simplified Role-Based Credentials Seeded Successfully!');
    console.log('-----------------------------------------------------------');
    console.log('Default Password for all accounts: password123');
    console.log('');
    console.log('1. Super Admin:       superadmin@lms.com');
    console.log('2. University Admin:  admin@lms.com');
    console.log('3. Faculty:           faculty@lms.com');
    console.log('4. Student:           student@lms.com');
    console.log('===========================================================');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
