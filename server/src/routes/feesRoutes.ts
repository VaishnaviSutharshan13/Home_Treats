import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllFees,
  getFeeById,
  createFee,
  updateFee,
  deleteFee,
  payFee,
  getFeesByStudent,
  getMyFees,
  getRevenueReport,
  getMonthlyReport,
  getReceipt,
  getUnpaidStudents,
} from '../controllers/feesController';
import { authMiddleware, adminOnly, approvedStudentOnly, approvedStudentOrAdmin } from '../middleware/auth';

const router = Router();

// Validation middleware
const validateFee = [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('feeType').notEmpty().withMessage('Fee type is required'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('dueDate').notEmpty().withMessage('Due date is required'),
];

// Routes — List all fees requires admin
router.get('/', authMiddleware, adminOnly, getAllFees);
router.get('/revenue', authMiddleware, adminOnly, getRevenueReport);
router.get('/unpaid', authMiddleware, adminOnly, getUnpaidStudents);
router.get('/report/:year/:month', authMiddleware, adminOnly, getMonthlyReport);
router.get('/my-fees', authMiddleware, approvedStudentOnly, getMyFees);
router.get('/student/:studentId', authMiddleware, approvedStudentOrAdmin, getFeesByStudent);
router.get('/:id/receipt', authMiddleware, getReceipt);
router.get('/:id', authMiddleware, getFeeById);
router.post('/create', authMiddleware, adminOnly, validateFee, createFee);
router.post('/', authMiddleware, adminOnly, validateFee, createFee);
router.put('/:id', authMiddleware, adminOnly, updateFee);
router.delete('/:id', authMiddleware, adminOnly, deleteFee);
router.put('/:id/pay', authMiddleware, adminOnly, payFee);

export default router;
