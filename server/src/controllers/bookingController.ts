import { Response } from 'express';
import Booking from '../models/Booking';
import Room from '../models/Room';
import User from '../models/User';
import Student from '../models/Student';
import Fee from '../models/Fee';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from './notificationController';

const MONTHLY_RENT = 5500;

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
  const normalized = value.toLowerCase().trim();
  return floorMap[normalized] || null;
};

export const confirmBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { fullName, email, phone, selectedFloor, roomId } = req.body as {
      fullName: string;
      email: string;
      phone: string;
      selectedFloor: string;
      roomId?: string;
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

    let availableRoom = null as any;

    if (roomId) {
      availableRoom = await Room.findById(roomId);
      if (!availableRoom) {
        return res.status(404).json({ success: false, message: 'Selected room not found' });
      }

      if (availableRoom.floor !== floor) {
        return res.status(400).json({ success: false, message: 'Selected room does not belong to selected floor' });
      }

      if (availableRoom.status === 'Maintenance') {
        return res.status(400).json({ success: false, message: 'Selected room is under maintenance' });
      }

      if (availableRoom.occupied >= availableRoom.capacity) {
        return res.status(409).json({ success: false, message: 'Selected room is full' });
      }
    } else {
      const roomsOnFloor = await Room.find({
        floor,
        status: { $ne: 'Maintenance' },
      }).sort({ roomNumber: 1 });

      availableRoom = roomsOnFloor.find((room) => room.occupied < room.capacity);
    }

    if (!availableRoom) {
      return res.status(409).json({
        success: false,
        message: 'No available beds on the selected floor',
      });
    }

    const bedNumber = availableRoom.occupied + 1;
    const user = await User.findById(req.user.id);

    availableRoom.occupied = bedNumber;
    availableRoom.students = [
      ...(availableRoom.students || []),
      user?.studentId || String(req.user.id),
    ];
    availableRoom.status = availableRoom.occupied >= availableRoom.capacity ? 'Occupied' : 'Available';
    await availableRoom.save();

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
      roomCapacity: 4,
      bedsPerRoom: 4,
      monthlyRent: MONTHLY_RENT,
      hostelName: 'Home_Treats Student Hostel',
      location: 'No.11, Nallur, Jaffna, 40000, Sri Lanka',
      status: 'Confirmed',
    });

    if (user) {
      user.room = availableRoom.roomNumber;
      user.roomNumber = availableRoom.roomNumber;
      await user.save();
    }

    if (user?.studentId) {
      await Student.findOneAndUpdate(
        { studentId: user.studentId },
        { room: availableRoom.roomNumber, roomNumber: availableRoom.roomNumber }
      );
    }

    // Auto-create monthly hostel fee for the booking
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Set due date 7 days from booking
    const currentDate = new Date();
    const semester = `Semester ${Math.ceil((currentDate.getMonth() + 1) / 6)}`; // Semester 1 (Jan-Jun) or 2 (Jul-Dec)
    const academicYear = `${currentDate.getFullYear()}/${currentDate.getFullYear() + 1}`;

    await Fee.create({
      studentName: fullName,
      studentId: user?.studentId || String(req.user.id),
      room: availableRoom.roomNumber,
      roomNumber: availableRoom.roomNumber,
      floor,
      feeType: 'Monthly Hostel Fee',
      amount: MONTHLY_RENT,
      dueDate,
      status: 'Pending',
      paymentStatus: 'Pending',
      semester,
      academicYear,
      autoGenerated: true,
      bookingId: booking._id,
      notes: `Auto-generated fee for booking confirmed on ${new Date().toLocaleDateString('en-LK')}`,
    });

    await createNotification(
      'Room Booking Confirmed',
      `Your room booking is confirmed for Room ${availableRoom.roomNumber}, ${floor}, Bed ${bedNumber}.`,
      'booking',
      user?.studentId
    );

    await createNotification(
      'New Room Booking',
      `Student: ${fullName} | Email: ${email} | Room: ${availableRoom.roomNumber} | Floor: ${floor} | Bed: ${bedNumber} | Date: ${new Date().toLocaleString('en-LK')}`,
      'booking'
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
      const room = await Room.findById(booking.roomId);
      if (room) {
        room.occupied = Math.max(0, room.occupied - 1);
        room.students = (room.students || []).filter((s) => s !== (booking.studentId || String(booking.userId)));
        if (room.status !== 'Maintenance') {
          room.status = 'Available';
        }
        await room.save();
      }

      const user = await User.findById(booking.userId);
      if (user) {
        user.room = '';
        user.roomNumber = '';
        await user.save();
      }

      if (booking.studentId) {
        await Student.findOneAndUpdate({ studentId: booking.studentId }, { room: '', roomNumber: '' });
      }
    }

    booking.status = status;
    await booking.save();

    return res.json({ success: true, message: 'Booking status updated', data: booking });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message,
    });
  }
};
