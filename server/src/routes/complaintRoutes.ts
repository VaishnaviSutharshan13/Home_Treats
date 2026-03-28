import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllComplaints,
  getComplaintById,
  getCurrentUserComplaints,
  getComplaintsByStudent,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  assignComplaint,
  resolveComplaint,
  addComment,
} from '../controllers/complaintController';
import { authMiddleware, adminOnly, approvedStudentOrAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Validation middleware
const validateComplaint = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5 })
    .withMessage('Title must be at least 5 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Maintenance', 'IT Support', 'Plumbing', 'Electrical', 'Housekeeping'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be one of Low, Medium, High'),
];

const validateComplaintUpdate = [
  body('title').optional().trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').optional().trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('category')
    .optional()
    .trim()
    .isIn(['Maintenance', 'IT Support', 'Plumbing', 'Electrical', 'Housekeeping'])
    .withMessage('Invalid category'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Resolved', 'Rejected']).withMessage('Invalid status'),
  body('assignedTo').optional().trim().isLength({ min: 2 }).withMessage('Assigned to must be at least 2 characters'),
  body('resolutionNotes').optional().trim().isLength({ min: 5 }).withMessage('Resolution notes must be at least 5 characters'),
  body('rejectionReason').optional().trim().isLength({ min: 5 }).withMessage('Rejection reason must be at least 5 characters'),
];

const validateAssign = [
  body('assignedTo').trim().notEmpty().withMessage('Assigned to is required'),
  body('estimatedResolution').optional().isISO8601().withMessage('Estimated resolution must be a valid date'),
];

const validateResolve: any[] = [
  body('resolutionNotes').optional().trim().isLength({ min: 5 }).withMessage('Resolution notes must be at least 5 characters'),
  body('rejectionReason').optional().trim().isLength({ min: 5 }).withMessage('Rejection reason must be at least 5 characters'),
];

const validateComment = [
  body('text').trim().notEmpty().withMessage('Comment text is required').isLength({ min: 2 }).withMessage('Comment is too short'),
  body('author').optional().trim(),
];

// Routes — List all complaints requires admin
router.get('/', authMiddleware, adminOnly, getAllComplaints);
router.get('/user', authMiddleware, approvedStudentOrAdmin, getCurrentUserComplaints);
router.get('/student/:studentId', authMiddleware, approvedStudentOrAdmin, getComplaintsByStudent);
router.get('/:id', authMiddleware, getComplaintById);
router.post('/', authMiddleware, approvedStudentOrAdmin, validateComplaint, validateRequest, createComplaint);
router.put('/:id', authMiddleware, approvedStudentOrAdmin, validateComplaintUpdate, validateRequest, updateComplaint);
router.delete('/:id', authMiddleware, approvedStudentOrAdmin, deleteComplaint);
router.put('/:id/assign', authMiddleware, adminOnly, validateAssign, validateRequest, assignComplaint);
router.put('/:id/resolve', authMiddleware, adminOnly, validateResolve, validateRequest, resolveComplaint);
router.post('/:id/comment', authMiddleware, validateComment, validateRequest, addComment);

export default router;
