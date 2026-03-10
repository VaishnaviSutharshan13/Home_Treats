import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPlus, FaMagnifyingGlass, FaFilter, FaDollarSign, FaReceipt,
  FaCircleCheck, FaCircleXmark, FaClock, FaSpinner, FaFileLines,
  FaEye, FaTrash, FaMoneyBillWave, FaPenToSquare,
  FaTriangleExclamation, FaDownload, FaXmark, FaChevronLeft,
  FaArrowTrendUp, FaBars, FaArrowTrendDown, FaCoins, FaMoneyBillTransfer,
  FaWallet, FaFileExport, FaUserCheck, FaUserXmark, FaChartLine,
  FaTrophy, FaBuilding, FaCreditCard, FaChartColumn,
} from 'react-icons/fa6';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { feesService, studentService, roomService } from '../../services';
import Sidebar from '../../components/layout/Sidebar';

interface Fee {
  _id: string;
  studentName: string;
  studentId: string;
  room: string;
  floor?: string;
  feeType: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Partial';
  paidDate: string | null;
  paymentMethod: string | null;
  transactionId: string | null;
  semester: string;
  academicYear?: string;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  paymentNotes?: string;
  createdAt: string;
}

interface Student {
  _id: string;
  name: string;
  studentId: string;
  room: string;
}

interface Room {
  _id: string;
  roomNumber: string;
  floor: string;
  block: string;
}

interface Statistics {
  totalRevenue: number;
  totalRevenueCount: number;
  monthlyIncome: number;
  monthlyIncomeCount: number;
  pendingPayments: number;
  pendingPaymentsCount: number;
  partiallyPaidAmount: number;
  partiallyPaidCount: number;
  overduePayments: number;
  overduePaymentsCount: number;
  paidStudentsCount: number;
  unpaidStudentsCount: number;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    tension: number;
  }>;
}

interface Analytics {
  topPayingStudents: Array<{ studentId: string; name: string; total: number; count: number }>;
  floorRevenueData: Array<{ floor: string; revenue: number }>;
  mostOccupiedFloors: Array<{ floor: string; studentCount: number }>;
  paymentTrends: Array<{ method: string; count: number; total: number }>;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const statusBadge: Record<string, string> = {
  Paid: 'bg-green-500/15 text-green-600 border border-green-500/30',
  Pending: 'bg-yellow-500/15 text-yellow-600 border border-yellow-500/30',
  Overdue: 'bg-red-500/15 text-red-600 border border-red-500/30',
  Partial: 'bg-blue-500/15 text-blue-600 border border-blue-500/30',
};

const statusIcon: Record<string, any> = {
  Paid: FaCircleCheck,
  Pending: FaClock,
  Overdue: FaTriangleExclamation,
  Partial: FaMoneyBillTransfer,
};

const FeesManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterFeeType, setFilterFeeType] = useState('All');
  const [filterSemester, setFilterSemester] = useState('All');
  const [filterFloor, setFilterFloor] = useState('All');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [addForm, setAddForm] = useState({
    studentId: '', studentName: '', room: '',
    feeType: 'Monthly Hostel Fee', amount: 4500, dueDate: '',
    notes: '',
  });

  const [editForm, setEditForm] = useState<Fee | null>(null);

  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'Cash', transactionId: '', paidAmount: 0,
    paidDate: new Date().toISOString().split('T')[0], paymentNotes: '',
  });

  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [receipt, setReceipt] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const fetchFees = async () => {
    try {
      const res = await feesService.getAll();
      setFees(res.data || []);
    } catch (err: any) {
      console.error('Error fetching fees:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const res = await feesService.getStatistics();
      setStatistics(res.data);
    } catch (err: any) {
      console.error('Error fetching statistics:', err);
    }
  };

  const fetchStudentsAndRooms = async () => {
    try {
      const res = await feesService.getStudentsWithRooms();
      setStudents(res.data.students || []);
      setRooms(res.data.rooms || []);
    } catch (err: any) {
      console.error('Error fetching students and rooms:', err);
    }
  };

  const fetchChart = async () => {
    try {
      const res = await feesService.getMonthlyChart();
      setChartData(res.data);
    } catch (err: any) {
      console.error('Error fetching chart data:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await feesService.getAnalytics();
      setAnalytics(res.data);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchFees(), fetchStatistics(), fetchStudentsAndRooms(), fetchChart(), fetchAnalytics()]);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const semesters = [...new Set(fees.map(f => f.semester).filter(Boolean))];
  const floors = [...new Set(fees.map(f => f.floor).filter(Boolean))];

  const filteredFees = fees.filter(fee => {
    const matchesSearch =
      fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || fee.status === filterStatus;
    const matchesFeeType = filterFeeType === 'All' || fee.feeType === filterFeeType;
    const matchesSemester = filterSemester === 'All' || fee.semester === filterSemester;
    const matchesFloor = filterFloor === 'All' || fee.floor === filterFloor;
    return matchesSearch && matchesStatus && matchesFeeType && matchesSemester && matchesFloor;
  });

  const totalPages = Math.ceil(filteredFees.length / itemsPerPage);
  const paginatedFees = filteredFees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleClearFilters = () => {
    setSearchTerm(''); setFilterStatus('All'); setFilterFeeType('All');
    setFilterSemester('All'); setFilterFloor('All'); setCurrentPage(1);
  };

  const handleStudentSelect = async (studentLookupId: string) => {
    if (!studentLookupId) {
      setAddForm(prev => ({
        ...prev,
        studentId: '',
        studentName: '',
        room: '',
      }));
      return;
    }

    try {
      const localStudent = students.find(s => s.studentId === studentLookupId);
      if (localStudent) {
        const localRoom = rooms.find(r => r.roomNumber === localStudent.room);
        setAddForm(prev => ({
          ...prev,
          studentId: localStudent.studentId,
          studentName: localStudent.name,
          room: localStudent.room,
        }));
        return;
      }

      const studentRes = await studentService.getById(studentLookupId);
      const student = studentRes?.data;
      if (!student) throw new Error('Student not found');

      const roomRes = student.room ? await roomService.getById(student.room) : null;

      setAddForm(prev => ({
        ...prev,
        studentId: student.studentId,
        studentName: student.name,
        room: student.room,
      }));
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to auto-fill student details. Please refresh and try again.', 'error');
    }
  };

  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.studentId) { showToast('Please enter or select a Student ID', 'error'); return; }
    if (addForm.amount <= 0) { showToast('Amount must be greater than 0', 'error'); return; }
    if (!addForm.dueDate) { showToast('Please select a due date', 'error'); return; }

    const payload = {
      studentId: addForm.studentId,
      studentName: addForm.studentName,
      room: addForm.room,
      feeType: addForm.feeType,
      amount: addForm.amount,
      dueDate: addForm.dueDate,
      notes: addForm.notes,
      semester: 'N/A',
      status: 'Pending',
    };

    setActionLoading(true);
    try {
      await feesService.create(payload);
      showToast('Fee added successfully');
      setShowAddModal(false);
      setAddForm({ studentId: '', studentName: '', room: '', feeType: 'Monthly Hostel Fee', amount: 4500, dueDate: '', notes: '' });
      loadData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to add fee', 'error');
    } finally { setActionLoading(false); }
  };

  const handleEditFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    setActionLoading(true);
    try {
      await feesService.update(editForm._id, editForm);
      showToast('Fee updated successfully');
      setShowEditModal(false);
      setEditForm(null);
      loadData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to update fee', 'error');
    } finally { setActionLoading(false); }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee || paymentForm.paidAmount <= 0) {
      showToast('Payment amount must be greater than 0', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await feesService.pay(selectedFee._id, paymentForm);
      showToast('Payment recorded successfully');
      setShowPaymentModal(false);
      setPaymentForm({ paymentMethod: 'Cash', transactionId: '', paidAmount: 0, paidDate: new Date().toISOString().split('T')[0], paymentNotes: '' });
      setSelectedFee(null);
      loadData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to record payment', 'error');
    } finally { setActionLoading(false); }
  };

  const handleViewReceipt = async (fee: Fee) => {
    if (fee.status === 'Pending' || fee.status === 'Overdue') {
      showToast('Receipt only available for paid/partial fees', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const res = await feesService.getReceipt(fee._id);
      setReceipt(res.data);
      setShowReceiptModal(true);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load receipt', 'error');
    } finally { setActionLoading(false); }
  };

  const handleDownloadReceipt = () => {
    if (!receipt) return;
    const csv = [
      'Payment Receipt',
      `Receipt No,${receipt.receiptNo}`,
      `Student,${receipt.studentName}`,
      `Student ID,${receipt.studentId}`,
      `Room,${receipt.room}`,
      `Fee Type,${receipt.feeType}`,
      `Total Amount,LKR ${receipt.totalAmount}`,
      `Paid Amount,LKR ${receipt.paidAmount}`,
      `Payment Method,${receipt.paymentMethod}`,
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${receipt.receiptNo}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteFee = async (fee: Fee) => {
    if (!window.confirm(`Delete fee for ${fee.studentName}?\n\nThis cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await feesService.delete(fee._id);
      showToast('Fee deleted successfully');
      loadData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to delete fee', 'error');
    } finally { setActionLoading(false); }
  };

  const handleExportCSV = () => {
    const headers = ['Student Name', 'Student ID', 'Room', 'Floor', 'Fee Type', 'Amount', 'Due Date', 'Status', 'Payment Method', 'Semester'];
    const rows = filteredFees.map(f => [f.studentName, f.studentId, f.room, f.floor || '', f.feeType, f.amount, new Date(f.dueDate).toLocaleDateString(), f.status, f.paymentMethod || '', f.semester]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `fees-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported successfully');
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-700 text-lg font-semibold">Loading Fees Management...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center bg-white border border-red-500/20 p-10 rounded-2xl shadow-xl max-w-md mx-4">
        <FaTriangleExclamation className="text-5xl text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Data</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button onClick={loadData} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold">Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} userRole="admin" />

      <div className="lg:ml-64">
        {/* Toasts */}
        <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-xs w-full">
          {toasts.map(t => (
            <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium text-white ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-purple-600'}`}>
              {t.type === 'success' && <FaCircleCheck />}
              {t.type === 'error' && <FaCircleXmark />}
              {t.type === 'info' && <FaFileLines />}
              <span>{t.message}</span>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="bg-white border-b border-purple-100 shadow-sm">
          <div className="w-full px-6 sm:px-8 lg:px-10 py-6">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-purple-50"><FaBars className="w-5 h-5" /></button>
              <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-purple-600 text-sm">
                <FaChevronLeft className="w-3 h-3" /><span>Dashboard</span><span className="text-gray-400 mx-0.5">/</span><span className="text-purple-600 font-medium">Fees Management</span>
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                    <FaMoneyBillWave className="text-xl text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Fees Management</h1>
                </div>
                <p className="text-gray-600">Manage hostel fees, track payments, and monitor revenue</p>
              </div>
              <button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg">
                <FaPlus className="w-4 h-4" />Add New Fee
              </button>
            </div>
          </div>
        </div>

        <div className="w-full px-6 sm:px-8 lg:px-10 py-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              { label: 'Total Revenue', value: statistics?. totalRevenue || 0, count: statistics?.totalRevenueCount, icon: FaDollarSign, color: 'green', bgColor: 'bg-green-500', borderColor: 'border-green-100', textColor: 'text-green-600', bgLight: 'bg-green-50', trend: FaArrowTrendUp, desc: 'All-time collected' },
              { label: 'Monthly Income', value: statistics?.monthlyIncome || 0, count: statistics?.monthlyIncomeCount, icon: FaChartLine, color: 'emerald', bgColor: 'bg-emerald-500', borderColor: 'border-emerald-100', textColor: 'text-emerald-600', bgLight: 'bg-emerald-50', trend: FaArrowTrendUp, desc: 'Current month' },
              { label: 'Pending Payments', value: statistics?.pendingPayments || 0, count: statistics?.pendingPaymentsCount, icon: FaClock, color: 'yellow', bgColor: 'bg-yellow-500', borderColor: 'border-yellow-100', textColor: 'text-yellow-600', bgLight: 'bg-yellow-50', trend: FaClock, desc: 'Awaiting payment' },
              { label: 'Overdue Payments', value: statistics?.overduePayments || 0, count: statistics?.overduePaymentsCount, icon: FaTriangleExclamation, color: 'red', bgColor: 'bg-red-500', borderColor: 'border-red-100', textColor: 'text-red-600', bgLight: 'bg-red-50', trend: FaArrowTrendDown, desc: 'Past due date' },
              { label: 'Paid Students', value: statistics?.paidStudentsCount || 0, count: null, icon: FaUserCheck, color: 'blue', bgColor: 'bg-blue-500', borderColor: 'border-blue-100', textColor: 'text-blue-600', bgLight: 'bg-blue-50', trend: FaCircleCheck, desc: 'Active payments' },
              { label: 'Unpaid Students', value: statistics?.unpaidStudentsCount || 0, count: null, icon: FaUserXmark, color: 'orange', bgColor: 'bg-orange-500', borderColor: 'border-orange-100', textColor: 'text-orange-600', bgLight: 'bg-orange-50', trend: FaCircleXmark, desc: 'Need attention' },
            ].map(card => {
              const Icon = card.icon;
              const Trend = card.trend;
              return (
                <div key={card.label} className={`bg-white rounded-2xl p-6 shadow-lg border ${card.borderColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="text-2xl text-white" />
                    </div>
                    <span className={`${card.textColor} ${card.bgLight} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                      <Trend className="w-3 h-3" />{card.label.split(' ')[0]}
                    </span>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">{card.label}</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{card.count !== null ? `LKR ${card.value.toLocaleString()}` : card.value}</p>
                  <p className="text-sm text-gray-500">{card.count !== null ? `${card.count || 0} transaction${card.count !== 1 ? 's' : ''}` : card.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Monthly Revenue Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <FaChartColumn className="text-purple-600 text-xl" />
              <h2 className="text-xl font-semibold text-gray-900">Monthly Revenue Trend</h2>
              <span className="ml-auto text-sm text-gray-500">Last 6 Months</span>
            </div>
            {chartData ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.labels.map((label, index) => ({
                  month: label,
                  revenue: chartData.datasets[0].data[index],
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} tick TickFormatter={(value) => `LKR ${(value / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px' }}
                    formatter={(value: number) => [`LKR ${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#9333ea" strokeWidth={3} dot={{ fill: '#9333ea', r: 5 }} activeDot={{ r: 7 }} name="Monthly Revenue" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <FaSpinner className="animate-spin text-3xl" />
              </div>
            )}
          </div>

          {/* Financial Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Paying Students */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center gap-2 mb-4">
                <FaTrophy className="text-yellow-500 text-xl" />
                <h2 className="text-lg font-semibold text-gray-900">Top Paying Students</h2>
              </div>
              {analytics?.topPayingStudents && analytics.topPayingStudents.length > 0 ? (
                <div className="space-y-3">
                  {analytics.topPayingStudents.map((student, index) => (
                    <div key={student.studentId} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.studentId} • {student.count} payments</p>
                      </div>
                      <p className="font-bold text-purple-600">LKR {student.total.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-8">No payment data available</p>
              )}
            </div>

            {/* Floor Revenue Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center gap-2 mb-4">
                <FaBuilding className="text-blue-500 text-xl" />
                <h2 className="text-lg font-semibold text-gray-900">Floor Revenue Distribution</h2>
              </div>
              {analytics?.floorRevenueData && analytics.floorRevenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.floorRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="floor" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px' }}
                      formatter={(value: number) => [`LKR ${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#9333ea" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-400 py-8">No floor revenue data available</p>
              )}
            </div>

            {/* Most Occupied Floors */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center gap-2 mb-4">
                <FaUserCheck className="text-green-500 text-xl" />
                <h2 className="text-lg font-semibold text-gray-900">Most Occupied Floors</h2>
              </div>
              {analytics?.mostOccupiedFloors && analytics.mostOccupiedFloors.length > 0 ? (
                <div className="space-y-3">
                  {analytics.mostOccupiedFloors.map((floor, index) => (
                    <div key={floor.floor} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{floor.floor}</p>
                        <p className="text-xs text-gray-500">{floor.studentCount} students</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{floor.studentCount}</p>
                        <p className="text-xs text-gray-500">students</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-8">No occupancy data available</p>
              )}
            </div>

            {/* Payment Trends */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center gap-2 mb-4">
                <FaCreditCard className="text-indigo-500 text-xl" />
                <h2 className="text-lg font-semibold text-gray-900">Payment Method Trends</h2>
              </div>
              {analytics?.paymentTrends && analytics.paymentTrends.length > 0 ? (
                <div className="space-y-3">
                  {analytics.paymentTrends.map((trend) => (
                    <div key={trend.method} className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
                      <FaCreditCard className="text-indigo-600 text-xl" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{trend.method}</p>
                        <p className="text-xs text-gray-500">{trend.count} transactions</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-indigo-600">LKR {trend.total.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{((trend.count / analytics.paymentTrends.reduce((sum, t) => sum + t.count, 0)) * 100).toFixed(0)}% usage</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-8">No payment trends available</p>
              )}
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FaFilter className="text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Search & Filters</h2>
            </div>
            <div className="mb-4">
              <div className="relative">
                <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search by student name, ID, or room number..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {[
                { label: 'Status', value: filterStatus, onChange: setFilterStatus, options: ['All', 'Paid', 'Pending', 'Partial', 'Overdue'] },
                { label: 'Fee Type', value: filterFeeType, onChange: setFilterFeeType, options: ['All', 'Monthly Hostel Fee', 'Maintenance Fee', 'Mess Fee', 'Library Fee', 'Other'] },
                { label: 'Semester', value: filterSemester, onChange: setFilterSemester, options: ['All', ...semesters] },
                { label: 'Floor', value: filterFloor, onChange: setFilterFloor, options: ['All', ...floors] },
              ].map(filter => (
                <div key={filter.label}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{filter.label}</label>
                  <select value={filter.value} onChange={e => filter.onChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                    {filter.options.map(opt => <option key={opt} value={opt}>{opt === 'All' ? `All ${filter.label}` : opt}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleClearFilters} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center gap-2"><FaXmark className="w-4 h-4" />Clear Filters</button>
              <button onClick={handleExportCSV} className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl font-medium flex items-center gap-2"><FaFileExport className="w-4 h-4" />Export CSV</button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Fee Records</h2>
              <p className="text-sm text-gray-500 mt-1">Showing {paginatedFees.length} of {filteredFees.length} records</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-50 border-b border-purple-100">
                  <tr>
                    {['Student', 'Room/Floor', 'Fee Type', 'Amount', 'Due Date', 'Status', 'Payment', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedFees.length === 0 ? (
                    <tr><td colSpan={8} className="px-6 py-12 text-center">
                      <FaFileLines className="text-5xl text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-700 font-medium">No fees found</p>
                      <p className="text-gray-500 text-sm">Try adjusting filters or add new fee</p>
                    </td></tr>
                  ) : paginatedFees.map(fee => {
                    const StatusIconComponent = statusIcon[fee.status];
                    return (
                      <tr key={fee._id} className="hover:bg-purple-50/50">
                        <td className="px-6 py-4"><p className="font-semibold text-gray-900">{fee.studentName}</p><p className="text-sm text-gray-500">{fee.studentId}</p></td>
                        <td className="px-6 py-4"><p className="font-medium text-gray-900">{fee.room}</p><p className="text-sm text-gray-500">{fee.floor || 'N/A'}</p></td>
                        <td className="px-6 py-4"><p className="text-sm text-gray-900">{fee.feeType}</p><p className="text-xs text-gray-500">{fee.semester}</p></td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">LKR {fee.amount.toLocaleString()}</p>
                          {fee.status === 'Partial' && <p className="text-xs text-gray-500">Paid: LKR {fee.paidAmount.toLocaleString()}</p>}
                        </td>
                        <td className="px-6 py-4"><p className="text-sm text-gray-900">{new Date(fee.dueDate).toLocaleDateString()}</p></td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusBadge[fee.status]}`}>
                            <StatusIconComponent className="w-3 h-3" />{fee.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {fee.paymentMethod ? <><p className="text-sm text-gray-900">{fee.paymentMethod}</p>{fee.transactionId && <p className="text-xs text-gray-500">{fee.transactionId}</p>}</> : <span className="text-sm text-gray-400">Not paid</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setSelectedFee(fee); setShowViewModal(true); }} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg" title="View"><FaEye className="w-4 h-4" /></button>
                            {(fee.status === 'Pending' || fee.status === 'Overdue' || fee.status === 'Partial') && (
                              <button onClick={() => { setSelectedFee(fee); setPaymentForm(p => ({ ...p, paidAmount: fee.remainingAmount || fee.amount })); setShowPaymentModal(true); }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Pay"><FaWallet className="w-4 h-4" /></button>
                            )}
                            <button onClick={() => { setEditForm(fee); setShowEditModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit"><FaPenToSquare className="w-4 h-4" /></button>
                            {(fee.status === 'Paid' || fee.status === 'Partial') && (
                              <button onClick={() => handleViewReceipt(fee)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg" title="Receipt"><FaReceipt className="w-4 h-4" /></button>
                            )}
                            <button onClick={() => handleDeleteFee(fee)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><FaTrash className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t flex justify-between items-center">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg font-medium">Previous</button>
                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg font-medium">Next</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADD FEE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Add New Fee</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FaXmark className="w-5 h-5 text-gray-500" /></button>
              </div>
            </div>
            <form onSubmit={handleAddFee} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaUserCheck className="text-purple-600" />
                    Select Student
                  </label>
                  <select value={addForm.studentId} onChange={e => handleStudentSelect(e.target.value)} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="">-- Select Student --</option>
                    {students.map(s => <option key={s._id} value={s.studentId}>{s.name} ({s.studentId}) - Room {s.room}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaFileLines className="text-purple-600" />
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={addForm.studentId}
                    onChange={e => setAddForm({ ...addForm, studentId: e.target.value })}
                    placeholder="Enter Student ID"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaUserCheck className="text-purple-600" />
                    Student Name
                  </label>
                  <input type="text" value={addForm.studentName} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaBuilding className="text-purple-600" />
                    Room Number
                  </label>
                  <input type="text" value={addForm.room} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaFilter className="text-purple-600" />
                    Fee Type
                  </label>
                  <select value={addForm.feeType} onChange={e => setAddForm({ ...addForm, feeType: e.target.value })} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="Monthly Hostel Fee">Monthly Hostel Fee</option>
                    <option value="Maintenance Fee">Maintenance Fee</option>
                    <option value="Other">Other Charges</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaDollarSign className="text-purple-600" />
                    Amount (LKR)
                  </label>
                  <input type="number" min="1" value={addForm.amount} onChange={e => setAddForm({ ...addForm, amount: Number(e.target.value) })} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaClock className="text-purple-600" />
                    Due Date
                  </label>
                  <input type="date" value={addForm.dueDate} onChange={e => setAddForm({ ...addForm, dueDate: e.target.value })} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaFileLines className="text-purple-600" />
                    Notes (Optional)
                  </label>
                  <textarea value={addForm.notes} onChange={e => setAddForm({ ...addForm, notes: e.target.value })} rows={3} placeholder="Optional notes..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={actionLoading} className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                  {actionLoading ? <><FaSpinner className="animate-spin" />Adding...</> : <><FaPlus />Add Fee</>}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FEE MODAL */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Edit Fee</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FaXmark className="w-5 h-5 text-gray-500" /></button>
              </div>
            </div>
            <form onSubmit={handleEditFee} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                  <input type="text" value={editForm.studentId} readOnly className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                  <input type="text" value={editForm.studentName} readOnly className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fee Type</label>
                  <select value={editForm.feeType} onChange={e => setEditForm({ ...editForm, feeType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="Monthly Hostel Fee">Monthly Hostel Fee</option>
                    <option value="Maintenance Fee">Maintenance Fee</option>
                    <option value="Mess Fee">Mess Fee</option>
                    <option value="Library Fee">Library Fee</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (LKR)</label>
                  <input type="number" min="4000" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input type="date" value={editForm.dueDate.split('T')[0]} onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                  <input type="text" value={editForm.semester} onChange={e => setEditForm({ ...editForm, semester: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea value={editForm.notes || ''} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={actionLoading} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                  {actionLoading ? <><FaSpinner className="animate-spin" />Updating...</> : <><FaPenToSquare />Update Fee</>}
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {showViewModal && selectedFee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Fee Details</h2>
                <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FaXmark className="w-5 h-5 text-gray-500" /></button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Student Name', value: selectedFee.studentName },
                  { label: 'Student ID', value: selectedFee.studentId },
                  { label: 'Room', value: selectedFee.room },
                  { label: 'Floor', value: selectedFee.floor || 'N/A' },
                  { label: 'Fee Type', value: selectedFee.feeType },
                  { label: 'Amount', value: `LKR ${selectedFee.amount.toLocaleString()}` },
                  { label: 'Paid Amount', value: `LKR ${selectedFee.paidAmount.toLocaleString()}` },
                  { label: 'Remaining', value: `LKR ${selectedFee.remainingAmount.toLocaleString()}` },
                  { label: 'Due Date', value: new Date(selectedFee.dueDate).toLocaleDateString() },
                  { label: 'Status', value: selectedFee.status },
                  { label: 'Semester', value: selectedFee.semester },
                  { label: 'Academic Year', value: selectedFee.academicYear || 'N/A' },
                  { label: 'Payment Method', value: selectedFee.paymentMethod || 'Not Paid' },
                  { label: 'Transaction ID', value: selectedFee.transactionId || 'N/A' },
                  { label: 'Paid Date', value: selectedFee.paidDate ? new Date(selectedFee.paidDate).toLocaleDateString() : 'N/A' },
                  { label: 'Created', value: new Date(selectedFee.createdAt).toLocaleDateString() },
                ].map(item => (
                  <div key={item.label} className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                    <p className="font-semibold text-gray-900">{item.value}</p>
                  </div>
                ))}
                {selectedFee.notes && (
                  <div className="md:col-span-2 p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Notes</p>
                    <p className="text-gray-900">{selectedFee.notes}</p>
                  </div>
                )}
                {selectedFee.paymentNotes && (
                  <div className="md:col-span-2 p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Payment Notes</p>
                    <p className="text-gray-900">{selectedFee.paymentNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && selectedFee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Record Payment</h2>
                <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FaXmark className="w-5 h-5 text-gray-500" /></button>
              </div>
              <p className="text-gray-600 mt-2">Student: {selectedFee.studentName} ({selectedFee.studentId})</p>
              <p className="text-gray-600">Total Amount: LKR {selectedFee.amount.toLocaleString()}</p>
              <p className="text-gray-600">Remaining: LKR {selectedFee.remainingAmount.toLocaleString()}</p>
            </div>
            <form onSubmit={handleRecordPayment} className="p-6">
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount (LKR)</label>
                  <input type="number" min="1" max={selectedFee.remainingAmount} value={paymentForm.paidAmount} onChange={e => setPaymentForm({ ...paymentForm, paidAmount: Number(e.target.value) })} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select value={paymentForm.paymentMethod} onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Online Payment">Online Payment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID (Optional)</label>
                  <input type="text" value={paymentForm.transactionId} onChange={e => setPaymentForm({ ...paymentForm, transactionId: e.target.value })} placeholder="e.g., TXN123456"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                  <input type="date" value={paymentForm.paidDate} onChange={e => setPaymentForm({ ...paymentForm, paidDate: e.target.value })} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Notes (Optional)</label>
                  <textarea value={paymentForm.paymentNotes} onChange={e => setPaymentForm({ ...paymentForm, paymentNotes: e.target.value })} rows={3} placeholder="Optional notes..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={actionLoading} className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                  {actionLoading ? <><FaSpinner className="animate-spin" />Processing...</> : <><FaMoneyBillWave />Record Payment</>}
                </button>
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {showReceiptModal && receipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Payment Receipt</h2>
                <button onClick={() => setShowReceiptModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FaXmark className="w-5 h-5 text-gray-500" /></button>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-xl p-6 mb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                    <FaReceipt className="text-3xl text-white" />
                  </div>
                </div>
                <p className="text-center text-sm text-gray-500 mb-1">Receipt No</p>
                <p className="text-center text-xl font-bold text-purple-600 mb-4">{receipt.receiptNo}</p>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Student', value: receipt.studentName },
                    { label: 'Student ID', value: receipt.studentId },
                    { label: 'Room', value: receipt.room },
                    { label: 'Fee Type', value: receipt.feeType },
                    { label: 'Total Amount', value: `LKR ${receipt.totalAmount.toLocaleString()}` },
                    { label: 'Paid Amount', value: `LKR ${receipt.paidAmount.toLocaleString()}`, highlight: true },
                    { label: 'Payment Method', value: receipt.paymentMethod },
                    { label: 'Payment Date', value: new Date(receipt.paidDate).toLocaleDateString() },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between">
                      <span className="text-gray-600">{item.label}:</span>
                      <span className={item.highlight ? 'font-bold text-purple-600' : 'font-medium text-gray-900'}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={handleDownloadReceipt} className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                <FaDownload />Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesManagement;
