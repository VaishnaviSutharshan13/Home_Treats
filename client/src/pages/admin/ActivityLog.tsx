/**
 * Admin Activity Log Page
 * Displays a paginated, filterable table of all admin actions.
 * Route: /admin/activity-log  (admin-only)
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBars,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaUsers,
  FaBed,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaChevronLeft,
  FaChevronRight,
  FaHistory,
  FaTimes,
} from 'react-icons/fa';
import Sidebar from '../../components/layout/Sidebar';
import { adminLogService } from '../../services';

interface LogEntry {
  _id: string;
  adminName: string;
  adminId: string;
  action: string;
  targetType: 'student' | 'room' | 'complaint' | 'fee';
  targetId: string;
  details?: string;
  timestamp: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ActivityLog = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 15, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [searchName, setSearchName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { page, limit: 15 };
      if (filterType) params.targetType = filterType;
      if (filterAction) params.action = filterAction;
      if (searchName) params.adminName = searchName;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await adminLogService.getLogs(params);
      if (res.success) {
        setLogs(res.data);
        setPagination(res.pagination);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterAction, searchName, startDate, endDate]);

  const clearFilters = () => {
    setFilterType('');
    setFilterAction('');
    setSearchName('');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = filterType || filterAction || searchName || startDate || endDate;

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'student': return <FaUsers className="w-3.5 h-3.5 text-purple-600" />;
      case 'room': return <FaBed className="w-3.5 h-3.5 text-purple-600" />;
      case 'complaint': return <FaExclamationTriangle className="w-3.5 h-3.5 text-amber-600" />;
      case 'fee': return <FaMoneyBillWave className="w-3.5 h-3.5 text-violet-600" />;
      default: return <FaHistory className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  const getTargetBadge = (type: string) => {
    const map: Record<string, string> = {
      student: 'bg-purple-500/10 text-purple-600',
      room: 'bg-purple-50 text-purple-700',
      complaint: 'bg-amber-50 text-amber-700',
      fee: 'bg-violet-50 text-violet-700',
    };
    return map[type] || 'bg-gray-100 text-gray-600';
  };

  const formatDateTime = (ts: string) =>
    new Date(ts).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} userRole="admin" />

      <div className="lg:ml-64">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-purple-500/10 px-5 sm:px-7 lg:px-8 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
              >
                <FaBars className="w-5 h-5" />
              </button>
              <div>
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center gap-1.5 text-gray-500 hover:text-purple-600 text-sm mb-1 transition-colors duration-200 group"
                >
                  <FaChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform duration-200" />
                  <span>Dashboard</span>
                  <span className="text-gray-600 mx-0.5">/</span>
                  <span className="text-gray-500">Activity Log</span>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
                <p className="text-sm text-gray-500 mt-0.5">Track all admin actions across the system</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border transition ${
                  showFilters || hasActiveFilters
                    ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-purple-500/5'
                }`}
              >
                <FaFilter className="w-3.5 h-3.5" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10 space-y-6">
          {/* Filters Panel */}
          <div
            className={`bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 ${
              showFilters ? 'max-h-96 opacity-100 p-5' : 'max-h-0 opacity-0 p-0 border-0'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search admin name */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Admin Name</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Search admin..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              {/* Filter by action */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Action</label>
                <input
                  type="text"
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  placeholder="e.g. Added, Deleted..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>

              {/* Filter by target type */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Target Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-gray-100 text-gray-900"
                >
                  <option value="">All Types</option>
                  <option value="student">Student</option>
                  <option value="room">Room</option>
                  <option value="complaint">Complaint</option>
                  <option value="fee">Fee</option>
                </select>
              </div>

              {/* Start date */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Start Date</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              {/* End date */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">End Date</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                >
                  <FaTimes className="w-3 h-3" />
                  Clear Filters
                </button>
                <span className="text-xs text-gray-500">{pagination.total} result{pagination.total !== 1 ? 's' : ''} found</span>
              </div>
            )}
          </div>

          {/* Table Card */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="relative w-12 h-12 mx-auto mb-3">
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                  </div>
                  <p className="text-sm text-gray-500">Loading activity logs...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <FaExclamationTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={() => fetchLogs(pagination.page)}
                    className="mt-3 px-4 py-1.5 text-sm font-medium text-purple-600 bg-purple-500/10 rounded-lg hover:bg-purple-500/10 transition"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <FaHistory className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No activity logs found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {hasActiveFilters ? 'Try adjusting your filters' : 'Admin actions will appear here'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Admin</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Action</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Type</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Target ID</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Details</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {logs.map((log) => (
                        <tr key={log._id} className="hover:bg-purple-500/5 transition-colors border-b border-gray-200/50">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-gray-900 text-xs font-semibold flex-shrink-0">
                                {log.adminName.split('@')[0].slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-gray-100 truncate max-w-[140px]">{log.adminName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-gray-600">{log.action}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${getTargetBadge(log.targetType)}`}>
                              {getTargetIcon(log.targetType)}
                              {log.targetType.charAt(0).toUpperCase() + log.targetType.slice(1)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                              {log.targetId.length > 12 ? `${log.targetId.slice(0, 6)}...${log.targetId.slice(-4)}` : log.targetId}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-gray-500 truncate max-w-[160px] block">{log.details || '—'}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-gray-500 whitespace-nowrap">{formatDateTime(log.timestamp)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {logs.map((log) => (
                    <div key={log._id} className="p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-gray-900 text-xs font-semibold flex-shrink-0 mt-0.5">
                          {log.adminName.split('@')[0].slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-100">{log.action}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{log.adminName}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full ${getTargetBadge(log.targetType)}`}>
                              {getTargetIcon(log.targetType)}
                              {log.targetType}
                            </span>
                            {log.details && (
                              <span className="text-xs text-gray-500">{log.details}</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1.5">{formatDateTime(log.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
                <p className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                  <span className="hidden sm:inline"> — {pagination.total} total entries</span>
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fetchLogs(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <FaChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchLogs(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                          pageNum === pagination.page
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => fetchLogs(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <FaChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
