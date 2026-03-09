import { Request, Response } from 'express';
import AdminLog from '../models/AdminLog';
import { AuthRequest } from '../middleware/auth';

// Helper: log an admin action (used internally by other controllers)
export const logAdminAction = async (
  adminName: string,
  adminId: string,
  action: string,
  targetType: 'student' | 'room' | 'complaint' | 'fee',
  targetId: string,
  details?: string
) => {
  try {
    await AdminLog.create({ adminName, adminId, action, targetType, targetId, details });
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};

// GET admin logs with filters and pagination
export const getAdminLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (req.query.targetType) filter.targetType = req.query.targetType;
    if (req.query.action) filter.action = { $regex: req.query.action, $options: 'i' };
    if (req.query.adminName) filter.adminName = { $regex: req.query.adminName, $options: 'i' };

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.timestamp = {};
      if (req.query.startDate) filter.timestamp.$gte = new Date(req.query.startDate as string);
      if (req.query.endDate) {
        const end = new Date(req.query.endDate as string);
        end.setHours(23, 59, 59, 999);
        filter.timestamp.$lte = end;
      }
    }

    const [logs, total] = await Promise.all([
      AdminLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit),
      AdminLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin logs',
      error: error.message,
    });
  }
};
