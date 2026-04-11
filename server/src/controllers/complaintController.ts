import { Request, Response } from 'express';
import Complaint from '../models/Complaint';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from './notificationController';
import { logAdminAction } from './adminLogController';
import User from '../models/User';

const ALLOWED_CATEGORIES = ['Maintenance', 'IT Support', 'Plumbing', 'Electrical', 'Housekeeping'];
const ALLOWED_PRIORITIES = ['High', 'Medium', 'Low'];
const ALLOWED_STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
const ADMIN_ALLOWED_STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

const isOwnerComplaint = async (complaint: any, userId: string) => {
  if (String(complaint.createdBy || '') === String(userId)) return true;
  const user = await User.findById(userId).select('studentId name');
  if (!user) return false;
  return complaint.student === user.studentId || complaint.student === user.name;
};

const sanitizeCreatePayload = (body: any) => {
  return {
    title: String(body.title || '').trim(),
    description: String(body.description || '').trim(),
    category: String(body.category || '').trim(),
    priority: String(body.priority || 'Medium').trim(),
    student: String(body.student || '').trim(),
    room: String(body.room || '').trim(),
  };
};

const sanitizeUpdatePayload = (body: any) => {
  const next: Record<string, any> = {};

  if (typeof body.title === 'string') next.title = body.title.trim();
  if (typeof body.description === 'string') next.description = body.description.trim();
  if (typeof body.category === 'string') next.category = body.category.trim();
  if (typeof body.priority === 'string') next.priority = body.priority.trim();
  if (typeof body.status === 'string') next.status = body.status.trim();
  if (typeof body.assignedTo === 'string') next.assignedTo = body.assignedTo.trim();
  if (typeof body.resolutionNotes === 'string') next.resolutionNotes = body.resolutionNotes.trim();
  if (typeof body.rejectionReason === 'string') next.rejectionReason = body.rejectionReason.trim();
  if (body.estimatedResolution) next.estimatedResolution = body.estimatedResolution;
  if (typeof body.student === 'string') next.student = body.student.trim();
  if (typeof body.room === 'string') next.room = body.room.trim();

  return next;
};

const isValidStatusTransition = (currentStatus: string, nextStatus: string) => {
  if (currentStatus === nextStatus) return true;
  if (!ADMIN_ALLOWED_STATUSES.includes(currentStatus) || !ADMIN_ALLOWED_STATUSES.includes(nextStatus)) return false;
  if (currentStatus === 'Pending') return nextStatus === 'In Progress' || nextStatus === 'Rejected';
  if (currentStatus === 'In Progress') return nextStatus === 'Resolved' || nextStatus === 'Rejected';
  return false;
};

// GET all complaints
export const getAllComplaints = async (req: Request, res: Response) => {
  try {
    const { search = '', category = '', status = '', priority = '' } = req.query as Record<string, string>;

    const filters: Record<string, any> = {};
    if (category && category !== 'All') filters.category = category;
    if (status && status !== 'All') filters.status = status;
    if (priority && priority !== 'All') filters.priority = priority;

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filters.$or = [
        { title: regex },
        { description: regex },
        { student: regex },
        { room: regex },
        { category: regex },
      ];
    }

    const complaints = await Complaint.find(filters).sort({ createdAt: -1 });
    res.json({ success: true, count: complaints.length, data: complaints });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching complaints', error: error.message });
  }
};

// GET complaints for current student
export const getCurrentUserComplaints = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id).select('studentId name');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const complaints = await Complaint.find({
      $or: [
        { createdBy: req.user.id },
        { student: user.studentId || '__unknown__' },
        { student: user.name || '__unknown__' },
      ],
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: complaints.length, data: complaints });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching complaints', error: error.message });
  }
};

// GET complaints by student (self-access: students can only view their own)
export const getComplaintsByStudent = async (req: AuthRequest, res: Response) => {
  try {
    // Students can only access their own complaints
    if (req.user?.role === 'student') {
      const User = (await import('../models/User')).default;
      const currentUser = await User.findById(req.user.id);
      if (!currentUser || currentUser.studentId !== req.params.studentId) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only view your own complaints.' });
      }
    }
    const complaints = await Complaint.find({ student: req.params.studentId }).sort({ createdAt: -1 });
    res.json({ success: true, count: complaints.length, data: complaints });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching complaints', error: error.message });
  }
};

// GET single complaint
export const getComplaintById = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (authReq.user?.role === 'student') {
      const isOwner = await isOwnerComplaint(complaint, authReq.user.id);
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    res.json({ success: true, data: complaint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching complaint', error: error.message });
  }
};

// CREATE complaint (student submits)
export const createComplaint = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (req.user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admins cannot create complaints' });
    }

    const payload = sanitizeCreatePayload(req.body);
    if (!payload.title || !payload.description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }
    if (payload.description.length < 20) {
      return res.status(400).json({ success: false, message: 'Description must be at least 20 characters' });
    }
    if (!ALLOWED_CATEGORIES.includes(payload.category)) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }
    if (!ALLOWED_PRIORITIES.includes(payload.priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority' });
    }

    const user = await User.findById(req.user.id).select('name studentId room roomNumber');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isStudent = req.user.role === 'student';
    const studentValue = isStudent
      ? (user.studentId || user.name || payload.student)
      : payload.student;
    const roomValue = isStudent
      ? (user.room || user.roomNumber || payload.room)
      : payload.room;

    if (!studentValue || !roomValue) {
      return res.status(400).json({ success: false, message: 'Student and room are required' });
    }

    const complaint = new Complaint({
      title: payload.title,
      description: payload.description,
      category: payload.category,
      priority: payload.priority,
      student: studentValue,
      room: roomValue,
      createdBy: req.user.id,
      status: 'Pending',
      submittedDate: new Date(),
    });
    const savedComplaint = await complaint.save();

    const studentUser = await User.findOne({ role: 'student', studentId: savedComplaint.student }).select('_id name');

    // Notification for admins
    await createNotification(
      'Complaint Received',
      `New complaint from Student ${savedComplaint.student} for Room ${savedComplaint.room}.`,
      'complaint',
      {
        source: 'Complaint Management',
        recipientType: 'all_admins',
        relatedModuleId: String(savedComplaint._id),
        priority: 'important',
      }
    );

    // Notification for student
    if (studentUser) {
      await createNotification(
        'Complaint Received',
        `Your complaint "${savedComplaint.title}" has been received and is pending review.`,
        'complaint',
        {
          source: 'Complaint Management',
          recipientUserId: String(studentUser._id),
          relatedModuleId: String(savedComplaint._id),
          priority: 'normal',
        }
      );
    }

    res.status(201).json({ success: true, message: 'Complaint submitted successfully', data: savedComplaint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error creating complaint', error: error.message });
  }
};

// UPDATE complaint
export const updateComplaint = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const studentUser = await User.findOne({ role: 'student', studentId: complaint.student }).select('_id name');

    if (studentUser) {
      await createNotification(
        'Complaint Updated',
        `Your complaint "${complaint.title}" was updated by administration. Current status: ${complaint.status}.`,
        'complaint',
        {
          source: 'Complaint Management',
          recipientUserId: String(studentUser._id),
          relatedModuleId: String(complaint._id),
          priority: complaint.status === 'Resolved' ? 'success' : 'important',
        }
      );
    }

    const updatePayload = sanitizeUpdatePayload(req.body);

    if (req.user.role === 'student') {
      const isOwner = await isOwnerComplaint(complaint, req.user.id);
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      if (complaint.status !== 'Pending') {
        return res.status(400).json({ success: false, message: 'Only pending complaints can be edited' });
      }

      const allowedStudentFields = ['title', 'description', 'category', 'priority'];
      for (const field of allowedStudentFields) {
        if (updatePayload[field] !== undefined) {
          (complaint as any)[field] = updatePayload[field];
        }
      }
      complaint.status = 'Pending';
      complaint.rejectionReason = '';
      complaint.assignedTo = '';
      complaint.estimatedResolution = undefined;
      complaint.resolvedDate = undefined;
    } else {
      if (updatePayload.status && !ADMIN_ALLOWED_STATUSES.includes(updatePayload.status)) {
        return res.status(400).json({ success: false, message: 'Invalid status for admin update' });
      }

      if (updatePayload.status && !isValidStatusTransition(complaint.status, updatePayload.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition from ${complaint.status} to ${updatePayload.status}`,
        });
      }

      if (updatePayload.status === 'In Progress' && !String(updatePayload.assignedTo || complaint.assignedTo || '').trim()) {
        return res.status(400).json({ success: false, message: 'Assigned to is required when moving complaint to In Progress' });
      }

      if (updatePayload.status === 'Rejected' && !String(updatePayload.rejectionReason || complaint.rejectionReason || '').trim()) {
        return res.status(400).json({ success: false, message: 'Rejection reason is required when rejecting complaint' });
      }

      Object.entries(updatePayload).forEach(([key, value]) => {
        (complaint as any)[key] = value;
      });

      if (updatePayload.status === 'Resolved' || updatePayload.status === 'Rejected') {
        complaint.resolvedDate = new Date();
      }

      if (updatePayload.status === 'Resolved') {
        complaint.rejectionReason = '';
      }

      if (updatePayload.status === 'Rejected') {
        complaint.resolutionNotes = '';
      }

      if (updatePayload.status === 'Pending') {
        complaint.rejectionReason = '';
        complaint.resolutionNotes = '';
        complaint.resolvedDate = undefined;
      }

      await logAdminAction(req.user.email, String(req.user.id), 'Updated complaint', 'complaint', String(req.params.id), complaint.title);
    }

    if (updatePayload.category && !ALLOWED_CATEGORIES.includes(updatePayload.category)) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }
    if (updatePayload.priority && !ALLOWED_PRIORITIES.includes(updatePayload.priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority' });
    }
    if (updatePayload.status && !ALLOWED_STATUSES.includes(updatePayload.status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await complaint.save();

    res.json({ success: true, message: 'Complaint updated successfully', data: complaint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error updating complaint', error: error.message });
  }
};

// DELETE complaint
export const deleteComplaint = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (req.user.role === 'student') {
      const isOwner = await isOwnerComplaint(complaint, req.user.id);
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      if (complaint.status !== 'Pending') {
        return res.status(400).json({ success: false, message: 'Only pending complaints can be deleted' });
      }
    }

    await Complaint.findByIdAndDelete(req.params.id);

    if (req.user.role === 'admin') {
      await logAdminAction(req.user.email, String(req.user.id), 'Deleted complaint', 'complaint', String(req.params.id), complaint.title);
    }

    res.json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error deleting complaint', error: error.message });
  }
};

// ASSIGN complaint (admin sets In Progress)
export const assignComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.assignedTo = String(req.body.assignedTo || '').trim();
    if (!complaint.assignedTo) {
      return res.status(400).json({ success: false, message: 'Assigned to is required' });
    }

    if (req.body.estimatedResolution) complaint.estimatedResolution = req.body.estimatedResolution;
    complaint.status = 'In Progress';
    complaint.rejectionReason = '';
    complaint.resolutionNotes = '';

    await complaint.save();

    const studentUser = await User.findOne({ role: 'student', studentId: complaint.student }).select('_id name');
    if (studentUser) {
      await createNotification(
        'Complaint Status Updated',
        `Your complaint "${complaint.title}" is now In Progress and assigned to ${complaint.assignedTo}.`,
        'complaint',
        {
          source: 'Complaint Management',
          recipientUserId: String(studentUser._id),
          relatedModuleId: String(complaint._id),
          priority: 'important',
        }
      );
    }

    res.json({ success: true, message: 'Complaint assigned successfully', data: complaint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error assigning complaint', error: error.message });
  }
};

// RESOLVE / REJECT complaint
export const resolveComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (req.body.rejectionReason) {
      complaint.status = 'Rejected';
      complaint.rejectionReason = String(req.body.rejectionReason).trim();
      complaint.resolutionNotes = '';
    } else {
      complaint.status = 'Resolved';
      complaint.rejectionReason = '';
      complaint.resolutionNotes = String(req.body.resolutionNotes || '').trim();
    }
    complaint.resolvedDate = new Date();

    await complaint.save();

    const studentUser = await User.findOne({ role: 'student', studentId: complaint.student }).select('_id name');
    if (studentUser) {
      await createNotification(
        complaint.status === 'Resolved' ? 'Complaint Resolved' : 'Complaint Rejected',
        complaint.status === 'Resolved'
          ? `Your complaint "${complaint.title}" has been resolved.`
          : `Your complaint "${complaint.title}" was rejected. Reason: ${complaint.rejectionReason || 'Not specified'}.`,
        'complaint',
        {
          source: 'Complaint Management',
          recipientUserId: String(studentUser._id),
          relatedModuleId: String(complaint._id),
          priority: complaint.status === 'Resolved' ? 'success' : 'urgent',
        }
      );
    }

    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), `${complaint.status === 'Resolved' ? 'Resolved' : 'Rejected'} a complaint`, 'complaint', String(req.params.id), complaint.title);
    }

    res.json({ success: true, message: `Complaint ${complaint.status.toLowerCase()} successfully`, data: complaint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error resolving complaint', error: error.message });
  }
};

// ADD COMMENT to complaint (admin/technician)
export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (req.user.role === 'student') {
      const isOwner = await isOwnerComplaint(complaint, req.user.id);
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const text = String(req.body.text || '').trim();
    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const author = String(req.body.author || '').trim() || req.user.email;

    complaint.comments.push({
      text,
      author,
      createdAt: new Date(),
    });

    await complaint.save();

    const studentUser = await User.findOne({ role: 'student', studentId: complaint.student }).select('_id name');
    if (studentUser) {
      await createNotification(
        'Admin Response Added',
        `A new response was added to your complaint "${complaint.title}".`,
        'complaint',
        {
          source: 'Complaint Management',
          recipientUserId: String(studentUser._id),
          relatedModuleId: String(complaint._id),
          priority: 'normal',
        }
      );
    }

    res.json({ success: true, message: 'Comment added', data: complaint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error adding comment', error: error.message });
  }
};
