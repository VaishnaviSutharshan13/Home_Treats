import React, { useState, useEffect } from "react";
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
} from "react-icons/fa";
import { MdMeetingRoom } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

interface RoomData {
  roomId: string;
  roomNumber?: string;
  floor: string;
  building: string;
  price: number;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  nic: string;
  startDate: string;
  duration: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

const durations = [
  "1 Month",
  "3 Months",
  "6 Months",
  "12 Months",
];

const BookingForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    nic: user?.studentId || "",
    startDate: "",
    duration: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

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

    navigate("/floors", { replace: true });
  }, [navigate, location.state]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || user?.name || "",
      email: prev.email || user?.email || "",
      phone: prev.phone || user?.phone || "",
      nic: prev.nic || user?.studentId || "",
    }));
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Enter a valid email address";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(formData.phone.trim()))
      errors.phone = "Enter a valid 10-digit phone number";
    if (!formData.nic.trim()) errors.nic = "NIC / ID is required";
    if (!formData.startDate) errors.startDate = "Start date is required";
    if (!formData.duration) errors.duration = "Please select a duration";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    // Pass all data to payment page
    const paymentData = {
      ...roomData,
      ...formData,
    };
    localStorage.setItem("bookingFormData", JSON.stringify(paymentData));
    localStorage.removeItem("selectedRoom");
    navigate("/student/my-fees", { state: { fromBooking: true } });
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
            to={roomData?.floor ? `/floor/${roomData.floor.toLowerCase().replace(/\s+/g, "-")}/rooms` : "/floors"}
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
              Booking Form
            </h1>
            <div className="w-12 h-1 bg-white/30 rounded-full mb-3" />
            <p className="text-base text-white/80 font-medium">
              Complete your booking details for{" "}
              <span className="text-white font-semibold">{roomData.roomId}</span>
              <span className="text-white/70"> on {roomData.floor}</span>
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
                    Room ID
                  </span>
                  <span className="font-semibold text-foreground text-sm">{roomData.roomNumber || roomData.roomId}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground text-sm flex items-center gap-2">
                    <FaBuilding className="w-4 h-4 text-primary" />
                    Building
                  </span>
                  <span className="font-semibold text-foreground text-sm">{roomData.building}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground text-sm flex items-center gap-2">
                    <FaLayerGroup className="w-4 h-4 text-primary" />
                    Floor
                  </span>
                  <span className="font-semibold text-foreground text-sm">{roomData.floor}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground text-sm flex items-center gap-2">
                    <FaMoneyBillWave className="w-4 h-4 text-primary" />
                    Price
                  </span>
                  <span className="font-bold text-primary text-lg">
                    Rs. {roomData.price?.toLocaleString()}
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
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                        formErrors.fullName
                          ? "border-red-400 bg-error/10 border border-error/20"
                          : "border-border bg-muted/30 hover:border-primary/30"
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
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                        formErrors.email
                          ? "border-red-400 bg-error/10 border border-error/20"
                          : "border-border bg-muted/30 hover:border-primary/30"
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
                      onChange={handleChange}
                      placeholder="07X XXX XXXX"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                        formErrors.phone
                          ? "border-red-400 bg-error/10 border border-error/20"
                          : "border-border bg-muted/30 hover:border-primary/30"
                      }`}
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="mt-1.5 text-sm text-error">{formErrors.phone}</p>
                  )}
                </div>

                {/* NIC / ID */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    NIC / ID <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <FaIdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="text"
                      name="nic"
                      value={formData.nic}
                      onChange={handleChange}
                      placeholder="Enter your NIC or ID number"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                        formErrors.nic
                          ? "border-red-400 bg-error/10 border border-error/20"
                          : "border-border bg-muted/30 hover:border-primary/30"
                      }`}
                    />
                  </div>
                  {formErrors.nic && (
                    <p className="mt-1.5 text-sm text-error">{formErrors.nic}</p>
                  )}
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Start Date <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      min={today}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                        formErrors.startDate
                          ? "border-red-400 bg-error/10 border border-error/20"
                          : "border-border bg-muted/30 hover:border-primary/30"
                      }`}
                    />
                  </div>
                  {formErrors.startDate && (
                    <p className="mt-1.5 text-sm text-error">{formErrors.startDate}</p>
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
                          {d}
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
                    Notes <span className="text-muted-foreground text-xs">(optional)</span>
                  </label>
                  <div className="relative">
                    <FaStickyNote className="absolute left-3.5 top-3.5 text-muted-foreground w-4 h-4" />
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any special requests or notes..."
                      rows={3}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-muted/30 hover:border-primary/30 text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border pt-2" />

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary text-white rounded-xl font-semibold text-base shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Proceed to Payment
                  <FaArrowRight className="w-4 h-4" />
                </button>

                <p className="text-xs text-muted-foreground text-center mt-2">
                  You will be redirected to the payment section
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
