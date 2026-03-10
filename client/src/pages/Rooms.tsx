import React, { useState } from 'react';
import { FaWifi, FaUserFriends, FaFan, FaBook, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaSearch } from 'react-icons/fa';

const rooms = [
  {
    id: 1,
    name: 'Single Student Room',
    type: 'Single',
    price: 18000,
    capacity: 1,
    facilities: ['WiFi', 'Study Table', 'Fan'],
    description: 'A private, quiet room for focused study and comfort.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80',
    availability: 'Available',
  },
  {
    id: 2,
    name: 'Shared Student Room',
    type: 'Shared',
    price: 12000,
    capacity: 2,
    facilities: ['WiFi', 'Study Table', 'Fan'],
    description: 'A spacious shared room for two students with all essential amenities.',
    image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=600&q=80',
    availability: 'Limited Rooms',
  },
  {
    id: 3,
    name: 'Premium Room',
    type: 'Premium',
    price: 25000,
    capacity: 1,
    facilities: ['WiFi', 'Study Table', 'Fan', 'Bookshelf'],
    description: 'Premium single room with extra space and premium furnishings.',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=600&q=80',
    availability: 'Full',
  },
];

const availabilityColors = {
  'Available': 'bg-green-100 text-green-700',
  'Limited Rooms': 'bg-yellow-100 text-yellow-700',
  'Full': 'bg-red-100 text-red-700',
};

const facilityIcons = {
  'WiFi': <FaWifi className="w-4 h-4" />,
  'Study Table': <FaBook className="w-4 h-4" />,
  'Fan': <FaFan className="w-4 h-4" />,
  'Bookshelf': <FaBook className="w-4 h-4" />,
};

const Rooms = () => {
  const [filters, setFilters] = useState({
    type: '',
    price: '',
    availability: '',
  });
  const [visibleCount, setVisibleCount] = useState(3);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredRooms = rooms.filter((room) => {
    const typeMatch = !filters.type || room.type === filters.type;
    const priceMatch = !filters.price || (filters.price === 'low' ? room.price < 15000 : room.price >= 15000);
    const availMatch = !filters.availability || room.availability === filters.availability;
    return typeMatch && priceMatch && availMatch;
  });

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 tracking-tight">Available Rooms</h1>
        <p className="text-gray-500 text-lg font-medium max-w-xl mx-auto">Explore comfortable and affordable rooms for students.</p>
      </div>

      {/* Filter Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <form className="flex flex-wrap gap-4 items-end justify-center bg-[#f5f3ff] border border-purple-500/10 rounded-2xl p-5 shadow-sm">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Room Type</label>
            <select name="type" value={filters.type} onChange={handleFilterChange} className="rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500 text-sm px-4 py-2 w-36">
              <option value="">All</option>
              <option value="Single">Single</option>
              <option value="Shared">Shared</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Price Range</label>
            <select name="price" value={filters.price} onChange={handleFilterChange} className="rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500 text-sm px-4 py-2 w-36">
              <option value="">All</option>
              <option value="low">Below Rs. 15,000</option>
              <option value="high">Rs. 15,000 & above</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Availability</label>
            <select name="availability" value={filters.availability} onChange={handleFilterChange} className="rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500 text-sm px-4 py-2 w-36">
              <option value="">All</option>
              <option value="Available">Available</option>
              <option value="Limited Rooms">Limited Rooms</option>
              <option value="Full">Full</option>
            </select>
          </div>
          <button type="button" className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow transition-all duration-200 text-sm mt-2">
            <FaSearch className="w-4 h-4" />
            Search
          </button>
        </form>
      </div>

      {/* Room Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.slice(0, visibleCount).map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-purple-500/10 shadow-lg hover:shadow-2xl transition-shadow duration-300 group flex flex-col overflow-hidden relative hover:-translate-y-1"
            >
              {/* Room Image */}
              <div className="relative overflow-hidden h-48">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Availability Badge */}
                <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow ${availabilityColors[room.availability]}`}>
                  {room.availability === 'Available' && <FaCheckCircle className="inline mr-1 mb-0.5" />}
                  {room.availability === 'Limited Rooms' && <FaExclamationTriangle className="inline mr-1 mb-0.5" />}
                  {room.availability === 'Full' && <FaTimesCircle className="inline mr-1 mb-0.5" />}
                  {room.availability}
                </span>
              </div>
              {/* Card Content */}
              <div className="flex-1 flex flex-col p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1 tracking-wide">{room.name}</h3>
                <div className="flex items-center gap-2 text-purple-700 font-semibold mb-2">
                  Rs. {room.price.toLocaleString()} <span className="text-xs text-gray-400 font-normal">/ month</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                  <FaUserFriends className="w-4 h-4 text-purple-400" />
                  Capacity: {room.capacity} {room.capacity > 1 ? 'students' : 'student'}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {room.facilities.map((f) => (
                    <span key={f} className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                      {facilityIcons[f]}
                      {f}
                    </span>
                  ))}
                </div>
                <p className="text-gray-500 text-sm mb-4 flex-1">{room.description}</p>
                <div className="flex gap-3 mt-auto">
                  <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow transition-all duration-200 text-sm">
                    View Details
                  </button>
                  <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-purple-600 text-purple-700 font-bold rounded-xl shadow hover:bg-purple-50 transition-all duration-200 text-sm">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Load More Button */}
        {visibleCount < filteredRooms.length && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => setVisibleCount(visibleCount + 3)}
              className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg transition-all duration-200 text-base"
            >
              Load More Rooms
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;
