// src/controllers/teacher.controller.ts

import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { CreateTeacherInput, UpdateTeacherInput } from '../types/typeBackend';
import { hashPassword } from '../utils/auth';
import * as XLSX from 'xlsx';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface TeacherRow {
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  office: string;
  email: string;
  isHead: boolean;
  degreeType: 'MASTER' | 'DOCTOR' | 'ASSOCIATE_PROFESSOR' | 'PROFESSOR';
  departmentCode: string;
  phone: string;
  birthDate: string | Date;
}

export const createTeacher = async (req: Request, res: Response) => {
  try {
    const data: CreateTeacherInput = req.body;

    // Kiểm tra bắt buộc phone và birthDate
    if (!data.phone || !data.birthDate) {
      return res.status(400).json({ message: 'Số điện thoại và ngày sinh là bắt buộc.' });
    }

    // Chuyển birthDate về kiểu Date
    let safeBirthDate: Date;
    try {
      safeBirthDate = new Date(data.birthDate);
      if (isNaN(safeBirthDate.getTime())) throw new Error();
    } catch {
      return res.status(400).json({ message: 'Ngày sinh không hợp lệ. Định dạng phải là YYYY-MM-DD hoặc ISO-8601.' });
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Chuyển role về đúng enum nếu là string
    let userRole: Role = Role.TEACHER;
    if (data.role && typeof data.role === 'string') {
      if (Object.values(Role).includes(data.role as Role)) {
        userRole = data.role as Role;
      }
    } else if (data.role) {
      userRole = data.role;
    }

    // Create user account
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: userRole,
      },
    });

    // Create teacher profile
    const teacher = await prisma.teacher.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        office: data.office,
        email: data.email,
        degreeId: data.degreeId,
        departmentId: data.departmentId,
        isHead: data.isHead || false,
        userId: user.id,
        phone: data.phone,
        birthDate: safeBirthDate,
      },
      include: {
        degree: true,
        department: true,
      },
    });

    res.status(201).json(teacher);
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(400).json({ message: 'Error creating teacher', error: (error as Error).message });
  }
};

export const getTeachers = async (req: Request, res: Response) => {
  try {
    const { search, sortBy, sortOrder, departmentId, degreeId } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { department: { fullName: { contains: search as string, mode: 'insensitive' } } },
        { department: { shortName: { contains: search as string, mode: 'insensitive' } } },
        { degree: { fullName: { contains: search as string, mode: 'insensitive' } } },
        { degree: { type: { contains: search as string, mode: 'insensitive' } } },
      ];
    }
    if (departmentId && typeof departmentId === 'string') {
      where.departmentId = departmentId;
    }
    if (degreeId && typeof degreeId === 'string') {
      where.degreeId = degreeId;
    }

    const orderBy: any = {};
    if (sortBy) {
      if (sortBy === 'department') {
        orderBy.department = { fullName: sortOrder as 'asc' | 'desc' };
      } else if (sortBy === 'degree') {
        orderBy.degree = { fullName: sortOrder as 'asc' | 'desc' };
      } else if (sortBy === 'orderNumber') {
        orderBy.lastName = 'asc';
      } else {
        orderBy[sortBy as string] = sortOrder || 'asc';
      }
    } else {
      orderBy.lastName = 'asc';
    }

    const teachers = await prisma.teacher.findMany({
      where,
      include: {
        degree: true,
        department: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy,
    });
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: 'Error fetching teachers', error: (error as Error).message });
  }
};

export const getTeacherById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        degree: true,
        department: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    console.error('Error fetching teacher by ID:', error);
    res.status(500).json({ message: 'Error fetching teacher', error: (error as Error).message });
  }
};

export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, gender, office, email, degreeId, departmentId, role, isHead, phone, birthDate } = req.body;

    const teacherToUpdate = await prisma.teacher.findUnique({ where: { id } });
    if (!teacherToUpdate) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Chuyển role về đúng enum nếu là string
    let updateRole: Role | undefined = undefined;
    if (role && typeof role === 'string') {
      if (Object.values(Role).includes(role as Role)) {
        updateRole = role as Role;
      }
    } else if (role) {
      updateRole = role;
    }

    // Chuyển birthDate về kiểu Date nếu có
    let safeBirthDate: Date | undefined = undefined;
    if (birthDate) {
      try {
        safeBirthDate = new Date(birthDate);
        if (isNaN(safeBirthDate.getTime())) throw new Error();
      } catch {
        return res.status(400).json({ message: 'Ngày sinh không hợp lệ. Định dạng phải là YYYY-MM-DD hoặc ISO-8601.' });
      }
    }

    // Update teacher profile
    const updatedTeacher = await prisma.teacher.update({
      where: { id },
      data: {
        firstName,
        lastName,
        gender,
        office,
        email,
        degreeId,
        departmentId,
        isHead,
        phone,
        birthDate: safeBirthDate,
      },
      include: {
        degree: true,
        department: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // If role is provided and different from current, update user role
    if (updateRole && updatedTeacher.user.role !== updateRole) {
      await prisma.user.update({
        where: { id: updatedTeacher.userId },
        data: { role: updateRole },
      });
      // Re-fetch teacher with updated user role for response consistency
      const finalTeacher = await prisma.teacher.findUnique({
        where: { id },
        include: {
          degree: true,
          department: true,
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });
      return res.json(finalTeacher);
    }

    res.json(updatedTeacher);
  } catch (error) {
    console.error('Error updating teacher:', error);
    if ((error as any).code === 'P2002' && (error as any).meta?.target.includes('email')) {
      return res.status(400).json({ message: 'Email đã tồn tại.' });
    }
    res.status(400).json({ message: 'Lỗi khi cập nhật giảng viên', error: (error as Error).message });
  }
};

export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Kiểm tra xem giảng viên có đang là trưởng khoa không
    const department = await prisma.department.findFirst({
      where: { headId: id }
    });

    if (department) {
      return res.status(400).json({ 
        message: 'Không thể xóa giảng viên này vì đang là trưởng khoa' 
      });
    }

    // Delete the teacher profile
    await prisma.teacher.delete({
      where: { id },
    });

    // Delete the associated user account
    await prisma.user.delete({
      where: { id: teacher.userId },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(400).json({ message: 'Lỗi khi xóa giảng viên', error: (error as Error).message });
  }
};

export const getTeachersByDepartment = async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.params;
    const teachers = await prisma.teacher.findMany({
      where: {
        departmentId,
      },
      include: {
        degree: true,
        department: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    });
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers by department:', error);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu giảng viên', error: (error as Error).message });
  }
};

export const getTeachersNotHead = async (req: Request, res: Response) => {
  try {
    const teachers = await prisma.teacher.findMany({
      where: {
        isHead: false,
      },
      include: {
        degree: true,
        department: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    });
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers not head:', error);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu giảng viên', error: (error as Error).message });
  }
};

export const importFromExcel = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet) as TeacherRow[];

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const row of data) {
      try {
        // Validate required fields
        if (!row.firstName || !row.lastName || !row.gender || !row.email || !row.departmentCode || !row.degreeType || !row.phone || !row.birthDate) {
          throw new Error('All fields are required: firstName, lastName, gender, email, departmentCode, degreeType, phone, birthDate');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email)) {
          throw new Error('Invalid email format');
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: row.email }
        });

        if (existingUser) {
          throw new Error(`User with email "${row.email}" already exists`);
        }

        // Find department
        const department = await prisma.department.findUnique({
          where: { code: row.departmentCode }
        });

        if (!department) {
          throw new Error(`Department with code "${row.departmentCode}" not found`);
        }

        // Find or create degree
        let degree = await prisma.degree.findFirst({
          where: { type: row.degreeType }
        });

        if (!degree) {
          degree = await prisma.degree.create({
            data: {
              type: row.degreeType,
              fullName: row.degreeType === 'MASTER' ? 'Thạc sĩ' :
                       row.degreeType === 'DOCTOR' ? 'Tiến sĩ' :
                       row.degreeType === 'ASSOCIATE_PROFESSOR' ? 'Phó giáo sư' : 'Giáo sư',
              shortName: row.degreeType === 'MASTER' ? 'ThS' :
                        row.degreeType === 'DOCTOR' ? 'TS' :
                        row.degreeType === 'ASSOCIATE_PROFESSOR' ? 'PGS' : 'GS'
            }
          });
        }

        // Create user account
        const hashedPassword = await bcrypt.hash('password123', 10); // Default password
        const user = await prisma.user.create({
          data: {
            email: row.email,
            password: hashedPassword,
            role: 'TEACHER'
          }
        });

        // Create teacher
        await prisma.teacher.create({
          data: {
            firstName: row.firstName,
            lastName: row.lastName,
            gender: row.gender,
            office: row.office,
            email: row.email,
            isHead: row.isHead || false,
            degreeId: degree.id,
            departmentId: department.id,
            userId: user.id,
            phone: row.phone,
            birthDate: row.birthDate,
          }
        });

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Row ${results.success + results.failed}: ${error.message}`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    return res.json({
      message: 'Import completed',
      results
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return res.status(500).json({ message: 'Lỗi khi nhập dữ liệu giảng viên' });
  }
};


export const getTeacherStatistics = async (req: Request, res: Response) => {
  try {
    const totalTeachers = await prisma.teacher.count();

    // Thống kê theo giới tính
    const byGender = await prisma.teacher.groupBy({
      by: ['gender'],
      _count: {
        _all: true,
      },
    });
    const genderStats = byGender.reduce((acc: Record<string, number>, curr) => {
      acc[curr.gender] = curr._count._all;
      return acc;
    }, { MALE: 0, FEMALE: 0, OTHER: 0 });

    // Thống kê theo khoa (chỉ ID và số lượng)
    const byDepartment = await prisma.teacher.groupBy({
      by: ['departmentId'],
      _count: {
        _all: true,
      },
    });
    const departmentStats: Record<string, number> = {};
    for (const item of byDepartment) {
        const department = await prisma.department.findUnique({
            where: { id: item.departmentId },
            select: { shortName: true } // Lấy shortName hoặc fullName tùy ý
        });
        if (department) {
            departmentStats[department.shortName] = item._count._all;
        }
    }

    // Thống kê chi tiết theo khoa (tên khoa, số lượng nam/nữ)
    const departmentsWithTeachers = await prisma.department.findMany({
        include: {
            teachers: {
                select: { gender: true }
            }
        }
    });

    const byDepartmentDetailed: Record<string, { name: string; MALE: number; FEMALE: number; OTHER: number }> = {};
    for (const dept of departmentsWithTeachers) {
        let male = 0;
        let female = 0;
        let other = 0;
        dept.teachers.forEach(teacher => {
            if (teacher.gender === 'MALE') male++;
            else if (teacher.gender === 'FEMALE') female++;
            else other++;
        });
        byDepartmentDetailed[dept.shortName] = { // Sử dụng shortName làm key
            name: dept.fullName, // Tên đầy đủ để hiển thị
            MALE: male,
            FEMALE: female,
            OTHER: other,
        };
    }

    // Thống kê theo bằng cấp
    const byDegree = await prisma.teacher.groupBy({
      by: ['degreeId'],
      _count: {
        _all: true,
      },
    });
    const degreeStats: Record<string, number> = {};
    for (const item of byDegree) {
        const degree = await prisma.degree.findUnique({
            where: { id: item.degreeId },
            select: { type: true } // Lấy type (enum)
        });
        if (degree) {
            degreeStats[degree.type] = item._count._all;
        }
    }


    res.json({
      totalTeachers,
      byGender: genderStats,
      byDepartment: departmentStats, // Thống kê theo khoa đơn giản
      byDepartmentDetailed: byDepartmentDetailed, // Thống kê theo khoa chi tiết
      byDegree: degreeStats,
    });

  } catch (error: any) {
    console.error('Error fetching teacher statistics:', error.message);
    res.status(500).json({ message: 'Lỗi khi tải dữ liệu thống kê giảng viên.', error: error.message });
  }
};