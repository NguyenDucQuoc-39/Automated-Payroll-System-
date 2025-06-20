import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import degreeRoutes from './routes/degree.routes';
import departmentRoutes from './routes/department.routes';
import teacherRoutes from './routes/teacher.routes';
import statisticsRoutes from './routes/statistics';
import semesterRoutes from './routes/semester.routes';
import courseRoutes from './routes/course.routes';
import classSectionRoutes from './routes/classSection.routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
export const prisma = new PrismaClient();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/degrees', degreeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/class-sections', classSectionRoutes);
// Health check endpoint
app.get('/health', async (_, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Error handling middleware
app.use((err: Error, _: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 