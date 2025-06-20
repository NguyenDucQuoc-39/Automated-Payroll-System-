import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllLessonCoefficients = async (req: Request, res: Response) => {
  try {
    const data = await prisma.lessonCoefficient.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lesson coefficients', error });
  }
};

export const getLessonCoefficientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await prisma.lessonCoefficient.findUnique({ where: { id } });
    if (!data) return res.status(404).json({ message: 'Not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lesson coefficient', error });
  }
};

export const createLessonCoefficient = async (req: Request, res: Response) => {
  try {
    const { academicYear, amount, status } = req.body;
    const data = await prisma.lessonCoefficient.create({ data: { academicYear, amount, status } });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error creating lesson coefficient', error });
  }
};

export const updateLessonCoefficient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { academicYear, amount, status } = req.body;
    const data = await prisma.lessonCoefficient.update({ where: { id }, data: { academicYear, amount, status } });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error updating lesson coefficient', error });
  }
};

export const deleteLessonCoefficient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.lessonCoefficient.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting lesson coefficient', error });
  }
}; 