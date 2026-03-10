import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IStudent extends Document {
  studentId: string;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  course: string;
  year: string;
  address?: string;
  password: string;
  roomNumber?: string;
  room?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const StudentSchema: Schema = new Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    trim: true
  },
  course: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  address: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  roomNumber: {
    type: String,
    default: ''
  },
  room: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

StudentSchema.pre<IStudent>('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

StudentSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IStudent>('Student', StudentSchema);
