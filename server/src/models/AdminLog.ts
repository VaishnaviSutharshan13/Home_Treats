import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminLog extends Document {
  adminName: string;
  adminId: string;
  action: string;
  targetType: 'student' | 'room' | 'complaint' | 'fee';
  targetId: string;
  details?: string;
  timestamp: Date;
}

const AdminLogSchema: Schema = new Schema({
  adminName: {
    type: String,
    required: true,
    trim: true,
  },
  adminId: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
    trim: true,
  },
  targetType: {
    type: String,
    enum: ['student', 'room', 'complaint', 'fee'],
    required: true,
  },
  targetId: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient filtering/pagination
AdminLogSchema.index({ timestamp: -1 });
AdminLogSchema.index({ targetType: 1, timestamp: -1 });
AdminLogSchema.index({ adminName: 1, timestamp: -1 });

export default mongoose.model<IAdminLog>('AdminLog', AdminLogSchema);
