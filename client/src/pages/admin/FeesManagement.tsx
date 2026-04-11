import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaEye,
  FaMoneyBillWave,
  FaSpinner,
  FaTrash,
} from 'react-icons/fa';
import {
  FaPlus,
  FaMagnifyingGlass,
  FaDollarSign,
  FaReceipt,
  FaCircleCheck,
  FaCircleXmark,
  FaClock,
  FaFileLines,
  FaUserSlash,
  FaChartBar,
  FaTriangleExclamation,
  FaDownload,
  FaXmark,
  FaChevronDown,
  FaChevronLeft,
  FaArrowTrendUp,
  FaBars,
} from 'react-icons/fa6';
import Sidebar from '../../components/layout/Sidebar';
import { feesService } from '../../services';
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
  Paid:    'bg-primary/15 text-primary border border-primary/30 shadow-primary/10',
  Pending: 'bg-warning/10 border border-warning/30 text-warning border border-warning/30 shadow-warning/10',
  Overdue: 'bg-error/10 border border-error/30 text-error border border-error/30 shadow-error/10',
  Partial: 'bg-primary/15 text-primary border border-primary/30 shadow-primary/10',
};

const statusDot: Record<string, string> = {
  Paid: 'bg-primary', Pending: 'bg-warning text-warning-foreground hover:bg-warning/90', Overdue: 'bg-error/10 hover:bg-error/20 text-error border border-error/50 transition-colors', Partial: 'bg-primary',
};

/* ═══════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════ */
const FeesManagement = () => {
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
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground text-lg font-medium">Loading fees data…</p>
        <p className="text-muted-foreground text-sm mt-1">Please wait</p>
      </div>
    </div>
  );

  /* ─── Error ────────────────────────────────────── */
  if (error) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center bg-card border border-error/30 p-10 rounded-2xl shadow-xl max-w-md mx-4">
        <div className="w-16 h-16 bg-error/10 border border-error/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaTriangleExclamation className="text-3xl text-error" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Failed to Load Fees</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button onClick={fetchFees} className="bg-primary hover:bg-gradient-to-r from-primary to-primary-hover text-primary-foreground transform hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-300 px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105">
          Try Again
        </button>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} userRole="admin" />

      <div className="lg:ml-64">
      {/* ── Toasts ─────────────────────────────── */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-xs w-full">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium text-foreground backdrop-blur-sm border transition-all
              ${t.type === 'success' ? 'bg-primary/90 border-primary/50' : t.type === 'error' ? 'bg-error/10 border border-error/30' : 'bg-card border-primary/30'}`}
          >
            {t.type === 'success' && <FaCircleCheck className="shrink-0 text-foreground" />}
            {t.type === 'error'   && <FaCircleXmark className="shrink-0 text-foreground" />}
            {t.type === 'info'    && <FaFileLines className="shrink-0 text-primary" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* ── PAGE HEADER ────────────────────────── */}
      <div className="bg-navbar shadow-sm border-b border-border sticky top-0 z-10 w-full bg-navbar/95 backdrop-blur">
        <div className="w-full px-6 sm:px-8 lg:px-10 py-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              title="Open sidebar"
              aria-label="Open sidebar"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted transition"
            >
              <FaBars className="w-5 h-5" />
            </button>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary text-sm mb-5 transition-colors duration-200 group"
          >
            <FaChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span>Dashboard</span>
            <span className="text-muted-foreground mx-0.5">/</span>
            <span className="text-muted-foreground">Fees Management</span>
          </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {/* Title block */}
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-9 h-9 bg-primary/15 border border-primary/25 rounded-xl flex items-center justify-center">
                  <FaDollarSign className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Fees Management</h1>
              </div>
              <p className="text-muted-foreground text-sm ml-12">Manage student hostel payments and fee records</p>
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
                className="group inline-flex items-center gap-2 px-4 py-2.5 bg-error/10 border border-error/30 hover:bg-error/10 border border-error/30 border border-error/30 hover:border-error/30 text-error hover:text-error rounded-xl text-sm font-semibold transition-all duration-200"
              >
                <FaUserSlash className="w-3.5 h-3.5" />
                Unpaid Students
              </button>
              <button
                onClick={() => setShowReportPrompt(true)}
                className="group inline-flex items-center gap-2 px-4 py-2.5 bg-surface-active/50 hover:bg-[#243147] border border-border hover:border-primary/30 text-muted-foreground hover:text-foreground rounded-xl text-sm font-semibold transition-all duration-200"
              >
                <FaChartBar className="w-3.5 h-3.5 text-primary" />
                Monthly Report
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="group inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-gradient-to-r from-primary to-primary-hover text-primary-foreground transform hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-300 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-lg shadow-primary/20"
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
          <div className="group relative bg-card border border-primary/15 rounded-2xl p-6 overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                <FaArrowTrendUp className="w-5 h-5 text-primary group-hover:text-foreground transition-colors duration-300" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full">Revenue</span>
            </div>
            <p className="text-2xl font-extrabold text-foreground mb-1 tracking-tight">
              LKR {totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Total collected payments</p>
            <div className="mt-4 h-0.5 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
          </div>

          {/* Pending Payments */}
          <div className="group relative bg-card border border-warning/30 rounded-2xl p-6 overflow-hidden hover:border-warning/30 hover:shadow-xl hover:shadow-warning/10 transition-all duration-300 cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 bg-warning/10 border border-warning/30 border border-warning/30 rounded-xl flex items-center justify-center group-hover:bg-warning/10 border border-warning/200 group-hover:border-yellow-500 transition-all duration-300">
                <FaClock className="w-5 h-5 text-warning group-hover:text-foreground transition-colors duration-300" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-warning/10 border border-warning/30 text-warning border border-warning/30 rounded-full">Pending</span>
            </div>
            <p className="text-2xl font-extrabold text-foreground mb-1 tracking-tight">
              LKR {pendingRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Awaiting payment</p>
            <div className="mt-4 h-0.5 bg-gradient-to-r from-yellow-500/50 to-transparent rounded-full" />
          </div>

          {/* Partial Payments */}
          <div className="group relative bg-card border border-primary/15 rounded-2xl p-6 overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                <FaReceipt className="w-5 h-5 text-primary group-hover:text-foreground transition-colors duration-300" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full">Partial</span>
            </div>
            <p className="text-2xl font-extrabold text-foreground mb-1 tracking-tight">
              LKR {partialRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Partially paid amounts</p>
            <div className="mt-4 h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent rounded-full" />
          </div>

          {/* Overdue */}
          <div className="group relative bg-card border border-error/30 rounded-2xl p-6 overflow-hidden hover:border-error/30 hover:shadow-xl hover:shadow-error/10 transition-all duration-300 cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 bg-error/10 border border-error/30 border border-error/30 rounded-xl flex items-center justify-center group-hover:bg-error/10 border border-error/200 group-hover:border-red-500 transition-all duration-300">
                <FaTriangleExclamation className="w-5 h-5 text-error group-hover:text-foreground transition-colors duration-300" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-error/10 border border-error/30 text-error border border-error/30 rounded-full">Overdue</span>
            </div>
            <p className="text-2xl font-extrabold text-foreground mb-1 tracking-tight">{overdueCount}</p>
            <p className="text-sm text-muted-foreground">Overdue fee records</p>
            <div className="mt-4 h-0.5 bg-gradient-to-r from-red-500/50 to-transparent rounded-full" />
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ─────────────────────────── */}
      <div className="w-full px-6 sm:px-8 lg:px-10 pb-6">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex flex-col lg:flex-row gap-3">

            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, student ID or room…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-xl py-2 pl-11 pr-4 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
              />
            </div>

            {/* Status */}
            <div className="relative">
              <select
                title="Filter by fee status"
                aria-label="Filter by fee status"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="rounded-xl py-2 pl-4 pr-10 appearance-none bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
              >
                <option value="All">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
                <option value="Partial">Partial</option>
              </select>
              <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>

            {/* Fee Type */}
            <div className="relative">
              <select
                title="Filter by fee type"
                aria-label="Filter by fee type"
                value={filterFeeType}
                onChange={e => setFilterFeeType(e.target.value)}
                className="rounded-xl py-2 pl-4 pr-10 appearance-none bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
              >
                <option value="All">All Fee Types</option>
                <option value="Hostel Fee">Hostel Fee</option>
                <option value="Mess Fee">Mess Fee</option>
                <option value="Library Fee">Library Fee</option>
                <option value="Other">Other</option>
              </select>
              <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>

            {/* Semester */}
            <div className="relative">
              <select
                title="Filter by semester"
                aria-label="Filter by semester"
                value={filterSemester}
                onChange={e => setFilterSemester(e.target.value)}
                className="rounded-xl py-2 pl-4 pr-10 appearance-none bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
              >
                <option value="All">All Semesters</option>
                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>

            {/* Clear */}
            <button
              onClick={() => { setSearchTerm(''); setFilterStatus('All'); setFilterFeeType('All'); setFilterSemester('All'); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-muted hover:bg-error/10 border border-error/30 border border-border hover:border-error/30 text-muted-foreground hover:text-error rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap"
            >
              <FaXmark className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── DATA TABLE ─────────────────────────── */}
      <div className="w-full px-6 sm:px-8 lg:px-10 pb-12">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">

          {/* Table header meta row */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Fee Records</span>
            <span className="text-xs text-muted-foreground bg-muted border border-border px-3 py-1 rounded-full">
              {filteredFees.length} / {fees.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Student Info', 'Fee Details', 'Amount', 'Due Date', 'Status', 'Payment Info', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center">
                          <FaMagnifyingGlass className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">No fee records found</p>
                        <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredFees.map(fee => (
                  <tr key={fee._id} className="group hover:bg-primary/[0.03] transition-colors duration-150">

                    {/* Student Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-foreground text-xs font-bold shrink-0 shadow-lg">
                          {getInitials(fee.studentName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{fee.studentName}</p>
                          <p className="text-xs text-muted-foreground">{fee.studentId} · Room {fee.room}</p>
                        </div>
                      </div>
                    </td>

                    {/* Fee Details */}
                    <td className="px-5 py-4">
                      <p className="text-sm text-foreground font-medium">{fee.feeType}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{fee.semester}</p>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-foreground">LKR {fee.amount.toLocaleString()}</p>
                      {fee.status === 'Partial' && (
                        <div className="mt-1 space-y-0.5">
                          <p className="text-xs text-primary">↑ Paid: LKR {(fee.paidAmount || 0).toLocaleString()}</p>
                          <p className="text-xs text-warning">↓ Due: LKR {(fee.remainingAmount || 0).toLocaleString()}</p>
                        </div>
                      )}
                    </td>

                    {/* Due Date */}
                    <td className="px-5 py-4">
                      <p className="text-sm text-muted-foreground">{new Date(fee.dueDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</p>
                      {fee.status === 'Overdue' && (
                        <span className="text-xs font-bold text-error mt-0.5 flex items-center gap-1">
                          <FaTriangleExclamation className="w-3 h-3" /> OVERDUE
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg shadow-sm ${statusBadge[fee.status] || 'bg-muted text-muted-foreground border border-border'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot[fee.status] || 'bg-gray-400'}`} />
                        {fee.status}
                      </span>
                    </td>

                    {/* Payment Info */}
                    <td className="px-5 py-4">
                      {fee.paidDate ? (
                        <div>
                          <p className="text-sm text-muted-foreground">{new Date(fee.paidDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</p>
                          <p className="text-xs text-muted-foreground">{fee.paymentMethod}</p>
                          {fee.transactionId && <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate max-w-[120px]">{fee.transactionId}</p>}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Not paid</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">

                        {/* View */}
                        <button
                          onClick={() => setViewingFee(fee)}
                          title="View Details"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted hover:bg-primary/15 border border-transparent hover:border-primary/30 text-muted-foreground hover:text-primary transition-all duration-200"
                        >
                          <FaEye className="w-3.5 h-3.5" />
                        </button>

                        {/* Receipt (paid) */}
                        {fee.status === 'Paid' && (
                          <button
                            onClick={() => handleViewReceipt(fee)}
                            title="View Receipt"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted hover:bg-primary/15 border border-transparent hover:border-primary/30 text-muted-foreground hover:text-primary transition-all duration-200"
                          >
                            <FaReceipt className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Mark Paid (pending / overdue) */}
                        {(fee.status === 'Pending' || fee.status === 'Overdue') && (
                          <button
                            onClick={() => { setSelectedFee(fee); setPaymentForm(p => ({ ...p, paidAmount: fee.amount })); setShowPaymentModal(true); }}
                            title="Record Payment"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted hover:bg-warning/10 border border-warning/30 border border-transparent hover:border-warning/30 text-muted-foreground hover:text-warning transition-all duration-200"
                          >
                            <FaMoneyBillWave className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteFee(fee)}
                          title="Delete Fee"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted hover:bg-error/10 border border-error/30 border border-transparent hover:border-error/30 text-muted-foreground hover:text-error transition-all duration-200"
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
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-bold text-foreground">Fee Details</h2>
              <button type="button" title="Close fee details" aria-label="Close fee details" onClick={() => setViewingFee(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <FaXmark />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4 pb-5 border-b border-border">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-foreground text-lg font-bold shadow-lg">
                  {getInitials(viewingFee.studentName)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{viewingFee.studentName}</h3>
                  <p className="text-sm text-muted-foreground">{viewingFee.studentId} · Room {viewingFee.room}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Fee Type', viewingFee.feeType],
                  ['Semester', viewingFee.semester],
                  ['Amount', `LKR ${viewingFee.amount.toLocaleString()}`],
                  ['Due Date', new Date(viewingFee.dueDate).toLocaleDateString()],
                ].map(([label, val]) => (
                  <div key={label} className="bg-muted rounded-xl p-3 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <p className="text-foreground font-medium">{val}</p>
                  </div>
                ))}
                <div className="bg-muted rounded-xl p-3 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg ${statusBadge[viewingFee.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot[viewingFee.status]}`} />
                    {viewingFee.status}
                  </span>
                </div>
                {viewingFee.status === 'Partial' && (
                  <div className="bg-muted rounded-xl p-3 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Paid / Remaining</p>
                    <p className="text-foreground font-medium">
                      LKR {(viewingFee.paidAmount || 0).toLocaleString()} / LKR {(viewingFee.remainingAmount || 0).toLocaleString()}
                    </p>
                  </div>
                )}
                {viewingFee.paidDate && (
                  <>
                    <div className="bg-muted rounded-xl p-3 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Paid Date</p>
                      <p className="text-foreground font-medium">{new Date(viewingFee.paidDate).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-muted rounded-xl p-3 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                      <p className="text-foreground font-medium">{viewingFee.paymentMethod}</p>
                    </div>
                    {viewingFee.transactionId && (
                      <div className="col-span-2 bg-muted rounded-xl p-3 border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
                        <p className="text-foreground font-mono text-sm">{viewingFee.transactionId}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setViewingFee(null)} className="px-4 py-2 bg-muted hover:bg-muted/70 text-foreground transition-colors rounded-xl text-sm transition-colors">
                  Close
                </button>
                {viewingFee.status === 'Paid' && (
                  <button
                    onClick={() => { handleViewReceipt(viewingFee); setViewingFee(null); }}
                    className="px-5 py-2 bg-primary hover:bg-gradient-to-r from-primary to-primary-hover text-primary-foreground transform hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-300 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105"
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
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/15 border border-primary/25 rounded-lg flex items-center justify-center">
                  <FaPlus className="w-3.5 h-3.5 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Add New Fee</h2>
              </div>
              <button type="button" title="Close add fee modal" aria-label="Close add fee modal" onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <FaXmark />
              </button>
            </div>
            <form onSubmit={handleAddFee} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Student Name</label>
                <input required value={addForm.studentName} onChange={e => setAddForm({ ...addForm, studentName: e.target.value })} placeholder="Full name" className="w-full rounded-xl px-4 py-2 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Student ID</label>
                  <input required value={addForm.studentId} onChange={e => setAddForm({ ...addForm, studentId: e.target.value })} placeholder="e.g. STU001" className="w-full rounded-xl px-4 py-2 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Room</label>
                  <input required value={addForm.room} onChange={e => setAddForm({ ...addForm, room: e.target.value })} placeholder="e.g. A-101" className="w-full rounded-xl px-4 py-2 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Fee Type</label>
                <div className="relative">
                  <select required title="Fee type" aria-label="Fee type" value={addForm.feeType} onChange={e => setAddForm({ ...addForm, feeType: e.target.value })} className="w-full rounded-xl px-4 py-2 pr-10 appearance-none bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30">
                    <option value="Hostel Fee">Hostel Fee</option>
                    <option value="Mess Fee">Mess Fee</option>
                    <option value="Library Fee">Library Fee</option>
                    <option value="Other">Other</option>
                  </select>
                  <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Amount (LKR) — min 4,000</label>
                <input required title="Fee amount" type="number" min={4000} value={addForm.amount} onChange={e => setAddForm({ ...addForm, amount: Number(e.target.value) })} className="w-full rounded-xl px-4 py-2 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Due Date</label>
                  <input required title="Due date" type="date" value={addForm.dueDate} onChange={e => setAddForm({ ...addForm, dueDate: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Semester</label>
                  <input required placeholder="e.g. Spring 2026" value={addForm.semester} onChange={e => setAddForm({ ...addForm, semester: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-muted hover:bg-muted/70 text-foreground transition-colors rounded-xl text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="px-6 py-2 bg-primary hover:bg-gradient-to-r from-primary to-primary-hover text-primary-foreground transform hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-300 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2 transition-all hover:scale-105">
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
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-warning/10 border border-warning/30 border border-warning/30 rounded-lg flex items-center justify-center">
                  <FaMoneyBillWave className="w-3.5 h-3.5 text-warning" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Record Payment</h2>
              </div>
              <button type="button" title="Close payment modal" aria-label="Close payment modal" onClick={() => { setShowPaymentModal(false); setSelectedFee(null); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <FaXmark />
              </button>
            </div>

            {/* Fee summary */}
            <div className="px-6 py-4 bg-muted border-b border-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-foreground text-xs font-bold">
                  {getInitials(selectedFee.studentName)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedFee.studentName}</p>
                  <p className="text-xs text-muted-foreground">{selectedFee.feeType} · LKR {selectedFee.amount.toLocaleString()}</p>
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
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Paid Amount (LKR)</label>
                  <input required title="Paid amount" type="number" min={1} max={selectedFee.amount} value={paymentForm.paidAmount} onChange={e => setPaymentForm({ ...paymentForm, paidAmount: Number(e.target.value) })} className="w-full rounded-xl px-4 py-2 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30" />
                  <p className="text-xs text-muted-foreground mt-1">Max: LKR {selectedFee.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Paid Date</label>
                  <input required title="Paid date" type="date" value={paymentForm.paidDate} onChange={e => setPaymentForm({ ...paymentForm, paidDate: e.target.value })} className="w-full rounded-xl px-4 py-2 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Payment Method</label>
                <div className="relative">
                  <select required title="Payment method" aria-label="Payment method" value={paymentForm.paymentMethod} onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })} className="w-full rounded-xl px-4 py-2 pr-10 appearance-none bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30">
                    <option value="Online Transfer">Online Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Deposit">Bank Deposit</option>
                    <option value="Card">Card</option>
                  </select>
                  <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Transaction ID</label>
                <input required value={paymentForm.transactionId} onChange={e => setPaymentForm({ ...paymentForm, transactionId: e.target.value })} placeholder="e.g. TXN123456" className="w-full rounded-xl px-4 py-2 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowPaymentModal(false); setSelectedFee(null); }} className="px-4 py-2 bg-muted hover:bg-muted/70 text-foreground transition-colors rounded-xl text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="px-6 py-2 bg-primary hover:bg-gradient-to-r from-primary to-primary-hover text-primary-foreground transform hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-300 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2 transition-all hover:scale-105">
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
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/15 border border-primary/25 rounded-lg flex items-center justify-center">
                  <FaReceipt className="w-3.5 h-3.5 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Payment Receipt</h2>
              </div>
              <button type="button" title="Close receipt modal" aria-label="Close receipt modal" onClick={() => { setShowReceiptModal(false); setReceipt(null); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <FaXmark />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center border-b border-border pb-4">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FaDollarSign className="w-5 h-5 text-primary" />
                </div>
                <p className="text-lg font-bold text-primary">Home Treats Hostel</p>
                <p className="text-sm text-muted-foreground">Official Payment Receipt</p>
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
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-foreground font-medium">{val}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2.5 flex justify-between">
                  <span className="text-muted-foreground font-semibold">Amount</span>
                  <span className="text-primary font-bold text-base">LKR {receipt.amount.toLocaleString()}</span>
                </div>
                <div className="border-t border-border pt-2.5 space-y-2">
                  {[
                    ['Paid Date', new Date(receipt.paidDate).toLocaleDateString()],
                    ['Method', receipt.paymentMethod],
                    ['TXN ID', receipt.transactionId],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground font-mono">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">Generated: {new Date(receipt.generatedAt).toLocaleString()}</p>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => { setShowReceiptModal(false); setReceipt(null); }} className="px-4 py-2 bg-muted hover:bg-muted/70 text-foreground transition-colors rounded-xl text-sm transition-colors">
                  Close
                </button>
                <button onClick={handleDownloadReceipt} className="px-5 py-2 bg-primary hover:bg-gradient-to-r from-primary to-primary-hover text-primary-foreground transform hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-300 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105">
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
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/15 border border-primary/25 rounded-lg flex items-center justify-center">
                  <FaChartBar className="w-3.5 h-3.5 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Monthly Report</h2>
              </div>
              <button type="button" title="Close report prompt" aria-label="Close report prompt" onClick={() => setShowReportPrompt(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <FaXmark />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Year</label>
                <input title="Report year" type="number" min={2020} max={2030} value={reportYear} onChange={e => setReportYear(Number(e.target.value))} className="w-full rounded-xl px-4 py-2 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Month</label>
                <div className="relative">
                  <select title="Report month" aria-label="Report month" value={reportMonth} onChange={e => setReportMonth(Number(e.target.value))} className="w-full rounded-xl px-4 py-2 pr-10 appearance-none bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30">
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowReportPrompt(false)} className="px-4 py-2 bg-muted hover:bg-muted/70 text-foreground transition-colors rounded-xl text-sm transition-colors">
                  Cancel
                </button>
                <button onClick={handleFetchReport} disabled={actionLoading} className="px-6 py-2 bg-primary hover:bg-gradient-to-r from-primary to-primary-hover text-primary-foreground transform hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-300 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2 transition-all hover:scale-105">
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
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/15 border border-primary/25 rounded-lg flex items-center justify-center">
                  <FaChartBar className="w-3.5 h-3.5 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Monthly Report</h2>
              </div>
              <button type="button" title="Close report modal" aria-label="Close report modal" onClick={() => { setShowReportModal(false); setReportData(null); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <FaXmark />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Collected', val: `LKR ${(reportData.totalCollected || 0).toLocaleString()}`, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
                  { label: 'Total Pending',   val: `LKR ${(reportData.totalPending   || 0).toLocaleString()}`, color: 'text-warning', bg: 'bg-warning/10 border border-warning/30' },
                  { label: 'Total Records',   val: reportData.totalFees || 0,                                   color: 'text-foreground',      bg: 'bg-muted border-border' },
                  { label: 'Overdue Count',   val: reportData.overdueCount || 0,                               color: 'text-error',    bg: 'bg-error/10 border border-error/30' },
                ].map((c) => (
                  <div key={c.label} className={`rounded-xl p-4 border ${c.bg}`}>
                    <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
                    <p className={`text-xl font-extrabold ${c.color}`}>{c.val}</p>
                  </div>
                ))}
              </div>
              {reportData.byFeeType && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">By Fee Type</h3>
                  <div className="bg-muted rounded-xl border border-border divide-y divide-border">
                    {Object.entries(reportData.byFeeType).map(([type, val]: [string, any]) => (
                      <div key={type} className="flex justify-between px-4 py-3 text-sm">
                        <span className="text-muted-foreground">{type}</span>
                        <span className="text-foreground font-semibold">LKR {(typeof val === 'number' ? val : val?.total || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <button onClick={() => { setShowReportModal(false); setReportData(null); }} className="px-5 py-2 bg-muted hover:bg-muted/70 text-foreground transition-colors rounded-xl text-sm transition-colors">
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
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-error/10 border border-error/30 border border-error/30 rounded-lg flex items-center justify-center">
                  <FaUserSlash className="w-3.5 h-3.5 text-error" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Unpaid Students</h2>
              </div>
              <button type="button" title="Close unpaid students modal" aria-label="Close unpaid students modal" onClick={() => setShowUnpaidModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <FaXmark />
              </button>
            </div>
            <div className="p-6">
              {unpaidStudents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCircleCheck className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-foreground font-semibold mb-1">All clear!</p>
                  <p className="text-muted-foreground text-sm">No unpaid students found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unpaidStudents.map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted border border-error/30 hover:border-error/30 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-foreground text-xs font-bold">
                          {getInitials(s.studentName || s.name || 'N/A')}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{s.studentName || s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.studentId} · {s.room}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-error">LKR {(s.totalDue || s.amount || 0).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{s.feeType || 'Multiple'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end pt-5">
                <button onClick={() => setShowUnpaidModal(false)} className="px-5 py-2 bg-muted hover:bg-muted/70 text-foreground transition-colors rounded-xl text-sm transition-colors">
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
