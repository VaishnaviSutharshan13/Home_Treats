import React, { useState } from "react";
import RoomCard from "../components/RoomCard";
import { FaFilter, FaChevronDown, FaRedo, FaWifi, FaBook, FaTshirt, FaShieldAlt, FaTint, FaUtensils } from "react-icons/fa";
import { MdSort } from "react-icons/md";

const roomTypes = ["Single", "Double", "Triple", "Dormitory"];
const priceRanges = ["Below 10,000", "10,000 - 20,000", "20,000 - 30,000", "Above 30,000"];
const availabilities = ["Available", "Limited", "Full"];
const sortOptions = ["Price: Low to High", "Price: High to Low", "Rating", "Newest"];

// Dummy data for demonstration
const roomsData = [
  {
    id: 1,
    image: "/images/rooms/room1.jpg",
    title: "Deluxe Single Room",
    price: 15000,
    capacity: 1,
    location: "Colombo, Sri Lanka",
    amenities: ["WiFi", "Study Table", "Fan", "Attached Bath"],
    description: "A cozy single room with all modern amenities, perfect for focused study.",
    availability: "Available",
    rating: 4.7,
    reviews: 98,
  },
  {
    id: 2,
    image: "/images/rooms/room2.jpg",
    title: "Spacious Double Room",
    price: 22000,
    capacity: 2,
    location: "Kandy, Sri Lanka",
    amenities: ["WiFi", "Fan", "Single Bed", "Power Backup"],
    description: "Ideal for two students, this room offers comfort and convenience.",
    availability: "Limited",
    rating: 4.5,
    reviews: 120,
  },
  {
    id: 3,
    image: "/images/rooms/room3.jpg",
    title: "Modern Dormitory",
    price: 9000,
    capacity: 6,
    location: "Galle, Sri Lanka",
    amenities: ["WiFi", "Fan", "Study Table"],
    description: "Affordable dormitory with all basic facilities for group living.",
    availability: "Full",
    rating: 4.2,
    reviews: 60,
  },
  // ...add more rooms as needed
];

const Rooms = () => {
  const [filters, setFilters] = useState({
    roomType: "",
    priceRange: "",
    availability: "",
    sortBy: "",
  });
  const [rooms, setRooms] = useState(roomsData);

  // Filter logic (dummy for now)
  const filteredRooms = rooms.filter((room) => {
    const matchType = !filters.roomType || room.title.includes(filters.roomType);
    const matchPrice = !filters.priceRange ||
      (filters.priceRange === "Below 10,000" && room.price < 10000) ||
      (filters.priceRange === "10,000 - 20,000" && room.price >= 10000 && room.price <= 20000) ||
      (filters.priceRange === "20,000 - 30,000" && room.price > 20000 && room.price <= 30000) ||
      (filters.priceRange === "Above 30,000" && room.price > 30000);
    const matchAvailability = !filters.availability || room.availability === filters.availability;
    return matchType && matchPrice && matchAvailability;
  });

  // Sort logic (dummy for now)
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (filters.sortBy === "Price: Low to High") return a.price - b.price;
    if (filters.sortBy === "Price: High to Low") return b.price - a.price;
    if (filters.sortBy === "Rating") return b.rating - a.rating;
    return 0;
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFilters({ roomType: "", priceRange: "", availability: "", sortBy: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="py-10 bg-gradient-to-b from-purple-100 to-white text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-purple-700 mb-2">Find Your Perfect Student Room</h1>
        <p className="text-lg text-gray-600 font-medium">Browse and book the best student rooms in Sri Lanka. Filter by type, price, and more!</p>
      </header>

      {/* Filter Bar */}
      <section className="max-w-5xl mx-auto mt-8 px-4">
        <div className="bg-purple-50 rounded-2xl shadow flex flex-col md:flex-row items-center gap-4 p-6 md:gap-6 animate-fadeIn">
          {/* Room Type */}
          <div className="flex items-center w-full md:w-auto relative group">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
            <select
              name="roomType"
              value={filters.roomType}
              onChange={handleFilterChange}
              className="pl-10 pr-8 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 px-4 py-2 w-full md:w-40 text-gray-700 transition-all duration-200 hover:border-purple-400"
            >
              <option value="">Room Type</option>
              {roomTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {/* Price Range */}
          <div className="flex items-center w-full md:w-auto relative group">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
            <select
              name="priceRange"
              value={filters.priceRange}
              onChange={handleFilterChange}
              className="pl-10 pr-8 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 px-4 py-2 w-full md:w-44 text-gray-700 transition-all duration-200 hover:border-purple-400"
            >
              <option value="">Price Range</option>
              {priceRanges.map((range) => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {/* Availability */}
          <div className="flex items-center w-full md:w-auto relative group">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
            <select
              name="availability"
              value={filters.availability}
              onChange={handleFilterChange}
              className="pl-10 pr-8 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 px-4 py-2 w-full md:w-36 text-gray-700 transition-all duration-200 hover:border-purple-400"
            >
              <option value="">Availability</option>
              {availabilities.map((avail) => (
                <option key={avail} value={avail}>{avail}</option>
              ))}
            </select>
            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {/* Sort By */}
          <div className="flex items-center w-full md:w-auto relative group">
            <MdSort className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="pl-10 pr-8 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 px-4 py-2 w-full md:w-36 text-gray-700 transition-all duration-200 hover:border-purple-400"
            >
              <option value="">Sort By</option>
              {sortOptions.map((sort) => (
                <option key={sort} value={sort}>{sort}</option>
              ))}
            </select>
            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 border-2 border-purple-400 text-purple-600 font-semibold px-4 py-2 rounded-lg bg-white hover:bg-purple-50 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <FaRedo /> Reset Filters
          </button>
        </div>
      </section>

      {/* Results Info */}
      <div className="max-w-5xl mx-auto mt-8 px-4">
        <p className="text-gray-700 font-medium mb-4">
          Showing {sortedRooms.length} rooms available
        </p>
      </div>

      {/* Room Cards Grid */}
      <section className="max-w-5xl mx-auto px-4">
        {sortedRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
            <span className="text-5xl text-purple-300 mb-4">😕</span>
            <p className="text-xl text-gray-500 font-semibold">No rooms found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
            {sortedRooms.map((room) => (
              <RoomCard
                key={room.id}
                {...room}
                onViewDetails={() => alert(`View details for ${room.title}`)}
                onBookNow={() => alert(`Book now for ${room.title}`)}
                onQuickView={() => alert(`Quick view for ${room.title}`)}
              />
            ))}
          </div>
        )}
        {/* Pagination/Load More (Bonus) */}
        {sortedRooms.length > 0 && (
          <div className="flex justify-center mt-10">
            <button
              className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-purple-700 hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              onClick={() => {
                // Simulate loading spinner
                const btn = event.currentTarget;
                btn.disabled = true;
                btn.innerHTML = '<svg class=\'animate-spin h-5 w-5 mr-2 text-white\' xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\'><circle class=\'opacity-25\' cx=\'12\' cy=\'12\' r=\'10\' stroke=\'currentColor\' strokeWidth=\'4\'></circle><path class=\'opacity-75\' fill=\'currentColor\' d=\'M4 12a8 8 0 018-8v8z\'></path></svg>Loading...';
                setTimeout(() => {
                  btn.disabled = false;
                  btn.innerHTML = 'Load More';
                }, 1200);
              }}
            >
              Load More
            </button>
          </div>
        )}
      </section>
      {/* Hostel Facilities Section */}
      <section className="max-w-5xl mx-auto mt-16 px-4 bg-gradient-to-br from-purple-50 via-white to-purple-100 rounded-2xl py-8 animate-fadeIn">
        <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center flex items-center justify-center gap-2">Hostel Facilities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[
            {
              icon: (
                <span className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-300">
                  <FaWifi className="w-7 h-7 text-purple-700" />
                </span>
              ),
              title: "High-Speed WiFi",
              desc: "Fast and reliable internet access in all rooms and common areas.",
            },
            {
              icon: (
                <span className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-300">
                  <FaBook className="w-7 h-7 text-purple-700" />
                </span>
              ),
              title: "Study Area",
              desc: "Quiet, dedicated spaces for focused study and group work.",
            },
            {
              icon: (
                <span className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-300">
                  <FaTshirt className="w-7 h-7 text-purple-700" />
                </span>
              ),
              title: "Laundry Service",
              desc: "On-site laundry facilities for your convenience.",
            },
            {
              icon: (
                <span className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-300">
                  <FaShieldAlt className="w-7 h-7 text-purple-700" />
                </span>
              ),
              title: "CCTV Security",
              desc: "24/7 surveillance for your safety and peace of mind.",
            },
            {
              icon: (
                <span className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-300">
                  <FaTint className="w-7 h-7 text-purple-700" />
                </span>
              ),
              title: "Water Supply",
              desc: "Clean and safe water available at all times.",
            },
            {
              icon: (
                <span className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-300">
                  <FaTint className="w-7 h-7 text-purple-700" />
                </span>
              ),
              title: "24/7 Water Supply",
              desc: "Uninterrupted water supply for all residents.",
            },
            {
              icon: (
                <span className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-300">
                  <FaUtensils className="w-7 h-7 text-purple-700" />
                </span>
              ),
              title: "Common Kitchen",
              desc: "Fully equipped kitchen for self-cooking and meal prep.",
            },
          ].map((facility, idx) => (
            <div
              key={facility.title}
              className="bg-white rounded-xl shadow hover:shadow-lg transition-all p-6 flex flex-col items-center text-center group animate-fadeIn"
            >
              {facility.icon}
              <h3 className="mt-4 text-lg font-semibold text-purple-700">{facility.title}</h3>
              <p className="mt-2 text-gray-600 text-sm">{facility.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hostel Rules Section */}
      <section className="max-w-3xl mx-auto mt-16 px-4">
        <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">Important: Hostel Rules & Regulations</h2>
        <div className="bg-purple-50 rounded-2xl shadow p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Valid student ID required",
              "Maintain cleanliness",
              "No smoking or alcohol",
              "Visitors allowed only in common areas",
              "Respect hostel property",
            ].map((rule) => (
              <div key={rule} className="flex items-start gap-3 py-1">
                <span className="mt-1 text-green-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                </span>
                <span className="text-gray-700 font-medium">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Booking Works Section */}
      <section className="max-w-4xl mx-auto mt-16 px-4">
        <h2 className="text-2xl font-bold text-purple-700 mb-8 text-center">How Booking Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
          {[
            {
              title: "Choose a room",
              icon: (
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              ),
            },
            {
              title: "Click Book Now",
              icon: (
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M16 3v4" /><path d="M8 3v4" /></svg>
              ),
            },
            {
              title: "Fill the booking form",
              icon: (
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 2v4" /><path d="M16 2v4" /></svg>
              ),
            },
            {
              title: "Wait for admin approval",
              icon: (
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
              ),
            },
          ].map((step, idx, arr) => (
            <React.Fragment key={step.title}>
              <div className="flex flex-col items-center text-center relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-600 text-white font-bold text-xl mb-2 shadow">
                  {idx + 1}
                </div>
                <div className="mb-2">{step.icon}</div>
                <div className="text-purple-700 font-semibold">{step.title}</div>
              </div>
              {idx < arr.length - 1 && (
                <div className="hidden md:block flex-1 h-1 bg-purple-200 mx-2 rounded"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Rooms;
