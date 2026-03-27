import { Request, Response } from 'express';
import Complaint from '../models/Complaint';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from './notificationController';
import { logAdminAction } from './adminLogController';

// GET all complaints
export const getAllComplaints = async (req: Request, res: Response) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
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
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    res.json({ success: true, data: complaint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching complaint', error: error.message });
  }
};

// CREATE complaint (student submits)
export const createComplaint = async (req: Request, res: Response) => {
  try {
    const complaint = new Complaint({
      title: req.body.title,
      description: req.body.description,
      student: req.body.student,
      room: req.body.room,
      category: req.body.category,
      priority: req.body.priority || 'Medium',
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
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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

    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), 'Updated complaint', 'complaint', String(req.params.id), complaint.title);
    }

    res.json({ success: true, message: 'Complaint updated successfully', data: complaint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error updating complaint', error: error.message });
  }
};

// DELETE complaint
export const deleteComplaint = async (req: Request, res: Response) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    res.json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error deleting complaint', error: error.message });
  }
};

// ASSIGN complaint (admin sets In Progress)
export const assignComplaint = async (req: Request, res: Response) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.assignedTo = req.body.assignedTo;
    if (req.body.estimatedResolution) complaint.estimatedResolution = req.body.estimatedResolution;
    complaint.status = 'In Progress';

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
      complaint.rejectionReason = req.body.rejectionReason;
    } else {
      complaint.status = 'Resolved';
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
export const addComment = async (req: Request, res: Response) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.comments.push({
      text: req.body.text,
      author: req.body.author,
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
