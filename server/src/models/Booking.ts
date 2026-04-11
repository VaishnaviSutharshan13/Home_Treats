import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  studentId?: string;
  studentName: string;
  email: string;
  phone: string;
  selectedFloor: string;
  roomId: mongoose.Types.ObjectId;
  roomNumber: string;
  bedNumber: number;
  roomCapacity: number;
  bedsPerRoom: number;
  monthlyRent: number;
  hostelName: string;
  location: string;
  status: 'Confirmed' | 'Cancelled';
}

const BookingSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    studentId: {
      type: String,
      trim: true,
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
    selectedFloor: {
      type: String,
      required: true,
      enum: ['1st Floor', '2nd Floor', '3rd Floor', '4th Floor'],
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    bedNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    roomCapacity: {
      type: Number,
      required: true,
    },
    bedsPerRoom: {
      type: Number,
      required: true,
    },
    monthlyRent: {
      type: Number,
      required: true,
    },
    hostelName: {
      type: String,
      required: true,
      default: 'Home_Treats Student Hostel',
    },
    location: {
      type: String,
      required: true,
      default: 'No.11, Nallur, Jaffna, 40000, Sri Lanka',
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Cancelled'],
      default: 'Confirmed',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>('Booking', BookingSchema);
