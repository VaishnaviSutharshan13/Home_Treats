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
  roomType: string;
  availability: string;
  search: string;
  priceRange: string;
}

interface SelectionRoom {
  id: string;
  roomNumber: string;
  building: string;
  floor: string;
  floorId: string;
  roomType: 'Single Room' | 'Double Room' | 'Triple Sharing' | 'Dormitory';
  status: 'Available' | 'Limited' | 'Not Available';
  totalBeds: number;
  occupiedBeds: number;
  price: number;
  note?: string;
}

interface RoomSelectionLocationState {
  selectedRoom?: SelectionRoom;
}

interface FloorProfile {
  floorLabel: string;
  floorNumber: string;
  minPrice: number;
  maxPrice: number;
  availableCount: number;
  limitedCount: number;
  notAvailableCount: number;
  statusBadge: string;
}

const isValidObjectId = (value: string): boolean => /^[a-fA-F0-9]{24}$/.test(String(value || '').trim());

const FLOOR_PROFILES: Record<string, FloorProfile> = {
  '1st-floor': {
    floorLabel: '1st Floor',
    floorNumber: '1',
    minPrice: 8000,
    maxPrice: 9000,
    availableCount: 6,
    limitedCount: 1,
    notAvailableCount: 1,
    statusBadge: 'Popular Floor',
  },
  '2nd-floor': {
    floorLabel: '2nd Floor',
    floorNumber: '2',
    minPrice: 10000,
    maxPrice: 11000,
    availableCount: 5,
    limitedCount: 2,
    notAvailableCount: 1,
    statusBadge: 'Limited Rooms Available',
  },
  '3rd-floor': {
    floorLabel: '3rd Floor',
    floorNumber: '3',
    minPrice: 15000,
    maxPrice: 17000,
    availableCount: 7,
    limitedCount: 1,
    notAvailableCount: 0,
    statusBadge: 'Best for Study',
  },
  '4th-floor': {
    floorLabel: '4th Floor',
    floorNumber: '4',
    minPrice: 18000,
    maxPrice: 20000,
    availableCount: 5,
    limitedCount: 2,
    notAvailableCount: 1,
    statusBadge: 'Premium Floor',
  },
};

const getCanonicalFloorId = (raw?: string): string | null => {
  const normalized = String(raw || '').trim().toLowerCase();
  if (!normalized) return null;

  if (normalized === '1' || normalized.includes('1st') || normalized.includes('first')) return '1st-floor';
  if (normalized === '2' || normalized.includes('2nd') || normalized.includes('second')) return '2nd-floor';
  if (normalized === '3' || normalized.includes('3rd') || normalized.includes('third')) return '3rd-floor';
  if (normalized === '4' || normalized.includes('4th') || normalized.includes('fourth')) return '4th-floor';

  const digitMatch = normalized.match(/(^|[^\d])([1-4])($|[^\d])/);
  const digit = digitMatch?.[2];
  if (digit === '1') return '1st-floor';
  if (digit === '2') return '2nd-floor';
  if (digit === '3') return '3rd-floor';
  if (digit === '4') return '4th-floor';

  return null;
};

const createFloorRoomPlan = (profile: FloorProfile): SelectionRoom[] => {
  const totalRooms = 8;
  const roomTypes: SelectionRoom['roomType'][] = ['Single Room', 'Double Room', 'Triple Sharing', 'Dormitory'];
  const roomNumbers = Array.from({ length: totalRooms }, (_, index) => {
    const sequence = index + 1;
    return `${profile.floorNumber}-${profile.floorNumber}${String(sequence).padStart(2, '0')}`;
  });

  const priceStep = totalRooms > 1 ? (profile.maxPrice - profile.minPrice) / (totalRooms - 1) : 0;

  return roomNumbers.map((roomNumber, index) => {
    const status: SelectionRoom['status'] =
      index < profile.availableCount
        ? 'Available'
        : index < profile.availableCount + profile.limitedCount
          ? 'Limited'
          : 'Not Available';

    const occupiedBeds = status === 'Available' ? 0 : status === 'Limited' ? 1 : 2;
    const totalBeds = status === 'Available' ? 2 : 2;
    const price = Math.round(profile.minPrice + priceStep * index);

    return {
      id: `${profile.floorNumber}-${String(index + 1).padStart(2, '0')}`,
      roomNumber,
      building: index % 2 === 0 ? 'Main Building' : 'Annex Building',
      floor: profile.floorLabel,
      floorId: `${profile.floorNumber}-floor`,
      roomType: roomTypes[index % roomTypes.length],
      status,
      totalBeds,
      occupiedBeds,
      price,
      note: status === 'Limited' ? 'Only 1 left' : status === 'Not Available' ? 'Full' : undefined,
    };
  });
};

const statusConfig = {
  Available: {
    bg: 'bg-primary/10 border border-primary/20',
    text: 'text-primary',
    border: 'border-primary/30',
    icon: <FaCheckCircle className="w-3.5 h-3.5" />,
  },
  Limited: {
    bg: 'bg-warning/10 border border-warning/20',
    text: 'text-warning',
    border: 'border-warning/40',
    icon: <FaExclamationCircle className="w-3.5 h-3.5" />,
  },
  'Not Available': {
    bg: 'bg-error/10 border border-error/20',
    text: 'text-error',
    border: 'border-error/40',
    icon: <FaTimesCircle className="w-3.5 h-3.5" />,
  },
};

const mapApiRoomToSelection = (room: ApiRoom): SelectionRoom => {
  const capacity = Number(room.capacity || 0);
  const availability = selectionAvailability(room);
  let roomType: SelectionRoom['roomType'] = 'Dormitory';

  if (capacity <= 1) roomType = 'Single Room';
  else if (capacity === 2) roomType = 'Double Room';
  else if (capacity === 3) roomType = 'Triple Sharing';

  return {
    id: room._id,
    roomNumber: room.roomNumber,
    building: buildingFromBlock(room.block),
    floor: room.floor,
    floorId: toFloorId(room.floor),
    roomType,
    status: availability,
    totalBeds: capacity,
    occupiedBeds: Number(room.occupied || 0),
    price: Number(room.price || 0),
    note: availability === 'Limited' ? 'Only 1 left' : availability === 'Not Available' ? 'Full' : undefined,
  };
};

const mergeLiveRoomsIntoPlan = (plan: SelectionRoom[], liveRooms: ApiRoom[]): SelectionRoom[] => {
  const liveByRoomNumber = new Map(liveRooms.map((room) => [room.roomNumber, room]));

  return plan.map((plannedRoom) => {
    const liveRoom = liveByRoomNumber.get(plannedRoom.roomNumber);
    if (!liveRoom) return plannedRoom;

    const liveStatus = selectionAvailability(liveRoom);
    return {
      ...plannedRoom,
      id: liveRoom._id,
      building: buildingFromBlock(liveRoom.block) || plannedRoom.building,
      floor: liveRoom.floor || plannedRoom.floor,
      floorId: toFloorId(liveRoom.floor || plannedRoom.floor),
      roomType: ['Single Room', 'Double Room', 'Triple Sharing', 'Dormitory'][(Number(liveRoom.capacity || 2) - 1) % 4] as SelectionRoom['roomType'],
      status: liveStatus,
      totalBeds: Number(liveRoom.capacity || plannedRoom.totalBeds),
      occupiedBeds: Number(liveRoom.occupied || plannedRoom.occupiedBeds),
      price: Number(liveRoom.price || plannedRoom.price),
      note: liveStatus === 'Limited' ? 'Only 1 left' : liveStatus === 'Not Available' ? 'Full' : undefined,
    };
  });
};

const RoomSelectionPage: React.FC = () => {
  const { floorId } = useParams<{ floorId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [apiRooms, setApiRooms] = useState<ApiRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<SelectionRoom | null>(null);
  const [roomSelectionError, setRoomSelectionError] = useState('');
  const [filters, setFilters] = useState<Filters>({
    roomType: '',
    availability: '',
    search: '',
    priceRange: '',
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

  const canonicalFloorId = useMemo(() => getCanonicalFloorId(floorId), [floorId]);

  const activeFloorRooms = useMemo(() => {
    if (!canonicalFloorId) return [];

    const profile = FLOOR_PROFILES[canonicalFloorId];
    if (!profile) return [];

    const generatedPlan = createFloorRoomPlan(profile);
    const liveRoomsForFloor = apiRooms.filter((room) => toFloorId(room.floor) === canonicalFloorId);

    if (liveRoomsForFloor.length) {
      return liveRoomsForFloor.map(mapApiRoomToSelection);
    }

    return mergeLiveRoomsIntoPlan(generatedPlan, liveRoomsForFloor);
  }, [apiRooms, canonicalFloorId]);

  const config = useMemo(() => {
    if (!activeFloorRooms.length) return null;
    const profile = canonicalFloorId ? FLOOR_PROFILES[canonicalFloorId] : null;
    const prices = activeFloorRooms.map((r) => r.price);
    return {
      id: canonicalFloorId || '',
      title: activeFloorRooms[0].floor,
      minPrice: profile?.minPrice ?? Math.min(...prices),
      maxPrice: profile?.maxPrice ?? Math.max(...prices),
      availableRooms: profile?.availableCount ?? activeFloorRooms.filter((r) => r.status === 'Available').length,
      statusBadge: profile?.statusBadge ?? '',
    };
  }, [activeFloorRooms, canonicalFloorId]);

  const roomTypes = ['Single Room', 'Double Room', 'Triple Sharing', 'Dormitory'];
  const statuses = ['Available', 'Limited', 'Not Available'];
  const priceRanges = [
    { value: '8000-10000', label: 'Rs. 8,000 - 10,000' },
    { value: '10000-15000', label: 'Rs. 10,000 - 15,000' },
    { value: '15000-20000', label: 'Rs. 15,000 - 20,000' },
    { value: '20000+', label: 'Rs. 20,000+' },
  ];

  useEffect(() => {
    const restoredRoom = (location.state as RoomSelectionLocationState | null)?.selectedRoom;
    if (restoredRoom && restoredRoom.floorId === canonicalFloorId) {
      setSelectedRoom(restoredRoom);
    }
  }, [location.state, canonicalFloorId]);

  const filteredRooms = useMemo(() => {
    return activeFloorRooms.filter((room) => {
      const searchValue = filters.search.trim().toLowerCase();
      const matchSearch =
        !searchValue ||
        room.roomNumber.toLowerCase().includes(searchValue) ||
        room.id.toLowerCase().includes(searchValue);
      const matchType = !filters.roomType || room.roomType === filters.roomType;
      const matchAvailability = !filters.availability || room.status === filters.availability;
      const matchPriceRange =
        !filters.priceRange ||
        (filters.priceRange === '8000-10000' && room.price >= 8000 && room.price <= 10000) ||
        (filters.priceRange === '10000-15000' && room.price >= 10000 && room.price < 15000) ||
        (filters.priceRange === '15000-20000' && room.price >= 15000 && room.price <= 20000) ||
        (filters.priceRange === '20000+' && room.price >= 20000);
      return matchSearch && matchType && matchAvailability && matchPriceRange;
    });
  }, [activeFloorRooms, filters]);

  const canBook = useMemo(() => {
    return true;
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFilters({ roomType: '', availability: '', search: '', priceRange: '' });
    setSelectedRoom(null);
  };

  const handleSelectRoom = (room: SelectionRoom) => {
    if (room.status === 'Not Available') return;
    setRoomSelectionError('');
    setSelectedRoom((prev) => (prev?.id === room.id ? null : room));
  };

  const handleContinueBooking = () => {
    if (!selectedRoom || !config || !canBook) return;

    if (!isValidObjectId(selectedRoom.id)) {
      setRoomSelectionError('Selected room could not be verified. Please refresh and select a listed room again.');
      return;
    }

    const bookingData = {
      roomId: selectedRoom.id,
      roomNumber: selectedRoom.roomNumber,
      building: selectedRoom.building,
      floor: selectedRoom.floor,
      floorId: selectedRoom.floorId,
      price: selectedRoom.price,
    };

    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          redirectTo: '/booking',
          room: bookingData,
          message: 'Please login to continue your booking.',
        },
      });
      return;
    }

    localStorage.setItem('selectedRoom', JSON.stringify(bookingData));
    navigate('/booking', { state: { room: bookingData } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!config) {
    navigate('/rooms', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-muted pb-28">
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
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-semibold">{config.availableRooms} rooms available</span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-semibold">{config.statusBadge}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto mt-8 px-4">
        <div className="bg-card rounded-2xl shadow-md border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-primary w-4 h-4" />
            <h3 className="text-sm font-bold text-foreground/90 uppercase tracking-wide">Filter Rooms</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative lg:col-span-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input type="text" name="search" placeholder="Search Room Number (Ex: 4-401)" value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/25 text-sm text-foreground transition-all outline-none" />
            </div>
            <div className="relative">
              <FaDoorOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-4 h-4 pointer-events-none" />
              <select name="roomType" value={filters.roomType} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/25 text-sm text-foreground transition-all outline-none appearance-none bg-muted/30 cursor-pointer">
                <option value="">All Types</option>
                {roomTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <FaCheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-4 h-4 pointer-events-none" />
              <select name="availability" value={filters.availability} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/25 text-sm text-foreground transition-all outline-none appearance-none bg-muted/30 cursor-pointer">
                <option value="">All Status</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <FaMoneyBillWave className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-4 h-4 pointer-events-none" />
              <select name="priceRange" value={filters.priceRange} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/25 text-sm text-foreground transition-all outline-none appearance-none bg-muted/30 cursor-pointer">
                <option value="">All Prices</option>
                {priceRanges.map((priceRange) => (
                  <option key={priceRange.value} value={priceRange.value}>{priceRange.label}</option>
                ))}
              </select>
            </div>
            <button onClick={handleReset} className="flex items-center justify-center gap-2 border border-border text-foreground font-semibold px-4 py-2.5 rounded-xl bg-muted/30 hover:bg-surface-hover transition-all duration-200 text-sm">
              <FaRedo className="w-3 h-3" /> Reset Filters
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto mt-6 px-4">
        <p className="text-muted-foreground text-sm font-medium">
          Showing <span className="text-primary font-bold">{filteredRooms.length}</span> rooms
          {filters.roomType || filters.availability || filters.priceRange || filters.search ? ' (filtered)' : ''}
        </p>
      </div>

      <section className="max-w-6xl mx-auto mt-4 px-4">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="text-5xl text-info mb-4">🔍</span>
            <p className="text-xl text-muted-foreground font-semibold">No rooms match your filters</p>
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
                    ${isSelected ? 'bg-card border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/25' : 'bg-card border-border shadow-sm hover:shadow-md hover:border-primary/30'}
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
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isUnavailable ? 'bg-muted' : 'bg-surface-active'}`}>
                      <MdMeetingRoom className={`w-6 h-6 ${isUnavailable ? 'text-muted-foreground' : 'text-primary'}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{room.roomNumber}</h3>
                      <p className="text-xs text-muted-foreground font-medium">{room.floor}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-4">
                    <div className="flex items-center gap-2.5 text-sm"><FaBuilding className="w-3.5 h-3.5 text-primary shrink-0" /><span className="text-muted-foreground">{room.building}</span></div>
                    <div className="flex items-center gap-2.5 text-sm"><FaLayerGroup className="w-3.5 h-3.5 text-primary shrink-0" /><span className="text-muted-foreground">{room.floor}</span></div>
                    <div className="flex items-center gap-2.5 text-sm"><FaDoorOpen className="w-3.5 h-3.5 text-primary shrink-0" /><span className="text-muted-foreground">Room {room.roomNumber}</span></div>
                    <div className="flex items-center gap-2.5 text-sm"><FaBed className="w-3.5 h-3.5 text-primary shrink-0" /><span className="text-muted-foreground">{room.occupiedBeds}/{room.totalBeds} occupied</span></div>
                    <div className="flex items-center gap-2.5 text-sm"><FaMoneyBillWave className="w-3.5 h-3.5 text-primary shrink-0" /><span className="text-muted-foreground">Rs. {room.price.toLocaleString()}/month</span></div>
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
                      ${isUnavailable ? 'bg-muted text-muted-foreground cursor-not-allowed' : isSelected ? 'bg-primary text-white shadow-md hover:bg-primary-hover' : 'bg-surface-active text-primary hover:bg-surface-active border border-primary/25'}
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
        <div className="bg-card border-t border-border shadow-[0_-8px_30px_rgba(59,130,246,0.12)]">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-surface-active rounded-xl flex items-center justify-center shrink-0"><MdMeetingRoom className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Selected Room</p>
                {selectedRoom && (
                  <p className="text-foreground font-bold text-sm sm:text-base">
                    Room {selectedRoom.roomNumber}
                    <span className="text-muted-foreground font-normal mx-2">|</span>
                    {selectedRoom.floor}
                    <span className="text-muted-foreground font-normal mx-2">|</span>
                    Rs. {selectedRoom.price.toLocaleString()}/month
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedRoom(null)} className="px-4 py-2.5 border border-border text-muted-foreground rounded-xl font-medium text-sm hover:bg-surface-hover transition-all">Cancel</button>
              <button
                onClick={handleContinueBooking}
                disabled={!canBook}
                title={canBook ? 'Continue booking' : 'Only students can continue booking'}
                className={`px-8 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all duration-300 ${canBook ? 'bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary text-white hover:shadow-lg' : 'bg-muted text-muted-foreground cursor-not-allowed shadow-none'}`}
              >
                Book Now →
              </button>
            </div>
          </div>
          {roomSelectionError && (
            <div className="max-w-6xl mx-auto px-4 pb-4">
              <p className="text-sm text-error">{roomSelectionError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomSelectionPage;
