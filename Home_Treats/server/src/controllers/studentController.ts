import { Request, Response } from 'express';
import Student from '../models/Student';
import { createNotification } from './notificationController';
import { logAdminAction } from './adminLogController';
import { AuthRequest } from '../middleware/auth';

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
    const student = await Student.findById(req.params.id);
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
      joinDate: new Date(),
      status: 'Active',
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
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
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
