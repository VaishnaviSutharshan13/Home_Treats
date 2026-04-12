import { useCallback, useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { studentService } from "../services";

import Sidebar from "../components/layout/Sidebar";
import { authService, feesService } from "../services";

interface ProfileData {
  _id: string;
  name: string;
  fullName?: string;
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

interface FeeItem {
  status: string;
}

const Profile = () => {
  const { id: targetStudentId } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();

  const isViewingOther = isAdmin && targetStudentId;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", phone: "" });

  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      let res;
      if (isViewingOther) {
        res = await studentService.getById(targetStudentId!);
      } else {
        res = await authService.getProfile();
      }
      if (res?.success && res?.data) {
        setProfile(res.data);
      } else {
        showToast(res?.message || "Failed to load profile", "error");
      }
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === "string"
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Failed to load profile";
      showToast(message || "Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  }, [isViewingOther, targetStudentId]);

  const fetchPaymentSummary = useCallback(
    async (currentProfile: ProfileData) => {
      if (currentProfile.role === "admin" && !isViewingOther) {
        setPaymentSummary({ total: 0, paid: 0, pending: 0, overdue: 0 });
        return;
      }

      try {
        let res;
        if (isViewingOther) {
          const studentKey = currentProfile.studentId || targetStudentId;
          if (!studentKey) return;
          res = await feesService.getByStudent(studentKey);
        } else {
          res = await feesService.getMyFees();
        }
        if (res.success) {
          const fees = (res.data || []) as FeeItem[];
          setPaymentSummary({
            total: fees.length,
            paid: fees.filter((f) => f.status === "Paid").length,
            pending: fees.filter((f) => f.status === "Pending").length,
            overdue: fees.filter((f) => f.status === "Overdue").length,
          });
        }
      } catch {
        // ignore errors
      }
    },
    [isViewingOther, targetStudentId],
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!profile) return;
    fetchPaymentSummary(profile);
  }, [profile, fetchPaymentSummary]);

  const handleEdit = () => {
    if (profile) {
      setEditData({
        name: profile.name || profile.fullName || "",
        phone: profile.phone || "",
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!editData.name.trim()) {
      showToast("Name is required", "error");
      return;
    }

    try {
      setSaving(true);
      let res;
      if (isViewingOther) {
        res = await studentService.update(targetStudentId!, editData);
      } else {
        res = await authService.updateProfile(editData);
      }
      if (res.success) {
        showToast("Profile updated successfully", "success");
        setIsEditing(false);
        fetchProfile();
      } else showToast("Update failed", "error");
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === "string"
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Update failed";
      showToast(message || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    try {
      setSaving(true);
      const res = await authService.updateProfile({
        password: passwordData.newPassword,
      });

      if (res.success) {
        showToast("Password updated", "success");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === "string"
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Password change failed";
      showToast(message || "Password change failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <FaSpinner className="animate-spin text-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        userRole={isAdmin ? "admin" : "student"}
      />

      {toast && (
        <div className="fixed top-5 right-5 px-4 py-2 rounded bg-linear-to-r from-primary to-primary-hover text-primary-foreground transform hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-300">
          {toast.message}
        </div>
      )}

      <div className="lg:ml-64 p-6">
        <h1 className="text-3xl font-bold mb-6">
          {isAdmin && !isViewingOther ? "Admin Profile" : "My Profile"}
        </h1>

        {/* Tabs */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${activeTab === "profile" ? "bg-primary text-white shadow-sm" : "bg-muted border border-border text-foreground/80 hover:bg-surface-active"}`}
          >
            Profile Details
          </button>
          {!isViewingOther && (
            <button
              onClick={() => setActiveTab("password")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${activeTab === "password" ? "bg-primary text-white shadow-sm" : "bg-muted border border-border text-foreground/80 hover:bg-surface-active"}`}
            >
              Security Settings
            </button>
          )}
        </div>

        {/* PROFILE TAB */}
        {activeTab === "profile" && profile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <p className="text-xs text-muted-foreground">Fee records</p>
                <p className="text-xl font-bold text-foreground">
                  {paymentSummary.total}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-xl font-bold text-primary">
                  {paymentSummary.paid}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-warning">
                  {paymentSummary.pending}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className="text-xl font-bold text-error">
                  {paymentSummary.overdue}
                </p>
              </div>
            </div>

            {/* Left Card */}
            <div className="bg-card border border-border p-6 rounded-2xl text-center shadow-sm">
              <div className="w-24 h-24 bg-linear-to-br from-primary to-primary-hover rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-md shadow-primary/20">
                {getInitials(profile.name || profile.fullName || "U")}
              </div>
              <h2 className="mt-4 font-bold text-foreground text-xl">
                {profile.name || profile.fullName}
              </h2>

              {profile.studentId && (
                <p className="text-sm mt-1 text-muted-foreground">
                  {profile.studentId}
                </p>
              )}
              {profile.room && (
                <div className="inline-block mt-3 px-3 py-1 bg-primary/10 text-primary font-semibold text-xs rounded-full border border-primary/20">
                  Room: {profile.room}
                </div>
              )}

              <button
                type="button"
                onClick={handleEdit}
                disabled={saving}
                className="mt-6 w-full px-4 py-2.5 rounded-xl bg-card border border-primary/30 text-primary font-semibold hover:bg-primary/5 transition-all duration-300 disabled:opacity-50"
              >
                {isEditing ? "Editing..." : "Edit Details"}
              </button>
            </div>

            {/* Right Card */}
            <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <h2 className="font-bold text-lg text-foreground mb-4">
                Personal Details
              </h2>

              <div>
                <label className="block text-sm font-semibold text-foreground/80 mb-1.5">
                  Full Name
                </label>
                <input
                  value={
                    isEditing
                      ? editData.name
                      : profile.name || profile.fullName || ""
                  }
                  disabled={!isEditing}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground/80 mb-1.5">
                  Phone Number
                </label>
                <input
                  value={isEditing ? editData.phone : profile.phone}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setEditData({ ...editData, phone: e.target.value })
                  }
                  className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-primary to-primary-hover text-white font-semibold transform hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-300 disabled:opacity-50"
                >
                  {saving ? "Saving changes..." : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* PASSWORD TAB */}
        {activeTab === "password" && (
          <form
            onSubmit={handlePasswordChange}
            className="bg-card border border-border shadow-sm p-6 sm:p-8 rounded-2xl max-w-xl"
          >
            <h2 className="font-bold text-lg text-foreground mb-6">
              Security Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground/80 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-border text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground/80 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-border text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 px-6 py-3 rounded-xl w-full sm:w-auto bg-linear-to-r from-primary to-primary-hover text-white font-semibold transform hover:scale-[1.02] border border-primary/20 hover:shadow-primary/20 transition-all duration-300 disabled:opacity-50"
            >
              {saving ? "Updating Security..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
