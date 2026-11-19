import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import universityAdminRoutes from './routes/universityAdmin.routes.js';
import academicRoutes from './routes/academic.routes.js';
import pool from './config/db.js';
import { runMigrations } from './config/migrate.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true // Crucial for HTTP-only cookies
}));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' })); // Body limit prevents DoS payload attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging middleware: dev to console, combined to log stream
app.use(morgan('dev'));
app.use(morgan('combined', { stream: logger.httpStream }));

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/university-admin', universityAdminRoutes);
app.use('/api/academic', academicRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'LLM LMS Portal API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        currentUser: 'GET /api/auth/me'
      },
      superAdmin: {
        universities: '/api/admin/universities'
      },
      universityAdmin: {
        profile: '/api/university-admin/profile',
        university: '/api/university-admin/university'
      }
    }
  });
});

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database schema and start server
async function startServer() {
  try {
    const conn = await pool.getConnection();
    logger.info(`Connected successfully to MySQL database: ${process.env.DB_NAME || 'llm'}`);
    conn.release();

    // Auto-migrate tables if not existing
    await runMigrations();

    app.listen(PORT, () => {
      logger.info(`API running on http://localhost:${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    logger.error(`Failed to connect to MySQL: ${err.message}`);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
