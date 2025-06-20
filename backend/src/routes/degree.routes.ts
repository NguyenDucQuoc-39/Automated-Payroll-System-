import { Router } from 'express';
import {
  createDegree,
  getDegrees,
  getAllDegrees,
  getDegreeById,
  updateDegree,
  deleteDegree,
  importDegrees,
} from '../controllers/degree.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all degrees without pagination (accessible by all roles)
router.get('/all', getAllDegrees);

// Get all degrees (accessible by all roles)
router.get('/', getDegrees);

// Get degree by id (accessible by all roles)
router.get('/:id', getDegreeById);

// Create degree (admin only)
router.post('/', adminMiddleware, createDegree);

// Update degree (admin only)
router.put('/:id', adminMiddleware, updateDegree);

// Delete degree (admin only)
router.delete('/:id', adminMiddleware, deleteDegree);

// Import degrees (admin only)
router.post('/import', adminMiddleware, importDegrees);

export default router; 