import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
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
  FaBed,
  FaMoneyBillWave,
} from 'react-icons/fa';
import { MdMeetingRoom } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { roomService } from '../services';
import { buildingFromBlock, selectionAvailability, toFloorId } from '../utils/roomView';
import type { ApiRoom } from '../utils/roomView';

interface Filters {
  building: string;
  floor: string;
  availability: string;
  search: string;
}

interface SelectionRoom {
  id: string;
  roomNumber: string;
  building: string;
  floor: string;
  floorId: string;
  status: 'Available' | 'Limited' | 'Not Available';
  totalBeds: number;
  occupiedBeds: number;
  price: number;
  note?: string;
}

const statusConfig = {
  Available: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: <FaCheckCircle className="w-3.5 h-3.5" />,
  },
  Limited: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    icon: <FaExclamationCircle className="w-3.5 h-3.5" />,
  },
  'Not Available': {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
    icon: <FaTimesCircle className="w-3.5 h-3.5" />,
  },
};

const RoomSelectionPage: React.FC = () => {
  const { floorId } = useParams<{ floorId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [apiRooms, setApiRooms] = useState<ApiRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<SelectionRoom | null>(null);
  const [filters, setFilters] = useState<Filters>({
    building: '',
    floor: '',
    availability: '',
    search: '',
  });

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

  const mappedRooms = useMemo<SelectionRoom[]>(() => {
    return apiRooms.map((room) => {
      const status = selectionAvailability(room);
      const remaining = Number(room.capacity || 0) - Number(room.occupied || 0);
      return {
        id: room._id,
        roomNumber: room.roomNumber,
        building: buildingFromBlock(room.block),
        floor: room.floor,
        floorId: toFloorId(room.floor),
        status,
        totalBeds: room.capacity,
        occupiedBeds: room.occupied,
        price: room.price,
        note: status === 'Limited' || remaining === 1 ? 'Only 1 left' : undefined,
      };
    });
  }, [apiRooms]);

  const floorRooms = useMemo(() => mappedRooms.filter((room) => room.floorId === floorId), [mappedRooms, floorId]);

  const config = useMemo(() => {
    if (!floorRooms.length) return null;
    const prices = floorRooms.map((r) => r.price);
    return {
      id: floorId || '',
      title: floorRooms[0].floor,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [floorRooms, floorId]);

  const buildings = useMemo(() => Array.from(new Set(floorRooms.map((r) => r.building))), [floorRooms]);
  const floors = useMemo(() => Array.from(new Set(floorRooms.map((r) => r.floor))), [floorRooms]);
  const statuses = ['Available', 'Limited', 'Not Available'];

  useEffect(() => {
    const restoredRoom = (location.state as any)?.selectedRoom;
    if (restoredRoom && restoredRoom.floorId === floorId) {
      setSelectedRoom(restoredRoom);
    }
  }, [location.state, floorId]);

  const filteredRooms = useMemo(() => {
    return floorRooms.filter((room) => {
      const matchBuilding = !filters.building || room.building === filters.building;
      const matchFloor = !filters.floor || room.floor === filters.floor;
      const matchAvailability = !filters.availability || room.status === filters.availability;
      const matchSearch = !filters.search || room.roomNumber.toLowerCase().includes(filters.search.toLowerCase());
      return matchBuilding && matchFloor && matchAvailability && matchSearch;
    });
  }, [floorRooms, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFilters({ building: '', floor: '', availability: '', search: '' });
    setSelectedRoom(null);
  };

  const handleSelectRoom = (room: SelectionRoom) => {
    if (room.status === 'Not Available') return;
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          redirectTo: `/floor/${floorId}/rooms`,
          selectedRoom: room,
          message: 'Please login to continue your booking.',
        },
      });
      return;
    }
    setSelectedRoom((prev) => (prev?.id === room.id ? null : room));
  };

  const handleContinueBooking = () => {
    if (!selectedRoom || !config) return;
    const bookingData = {
      roomId: selectedRoom.id,
      roomNumber: selectedRoom.roomNumber,
      building: selectedRoom.building,
      floor: selectedRoom.floor,
      floorId: selectedRoom.floorId,
      price: selectedRoom.price,
    };
    localStorage.setItem('selectedRoom', JSON.stringify(bookingData));
    navigate('/booking', { state: { room: bookingData } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!config) {
    navigate('/floors', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <section className="w-full bg-gradient-to-br from-primary via-primary-hover to-secondary relative py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <Link to={`/floor/${floorId}`} className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors text-sm font-medium">
            <FaArrowLeft className="w-3.5 h-3.5" /> Back to {config.title} Details
          </Link>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-8 shadow-lg">
            <div className="uppercase text-xs tracking-widest text-white/70 font-semibold mb-2">HOME TREATS</div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">Select Room</h1>
            <div className="w-12 h-1 bg-white/30 rounded-full mb-4" />
            <p className="text-base sm:text-lg text-white/80 font-medium">Choose a room on <span className="text-white font-semibold">{config.title}</span></p>
            <div className="mt-4 flex items-center gap-3">
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-semibold">Rs. {config.minPrice.toLocaleString()} - {config.maxPrice.toLocaleString()} /month</span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-semibold">{floorRooms.filter((r) => r.status !== 'Not Available').length} rooms available</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto mt-8 px-4">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-primary w-4 h-4" />
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Filter Rooms</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative lg:col-span-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" name="search" placeholder="Search room ID..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/25 text-sm text-gray-700 transition-all outline-none" />
            </div>
            <div className="relative">
              <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-4 h-4 pointer-events-none" />
              <select name="building" value={filters.building} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/25 text-sm text-gray-700 transition-all outline-none appearance-none bg-white cursor-pointer">
                <option value="">All Buildings</option>
                {buildings.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <FaLayerGroup className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-4 h-4 pointer-events-none" />
              <select name="floor" value={filters.floor} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/25 text-sm text-gray-700 transition-all outline-none appearance-none bg-white cursor-pointer">
                <option value="">All Floors</option>
                {floors.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <FaCheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-4 h-4 pointer-events-none" />
              <select name="availability" value={filters.availability} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/25 text-sm text-gray-700 transition-all outline-none appearance-none bg-white cursor-pointer">
                <option value="">All Status</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <button onClick={handleReset} className="flex items-center justify-center gap-2 border-2 border-primary text-primary font-semibold px-4 py-2.5 rounded-xl bg-white hover:bg-surface-active transition-all duration-200 text-sm">
              <FaRedo className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto mt-6 px-4">
        <p className="text-gray-600 text-sm font-medium">
          Showing <span className="text-primary font-bold">{filteredRooms.length}</span> rooms
          {filters.building || filters.floor || filters.availability || filters.search ? ' (filtered)' : ''}
        </p>
      </div>

      <section className="max-w-6xl mx-auto mt-4 px-4">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="text-5xl text-info mb-4">🔍</span>
            <p className="text-xl text-gray-500 font-semibold">No rooms match your filters</p>
            <button onClick={handleReset} className="mt-4 text-primary font-medium hover:underline text-sm">Clear all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredRooms.map((room) => {
              const sc = statusConfig[room.status];
              const isSelected = selectedRoom?.id === room.id;
              const isUnavailable = room.status === 'Not Available';

              return (
                <div
                  key={room.id}
                  className={`
                    relative bg-white rounded-2xl border-2 transition-all duration-300 p-5
                    ${isSelected ? 'border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/25' : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'}
                    ${isUnavailable ? 'opacity-60' : 'cursor-pointer'}
                  `}
                  onClick={() => handleSelectRoom(room)}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md">
                      <FaCheckCircle className="text-white w-4 h-4" />
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isUnavailable ? 'bg-gray-100' : 'bg-surface-active'}`}>
                      <MdMeetingRoom className={`w-6 h-6 ${isUnavailable ? 'text-gray-400' : 'text-primary'}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{room.roomNumber}</h3>
                      <p className="text-xs text-gray-400 font-medium">{room.floor}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-4">
                    <div className="flex items-center gap-2.5 text-sm"><FaBuilding className="w-3.5 h-3.5 text-primary shrink-0" /><span className="text-gray-600">{room.building}</span></div>
                    <div className="flex items-center gap-2.5 text-sm"><FaLayerGroup className="w-3.5 h-3.5 text-primary shrink-0" /><span className="text-gray-600">{room.floor}</span></div>
                    <div className="flex items-center gap-2.5 text-sm"><FaDoorOpen className="w-3.5 h-3.5 text-primary shrink-0" /><span className="text-gray-600">Room {room.roomNumber}</span></div>
                    <div className="flex items-center gap-2.5 text-sm"><FaBed className="w-3.5 h-3.5 text-primary shrink-0" /><span className="text-gray-600">{room.occupiedBeds}/{room.totalBeds} occupied</span></div>
                    <div className="flex items-center gap-2.5 text-sm"><FaMoneyBillWave className="w-3.5 h-3.5 text-primary shrink-0" /><span className="text-gray-600">Rs. {room.price.toLocaleString()}/month</span></div>
                  </div>

                  <div className={`flex items-center justify-between rounded-xl px-3 py-2 ${sc.bg} ${sc.border} border`}>
                    <div className={`flex items-center gap-2 ${sc.text} font-semibold text-sm`}>{sc.icon}{room.status}</div>
                    {room.note && <span className={`text-xs font-medium ${sc.text} opacity-80`}>{room.note}</span>}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectRoom(room);
                    }}
                    disabled={isUnavailable}
                    className={`
                      w-full mt-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300
                      ${isUnavailable ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : isSelected ? 'bg-primary text-white shadow-md hover:bg-primary-hover' : 'bg-surface-active text-primary hover:bg-surface-active border border-primary/25'}
                    `}
                  >
                    {isUnavailable ? 'Not Available' : isSelected ? '✓ Selected' : 'Select Room'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 transform ${selectedRoom ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-white border-t-2 border-primary/25 shadow-[0_-8px_30px_rgba(124,58,237,0.12)]">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-surface-active rounded-xl flex items-center justify-center shrink-0"><MdMeetingRoom className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Selected Room</p>
                {selectedRoom && (
                  <p className="text-gray-900 font-bold text-sm sm:text-base">
                    Room {selectedRoom.roomNumber}
                    <span className="text-gray-400 font-normal mx-2">|</span>
                    {selectedRoom.floor}
                    <span className="text-gray-400 font-normal mx-2">|</span>
                    Rs. {selectedRoom.price.toLocaleString()}/month
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedRoom(null)} className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all">Cancel</button>
              <button onClick={handleContinueBooking} className="px-8 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300">
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
