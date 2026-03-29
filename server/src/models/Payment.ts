import mongoose, { Document, Schema } from 'mongoose';

export type PaymentBankName = 'BOC' | 'HNB';
export type PaymentStatus = 'Pending' | 'Approved' | 'Rejected';

export interface IPayment extends Document {
  studentId: string;
  studentName: string;
  feeId?: mongoose.Types.ObjectId;
  bankName: PaymentBankName;
  accountHolder: string;
  transactionId: string;
  paymentDate: Date;
  amount: number;
  slipUrl: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    studentId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    feeId: {
      type: Schema.Types.ObjectId,
      ref: 'Fee',
    },
    bankName: {
      type: String,
      required: true,
      enum: ['BOC', 'HNB'],
    },
    accountHolder: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    transactionId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Amount must be greater than 0'],
    },
    slipUrl: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

PaymentSchema.index({ createdAt: -1 });

export default mongoose.model<IPayment>('Payment', PaymentSchema);
