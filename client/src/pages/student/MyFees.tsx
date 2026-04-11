import { useEffect, useMemo, useState } from 'react';
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaCloudUploadAlt,
  FaFilePdf,
  FaMoneyBillWave,
  FaSpinner,
  FaTimes,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { feesService, paymentService } from '../../services';
import Sidebar from '../../components/layout/Sidebar';

interface Fee {
  _id: string;
  studentName: string;
  studentId: string;
  room: string;
  feeType: string;
  amount: number;
  paidAmount?: number;
  remainingAmount?: number;
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

interface Payment {
  _id: string;
  bankName: 'BOC' | 'HNB';
  accountHolder: string;
  transactionId: string;
  paymentDate: string;
  amount: number;
  slipUrl: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

interface PaymentForm {
  bankName: '' | 'BOC' | 'HNB';
  accountHolder: string;
  transactionId: string;
  paymentDate: string;
  amount: string;
  slip: File | null;
}

interface PaymentErrors {
  bankName?: string;
  accountHolder?: string;
  transactionId?: string;
  paymentDate?: string;
  amount?: string;
  slip?: string;
  general?: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const MyFees = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fees, setFees] = useState<Fee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [form, setForm] = useState<PaymentForm>({
    bankName: '',
    accountHolder: '',
    transactionId: '',
    paymentDate: '',
    amount: '',
    slip: null,
  });
  const [errors, setErrors] = useState<PaymentErrors>({});

  const apiOrigin = useMemo(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace(/\/api\/?$/, '');
  }, []);

  const getStudentId = () => {
    if (user?.studentId) return user.studentId;
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    return localUser?.studentId || '';
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2600);
  };

  const getDueAmount = (fee: Fee) => {
    const remaining = Number(fee.remainingAmount);
    if (Number.isFinite(remaining) && remaining >= 0) return remaining;
    const due = Number(fee.amount || 0) - Number(fee.paidAmount || 0);
    return Math.max(due, 0);
  };

  const getEffectiveStatus = (fee: Fee): 'Paid' | 'Pending' | 'Overdue' | 'Partial' => {
    const status = String(fee.paymentStatus || fee.status || '').toLowerCase();
    if (status === 'paid') return 'Paid';
    if (status === 'partial') return 'Partial';

    const due = new Date(fee.dueDate);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today ? 'Overdue' : 'Pending';
  };

  const loadStudentFees = async () => {
    try {
      const studentId = getStudentId();
      if (!studentId) return;
      const res = await feesService.getByStudent(studentId);
      setFees(res.data || []);
    } catch (_err) {
      showToast('error', 'Failed to load fees');
    }
  };

  const loadPaymentHistory = async () => {
    try {
      const res = await paymentService.getStudent();
      setPayments(res.data || []);
    } catch (_err) {
      showToast('error', 'Failed to load payment history');
    }
  };

  useEffect(() => {
    if (user?.studentId) {
      fetchFees();
    }
  }, [user?.studentId]);

  const fetchFees = async () => {
    if (!user?.studentId) {
      setError('User information not available');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await feesService.getByStudent(user.studentId);
      if (res.success) setFees(res.data || []);
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
      case 'Paid': return 'bg-surface-active text-primary';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-error/10 text-error';
      case 'Partial': return 'bg-info/10 text-info';
      default: return 'bg-gray-100 text-foreground/90';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return <FaCheckCircle className="text-primary" />;
      case 'Pending': return <FaClock className="text-yellow-600" />;
      case 'Overdue': return <FaTimesCircle className="text-error" />;
      default: return <FaClock className="text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} userRole="student" />

      <div className="lg:ml-64">
        <header className="bg-navbar shadow-sm border-b border-border px-6 py-4 sticky top-0 z-10 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground/90">My Fees</h1>
              <p className="text-muted-foreground text-sm mt-1">View your fee records and payment history</p>
            </div>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FaSpinner className="animate-spin text-4xl text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-error mb-4">{error}</p>
              <button onClick={fetchFees} className="px-4 py-2 rounded-lg shadow-sm bg-gradient-to-r from-primary to-primary-hover text-primary-foreground transform hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-300">Retry</button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card rounded-xl shadow-sm border p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-active rounded-lg flex items-center justify-center">
                      <FaCheckCircle className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Paid</p>
                      <p className="text-xl font-bold text-primary">{formatLKR(totalPaid)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-xl shadow-sm border p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <FaClock className="text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Amount</p>
                      <p className="text-xl font-bold text-yellow-600">{formatLKR(totalPending)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-xl shadow-sm border p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                      <FaDollarSign className="text-info" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Records</p>
                      <p className="text-xl font-bold text-info">{fees.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by fee type or semester..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg py-2 pl-10 pr-4 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg px-4 py-2 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
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
                <div className="text-center py-12 bg-card rounded-xl shadow-sm border">
                  <FaDollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No fee records found</p>
                </div>
              ) : (
                <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Fee Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Due Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Payment</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredFees.map((fee) => (
                          <tr key={fee._id} className="hover:bg-muted/70">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-foreground">{fee.feeType}</div>
                              <div className="text-xs text-muted-foreground">{fee.semester}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-foreground">{formatLKR(fee.amount)}</div>
                              {fee.status === 'Partial' && fee.remainingAmount && (
                                <div className="text-xs text-muted-foreground">Remaining: {formatLKR(fee.remainingAmount)}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-foreground">
                              {new Date(fee.dueDate).toLocaleDateString()}
                              {fee.status === 'Overdue' && (
                                <div className="text-xs text-error font-semibold">OVERDUE</div>
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
                                  <div className="text-foreground">{new Date(fee.paidDate).toLocaleDateString()}</div>
                                  <div className="text-muted-foreground text-xs">{fee.paymentMethod}</div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {fee.status === 'Paid' && (
                                <button
                                  onClick={() => handleViewReceipt(fee._id)}
                                  disabled={receiptLoading}
                                  className="text-info hover:text-info flex items-center gap-1 text-sm"
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
            <div className="bg-card rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
              <div className="text-center mb-6">
                <FaReceipt className="w-10 h-10 text-primary mx-auto mb-2" />
                <h3 className="text-xl font-bold text-foreground/90">Payment Receipt</h3>
                <p className="text-sm text-muted-foreground">{receipt.receiptNo}</p>
              </div>
              <div className="space-y-3 border-t border-b py-4 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Student</span>
                  <span className="font-medium">{receipt.studentName} ({receipt.studentId})</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fee Type</span>
                  <span className="font-medium">{receipt.feeType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Semester</span>
                  <span className="font-medium">{receipt.semester}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-primary">{receipt.currency} {receipt.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Date</span>
                  <span className="font-medium">{new Date(receipt.paidDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium">{receipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-medium text-xs">{receipt.transactionId}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mb-4">
                Generated: {new Date(receipt.generatedAt).toLocaleString()}
              </p>
              <button
                onClick={() => setShowReceipt(false)}
                className="w-full px-4 py-2 bg-gray-100 text-foreground/90 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 bg-card/85 backdrop-blur-sm rounded-2xl border border-border shadow-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground/90">Payment History</h2>
            {paymentsLoading && <FaSpinner className="animate-spin text-secondary" />}
          </div>

          {paymentsLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading payment history...</div>
          ) : payments.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No payments submitted yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Bank</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Slip</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-secondary/10/40">
                      <td className="px-4 py-3 text-sm font-medium text-foreground/90">{payment.transactionId}</td>
                      <td className="px-4 py-3 text-sm text-foreground/90">{payment.bankName}</td>
                      <td className="px-4 py-3 text-sm text-foreground/90">LKR {Number(payment.amount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-foreground/90">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <a
                          href={formatSlipUrl(payment.slipUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:text-primary-hover underline"
                        >
                          View Slip
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            payment.status === 'Approved'
                              ? 'bg-primary/10 text-primary'
                              : payment.status === 'Rejected'
                                ? 'bg-error/10 text-error'
                                : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedFee && (
        <div className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-2xl bg-card/90 backdrop-blur-md rounded-3xl border border-white shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground/90">Submit Payment Proof</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Due amount: LKR {getDueAmount(selectedFee).toLocaleString()} | {selectedFee.feeType}
                </p>
              </div>
              <button onClick={closePaymentModal} className="p-2 text-muted-foreground hover:text-foreground/90 rounded-lg hover:bg-muted">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-foreground/90 mb-1.5">Bank Selection</label>
                <select
                  value={form.bankName}
                  onChange={(e) => setForm((prev) => ({ ...prev, bankName: e.target.value as PaymentForm['bankName'] }))}
                  className="w-full rounded-xl px-4 py-3 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                >
                  <option value="">Select bank</option>
                  <option value="BOC">Bank of Ceylon (BOC)</option>
                  <option value="HNB">Hatton National Bank (HNB)</option>
                </select>
                {errors.bankName && <p className="text-error text-xs mt-1">{errors.bankName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/90 mb-1.5">Account Holder Name</label>
                <input
                  type="text"
                  value={form.accountHolder}
                  onChange={(e) => setForm((prev) => ({ ...prev, accountHolder: e.target.value }))}
                  placeholder="Enter account holder name"
                  className="w-full rounded-xl px-4 py-3 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                />
                {errors.accountHolder && <p className="text-error text-xs mt-1">{errors.accountHolder}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/90 mb-1.5">Transaction Reference Number</label>
                <input
                  type="text"
                  value={form.transactionId}
                  onChange={(e) => setForm((prev) => ({ ...prev, transactionId: e.target.value }))}
                  placeholder="e.g., TXN-2026-12345"
                  className="w-full rounded-xl px-4 py-3 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                />
                {errors.transactionId && <p className="text-error text-xs mt-1">{errors.transactionId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/90 mb-1.5">Payment Date</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-4 top-4 text-gray-400" />
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={form.paymentDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, paymentDate: e.target.value }))}
                    className="w-full rounded-xl py-3 pl-11 pr-4 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                  />
                </div>
                {errors.paymentDate && <p className="text-error text-xs mt-1">{errors.paymentDate}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground/90 mb-1.5">Amount Paid (LKR)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder={`Max LKR ${getDueAmount(selectedFee).toLocaleString()}`}
                  className="w-full rounded-xl px-4 py-3 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                />
                {errors.amount && <p className="text-error text-xs mt-1">{errors.amount}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground/90 mb-1.5">Upload Bank Slip</label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const dropped = e.dataTransfer.files?.[0] || null;
                    onFilePicked(dropped);
                  }}
                  className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${
                    dragActive ? 'border-primary bg-secondary/10' : 'border-border bg-muted'
                  }`}
                >
                  <input
                    id="slip-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className=" bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                    onChange={(e) => onFilePicked(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="slip-upload" className="cursor-pointer block">
                    <FaCloudUploadAlt className="mx-auto text-3xl text-secondary mb-2" />
                    <p className="text-sm font-medium text-foreground/90">Drop your file here, or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">{acceptedFileInfo}</p>
                    {form.slip?.type === 'application/pdf' && <FaFilePdf className="mx-auto mt-3 text-error" />}
                  </label>
                </div>
                {errors.slip && <p className="text-error text-xs mt-1">{errors.slip}</p>}
              </div>

              {errors.general && <p className="md:col-span-2 text-error text-sm">{errors.general}</p>}

              <div className="md:col-span-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-1">
                <button
                  type="button"
                  onClick={closePaymentModal}
                  className="px-5 py-3 rounded-xl border border-border text-foreground/90 font-medium hover:bg-muted/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitDisabled}
                  className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-secondary via-primary to-accent shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <FaSpinner className="animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    'Submit Payment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFees;
