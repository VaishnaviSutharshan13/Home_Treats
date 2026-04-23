import { Router } from 'express';
import { body } from 'express-validator';
import {
  createRoomRequest,
  getAllRoomRequests,
  getMyRoomRequests,
  getMyRoomRequestStatus,
  createRoomChangeRequest,
  getRoomRequestById,
  approveRoomRequest,
  rejectRoomRequest,
  deleteRoomRequest,
  getRoomRequestStats,
} from '../controllers/roomRequestController';
import { authMiddleware, adminOnly, studentOnly } from '../middleware/auth';

const router = Router();

/**
 * Create a new room request (student)
 */
router.post(
  '/',
  authMiddleware,
  studentOnly,
  [
    body('studentName').notEmpty().withMessage('Student name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('nic').notEmpty().withMessage('NIC is required'),
    body('moveInDate').notEmpty().withMessage('Move-in date is required'),
    body('duration').isIn(['3_months', '6_months', '1_year']).withMessage('Invalid duration'),
    body('roomNumber').notEmpty().withMessage('Room number is required'),
    body('roomId').notEmpty().withMessage('Room ID is required'),
    body('floor').notEmpty().withMessage('Floor is required'),
    body('building').notEmpty().withMessage('Building is required'),
    body('roomType').notEmpty().withMessage('Room type is required'),
  ],
  createRoomRequest
);

/**
 * Get my room requests (student)
 */
router.get('/my-requests', authMiddleware, studentOnly, getMyRoomRequests);

/**
 * Get my latest room request status (student)
 */
router.get('/my-request-status', authMiddleware, studentOnly, getMyRoomRequestStatus);

/**
 * Create room change request (student)
 */
router.post(
  '/room-change',
  authMiddleware,
  studentOnly,
  [
    body('newRoomNumber').notEmpty().withMessage('New room number is required'),
    body('reason').optional().isString(),
  ],
  createRoomChangeRequest
);

/**
 * Get all room requests (admin only)
 */
router.get('/admin/all', authMiddleware, adminOnly, getAllRoomRequests);

/**
 * Get room request statistics (admin only)
 */
router.get('/admin/stats', authMiddleware, adminOnly, getRoomRequestStats);

/**
 * Get single room request
 */
router.get('/:id', authMiddleware, getRoomRequestById);

/**
 * Approve room request (admin only)
 */
router.patch(
  '/:id/approve',
  authMiddleware,
  adminOnly,
  approveRoomRequest
);

/**
 * Reject room request (admin only)
 */
router.patch(
  '/:id/reject',
  authMiddleware,
  adminOnly,
  rejectRoomRequest
);

/**
 * Delete room request (admin only)
 */
router.delete('/:id', authMiddleware, adminOnly, deleteRoomRequest);

export default router;
