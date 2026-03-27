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

const durations = [
  "1 Month",
  "3 Months",
  "6 Months",
  "12 Months",
];

const BookingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [roomData, setRoomData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nic: "",
    startDate: "",
    duration: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Pass all data to payment page
    const paymentData = {
      ...roomData,
      ...formData,
    };
    localStorage.setItem("bookingFormData", JSON.stringify(paymentData));
    localStorage.removeItem("selectedRoom");
    navigate("/payment");
  };

  if (!roomData) return null;

  // Get today's date for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HERO SECTION ─────────────────────────── */}
      <section className="w-full bg-gradient-to-br from-purple-800 via-purple-600 to-purple-500 relative py-14 sm:py-18">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-5 transition-colors text-sm font-medium"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
            Back to Floors
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
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <MdMeetingRoom className="w-5 h-5 text-purple-600" />
                Room Details
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm flex items-center gap-2">
                    <MdMeetingRoom className="w-4 h-4 text-purple-400" />
                    Room ID
                  </span>
                  <span className="font-semibold text-gray-900 text-sm">{roomData.roomNumber || roomData.roomId}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm flex items-center gap-2">
                    <FaBuilding className="w-4 h-4 text-purple-400" />
                    Building
                  </span>
                  <span className="font-semibold text-gray-900 text-sm">{roomData.building}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm flex items-center gap-2">
                    <FaLayerGroup className="w-4 h-4 text-purple-400" />
                    Floor
                  </span>
                  <span className="font-semibold text-gray-900 text-sm">{roomData.floor}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-500 text-sm flex items-center gap-2">
                    <FaMoneyBillWave className="w-4 h-4 text-purple-400" />
                    Price
                  </span>
                  <span className="font-bold text-purple-600 text-lg">
                    Rs. {roomData.price?.toLocaleString()}
                    <span className="text-xs text-gray-400 font-normal ml-1">/month</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Booking Form ─────────────── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaUser className="w-5 h-5 text-purple-600" />
                Your Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                        formErrors.fullName
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    />
                  </div>
                  {formErrors.fullName && (
                    <p className="mt-1.5 text-sm text-red-500">{formErrors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                        formErrors.email
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="mt-1.5 text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="07X XXX XXXX"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                        formErrors.phone
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="mt-1.5 text-sm text-red-500">{formErrors.phone}</p>
                  )}
                </div>

                {/* NIC / ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    NIC / ID <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FaIdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="nic"
                      value={formData.nic}
                      onChange={handleChange}
                      placeholder="Enter your NIC or ID number"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                        formErrors.nic
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    />
                  </div>
                  {formErrors.nic && (
                    <p className="mt-1.5 text-sm text-red-500">{formErrors.nic}</p>
                  )}
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Start Date <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      min={today}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                        formErrors.startDate
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    />
                  </div>
                  {formErrors.startDate && (
                    <p className="mt-1.5 text-sm text-red-500">{formErrors.startDate}</p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Duration <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FaClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 appearance-none bg-white cursor-pointer ${
                        formErrors.duration
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 hover:border-purple-300"
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
                    <p className="mt-1.5 text-sm text-red-500">{formErrors.duration}</p>
                  )}
                </div>

                {/* Notes (optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Notes <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <div className="relative">
                    <FaStickyNote className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4" />
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any special requests or notes..."
                      rows={3}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 hover:border-purple-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 pt-2" />

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-xl font-semibold text-base shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Proceed to Payment
                  <FaArrowRight className="w-4 h-4" />
                </button>

                <p className="text-xs text-gray-400 text-center mt-2">
                  You will be redirected to the payment page
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
