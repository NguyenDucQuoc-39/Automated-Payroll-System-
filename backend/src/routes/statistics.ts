import express from 'express';
import { PrismaClient } from '@prisma/client';
import {
  getTeacherSalaryByYear,
  getTeacherSalaryByDepartment,
  getTeacherSalaryBySchool
} from '../controllers/statistics.controller';

const router = express.Router();
const prisma = new PrismaClient();

// Get gender statistics
router.get('/gender', async (req, res) => {
  try {
    const teachers = await prisma.teacher.groupBy({
      by: ['gender'],
      _count: true
    });

    const statistics = teachers.map(stat => ({
      gender: stat.gender,
      count: stat._count
    }));

    res.json(statistics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gender statistics' });
  }
});

// Get department statistics
router.get('/departments', async (req, res) => {
  try {
    const teachers = await prisma.teacher.groupBy({
      by: ['departmentId'],
      _count: true
    });

    const departments = await prisma.department.findMany({
      where: {
        id: {
          in: teachers.map(t => t.departmentId)
        }
      }
    });

    const statistics = teachers.map(stat => {
      const department = departments.find(d => d.id === stat.departmentId);
      return {
        department: department?.shortName || 'Unknown',
        count: stat._count
      };
    });

    res.json(statistics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching department statistics' });
  }
});

// Get degree statistics
router.get('/degrees', async (req, res) => {
  try {
    const teachers = await prisma.teacher.groupBy({
      by: ['degreeId'],
      _count: true
    });

    const degrees = await prisma.degree.findMany({
      where: {
        id: {
          in: teachers.map(t => t.degreeId)
        }
      }
    });

    const statistics = teachers.map(stat => {
      const degree = degrees.find(d => d.id === stat.degreeId);
      return {
        degree: degree?.type || 'Unknown',
        count: stat._count
      };
    });

    res.json(statistics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching degree statistics' });
  }
});

// Get detailed statistics
router.get('/detailed', async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        department: true,
        degree: true
      }
    });

    const statistics = {
      byGender: {
        MALE: teachers.filter(t => t.gender === 'MALE').length,
        FEMALE: teachers.filter(t => t.gender === 'FEMALE').length,
        OTHER: teachers.filter(t => t.gender === 'OTHER').length
      },
      byDepartment: teachers.reduce((acc, teacher) => {
        const dept = teacher.department.shortName;
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byDegree: teachers.reduce((acc, teacher) => {
        const degree = teacher.degree.type;
        acc[degree] = (acc[degree] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    res.json(statistics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching detailed statistics' });
  }
});

// Báo cáo: Tiền dạy của giảng viên trong một năm
router.get('/teacher-year', getTeacherSalaryByYear);
// Báo cáo: Tiền dạy của giảng viên một khoa
router.get('/teacher-department', getTeacherSalaryByDepartment);
// Báo cáo: Tiền dạy của giảng viên toàn trường
router.get('/teacher-school', getTeacherSalaryBySchool);

export default router; 