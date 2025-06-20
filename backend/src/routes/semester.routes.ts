import { Router } from 'express';
import {
  createSemester,
  getSemesters,
  getSemesterById,
  updateSemester,
  deleteSemester,
  getAcademicYears,
} from '../controllers/semester.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth'; // Đảm bảo các middleware này tồn tại

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all semesters (can be filtered by academicYear)
// Accessible by all authenticated roles
router.get('/', getSemesters);

// Get unique academic years for filtering (accessible by all authenticated roles)
router.get('/academic-years', getAcademicYears);

// Get semester by ID
router.get('/:id', getSemesterById);

// Create, Update, Delete operations are for ADMINs only
router.post('/', adminMiddleware, createSemester);
router.put('/:id', adminMiddleware, updateSemester);
router.delete('/:id', adminMiddleware, deleteSemester);

export default router;
