import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RoomCard from "../components/RoomCard";
import { FaFilter, FaChevronDown, FaRedo, FaWifi, FaBook, FaTshirt, FaShieldAlt, FaTint, FaUtensils } from "react-icons/fa";
import { MdSort } from "react-icons/md";

const floorNames = ["1st Floor", "2nd Floor", "3rd Floor", "4th Floor"];
const priceRanges = ["Below 15,000", "15,000 - 20,000", "20,000 - 25,000", "Above 25,000"];
const availabilities = ["Available", "Limited", "Full"];
const sortOptions = ["Price: Low to High", "Price: High to Low", "Rating"];

const floorsData = [
  {
    id: "1st-floor",
    image: "/images/rooms/room1.jpg",
    title: "1st Floor",
    price: 12000,
    priceMax: 20000,
    capacity: "10 Rooms",
    location: "6 Available",
    amenities: ["WiFi", "Study Table", "Attached Bath", "Power Backup"],
    description: "Quiet floor for single students with easy access to study areas.",
    availability: "Available",
    rating: 4.8,
    reviews: 132,
  },
  {
    id: "2nd-floor",
    image: "/images/rooms/room2.jpg",
    title: "2nd Floor",
    price: 14000,
    priceMax: 22000,
    capacity: "12 Rooms",
    location: "4 Available",
    amenities: ["WiFi", "Fan", "Study Table", "Locker"],
    description: "Balanced floor with comfortable sharing options for students.",
    availability: "Limited",
    rating: 4.6,
    reviews: 101,
  },
  {
    id: "3rd-floor",
    image: "/images/rooms/room3.jpg",
    title: "3rd Floor",
    price: 15000,
    priceMax: 24000,
    capacity: "8 Rooms",
    location: "2 Available",
    amenities: ["WiFi", "Power Backup", "Attached Bath"],
    description: "Premium higher floor with better privacy and focused environment.",
    availability: "Limited",
    rating: 4.7,
    reviews: 88,
  },
  {
    id: "4th-floor",
    image: "/images/rooms/room2.jpg",
    title: "4th Floor",
    price: 16000,
    priceMax: 25000,
    capacity: "9 Rooms",
    location: "0 Available",
    amenities: ["WiFi", "Study Table", "Fan"],
    description: "Top floor with city view rooms suitable for long-term stays.",
    availability: "Full",
    rating: 4.5,
    reviews: 76,
  },
];

const Rooms = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    floorName: "",
    priceRange: "",
    availability: "",
    sortBy: "",
  });
  const [floors] = useState(floorsData);

  const filteredFloors = floors.filter((floor) => {
    const matchType = !filters.floorName || floor.title === filters.floorName;
    const matchPrice = !filters.priceRange ||
      (filters.priceRange === "Below 15,000" && floor.price < 15000) ||
      (filters.priceRange === "15,000 - 20,000" && floor.price >= 15000 && floor.price <= 20000) ||
      (filters.priceRange === "20,000 - 25,000" && floor.price > 20000 && floor.price <= 25000) ||
      (filters.priceRange === "Above 25,000" && floor.price > 25000);
    const matchAvailability = !filters.availability || floor.availability === filters.availability;
    return matchType && matchPrice && matchAvailability;
  });

  const sortedFloors = [...filteredFloors].sort((a, b) => {
    if (filters.sortBy === "Price: Low to High") return a.price - b.price;
    if (filters.sortBy === "Price: High to Low") return b.price - a.price;
    if (filters.sortBy === "Rating") return b.rating - a.rating;
    return 0;
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFilters({ floorName: "", priceRange: "", availability: "", sortBy: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <section className="w-full bg-gradient-to-br from-purple-800 via-purple-600 to-purple-500 relative flex flex-col items-center justify-center text-center py-28 sm:py-24">
        {/* Optional overlay pattern or blur */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="text-sm text-white/70 mb-4 tracking-wide">Home &gt; Floors</div>
          {/* Glassmorphism container */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-10 shadow-lg flex flex-col items-center animate-fadeIn">
            {/* Small label */}
            <div className="uppercase text-xs tracking-widest text-white/80 font-semibold mb-2">HOME TREATS</div>
            {/* Heading */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-wide text-white drop-shadow-lg mb-2">
              Our Floors
            </h1>
            {/* Divider */}
            <div className="w-12 h-1 bg-white/30 rounded-full mb-4"></div>
            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-white/80 font-medium mt-4">
              Browse hostel floors and room availability at Home Treats
            </p>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="max-w-5xl mx-auto mt-8 px-4">
        <div className="bg-purple-50 rounded-2xl shadow flex flex-col md:flex-row items-center gap-4 p-6 md:gap-6 animate-fadeIn">
          {/* Floor */}
          <div className="flex items-center w-full md:w-auto relative group">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
            <select
              name="floorName"
              value={filters.floorName}
              onChange={handleFilterChange}
              className="pl-10 pr-8 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 px-4 py-2 w-full md:w-40 text-gray-700 transition-all duration-200 hover:border-purple-400"
            >
              <option value="">Floor</option>
              {floorNames.map((type) => (
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
          Showing {sortedFloors.length} floors
        </p>
      </div>

      {/* Floor Cards Grid */}
      <section className="max-w-5xl mx-auto px-4">
        {sortedFloors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
            <span className="text-5xl text-purple-300 mb-4">😕</span>
            <p className="text-xl text-gray-500 font-semibold">No floors found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 animate-fadeIn">
            {sortedFloors.map((floor) => (
              <RoomCard
                key={floor.id}
                {...floor}
                priceLabel={`Rs. ${floor.price.toLocaleString()} - ${floor.priceMax.toLocaleString()} /month`}
                onViewDetails={() => navigate(`/floor/${floor.id}`)}
              />
            ))}
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
              title: "Choose a floor",
              icon: (
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              ),
            },
            {
              title: "Click View Details",
              icon: (
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M16 3v4" /><path d="M8 3v4" /></svg>
              ),
            },
            {
              title: "Select your room",
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
