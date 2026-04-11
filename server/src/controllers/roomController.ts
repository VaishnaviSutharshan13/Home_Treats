import { Request, Response } from 'express';
import Room from '../models/Room';
import User from '../models/User';
import { createNotification } from './notificationController';
import { logAdminAction } from './adminLogController';
import { AuthRequest } from '../middleware/auth';

// ─── Seed sample rooms (runs once on startup if DB is empty) ───
export const seedRooms = async () => {
  try {
    const fourthFloorSamples = [
      {
        name: 'Nallur Skyline Single',
        roomNumber: 'A-401',
        block: 'Block A',
        floor: '4th Floor',
        capacity: 1,
        type: 'Single Room',
        price: 11500,
        description: 'Quiet top-floor single room with excellent ventilation and a dedicated study corner. Ideal for students preparing for exams who need a distraction-free environment.',
        image: 'https://images.unsplash.com/photo-1616594039964-2d4bf13db0f3?w=800',
        facilities: ['WiFi', 'Study Table', 'Wardrobe', 'AC'],
        location: 'Jaffna, Sri Lanka',
      },
      {
        name: 'Jaffna City View Double',
        roomNumber: 'B-402',
        block: 'Block B',
        floor: '4th Floor',
        capacity: 2,
        type: 'Double Room',
        price: 8200,
        description: 'Comfortable double room on the fourth floor with city-facing windows, two beds, and individual study tables. A balanced option for comfort and affordability.',
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
        facilities: ['WiFi', 'Study Table', 'Wardrobe', 'Common Area'],
        location: 'Jaffna, Sri Lanka',
      },
      {
        name: 'Peninsula Heights Dorm',
        roomNumber: 'D-404',
        block: 'Block D',
        floor: '4th Floor',
        capacity: 4,
        type: 'Dormitory',
        price: 5000,
        description: 'A spacious fourth-floor dormitory with four beds, personal lockers, and access to a shared common area. Perfect for students who prefer a social hostel experience.',
        image: 'https://images.unsplash.com/photo-1598928636135-ab763dbb1a9a?w=800',
        facilities: ['WiFi', 'Lockers', 'Common Area', 'Study Table'],
        location: 'Jaffna, Sri Lanka',
      },
    ];

    const count = await Room.countDocuments();
    if (count > 0) {
      const fourthFloorCount = await Room.countDocuments({ floor: '4th Floor' });

      if (fourthFloorCount === 0) {
        const roomNumbers = fourthFloorSamples.map((room) => room.roomNumber);
        const existingRooms = await Room.find(
          { roomNumber: { $in: roomNumbers } },
          { roomNumber: 1, _id: 0 }
        ).lean();

        const existingRoomNumbers = new Set(existingRooms.map((room) => room.roomNumber));
        const roomsToInsert = fourthFloorSamples.filter(
          (room) => !existingRoomNumbers.has(room.roomNumber)
        );

        if (roomsToInsert.length > 0) {
          await Room.insertMany(roomsToInsert);
          console.log(`✅ Added ${roomsToInsert.length} 4th floor sample rooms`);
        }
      }

      return;
    }

    const sampleRooms = [
      {
        name: 'Nallur Comfort Single',
        roomNumber: 'A-101',
        block: 'Block A',
        floor: '1st Floor',
        capacity: 1,
        type: 'Single Room',
        price: 8500,
        description: 'A cozy single room near the famous Nallur Kandaswamy Temple area. Perfect for students who prefer privacy and a quiet study environment. Features modern furnishings and natural ventilation with views of the garden.',
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
        facilities: ['WiFi', 'Study Table', 'Wardrobe', 'AC'],
        location: 'Jaffna, Sri Lanka',
      },
      {
        name: 'Jaffna Heritage Double',
        roomNumber: 'A-102',
        block: 'Block A',
        floor: '1st Floor',
        capacity: 2,
        type: 'Double Room',
        price: 6500,
        description: 'Spacious double room designed for two students. Located in the heart of Jaffna with easy access to the University of Jaffna campus. Includes two comfortable beds, study desks, and a shared wardrobe.',
        image: 'https://images.unsplash.com/photo-1598928636135-ab763dbb1a9a?w=800',
        facilities: ['WiFi', 'Study Table', 'Wardrobe', 'Common Area'],
        location: 'Jaffna, Sri Lanka',
      },
      {
        name: 'Palmyrah Breeze Room',
        roomNumber: 'A-201',
        block: 'Block A',
        floor: '2nd Floor',
        capacity: 1,
        type: 'Single Room',
        price: 9500,
        description: 'Premium single room on the upper floor with cool cross-ventilation and a balcony. Named after Jaffna\'s iconic Palmyrah palms, this room offers a serene study space with AC and an attached bathroom.',
        image: 'https://images.unsplash.com/photo-1611892440504-42a792e24ad1?w=800',
        facilities: ['WiFi', 'Study Table', 'Wardrobe', 'AC', 'Private Bathroom'],
        location: 'Jaffna, Sri Lanka',
      },
      {
        name: 'Kankesanthurai Shared Suite',
        roomNumber: 'B-101',
        block: 'Block B',
        floor: '1st Floor',
        capacity: 4,
        type: 'Dormitory',
        price: 4000,
        description: 'Affordable shared dormitory-style accommodation for budget-conscious students. Features four beds with personal lockers, a spacious common area, and is ideal for students attending colleges in the Jaffna peninsula.',
        image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
        facilities: ['WiFi', 'Lockers', 'Common Area'],
        location: 'Jaffna, Sri Lanka',
      },
      {
        name: 'Point Pedro Deluxe Single',
        roomNumber: 'B-201',
        block: 'Block B',
        floor: '2nd Floor',
        capacity: 1,
        type: 'Single Room',
        price: 12000,
        description: 'Our premium deluxe single room with top-of-the-line amenities. Includes air conditioning, a private bathroom, dedicated study desk, and high-speed WiFi. The perfect choice for focused academic life in Jaffna.',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
        facilities: ['WiFi', 'Study Table', 'Wardrobe', 'AC', 'Private Bathroom'],
        location: 'Jaffna, Sri Lanka',
      },
      {
        name: 'Casuarina Beach Double',
        roomNumber: 'B-202',
        block: 'Block B',
        floor: '2nd Floor',
        capacity: 2,
        type: 'Double Room',
        price: 7500,
        description: 'A bright and airy double room inspired by the coastal charm of Casuarina Beach. Two students can enjoy a comfortable living space with individual study tables and plenty of natural light.',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        facilities: ['WiFi', 'Study Table', 'Wardrobe', 'Common Area'],
        location: 'Jaffna, Sri Lanka',
      },
      {
        name: 'Delft Island Economy',
        roomNumber: 'C-101',
        block: 'Block C',
        floor: '1st Floor',
        capacity: 3,
        type: 'Dormitory',
        price: 4500,
        description: 'Budget-friendly triple sharing room ideal for students who enjoy community living. Located on the ground floor for easy access, with shared bathroom facilities and a vibrant common area.',
        image: 'https://images.unsplash.com/photo-1522771739485-4b4b999b6d2?w=800',
        facilities: ['WiFi', 'Lockers', 'Common Area', 'Study Table'],
        location: 'Jaffna, Sri Lanka',
      },
      {
        name: 'Jaffna Fort Premium',
        roomNumber: 'C-201',
        block: 'Block C',
        floor: '2nd Floor',
        capacity: 1,
        type: 'Single Room',
        price: 15000,
        description: 'The finest single room in our hostel, inspired by Jaffna Fort\'s grandeur. Features luxury bedding, air conditioning, a private en-suite bathroom, study desk, wardrobe, and a mini sitting area. Perfect for postgraduate students.',
        image: 'https://images.unsplash.com/photo-1618773984122-6e618c23b6a3?w=800',
        facilities: ['WiFi', 'Study Table', 'Wardrobe', 'AC', 'Private Bathroom', 'Lockers'],
        location: 'Jaffna, Sri Lanka',
      },
      {
        name: 'Nagadeepa Twin Room',
        roomNumber: 'C-202',
        block: 'Block C',
        floor: '2nd Floor',
        capacity: 2,
        type: 'Double Room',
        price: 8000,
        description: 'Comfortable twin-sharing room with two single beds, individual study spaces, and a shared wardrobe. Air conditioned for Jaffna\'s warm climate. Close to the common kitchen and laundry area.',
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
        facilities: ['WiFi', 'Study Table', 'Wardrobe', 'AC'],
        location: 'Jaffna, Sri Lanka',
      },
      {
        name: 'Kayts Island Dorm',
        roomNumber: 'D-101',
        block: 'Block D',
        floor: '1st Floor',
        capacity: 6,
        type: 'Dormitory',
        price: 4000,
        description: 'Our most affordable option — a spacious 6-bed dormitory with personal lockers for each student. Great for first-year students looking to make friends and settle into hostel life in Jaffna. Includes WiFi and common area access.',
        image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
        facilities: ['WiFi', 'Lockers', 'Common Area'],
        location: 'Jaffna, Sri Lanka',
      },
      {
        name: 'Chundikulam Standard Double',
        roomNumber: 'D-201',
        block: 'Block D',
        floor: '2nd Floor',
        capacity: 2,
        type: 'Double Room',
        price: 5500,
        description: 'A well-equipped standard double room for two students. Features basic furnishings including beds, study table, and a wardrobe. Affordable yet comfortable accommodation with WiFi and fan cooling.',
        image: 'https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=800',
        facilities: ['WiFi', 'Study Table', 'Wardrobe'],
        location: 'Jaffna, Sri Lanka',
      },
      {
        name: 'Elephant Pass Executive',
        roomNumber: 'D-301',
        block: 'Block D',
        floor: '3rd Floor',
        capacity: 1,
        type: 'Single Room',
        price: 10500,
        description: 'Executive single room on the top floor offering panoramic views and ultimate privacy. Features air conditioning, a study desk, wardrobe, and private bathroom. An excellent choice for focused academic pursuits in Jaffna.',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d955f4e24?w=800',
        facilities: ['WiFi', 'Study Table', 'Wardrobe', 'AC', 'Private Bathroom'],
        location: 'Jaffna, Sri Lanka',
      },
      ...fourthFloorSamples,
    ];

    // Mark some rooms as occupied / maintenance for variety
    const roomDocs = sampleRooms.map((r, i) => {
      if (i === 3) return { ...r, occupied: 4, status: 'Occupied' };     // Kankesanthurai fully booked
      if (i === 6) return { ...r, occupied: 2, status: 'Available' };    // Delft partially filled
      if (i === 9) return { ...r, status: 'Maintenance' };              // Kayts under maintenance
      return r;
    });

    await Room.insertMany(roomDocs);
    console.log(`✅ ${roomDocs.length} sample rooms seeded (Jaffna, Sri Lanka)`);
  } catch (error) {
    console.error('❌ Room seeding error:', error);
  }
};

// GET all rooms
export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms',
      error: error.message,
    });
  }
};

// GET single room
export const getRoomById = async (req: Request, res: Response) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }
    res.json({ success: true, data: room });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching room',
      error: error.message,
    });
  }
};

// CREATE room (supports multipart/form-data image upload)
export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const body = { ...req.body };

    // Parse facilities if sent as JSON string (FormData sends strings)
    if (typeof body.facilities === 'string') {
      try { body.facilities = JSON.parse(body.facilities); } catch { body.facilities = []; }
    }
    // Parse numeric fields that come as strings from FormData
    if (body.capacity) body.capacity = Number(body.capacity);
    if (body.price) body.price = Number(body.price);
    if (body.occupied) body.occupied = Number(body.occupied);

    // If a file was uploaded via Multer, set image path
    if ((req as any).file) {
      body.image = `/uploads/rooms/${(req as any).file.filename}`;
    }

    const room = new Room({
      ...body,
      status: 'Available',
    });
    const savedRoom = await room.save();

    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), 'Added a room', 'room', String(savedRoom._id), savedRoom.name);
    }

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: savedRoom,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating room',
      error: error.message,
    });
  }
};

// UPDATE room (supports multipart/form-data image upload)
export const updateRoom = async (req: AuthRequest, res: Response) => {
  try {
    const previousRoom = await Room.findById(req.params.id);
    const body = { ...req.body };

    // Parse facilities if sent as JSON string
    if (typeof body.facilities === 'string') {
      try { body.facilities = JSON.parse(body.facilities); } catch { body.facilities = []; }
    }
    // Parse numeric fields
    if (body.capacity) body.capacity = Number(body.capacity);
    if (body.price) body.price = Number(body.price);
    if (body.occupied) body.occupied = Number(body.occupied);

    // If a file was uploaded via Multer, set image path
    if ((req as any).file) {
      body.image = `/uploads/rooms/${(req as any).file.filename}`;
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true, runValidators: true }
    );
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    if (previousRoom) {
      const statusChanged = previousRoom.status !== room.status;
      const roomChanged = previousRoom.roomNumber !== room.roomNumber;

      if (statusChanged && room.status === 'Maintenance') {
        await createNotification(
          'Room No Longer Available',
          `Room ${room.roomNumber} is now under maintenance and temporarily unavailable.`,
          'room',
          {
            source: 'Room Management',
            recipientType: 'all_students',
            relatedModuleId: String(room._id),
            priority: 'important',
          }
        );
      }

      if (roomChanged || statusChanged) {
        await createNotification(
          'Room Update',
          `Room ${previousRoom.roomNumber} has been updated${roomChanged ? ` to ${room.roomNumber}` : ''}. Current status: ${room.status}.`,
          'room',
          {
            source: 'Room Management',
            recipientType: 'all_students',
            relatedModuleId: String(room._id),
            priority: 'normal',
          }
        );
      }
    }

    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), 'Updated room information', 'room', String(req.params.id), room.name);
    }

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: room,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating room',
      error: error.message,
    });
  }
};

// DELETE room
export const deleteRoom = async (req: AuthRequest, res: Response) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }
    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), 'Deleted a room', 'room', String(req.params.id), room.name);
    }

    await createNotification(
      'Room No Longer Available',
      `Room ${room.roomNumber} has been deactivated and is no longer available for booking.`,
      'room',
      {
        source: 'Room Management',
        recipientType: 'all_students',
        relatedModuleId: String(room._id),
        priority: 'important',
      }
    );

    res.json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting room',
      error: error.message,
    });
  }
};

// ALLOCATE room to student
export const allocateRoom = async (req: AuthRequest, res: Response) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Prevent overbooking
    if (room.occupied >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: `Room is full. Capacity: ${room.capacity}, Currently occupied: ${room.occupied}`,
      });
    }

    if (room.status === 'Maintenance') {
      return res.status(400).json({ success: false, message: 'Room is under maintenance' });
    }

    room.students.push(req.body.studentId);
    room.occupied = room.students.length;
    room.status = room.occupied >= room.capacity ? 'Occupied' : 'Available';

    await room.save();

    const studentUser = await User.findOne({ role: 'student', studentId: req.body.studentId }).select('_id name studentId');

    if (studentUser) {
      await createNotification(
        'Room Assigned',
        `You have been assigned to Room ${room.roomNumber}.`,
        'room',
        {
          source: 'Room Management',
          recipientUserId: String(studentUser._id),
          relatedModuleId: String(room._id),
          priority: 'success',
        }
      );
    }

    // Notification + Admin Log
    await createNotification('Room Assignment Completed', `Room ${room.roomNumber} allocated to Student ID ${req.body.studentId}`, 'room', {
      source: 'Room Management',
      recipientType: 'all_admins',
      relatedModuleId: String(room._id),
      priority: 'success',
    });
    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), 'Allocated room to student', 'room', String(req.params.id), `Room ${room.roomNumber} → ${req.body.studentId}`);
    }

    res.json({ success: true, message: 'Room allocated successfully', data: room });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error allocating room', error: error.message });
  }
};

// VACATE room
export const vacateRoom = async (req: Request, res: Response) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    room.students = [];
    room.occupied = 0;
    room.status = 'Available';

    await room.save();

    await createNotification(
      'Room Available',
      `Room ${room.roomNumber} is now available for booking.`,
      'room',
      {
        source: 'Room Management',
        recipientType: 'all_students',
        relatedModuleId: String(room._id),
        priority: 'normal',
      }
    );

    res.json({
      success: true,
      message: 'Room vacated successfully',
      data: room,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error vacating room',
      error: error.message,
    });
  }
};
