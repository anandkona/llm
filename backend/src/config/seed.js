import bcrypt from 'bcryptjs';
import pool from './db.js';

async function seed() {
  try {
    const hash = await bcrypt.hash('Admin@12345', 10);

    await pool.query("INSERT IGNORE INTO universities (id, name, code) VALUES (1, 'Global Tech University', 'GTU'), (2, 'State Science University', 'SSU')");

    // Super Admin (university_id NULL or 1)
    await pool.query(`
      INSERT INTO users (university_id, full_name, email, password_hash, role)
      VALUES (NULL, 'Global Super Admin', 'superadmin@example.com', ?, 'Super Admin')
      ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), role=VALUES(role)
    `, [hash]);

    // University Admin for University 1
    await pool.query(`
      INSERT INTO users (university_id, full_name, email, password_hash, role)
      VALUES (1, 'GTU Admin', 'admin@gtu.edu', ?, 'University Admin')
      ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), role=VALUES(role)
    `, [hash]);

    // Faculty for University 1
    await pool.query(`
      INSERT INTO users (university_id, full_name, email, password_hash, role)
      VALUES (1, 'Professor Alan Turing', 'turing@gtu.edu', ?, 'Faculty')
      ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), role=VALUES(role)
    `, [hash]);

    // Student for University 1
    await pool.query(`
      INSERT INTO users (university_id, full_name, email, password_hash, role)
      VALUES (1, 'Alice Smith', 'alice@gtu.edu', ?, 'Student')
      ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), role=VALUES(role)
    `, [hash]);

    console.log('[Seed] Sample university and test accounts created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error:', err);
    process.exit(1);
  }
}

seed();
