import { Request, Response } from 'express';
import Notification from '../models/Notification';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

type NotificationType = 'announcement' | 'fee' | 'complaint' | 'room' | 'student' | 'booking' | 'payment';
type NotificationSource = 'Student Management' | 'Fees Management' | 'Complaint Management' | 'Room Management' | 'General Announcement';
type NotificationRecipientType = 'all_students' | 'single_student' | 'all_admins' | 'single_admin';
type NotificationPriority = 'normal' | 'important' | 'urgent' | 'success';

const normalizeNotificationType = (value: string | undefined): NotificationType => {
  if (!value) return 'announcement';
  if (['announcement', 'fee', 'complaint', 'room', 'student', 'booking', 'payment'].includes(value)) {
    return value as NotificationType;
  }
  return 'announcement';
};

const normalizeNotificationSource = (value: string | undefined): NotificationSource => {
  if (!value) return 'General Announcement';
  const sources: NotificationSource[] = [
    'Student Management',
    'Fees Management',
    'Complaint Management',
    'Room Management',
    'General Announcement',
  ];
  if (sources.includes(value as NotificationSource)) return value as NotificationSource;
  return 'General Announcement';
};

const normalizePriority = (value: string | undefined): NotificationPriority => {
  if (!value) return 'normal';
  if (['normal', 'important', 'urgent', 'success'].includes(value)) return value as NotificationPriority;
  return 'normal';
};

export const findStudentUsersByStudentIds = async (studentIds: string[]) => {
  if (!studentIds.length) return [];
  return User.find({ role: 'student', studentId: { $in: studentIds } }).select('_id studentId');
};

// Helper: create notifications (used internally by controllers)
export const createNotification = async (
  title: string,
  message: string,
  type: NotificationType,
  options?: {
    source?: NotificationSource;
    recipientType?: NotificationRecipientType;
    recipientUserId?: string;
    recipientUserIds?: string[];
    relatedModuleId?: string;
    priority?: NotificationPriority;
    audience?: 'admin' | 'student' | 'all';
  }
) => {
  try {
    const normalizedType = normalizeNotificationType(type);
    const source = normalizeNotificationSource(options?.source);
    const priority = normalizePriority(options?.priority);
    const relatedModuleId = options?.relatedModuleId;

    if (options?.recipientUserIds?.length) {
      const docs = options.recipientUserIds.map((recipientUserId) => ({
        title,
        message,
        type: normalizedType,
        source,
        senderRole: 'admin',
        recipientType: 'single_student',
        recipientUserId,
        relatedModuleId,
        priority,
      }));
      await Notification.insertMany(docs);
      return;
    }

    if (options?.recipientType === 'all_students') {
      const students = await User.find({ role: 'student' }).select('_id');
      if (!students.length) return;

      const docs = students.map((student) => ({
        title,
        message,
        type: normalizedType,
        source,
        senderRole: 'admin',
        recipientType: 'all_students',
        recipientUserId: String(student._id),
        relatedModuleId,
        priority,
      }));
      await Notification.insertMany(docs);
      return;
    }

    if (options?.recipientType === 'all_admins' || (options?.audience === 'admin' && !options?.recipientUserId)) {
      const admins = await User.find({ role: 'admin' }).select('_id');
      if (!admins.length) return;

      const docs = admins.map((admin) => ({
        title,
        message,
        type: normalizedType,
        source,
        senderRole: 'admin',
        recipientType: 'all_admins',
        recipientUserId: String(admin._id),
        relatedModuleId,
        priority,
      }));
      await Notification.insertMany(docs);
      return;
    }

    await Notification.create({
      title,
      message,
      type: normalizedType,
      source,
      senderRole: 'admin',
      recipientType: options?.recipientType || 'single_student',
      recipientUserId: options?.recipientUserId,
      relatedModuleId,
      priority,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

const buildScopeQuery = (req: AuthRequest) => {
  if (!req.user) return null;
  return {
    $and: [
      {
        $or: [
          { recipientUserId: req.user.id },
          { audience: req.user.role === 'admin' ? 'admin' : 'student' },
          { audience: 'all' },
        ],
      },
      { isHidden: { $ne: true } },
    ],
  };
};

const parseBooleanQuery = (value: unknown) => String(value).toLowerCase() === 'true';

export const createAdminNotification = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      message,
      type,
      source,
      recipientType,
      recipientUserId,
      recipientUserIds,
      recipientStudentIds,
      priority,
      relatedModuleId,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const normalizedType = normalizeNotificationType(type);
    const normalizedSource = normalizeNotificationSource(source);
    const normalizedPriority = normalizePriority(priority);

    if (recipientType === 'all_students') {
      await createNotification(title, message, normalizedType, {
        source: normalizedSource,
        recipientType: 'all_students',
        priority: normalizedPriority,
        relatedModuleId,
      });

      return res.status(201).json({ success: true, message: 'Announcement sent to all students' });
    }

    const resolvedRecipientIds = new Set<string>();

    if (recipientUserId) resolvedRecipientIds.add(String(recipientUserId));

    if (Array.isArray(recipientUserIds)) {
      recipientUserIds.forEach((id) => {
        if (id) resolvedRecipientIds.add(String(id));
      });
    }

    if (Array.isArray(recipientStudentIds) && recipientStudentIds.length) {
      const students = await findStudentUsersByStudentIds(
        recipientStudentIds.map((id: string) => String(id).trim().toUpperCase()).filter(Boolean)
      );
      students.forEach((student) => resolvedRecipientIds.add(String(student._id)));
    }

    if (!resolvedRecipientIds.size) {
      return res.status(400).json({
        success: false,
        message: 'Provide recipientType=all_students or at least one selected recipient',
      });
    }

    await createNotification(title, message, normalizedType, {
      source: normalizedSource,
      recipientType: resolvedRecipientIds.size > 1 ? 'single_student' : 'single_student',
      recipientUserIds: Array.from(resolvedRecipientIds),
      priority: normalizedPriority,
      relatedModuleId,
    });

    return res.status(201).json({
      success: true,
      message: `Notification sent to ${resolvedRecipientIds.size} student(s)`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error sending notification', error: error.message });
  }
};

// GET all notifications (latest first, with optional limit)
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type ? String(req.query.type) : undefined;
    const unreadOnly = parseBooleanQuery(req.query.unreadOnly);

    const scopeQuery = buildScopeQuery(req);
    if (!scopeQuery) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const query: Record<string, any> = { ...scopeQuery };
    if (type && ['announcement', 'fee', 'complaint', 'room', 'student', 'booking', 'payment'].includes(type)) {
      query.type = type;
    }
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ ...scopeQuery, isRead: false });

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
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const type = req.query.type ? String(req.query.type) : undefined;
    const scopeQuery = buildScopeQuery(req);
    if (!scopeQuery) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const query: Record<string, any> = { ...scopeQuery, isRead: false };
    if (type && ['announcement', 'fee', 'complaint', 'room', 'student', 'booking', 'payment'].includes(type)) {
      query.type = type;
    }
    const count = await Notification.countDocuments(query);
    res.json({ success: true, unreadCount: count });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching count', error: error.message });
  }
};

// MARK single notification as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const scopeQuery = buildScopeQuery(req);
    if (!scopeQuery) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, ...scopeQuery },
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
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const type = req.query.type ? String(req.query.type) : undefined;
    const scopeQuery = buildScopeQuery(req);
    if (!scopeQuery) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const query: Record<string, any> = { ...scopeQuery, isRead: false };
    if (type && ['announcement', 'fee', 'complaint', 'room', 'student', 'booking', 'payment'].includes(type)) {
      query.type = type;
    }

    await Notification.updateMany(query, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error marking notifications', error: error.message });
  }
};

// HIDE single notification from user's view
export const hideNotification = async (req: AuthRequest, res: Response) => {
  try {
    const scopeQuery = buildScopeQuery(req);
    if (!scopeQuery) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, ...scopeQuery },
      { isHidden: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.json({ success: true, message: 'Notification removed from your view' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error hiding notification', error: error.message });
  }
};

// HIDE ALL notifications from user's view
export const clearAll = async (req: AuthRequest, res: Response) => {
  try {
    const scopeQuery = buildScopeQuery(req);
    if (!scopeQuery) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    await Notification.updateMany(scopeQuery, { isHidden: true });
    res.json({ success: true, message: 'All notifications removed from your view' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error clearing notifications', error: error.message });
  }
};
