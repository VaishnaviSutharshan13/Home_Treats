import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  clearAll,
} from '../controllers/notificationController';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, adminOnly, getNotifications);
router.get('/unread-count', authMiddleware, adminOnly, getUnreadCount);
router.put('/mark-all-read', authMiddleware, adminOnly, markAllAsRead);
router.put('/:id/read', authMiddleware, adminOnly, markAsRead);
router.delete('/clear', authMiddleware, adminOnly, clearAll);

export default router;
