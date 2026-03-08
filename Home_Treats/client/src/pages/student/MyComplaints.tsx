import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaTimesCircle, FaSpinner, FaSearch, FaPlus, FaComment } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
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
  assignedTo: string;
  estimatedResolution: string;
  resolvedDate: string;
  rejectionReason: string;
  comments: Comment[];
  createdAt: string;
}

const MyComplaints = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showNewComplaint, setShowNewComplaint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Maintenance',
    priority: 'Medium',
  });
  const [expandedComplaints, setExpandedComplaints] = useState<string[]>([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      if (user?.studentId) {
        const res = await complaintService.getByStudent(user.studentId);
        if (res.success) setComplaints(res.data || []);
      }
    } catch (err) {
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await complaintService.create({
        ...formData,
        student: user?.name || '',
        room: user?.room || '',
      });
      if (res.success) {
        setToast({ type: 'success', message: 'Complaint submitted successfully' });
        setShowNewComplaint(false);
        setFormData({ title: '', description: '', category: 'Maintenance', priority: 'Medium' });
        fetchComplaints();
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to submit complaint' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleComments = (id: string) => {
    setExpandedComplaints(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <FaClock className="text-yellow-600" />;
      case 'In Progress': return <FaExclamationTriangle className="text-blue-600" />;
      case 'Resolved': return <FaCheckCircle className="text-green-600" />;
      case 'Rejected': return <FaTimesCircle className="text-red-600" />;
      default: return <FaClock className="text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} userRole="student" />

      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Complaints</h1>
              <p className="text-gray-500 text-sm mt-1">Submit and track your complaints</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNewComplaint(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FaPlus className="w-3 h-3" />
                New Complaint
              </button>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Toast */}
        {toast && (
          <div className={`mx-6 mt-4 p-3 rounded-lg text-sm ${
            toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
            'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {toast.message}
          </div>
        )}

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FaSpinner className="animate-spin text-4xl text-indigo-600" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={fetchComplaints} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Retry</button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{complaints.filter(c => c.status === 'Pending').length}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{complaints.filter(c => c.status === 'In Progress').length}</p>
                  <p className="text-xs text-gray-500">In Progress</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{complaints.filter(c => c.status === 'Resolved').length}</p>
                  <p className="text-xs text-gray-500">Resolved</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{complaints.filter(c => c.status === 'Rejected').length}</p>
                  <p className="text-xs text-gray-500">Rejected</p>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search complaints..."
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
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Complaints List */}
              {filteredComplaints.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
                  <FaExclamationTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No complaints found</p>
                  <button
                    onClick={() => setShowNewComplaint(true)}
                    className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Submit your first complaint
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredComplaints.map((complaint) => (
                    <div key={complaint._id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(complaint.status)}
                            <h3 className="font-semibold text-gray-900">{complaint.title}</h3>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                              {complaint.priority}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                              {complaint.status}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{complaint.description}</p>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-400 text-xs">Category</p>
                            <p className="text-gray-700">{complaint.category}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Submitted</p>
                            <p className="text-gray-700">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                          </div>
                          {complaint.assignedTo && (
                            <div>
                              <p className="text-gray-400 text-xs">Assigned To</p>
                              <p className="text-gray-700">{complaint.assignedTo}</p>
                            </div>
                          )}
                          {complaint.estimatedResolution && (
                            <div>
                              <p className="text-gray-400 text-xs">Est. Resolution</p>
                              <p className="text-gray-700">{new Date(complaint.estimatedResolution).toLocaleDateString()}</p>
                            </div>
                          )}
                          {complaint.resolvedDate && (
                            <div>
                              <p className="text-gray-400 text-xs">Resolved On</p>
                              <p className="text-green-600 font-medium">{new Date(complaint.resolvedDate).toLocaleDateString()}</p>
                            </div>
                          )}
                          {complaint.rejectionReason && (
                            <div className="col-span-2">
                              <p className="text-gray-400 text-xs">Rejection Reason</p>
                              <p className="text-red-600">{complaint.rejectionReason}</p>
                            </div>
                          )}
                        </div>

                        {/* Comments */}
                        {complaint.comments && complaint.comments.length > 0 && (
                          <div className="mt-4 border-t pt-3">
                            <button
                              onClick={() => toggleComments(complaint._id)}
                              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                            >
                              <FaComment className="w-3 h-3" />
                              {expandedComplaints.includes(complaint._id) ? 'Hide' : 'Show'} {complaint.comments.length} comment{complaint.comments.length !== 1 ? 's' : ''}
                            </button>
                            {expandedComplaints.includes(complaint._id) && (
                              <div className="mt-2 space-y-2">
                                {complaint.comments.map((comment, idx) => (
                                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-xs font-semibold text-gray-700">{comment.author}</span>
                                      <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{comment.text}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* New Complaint Modal */}
        {showNewComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
              <form onSubmit={handleSubmitComplaint}>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Submit New Complaint</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Brief description of the issue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        required
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Detailed description of the problem"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Maintenance">Maintenance</option>
                          <option value="IT Support">IT Support</option>
                          <option value="Plumbing">Plumbing</option>
                          <option value="Electrical">Electrical</option>
                          <option value="Housekeeping">Housekeeping</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-xl">
                  <button
                    type="button"
                    onClick={() => setShowNewComplaint(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && <FaSpinner className="animate-spin w-3 h-3" />}
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyComplaints;
