import { Request, Response } from 'express';
import Notification from '../models/Notification';

// Helper: create a notification (used internally by other controllers)
export const createNotification = async (
  title: string,
  message: string,
  type: 'student' | 'complaint' | 'booking' | 'payment'
) => {
  try {
    await Notification.create({ title, message, type });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// GET all notifications (latest first, with optional limit)
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message,
    });
  }
};

// GET unread count only (lightweight endpoint for polling)
export const getUnreadCount = async (_req: Request, res: Response) => {
  try {
    const count = await Notification.countDocuments({ isRead: false });
    res.json({ success: true, unreadCount: count });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching count', error: error.message });
  }
};

// MARK single notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, data: notification });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error marking notification', error: error.message });
  }
};

// MARK ALL as read
export const markAllAsRead = async (_req: Request, res: Response) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error marking notifications', error: error.message });
  }
};

// CLEAR ALL notifications
export const clearAll = async (_req: Request, res: Response) => {
  try {
    await Notification.deleteMany({});
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error clearing notifications', error: error.message });
  }
};
