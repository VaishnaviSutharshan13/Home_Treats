import { Router } from 'express';
import { getStats, getActivities, backupDatabase, healthCheck, getMonthlyRevenue, getRoomOccupancy, getRecentStudents } from '../controllers/adminController';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/stats', authMiddleware, adminOnly, getStats);
router.get('/activities', authMiddleware, adminOnly, getActivities);
router.get('/revenue-monthly', authMiddleware, adminOnly, getMonthlyRevenue);
router.get('/room-occupancy', authMiddleware, adminOnly, getRoomOccupancy);
router.get('/recent-students', authMiddleware, adminOnly, getRecentStudents);
router.get('/health', authMiddleware, adminOnly, healthCheck);
router.post('/backup', authMiddleware, adminOnly, backupDatabase);

export default router;
