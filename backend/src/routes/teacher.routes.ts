import { Router } from 'express';
import {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  getTeachersByDepartment,
  getTeachersNotHead,
  getTeacherStatistics,
  importFromExcel
} from '../controllers/teacher.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { Role } from '@prisma/client';
import express from 'express';
import { upload } from '../middleware/upload';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all teachers (accessible by all roles)
router.get('/', getTeachers);

// Get teachers by department (accessible by all roles)
router.get('/department/:departmentId', getTeachersByDepartment);

// // Get teachers not head (accessible by all roles)
router.get('/not-head', getTeachersNotHead);

// Get teacher statistics (admin and department head only)
router.get('/teacherStatistics', getTeacherStatistics);
// Get teacher by id (accessible by all roles)

router.get('/:id', getTeacherById);

// Create teacher (admin only)
router.post('/', adminMiddleware, createTeacher);

// Update teacher (admin only)
router.put('/:id', adminMiddleware, updateTeacher);

// Delete teacher (admin only)
router.delete('/:id', adminMiddleware, deleteTeacher);

// Import teachers from Excel
router.post('/import', adminMiddleware, upload.single('file'), importFromExcel);

export default router; 