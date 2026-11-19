import express from 'express';
import { getDashboardOverview } from '../controllers/dashboard.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/overview', authenticateToken, getDashboardOverview);

export default router;
