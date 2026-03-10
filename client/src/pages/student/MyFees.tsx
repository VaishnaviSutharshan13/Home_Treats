import { useState, useEffect } from 'react';
import {
  FaCircleCheck, FaClock, FaCalendarDays, FaFileLines, FaBars,
  FaMoneyBillWave, FaCreditCard, FaReceipt, FaTriangleExclamation,
  FaWallet, FaLandmark, FaBell, FaChevronLeft, FaDownload,
  FaXmark, FaCheckDouble, FaClockRotateLeft, FaMoneyBillTransfer,
} from 'react-icons/fa6';
import { useAuth } from '../../context/AuthContext';
import { feesService } from '../../services';
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
  status: string;
  paidDate: string | null;
  paymentMethod: string | null;
  transactionId: string | null;
  semester: string;
  academicYear?: string;
  paidAmount?: number;
  remainingAmount?: number;
  createdAt?: string;
}

interface Receipt {
  receiptNo: string;
  studentName: string;
  studentId: string;
  room: string;
  feeType: string;
  totalAmount: number;
  paidAmount: number;
  paidDate: string;
  paymentMethod: string;
  transactionId: string;
  semester: string;
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

const MyFees = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);

  useEffect(() => { fetchFees(); }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      setError('');
      if (user?.studentId) {
        const res = await feesService.getByStudent(user.studentId);
        if (res.success) setFees(res.data || []);
      }
    } catch (err) {
      setError('Failed to load fee information');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = async (feeId: string) => {
    try {
      setReceiptLoading(true);
      const res = await feesService.getReceipt(feeId);
      if (res.success) {
        setReceipt(res.data);
        setShowReceipt(true);
      }
    } catch (err) {
      console.error('Failed to load receipt');
    } finally {
      setReceiptLoading(false);
    }
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
      `Payment Date,${new Date(receipt.paidDate).toLocaleDateString()}`,
      `Payment Method,${receipt.paymentMethod}`,
      `Transaction ID,${receipt.transactionId}`,
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${receipt.receiptNo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate statistics
  const totalPaid = fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
  const pendingFees = fees.filter(f => f.status === 'Pending' || f.status === 'Overdue');
  const totalPending = pendingFees.reduce((sum, f) => sum + (f.remainingAmount || f.amount), 0);
  const nextDueFee = pendingFees.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
  
  // Current fee (most recent pending/overdue or latest fee)
  const currentFee = pendingFees[0] || fees[fees.length - 1];

  // Payment timeline (sorted by date)
  const timeline = [...fees]
    .sort((a, b) => new Date(b.createdAt || b.dueDate).getTime() - new Date(a.createdAt || a.dueDate).getTime())
    .slice(0, 5);

  // Notifications
  const notifications = [
    ...fees.filter(f => f.status === 'Overdue').map(f => ({
      type: 'error',
      message: `Overdue Payment: ${f.feeType} - LKR ${f.amount.toLocaleString()}`,
    })),
    ...fees.filter(f => {
      const daysUntilDue = Math.ceil((new Date(f.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return f.status === 'Pending' && daysUntilDue <= 7 && daysUntilDue > 0;
    }).map(f => ({
      type: 'warning',
      message: `Payment Due Soon: ${f.feeType} - Due ${new Date(f.dueDate).toLocaleDateString()}`,
    })),
    ...fees.filter(f => f.status === 'Paid' && f.paidDate && 
      (Date.now() - new Date(f.paidDate).getTime()) < 7 * 24 * 60 * 60 * 1000
    ).map(f => ({
      type: 'success',
      message: `Payment Confirmed: ${f.feeType} - LKR ${f.amount.toLocaleString()}`,
    })),
  ].slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} userRole="student" />

      <div className="lg:ml-64">
        {/* Header */}
        <div className="bg-white border-b border-purple-100 shadow-sm">
          <div className="w-full px-6 sm:px-8 lg:px-10 py-6">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-purple-50">
                <FaBars className="w-5 h-5" />
              </button>
              <button className="inline-flex items-center gap-1.5 text-gray-500 hover:text-purple-600 text-sm">
                <FaChevronLeft className="w-3 h-3" />
                <span>Dashboard</span>
                <span className="text-gray-400 mx-0.5">/</span>
                <span className="text-purple-600 font-medium">My Hostel Fees</span>
              </button>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                  <FaMoneyBillWave className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Hostel Fees</h1>
                </div>
              </div>
              <p className="text-gray-600">View your hostel fee status, payment history, and upcoming payments</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-700 text-lg font-semibold">Loading your fees...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center bg-white border border-red-500/20 p-10 rounded-2xl shadow-xl max-w-md mx-4">
              <FaTriangleExclamation className="text-5xl text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load</h2>
              <p className="text-gray-500 mb-6">{error}</p>
              <button onClick={fetchFees} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold">
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full px-6 sm:px-8 lg:px-10 py-8">
            {fees.length === 0 ? (
              // Empty State
              <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-12 text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaFileLines className="text-4xl text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Payment Records Yet</h2>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  Your hostel fees will appear here once generated. Payment records will be visible after room booking confirmation.
                </p>
                <div className="flex items-center justify-center gap-2 text-purple-600 text-sm font-medium">
                  <FaClock className="w-4 h-4" />
                  <span>Waiting for fee generation...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      label: 'Total Paid',
                      value: `LKR ${totalPaid.toLocaleString()}`,
                      count: fees.filter(f => f.status === 'Paid').length,
                      icon: FaCircleCheck,
                      color: 'green',
                      bgGradient: 'from-green-500 to-green-600',
                    },
                    {
                      label: 'Pending Amount',
                      value: `LKR ${totalPending.toLocaleString()}`,
                      count: pendingFees.length,
                      icon: FaClock,
                      color: 'yellow',
                      bgGradient: 'from-yellow-500 to-yellow-600',
                    },
                    {
                      label: 'Next Due Payment',
                      value: nextDueFee ? new Date(nextDueFee.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None',
                      count: nextDueFee ? `LKR ${nextDueFee.amount.toLocaleString()}` : 'All clear',
                      icon: FaCalendarDays,
                      color: 'purple',
                      bgGradient: 'from-purple-500 to-purple-600',
                    },
                    {
                      label: 'Total Fee Records',
                      value: fees.length.toString(),
                      count: `${fees.filter(f => f.status === 'Paid').length} paid`,
                      icon: FaFileLines,
                      color: 'blue',
                      bgGradient: 'from-blue-500 to-blue-600',
                    },
                  ].map((card) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.label}
                        className={`bg-white rounded-2xl p-6 shadow-lg border border-${card.color}-100 hover:shadow-xl transition-all hover:-translate-y-1`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${card.bgGradient} rounded-xl flex items-center justify-center shadow-lg`}>
                            <Icon className="text-2xl text-white" />
                          </div>
                        </div>
                        <h3 className="text-gray-600 text-sm font-medium mb-1">{card.label}</h3>
                        <p className={`text-2xl font-bold text-gray-900 mb-1`}>{card.value}</p>
                        <p className="text-sm text-gray-500">{card.count}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Current Payment Status Card */}
                {currentFee && (
                  <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 shadow-xl text-white">
                    <div className="flex items-center gap-2 mb-6">
                      <FaCheckDouble className="text-2xl" />
                      <h2 className="text-2xl font-bold">Current Payment Status</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-purple-200 text-sm mb-1">Room Number</p>
                        <p className="text-xl font-semibold">{currentFee.room}</p>
                      </div>
                      <div>
                        <p className="text-purple-200 text-sm mb-1">Floor</p>
                        <p className="text-xl font-semibold">{currentFee.floor || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-purple-200 text-sm mb-1">Fee Type</p>
                        <p className="text-xl font-semibold">{currentFee.feeType}</p>
                      </div>
                      <div>
                        <p className="text-purple-200 text-sm mb-1">Amount</p>
                        <p className="text-2xl font-bold">LKR {currentFee.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-purple-200 text-sm mb-1">Due Date</p>
                        <p className="text-xl font-semibold">{new Date(currentFee.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-purple-200 text-sm mb-1">Payment Status</p>
                        <span
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold ${
                            currentFee.status === 'Paid'
                              ? 'bg-green-500 text-white'
                              : currentFee.status === 'Pending'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {currentFee.status === 'Paid' ? <FaCircleCheck /> : currentFee.status === 'Pending' ? <FaClock /> : <FaTriangleExclamation />}
                          {currentFee.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {(currentFee.status === 'Pending' || currentFee.status === 'Overdue' || currentFee.status === 'Partial') && (
                        <button className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-purple-50 shadow-lg">
                          <FaCreditCard className="w-5 h-5" />
                          Pay Now
                        </button>
                      )}
                      {(currentFee.status === 'Paid' || currentFee.status === 'Partial') && (
                        <button
                          onClick={() => handleViewReceipt(currentFee._id)}
                          disabled={receiptLoading}
                          className="bg-purple-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-purple-900 shadow-lg disabled:opacity-50"
                        >
                          <FaReceipt className="w-5 h-5" />
                          {receiptLoading ? 'Loading...' : 'Download Receipt'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment History Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <FaClockRotateLeft className="text-purple-600 text-xl" />
                      <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
                    </div>
                    <p className="text-sm text-gray-500">Complete record of all hostel fee transactions</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-purple-50 border-b border-purple-100">
                        <tr>
                          {['Fee Type', 'Amount', 'Due Date', 'Payment Date', 'Payment Method', 'Status', 'Receipt', 'Actions'].map((h) => (
                            <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {fees.map((fee) => {
                          const StatusIconComponent = statusIcon[fee.status];
                          return (
                            <tr key={fee._id} className="hover:bg-purple-50/50">
                              <td className="px-6 py-4">
                                <p className="font-semibold text-gray-900">{fee.feeType}</p>
                                <p className="text-sm text-gray-500">{fee.semester}</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-semibold text-gray-900">LKR {fee.amount.toLocaleString()}</p>
                                {fee.status === 'Partial' && fee.remainingAmount && (
                                  <p className="text-xs text-gray-500">Remaining: LKR {fee.remainingAmount.toLocaleString()}</p>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm text-gray-900">{new Date(fee.dueDate).toLocaleDateString()}</p>
                              </td>
                              <td className="px-6 py-4">
                                {fee.paidDate ? (
                                  <p className="text-sm text-gray-900">{new Date(fee.paidDate).toLocaleDateString()}</p>
                                ) : (
                                  <span className="text-sm text-gray-400">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {fee.paymentMethod ? (
                                  <>
                                    <p className="text-sm text-gray-900">{fee.paymentMethod}</p>
                                    {fee.transactionId && <p className="text-xs text-gray-500">{fee.transactionId}</p>}
                                  </>
                                ) : (
                                  <span className="text-sm text-gray-400">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusBadge[fee.status]}`}>
                                  <StatusIconComponent className="w-3 h-3" />
                                  {fee.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {(fee.status === 'Paid' || fee.status === 'Partial') ? (
                                  <button
                                    onClick={() => handleViewReceipt(fee._id)}
                                    disabled={receiptLoading}
                                    className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-sm font-medium disabled:opacity-50"
                                  >
                                    <FaReceipt className="w-3 h-3" />
                                    View
                                  </button>
                                ) : (
                                  <span className="text-sm text-gray-400">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {(fee.status === 'Pending' || fee.status === 'Overdue' || fee.status === 'Partial') && (
                                  <button className="text-green-600 hover:text-green-800 flex items-center gap-1 text-sm font-medium">
                                    <FaCreditCard className="w-3 h-3" />
                                    Pay
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Payment Timeline */}
                  <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <FaClockRotateLeft className="text-purple-600 text-xl" />
                      <h2 className="text-xl font-semibold text-gray-900">Payment Timeline</h2>
                    </div>
                    <div className="space-y-4">
                      {timeline.map((fee, index) => {
                        const StatusIconComponent = statusIcon[fee.status];
                        return (
                          <div key={fee._id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  fee.status === 'Paid'
                                    ? 'bg-green-100 text-green-600'
                                    : fee.status === 'Pending'
                                    ? 'bg-yellow-100 text-yellow-600'
                                    : 'bg-red-100 text-red-600'
                                }`}
                              >
                                <StatusIconComponent className="w-5 h-5" />
                              </div>
                              {index < timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-2" />}
                            </div>
                            <div className="flex-1 pb-4">
                              <p className="font-semibold text-gray-900">{fee.feeType}</p>
                              <p className="text-sm text-gray-500">
                                {fee.semester} • {new Date(fee.paidDate || fee.dueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </p>
                              <p className="text-sm font-medium text-purple-600 mt-1">LKR {fee.amount.toLocaleString()}</p>
                              <span
                                className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${
                                  fee.status === 'Paid'
                                    ? 'bg-green-100 text-green-700'
                                    : fee.status === 'Pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {fee.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="space-y-6">
                    {/* Payment Methods */}
                    <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <FaCreditCard className="text-purple-600 text-xl" />
                        <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { name: 'Cash Payment', icon: FaWallet, color: 'green' },
                          { name: 'Bank Transfer', icon: FaLandmark, color: 'blue' },
                          { name: 'Online Payment', icon: FaCreditCard, color: 'purple' },
                        ].map((method) => {
                          const Icon = method.icon;
                          return (
                            <div
                              key={method.name}
                              className={`flex items-center gap-3 p-4 bg-${method.color}-50 border border-${method.color}-200 rounded-xl hover:shadow-md transition-shadow`}
                            >
                              <div className={`w-10 h-10 bg-${method.color}-100 rounded-lg flex items-center justify-center`}>
                                <Icon className={`text-${method.color}-600 text-lg`} />
                              </div>
                              <span className="font-medium text-gray-900">{method.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <FaBell className="text-purple-600 text-xl" />
                        <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="text-center py-8">
                          <FaBell className="text-4xl text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">No new notifications</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {notifications.map((notif, index) => (
                            <div
                              key={index}
                              className={`p-4 rounded-xl border ${
                                notif.type === 'error'
                                  ? 'bg-red-50 border-red-200'
                                  : notif.type === 'warning'
                                  ? 'bg-yellow-50 border-yellow-200'
                                  : 'bg-green-50 border-green-200'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {notif.type === 'error' ? (
                                  <FaTriangleExclamation className="text-red-600 text-lg mt-0.5" />
                                ) : notif.type === 'warning' ? (
                                  <FaClock className="text-yellow-600 text-lg mt-0.5" />
                                ) : (
                                  <FaCircleCheck className="text-green-600 text-lg mt-0.5" />
                                )}
                                <p className="text-sm text-gray-700 flex-1">{notif.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceipt && receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-br from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaReceipt className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Payment Receipt</h3>
                    <p className="text-purple-200 text-sm">{receipt.receiptNo}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center"
                >
                  <FaXmark className="text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Student Name</p>
                    <p className="font-semibold text-gray-900">{receipt.studentName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Student ID</p>
                    <p className="font-semibold text-gray-900">{receipt.studentId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Room</p>
                    <p className="font-semibold text-gray-900">{receipt.room}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Semester</p>
                    <p className="font-semibold text-gray-900">{receipt.semester}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 py-4 border-y border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee Type</span>
                  <span className="font-medium text-gray-900">{receipt.feeType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-semibold text-gray-900">LKR {receipt.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid Amount</span>
                  <span className="font-bold text-green-600">LKR {receipt.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Date</span>
                  <span className="font-medium text-gray-900">{new Date(receipt.paidDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium text-gray-900">{receipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="font-mono text-sm text-gray-900">{receipt.transactionId}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDownloadReceipt}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  <FaDownload className="w-4 h-4" />
                  Download CSV
                </button>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFees;
