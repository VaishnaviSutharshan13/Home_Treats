import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  FaPlus, FaMagnifyingGlass, FaDollarSign, FaReceipt,
  FaCircleCheck, FaCircleXmark, FaClock, FaSpinner, FaFileLines,
  FaUserSlash, FaEye, FaTrash, FaMoneyBillWave, FaChartBar,
  FaTriangleExclamation, FaDownload, FaXmark, FaChevronDown, FaChevronLeft,
  FaArrowTrendUp, FaBars,
} from 'react-icons/fa6';
import { feesService } from '../../services';
import Sidebar from '../../components/layout/Sidebar';
import { feesService, paymentService, studentService } from '../../services';

type FeeStatus = 'Paid' | 'Pending' | 'Overdue';
import AdminNotificationComposer from '../../components/admin/AdminNotificationComposer';

interface Fee {
  _id: string;
  studentName: string;
  studentId: string;
  room: string;
  feeType: 'Hostel Fee' | 'Mess Fee' | 'Library Fee' | 'Other';
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Partial';
  paidDate: string | null;
  paymentMethod: string | null;
  transactionId: string | null;
  semester: string;
  paidAmount: number;
  remainingAmount: number;
  createdAt: string;
}

interface Receipt {
  receiptNo: string;
  studentName: string;
  studentId: string;
  feeType: string;
  amount: number;
  paidDate: string;
  paymentMethod: string;
  transactionId: string;
  semester: string;
  currency: string;
  generatedAt: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

/* ─── helpers ─────────────────────────────────────── */
const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const statusBadge: Record<string, string> = {
  Paid:    'bg-purple-500/15 text-purple-600 border border-purple-500/30 shadow-purple-500/10',
  Pending: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 shadow-yellow-500/10',
  Overdue: 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-red-500/10',
  Partial: 'bg-purple-500/15 text-purple-600 border border-purple-500/30 shadow-emerald-500/10',
};

const statusDot: Record<string, string> = {
  Paid: 'bg-purple-400', Pending: 'bg-yellow-400', Overdue: 'bg-red-400', Partial: 'bg-purple-400',
};

/* ═══════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════ */
const FeesManagement = () => {
  const todayDate = getTodayDateString();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterFeeType, setFilterFeeType] = useState('All');
  const [filterSemester, setFilterSemester] = useState('All');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showUnpaidModal, setShowUnpaidModal] = useState(false);
  const [showReportPrompt, setShowReportPrompt] = useState(false);

  const [addForm, setAddForm] = useState({ studentName: '', studentId: '', room: '', feeType: 'Hostel Fee', amount: 4000, dueDate: '', semester: '' });
  const [paymentForm, setPaymentForm] = useState({ paymentMethod: 'Online Transfer', transactionId: '', paidAmount: 0, paidDate: new Date().toISOString().split('T')[0] });
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [viewingFee, setViewingFee] = useState<Fee | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [unpaidStudents, setUnpaidStudents] = useState<any[]>([]);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [actionLoading, setActionLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const totalRevenue   = fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
  const pendingRevenue = fees.filter(f => f.status === 'Pending' || f.status === 'Overdue').reduce((sum, f) => sum + f.amount, 0);
  const partialRevenue = fees.filter(f => f.status === 'Partial').reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  const overdueCount   = fees.filter(f => f.status === 'Overdue').length;

  const fetchFees = async () => {
    setLoading(true); setError(null);
    try {
      const res = await feesService.getAll();
      setFees(res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load fees');
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchFees(); }, []);

  const semesters = [...new Set(fees.map(f => f.semester).filter(Boolean))];

  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fee.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fee.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus   = filterStatus   === 'All' || fee.status  === filterStatus;
    const matchesFeeType  = filterFeeType  === 'All' || fee.feeType === filterFeeType;
    const matchesSemester = filterSemester === 'All' || fee.semester === filterSemester;
    return matchesSearch && matchesStatus && matchesFeeType && matchesSemester;
  });

  /* ─── Handlers ────────────────────────────────── */
  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addForm.amount < 4000) { showToast('Minimum amount is LKR 4,000', 'error'); return; }
    setActionLoading(true);
    try {
      await feesService.create(addForm);
      showToast('Fee added successfully');
      setShowAddModal(false);
      setAddForm({ studentName: '', studentId: '', room: '', feeType: 'Hostel Fee', amount: 4000, dueDate: '', semester: '' });
      fetchFees();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to add fee', 'error');
    } finally { setActionLoading(false); }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;
    setActionLoading(true);
    try {
      await feesService.pay(selectedFee._id, paymentForm);
      showToast('Payment recorded successfully');
      setShowPaymentModal(false);
      setPaymentForm({ paymentMethod: 'Online Transfer', transactionId: '', paidAmount: 0, paidDate: new Date().toISOString().split('T')[0] });
      setSelectedFee(null);
      fetchFees();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to record payment', 'error');
    } finally { setActionLoading(false); }
  };

  const handleViewReceipt = async (fee: Fee) => {
    setActionLoading(true);
    try {
      const res = await feesService.getReceipt(fee._id);
      setReceipt(res.data); setShowReceiptModal(true);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load receipt', 'error');
    } finally { setActionLoading(false); }
  };

  const handleDownloadReceipt = () => {
    if (!receipt) return;
    const text = [
      `===== PAYMENT RECEIPT =====`,
      `Receipt No: ${receipt.receiptNo}`,
      `Student: ${receipt.studentName} (${receipt.studentId})`,
      `Fee Type: ${receipt.feeType}`,
      `Semester: ${receipt.semester}`,
      `Amount: LKR ${receipt.amount.toLocaleString()}`,
      `Paid Date: ${new Date(receipt.paidDate).toLocaleDateString()}`,
      `Payment Method: ${receipt.paymentMethod}`,
      `Transaction ID: ${receipt.transactionId}`,
      `Generated: ${new Date(receipt.generatedAt).toLocaleString()}`,
      `===========================`,
    ].join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${receipt.receiptNo}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleFetchReport = async () => {
    setActionLoading(true);
    try {
      const res = await feesService.getMonthlyReport(reportYear, reportMonth);
      setReportData(res.data); setShowReportPrompt(false); setShowReportModal(true);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load report', 'error');
    } finally { setActionLoading(false); }
  };

  const handleFetchUnpaid = async () => {
    setActionLoading(true);
    try {
      const res = await feesService.getUnpaid();
      setUnpaidStudents(res.data || []); setShowUnpaidModal(true);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load unpaid students', 'error');
    } finally { setActionLoading(false); }
  };

  const handleDeleteFee = async (fee: Fee) => {
    if (!window.confirm(`Delete fee for ${fee.studentName}?`)) return;
    try {
      await feesService.delete(fee._id); showToast('Fee deleted successfully'); fetchFees();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to delete fee', 'error');
    }
  };

  /* ─── Loading ──────────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-lg font-medium">Loading fees data…</p>
        <p className="text-gray-600 text-sm mt-1">Please wait</p>
      </div>
    </div>
  );

  /* ─── Error ────────────────────────────────────── */
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center bg-white border border-red-500/20 p-10 rounded-2xl shadow-xl max-w-md mx-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaTriangleExclamation className="text-3xl text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Fees</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button onClick={fetchFees} className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105">
          Try Again
        </button>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} userRole="admin" />

      <div className="lg:ml-64">
      {/* ── Toasts ─────────────────────────────── */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-xs w-full">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium text-gray-900 backdrop-blur-sm border transition-all
              ${t.type === 'success' ? 'bg-purple-600/90 border-purple-500/50' : t.type === 'error' ? 'bg-red-600/90 border-red-500/50' : 'bg-white border-purple-500/30'}`}
          >
            {t.type === 'success' && <FaCircleCheck className="shrink-0 text-gray-900" />}
            {t.type === 'error'   && <FaCircleXmark className="shrink-0 text-gray-900" />}
            {t.type === 'info'    && <FaFileLines className="shrink-0 text-purple-600" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* ── PAGE HEADER ────────────────────────── */}
      <div className="bg-white border-b border-purple-500/10">
        <div className="w-full px-6 sm:px-8 lg:px-10 py-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              title="Open sidebar"
              aria-label="Open sidebar"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
            >
              <FaBars className="w-5 h-5" />
            </button>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-purple-600 text-sm mb-5 transition-colors duration-200 group"
          >
            <FaChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span>Dashboard</span>
            <span className="text-gray-600 mx-0.5">/</span>
            <span className="text-gray-500">Fees Management</span>
          </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {/* Title block */}
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-9 h-9 bg-purple-500/15 border border-purple-500/25 rounded-xl flex items-center justify-center">
                  <FaDollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Fees Management</h1>
              </div>
              <p className="text-gray-500 text-sm ml-12">Manage student hostel payments and fee records</p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <AdminNotificationComposer
                source="Fees Management"
                defaultType="fee"
                buttonLabel="Send Reminder"
              />
              <button
                onClick={handleFetchUnpaid}
                className="group inline-flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 hover:border-red-500/50 text-red-400 hover:text-red-300 rounded-xl text-sm font-semibold transition-all duration-200"
              >
                <FaUserSlash className="w-3.5 h-3.5" />
                Unpaid Students
              </button>
              <button
                onClick={() => setShowReportPrompt(true)}
                className="group inline-flex items-center gap-2 px-4 py-2.5 bg-[#f5f3ff] hover:bg-[#243147] border border-gray-200 hover:border-purple-500/30 text-gray-600 hover:text-gray-900 rounded-xl text-sm font-semibold transition-all duration-200"
              >
                <FaChartBar className="w-3.5 h-3.5 text-purple-600" />
                Monthly Report
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="group inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-lg shadow-purple-500/20"
              >
                <FaPlus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90 duration-200" />
                Add Fee
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS CARDS ────────────────────────── */}
      <div className="w-full px-6 sm:px-8 lg:px-10 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* Total Revenue */}
          <div className="group relative bg-white border border-purple-500/15 rounded-2xl p-6 overflow-hidden hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500 group-hover:border-purple-500 transition-all duration-300">
                <FaArrowTrendUp className="w-5 h-5 text-purple-600 group-hover:text-gray-900 transition-colors duration-300" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-purple-500/10 text-purple-600 border border-purple-500/20 rounded-full">Revenue</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">
              LKR {totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total collected payments</p>
            <div className="mt-4 h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent rounded-full" />
          </div>

          {/* Pending Payments */}
          <div className="group relative bg-white border border-yellow-500/15 rounded-2xl p-6 overflow-hidden hover:border-yellow-500/40 hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center group-hover:bg-yellow-500 group-hover:border-yellow-500 transition-all duration-300">
                <FaClock className="w-5 h-5 text-yellow-400 group-hover:text-gray-900 transition-colors duration-300" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full">Pending</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">
              LKR {pendingRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Awaiting payment</p>
            <div className="mt-4 h-0.5 bg-gradient-to-r from-yellow-500/50 to-transparent rounded-full" />
          </div>

          {/* Partial Payments */}
          <div className="group relative bg-white border border-purple-500/15 rounded-2xl p-6 overflow-hidden hover:border-purple-500/40 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500 group-hover:border-purple-500 transition-all duration-300">
                <FaReceipt className="w-5 h-5 text-purple-600 group-hover:text-gray-900 transition-colors duration-300" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-purple-500/10 text-purple-600 border border-purple-500/20 rounded-full">Partial</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">
              LKR {partialRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Partially paid amounts</p>
            <div className="mt-4 h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent rounded-full" />
          </div>

          {/* Overdue */}
          <div className="group relative bg-white border border-red-500/15 rounded-2xl p-6 overflow-hidden hover:border-red-500/40 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center group-hover:bg-red-500 group-hover:border-red-500 transition-all duration-300">
                <FaTriangleExclamation className="w-5 h-5 text-red-400 group-hover:text-gray-900 transition-colors duration-300" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">Overdue</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">{overdueCount}</p>
            <p className="text-sm text-gray-500">Overdue fee records</p>
            <div className="mt-4 h-0.5 bg-gradient-to-r from-red-500/50 to-transparent rounded-full" />
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ─────────────────────────── */}
      <div className="w-full px-6 sm:px-8 lg:px-10 pb-6">
        <div className="bg-white border border-gray-200/50 rounded-2xl p-4">
          <div className="flex flex-col lg:flex-row gap-3">

            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, student ID or room…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 hover:border-gray-200 focus:border-purple-500 text-gray-900 placeholder-gray-600 rounded-xl text-sm outline-none transition-colors shadow-sm"
              />
            </div>

            {/* Status */}
            <div className="relative">
              <select
                title="Filter by fee status"
                aria-label="Filter by fee status"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 hover:border-gray-200 focus:border-purple-500 text-sm text-gray-900 rounded-xl outline-none transition-colors min-w-[150px]"
              >
                <option value="All">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
                <option value="Partial">Partial</option>
              </select>
              <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
            </div>

            {/* Fee Type */}
            <div className="relative">
              <select
                title="Filter by fee type"
                aria-label="Filter by fee type"
                value={filterFeeType}
                onChange={e => setFilterFeeType(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 hover:border-gray-200 focus:border-purple-500 text-sm text-gray-900 rounded-xl outline-none transition-colors min-w-[160px]"
              >
                <option value="All">All Fee Types</option>
                <option value="Hostel Fee">Hostel Fee</option>
                <option value="Mess Fee">Mess Fee</option>
                <option value="Library Fee">Library Fee</option>
                <option value="Other">Other</option>
              </select>
              <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
            </div>

            {/* Semester */}
            <div className="relative">
              <select
                title="Filter by semester"
                aria-label="Filter by semester"
                value={filterSemester}
                onChange={e => setFilterSemester(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 hover:border-gray-200 focus:border-purple-500 text-sm text-gray-900 rounded-xl outline-none transition-colors min-w-[150px]"
              >
                <option value="All">All Semesters</option>
                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
            </div>

            {/* Clear */}
            <button
              onClick={() => { setSearchTerm(''); setFilterStatus('All'); setFilterFeeType('All'); setFilterSemester('All'); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-red-500/10 border border-gray-200 hover:border-red-500/30 text-gray-500 hover:text-red-400 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap"
            >
              <FaXmark className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── DATA TABLE ─────────────────────────── */}
      <div className="w-full px-6 sm:px-8 lg:px-10 pb-12">
        <div className="bg-white border border-gray-200/50 rounded-2xl overflow-hidden">

          {/* Table header meta row */}
          <div className="px-6 py-4 border-b border-gray-200/40 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Fee Records</span>
            <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200/50 px-3 py-1 rounded-full">
              {filteredFees.length} / {fees.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/40">
                  {['Student Info', 'Fee Details', 'Amount', 'Due Date', 'Status', 'Payment Info', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredFees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center">
                          <FaMagnifyingGlass className="w-5 h-5 text-gray-600" />
                        </div>
                        <p className="text-gray-500 font-medium">No fee records found</p>
                        <p className="text-gray-600 text-sm">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredFees.map(fee => (
                  <tr key={fee._id} className="group hover:bg-purple-500/[0.03] transition-colors duration-150">

                    {/* Student Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-emerald-600 flex items-center justify-center text-gray-900 text-xs font-bold shrink-0 shadow-lg">
                          {getInitials(fee.studentName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{fee.studentName}</p>
                          <p className="text-xs text-gray-500">{fee.studentId} · Room {fee.room}</p>
                        </div>
                      </div>
                    </td>

                    {/* Fee Details */}
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-900 font-medium">{fee.feeType}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{fee.semester}</p>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-gray-900">LKR {fee.amount.toLocaleString()}</p>
                      {fee.status === 'Partial' && (
                        <div className="mt-1 space-y-0.5">
                          <p className="text-xs text-purple-600">↑ Paid: LKR {(fee.paidAmount || 0).toLocaleString()}</p>
                          <p className="text-xs text-yellow-400">↓ Due: LKR {(fee.remainingAmount || 0).toLocaleString()}</p>
                        </div>
                      )}
                    </td>

                    {/* Due Date */}
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-600">{new Date(fee.dueDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</p>
                      {fee.status === 'Overdue' && (
                        <span className="text-xs font-bold text-red-400 mt-0.5 flex items-center gap-1">
                          <FaTriangleExclamation className="w-3 h-3" /> OVERDUE
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg shadow-sm ${statusBadge[fee.status] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot[fee.status] || 'bg-gray-400'}`} />
                        {fee.status}
                      </span>
                    </td>

                    {/* Payment Info */}
                    <td className="px-5 py-4">
                      {fee.paidDate ? (
                        <div>
                          <p className="text-sm text-gray-600">{new Date(fee.paidDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</p>
                          <p className="text-xs text-gray-500">{fee.paymentMethod}</p>
                          {fee.transactionId && <p className="text-xs text-gray-600 font-mono mt-0.5 truncate max-w-[120px]">{fee.transactionId}</p>}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-600 italic">Not paid</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">

                        {/* View */}
                        <button
                          onClick={() => setViewingFee(fee)}
                          title="View Details"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-purple-500/15 border border-transparent hover:border-purple-500/30 text-gray-500 hover:text-purple-600 transition-all duration-200"
                        >
                          <FaEye className="w-3.5 h-3.5" />
                        </button>

                        {/* Receipt (paid) */}
                        {fee.status === 'Paid' && (
                          <button
                            onClick={() => handleViewReceipt(fee)}
                            title="View Receipt"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-purple-500/15 border border-transparent hover:border-purple-500/30 text-gray-500 hover:text-purple-600 transition-all duration-200"
                          >
                            <FaReceipt className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Mark Paid (pending / overdue) */}
                        {(fee.status === 'Pending' || fee.status === 'Overdue') && (
                          <button
                            onClick={() => { setSelectedFee(fee); setPaymentForm(p => ({ ...p, paidAmount: fee.amount })); setShowPaymentModal(true); }}
                            title="Record Payment"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-yellow-500/15 border border-transparent hover:border-yellow-500/30 text-gray-500 hover:text-yellow-400 transition-all duration-200"
                          >
                            <FaMoneyBillWave className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteFee(fee)}
                          title="Delete Fee"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-red-500/15 border border-transparent hover:border-red-500/30 text-gray-500 hover:text-red-400 transition-all duration-200"
                        >
                          <FaTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════ */}

      {/* ── View Fee Detail ── */}
      {viewingFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Fee Details</h2>
              <button type="button" title="Close fee details" aria-label="Close fee details" onClick={() => setViewingFee(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
                <FaXmark />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4 pb-5 border-b border-gray-200/50">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-emerald-600 flex items-center justify-center text-gray-900 text-lg font-bold shadow-lg">
                  {getInitials(viewingFee.studentName)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{viewingFee.studentName}</h3>
                  <p className="text-sm text-gray-500">{viewingFee.studentId} · Room {viewingFee.room}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Fee Type', viewingFee.feeType],
                  ['Semester', viewingFee.semester],
                  ['Amount', `LKR ${viewingFee.amount.toLocaleString()}`],
                  ['Due Date', new Date(viewingFee.dueDate).toLocaleDateString()],
                ].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-200/40">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="text-gray-900 font-medium">{val}</p>
                  </div>
                ))}
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200/40">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg ${statusBadge[viewingFee.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot[viewingFee.status]}`} />
                    {viewingFee.status}
                  </span>
                </div>
                {viewingFee.status === 'Partial' && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200/40">
                    <p className="text-xs text-gray-500 mb-1">Paid / Remaining</p>
                    <p className="text-gray-900 font-medium">
                      LKR {(viewingFee.paidAmount || 0).toLocaleString()} / LKR {(viewingFee.remainingAmount || 0).toLocaleString()}
                    </p>
                  </div>
                )}
                {viewingFee.paidDate && (
                  <>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200/40">
                      <p className="text-xs text-gray-500 mb-1">Paid Date</p>
                      <p className="text-gray-900 font-medium">{new Date(viewingFee.paidDate).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200/40">
                      <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                      <p className="text-gray-900 font-medium">{viewingFee.paymentMethod}</p>
                    </div>
                    {viewingFee.transactionId && (
                      <div className="col-span-2 bg-gray-50 rounded-xl p-3 border border-gray-200/40">
                        <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                        <p className="text-gray-900 font-mono text-sm">{viewingFee.transactionId}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setViewingFee(null)} className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl text-sm transition-colors">
                  Close
                </button>
                {viewingFee.status === 'Paid' && (
                  <button
                    onClick={() => { handleViewReceipt(viewingFee); setViewingFee(null); }}
                    className="px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <FaReceipt className="w-3.5 h-3.5" /> View Receipt
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Fee Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/15 border border-purple-500/25 rounded-lg flex items-center justify-center">
                  <FaPlus className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Add New Fee</h2>
              </div>
              <button type="button" title="Close add fee modal" aria-label="Close add fee modal" onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
                <FaXmark />
              </button>
            </div>
            <form onSubmit={handleAddFee} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Student Name</label>
                <input required value={addForm.studentName} onChange={e => setAddForm({ ...addForm, studentName: e.target.value })} placeholder="Full name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-600 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Student ID</label>
                  <input required value={addForm.studentId} onChange={e => setAddForm({ ...addForm, studentId: e.target.value })} placeholder="e.g. STU001" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-600 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Room</label>
                  <input required value={addForm.room} onChange={e => setAddForm({ ...addForm, room: e.target.value })} placeholder="e.g. A-101" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-600 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Fee Type</label>
                <div className="relative">
                  <select required title="Fee type" aria-label="Fee type" value={addForm.feeType} onChange={e => setAddForm({ ...addForm, feeType: e.target.value })} className="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-colors pr-10">
                    <option value="Hostel Fee">Hostel Fee</option>
                    <option value="Mess Fee">Mess Fee</option>
                    <option value="Library Fee">Library Fee</option>
                    <option value="Other">Other</option>
                  </select>
                  <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Amount (LKR) — min 4,000</label>
                <input required title="Fee amount" type="number" min={4000} value={addForm.amount} onChange={e => setAddForm({ ...addForm, amount: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Due Date</label>
                  <input required title="Due date" type="date" value={addForm.dueDate} onChange={e => setAddForm({ ...addForm, dueDate: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Semester</label>
                  <input required placeholder="e.g. Spring 2026" value={addForm.semester} onChange={e => setAddForm({ ...addForm, semester: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-600 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-colors" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2 transition-all hover:scale-105">
                  {actionLoading ? <FaSpinner className="animate-spin w-3.5 h-3.5" /> : <FaPlus className="w-3.5 h-3.5" />}
                  Add Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Record Payment Modal ── */}
      {showPaymentModal && selectedFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-500/15 border border-yellow-500/25 rounded-lg flex items-center justify-center">
                  <FaMoneyBillWave className="w-3.5 h-3.5 text-yellow-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Record Payment</h2>
              </div>
              <button type="button" title="Close payment modal" aria-label="Close payment modal" onClick={() => { setShowPaymentModal(false); setSelectedFee(null); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
                <FaXmark />
              </button>
            </div>

            {/* Fee summary */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-emerald-600 flex items-center justify-center text-gray-900 text-xs font-bold">
                  {getInitials(selectedFee.studentName)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedFee.studentName}</p>
                  <p className="text-xs text-gray-500">{selectedFee.feeType} · LKR {selectedFee.amount.toLocaleString()}</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg ${statusBadge[selectedFee.status]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot[selectedFee.status]}`} />
                {selectedFee.status}
              </span>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Paid Amount (LKR)</label>
                  <input required title="Paid amount" type="number" min={1} max={selectedFee.amount} value={paymentForm.paidAmount} onChange={e => setPaymentForm({ ...paymentForm, paidAmount: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm focus:outline-none focus:border-purple-500 transition-colors" />
                  <p className="text-xs text-gray-600 mt-1">Max: LKR {selectedFee.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Paid Date</label>
                  <input required title="Paid date" type="date" value={paymentForm.paidDate} onChange={e => setPaymentForm({ ...paymentForm, paidDate: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm focus:outline-none focus:border-purple-500 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Payment Method</label>
                <div className="relative">
                  <select required title="Payment method" aria-label="Payment method" value={paymentForm.paymentMethod} onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })} className="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm focus:outline-none focus:border-purple-500 transition-colors pr-10">
                    <option value="Online Transfer">Online Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Deposit">Bank Deposit</option>
                    <option value="Card">Card</option>
                  </select>
                  <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Transaction ID</label>
                <input required value={paymentForm.transactionId} onChange={e => setPaymentForm({ ...paymentForm, transactionId: e.target.value })} placeholder="e.g. TXN123456" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-600 rounded-xl text-sm focus:outline-none focus:border-purple-500 transition-colors" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowPaymentModal(false); setSelectedFee(null); }} className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2 transition-all hover:scale-105">
                  {actionLoading ? <FaSpinner className="animate-spin w-3.5 h-3.5" /> : <FaCircleCheck className="w-3.5 h-3.5" />}
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Receipt Modal ── */}
      {showReceiptModal && receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/15 border border-purple-500/25 rounded-lg flex items-center justify-center">
                  <FaReceipt className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Payment Receipt</h2>
              </div>
              <button type="button" title="Close receipt modal" aria-label="Close receipt modal" onClick={() => { setShowReceiptModal(false); setReceipt(null); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
                <FaXmark />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center border-b border-gray-200/50 pb-4">
                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FaDollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-lg font-bold text-purple-600">Home Treats Hostel</p>
                <p className="text-sm text-gray-500">Official Payment Receipt</p>
              </div>
              <div className="space-y-2.5 text-sm">
                {[
                  ['Receipt No', receipt.receiptNo],
                  ['Student', receipt.studentName],
                  ['Student ID', receipt.studentId],
                  ['Fee Type', receipt.feeType],
                  ['Semester', receipt.semester],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-gray-900 font-medium">{val}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200/50 pt-2.5 flex justify-between">
                  <span className="text-gray-500 font-semibold">Amount</span>
                  <span className="text-purple-600 font-bold text-base">LKR {receipt.amount.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200/50 pt-2.5 space-y-2">
                  {[
                    ['Paid Date', new Date(receipt.paidDate).toLocaleDateString()],
                    ['Method', receipt.paymentMethod],
                    ['TXN ID', receipt.transactionId],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="text-gray-900 font-mono">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-600 text-center">Generated: {new Date(receipt.generatedAt).toLocaleString()}</p>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => { setShowReceiptModal(false); setReceipt(null); }} className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl text-sm transition-colors">
                  Close
                </button>
                <button onClick={handleDownloadReceipt} className="px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105">
                  <FaDownload className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Monthly Report Prompt ── */}
      {showReportPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/15 border border-purple-500/25 rounded-lg flex items-center justify-center">
                  <FaChartBar className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Monthly Report</h2>
              </div>
              <button type="button" title="Close report prompt" aria-label="Close report prompt" onClick={() => setShowReportPrompt(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
                <FaXmark />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Year</label>
                <input title="Report year" type="number" min={2020} max={2030} value={reportYear} onChange={e => setReportYear(Number(e.target.value))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm focus:outline-none focus:border-purple-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Month</label>
                <div className="relative">
                  <select title="Report month" aria-label="Report month" value={reportMonth} onChange={e => setReportMonth(Number(e.target.value))} className="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm focus:outline-none focus:border-purple-500 transition-colors pr-10">
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowReportPrompt(false)} className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl text-sm transition-colors">
                  Cancel
                </button>
                <button onClick={handleFetchReport} disabled={actionLoading} className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2 transition-all hover:scale-105">
                  {actionLoading ? <FaSpinner className="animate-spin w-3.5 h-3.5" /> : <FaChartBar className="w-3.5 h-3.5" />}
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Monthly Report Results ── */}
      {showReportModal && reportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/15 border border-purple-500/25 rounded-lg flex items-center justify-center">
                  <FaChartBar className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Monthly Report</h2>
              </div>
              <button type="button" title="Close report modal" aria-label="Close report modal" onClick={() => { setShowReportModal(false); setReportData(null); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
                <FaXmark />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Collected', val: `LKR ${(reportData.totalCollected || 0).toLocaleString()}`, color: 'text-purple-600', bg: 'bg-purple-500/10 border-purple-500/20' },
                  { label: 'Total Pending',   val: `LKR ${(reportData.totalPending   || 0).toLocaleString()}`, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
                  { label: 'Total Records',   val: reportData.totalFees || 0,                                   color: 'text-gray-900',      bg: 'bg-gray-50 border-gray-200/50' },
                  { label: 'Overdue Count',   val: reportData.overdueCount || 0,                               color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
                ].map((c) => (
                  <div key={c.label} className={`rounded-xl p-4 border ${c.bg}`}>
                    <p className="text-xs text-gray-500 mb-1">{c.label}</p>
                    <p className={`text-xl font-extrabold ${c.color}`}>{c.val}</p>
                  </div>
                ))}
              </div>
              {reportData.byFeeType && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">By Fee Type</h3>
                  <div className="bg-gray-50 rounded-xl border border-gray-200/50 divide-y divide-gray-800">
                    {Object.entries(reportData.byFeeType).map(([type, val]: [string, any]) => (
                      <div key={type} className="flex justify-between px-4 py-3 text-sm">
                        <span className="text-gray-500">{type}</span>
                        <span className="text-gray-900 font-semibold">LKR {(typeof val === 'number' ? val : val?.total || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <button onClick={() => { setShowReportModal(false); setReportData(null); }} className="px-5 py-2 bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl text-sm transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Unpaid Students Modal ── */}
      {showUnpaidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/15 border border-red-500/25 rounded-lg flex items-center justify-center">
                  <FaUserSlash className="w-3.5 h-3.5 text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Unpaid Students</h2>
              </div>
              <button type="button" title="Close unpaid students modal" aria-label="Close unpaid students modal" onClick={() => setShowUnpaidModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
                <FaXmark />
              </button>
            </div>
            <div className="p-6">
              {unpaidStudents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCircleCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-gray-900 font-semibold mb-1">All clear!</p>
                  <p className="text-gray-500 text-sm">No unpaid students found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unpaidStudents.map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 border border-red-500/15 hover:border-red-500/30 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-gray-900 text-xs font-bold">
                          {getInitials(s.studentName || s.name || 'N/A')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{s.studentName || s.name}</p>
                          <p className="text-xs text-gray-500">{s.studentId} · {s.room}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-400">LKR {(s.totalDue || s.amount || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{s.feeType || 'Multiple'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end pt-5">
                <button onClick={() => setShowUnpaidModal(false)} className="px-5 py-2 bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl text-sm transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>  {/* /lg:ml-64 */}
    </div>
  );
};

export default FeesManagement;
