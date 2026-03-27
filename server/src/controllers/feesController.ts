import { Request, Response } from 'express';
import Fee from '../models/Fee';
import Student from '../models/Student';
import { AuthRequest } from '../middleware/auth';

const getTodayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const toStatus = (fee: any): 'Paid' | 'Pending' | 'Overdue' => {
  if (fee.status === 'Paid' || fee.paymentStatus === 'Paid') return 'Paid';
  const today = getTodayStart();
  const due = new Date(fee.dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today ? 'Overdue' : 'Pending';
};

export const getAllFees = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      search = '',
      status = 'All',
      feeType = 'All',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNum - 1) * limitNum;
    const today = getTodayStart();

    const filter: any = {};

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ studentName: regex }, { studentId: regex }];
    }

    if (feeType && feeType !== 'All') {
      filter.feeType = feeType;
    }

    if (status === 'Paid') {
      filter.$and = [...(filter.$and || []), { $or: [{ status: 'Paid' }, { paymentStatus: 'Paid' }] }];
    } else if (status === 'Pending') {
      filter.$and = [
        ...(filter.$and || []),
        { $or: [{ status: 'Pending' }, { status: 'Overdue' }, { paymentStatus: 'Pending' }] },
        { dueDate: { $gte: today } },
      ];
    } else if (status === 'Overdue') {
      filter.$and = [
        ...(filter.$and || []),
        { $or: [{ status: 'Overdue' }, { status: 'Pending' }, { paymentStatus: 'Pending' }] },
        { dueDate: { $lt: today } },
      ];
    }

    const sortableFields = new Set(['amount', 'dueDate', 'createdAt']);
    const sortKey = sortableFields.has(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [fees, total] = await Promise.all([
      Fee.find(filter)
        .sort({ [sortKey]: sortDirection })
        .skip(skip)
        .limit(limitNum),
      Fee.countDocuments(filter),
    ]);

    const feesForSummary = await Fee.find(filter).select('amount dueDate status paymentStatus');
    const summary = feesForSummary.reduce(
      (acc, fee: any) => {
        const effectiveStatus = toStatus(fee);
        acc.totalFees += 1;
        if (effectiveStatus === 'Paid') acc.totalCollected += Number(fee.amount || 0);
        if (effectiveStatus === 'Pending') acc.pendingAmount += Number(fee.amount || 0);
        if (effectiveStatus === 'Overdue') acc.overdueAmount += Number(fee.amount || 0);
        return acc;
      },
      { totalFees: 0, totalCollected: 0, pendingAmount: 0, overdueAmount: 0 }
    );

    res.json({
      success: true,
      data: fees,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.max(Math.ceil(total / limitNum), 1),
      },
      summary,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching fees', error: error.message });
  }
};

export const getFeesByStudent = async (req: Request, res: Response) => {
  try {
    let { studentId } = req.params;
    studentId = String(studentId).toUpperCase().trim();
    const fees = await Fee.find({ studentId }).sort({ createdAt: -1 });
    res.json({ success: true, data: fees });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching student fees', error: error.message });
  }
};

export const createFee = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, feeType, amount, dueDate, notes } = req.body;
    
    if (!studentId || !feeType || !amount || !dueDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const searchId = String(studentId).toUpperCase().trim();
    const student = await Student.findOne({ studentId: searchId });
    const User = (await import('../models/User')).default;
    const user = await User.findOne({ studentId: searchId });

    if (!student && !user) {
      return res.status(404).json({ success: false, message: 'Student not found in system' });
    }

    const studentName = student?.name || user?.name || 'Unknown Student';
    const roomNumber = student?.roomNumber || student?.room || user?.roomNumber || user?.room || 'Unassigned';

    // Keep schema-required fields populated even for students without room assignments yet.
    const safeAmount = Number(amount);
    const today = new Date();
    const semester = `${today.getFullYear()}-${today.getMonth() < 6 ? '1' : '2'}`;

    const fee = new Fee({
      studentId: searchId,
      studentName,
      roomNumber,
      room: roomNumber,
      floor: 'N/A',
      feeType,
      amount: safeAmount,
      dueDate,
      semester,
      notes,
      status: 'Pending',
      paymentStatus: 'Pending',
      paidAmount: 0,
      remainingAmount: safeAmount
    });

    const savedFee = await fee.save();

    return res.status(201).json({ success: true, message: 'Fee created successfully', data: savedFee });
  } catch (error: any) {
    if (error?.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error while creating fee',
        error: Object.values(error.errors || {}).map((e: any) => e.message).join(', '),
      });
    }
    return res.status(500).json({ success: false, message: 'Error creating fee', error: error.message });
  }
};

export const markAsPaid = async (req: Request, res: Response) => {
  try {
    const fee = await Fee.findByIdAndUpdate(
      req.params.id, 
      {
        status: 'Paid',
        paymentStatus: 'Paid',
        paidDate: new Date(),
        paymentDate: new Date(),
        paidAmount: 0,
        remainingAmount: 0,
      }, 
      { new: true }
    );
    if (!fee) return res.status(404).json({ success: false, message: 'Fee not found' });

    fee.paidAmount = fee.amount;
    await fee.save();

    res.json({ success: true, message: 'Fee marked as paid', data: fee });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error updating fee', error: error.message });
  }
};

export const updateFee = async (req: Request, res: Response) => {
  try {
    const { feeType, amount, dueDate, notes } = req.body;

    if (amount !== undefined && Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    const updates: Record<string, any> = {};
    if (feeType !== undefined) updates.feeType = feeType;
    if (amount !== undefined) {
      const safeAmount = Number(amount);
      updates.amount = safeAmount;
      updates.remainingAmount = safeAmount;
      updates.paidAmount = 0;
      updates.status = 'Pending';
      updates.paymentStatus = 'Pending';
      updates.paidDate = undefined;
      updates.paymentDate = undefined;
    }
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (notes !== undefined) updates.notes = notes;

    const fee = await Fee.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!fee) return res.status(404).json({ success: false, message: 'Fee not found' });

    return res.json({ success: true, message: 'Fee updated successfully', data: fee });
  } catch (error: any) {
    if (error?.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error while updating fee',
        error: Object.values(error.errors || {}).map((e: any) => e.message).join(', '),
      });
    }
    return res.status(500).json({ success: false, message: 'Error updating fee', error: error.message });
  }
};

export const deleteFee = async (req: Request, res: Response) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee not found' });
    res.json({ success: true, message: 'Fee deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error deleting fee', error: error.message });
  }
};

// Aliases for retro-compatibility (no-ops for unsupported complex endpoints)
export const getStatistics = async (req: Request, res: Response) => res.json({ success: true, data: {} });
export const getRevenueReport = async (req: Request, res: Response) => res.json({ success: true, data: [] });
export const getMonthlyRevenueChart = async (req: Request, res: Response) => res.json({ success: true, data: [] });
export const getFinancialAnalytics = async (req: Request, res: Response) => res.json({ success: true, data: {} });
export const getUnpaidStudents = async (req: Request, res: Response) => res.json({ success: true, data: [] });
export const getStudentsWithRooms = async (req: Request, res: Response) => res.json({ success: true, data: [] });
export const getMonthlyReport = async (req: Request, res: Response) => res.json({ success: true, data: [] });
export const updateOverdueFees = async (req: Request, res: Response) => res.json({ success: true });
export const getFeeById = async (req: Request, res: Response) => res.json({ success: true, data: {} });
export const getReceipt = async (req: Request, res: Response) => res.json({ success: true, data: {} });
export const payFee = async (req: Request, res: Response) => res.json({ success: true, data: {} });
