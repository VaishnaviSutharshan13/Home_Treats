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

router.get('/', authMiddleware, getNotifications);
router.get('/unread-count', authMiddleware, getUnreadCount);
router.put('/mark-all-read', authMiddleware, markAllAsRead);
router.put('/:id/read', authMiddleware, markAsRead);
router.delete('/clear', authMiddleware, adminOnly, clearAll);

export default router;
