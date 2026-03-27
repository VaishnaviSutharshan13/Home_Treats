import mongoose, { Document, Schema } from 'mongoose';

export interface IFee extends Document {
  studentName: string;
  studentId: string;
  room: string;
  feeType: 'Hostel Fee' | 'Mess Fee' | 'Library Fee' | 'Other';
  amount: number;
  dueDate: Date;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Partial';
  paidDate?: Date;
  paymentMethod?: string;
  transactionId?: string;
  semester: string;
  paidAmount?: number;
  remainingAmount?: number;
}

const FeeSchema: Schema = new Schema({
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: String,
    required: true,
    ref: 'Student'
  },
  room: {
    type: String,
    required: true
  },
  feeType: {
    type: String,
    required: true,
    enum: ['Hostel Fee', 'Mess Fee', 'Library Fee', 'Other']
  },
  amount: {
    type: Number,
    required: true,
    min: [4000, 'Minimum fee amount is LKR 4,000']
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue', 'Partial'],
    default: 'Pending'
  },
  paidDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['Online Transfer', 'Cash', 'Credit Card', 'Bank Transfer']
  },
  transactionId: {
    type: String,
    unique: true
  },
  semester: {
    type: String,
    required: true
  },
  paidAmount: {
    type: Number,
    min: 0
  },
  remainingAmount: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

export default mongoose.model<IFee>('Fee', FeeSchema);
