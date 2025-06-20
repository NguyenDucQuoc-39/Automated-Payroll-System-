// import { Role, Gender } from "@prisma/client";

// Định nghĩa thủ công các kiểu Role và Gender để frontend không phụ thuộc vào @prisma/client
export type Role = 'ADMIN' | 'ACCOUNTANT' | 'DEPARTMENT_HEAD' | 'TEACHER';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface User {
  id: string;
  email: string;
  role: Role;
}

// Định nghĩa kiểu cho dropdown/form input (tiếng Việt)
export type FrontendFormDegreeType = 'Thạc sĩ' | 'Tiến sĩ' | 'Phó Giáo Sư' | 'Giáo Sư';

// Định nghĩa kiểu cho dữ liệu nhận được từ backend (enum string values từ Prisma)
// Các giá trị này phải khớp chính xác với tên enum trong schema.prisma của backend (ví dụ: MASTER, DOCTOR)
export type BackendDegreeType = 'MASTER' | 'DOCTOR' | 'ASSOCIATE_PROFESSOR' | 'PROFESSOR';

export interface Degree {
  id: string;
  orderNumber: number;
  type: BackendDegreeType;
  fullName: string;
  shortName: string;
  createdAt: string;
  updatedAt: string;
}
export interface CreateDegreeInput {
  orderNumber: number;
  type: FrontendFormDegreeType; // Sử dụng DegreeType đã định nghĩa
  fullName: string;
  shortName: string;
}

export interface UpdateDegreeInput {
  orderNumber?: number;
  type?: FrontendFormDegreeType;
  fullName?: string;
  shortName?: string;
}

export interface Department {
  id: string;
  code: string;
  shortName: string;
  fullName: string;
  office: string;
  headId?: string | null; // mới thêm dòng này
  head?: Teacher | null; //thêm null vào dòng này
  teachers: Teacher[];
  createdAt: string;
  updatedAt: string;
}
//Mới thêm dòng này
export interface CreateDepartmentInput {
  code: string;
  shortName: string;
  fullName: string;
  office: string;
  headId?: string | null;
}
//Mới thêm dòng này
export interface UpdateDepartmentInput extends Partial<CreateDepartmentInput> {
  code?: string;
  shortName?: string;
  fullName?: string;
  office?: string;
  headId?: string | null;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  office: string;
  email: string;
  departmentId: string; //thêm dòng này
  degreeId: string; //thêm dòng này
  userId: string; //thêm dòng này
  degree: Degree; 
  department: Department; 
  isHead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherInput {
  firstName: string;
  lastName: string;
  gender: Gender;
  office: string;
  email: string;
  password?: string; // Optional for import, required for direct creation
  degreeId: string;
  departmentId: string;
  role?: Role; // Allow specifying role, defaults to TEACHER
}

export interface UpdateTeacherInput extends Partial<CreateTeacherInput> {
  // No password here for update as it's handled separately
}

export interface TeacherStatistics {
  total: number;
  byGender: {
    MALE: number;
    FEMALE: number;
    OTHER: number;
  };
  byDepartment: Record<string, number>;
  byDegree: Record<string, number>;
}

export interface Semester {
  id: string;
  orderNumber: number;
  name: string;
  academicYear: string;
  startDate: string; // ISO string (e.g., "2023-09-01T00:00:00.000Z")
  endDate: string;   // ISO string
  createdAt: string;
  updatedAt: string;
}

export interface CreateSemesterInput {
  orderNumber: number;
  name: string;
  academicYear: string;
  startDate: string; // ISO string (YYYY-MM-DD)
  endDate: string;   // ISO string (YYYY-MM-DD)
}

export interface UpdateSemesterInput extends Partial<CreateSemesterInput> {
  // orderNumber?: number; // Vẫn để optional
  // name?: string;
  academicYear?: string; // Vẫn để optional
  startDate?: string;
  endDate?: string;
}

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

//Mới thêm dòng này
export interface CreateCourseInput {
  code: string;
  name: string;
  credit: number;
  departmentId: string;
}
export interface UpdateCourseInput extends Partial<CreateCourseInput> {}


// Định nghĩa ClassSection (Quan trọng để khớp với backend)
export interface ClassSection {
//   id: string;
//   code: string;
//   name: string; // Tên lớp học phần
//   semesterId: string;
//   courseId: string;
//   maxStudents?: number | null; // Có thể là null từ backend
//   assignedTeacherId?: string | null;
//   status: string;
//   createdAt: string;
//   updatedAt: string;
//   // Thêm các quan hệ nếu bạn muốn include chúng khi fetch dữ liệu ClassSection
//   semester?: {
//     id: string;
//     name: string;
//     academicYear: string;
//     orderNumber?: number; // Optional based on backend include
//   };
//   course?: {
//     id: string;
//     code: string;
//     name: string;
//     departmentId: string;
//     department?: { // Department in Course
//       id: string;
//       fullName: string;
//     };
//   };
//   assignedTeacher?: {
//     id: string;
//     firstName: string;
//     lastName: string;
//     email: string;
//   } | null;
// }

  id: string;
  code: string;
  name: string; // Tên lớp học phần
  semesterId: string;
  semester: {
    id: string;
    name: string;
    academicYear: string;
    orderNumber?: number;
  };
  courseId: string;
  course: {
    id: string;
    code: string;
    name: string; // Tên học phần
    departmentId: string;
    department: { // Department in Course
      id: string;
      fullName: string;
    };
  };
  maxStudents?: number | null; // Có thể là null từ backend
  assignedTeacherId?: string | null;
  assignedTeacher?: { // Detailed teacher info
    id: string;
    firstName: string;
    lastName: string;
    fullName: string; // Add fullName for display
    email: string;
  } | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

//Mới thêm dòng này
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

// mới thêm
// Backend Types for API Responses (e.g., for pagination)
export interface DepartmentApiResponse {
  departments: Department[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CourseApiResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClassSectionApiResponse {
  classSections: ClassSection[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TeacherApiResponse {
  teachers: Teacher[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// NEW: Interfaces for Class Section Statistics
export interface ClassSectionStatsByDepartment {
  department: string; // Full name of the department
  classSectionCount: number;
  totalMaxStudents: number;
}

export interface ClassSectionStatsBySemester {
  semester: string; // e.g., "Kì 1 (2023-2024)"
  classSectionCount: number;
}

export interface ClassSectionStatisticsData {
  byDepartment: ClassSectionStatsByDepartment[];
  bySemester: ClassSectionStatsBySemester[];
}

// Import/Export interfaces for backend (used in controllers)
export interface ImportResult {
  message: string;
  successCount: number;
  errorCount: number;
  errors: string[];
}
//mới thêm dòng này

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
} 