import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaWifi,
  FaFan,
  FaTable,
  FaBath,
  FaBed,
  FaDoorOpen,
  FaLock,
  FaArrowLeft,
  FaCalendarCheck,
  FaCalendarTimes,
  FaClock,
  FaMapMarkerAlt,
  FaStar,
  FaCheckCircle,
} from "react-icons/fa";
import { HiOutlineLightningBolt } from "react-icons/hi";

const floorData = {
  "1st-floor": {
    id: "1st-floor",
    title: "1st Floor",
    totalRooms: 10,
    availableRooms: 6,
    priceMin: 12000,
    priceMax: 20000,
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
    rating: 4.7,
    reviews: 98,
    location: "Colombo, Sri Lanka",
    description:
      "A calm and student-friendly floor designed for focused learning. This floor offers a mix of private and shared rooms with strong ventilation, study-focused spaces, and easy access to common amenities.",
    facilities: ["WiFi", "Fan", "Study Table", "Attached Bath", "Single Bed", "Power Backup", "Wardrobe", "Locker"],
    checkIn: {
      time: "2:00 PM",
      day: "1st of every month",
      note: "Early check-in available upon request",
    },
    checkOut: {
      time: "11:00 AM",
      day: "Last day of the month",
      note: "Late check-out subject to availability",
    },
  },
  "2nd-floor": {
    id: "2nd-floor",
    title: "2nd Floor",
    totalRooms: 12,
    availableRooms: 4,
    priceMin: 14000,
    priceMax: 22000,
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&q=80",
    rating: 4.5,
    reviews: 120,
    location: "Colombo, Sri Lanka",
    description:
      "A balanced floor with multiple room choices suitable for students who prefer a social but organized environment. The floor includes modern facilities and convenient access to shared utility spaces.",
    facilities: ["WiFi", "Fan", "Study Table", "Attached Bath", "Single Bed", "Power Backup", "Wardrobe"],
    checkIn: {
      time: "2:00 PM",
      day: "1st of every month",
      note: "Check-in support available from floor warden",
    },
    checkOut: {
      time: "11:00 AM",
      day: "Last day of the month",
      note: "Room clearance required before check-out",
    },
  },
  "3rd-floor": {
    id: "3rd-floor",
    title: "3rd Floor",
    totalRooms: 8,
    availableRooms: 2,
    priceMin: 15000,
    priceMax: 24000,
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80",
    rating: 4.2,
    reviews: 60,
    location: "Colombo, Sri Lanka",
    description:
      "A premium upper floor with low room density and better privacy. Best suited for students who want a quieter stay, with full access to essential academic and living facilities.",
    facilities: ["WiFi", "Fan", "Study Table", "Locker", "Common Bathroom"],
    checkIn: {
      time: "2:00 PM",
      day: "1st of every month",
      note: "Room assignment confirmed on arrival",
    },
    checkOut: {
      time: "11:00 AM",
      day: "Last day of the month",
      note: "Complete inventory handover before leaving",
    },
  },
  "4th-floor": {
    id: "4th-floor",
    title: "4th Floor",
    totalRooms: 9,
    availableRooms: 0,
    priceMin: 16000,
    priceMax: 25000,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80",
    rating: 4.6,
    reviews: 70,
    location: "Colombo, Sri Lanka",
    description:
      "Top floor accommodation with elevated views and premium atmosphere. It is ideal for long-term students looking for a calm and professional living environment.",
    facilities: ["WiFi", "Fan", "Study Table", "Attached Bath", "Wardrobe", "Locker"],
    checkIn: {
      time: "2:00 PM",
      day: "1st of every month",
      note: "Move-in assistance available on request",
    },
    checkOut: {
      time: "11:00 AM",
      day: "Last day of the month",
      note: "Finalize check-out at floor desk",
    },
  },
};

/* ──────────────────────────────────────────────────
   FACILITY ICON MAP
────────────────────────────────────────────────── */
const facilityIcons = {
  WiFi: <FaWifi />,
  Fan: <FaFan />,
  "Study Table": <FaTable />,
  "Attached Bath": <FaBath />,
  "Common Bathroom": <FaBath />,
  "Single Bed": <FaBed />,
  "Power Backup": <HiOutlineLightningBolt />,
  Wardrobe: <FaDoorOpen />,
  Locker: <FaLock />,
};

/* ──────────────────────────────────────────────────
   REUSABLE: FACILITY BADGE
────────────────────────────────────────────────── */
const FacilityBadge = ({ name }) => (
  <div className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 hover:shadow-md hover:border-purple-300 transition-all duration-200 group">
    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-purple-600 shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-all duration-200">
      {facilityIcons[name] || <FaCheckCircle />}
    </div>
    <span className="text-gray-700 font-medium text-sm">{name}</span>
  </div>
);

/* ──────────────────────────────────────────────────
   REUSABLE: INFO CARD (Check-in / Check-out)
────────────────────────────────────────────────── */
const InfoCard = ({ icon, title, time, day, note, accentColor }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 p-6`}>
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accentColor} text-white shadow-md`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    </div>
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FaClock className="w-4 h-4 text-gray-400" />
        <span className="text-gray-700 font-medium">{time}</span>
      </div>
      <div className="flex items-center gap-2">
        <FaCalendarCheck className="w-4 h-4 text-gray-400" />
        <span className="text-gray-600 text-sm">{day}</span>
      </div>
      <p className="text-gray-500 text-sm italic mt-2 pl-1 border-l-2 border-purple-200 ml-1">
        {note}
      </p>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
const RoomDetailsPage = () => {
  const { floorId } = useParams();
  const navigate = useNavigate();
  const floor = floorData[floorId];

  /* ---------- ROOM NOT FOUND ---------- */
  if (!floor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-6">
          <div className="text-7xl mb-6">🏠</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Floor Not Found</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            The floor you're looking for doesn't exist or may have been removed.
          </p>
          <button
            onClick={() => navigate("/rooms")}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Floors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO IMAGE ───────────────────────────── */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img
          src={floor.image}
          alt={floor.title}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-6xl mx-auto">
            {/* Back link */}
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors text-sm font-medium"
            >
              <FaArrowLeft className="w-4 h-4" />
              Back to Floors
            </Link>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
              {floor.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-2">
                <FaMapMarkerAlt className="w-4 h-4" />
                {floor.location}
              </span>
              <span className="flex items-center gap-2">
                <FaBed className="w-4 h-4" />
                {floor.totalRooms} Rooms
              </span>
              <span className="flex items-center gap-1.5">
                <FaStar className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-semibold">{floor.rating}</span>
                <span className="text-white/60">({floor.reviews} reviews)</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/90 text-white">
                Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── LEFT COLUMN: Details ─────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">About This Floor</h2>
              <p className="text-gray-600 leading-relaxed">{floor.description}</p>
            </div>

            {/* Facilities Grid */}
            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Facilities & Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {floor.facilities.map((facility, index) => (
                  <FacilityBadge key={index} name={facility} />
                ))}
              </div>
            </div>

            {/* Check-in / Check-out (2 Columns) */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-5">Check-in & Check-out Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard
                  icon={<FaCalendarCheck className="w-5 h-5" />}
                  title="Check-in"
                  time={floor.checkIn.time}
                  day={floor.checkIn.day}
                  note={floor.checkIn.note}
                  accentColor="bg-green-500"
                />
                <InfoCard
                  icon={<FaCalendarTimes className="w-5 h-5" />}
                  title="Check-out"
                  time={floor.checkOut.time}
                  day={floor.checkOut.day}
                  note={floor.checkOut.note}
                  accentColor="bg-red-500"
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Booking Card ────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg sticky top-24 p-6 md:p-8 border border-gray-100">

              {/* Price */}
              <div className="text-center mb-6">
                <div className="text-sm text-gray-500 mb-1">Monthly Price Range</div>
                <div className="text-4xl font-bold text-purple-600">
                  Rs. {floor.priceMin.toLocaleString()} - {floor.priceMax.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">per month</div>
              </div>

              {/* Floor summary */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Total Rooms</span>
                  <span className="font-medium text-gray-900">{floor.totalRooms}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Available Rooms</span>
                  <span className="font-medium text-gray-900">{floor.availableRooms}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Reviews</span>
                  <span className="font-medium text-gray-900">{floor.reviews}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium text-green-600 flex items-center gap-1.5">
                    <FaCheckCircle className="w-4 h-4" />
                    Available
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium text-gray-900 flex items-center gap-1.5">
                    <FaMapMarkerAlt className="w-3.5 h-3.5 text-red-500" />
                    {floor.location}
                  </span>
                </div>
              </div>

              {/* View Rooms Button */}
              <button
                onClick={() => {
                  navigate(`/floor/${floor.id}/rooms`);
                }}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] shadow-md"
              >
                View Rooms
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Select a specific room from this floor
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsPage;
