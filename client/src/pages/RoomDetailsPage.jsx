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
  FaUserFriends,
  FaStar,
  FaCheckCircle,
} from "react-icons/fa";
import { HiOutlineLightningBolt } from "react-icons/hi";

/* ──────────────────────────────────────────────────
   STATIC ROOM DATA
   Each key is the URL slug used in /room/:roomId
────────────────────────────────────────────────── */
const roomData = {
  "deluxe-single": {
    title: "Deluxe Single Room",
    type: "Single",
    price: 15000,
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
    rating: 4.7,
    reviews: 98,
    location: "Colombo, Sri Lanka",
    description:
      "A premium single room designed for students who prefer privacy and comfort. This fully furnished room features a comfortable single bed, a spacious study desk with a reading lamp, a personal wardrobe, and an attached bathroom. The room is well-ventilated with a ceiling fan and comes with high-speed WiFi connectivity. Ideal for focused study sessions and a peaceful living experience.",
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
  "spacious-double": {
    title: "Spacious Double Room",
    type: "Double",
    price: 22000,
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&q=80",
    rating: 4.5,
    reviews: 120,
    location: "Colombo, Sri Lanka",
    description:
      "A spacious double room perfect for two students who enjoy shared living. This room comes equipped with two comfortable beds, individual study tables with reading lamps, a shared wardrobe, and a private bathroom. High-speed WiFi, ceiling fan, and power backup ensure uninterrupted comfort and productivity. The room layout is designed to give each occupant their own personal space while fostering a friendly living environment.",
    facilities: ["WiFi", "Fan", "Study Table", "Attached Bath", "Single Bed", "Power Backup", "Wardrobe"],
    checkIn: {
      time: "2:00 PM",
      day: "1st of every month",
      note: "Coordinate with roommate for shared check-in",
    },
    checkOut: {
      time: "11:00 AM",
      day: "Last day of the month",
      note: "Both occupants must confirm check-out",
    },
  },
  "modern-dormitory": {
    title: "Modern Dormitory",
    type: "Dormitory",
    price: 9000,
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80",
    rating: 4.2,
    reviews: 60,
    location: "Colombo, Sri Lanka",
    description:
      "An affordable dormitory-style room ideal for budget-conscious students. This modern shared space accommodates up to 6 students and includes individual beds with personal lockers for secure storage. The room features high-speed WiFi, ceiling fans for ventilation, and shared study tables. A great option for students who enjoy a social living environment while keeping costs low. Common bathrooms are located on the same floor for easy access.",
    facilities: ["WiFi", "Fan", "Study Table", "Locker", "Common Bathroom"],
    checkIn: {
      time: "2:00 PM",
      day: "1st of every month",
      note: "Bed assignment provided at check-in",
    },
    checkOut: {
      time: "11:00 AM",
      day: "Last day of the month",
      note: "Clear personal locker before departure",
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
  const { roomId } = useParams();
  const navigate = useNavigate();

  const room = roomData[roomId];

  /* ---------- ROOM NOT FOUND ---------- */
  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-6">
          <div className="text-7xl mb-6">🏠</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Room Not Found</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            The room you're looking for doesn't exist or may have been removed.
          </p>
          <button
            onClick={() => navigate("/rooms")}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Rooms
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
          src={room.image}
          alt={room.title}
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
              Back to Rooms
            </Link>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
              {room.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-2">
                <FaMapMarkerAlt className="w-4 h-4" />
                {room.location}
              </span>
              <span className="flex items-center gap-2">
                <FaBed className="w-4 h-4" />
                {room.type} Room
              </span>
              <span className="flex items-center gap-1.5">
                <FaStar className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-semibold">{room.rating}</span>
                <span className="text-white/60">({room.reviews} reviews)</span>
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

            {/* Room Type Badge + Description */}
            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  {room.type} Room
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">About This Room</h2>
              <p className="text-gray-600 leading-relaxed">{room.description}</p>
            </div>

            {/* Facilities Grid */}
            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Facilities & Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {room.facilities.map((facility, index) => (
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
                  time={room.checkIn.time}
                  day={room.checkIn.day}
                  note={room.checkIn.note}
                  accentColor="bg-green-500"
                />
                <InfoCard
                  icon={<FaCalendarTimes className="w-5 h-5" />}
                  title="Check-out"
                  time={room.checkOut.time}
                  day={room.checkOut.day}
                  note={room.checkOut.note}
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
                <div className="text-sm text-gray-500 mb-1">Monthly Rate</div>
                <div className="text-4xl font-bold text-purple-600">
                  Rs. {room.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">per month</div>
              </div>

              {/* Room summary */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Room Type</span>
                  <span className="font-medium text-gray-900">{room.type}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Rating</span>
                  <span className="font-medium text-gray-900 flex items-center gap-1">
                    <FaStar className="w-4 h-4 text-yellow-400" />
                    {room.rating}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Reviews</span>
                  <span className="font-medium text-gray-900">{room.reviews}</span>
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
                    {room.location}
                  </span>
                </div>
              </div>

              {/* Book Now Button */}
              <button
                onClick={() => navigate("/contact")}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] shadow-md"
              >
                Book Now
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Contact admin for booking confirmation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsPage;
