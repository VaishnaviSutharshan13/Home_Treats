import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllComplaints,
  getComplaintById,
  getComplaintsByStudent,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  assignComplaint,
  resolveComplaint,
  addComment,
} from '../controllers/complaintController';
import { authMiddleware, adminOnly, approvedStudentOnly, approvedStudentOrAdmin } from '../middleware/auth';

const router = Router();

// Validation middleware
const validateComplaint = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('student').notEmpty().withMessage('Student name is required'),
  body('room').notEmpty().withMessage('Room number is required'),
  body('category').notEmpty().withMessage('Category is required'),
];

const validateAssign = [
  body('assignedTo').notEmpty().withMessage('Assigned to is required'),
];

const validateResolve: any[] = [];

const validateComment = [
  body('text').notEmpty().withMessage('Comment text is required'),
  body('author').notEmpty().withMessage('Author is required'),
];

// Routes — List all complaints requires admin
router.get('/', authMiddleware, adminOnly, getAllComplaints);
router.get('/student/:studentId', authMiddleware, approvedStudentOrAdmin, getComplaintsByStudent);
router.get('/:id', authMiddleware, getComplaintById);
router.post('/', authMiddleware, approvedStudentOnly, validateComplaint, createComplaint);
router.put('/:id', authMiddleware, adminOnly, updateComplaint);
router.delete('/:id', authMiddleware, adminOnly, deleteComplaint);
router.put('/:id/assign', authMiddleware, adminOnly, validateAssign, assignComplaint);
router.put('/:id/resolve', authMiddleware, adminOnly, validateResolve, resolveComplaint);
router.post('/:id/comment', authMiddleware, validateComment, addComment);

export default router;
