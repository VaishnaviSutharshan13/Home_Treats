import { Router } from 'express';
import { getDashboardStats, getRecentActivities, createBackup, getHealthStats, getMonthlyRevenue, getRoomOccupancy, getRecentStudents } from '../controllers/adminController';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/stats', authMiddleware, adminOnly, getDashboardStats);
router.get('/activities', authMiddleware, adminOnly, getRecentActivities);
router.get('/revenue-monthly', authMiddleware, adminOnly, getMonthlyRevenue);
router.get('/room-occupancy', authMiddleware, adminOnly, getRoomOccupancy);
router.get('/recent-students', authMiddleware, adminOnly, getRecentStudents);
router.get('/health', authMiddleware, adminOnly, getHealthStats);
router.post('/backup', authMiddleware, adminOnly, createBackup);

export default router;
