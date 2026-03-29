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
  feeType: string;
  amount: number;
  paidAmount?: number;
  remainingAmount?: number;
  dueDate: string;
  status: string;
  paymentStatus?: string;
  notes?: string;
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
    const fetchFees = async () => {
      try {
        setLoading(true);
        setPaymentsLoading(true);
        await Promise.all([loadStudentFees(), loadPaymentHistory()]);
      } catch (_err) {
        showToast('error', 'Failed to load fee details');
      } finally {
        setLoading(false);
        setPaymentsLoading(false);
      }
    };

    fetchFees();
  }, [user]);

  const resetForm = () => {
    setForm({
      bankName: '',
      accountHolder: '',
      transactionId: '',
      paymentDate: '',
      amount: '',
      slip: null,
    });
    setErrors({});
    setDragActive(false);
  };

  const openPaymentModal = (fee: Fee) => {
    const due = getDueAmount(fee);
    setSelectedFee(fee);
    setShowModal(true);
    setForm({
      bankName: '',
      accountHolder: '',
      transactionId: '',
      paymentDate: '',
      amount: due ? String(due) : '',
      slip: null,
    });
    setErrors({});
  };

  const closePaymentModal = () => {
    setShowModal(false);
    setSelectedFee(null);
    resetForm();
  };

  const validateForm = (payload: PaymentForm, fee: Fee | null): PaymentErrors => {
    const nextErrors: PaymentErrors = {};
    const dueAmount = fee ? getDueAmount(fee) : 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!payload.bankName) {
      nextErrors.bankName = 'Please select your bank';
    }

    if (!payload.accountHolder.trim()) {
      nextErrors.accountHolder = 'Account holder name is required';
    }

    const transaction = payload.transactionId.trim();
    if (!transaction) {
      nextErrors.transactionId = 'Transaction reference number is required';
    }

    if (!payload.paymentDate) {
      nextErrors.paymentDate = 'Payment date is required';
    } else {
      const parsedDate = new Date(payload.paymentDate);
      if (Number.isNaN(parsedDate.getTime())) {
        nextErrors.paymentDate = 'Invalid payment date';
      } else {
        parsedDate.setHours(0, 0, 0, 0);
        if (parsedDate > today) {
          nextErrors.paymentDate = 'Payment date cannot be a future date';
        }
      }
    }

    const amount = Number(payload.amount);
    if (!payload.amount || !Number.isFinite(amount)) {
      nextErrors.amount = 'Amount is required';
    } else if (amount <= 0) {
      nextErrors.amount = 'Amount must be greater than 0';
    } else if (amount > dueAmount) {
      nextErrors.amount = `Amount cannot exceed due amount (LKR ${dueAmount.toLocaleString()})`;
    }

    if (!payload.slip) {
      nextErrors.slip = 'Please upload the bank slip';
    } else {
      if (!ALLOWED_TYPES.includes(payload.slip.type)) {
        nextErrors.slip = 'Only JPG, PNG, or PDF files are allowed';
      } else if (payload.slip.size > MAX_FILE_SIZE) {
        nextErrors.slip = 'File size must be 2MB or less';
      }
    }

    return nextErrors;
  };

  useEffect(() => {
    if (!showModal || !selectedFee) return;
    setErrors(validateForm(form, selectedFee));
  }, [form, showModal, selectedFee]);

  const onFilePicked = (file: File | null) => {
    setForm((prev) => ({ ...prev, slip: file }));
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;

    const currentErrors = validateForm(form, selectedFee);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;

    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append('feeId', selectedFee._id);
      payload.append('bankName', form.bankName);
      payload.append('accountHolder', form.accountHolder.trim());
      payload.append('transactionId', form.transactionId.trim());
      payload.append('paymentDate', form.paymentDate);
      payload.append('amount', String(Number(form.amount)));
      payload.append('slip', form.slip as File);

      await paymentService.create(payload);
      showToast('success', 'Payment submitted successfully');
      closePaymentModal();
      setLoading(true);
      setPaymentsLoading(true);
      await Promise.all([loadStudentFees(), loadPaymentHistory()]);
      setLoading(false);
      setPaymentsLoading(false);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to submit payment';
      if (String(message).toLowerCase().includes('transaction')) {
        setErrors((prev) => ({ ...prev, transactionId: message }));
      } else {
        setErrors((prev) => ({ ...prev, general: message }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const submitDisabled = !selectedFee || Object.keys(validateForm(form, selectedFee)).length > 0 || submitting;

  const acceptedFileInfo = form.slip
    ? `${form.slip.name} (${(form.slip.size / 1024 / 1024).toFixed(2)} MB)`
    : 'JPG, PNG, or PDF up to 2MB';


  const formatSlipUrl = (slipUrl: string) => {
    if (!slipUrl) return '#';
    if (slipUrl.startsWith('http')) return slipUrl;
    return `${apiOrigin}${slipUrl}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50 flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} userRole="student" />

      <div className="flex-1 lg:ml-64 p-8">
        {toast && (
          <div
            className={`fixed top-5 right-5 z-[70] px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white ${
              toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            }`}
          >
            {toast.message}
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Fees</h1>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading fees...</div>
        ) : fees.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-100 shadow-sm text-center">
            <p className="text-gray-500 text-lg">No fees assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {fees.map((fee) => {
              const effectiveStatus = getEffectiveStatus(fee);
              const dueAmount = getDueAmount(fee);
              const isSettled = dueAmount <= 0 || effectiveStatus === 'Paid';
              return (
              <div 
                key={fee._id} 
                className={`backdrop-blur-sm bg-white/85 rounded-2xl shadow-xl border p-6 flex flex-col justify-between ${
                  isSettled ? 'border-green-100' : 'border-amber-100'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${
                      isSettled ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {isSettled ? <FaCheckCircle /> : <FaClock />}
                      {effectiveStatus}
                    </span>
                    <span className="text-sm font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">
                      {fee.feeType}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Outstanding Amount</p>
                    <p className="text-3xl font-bold text-gray-800">
                      LKR {dueAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Total fee: LKR {Number(fee.amount || 0).toLocaleString()}</p>
                  </div>

                  <div className="space-y-2 mt-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Due Date</span>
                      <span className="font-medium text-gray-800">
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    {fee.notes && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Note</span>
                        <span className="font-medium text-gray-600">{fee.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button 
                    onClick={() => openPaymentModal(fee)}
                    disabled={isSettled}
                    className={`w-full py-3 rounded-lg font-medium tracking-wide transition flex items-center justify-center gap-2 ${
                      isSettled 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <FaMoneyBillWave />
                    {isSettled ? 'Settled' : 'Pay Now'}
                  </button>
                </div>
              </div>
            );})}
          </div>
        )}

        <div className="mt-8 bg-white/85 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Payment History</h2>
            {paymentsLoading && <FaSpinner className="animate-spin text-violet-600" />}
          </div>

          {paymentsLoading ? (
            <div className="p-6 text-sm text-gray-500">Loading payment history...</div>
          ) : payments.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">No payments submitted yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Bank</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Slip</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-violet-50/40">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{payment.transactionId}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{payment.bankName}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">LKR {Number(payment.amount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <a
                          href={formatSlipUrl(payment.slipUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-violet-700 hover:text-violet-900 underline"
                        >
                          View Slip
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            payment.status === 'Approved'
                              ? 'bg-green-100 text-green-700'
                              : payment.status === 'Rejected'
                                ? 'bg-red-100 text-red-700'
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
          <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-3xl border border-white shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Submit Payment Proof</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Due amount: LKR {getDueAmount(selectedFee).toLocaleString()} | {selectedFee.feeType}
                </p>
              </div>
              <button onClick={closePaymentModal} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bank Selection</label>
                <select
                  value={form.bankName}
                  onChange={(e) => setForm((prev) => ({ ...prev, bankName: e.target.value as PaymentForm['bankName'] }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
                >
                  <option value="">Select bank</option>
                  <option value="BOC">Bank of Ceylon (BOC)</option>
                  <option value="HNB">Hatton National Bank (HNB)</option>
                </select>
                {errors.bankName && <p className="text-red-600 text-xs mt-1">{errors.bankName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Holder Name</label>
                <input
                  type="text"
                  value={form.accountHolder}
                  onChange={(e) => setForm((prev) => ({ ...prev, accountHolder: e.target.value }))}
                  placeholder="Enter account holder name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
                {errors.accountHolder && <p className="text-red-600 text-xs mt-1">{errors.accountHolder}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Transaction Reference Number</label>
                <input
                  type="text"
                  value={form.transactionId}
                  onChange={(e) => setForm((prev) => ({ ...prev, transactionId: e.target.value }))}
                  placeholder="e.g., TXN-2026-12345"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
                {errors.transactionId && <p className="text-red-600 text-xs mt-1">{errors.transactionId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Date</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-4 top-4 text-gray-400" />
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={form.paymentDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, paymentDate: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
                  />
                </div>
                {errors.paymentDate && <p className="text-red-600 text-xs mt-1">{errors.paymentDate}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount Paid (LKR)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder={`Max LKR ${getDueAmount(selectedFee).toLocaleString()}`}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
                {errors.amount && <p className="text-red-600 text-xs mt-1">{errors.amount}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload Bank Slip</label>
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
                    dragActive ? 'border-violet-500 bg-violet-50' : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <input
                    id="slip-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) => onFilePicked(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="slip-upload" className="cursor-pointer block">
                    <FaCloudUploadAlt className="mx-auto text-3xl text-violet-600 mb-2" />
                    <p className="text-sm font-medium text-gray-700">Drop your file here, or click to browse</p>
                    <p className="text-xs text-gray-500 mt-1">{acceptedFileInfo}</p>
                    {form.slip?.type === 'application/pdf' && <FaFilePdf className="mx-auto mt-3 text-red-500" />}
                  </label>
                </div>
                {errors.slip && <p className="text-red-600 text-xs mt-1">{errors.slip}</p>}
              </div>

              {errors.general && <p className="md:col-span-2 text-red-600 text-sm">{errors.general}</p>}

              <div className="md:col-span-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-1">
                <button
                  type="button"
                  onClick={closePaymentModal}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitDisabled}
                  className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
