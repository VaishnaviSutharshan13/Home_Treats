import { useEffect, useState } from 'react';
import { FaBed, FaEnvelope, FaIdBadge, FaMapMarkerAlt, FaSave, FaShieldAlt, FaSpinner, FaUser } from 'react-icons/fa';
import Sidebar from '../../components/layout/Sidebar';
import { authService } from '../../services';
import { useAuth } from '../../context/AuthContext';

interface StudentProfileData {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  gender?: string;
  address?: string;
  studentId?: string;
  assignedRoomNumber?: string;
  floor?: string;
  bookingStatus?: string;
  dateJoined?: string;
  profileImage?: string;
}

const Profile = () => {
  const { updateUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await authService.getProfile();
      if (!res.success) throw new Error(res.message || 'Failed to fetch profile');

      const data = res.data as StudentProfileData;
      setProfile(data);
      setFullName(data.fullName || '');
      setPhone(data.phone || '');
      setGender(data.gender || '');
      setAddress(data.address || '');
    } catch (error: any) {
      setMessage({ text: error?.message || 'Failed to load profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async () => {
    if (!fullName.trim()) {
      setMessage({ text: 'Full name is required', type: 'error' });
      return;
    }

    if (password && password !== confirmPassword) {
      setMessage({ text: 'Password and confirm password do not match', type: 'error' });
      return;
    }

    try {
      setSaving(true);
      const payload: Record<string, string> = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        gender,
        address: address.trim(),
      };
      if (password) payload.password = password;

      const res = await authService.updateProfile(payload);
      if (!res.success) throw new Error(res.message || 'Failed to update profile');

      setProfile((prev) => ({ ...(prev as StudentProfileData), ...res.data }));
      updateUser({ name: res.data?.fullName || res.data?.name, phone: res.data?.phone, profileImage: res.data?.profileImage });
      setPassword('');
      setConfirmPassword('');
      setMessage({ text: 'Profile updated successfully', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.message || error?.message || 'Profile update failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} userRole="student" />
      <div className="lg:ml-64 p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-gray-900">Student <span className="text-purple-600">Profile</span></h1>
        <p className="text-gray-600 mt-1">Manage your profile details and account settings</p>

        {message && (
          <div className={`mt-4 rounded-lg px-4 py-3 text-sm ${message.type === 'success' ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="mt-16 flex items-center justify-center text-gray-600"><FaSpinner className="animate-spin mr-2" />Loading profile...</div>
        ) : (
          <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-sm">
              <div className="w-20 h-20 rounded-full mx-auto border-2 border-purple-100 bg-purple-50 flex items-center justify-center">
                <FaUser className="text-2xl text-purple-400" />
              </div>

              <p className="mt-4 text-center text-lg font-semibold text-gray-900">{fullName || profile?.fullName || 'Student'}</p>
              <p className="text-center text-sm text-gray-500">Student Profile</p>

              <div className="mt-6 space-y-3 text-sm">
                <p className="flex items-center text-gray-700"><FaIdBadge className="mr-2 text-purple-600" />{profile?.studentId || 'N/A'}</p>
                <p className="flex items-center text-gray-700"><FaBed className="mr-2 text-purple-600" />Room: {profile?.assignedRoomNumber || 'Not assigned'}</p>
                <p className="flex items-center text-gray-700"><FaMapMarkerAlt className="mr-2 text-purple-600" />Floor: {profile?.floor || 'N/A'}</p>
                <p className="text-gray-500">Booking: {profile?.bookingStatus || 'Not Booked'}</p>
              </div>
            </div>

            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                    <input title="Full name" placeholder="Enter full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Phone</label>
                    <input title="Phone" placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Gender</label>
                    <select title="Gender" value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Address</label>
                    <input title="Address" placeholder="Enter address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Email (Read-only)</label>
                    <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"><FaEnvelope className="mr-2" />{profile?.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Role (Read-only)</label>
                    <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"><FaShieldAlt className="mr-2" />{profile?.role || 'student'}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">New Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Confirm Password</label>
                    <input type="password" title="Confirm password" placeholder="Re-enter new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>

                <button onClick={saveProfile} disabled={saving} className="mt-5 inline-flex items-center px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-70 text-white">
                  {saving ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
