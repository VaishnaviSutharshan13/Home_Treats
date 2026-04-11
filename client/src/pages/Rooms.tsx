import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaWifi,
  FaUserFriends,
  FaFan,
  FaBook,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaSearch,
  FaBed,
} from 'react-icons/fa';
import { roomService } from '../services';
import { marketingAvailability, toFloorId } from '../utils/roomView';
import type { ApiRoom } from '../utils/roomView';

const availabilityColors: { [key: string]: string } = {
  Available: 'bg-primary/20 border border-primary/20 text-primary',
  'Limited Rooms': 'bg-warning/20 border border-warning/30 text-warning',
  Full: 'bg-error/20 border border-error/30 text-error',
};

const facilityIcons: { [key: string]: React.ReactNode } = {
  WiFi: <FaWifi className="w-4 h-4" />,
  AC: <FaFan className="w-4 h-4" />,
  Fan: <FaFan className="w-4 h-4" />,
  'Study Table': <FaBook className="w-4 h-4" />,
  Wardrobe: <FaBook className="w-4 h-4" />,
  Lockers: <FaBook className="w-4 h-4" />,
  'Private Bathroom': <FaBook className="w-4 h-4" />,
  'Common Area': <FaBook className="w-4 h-4" />,
};

interface FacilityItemProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}
const FacilityItem: React.FC<FacilityItemProps> = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center text-center bg-card rounded-xl shadow p-6 border border-border hover:shadow-lg hover:border-primary/40 transition-all duration-200">
    {icon}
    <span className="font-semibold text-primary mb-1">{title}</span>
    <span className="text-muted-foreground text-sm">{desc}</span>
  </div>
);

interface RuleItemProps {
  text: string;
}
const RuleItem: React.FC<RuleItemProps> = ({ text }) => (
  <li className="flex items-center gap-2 text-foreground/90 text-base"><FaCheckCircle className="text-primary" /> {text}</li>
);

interface BookingStepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
}
const BookingStep: React.FC<BookingStepProps> = ({ number, icon, title }) => (
  <div className="flex flex-col items-center">
    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-surface-active border-2 border-primary mb-2">
      <span className="text-xl font-bold text-primary">{number}</span>
    </div>
    {icon}
    <span className="mt-2 font-semibold text-primary text-center">{title}</span>
  </div>
);

const Rooms: React.FC = () => {
  const navigate = useNavigate();
  const [apiRooms, setApiRooms] = useState<ApiRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    type: '',
    price: '',
    availability: '',
  });
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const res = await roomService.getAll();
        setApiRooms(Array.isArray(res?.data) ? res.data : []);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredRooms = useMemo(() => {
    return apiRooms.filter((room) => {
      const roomType = room.type || '';
      const roomAvailability = marketingAvailability(room);
      const typeMatch = !filters.type || roomType === filters.type;
      const priceMatch = !filters.price || (filters.price === 'low' ? room.price < 15000 : room.price >= 15000);
      const availMatch = !filters.availability || roomAvailability === filters.availability;
      return typeMatch && priceMatch && availMatch;
    });
  }, [apiRooms, filters]);

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3 tracking-tight">Find Your Perfect Student Room</h1>
        <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">Browse and select from our available hostel rooms.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <form className="flex flex-wrap gap-4 items-end justify-center bg-surface-active border border-primary/15 rounded-2xl p-6 shadow-sm">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Room Type</label>
            <select name="type" value={filters.type} onChange={handleFilterChange} className="rounded-xl border border-border bg-muted/30 focus:ring-2 focus:ring-primary focus:border-primary text-sm px-4 py-2 w-40 text-foreground transition-colors hover:border-primary/30">
              <option value="">All</option>
              <option value="Single Room">Single Room</option>
              <option value="Double Room">Double Room</option>
              <option value="Dormitory">Dormitory</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Price Range</label>
            <select name="price" value={filters.price} onChange={handleFilterChange} className="rounded-xl border border-border bg-muted/30 focus:ring-2 focus:ring-primary focus:border-primary text-sm px-4 py-2 w-40 text-foreground transition-colors hover:border-primary/30">
              <option value="">All</option>
              <option value="low">Below Rs. 15,000</option>
              <option value="high">Rs. 15,000 & above</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Availability</label>
            <select name="availability" value={filters.availability} onChange={handleFilterChange} className="rounded-xl border border-border bg-muted/30 focus:ring-2 focus:ring-primary focus:border-primary text-sm px-4 py-2 w-40 text-foreground transition-colors hover:border-primary/30">
              <option value="">All</option>
              <option value="Available">Available</option>
              <option value="Limited Rooms">Limited Rooms</option>
              <option value="Full">Full</option>
            </select>
          </div>
          <button type="button" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-primary-hover transform hover:scale-[1.02] hover:shadow-primary/20 transition-all text-white font-bold rounded-xl text-sm mt-2">
            <FaSearch className="w-4 h-4" /> Search
          </button>
        </form>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading rooms...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRooms.slice(0, visibleCount).map((room) => {
                const availability = marketingAvailability(room);
                const facilities = Array.isArray(room.facilities) ? room.facilities : [];
                const floorId = toFloorId(room.floor);
                return (
                  <div key={room._id} className="bg-card rounded-2xl border border-border shadow-lg group flex flex-col overflow-hidden relative hover:-translate-y-1 hover:border-primary/40 hover:shadow-primary/5 transition-all duration-300">
                    <div className="relative overflow-hidden h-48">
                      <img src={room.image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'} alt={room.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow ${availabilityColors[availability]}`}>
                        {availability === 'Available' && <FaCheckCircle className="inline mr-1 mb-0.5" />}
                        {availability === 'Limited Rooms' && <FaExclamationTriangle className="inline mr-1 mb-0.5" />}
                        {availability === 'Full' && <FaTimesCircle className="inline mr-1 mb-0.5" />}
                        {availability}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col p-6">
                      <h3 className="text-lg font-bold text-primary mb-1 tracking-wide">{room.name}</h3>
                      <div className="text-xs text-primary font-semibold mb-2">{room.type} • {room.floor}</div>
                      <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                        Rs. {room.price.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">/ month</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                        <FaUserFriends className="w-4 h-4 text-primary" /> Capacity: {room.capacity} {room.capacity > 1 ? 'students' : 'student'}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {facilities.slice(0, 4).map((f) => (
                          <span key={f} className="inline-flex items-center gap-1 bg-surface-active text-primary px-2 py-1 rounded-full text-xs font-medium">
                            {facilityIcons[f] || <FaBook className="w-4 h-4" />} {f}
                          </span>
                        ))}
                      </div>
                      <p className="text-muted-foreground text-sm mb-4 flex-1">{room.description || 'Comfortable student accommodation with essential amenities.'}</p>
                      <div className="flex gap-3 mt-auto">
                        <button onClick={() => navigate(`/floor/${floorId}`)} className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-primary-hover hover:scale-[1.02] transform transition-all shadow-md text-white font-bold rounded-xl text-sm">View Details</button>
                        <button onClick={() => navigate(`/floor/${floorId}/rooms`)} className="flex-1 px-4 py-2 bg-muted hover:bg-muted/70 text-foreground font-bold rounded-xl transition-colors text-sm">Book Now</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {visibleCount < filteredRooms.length && (
              <div className="flex justify-center mt-12">
                <button onClick={() => setVisibleCount((prev) => prev + 6)} className="px-8 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl">Load More Rooms</button>
              </div>
            )}
          </>
        )}
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Hostel Facilities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
          <FacilityItem icon={<FaWifi className="w-7 h-7 text-primary mb-2" />} title="High-Speed WiFi" desc="Unlimited fast internet in all rooms and common areas." />
          <FacilityItem icon={<FaBook className="w-7 h-7 text-primary mb-2" />} title="Study Area" desc="Quiet, dedicated spaces for focused study." />
          <FacilityItem icon={<FaUserFriends className="w-7 h-7 text-primary mb-2" />} title="Laundry Service" desc="On-site laundry for hassle-free living." />
          <FacilityItem icon={<FaExclamationTriangle className="w-7 h-7 text-primary mb-2" />} title="CCTV Security" desc="24/7 surveillance for your safety." />
          <FacilityItem icon={<FaFan className="w-7 h-7 text-primary mb-2" />} title="Water Supply" desc="Reliable water supply at all times." />
          <FacilityItem icon={<FaCheckCircle className="w-7 h-7 text-primary mb-2" />} title="24/7 Water Supply" desc="Round-the-clock access to water." />
          <FacilityItem icon={<FaBook className="w-7 h-7 text-primary mb-2" />} title="Common Kitchen" desc="Cook your own meals in a shared kitchen." />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-surface-active border-l-4 border-primary rounded-2xl shadow p-8">
          <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2"><FaExclamationTriangle className="text-primary" /> Important: Hostel Rules & Regulations</h3>
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

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">How Booking Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
          <BookingStep number={1} icon={<FaBed className="w-7 h-7 text-primary" />} title="Choose a room" />
          <div className="hidden md:block w-12 h-1 bg-primary/25 mx-2 rounded-full" />
          <BookingStep number={2} icon={<FaCheckCircle className="w-7 h-7 text-primary" />} title="Click Book Now" />
          <div className="hidden md:block w-12 h-1 bg-primary/25 mx-2 rounded-full" />
          <BookingStep number={3} icon={<FaBook className="w-7 h-7 text-primary" />} title="Fill the booking form" />
          <div className="hidden md:block w-12 h-1 bg-primary/25 mx-2 rounded-full" />
          <BookingStep number={4} icon={<FaUserFriends className="w-7 h-7 text-primary" />} title="Wait for admin approval" />
        </div>
      </section>
    </div>
  );
};

export default Rooms;
