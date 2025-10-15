import { Request, Response } from 'express';
import { PrismaClient, DegreeTypeEnum } from '@prisma/client';

const prisma = new PrismaClient();

// Helper: Lấy hệ số lớp theo sĩ số và năm học
async function getClassCoefficient(academicYear: string, studentCount: number) {
  const coeff = await prisma.classCoefficient.findFirst({
    where: {
      academicYear,
      minStudents: { lte: studentCount },
      maxStudents: { gte: studentCount },
      status: 'ACTIVE',
    },
    orderBy: { minStudents: 'asc' },
  });
  return coeff ? coeff.coefficient : 1;
}

// Helper: Lấy hệ số bằng cấp theo năm học và loại bằng cấp
async function getDegreeCoefficient(academicYear: string, degreeType: DegreeTypeEnum) {
  const coeff = await prisma.degreeCoefficient.findFirst({
    where: { academicYear, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });
  if (!coeff) return 1;
  switch (degreeType) {
    case 'MASTER': return coeff.master;
    case 'DOCTOR': return coeff.doctor;
    case 'ASSOCIATE_PROFESSOR': return coeff.associateProfessor;
    case 'PROFESSOR': return coeff.professor;
    default: return 1;
  }
}

// Helper: Lấy số tiền một tiết theo năm học
async function getLessonCoefficient(academicYear: string) {
  const coeff = await prisma.lessonCoefficient.findFirst({
    where: { academicYear, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });
  return coeff ? coeff.amount : 0;
}

// API: Tiền dạy của giảng viên trong một năm
export const getTeacherSalaryByYear = async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    if (!year || typeof year !== 'string') {
      return res.status(400).json({ message: 'Thiếu hoặc sai định dạng năm học (year)' });
    }

    // 1. Lấy tất cả các học kỳ trong năm học
    const semesters = await prisma.semester.findMany({
      where: { academicYear: year },
      select: { id: true },
    });
    const semesterIds = semesters.map(s => s.id);
    if (semesterIds.length === 0) {
      return res.json({ teachers: [], total: 0 });
    }

    // 2. Lấy tất cả các lớp học phần trong các học kỳ này, đã có giảng viên
    const classSections = await prisma.classSection.findMany({
      where: {
        semesterId: { in: semesterIds },
        assignedTeacherId: { not: null },
      },
      include: {
        course: true,
        assignedTeacher: {
          include: {
            department: true,
            degree: true,
          },
        },
      },
    });

    // 3. Tính tiền dạy cho từng lớp, tổng hợp theo giảng viên
    const teacherMap: Record<string, any> = {};
    let totalAll = 0;
    const lessonCoefficient = await getLessonCoefficient(year);

    for (const section of classSections) {
      const teacher = section.assignedTeacher;
      if (!teacher) continue;
      const teacherId = teacher.id;
      const degreeType = teacher.degree.type;
      const degreeCoefficient = await getDegreeCoefficient(year, degreeType);
      const studentCount = section.maxStudents || 1;
      const classCoefficient = await getClassCoefficient(year, studentCount);
      const totalHours = section.course.totalHours;
      const salary = totalHours * lessonCoefficient * degreeCoefficient * classCoefficient;
      totalAll += salary;
      if (!teacherMap[teacherId]) {
        teacherMap[teacherId] = {
          teacherId,
          code: teacher.orderNumber,
          name: teacher.lastName + ' ' + teacher.firstName,
          email: teacher.email,
          department: teacher.department.fullName,
          totalSalary: 0,
        };
      }
      teacherMap[teacherId].totalSalary += salary;
    }

    const teachers = Object.values(teacherMap);
    res.json({ teachers, total: totalAll });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy báo cáo tiền dạy theo năm', error });
  }
};

// API: Tiền dạy của giảng viên một khoa
export const getTeacherSalaryByDepartment = async (req: Request, res: Response) => {
  try {
    const { departmentId, year, semesterId } = req.query;
    if (!departmentId || typeof departmentId !== 'string') {
      return res.status(400).json({ message: 'Thiếu hoặc sai định dạng departmentId' });
    }
    let semesterIds: string[] = [];
    let academicYear = '';
    if (semesterId && typeof semesterId === 'string') {
      semesterIds = [semesterId];
      const semester = await prisma.semester.findUnique({ where: { id: semesterId } });
      academicYear = semester?.academicYear || '';
    } else if (year && typeof year === 'string') {
      academicYear = year;
      const semesters = await prisma.semester.findMany({ where: { academicYear: year }, select: { id: true } });
      semesterIds = semesters.map(s => s.id);
    } else {
      return res.status(400).json({ message: 'Thiếu năm học (year) hoặc học kỳ (semesterId)' });
    }
    if (semesterIds.length === 0) {
      return res.json({ teachers: [], total: 0 });
    }
    // Lấy các lớp học phần thuộc khoa, trong các học kỳ đã chọn
    const classSections = await prisma.classSection.findMany({
      where: {
        semesterId: { in: semesterIds },
        assignedTeacherId: { not: null },
        course: { departmentId },
      },
      include: {
        course: true,
        assignedTeacher: {
          include: {
            degree: true,
          },
        },
      },
    });
    const teacherMap: Record<string, any> = {};
    let totalAll = 0;
    const lessonCoefficient = await getLessonCoefficient(academicYear);
    for (const section of classSections) {
      const teacher = section.assignedTeacher;
      if (!teacher) continue;
      const teacherId = teacher.id;
      const degreeType = teacher.degree.type;
      const degreeCoefficient = await getDegreeCoefficient(academicYear, degreeType);
      const studentCount = section.maxStudents || 1;
      const classCoefficient = await getClassCoefficient(academicYear, studentCount);
      const totalHours = section.course.totalHours;
      const salary = totalHours * lessonCoefficient * degreeCoefficient * classCoefficient;
      totalAll += salary;
      if (!teacherMap[teacherId]) {
        teacherMap[teacherId] = {
          teacherId,
          code: teacher.orderNumber,
          name: teacher.lastName + ' ' + teacher.firstName,
          email: teacher.email,
          degree: teacher.degree.fullName,
          totalSalary: 0,
        };
      }
      teacherMap[teacherId].totalSalary += salary;
    }
    const teachers = Object.values(teacherMap);
    res.json({ teachers, total: totalAll });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy báo cáo tiền dạy theo khoa', error });
  }
};

// API: Tiền dạy của giảng viên toàn trường
export const getTeacherSalaryBySchool = async (req: Request, res: Response) => {
  try {
    const { year, semesterId } = req.query;
    let semesterIds: string[] = [];
    let academicYear = '';
    if (semesterId && typeof semesterId === 'string') {
      semesterIds = [semesterId];
      const semester = await prisma.semester.findUnique({ where: { id: semesterId } });
      academicYear = semester?.academicYear || '';
    } else if (year && typeof year === 'string') {
      academicYear = year;
      const semesters = await prisma.semester.findMany({ where: { academicYear: year }, select: { id: true } });
      semesterIds = semesters.map(s => s.id);
    } else {
      return res.status(400).json({ message: 'Thiếu năm học (year) hoặc học kỳ (semesterId)' });
    }
    if (semesterIds.length === 0) {
      return res.json({ teachers: [], total: 0 });
    }
    // Lấy các lớp học phần toàn trường, trong các học kỳ đã chọn
    const classSections = await prisma.classSection.findMany({
      where: {
        semesterId: { in: semesterIds },
        assignedTeacherId: { not: null },
      },
      include: {
        course: { include: { department: true } },
        assignedTeacher: {
          include: {
            department: true,
            degree: true,
          },
        },
      },
    });
    const teacherMap: Record<string, any> = {};
    let totalAll = 0;
    const lessonCoefficient = await getLessonCoefficient(academicYear);
    for (const section of classSections) {
      const teacher = section.assignedTeacher;
      if (!teacher) continue;
      const teacherId = teacher.id;
      const degreeType = teacher.degree.type;
      const degreeCoefficient = await getDegreeCoefficient(academicYear, degreeType);
      const studentCount = section.maxStudents || 1;
      const classCoefficient = await getClassCoefficient(academicYear, studentCount);
      const totalHours = section.course.totalHours;
      const salary = totalHours * lessonCoefficient * degreeCoefficient * classCoefficient;
      totalAll += salary;
      if (!teacherMap[teacherId]) {
        teacherMap[teacherId] = {
          teacherId,
          code: teacher.orderNumber,
          name: teacher.lastName + ' ' + teacher.firstName,
          email: teacher.email,
          department: teacher.department.fullName,
          totalSalary: 0,
        };
      }
      teacherMap[teacherId].totalSalary += salary;
    }
    const teachers = Object.values(teacherMap);
    res.json({ teachers, total: totalAll });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy báo cáo tiền dạy toàn trường', error });
  }
}; 

// NEW: Báo cáo tiền lương cá nhân của giảng viên đang đăng nhập
export const getPersonalTeacherSalary = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId: string | undefined = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const me = await prisma.teacher.findFirst({
      where: { userId },
      include: { degree: true },
    });
    if (!me) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    const { mode = 'year', year, month, semesterId } = req.query as any;

    let semesterIds: string[] = [];
    let academicYear = '';

    if (mode === 'semester') {
      if (!semesterId || typeof semesterId !== 'string') {
        return res.status(400).json({ message: 'Thiếu học kỳ (semesterId)' });
      }
      semesterIds = [semesterId];
      const sem = await prisma.semester.findUnique({ where: { id: semesterId } });
      academicYear = sem?.academicYear || '';
    } else {
      if (!year || typeof year !== 'string') {
        return res.status(400).json({ message: 'Thiếu hoặc sai định dạng năm học (year)' });
      }
      academicYear = year;
      const semesters = await prisma.semester.findMany({ where: { academicYear: year }, select: { id: true } });
      semesterIds = semesters.map(s => s.id);
    }

    if (semesterIds.length === 0) {
      return res.json({ details: [], total: 0 });
    }

    const lessonAmount = await getLessonCoefficient(academicYear);
    const degreeCoeff = await getDegreeCoefficient(academicYear, me.degree.type as DegreeTypeEnum);

    const classSections = await prisma.classSection.findMany({
      where: {
        semesterId: { in: semesterIds },
        assignedTeacherId: me.id,
      },
      include: {
        course: { include: { department: true } },
        semester: true,
      },
    });

    // Note: không có dữ liệu lịch theo tháng -> nếu mode=month, lọc theo tháng của ngày bắt đầu/kết thúc học kỳ
    let filtered = classSections;
    if (mode === 'month' && month) {
      const monthNum = parseInt(month as string, 10);
      filtered = classSections.filter(cs => {
        const start = new Date(cs.semester.startDate as any);
        const end = new Date(cs.semester.endDate as any);
        return start.getMonth() + 1 <= monthNum && end.getMonth() + 1 >= monthNum;
      });
    }

    let total = 0;
    const details = await Promise.all(filtered.map(async (cs) => {
      const studentCount = cs.maxStudents || 1;
      const classCoeff = await getClassCoefficient(academicYear, studentCount);
      const hours = cs.course.totalHours;
      const subtotal = hours * lessonAmount * degreeCoeff * classCoeff;
      total += subtotal;
      return {
        classSectionId: cs.id,
        code: cs.code,
        name: cs.name,
        courseName: cs.course.name,
        department: cs.course.department.fullName,
        academicYear: cs.semester.academicYear,
        semesterName: cs.semester.name,
        totalHours: hours,
        lessonAmount,
        degreeCoeff,
        classCoeff,
        subtotal,
      };
    }));

    res.json({ total, details });
  } catch (error: any) {
    console.error('Error getting personal teacher salary:', error.message);
    res.status(500).json({ message: 'Lỗi server khi lấy báo cáo tiền lương cá nhân.', error: error.message });
  }
};
