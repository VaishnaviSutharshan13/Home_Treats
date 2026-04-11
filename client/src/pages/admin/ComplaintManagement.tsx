import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaChevronLeft,
  FaFilter,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaEye,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';

import Sidebar from '../../components/layout/Sidebar';
import { complaintService } from '../../services';
import type { ComplaintItem } from '../../components/complaints/ComplaintCard';

type Status = 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';

interface AssignState {
  complaintId: string;
  assignedTo: string;
  estimatedResolution: string;
}

const ComplaintManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');

  const [activeComplaint, setActiveComplaint] = useState<ComplaintItem | null>(null);

  const [assignModal, setAssignModal] = useState<AssignState | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch ─────────────────────
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await complaintService.getAll();
      setComplaints(res.data || res);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // ── Filter ─────────────────────
  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.student.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());

      return (
        matchesSearch &&
        (category === 'All' || c.category === category) &&
        (status === 'All' || c.status === status) &&
        (priority === 'All' || c.priority === priority)
      );
    });
  }, [complaints, search, category, status, priority]);

  // ── Helpers ─────────────────────
  const refresh = async () => fetchComplaints();

  const updateStatus = async (id: string, newStatus: Status, payload?: any) => {
    try {
      await complaintService.update(id, { status: newStatus, ...payload });
      showToast('Updated successfully', 'success');
      await refresh();
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Update failed', 'error');
    }
  };

  // ── Actions ─────────────────────
  const assignComplaint = async () => {
    if (!assignModal?.assignedTo.trim()) return;

    await updateStatus(assignModal.complaintId, 'In Progress', {
      assignedTo: assignModal.assignedTo,
      estimatedResolution: assignModal.estimatedResolution,
    });

    setAssignModal(null);
  };

  const resolveComplaint = async (id: string) => {
    await updateStatus(id, 'Resolved');
  };

  const rejectComplaint = async () => {
    if (!rejectModal || !rejectReason.trim()) return;

    await updateStatus(rejectModal, 'Rejected', {
      rejectionReason: rejectReason,
    });

    setRejectModal(null);
    setRejectReason('');
  };

  const deleteComplaint = async (id: string) => {
    if (!confirm('Delete this complaint?')) return;

    await complaintService.delete(id);
    showToast('Deleted successfully', 'success');
    await refresh();
  };

  // ── UI helpers ─────────────────────
  const statusIcon = (s: Status) => {
    switch (s) {
      case 'Pending':
        return <FaClock />;
      case 'In Progress':
        return <FaExclamationTriangle />;
      case 'Resolved':
        return <FaCheckCircle />;
      case 'Rejected':
        return <FaTimesCircle />;
    }
  };

  // ── Render ─────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} userRole="admin" />

      <div className="lg:ml-64 p-6">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-5 right-5 px-4 py-2 rounded text-white ${
            toast.type === 'success' ? 'bg-primary/10 border border-primary/200' : 'bg-error/10 border border-error/200'
          }`}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/admin/dashboard" className="text-muted-foreground flex items-center gap-2">
            <FaChevronLeft /> Dashboard
          </Link>

          <button onClick={refresh} className="flex items-center gap-2 bg-card px-3 py-2 rounded">
            <FaFilter /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <input
            className="rounded bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30">
            <option>All</option>
            <option>Maintenance</option>
            <option>IT Support</option>
            <option>Plumbing</option>
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30">
            <option>All</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Rejected</option>
          </select>

          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30">
            <option>All</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        {/* States */}
        {loading && <FaSpinner className="animate-spin text-2xl" />}
        {error && <p className="text-error">{error}</p>}

        {/* List */}
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <div key={c._id} className="bg-card p-4 rounded shadow">

              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  {statusIcon(c.status as Status)}
                  <h3 className="font-bold">{c.title}</h3>
                </div>

                <span className="text-sm">{c.priority}</span>
              </div>

              <p className="text-sm text-muted-foreground">{c.description}</p>

              <div className="mt-3 text-sm">
                <p><b>Student:</b> {c.student}</p>
                <p><b>Room:</b> {c.room}</p>
                <p><b>Status:</b> {c.status}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 flex-wrap">

                <button onClick={() => setActiveComplaint(c)} className="px-2 py-1 bg-muted/70 rounded flex items-center gap-1">
                  <FaEye /> View
                </button>

                {c.status === 'Pending' && (
                  <button onClick={() => setAssignModal({
                    complaintId: c._id,
                    assignedTo: '',
                    estimatedResolution: '',
                  })} className="px-2 py-1 bg-primary/10 text-primary0 text-white rounded">
                    <FaEdit /> Assign
                  </button>
                )}

                {c.status === 'In Progress' && (
                  <>
                    <button onClick={() => resolveComplaint(c._id)} className="px-2 py-1 bg-primary/10 border border-primary/200 text-white rounded">
                      Resolve
                    </button>
                    <button onClick={() => setRejectModal(c._id)} className="px-2 py-1 bg-error/10 border border-error/200 text-white rounded">
                      Reject
                    </button>
                  </>
                )}

                <button onClick={() => deleteComplaint(c._id)} className="px-2 py-1 bg-error/20 border border-error/30 text-error rounded">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modals (simplified for clarity) */}
        {assignModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-card p-5 rounded w-96">
              <h3 className="font-bold mb-3">Assign Complaint</h3>

              <input
                placeholder="Assign to"
                className="w-full mb-2 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                value={assignModal.assignedTo}
                onChange={(e) =>
                  setAssignModal({ ...assignModal, assignedTo: e.target.value })
                }
              />

              <button onClick={assignComplaint} className="bg-primary/10 text-primary0 text-white px-3 py-2 rounded w-full">
                Assign
              </button>
            </div>
          </div>
        )}

        {activeComplaint && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-card p-6 rounded w-[600px]">
              <h2 className="text-xl font-bold">{activeComplaint.title}</h2>
              <p className="mt-2">{activeComplaint.description}</p>

              <button onClick={() => setActiveComplaint(null)} className="mt-4 px-3 py-2 bg-muted/70 rounded">
                Close
              </button>
            </div>
          </div>
        )}

        {rejectModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-card p-5 rounded w-full max-w-md mx-4">
              <h3 className="font-bold mb-3">Reject complaint</h3>
              <textarea
                className="w-full mb-3 min-h-[100px] rounded bg-muted/30 border border-border text-foreground p-2"
                placeholder="Reason for rejection"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setRejectModal(null);
                    setRejectReason('');
                  }}
                  className="px-3 py-2 rounded bg-muted/70"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void rejectComplaint()}
                  className="px-3 py-2 rounded bg-error/20 text-error"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ComplaintManagement;