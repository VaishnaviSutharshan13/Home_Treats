import { Response } from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking';
import Room from '../models/Room';
import User from '../models/User';
import Student from '../models/Student';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from './notificationController';

const CANONICAL_FLOORS = new Set(['1st Floor', '2nd Floor', '3rd Floor', '4th Floor']);

const floorMap: Record<string, string> = {
  'floor 1': '1st Floor',
  'first floor': '1st Floor',
  '1st floor': '1st Floor',
  'floor 2': '2nd Floor',
  'second floor': '2nd Floor',
  '2nd floor': '2nd Floor',
  'floor 3': '3rd Floor',
  'third floor': '3rd Floor',
  '3rd floor': '3rd Floor',
  'floor 4': '4th Floor',
  'fourth floor': '4th Floor',
  '4th floor': '4th Floor',
};

const normalizeFloor = (value: string): string | null => {
  const v = String(value || '').trim();
  if (CANONICAL_FLOORS.has(v)) return v;
  const normalized = v.toLowerCase();
  return floorMap[normalized] || null;
};

/** Accept only real Mongo ObjectIds; ignore "undefined", empty, invalid strings. */
const parseRoomObjectId = (input: unknown): string | null => {
  if (input == null) return null;
  const s = typeof input === 'string' ? input.trim() : String(input).trim();
  if (!s || s === 'undefined' || s === 'null') return null;
  if (!mongoose.isValidObjectId(s)) return null;
  return s;
};

const asNonNegInt = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.floor(n));
};

/**
 * Seed data may store Room `_id` as a string in MongoDB while the client sends a 24-char hex id.
 * `Room.findById` / `save()` then use ObjectId and match 0 documents → DocumentNotFoundError on save.
 */
const findRoomByIdFlexible = async (idStr: string): Promise<InstanceType<typeof Room> | null> => {
  try {
    const oid = new mongoose.Types.ObjectId(idStr);
    const raw = await Room.collection.findOne({
      $or: [{ _id: idStr }, { _id: oid }],
    } as Record<string, unknown>);
    return raw ? Room.hydrate(raw as never) : null;
  } catch {
    return null;
  }
};

export const confirmBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!mongoose.isValidObjectId(req.user.id)) {
      return res.status(401).json({ success: false, message: 'Invalid session. Please log in again.' });
    }

    const { fullName, email, phone, selectedFloor, roomId, roomNumber } = req.body as {
      fullName: string;
      email: string;
      phone: string;
      selectedFloor: string;
      roomId?: string;
      roomNumber?: string;
    };

    if (!fullName || !email || !phone || !selectedFloor) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, phone and selected floor are required',
      });
    }

    const floor = normalizeFloor(selectedFloor);
    if (!floor) {
      return res.status(400).json({ success: false, message: 'Invalid floor selection' });
    }

    const existingBooking = await Booking.findOne({
      userId: req.user.id,
      status: 'Confirmed',
    }).sort({ createdAt: -1 });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have a confirmed booking',
        data: existingBooking,
      });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can book rooms' });
    }

    const approved =
      user.approvalStatus === 'Approved' || user.status === 'Approved';
    if (!approved) {
      return res.status(403).json({
        success: false,
        message: 'Only approved students can book rooms. Please contact admin.',
      });
    }

    let availableRoom = null as InstanceType<typeof Room> | null;

    const idStr = parseRoomObjectId(roomId);
    const roomNo =
      typeof roomNumber === 'string' ? roomNumber.trim() : '';

    if (idStr) {
      availableRoom = await findRoomByIdFlexible(idStr);
    }

    if (!availableRoom && roomNo) {
      availableRoom = await Room.findOne({
        roomNumber: roomNo,
        floor,
        status: { $ne: 'Maintenance' },
      });
    }

    if (availableRoom) {
      if (availableRoom.floor !== floor) {
        return res.status(400).json({
          success: false,
          message: 'Selected room does not belong to selected floor',
        });
      }

      if (availableRoom.status === 'Maintenance') {
        return res.status(400).json({
          success: false,
          message: 'Selected room is under maintenance',
        });
      }

      const occ = asNonNegInt(availableRoom.occupied);
      const cap = asNonNegInt(availableRoom.capacity);
      if (cap < 1) {
        return res.status(400).json({
          success: false,
          message: 'Room configuration is invalid. Please contact admin.',
        });
      }
      if (occ >= cap) {
        return res.status(409).json({ success: false, message: 'Selected room is full' });
      }
    } else if (idStr || roomNo) {
      return res.status(404).json({ success: false, message: 'Selected room not found' });
    } else {
      const roomsOnFloor = await Room.find({
        floor,
        status: { $ne: 'Maintenance' },
      }).sort({ roomNumber: 1 });

      availableRoom =
        roomsOnFloor.find((r) => {
          const o = asNonNegInt(r.occupied);
          const c = asNonNegInt(r.capacity);
          return c >= 1 && o < c;
        }) || null;
    }

    if (!availableRoom) {
      return res.status(409).json({
        success: false,
        message: 'No available beds on the selected floor',
      });
    }

    const occupiedBefore = asNonNegInt(availableRoom.occupied);
    const capacity = asNonNegInt(availableRoom.capacity);
    if (capacity < 1 || occupiedBefore > capacity) {
      return res.status(400).json({
        success: false,
        message: 'Room configuration is invalid. Please contact admin.',
      });
    }
    if (occupiedBefore >= capacity) {
      return res.status(409).json({ success: false, message: 'Selected room is full' });
    }

    const bedNumber = occupiedBefore + 1;
    const monthlyRent = Number(availableRoom.price);
    const rent = Number.isFinite(monthlyRent) ? monthlyRent : 0;

    const nextStudents = [
      ...(availableRoom.students || []),
      user?.studentId || String(req.user.id),
    ];
    const nextStatus = bedNumber >= capacity ? 'Occupied' : 'Available';

    const roomKey = { roomNumber: availableRoom.roomNumber };
    const roomUpdate = await Room.updateOne(roomKey, {
      $set: {
        occupied: bedNumber,
        status: nextStatus,
        students: nextStudents,
      },
    });

    if (roomUpdate.matchedCount !== 1) {
      return res.status(500).json({
        success: false,
        message: 'Could not update the room for this booking. Please try again or contact support.',
      });
    }

    const booking = await Booking.create({
      userId: req.user.id,
      studentId: user?.studentId,
      studentName: fullName,
      email,
      phone,
      selectedFloor: floor,
      roomId: availableRoom._id,
      roomNumber: availableRoom.roomNumber,
      bedNumber,
      roomCapacity: capacity,
      bedsPerRoom: capacity,
      monthlyRent: rent,
      hostelName: 'Home_Treats Student Hostel',
      location: 'No.11, Nallur, Jaffna, 40000, Sri Lanka',
      status: 'Confirmed',
    });

    if (user) {
      user.room = availableRoom.roomNumber;
      await user.save();
    }

    if (user?.studentId) {
      await Student.findOneAndUpdate({ studentId: user.studentId }, { room: availableRoom.roomNumber });
    }

    await createNotification(
      'Booking Confirmed',
      `Your booking is confirmed: Room ${availableRoom.roomNumber}, Bed ${bedNumber}, ${floor}.`,
      'room',
      {
        source: 'Room Management',
        recipientUserId: String(user._id),
        relatedModuleId: String(booking._id),
        priority: 'success',
      }
    );

    await createNotification(
      'New Room Booking',
      `Student Name: ${fullName} | Student ID: ${user.studentId || 'N/A'} | Room Number: ${availableRoom.roomNumber} | Floor: ${floor}`,
      'room',
      {
        source: 'Room Management',
        recipientType: 'all_admins',
        relatedModuleId: String(booking._id),
        priority: 'important',
      }
    );

    return res.status(201).json({
      success: true,
      message: 'Your room booking has been successfully confirmed.',
      data: {
        booking,
        user: user
          ? {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              phone: user.phone,
              studentId: user.studentId,
              room: user.room,
              course: user.course,
            }
          : null,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error confirming booking',
      error: error.message,
    });
  }
};

export const getMyBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const booking = await Booking.findOne({ userId: req.user.id, status: 'Confirmed' }).sort({ createdAt: -1 });

    return res.json({ success: true, data: booking || null });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message,
    });
  }
};

export const getAllBookings = async (_req: AuthRequest, res: Response) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message,
    });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body as { status: 'Confirmed' | 'Cancelled' };

    if (!status || !['Confirmed', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking status',
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === status) {
      return res.json({ success: true, data: booking, message: 'Booking status unchanged' });
    }

    if (status === 'Cancelled' && booking.status === 'Confirmed') {
      const roomIdHex = booking.roomId ? String(booking.roomId) : '';
      let room =
        (roomIdHex && mongoose.isValidObjectId(roomIdHex)
          ? await findRoomByIdFlexible(roomIdHex)
          : null) || (await Room.findOne({ roomNumber: booking.roomNumber }));

      if (room) {
        const occ = Math.max(0, asNonNegInt(room.occupied) - 1);
        const students = (room.students || []).filter(
          (s) => s !== (booking.studentId || String(booking.userId))
        );
        const nextStatus =
          room.status === 'Maintenance' ? 'Maintenance' : 'Available';
        await Room.updateOne(
          { roomNumber: room.roomNumber },
          { $set: { occupied: occ, students, status: nextStatus } }
        );
      }

      const user = await User.findById(booking.userId);
      if (user) {
        user.room = '';
        await user.save();
      }

      if (booking.studentId) {
        await Student.findOneAndUpdate({ studentId: booking.studentId }, { room: '' });
      }
    }

    booking.status = status;
    await booking.save();

    const studentUser = await User.findById(booking.userId).select('_id name');
    if (studentUser) {
      await createNotification(
        status === 'Confirmed' ? 'Booking Confirmed' : 'Booking Cancelled',
        status === 'Confirmed'
          ? `Your room booking for ${booking.roomNumber} has been confirmed by administration.`
          : `Your room booking for ${booking.roomNumber} has been cancelled by administration.`,
        'room',
        {
          source: 'Room Management',
          recipientUserId: String(studentUser._id),
          relatedModuleId: String(booking._id),
          priority: status === 'Confirmed' ? 'success' : 'important',
        }
      );
    }

    return res.json({ success: true, message: 'Booking status updated', data: booking });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message,
    });
  }
};
