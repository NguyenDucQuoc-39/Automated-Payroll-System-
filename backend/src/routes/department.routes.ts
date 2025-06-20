import { Router } from 'express';
import {
  createDepartment,
  getDepartments,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  importFromExcel
} from '../controllers/department.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { Role } from '@prisma/client';
import express from 'express';
import { upload } from '../middleware/upload';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all departments without pagination (accessible by all roles)
router.get('/all', getAllDepartments);

// Get all departments (accessible by all roles)
router.get('/', getDepartments);

// Get department by id (accessible by all roles)
router.get('/:id', getDepartmentById);

// Create department (admin only)
router.post('/', adminMiddleware, createDepartment);

// Update department (admin only)
router.put('/:id', adminMiddleware, updateDepartment);

// Delete department (admin only)
router.delete('/:id', adminMiddleware, deleteDepartment);

// Import departments from Excel
router.post('/import', adminMiddleware, upload.single('file'), importFromExcel);

export default router; 