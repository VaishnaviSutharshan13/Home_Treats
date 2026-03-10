import { Request, Response } from 'express';
import Student from '../models/Student';
import User from '../models/User';
import { createNotification } from './notificationController';
import { logAdminAction } from './adminLogController';
import { AuthRequest } from '../middleware/auth';

const mapUserToStudentView = (user: any) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '-',
  studentId: user.studentId || `USR-${String(user._id).slice(-6).toUpperCase()}`,
  room: user.room || 'Not Assigned',
  course: user.course || 'General',
  year: '1st Year',
  joinDate: user.createdAt,
  status: user.isActive ? 'Active' : 'Inactive',
  fees: 'Pending',
  createdAt: user.createdAt,
});

// GET all students
export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const [students, userStudents] = await Promise.all([
      Student.find().sort({ createdAt: -1 }),
      User.find({ role: 'student' }).sort({ createdAt: -1 }),
    ]);

    const mappedUsers = userStudents.map(mapUserToStudentView);

    // Prefer Student records where IDs overlap; otherwise include users as student rows.
    const studentIds = new Set(students.map((s: any) => String(s._id)));
    const merged = [...students, ...mappedUsers.filter((u: any) => !studentIds.has(String(u._id)))];

    res.json({
      success: true,
      count: merged.length,
      data: merged,
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
      const userStudent = await User.findOne({ _id: req.params.id, role: 'student' });
      if (!userStudent) {
        return res.status(404).json({
          success: false,
          message: 'Student not found',
        });
      }

      return res.json({ success: true, data: mapUserToStudentView(userStudent) });
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
      const userUpdate: Record<string, any> = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        studentId: req.body.studentId,
        room: req.body.room,
        course: req.body.course,
      };

      if (req.body.status) {
        userUpdate.isActive = req.body.status === 'Active';
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: req.params.id, role: 'student' },
        userUpdate,
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'Student not found',
        });
      }

      if (req.user) {
        await logAdminAction(req.user.email, String(req.user.id), 'Updated student details', 'student', String(req.params.id), updatedUser.name);
      }

      return res.json({
        success: true,
        message: 'Student updated successfully',
        data: mapUserToStudentView(updatedUser),
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
      const userStudent = await User.findOneAndDelete({ _id: req.params.id, role: 'student' });
      if (!userStudent) {
        return res.status(404).json({
          success: false,
          message: 'Student not found',
        });
      }

      if (req.user) {
        await logAdminAction(req.user.email, String(req.user.id), 'Deleted a student', 'student', String(req.params.id), userStudent.name);
      }

      return res.json({
        success: true,
        message: 'Student deleted successfully',
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
    const [students, userStudents] = await Promise.all([
      Student.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { studentId: { $regex: q, $options: 'i' } },
          { room: { $regex: q, $options: 'i' } },
          { course: { $regex: q, $options: 'i' } },
        ],
      }).sort({ createdAt: -1 }),
      User.find({
        role: 'student',
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { studentId: { $regex: q, $options: 'i' } },
          { room: { $regex: q, $options: 'i' } },
          { course: { $regex: q, $options: 'i' } },
        ],
      }).sort({ createdAt: -1 }),
    ]);

    const mappedUsers = userStudents.map(mapUserToStudentView);
    const studentIds = new Set(students.map((s: any) => String(s._id)));
    const merged = [...students, ...mappedUsers.filter((u: any) => !studentIds.has(String(u._id)))];

    res.json({
      success: true,
      count: merged.length,
      data: merged,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error searching students',
      error: error.message,
    });
  }
};
