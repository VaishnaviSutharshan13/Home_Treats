/**
 * Admin Dashboard — Advanced Analytics
 * Modern SaaS-style dashboard with Recharts visualizations,
 * real-time stats, monthly revenue chart, room occupancy donut,
 * recent students widget, and quick actions.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUsers,
  FaBed,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaUserGraduate,
  FaChevronRight,
  FaBars,
} from 'react-icons/fa';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { adminService, bookingService } from '../../services';
import Sidebar from '../../components/layout/Sidebar';
import NotificationBell from '../../components/NotificationBell';

/* ────────────────────────── Types ────────────────────────── */

interface StatsData {
  students: { total: number; active: number; inactive: number };
  rooms: { total: number; occupied: number; available: number; maintenance: number; occupancyRate: string };
  complaints: { total: number; pending: number; resolved: number; inProgress: number; resolutionRate: string };
  fees: { total: number; paid: number; pending: number; collectionRate: string; totalRevenue: number; pendingRevenue: number; currency: string; unpaidStudents: number };
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  count: number;
}

interface OccupancyItem {
  name: string;
  value: number;
  color: string;
}

interface RecentStudent {
  _id: string;
  name: string;
  studentId: string;
  room: string;
  status: string;
  course: string;
  year: string;
  registeredAt: string;
}

interface Activity {
  type: string;
  action: string;
  time: string;
  icon: string;
  details: string;
}

interface BookingRequest {
  _id: string;
  studentName: string;
  email: string;
  roomNumber: string;
  bedNumber: number;
  status: 'Confirmed' | 'Cancelled';
  selectedFloor: string;
  createdAt: string;
}

const getOccupancyColorClasses = (name: string) => {
  switch (name.toLowerCase()) {
    case 'occupied':
      return { dot: 'bg-primary', bg: 'bg-primary/10', text: 'text-primary' };
    case 'available':
      return { dot: 'bg-primary', bg: 'bg-primary/10', text: 'text-primary' };
    case 'maintenance':
      return { dot: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-500' };
    default:
      return { dot: 'bg-gray-500', bg: 'bg-gray-100', text: 'text-gray-600' };
  }
};

/* ──────────────── Custom Recharts Tooltip ──────────────── */

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-active/50 rounded-xl border border-primary/20 px-4 py-3">
      <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-sm text-primary">
        Revenue: <span className="font-bold">LKR {payload[0].value.toLocaleString()}</span>
      </p>
      {payload[0].payload.count > 0 && (
        <p className="text-xs text-gray-500 mt-1">{payload[0].payload.count} payment{payload[0].payload.count !== 1 ? 's' : ''}</p>
      )}
    </div>
  );
};

const OccupancyTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const colors = getOccupancyColorClasses(payload[0].name || '');
  return (
    <div className="bg-surface-active/50 rounded-xl border border-primary/20 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
        <span className="text-sm font-medium text-gray-700">{payload[0].name}</span>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        <span className="font-bold text-gray-900">{payload[0].value}</span> rooms
      </p>
    </div>
  );
};

/* ──────────────────── Dashboard Component ──────────────────── */

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [occupancyData, setOccupancyData] = useState<OccupancyItem[]>([]);
  const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [revenueYear, setRevenueYear] = useState(new Date().getFullYear());
  const [totalAnnual, setTotalAnnual] = useState(0);
  const [chartsLoaded, setChartsLoaded] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const results = await Promise.allSettled([
          adminService.getStats(),
          adminService.getActivities(),
          adminService.getMonthlyRevenue(revenueYear),
          adminService.getRoomOccupancy(),
          adminService.getRecentStudents(5),
          bookingService.getAdminBookings(),
        ]);

        // Default stats structure if API fails
        const defaultStats: StatsData = {
          students: { total: 0, active: 0, inactive: 0 },
          rooms: { total: 0, occupied: 0, available: 0, maintenance: 0, occupancyRate: '0' },
          complaints: { total: 0, pending: 0, resolved: 0, inProgress: 0, resolutionRate: '0' },
          fees: { total: 0, paid: 0, pending: 0, collectionRate: '0', totalRevenue: 0, pendingRevenue: 0, currency: 'LKR', unpaidStudents: 0 },
        };

        // Process each result individually
        if (results[0].status === 'fulfilled' && results[0].value?.success) {
          setStats(results[0].value.data);
        } else {
          setStats(defaultStats);
          if (results[0].status === 'rejected') {
            console.error('Stats fetch failed:', results[0].reason);
          }
        }

        if (results[1].status === 'fulfilled' && results[1].value?.success) setActivities(results[1].value.data || []);
        if (results[2].status === 'fulfilled' && results[2].value?.success) {
          setMonthlyRevenue(results[2].value.data?.months || []);
          setTotalAnnual(results[2].value.data?.totalAnnual || 0);
        }
        if (results[3].status === 'fulfilled' && results[3].value?.success) setOccupancyData(results[3].value.data?.chart || []);
        if (results[4].status === 'fulfilled' && results[4].value?.success) setRecentStudents(results[4].value.data || []);
        if (results[5].status === 'fulfilled' && results[5].value?.success) setBookings((results[5].value.data || []).slice(0, 8));

        // Trigger chart animations after data loads
        setTimeout(() => setChartsLoaded(true), 100);
      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
      }
    };
    fetchAll();
  }, [revenueYear]);

  const formatLKR = (amount: number) =>
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const handleBookingStatusUpdate = async (bookingId: string, status: 'Confirmed' | 'Cancelled') => {
    try {
      const response = await bookingService.updateStatus(bookingId, status);
      if (response.success) {
        setBookings((prev) => prev.map((booking) => (
          booking._id === bookingId ? { ...booking, status } : booking
        )));
      }
    } catch (error) {
      console.error('Failed to update booking status', error);
    }
  };

  // Ensure we always have stats (use defaults if needed)
  const adminStats = stats || {
    students: { total: 0, active: 0, inactive: 0 },
    rooms: { total: 0, occupied: 0, available: 0, maintenance: 0, occupancyRate: '0' },
    complaints: { total: 0, pending: 0, resolved: 0, inProgress: 0, resolutionRate: '0' },
    fees: { total: 0, paid: 0, pending: 0, collectionRate: '0', totalRevenue: 0, pendingRevenue: 0, currency: 'LKR', unpaidStudents: 0 },
  };

  /* --- ALWAYS render layout, show content or loading/error inside --- */

  /* --- Stat Cards Config --- */
  const statCards = [
    {
      title: 'Total Students',
      value: adminStats.students.total,
      subtitle: `${adminStats.students.active} active, ${adminStats.students.inactive} inactive`,
      icon: <FaUsers className="w-6 h-6" />,
      iconBg: 'bg-primary',
      trend: adminStats.students.active > 0 ? 'up' : 'neutral',
      trendValue: `${((adminStats.students.active / Math.max(adminStats.students.total, 1)) * 100).toFixed(0)}% active`,
      link: '/admin/student-management',
    },
    {
      title: 'Total Rooms',
      value: adminStats.rooms.total,
      subtitle: `${adminStats.rooms.available} available`,
      icon: <FaBed className="w-6 h-6" />,
      iconBg: 'bg-primary',
      trend: Number(adminStats.rooms.occupancyRate) > 75 ? 'up' : 'neutral',
      trendValue: `${adminStats.rooms.occupancyRate}% occupied`,
      link: '/admin/room-management',
    },
    {
      title: 'Complaints',
      value: adminStats.complaints.total,
      subtitle: `${adminStats.complaints.pending} pending`,
      icon: <FaExclamationTriangle className="w-6 h-6" />,
      iconBg: 'bg-amber-500',
      trend: adminStats.complaints.pending > 0 ? 'down' : 'up',
      trendValue: `${adminStats.complaints.resolutionRate}% resolved`,
      link: '/admin/complaint-management',
    },
    {
      title: 'Total Revenue',
      value: formatLKR(adminStats.fees.totalRevenue),
      subtitle: `${adminStats.fees.collectionRate}% collected`,
      icon: <FaMoneyBillWave className="w-6 h-6" />,
      iconBg: 'bg-secondary/100',
      trend: Number(adminStats.fees.collectionRate) > 50 ? 'up' : 'down',
      trendValue: `${formatLKR(adminStats.fees.pendingRevenue)} pending`,
      link: '/admin/fees-management',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} userRole="admin" />

      {/* Main Content — offset by fixed sidebar on desktop */}
      <div className="lg:ml-64">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-primary/10 px-5 sm:px-7 lg:px-8 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                title="Open sidebar"
                aria-label="Open sidebar"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
              >
                <FaBars className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">Welcome back! Here is your hostel analytics.</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-sm text-gray-500">
              <NotificationBell />
              <div className="w-px h-5 bg-gray-100" />
              <FaCalendarAlt className="w-3.5 h-3.5" />
              <span className="text-xs">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10 space-y-6">

          {/* --- ROW 1: Stat Cards --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((card, idx) => (
              <Link
                key={idx}
                to={card.link}
                className={`group bg-white rounded-2xl border border-gray-200 p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 ${
                  idx === 0 ? 'delay-75' : idx === 1 ? 'delay-150' : idx === 2 ? 'delay-200' : 'delay-300'
                } ${
                  chartsLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 ${card.iconBg} rounded-xl flex items-center justify-center text-white shadow-sm`}>
                    {card.icon}
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    card.trend === 'up' ? 'bg-primary/15 text-primary' :
                    card.trend === 'down' ? 'bg-red-500/15 text-red-400' :
                    'bg-gray-100/60 text-gray-500'
                  }`}>
                    {card.trend === 'up' ? <FaArrowUp className="w-2.5 h-2.5" /> :
                     card.trend === 'down' ? <FaArrowDown className="w-2.5 h-2.5" /> : null}
                    <span>{card.trendValue}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">{card.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{card.subtitle}</p>
              </Link>
            ))}
          </div>

          {/* --- ROW 2: Monthly Revenue Chart --- */}
          <div
            className={`bg-white rounded-2xl border border-primary/20 p-6 transition-all duration-500 ${
              'delay-300 '
            }${
              chartsLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue (LKR)</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Total {revenueYear}: <span className="font-semibold text-gray-700">{formatLKR(totalAnnual)}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRevenueYear(revenueYear - 1)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-primary/10 hover:border-primary/40 transition text-gray-500"
                >
                  &larr;
                </button>
                <span className="text-sm font-semibold text-gray-700 min-w-[3rem] text-center">{revenueYear}</span>
                <button
                  onClick={() => setRevenueYear(revenueYear + 1)}
                  disabled={revenueYear >= new Date().getFullYear()}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-primary/10 hover:border-primary/40 transition text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  &rarr;
                </button>
              </div>
            </div>

            <div className="h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v.toString()}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* --- ROW 3: Room Occupancy + Recent Students --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Room Occupancy Donut */}
            <div
              className={`bg-white rounded-2xl border border-primary/20 p-6 transition-all duration-500 ${
                'delay-500 '
              }${
                chartsLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Room Occupancy Overview</h3>
              <p className="text-sm text-gray-500 mb-4">{adminStats.rooms.total} total rooms</p>

              {occupancyData.every(d => d.value === 0) ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <FaBed className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No room data available</p>
                  </div>
                </div>
              ) : (
                <div className="h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={occupancyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                        animationDuration={1000}
                        animationEasing="ease-out"
                        stroke="none"
                      >
                        {occupancyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<OccupancyTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value: string) => (
                          <span className="text-sm text-gray-600">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Mini stats under chart */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {occupancyData.map((item) => (
                  <div
                    key={item.name}
                    className={`text-center p-2 rounded-xl ${getOccupancyColorClasses(item.name).bg}`}
                  >
                    <p className={`text-xl font-bold ${getOccupancyColorClasses(item.name).text}`}>{item.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Students Widget */}
            <div
              className={`bg-white rounded-2xl border border-primary/20 p-6 transition-all duration-500 ${
                'delay-500 '
              }${
                chartsLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Students</h3>
                  <p className="text-sm text-gray-500">Latest registrations</p>
                </div>
                <Link
                  to="/admin/student-management"
                  className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary transition"
                >
                  View All <FaChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {recentStudents.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <FaUserGraduate className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No students registered yet</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentStudents.map((student) => (
                    <div
                      key={student._id}
                      className={`flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 transition-all duration-300 ${
                        chartsLoaded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">{student.name}</p>
                          <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                            student.status === 'Active' ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {student.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {student.studentId} &bull; Room {student.room}
                        </p>
                      </div>

                      {/* Date */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-500">{formatDate(student.registeredAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link
                to="/admin/student-management"
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary/10 transition"
              >
                <FaUsers className="w-4 h-4" />
                View All Students
              </Link>
            </div>
          </div>

          {/* --- ROW 4: Room Booking Requests --- */}
          <div
            className={`bg-white rounded-2xl border border-primary/20 p-6 transition-all duration-500 ${
              'delay-700 '
            }${
              chartsLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Room Booking Requests</h3>
              <span className="text-xs text-gray-500">Confirmed booking records</span>
            </div>

            {bookings.length === 0 ? (
              <div className="text-sm text-gray-500 py-6 text-center">No booking requests yet</div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {bookings.map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between p-3 bg-surface-active/50 rounded-xl border border-primary/10">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{booking.studentName}</p>
                      <p className="text-xs text-gray-600">
                        {booking.email}
                      </p>
                      <p className="text-xs text-gray-600">
                        Room {booking.roomNumber} • Floor {booking.selectedFloor} • Bed {booking.bedNumber}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {new Date(booking.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        booking.status === 'Confirmed' ? 'bg-primary/15 text-primary' : 'bg-red-50 text-red-400'
                      }`}>
                        {booking.status}
                      </span>
                      {booking.status === 'Confirmed' ? (
                        <button
                          type="button"
                          onClick={() => handleBookingStatusUpdate(booking._id, 'Cancelled')}
                          className="text-xs px-2 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBookingStatusUpdate(booking._id, 'Confirmed')}
                          className="text-xs px-2 py-1 rounded-lg border border-primary/20 text-primary hover:bg-primary/10 transition"
                        >
                          Reconfirm
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* --- ROW 4: Complaint Status + Fee Collection + Recent Activity --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Complaint Status */}
            <div
              className={`bg-white rounded-2xl border border-primary/20 p-6 transition-all duration-500 ${
                'delay-700 '
              }${
                chartsLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaint Status</h3>
              <div className="space-y-4">
                {[
                  { label: 'Pending', count: adminStats.complaints.pending, color: 'bg-amber-500', bgLight: 'bg-amber-500/10' },
                  { label: 'In Progress', count: adminStats.complaints.inProgress, color: 'bg-primary', bgLight: 'bg-primary/10' },
                  { label: 'Resolved', count: adminStats.complaints.resolved, color: 'bg-primary', bgLight: 'bg-primary/10' },
                ].map((item) => {
                  const pct = adminStats.complaints.total > 0
                    ? ((item.count / adminStats.complaints.total) * 100).toFixed(0)
                    : '0';
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                          <span className="text-sm text-gray-500">{item.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{item.count}</span>
                      </div>
                      <div className={`w-full ${item.bgLight} rounded-full h-2`}>
                        <progress
                          className={`w-full ${item.color} h-2 rounded-full transition-all duration-1000`}
                          value={chartsLoaded ? Number(pct) : 0}
                          max={100}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Resolution Rate</span>
                  <span className="font-bold text-primary">{adminStats.complaints.resolutionRate}%</span>
                </div>
              </div>
              <Link
                to="/admin/complaint-management"
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-amber-400 bg-amber-500/10 rounded-xl hover:bg-amber-500/20 transition"
              >
                <FaExclamationTriangle className="w-4 h-4" />
                Manage Complaints
              </Link>
            </div>

            {/* Fee Collection Overview */}
            <div
              className={`bg-white rounded-2xl border border-primary/20 p-6 transition-all duration-500 ${
                'delay-700 '
              }${
                chartsLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Collection</h3>

              {/* Circular progress */}
              <div className="flex items-center justify-center mb-5">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke="#7c3aed" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={chartsLoaded
                        ? `${2 * Math.PI * 42 * (1 - Number(adminStats.fees.collectionRate) / 100)}`
                        : `${2 * Math.PI * 42}`
                      }
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{adminStats.fees.collectionRate}%</span>
                    <span className="text-xs text-gray-500">Collected</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Collected</span>
                  <span className="text-sm font-semibold text-primary">{formatLKR(adminStats.fees.totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Pending</span>
                  <span className="text-sm font-semibold text-amber-400">{formatLKR(adminStats.fees.pendingRevenue)}</span>
                </div>
                {adminStats.fees.unpaidStudents > 0 && (
                  <div className="flex items-center gap-2 bg-red-500/10 text-red-400 text-xs rounded-xl px-3 py-2 mt-2 font-medium">
                    <FaExclamationTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{adminStats.fees.unpaidStudents} student{adminStats.fees.unpaidStudents !== 1 ? 's' : ''} with unpaid fees</span>
                  </div>
                )}
              </div>
              <Link
                to="/admin/fees-management"
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition"
              >
                <FaMoneyBillWave className="w-4 h-4" />
                Manage Fees
              </Link>
            </div>

            {/* Recent Activity */}
            <div
              className={`bg-white rounded-2xl border border-primary/20 p-6 transition-all duration-500 ${
                'delay-700 '
              }${
                chartsLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              {activities.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-500">
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                  {activities.slice(0, 8).map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                        activity.type === 'student' ? 'bg-primary/15 text-primary' :
                        activity.type === 'complaint' ? 'bg-amber-500/15 text-amber-400' :
                        'bg-primary/15 text-primary'
                      }`}>
                        {activity.type === 'student' ? <FaUserGraduate /> : activity.type === 'complaint' ? <FaExclamationTriangle /> : <FaMoneyBillWave />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.details} &bull; {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* --- ROW 5: Quick Actions --- */}
          <div
            className={`bg-white rounded-2xl border border-primary/20 p-6 transition-all duration-500 ${
              'delay-1000 '
            }${
              chartsLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Students', link: '/admin/student-management', icon: <FaUsers className="w-5 h-5" />, color: 'text-primary bg-primary/10 hover:bg-primary/20 hover:shadow-md' },
                { label: 'Rooms', link: '/admin/room-management', icon: <FaBed className="w-5 h-5" />, color: 'text-primary bg-primary/10 hover:bg-primary/20 hover:shadow-md' },
                { label: 'Fees', link: '/admin/fees-management', icon: <FaMoneyBillWave className="w-5 h-5" />, color: 'text-secondary bg-secondary/100/10 hover:bg-secondary/100/20 hover:shadow-md' },
                { label: 'Complaints', link: '/admin/complaint-management', icon: <FaExclamationTriangle className="w-5 h-5" />, color: 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 hover:shadow-md' },
              ].map((action, idx) => (
                <Link
                  key={idx}
                  to={action.link}
                  className={`flex flex-col items-center gap-2.5 p-5 rounded-2xl transition-all duration-200 ${action.color}`}
                >
                  {action.icon}
                  <span className="text-sm font-semibold">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
