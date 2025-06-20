import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { CreateSemesterInput, UpdateSemesterInput, Semester } from '../types/typeBackend';

const prisma = new PrismaClient();

// Helper function to check for semester date overlaps
const checkSemesterOverlap = async (
  newStartDate: Date,
  newEndDate: Date,
  excludeSemesterId: string | null = null
): Promise<boolean> => {
  const newStart = new Date(newStartDate.getFullYear(), newStartDate.getMonth(), newStartDate.getDate());
  const newEnd = new Date(newEndDate.getFullYear(), newEndDate.getMonth(), newEndDate.getDate());

  const overlappingSemesters = await prisma.semester.findMany({
    where: {
      id: excludeSemesterId ? { not: excludeSemesterId } : undefined,
      AND: [
        { startDate: { lte: newEnd } },
        { endDate: { gte: newStart } },
      ],
    },
  });

  return overlappingSemesters.length > 0;
};

// Create Semester
export const createSemester = async (req: Request, res: Response) => {
  try {
    const { orderNumber, name, academicYear, startDate, endDate }: CreateSemesterInput = req.body;

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    if (startDateTime >= endDateTime) {
      return res.status(400).json({ message: 'Ngày bắt đầu phải trước ngày kết thúc.' });
    }

    const diffTime = Math.abs(endDateTime.getTime() - startDateTime.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 60) {
      return res.status(400).json({ message: 'Thời lượng học kì phải tối thiểu 60 ngày.' });
    }

    const isOverlapping = await checkSemesterOverlap(startDateTime, endDateTime);
    if (isOverlapping) {
      return res.status(400).json({ message: 'Thời gian học kì bị trùng với học kì khác.' });
    }

    const semester = await prisma.semester.create({
      data: {
        orderNumber,
        name,
        academicYear,
        startDate: startDateTime,
        endDate: endDateTime,
      },
    });

    res.status(201).json(semester);
  } catch (error: any) {
    console.error('Error creating semester:', error.message);
    if (error instanceof Prisma.PrismaClientKnownRequestError  && error.code === 'P2002') {
      if (error.meta?.target === 'Semester_orderNumber_academicYear_key') {
        return res.status(400).json({ message: `Học kỳ số ${req.body.orderNumber} trong năm học ${req.body.academicYear} đã tồn tại.` });
      }
    }
    res.status(400).json({ message: 'Error creating semester', error: error.message });
  }
};

// Get all Semesters (with optional academicYear filter)
export const getSemesters = async (req: Request, res: Response) => {
  try {
    const { academicYear } = req.query;

    const where: Prisma.SemesterWhereInput = {};
    if (academicYear && typeof academicYear === 'string') {
      where.academicYear = academicYear;
    }

    const semesters = await prisma.semester.findMany({
      where,
      orderBy: [
        { academicYear: 'asc' },
        { orderNumber: 'asc' },
      ],
    });

    res.json(semesters);
  } catch (error: any) {
    console.error('Error fetching semesters:', error.message);
    res.status(500).json({ message: 'Error fetching semesters', error: error.message });
  }
};

// Get Semester by ID
export const getSemesterById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const semester = await prisma.semester.findUnique({
      where: { id },
    });
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    res.json(semester);
  } catch (error: any) {
    console.error('Error fetching semester by ID:', error.message);
    res.status(500).json({ message: 'Error fetching semester', error: error.message });
  }
};

// Update Semester
export const updateSemester = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {  name, academicYear, startDate, endDate }: UpdateSemesterInput = req.body;

    const existingSemester = await prisma.semester.findUnique({ where: { id } });
    if (!existingSemester) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    // Convert dates from string to Date objects if provided, otherwise use existing Date objects
    const newStartDate = startDate ? new Date(startDate) : existingSemester.startDate;
    const newEndDate = endDate ? new Date(endDate) : existingSemester.endDate;

    if (newStartDate >= newEndDate) {
      return res.status(400).json({ message: 'Ngày bắt đầu phải trước ngày kết thúc.' });
    }

    const diffTime = Math.abs(newEndDate.getTime() - newStartDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 60) {
      return res.status(400).json({ message: 'Thời lượng học kì phải tối thiểu 60 ngày.' });
    }

    const isOverlapping = await checkSemesterOverlap(newStartDate, newEndDate, id);
    if (isOverlapping) {
      return res.status(400).json({ message: 'Thời gian học kì bị trùng với học kì khác.' });
    }

    const dataToUpdate: Prisma.SemesterUpdateInput = {
      startDate: newStartDate,
      endDate: newEndDate,
    };

    if (name !== undefined && name !== existingSemester.name) {
      dataToUpdate.name = name;
    }
    if (academicYear !== undefined && academicYear !== existingSemester.academicYear) {
      dataToUpdate.academicYear = academicYear;
    }

    const semester = await prisma.semester.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json(semester);
  } catch (error: any) {
    console.error('Error updating semester:', error.message);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      if (error.meta?.target === 'Semester_orderNumber_academicYear_key') {
        return res.status(400).json({
          message: `Học kỳ số ${req.body.orderNumber} trong năm học ${req.body.academicYear} đã tồn tại.`
        });
      }
    }
    res.status(400).json({ message: 'Error updating semester', error: error.message });
  }
};

// Delete Semester
export const deleteSemester = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.semester.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting semester:', error.message);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Semester not found' });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return res.status(400).json({ message: 'Không thể xóa học kì này vì nó có liên kết với các học phần hoặc thời khóa biểu.' });
    }
    res.status(400).json({ message: 'Error deleting semester', error: error.message });
  }
};

// Get unique academic years for filtering
export const getAcademicYears = async (req: Request, res: Response) => {
  try {
    const academicYears = await prisma.semester.findMany({
      select: {
        academicYear: true,
      },
      distinct: ['academicYear'],
      orderBy: {
        academicYear: 'asc',
      },
    });

    const uniqueAcademicYears = academicYears.map(item => item.academicYear);
    res.json(uniqueAcademicYears);
  } catch (error: any) {
    console.error('Error fetching academic years:', error.message);
    res.status(500).json({ message: 'Error fetching academic years', error: error.message });
  }
};
