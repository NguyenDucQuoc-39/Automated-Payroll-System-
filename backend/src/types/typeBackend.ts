import { Role, Gender, DegreeTypeEnum } from '@prisma/client';

export interface UserPayload {
  id: string;
  email: string;
  role: Role;
}

export interface Degree {
  id: string;
  orderNumber: number;
  type: DegreeTypeEnum; // Sử dụng enum từ Prisma
  fullName: string;
  shortName: string;
  createdAt: Date; // Dùng Date thay vì string để dễ làm việc với Date objects
  updatedAt: Date; // Dùng Date thay vì string
}

export interface CreateDegreeInput {
  orderNumber: number; // Đảm bảo có orderNumber
  type: DegreeTypeEnum; // Sử dụng enum từ Prisma
  fullName: string;
  shortName: string;
}

export interface UpdateDegreeInput extends Partial<CreateDegreeInput> {}

export interface CreateDepartmentInput {
  code: string;
  shortName: string;
  fullName: string;
  office: string;
  headId?: string | null;
}

export interface UpdateDepartmentInput extends Partial<CreateDepartmentInput> {
  code?: string;
  shortName?: string;
  fullName?: string;
  office?: string;
  headId?: string | null; 
}

export interface CreateTeacherInput {
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  office: string;
  email: string;
  password: string;
  degreeId: string;
  departmentId: string;
  isHead?: boolean;
  role?: Role;
  phone: string;
  birthDate: string | Date;
}

export interface UpdateTeacherInput {
  firstName?: string;
  lastName?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  office?: string;
  email?: string;
  password?: string;
  degreeId?: string;
  departmentId?: string;
  isHead?: boolean;
  role?: Role;
  phone?: string;
  birthDate?: string | Date;
}

export interface Semester {
  id: string;
  orderNumber: number;
  name: string;
  academicYear: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSemesterInput {
  orderNumber: number;
  name: string;
  academicYear: string;
  startDate: string; // ISO string (YYYY-MM-DD)
  endDate: string;   // ISO string (YYYY-MM-DD)
}

export interface UpdateSemesterInput {
  name?: string;
  academicYear?: string;
  startDate?: string;
  endDate?: string;
}

// Interfaces for Course
export interface Course {
  id: string;
  code: string;
  name: string;
  credit: number;
  totalHours: number;
  departmentId: string;
  department: {
    id: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseInput {
  code: string;
  name: string;
  credit: number;
  departmentId: string;
}

export interface UpdateCourseInput extends Partial<CreateCourseInput> {}

// NEW INTERFACES FOR CLASS SECTION
export interface ClassSection {
  id: string;
  code: string;
  name: string; // Tên lớp học phần
  semesterId: string;
  semester: {
    id: string;
    name: string;
    academicYear: string;
  };
  courseId: string;
  course: {
    id: string;
    code: string;
    name: string; // Tên học phần
    departmentId: string;
    department: {
      id: string;
      fullName: string;
    };
  };
  maxStudents?: number | null; // mới thêm null
  assignedTeacherId?: string | null;
  assignedTeacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassSectionInput {
  code: string;
  name: string; // Tên lớp học phần
  semesterId: string;
  courseId: string;
  maxStudents?: number;
  assignedTeacherId?: string | null; // Có thể gán luôn khi tạo
  status?: string;
}

export interface UpdateClassSectionInput extends Partial<CreateClassSectionInput> {}

export interface CreateUserInput {
  email: string;
  password: string;
  role: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface StatisticsFilters {
  gender?: Gender;
  departmentId?: string;
  degreeId?: string;
} 