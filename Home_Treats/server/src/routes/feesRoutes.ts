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
  getRevenueReport,
  getMonthlyReport,
  getReceipt,
  getUnpaidStudents,
} from '../controllers/feesController';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

// Validation middleware
const validateFee = [
  body('studentName').notEmpty().withMessage('Student name is required'),
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('room').notEmpty().withMessage('Room is required'),
  body('feeType').notEmpty().withMessage('Fee type is required'),
  body('amount').isFloat({ min: 4000 }).withMessage('Minimum fee amount is LKR 4,000'),
  body('dueDate').notEmpty().withMessage('Due date is required'),
  body('semester').notEmpty().withMessage('Semester is required'),
];

const validatePayment = [
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  body('transactionId').notEmpty().withMessage('Transaction ID is required'),
  body('paidAmount').isFloat({ min: 0 }).withMessage('Paid amount must be a positive number'),
  body('paidDate').notEmpty().withMessage('Paid date is required'),
];

// Routes — List all fees requires admin
router.get('/', authMiddleware, adminOnly, getAllFees);
router.get('/revenue', authMiddleware, adminOnly, getRevenueReport);
router.get('/unpaid', authMiddleware, adminOnly, getUnpaidStudents);
router.get('/report/:year/:month', authMiddleware, adminOnly, getMonthlyReport);
router.get('/student/:studentId', authMiddleware, getFeesByStudent);
router.get('/:id', authMiddleware, getFeeById);
router.get('/:id/receipt', authMiddleware, getReceipt);
router.post('/', authMiddleware, adminOnly, validateFee, createFee);
router.put('/:id', authMiddleware, adminOnly, updateFee);
router.delete('/:id', authMiddleware, adminOnly, deleteFee);
router.put('/:id/pay', authMiddleware, adminOnly, validatePayment, payFee);

export default router;
