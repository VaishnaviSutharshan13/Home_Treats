import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  email: string;
  phone: string;
  studentId: string;
  room: string;
  roomNumber?: string;
  course: string;
  year: string;
  joinDate: Date;
  status: 'Active' | 'Inactive';
  fees: 'Paid' | 'Pending' | 'Overdue';
  profileImage?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

const StudentSchema: Schema = new Schema({
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
  studentId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  room: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String,
    trim: true
  },
  course: {
    type: String,
    required: true,
    enum: ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Arts', 'Science']
  },
  year: {
    type: String,
    required: true,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year']
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  fees: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue'],
    default: 'Pending'
  },
  profileImage: {
    type: String,
    default: ''
  },
  emergencyContact: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true
});

export default mongoose.model<IStudent>('Student', StudentSchema);
