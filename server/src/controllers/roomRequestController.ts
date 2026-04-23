import { Response } from 'express';
import mongoose from 'mongoose';
import RoomRequest from '../models/RoomRequest';
import RoomChangeRequest from '../models/RoomChangeRequest';
import Room from '../models/Room';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from './notificationController';

const ACTIVE_ROOM_REQUEST_STATUSES = ['Pending', 'Approved'] as const;
const REAPPLY_ALLOWED_STATUSES = ['Rejected', 'Cancelled'] as const;

type RoomRequestStatus = (typeof ACTIVE_ROOM_REQUEST_STATUSES)[number] | (typeof REAPPLY_ALLOWED_STATUSES)[number];

const getLatestRoomRequest = async (payload: { userId?: string; email?: string }) => {
  const filters: any[] = [];
  if (payload.userId && mongoose.isValidObjectId(payload.userId)) {
    filters.push({ userId: payload.userId });
  }
  if (payload.email) {
    filters.push({ email: String(payload.email).toLowerCase().trim() });
  }

  if (!filters.length) return null;

  const query = filters.length === 1 ? filters[0] : { $or: filters };
  return RoomRequest.findOne(query).sort({ createdAt: -1 });
};

/**
 * Create a new room request
 */
export const createRoomRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const latestRequest = await getLatestRoomRequest({
      userId: String(userId || ''),
      email: user.email,
    });

    if (latestRequest && ACTIVE_ROOM_REQUEST_STATUSES.includes(latestRequest.status as any)) {
      return res.status(400).json({
        success: false,
        message: 'User already has active request.',
        data: {
          status: latestRequest.status,
          requestId: latestRequest._id,
        },
      });
    }

    const {
      studentName,
      email,
      phone,
      studentId,
      nic,
      landline,
      moveInDate,
      duration,
      specialRequest,
      roomNumber,
      roomId,
      floor,
      building,
      roomType,
      monthlyFee,
    } = req.body;

    // Validate required fields
    if (!studentName || !email || !phone || !studentId || !nic || !moveInDate || !duration || !roomNumber || !roomId || !floor || !building || !roomType) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate roomId is a valid ObjectId
    if (!mongoose.isValidObjectId(roomId)) {
      return res.status(400).json({ success: false, message: 'Invalid room id' });
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Create room request
    const roomRequest = new RoomRequest({
      userId,
      studentName,
      email: email.toLowerCase(),
      phone,
      studentId,
      nic,
      landline: landline || '',
      moveInDate: new Date(moveInDate),
      duration,
      specialRequest: specialRequest || '',
      roomNumber,
      roomId,
      floor,
      building,
      roomType,
      monthlyFee: monthlyFee || 0,
      status: 'Pending',
    });

    await roomRequest.save();

    // Create notification for all admins
    await createNotification(
      'New Room Request',
      `${studentName} requested Room ${roomNumber}`,
      'room',
      {
        source: 'Room Management',
        recipientType: 'all_admins',
        relatedModuleId: roomRequest._id.toString(),
        priority: 'important',
      }
    );

    return res.status(201).json({
      success: true,
      message: 'Room request submitted successfully',
      data: roomRequest,
    });
  } catch (error: any) {
    console.error('Error creating room request:', error);

    if (error?.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message || 'Room request validation failed',
      });
    }

    return res.status(500).json({ success: false, message: error.message || 'Failed to create room request' });
  }
};

/**
 * Get all room requests (admin only)
 */
export const getAllRoomRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const filter: any = {};

    if (status && ['Pending', 'Approved', 'Rejected'].includes(String(status))) {
      filter.status = status;
    }

    const requests = await RoomRequest.find(filter)
      .populate('userId', 'name email')
      .populate('roomId', 'roomNumber floor building')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    console.error('Error fetching room requests:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch room requests' });
  }
};

/**
 * Get user's room requests
 */
export const getMyRoomRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const requests = await RoomRequest.find({ userId })
      .populate('roomId', 'roomNumber floor building')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    console.error('Error fetching room requests:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch room requests' });
  }
};

/**
 * Get current user's latest room request status and eligibility
 */
export const getMyRoomRequestStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select('email');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const latestRequest = await getLatestRoomRequest({
      userId: String(userId || ''),
      email: user.email,
    });

    const latestStatus = (latestRequest?.status || null) as RoomRequestStatus | null;
    const hasActiveRequest = latestStatus ? ACTIVE_ROOM_REQUEST_STATUSES.includes(latestStatus as any) : false;

    let message = 'No previous room request found.';
    if (latestStatus === 'Pending') {
      message = 'You already submitted a room request. Please wait for admin approval.';
    } else if (latestStatus === 'Approved') {
      message = 'Your room request has already been approved.';
    } else if (latestStatus === 'Rejected') {
      message = 'Previous request rejected. Apply again.';
    } else if (latestStatus === 'Cancelled') {
      message = 'Previous request was cancelled. You can apply again.';
    }

    return res.status(200).json({
      success: true,
      message,
      data: {
        hasActiveRequest,
        canCreateRequest: !hasActiveRequest,
        latestStatus,
        latestRequest,
      },
    });
  } catch (error: any) {
    console.error('Error fetching latest room request status:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch room request status' });
  }
};

/**
 * Create room change request (student)
 */
export const createRoomChangeRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { newRoomNumber, reason } = req.body;

    if (!newRoomNumber || !String(newRoomNumber).trim()) {
      return res.status(400).json({ success: false, message: 'Please select a new room.' });
    }

    const user = await User.findById(userId).select('name email studentId room roomNumber role');
    if (!user || user.role !== 'student') {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const pending = await RoomChangeRequest.findOne({ userId: user._id, status: 'Pending' });
    if (pending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending room change request.',
      });
    }

    const normalizedTargetRoom = String(newRoomNumber).trim();

    let currentRoomNumber = String(user.roomNumber || '').trim();
    if (!currentRoomNumber && user.room && mongoose.isValidObjectId(String(user.room))) {
      const currentRoom = await Room.findById(String(user.room)).select('roomNumber');
      currentRoomNumber = String(currentRoom?.roomNumber || '').trim();
    }

    if (!currentRoomNumber) {
      return res.status(400).json({
        success: false,
        message: 'Current room not found for your account.',
      });
    }

    if (currentRoomNumber === normalizedTargetRoom) {
      return res.status(400).json({
        success: false,
        message: 'New room cannot be the same as current room.',
      });
    }

    const targetRoom = await Room.findOne({ roomNumber: normalizedTargetRoom });
    if (!targetRoom) {
      return res.status(404).json({ success: false, message: 'Selected room not found.' });
    }

    const isUnavailable =
      targetRoom.status === 'Maintenance' ||
      targetRoom.status === 'Occupied' ||
      Number(targetRoom.occupied || 0) >= Number(targetRoom.capacity || 0);

    if (isUnavailable) {
      return res.status(400).json({
        success: false,
        message: 'Selected room is not available right now.',
      });
    }

    const roomChangeRequest = await RoomChangeRequest.create({
      userId: user._id,
      email: String(user.email || '').toLowerCase(),
      studentId: String(user.studentId || '').trim().toUpperCase(),
      currentRoomNumber,
      newRoomNumber: normalizedTargetRoom,
      reason: String(reason || '').trim(),
      status: 'Pending',
    });

    await createNotification(
      'New Room Change Request',
      `${user.name} requested room change: ${currentRoomNumber} -> ${normalizedTargetRoom}`,
      'room',
      {
        source: 'Room Management',
        recipientType: 'all_admins',
        relatedModuleId: roomChangeRequest._id.toString(),
        priority: 'important',
      }
    );

    return res.status(201).json({
      success: true,
      message: 'Room change request submitted successfully. Waiting for admin approval.',
      data: roomChangeRequest,
    });
  } catch (error: any) {
    console.error('Error creating room change request:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to submit room change request' });
  }
};

/**
 * Get single room request
 */
export const getRoomRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid request id' });
    }

    const request = await RoomRequest.findById(id)
      .populate('userId', 'name email')
      .populate('roomId', 'roomNumber floor building');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Room request not found' });
    }

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error: any) {
    console.error('Error fetching room request:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch room request' });
  }
};

/**
 * Approve room request
 */
export const approveRoomRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid request id' });
    }

    const request = await RoomRequest.findByIdAndUpdate(
      id,
      { status: 'Approved' },
      { new: true }
    ).populate('userId', '_id email');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Room request not found' });
    }

    // Send notification to student
    if (request.userId) {
      const userId = (request.userId as any)._id?.toString() || request.userId.toString();
      await createNotification(
        'Room Request Approved',
        'Your room request has been approved.',
        'room',
        {
          source: 'Room Management',
          recipientType: 'single_student',
          recipientUserId: userId,
          relatedModuleId: request._id.toString(),
          priority: 'success',
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Room request approved',
      data: request,
    });
  } catch (error: any) {
    console.error('Error approving room request:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to approve room request' });
  }
};

/**
 * Reject room request
 */
export const rejectRoomRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid request id' });
    }

    const request = await RoomRequest.findByIdAndUpdate(
      id,
      { status: 'Rejected' },
      { new: true }
    ).populate('userId', '_id email');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Room request not found' });
    }

    // Send notification to student
    if (request.userId) {
      const userId = (request.userId as any)._id?.toString() || request.userId.toString();
      await createNotification(
        'Room Request Rejected',
        'Your room request was rejected. You may apply again.',
        'room',
        {
          source: 'Room Management',
          recipientType: 'single_student',
          recipientUserId: userId,
          relatedModuleId: request._id.toString(),
          priority: 'important',
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Room request rejected',
      data: request,
    });
  } catch (error: any) {
    console.error('Error rejecting room request:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to reject room request' });
  }
};

/**
 * Delete room request (admin only)
 */
export const deleteRoomRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid request id' });
    }

    const request = await RoomRequest.findByIdAndDelete(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Room request not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Room request deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting room request:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete room request' });
  }
};

/**
 * Get room request statistics (admin only)
 */
export const getRoomRequestStats = async (req: AuthRequest, res: Response) => {
  try {
    const pending = await RoomRequest.countDocuments({ status: 'Pending' });
    const approved = await RoomRequest.countDocuments({ status: 'Approved' });
    const rejected = await RoomRequest.countDocuments({ status: 'Rejected' });

    return res.status(200).json({
      success: true,
      data: {
        pending,
        approved,
        rejected,
        total: pending + approved + rejected,
      },
    });
  } catch (error: any) {
    console.error('Error fetching room request stats:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch room request stats' });
  }
};
