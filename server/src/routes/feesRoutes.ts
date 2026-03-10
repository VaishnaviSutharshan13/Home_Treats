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
  getStatistics,
  getStudentsWithRooms,
  updateOverdueFees,
  getMonthlyRevenueChart,
  getFinancialAnalytics,
} from '../controllers/feesController';
import { authMiddleware, adminOnly, approvedStudentOrAdmin } from '../middleware/auth';

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
  body('paidAmount').isFloat({ min: 0 }).withMessage('Paid amount must be a positive number'),
  body('paidDate').notEmpty().withMessage('Paid date is required'),
];

// Routes — List all fees requires admin
router.get('/', authMiddleware, adminOnly, getAllFees);
router.get('/statistics', authMiddleware, adminOnly, getStatistics);
router.get('/revenue', authMiddleware, adminOnly, getRevenueReport);
router.get('/monthly-chart', authMiddleware, adminOnly, getMonthlyRevenueChart);
router.get('/analytics', authMiddleware, adminOnly, getFinancialAnalytics);
router.get('/unpaid', authMiddleware, adminOnly, getUnpaidStudents);
router.get('/students-rooms', authMiddleware, adminOnly, getStudentsWithRooms);
router.get('/report/:year/:month', authMiddleware, adminOnly, getMonthlyReport);
router.post('/update-overdue', authMiddleware, adminOnly, updateOverdueFees);
router.get('/student/:studentId', authMiddleware, approvedStudentOrAdmin, getFeesByStudent);
router.get('/:id', authMiddleware, getFeeById);
router.get('/:id/receipt', authMiddleware, getReceipt);
router.post('/', authMiddleware, adminOnly, validateFee, createFee);
router.put('/:id', authMiddleware, adminOnly, updateFee);
router.delete('/:id', authMiddleware, adminOnly, deleteFee);
router.put('/:id/pay', authMiddleware, adminOnly, validatePayment, payFee);

export default router;
