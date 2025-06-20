import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { CreateDepartmentInput, UpdateDepartmentInput } from '../types/typeBackend';
import * as XLSX from 'xlsx';
import fs from 'fs';

const prisma = new PrismaClient();

// Interface cho cấu trúc dữ liệu mong đợi từ mỗi hàng Excel
interface DepartmentRow {
  code: string;
  shortName: string;
  fullName: string;
  office: string;
  rowNum: number;
}

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const data: CreateDepartmentInput = req.body;
    const { code, shortName, fullName, office, headId } = data;

    // Kiểm tra trùng lặp trước khi tạo
    const existingDepartment = await prisma.department.findFirst({
        where: {
            OR: [
                { code: { equals: code, mode: 'insensitive' } },
                { shortName: { equals: shortName, mode: 'insensitive' } },
                { fullName: { equals: fullName, mode: 'insensitive' } },
            ],
        },
    });

    if (existingDepartment) {
        return res.status(409).json({ message: 'Dữ liệu khoa đã tồn tại (Mã, Tên viết tắt, hoặc Tên đầy đủ).' });
    }


    const department = await prisma.department.create({
      data: {
        code,
        shortName,
        fullName,
        office,
        head: headId ? {
          connect: { id: headId }
        } : undefined,
      },
    });

    if (headId) {
      await prisma.teacher.update({
        where: { id: headId },
        data: { isHead: true },
      });
    }

    res.status(201).json(department);
  } catch (error: any) {
    console.error('Error creating department:', error.message);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'Dữ liệu khoa đã tồn tại (Mã, Tên viết tắt, hoặc Tên đầy đủ).' });
    }
    res.status(400).json({ message: 'Error creating department', error: error.message });
  }
};

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const { search, sortBy = 'orderNumber', sortOrder = 'asc', page = '1', limit = '10' } = req.query;
    
    // Xây dựng điều kiện tìm kiếm
    const where: any = {};
    
    if (search) {
      where.OR = [
        { fullName: { contains: search as string, mode: 'insensitive' } },
        { shortName: { contains: search as string, mode: 'insensitive' } },
        { code: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Tính toán phân trang
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    // Lấy tổng số bản ghi
    const total = await prisma.department.count({ where });

    // Lấy danh sách khoa với phân trang và sắp xếp
    const departments = await prisma.department.findMany({
      where,
      orderBy: {
        [sortBy as string]: sortOrder,
      },
      skip,
      take: limitNumber,
      include: {
        head: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Đảm bảo departments luôn là một mảng
    const departmentsArray = Array.isArray(departments) ? departments : [];

    res.json({
      departments: departmentsArray,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber)
    });
  } catch (error: any) {
    console.error('Error fetching departments:', error.message);
    res.status(500).json({ 
      message: 'Error fetching departments', 
      error: error.message,
      departments: [] // Đảm bảo luôn trả về mảng rỗng khi có lỗi
    });
  }
};

export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        head: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    const departmentWithHeadFullName = {
        ...department,
        head: department.head ? { ...department.head, fullName: `${department.head.firstName} ${department.head.lastName}` } : null,
    };
    res.json(departmentWithHeadFullName);
  } catch (error: any) {
    console.error('Error fetching department by ID:', error.message);
    res.status(500).json({ message: 'Error fetching department', error: error.message });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data: UpdateDepartmentInput = req.body;
      const { headId, ...updateData } = data; // Tách headId ra khỏi updateData

      // Kiểm tra trùng lặp cho các trường unique (code, shortName, fullName)
      if (updateData.code || updateData.shortName || updateData.fullName) {
          const existingDepartment = await prisma.department.findFirst({
              where: {
                  id: { not: id }, // Không kiểm tra chính bản thân khoa đang update
                  OR: [
                      ...(updateData.code ? [{ code: { equals: updateData.code, mode: Prisma.QueryMode.insensitive } }] : []),
                      ...(updateData.shortName ? [{ shortName: { equals: updateData.shortName, mode: Prisma.QueryMode.insensitive } }] : []),
                      ...(updateData.fullName ? [{ fullName: { equals: updateData.fullName, mode: Prisma.QueryMode.insensitive } }] : []),
                  ],
              },
          });

          if (existingDepartment) {
              return res.status(409).json({ message: 'Dữ liệu khoa đã tồn tại (Mã, Tên viết tắt, hoặc Tên đầy đủ).' });
          }
      }

      // Xử lý logic gán/bỏ gán trưởng khoa
      if (headId !== undefined) {
        // Nếu headId là null, có nghĩa là muốn bỏ gán trưởng khoa hiện tại
        if (headId === null) {
          const currentDepartment = await prisma.department.findUnique({ where: { id: id }, select: { headId: true } });
          if (currentDepartment?.headId) {
            await prisma.teacher.update({
              where: { id: currentDepartment.headId },
              data: { isHead: false },
            });
          }
        } else {
          // Gán trưởng khoa mới
          const newHead = await prisma.teacher.findUnique({ where: { id: headId } });
          if (!newHead) {
            return res.status(400).json({ message: 'Giảng viên được chọn làm trưởng khoa không tồn tại.' });
          }

          // Kiểm tra xem giảng viên đã là trưởng khoa của khoa khác chưa
          const existingHeadOfOtherDepartment = await prisma.department.findFirst({
            where: { headId: headId, id: { not: id } }
          });
          if (existingHeadOfOtherDepartment) {
            return res.status(400).json({ message: `Giảng viên này đã là trưởng khoa của khoa ${existingHeadOfOtherDepartment.fullName}.` });
          }

          // Bỏ gán trưởng khoa cũ nếu có
          const currentDepartment = await prisma.department.findUnique({ where: { id: id }, select: { headId: true } });
          if (currentDepartment?.headId && currentDepartment.headId !== headId) {
            await prisma.teacher.update({
              where: { id: currentDepartment.headId },
              data: { isHead: false },
            });
          }
          // Cập nhật isHead cho trưởng khoa mới
          await prisma.teacher.update({
            where: { id: headId },
            data: { isHead: true },
          });
        }
      }

      const department = await prisma.department.update({
        where: { id: id },
        data: {
          ...updateData,
          head: headId !== undefined
            ? (headId === null ? { disconnect: true } : { connect: { id: headId } })
            : undefined,
        },
      });

      res.json(department);
    } catch (error: any) {
      console.error('Error updating department:', error.message);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(409).json({ message: 'Dữ liệu khoa đã tồn tại (Mã, Tên viết tắt, hoặc Tên đầy đủ).' });
      }
      res.status(400).json({ message: 'Error updating department', error: error.message });
    }
  };


export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem có giảng viên nào thuộc khoa này không
    const teachersInDepartment = await prisma.teacher.findMany({
      where: { departmentId: id },
    });

    if (teachersInDepartment.length > 0) {
      return res.status(400).json({
        message: 'Không thể xóa khoa này vì có giảng viên đang thuộc khoa này.',
      });
    }

    // Kiểm tra xem khoa này có phải là trưởng khoa của một giảng viên nào không (mặc dù đã xử lý ở update/create, nhưng tốt nhất nên kiểm tra lại)
    const departmentAsHead = await prisma.teacher.findFirst({
        where: { isHead: true, departmentId: id } // Find a teacher who is head AND belongs to this department
    });
    if (departmentAsHead) {
        // This case implies a data inconsistency if create/update worked correctly, but good to check.
        // It's more likely that department.headId references this department.
        // If a department is a head of itself, that's fine.
        // If it means a teacher from this department is a head of another, that's not handled here.
        // The most direct check is if any teacher's `isHead` property is true AND they belong to this department.
    }

    // Nếu khoa có trưởng khoa, cần gỡ bỏ isHead của trưởng khoa đó
    const departmentToDelete = await prisma.department.findUnique({
        where: { id },
        select: { headId: true }
    });

    if (departmentToDelete?.headId) {
        await prisma.teacher.update({
            where: { id: departmentToDelete.headId },
            data: { isHead: false }
        });
    }


    await prisma.department.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting department:', error.message);
    res.status(400).json({ message: 'Error deleting department', error: error.message });
  }
};

export const importFromExcel = async (req: Request, res: Response) => {
  console.log('Backend: Đã nhận yêu cầu import khoa.');
  
  if (!req.file) {
    const msg = 'Không có file nào được tải lên.';
    console.error('Backend ERROR:', msg);
    return res.status(400).json({ message: msg, errors: [msg] });
  }

  const filePath = req.file.path;
  const errors: string[] = [];
  let successCount = 0;

  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    // header: 1 để lấy hàng đầu tiên làm tiêu đề, raw: false để không giữ nguyên định dạng
    const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

    // Bỏ qua hàng tiêu đề và ánh xạ dữ liệu
    const departmentsToImport: DepartmentRow[] = json.slice(1).map((row: any, index: number) => {
        // Đảm bảo rằng các cột trong Excel khớp với thứ tự này
        // Cột A -> row[0] (code)
        // Cột B -> row[1] (shortName)
        // Cột C -> row[2] (fullName)
        // Cột D -> row[3] (office)
        const mappedRow = {
            rowNum: index + 2, // Số dòng trong Excel (bắt đầu từ 1, bỏ qua header nên +2)
            code: row[0] ? String(row[0]).trim() : '',
            shortName: row[1] ? String(row[1]).trim() : '',
            fullName: row[2] ? String(row[2]).trim() : '',
            office: row[3] ? String(row[3]).trim() : '',
        };
        console.log(`Backend: Mapped row (Excel row ${mappedRow.rowNum}):`, JSON.stringify(mappedRow));
        return mappedRow;
    }).filter(row => row.code || row.shortName || row.fullName || row.office); // Lọc bỏ các dòng trống hoàn toàn

    console.log(`Backend: Tổng số dòng khoa đã đọc từ Excel và sẵn sàng import: ${departmentsToImport.length}`);

    if (departmentsToImport.length === 0) {
        const msg = 'Không tìm thấy dữ liệu khoa hợp lệ nào trong file Excel.';
        errors.push(msg);
        console.warn('Backend WARN:', msg);
        // Clean up uploaded file even if no data found
        fs.unlinkSync(filePath);
        return res.status(400).json({
            message: 'Không tìm thấy dữ liệu khoa hợp lệ.',
            successCount: 0,
            errorCount: errors.length,
            errors: errors,
        });
    }

    for (const departmentData of departmentsToImport) {
      const rowNum = departmentData.rowNum; // Sử dụng số dòng Excel để báo cáo lỗi
      try {
        // 1. Basic validation
        if (!departmentData.code || !departmentData.shortName || !departmentData.fullName || !departmentData.office) {
          const errMsg = `Dòng ${rowNum}: Thiếu thông tin bắt buộc (Mã Khoa, Tên viết tắt, Tên đầy đủ, Văn phòng). Dữ liệu: ${JSON.stringify(departmentData)}`;
          errors.push(errMsg);
          console.warn('Backend WARN:', errMsg);
          continue;
        }

        // 2. Check for existing department (code, shortName, or fullName)
        const existingDepartment = await prisma.department.findFirst({
          where: {
            OR: [
              { code: { equals: departmentData.code, mode: 'insensitive' } },
              { shortName: { equals: departmentData.shortName, mode: 'insensitive' } },
              { fullName: { equals: departmentData.fullName, mode: 'insensitive' } }
            ]
          }
        });

        if (existingDepartment) {
          let errorMessageDetail = '';
          if (existingDepartment.code.toLowerCase() === departmentData.code.toLowerCase()) {
              errorMessageDetail += `Mã Khoa '${departmentData.code}' đã tồn tại. `;
          }
          if (existingDepartment.shortName.toLowerCase() === departmentData.shortName.toLowerCase()) {
              errorMessageDetail += `Tên viết tắt '${departmentData.shortName}' đã tồn tại. `;
          }
          if (existingDepartment.fullName.toLowerCase() === departmentData.fullName.toLowerCase()) {
              errorMessageDetail += `Tên đầy đủ '${departmentData.fullName}' đã tồn tại. `;
          }
          const finalErrMsg = `Dòng ${rowNum}: Dữ liệu khoa đã tồn tại. ${errorMessageDetail}`.trim();
          errors.push(finalErrMsg);
          console.warn('Backend WARN:', finalErrMsg);
          continue;
        }

        // 3. Create department
        await prisma.department.create({
          data: {
            code: departmentData.code,
            shortName: departmentData.shortName,
            fullName: departmentData.fullName,
            office: departmentData.office,
          },
        });
        successCount++;
        console.log(`Backend SUCCESS: Dòng ${rowNum}: Tạo khoa thành công: ${departmentData.fullName}`);

      } catch (dbError: any) {
        let errMsg = `Dòng ${rowNum}: Lỗi khi xử lý dữ liệu khoa.`;
        if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
          if (dbError.code === 'P2002') {
            const target = (dbError.meta as { target?: string[] })?.target?.join(', ') || 'unknown fields';
            errMsg = `Dòng ${rowNum}: Dữ liệu bị trùng lặp ở các trường: ${target}. Vui lòng kiểm tra lại file Excel.`;
            console.error(`Backend ERROR: Prisma error P2002 for row ${rowNum}:`, dbError.message);
          } else {
            errMsg = `Dòng ${rowNum}: Lỗi Prisma (mã ${dbError.code}). Chi tiết: ${dbError.message}.`;
            console.error(`Backend ERROR: Prisma error (code ${dbError.code}) for row ${rowNum}:`, dbError.message);
          }
        } else {
          console.error(`Backend ERROR: Lỗi không phải Prisma cho dòng ${rowNum}:`, dbError);
        }
        errors.push(errMsg);
        console.error(`Backend ERROR: Thông báo lỗi đẩy vào mảng cho dòng ${rowNum}:`, errMsg);
      }
    }

    console.log('Backend: --- Kết thúc xử lý tất cả khoa. ---');
    console.log('Backend: Tổng số import thành công:', successCount);
    console.log('Backend: Tổng số lỗi thu thập:', errors.length);
    console.log('Backend: Nội dung mảng lỗi (JSON):', JSON.stringify(errors));

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: 'Quá trình import hoàn tất.',
      successCount,
      errorCount: errors.length,
      errors,
    });

  } catch (error: any) {
    console.error('Backend ERROR: Lỗi chung khi import khoa (Outer Catch - full error):', error);
    const errorMessage = error.message || 'Đã xảy ra lỗi server không xác định khi import dữ liệu.';
    errors.push(`Lỗi chung khi xử lý file: ${errorMessage}. Kiểm tra console log backend.`);
    // Ensure file is unlinked even on outer catch
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    res.status(500).json({
      message: 'Đã xảy ra lỗi server khi import dữ liệu.',
      successCount: 0,
      errorCount: errors.length,
      errors,
    });
  }
  console.log('Backend: --- END importFromExcel backend function ---');
};

export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        orderNumber: 'asc',
      },
      include: {
        head: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json(departments);
  } catch (error: any) {
    console.error('Error fetching all departments:', error.message);
    res.status(500).json({ 
      message: 'Error fetching all departments', 
      error: error.message,
      departments: []
    });
  }
};
