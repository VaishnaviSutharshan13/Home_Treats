import { useEffect, useMemo, useState } from 'react';
import { FaCheckCircle, FaSpinner, FaTimes, FaSearch, FaUserFriends, FaWifi, FaBook, FaFan, FaExclamationTriangle } from 'react-icons/fa';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { bookingService, roomService } from '../../services';
import { marketingAvailability, toFloorId } from '../../utils/roomView';
import type { ApiRoom } from '../../utils/roomView';

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

const RoomBooking = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ApiRoom | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);

  const [filters, setFilters] = useState({
    type: '',
    price: '',
    availability: '',
  });

  const fetchRooms = async () => {
    try {
      const res = await roomService.getAll();
      if (res.success) {
        setRooms(Array.isArray(res.data) ? res.data : []);
      } else {
        setRooms(Array.isArray(res) ? res : []);
      }
    } catch (error) {
      setErrorMessage('Failed to load room availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const roomType = room.type || '';
      const roomAvailability = marketingAvailability(room);
      const typeMatch = !filters.type || roomType === filters.type;
      const priceMatch = !filters.price || (filters.price === 'low' ? room.price < 15000 : room.price >= 15000);
      const availMatch = !filters.availability || roomAvailability === filters.availability;
      return typeMatch && priceMatch && availMatch && room.status !== 'Maintenance';
    });
  }, [rooms, filters]);

  const handleBookNow = (room: ApiRoom) => {
    setSelectedRoom(room);
    setSuccessMessage('');
    setErrorMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmBooking = async () => {
    if (!selectedRoom || !user) return;

    setConfirming(true);
    setErrorMessage('');

    try {
      const response = await bookingService.confirm({
        fullName: user.name,
        email: user.email,
        phone: user.phone || '',
        selectedFloor: selectedRoom.floor,
        roomId: selectedRoom._id,
      });

      if (!response.success) {
        setErrorMessage(response.message || 'Failed to confirm booking');
        return;
      }

      if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      setSuccessMessage('Your room booking has been successfully confirmed.');
      await fetchRooms();

      setTimeout(() => {
        window.location.href = '/student/dashboard';
      }, 1500);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Failed to confirm booking');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        userRole="student"
      />

      <div className="lg:ml-64">
        <div className="bg-navbar shadow-sm border-b border-border px-6 py-4 sticky top-0 z-10 w-full bg-navbar/95 backdrop-blur">
          <h1 className="text-2xl font-bold text-foreground">Room Booking</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure your search and confirm your room booking.</p>
        </div>

        <div className="p-6 space-y-8">
          {successMessage && (
            <div className="bg-primary/10 border border-primary/30 text-primary rounded-xl px-4 py-3 font-medium">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="bg-error/10 border border-error/20 text-error rounded-xl px-4 py-3 font-medium flex items-center gap-2">
              <FaExclamationTriangle />
              {errorMessage}
            </div>
          )}

          {/* Active Booking Confirmation Card */}
          {selectedRoom && (
            <div className="bg-card rounded-2xl border border-primary shadow-lg p-6 mb-8 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Confirm Your Reservation</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/40 p-5 rounded-xl border border-border mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Student Details</p>
                  <p className="font-semibold text-foreground">{user?.name}</p>
                  <p className="font-semibold text-foreground text-sm">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Room Selection</p>
                  <p className="font-semibold text-foreground">{selectedRoom.name || `Room ${selectedRoom.roomNumber}`}</p>
                  <p className="font-semibold text-primary">Rs. {selectedRoom.price?.toLocaleString()} / month</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={confirming}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-hover text-white transform hover:scale-[1.02] shadow-md rounded-xl font-bold transition-all disabled:opacity-60"
                >
                  <FaCheckCircle className="w-4 h-4" />
                  {confirming ? 'Processing...' : 'Confirm & Book'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted hover:bg-muted/70 text-foreground border border-border rounded-xl font-bold transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-surface-active border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex flex-wrap gap-4 items-end">
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
                <label className="block text-sm font-semibold text-foreground mb-1">Price</label>
                <select name="price" value={filters.price} onChange={handleFilterChange} className="rounded-xl border border-border bg-muted/30 focus:ring-2 focus:ring-primary focus:border-primary text-sm px-4 py-2 w-40 text-foreground transition-colors hover:border-primary/30">
                  <option value="">All</option>
                  <option value="low">Below Rs. 15,000</option>
                  <option value="high">Rs. 15,000 & above</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Status</label>
                <select name="availability" value={filters.availability} onChange={handleFilterChange} className="rounded-xl border border-border bg-muted/30 focus:ring-2 focus:ring-primary focus:border-primary text-sm px-4 py-2 w-40 text-foreground transition-colors hover:border-primary/30">
                  <option value="">All</option>
                  <option value="Available">Available</option>
                  <option value="Limited Rooms">Limited Rooms</option>
                  <option value="Full">Full</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Area */}
          {loading ? (
            <div className="flex justify-center py-20 pb-40">
              <FaSpinner className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.slice(0, visibleCount).map((room) => {
                  const availability = marketingAvailability(room);
                  const isFull = availability === 'Full';
                  const facilities = Array.isArray(room.facilities) ? room.facilities : [];
                  const isSelected = selectedRoom?._id === room._id;

                  return (
                    <div key={room._id} className={`bg-card rounded-2xl border ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'} shadow-sm group flex flex-col overflow-hidden relative hover:-translate-y-1 hover:border-primary/40 hover:shadow-primary/5 transition-all duration-300`}>
                      <div className="relative h-48 overflow-hidden bg-muted">
                        <img 
                            src={room.image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'} 
                            alt={room.name || room.roomNumber} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                        <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow ${availabilityColors[availability]}`}>
                          {availability}
                        </span>
                      </div>
                      
                      <div className="flex-1 flex flex-col p-5">
                        <h3 className="text-lg font-bold text-foreground mb-1">
                          {room.name || `Room ${room.roomNumber}`}
                        </h3>
                        <div className="text-xs text-primary font-semibold mb-2">{room.type} • {room.floor}</div>
                        <div className="flex items-center gap-2 text-primary font-semibold mb-3">
                          Rs. {room.price?.toLocaleString() || 0} <span className="text-xs text-muted-foreground font-normal">/ month</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                          <FaUserFriends className="w-4 h-4 text-primary" /> {room.capacity - room.occupied} beds available
                        </div>

                        {facilities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                            {facilities.slice(0, 3).map((f) => (
                              <span key={f} className="inline-flex items-center gap-1 bg-surface-active border border-border text-primary px-2 py-1 rounded-md text-xs font-medium">
                                {facilityIcons[f] || <FaBook className="w-4 h-4" />} {f}
                              </span>
                            ))}
                            {facilities.length > 3 && (
                                <span className="inline-flex items-center gap-1 bg-muted border border-border text-muted-foreground px-2 py-1 rounded-md text-xs font-medium">+{facilities.length - 3}</span>
                            )}
                          </div>
                        )}

                        <div className="mt-auto pt-4 border-t border-border">
                          {!isFull ? (
                            <button
                              onClick={() => handleBookNow(room)}
                              className={`w-full py-2.5 rounded-xl font-bold transition-all text-sm ${isSelected ? 'bg-muted text-muted-foreground cursor-default' : 'bg-gradient-to-r from-primary to-primary-hover text-white transform hover:scale-[1.02] shadow-md'}`}
                            >
                              {isSelected ? 'Selected' : 'Book Room'}
                            </button>
                          ) : (
                            <button disabled className="w-full py-2.5 bg-muted/50 text-muted-foreground/60 rounded-xl font-bold text-sm cursor-not-allowed">
                              Room Full
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {filteredRooms.length === 0 && (
                  <div className="text-center py-12">
                      <p className="text-muted-foreground">No rooms match your filter criteria.</p>
                  </div>
              )}

              {visibleCount < filteredRooms.length && (
                <div className="flex justify-center mt-8 pb-12">
                  <button onClick={() => setVisibleCount((prev) => prev + 6)} className="px-8 py-3 bg-card border border-border hover:bg-muted text-foreground transition-colors font-bold rounded-xl shadow-sm">
                    Load More Rooms
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomBooking;
