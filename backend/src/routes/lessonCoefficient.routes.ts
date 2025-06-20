import express from 'express';
import {
  getAllLessonCoefficients,
  getLessonCoefficientById,
  createLessonCoefficient,
  updateLessonCoefficient,
  deleteLessonCoefficient
} from '../controllers/lessonCoefficient.controller';

const router = express.Router();

router.get('/', getAllLessonCoefficients);
router.get('/:id', getLessonCoefficientById);
router.post('/', createLessonCoefficient);
router.put('/:id', updateLessonCoefficient);
router.delete('/:id', deleteLessonCoefficient);

export default router; 