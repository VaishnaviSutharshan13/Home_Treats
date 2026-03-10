import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
  getStudentApprovals,
  approveStudent,
  rejectStudent,
} from '../controllers/studentController';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

// Validation middleware
const validateStudent = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('room').notEmpty().withMessage('Room is required'),
  body('course').notEmpty().withMessage('Course is required'),
  body('year').notEmpty().withMessage('Year is required'),
];

const validateStudentUpdate = [
  body('name').optional().notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().notEmpty().withMessage('Phone is required'),
  body('room').optional().notEmpty().withMessage('Room is required'),
  body('course').optional().notEmpty().withMessage('Course is required'),
  body('year').optional().notEmpty().withMessage('Year is required'),
  body('status').optional().isIn(['Pending', 'Approved', 'Rejected']).withMessage('Status must be Pending, Approved or Rejected'),
];

// Routes — List & search require admin; individual GET requires auth
router.get('/', authMiddleware, adminOnly, getAllStudents);
router.get('/approvals', authMiddleware, adminOnly, getStudentApprovals);
router.put('/approvals/:id/approve', authMiddleware, adminOnly, approveStudent);
router.put('/approvals/:id/reject', authMiddleware, adminOnly, rejectStudent);
router.get('/search/:query', authMiddleware, adminOnly, searchStudents);
router.get('/:id', authMiddleware, getStudentById);
router.post('/', authMiddleware, adminOnly, validateStudent, createStudent);
router.put('/:id', authMiddleware, adminOnly, validateStudentUpdate, updateStudent);
router.delete('/:id', authMiddleware, adminOnly, deleteStudent);

export default router;
