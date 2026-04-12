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
  body('phone').matches(/^\d{10}$/).withMessage('Phone must be 10 digits'),
  body('studentId')
    .matches(/^[A-Za-z]{2}\d{8}$/)
    .withMessage('Student ID must start with 2 letters followed by 8 digits'),
  body('university').notEmpty().withMessage('University / College is required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
  body('address').notEmpty().withMessage('Address is required'),
  body('emergencyContact').matches(/^\d{10}$/).withMessage('Emergency contact must be 10 digits'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  body('status').optional().isIn(['Pending', 'Approved', 'Rejected', 'Inactive']).withMessage('Status must be Pending, Approved, Rejected, or Inactive'),
];

const validateStudentUpdate = [
  body('roomNumber').optional().isString().withMessage('Room number must be a string'),
  body('status').optional().isIn(['Pending', 'Approved', 'Rejected', 'Inactive']).withMessage('Status must be Pending, Approved, Rejected, or Inactive'),
];

// Routes — List, approval queue, and CRUD require admin
router.get('/', authMiddleware, adminOnly, getAllStudents);
router.get('/pending', authMiddleware, adminOnly, getPendingStudents);
// Alias used by admin UI — must be registered before /:id or "approvals" is treated as an ObjectId
router.get('/approvals', authMiddleware, adminOnly, getPendingStudents);
router.get('/search/:query', authMiddleware, adminOnly, searchStudents);
router.put('/:id/approve', authMiddleware, adminOnly, approveStudent);
router.put('/:id/reject', authMiddleware, adminOnly, rejectStudent);
router.put('/:id/inactivate', authMiddleware, adminOnly, inactivateStudent);
router.put('/:id/activate', authMiddleware, adminOnly, activateStudent);
router.get('/:id', authMiddleware, getStudentById);
router.post('/', authMiddleware, adminOnly, validateStudent, createStudent);
router.put('/:id', authMiddleware, adminOnly, validateStudentUpdate, updateStudent);

export default router;
