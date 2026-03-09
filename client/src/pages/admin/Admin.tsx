import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaUsers, FaBed, FaExclamationTriangle, FaDollarSign, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const Admin = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    totalComplaints: 0,
    totalFees: 0,
    activeStudents: 0,
    occupiedRooms: 0,
    pendingComplaints: 0,
    collectedFees: 0
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: 'student', action: 'New student registered', time: '2 mins ago', icon: <FaUsers className="text-purple-600" /> },
    { id: 2, type: 'room', action: 'Room A-201 allocated', time: '5 mins ago', icon: <FaBed className="text-purple-500" /> },
    { id: 3, type: 'complaint', action: 'Complaint resolved', time: '10 mins ago', icon: <FaExclamationTriangle className="text-orange-500" /> },
    { id: 4, type: 'fee', action: 'Fee payment received', time: '15 mins ago', icon: <FaDollarSign className="text-purple-500" /> },
    { id: 5, type: 'system', action: 'Database backup completed', time: '1 hour ago', icon: <FaCog className="text-gray-500" /> }
  ]);

  const [quickActions] = useState([
    { id: 1, title: 'Add Student', description: 'Register new student', icon: <FaUsers />, color: 'blue', link: '/student-management' },
    { id: 2, title: 'Manage Rooms', description: 'Allocate and manage rooms', icon: <FaBed />, color: 'green', link: '/room-management' },
    { id: 3, title: 'View Complaints', description: 'Handle student complaints', icon: <FaExclamationTriangle />, color: 'orange', link: '/complaint-management' },
    { id: 4, title: 'Fee Management', description: 'Manage student fees', icon: <FaDollarSign />, color: 'purple', link: '/fees-management' }
  ]);

  useEffect(() => {
    // Simulate fetching stats
    setStats({
      totalStudents: 487,
      totalRooms: 156,
      totalComplaints: 234,
      totalFees: 45680,
      activeStudents: 425,
      occupiedRooms: 134,
      pendingComplaints: 23,
      collectedFees: 38500
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="w-full bg-white border-b border-purple-500/20 text-gray-900 py-8">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center">
            <div>
              <Link to="/dashboard" className="flex items-center text-purple-600 hover:text-purple-300 mb-4 transition-colors duration-300">
                <FaHome className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold">Admin Control Panel</h1>
              <p className="text-purple-600">Complete system management and control</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300 flex items-center">
                <FaCog className="mr-2" />
                Settings
              </button>
              <button className="bg-red-600 text-gray-900 px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center">
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <FaUsers className="text-2xl text-purple-600" />
                </div>
                <span className="text-sm text-purple-600 font-semibold">+12%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalStudents}</h3>
              <p className="text-gray-600">Total Students</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FaBed className="text-2xl text-purple-600" />
                </div>
                <span className="text-sm text-purple-600 font-semibold">+8%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalRooms}</h3>
              <p className="text-gray-600">Total Rooms</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FaExclamationTriangle className="text-2xl text-orange-600" />
                </div>
                <span className="text-sm text-red-600 font-semibold">-5%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalComplaints}</h3>
              <p className="text-gray-600">Total Complaints</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FaDollarSign className="text-2xl text-purple-600" />
                </div>
                <span className="text-sm text-purple-600 font-semibold">+18%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">${stats.totalFees.toLocaleString()}</h3>
              <p className="text-gray-600">Total Fees</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.id}
                    to={action.link}
                    className={`bg-gray-50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 block`}
                  >
                    <div className="flex items-center mb-4">
                      <div className={`p-3 bg-${action.color}-100 rounded-lg`}>
                        <div className={`text-2xl text-${action.color}-600`}>
                          {action.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                        <p className="text-gray-600 text-sm">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-gray-100 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{stats.activeStudents}</h4>
                    <p className="text-gray-600">Active Students</p>
                  </div>
                  <div className="text-center p-4 bg-gray-100 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{stats.occupiedRooms}</h4>
                    <p className="text-gray-600">Occupied Rooms</p>
                  </div>
                  <div className="text-center p-4 bg-gray-100 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{stats.pendingComplaints}</h4>
                    <p className="text-gray-600">Pending Complaints</p>
                  </div>
                  <div className="text-center p-4 bg-gray-100 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">${stats.collectedFees.toLocaleString()}</h4>
                    <p className="text-gray-600">Collected Fees</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-gray-50 rounded-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent Activities</h2>
                <button className="text-purple-600 hover:text-purple-300 font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-100/50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-4 ${
                        activity.type === 'student' ? 'bg-purple-500/10' :
                        activity.type === 'room' ? 'bg-purple-100' :
                        activity.type === 'complaint' ? 'bg-orange-100' :
                        activity.type === 'fee' ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        {activity.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-purple-600 hover:text-purple-300">
                        <FaEye />
                      </button>
                      <button className="text-purple-600 hover:text-purple-800">
                        <FaEdit />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Management</h3>
              <div className="space-y-3">
                <button className="w-full text-left bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-300 flex items-center">
                  <FaPlus className="mr-3" />
                  Backup Database
                </button>
                <button className="w-full text-left bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-300 flex items-center">
                  <FaPlus className="mr-3" />
                  Restore Database
                </button>
                <button className="w-full text-left bg-orange-600 text-gray-900 px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors duration-300 flex items-center">
                  <FaCog className="mr-3" />
                  Database Settings
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
              <div className="space-y-3">
                <button className="w-full text-left bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-300 flex items-center">
                  <FaUsers className="mr-3" />
                  Manage Admin Users
                </button>
                <button className="w-full text-left bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-300 flex items-center">
                  <FaCog className="mr-3" />
                  User Permissions
                </button>
                <button className="w-full text-left bg-pink-600 text-gray-900 px-4 py-3 rounded-lg hover:bg-pink-700 transition-colors duration-300 flex items-center">
                  <FaChartBar className="mr-3" />
                  System Logs
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
              <div className="space-y-3">
                <button className="w-full text-left bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center">
                  <FaCog className="mr-3" />
                  General Settings
                </button>
                <button className="w-full text-left bg-red-600 text-gray-900 px-4 py-3 rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center">
                  <FaCog className="mr-3" />
                  Security Settings
                </button>
                <button className="w-full text-left bg-yellow-600 text-gray-900 px-4 py-3 rounded-lg hover:bg-yellow-700 transition-colors duration-300 flex items-center">
                  <FaCog className="mr-3" />
                  Email Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
