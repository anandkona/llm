import express from 'express';
import {
  createUniversity,
  getAllUniversities,
  getUniversityById,
  updateUniversity,
  toggleUniversityStatus
} from '../controllers/university.controller.js';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Super Admin Only Guard
router.use(authenticateToken);
router.use(requireRoles('Super Admin'));

router.post('/universities', createUniversity);
router.get('/universities', getAllUniversities);
router.get('/universities/:id', getUniversityById);
router.put('/universities/:id', updateUniversity);
router.patch('/universities/:id/deactivate', toggleUniversityStatus);

export default router;

