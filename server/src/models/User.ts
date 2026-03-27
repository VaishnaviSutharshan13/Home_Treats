import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'student';
  adminId?: string;
  phone?: string;
  studentId?: string;
  university?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  emergencyContact?: string;
  profileImage?: string;
  room?: string;
  roomNumber?: string;
  course?: string;
  year?: string;
  status?: 'Pending' | 'Approved' | 'Rejected' | 'Inactive';
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected' | 'Inactive';
  approvedAt?: Date;
  rejectedAt?: Date;
  isActive: boolean;
  resetToken?: string;
  resetExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'student'],
      default: 'student',
    },
    adminId: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    studentId: {
      type: String,
      trim: true,
    },
    university: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    address: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      trim: true,
      default: '',
    },
    room: {
      type: String,
    },
    roomNumber: {
      type: String,
      trim: true,
    },
    course: {
      type: String,
    },
    year: {
      type: String,
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Inactive'],
    },
    approvalStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Inactive'],
      default: 'Pending',
      index: true,
    },
    approvedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetToken: {
      type: String,
    },
    resetExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
