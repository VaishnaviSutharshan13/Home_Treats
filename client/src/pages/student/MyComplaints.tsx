import { useEffect, useMemo, useState } from 'react';
import { FaBars, FaPlus, FaSearch, FaSpinner, FaTimes } from 'react-icons/fa';
import Sidebar from '../../components/layout/Sidebar';
import ComplaintForm from '../../components/complaints/ComplaintForm';
import type { ComplaintFormValues } from '../../components/complaints/ComplaintForm';
import ComplaintList from '../../components/complaints/ComplaintList';
import type { ComplaintItem } from '../../components/complaints/ComplaintCard';
import { complaintService } from '../../services';

const initialFormValues: ComplaintFormValues = {
  title: '',
  description: '',
  category: 'Maintenance',
  priority: 'Medium',
};

const validateComplaintForm = (values: ComplaintFormValues) => {
  const errors: Partial<Record<keyof ComplaintFormValues, string>> = {};
  const title = values.title.trim();
  const description = values.description.trim();

  if (!title) {
    errors.title = 'Title is required';
  } else if (title.length < 5) {
    errors.title = 'Title must be at least 5 characters';
  }

  if (!description) {
    errors.description = 'Description is required';
  } else if (description.length < 20) {
    errors.description = 'Description must be at least 20 characters';
  }

  if (!values.category.trim()) {
    errors.category = 'Category is required';
  }

  if (!['Low', 'Medium', 'High'].includes(values.priority)) {
    errors.priority = 'Priority must be Low, Medium, or High';
  }

  return errors;
};

const MyComplaints = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<ComplaintItem | null>(null);
  const [formValues, setFormValues] = useState<ComplaintFormValues>(initialFormValues);
  const [formTouched, setFormTouched] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchComplaints = async () => {
    if (!user?.studentId) {
      setError('User information not available');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await complaintService.getMy();
      setComplaints(res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch your complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (!showFormModal) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showFormModal]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const matchesSearch =
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || complaint.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchTerm, statusFilter]);

  const summary = {
    pending: complaints.filter((c) => c.status === 'Pending').length,
    inProgress: complaints.filter((c) => c.status === 'In Progress').length,
    resolved: complaints.filter((c) => c.status === 'Resolved').length,
    rejected: complaints.filter((c) => c.status === 'Rejected').length,
  };

  const openCreateModal = () => {
    setEditingComplaint(null);
    setFormValues(initialFormValues);
    setShowFormModal(true);
    setFormTouched(false);
  };

  const openEditModal = (complaint: ComplaintItem) => {
    if (complaint.status !== 'Pending') {
      showToast('Only pending complaints can be edited', 'error');
      return;
    }

    setEditingComplaint(complaint);
    setFormValues({
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      priority: complaint.priority,
    });
    setShowFormModal(true);
    setFormTouched(false);
  };

  const closeModal = () => {
    setShowFormModal(false);
    setEditingComplaint(null);
    setFormValues(initialFormValues);
    setFormTouched(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormTouched(true);

    const validationErrors = validateComplaintForm(formValues);
    if (Object.keys(validationErrors).length) {
      const firstError =
        validationErrors.description ||
        validationErrors.title ||
        validationErrors.category ||
        validationErrors.priority ||
        'Please fix the highlighted fields';
      showToast(firstError, 'error');
      return;
    }

    const payload = {
      ...formValues,
      title: formValues.title.trim(),
      description: formValues.description.trim(),
    };

    try {
      setActionLoading(true);

      if (editingComplaint) {
        await complaintService.update(editingComplaint._id, payload);
        showToast('Complaint updated successfully', 'success');
      } else {
        await complaintService.create(payload);
        showToast('Complaint submitted successfully', 'success');
      }

      closeModal();
      await fetchComplaints();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Unable to save complaint', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const complaint = complaints.find((item) => item._id === id);
    if (!complaint) return;
    if (complaint.status !== 'Pending') {
      showToast('Only pending complaints can be deleted', 'error');
      return;
    }

    try {
      setDeletingId(id);
      await complaintService.delete(id);
      showToast('Complaint deleted', 'success');
      await fetchComplaints();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Unable to delete complaint', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const formErrors = formTouched ? validateComplaintForm(formValues) : {};
  const isFormValid = Object.keys(validateComplaintForm(formValues)).length === 0;

  const toggleComments = (id: string) => {
    setExpandedComments((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} userRole="student" />

      <div className="lg:ml-64">
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNewComplaint(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2"
              >
                <FaBars />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1>
                <p className="text-sm text-gray-500">Create, track, and manage your complaints</p>
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-pink-600"
            >
              <FaPlus />
              New Complaint
            </button>
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
              <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
              <p className="mt-1 text-sm text-gray-500">Pending</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-2xl font-bold text-blue-600">{summary.inProgress}</p>
              <p className="mt-1 text-sm text-gray-500">In Progress</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-2xl font-bold text-green-600">{summary.resolved}</p>
              <p className="mt-1 text-sm text-gray-500">Resolved</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-2xl font-bold text-red-600">{summary.rejected}</p>
              <p className="mt-1 text-sm text-gray-500">Rejected</p>
            </div>
          </section>

          <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_140px]">
              <div className="relative">
                <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  placeholder="Search by title, description, or category"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <button
                onClick={fetchComplaints}
                className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
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
              <p className="text-sm font-semibold text-red-600">{error}</p>
              <button
                onClick={fetchComplaints}
                className="mt-4 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 text-sm font-semibold text-white"
              >
                Retry
              </button>
            </div>
          ) : (
            <ComplaintList
              complaints={filteredComplaints}
              expandedIds={expandedComments}
              onToggleComments={toggleComments}
              onEdit={openEditModal}
              onDelete={setConfirmDeleteId}
              onCreateClick={openCreateModal}
              emptyMessage="No complaints match your filters"
            />
          )}

          {deletingId && <div className="mt-3 text-sm text-gray-500">Deleting complaint...</div>}
        </main>
      </div>

      {showFormModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4"
          onClick={closeModal}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-lg sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close complaint form"
            >
              <FaTimes className="h-4 w-4" />
            </button>

            <h2 className="mb-6 pr-12 text-xl font-bold text-gray-900">
              {editingComplaint ? 'Edit Complaint' : 'Create Complaint'}
            </h2>
            <ComplaintForm
              values={formValues}
              onChange={setFormValues}
              onSubmit={handleSubmit}
              errors={formErrors}
              submitDisabled={!isFormValid}
              onCancel={closeModal}
              loading={actionLoading}
              submitLabel={editingComplaint ? 'Update Complaint' : 'Submit Complaint'}
            />
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">Delete Complaint</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete this complaint? This action cannot be undone.
            </p>
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

export default MyComplaints;
