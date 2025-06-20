import { Router } from 'express';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from '../controllers/course.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth'; // Giả sử bạn có middleware này

const router = Router();

router.use(authMiddleware); // Yêu cầu đăng nhập

router.post('/', adminMiddleware, createCourse); // Chỉ admin mới được tạo
router.get('/', getCourses); // Tất cả đều được xem
router.get('/:id', getCourseById); // Tất cả đều được xem
router.put('/:id', adminMiddleware, updateCourse); // Chỉ admin mới được sửa
router.delete('/:id', adminMiddleware, deleteCourse); // Chỉ admin mới được xóa

export default router;