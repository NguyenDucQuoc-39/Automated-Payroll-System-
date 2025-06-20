import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify role if provided
    if (role && user.role !== role) {
      return res.status(403).json({ message: 'Invalid role for this user' });
    }

    // Generate token
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET || 'your-super-secret-key-here',
      { expiresIn: '7d' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-here',
      { expiresIn: '30d' }
    );

    // Return user data and tokens
    return res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.teacher ? `${user.teacher.firstName} ${user.teacher.lastName}` : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Error logging in' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-key-here') as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.teacher ? `${user.teacher.firstName} ${user.teacher.lastName}` : null
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// Create admin account (only for development)
router.post('/create-admin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    return res.status(201).json({
      message: 'Admin account created successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Create admin error:', error);
    return res.status(500).json({ message: 'Error creating admin account' });
  }
});

// Add refresh token endpoint
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-here') as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new access token
    const newToken = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET || 'your-super-secret-key-here',
      { expiresIn: '7d' }
    );

    return res.json({ token: newToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

export default router; 