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

import Sidebar from '../../components/layout/Sidebar';
import { authService, feesService } from '../../services';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '' });

  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authService.getProfile();
      if (res.success) setProfile(res.data);
      else showToast('Failed to load profile', 'error');
    } catch (err: any) {
      showToast(err?.message || 'Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentSummary = async () => {
    try {
      const res = await feesService.getMyFees();
      if (res.success) {
        const fees = res.data || [];
        setPaymentSummary({
          total: fees.length,
          paid: fees.filter((f: any) => f.status === 'Paid').length,
          pending: fees.filter((f: any) => f.status === 'Pending').length,
          overdue: fees.filter((f: any) => f.status === 'Overdue').length,
        });
      }
    } catch {
      // ignore errors
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchPaymentSummary();
  }, []);

  const handleEdit = () => {
    if (profile) {
      setEditData({ name: profile.name, phone: profile.phone || '' });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!editData.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await authService.updateProfile(editData);
      if (res.success) {
        showToast('Profile updated successfully', 'success');
        setIsEditing(false);
        fetchProfile();
      } else showToast('Update failed', 'error');
    } catch (err: any) {
      showToast(err?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await authService.updateProfile({
        password: passwordData.newPassword,
      });

      if (res.success) {
        showToast('Password updated', 'success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err: any) {
      showToast(err?.message || 'Password change failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <FaSpinner className="animate-spin text-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} userRole="student" />

      {toast && (
        <div className="fixed top-5 right-5 px-4 py-2 rounded bg-gradient-to-r from-primary to-primary-hover text-primary-foreground transform hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-300">
          {toast.message}
        </div>
      )}

      <div className="lg:ml-64 p-6">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        {/* Tabs */}
        <div className="mb-6">
          <button onClick={() => setActiveTab('profile')} className="mr-3">Profile</button>
          <button onClick={() => setActiveTab('password')}>Password</button>
        </div>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && profile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Card */}
            <div className="bg-card p-6 rounded-xl text-center">
              <div className="w-24 h-24 bg-primary rounded-full mx-auto flex items-center justify-center text-white text-2xl">
                {getInitials(profile.name)}
              </div>
              <h2 className="mt-4 font-bold">{profile.name}</h2>

              <p className="text-sm mt-2">{profile.studentId}</p>
              <p className="text-sm">Room: {profile.room}</p>

              <button onClick={handleEdit} className="mt-4 px-4 py-2 rounded bg-gradient-to-r from-primary to-primary-hover text-primary-foreground transform hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-300">
                Edit
              </button>
            </div>

            {/* Right Card */}
            <div className="lg:col-span-2 bg-card p-6 rounded-xl">
              <h2 className="font-bold mb-4">Details</h2>

              <input
                value={isEditing ? editData.name : profile.name}
                disabled={!isEditing}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full mb-3 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
              />

              <input
                value={isEditing ? editData.phone : profile.phone}
                disabled={!isEditing}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                className="w-full mb-3 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
              />

              {isEditing && (
                <button onClick={handleSave} className="px-4 py-2 rounded bg-gradient-to-r from-primary to-primary-hover text-primary-foreground transform hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-300">
                  Save
                </button>
              )}
            </div>
          </div>
        )}

        {/* PASSWORD TAB */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordChange} className="bg-card p-6 rounded-xl max-w-md">
            <input
              type="password"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              className="w-full mb-3 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              className="w-full mb-3 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
            />

            <button className="px-4 py-2 rounded bg-gradient-to-r from-primary to-primary-hover text-primary-foreground transform hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-300">
              Change Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;