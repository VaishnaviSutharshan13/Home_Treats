import { Request, Response } from 'express';
import User from '../models/User';
import Booking from '../models/Booking';
import Fee from '../models/Fee';
import Room from '../models/Room';
import { createNotification } from './notificationController';
import { logAdminAction } from './adminLogController';
import { AuthRequest } from '../middleware/auth';

const APPROVAL_STATUSES = ['Pending', 'Approved', 'Rejected', 'Inactive'] as const;

const computeFeeStatus = (statuses: string[]) => {
  if (statuses.includes('Overdue')) return 'Overdue';
  if (statuses.includes('Pending') || statuses.includes('Partial')) return 'Pending';
  if (statuses.includes('Paid')) return 'Paid';
  return 'Pending';
};

const mapUserToStudentView = (user: any, booking: any, feeStatuses: string[]) => {
  const derivedStatus = !user.isActive && (!user.approvalStatus || user.approvalStatus === 'Approved')
    ? 'Inactive'
    : (user.approvalStatus || 'Pending');

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || '-',
    studentId: user.studentId || `USR-${String(user._id).slice(-6).toUpperCase()}`,
    university: user.university || '-',
    gender: user.gender || '-',
    address: user.address || '-',
    emergencyContact: user.emergencyContact || '-',
    roomNumber: booking?.roomNumber || user.room || '',
    floor: booking?.selectedFloor || 'Not Assigned',
    bookingStatus: booking?.status || 'Not Booked',
    status: derivedStatus,
    isActive: user.isActive,
    fees: computeFeeStatus(feeStatuses),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const buildQueryFromFilters = (req: Request) => {
  const q = String(req.query.search || req.query.q || '').trim();
  const status = String(req.query.status || '').trim();

  const query: Record<string, any> = { role: 'student' };

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { studentId: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
  }

  if (APPROVAL_STATUSES.includes(status as any)) {
    query.approvalStatus = status;
  }

  return query;
};

const getStudentsWithRelations = async (req: Request) => {
  const query = buildQueryFromFilters(req);
  const floor = String(req.query.floor || '').trim();
  const roomNumber = String(req.query.roomNumber || '').trim();

  const students = await User.find(query).sort({ createdAt: -1 });
  const userIds = students.map((student) => student._id);
  const studentIds = students
    .map((student) => student.studentId)
    .filter((id): id is string => Boolean(id));

  const [bookings, fees] = await Promise.all([
    Booking.find({ userId: { $in: userIds }, status: 'Confirmed' }).sort({ createdAt: -1 }),
    Fee.find({ studentId: { $in: studentIds } }).select('studentId status'),
  ]);

  const bookingMap = new Map<string, any>();
  for (const booking of bookings) {
    const key = String(booking.userId);
    if (!bookingMap.has(key)) bookingMap.set(key, booking);
  }

  const feesMap = new Map<string, string[]>();
  for (const fee of fees) {
    const key = String(fee.studentId || '');
    const existing = feesMap.get(key) || [];
    existing.push(fee.status);
    feesMap.set(key, existing);
  }

  let data = students.map((student) => {
    const booking = bookingMap.get(String(student._id));
    const feeStatuses = feesMap.get(String(student.studentId || '')) || [];
    return mapUserToStudentView(student, booking, feeStatuses);
  });

  if (floor) data = data.filter((item) => item.floor.toLowerCase().includes(floor.toLowerCase()));
  if (roomNumber) data = data.filter((item) => item.roomNumber.toLowerCase().includes(roomNumber.toLowerCase()));

  return data;
};

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const data = await getStudentsWithRelations(req);
    res.json({ success: true, count: data.length, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching students', error: error.message });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const [booking, fees] = await Promise.all([
      Booking.findOne({ userId: student._id, status: 'Confirmed' }).sort({ createdAt: -1 }),
      Fee.find({ studentId: student.studentId || '' }).select('status'),
    ]);

    return res.json({
      success: true,
      data: mapUserToStudentView(student, booking, fees.map((fee) => fee.status)),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching student', error: error.message });
  }
};

export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      studentId,
      university,
      gender,
      address,
      emergencyContact,
      course,
      roomNumber,
      status,
    } = req.body;

    const normalizedEmail = String(email || '').toLowerCase().trim();
    const normalizedStudentId = String(studentId || '').toUpperCase().trim();

    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, { studentId: normalizedStudentId }],
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Student with same email or student ID already exists' });
    }

    const approvalStatus = APPROVAL_STATUSES.includes(status as any) ? status : 'Approved';

    const student = await User.create({
      name,
      email: normalizedEmail,
      password: password || 'Student@123',
      role: 'student',
      phone,
      studentId: normalizedStudentId,
      university,
      gender,
      address,
      emergencyContact,
      course,
      room: roomNumber || '',
      approvalStatus,
      approvedAt: approvalStatus === 'Approved' ? new Date() : undefined,
      rejectedAt: approvalStatus === 'Rejected' ? new Date() : undefined,
      isActive: approvalStatus === 'Approved' || approvalStatus === 'Pending',
    });

    if (approvalStatus === 'Approved') {
      await createNotification(
        'Registration Approved',
        'Your hostel account has been approved. You can now log in to the student dashboard.',
        'student',
        {
          source: 'Student Management',
          recipientUserId: String(student._id),
          priority: 'success',
        }
      );
    }

    if (approvalStatus === 'Inactive') {
      await createNotification(
        'Account Inactivated',
        'Your hostel account has been set to inactive by administration.',
        'student',
        {
          source: 'Student Management',
          recipientUserId: String(student._id),
          priority: 'important',
        }
      );
    }

    await createNotification(
      'New Student Added',
      `Student added: ${student.name} (${student.studentId})`,
      'student',
      { source: 'Student Management', recipientType: 'all_admins' }
    );

    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), 'Added a student', 'student', String(student._id), student.name);
    }

    return res.status(201).json({ success: true, message: 'Student created successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error creating student', error: error.message });
  }
};

export const updateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const allowedFields = ['roomNumber', 'status'];
    const providedFields = Object.keys(req.body || {});
    const disallowedFields = providedFields.filter((field) => !allowedFields.includes(field));

    if (disallowedFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Only roomNumber and status can be updated by admin. Disallowed fields: ${disallowedFields.join(', ')}`,
      });
    }

    const { roomNumber, status } = req.body;
    const nextRoomNumber = typeof roomNumber === 'string' ? roomNumber.trim() : undefined;

    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const previousStatus = student.approvalStatus || 'Pending';
    const previousRoom = String(student.room || '').trim();
    const studentRoomKey = student.studentId || String(student._id);

    let targetRoomDoc: any = null;
    let previousRoomDoc: any = null;

    if (roomNumber !== undefined) {
      if (nextRoomNumber) {
        targetRoomDoc = await Room.findOne({ roomNumber: nextRoomNumber });
        if (!targetRoomDoc) {
          return res.status(404).json({ success: false, message: 'Selected room not found' });
        }

        if (targetRoomDoc.status === 'Maintenance') {
          return res.status(400).json({ success: false, message: 'Selected room is under maintenance' });
        }

        const isRoomChanged = previousRoom !== nextRoomNumber;
        if (isRoomChanged && targetRoomDoc.occupied >= targetRoomDoc.capacity) {
          return res.status(409).json({
            success: false,
            message: `Room ${nextRoomNumber} is full. Please select a vacant room.`,
          });
        }
      }

      if (previousRoom && previousRoom !== nextRoomNumber) {
        previousRoomDoc = await Room.findOne({ roomNumber: previousRoom });
      }

      student.room = nextRoomNumber || '';
    }

    if (status && APPROVAL_STATUSES.includes(status)) {
      student.approvalStatus = status;
      student.approvedAt = status === 'Approved' ? new Date() : student.approvedAt;
      student.rejectedAt = status === 'Rejected' ? new Date() : undefined;
      if (status === 'Rejected' || status === 'Inactive') student.isActive = false;
      if (status === 'Approved') student.isActive = true;
    }

    await student.save();

    if (roomNumber !== undefined && previousRoom !== (nextRoomNumber || '')) {
      if (previousRoomDoc) {
        previousRoomDoc.students = (previousRoomDoc.students || []).filter((entry: string) => entry !== studentRoomKey);
        previousRoomDoc.occupied = Math.max(0, Number(previousRoomDoc.occupied || 0) - 1);
        if (previousRoomDoc.status !== 'Maintenance') {
          previousRoomDoc.status = previousRoomDoc.occupied >= previousRoomDoc.capacity ? 'Occupied' : 'Available';
        }
        await previousRoomDoc.save();
      }

      if (targetRoomDoc && nextRoomNumber) {
        const currentStudents = targetRoomDoc.students || [];
        if (!currentStudents.includes(studentRoomKey)) {
          targetRoomDoc.students = [...currentStudents, studentRoomKey];
        }
        targetRoomDoc.occupied = Math.min(targetRoomDoc.capacity, Number(targetRoomDoc.occupied || 0) + 1);
        targetRoomDoc.status = targetRoomDoc.occupied >= targetRoomDoc.capacity ? 'Occupied' : 'Available';
        await targetRoomDoc.save();
      }
    }

    if (roomNumber !== undefined && (nextRoomNumber || '') !== previousRoom) {
      await createNotification(
        'Room Assignment Updated',
        nextRoomNumber
          ? `Hi ${student.name}, your room assignment has been updated to ${nextRoomNumber}.`
          : `Hi ${student.name}, your room assignment has been removed by administration.`,
        'room',
        {
          source: 'Room Management',
          recipientUserId: String(student._id),
          priority: 'important',
        }
      );
    }

    if (status && status !== previousStatus) {
      const statusMap: Record<string, { title: string; message: string; priority: 'normal' | 'important' | 'urgent' | 'success' }> = {
        Approved: {
          title: 'Account Approved',
          message: `Hi ${student.name}, your account status is now Approved.`,
          priority: 'success',
        },
        Rejected: {
          title: 'Account Rejected',
          message: `Hi ${student.name}, your account status has been set to Rejected. Contact administration for details.`,
          priority: 'urgent',
        },
        Inactive: {
          title: 'Account Inactive',
          message: `Hi ${student.name}, your account has been set to Inactive by administration.`,
          priority: 'important',
        },
        Pending: {
          title: 'Account Pending Review',
          message: `Hi ${student.name}, your account status is now Pending review.`,
          priority: 'normal',
        },
      };

      const event = statusMap[status];
      if (event) {
        await createNotification(event.title, event.message, 'student', {
          source: 'Student Management',
          recipientUserId: String(student._id),
          priority: event.priority,
        });
      }
    }

    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), 'Updated student details', 'student', String(req.params.id), student.name);
    }

    return res.json({ success: true, message: 'Student updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error updating student', error: error.message });
  }
};

export const inactivateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.approvalStatus = 'Inactive';
    student.isActive = false;
    await student.save();

    await createNotification(
      'Account Inactivated',
      `Hi ${student.name}, your account has been marked inactive by administration. Please contact hostel administration for support.`,
      'student',
      {
        source: 'Student Management',
        recipientUserId: String(student._id),
        priority: 'important',
      }
    );

    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), 'Inactivated a student', 'student', String(req.params.id), student.name);
    }

    return res.json({ success: true, message: 'Student inactivated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error inactivating student', error: error.message });
  }
};

export const activateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.approvalStatus = 'Approved';
    student.approvedAt = new Date();
    student.rejectedAt = undefined;
    student.isActive = true;
    await student.save();

    await createNotification(
      'Account Activated',
      `Hi ${student.name}, your account has been activated. You can now access hostel services.`,
      'student',
      {
        source: 'Student Management',
        recipientUserId: String(student._id),
        priority: 'success',
      }
    );

    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), 'Activated a student', 'student', String(req.params.id), student.name);
    }

    return res.json({ success: true, message: 'Student activated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error activating student', error: error.message });
  }
};

export const searchStudents = async (req: Request, res: Response) => {
  try {
    req.query.search = req.params.query;
    const data = await getStudentsWithRelations(req);
    return res.json({ success: true, count: data.length, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error searching students', error: error.message });
  }
};

export const getPendingStudents = async (req: Request, res: Response) => {
  try {
    req.query.status = 'Pending';
    const data = await getStudentsWithRelations(req);
    return res.json({ success: true, count: data.length, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching pending students', error: error.message });
  }
};

export const approveStudent = async (req: AuthRequest, res: Response) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.approvalStatus = 'Approved';
    student.approvedAt = new Date();
    student.rejectedAt = undefined;
    student.isActive = true;
    await student.save();

    await createNotification(
      'Registration Approved',
      `Hi ${student.name}, your account has been approved. You can now access the student dashboard.`,
      'student',
      {
        source: 'Student Management',
        recipientUserId: String(student._id),
        priority: 'success',
      }
    );

    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), 'Approved student registration', 'student', String(student._id), student.name);
    }

    return res.json({ success: true, message: 'Student approved successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error approving student', error: error.message });
  }
};

export const rejectStudent = async (req: AuthRequest, res: Response) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.approvalStatus = 'Rejected';
    student.rejectedAt = new Date();
    student.approvedAt = undefined;
    student.isActive = false;
    await student.save();

    await createNotification(
      'Registration Rejected',
      `Hi ${student.name}, your account registration was rejected. Please contact hostel administration for details.`,
      'student',
      {
        source: 'Student Management',
        recipientUserId: String(student._id),
        priority: 'urgent',
      }
    );

    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), 'Rejected student registration', 'student', String(student._id), student.name);
    }

    return res.json({ success: true, message: 'Student rejected successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error rejecting student', error: error.message });
  }
};
