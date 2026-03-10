import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaSearch, FaFilter, FaExclamationTriangle, FaCheckCircle, FaClock, FaTimesCircle, FaSpinner, FaComment, FaEye, FaTrash, FaChevronLeft, FaBars } from 'react-icons/fa';
import { complaintService } from '../../services';
import Sidebar from '../../components/layout/Sidebar';

interface Comment {
  text: string;
  author: string;
  createdAt: string;
}

interface Complaint {
  _id: string;
  title: string;
  description: string;
  student: string;
  room: string;
  category: string;
  priority: string;
  status: string;
  assignedTo?: string;
  estimatedResolution?: string;
  resolvedDate?: string;
  rejectionReason?: string;
  comments?: Comment[];
  createdAt: string;
}

const ComplaintManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  // Modal states
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<string | null>(null);
  const [assignedTo, setAssignedTo] = useState('');
  const [estimatedResolution, setEstimatedResolution] = useState('');

  // Reject prompt
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Comment states
  const [commentFormOpen, setCommentFormOpen] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  // View state
  const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);

  // Action loading
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await complaintService.getAll();
      setComplaints(res.data ?? res);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || complaint.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || complaint.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || complaint.priority === filterPriority;
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'In Progress': return 'bg-purple-500/10 text-purple-300';
      case 'Resolved': return 'bg-purple-500/20 text-purple-600';
      case 'Rejected': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500/20 text-red-400';
      case 'Medium': return 'bg-orange-500/20 text-orange-400';
      case 'Low': return 'bg-purple-500/20 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <FaClock className="text-yellow-600" />;
      case 'In Progress': return <FaExclamationTriangle className="text-purple-600" />;
      case 'Resolved': return <FaCheckCircle className="text-purple-600" />;
      case 'Rejected': return <FaTimesCircle className="text-red-600" />;
      default: return <FaClock className="text-gray-600" />;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // ── Actions ──────────────────────────────────────────────

  const handleAssign = async () => {
    if (!assignTarget || !assignedTo.trim()) return;
    setActionLoading(assignTarget);
    try {
      await complaintService.assign(assignTarget, {
        assignedTo: assignedTo.trim(),
        ...(estimatedResolution ? { estimatedResolution } : {}),
      });
      showToast('Complaint assigned successfully', 'success');
      setAssignModalOpen(false);
      setAssignedTo('');
      setEstimatedResolution('');
      setAssignTarget(null);
      await fetchComplaints();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to assign complaint', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async (id: string) => {
    setActionLoading(id);
    try {
      await complaintService.resolve(id, {});
      showToast('Complaint resolved successfully', 'success');
      await fetchComplaints();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to resolve complaint', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectionReason.trim()) return;
    setActionLoading(rejectTarget);
    try {
      await complaintService.resolve(rejectTarget, { rejectionReason: rejectionReason.trim() });
      showToast('Complaint rejected', 'success');
      setRejectModalOpen(false);
      setRejectionReason('');
      setRejectTarget(null);
      await fetchComplaints();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to reject complaint', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddComment = async (id: string) => {
    if (!commentText.trim() || !commentAuthor.trim()) return;
    setActionLoading(id);
    try {
      await complaintService.addComment(id, { text: commentText.trim(), author: commentAuthor.trim() });
      showToast('Comment added', 'success');
      setCommentFormOpen(null);
      setCommentText('');
      setCommentAuthor('');
      await fetchComplaints();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to add comment', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleComments = (id: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) return;
    setActionLoading(id);
    try {
      await complaintService.delete(id);
      showToast('Complaint deleted successfully', 'success');
      await fetchComplaints();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to delete complaint', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} userRole="admin" />
      <div className="lg:ml-64">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-gray-900 text-sm font-medium transition-all duration-300 ${toast.type === 'success' ? 'bg-purple-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      {/* Assign Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-gray-50 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-100 mb-4">Assign Complaint</h3>
            <label className="block text-sm font-medium text-gray-600 mb-1">Assigned To *</label>
            <input
              type="text"
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              placeholder="e.g. Maintenance Team"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-900 mb-4 focus:outline-none focus:border-purple-500"
            />
            <label className="block text-sm font-medium text-gray-600 mb-1">Estimated Resolution (optional)</label>
            <input
              type="date"
              title="Estimated resolution date"
              aria-label="Estimated resolution date"
              value={estimatedResolution}
              onChange={e => setEstimatedResolution(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-900 mb-6 focus:outline-none focus:border-purple-500"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => { setAssignModalOpen(false); setAssignTarget(null); setAssignedTo(''); setEstimatedResolution(''); }}
                className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!assignedTo.trim() || actionLoading === assignTarget}
                className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {actionLoading === assignTarget && <FaSpinner className="animate-spin mr-2" />}
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-gray-50 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-100 mb-4">Reject Complaint</h3>
            <label className="block text-sm font-medium text-gray-600 mb-1">Rejection Reason *</label>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="Provide reason for rejection..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-900 mb-6 focus:outline-none focus:border-purple-500"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => { setRejectModalOpen(false); setRejectTarget(null); setRejectionReason(''); }}
                className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || actionLoading === rejectTarget}
                className="px-5 py-2 bg-red-600 text-gray-900 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {actionLoading === rejectTarget && <FaSpinner className="animate-spin mr-2" />}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="w-full bg-white border-b border-purple-500/20 text-gray-900 py-6">
        <div className="w-full px-5 sm:px-7 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <button
              type="button"
              title="Open sidebar"
              aria-label="Open sidebar"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
            >
              <FaBars className="w-5 h-5" />
            </button>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-purple-600 text-sm mb-4 transition-colors duration-200 group"
          >
            <FaChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span>Dashboard</span>
            <span className="text-gray-600 mx-0.5">/</span>
            <span className="text-gray-500">Complaint Management</span>
          </Link>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">Complaint Management</h1>
              <p className="text-purple-600">Handle student complaints and maintenance requests</p>
            </div>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors duration-300 flex items-center">
              <FaPlus className="mr-2" />
              New Complaint
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="w-full bg-gray-50 shadow-sm border-b">
        <div className="w-full px-6 sm:px-8 lg:px-10 py-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search complaints..."
                title="Search complaints"
                aria-label="Search complaints"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:border-purple-500"
              />
            </div>
            <select
              title="Filter by complaint category"
              aria-label="Filter by complaint category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Categories</option>
              <option value="Maintenance">Maintenance</option>
              <option value="IT Support">IT Support</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Housekeeping">Housekeeping</option>
            </select>
            <select
              title="Filter by complaint status"
              aria-label="Filter by complaint status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select
              title="Filter by complaint priority"
              aria-label="Filter by complaint priority"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <button
              onClick={fetchComplaints}
              className="flex items-center justify-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors duration-300"
            >
              <FaFilter className="mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        <div className="w-full px-6 sm:px-8 lg:px-10 py-8">

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <FaSpinner className="animate-spin text-4xl text-purple-600 mb-4" />
              <p className="text-lg">Loading complaints...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <FaExclamationTriangle className="text-4xl text-red-500 mb-4" />
              <p className="text-lg text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchComplaints}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredComplaints.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <FaExclamationTriangle className="text-4xl mb-4" />
              <p className="text-lg">No complaints found</p>
            </div>
          )}

          {/* Complaint Cards */}
          {!loading && !error && filteredComplaints.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredComplaints.map((complaint) => (
                <div key={complaint._id} className="bg-gray-50 rounded-xl hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    {/* Complaint Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {getStatusIcon(complaint.status)}
                          <h3 className="text-lg font-semibold text-gray-100 ml-2">{complaint.title}</h3>
                        </div>
                        <p className="text-gray-600 text-sm">{complaint.description}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2 ml-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </div>
                    </div>

                    {/* Complaint Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Student</p>
                        <p className="text-sm font-medium text-gray-900">{complaint.student}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Room</p>
                        <p className="text-sm font-medium text-gray-900">{complaint.room}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="text-sm font-medium text-gray-900">{complaint.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Submitted</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(complaint.createdAt)}</p>
                      </div>
                    </div>

                    {/* Assignment and Resolution */}
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Assigned To</p>
                          <p className="text-sm font-medium text-gray-900">{complaint.assignedTo || '—'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Est. Resolution</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(complaint.estimatedResolution)}</p>
                        </div>
                      </div>

                      {complaint.status === 'Resolved' && complaint.resolvedDate && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">Resolved On</p>
                          <p className="text-sm font-medium text-purple-600">{formatDate(complaint.resolvedDate)}</p>
                        </div>
                      )}

                      {complaint.status === 'Rejected' && complaint.rejectionReason && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">Rejection Reason</p>
                          <p className="text-sm font-medium text-red-600">{complaint.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Comments Section */}
                    {complaint.comments && complaint.comments.length > 0 && (
                      <div className="border-t pt-3 mb-3">
                        <button
                          onClick={() => toggleComments(complaint._id)}
                          className="text-sm text-purple-600 hover:text-purple-300 flex items-center mb-2"
                        >
                          <FaComment className="mr-1" />
                          {expandedComments.has(complaint._id) ? 'Hide' : 'Show'} Comments ({complaint.comments.length})
                        </button>
                        {expandedComments.has(complaint._id) && (
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {complaint.comments.map((c, idx) => (
                              <div key={idx} className="bg-gray-100 rounded-lg p-3 text-sm">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium text-gray-700">{c.author}</span>
                                  <span className="text-xs text-gray-500">{formatDate(c.createdAt)}</span>
                                </div>
                                <p className="text-gray-600">{c.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Inline Comment Form */}
                    {commentFormOpen === complaint._id && (
                      <div className="border-t pt-3 mb-3 space-y-2">
                        <input
                          type="text"
                          placeholder="Your name"
                          value={commentAuthor}
                          onChange={e => setCommentAuthor(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-900 text-sm focus:outline-none focus:border-purple-500"
                        />
                        <textarea
                          placeholder="Write a comment..."
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-900 text-sm focus:outline-none focus:border-purple-500"
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => { setCommentFormOpen(null); setCommentText(''); setCommentAuthor(''); }}
                            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAddComment(complaint._id)}
                            disabled={!commentText.trim() || !commentAuthor.trim() || actionLoading === complaint._id}
                            className="px-4 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 flex items-center"
                          >
                            {actionLoading === complaint._id && <FaSpinner className="animate-spin mr-1" />}
                            Post
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setViewingComplaint(complaint)}
                        className="bg-purple-50 text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-100 transition-colors duration-300 flex items-center justify-center"
                        title="View Details"
                      >
                        <FaEye className="mr-1" /> View
                      </button>
                      {complaint.status === 'Pending' && (
                        <button
                          onClick={() => { setAssignTarget(complaint._id); setAssignModalOpen(true); }}
                          disabled={actionLoading === complaint._id}
                          className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors duration-300 flex items-center justify-center"
                        >
                          <FaEdit className="mr-1" />
                          Assign
                        </button>
                      )}
                      {complaint.status === 'In Progress' && (
                        <>
                          <button
                            onClick={() => handleResolve(complaint._id)}
                            disabled={actionLoading === complaint._id}
                            className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors duration-300 flex items-center justify-center"
                          >
                            {actionLoading === complaint._id ? <FaSpinner className="animate-spin mr-1" /> : <FaCheckCircle className="mr-1" />}
                            Resolve
                          </button>
                          <button
                            onClick={() => { setRejectTarget(complaint._id); setRejectModalOpen(true); }}
                            disabled={actionLoading === complaint._id}
                            className="flex-1 bg-red-600 text-gray-900 px-3 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-300 flex items-center justify-center"
                          >
                            <FaTimesCircle className="mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                      {(complaint.status === 'Resolved' || complaint.status === 'Rejected') && commentFormOpen !== complaint._id && (
                        <button
                          onClick={() => { setCommentFormOpen(complaint._id); setExpandedComments(prev => new Set(prev).add(complaint._id)); }}
                          className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition-colors duration-300 flex items-center justify-center"
                        >
                          <FaComment className="mr-1" />
                          Comment
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(complaint._id)}
                        disabled={actionLoading === complaint._id}
                        className="bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors duration-300 flex items-center justify-center"
                        title="Delete Complaint"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-2xl text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-xl font-bold text-gray-900">{complaints.filter(c => c.status === 'Pending').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center">
                <FaClock className="text-2xl text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-xl font-bold text-gray-900">{complaints.filter(c => c.status === 'In Progress').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center">
                <FaCheckCircle className="text-2xl text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Resolved</p>
                  <p className="text-xl font-bold text-gray-900">{complaints.filter(c => c.status === 'Resolved').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center">
                <FaTimesCircle className="text-2xl text-red-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Rejected</p>
                  <p className="text-xl font-bold text-gray-900">{complaints.filter(c => c.status === 'Rejected').length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* View Complaint Modal */}
      {viewingComplaint && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-50 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-700">Complaint Details</h2>
              <button onClick={() => setViewingComplaint(null)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(viewingComplaint.status)}
                  <h3 className="text-lg font-semibold text-gray-100 ml-2">{viewingComplaint.title}</h3>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(viewingComplaint.priority)}`}>{viewingComplaint.priority}</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewingComplaint.status)}`}>{viewingComplaint.status}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm">{viewingComplaint.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                <div>
                  <p className="text-gray-500 font-medium">Student</p>
                  <p className="text-gray-100">{viewingComplaint.student}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Room</p>
                  <p className="text-gray-100">{viewingComplaint.room}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Category</p>
                  <p className="text-gray-100">{viewingComplaint.category}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Submitted</p>
                  <p className="text-gray-100">{formatDate(viewingComplaint.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Assigned To</p>
                  <p className="text-gray-100">{viewingComplaint.assignedTo || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Est. Resolution</p>
                  <p className="text-gray-100">{formatDate(viewingComplaint.estimatedResolution)}</p>
                </div>
                {viewingComplaint.resolvedDate && (
                  <div className="col-span-2">
                    <p className="text-gray-500 font-medium">Resolved On</p>
                    <p className="text-purple-600 font-medium">{formatDate(viewingComplaint.resolvedDate)}</p>
                  </div>
                )}
                {viewingComplaint.rejectionReason && (
                  <div className="col-span-2">
                    <p className="text-gray-500 font-medium">Rejection Reason</p>
                    <p className="text-red-600">{viewingComplaint.rejectionReason}</p>
                  </div>
                )}
              </div>
              {viewingComplaint.comments && viewingComplaint.comments.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Comments ({viewingComplaint.comments.length})</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {viewingComplaint.comments.map((c, idx) => (
                      <div key={idx} className="bg-gray-100 rounded-lg p-3 text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-700">{c.author}</span>
                          <span className="text-xs text-gray-500">{formatDate(c.createdAt)}</span>
                        </div>
                        <p className="text-gray-600">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button onClick={() => setViewingComplaint(null)} className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-900 text-gray-700 hover:bg-purple-500/5">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ComplaintManagement;
