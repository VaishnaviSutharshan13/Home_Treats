import { Request, Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth";
import Room from "../models/Room";
import User from "../models/User";
import Student from "../models/Student";
import { logAdminAction } from "./adminLogController";
import { createNotification } from "./notificationController";

const findRoomByIdentifier = async (identifier: string) => {
  const trimmedIdentifier = String(identifier || "").trim();
  if (!trimmedIdentifier) return null;

  const objectIdCandidate = /^[a-fA-F0-9]{24}$/.test(trimmedIdentifier)
    ? new mongoose.Types.ObjectId(trimmedIdentifier)
    : null;

  const rawRoom = await Room.collection.findOne({
    $or: [
      ...(objectIdCandidate ? [{ _id: objectIdCandidate as any }] : []),
      { roomNumber: trimmedIdentifier },
    ],
  });

  if (!rawRoom) return null;
  return {
    room: rawRoom as Record<string, any>,
    filter: { _id: rawRoom._id },
  };
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
      message: "Error fetching rooms",
      error: error.message,
    });
  }
};

// GET single room
export const getRoomById = async (req: Request, res: Response) => {
  try {
    const roomIdentifier = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const resolved = await findRoomByIdentifier(roomIdentifier);
    if (!resolved) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.json({ success: true, data: resolved.room });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching room",
      error: error.message,
    });
  }
};

// CREATE room (supports multipart/form-data image upload)
export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const body = { ...req.body };

    // Parse facilities if sent as JSON string (FormData sends strings)
    if (typeof body.facilities === "string") {
      try {
        body.facilities = JSON.parse(body.facilities);
      } catch {
        body.facilities = [];
      }
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
      status: "Available",
    });
    const savedRoom = await room.save();

    if (req.user) {
      await logAdminAction(
        req.user.email,
        String(req.user.id),
        "Added a room",
        "room",
        String(savedRoom._id),
        savedRoom.name,
      );
    }

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: savedRoom,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error creating room",
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
    if (typeof body.facilities === "string") {
      try {
        body.facilities = JSON.parse(body.facilities);
      } catch {
        body.facilities = [];
      }
    }
    // Parse numeric fields
    if (body.capacity) body.capacity = Number(body.capacity);
    if (body.price) body.price = Number(body.price);
    if (body.occupied) body.occupied = Number(body.occupied);

    // If a file was uploaded via Multer, set image path
    if ((req as any).file) {
      body.image = `/uploads/rooms/${(req as any).file.filename}`;
    }

    const room = await Room.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (previousRoom) {
      const statusChanged = previousRoom.status !== room.status;
      const roomChanged = previousRoom.roomNumber !== room.roomNumber;

      if (statusChanged && room.status === "Maintenance") {
        await createNotification(
          "Room No Longer Available",
          `Room ${room.roomNumber} is now under maintenance and temporarily unavailable.`,
          "room",
          {
            source: "Room Management",
            recipientType: "all_students",
            relatedModuleId: String(room._id),
            priority: "important",
          },
        );
      }

      if (roomChanged || statusChanged) {
        await createNotification(
          "Room Update",
          `Room ${previousRoom.roomNumber} has been updated${roomChanged ? ` to ${room.roomNumber}` : ""}. Current status: ${room.status}.`,
          "room",
          {
            source: "Room Management",
            recipientType: "all_students",
            relatedModuleId: String(room._id),
            priority: "normal",
          },
        );
      }
    }

    if (req.user) {
      await logAdminAction(
        req.user.email,
        String(req.user.id),
        "Updated room information",
        "room",
        String(req.params.id),
        room.name,
      );
    }

    res.json({
      success: true,
      message: "Room updated successfully",
      data: room,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error updating room",
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
        message: "Room not found",
      });
    }
    if (req.user) {
      await logAdminAction(
        req.user.email,
        String(req.user.id),
        "Deleted a room",
        "room",
        String(req.params.id),
        room.name,
      );
    }

    await createNotification(
      "Room No Longer Available",
      `Room ${room.roomNumber} has been deactivated and is no longer available for booking.`,
      "room",
      {
        source: "Room Management",
        recipientType: "all_students",
        relatedModuleId: String(room._id),
        priority: "important",
      },
    );

    res.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error deleting room",
      error: error.message,
    });
  }
};

// ALLOCATE room to student
export const allocateRoom = async (req: AuthRequest, res: Response) => {
  try {
    const roomIdentifier = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const resolved = await findRoomByIdentifier(roomIdentifier);
    if (!resolved) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    const { room, filter } = resolved;
    const currentStudents = Array.isArray(room.students) ? room.students : [];

    // Prevent overbooking
    if (room.occupied >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: `Room is full. Capacity: ${room.capacity}, Currently occupied: ${room.occupied}`,
      });
    }

    if (room.status === "Maintenance") {
      return res
        .status(400)
        .json({ success: false, message: "Room is under maintenance" });
    }

    // Step 1: Check if student already has a room assigned and FREE the old room
    const studentUser = await User.findOne({
      role: "student",
      studentId: req.body.studentId,
    }).select("_id name studentId room roomNumber");

    let oldRoomId: string | null = null;
    if (studentUser && studentUser.room) {
      oldRoomId = String(studentUser.room);
      
      // Find and update the old room
      const oldRoomObjectId = /^[a-fA-F0-9]{24}$/.test(oldRoomId)
        ? new mongoose.Types.ObjectId(oldRoomId)
        : null;

      if (oldRoomObjectId) {
        const oldRoom = await Room.collection.findOne({
          _id: oldRoomObjectId,
        });

        if (oldRoom) {
          const oldStudents = Array.isArray(oldRoom.students)
            ? oldRoom.students.filter((sid: string) => sid !== req.body.studentId)
            : [];
          const newOldOccupied = oldStudents.length;
          const newOldStatus = newOldOccupied > 0 ? "Occupied" : "Available";

          // Update old room: remove student, mark as Available if empty
          await Room.collection.updateOne(
            { _id: oldRoomObjectId },
            {
              $set: {
                students: oldStudents,
                occupied: newOldOccupied,
                status: newOldStatus,
              },
            }
          );

          await createNotification(
            "Room Deallocated",
            `You have been deallocated from Room ${oldRoom.roomNumber}. A new room has been assigned.`,
            "room",
            {
              source: "Room Management",
              recipientUserId: String(studentUser._id),
              relatedModuleId: String(oldRoomObjectId),
              priority: "normal",
            },
          );
        }
      }
    }

    // Step 2: Allocate the new room to student
    const nextStudents = currentStudents.includes(req.body.studentId)
      ? currentStudents
      : [...currentStudents, req.body.studentId];
    const nextOccupied = nextStudents.length;
    const nextStatus = nextOccupied >= room.capacity ? "Occupied" : "Available";

    await Room.collection.updateOne(filter, {
      $set: {
        students: nextStudents,
        occupied: nextOccupied,
        status: nextStatus,
      },
    });

    const updatedRoom = await Room.collection.findOne(filter);

    // Step 3: Update User model with new room information
    if (studentUser) {
      await User.findByIdAndUpdate(studentUser._id, {
        room: String(room._id),
        roomNumber: room.roomNumber,
      }, { new: true });
    }

    // Step 4: Update Student model with new room information
    await Student.findOneAndUpdate(
      { studentId: req.body.studentId },
      {
        room: String(room._id),
        roomNumber: room.roomNumber,
      },
      { new: true }
    );

    // Step 5: Send notifications
    if (studentUser) {
      const notificationMessage = oldRoomId
        ? `You have been allocated to Room ${room.roomNumber}.`
        : `You have been assigned to Room ${room.roomNumber}.`;

      await createNotification(
        "Room Assigned",
        notificationMessage,
        "room",
        {
          source: "Room Management",
          recipientUserId: String(studentUser._id),
          relatedModuleId: String(room._id),
          priority: "success",
        },
      );
    }

    // Notification + Admin Log
    const allocationAction = oldRoomId ? "Reallocated student to new room" : "Allocated room to student";
    const oldRoomInfo = oldRoomId ? ` (moved from old room)` : "";
    await createNotification(
      "Room Assignment Completed",
      `Room ${room.roomNumber} allocated to Student ID ${req.body.studentId}${oldRoomInfo}`,
      "room",
      {
        source: "Room Management",
        recipientType: "all_admins",
        relatedModuleId: String(room._id),
        priority: "success",
      },
    );
    if (req.user) {
      await logAdminAction(
        req.user.email,
        String(req.user.id),
        allocationAction,
        "room",
        String(req.params.id),
        `Room ${room.roomNumber} → ${req.body.studentId}`,
      );
    }

    res.json({
      success: true,
      message: oldRoomId
        ? `Room changed successfully to Room ${room.roomNumber}`
        : "Room allocated successfully",
      data: updatedRoom || {
        ...room,
        students: nextStudents,
        occupied: nextOccupied,
        status: nextStatus,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error allocating room",
      error: error.message,
    });
  }
};

// VACATE room
export const vacateRoom = async (req: AuthRequest, res: Response) => {
  try {
    const roomIdentifier = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const resolved = await findRoomByIdentifier(roomIdentifier);
    if (!resolved) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const { room, filter } = resolved;

    // Get list of current students before clearing
    const currentStudents = Array.isArray(room.students) ? room.students : [];

    await Room.collection.updateOne(filter, {
      $set: {
        students: [],
        occupied: 0,
        status: "Available",
      },
    });

    // Clear room information from User and Student models for all students
    if (currentStudents.length > 0) {
      await User.updateMany(
        { studentId: { $in: currentStudents } },
        { $unset: { room: "", roomNumber: "" } }
      );

      await Student.updateMany(
        { studentId: { $in: currentStudents } },
        { $unset: { room: "", roomNumber: "" } }
      );
    }

    const updatedRoom = await Room.collection.findOne(filter);

    await createNotification(
      "Room Available",
      `Room ${room.roomNumber} is now available for booking.`,
      "room",
      {
        source: "Room Management",
        recipientType: "all_students",
        relatedModuleId: String(room._id),
        priority: "normal",
      },
    );

    if (req.user) {
      await logAdminAction(
        req.user.email,
        String(req.user.id),
        "Vacated room",
        "room",
        String(room._id),
        `Room ${room.roomNumber}`,
      );
    }

    res.json({
      success: true,
      message: "Room vacated successfully",
      data: updatedRoom || {
        ...room,
        students: [],
        occupied: 0,
        status: "Available",
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error vacating room",
      error: error.message,
    });
  }
};
