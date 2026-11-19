import express from 'express';
import {
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getAcademicYears, createAcademicYear,
  getSemesters, createSemester,
  getCourses, createCourse,
  getSubjects, createSubject,
  getStudentMappings, mapStudent,
  getFacultyAssignments, assignFaculty
} from '../controllers/academic.controller.js';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protected: University Admin and Super Admin
router.use(authenticateToken);
router.use(requireRoles('University Admin', 'Super Admin'));

// Departments
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

// Academic Years & Semesters
router.get('/academic-years', getAcademicYears);
router.post('/academic-years', createAcademicYear);
router.get('/semesters', getSemesters);
router.post('/semesters', createSemester);

// Courses & Subjects
router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);

// Mappings & Assignments
router.get('/student-mappings', getStudentMappings);
router.post('/student-mappings', mapStudent);
router.get('/faculty-assignments', getFacultyAssignments);
router.post('/faculty-assignments', assignFaculty);

export default router;

