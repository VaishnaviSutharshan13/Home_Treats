/**
 * Student Profile Page - Home_Treats
 * Profile picture, name, email, phone, student ID, room, payment status, edit, modern card layout
 */

import { useState, useEffect } from 'react';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBed,
  FaEdit,
  FaLock,
  FaSave,
  FaTimes,
  FaSpinner,
  FaIdBadge,
  FaGraduationCap,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaMoneyBillWave,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { authService, feesService } from '../../services';
import Sidebar from '../../components/layout/Sidebar';

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  studentId: string;
  room: string;
  course: string;
  role: string;
}

interface PaymentSummary {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
}

const Profile = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editData, setEditData] = useState({ name: '', phone: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({ total: 0, paid: 0, pending: 0, overdue: 0 });

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
    fetchPaymentSummary();
  }, []);

  const fetchPaymentSummary = async () => {
    try {
      if (!user?.studentId) return;
      const res = await feesService.getByStudent(user.studentId);
      if (res.success && Array.isArray(res.data)) {
        const fees = res.data;
        const summary: PaymentSummary = {
          total: fees.length,
          paid: fees.filter((f: any) => f.status === 'Paid').length,
          pending: fees.filter((f: any) => f.status === 'Pending').length,
          overdue: fees.filter((f: any) => f.status === 'Overdue').length,
        };
        setPaymentSummary(summary);
      }
    } catch {
      // silently fail — not critical
    }
  };

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} userRole="student" />
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
    <div className="min-h-screen bg-neutral-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} userRole="student" />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg text-gray-900 text-sm font-medium transition-all duration-300 ${
            toast.type === 'success' ? 'bg-purple-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">
                  My <span className="text-gradient-primary">Profile</span>
                </h1>
                <p className="text-neutral-600 mt-1">Manage your personal information and account settings</p>
              </div>
              <button
                type="button"
                title="Toggle sidebar"
                aria-label="Toggle sidebar"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-neutral-600 hover:bg-neutral-100"
              >
                <FaUser className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                        <span className="text-4xl font-bold text-gray-900">
                          {getInitials(profile.name)}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-1">{profile.name}</h3>
                    <p className="text-primary-600 font-medium text-sm mb-2">Student</p>
                    <div className="space-y-2 text-sm mt-4">
                      {profile.studentId && (
                        <div className="flex items-center justify-center gap-2 text-neutral-600">
                          <FaIdBadge className="w-4 h-4 text-primary-500" />
                          {profile.studentId}
                        </div>
                      )}
                      {profile.room && (
                        <div className="flex items-center justify-center gap-2 text-neutral-600">
                          <FaBed className="w-4 h-4 text-primary-500" />
                          Room {profile.room}
                        </div>
                      )}
                      {profile.course && (
                        <div className="flex items-center justify-center gap-2 text-neutral-600">
                          <FaGraduationCap className="w-4 h-4 text-primary-500" />
                          {profile.course}
                        </div>
                      )}
                    </div>
                    {!isEditing && (
                      <button onClick={handleEdit} className="btn btn-primary w-full mt-6">
                        <FaEdit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {/* Payment Status Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 mt-6">
                    <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <FaMoneyBillWave className="w-5 h-5 text-primary-600" />
                      Payment Status
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 px-3 bg-purple-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <FaCheckCircle className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-purple-800 font-medium">Paid</span>
                        </div>
                        <span className="text-sm font-bold text-purple-700">{paymentSummary.paid}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 px-3 bg-amber-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <FaClock className="w-4 h-4 text-amber-600" />
                          <span className="text-sm text-amber-800 font-medium">Pending</span>
                        </div>
                        <span className="text-sm font-bold text-amber-700">{paymentSummary.pending}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <FaExclamationCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-800 font-medium">Overdue</span>
                        </div>
                        <span className="text-sm font-bold text-red-700">{paymentSummary.overdue}</span>
                      </div>
                      {/* Total bar */}
                      <div className="mt-3 pt-3 border-t border-neutral-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600">Total Invoices</span>
                          <span className="text-sm font-bold text-neutral-900">{paymentSummary.total}</span>
                        </div>
                        {paymentSummary.total > 0 && (
                          <div className="mt-2 space-y-2">
                            <progress
                              className="w-full h-2 rounded-full accent-purple-500"
                              value={paymentSummary.paid}
                              max={paymentSummary.total}
                              aria-label="Paid invoice ratio"
                            />
                            <progress
                              className="w-full h-2 rounded-full accent-amber-500"
                              value={paymentSummary.pending}
                              max={paymentSummary.total}
                              aria-label="Pending invoice ratio"
                            />
                            <progress
                              className="w-full h-2 rounded-full accent-red-500"
                              value={paymentSummary.overdue}
                              max={paymentSummary.total}
                              aria-label="Overdue invoice ratio"
                            />
                          </div>
                        )}
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
                            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50"
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
                      {/* Name Field */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            title="Full name"
                            aria-label="Full name"
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

                      {/* Email Field (read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-xl">
                          <FaEnvelope className="w-4 h-4 text-neutral-400" />
                          <span className="text-neutral-900">{profile.email}</span>
                        </div>
                      </div>

                      {/* Phone Field */}
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

                      {/* Student ID (read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Student ID</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-xl">
                          <FaIdBadge className="w-4 h-4 text-neutral-400" />
                          <span className="text-neutral-900">{profile.studentId || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Room (read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Assigned Room</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-xl">
                          <FaBed className="w-4 h-4 text-neutral-400" />
                          <span className="text-neutral-900">{profile.room || 'Not assigned'}</span>
                        </div>
                      </div>

                      {/* Course (read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Course / Programme</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-xl">
                          <FaGraduationCap className="w-4 h-4 text-neutral-400" />
                          <span className="text-neutral-900">{profile.course || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
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
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      title="Current password"
                      aria-label="Current password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      required
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">New Password</label>
                    <input
                      type="password"
                      title="New password"
                      aria-label="New password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      required
                      minLength={6}
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      title="Confirm new password"
                      aria-label="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      required
                      minLength={6}
                    />
                  </div>

                  {/* Password Requirements */}
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <h4 className="text-sm font-semibold text-neutral-900 mb-2">Password Requirements:</h4>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li>• At least 6 characters long</li>
                      <li>• Use a mix of letters, numbers, and symbols</li>
                    </ul>
                  </div>

                  {/* Submit Button */}
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

export default Profile;
