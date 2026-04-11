import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWifi, FaUserFriends, FaFan, FaBook, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaSearch, FaBed } from 'react-icons/fa';


const rooms = [
  {
    id: 1,
    floorId: '1st-floor',
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
    floorId: '2nd-floor',
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
    floorId: '3rd-floor',
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

const availabilityColors: { [key: string]: string } = {
  'Available': 'bg-green-100 text-green-700',
  'Limited Rooms': 'bg-yellow-100 text-yellow-700',
  'Full': 'bg-red-100 text-red-700',
};


const facilityIcons: { [key: string]: React.ReactNode } = {
  'WiFi': <FaWifi className="w-4 h-4" />,
  'Study Table': <FaBook className="w-4 h-4" />,
  'Fan': <FaFan className="w-4 h-4" />,
  'Bookshelf': <FaBook className="w-4 h-4" />,
};

// Facility item component
interface FacilityItemProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}
const FacilityItem: React.FC<FacilityItemProps> = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center text-center bg-white rounded-xl shadow p-6 border border-purple-100 hover:shadow-lg transition-all duration-200">
    {icon}
    <span className="font-semibold text-purple-700 mb-1">{title}</span>
    <span className="text-gray-500 text-sm">{desc}</span>
  </div>
);

// Rule item component
interface RuleItemProps {
  text: string;
}
const RuleItem: React.FC<RuleItemProps> = ({ text }) => (
  <li className="flex items-center gap-2 text-gray-700 text-base"><FaCheckCircle className="text-green-500" /> {text}</li>
);

// Booking step component
interface BookingStepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
}
const BookingStep: React.FC<BookingStepProps> = ({ number, icon, title }) => (
  <div className="flex flex-col items-center">
    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-purple-100 border-2 border-purple-400 mb-2">
      <span className="text-xl font-bold text-purple-700">{number}</span>
    </div>
    {icon}
    <span className="mt-2 font-semibold text-purple-700 text-center">{title}</span>
  </div>
);


const Rooms: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    type: '',
    price: '',
    availability: '',
  });
  const [visibleCount, setVisibleCount] = useState(3);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
      {/* Page Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-purple-700 mb-3 tracking-tight">Find Your Perfect Student Room</h1>
        <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto">Browse and select from our range of available hostel rooms tailored for students.</p>
      </div>

      {/* Room Filter Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <form className="flex flex-wrap gap-4 items-end justify-center bg-purple-50 border border-purple-100 rounded-2xl p-6 shadow-sm">
          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-1">Room Type</label>
            <select name="type" value={filters.type} onChange={handleFilterChange} className="rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500 text-sm px-4 py-2 w-36">
              <option value="">All</option>
              <option value="Single">Single</option>
              <option value="Shared">Shared</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-1">Price Range</label>
            <select name="price" value={filters.price} onChange={handleFilterChange} className="rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500 text-sm px-4 py-2 w-36">
              <option value="">All</option>
              <option value="low">Below Rs. 15,000</option>
              <option value="high">Rs. 15,000 & above</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-1">Availability</label>
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

      {/* Room Listing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.slice(0, visibleCount).map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-purple-100 shadow-lg hover:shadow-2xl transition-shadow duration-300 group flex flex-col overflow-hidden relative hover:-translate-y-1"
            >
              {/* Room Image */}
              <div className="relative overflow-hidden h-48">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
                <h3 className="text-lg font-bold text-purple-800 mb-1 tracking-wide">{room.name}</h3>
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
                  <button
                    onClick={() => navigate(`/floor/${room.floorId}`)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow transition-all duration-200 text-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => navigate(`/floor/${room.floorId}/rooms`)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-purple-600 text-purple-700 font-bold rounded-xl shadow hover:bg-purple-50 transition-all duration-200 text-sm"
                  >
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

      {/* Hostel Facilities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-purple-700 mb-8 text-center">Hostel Facilities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
          <FacilityItem icon={<FaWifi className="w-7 h-7 text-purple-500 mb-2" />} title="High-Speed WiFi" desc="Unlimited fast internet in all rooms and common areas." />
          <FacilityItem icon={<FaBook className="w-7 h-7 text-purple-500 mb-2" />} title="Study Area" desc="Quiet, dedicated spaces for focused study." />
          <FacilityItem icon={<FaUserFriends className="w-7 h-7 text-purple-500 mb-2" />} title="Laundry Service" desc="On-site laundry for hassle-free living." />
          <FacilityItem icon={<FaExclamationTriangle className="w-7 h-7 text-purple-500 mb-2" />} title="CCTV Security" desc="24/7 surveillance for your safety." />
          <FacilityItem icon={<FaFan className="w-7 h-7 text-purple-500 mb-2" />} title="Water Supply" desc="Reliable water supply at all times." />
          <FacilityItem icon={<FaCheckCircle className="w-7 h-7 text-purple-500 mb-2" />} title="24/7 Water Supply" desc="Round-the-clock access to water." />
          <FacilityItem icon={<FaBook className="w-7 h-7 text-purple-500 mb-2" />} title="Common Kitchen" desc="Cook your own meals in a shared kitchen." />
        </div>
      </section>

      {/* Hostel Rules & Regulations Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-purple-50 border-l-4 border-purple-500 rounded-2xl shadow p-8">
          <h3 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2"><FaExclamationTriangle className="text-purple-500" /> Important: Hostel Rules & Regulations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ul className="space-y-3">
              <RuleItem text="Valid student ID required" />
              <RuleItem text="Maintain cleanliness" />
              <RuleItem text="No smoking or alcohol" />
            </ul>
            <ul className="space-y-3">
              <RuleItem text="Visitors allowed only in common areas" />
              <RuleItem text="Respect hostel property" />
            </ul>
          </div>
        </div>
      </section>

      {/* Booking Process Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-purple-700 mb-8 text-center">How Booking Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
          <BookingStep number={1} icon={<FaBed className="w-7 h-7 text-purple-500" />} title="Choose a room" />
          <div className="hidden md:block w-12 h-1 bg-purple-200 mx-2 rounded-full" />
          <BookingStep number={2} icon={<FaCheckCircle className="w-7 h-7 text-purple-500" />} title="Click Book Now" />
          <div className="hidden md:block w-12 h-1 bg-purple-200 mx-2 rounded-full" />
          <BookingStep number={3} icon={<FaBook className="w-7 h-7 text-purple-500" />} title="Fill the booking form" />
          <div className="hidden md:block w-12 h-1 bg-purple-200 mx-2 rounded-full" />
          <BookingStep number={4} icon={<FaUserFriends className="w-7 h-7 text-purple-500" />} title="Wait for admin approval" />
        </div>
      </section>

    </div>
  );
};

export default Rooms;
