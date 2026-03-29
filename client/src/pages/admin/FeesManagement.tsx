import { useEffect, useMemo, useState } from 'react';
import {
  FaCalendarAlt,
  FaCheck,
  FaCoins,
  FaEdit,
  FaExclamationTriangle,
  FaEye,
  FaMoneyBillWave,
  FaSearch,
  FaSpinner,
  FaTrash,
  FaUser,
  FaWallet,
} from 'react-icons/fa';
import Sidebar from '../../components/layout/Sidebar';
import { feesService, paymentService, studentService } from '../../services';

type FeeStatus = 'Paid' | 'Pending' | 'Overdue';

interface Fee {
  _id: string;
  studentName: string;
  studentId: string;
  room: string;
  roomNumber?: string;
  feeType: string;
  amount: number;
  dueDate: string;
  status: string;
  paymentStatus?: string;
  notes?: string;
}

interface Student {
  _id: string;
  name: string;
  studentId: string;
  room?: string;
  roomNumber?: string;
}

interface FeeSummary {
  totalFees: number;
  totalCollected: number;
  pendingAmount: number;
  overdueAmount: number;
}

interface FeePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface FeeQuery {
  page: number;
  limit: number;
  search: string;
  status: 'All' | 'Paid' | 'Pending' | 'Overdue';
  feeType: string;
  sortBy: 'amount' | 'dueDate' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

interface PaymentRecord {
  _id: string;
  studentName: string;
  bankName: 'BOC' | 'HNB';
  amount: number;
  paymentDate: string;
  slipUrl: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  transactionId: string;
}

const statusBadgeStyles: Record<FeeStatus, string> = {
  Paid: 'bg-green-100 text-green-700 border border-green-200',
  Pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  Overdue: 'bg-red-100 text-red-700 border border-red-200',
};

const FeesManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [summary, setSummary] = useState<FeeSummary>({
    totalFees: 0,
    totalCollected: 0,
    pendingAmount: 0,
    overdueAmount: 0,
  });
  const [pagination, setPagination] = useState<FeePagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [query, setQuery] = useState<FeeQuery>({
    page: 1,
    limit: 10,
    search: '',
    status: 'All',
    feeType: 'All',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [studentSearch, setStudentSearch] = useState('');
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentActionId, setPaymentActionId] = useState<string | null>(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [paymentDateFilter, setPaymentDateFilter] = useState('');
  const [addForm, setAddForm] = useState({
    studentId: '',
    studentName: '',
    room: '',
    feeType: 'Monthly',
    amount: 4500,
    dueDate: '',
    notes: '',
  });

  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [editForm, setEditForm] = useState({
    feeType: 'Monthly',
    amount: 4500,
    dueDate: '',
    notes: '',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2600);
  };

  const formatLKR = (amount: number) => `LKR ${Number(amount || 0).toLocaleString()}`;

  const getEffectiveStatus = (fee: Fee): FeeStatus => {
    const rawStatus = String(fee.status || fee.paymentStatus || '').toLowerCase();
    if (rawStatus === 'paid') return 'Paid';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(fee.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today ? 'Overdue' : 'Pending';
  };

  const feeTypes = useMemo(() => {
    const builtIn = ['Monthly', 'Hostel', 'Fine', 'Other', 'Monthly Hostel Fee', 'Maintenance Fee', 'Mess Fee', 'Library Fee'];
    const dynamic = fees.map((f) => f.feeType).filter(Boolean);
    return ['All', ...Array.from(new Set([...builtIn, ...dynamic]))];
  }, [fees]);

  const apiOrigin = useMemo(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace(/\/api\/?$/, '');
  }, []);

  const filteredStudents = useMemo(() => {
    const term = studentSearch.trim().toLowerCase();
    if (!term) return students.slice(0, 12);
    return students
      .filter(
        (s) =>
          s.name?.toLowerCase().includes(term) ||
          s.studentId?.toLowerCase().includes(term) ||
          (s.room || s.roomNumber || '').toLowerCase().includes(term)
      )
      .slice(0, 12);
  }, [studentSearch, students]);

  const selectedStudent = useMemo(
    () => students.find((s) => s.studentId === addForm.studentId),
    [students, addForm.studentId]
  );

  const isFormValid =
    addForm.studentId.trim() &&
    addForm.feeType.trim() &&
    addForm.amount > 0 &&
    addForm.dueDate.trim();

  const loadStudents = async () => {
    const studentRes = await studentService.getAll();
    setStudents(studentRes.data || []);
  };

  const loadFees = async () => {
    setLoading(true);
    try {
      const response = await feesService.getAll(query);
      setFees(response.data || []);
      setPagination(
        response.pagination || {
          page: query.page,
          limit: query.limit,
          total: (response.data || []).length,
          totalPages: 1,
        }
      );
      setSummary(
        response.summary || {
          totalFees: (response.data || []).length,
          totalCollected: 0,
          pendingAmount: 0,
          overdueAmount: 0,
        }
      );
    } catch (error: any) {
      showToast('error', error?.response?.data?.message || 'Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    setPaymentsLoading(true);
    try {
      const params: { status?: 'Pending' | 'Approved' | 'Rejected'; date?: string } = {};
      if (paymentStatusFilter !== 'All') params.status = paymentStatusFilter;
      if (paymentDateFilter) params.date = paymentDateFilter;
      const response = await paymentService.getAdmin(params);
      setPayments(response.data || []);
    } catch (error: any) {
      showToast('error', error?.response?.data?.message || 'Failed to load payments');
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    loadFees();
  }, [query]);

  useEffect(() => {
    loadPayments();
  }, [paymentStatusFilter, paymentDateFilter]);

  const toAbsoluteSlipUrl = (slipUrl: string) => {
    if (!slipUrl) return '#';
    if (slipUrl.startsWith('http')) return slipUrl;
    return `${apiOrigin}${slipUrl}`;
  };

  const updatePaymentStatus = async (paymentId: string, status: 'Approved' | 'Rejected') => {
    setPaymentActionId(paymentId);
    try {
      await paymentService.updateStatus(paymentId, status);
      showToast('success', `Payment ${status.toLowerCase()} successfully`);
      await Promise.all([loadPayments(), loadFees()]);
    } catch (error: any) {
      showToast('error', error?.response?.data?.message || `Failed to ${status.toLowerCase()} payment`);
    } finally {
      setPaymentActionId(null);
    }
  };

  const deletePayment = async (paymentId: string) => {
    if (!window.confirm('Delete this payment submission? This action cannot be undone.')) return;
    setPaymentActionId(paymentId);
    try {
      await paymentService.delete(paymentId);
      showToast('success', 'Payment deleted successfully');
      await loadPayments();
    } catch (error: any) {
      showToast('error', error?.response?.data?.message || 'Failed to delete payment');
    } finally {
      setPaymentActionId(null);
    }
  };

  const selectStudent = (student: Student) => {
    const room = student.room || student.roomNumber || 'Not Assigned';
    setAddForm((prev) => ({
      ...prev,
      studentId: student.studentId,
      studentName: student.name,
      room,
    }));
    setStudentSearch(`${student.name} (${student.studentId})`);
    setStudentDropdownOpen(false);
  };

  const resetAddForm = () => {
    setAddForm({
      studentId: '',
      studentName: '',
      room: '',
      feeType: 'Monthly',
      amount: 4500,
      dueDate: '',
      notes: '',
    });
    setStudentSearch('');
  };

  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      showToast('error', 'Please fill all required fields and enter an amount above 0');
      return;
    }

    setFormSubmitting(true);
    try {
      await feesService.create({
        studentId: addForm.studentId,
        feeType: addForm.feeType,
        amount: addForm.amount,
        dueDate: addForm.dueDate,
        notes: addForm.notes,
      });
      showToast('success', 'Fee sent successfully');
      resetAddForm();
      setQuery((prev) => ({ ...prev, page: 1 }));
      await loadFees();
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Failed to send fee');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    setActionLoadingId(id);
    try {
      await feesService.pay(id, {});
      showToast('success', 'Fee marked as paid');
      await loadFees();
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Failed to mark as paid');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openEditModal = (fee: Fee) => {
    setEditingFee(fee);
    setEditForm({
      feeType: fee.feeType,
      amount: fee.amount,
      dueDate: new Date(fee.dueDate).toISOString().split('T')[0],
      notes: fee.notes || '',
    });
  };

  const handleEditFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFee) return;
    if (!editForm.feeType || !editForm.dueDate || editForm.amount <= 0) {
      showToast('error', 'Please fill valid edit fields (amount must be above 0)');
      return;
    }

    setActionLoadingId(editingFee._id);
    try {
      await feesService.update(editingFee._id, {
        feeType: editForm.feeType,
        amount: editForm.amount,
        dueDate: editForm.dueDate,
        notes: editForm.notes,
      });
      showToast('success', 'Fee updated successfully');
      setEditingFee(null);
      await loadFees();
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Failed to update fee');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteFee = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this fee?')) return;
    setActionLoadingId(id);
    try {
      await feesService.delete(id);
      showToast('success', 'Fee deleted successfully');
      await loadFees();
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Failed to delete fee');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} userRole="admin" />

      <div className="flex-1 lg:ml-64 p-6 md:p-8">
        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white ${
              toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {toast.message}
          </div>
        )}

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Fees Management</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Fees</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{summary.totalFees}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-700">Total Collected</p>
              <FaCheck className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-700 mt-1">{formatLKR(summary.totalCollected)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-yellow-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-yellow-700">Pending Amount</p>
              <FaWallet className="text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-700 mt-1">{formatLKR(summary.pendingAmount)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-700">Overdue Amount</p>
              <FaExclamationTriangle className="text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-700 mt-1">{formatLKR(summary.overdueAmount)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-5">Send Fee</h2>
          <form onSubmit={handleAddFee} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 relative">
              <label className="text-sm text-gray-600 mb-1 block">Select Student</label>
              <FaSearch className="absolute left-3 top-[38px] text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-200"
                placeholder="Search by student name, ID, or room"
                value={studentSearch}
                onFocus={() => setStudentDropdownOpen(true)}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  setStudentDropdownOpen(true);
                  setAddForm((prev) => ({ ...prev, studentId: '', studentName: '', room: '' }));
                }}
              />
              {studentDropdownOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                  {filteredStudents.length === 0 ? (
                    <div className="px-3 py-3 text-sm text-gray-500">No students found</div>
                  ) : (
                    filteredStudents.map((student) => (
                      <button
                        key={student._id}
                        type="button"
                        onClick={() => selectStudent(student)}
                        className="w-full text-left px-3 py-2.5 hover:bg-purple-50 transition"
                      >
                        <p className="text-sm font-medium text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-500">
                          {student.studentId} • Room {student.room || student.roomNumber || 'N/A'}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="text-sm text-gray-600 mb-1 block">Student ID</label>
              <FaUser className="absolute left-3 top-[38px] text-gray-400" />
              <input
                type="text"
                readOnly
                value={addForm.studentId}
                className="w-full pl-10 pr-3 py-2.5 border rounded-xl bg-gray-100 text-gray-700"
                placeholder="Auto-filled"
              />
            </div>

            <div className="relative">
              <label className="text-sm text-gray-600 mb-1 block">Room Number</label>
              <FaCoins className="absolute left-3 top-[38px] text-gray-400" />
              <input
                type="text"
                readOnly
                value={addForm.room || (selectedStudent?.room || selectedStudent?.roomNumber || '')}
                className="w-full pl-10 pr-3 py-2.5 border rounded-xl bg-gray-100 text-gray-700"
                placeholder="Auto-filled"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Fee Type</label>
              <select
                className="w-full px-3 py-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-200"
                value={addForm.feeType}
                onChange={(e) => setAddForm((prev) => ({ ...prev, feeType: e.target.value }))}
              >
                <option value="Monthly">Monthly</option>
                <option value="Hostel">Hostel</option>
                <option value="Fine">Fine</option>
                <option value="Other">Other</option>
                <option value="Monthly Hostel Fee">Monthly Hostel Fee</option>
                <option value="Maintenance Fee">Maintenance Fee</option>
                <option value="Mess Fee">Mess Fee</option>
                <option value="Library Fee">Library Fee</option>
              </select>
            </div>

            <div className="relative">
              <label className="text-sm text-gray-600 mb-1 block">Amount</label>
              <FaMoneyBillWave className="absolute left-3 top-[38px] text-gray-400" />
              <input
                type="number"
                min={1}
                value={addForm.amount}
                onChange={(e) => setAddForm((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                className="w-full pl-10 pr-3 py-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div className="relative">
              <label className="text-sm text-gray-600 mb-1 block">Due Date</label>
              <FaCalendarAlt className="absolute left-3 top-[38px] text-gray-400" />
              <input
                type="date"
                value={addForm.dueDate}
                onChange={(e) => setAddForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                className="w-full pl-10 pr-3 py-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-600 mb-1 block">Notes</label>
              <input
                type="text"
                placeholder="e.g., March Hostel Fee"
                value={addForm.notes}
                onChange={(e) => setAddForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={!isFormValid || formSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium shadow-sm"
              >
                {formSubmitting ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                {formSubmitting ? 'Sending...' : 'Send Fee'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
              <div className="xl:col-span-2 relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search student name or ID"
                  value={query.search}
                  onChange={(e) => setQuery((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="w-full pl-10 pr-3 py-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
              <select
                value={query.status}
                onChange={(e) => setQuery((prev) => ({ ...prev, status: e.target.value as FeeQuery['status'], page: 1 }))}
                className="px-3 py-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="All">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
              <select
                value={query.feeType}
                onChange={(e) => setQuery((prev) => ({ ...prev, feeType: e.target.value, page: 1 }))}
                className="px-3 py-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-200"
              >
                {feeTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'All' ? 'All Fee Types' : type}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <select
                  value={query.sortBy}
                  onChange={(e) => setQuery((prev) => ({ ...prev, sortBy: e.target.value as FeeQuery['sortBy'], page: 1 }))}
                  className="flex-1 px-3 py-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-200"
                >
                  <option value="createdAt">Sort: Newest</option>
                  <option value="amount">Sort: Amount</option>
                  <option value="dueDate">Sort: Due Date</option>
                </select>
                <select
                  value={query.sortOrder}
                  onChange={(e) => setQuery((prev) => ({ ...prev, sortOrder: e.target.value as FeeQuery['sortOrder'], page: 1 }))}
                  className="px-3 py-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-200"
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <FaSpinner className="animate-spin mx-auto mb-3 text-purple-600" />
              Loading fees...
            </div>
          ) : fees.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FaWallet className="mx-auto text-4xl text-gray-300 mb-3" />
              <p className="text-lg font-medium text-gray-700">No fees found. Start by adding a fee.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                      <th className="p-4 font-semibold">Student</th>
                      <th className="p-4 font-semibold">Room</th>
                      <th className="p-4 font-semibold">Fee Type</th>
                      <th className="p-4 font-semibold">Amount</th>
                      <th className="p-4 font-semibold">Due Date</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {fees.map((fee) => {
                      const effectiveStatus = getEffectiveStatus(fee);
                      const isOverdue = effectiveStatus === 'Overdue';
                      return (
                        <tr
                          key={fee._id}
                          className={`transition hover:bg-purple-50/40 ${isOverdue ? 'bg-red-50/40' : 'bg-white'}`}
                        >
                          <td className="p-4">
                            <p className="font-medium text-gray-800">{fee.studentName}</p>
                            <p className="text-xs text-gray-500">{fee.studentId}</p>
                          </td>
                          <td className="p-4 text-gray-700">{fee.room || fee.roomNumber || 'N/A'}</td>
                          <td className="p-4 text-gray-700">{fee.feeType}</td>
                          <td className="p-4 font-semibold text-gray-800">{formatLKR(fee.amount)}</td>
                          <td className="p-4 text-gray-700">{new Date(fee.dueDate).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeStyles[effectiveStatus]}`}>
                              {effectiveStatus}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end gap-2">
                              {effectiveStatus !== 'Paid' && (
                                <button
                                  onClick={() => handleMarkAsPaid(fee._id)}
                                  disabled={actionLoadingId === fee._id}
                                  className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition"
                                  title="Mark as Paid"
                                >
                                  {actionLoadingId === fee._id ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                                </button>
                              )}
                              <button
                                onClick={() => openEditModal(fee)}
                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                                title="Edit Fee"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteFee(fee._id)}
                                disabled={actionLoadingId === fee._id}
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                                title="Delete Fee"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500">
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuery((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setQuery((prev) => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Payment Submissions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value as typeof paymentStatusFilter)}
                className="px-3 py-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <input
                type="date"
                value={paymentDateFilter}
                onChange={(e) => setPaymentDateFilter(e.target.value)}
                className="px-3 py-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
          </div>

          {paymentsLoading ? (
            <div className="p-10 text-center text-gray-500">
              <FaSpinner className="animate-spin mx-auto mb-3 text-purple-600" />
              Loading payment submissions...
            </div>
          ) : payments.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No payment submissions found for selected filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-sm">
                  <tr>
                    <th className="p-4 font-semibold">Student Name</th>
                    <th className="p-4 font-semibold">Bank</th>
                    <th className="p-4 font-semibold">Amount</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Slip Preview</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-purple-50/40 transition">
                      <td className="p-4">
                        <p className="font-medium text-gray-800">{payment.studentName}</p>
                        <p className="text-xs text-gray-500">{payment.transactionId}</p>
                      </td>
                      <td className="p-4 text-gray-700">{payment.bankName}</td>
                      <td className="p-4 font-semibold text-gray-800">{formatLKR(payment.amount)}</td>
                      <td className="p-4 text-gray-700">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                      <td className="p-4">
                        <a
                          href={toAbsoluteSlipUrl(payment.slipUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-indigo-700 hover:text-indigo-900 underline"
                        >
                          <FaEye />
                          View / Download
                        </a>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            payment.status === 'Approved'
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : payment.status === 'Rejected'
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => updatePaymentStatus(payment._id, 'Approved')}
                            disabled={payment.status !== 'Pending' || paymentActionId === payment._id}
                            className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updatePaymentStatus(payment._id, 'Rejected')}
                            disabled={payment.status !== 'Pending' || paymentActionId === payment._id}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => deletePayment(payment._id)}
                            disabled={paymentActionId === payment._id}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                            title="Delete payment"
                          >
                            {paymentActionId === payment._id ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {editingFee && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Edit Fee</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setEditingFee(null)}>
                Close
              </button>
            </div>
            <form onSubmit={handleEditFee} className="p-5 space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Fee Type</label>
                <select
                  value={editForm.feeType}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, feeType: e.target.value }))}
                  className="w-full px-3 py-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-200"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Fine">Fine</option>
                  <option value="Other">Other</option>
                  <option value="Monthly Hostel Fee">Monthly Hostel Fee</option>
                  <option value="Maintenance Fee">Maintenance Fee</option>
                  <option value="Mess Fee">Mess Fee</option>
                  <option value="Library Fee">Library Fee</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">Amount</label>
                <input
                  type="number"
                  min={1}
                  value={editForm.amount}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">Due Date</label>
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">Notes</label>
                <input
                  type="text"
                  value={editForm.notes}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700"
                  onClick={() => setEditingFee(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === editingFee._id}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {actionLoadingId === editingFee._id ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesManagement;
