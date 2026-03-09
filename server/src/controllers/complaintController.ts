import { Request, Response } from 'express';
import Complaint from '../models/Complaint';
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

    // Notification for new complaint
    await createNotification('New Complaint', `New complaint submitted for Room ${savedComplaint.room}`, 'complaint');

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
    res.json({ success: true, message: 'Comment added', data: complaint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error adding comment', error: error.message });
  }
};
