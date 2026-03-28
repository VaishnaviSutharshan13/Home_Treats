import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaintComment {
  text: string;
  author: string;
  createdAt: Date;
}

export interface IComplaint extends Document {
  title: string;
  description: string;
  createdBy?: mongoose.Types.ObjectId;
  student: string;
  room: string;
  category: 'Maintenance' | 'IT Support' | 'Plumbing' | 'Electrical' | 'Housekeeping';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
  submittedDate: Date;
  assignedTo?: string;
  estimatedResolution?: Date;
  resolvedDate?: Date;
  resolutionNotes?: string;
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
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  student: {
    type: String,
    required: true,
    trim: true,
  },
  room: {
    type: String,
    required: true,
    trim: true,
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
    default: '',
    trim: true,
  },
  estimatedResolution: {
    type: Date
  },
  resolvedDate: {
    type: Date
  },
  resolutionNotes: {
    type: String,
    trim: true,
  },
  rejectionReason: {
    type: String,
    trim: true,
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
