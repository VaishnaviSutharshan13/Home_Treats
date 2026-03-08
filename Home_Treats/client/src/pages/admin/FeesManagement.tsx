import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaPlus, FaSearch, FaFilter, FaDollarSign, FaReceipt, FaCheckCircle, FaTimesCircle, FaClock, FaSpinner, FaFileAlt, FaUserSlash, FaEye } from 'react-icons/fa';
import { feesService } from '../../services';

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

const FeesManagement = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterFeeType, setFilterFeeType] = useState('All');
  const [filterSemester, setFilterSemester] = useState('All');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showUnpaidModal, setShowUnpaidModal] = useState(false);
  const [showReportPrompt, setShowReportPrompt] = useState(false);

  // Form states
  const [addForm, setAddForm] = useState({ studentName: '', studentId: '', room: '', feeType: 'Hostel Fee', amount: 4000, dueDate: '', semester: '' });
  const [paymentForm, setPaymentForm] = useState({ paymentMethod: 'Online Transfer', transactionId: '', paidAmount: 0, paidDate: new Date().toISOString().split('T')[0] });
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [viewingFee, setViewingFee] = useState<Fee | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [unpaidStudents, setUnpaidStudents] = useState<any[]>([]);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);

  // Loading states for actions
  const [actionLoading, setActionLoading] = useState(false);

  // Toast
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // Revenue summary
  const totalRevenue = fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
  const pendingRevenue = fees.filter(f => f.status === 'Pending' || f.status === 'Overdue').reduce((sum, f) => sum + f.amount, 0);
  const partialRevenue = fees.filter(f => f.status === 'Partial').reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  const overdueCount = fees.filter(f => f.status === 'Overdue').length;

  // Fetch fees
  const fetchFees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await feesService.getAll();
      setFees(res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFees(); }, []);

  // Filtered fees
  const semesters = [...new Set(fees.map(f => f.semester).filter(Boolean))];

  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || fee.status === filterStatus;
    const matchesFeeType = filterFeeType === 'All' || fee.feeType === filterFeeType;
    const matchesSemester = filterSemester === 'All' || fee.semester === filterSemester;
    return matchesSearch && matchesStatus && matchesFeeType && matchesSemester;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Partial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return <FaCheckCircle className="text-green-600" />;
      case 'Pending': return <FaClock className="text-yellow-600" />;
      case 'Overdue': return <FaTimesCircle className="text-red-600" />;
      case 'Partial': return <FaReceipt className="text-blue-600" />;
      default: return <FaClock className="text-gray-600" />;
    }
  };

  // Add Fee
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
    } finally {
      setActionLoading(false);
    }
  };

  // Record Payment
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
    } finally {
      setActionLoading(false);
    }
  };

  // View Receipt
  const handleViewReceipt = async (fee: Fee) => {
    setActionLoading(true);
    try {
      const res = await feesService.getReceipt(fee._id);
      setReceipt(res.data);
      setShowReceiptModal(true);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load receipt', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Download receipt
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
    a.href = url;
    a.download = `${receipt.receiptNo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Monthly Report
  const handleFetchReport = async () => {
    setActionLoading(true);
    try {
      const res = await feesService.getMonthlyReport(reportYear, reportMonth);
      setReportData(res.data);
      setShowReportPrompt(false);
      setShowReportModal(true);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load report', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Unpaid Students
  const handleFetchUnpaid = async () => {
    setActionLoading(true);
    try {
      const res = await feesService.getUnpaid();
      setUnpaidStudents(res.data || []);
      setShowUnpaidModal(true);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load unpaid students', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Fee
  const handleDeleteFee = async (fee: Fee) => {
    if (!window.confirm(`Delete fee for ${fee.studentName}?`)) return;
    try {
      await feesService.delete(fee._id);
      showToast('Fee deleted successfully');
      fetchFees();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to delete fee', 'error');
    }
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading fees...</p>
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-md max-w-md">
          <FaTimesCircle className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Failed to Load Fees</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={fetchFees} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`px-4 py-3 rounded-lg shadow-lg text-white flex items-center space-x-2 animate-slide-in ${
            toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
          }`}>
            {toast.type === 'success' && <FaCheckCircle />}
            {toast.type === 'error' && <FaTimesCircle />}
            {toast.type === 'info' && <FaFileAlt />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="w-full bg-blue-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <Link to="/dashboard" className="flex items-center text-blue-200 hover:text-white mb-4 transition-colors duration-300">
            <FaHome className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Fees Management</h1>
              <p className="text-blue-200">Manage student fees and payments</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleFetchUnpaid} className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center">
                <FaUserSlash className="mr-2" />
                Unpaid Students
              </button>
              <button onClick={() => setShowReportPrompt(true)} className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center">
                <FaFileAlt className="mr-2" />
                Monthly Report
              </button>
              <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center">
                <FaPlus className="mr-2" />
                Add Fee
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="w-full bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <FaDollarSign className="text-2xl text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-green-600">LKR {totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <FaClock className="text-2xl text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-yellow-600">LKR {pendingRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <FaReceipt className="text-2xl text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Partial Payments</p>
                  <p className="text-xl font-bold text-blue-600">LKR {partialRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center">
                <FaTimesCircle className="text-2xl text-red-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-xl font-bold text-red-600">{overdueCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="w-full bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
              <option value="Partial">Partial</option>
            </select>
            <select value={filterFeeType} onChange={(e) => setFilterFeeType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
              <option value="All">All Fee Types</option>
              <option value="Hostel Fee">Hostel Fee</option>
              <option value="Mess Fee">Mess Fee</option>
              <option value="Library Fee">Library Fee</option>
              <option value="Other">Other</option>
            </select>
            <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
              <option value="All">All Semesters</option>
              {semesters.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={() => { setSearchTerm(''); setFilterStatus('All'); setFilterFeeType('All'); setFilterSemester('All'); }} className="flex items-center justify-center bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-300">
              <FaFilter className="mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Fees Table */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (LKR)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No fees found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredFees.map((fee) => (
                      <tr key={fee._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                {fee.studentName.split(' ').map(n => n[0]).join('')}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{fee.studentName}</div>
                              <div className="text-sm text-gray-500">{fee.studentId} • {fee.room}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{fee.feeType}</div>
                          <div className="text-sm text-gray-500">{fee.semester}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">LKR {fee.amount.toLocaleString()}</div>
                          {fee.status === 'Partial' && (
                            <div className="text-xs text-gray-500">
                              Paid: LKR {(fee.paidAmount || 0).toLocaleString()} | Due: LKR {(fee.remainingAmount || 0).toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(fee.dueDate).toLocaleDateString()}</div>
                          {fee.status === 'Overdue' && (
                            <div className="text-xs text-red-600 font-medium">OVERDUE</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(fee.status)}
                            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(fee.status)}`}>
                              {fee.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {fee.paidDate ? (
                            <div>
                              <div className="text-sm text-gray-900">{new Date(fee.paidDate).toLocaleDateString()}</div>
                              <div className="text-sm text-gray-500">{fee.paymentMethod}</div>
                              {fee.transactionId && <div className="text-xs text-gray-500">{fee.transactionId}</div>}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">Not paid</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button onClick={() => setViewingFee(fee)} title="View Details" className="text-emerald-600 hover:text-emerald-900">
                              <FaEye />
                            </button>
                            {fee.status === 'Paid' && (
                              <button onClick={() => handleViewReceipt(fee)} title="View Receipt" className="text-green-600 hover:text-green-900">
                                <FaReceipt />
                              </button>
                            )}
                            {(fee.status === 'Pending' || fee.status === 'Overdue') && (
                              <button onClick={() => { setSelectedFee(fee); setPaymentForm(prev => ({ ...prev, paidAmount: fee.amount })); setShowPaymentModal(true); }} title="Record Payment" className="text-orange-600 hover:text-orange-900">
                                <FaDollarSign />
                              </button>
                            )}
                            <button onClick={() => handleDeleteFee(fee)} title="Delete Fee" className="text-red-500 hover:text-red-700">
                              <FaTimesCircle />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredFees.length} of {fees.length} fees
          </div>
        </div>
      </div>

      {/* View Fee Detail Modal */}
      {viewingFee && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Fee Details</h2>
              <button onClick={() => setViewingFee(null)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4 pb-4 border-b">
                <div className="h-14 w-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold">
                  {viewingFee.studentName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{viewingFee.studentName}</h3>
                  <p className="text-sm text-gray-500">{viewingFee.studentId} &bull; {viewingFee.room}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Fee Type</p>
                  <p className="text-gray-900">{viewingFee.feeType}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Semester</p>
                  <p className="text-gray-900">{viewingFee.semester}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Amount</p>
                  <p className="text-gray-900 font-semibold">LKR {viewingFee.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Due Date</p>
                  <p className="text-gray-900">{new Date(viewingFee.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Status</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${viewingFee.status === 'Paid' ? 'bg-green-100 text-green-800' : viewingFee.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : viewingFee.status === 'Partial' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                    {viewingFee.status}
                  </span>
                </div>
                {viewingFee.status === 'Partial' && (
                  <div>
                    <p className="text-gray-500 font-medium">Paid / Remaining</p>
                    <p className="text-gray-900">LKR {(viewingFee.paidAmount || 0).toLocaleString()} / LKR {(viewingFee.remainingAmount || 0).toLocaleString()}</p>
                  </div>
                )}
                {viewingFee.paidDate && (
                  <>
                    <div>
                      <p className="text-gray-500 font-medium">Paid Date</p>
                      <p className="text-gray-900">{new Date(viewingFee.paidDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Payment Method</p>
                      <p className="text-gray-900">{viewingFee.paymentMethod}</p>
                    </div>
                    {viewingFee.transactionId && (
                      <div className="col-span-2">
                        <p className="text-gray-500 font-medium">Transaction ID</p>
                        <p className="text-gray-900 font-mono">{viewingFee.transactionId}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button onClick={() => setViewingFee(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Close</button>
                {viewingFee.status === 'Paid' && (
                  <button onClick={() => { handleViewReceipt(viewingFee); setViewingFee(null); }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                    <FaReceipt className="mr-2" /> View Receipt
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Fee Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Add New Fee</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleAddFee} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                <input required value={addForm.studentName} onChange={e => setAddForm({ ...addForm, studentName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                  <input required value={addForm.studentId} onChange={e => setAddForm({ ...addForm, studentId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                  <input required value={addForm.room} onChange={e => setAddForm({ ...addForm, room: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
                <select required value={addForm.feeType} onChange={e => setAddForm({ ...addForm, feeType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                  <option value="Hostel Fee">Hostel Fee</option>
                  <option value="Mess Fee">Mess Fee</option>
                  <option value="Library Fee">Library Fee</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (LKR) — minimum 4,000</label>
                <input required type="number" min={4000} value={addForm.amount} onChange={e => setAddForm({ ...addForm, amount: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input required type="date" value={addForm.dueDate} onChange={e => setAddForm({ ...addForm, dueDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <input required placeholder="e.g. Spring 2026" value={addForm.semester} onChange={e => setAddForm({ ...addForm, semester: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center">
                  {actionLoading && <FaSpinner className="animate-spin mr-2" />}
                  Add Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Record Payment Modal ── */}
      {showPaymentModal && selectedFee && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Record Payment</h2>
              <button onClick={() => { setShowPaymentModal(false); setSelectedFee(null); }} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="px-6 pt-4 pb-2 bg-gray-50 border-b">
              <p className="text-sm text-gray-600">Student: <span className="font-medium">{selectedFee.studentName}</span></p>
              <p className="text-sm text-gray-600">Fee: <span className="font-medium">{selectedFee.feeType}</span> — LKR {selectedFee.amount.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Status: <span className={`font-medium ${selectedFee.status === 'Overdue' ? 'text-red-600' : 'text-yellow-600'}`}>{selectedFee.status}</span></p>
            </div>
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount (LKR)</label>
                  <input required type="number" min={1} max={selectedFee.amount} value={paymentForm.paidAmount} onChange={e => setPaymentForm({ ...paymentForm, paidAmount: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
                  <p className="text-xs text-gray-500 mt-1">Full amount: LKR {selectedFee.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paid Date</label>
                  <input required type="date" value={paymentForm.paidDate} onChange={e => setPaymentForm({ ...paymentForm, paidDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select required value={paymentForm.paymentMethod} onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                  <option value="Online Transfer">Online Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Deposit">Bank Deposit</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                <input required value={paymentForm.transactionId} onChange={e => setPaymentForm({ ...paymentForm, transactionId: e.target.value })} placeholder="e.g. TXN123456" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => { setShowPaymentModal(false); setSelectedFee(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center">
                  {actionLoading && <FaSpinner className="animate-spin mr-2" />}
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Receipt Modal ── */}
      {showReceiptModal && receipt && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Payment Receipt</h2>
              <button onClick={() => { setShowReceiptModal(false); setReceipt(null); }} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-3">
              <div className="text-center border-b pb-4">
                <p className="text-lg font-bold text-blue-900">Home Treats Hostel</p>
                <p className="text-sm text-gray-500">Payment Receipt</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Receipt No:</span><span className="font-medium">{receipt.receiptNo}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Student:</span><span className="font-medium">{receipt.studentName}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Student ID:</span><span className="font-medium">{receipt.studentId}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Fee Type:</span><span className="font-medium">{receipt.feeType}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Semester:</span><span className="font-medium">{receipt.semester}</span></div>
                <hr />
                <div className="flex justify-between text-base"><span className="text-gray-600 font-medium">Amount:</span><span className="font-bold text-green-700">LKR {receipt.amount.toLocaleString()}</span></div>
                <hr />
                <div className="flex justify-between"><span className="text-gray-600">Paid Date:</span><span className="font-medium">{new Date(receipt.paidDate).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Payment Method:</span><span className="font-medium">{receipt.paymentMethod}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Transaction ID:</span><span className="font-medium">{receipt.transactionId}</span></div>
              </div>
              <div className="text-xs text-gray-400 text-center pt-2">Generated: {new Date(receipt.generatedAt).toLocaleString()}</div>
              <div className="flex justify-end space-x-3 pt-4">
                <button onClick={() => { setShowReceiptModal(false); setReceipt(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Close</button>
                <button onClick={handleDownloadReceipt} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                  <FaFileAlt className="mr-2" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Monthly Report Prompt ── */}
      {showReportPrompt && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Monthly Report</h2>
              <button onClick={() => setShowReportPrompt(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input type="number" min={2020} max={2030} value={reportYear} onChange={e => setReportYear(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select value={reportMonth} onChange={e => setReportMonth(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button onClick={() => setShowReportPrompt(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleFetchReport} disabled={actionLoading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center">
                  {actionLoading && <FaSpinner className="animate-spin mr-2" />}
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Monthly Report Results Modal ── */}
      {showReportModal && reportData && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Monthly Report</h2>
              <button onClick={() => { setShowReportModal(false); setReportData(null); }} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Total Collected</p>
                  <p className="text-lg font-bold text-green-700">LKR {(reportData.totalCollected || 0).toLocaleString()}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Total Pending</p>
                  <p className="text-lg font-bold text-yellow-700">LKR {(reportData.totalPending || 0).toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Total Fees</p>
                  <p className="text-lg font-bold text-blue-700">{reportData.totalFees || 0}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Overdue</p>
                  <p className="text-lg font-bold text-red-700">{reportData.overdueCount || 0}</p>
                </div>
              </div>
              {reportData.byFeeType && (
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">By Fee Type</h3>
                  <div className="space-y-1">
                    {Object.entries(reportData.byFeeType).map(([type, val]: [string, any]) => (
                      <div key={type} className="flex justify-between text-sm">
                        <span className="text-gray-600">{type}</span>
                        <span className="font-medium">LKR {(typeof val === 'number' ? val : val?.total || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end pt-4">
                <button onClick={() => { setShowReportModal(false); setReportData(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Unpaid Students Modal ── */}
      {showUnpaidModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Unpaid Students</h2>
              <button onClick={() => setShowUnpaidModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-6">
              {unpaidStudents.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No unpaid students found.</p>
              ) : (
                <div className="space-y-3">
                  {unpaidStudents.map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{s.studentName || s.name}</p>
                        <p className="text-sm text-gray-500">{s.studentId} • {s.room}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">LKR {(s.totalDue || s.amount || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{s.feeType || 'Multiple'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end pt-4">
                <button onClick={() => setShowUnpaidModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesManagement;
