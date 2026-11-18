import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/health', async (req, res) => {
  const timestamp = new Date().toISOString();

  let dbStatus = 'connected';
  let dbError = null;

  try {
    const [rows] = await pool.query('SELECT 1 AS status');
  } catch (error) {
    dbStatus = 'disconnected';
    dbError = error.message;
  }

  const statusCode = dbStatus === 'connected' ? 200 : 503;

  return res.status(statusCode).json({
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    uptime: process.uptime(),
    timestamp,
    services: {
      server: {
        status: 'up',
        port: process.env.PORT || 5000,
        node_env: process.env.NODE_ENV || 'development'
      },
      database: {
        status: dbStatus,
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'university_lms',
        ...(dbError && { error: dbError })
      }
    }
  });
});

export default router;

