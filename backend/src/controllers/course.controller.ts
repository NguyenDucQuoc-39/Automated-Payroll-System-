import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Thêm học phần
export const createCourse = async (req: Request, res: Response) => {
  try {
    const { code, name, credit, departmentId } = req.body;

    if (credit <= 0) {
      return res.status(400).json({ message: 'Số tín chỉ phải lớn hơn 0.' });
    }

    const totalHours = credit * 15; // 1 tín chỉ = 15 tiết

    const course = await prisma.course.create({
      data: {
        code,
        name,
        credit,
        totalHours,
        departmentId,
      },
    });

    res.status(201).json(course);
  } catch (error: any) {
    console.error('Lỗi khi tạo học phần:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(400).json({ message: 'Mã học phần đã tồn tại trong khoa này.' });
    }
    res.status(500).json({ message: 'Lỗi khi tạo học phần', error: error.message });
  }
};

// 2. Lấy tất cả học phần (có phân trang và lọc theo khoa)
export const getCourses = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10, departmentId } = req.query;
    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);

    if (isNaN(pageNumber) || pageNumber < 1 || isNaN(pageSizeNumber) || pageSizeNumber < 1) {
      return res.status(400).json({ message: 'Tham số trang hoặc kích thước trang không hợp lệ.' });
    }

    const where: Prisma.CourseWhereInput = {};
    if (departmentId) {
      where.departmentId = departmentId as string;
    }

    const courses = await prisma.course.findMany({
      where,
      skip: (pageNumber - 1) * pageSizeNumber,
      take: pageSizeNumber,
      include: {
        department: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const totalCount = await prisma.course.count({ where });

    res.json({
      courses,
      totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / pageSizeNumber),
    });
  } catch (error: any) {
    console.error('Lỗi khi lấy học phần:', error);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu học phần', error: error.message });
  }
};

// 3. Lấy học phần theo ID
export const getCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        department: true,
      },
    });
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy học phần.' });
    }
    res.json(course);
  } catch (error: any) {
    console.error('Lỗi khi lấy học phần theo ID:', error);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu học phần', error: error.message });
  }
};

// 4. Sửa học phần
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, name, credit, departmentId } = req.body;

    if (credit <= 0) {
      return res.status(400).json({ message: 'Số tín chỉ phải lớn hơn 0.' });
    }

    const totalHours = credit * 15;

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        code,
        name,
        credit,
        totalHours,
        departmentId,
      },
    });

    res.json(updatedCourse);
  } catch (error: any) {
    console.error('Lỗi khi sửa học phần:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(400).json({ message: 'Mã học phần đã tồn tại trong khoa này.' });
    }
    res.status(500).json({ message: 'Lỗi khi cập nhật học phần', error: error.message });
  }
};

// 5. Xóa học phần
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error: any) {
    console.error('Lỗi khi xóa học phần:', error);
     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({ message: 'Không tìm thấy học phần để xóa.' });
    }
    res.status(500).json({ message: 'Lỗi khi xóa học phần', error: error.message });
  }
};