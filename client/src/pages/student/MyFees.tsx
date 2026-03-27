import { useState, useEffect } from 'react';
import { FaDollarSign, FaReceipt, FaCheckCircle, FaClock, FaTimesCircle, FaSpinner, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { feesService } from '../../services';
import Sidebar from '../../components/layout/Sidebar';

interface Fee {
  _id: string;
  studentName: string;
  studentId: string;
  room: string;
  feeType: string;
  amount: number;
  dueDate: string;
  status: string;
  paidDate: string | null;
  paymentMethod: string | null;
  transactionId: string | null;
  semester: string;
  paidAmount?: number;
  remainingAmount?: number;
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

const MyFees = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);

  useEffect(() => {
    fetchFees();
  }, []);

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

  const formatLKR = (amount: number) => `LKR ${amount.toLocaleString()}`;

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

  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.feeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.semester.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || fee.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPending = fees.filter(f => f.status === 'Pending' || f.status === 'Overdue').reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-purple-100 text-purple-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Partial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return <FaCheckCircle className="text-purple-600" />;
      case 'Pending': return <FaClock className="text-yellow-600" />;
      case 'Overdue': return <FaTimesCircle className="text-red-600" />;
      default: return <FaClock className="text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} userRole="student" />

      <div className="lg:ml-64">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Fees</h1>
              <p className="text-gray-500 text-sm mt-1">View your fee records and payment history</p>
            </div>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FaSpinner className="animate-spin text-4xl text-indigo-600" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={fetchFees} className="px-4 py-2 bg-indigo-600 text-gray-900 rounded-lg hover:bg-indigo-700">Retry</button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FaCheckCircle className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Paid</p>
                      <p className="text-xl font-bold text-purple-600">{formatLKR(totalPaid)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <FaClock className="text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pending Amount</p>
                      <p className="text-xl font-bold text-yellow-600">{formatLKR(totalPending)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaDollarSign className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Records</p>
                      <p className="text-xl font-bold text-blue-600">{fees.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by fee type or semester..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>

              {/* Fee Records */}
              {filteredFees.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
                  <FaDollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">No fee records found</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredFees.map((fee) => (
                          <tr key={fee._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{fee.feeType}</div>
                              <div className="text-xs text-gray-500">{fee.semester}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-gray-900">{formatLKR(fee.amount)}</div>
                              {fee.status === 'Partial' && fee.remainingAmount && (
                                <div className="text-xs text-gray-500">Remaining: {formatLKR(fee.remainingAmount)}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {new Date(fee.dueDate).toLocaleDateString()}
                              {fee.status === 'Overdue' && (
                                <div className="text-xs text-red-600 font-semibold">OVERDUE</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(fee.status)}
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(fee.status)}`}>
                                  {fee.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {fee.paidDate ? (
                                <div>
                                  <div className="text-gray-900">{new Date(fee.paidDate).toLocaleDateString()}</div>
                                  <div className="text-gray-500 text-xs">{fee.paymentMethod}</div>
                                </div>
                              ) : (
                                <span className="text-gray-500">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {fee.status === 'Paid' && (
                                <button
                                  onClick={() => handleViewReceipt(fee._id)}
                                  disabled={receiptLoading}
                                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                                >
                                  <FaReceipt className="w-3 h-3" />
                                  Receipt
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Receipt Modal */}
        {showReceipt && receipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
              <div className="text-center mb-6">
                <FaReceipt className="w-10 h-10 text-purple-600 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-gray-800">Payment Receipt</h3>
                <p className="text-sm text-gray-500">{receipt.receiptNo}</p>
              </div>
              <div className="space-y-3 border-t border-b py-4 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Student</span>
                  <span className="font-medium">{receipt.studentName} ({receipt.studentId})</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fee Type</span>
                  <span className="font-medium">{receipt.feeType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Semester</span>
                  <span className="font-medium">{receipt.semester}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-purple-600">{receipt.currency} {receipt.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment Date</span>
                  <span className="font-medium">{new Date(receipt.paidDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium">{receipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-medium text-xs">{receipt.transactionId}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mb-4">
                Generated: {new Date(receipt.generatedAt).toLocaleString()}
              </p>
              <button
                onClick={() => setShowReceipt(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFees;
