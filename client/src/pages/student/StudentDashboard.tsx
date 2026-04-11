/**
 * Student Dashboard Layout
 * Personalized dashboard for student users with real API data
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBed, FaDollarSign, FaExclamationTriangle, FaUser, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { feesService, complaintService, bookingService, notificationService } from '../../services';
import Sidebar from '../../components/layout/Sidebar';
import NotificationBell from '../../components/NotificationBell';

interface Fee {
  _id: string;
  amount: number;
  status: string;
  dueDate?: string;
  month?: string;
}

interface Complaint {
  _id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Booking {
  _id: string;
  roomNumber: string;
  selectedFloor: string;
  bedNumber: number;
  monthlyRent: number;
  status: 'Confirmed' | 'Cancelled';
}

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'announcement' | 'fee' | 'complaint' | 'room' | 'student' | 'booking' | 'payment';
  createdAt: string;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState<Fee[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const normalizedStudentId = user?.studentId?.trim();
  const normalizeStatus = (value?: string) => value?.trim().toLowerCase() || '';

  useEffect(() => {
    if (!normalizedStudentId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [feesRes, complaintsRes, bookingRes, notifRes] = await Promise.all([
          feesService.getByStudent(normalizedStudentId),
          complaintService.getByStudent(normalizedStudentId),
          bookingService.getMyBooking(),
          notificationService.getAll({ limit: 6 }),
        ]);

        setFees(feesRes.data || feesRes || []);
        setComplaints(complaintsRes.data || complaintsRes || []);
        setBooking(bookingRes?.data || null);
        setNotifications(notifRes?.data || []);
      } catch (error) {
        console.error('Failed to fetch student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [normalizedStudentId]);

  const pendingFees = Array.isArray(fees)
    ? fees.filter((f) => ['pending', 'unpaid', 'overdue', 'partial'].includes(normalizeStatus(f.status)))
    : [];
  const totalPendingAmount = pendingFees.reduce((sum, f) => sum + (f.amount || 0), 0);

  const complaintCount = Array.isArray(complaints) ? complaints.length : 0;
  const pendingComplaints = Array.isArray(complaints)
    ? complaints.filter((c) => ['pending', 'open', 'in progress', 'in-progress'].includes(normalizeStatus(c.status)))
    : [];
  const resolvedComplaints = Array.isArray(complaints)
    ? complaints.filter((c) => ['resolved', 'closed'].includes(normalizeStatus(c.status)))
    : [];

  const complaintDerivedNotifications = [
    ...resolvedComplaints.slice(0, 3).map((c) => ({
      type: 'resolved' as const,
      title: 'Complaint Resolved',
      description: c.title || c.description?.slice(0, 60) || 'Your complaint has been resolved',
      date: c.updatedAt,
      color: 'green',
    })),
    ...pendingComplaints.slice(0, 3).map((c) => ({
      type: 'pending' as const,
      title: 'Complaint Pending',
      description: c.title || c.description?.slice(0, 60) || 'Your complaint is being reviewed',
      date: c.createdAt,
      color: 'orange',
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const recentNotifications = notifications.length > 0
    ? notifications.slice(0, 5).map((n) => ({
        title: n.title,
        description: n.message,
        date: n.createdAt,
        color: n.type === 'student' ? 'green' : 'orange',
      }))
    : complaintDerivedNotifications;

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  };

  const studentAnalytics = [
    {
      title: 'My Room',
      value: booking?.roomNumber || user?.room || 'N/A',
      icon: <FaBed className="w-8 h-8 text-blue-600" />,
      detail: 'Assigned room',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Monthly Fees',
      value: `LKR ${totalPendingAmount.toLocaleString()}`,
      icon: <FaDollarSign className="w-8 h-8 text-purple-600" />,
      detail: `${pendingFees.length} pending payment(s)`,
      bgColor: 'bg-purple-50',
    },
    {
      title: 'My Complaints',
      value: String(complaintCount),
      icon: <FaExclamationTriangle className="w-8 h-8 text-orange-600" />,
      detail: `${pendingComplaints.length} pending, ${resolvedComplaints.length} resolved`,
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Profile Status',
      value: 'Active',
      icon: <FaUser className="w-8 h-8 text-purple-600" />,
      detail: 'Verified student',
      bgColor: 'bg-purple-50',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shared Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        userRole="student"
      />

      {/* Main Content Area */}
      <div className="lg:ml-64">
        {/* Top Navigation Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile Menu Button */}
              <button
                title="Open sidebar"
                aria-label="Open sidebar"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Page Title */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              </div>

              {/* Student Profile */}
              <div className="flex items-center space-x-4">
                <NotificationBell />
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Student'}</p>
                  <p className="text-xs text-gray-500">{user?.email || ''}</p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-semibold">{userInitials}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Analytics Cards */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">My Overview</h2>
            <p className="text-gray-600">Your personal hostel information and status</p>
          </div>

          {booking && (
            <div className="mb-8 bg-white rounded-xl shadow-lg border border-purple-500/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-[#f5f3ff] rounded-xl p-4 border border-purple-500/15">
                  <p className="text-xs text-gray-500">Booked Room Number</p>
                  <p className="text-base font-bold text-purple-600 mt-1">{booking.roomNumber}</p>
                </div>
                <div className="bg-[#f5f3ff] rounded-xl p-4 border border-purple-500/15">
                  <p className="text-xs text-gray-500">Floor Number</p>
                  <p className="text-base font-bold text-purple-600 mt-1">{booking.selectedFloor}</p>
                </div>
                <div className="bg-[#f5f3ff] rounded-xl p-4 border border-purple-500/15">
                  <p className="text-xs text-gray-500">Bed Number</p>
                  <p className="text-base font-bold text-purple-600 mt-1">Bed {booking.bedNumber}</p>
                </div>
                <div className="bg-[#f5f3ff] rounded-xl p-4 border border-purple-500/15">
                  <p className="text-xs text-gray-500">Monthly Rent</p>
                  <p className="text-base font-bold text-purple-600 mt-1">LKR {booking.monthlyRent}</p>
                </div>
                <div className="bg-[#f5f3ff] rounded-xl p-4 border border-purple-500/15">
                  <p className="text-xs text-gray-500">Booking Status</p>
                  <p className="text-base font-bold text-purple-600 mt-1">{booking.status}</p>
                </div>
              </div>
            </div>
          )}

          {/* Student Analytics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {studentAnalytics.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-16 h-16 ${item.bgColor} rounded-xl flex items-center justify-center`}>
                    {item.icon}
                  </div>
                </div>

                {/* Card Content */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{item.value}</h3>
                  <p className="text-gray-600 text-sm mb-2">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Student Content */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Notifications */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
              <div className="space-y-3">
                {recentNotifications.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No recent notifications</p>
                ) : (
                  recentNotifications.map((notification, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start space-x-3 p-3 rounded-lg ${
                        notification.color === 'green' ? 'bg-purple-50' : 'bg-orange-50'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          notification.color === 'green' ? 'bg-purple-600' : 'bg-orange-600'
                        }`}
                      ></div>
                      <div>
                        <p className="text-sm text-gray-700 font-medium">{notification.title}</p>
                        <p className="text-xs text-gray-500">{notification.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(notification.date)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/student/my-complaints"
                  className="block w-full text-left p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <FaExclamationTriangle className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">My Complaints</p>
                      <p className="text-xs text-gray-500">View or submit complaints</p>
                    </div>
                  </div>
                </Link>
                <Link
                  to="/student/my-fees"
                  className="block w-full text-left p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <FaDollarSign className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">My Fees</p>
                      <p className="text-xs text-gray-500">View fees &amp; payment history</p>
                    </div>
                  </div>
                </Link>
                <Link
                  to="/student/profile"
                  className="block w-full text-left p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <FaUser className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Profile</p>
                      <p className="text-xs text-gray-500">View &amp; edit personal information</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Important Notice</h4>
                <p className="text-sm text-blue-800">
                  Please ensure your profile information is up to date. Contact the hostel office for any room change requests or emergency situations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
