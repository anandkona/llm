import express from 'express';
import {
  getAdminProfile,
  updateAdminProfile,
  updateAdminUniversityDetails
} from '../controllers/universityAdmin.controller.js';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Guard: University Admin or Super Admin only
router.use(authenticateToken);
router.use(requireRoles('University Admin', 'Super Admin'));

// University Admin personal profile
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);

// University details managed by this admin
router.put('/university', updateAdminUniversityDetails);

export default router;
