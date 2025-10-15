import { Request, Response } from 'express';
import { PrismaClient, Prisma, DegreeTypeEnum } from '@prisma/client';
import { CreateDegreeInput, UpdateDegreeInput } from '../types/typeBackend'; // Đảm bảo đường dẫn đúng
import * as XLSX from 'xlsx';
import fs from 'fs';

const prisma = new PrismaClient();

// Helper function to map Vietnamese string to DegreeTypeEnum
const mapStringToDegreeTypeEnum = (input: string): DegreeTypeEnum | undefined => {
  switch (input.toLowerCase()) {
    case 'thạc sĩ': return DegreeTypeEnum.MASTER;
    case 'tiến sĩ': return DegreeTypeEnum.DOCTOR;
    case 'phó giáo sư': return DegreeTypeEnum.ASSOCIATE_PROFESSOR;
    case 'giáo sư': return DegreeTypeEnum.PROFESSOR;
    default: return undefined; // Trả về undefined nếu không khớp với các loại trên
  }
};

export const createDegree = async (req: Request, res: Response) => {
  console.log('Backend: Đã nhận được yêu cầu tạo bằng cấp.');
  console.log('Backend: Dữ liệu nhận được:', req.body);
  try {
    const data: CreateDegreeInput = req.body;

    // Map the Vietnamese string type to DegreeTypeEnum before saving to DB
    const typeEnum = mapStringToDegreeTypeEnum(data.type);
    if (!typeEnum) {
      return res.status(400).json({ message: `Loại bằng cấp "${data.type}" không hợp lệ.` });
    }

    // Kiểm tra trùng tên đầy đủ (fullName)
    const existingFullName = await prisma.degree.findFirst({
      where: {
        fullName: { equals: data.fullName.trim(), mode: 'insensitive' }
      }
    });
    if (existingFullName) {
      return res.status(409).json({ message: `Tên đầy đủ bằng cấp '${data.fullName}' đã tồn tại.` });
    }

    // Kiểm tra shortName không chứa ký tự đặc biệt
    const shortNameRegex = /^[A-Za-z0-9]+$/;
    if (!shortNameRegex.test(data.shortName)) {
      return res.status(400).json({ message: 'Tên viết tắt không được chứa ký tự đặc biệt, dấu cách hoặc dấu.' });
    }

    // Tìm số thứ tự lớn nhất hiện có và tăng lên 1
    const latestDegree = await prisma.degree.findFirst({
      orderBy: {
        orderNumber: 'desc',
      },
      select: {
        orderNumber: true,
      },
    });

    const newOrderNumber = (latestDegree?.orderNumber || 0) + 1;

    const degree = await prisma.degree.create({
      data: {
        orderNumber: newOrderNumber,
        type: typeEnum,
        fullName: data.fullName,
        shortName: data.shortName
      }
    });
    res.status(201).json(degree);
  } catch (error: any) {
    console.error('Backend ERROR: Lỗi khi tạo bằng cấp:', error.message);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'Dữ liệu bằng cấp đã tồn tại (Tên đầy đủ hoặc tên viết tắt đã được sử dụng).' });
    }
    res.status(400).json({ message: 'Error creating degree', error: error.message });
  }
};

export const getDegrees = async (req: Request, res: Response) => {
  try {
    const { search, type, sortBy = 'orderNumber', sortOrder = 'asc', page = '1', limit = '10' } = req.query;
    
    // Xây dựng điều kiện tìm kiếm
    const where: any = {};
    
    if (search) {
      where.OR = [
        { fullName: { contains: search as string, mode: 'insensitive' } },
        { shortName: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (type) {
      // Chuyển đổi loại bằng cấp từ tiếng Việt sang enum
      const typeEnum = mapStringToDegreeTypeEnum(type as string);
      if (typeEnum) {
        where.type = typeEnum;
      }
    }

    // Tính toán phân trang
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    // Lấy tổng số bản ghi
    const total = await prisma.degree.count({ where });

    // Lấy danh sách bằng cấp với phân trang và sắp xếp
    const degrees = await prisma.degree.findMany({
      where,
      orderBy: {
        [sortBy as string]: sortOrder,
      },
      skip,
      take: limitNumber,
    });

    res.json({
      degrees,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber)
    });
  } catch (error: any) {
    console.error('Error fetching degrees:', error.message);
    res.status(500).json({ message: 'Error fetching degrees', error: error.message });
  }
};

export const getDegreeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const degree = await prisma.degree.findUnique({
      where: { id },
    });
    if (!degree) {
      return res.status(404).json({ message: 'Degree not found' });
    }
    res.json(degree);
  } catch (error: any) {
    console.error('Error fetching degree by ID:', error.message);
    res.status(500).json({ message: 'Error fetching degree', error: error.message });
  }
};

export const updateDegree = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateDegreeInput = req.body;

    // Map the Vietnamese string type to DegreeTypeEnum before saving to DB, if type is provided
    let typeEnum;
    if (data.type) {
      typeEnum = mapStringToDegreeTypeEnum(data.type);
      if (!typeEnum) {
        return res.status(400).json({ message: `Loại bằng cấp "${data.type}" không hợp lệ.` });
      }
    }

    const degree = await prisma.degree.update({
      where: {
        id: id
      },
      data: {
        // orderNumber không được cập nhật từ input người dùng
        type: typeEnum, // Cập nhật với giá trị enum đã được map
        fullName: data.fullName,
        shortName: data.shortName
      }
    });
    res.json(degree);
  } catch (error: any) {
    console.error('Error updating degree:', error.message);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'Dữ liệu bằng cấp đã tồn tại (Tên đầy đủ hoặc tên viết tắt đã được sử dụng).' });
    }
    res.status(400).json({ message: 'Lỗi khi cập nhật bằng cấp', error: error.message });
  }
};

export const deleteDegree = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // 1. Lấy thông tin bằng cấp sắp bị xóa để biết orderNumber của nó
    const deletedDegree = await prisma.degree.findUnique({
      where: { id },
      select: { orderNumber: true },
    });

    if (!deletedDegree) {
      return res.status(404).json({ message: 'Không tìm thấy bằng cấp để xóa.' });
    }

    // 2. Kiểm tra xem có giảng viên nào đang sở hữu bằng cấp này không
    const teachersWithDegree = await prisma.teacher.findMany({
      where: { degreeId: id },
    });

    if (teachersWithDegree.length > 0) {
      return res.status(400).json({
        message: 'Không thể xóa bằng cấp này vì có giảng viên đang sở hữu bằng cấp này.',
      });
    }

    await prisma.degree.delete({
      where: { id },
    });

    // 3. Cập nhật lại orderNumber của các bằng cấp còn lại
    await prisma.degree.updateMany({
      where: { orderNumber: { gt: deletedDegree.orderNumber } },
      data: { orderNumber: { decrement: 1 } },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting degree:', error.message);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      // P2003: Foreign key constraint failed on the database
      return res.status(400).json({
        message: 'Không thể xóa bằng cấp này vì nó được tham chiếu bởi các giảng viên.',
      });
    }
    res.status(500).json({ message: 'Error deleting degree', error: error.message });
  }
};

// 
export const importDegrees = async (req: Request, res: Response) => {
  console.log('IMPORT START');
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không nhận được file.' });
    }

    // Đọc file Excel
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const degreesDataRaw: any[] = XLSX.utils.sheet_to_json(sheet);

     // Map lại key cho từng dòng
     const degreesData = degreesDataRaw.map(row => ({
      type: row['Loại bằng cấp'],
      shortName: row['Tên viết tắt'],
      fullName: row['Tên đầy đủ'],
    }));

    // Xóa file sau khi đọc xong
    fs.unlinkSync(req.file.path);

    const errors: string[] = [];
    let successCount = 0;
    let currentOrderNumber = (await prisma.degree.findFirst({ orderBy: { orderNumber: 'desc' } }))?.orderNumber || 0;

    if (!degreesData || !Array.isArray(degreesData) || degreesData.length === 0) {
      const msg = "Dữ liệu nhập không hợp lệ hoặc thiếu.";
      errors.push(msg);
      return res.status(400).json({
        message: 'Dữ liệu nhập không hợp lệ.',
        successCount: 0,
        errorCount: 1,
        errors: [msg],
      });
    }
    console.log('degreesData:', degreesData);

    for (let i = 0; i < degreesData.length; i++) {
      const row = degreesData[i];
      const rowNum = i + 2; // Excel row (header là 1)
      console.log('Row:', row);

      try {
        // 1. Basic validation
        if (!row.fullName || !row.type || !row.shortName) {
          const errMsg = `Dòng ${rowNum}: Thiếu thông tin bắt buộc (Tên đầy đủ, Loại bằng cấp, Tên viết tắt).`;
          errors.push(errMsg);
          continue;
        }

        // 2. Validate and map DegreeTypeEnum
        const typeEnum = mapStringToDegreeTypeEnum(row.type);
        if (!typeEnum) {
          const errMsg = `Dòng ${rowNum}: Loại bằng cấp \"${row.type}\" không hợp lệ.`;
          errors.push(errMsg);
          continue;
        }

        // 3. Check for existing degree with same fullName only
        const existingDegree = await prisma.degree.findFirst({
          where: {
            fullName: { equals: row.fullName.trim(), mode: 'insensitive' }
          }
        });

        if (existingDegree) {
          const errMsg = `Dòng ${rowNum}: Dữ liệu bằng cấp đã tồn tại. (Tên đầy đủ '${row.fullName}' đã tồn tại).`;
          errors.push(errMsg);
          continue;
        }

        currentOrderNumber++; // Tăng số thứ tự cho bản ghi mới

        // 4. Create the degree
        console.log('Creating degree:', row.fullName, row.type, row.shortName);
        await prisma.degree.create({
          data: {
            orderNumber: currentOrderNumber,
            type: typeEnum,
            fullName: row.fullName.trim(),
            shortName: row.shortName.trim(),
          },
        });
        successCount++;
      } catch (dbError: any) {
        let errMsg = `Dòng ${rowNum}: Lỗi khi xử lý bằng cấp.`;
        if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
          errMsg = `Dòng ${rowNum}: Lỗi Prisma (mã ${dbError.code}). Chi tiết: ${dbError.message}.`;
        }
        errors.push(errMsg);
      }
    }
    console.log('IMPORT END');
    res.status(200).json({
      message: 'Quá trình import hoàn tất.',
      successCount,
      errorCount: errors.length,
      errors,
    });

  } catch (error: any) {
    const errorMessage = error.message || 'Đã xảy ra lỗi server không xác định khi import dữ liệu.';
    res.status(500).json({
      message: 'Đã xảy ra lỗi server khi import dữ liệu.',
      successCount: 0,
      errorCount: 1,
      errors: [errorMessage],
    });
  }
};

export const getAllDegrees = async (req: Request, res: Response) => {
  try {
    const degrees = await prisma.degree.findMany({
      orderBy: {
        orderNumber: 'asc',
      },
    });

    res.json(degrees);
  } catch (error: any) {
    console.error('Error fetching all degrees:', error.message);
    res.status(500).json({ 
      message: 'Error fetching all degrees', 
      error: error.message,
      degrees: []
    });
  }
};
