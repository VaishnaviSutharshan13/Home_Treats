import { Router } from 'express';
import { body } from 'express-validator';
import { login, register, verifyToken, refreshToken, logout, getProfile, updateProfile, forgotPassword, resetPassword } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Validation middleware
const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const validateRegister = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().notEmpty().withMessage('Phone is required'),
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
