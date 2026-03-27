import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllFees,
  getFeeById,
  createFee,
  updateFee,
  deleteFee,
  markAsPaid,
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
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('feeType').notEmpty().withMessage('Fee type is required'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('dueDate').notEmpty().withMessage('Due date is required'),
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
router.post('/create', authMiddleware, adminOnly, validateFee, createFee);
router.post('/', authMiddleware, adminOnly, validateFee, createFee);
router.put('/:id', authMiddleware, adminOnly, updateFee);
router.delete('/:id', authMiddleware, adminOnly, deleteFee);
router.put('/:id/pay', authMiddleware, adminOnly, markAsPaid);
router.patch('/:id/pay', authMiddleware, adminOnly, markAsPaid);

export default router;
