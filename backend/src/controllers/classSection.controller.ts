// import { Request, Response } from 'express';
// import { PrismaClient, Prisma } from '@prisma/client';
// import { CreateClassSectionInput, UpdateClassSectionInput } from '../types/typeBackend'; // Giả sử bạn có các loại này

// const prisma = new PrismaClient();

// // Hàm hỗ trợ để tạo mã lớp học phần (có thể đặt trong utils/classSectionUtils.ts)
// // Nếu bạn chưa có, hãy thêm nó.
// const generateClassSectionCode = (courseCode: string, sectionNumber: number): string => {
//   // Định dạng sectionNumber thành 2 chữ số (ví dụ: 01, 02)
//   const formattedSectionNumber = String(sectionNumber).padStart(2, '0');
//   return `${courseCode}-${formattedSectionNumber}`;
// };


// // Hàm tạo lớp học phần
// export const createClassSection = async (req: Request, res: Response) => {
//   try {
//     const { code, name, semesterId, courseId, maxStudents, assignedTeacherId, status }: CreateClassSectionInput = req.body;

//     if (!code || !semesterId || !courseId) {
//       return res.status(400).json({ message: 'Mã lớp học phần, học kỳ và học phần là bắt buộc.' });
//     }

//     if (maxStudents !== undefined && maxStudents !== null && maxStudents <= 0) {
//       return res.status(400).json({ message: 'Số lượng sinh viên tối đa phải lớn hơn 0 nếu được chỉ định.' });
//     }

//     // Lấy thông tin học phần để tạo tên lớp học phần tự động nếu 'name' không được cung cấp
//     const course = await prisma.course.findUnique({
//       where: { id: courseId },
//       select: { name: true, code: true, departmentId: true } // Lấy departmentId
//     });
//     if (!course) {
//       return res.status(400).json({ message: 'Học phần không tồn tại.' });
//     }

//     // Kiểm tra trùng lặp mã lớp học phần trong cùng một học kỳ
//     const existingClassSection = await prisma.classSection.findFirst({
//         where: {
//             code: code,
//             semesterId: semesterId,
//         }
//     });

//     if (existingClassSection) {
//         return res.status(409).json({ message: `Mã lớp học phần '${code}' đã tồn tại trong học kỳ này.` });
//     }

//     // Tên lớp học phần: "Tên Học Phần - Mã Lớp Học Phần" nếu không được cung cấp
//     const finalName = name || `${course.name}-${code}`;

//     const newClassSection = await prisma.classSection.create({
//       data: {
//         code,
//         name: finalName,
//         semesterId,
//         courseId,
//         maxStudents: maxStudents !== undefined && maxStudents !== null ? maxStudents : null, // Lưu null nếu không nhập
//         assignedTeacherId: assignedTeacherId || null, // Lưu null nếu không nhập
//         status: status || 'CREATED',
//       },
//       include: {
//         semester: true,
//         course: {
//           include: {
//             department: true
//           }
//         },
//         assignedTeacher: true
//       }
//     });

//     res.status(201).json(newClassSection);
//   } catch (error: any) {
//     console.error('Lỗi khi tạo lớp học phần:', error);
//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//         if (error.code === 'P2003') { // Foreign key constraint failed
//             if (error.meta?.field_name === 'semesterId') {
//                 return res.status(400).json({ message: 'Học kỳ không tồn tại.' });
//             }
//             if (error.meta?.field_name === 'courseId') {
//                 return res.status(400).json({ message: 'Học phần không tồn tại.' });
//             }
//             if (error.meta?.field_name === 'assignedTeacherId') {
//                 return res.status(400).json({ message: 'Giảng viên không tồn tại.' });
//             }
//         }
//     }
//     res.status(500).json({ message: 'Lỗi server khi tạo lớp học phần.', error: error.message });
//   }
// };

// // Cập nhật lớp học phần
// export const updateClassSection = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { code, name, semesterId, courseId, maxStudents, assignedTeacherId, status }: UpdateClassSectionInput = req.body;

//     if (!code || !semesterId || !courseId) {
//         return res.status(400).json({ message: 'Mã lớp học phần, học kỳ và học phần là bắt buộc.' });
//     }

//     if (maxStudents !== undefined && maxStudents !== null && maxStudents <= 0) {
//       return res.status(400).json({ message: 'Số lượng sinh viên tối đa phải lớn hơn 0 nếu được chỉ định.' });
//     }

//     // Lấy thông tin học phần để tạo tên lớp học phần tự động nếu 'name' không được cung cấp
//     const course = await prisma.course.findUnique({
//       where: { id: courseId },
//       select: { name: true, code: true, departmentId: true }
//     });
//     if (!course) {
//       return res.status(400).json({ message: 'Học phần không tồn tại.' });
//     }

//     // Kiểm tra trùng lặp mã lớp học phần trong cùng một học kỳ (trừ lớp học phần đang chỉnh sửa)
//     const existingClassSection = await prisma.classSection.findFirst({
//         where: {
//             code: code,
//             semesterId: semesterId,
//             NOT: {
//                 id: id
//             }
//         }
//     });

//     if (existingClassSection) {
//         return res.status(409).json({ message: `Mã lớp học phần '${code}' đã tồn tại trong học kỳ này.` });
//     }

//     const finalName = name || `${course.name}-${code}`;

//     const updatedClassSection = await prisma.classSection.update({
//       where: { id },
//       data: {
//         code,
//         name: finalName,
//         semesterId,
//         courseId,
//         maxStudents: maxStudents !== undefined && maxStudents !== null ? maxStudents : null,
//         assignedTeacherId: assignedTeacherId || null,
//         status,
//       },
//       include: {
//         semester: true,
//         course: {
//           include: {
//             department: true
//           }
//         },
//         assignedTeacher: true
//       }
//     });

//     res.status(200).json(updatedClassSection);
//   } catch (error: any) {
//     console.error('Lỗi khi cập nhật lớp học phần:', error);
//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//         if (error.code === 'P2025') { // Record not found
//             return res.status(404).json({ message: 'Lớp học phần không tìm thấy.' });
//         }
//         if (error.code === 'P2003') { // Foreign key constraint failed
//             if (error.meta?.field_name === 'semesterId') {
//                 return res.status(400).json({ message: 'Học kỳ không tồn tại.' });
//             }
//             if (error.meta?.field_name === 'courseId') {
//                 return res.status(400).json({ message: 'Học phần không tồn tại.' });
//             }
//             if (error.meta?.field_name === 'assignedTeacherId') {
//                 return res.status(400).json({ message: 'Giảng viên không tồn tại.' });
//             }
//         }
//     }
//     res.status(500).json({ message: 'Lỗi server khi cập nhật lớp học phần.', error: error.message });
//   }
// };

// // Xóa lớp học phần
// export const deleteClassSection = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     await prisma.classSection.delete({
//       where: { id },
//     });
//     res.status(204).send();
//   } catch (error: any) {
//     console.error('Lỗi khi xóa lớp học phần:', error);
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
//       return res.status(404).json({ message: 'Lớp học phần không tìm thấy.' });
//     }
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
//         return res.status(400).json({ message: 'Không thể xóa lớp học phần này vì nó có sinh viên đăng ký hoặc thời khóa biểu.' });
//     }
//     res.status(500).json({ message: 'Lỗi server khi xóa lớp học phần.', error: error.message });
//   }
// };

// // Lấy tất cả lớp học phần (có thể có filter và pagination)
// export const getAllClassSections = async (req: Request, res: Response) => {
//   try {
//     const { page = '1', pageSize = '10', semesterId, courseId, departmentId, status, search } = req.query;
//     const pageNumber = parseInt(page as string);
//     const pageSizeNumber = parseInt(pageSize as string);
//     const skip = (pageNumber - 1) * pageSizeNumber;

//     const where: Prisma.ClassSectionWhereInput = {};

//     if (semesterId) {
//       where.semesterId = semesterId as string;
//     }
//     if (courseId) {
//       where.courseId = courseId as string;
//     }
//     if (departmentId) {
//         where.course = {
//             departmentId: departmentId as string
//         };
//     }
//     if (status) {
//       where.status = status as string;
//     }
//     if (search) {
//       where.OR = [
//         { code: { contains: search as string, mode: 'insensitive' } },
//         { name: { contains: search as string, mode: 'insensitive' } },
//         { course: { name: { contains: search as string, mode: 'insensitive' } } },
//         { assignedTeacher: { firstName: { contains: search as string, mode: 'insensitive' } } },
//         { assignedTeacher: { lastName: { contains: search as string, mode: 'insensitive' } } },
//       ];
//     }


//     const classSections = await prisma.classSection.findMany({
//       where,
//       skip,
//       take: pageSizeNumber,
//       include: {
//         semester: true,
//         course: {
//           include: {
//             department: true,
//           },
//         },
//         assignedTeacher: true,
//       },
//       orderBy: {
//         createdAt: 'desc', // Hoặc sắp xếp theo academicYear, name, v.v.
//       },
//     });

//     const totalCount = await prisma.classSection.count({ where });

//     res.status(200).json({ classSections, totalCount });
//   } catch (error: any) {
//     console.error('Lỗi khi lấy danh sách lớp học phần:', error);
//     res.status(500).json({ message: 'Lỗi server khi lấy danh sách lớp học phần.', error: error.message });
//   }
// };

// // Lấy lớp học phần theo ID
// export const getClassSectionById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const classSection = await prisma.classSection.findUnique({
//       where: { id },
//       include: {
//         semester: true,
//         course: {
//           include: {
//             department: true,
//           },
//         },
//         assignedTeacher: true,
//       },
//     });

//     if (!classSection) {
//       return res.status(404).json({ message: 'Lớp học phần không tìm thấy.' });
//     }
//     res.status(200).json(classSection);
//   } catch (error: any) {
//     console.error('Lỗi khi lấy lớp học phần theo ID:', error);
//     res.status(500).json({ message: 'Lỗi server khi lấy lớp học phần.', error: error.message });
//   }
// };


// // === Cập nhật hoặc thêm hàm batchCreateClassSections ===
// interface BatchCourseCreation {
//   courseId: string;
//   numberOfSections: number;
// }

// interface BatchCreateClassSectionPayload {
//   semesterId: string;
//   departmentId: string; // Thêm trường departmentId
//   totalStudents?: number; // Thêm trường totalStudents (có thể là optional)
//   coursesToCreate: BatchCourseCreation[];
// }

// export const batchCreateClassSections = async (req: Request, res: Response) => {
//   try {
//     const { semesterId, departmentId, totalStudents, coursesToCreate }: BatchCreateClassSectionPayload = req.body;
//     const errors: { courseId?: string; message: string }[] = [];
//     const sectionsToCreate: Prisma.ClassSectionCreateManyInput[] = [];

//     if (!semesterId || !departmentId || !coursesToCreate || coursesToCreate.length === 0) {
//       return res.status(400).json({ message: 'Missing required fields: semesterId, departmentId, and coursesToCreate.' });
//     }

//     // Kiểm tra sự tồn tại của học kỳ và khoa
//     const semester = await prisma.semester.findUnique({ where: { id: semesterId } });
//     if (!semester) {
//       return res.status(404).json({ message: 'Học kỳ không tồn tại.' });
//     }
//     const department = await prisma.department.findUnique({ where: { id: departmentId } });
//     if (!department) {
//       return res.status(404).json({ message: 'Khoa không tồn tại.' });
//     }

//     let studentsPerSection: number | undefined;
//     if (totalStudents !== undefined && totalStudents !== null && totalStudents > 0) {
//       // Lọc ra các học phần hợp lệ (có số lượng lớp > 0)
//       const validCoursesToCreate = coursesToCreate.filter(item => item.numberOfSections > 0);
//       const totalSectionsCount = validCoursesToCreate.reduce((sum, item) => sum + item.numberOfSections, 0);

//       if (totalSectionsCount === 0) {
//          errors.push({ message: 'Không có lớp nào được chọn để tạo khi số lượng sinh viên được cung cấp.' });
//       } else {
//         studentsPerSection = Math.floor(totalStudents / totalSectionsCount);
//       }
//     }


//     for (const { courseId, numberOfSections } of coursesToCreate) {
//       if (numberOfSections <= 0) {
//         continue; // Bỏ qua nếu số lượng lớp là 0 hoặc âm
//       }

//       const course = await prisma.course.findUnique({
//         where: { id: courseId },
//         include: { department: true }
//       });

//       if (!course) {
//         errors.push({ courseId, message: `Học phần với ID ${courseId} không tồn tại.` });
//         continue;
//       }

//       // Đảm bảo học phần thuộc khoa đã chọn
//       if (course.departmentId !== departmentId) {
//         errors.push({ courseId, message: `Học phần "${course.name}" (Mã: ${course.code}) không thuộc khoa đã chọn.` });
//         continue;
//       }

//       // Đếm số lớp học phần hiện có của học phần này trong học kỳ này để tạo mã duy nhất
//       const existingSectionsForCourseInSemester = await prisma.classSection.count({
//         where: {
//           courseId: courseId,
//           semesterId: semesterId,
//         },
//       });

//       for (let i = 0; i < numberOfSections; i++) {
//         const sectionNumber = existingSectionsForCourseInSemester + i + 1;
//         const code = generateClassSectionCode(course.code, sectionNumber); // Sử dụng hàm generateClassSectionCode
//         const name = `${course.name}-${code}`; // Tên lớp học phần

//         // Kiểm tra xem mã lớp học phần đã tồn tại chưa (trong trường hợp race condition hoặc đã có từ trước)
//         const codeExists = sectionsToCreate.some(s => s.code === code && s.semesterId === semesterId);
//         if (codeExists) {
//             errors.push({ courseId, message: `Mã lớp học phần '${code}' (tự động tạo) đã bị trùng lặp. Vui lòng thử lại.` });
//             continue;
//         }

//         sectionsToCreate.push({
//           code,
//           name,
//           semesterId,
//           courseId,
//           maxStudents: studentsPerSection !== undefined ? studentsPerSection : null, // Gán số lượng sinh viên đã tính
//           status: 'CREATED', // Mặc định là CREATED
//         });
//       }
//     }

//     if (sectionsToCreate.length === 0) {
//         // Chỉ trả về lỗi 400 nếu không có lớp nào được tạo VÀ có lỗi từ validation
//         if (errors.length > 0) {
//             return res.status(400).json({
//                 message: 'Không có lớp học phần nào hợp lệ để tạo.',
//                 errors: errors,
//             });
//         }
//         // Nếu không có lớp nào được tạo và cũng không có lỗi, tức là user không chọn gì cả, trả về thành công 0 lớp
//         return res.status(200).json({
//             message: 'Không có lớp học phần nào được chọn để tạo.',
//             createdCount: 0,
//             errors: [],
//         });
//     }

//     // Sử dụng createMany để tạo nhiều bản ghi cùng lúc
//     const result = await prisma.classSection.createMany({
//       data: sectionsToCreate,
//       skipDuplicates: true, // Prisma sẽ bỏ qua nếu có trùng lặp code + semesterId
//     });

//     const successCount = result.count;
//     const finalMessage = successCount > 0
//         ? `Đã tạo thành công ${successCount} lớp học phần.`
//         : 'Không có lớp học phần nào được tạo.';

//     if (errors.length > 0) {
//       return res.status(207).json({ // 207 Multi-Status
//         message: finalMessage + ' Có một số lỗi xảy ra.',
//         createdCount: successCount,
//         errors: errors,
//       });
//     }

//     res.status(201).json({
//       message: finalMessage,
//       createdCount: successCount,
//       // Không trả về chi tiết lớp học phần đã tạo từ createMany, chỉ trả về số lượng
//     });

//   } catch (error: any) {
//     console.error('Error in batchCreateClassSections:', error);
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
//         return res.status(409).json({ message: 'Một hoặc nhiều mã lớp học phần tự động tạo bị trùng. Vui lòng kiểm tra lại hoặc thử lại.', errors: error });
//     }
//     res.status(500).json({ message: 'Lỗi server khi tạo hàng loạt lớp học phần.', error: error.message });
//   }
// };

import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { CreateClassSectionInput, UpdateClassSectionInput } from '../types/typeBackend'; // Giả sử bạn có các loại này

const prisma = new PrismaClient();

// Hàm hỗ trợ để tạo mã lớp học phần (có thể đặt trong utils/classSectionUtils.ts)
// Nếu bạn chưa có, hãy thêm nó.
const generateClassSectionCode = (courseCode: string, sectionNumber: number): string => {
  // Định dạng sectionNumber thành 2 chữ số (ví dụ: 01, 02)
  const formattedSectionNumber = String(sectionNumber).padStart(3, '0'); // Changed to 3 digits for "001"
  return `${courseCode}-${formattedSectionNumber}`;
};

// Hàm tạo tên lớp học phần
const generateClassSectionName = (courseName: string, classCode: string, sectionNumber: number): string => {
    const formattedSectionNumber = String(sectionNumber).padStart(3, '0');
    return `${courseName} - ${classCode} - ${formattedSectionNumber}`;
};

// Hàm tạo lớp học phần
export const createClassSection = async (req: Request, res: Response) => {
  try {
    const { code, semesterId, courseId, maxStudents, assignedTeacherId, status }: CreateClassSectionInput = req.body;

    if (!code || !semesterId || !courseId) {
      return res.status(400).json({ message: 'Mã lớp học phần, học kỳ và học phần là bắt buộc.' });
    }

    if (maxStudents !== undefined && maxStudents !== null && maxStudents <= 0) {
      return res.status(400).json({ message: 'Số lượng sinh viên tối đa phải lớn hơn 0 nếu được chỉ định.' });
    }

    // Lấy thông tin học phần để tạo tên
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { name: true, code: true }, // Select both name and code
    });

    if (!course) {
        return res.status(404).json({ message: 'Không tìm thấy học phần.' });
    }

    // Kiểm tra trùng lặp: code + semesterId phải là duy nhất
    const existingClassSection = await prisma.classSection.findFirst({
        where: {
            code: { equals: code, mode: 'insensitive' },
            semesterId: semesterId,
        },
    });

    if (existingClassSection) {
        return res.status(409).json({ message: `Mã lớp học phần "${code}" đã tồn tại trong học kỳ này.` });
    }

    // Tìm số thứ tự tiếp theo cho tên lớp học phần dựa trên courseId và semesterId
    const latestClassSection = await prisma.classSection.findFirst({
        where: {
            courseId: courseId,
            semesterId: semesterId,
        },
        orderBy: {
            createdAt: 'desc', // Hoặc một trường thứ tự khác nếu có
        },
    });

    let sectionNumber = 1;
    if (latestClassSection && latestClassSection.name) {
        // Cố gắng phân tích số cuối cùng từ tên hiện có
        const nameParts = latestClassSection.name.split('-');
        const lastPart = nameParts[nameParts.length - 1].trim();
        const existingSectionNum = parseInt(lastPart, 10);
        if (!isNaN(existingSectionNum)) {
            sectionNumber = existingSectionNum + 1;
        }
    }

    // Generate the full name for the class section
    const generatedName = generateClassSectionName(course.name, code, sectionNumber);


    const classSection = await prisma.classSection.create({
      data: {
        code,
        name: generatedName, // Use the generated name
        semesterId,
        courseId,
        maxStudents: maxStudents === undefined || maxStudents === null ? null : Number(maxStudents),
        assignedTeacherId: assignedTeacherId || null,
        status: status || 'Sắp Diễn Ra', // Default status if not provided
      },
    });

    res.status(201).json(classSection);
  } catch (error: any) {
    console.error('Error creating class section:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Đây là lỗi khi một trường unique bị trùng. Trong trường hợp này, `code` và `semesterId`
        return res.status(409).json({ message: 'Mã lớp học phần đã tồn tại trong học kỳ này.' });
      }
      if (error.code === 'P2003') {
        // Foreign key constraint failed
        return res.status(400).json({ message: 'Dữ liệu liên quan không tồn tại (Học kỳ, Học phần, Giảng viên).' });
      }
    }
    res.status(500).json({ message: 'Lỗi server khi tạo lớp học phần.', error: error.message });
  }
};


// Lấy tất cả lớp học phần (có phân trang, lọc, tìm kiếm và include relations)
export const getAllClassSections = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', semesterId, courseId, departmentId, teacherId } = req.query;
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    const where: Prisma.ClassSectionWhereInput = {
      OR: [
        { code: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } },
        {
          course: {
            name: { contains: search as string, mode: 'insensitive' },
          },
        },
        {
          semester: {
            name: { contains: search as string, mode: 'insensitive' },
          },
        },
      ],
    };

    // Thêm điều kiện lọc theo semesterId nếu có
    if (semesterId) {
      where.semesterId = semesterId as string;
    }

    // Thêm điều kiện lọc theo departmentId nếu có
    if (departmentId) {
      where.course = {
        departmentId: departmentId as string,
      };
    }
    
    if (courseId) {
      where.courseId = courseId as string;
    }
    if (teacherId) {
      where.assignedTeacherId = teacherId as string;
    }

    const classSections = await prisma.classSection.findMany({
      where,
      skip,
      take: limitNumber,
      include: {
        semester: {
          select: { id: true, name: true, academicYear: true, orderNumber: true },
        },
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            departmentId: true,
            department: {
              select: { id: true, fullName: true },
            },
          },
        },
        assignedTeacher: {
          select: { id: true, firstName: true, lastName: true, email: true, gender: true }, // Thêm fullName
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalClassSections = await prisma.classSection.count({ where });
    const totalPages = Math.ceil(totalClassSections / limitNumber);

    res.status(200).json({
      classSections,
      total: totalClassSections,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
    });
  } catch (error: any) {
    console.error('Error fetching class sections:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách lớp học phần.', error: error.message });
  }
};

// Lấy lớp học phần theo ID
export const getClassSectionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const classSection = await prisma.classSection.findUnique({
      where: { id },
      include: {
        semester: true,
        course: {
          include: {
            department: true,
          },
        },
        assignedTeacher: true,
      },
    });
    if (!classSection) {
      return res.status(404).json({ message: 'Không tìm thấy lớp học phần.' });
    }
    res.status(200).json(classSection);
  } catch (error: any) {
    console.error('Error fetching class section by ID:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin lớp học phần.', error: error.message });
  }
};

// Cập nhật lớp học phần
export const updateClassSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, name, semesterId, courseId, maxStudents, assignedTeacherId, status }: UpdateClassSectionInput = req.body;

    if (maxStudents !== undefined && maxStudents !== null && maxStudents <= 0) {
      return res.status(400).json({ message: 'Số lượng sinh viên tối đa phải lớn hơn 0 nếu được chỉ định.' });
    }

    // Kiểm tra trùng lặp khi cập nhật: mã lớp học phần và học kỳ phải là duy nhất, ngoại trừ chính nó
    const existingClassSection = await prisma.classSection.findFirst({
        where: {
            code: { equals: code, mode: 'insensitive' },
            semesterId: semesterId,
            id: { not: id }, // Exclude current class section
        },
    });

    if (existingClassSection) {
        return res.status(409).json({ message: `Mã lớp học phần "${code}" đã tồn tại trong học kỳ này cho một lớp khác.` });
    }

    // Lấy thông tin học phần để tạo tên nếu `name` không được cung cấp hoặc cần tự động cập nhật
    let finalName = name;
    if (!finalName) { // If name is not provided or explicitly empty, try to regenerate
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { name: true, code: true },
        });

        if (course) {
            // Logic để tái tạo tên lớp học phần tương tự như tạo mới,
            // nhưng cần đảm bảo số thứ tự không bị thay đổi nếu không có lý do.
            // Để đơn giản, nếu frontend gửi `name` rỗng, ta có thể tạo lại.
            // Tuy nhiên, nếu frontend đã gửi một `name` (thường là khi chỉnh sửa và giữ nguyên),
            // ta sẽ sử dụng `name` đó.

            // Để tránh phức tạp quá mức, ta sẽ dựa vào frontend để gửi tên hợp lệ khi chỉnh sửa.
            // Nếu `name` được gửi là rỗng hoặc không hợp lệ, backend sẽ không tự tạo lại số "001" nếu không có logic cụ thể.
            // Cho mục đích này, tôi giả định `name` sẽ được gửi từ frontend, hoặc nếu không có, sẽ là tên học phần + code.
            finalName = `${course.name} - ${code}`;
            // Điều chỉnh: Nếu người dùng không sửa `name`, ta sẽ giữ lại `name` cũ từ `editingClassSection` trên frontend.
            // Nếu người dùng thay đổi `code` hoặc `courseId` trên frontend, `name` sẽ tự động cập nhật trên frontend.
            // Do đó, `name` nhận được ở đây nên là `name` đã được chuẩn bị bởi frontend.
        }
    }


    const updatedClassSection = await prisma.classSection.update({
      where: { id },
      data: {
        code,
        name: finalName, // Use the provided or regenerated name
        semesterId,
        courseId,
        maxStudents: maxStudents === undefined || maxStudents === null ? null : Number(maxStudents),
        assignedTeacherId: assignedTeacherId || null,
        status: status || 'Sắp Diễn Ra',
      },
    });
    res.status(200).json(updatedClassSection);
  } catch (error: any) {
    console.error('Error updating class section:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'Mã lớp học phần đã tồn tại trong học kỳ này cho một lớp khác.' });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Không tìm thấy lớp học phần để cập nhật.' });
      }
      if (error.code === 'P2003') {
        return res.status(400).json({ message: 'Dữ liệu liên quan không tồn tại (Học kỳ, Học phần, Giảng viên).' });
      }
    }
    res.status(500).json({ message: 'Lỗi server khi cập nhật lớp học phần.', error: error.message });
  }
};

// Xóa lớp học phần
export const deleteClassSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const classSection = await prisma.classSection.findUnique({
      where: { id },
      select: { assignedTeacherId: true },
    });
    if (!classSection) {
      return res.status(404).json({ message: 'Không tìm thấy lớp học phần.' });
    }
    if (classSection.assignedTeacherId) {
      return res.status(400).json({ message: 'Không thể xóa lớp học phần này vì nó đang được phân công cho giảng viên.' });
    }

    // Kiểm tra xem lớp học phần có đang được tham chiếu bởi các bản ghi khác không
    await prisma.classSection.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting class section:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Không tìm thấy lớp học phần để xóa.' });
    }
    // Handle foreign key constraint error if class section is referenced elsewhere
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        return res.status(400).json({ message: 'Không thể xóa lớp học phần này vì nó đang được tham chiếu bởi các bản ghi khác (ví dụ: đăng ký của sinh viên).' });
    }
    res.status(500).json({ message: 'Lỗi server khi xóa lớp học phần.', error: error.message });
  }
};


// Tạo hàng loạt lớp học phần
export const batchCreateClassSections = async (req: Request, res: Response) => {
  const { semesterId, departmentId, coursesToCreate, status } = req.body;
  const errors: string[] = [];
  let successCount = 0;

  if (!semesterId || !departmentId || !coursesToCreate || coursesToCreate.length === 0) {
      return res.status(400).json({ message: 'Vui lòng cung cấp Học kỳ, Khoa và danh sách học phần cần tạo.', errors: ['Dữ liệu đầu vào không hợp lệ.'] });
  }

  for (const item of coursesToCreate) {
      const { courseId, numberOfClasses, maxStudents } = item;

      if (!courseId || typeof numberOfClasses !== 'number' || numberOfClasses <= 0) {
          errors.push(`Dữ liệu không hợp lệ cho một học phần: courseId=${courseId}, numberOfClasses=${numberOfClasses}.`);
          continue;
      }

      // Lấy thông tin học phần để tạo tên
      const course = await prisma.course.findUnique({
          where: { id: courseId },
          select: { name: true, code: true },
      });

      if (!course) {
          errors.push(`Không tìm thấy học phần với ID: ${courseId}.`);
          continue;
      }

      // Lấy số thứ tự hiện tại lớn nhất cho các lớp học phần của học phần này trong học kỳ này
      // Để đảm bảo tính duy nhất, chúng ta cần tìm mã lớp học phần cao nhất đã được tạo cho học phần này trong học kỳ này.
      const existingClassSections = await prisma.classSection.findMany({
          where: {
              courseId: courseId,
              semesterId: semesterId,
          },
          select: { code: true },
      });

      let maxSectionNum = 0;
      for (const section of existingClassSections) {
          const codeParts = section.code.split('-');
          if (codeParts.length > 1) {
              const numPart = parseInt(codeParts[codeParts.length - 1], 10);
              if (!isNaN(numPart) && numPart > maxSectionNum) {
                  maxSectionNum = numPart;
              }
          }
      }

      for (let i = 1; i <= numberOfClasses; i++) {
          const currentSectionNum = maxSectionNum + i;
          const classCode = `${course.code}-${String(currentSectionNum).padStart(3, '0')}`;
          const className = `${course.name} - ${course.code} - ${String(currentSectionNum).padStart(3, '0')}`;


          try {
              // Kiểm tra trùng lặp trước khi tạo để tránh lỗi Prisma và cung cấp thông báo rõ ràng hơn
              const existing = await prisma.classSection.findFirst({
                  where: {
                      code: { equals: classCode, mode: 'insensitive' },
                      semesterId: semesterId,
                  },
              });

              if (existing) {
                  errors.push(`Lớp học phần "${className}" (Mã: ${classCode}) đã tồn tại trong học kỳ này và được bỏ qua.`);
                  continue; // Bỏ qua và không tạo lớp này
              }

              await prisma.classSection.create({
                  data: {
                      code: classCode,
                      name: className,
                      semesterId: semesterId,
                      courseId: courseId,
                      maxStudents: maxStudents !== undefined && maxStudents !== null && maxStudents > 0 ? Number(maxStudents) : null,
                      status: status || 'Sắp Diễn Ra',
                      // assignedTeacherId sẽ được gán sau nếu cần qua chỉnh sửa
                  },
              });
              successCount++;
          } catch (dbError: any) {
              console.error(`Backend ERROR: Lỗi khi tạo lớp học phần ${className} (Mã: ${classCode}):`, dbError);
              let errMsg = `Lỗi khi tạo lớp học phần "${className}" (Mã: ${classCode}).`;
              if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
                  if (dbError.code === 'P2002') {
                      errMsg = `Lớp học phần "${className}" (Mã: ${classCode}) đã tồn tại trong học kỳ này.`;
                  } else if (dbError.code === 'P2003') {
                      errMsg = `Dữ liệu liên quan không tồn tại cho lớp "${className}" (Mã: ${classCode}).`;
                  }
              }
              errors.push(errMsg);
          }
      }
  }

  const finalMessage = successCount > 0
      ? `Đã tạo thành công ${successCount} lớp học phần.`
      : 'Không có lớp học phần nào được tạo.';

  if (errors.length > 0) {
      return res.status(207).json({ // 207 Multi-Status
          message: finalMessage + ' Có một số lỗi xảy ra.',
          createdCount: successCount,
          errorCount: errors.length,
          errors: errors,
      });
  }

  res.status(201).json({
      message: finalMessage,
      createdCount: successCount,
      errorCount: 0,
      errors: [],
  });
};

// NEW: Hàm lấy thống kê lớp học phần
export const getClassSectionStatistics = async (req: Request, res: Response) => {
  try {
    // 1. Thống kê Số Lớp Học Phần của tất cả các Khoa, theo từng Khoa.
    const classSectionsByDepartment = await prisma.classSection.groupBy({
      by: ['courseId'],
      _count: {
        _all: true,
      },
      _sum: {
        maxStudents: true,
      },
    });

    const departmentStats: Record<string, { count: number; totalMaxStudents: number; fullName: string }> = {};
    for (const item of classSectionsByDepartment) {
      const course = await prisma.course.findUnique({
        where: { id: item.courseId },
        select: {
          department: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });
      if (course?.department) {
        const deptId = course.department.id;
        if (!departmentStats[deptId]) {
          departmentStats[deptId] = {
            count: 0,
            totalMaxStudents: 0,
            fullName: course.department.fullName,
          };
        }
        departmentStats[deptId].count += item._count._all;
        departmentStats[deptId].totalMaxStudents += item._sum.maxStudents || 0;
      }
    }

    const departmentChartData = Object.keys(departmentStats).map(deptId => ({
      department: departmentStats[deptId].fullName,
      classSectionCount: departmentStats[deptId].count,
      totalMaxStudents: departmentStats[deptId].totalMaxStudents,
    }));

    // 2. Thống kê Số Lớp Học Phần mở theo Năm Học, Kì Học.
    const classSectionsBySemester = await prisma.classSection.groupBy({
      by: ['semesterId'],
      _count: {
        _all: true,
      },
    });

    const semesterStats: Record<string, { count: number; academicYear: string; semesterName: string }> = {};
    for (const item of classSectionsBySemester) {
      const semester = await prisma.semester.findUnique({
        where: { id: item.semesterId },
        select: {
          id: true,
          name: true,
          academicYear: true,
        },
      });
      if (semester) {
        semesterStats[semester.id] = {
          count: item._count._all,
          academicYear: semester.academicYear,
          semesterName: semester.name,
        };
      }
    }

    const semesterChartData = Object.keys(semesterStats).map(semId => ({
      semester: `${semesterStats[semId].semesterName} (${semesterStats[semId].academicYear})`,
      classSectionCount: semesterStats[semId].count,
    }));

    // 3. Thống kê Tổng Số Sinh Viên của Học Phần đã mở của tất cả các Khoa, theo từng Khoa.
    // (This is covered by `totalMaxStudents` in `departmentChartData` above)

    res.status(200).json({
      byDepartment: departmentChartData,
      bySemester: semesterChartData,
    });

  } catch (error: any) {
    console.error('Error getting class section statistics:', error.message);
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê lớp học phần.', error: error.message });
  }
};