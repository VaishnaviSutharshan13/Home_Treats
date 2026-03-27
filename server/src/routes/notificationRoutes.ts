import { Router } from 'express';
import { body } from 'express-validator';
import {
  createAdminNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  hideNotification,
  clearAll,
} from '../controllers/notificationController';
import { adminOnly, authMiddleware } from '../middleware/auth';

const router = Router();

const validateAdminNotification = [
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('recipientType').optional().isIn(['all_students', 'selected_students']).withMessage('Invalid recipientType'),
  body('type').optional().isIn(['announcement', 'fee', 'complaint', 'room', 'student', 'booking', 'payment']).withMessage('Invalid type'),
  body('priority').optional().isIn(['normal', 'important', 'urgent', 'success']).withMessage('Invalid priority'),
];

router.post('/', authMiddleware, adminOnly, validateAdminNotification, createAdminNotification);

router.get('/', authMiddleware, getNotifications);
router.get('/unread-count', authMiddleware, getUnreadCount);
router.put('/mark-all-read', authMiddleware, markAllAsRead);
router.put('/:id/read', authMiddleware, markAsRead);
router.delete('/:id', authMiddleware, hideNotification);
router.delete('/clear', authMiddleware, clearAll);

export default router;
