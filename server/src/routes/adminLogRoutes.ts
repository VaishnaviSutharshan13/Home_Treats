import { Router } from 'express';
import { getAdminLogs } from '../controllers/adminLogController';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, adminOnly, getAdminLogs);

export default router;
