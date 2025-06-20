import express from 'express';
import {
  getAllClassCoefficients,
  getClassCoefficientById,
  createClassCoefficient,
  updateClassCoefficient,
  deleteClassCoefficient
} from '../controllers/classCoefficient.controller';

const router = express.Router();

router.get('/', getAllClassCoefficients);
router.get('/:id', getClassCoefficientById);
router.post('/', createClassCoefficient);
router.put('/:id', updateClassCoefficient);
router.delete('/:id', deleteClassCoefficient);

export default router; 