import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'announcement' | 'fee' | 'complaint' | 'room' | 'student' | 'booking' | 'payment';
  source: 'Student Management' | 'Fees Management' | 'Complaint Management' | 'Room Management' | 'General Announcement';
  senderRole: 'admin';
  recipientType: 'all_students' | 'single_student' | 'all_admins' | 'single_admin';
  recipientUserId?: mongoose.Types.ObjectId;
  relatedModuleId?: string;
  priority: 'normal' | 'important' | 'urgent' | 'success';
  isRead: boolean;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['announcement', 'fee', 'complaint', 'room', 'student', 'booking', 'payment'],
      required: true,
    },
    source: {
      type: String,
      enum: ['Student Management', 'Fees Management', 'Complaint Management', 'Room Management', 'General Announcement'],
      default: 'General Announcement',
    },
    senderRole: {
      type: String,
      enum: ['admin'],
      default: 'admin',
    },
    recipientType: {
      type: String,
      enum: ['all_students', 'single_student', 'all_admins', 'single_admin'],
      default: 'single_student',
      index: true,
    },
    recipientUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    relatedModuleId: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['normal', 'important', 'urgent', 'success'],
      default: 'normal',
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Index for efficient querying of unread notifications
NotificationSchema.index({ recipientUserId: 1, isHidden: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ recipientType: 1, type: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
