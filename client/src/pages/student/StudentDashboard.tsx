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
  const userInitials = (user?.name || 'Student')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

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
      icon: <FaBed className="w-8 h-8 text-info" />,
      detail: 'Assigned room',
      bgColor: 'bg-info/15 border border-info/20',
    },
    {
      title: 'Monthly Fees',
      value: `LKR ${totalPendingAmount.toLocaleString()}`,
      icon: <FaDollarSign className="w-8 h-8 text-primary" />,
      detail: `${pendingFees.length} pending payment(s)`,
      bgColor: 'bg-primary/15 border border-primary/20',
    },
    {
      title: 'My Complaints',
      value: String(complaintCount),
      icon: <FaExclamationTriangle className="w-8 h-8 text-warning" />,
      detail: `${pendingComplaints.length} pending, ${resolvedComplaints.length} resolved`,
      bgColor: 'bg-warning/15 border border-warning/20',
    },
    {
      title: 'Profile Status',
      value: user?.status === 'Inactive' ? 'Inactive' : 'Active',
      icon: <FaUser className="w-8 h-8 text-primary" />,
      detail: user?.approvalStatus || 'Student account',
      bgColor: 'bg-primary/15 border border-primary/20',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Shared Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        userRole="student"
      />

      {/* Main Content Area */}
      <div className="lg:ml-64">
        {/* Top Navigation Bar */}
        <div className="bg-navbar shadow-sm border-b border-border sticky top-16 z-10 w-full bg-navbar/95 backdrop-blur">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile Menu Button */}
              <button
                title="Open sidebar"
                aria-label="Open sidebar"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Page Title */}
              <div className="flex-1 ml-4 lg:ml-0">
                <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
              </div>

              {/* Student Profile */}
              <div className="flex items-center space-x-4">
                <NotificationBell />
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user?.name || 'Student'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-white font-semibold">{userInitials}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Analytics Cards */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">My Overview</h2>
            <p className="text-muted-foreground">Your personal hostel information and status</p>
          </div>

          {booking && (
            <div className="mb-8 bg-card rounded-xl shadow-md border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Booking Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-muted/30 rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted-foreground">Booked Room Number</p>
                  <p className="text-base font-bold text-primary mt-1">{booking.roomNumber}</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted-foreground">Floor Number</p>
                  <p className="text-base font-bold text-primary mt-1">{booking.selectedFloor}</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted-foreground">Bed Number</p>
                  <p className="text-base font-bold text-primary mt-1">Bed {booking.bedNumber}</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted-foreground">Monthly Rent</p>
                  <p className="text-base font-bold text-primary mt-1">LKR {booking.monthlyRent}</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted-foreground">Booking Status</p>
                  <p className="text-base font-bold text-primary mt-1">{booking.status}</p>
                </div>
              </div>
            </div>
          )}

          {/* Student Analytics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {studentAnalytics.map((item, index) => (
              <div key={index} className="bg-card rounded-xl shadow-md border border-border hover:shadow-lg transition-all duration-300 p-6 hover:border-primary/50 group">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-16 h-16 ${item.bgColor} rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                </div>

                {/* Card Content */}
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">{item.value}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{item.title}</p>
                  <p className="text-xs text-subtle">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Student Content */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Notifications */}
            <div className="bg-card border border-border rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Notifications</h3>
              <div className="space-y-3">
                {recentNotifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent notifications</p>
                ) : (
                  recentNotifications.map((notification, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start space-x-3 p-3 rounded-lg border ${
                        notification.color === 'green' ? 'bg-primary/5 border-primary/20' : 'bg-warning/5 border-warning/20'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          notification.color === 'green' ? 'bg-primary' : 'bg-warning'
                        }`}
                      ></div>
                      <div>
                        <p className="text-sm text-foreground font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{notification.description}</p>
                        <p className="text-xs text-subtle mt-1">{formatTimeAgo(notification.date)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/student/my-complaints"
                  className="block w-full text-left p-4 bg-warning/5 border border-warning/20 hover:bg-warning/10 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <FaExclamationTriangle className="w-5 h-5 text-warning" />
                    <div>
                      <p className="text-sm font-medium text-foreground">My Complaints</p>
                      <p className="text-xs text-muted-foreground">View or submit complaints</p>
                    </div>
                  </div>
                </Link>
                <Link
                  to="/student/my-fees"
                  className="block w-full text-left p-4 bg-primary/5 border border-primary/20 hover:bg-primary/10 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <FaDollarSign className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">My Fees</p>
                      <p className="text-xs text-muted-foreground">View fees &amp; payment history</p>
                    </div>
                  </div>
                </Link>
                <Link
                  to="/student/profile"
                  className="block w-full text-left p-4 bg-primary/5 border border-primary/20 hover:bg-primary/10 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <FaUser className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Profile</p>
                      <p className="text-xs text-muted-foreground">View &amp; edit personal information</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-8 bg-info/10 border border-info/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-info rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-info-foreground text-xs font-bold">i</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-info mb-1">Important Notice</h4>
                <p className="text-sm text-info/90">
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
