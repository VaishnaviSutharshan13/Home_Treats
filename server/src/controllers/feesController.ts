import { Request, Response } from 'express';
import Fee from '../models/Fee';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from './notificationController';
import { logAdminAction } from './adminLogController';

// GET all fees
export const getAllFees = async (req: Request, res: Response) => {
  try {
    const fees = await Fee.find().sort({ createdAt: -1 });
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
    const fee = new Fee({
      ...req.body,
      status: 'Pending',
    });
    const savedFee = await fee.save();

    const studentUser = await User.findOne({ role: 'student', studentId: savedFee.studentId }).select('_id name');

    if (studentUser) {
      await createNotification(
        'New Fee Added',
        `A new ${savedFee.feeType} of LKR ${savedFee.amount.toLocaleString()} has been added. Due date: ${new Date(savedFee.dueDate).toLocaleDateString()}.`,
        'fee',
        {
          source: 'Fees Management',
          recipientUserId: String(studentUser._id),
          relatedModuleId: String(savedFee._id),
          priority: 'important',
        }
      );
    }

    if (req.user) {
      await logAdminAction(req.user.email, String(req.user.id), 'Created a fee', 'fee', String(savedFee._id), `${savedFee.feeType} for ${savedFee.studentName}`);
    }

    res.status(201).json({
      success: true,
      message: 'Fee created successfully',
      data: savedFee,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating fee',
      error: error.message,
    });
  }
};

// UPDATE fee
export const updateFee = async (req: AuthRequest, res: Response) => {
  try {
    const previousFee = await Fee.findById(req.params.id);

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

    const studentUser = await User.findOne({ role: 'student', studentId: fee.studentId }).select('_id name');

    if (studentUser && previousFee && previousFee.status !== fee.status) {
      let title = 'Fee Status Updated';
      let message = `Your ${fee.feeType} status changed to ${fee.status}.`;
      let priority: 'normal' | 'important' | 'urgent' | 'success' = 'normal';

      if (fee.status === 'Overdue') {
        title = 'Payment Overdue Alert';
        message = `Your ${fee.feeType} payment is overdue. Please settle LKR ${fee.amount.toLocaleString()} as soon as possible.`;
        priority = 'urgent';
      } else if (fee.status === 'Paid') {
        title = 'Payment Confirmed';
        message = `Payment confirmed for ${fee.feeType}. Thank you.`;
        priority = 'success';
      }

      await createNotification(title, message, 'fee', {
        source: 'Fees Management',
        recipientUserId: String(studentUser._id),
        relatedModuleId: String(fee._id),
        priority,
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

    await fee.save();

    const studentUser = await User.findOne({ role: 'student', studentId: fee.studentId }).select('_id name');

    if (studentUser) {
      await createNotification(
        fee.status === 'Paid' ? 'Payment Confirmed' : 'Partial Payment Recorded',
        fee.status === 'Paid'
          ? `Your ${fee.feeType} payment has been confirmed.`
          : `Partial payment received for ${fee.feeType}. Remaining amount: LKR ${Math.max(0, fee.remainingAmount || 0).toLocaleString()}.`,
        'fee',
        {
          source: 'Fees Management',
          recipientUserId: String(studentUser._id),
          relatedModuleId: String(fee._id),
          priority: fee.status === 'Paid' ? 'success' : 'important',
        }
      );
    }

    // Notification + Admin Log
    await createNotification('Payment Received', `Fee payment completed by Student ${fee.studentId}`, 'fee', {
      source: 'Fees Management',
      recipientType: 'all_admins',
      relatedModuleId: String(fee._id),
      priority: 'success',
    });
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
