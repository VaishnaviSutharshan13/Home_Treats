import { Router } from 'express';
import { body } from 'express-validator';
import { login, register, verifyToken, refreshToken, logout, getProfile, updateProfile, forgotPassword, resetPassword } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Validation middleware
const validateLogin = [
  body('email').optional(),
  body('studentId').optional(),
  body('identifier').optional(),
  body().custom((value) => {
    const hasIdentifier = value?.email || value?.studentId || value?.identifier;
    if (!hasIdentifier) {
      throw new Error('Email or Student ID is required');
    }
    return true;
  }),
  body('password').notEmpty().withMessage('Password is required'),
];

const validateRegister = [
  body('name').notEmpty().withMessage('Name is required'),
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('gender').notEmpty().withMessage('Gender is required'),
  body('course').notEmpty().withMessage('Course / Department is required'),
  body('year').notEmpty().withMessage('Year of study is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').notEmpty().withMessage('Confirm password is required'),
];

// Public routes
router.post('/login', validateLogin, login);
router.post('/register', validateRegister, register);
router.get('/verify', verifyToken);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required'),
], forgotPassword);
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], resetPassword);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

export default router;
