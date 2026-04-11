import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { FaCamera, FaEnvelope, FaIdBadge, FaImage, FaSave, FaShieldAlt, FaSpinner, FaUser } from 'react-icons/fa';
import Sidebar from '../../components/layout/Sidebar';
import { authService, settingsService } from '../../services';
import { useAuth } from '../../context/AuthContext';

interface AdminProfileData {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  gender?: string;
  address?: string;
  adminId?: string;
  dateJoined?: string;
  profileImage?: string;
}

const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const toImageUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_ROOT}${path}`;
};

const AdminProfile = () => {
  const { updateUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [profile, setProfile] = useState<AdminProfileData | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preview, setPreview] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [heroImage, setHeroImage] = useState('');
  const [heroPreview, setHeroPreview] = useState('');
  const [selectedHeroFile, setSelectedHeroFile] = useState<File | null>(null);
  const [heroUploading, setHeroUploading] = useState(false);

  const avatar = useMemo(() => preview || toImageUrl(profile?.profileImage), [preview, profile?.profileImage]);
  const resolvedHeroImage = useMemo(() => heroPreview || toImageUrl(heroImage), [heroPreview, heroImage]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await authService.getProfile();
        if (!res.success) throw new Error(res.message || 'Failed to fetch profile');

        const data = res.data as AdminProfileData;
        setProfile(data);
        setFullName(data.fullName || '');
        setPhone(data.phone || '');
        setGender(data.gender || '');
        setAddress(data.address || '');
        setPreview('');
        setSelectedImageFile(null);
      } catch (error: any) {
        setMessage({ text: error?.message || 'Failed to load profile', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    const loadHeroImage = async () => {
      try {
        const res = await settingsService.getHeroImage();
        if (res?.success) {
          setHeroImage(res.heroImage || '');
        }
      } catch {
        setHeroImage('');
      }
    };

    loadProfile();
    loadHeroImage();
  }, []);



  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setMessage({ text: 'Only JPG, JPEG, or PNG images are allowed', type: 'error' });
      return;
    }

    setPreview(URL.createObjectURL(file));
    setSelectedImageFile(file);
    setMessage({ text: 'Image selected. Click "Save Image" to update your profile picture.', type: 'success' });
  };

  const handleSaveImage = async () => {
    if (!selectedImageFile) {
      setMessage({ text: 'Please select an image first', type: 'error' });
      return;
    }

    try {
      setUploading(true);
      const res = await authService.updateProfileImage(selectedImageFile);
      if (!res.success) throw new Error(res.message || 'Failed to upload image');

      const updatedProfile = res.data || res.user;
      const profileImage = res.user?.profileImage || res.data?.profileImage;
      const displayName = res.user?.name || res.data?.fullName || res.data?.name;

      setProfile((prev) => ({ ...(prev as AdminProfileData), ...updatedProfile }));
      updateUser({ profileImage, name: displayName });
      setMessage({ text: 'Profile image updated', type: 'success' });
      setSelectedImageFile(null);
      setPreview('');
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.message || error?.message || 'Image update failed', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleHeroImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setMessage({ text: 'Only JPG, JPEG, PNG, or WEBP images are allowed', type: 'error' });
      return;
    }

    setHeroPreview(URL.createObjectURL(file));
    setSelectedHeroFile(file);
    setMessage({ text: 'Hero image selected. Click "Update Hero Image" to apply.', type: 'success' });
  };

  const handleSaveHeroImage = async () => {
    if (!selectedHeroFile) {
      setMessage({ text: 'Please select a hero image first', type: 'error' });
      return;
    }

    try {
      setHeroUploading(true);
      const res = await settingsService.updateHeroImage(selectedHeroFile);
      if (!res.success) throw new Error(res.message || 'Failed to update hero image');

      setHeroImage(res.heroImage || '');
      setHeroPreview('');
      setSelectedHeroFile(null);
      setMessage({ text: 'Hero image updated successfully', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.message || error?.message || 'Hero image update failed', type: 'error' });
    } finally {
      setHeroUploading(false);
    }
  };

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

      setProfile((prev) => ({ ...(prev as AdminProfileData), ...res.data }));
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
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} userRole="admin" />
      <div className="lg:ml-64 p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-foreground">Admin <span className="text-primary">Profile</span></h1>
        <p className="text-muted-foreground mt-1">Manage your account details and profile photo</p>

        {message && (
          <div className={`mt-4 rounded-lg px-4 py-3 text-sm ${message.type === 'success' ? 'bg-surface-active text-primary' : 'bg-error/20 border border-error/30 text-error'}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="mt-16 flex items-center justify-center text-muted-foreground"><FaSpinner className="animate-spin mr-2" />Loading profile...</div>
        ) : (
          <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="bg-card rounded-2xl border border-primary/15 p-6 shadow-sm">
              <div className="w-36 h-36 rounded-full mx-auto overflow-hidden border-4 border-primary/15 bg-surface-active flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt="Admin profile" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-4xl text-primary" />
                )}
              </div>

              <label className="mt-5 inline-flex items-center justify-center w-full px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-hover text-primary-foreground transform hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-300 cursor-pointer transition-colors">
                <FaCamera className="mr-2" />Choose Image
                <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" className=" bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30" onChange={handleImageChange} />
              </label>

              <button
                onClick={handleSaveImage}
                disabled={uploading || !selectedImageFile}
                className="mt-3 inline-flex items-center justify-center w-full px-4 py-2 rounded-lg bg-card border border-primary/25 text-primary hover:bg-surface-active disabled:opacity-60"
              >
                {uploading ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}Save Image
              </button>

              <div className="mt-6 space-y-3 text-sm">
                <p className="flex items-center text-foreground/90"><FaIdBadge className="mr-2 text-primary" />{profile?.adminId || 'N/A'}</p>
                <p className="flex items-center text-foreground/90"><FaShieldAlt className="mr-2 text-primary" />{profile?.role || 'admin'}</p>
                <p className="text-muted-foreground">Joined: {profile?.dateJoined ? new Date(profile.dateJoined).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <div className="xl:col-span-2 space-y-6">
              <div className="bg-card rounded-2xl border border-primary/15 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-foreground mb-4">Personal Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Full Name</label>
                    <input title="Full name" placeholder="Enter full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-lg px-3 py-2 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30" />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Phone</label>
                    <input title="Phone" placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg px-3 py-2 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30" />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Gender</label>
                    <select title="Gender" value={gender} onChange={(e) => setGender(e.target.value)} className="w-full rounded-lg px-3 py-2 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30">
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-muted-foreground mb-1">Address</label>
                    <input title="Address" placeholder="Enter address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-lg px-3 py-2 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-primary/15 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-foreground mb-4">Account Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Email (Read-only)</label>
                    <div className="flex items-center border border-border rounded-lg px-3 py-2 bg-muted text-muted-foreground"><FaEnvelope className="mr-2" />{profile?.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Role (Read-only)</label>
                    <div className="flex items-center border border-border rounded-lg px-3 py-2 bg-muted text-muted-foreground"><FaShieldAlt className="mr-2" />{profile?.role || 'admin'}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">New Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" className="w-full rounded-lg px-3 py-2 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30" />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Confirm Password</label>
                    <input type="password" title="Confirm password" placeholder="Re-enter new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-lg px-3 py-2 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30" />
                  </div>
                </div>

                <button onClick={saveProfile} disabled={saving} className="mt-5 inline-flex items-center px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-70 text-white">
                  {saving ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}Save Changes
                </button>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-primary/15 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-4">Change Hero Image</h2>
              <p className="text-sm text-muted-foreground mb-4">Update the Home page hero background image shown to all users.</p>

              <div className="w-full h-44 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center mb-4">
                {resolvedHeroImage ? (
                  <img src={resolvedHeroImage} alt="Current hero background" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[linear-gradient(to_right,_#6a11cb,_#2575fc)]" />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-hover text-primary-foreground transform hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-300 cursor-pointer transition-colors">
                  <FaImage className="mr-2" />Choose Hero Image
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className=" bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                    onChange={handleHeroImageChange}
                  />
                </label>

                <button
                  onClick={handleSaveHeroImage}
                  disabled={heroUploading || !selectedHeroFile}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-card border border-primary/25 text-primary hover:bg-surface-active disabled:opacity-60"
                >
                  {heroUploading ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}Update Hero Image
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
