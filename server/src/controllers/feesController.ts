import { Request, Response } from 'express';
import Fee from '../models/Fee';
import Student from '../models/Student';
import Room from '../models/Room';
import Booking from '../models/Booking';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from './notificationController';
import { logAdminAction } from './adminLogController';

// GET all fees with optional filters
export const getAllFees = async (req: Request, res: Response) => {
  try {
    const { status, feeType, semester, floor, academicYear, search } = req.query;
    
    // Build filter object
    const filter: any = {};
    
    if (status && status !== 'All') filter.status = status;
    if (feeType && feeType !== 'All') filter.feeType = feeType;
    if (semester && semester !== 'All') filter.semester = semester;
    if (floor && floor !== 'All') filter.floor = floor;
    if (academicYear && academicYear !== 'All') filter.academicYear = academicYear;
    
    // Search functionality
    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { room: { $regex: search, $options: 'i' } }
      ];
    }
    
    const fees = await Fee.find(filter).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: fees.length,
      data: fees,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fees',
      error: error.message,
    });
  }
};

// GET single fee
export const getFeeById = async (req: Request, res: Response) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found',
      });
    }
    res.json({ success: true, data: fee });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fee',
      error: error.message,
    });
  }
};

// CREATE fee
export const createFee = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = String(req.body.studentId || '').trim();
    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required.' });
    }

    const student = await Student.findOne({ studentId });
    const User = (await import('../models/User')).default;
    const user = await User.findOne({ studentId, role: 'student' });

    if (!student && !user) {
      return res.status(404).json({ success: false, message: 'Student not found. Please check the student ID.' });
    }

    const studentStatusRaw = (student?.status || user?.status || 'Pending') as any;
    const normalizedStatus = studentStatusRaw === 'Active' ? 'Approved' : studentStatusRaw;

    if (student && (student.status as any) === 'Active') {
      student.status = 'Approved';
      await student.save();
    }

    if (user && (user.status as any) !== normalizedStatus) {
      user.status = normalizedStatus;
      await user.save();
    }

    if (normalizedStatus !== 'Approved') {
      return res.status(400).json({ success: false, message: 'Fees can only be created for approved students.' });
    }

    const studentName = req.body.studentName || student?.name || user?.name || 'Unknown Student';
    const roomNumber = req.body.roomNumber || req.body.room || student?.roomNumber || student?.room || user?.roomNumber || user?.room || 'Not Assigned';
    const semester = req.body.semester && String(req.body.semester).trim() ? req.body.semester : 'N/A';

    const fee = new Fee({
      ...req.body,
      studentId,
      studentName,
      room: roomNumber,
      roomNumber,
      semester,
      status: 'Pending',
      paymentStatus: 'Pending',
    });
    const savedFee = await fee.save();

    await createNotification(
      'Fee Created',
      `A new ${savedFee.feeType} of LKR ${savedFee.amount.toLocaleString()} has been created. Due date: ${new Date(savedFee.dueDate).toLocaleDateString('en-LK')}.`,
      'fee',
      savedFee.studentId
    );

    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), 'Created a fee', 'fee', String(savedFee._id), `${savedFee.feeType} for ${savedFee.studentName}`);
    }

    res.status(201).json({
      success: true,
      message: 'Fee created successfully',
      data: savedFee,
    });
  } catch (error: any) {
    const validationMessage =
      error?.name === 'ValidationError'
        ? Object.values(error.errors || {}).map((item: any) => item.message).join(', ')
        : error.message;

    res.status(500).json({
      success: false,
      message: validationMessage || 'Error creating fee',
      error: error.message,
    });
  }
};

// UPDATE fee
export const updateFee = async (req: AuthRequest, res: Response) => {
  try {
    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found',
      });
    }

    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), 'Updated fee status', 'fee', String(req.params.id), `${fee.feeType} for ${fee.studentName}`);
    }

    res.json({
      success: true,
      message: 'Fee updated successfully',
      data: fee,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating fee',
      error: error.message,
    });
  }
};

// DELETE fee
export const deleteFee = async (req: Request, res: Response) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found',
      });
    }
    res.json({
      success: true,
      message: 'Fee deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting fee',
      error: error.message,
    });
  }
};

// PAY fee
export const payFee = async (req: AuthRequest, res: Response) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found',
      });
    }

    fee.status = 'Paid';
    fee.paidDate = req.body.paidDate;
    fee.paymentMethod = req.body.paymentMethod;
    fee.transactionId = req.body.transactionId;
    fee.paidAmount = req.body.paidAmount;
    fee.remainingAmount = fee.amount - req.body.paidAmount;

    if (fee.remainingAmount <= 0) {
      fee.status = 'Paid';
    } else {
      fee.status = 'Partial';
    }
    fee.paymentStatus = fee.status;

    await fee.save();

    // Notification + Admin Log
    await createNotification('Payment Received', `Fee payment completed by Student ${fee.studentId}`, 'payment', fee.studentId);
    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), 'Recorded fee payment', 'fee', String(req.params.id), `${fee.feeType} by ${fee.studentName}`);
    }

    res.json({
      success: true,
      message: 'Fee payment recorded successfully',
      data: fee,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.message,
    });
  }
};

// GET fees by student (self-access: students can only view their own)
export const getFeesByStudent = async (req: AuthRequest, res: Response) => {
  try {
    // Students can only access their own fees
    if (req.user?.role === 'student') {
      const User = (await import('../models/User')).default;
      const currentUser = await User.findById(req.user.id);
      if (!currentUser || currentUser.studentId !== req.params.studentId) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only view your own fees.' });
      }
    }
    const fees = await Fee.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: fees.length,
      data: fees,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student fees',
      error: error.message,
    });
  }
};

// GET revenue report
export const getRevenueReport = async (req: Request, res: Response) => {
  try {
    const fees = await Fee.find();

    const totalRevenue = fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
    const pendingRevenue = fees.filter(f => f.status === 'Pending' || f.status === 'Overdue').reduce((sum, f) => sum + f.amount, 0);
    const partialRevenue = fees.filter(f => f.status === 'Partial').reduce((sum, f) => sum + (f.paidAmount || 0), 0);

    res.json({
      success: true,
      data: {
        totalRevenue,
        pendingRevenue,
        partialRevenue,
        totalCollected: totalRevenue + partialRevenue,
        totalPending: pendingRevenue,
        feeCount: fees.length,
        currency: 'LKR',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error generating revenue report', error: error.message });
  }
};

// GET dashboard statistics
export const getStatistics = async (req: Request, res: Response) => {
  try {
    const fees = await Fee.find();
    
    // Calculate statistics
    const totalRevenue = fees
      .filter(f => f.status === 'Paid')
      .reduce((sum, f) => sum + f.amount, 0);
    
    const pendingPayments = fees
      .filter(f => f.status === 'Pending')
      .reduce((sum, f) => sum + f.amount, 0);
    
    const partiallyPaidFees = fees.filter(f => f.status === 'Partial');
    const partiallyPaidAmount = partiallyPaidFees.reduce((sum, f) => sum + (f.remainingAmount || 0), 0);
    
    const overduePayments = fees
      .filter(f => f.status === 'Overdue')
      .reduce((sum, f) => sum + f.amount, 0);
    
    const totalCollected = totalRevenue + fees
      .filter(f => f.status === 'Partial')
      .reduce((sum, f) => sum + (f.paidAmount || 0), 0);

    // Calculate monthly income (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const monthlyFees = fees.filter(f => {
      const paidDate = f.paidDate ? new Date(f.paidDate) : null;
      return paidDate && paidDate >= startOfMonth && paidDate <= endOfMonth && f.status === 'Paid';
    });
    const monthlyIncome = monthlyFees.reduce((sum, f) => sum + f.amount, 0);

    // Calculate paid/unpaid students
    const uniqueStudents = [...new Set(fees.map(f => f.studentId))];
    const paidStudents = uniqueStudents.filter(studentId => {
      const studentFees = fees.filter(f => f.studentId === studentId);
      return studentFees.some(f => f.status === 'Paid');
    });
    const unpaidStudents = uniqueStudents.filter(studentId => {
      const studentFees = fees.filter(f => f.studentId === studentId);
      return studentFees.every(f => f.status === 'Pending' || f.status === 'Overdue');
    });
    
    res.json({
      success: true,
      data: {
        totalRevenue,
        totalRevenueCount: fees.filter(f => f.status === 'Paid').length,
        monthlyIncome,
        monthlyIncomeCount: monthlyFees.length,
        pendingPayments,
        pendingPaymentsCount: fees.filter(f => f.status === 'Pending').length,
        partiallyPaidAmount,
        partiallyPaidCount: partiallyPaidFees.length,
        overduePayments,
        overduePaymentsCount: fees.filter(f => f.status === 'Overdue').length,
        paidStudentsCount: paidStudents.length,
        unpaidStudentsCount: unpaidStudents.length,
        totalCollected,
        currency: 'LKR',
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching statistics', 
      error: error.message 
    });
  }
};

// GET monthly fee report
export const getMonthlyReport = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const fees = await Fee.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 });

    const paid = fees.filter(f => f.status === 'Paid');
    const pending = fees.filter(f => f.status === 'Pending' || f.status === 'Overdue');

    res.json({
      success: true,
      data: {
        month: `${year}-${month}`,
        totalFees: fees.length,
        paidCount: paid.length,
        pendingCount: pending.length,
        totalCollected: paid.reduce((s, f) => s + f.amount, 0),
        totalPending: pending.reduce((s, f) => s + f.amount, 0),
        currency: 'LKR',
        fees,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error generating monthly report', error: error.message });
  }
};

// GET receipt for a specific fee
export const getReceipt = async (req: Request, res: Response) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee not found' });
    }

    if (fee.status !== 'Paid' && fee.status !== 'Partial') {
      return res.status(400).json({ success: false, message: 'Receipt only available for paid fees' });
    }

    res.json({
      success: true,
      data: {
        receiptNo: `REC-${fee.transactionId || fee._id}`,
        date: fee.paidDate || new Date(),
        studentName: fee.studentName,
        studentId: fee.studentId,
        room: fee.room,
        feeType: fee.feeType,
        semester: fee.semester,
        totalAmount: fee.amount,
        paidAmount: fee.paidAmount || fee.amount,
        remainingAmount: fee.remainingAmount || 0,
        paymentMethod: fee.paymentMethod,
        transactionId: fee.transactionId,
        status: fee.status,
        currency: 'LKR',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error generating receipt', error: error.message });
  }
};

// GET unpaid students
export const getUnpaidStudents = async (_req: Request, res: Response) => {
  try {
    const unpaidFees = await Fee.find({ status: { $in: ['Pending', 'Overdue'] } }).sort({ dueDate: 1 });

    // Group by student
    const studentMap: Record<string, any> = {};
    unpaidFees.forEach(fee => {
      const key = fee.studentId;
      if (!studentMap[key]) {
        studentMap[key] = {
          studentId: fee.studentId,
          studentName: fee.studentName,
          room: fee.room,
          floor: fee.floor,
          totalUnpaid: 0,
          fees: [],
        };
      }
      studentMap[key].totalUnpaid += fee.amount;
      studentMap[key].fees.push({
        id: fee._id,
        feeType: fee.feeType,
        amount: fee.amount,
        dueDate: fee.dueDate,
        status: fee.status,
      });
    });

    res.json({
      success: true,
      data: Object.values(studentMap),
      currency: 'LKR',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching unpaid students', error: error.message });
  }
};

// GET students with rooms for dropdown
export const getStudentsWithRooms = async (req: Request, res: Response) => {
  try {
    const students = await Student.find({ status: { $in: ['Approved', 'Active'] as any } })
      .select('name studentId room roomNumber course year status')
      .sort({ name: 1 });

    const normalizedStudents = students.map((s: any) => ({
      ...s.toObject(),
      status: s.status === 'Active' ? 'Approved' : s.status,
      room: s.room || s.roomNumber || '',
    }));
    
    const rooms = await Room.find({ status: { $ne: 'Maintenance' } })
      .select('roomNumber floor block')
      .sort({ roomNumber: 1 });
    
    res.json({
      success: true,
      data: {
        students: normalizedStudents,
        rooms,
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching students and rooms', 
      error: error.message 
    });
  }
};

// Update overdue fees (should be called by a cron job or manually)
export const updateOverdueFees = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await Fee.updateMany(
      {
        status: 'Pending',
        dueDate: { $lt: today }
      },
      {
        $set: { status: 'Overdue', paymentStatus: 'Overdue' }
      }
    );
    
    // Send notifications to students with overdue fees
    const overdueFees = await Fee.find({ status: 'Overdue' });
    for (const fee of overdueFees) {
      await createNotification(
        'Overdue Fee Payment',
        `Your ${fee.feeType} of LKR ${fee.amount.toLocaleString()} for ${fee.semester} is overdue. Please make payment immediately.`,
        'fee',
        fee.studentId
      );
    }
    
    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} fees to overdue status`,
      data: { count: result.modifiedCount },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating overdue fees', 
      error: error.message 
    });
  }
};

// GET monthly revenue chart data (last 6 months)
export const getMonthlyRevenueChart = async (req: Request, res: Response) => {
  try {
    const fees = await Fee.find({ status: { $in: ['Paid', 'Partial'] } });
    const now = new Date();
    const labels = [];
    const data = [];
    
    // Get last 6 months data
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
      
      const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      labels.push(monthLabel);
      
      const monthRevenue = fees
        .filter(f => {
          const paidDate = f.paidDate ? new Date(f.paidDate) : new Date(f.createdAt);
          return paidDate >= monthStart && paidDate <= monthEnd;
        })
        .reduce((sum, f) => sum + (f.status === 'Paid' ? f.amount : (f.paidAmount || 0)), 0);
      
      data.push(monthRevenue);
    }
    
    res.json({
      success: true,
      data: {
        labels,
        datasets: [{
          label: 'Monthly Revenue',
          data,
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          borderColor: 'rgba(147, 51, 234, 1)',
          borderWidth: 2,
          tension: 0.4,
        }],
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching monthly revenue chart', 
      error: error.message 
    });
  }
};

// GET financial analytics
export const getFinancialAnalytics = async (req: Request, res: Response) => {
  try {
    const fees = await Fee.find();
    
    // Top 5 Paying Students
    const studentPayments: Record<string, { name: string; total: number; count: number }> = {};
    fees.forEach(fee => {
      if (fee.status === 'Paid' || fee.status === 'Partial') {
        const paid = fee.status === 'Paid' ? fee.amount : (fee.paidAmount || 0);
        if (!studentPayments[fee.studentId]) {
          studentPayments[fee.studentId] = {
            name: fee.studentName,
            total: 0,
            count: 0,
          };
        }
        studentPayments[fee.studentId].total += paid;
        studentPayments[fee.studentId].count += 1;
      }
    });
    
    const topPayingStudents = Object.entries(studentPayments)
      .map(([studentId, data]) => ({ studentId, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    
    // Floor Revenue Distribution
    const floorRevenue: Record<string, number> = {};
    fees.forEach(fee => {
      if ((fee.status === 'Paid' || fee.status === 'Partial') && fee.floor) {
        const paid = fee.status === 'Paid' ? fee.amount : (fee.paidAmount || 0);
        floorRevenue[fee.floor] = (floorRevenue[fee.floor] || 0) + paid;
      }
    });
    
    const floorRevenueData = Object.entries(floorRevenue)
      .map(([floor, revenue]) => ({ floor, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
    
    // Most Occupied Floors (by number of students with fees)
    const floorOccupancy: Record<string, Set<string>> = {};
    fees.forEach(fee => {
      if (fee.floor) {
        if (!floorOccupancy[fee.floor]) floorOccupancy[fee.floor] = new Set();
        floorOccupancy[fee.floor].add(fee.studentId);
      }
    });
    
    const mostOccupiedFloors = Object.entries(floorOccupancy)
      .map(([floor, students]) => ({ floor, studentCount: students.size }))
      .sort((a, b) => b.studentCount - a.studentCount);
    
    // Payment Trends (by payment method)
    const paymentMethodStats: Record<string, { count: number; total: number }> = {};
    fees.forEach(fee => {
      if (fee.paymentMethod && (fee.status === 'Paid' || fee.status === 'Partial')) {
        if (!paymentMethodStats[fee.paymentMethod]) {
          paymentMethodStats[fee.paymentMethod] = { count: 0, total: 0 };
        }
        paymentMethodStats[fee.paymentMethod].count += 1;
        paymentMethodStats[fee.paymentMethod].total += fee.status === 'Paid' ? fee.amount : (fee.paidAmount || 0);
      }
    });
    
    const paymentTrends = Object.entries(paymentMethodStats)
      .map(([method, data]) => ({ method, ...data }))
      .sort((a, b) => b.total - a.total);
    
    res.json({
      success: true,
      data: {
        topPayingStudents,
        floorRevenueData,
        mostOccupiedFloors,
        paymentTrends,
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching financial analytics', 
      error: error.message 
    });
  }
};
