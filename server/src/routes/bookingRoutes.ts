import { Router } from 'express';
import { body } from 'express-validator';
import {
  confirmBooking,
  getMyBooking,
  getAllBookings,
  updateBookingStatus,
} from '../controllers/bookingController';
import { authMiddleware, adminOnly, studentOnly } from '../middleware/auth';

const router = Router();

router.post(
  '/confirm',
  authMiddleware,
  studentOnly,
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('selectedFloor').notEmpty().withMessage('Selected floor is required'),
    body('roomId').optional().isString().withMessage('Room id must be a string'),
    body('roomNumber').optional().isString().withMessage('Room number must be a string'),
  ],
  confirmBooking
);

router.get('/my-booking', authMiddleware, studentOnly, getMyBooking);

router.get('/admin', authMiddleware, adminOnly, getAllBookings);

router.put(
  '/:id/status',
  authMiddleware,
  adminOnly,
  [body('status').isIn(['Confirmed', 'Cancelled']).withMessage('Invalid booking status')],
  updateBookingStatus
);

export default router;
