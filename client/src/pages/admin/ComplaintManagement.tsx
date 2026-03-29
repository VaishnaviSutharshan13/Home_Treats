import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBars,
  FaChevronLeft,
  FaExclamationTriangle,
  FaFilter,
  FaSearch,
  FaSpinner,
  FaTimes,
} from 'react-icons/fa';
import Sidebar from '../../components/layout/Sidebar';
import AdminComplaintTable from '../../components/complaints/AdminComplaintTable';
import type { ComplaintItem } from '../../components/complaints/ComplaintCard';
import { complaintService } from '../../services';

interface AdminComplaintMeta {
  status: string;
  assignedTo: string;
}

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Resolved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-700',
};

const priorityColors: Record<string, string> = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-orange-100 text-orange-700',
  Low: 'bg-violet-100 text-violet-700',
};

const ComplaintManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const [detailMeta, setDetailMeta] = useState<AdminComplaintMeta | null>(null);
  const [detailTouched, setDetailTouched] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await complaintService.getAll({
        search: searchTerm,
        category: filterCategory,
        status: filterStatus,
        priority: filterPriority,
      });
      setComplaints(res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const statusAllowed = complaint.status === 'Pending' || complaint.status === 'In Progress';
      if (!statusAllowed) return false;

      const matchesSearch =
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filterCategory === 'All' || complaint.category === filterCategory;
      const matchesStatus = filterStatus === 'All' || complaint.status === filterStatus;
      const matchesPriority = filterPriority === 'All' || complaint.priority === filterPriority;

      return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
    });
  }, [complaints, searchTerm, filterCategory, filterStatus, filterPriority]);

  const isValidStatusTransition = (currentStatus: string, nextStatus: string) => {
    const allowedStatuses = ['Pending', 'In Progress'];
    return allowedStatuses.includes(currentStatus) && allowedStatuses.includes(nextStatus);
  };

  const getDetailErrors = () => {
    const errors: Record<string, string> = {};
    if (!selectedComplaint || !detailMeta) return errors;

    if (!isValidStatusTransition(selectedComplaint.status, detailMeta.status)) {
      errors.status = 'Status must be Pending or In Progress';
    }

    if (detailMeta.status === 'In Progress' && detailMeta.assignedTo.trim().length < 2) {
      errors.assignedTo = 'Assigned to is required for In Progress';
    }

    return errors;
  };

  const openDetails = (complaint: ComplaintItem) => {
    setSelectedComplaint(complaint);
    setDetailMeta({
      status: complaint.status,
      assignedTo: complaint.assignedTo || '',
    });
    setDetailTouched(false);
  };

  const updateDetailStatus = async () => {
    if (!selectedComplaint || !detailMeta) return;
    setDetailTouched(true);
    const metaErrors = getDetailErrors();
    if (Object.keys(metaErrors).length) {
      const firstError = metaErrors.status || metaErrors.assignedTo || 'Please fix highlighted fields before updating status';
      showToast(firstError, 'error');
      return;
    }

    try {
      setUpdating(true);
      await complaintService.update(selectedComplaint._id, {
        status: detailMeta.status,
        assignedTo: detailMeta.assignedTo.trim(),
      });
      showToast(`Status updated to ${detailMeta.status}`, 'success');
      setSelectedComplaint(null);
      setDetailMeta(null);
      setDetailTouched(false);
      await fetchComplaints();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Unable to update complaint', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (complaint: ComplaintItem, status: string) => {
    if (status === complaint.status) return;

    if (!['Pending', 'In Progress'].includes(status)) {
      showToast('Only Pending and In Progress statuses are allowed', 'error');
      return;
    }

    if (status === 'In Progress' && !String(complaint.assignedTo || '').trim()) {
      showToast('Open details and assign staff before setting In Progress', 'error');
      openDetails(complaint);
      return;
    }

    try {
      setActionLoadingId(complaint._id);
      await complaintService.update(complaint._id, { status });
      showToast(`Status updated to ${status}`, 'success');
      await fetchComplaints();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Unable to change status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionLoadingId(id);
      await complaintService.delete(id);
      showToast('Complaint deleted', 'success');
      await fetchComplaints();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Unable to delete complaint', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const detailMetaErrors = detailTouched ? getDetailErrors() : {};
  const isDetailValid = Object.keys(getDetailErrors()).length === 0;

  const stats = {
    pending: complaints.filter((item) => item.status === 'Pending').length,
    inProgress: complaints.filter((item) => item.status === 'In Progress').length,
    resolved: complaints.filter((item) => item.status === 'Resolved').length,
    rejected: complaints.filter((item) => item.status === 'Rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} userRole="admin" />

      <div className="lg:ml-64">
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 lg:px-8">
            <div className="mb-3 flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50 lg:hidden"
              >
                <FaBars />
              </button>
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-purple-600"
              >
                <FaChevronLeft className="text-xs" />
                Dashboard
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1>
                <p className="text-sm text-gray-500">Admins can view all complaints, update status to Pending/In Progress, and delete when needed</p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
          {toast && (
            <div
              className={`mb-5 rounded-xl border px-4 py-3 text-sm font-semibold ${
                toast.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {toast.message}
            </div>
          )}

          <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="mt-1 text-sm text-gray-500">Pending</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              <p className="mt-1 text-sm text-gray-500">In Progress</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              <p className="mt-1 text-sm text-gray-500">Resolved</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              <p className="mt-1 text-sm text-gray-500">Rejected</p>
            </div>
          </section>

          <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_160px_150px_120px]">
              <div className="relative">
                <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  placeholder="Search title, student, description"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              >
                <option value="All">All Categories</option>
                <option value="Maintenance">Maintenance</option>
                <option value="IT Support">IT Support</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Housekeeping">Housekeeping</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              >
                <option value="All">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <button
                onClick={fetchComplaints}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <FaFilter />
                Refresh
              </button>
            </div>
          </section>

          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center shadow-sm">
              <FaSpinner className="mx-auto mb-3 animate-spin text-2xl text-purple-600" />
              <p className="text-sm text-gray-500">Loading complaints...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-white p-16 text-center shadow-sm">
              <FaExclamationTriangle className="mx-auto mb-3 text-3xl text-red-500" />
              <p className="text-sm font-semibold text-red-600">{error}</p>
              <button
                onClick={fetchComplaints}
                className="mt-4 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 text-sm font-semibold text-white"
              >
                Retry
              </button>
            </div>
          ) : (
            <AdminComplaintTable
              complaints={filteredComplaints}
              loadingId={actionLoadingId}
              onView={openDetails}
              onStatusChange={handleStatusChange}
              onDelete={setConfirmDeleteId}
            />
          )}
        </main>
      </div>

      {selectedComplaint && detailMeta && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4"
          onClick={() => {
            setSelectedComplaint(null);
            setDetailMeta(null);
            setDetailTouched(false);
          }}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => {
                setSelectedComplaint(null);
                setDetailMeta(null);
                setDetailTouched(false);
              }}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close complaint details"
            >
              <FaTimes className="h-4 w-4" />
            </button>

            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Complaint Details</h2>
                <p className="mt-1 text-sm text-gray-500">Review complaint details and update status</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityColors[selectedComplaint.priority] || 'bg-gray-100 text-gray-700'}`}>
                  {selectedComplaint.priority}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[selectedComplaint.status] || 'bg-gray-100 text-gray-700'}`}>
                  {selectedComplaint.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Title</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{selectedComplaint.title}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</p>
                <p className="mt-1 text-sm text-gray-700">{selectedComplaint.description}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Student</p>
                <p className="mt-1 text-sm font-medium text-gray-800">{selectedComplaint.student || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Room</p>
                <p className="mt-1 text-sm font-medium text-gray-800">{selectedComplaint.room || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Category</p>
                <p className="mt-1 text-sm font-medium text-gray-800">{selectedComplaint.category}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Submitted</p>
                <p className="mt-1 text-sm font-medium text-gray-800">{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Status</label>
                <select
                  value={detailMeta.status}
                  onChange={(e) => setDetailMeta({ ...detailMeta, status: e.target.value })}
                  className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-gray-900 outline-none transition focus:ring-2 ${
                    detailMetaErrors.status
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-gray-200 focus:border-purple-400 focus:ring-purple-100'
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                </select>
                {detailMetaErrors.status && <p className="mt-1 text-xs font-medium text-red-600">{detailMetaErrors.status}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Assign To</label>
                <input
                  value={detailMeta.assignedTo}
                  onChange={(e) => setDetailMeta({ ...detailMeta, assignedTo: e.target.value })}
                  className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-gray-900 outline-none transition focus:ring-2 ${
                    detailMetaErrors.assignedTo
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-gray-200 focus:border-purple-400 focus:ring-purple-100'
                  }`}
                  placeholder="Staff name or team"
                />
                {detailMetaErrors.assignedTo && <p className="mt-1 text-xs font-medium text-red-600">{detailMetaErrors.assignedTo}</p>}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
              <button
                onClick={() => {
                  setSelectedComplaint(null);
                  setDetailMeta(null);
                  setDetailTouched(false);
                }}
                className="h-11 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={updateDetailStatus}
                disabled={updating || !isDetailValid}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 text-sm font-semibold text-white transition hover:from-purple-700 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updating ? (
                  <span className="inline-flex items-center gap-2">
                    <FaSpinner className="animate-spin" />
                    Updating...
                  </span>
                ) : (
                  'Update Status'
                )}
              </button>
            </div>

            {(selectedComplaint.comments?.length || 0) > 0 && (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Comments ({selectedComplaint.comments?.length || 0})
                </h3>
                <div className="space-y-2">
                  {selectedComplaint.comments?.map((comment, index) => (
                    <div key={`${selectedComplaint._id}-${index}`} className="rounded-xl bg-gray-50 p-3">
                      <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">{comment.author}</span>
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">Delete Complaint</h3>
            <p className="mt-2 text-sm text-gray-600">Are you sure you want to permanently delete this complaint?</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="h-11 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const id = confirmDeleteId;
                  setConfirmDeleteId(null);
                  if (id) await handleDelete(id);
                }}
                className="h-11 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintManagement;
