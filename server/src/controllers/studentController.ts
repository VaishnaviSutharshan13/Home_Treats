import { Request, Response } from 'express';
import Student from '../models/Student';
import User from '../models/User';
import { createNotification } from './notificationController';
import { logAdminAction } from './adminLogController';
import { AuthRequest } from '../middleware/auth';

const syncUserStatusByStudent = async (
  student: { studentId: string; email: string },
  status: 'Pending' | 'Approved' | 'Rejected'
) => {
  await User.findOneAndUpdate(
    {
      $or: [
        { studentId: student.studentId },
        { email: student.email },
      ],
    },
    { status },
    { new: true }
  );
};

// GET all students
export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message,
    });
  }
};

// GET single student
export const getStudentById = async (req: Request, res: Response) => {
  try {
    let student = await Student.findById(req.params.id);
    if (!student) {
      student = await Student.findOne({ studentId: req.params.id });
    }
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }
    res.json({ success: true, data: student });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message,
    });
  }
};

// CREATE student
export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const student = new Student({
      ...req.body,
      status: req.body.status || 'Approved',
      roomNumber: req.body.roomNumber || req.body.room || '',
      room: req.body.room || req.body.roomNumber || '',
    });
    const savedStudent = await student.save();

    // Notification + Admin Log
    await createNotification('New Student', `New student registered: ${savedStudent.name}`, 'student');
    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), 'Added a student', 'student', String(savedStudent._id), savedStudent.name);
    }

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: savedStudent,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating student',
      error: error.message,
    });
  }
};

// UPDATE student
export const updateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const payload = {
      ...req.body,
      roomNumber: req.body.roomNumber ?? req.body.room,
      room: req.body.room ?? req.body.roomNumber,
    };

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), 'Updated student details', 'student', String(req.params.id), student.name);
    }

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating student',
      error: error.message,
    });
  }
};

export const getStudentApprovals = async (_req: Request, res: Response) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student approvals',
      error: error.message,
    });
  }
};

export const approveStudent = async (req: AuthRequest, res: Response) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.status = 'Approved';
    await student.save();
    await syncUserStatusByStudent({ studentId: student.studentId, email: student.email }, 'Approved');

    await createNotification(
      'Account Approved',
      'Your hostel account has been approved. You can now access student dashboard and services.',
      'account',
      student.studentId
    );

    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), 'Approved student account', 'student', String(student._id), student.name);
    }

    res.json({ success: true, message: 'Student approved successfully', data: student });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error approving student',
      error: error.message,
    });
  }
};

export const rejectStudent = async (req: AuthRequest, res: Response) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.status = 'Rejected';
    await student.save();
    await syncUserStatusByStudent({ studentId: student.studentId, email: student.email }, 'Rejected');

    await createNotification(
      'Account Rejected',
      'Your hostel registration was rejected. Please contact hostel admin for further assistance.',
      'account',
      student.studentId
    );

    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), 'Rejected student account', 'student', String(student._id), student.name);
    }

    res.json({ success: true, message: 'Student rejected successfully', data: student });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting student',
      error: error.message,
    });
  }
};

// DELETE student
export const deleteStudent = async (req: AuthRequest, res: Response) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }
    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), 'Deleted a student', 'student', String(req.params.id), (student as any).name);
    }

    res.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message,
    });
  }
};

// SEARCH students
export const searchStudents = async (req: Request, res: Response) => {
  try {
    const q = req.params.query as string;
    const students = await Student.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { studentId: { $regex: q, $options: 'i' } },
        { room: { $regex: q, $options: 'i' } },
        { course: { $regex: q, $options: 'i' } },
      ],
    }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error searching students',
      error: error.message,
    });
  }
};
