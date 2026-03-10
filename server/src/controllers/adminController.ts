import { Request, Response } from 'express';
import Student from '../models/Student';
import User from '../models/User';
import Room from '../models/Room';
import Complaint from '../models/Complaint';
import Fee from '../models/Fee';

// GET system statistics
export const getStats = async (req: Request, res: Response) => {
  try {
    // Student metrics should come from auth users table, since registered users are stored in User collection.
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const availableRooms = await Room.countDocuments({ status: 'Available' });
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'Pending' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });
    const totalFees = await Fee.countDocuments();
    const paidFees = await Fee.countDocuments({ status: 'Paid' });
    const pendingFees = await Fee.countDocuments({ status: 'Pending' });

    const fees = await Fee.find();
    const totalRevenue = fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
    const pendingRevenue = fees.filter(f => f.status === 'Pending' || f.status === 'Overdue').reduce((sum, f) => sum + f.amount, 0);

    // Unpaid students
    const unpaidStudentIds = [...new Set(fees.filter(f => f.status === 'Pending' || f.status === 'Overdue').map(f => f.studentId))];

    res.json({
      success: true,
      data: {
        students: { total: totalStudents, active: activeStudents, inactive: totalStudents - activeStudents },
        rooms: {
          total: totalRooms,
          occupied: occupiedRooms,
          available: availableRooms,
          maintenance: totalRooms - occupiedRooms - availableRooms,
          occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0,
        },
        complaints: {
          total: totalComplaints,
          pending: pendingComplaints,
          resolved: resolvedComplaints,
          inProgress: totalComplaints - pendingComplaints - resolvedComplaints,
          resolutionRate: totalComplaints > 0 ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1) : 0,
        },
        fees: {
          total: totalFees,
          paid: paidFees,
          pending: pendingFees,
          collectionRate: totalFees > 0 ? ((paidFees / totalFees) * 100).toFixed(1) : 0,
          totalRevenue,
          pendingRevenue,
          currency: 'LKR',
          unpaidStudents: unpaidStudentIds.length,
        },
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin statistics',
      error: error.message,
    });
  }
};

// Helper
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds} secs ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

// GET recent activities
export const getActivities = async (req: Request, res: Response) => {
  try {
    const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(5);
    const recentComplaints = await Complaint.find().sort({ createdAt: -1 }).limit(5);
    const recentFees = await Fee.find({ status: 'Paid' }).sort({ paidDate: -1 }).limit(5);

    const activities = [
      ...recentStudents.map((student: any) => ({
        type: 'student',
        action: `New student registered: ${student.name}`,
        time: formatTimeAgo(student.createdAt),
        icon: 'user',
        details: student.studentId,
      })),
      ...recentComplaints.map((complaint: any) => ({
        type: 'complaint',
        action: `Complaint: ${complaint.title}`,
        time: formatTimeAgo(complaint.createdAt),
        icon: 'exclamation',
        details: complaint.status,
      })),
      ...recentFees.map((fee: any) => ({
        type: 'fee',
        action: `Fee payment received: $${fee.amount}`,
        time: formatTimeAgo(fee.paidDate || fee.createdAt),
        icon: 'dollar',
        details: fee.studentName,
      })),
    ].sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());

    res.json({ success: true, data: activities });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activities',
      error: error.message,
    });
  }
};

// BACKUP database
export const backupDatabase = async (req: Request, res: Response) => {
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      students: await Student.find(),
      rooms: await Room.find(),
      complaints: await Complaint.find(),
      fees: await Fee.find(),
    };
    res.json({ success: true, message: 'Database backup completed', data: backupData });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating backup',
      error: error.message,
    });
  }
};

// GET monthly revenue data for chart
export const getMonthlyRevenue = async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const fees = await Fee.find({ status: 'Paid' });

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const monthlyData = months.map((name, idx) => {
      const monthFees = fees.filter((f: any) => {
        const d = f.paidDate || f.createdAt;
        return d && d.getFullYear() === year && d.getMonth() === idx;
      });
      return {
        month: name,
        revenue: monthFees.reduce((sum: number, f: any) => sum + f.amount, 0),
        count: monthFees.length,
      };
    });

    const totalAnnual = monthlyData.reduce((s, m) => s + m.revenue, 0);

    res.json({
      success: true,
      data: { year, months: monthlyData, totalAnnual, currency: 'LKR' },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching monthly revenue', error: error.message });
  }
};

// GET room occupancy breakdown for chart
export const getRoomOccupancy = async (req: Request, res: Response) => {
  try {
    const available = await Room.countDocuments({ status: 'Available' });
    const occupied = await Room.countDocuments({ status: 'Occupied' });
    const maintenance = await Room.countDocuments({ status: 'Maintenance' });
    const total = available + occupied + maintenance;

    res.json({
      success: true,
      data: {
        available,
        occupied,
        maintenance,
        total,
        chart: [
          { name: 'Available', value: available, color: '#10B981' },
          { name: 'Occupied', value: occupied, color: '#3B82F6' },
          { name: 'Maintenance', value: maintenance, color: '#F59E0B' },
        ],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching room occupancy', error: error.message });
  }
};

// GET recent student registrations
export const getRecentStudents = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const students = await Student.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name studentId room createdAt status course year');

    res.json({
      success: true,
      data: students.map((s: any) => ({
        _id: s._id,
        name: s.name,
        studentId: s.studentId,
        room: s.room,
        status: s.status,
        course: s.course,
        year: s.year,
        registeredAt: s.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching recent students', error: error.message });
  }
};

// SYSTEM health check
export const healthCheck = async (req: Request, res: Response) => {
  try {
    const dbStats = await Student.db.db!.stats();
    res.json({
      success: true,
      message: 'System is healthy',
      data: {
        database: 'connected',
        collections: dbStats.collections,
        documents: dbStats.objects,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'System health check failed',
      error: error.message,
    });
  }
};
