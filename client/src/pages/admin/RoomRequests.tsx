/**
 * Admin Room Requests Page – Home_Treats
 * Displays all student room requests with status badges and action buttons.
 * Allows admin to approve or reject requests.
 */

import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimes, FaSearch, FaFilter, FaSync, FaBars, FaTrash } from 'react-icons/fa';
import Sidebar from '../../components/layout/Sidebar';
import { roomRequestService } from '../../services';

interface RoomRequest {
  _id: string;
  studentName: string;
  studentId: string;
  email: string;
  phone: string;
  roomNumber: string;
  floor: string;
  moveInDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  createdAt: string;
}

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
  cancelled?: number;
  total: number;
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
  ) {
    return (error as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;
  }
  return fallback;
};

export default function RoomRequests() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [requests, setRequests] = useState<RoomRequest[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'>('All');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await roomRequestService.getAllRequests();
      if (response?.success) {
        setRequests(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: unknown) {
      console.error('Error fetching requests:', error);
      setErrorMessage(getApiErrorMessage(error, 'Failed to load requests'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await roomRequestService.getStats();
      if (response?.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, []);

  const handleApprove = async (id: string, studentName: string, roomNumber: string) => {
    setProcessing(id);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const response = await roomRequestService.approve(id);
      if (response?.success) {
        setSuccessMessage(`${studentName}'s request for Room ${roomNumber} approved!`);
        fetchRequests();
        fetchStats();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error: unknown) {
      console.error('Error approving request:', error);
      setErrorMessage(getApiErrorMessage(error, 'Failed to approve request'));
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string, studentName: string, roomNumber: string) => {
    setProcessing(id);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const response = await roomRequestService.reject(id);
      if (response?.success) {
        setSuccessMessage(`${studentName}'s request for Room ${roomNumber} rejected.`);
        fetchRequests();
        fetchStats();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error: unknown) {
      console.error('Error rejecting request:', error);
      setErrorMessage(getApiErrorMessage(error, 'Failed to reject request'));
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string, studentName: string, roomNumber: string) => {
    const confirmed = window.confirm(`Delete room request of ${studentName} for Room ${roomNumber}?`);
    if (!confirmed) return;

    setProcessing(id);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const response = await roomRequestService.delete(id);
      if (response?.success) {
        setSuccessMessage(`${studentName}'s request for Room ${roomNumber} deleted.`);
        setRequests((prev) => prev.filter((req) => req._id !== id));
        fetchStats();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error: unknown) {
      console.error('Error deleting request:', error);
      setErrorMessage(getApiErrorMessage(error, 'Failed to delete request'));
    } finally {
      setProcessing(null);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = 
      req.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || req.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    if (status === 'Pending') return 'bg-amber-500/10 text-amber-600 border-amber-200/30';
    if (status === 'Approved') return 'bg-success/10 text-success border-success/20';
    if (status === 'Rejected') return 'bg-error/10 text-error border-error/20';
    return 'bg-muted text-muted-foreground';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Approved') return <FaCheckCircle className="w-3.5 h-3.5" />;
    if (status === 'Rejected') return <FaTimes className="w-3.5 h-3.5" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        userRole="admin"
      />

      <main className="transition-all duration-300 lg:ml-64">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-card border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <FaBars className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Room Requests</h1>
              <p className="text-sm text-muted-foreground">Review and process student requests</p>
            </div>
          </div>
          <button
            onClick={() => {
              fetchRequests();
              fetchStats();
            }}
            disabled={loading}
            className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <FaSync className={`w-5 h-5 text-primary ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
              {errorMessage}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="text-sm text-muted-foreground mb-1">Pending</div>
              <div className="flex items-end gap-2">
                <div className="text-3xl font-bold text-amber-500">{stats.pending}</div>
                <div className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 text-xs font-semibold">
                  {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <div className="text-sm text-muted-foreground mb-1">Approved</div>
              <div className="flex items-end gap-2">
                <div className="text-3xl font-bold text-success">{stats.approved}</div>
                <div className="px-2 py-1 rounded-md bg-success/10 text-success text-xs font-semibold">
                  {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <div className="text-sm text-muted-foreground mb-1">Rejected</div>
              <div className="flex items-end gap-2">
                <div className="text-3xl font-bold text-error">{stats.rejected}</div>
                <div className="px-2 py-1 rounded-md bg-error/10 text-error text-xs font-semibold">
                  {stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <div className="text-sm text-muted-foreground mb-1">Total</div>
              <div className="text-3xl font-bold text-primary">{stats.total}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-xl border border-border p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name, ID, room, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaFilter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'All' | 'Pending' | 'Approved' | 'Rejected' | 'Cancelled')}
                  className="px-3 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <FaSync className="w-5 h-5 animate-spin" />
                <span>Loading requests...</span>
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <FaSearch className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No requests found</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Requested Room
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Move In Date
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredRequests.map((request) => (
                      <tr
                        key={request._id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 sm:px-6 py-4">
                          <div className="font-medium text-foreground">{request.studentName}</div>
                          <div className="text-xs text-muted-foreground">{request.email}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-foreground">
                          {request.studentId}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-foreground">
                          <div className="font-medium">{request.roomNumber}</div>
                          <div className="text-xs text-muted-foreground">{request.floor}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-foreground">
                          {request.phone}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-foreground">
                          {new Date(request.moveInDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusBadgeColor(
                              request.status
                            )}`}
                          >
                            {getStatusIcon(request.status)}
                            {request.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-2">
                            {request.status === 'Pending' ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleApprove(request._id, request.studentName, request.roomNumber)
                                  }
                                  disabled={processing === request._id}
                                  className="px-3 py-1.5 bg-success/10 text-success hover:bg-success/20 border border-success/20 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                  <FaCheckCircle className="w-3.5 h-3.5" />
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleReject(request._id, request.studentName, request.roomNumber)
                                  }
                                  disabled={processing === request._id}
                                  className="px-3 py-1.5 bg-error/10 text-error hover:bg-error/20 border border-error/20 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                  <FaTimes className="w-3.5 h-3.5" />
                                  Reject
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete(request._id, request.studentName, request.roomNumber)
                                  }
                                  disabled={processing === request._id}
                                  className="px-3 py-1.5 bg-error/10 text-error hover:bg-error/20 border border-error/20 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                  <FaTrash className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() =>
                                  handleDelete(request._id, request.studentName, request.roomNumber)
                                }
                                disabled={processing === request._id}
                                className="px-3 py-1.5 bg-error/10 text-error hover:bg-error/20 border border-error/20 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                <FaTrash className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
