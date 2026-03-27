import express from 'express';
import { body } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import { uploadProfileImage } from '../middleware/upload';
import { getProfile, updateProfile, updateProfileImage } from '../controllers/profileController';

const router = express.Router();

router.get('/', authMiddleware, getProfile);

router.put(
  '/',
  authMiddleware,
  [
    body('fullName').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    body('phone').optional().trim().isLength({ min: 7 }).withMessage('Phone must be at least 7 characters long'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  updateProfile,
);

router.put('/image', authMiddleware, uploadProfileImage.single('profileImage'), updateProfileImage);

export default router;
