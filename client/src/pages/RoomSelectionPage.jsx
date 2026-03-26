import React, { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaSearch,
  FaBuilding,
  FaLayerGroup,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaFilter,
  FaRedo,
  FaDoorOpen,
} from "react-icons/fa";
import { MdMeetingRoom } from "react-icons/md";

/* ──────────────────────────────────────────────────
   ROOM TYPE CONFIGURATION
────────────────────────────────────────────────── */
const roomTypeConfig = {
  "deluxe-single": {
    title: "Deluxe Single Room",
    label: "Single",
    price: 15000,
    color: "purple",
  },
  "spacious-double": {
    title: "Spacious Double Room",
    label: "Double",
    price: 22000,
    color: "purple",
  },
  "modern-dormitory": {
    title: "Modern Dormitory",
    label: "Dormitory",
    price: 9000,
    color: "purple",
  },
};

/* ──────────────────────────────────────────────────
   STATIC ROOM DATA — organized by room type slug
   Each room has a unique room number
────────────────────────────────────────────────── */
const allRooms = {
  "deluxe-single": [
    { id: "ds-1", roomNumber: "B01-101", building: "Building 01", floor: "1st Floor", status: "Available" },
    { id: "ds-2", roomNumber: "B01-202", building: "Building 01", floor: "2nd Floor", status: "Available", note: "Only 1 left" },
    { id: "ds-3", roomNumber: "B01-303", building: "Building 01", floor: "3rd Floor", status: "Not Available" },
    { id: "ds-4", roomNumber: "B02-101", building: "Building 02", floor: "1st Floor", status: "Available" },
    { id: "ds-5", roomNumber: "B02-204", building: "Building 02", floor: "2nd Floor", status: "Limited", note: "Only 1 left" },
    { id: "ds-6", roomNumber: "B02-305", building: "Building 02", floor: "3rd Floor", status: "Not Available" },
    { id: "ds-7", roomNumber: "B01-401", building: "Building 01", floor: "4th Floor", status: "Available" },
    { id: "ds-8", roomNumber: "B02-402", building: "Building 02", floor: "4th Floor", status: "Limited", note: "Only 2 left" },
  ],
  "spacious-double": [
    { id: "sd-1", roomNumber: "B01-102", building: "Building 01", floor: "1st Floor", status: "Available" },
    { id: "sd-2", roomNumber: "B01-203", building: "Building 01", floor: "2nd Floor", status: "Limited", note: "Only 1 left" },
    { id: "sd-3", roomNumber: "B01-304", building: "Building 01", floor: "3rd Floor", status: "Available" },
    { id: "sd-4", roomNumber: "B02-102", building: "Building 02", floor: "1st Floor", status: "Not Available" },
    { id: "sd-5", roomNumber: "B02-205", building: "Building 02", floor: "2nd Floor", status: "Available" },
    { id: "sd-6", roomNumber: "B02-306", building: "Building 02", floor: "3rd Floor", status: "Available" },
    { id: "sd-7", roomNumber: "B01-403", building: "Building 01", floor: "4th Floor", status: "Not Available" },
    { id: "sd-8", roomNumber: "B02-404", building: "Building 02", floor: "4th Floor", status: "Limited", note: "Only 1 left" },
  ],
  "modern-dormitory": [
    { id: "md-1", roomNumber: "B01-103", building: "Building 01", floor: "1st Floor", status: "Available" },
    { id: "md-2", roomNumber: "B01-204", building: "Building 01", floor: "2nd Floor", status: "Available" },
    { id: "md-3", roomNumber: "B01-305", building: "Building 01", floor: "3rd Floor", status: "Not Available" },
    { id: "md-4", roomNumber: "B02-103", building: "Building 02", floor: "1st Floor", status: "Limited", note: "Only 2 left" },
    { id: "md-5", roomNumber: "B02-206", building: "Building 02", floor: "2nd Floor", status: "Available" },
    { id: "md-6", roomNumber: "B02-307", building: "Building 02", floor: "3rd Floor", status: "Not Available" },
    { id: "md-7", roomNumber: "B01-404", building: "Building 01", floor: "4th Floor", status: "Available" },
    { id: "md-8", roomNumber: "B02-405", building: "Building 02", floor: "4th Floor", status: "Available" },
  ],
};

const buildings = ["Building 01", "Building 02"];
const floors = ["1st Floor", "2nd Floor", "3rd Floor", "4th Floor"];
const statuses = ["Available", "Limited", "Not Available"];

/* ──────────────────────────────────────────────────
   STATUS STYLING
────────────────────────────────────────────────── */
const statusConfig = {
  Available: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
    icon: <FaCheckCircle className="w-3.5 h-3.5" />,
  },
  Limited: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    dot: "bg-yellow-500",
    icon: <FaExclamationCircle className="w-3.5 h-3.5" />,
  },
  "Not Available": {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-500",
    icon: <FaTimesCircle className="w-3.5 h-3.5" />,
  },
};

/* ══════════════════════════════════════════════════
   ROOM SELECTION PAGE COMPONENT
══════════════════════════════════════════════════ */
const RoomSelectionPage = () => {
  const { roomType } = useParams();
  const navigate = useNavigate();

  const config = roomTypeConfig[roomType];
  const rooms = allRooms[roomType] || [];

  // State
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [filters, setFilters] = useState({
    building: "",
    floor: "",
    availability: "",
    search: "",
  });

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchBuilding = !filters.building || room.building === filters.building;
      const matchFloor = !filters.floor || room.floor === filters.floor;
      const matchAvailability = !filters.availability || room.status === filters.availability;
      const matchSearch =
        !filters.search ||
        room.roomNumber.toLowerCase().includes(filters.search.toLowerCase());
      return matchBuilding && matchFloor && matchAvailability && matchSearch;
    });
  }, [rooms, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFilters({ building: "", floor: "", availability: "", search: "" });
    setSelectedRoom(null);
  };

  const handleSelectRoom = (room) => {
    if (room.status === "Not Available") return;
    setSelectedRoom((prev) => (prev?.id === room.id ? null : room));
  };

  const handleContinueBooking = () => {
    if (!selectedRoom || !config) return;
    // Save selected room data to localStorage for post-login redirect
    const bookingData = {
      roomId: selectedRoom.roomNumber,
      building: selectedRoom.building,
      floor: selectedRoom.floor,
      roomType: config.title,
      price: config.price,
    };
    localStorage.setItem("selectedRoom", JSON.stringify(bookingData));
    navigate("/login");
  };

  /* ---------- ROOM TYPE NOT FOUND ---------- */
  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-6">
          <div className="text-7xl mb-6">🏠</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Room Type Not Found</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            The room type you're looking for doesn't exist.
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
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* ── HERO SECTION ─────────────────────────── */}
      <section className="w-full bg-gradient-to-br from-purple-800 via-purple-600 to-purple-500 relative py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          {/* Back link */}
          <Link
            to={`/room/${roomType}`}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors text-sm font-medium"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
            Back to {config.title}
          </Link>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-8 shadow-lg">
            <div className="uppercase text-xs tracking-widest text-white/70 font-semibold mb-2">
              HOME TREATS
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
              Select Your Room
            </h1>
            <div className="w-12 h-1 bg-white/30 rounded-full mb-4" />
            <p className="text-base sm:text-lg text-white/80 font-medium">
              Choose a specific <span className="text-white font-semibold">{config.title}</span> to book
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-semibold">
                Rs. {config.price.toLocaleString()} /month
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-semibold">
                {rooms.filter((r) => r.status !== "Not Available").length} rooms available
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTER BAR ───────────────────────────── */}
      <section className="max-w-6xl mx-auto mt-8 px-4">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-purple-500 w-4 h-4" />
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Filter Rooms</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                name="search"
                placeholder="Search room number..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm text-gray-700 transition-all outline-none"
              />
            </div>
            {/* Building */}
            <div className="relative">
              <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 w-4 h-4 pointer-events-none" />
              <select
                name="building"
                value={filters.building}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm text-gray-700 transition-all outline-none appearance-none bg-white cursor-pointer"
              >
                <option value="">All Buildings</option>
                {buildings.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            {/* Floor */}
            <div className="relative">
              <FaLayerGroup className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 w-4 h-4 pointer-events-none" />
              <select
                name="floor"
                value={filters.floor}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm text-gray-700 transition-all outline-none appearance-none bg-white cursor-pointer"
              >
                <option value="">All Floors</option>
                {floors.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            {/* Availability */}
            <div className="relative">
              <FaCheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 w-4 h-4 pointer-events-none" />
              <select
                name="availability"
                value={filters.availability}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm text-gray-700 transition-all outline-none appearance-none bg-white cursor-pointer"
              >
                <option value="">All Status</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {/* Reset */}
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 border-2 border-purple-400 text-purple-600 font-semibold px-4 py-2.5 rounded-xl bg-white hover:bg-purple-50 transition-all duration-200 text-sm"
            >
              <FaRedo className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* ── RESULTS INFO ─────────────────────────── */}
      <div className="max-w-6xl mx-auto mt-6 px-4">
        <p className="text-gray-600 text-sm font-medium">
          Showing <span className="text-purple-600 font-bold">{filteredRooms.length}</span> rooms
          {filters.building || filters.floor || filters.availability || filters.search
            ? " (filtered)"
            : ""}
        </p>
      </div>

      {/* ── ROOM CARDS GRID ──────────────────────── */}
      <section className="max-w-6xl mx-auto mt-4 px-4">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="text-5xl text-purple-300 mb-4">🔍</span>
            <p className="text-xl text-gray-500 font-semibold">No rooms match your filters</p>
            <button
              onClick={handleReset}
              className="mt-4 text-purple-600 font-medium hover:underline text-sm"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredRooms.map((room) => {
              const sc = statusConfig[room.status];
              const isSelected = selectedRoom?.id === room.id;
              const isUnavailable = room.status === "Not Available";

              return (
                <div
                  key={room.id}
                  className={`
                    relative bg-white rounded-2xl border-2 transition-all duration-300 p-5
                    ${isSelected
                      ? "border-purple-500 shadow-lg shadow-purple-100 ring-2 ring-purple-200"
                      : "border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"
                    }
                    ${isUnavailable ? "opacity-60" : "cursor-pointer"}
                  `}
                  onClick={() => handleSelectRoom(room)}
                >
                  {/* Selected check mark */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center shadow-md">
                      <FaCheckCircle className="text-white w-4 h-4" />
                    </div>
                  )}

                  {/* Room number header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isUnavailable ? "bg-gray-100" : "bg-purple-100"}`}>
                      <MdMeetingRoom className={`w-6 h-6 ${isUnavailable ? "text-gray-400" : "text-purple-600"}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{room.roomNumber}</h3>
                      <p className="text-xs text-gray-400 font-medium">{config.label} Room</p>
                    </div>
                  </div>

                  {/* Room info */}
                  <div className="space-y-2.5 mb-4">
                    <div className="flex items-center gap-2.5 text-sm">
                      <FaBuilding className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="text-gray-600">{room.building}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm">
                      <FaLayerGroup className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="text-gray-600">{room.floor}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm">
                      <FaDoorOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="text-gray-600">{config.label}</span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className={`flex items-center justify-between rounded-xl px-3 py-2 ${sc.bg} ${sc.border} border`}>
                    <div className={`flex items-center gap-2 ${sc.text} font-semibold text-sm`}>
                      {sc.icon}
                      {room.status}
                    </div>
                    {room.note && (
                      <span className={`text-xs font-medium ${sc.text} opacity-80`}>
                        {room.note}
                      </span>
                    )}
                  </div>

                  {/* Select button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectRoom(room);
                    }}
                    disabled={isUnavailable}
                    className={`
                      w-full mt-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300
                      ${isUnavailable
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : isSelected
                          ? "bg-purple-600 text-white shadow-md hover:bg-purple-700"
                          : "bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200"
                      }
                    `}
                  >
                    {isUnavailable
                      ? "Not Available"
                      : isSelected
                        ? "✓ Selected"
                        : "Select Room"
                    }
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── STICKY BOTTOM SUMMARY BAR ───────────── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 transform ${
          selectedRoom ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-white border-t-2 border-purple-200 shadow-[0_-8px_30px_rgba(124,58,237,0.12)]">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Selected room info */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                <MdMeetingRoom className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Selected Room</p>
                {selectedRoom && (
                  <p className="text-gray-900 font-bold text-sm sm:text-base">
                    {selectedRoom.roomNumber}
                    <span className="text-gray-400 font-normal mx-2">|</span>
                    {selectedRoom.building}
                    <span className="text-gray-400 font-normal mx-2">|</span>
                    {selectedRoom.floor}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleContinueBooking}
                className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue Booking →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomSelectionPage;
