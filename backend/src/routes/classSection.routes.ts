import { Router } from 'express';
import {
  createClassSection,
  getAllClassSections,
  getClassSectionById,
  updateClassSection,
  deleteClassSection,
  batchCreateClassSections, // Import the new batch creation function
  getClassSectionStatistics,
} from '../controllers/classSection.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth'; // Giả sử bạn có middleware này

const router = Router();

router.use(authMiddleware); // Yêu cầu đăng nhập cho tất cả các routes


// Tạo lớp học phần (admin only)
router.post('/', adminMiddleware, createClassSection);

router.get('/statistics', adminMiddleware, getClassSectionStatistics);

// Tạo hàng loạt lớp học phần (admin only)
router.post('/batch', adminMiddleware, batchCreateClassSections);

// Lấy tất cả lớp học phần (có lọc và phân trang)
router.get('/', getAllClassSections);

// Lấy lớp học phần theo ID
router.get('/:id', getClassSectionById);

// Cập nhật lớp học phần (admin only)
router.put('/:id', adminMiddleware, updateClassSection);

// Xóa lớp học phần (admin only)
router.delete('/:id', adminMiddleware, deleteClassSection);



export default router;
