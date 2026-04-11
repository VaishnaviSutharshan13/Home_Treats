import { Router } from 'express';
import {
  deletePayment,
  getAdminPayments,
  getStudentPayments,
  submitPayment,
  updatePaymentStatus,
} from '../controllers/paymentController';
import { adminOnly, authMiddleware, approvedStudentOnly } from '../middleware/auth';
import { uploadPaymentSlip } from '../middleware/paymentUpload';

const router = Router();

router.post('/', authMiddleware, approvedStudentOnly, uploadPaymentSlip.single('slip'), submitPayment);
router.get('/student', authMiddleware, approvedStudentOnly, getStudentPayments);
router.get('/admin', authMiddleware, adminOnly, getAdminPayments);
router.put('/:id', authMiddleware, adminOnly, updatePaymentStatus);
router.delete('/:id', authMiddleware, adminOnly, deletePayment);

export default router;
