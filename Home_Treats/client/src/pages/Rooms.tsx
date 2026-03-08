/**
 * Rooms Page - Home_Treats
 * Fetches rooms from API, displays in responsive card grid with filters
 * All prices in Sri Lankan Rupees (LKR)
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaFilter,
  FaBed,
  FaUsers,
  FaMapMarkerAlt,
  FaSpinner,
  FaArrowRight,
  FaCheckCircle,
  FaTimesCircle,
  FaWifi,
  FaSnowflake,
  FaChair,
  FaDoorOpen,
  FaBath,
  FaHandsHelping,
  FaLock,
  FaSignInAlt,
} from 'react-icons/fa';
import { roomService } from '../services';
import { useAuth } from '../context/AuthContext';

interface Room {
  _id: string;
  name: string;
  roomNumber: string;
  block: string;
  floor: string;
  capacity: number;
  occupied: number;
  type: string;
  price: number;
  status: string;
  description: string;
  image: string;
  location: string;
  facilities: string[];
  createdAt: string;
}

const facilityIcons: Record<string, React.ReactNode> = {
  WiFi: <FaWifi className="w-3.5 h-3.5" />,
  AC: <FaSnowflake className="w-3.5 h-3.5" />,
  'Study Table': <FaChair className="w-3.5 h-3.5" />,
  Wardrobe: <FaDoorOpen className="w-3.5 h-3.5" />,
  'Private Bathroom': <FaBath className="w-3.5 h-3.5" />,
  'Common Area': <FaHandsHelping className="w-3.5 h-3.5" />,
  Lockers: <FaLock className="w-3.5 h-3.5" />,
};

const formatLKR = (amount: number) =>
  `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 0 })}`;

// Room images for cards that don't have custom images
const defaultImages = [
  'https://images.unsplash.com/photo-1598928636135-ab763dbb1a9a?w=600',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600',
  'https://images.unsplash.com/photo-1522771739485-4b4b999b6d2?w=600',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600',
  'https://images.unsplash.com/photo-1611892440504-42a792e24ad1?w=600',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600',
  'https://images.unsplash.com/photo-1618773984122-6e618c23b6a3?w=600',
];

const Rooms = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');

  // Helper: check room availability
  const isRoomAvailable = (room: Room) => {
    const beds = room.capacity - room.occupied;
    return room.status === 'Available' && beds > 0;
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await roomService.getAll();
        setRooms(res.data ?? res);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load rooms');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Apply filters
  const filteredRooms = rooms
    .filter((room) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        room.name?.toLowerCase().includes(term) ||
        room.roomNumber.toLowerCase().includes(term) ||
        room.block.toLowerCase().includes(term) ||
        room.type.toLowerCase().includes(term);
      const matchesType = typeFilter === 'All' || room.type === typeFilter;
      let matchesPrice = true;
      if (priceFilter === '4000-8000') matchesPrice = room.price >= 4000 && room.price <= 8000;
      else if (priceFilter === '8000-15000') matchesPrice = room.price > 8000 && room.price <= 15000;
      else if (priceFilter === '15000-25000') matchesPrice = room.price > 15000 && room.price <= 25000;
      else if (priceFilter === '25000+') matchesPrice = room.price > 25000;
      let matchesAvailability = true;
      if (availabilityFilter === 'Available') matchesAvailability = isRoomAvailable(room);
      else if (availabilityFilter === 'Not Available') matchesAvailability = !isRoomAvailable(room);
      return matchesSearch && matchesType && matchesPrice && matchesAvailability;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'capacity') return b.capacity - a.capacity;
      return 0;
    });

  const getRoomImage = (room: Room, index: number) => {
    if (room.image && room.image !== 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600') {
      return room.image;
    }
    return defaultImages[index % defaultImages.length];
  };

  // Availability counts
  const availableCount = rooms.filter(isRoomAvailable).length;
  const notAvailableCount = rooms.filter((r) => !isRoomAvailable(r)).length;
  const hasActiveFilters = searchTerm || typeFilter !== 'All' || priceFilter !== 'All' || availabilityFilter !== 'All';

  const clearAllFilters = () => {
    setSearchTerm('');
    setTypeFilter('All');
    setPriceFilter('All');
    setAvailabilityFilter('All');
    setSortBy('recommended');
  };

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Hero Header */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-[#0f172a]/80 to-green-900/60" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 animate-slide-up">
            Our <span className="text-green-400">Rooms</span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-3 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            Find comfortable and affordable accommodation starting from LKR 4,000/month
          </p>
          <p className="flex items-center justify-center gap-2 text-white/70 text-sm animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <FaMapMarkerAlt className="w-4 h-4" />
            Jaffna, Sri Lanka
          </p>
        </div>
      </section>

      {/* Availability Filter Tabs */}
      <section className="bg-[#111827] border-b border-green-500/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto">
            <button
              onClick={() => setAvailabilityFilter('All')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                availabilityFilter === 'All'
                  ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-green-500/10'
              }`}
            >
              <FaBed className="w-4 h-4" />
              Show All Rooms
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                availabilityFilter === 'All' ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500'
              }`}>{rooms.length}</span>
            </button>
            <button
              onClick={() => setAvailabilityFilter('Available')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                availabilityFilter === 'Available'
                  ? 'bg-green-600 text-white shadow-md shadow-green-500/20'
                  : 'bg-green-500/5 text-green-400 hover:bg-green-500/10 border border-green-500/10'
              }`}
            >
              <FaCheckCircle className="w-4 h-4" />
              Available Rooms
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                availabilityFilter === 'Available' ? 'bg-white/20 text-white' : 'bg-green-500/10 text-green-500'
              }`}>{availableCount}</span>
            </button>
            <button
              onClick={() => setAvailabilityFilter('Not Available')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                availabilityFilter === 'Not Available'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-red-500/5 text-red-400 hover:bg-red-500/10 border border-red-500/10'
              }`}
            >
              <FaTimesCircle className="w-4 h-4" />
              Not Available Rooms
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                availabilityFilter === 'Not Available' ? 'bg-white/20 text-white' : 'bg-red-500/10 text-red-500'
              }`}>{notAvailableCount}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="sticky top-16 z-30 bg-[#111827]/90 backdrop-blur-md shadow-sm border-b border-green-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-green-500/10 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2.5 bg-white/5 border border-green-500/10 text-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            >
              <option value="All">All Room Types</option>
              <option value="Single Room">Single Room</option>
              <option value="Double Room">Double Room</option>
              <option value="Dormitory">Shared / Dormitory</option>
            </select>
            {/* Price Filter */}
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-3 py-2.5 bg-white/5 border border-green-500/10 text-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            >
              <option value="All">All Prices (LKR)</option>
              <option value="4000-8000">LKR 4,000 – 8,000</option>
              <option value="8000-15000">LKR 8,000 – 15,000</option>
              <option value="15000-25000">LKR 15,000 – 25,000</option>
              <option value="25000+">LKR 25,000+</option>
            </select>
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 bg-white/5 border border-green-500/10 text-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="capacity">Capacity: Most Beds</option>
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Login Prompt Banner */}
        {showLoginPrompt && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 animate-fade-in">
            <FaSignInAlt className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400 text-sm font-medium">
              Redirecting to login... Please log in or register to book a room.
            </p>
          </div>
        )}

        {/* Count & Clear Filters */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-gray-400">
            <span className="font-semibold text-white">{filteredRooms.length}</span>{' '}
            {filteredRooms.length === 1 ? 'room' : 'rooms'} found
            {availabilityFilter !== 'All' && (
              <span className={`ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                availabilityFilter === 'Available' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {availabilityFilter === 'Available' ? <FaCheckCircle className="w-3 h-3" /> : <FaTimesCircle className="w-3 h-3" />}
                {availabilityFilter}
              </span>
            )}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-green-400 hover:text-green-300 font-medium flex items-center gap-1"
            >
              <FaFilter className="w-3 h-3" />
              Clear All Filters
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <FaSpinner className="w-10 h-10 text-green-400 animate-spin mb-4" />
            <p className="text-gray-400 text-lg">Loading rooms...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredRooms.length === 0 && (
          <div className="text-center py-24">
            <FaBed className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No rooms found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Room Cards Grid */}
        {!loading && !error && filteredRooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room, index) => {
              const availableBeds = room.capacity - room.occupied;
              const isAvailable = room.status === 'Available' && availableBeds > 0;

              return (
                <div
                  key={room._id}
                  className="bg-white/5 backdrop-blur-sm border border-green-500/10 rounded-2xl overflow-hidden hover-lift animate-fade-in group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={getRoomImage(room, index)}
                      alt={room.name || room.roomNumber}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Type Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#0f172a]/80 backdrop-blur-sm text-green-400 px-3 py-1.5 rounded-full text-xs font-semibold shadow border border-green-500/20">
                        {room.type}
                      </span>
                    </div>

                    {/* Availability Badge */}
                    <div className="absolute top-4 right-4">
                      {isAvailable ? (
                        <span className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                          <FaCheckCircle className="w-3 h-3" />
                          Available
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                          <FaTimesCircle className="w-3 h-3" />
                          Not Available
                        </span>
                      )}
                    </div>

                    {/* Not-Available Overlay */}
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-red-600/90 text-white px-5 py-2 rounded-lg font-semibold text-sm backdrop-blur-sm">
                          {room.status === 'Maintenance' ? 'Under Maintenance' : 'Fully Occupied'}
                        </span>
                      </div>
                    )}

                    {/* Price Tag */}
                    <div className="absolute bottom-4 right-4">
                      <div className="bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-green-500/20">
                        <div className="text-lg font-bold leading-tight">{formatLKR(room.price)}</div>
                        <div className="text-[10px] text-white/80">/month</div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-green-400 transition-colors">
                        {room.name || `Room ${room.roomNumber}`}
                      </h3>
                      <div className="flex items-center gap-3 text-gray-500 text-sm">
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="w-3.5 h-3.5" />
                          {room.location || 'Jaffna, Sri Lanka'}
                        </span>
                        <span className="text-gray-600">|</span>
                        <span>{room.block} · {room.floor}</span>
                      </div>
                    </div>

                    {/* Room description */}
                    {room.description && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {room.description}
                      </p>
                    )}

                    {/* Beds Info */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <FaBed className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">
                          <strong>{room.capacity}</strong> Bed{room.capacity > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FaUsers className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">
                          <strong>{availableBeds}</strong> Available
                        </span>
                      </div>
                    </div>

                    {/* Facilities Tags */}
                    {room.facilities && room.facilities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {room.facilities.slice(0, 4).map((f, i) => (
                          <span
                            key={i}
                            className="flex items-center gap-1.5 bg-white/5 text-gray-400 border border-green-500/10 px-2.5 py-1 rounded-lg text-xs font-medium"
                          >
                            {facilityIcons[f] || <FaCheckCircle className="w-3 h-3" />}
                            {f}
                          </span>
                        ))}
                        {room.facilities.length > 4 && (
                          <span className="bg-white/5 text-gray-500 border border-green-500/10 px-2.5 py-1 rounded-lg text-xs font-medium">
                            +{room.facilities.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-green-500/10">
                      <Link
                        to={`/rooms/${room._id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-green-500/50 text-green-400 rounded-xl font-semibold text-sm hover:bg-green-500/10 transition-all"
                      >
                        View Details
                      </Link>
                      <button
                        disabled={!isAvailable}
                        onClick={() => {
                          if (!isAuthenticated) {
                            setShowLoginPrompt(true);
                            setTimeout(() => {
                              navigate('/login', { state: { from: '/rooms', message: 'Please log in or register to book a room.' } });
                            }, 800);
                            return;
                          }
                          // Navigate to room details for booking
                          navigate(`/rooms/${room._id}`);
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                          isAvailable
                            ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-md hover:shadow-green-500/20'
                            : 'bg-white/5 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        Book Room
                        {isAvailable && <FaArrowRight className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Rooms;
