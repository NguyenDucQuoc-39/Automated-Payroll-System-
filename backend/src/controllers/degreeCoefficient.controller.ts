import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllDegreeCoefficients = async (req: Request, res: Response) => {
  try {
    const data = await prisma.degreeCoefficient.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching degree coefficients', error });
  }
};

export const getDegreeCoefficientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await prisma.degreeCoefficient.findUnique({ where: { id } });
    if (!data) return res.status(404).json({ message: 'Not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching degree coefficient', error });
  }
};

export const createDegreeCoefficient = async (req: Request, res: Response) => {
  try {
    const { academicYear, master, doctor, associateProfessor, professor, status } = req.body;
    const data = await prisma.degreeCoefficient.create({ data: { academicYear, master, doctor, associateProfessor, professor, status } });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error creating degree coefficient', error });
  }
};

export const updateDegreeCoefficient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { academicYear, master, doctor, associateProfessor, professor, status } = req.body;
    const data = await prisma.degreeCoefficient.update({ where: { id }, data: { academicYear, master, doctor, associateProfessor, professor, status } });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error updating degree coefficient', error });
  }
};

export const deleteDegreeCoefficient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.degreeCoefficient.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting degree coefficient', error });
  }
}; 