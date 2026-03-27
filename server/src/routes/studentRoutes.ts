import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  inactivateStudent,
  activateStudent,
  searchStudents,
  getPendingStudents,
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
  body('university').notEmpty().withMessage('University / College is required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
  body('address').notEmpty().withMessage('Address is required'),
  body('emergencyContact').notEmpty().withMessage('Emergency contact is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('status').optional().isIn(['Pending', 'Approved', 'Rejected', 'Inactive']).withMessage('Status must be Pending, Approved, Rejected, or Inactive'),
];

const validateStudentUpdate = [
  body('roomNumber').optional().isString().withMessage('Room number must be a string'),
  body('status').optional().isIn(['Pending', 'Approved', 'Rejected', 'Inactive']).withMessage('Status must be Pending, Approved, Rejected, or Inactive'),
];

// Routes — List, approval queue, and CRUD require admin
router.get('/', authMiddleware, adminOnly, getAllStudents);
router.get('/pending', authMiddleware, adminOnly, getPendingStudents);
router.get('/search/:query', authMiddleware, adminOnly, searchStudents);
router.put('/:id/approve', authMiddleware, adminOnly, approveStudent);
router.put('/:id/reject', authMiddleware, adminOnly, rejectStudent);
router.put('/:id/inactivate', authMiddleware, adminOnly, inactivateStudent);
router.put('/:id/activate', authMiddleware, adminOnly, activateStudent);
router.get('/:id', authMiddleware, getStudentById);
router.post('/', authMiddleware, adminOnly, validateStudent, createStudent);
router.put('/:id', authMiddleware, adminOnly, validateStudentUpdate, updateStudent);

export default router;
