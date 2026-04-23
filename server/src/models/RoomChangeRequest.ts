import mongoose, { Document, Schema } from 'mongoose';

export interface IRoomChangeRequest extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  studentId: string;
  currentRoomNumber: string;
  newRoomNumber: string;
  reason?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const RoomChangeRequestSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    studentId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    currentRoomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    newRoomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRoomChangeRequest>('RoomChangeRequest', RoomChangeRequestSchema);
