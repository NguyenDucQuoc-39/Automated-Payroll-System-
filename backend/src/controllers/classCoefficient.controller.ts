import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllClassCoefficients = async (req: Request, res: Response) => {
  try {
    const data = await prisma.classCoefficient.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu hệ số lớp', error });
  }
};

export const getClassCoefficientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await prisma.classCoefficient.findUnique({ where: { id } });
    if (!data) return res.status(404).json({ message: 'Not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu hệ số lớp', error });
  }
};

export const createClassCoefficient = async (req: Request, res: Response) => {
  try {
    const { academicYear, minStudents, maxStudents, coefficient, status } = req.body;
    const data = await prisma.classCoefficient.create({ data: { academicYear, minStudents, maxStudents, coefficient, status } });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo hệ số lớp', error });
  }
};

export const updateClassCoefficient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { academicYear, minStudents, maxStudents, coefficient, status } = req.body;
    const data = await prisma.classCoefficient.update({ where: { id }, data: { academicYear, minStudents, maxStudents, coefficient, status } });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật hệ số lớp', error });
  }
};

export const deleteClassCoefficient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.classCoefficient.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa hệ số lớp', error });
  }
}; 