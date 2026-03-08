/**
 * Admin Profile Page - Home_Treats
 * Admin name, email, phone, role, hostel details, edit profile, dashboard shortcuts
 */

import { useState, useEffect } from 'react';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaEdit,
  FaLock,
  FaSave,
  FaTimes,
  FaSpinner,
  FaTachometerAlt,
  FaUsers,
  FaBed,
  FaDollarSign,
  FaExclamationTriangle,
  FaBuilding,
  FaMapMarkerAlt,
  FaClock,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { authService } from '../../services';
import Sidebar from '../../components/layout/Sidebar';

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

const AdminProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editData, setEditData] = useState({ name: '', phone: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authService.getProfile();
      if (res.success) {
        setProfile(res.data);
      } else {
        showToast('Failed to load profile', 'error');
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEdit = () => {
    if (profile) {
      setEditData({ name: profile.name, phone: profile.phone || '' });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ name: '', phone: '' });
  };

  const handleSave = async () => {
    if (!editData.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    try {
      setSaving(true);
      const res = await authService.updateProfile({
        name: editData.name.trim(),
        phone: editData.phone.trim(),
      });
      if (res.success) {
        showToast('Profile updated successfully', 'success');
        setIsEditing(false);
        await fetchProfile();
      } else {
        showToast(res.message || 'Failed to update profile', 'error');
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    try {
      setSaving(true);
      const res = await authService.updateProfile({ password: passwordData.newPassword });
      if (res.success) {
        showToast('Password changed successfully', 'success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showToast(res.message || 'Failed to change password', 'error');
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  // Dashboard shortcut buttons
  const shortcuts = [
    { title: 'Dashboard', icon: <FaTachometerAlt className="w-5 h-5" />, href: '/admin/dashboard', color: 'bg-blue-500' },
    { title: 'Students', icon: <FaUsers className="w-5 h-5" />, href: '/admin/student-management', color: 'bg-green-500' },
    { title: 'Rooms', icon: <FaBed className="w-5 h-5" />, href: '/admin/room-management', color: 'bg-purple-500' },
    { title: 'Fees', icon: <FaDollarSign className="w-5 h-5" />, href: '/admin/fees-management', color: 'bg-amber-500' },
    { title: 'Complaints', icon: <FaExclamationTriangle className="w-5 h-5" />, href: '/admin/complaint-management', color: 'bg-red-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} userRole="admin" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-neutral-600 text-lg">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} userRole="admin" />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300 ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">
                  Admin <span className="text-gradient-primary">Profile</span>
                </h1>
                <p className="text-neutral-600 mt-1">Manage your admin account and hostel settings</p>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-neutral-600 hover:bg-neutral-100"
              >
                <FaUser className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg bg-neutral-100 p-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'profile'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <FaUser className="w-4 h-4 mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex items-center px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'password'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <FaLock className="w-4 h-4 mr-2" />
                Password
              </button>
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && profile && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Picture Card */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 text-center">
                    <div className="mb-6">
                      <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mx-auto flex items-center justify-center shadow-xl ring-4 ring-white">
                        <span className="text-4xl font-bold text-white">
                          {getInitials(profile.name)}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-1">{profile.name}</h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <FaShieldAlt className="w-4 h-4 text-primary-600" />
                      <span className="text-primary-600 font-semibold text-sm">Administrator</span>
                    </div>
                    <p className="text-neutral-500 text-sm mb-6">{profile.email}</p>
                    {!isEditing && (
                      <button onClick={handleEdit} className="btn btn-primary w-full">
                        <FaEdit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {/* Hostel Details Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 mt-6">
                    <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <FaBuilding className="w-5 h-5 text-primary-600" />
                      Hostel Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <FaBuilding className="w-4 h-4 text-neutral-400 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-neutral-900">Home_Treats</p>
                          <p className="text-xs text-neutral-500">Premium Student Accommodation</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FaMapMarkerAlt className="w-4 h-4 text-neutral-400 mt-1" />
                        <div>
                          <p className="text-sm text-neutral-700">No. 45, Hostel Lane</p>
                          <p className="text-sm text-neutral-700">Peradeniya Road, Kandy</p>
                          <p className="text-sm text-neutral-500">Sri Lanka</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FaClock className="w-4 h-4 text-neutral-400 mt-1" />
                        <div>
                          <p className="text-sm text-neutral-700">Mon-Fri: 8:00 AM – 8:00 PM</p>
                          <p className="text-sm text-neutral-700">Sat: 9:00 AM – 6:00 PM</p>
                          <p className="text-sm text-neutral-500">Sun: 10:00 AM – 4:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Information Card */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-neutral-900">Profile Information</h2>
                      {isEditing && (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            {saving ? (
                              <FaSpinner className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <FaSave className="w-4 h-4 mr-1" />
                            )}
                            Save
                          </button>
                          <button onClick={handleCancel} className="flex items-center px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors text-sm font-medium">
                            <FaTimes className="w-4 h-4 mr-1" />
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                          />
                        ) : (
                          <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-xl">
                            <FaUser className="w-4 h-4 text-neutral-400" />
                            <span className="text-neutral-900">{profile.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Email (read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-xl">
                          <FaEnvelope className="w-4 h-4 text-neutral-400" />
                          <span className="text-neutral-900">{profile.email}</span>
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Phone Number</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editData.phone}
                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                            placeholder="+94 77 123 4567"
                          />
                        ) : (
                          <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-xl">
                            <FaPhone className="w-4 h-4 text-neutral-400" />
                            <span className="text-neutral-900">{profile.phone || 'Not provided'}</span>
                          </div>
                        )}
                      </div>

                      {/* Role (read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Role</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-primary-50 rounded-xl border border-primary-100">
                          <FaShieldAlt className="w-4 h-4 text-primary-600" />
                          <span className="text-primary-700 font-semibold">Administrator</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Shortcut Buttons */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Quick Access</h2>
                <p className="text-neutral-600 mb-6">Navigate to key management sections</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {shortcuts.map((shortcut, i) => (
                    <Link
                      key={i}
                      to={shortcut.href}
                      className="group flex flex-col items-center gap-3 p-6 bg-neutral-50 rounded-2xl hover:bg-white hover:shadow-lg border border-transparent hover:border-neutral-200 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className={`w-14 h-14 ${shortcut.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {shortcut.icon}
                      </div>
                      <span className="text-sm font-semibold text-neutral-700 group-hover:text-primary-600 transition-colors">
                        {shortcut.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">Change Password</h2>
                  <p className="text-neutral-600">Update your password to keep your account secure</p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <h4 className="text-sm font-semibold text-neutral-900 mb-2">Password Requirements:</h4>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li>• At least 6 characters long</li>
                      <li>• Use a mix of letters, numbers, and symbols</li>
                    </ul>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary w-full flex items-center justify-center"
                  >
                    {saving ? (
                      <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <FaLock className="w-4 h-4 mr-2" />
                    )}
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
