import { Request, Response } from 'express';
import Fee from '../models/Fee';
import Payment from '../models/Payment';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const parseDateOnly = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const getTodayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const getStudentProfile = async (userId: string) => {
  const user = await User.findById(userId).select('name role studentId status');
  if (!user || user.role !== 'student') return null;
  return user;
};

export const submitPayment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await getStudentProfile(req.user.id);
    if (!user) {
      return res.status(403).json({ success: false, message: 'Only students can submit payments' });
    }

    if (user.status !== 'Approved') {
      return res.status(403).json({ success: false, message: 'Only approved students can submit payments' });
    }

    const { feeId, bankName, accountHolder, transactionId, paymentDate, amount } = req.body;
    const file = req.file;

    if (!feeId || !bankName || !accountHolder || !transactionId || !paymentDate || !amount) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!file) {
      return res.status(400).json({ success: false, message: 'Payment slip is required' });
    }

    if (!user.studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is not configured for this account' });
    }

    const normalizedTransactionId = String(transactionId).trim().toUpperCase();
    const exists = await Payment.findOne({ transactionId: normalizedTransactionId });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Transaction reference number already exists' });
    }

    const safeBankName = String(bankName).trim().toUpperCase();
    if (!['BOC', 'HNB'].includes(safeBankName)) {
      return res.status(400).json({ success: false, message: 'Invalid bank selection' });
    }

    const safeAmount = Number(amount);
    if (!Number.isFinite(safeAmount) || safeAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    const parsedPaymentDate = parseDateOnly(String(paymentDate));
    if (!parsedPaymentDate) {
      return res.status(400).json({ success: false, message: 'Invalid payment date' });
    }

    if (parsedPaymentDate > getTodayStart()) {
      return res.status(400).json({ success: false, message: 'Payment date cannot be a future date' });
    }

    const fee = await Fee.findOne({ _id: feeId, studentId: user.studentId });
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found for this student' });
    }

    const feeTotal = Number(fee.amount || 0);
    const feePaid = Number(fee.paidAmount || 0);
    const feeRemaining = Math.max(Number(fee.remainingAmount ?? feeTotal - feePaid), 0);

    if (safeAmount > feeRemaining) {
      return res.status(400).json({
        success: false,
        message: `Amount cannot exceed due amount (LKR ${feeRemaining.toLocaleString()})`,
      });
    }

    const slipUrl = `/uploads/payments/${file.filename}`;

    const payment = await Payment.create({
      studentId: user.studentId,
      studentName: user.name,
      feeId: fee._id,
      bankName: safeBankName,
      accountHolder: String(accountHolder).trim(),
      transactionId: normalizedTransactionId,
      paymentDate: parsedPaymentDate,
      amount: safeAmount,
      slipUrl,
      status: 'Pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Payment submitted successfully',
      data: payment,
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: 'Transaction reference number already exists' });
    }

    return res.status(500).json({ success: false, message: 'Failed to submit payment', error: error.message });
  }
};

export const getStudentPayments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await getStudentProfile(req.user.id);
    if (!user || !user.studentId) {
      return res.status(403).json({ success: false, message: 'Only students can view payment history' });
    }

    const payments = await Payment.find({ studentId: user.studentId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: payments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to load payment history', error: error.message });
  }
};

export const getAdminPayments = async (req: AuthRequest, res: Response) => {
  try {
    const { status, date } = req.query as Record<string, string>;
    const filter: Record<string, any> = {};

    if (status && ['Pending', 'Approved', 'Rejected'].includes(status)) {
      filter.status = status;
    }

    if (date) {
      const from = parseDateOnly(date);
      if (from) {
        const to = new Date(from);
        to.setDate(to.getDate() + 1);
        filter.paymentDate = { $gte: from, $lt: to };
      }
    }

    const payments = await Payment.find(filter).sort({ createdAt: -1 });

    return res.json({ success: true, data: payments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to load payments', error: error.message });
  }
};

export const updatePaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(String(status))) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Only pending payments can be updated' });
    }

    payment.status = status;
    await payment.save();

    if (status === 'Approved' && payment.feeId) {
      const fee = await Fee.findById(payment.feeId);
      if (fee) {
        const feeAmount = Number(fee.amount || 0);
        const existingPaid = Number(fee.paidAmount || 0);
        const nextPaid = Math.min(existingPaid + Number(payment.amount || 0), feeAmount);
        const remaining = Math.max(feeAmount - nextPaid, 0);

        fee.paidAmount = nextPaid;
        fee.remainingAmount = remaining;
        fee.paymentDate = payment.paymentDate;
        fee.paidDate = new Date();
        fee.transactionId = payment.transactionId;
        fee.paymentMethod = 'Bank Transfer';
        if (remaining === 0) {
          fee.status = 'Paid';
          fee.paymentStatus = 'Paid';
        } else {
          fee.status = 'Partial';
          fee.paymentStatus = 'Partial';
        }
        await fee.save();
      }
    }

    return res.json({ success: true, message: `Payment ${status.toLowerCase()} successfully`, data: payment });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update payment', error: error.message });
  }
};

export const deletePayment = async (req: AuthRequest, res: Response) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    return res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete payment', error: error.message });
  }
};
