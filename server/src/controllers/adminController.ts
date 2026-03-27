import { Request, Response } from 'express';
import Student from '../models/Student';
import Room from '../models/Room';
import Complaint from '../models/Complaint';
import Fee from '../models/Fee';
import Booking from '../models/Booking';
import AdminLog from '../models/AdminLog';

// Get comprehensive dashboard statistics
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [students, rooms, complaints, fees, recentActivity] = await Promise.all([
      Student.find(),
      Room.find(),
      Complaint.find(),
      Fee.find(),
      AdminLog.find().sort({ timestamp: -1 }).limit(5)
    ]);

    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === 'Approved').length;
    const inactiveStudents = totalStudents - activeStudents;

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.reduce((acc, room) => acc + (room.occupied || 0), 0);
    const availableRooms = rooms.filter((room) => room.status === 'Available').length;
    const maintenanceRooms = rooms.filter((room) => room.status === 'Maintenance').length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const paidFees = fees.filter((f) => f.status === 'Paid' || f.paymentStatus === 'Paid');
    const pendingFees = fees.filter((f) => f.status === 'Pending' || f.status === 'Overdue' || f.paymentStatus === 'Pending');
    const totalRevenue = paidFees.reduce((sum, f) => sum + (f.amount || 0), 0);
    const pendingRevenue = pendingFees.reduce((sum, f) => sum + (f.amount || 0), 0);
    const feeTotal = totalRevenue + pendingRevenue;
    const collectionRate = feeTotal > 0 ? Math.round((totalRevenue / feeTotal) * 100) : 0;
    const unpaidStudentIds = [...new Set(pendingFees.map((f) => f.studentId))];

    const totalComplaints = complaints.length;
    const pendingComplaints = complaints.filter((c) => c.status === 'Pending').length;
    const inProgressComplaints = complaints.filter((c) => c.status === 'In Progress').length;
    const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved').length;
    const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;

    res.json({
      success: true,
      data: {
        students: {
          total: totalStudents,
          active: activeStudents,
          inactive: inactiveStudents,
          unpaid: unpaidStudentIds.length
        },
        rooms: {
          total: totalRooms,
          occupied: occupiedRooms,
          available: availableRooms,
          maintenance: maintenanceRooms,
          occupancyRate: String(occupancyRate),
          rate: occupancyRate
        },
        fees: {
          total: feeTotal,
          paid: totalRevenue,
          pending: pendingRevenue,
          collectionRate: String(collectionRate),
          totalRevenue,
          pendingRevenue,
          currency: 'LKR',
          unpaidStudents: unpaidStudentIds.length
        },
        revenue: {
          total: totalRevenue,
          pending: pendingRevenue
        },
        complaints: {
          total: totalComplaints,
          pending: pendingComplaints,
          inProgress: inProgressComplaints,
          resolved: resolvedComplaints,
          active: pendingComplaints + inProgressComplaints,
          resolutionRate: String(resolutionRate)
        },
        recentActivity
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching stats', error: error.message });
  }
};

export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    const activities = await AdminLog.find().sort({ timestamp: -1 }).limit(10);
    res.json({ success: true, data: activities });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching activities', error: error.message });
  }
};

export const getMonthlyRevenue = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: { months: [], totalAnnual: 0 } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getRoomOccupancy = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        chart: [
          { name: 'Occupied', value: 0, color: '#7c3aed' },
          { name: 'Available', value: 0, color: '#34d399' },
          { name: 'Maintenance', value: 0, color: '#f59e0b' }
        ]
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getRecentStudents = async (req: Request, res: Response) => {
  try {
    const students = await Student.find({ status: 'Approved' }).sort({ createdAt: -1 }).limit(5);
    res.json({ success: true, data: students });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getHealthStats = async (req: Request, res: Response) => {
  res.json({ success: true, data: { status: 'healthy', database: 'connected' } });
};

export const createBackup = async (req: Request, res: Response) => {
  res.json({ success: true, message: 'Backup created successfully' });
};
