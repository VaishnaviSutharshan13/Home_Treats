import mongoose, { Document, Schema } from 'mongoose';

export interface IRoomRequest extends Document {
  userId: mongoose.Types.ObjectId;
  studentName: string;
  email: string;
  phone: string;
  studentId: string;
  nic: string;
  landline: string;
  moveInDate: Date;
  duration: string;
  specialRequest: string;
  roomNumber: string;
  roomId: mongoose.Types.ObjectId;
  floor: string;
  building: string;
  roomType: string;
  monthlyFee: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const RoomRequestSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    studentId: {
      type: String,
      required: true,
      trim: true,
    },
    nic: {
      type: String,
      required: true,
      trim: true,
    },
    landline: {
      type: String,
      trim: true,
    },
    moveInDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: String,
      required: true,
      enum: ['3_months', '6_months', '1_year'],
    },
    specialRequest: {
      type: String,
      trim: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    floor: {
      type: String,
      required: true,
      enum: ['1st Floor', '2nd Floor', '3rd Floor', '4th Floor'],
    },
    building: {
      type: String,
      required: true,
      enum: [
        'Block A',
        'Block B',
        'Block C',
        'Block D',
        'Building A',
        'Building B',
        'Building C',
        'Building D',
        'Main Building',
        'Annex Building',
      ],
    },
    roomType: {
      type: String,
      required: true,
      enum: ['Single Room', 'Double Room', 'Dormitory'],
    },
    monthlyFee: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRoomRequest>('RoomRequest', RoomRequestSchema);
