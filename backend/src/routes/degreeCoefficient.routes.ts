import express from 'express';
import {
  getAllDegreeCoefficients,
  getDegreeCoefficientById,
  createDegreeCoefficient,
  updateDegreeCoefficient,
  deleteDegreeCoefficient
} from '../controllers/degreeCoefficient.controller';

const router = express.Router();

router.get('/', getAllDegreeCoefficients);
router.get('/:id', getDegreeCoefficientById);
router.post('/', createDegreeCoefficient);
router.put('/:id', updateDegreeCoefficient);
router.delete('/:id', deleteDegreeCoefficient);

export default router; 