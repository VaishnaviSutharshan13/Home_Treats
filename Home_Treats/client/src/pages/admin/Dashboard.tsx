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
  FaChartLine,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaUserGraduate,
  FaChevronRight,
  FaBars,
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
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
import { adminService } from '../../services';
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

/* ──────────────── Custom Recharts Tooltip ──────────────── */

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3">
      <p className="text-sm font-semibold text-gray-800 mb-1">{label}</p>
      <p className="text-sm text-blue-600">
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
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
        <span className="text-sm font-medium text-gray-800">{payload[0].name}</span>
      </div>
      <p className="text-sm text-gray-600 mt-1">
        <span className="font-bold">{payload[0].value}</span> rooms
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
  const [revenueYear, setRevenueYear] = useState(new Date().getFullYear());
  const [totalAnnual, setTotalAnnual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartsLoaded, setChartsLoaded] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, activitiesRes, revenueRes, occupancyRes, studentsRes] = await Promise.all([
          adminService.getStats(),
          adminService.getActivities(),
          adminService.getMonthlyRevenue(revenueYear),
          adminService.getRoomOccupancy(),
          adminService.getRecentStudents(5),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (activitiesRes.success) setActivities(activitiesRes.data);
        if (revenueRes.success) {
          setMonthlyRevenue(revenueRes.data.months);
          setTotalAnnual(revenueRes.data.totalAnnual);
        }
        if (occupancyRes.success) setOccupancyData(occupancyRes.data.chart);
        if (studentsRes.success) setRecentStudents(studentsRes.data);

        // Trigger chart animations after data loads
        setTimeout(() => setChartsLoaded(true), 100);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [revenueYear]);

  const formatLKR = (amount: number) =>
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  /* --- Loading State --- */
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
          <p className="text-sm text-gray-400 mt-1">Fetching analytics data</p>
        </div>
      </div>
    );
  }

  /* --- Error State --- */
  if (error || !stats) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to load dashboard</h2>
          <p className="text-gray-500 mb-6">{error || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* --- Stat Cards Config --- */
  const statCards = [
    {
      title: 'Total Students',
      value: stats.students.total,
      subtitle: `${stats.students.active} active, ${stats.students.inactive} inactive`,
      icon: <FaUsers className="w-6 h-6" />,
      iconBg: 'bg-blue-500',
      trend: stats.students.active > 0 ? 'up' : 'neutral',
      trendValue: `${((stats.students.active / Math.max(stats.students.total, 1)) * 100).toFixed(0)}% active`,
      link: '/admin/student-management',
    },
    {
      title: 'Total Rooms',
      value: stats.rooms.total,
      subtitle: `${stats.rooms.available} available`,
      icon: <FaBed className="w-6 h-6" />,
      iconBg: 'bg-emerald-500',
      trend: Number(stats.rooms.occupancyRate) > 75 ? 'up' : 'neutral',
      trendValue: `${stats.rooms.occupancyRate}% occupied`,
      link: '/admin/room-management',
    },
    {
      title: 'Complaints',
      value: stats.complaints.total,
      subtitle: `${stats.complaints.pending} pending`,
      icon: <FaExclamationTriangle className="w-6 h-6" />,
      iconBg: 'bg-amber-500',
      trend: stats.complaints.pending > 0 ? 'down' : 'up',
      trendValue: `${stats.complaints.resolutionRate}% resolved`,
      link: '/admin/complaint-management',
    },
    {
      title: 'Total Revenue',
      value: formatLKR(stats.fees.totalRevenue),
      subtitle: `${stats.fees.collectionRate}% collected`,
      icon: <FaMoneyBillWave className="w-6 h-6" />,
      iconBg: 'bg-violet-500',
      trend: Number(stats.fees.collectionRate) > 50 ? 'up' : 'down',
      trendValue: `${formatLKR(stats.fees.pendingRevenue)} pending`,
      link: '/admin/fees-management',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} userRole="admin" />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
              >
                <FaBars className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here is your hostel analytics.</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-sm text-gray-500">
              <NotificationBell />
              <div className="w-px h-6 bg-gray-200" />
              <FaCalendarAlt className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">

          {/* --- ROW 1: Stat Cards --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {statCards.map((card, idx) => (
              <Link
                key={idx}
                to={card.link}
                className={`group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all duration-300 ${
                  chartsLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
                style={{ transitionDelay: `${idx * 75}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 ${card.iconBg} rounded-xl flex items-center justify-center text-white shadow-sm`}>
                    {card.icon}
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    card.trend === 'up' ? 'bg-emerald-50 text-emerald-700' :
                    card.trend === 'down' ? 'bg-red-50 text-red-700' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {card.trend === 'up' ? <FaArrowUp className="w-2.5 h-2.5" /> :
                     card.trend === 'down' ? <FaArrowDown className="w-2.5 h-2.5" /> : null}
                    <span>{card.trendValue}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">{card.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{card.subtitle}</p>
              </Link>
            ))}
          </div>

          {/* --- ROW 2: Monthly Revenue Chart --- */}
          <div
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-500 ${
              chartsLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '350ms' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue (LKR)</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Total {revenueYear}: <span className="font-semibold text-gray-800">{formatLKR(totalAnnual)}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRevenueYear(revenueYear - 1)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600"
                >
                  &larr;
                </button>
                <span className="text-sm font-semibold text-gray-700 min-w-[3rem] text-center">{revenueYear}</span>
                <button
                  onClick={() => setRevenueYear(revenueYear + 1)}
                  disabled={revenueYear >= new Date().getFullYear()}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
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
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
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
                    stroke="#3B82F6"
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
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-500 ${
                chartsLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: '450ms' }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Room Occupancy Overview</h3>
              <p className="text-sm text-gray-500 mb-4">{stats.rooms.total} total rooms</p>

              {occupancyData.every(d => d.value === 0) ? (
                <div className="flex items-center justify-center h-64 text-gray-400">
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
                          <span className="text-sm text-gray-700">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Mini stats under chart */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {occupancyData.map((item) => (
                  <div key={item.name} className="text-center p-2 rounded-xl" style={{ backgroundColor: `${item.color}10` }}>
                    <p className="text-xl font-bold" style={{ color: item.color }}>{item.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Students Widget */}
            <div
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-500 ${
                chartsLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: '550ms' }}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Students</h3>
                  <p className="text-sm text-gray-500">Latest registrations</p>
                </div>
                <Link
                  to="/admin/student-management"
                  className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
                >
                  View All <FaChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {recentStudents.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <div className="text-center">
                    <FaUserGraduate className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No students registered yet</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentStudents.map((student, idx) => (
                    <div
                      key={student._id}
                      className={`flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 ${
                        chartsLoaded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                      }`}
                      style={{ transitionDelay: `${600 + idx * 80}ms` }}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">{student.name}</p>
                          <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                            student.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
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
                        <p className="text-xs text-gray-400">{formatDate(student.registeredAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link
                to="/admin/student-management"
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
              >
                <FaUsers className="w-4 h-4" />
                View All Students
              </Link>
            </div>
          </div>

          {/* --- ROW 4: Complaint Status + Fee Collection + Recent Activity --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Complaint Status */}
            <div
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-500 ${
                chartsLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: '650ms' }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaint Status</h3>
              <div className="space-y-4">
                {[
                  { label: 'Pending', count: stats.complaints.pending, color: 'bg-amber-500', bgLight: 'bg-amber-50' },
                  { label: 'In Progress', count: stats.complaints.inProgress, color: 'bg-blue-500', bgLight: 'bg-blue-50' },
                  { label: 'Resolved', count: stats.complaints.resolved, color: 'bg-emerald-500', bgLight: 'bg-emerald-50' },
                ].map((item) => {
                  const pct = stats.complaints.total > 0
                    ? ((item.count / stats.complaints.total) * 100).toFixed(0)
                    : '0';
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                      </div>
                      <div className={`w-full ${item.bgLight} rounded-full h-2`}>
                        <div
                          className={`${item.color} h-2 rounded-full transition-all duration-1000`}
                          style={{ width: chartsLoaded ? `${pct}%` : '0%' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Resolution Rate</span>
                  <span className="font-bold text-gray-900">{stats.complaints.resolutionRate}%</span>
                </div>
              </div>
              <Link
                to="/admin/complaint-management"
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-amber-600 bg-amber-50 rounded-xl hover:bg-amber-100 transition"
              >
                <FaExclamationTriangle className="w-4 h-4" />
                Manage Complaints
              </Link>
            </div>

            {/* Fee Collection Overview */}
            <div
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-500 ${
                chartsLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: '700ms' }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Collection</h3>

              {/* Circular progress */}
              <div className="flex items-center justify-center mb-5">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#F3F4F6" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke="#10B981" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={chartsLoaded
                        ? `${2 * Math.PI * 42 * (1 - Number(stats.fees.collectionRate) / 100)}`
                        : `${2 * Math.PI * 42}`
                      }
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{stats.fees.collectionRate}%</span>
                    <span className="text-xs text-gray-500">Collected</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Collected</span>
                  <span className="text-sm font-semibold text-emerald-700">{formatLKR(stats.fees.totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-sm font-semibold text-amber-700">{formatLKR(stats.fees.pendingRevenue)}</span>
                </div>
                {stats.fees.unpaidStudents > 0 && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-700 text-xs rounded-xl px-3 py-2 mt-2 font-medium">
                    <FaExclamationTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{stats.fees.unpaidStudents} student{stats.fees.unpaidStudents !== 1 ? 's' : ''} with unpaid fees</span>
                  </div>
                )}
              </div>
              <Link
                to="/admin/fees-management"
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition"
              >
                <FaMoneyBillWave className="w-4 h-4" />
                Manage Fees
              </Link>
            </div>

            {/* Recent Activity */}
            <div
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-500 ${
                chartsLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: '750ms' }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              {activities.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-400">
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                  {activities.slice(0, 8).map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                        activity.type === 'student' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'complaint' ? 'bg-amber-100 text-amber-600' :
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                        {activity.type === 'student' ? <FaUserGraduate /> : activity.type === 'complaint' ? <FaExclamationTriangle /> : <FaMoneyBillWave />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{activity.action}</p>
                        <p className="text-xs text-gray-400">{activity.details} &bull; {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* --- ROW 5: Quick Actions --- */}
          <div
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-500 ${
              chartsLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '850ms' }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Students', link: '/admin/student-management', icon: <FaUsers className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:shadow-md' },
                { label: 'Rooms', link: '/admin/room-management', icon: <FaBed className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:shadow-md' },
                { label: 'Fees', link: '/admin/fees-management', icon: <FaMoneyBillWave className="w-5 h-5" />, color: 'text-violet-600 bg-violet-50 hover:bg-violet-100 hover:shadow-md' },
                { label: 'Complaints', link: '/admin/complaint-management', icon: <FaExclamationTriangle className="w-5 h-5" />, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100 hover:shadow-md' },
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
