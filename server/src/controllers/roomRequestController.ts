import { Response } from 'express';
import mongoose from 'mongoose';
import RoomRequest from '../models/RoomRequest';
import Room from '../models/Room';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from './notificationController';

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
        `Your room request for ${request.roomNumber} was approved by admin.`,
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
        `Your room request for ${request.roomNumber} was rejected`,
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
