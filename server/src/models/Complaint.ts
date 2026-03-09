import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaintComment {
  text: string;
  author: string;
  createdAt: Date;
}

export interface IComplaint extends Document {
  title: string;
  description: string;
  student: string;
  room: string;
  category: 'Maintenance' | 'IT Support' | 'Plumbing' | 'Electrical' | 'Housekeeping';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
  submittedDate: Date;
  assignedTo?: string;
  estimatedResolution?: Date;
  resolvedDate?: Date;
  rejectionReason?: string;
  comments: IComplaintComment[];
}

const ComplaintSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  student: {
    type: String,
    required: true,
    ref: 'Student'
  },
  room: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Maintenance', 'IT Support', 'Plumbing', 'Electrical', 'Housekeeping']
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  submittedDate: {
    type: Date,
    default: Date.now
  },
  assignedTo: {
    type: String,
    default: ''
  },
  estimatedResolution: {
    type: Date
  },
  resolvedDate: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  comments: [{
    text: { type: String, required: true },
    author: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema);
