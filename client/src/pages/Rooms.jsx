import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoomCard from "../components/RoomCard";
import {
  FaArrowRight,
  FaBook,
  FaChevronDown,
  FaFilter,
  FaRedo,
  FaShieldAlt,
  FaTshirt,
  FaTint,
  FaUtensils,
  FaWifi,
} from "react-icons/fa";
import { MdSort } from "react-icons/md";

const floorNames = ["1st Floor", "2nd Floor", "3rd Floor", "4th Floor"];
const priceRanges = ["Below 15,000", "15,000 - 20,000", "20,000 - 25,000", "Above 25,000"];
const availabilities = ["Available", "Limited", "Full"];
const sortOptions = ["Price: Low to High", "Price: High to Low", "Rating"];

const floorsData = [
  {
    id: "1st-floor",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
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
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
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
    image: "https://images.unsplash.com/photo-1616594039964-3fda1f0b9b95?auto=format&fit=crop&w=1200&q=80",
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
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
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

  const sortedFloors = useMemo(() => {
    const filteredFloors = floors.filter((floor) => {
      const matchType = !filters.floorName || floor.title === filters.floorName;
      const matchPrice =
        !filters.priceRange ||
        (filters.priceRange === "Below 15,000" && floor.price < 15000) ||
        (filters.priceRange === "15,000 - 20,000" && floor.price >= 15000 && floor.price <= 20000) ||
        (filters.priceRange === "20,000 - 25,000" && floor.price > 20000 && floor.price <= 25000) ||
        (filters.priceRange === "Above 25,000" && floor.price > 25000);
      const matchAvailability = !filters.availability || floor.availability === filters.availability;
      return matchType && matchPrice && matchAvailability;
    });

    return [...filteredFloors].sort((a, b) => {
      if (filters.sortBy === "Price: Low to High") return a.price - b.price;
      if (filters.sortBy === "Price: High to Low") return b.price - a.price;
      if (filters.sortBy === "Rating") return b.rating - a.rating;
      return 0;
    });
  }, [filters, floors]);

  const stats = useMemo(
    () => ({
      total: floors.length,
      available: floors.filter((f) => f.availability === "Available").length,
      limited: floors.filter((f) => f.availability === "Limited").length,
      full: floors.filter((f) => f.availability === "Full").length,
    }),
    [floors],
  );

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFilters({ floorName: "", priceRange: "", availability: "", sortBy: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-800 via-purple-700 to-purple-500 py-16 sm:py-20">
        <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">Home Treats Residence</p>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">Choose Your Ideal Floor</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
              Compare pricing, room availability, and amenities in one place, then move to floor details with a single click.
            </p>
            <button
              type="button"
              onClick={() => document.getElementById("rooms-grid")?.scrollIntoView({ behavior: "smooth" })}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-purple-700 shadow-lg shadow-purple-950/20 transition hover:bg-purple-50"
            >
              Explore Floors
              <FaArrowRight className="text-xs" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/25 bg-white/10 p-4 backdrop-blur-md">
            <div className="rounded-xl bg-white/95 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-purple-500">Total Floors</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="rounded-xl bg-white/95 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-purple-500">Available</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{stats.available}</p>
            </div>
            <div className="rounded-xl bg-white/95 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-purple-500">Limited</p>
              <p className="mt-1 text-2xl font-bold text-amber-500">{stats.limited}</p>
            </div>
            <div className="rounded-xl bg-white/95 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-purple-500">Full</p>
              <p className="mt-1 text-2xl font-bold text-rose-500">{stats.full}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-8 max-w-6xl px-4">
        <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-xl shadow-purple-900/10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-purple-700">Filter Floors</h2>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 transition hover:bg-purple-100"
            >
              <FaRedo className="text-[11px]" />
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <FaFilter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
              <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              name="floorName"
              value={filters.floorName}
              onChange={handleFilterChange}
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-8 text-sm text-gray-700 transition-all duration-200 hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
            >
                <option value="">All Floors</option>
              {floorNames.map((type) => (
                  <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

            <div className="relative">
              <FaFilter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
              <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              name="priceRange"
              value={filters.priceRange}
              onChange={handleFilterChange}
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-8 text-sm text-gray-700 transition-all duration-200 hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
            >
                <option value="">Any Price Range</option>
              {priceRanges.map((range) => (
                  <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>

            <div className="relative">
              <FaFilter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
              <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              name="availability"
              value={filters.availability}
              onChange={handleFilterChange}
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-8 text-sm text-gray-700 transition-all duration-200 hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
            >
                <option value="">Any Availability</option>
              {availabilities.map((avail) => (
                  <option key={avail} value={avail}>{avail}</option>
              ))}
            </select>
          </div>

            <div className="relative">
              <MdSort className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
              <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-8 text-sm text-gray-700 transition-all duration-200 hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
            >
                <option value="">Sort Results</option>
              {sortOptions.map((sort) => (
                  <option key={sort} value={sort}>{sort}</option>
              ))}
            </select>
            </div>
          </div>
        </div>
      </section>

      <section id="rooms-grid" className="mx-auto mt-8 max-w-6xl px-4">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gray-700">Showing {sortedFloors.length} floors</p>
          <div className="inline-flex rounded-full border border-purple-200 bg-white p-1 text-xs font-medium text-purple-700">
            <span className="rounded-full bg-purple-100 px-3 py-1">Professional Floor Listing</span>
          </div>
        </div>

        {sortedFloors.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-purple-100 bg-white py-20">
            <span className="text-5xl text-purple-300 mb-4">😕</span>
            <p className="text-xl font-semibold text-gray-500">No floors found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
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

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-purple-100 p-8 shadow-sm">
          <h2 className="text-center text-2xl font-bold text-purple-700">Hostel Facilities</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-gray-600">
            Every floor is supported by modern student-focused facilities for comfort, safety, and convenience.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: (
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow">
                  <FaWifi className="h-6 w-6" />
                </span>
              ),
              title: "High-Speed WiFi",
              desc: "Fast and reliable internet access in all rooms and common areas.",
            },
            {
              icon: (
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow">
                  <FaBook className="h-6 w-6" />
                </span>
              ),
              title: "Study Area",
              desc: "Quiet, dedicated spaces for focused study and group work.",
            },
            {
              icon: (
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow">
                  <FaTshirt className="h-6 w-6" />
                </span>
              ),
              title: "Laundry Service",
              desc: "On-site laundry facilities for your convenience.",
            },
            {
              icon: (
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow">
                  <FaShieldAlt className="h-6 w-6" />
                </span>
              ),
              title: "CCTV Security",
              desc: "24/7 surveillance for your safety and peace of mind.",
            },
            {
              icon: (
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow">
                  <FaTint className="h-6 w-6" />
                </span>
              ),
              title: "Water Supply",
              desc: "Clean and safe water available at all times.",
            },
            {
              icon: (
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow">
                  <FaTint className="h-6 w-6" />
                </span>
              ),
              title: "24/7 Water Supply",
              desc: "Uninterrupted water supply for all residents.",
            },
            {
              icon: (
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow">
                  <FaUtensils className="h-6 w-6" />
                </span>
              ),
              title: "Common Kitchen",
              desc: "Fully equipped kitchen for self-cooking and meal prep.",
            },
          ].map((facility, idx) => (
            <div
              key={facility.title}
              className="group rounded-2xl border border-purple-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              {facility.icon}
              <h3 className="mt-4 text-lg font-semibold text-purple-700">{facility.title}</h3>
              <p className="mt-2 text-gray-600 text-sm">{facility.desc}</p>
            </div>
          ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 grid max-w-6xl gap-6 px-4 md:grid-cols-2">
        <div className="rounded-2xl border border-purple-100 bg-white p-7 shadow-sm">
          <h2 className="text-xl font-bold text-purple-700">Hostel Rules & Regulations</h2>
          <div className="mt-5 space-y-3">
            {[
              "Valid student ID required",
              "Maintain cleanliness",
              "No smoking or alcohol",
              "Visitors allowed only in common areas",
              "Respect hostel property",
            ].map((rule) => (
              <div key={rule} className="flex items-start gap-3 rounded-lg bg-purple-50 px-3 py-2">
                <span className="mt-1 text-green-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                </span>
                <span className="text-sm font-medium text-gray-700">{rule}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-white p-7 shadow-sm">
          <h2 className="text-xl font-bold text-purple-700">How Booking Works</h2>
          <div className="mt-5 space-y-3">
          {[
            {
              title: "Choose a floor",
              detail: "Filter by availability and budget to shortlist options.",
            },
            {
              title: "Click View Details",
              detail: "Inspect room setup, amenities, and monthly price range.",
            },
            {
              title: "Select your room",
              detail: "Submit the booking request for your preferred room.",
            },
            {
              title: "Wait for admin approval",
              detail: "Receive confirmation once your request is approved.",
            },
          ].map((step, idx) => (
            <div key={step.title} className="flex items-start gap-3 rounded-lg bg-purple-50 px-3 py-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
                  {idx + 1}
              </span>
              <div>
                <p className="font-semibold text-purple-700">{step.title}</p>
                <p className="text-sm text-gray-600">{step.detail}</p>
              </div>
            </div>
          ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Rooms;
