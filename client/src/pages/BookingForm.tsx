import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaBuilding,
  FaLayerGroup,
  FaMoneyBillWave,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaCalendarAlt,
  FaClock,
  FaStickyNote,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";
import { MdMeetingRoom } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { roomRequestService } from "../services";

interface RoomData {
  roomId: string;
  roomNumber?: string;
  floor: string;
  building: string;
  price: number;
  type?: string;
  _id?: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  studentId: string;
  landlinePhone: string;
  nicNumber: string;
  moveInDate: string;
  duration: string;
  specialRequest: string;
}

interface FormErrors {
  [key: string]: string;
}

type RequestStatus = "Pending" | "Approved" | "Rejected" | "Cancelled" | null;

const durations = [
  "3_months",
  "6_months",
  "1_year",
];

const durationLabels: { [key: string]: string } = {
  "3_months": "3 Months",
  "6_months": "6 Months",
  "1_year": "1 Year",
};

const isValidPhoneNumber = (value: string): boolean => /^\d{10}$/.test(value.trim());

const isValidNic = (value: string): boolean => {
  const nic = value.trim();
  // Old NIC: first 9 digits + last character V/v
  const oldNicPattern = /^\d{9}[Vv]$/;
  // New NIC: exactly 12 digits
  const newNicPattern = /^\d{12}$/;
  return oldNicPattern.test(nic) || newNicPattern.test(nic);
};

const isValidObjectId = (value: string): boolean => /^[a-fA-F0-9]{24}$/.test(value.trim());

const BookingForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    studentId: user?.studentId || "",
    landlinePhone: "",
    nicNumber: "",
    moveInDate: "",
    duration: "",
    specialRequest: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [requestStatusLoading, setRequestStatusLoading] = useState(false);
  const [latestRequestStatus, setLatestRequestStatus] = useState<RequestStatus>(null);

  useEffect(() => {
    if (location.state?.room) {
      setRoomData(location.state.room);
      localStorage.setItem("selectedRoom", JSON.stringify(location.state.room));
      return;
    }

    const saved = localStorage.getItem("selectedRoom");
    if (saved) {
      try {
        setRoomData(JSON.parse(saved));
        return;
      } catch {
        // Continue to redirect below
      }
    }

    navigate("/rooms", { replace: true });
  }, [navigate, location.state]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      fullName: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      studentId: user?.studentId || "",
    }));
  }, [user]);

  const getRestrictionMessageByStatus = (status: RequestStatus): string => {
    if (status === "Pending") {
      return "You already submitted a room request. Please wait for admin approval.";
    }
    if (status === "Approved") {
      return "Your room request has already been approved.";
    }
    if (status === "Rejected") {
      return "Previous request rejected. Apply again.";
    }
    return "";
  };

  const fetchMyRequestStatus = useCallback(async (): Promise<RequestStatus> => {
    if (!user) return null;
    setRequestStatusLoading(true);
    try {
      const response = await roomRequestService.getMyRequestStatus();
      if (response?.success) {
        const status = (response?.data?.latestStatus || null) as RequestStatus;
        setLatestRequestStatus(status);
        return status;
      }
      setLatestRequestStatus(null);
      return null;
    } catch {
      setLatestRequestStatus(null);
      return null;
    } finally {
      setRequestStatusLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyRequestStatus();
  }, [fetchMyRequestStatus]);

  const isBlockedByActiveRequest = latestRequestStatus === "Pending" || latestRequestStatus === "Approved";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.landlinePhone.trim()) {
      errors.landlinePhone = "Landline phone number is required";
    } else if (!isValidPhoneNumber(formData.landlinePhone)) {
      errors.landlinePhone = "Landline phone number must be exactly 10 digits";
    }

    if (!formData.nicNumber.trim()) {
      errors.nicNumber = "NIC number is required";
    } else if (!isValidNic(formData.nicNumber)) {
      errors.nicNumber = "NIC must be old format (9 digits + V/v) or new format (12 digits)";
    }

    if (!formData.moveInDate) errors.moveInDate = "Preferred move-in date is required";
    if (!formData.duration) errors.duration = "Please select a duration";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const latestStatus = await fetchMyRequestStatus();
    if (latestStatus === "Pending" || latestStatus === "Approved") {
      setErrorMessage(getRestrictionMessageByStatus(latestStatus));
      return;
    }

    if (!validate()) return;
    if (!roomData) return;

    setSubmitting(true);
    setErrorMessage("");

    try {
      const resolvedRoomId = roomData.roomId || roomData._id || "";
      if (!isValidObjectId(resolvedRoomId)) {
        setErrorMessage("Selected room is invalid. Please go back and select a room again.");
        setSubmitting(false);
        return;
      }

      const payload = {
        studentName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        studentId: formData.studentId,
        nic: formData.nicNumber,
        landline: formData.landlinePhone,
        moveInDate: formData.moveInDate,
        duration: formData.duration,
        specialRequest: formData.specialRequest,
        roomNumber: roomData.roomNumber || "",
        roomId: resolvedRoomId,
        floor: roomData.floor,
        building: roomData.building,
        roomType: roomData.type || "Single Room",
        monthlyFee: roomData.price || 0,
      };

      const response = await roomRequestService.create(payload);

      if (response?.success) {
        setSuccess(true);
        setFormData((prev) => ({
          ...prev,
          landlinePhone: "",
          nicNumber: "",
          moveInDate: "",
          duration: "",
          specialRequest: "",
        }));
        setFormErrors({});
      } else {
        setErrorMessage(response?.message || "Failed to submit request");
      }
    } catch (error: unknown) {
      console.error("Error submitting request:", error);

      const activeStatus =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { data?: { status?: string } } } }).response
          ?.data?.data?.status === "string"
          ? ((error as { response?: { data?: { data?: { status?: string } } } }).response?.data?.data
              ?.status as RequestStatus)
          : null;

      if (activeStatus === "Pending" || activeStatus === "Approved") {
        setLatestRequestStatus(activeStatus);
        setErrorMessage(getRestrictionMessageByStatus(activeStatus));
        return;
      }

      const message =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      const fallback =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message?: unknown }).message || "")
          : "";

      setErrorMessage(message || fallback || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (!roomData) return null;

  // Get today's date for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-muted">
      {/* ── HERO SECTION ─────────────────────────── */}
      <section className="w-full bg-gradient-to-br from-primary via-primary-hover to-secondary relative py-14 sm:py-18">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <Link
            to={roomData?.floor ? `/floor/${roomData.floor.toLowerCase().replace(/\s+/g, "-")}/rooms` : "/rooms"}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-5 transition-colors text-sm font-medium"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
            Back to Room Selection
          </Link>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-7 shadow-lg">
            <div className="uppercase text-xs tracking-widest text-white/70 font-semibold mb-2">
              HOME TREATS
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">
              Room Request Form
            </h1>
            <div className="w-12 h-1 bg-white/30 rounded-full mb-3" />
            <p className="text-base text-white/80 font-medium">
              Submit your room request for admin approval.
            </p>
          </div>
        </div>
      </section>

      {/* ── CONTENT ──────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── LEFT: Room Details Card (Read-only) ── */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl shadow-md border border-border p-6 sticky top-24">
              <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                <MdMeetingRoom className="w-5 h-5 text-primary" />
                Room Details
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground text-sm flex items-center gap-2">
                    <MdMeetingRoom className="w-4 h-4 text-primary" />
                    Room Number
                  </span>
                  <span className="font-semibold text-foreground text-sm">{roomData?.roomNumber || "-"}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground text-sm flex items-center gap-2">
                    <FaBuilding className="w-4 h-4 text-primary" />
                    Building
                  </span>
                  <span className="font-semibold text-foreground text-sm">{roomData?.building || "-"}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground text-sm flex items-center gap-2">
                    <FaLayerGroup className="w-4 h-4 text-primary" />
                    Floor
                  </span>
                  <span className="font-semibold text-foreground text-sm">{roomData?.floor || "-"}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground text-sm flex items-center gap-2">
                    <MdMeetingRoom className="w-4 h-4 text-primary" />
                    Room Type
                  </span>
                  <span className="font-semibold text-foreground text-sm">{roomData?.type || "Single Room"}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground text-sm flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-primary" />
                    Status
                  </span>
                  <span className="font-semibold text-foreground text-sm">Available</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground text-sm flex items-center gap-2">
                    <FaMoneyBillWave className="w-4 h-4 text-primary" />
                    Monthly Fee
                  </span>
                  <span className="font-bold text-primary text-lg">
                    Rs. {roomData?.price?.toLocaleString() || "0"}
                    <span className="text-xs text-muted-foreground font-normal ml-1">/month</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Booking Form ─────────────── */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-2xl shadow-md border border-border p-6 sm:p-8">
              <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <FaUser className="w-5 h-5 text-primary" />
                Your Details
              </h2>

              {latestRequestStatus && (
                <div className={`mb-5 rounded-lg border px-4 py-3 text-sm ${isBlockedByActiveRequest ? "border-warning/30 bg-warning/10 text-warning" : "border-success/20 bg-success/10 text-success"}`}>
                  {getRestrictionMessageByStatus(latestRequestStatus)}
                </div>
              )}

              {latestRequestStatus === "Approved" && (
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={() => setErrorMessage("If you need another room, please submit a Room Change Request.")}
                    className="w-full py-3 rounded-xl font-semibold text-sm border border-primary/30 text-primary hover:bg-surface-active transition-all"
                  >
                    Request Room Change
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Full Name <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      readOnly
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                        formErrors.fullName
                          ? "border-red-400 bg-error/10 border border-error/20"
                          : "border-border bg-muted/40 cursor-not-allowed"
                      }`}
                    />
                  </div>
                  {formErrors.fullName && (
                    <p className="mt-1.5 text-sm text-error">{formErrors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Email <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                        formErrors.email
                          ? "border-red-400 bg-error/10 border border-error/20"
                          : "border-border bg-muted/40 cursor-not-allowed"
                      }`}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="mt-1.5 text-sm text-error">{formErrors.email}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Phone Number <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      readOnly
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                        formErrors.phone
                          ? "border-red-400 bg-error/10 border border-error/20"
                          : "border-border bg-muted/40 cursor-not-allowed"
                      }`}
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="mt-1.5 text-sm text-error">{formErrors.phone}</p>
                  )}
                </div>

                {/* Student ID */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Student ID <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <FaIdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      readOnly
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                        formErrors.studentId
                          ? "border-red-400 bg-error/10 border border-error/20"
                          : "border-border bg-muted/40 cursor-not-allowed"
                      }`}
                    />
                  </div>
                  {formErrors.studentId && (
                    <p className="mt-1.5 text-sm text-error">{formErrors.studentId}</p>
                  )}
                </div>

                {/* Landline Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Landline Phone Number <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="tel"
                      name="landlinePhone"
                      value={formData.landlinePhone}
                      onChange={handleChange}
                      placeholder="Enter 10-digit landline number"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                        formErrors.landlinePhone
                          ? "border-red-400 bg-error/10 border border-error/20"
                          : "border-border bg-muted/30 hover:border-primary/30"
                      }`}
                    />
                  </div>
                  {formErrors.landlinePhone && (
                    <p className="mt-1.5 text-sm text-error">{formErrors.landlinePhone}</p>
                  )}
                </div>

                {/* NIC Number */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    NIC Number <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <FaIdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="text"
                      name="nicNumber"
                      value={formData.nicNumber}
                      onChange={handleChange}
                      placeholder="Old NIC: 123456789V or New NIC: 200012345678"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                        formErrors.nicNumber
                          ? "border-red-400 bg-error/10 border border-error/20"
                          : "border-border bg-muted/30 hover:border-primary/30"
                      }`}
                    />
                  </div>
                  {formErrors.nicNumber && (
                    <p className="mt-1.5 text-sm text-error">{formErrors.nicNumber}</p>
                  )}
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Preferred Move-in Date <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="date"
                      name="moveInDate"
                      value={formData.moveInDate}
                      onChange={handleChange}
                      min={today}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                        formErrors.moveInDate
                          ? "border-red-400 bg-error/10 border border-error/20"
                          : "border-border bg-muted/30 hover:border-primary/30"
                      }`}
                    />
                  </div>
                  {formErrors.moveInDate && (
                    <p className="mt-1.5 text-sm text-error">{formErrors.moveInDate}</p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Duration <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <FaClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 appearance-none bg-muted/30 cursor-pointer ${
                        formErrors.duration
                          ? "border-red-400 bg-error/10 border border-error/20"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <option value="">Select duration</option>
                      {durations.map((d) => (
                        <option key={d} value={d}>
                          {durationLabels[d]}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formErrors.duration && (
                    <p className="mt-1.5 text-sm text-error">{formErrors.duration}</p>
                  )}
                </div>

                {/* Notes (optional) */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Special Request / Notes <span className="text-muted-foreground text-xs">(optional)</span>
                  </label>
                  <div className="relative">
                    <FaStickyNote className="absolute left-3.5 top-3.5 text-muted-foreground w-4 h-4" />
                    <textarea
                      name="specialRequest"
                      value={formData.specialRequest}
                      onChange={handleChange}
                      placeholder="Need quiet room / lower floor / medical reason"
                      rows={3}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-muted/30 hover:border-primary/30 text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
                    {errorMessage}
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-border pt-2" />

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || requestStatusLoading || isBlockedByActiveRequest}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary text-white rounded-xl font-semibold text-base shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {requestStatusLoading ? "Checking eligibility..." : submitting ? "Submitting..." : "Submit Room Request"}
                  <FaArrowRight className="w-4 h-4" />
                </button>

                <p className="text-xs text-muted-foreground text-center mt-2">
                  Admin will review your request and notify you soon.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {
            setSuccess(false);
            navigate("/student/dashboard");
          }} />
          <div className="relative bg-card rounded-2xl p-8 max-w-md w-full shadow-xl border border-border">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                <FaCheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Request Sent!</h2>
              <p className="text-muted-foreground mb-2">Your room request has been submitted successfully.</p>
              <p className="text-sm text-muted-foreground mb-6">Admin will review your request and notify you soon.</p>
              <button
                onClick={() => {
                  setSuccess(false);
                  navigate("/student/dashboard");
                }}
                className="w-full px-6 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingForm;
