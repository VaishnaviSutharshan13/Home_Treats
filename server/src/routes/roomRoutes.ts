import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  allocateRoom,
  vacateRoom,
} from '../controllers/roomController';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { uploadRoomImage } from '../middleware/upload';

const router = Router();

// Validation middleware
const validateRoom = [
  body('name').notEmpty().withMessage('Room name is required'),
  body('roomNumber').notEmpty().withMessage('Room number is required'),
  body('block').notEmpty().withMessage('Block is required'),
  body('floor').notEmpty().withMessage('Floor is required'),
  body('capacity').isInt({ min: 1, max: 10 }).withMessage('Capacity must be between 1 and 10'),
  body('type').notEmpty().withMessage('Room type is required'),
  body('price').isFloat({ min: 4000 }).withMessage('Minimum room price is LKR 4,000'),
];

const validateRoomUpdate = [
  body('name').optional().notEmpty().withMessage('Room name is required'),
  body('roomNumber').optional().notEmpty().withMessage('Room number is required'),
  body('block').optional().notEmpty().withMessage('Block is required'),
  body('floor').optional().notEmpty().withMessage('Floor is required'),
  body('capacity').optional().isInt({ min: 1, max: 6 }).withMessage('Capacity must be between 1 and 6'),
  body('type').optional().notEmpty().withMessage('Room type is required'),
  body('price').optional().isFloat({ min: 4000 }).withMessage('Minimum room price is LKR 4,000'),
  body('status').optional().isIn(['Available', 'Occupied', 'Maintenance']).withMessage('Invalid status'),
];

const validateAllocate = [
  body('studentId').notEmpty().withMessage('Student ID is required'),
];

// Public room discovery routes
router.get('/', getAllRooms);
router.get('/:id', getRoomById);

// Admin routes with Multer image upload
router.post('/', authMiddleware, adminOnly, uploadRoomImage.single('image'), validateRoom, createRoom);
router.put('/:id', authMiddleware, adminOnly, uploadRoomImage.single('image'), validateRoomUpdate, updateRoom);
router.delete('/:id', authMiddleware, adminOnly, deleteRoom);
router.put('/:id/allocate', authMiddleware, adminOnly, validateAllocate, allocateRoom);
router.put('/:id/vacate', authMiddleware, adminOnly, vacateRoom);

export default router;
