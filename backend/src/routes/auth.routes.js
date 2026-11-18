import express from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/auth.controller.js';
import { authenticateToken, requireRoles, enforceUniversityScope } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public Authentication Endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected Session Endpoint (Current User)
router.get('/me', authenticateToken, getCurrentUser);

// Demonstration / Testing Scope-Isolation Endpoint
router.get(
  '/universities/:universityId/data',
  authenticateToken,
  enforceUniversityScope('universityId'),
  (req, res) => {
    res.json({
      success: true,
      message: `Access granted to university ${req.params.universityId} data.`,
      user: req.user.full_name,
      role: req.user.role,
      scopedUniversityId: req.scopedUniversityId
    });
  }
);

export default router;
