import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaWifi,
  FaFan,
  FaTable,
  FaBath,
  FaBed,
  FaDoorOpen,
  FaLock,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaMoon,
  FaUsers,
  FaBroom,
  FaVolumeMute,
  FaTools,
  FaIdCard,
  FaLayerGroup,
} from 'react-icons/fa';
import { HiOutlineLightningBolt } from 'react-icons/hi';
import { floorService, roomService } from '../services';
import { selectionAvailability, toFloorId } from '../utils/roomView';
import type { ApiRoom } from '../utils/roomView';

interface FacilityBadgeProps {
  name: string;
}

interface RuleItemProps {
  icon: React.ReactNode;
  text: string;
}

interface FloorDetailsData {
  id: string;
  routeId: string;
  title: string;
  about: string;
  facilities: string[];
  monthlyFeeRange: {
    min: number;
    max: number;
  };
  totalRooms: number;
  availableRooms: number;
  statusBadge: string;
  statusTone: 'green' | 'blue' | 'orange' | 'purple';
  location: string;
  image: string | null;
}

const facilityIcons: Record<string, React.ReactNode> = {
  WiFi: <FaWifi />,
  'WiFi Access': <FaWifi />,
  'High-Speed WiFi': <FaWifi />,
  Fan: <FaFan />,
  'Ceiling Fan': <FaFan />,
  'Stand Fan': <FaFan />,
  'Ceiling Fan Backup': <FaFan />,
  AC: <FaFan />,
  'Air Conditioner': <FaFan />,
  'Study Table': <FaTable />,
  'Private Bathroom': <FaBath />,
  'Shared / Attached Bathroom': <FaBath />,
  'Bathroom Facility': <FaBath />,
  'Attached Bathroom': <FaBath />,
  'Common Bathroom': <FaBath />,
  'Single Bed': <FaBed />,
  'Standard Bed': <FaBed />,
  'Premium Bed': <FaBed />,
  'Deluxe Bed': <FaBed />,
  'Power Backup': <HiOutlineLightningBolt />,
  'Laundry Access': <HiOutlineLightningBolt />,
  Wardrobe: <FaDoorOpen />,
  'Furnished Room': <FaDoorOpen />,
  'Balcony / View': <FaMapMarkerAlt />,
  Lockers: <FaLock />,
  'Secure Rooms': <FaLock />,
  'Common Area': <FaDoorOpen />,
};

const hostelRules: RuleItemProps[] = [
  { icon: <FaMoon className="w-4 h-4" />, text: 'Gate closes at 10:00 PM' },
  { icon: <FaUsers className="w-4 h-4" />, text: 'Visitors allowed only weekends' },
  { icon: <FaBroom className="w-4 h-4" />, text: 'Maintain cleanliness' },
  { icon: <FaVolumeMute className="w-4 h-4" />, text: 'No loud music after 10 PM' },
  { icon: <FaTools className="w-4 h-4" />, text: 'Report maintenance issues immediately' },
  { icon: <FaIdCard className="w-4 h-4" />, text: 'ID required for entry' },
];

const FacilityBadge: React.FC<FacilityBadgeProps> = ({ name }) => (
  <div className="flex items-center gap-3 bg-surface-active border border-primary/15 rounded-xl px-4 py-3 hover:shadow-md hover:border-primary/30 transition-all duration-200 group">
    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
      {facilityIcons[name] || <FaCheckCircle />}
    </div>
    <span className="text-foreground/90 font-medium text-sm">{name}</span>
  </div>
);

const getFallbackFloorTitle = (id?: string): string | null => {
  const normalized = String(id || '').toLowerCase();
  if (normalized === '1') return '1st Floor';
  if (normalized === '2') return '2nd Floor';
  if (normalized === '3') return '3rd Floor';
  if (normalized === '4') return '4th Floor';
  const floorDigitMatch = normalized.match(/(^|[^\d])([1-4])($|[^\d])/);
  const floorDigit = floorDigitMatch?.[2];
  if (floorDigit === '1') return '1st Floor';
  if (floorDigit === '2') return '2nd Floor';
  if (floorDigit === '3') return '3rd Floor';
  if (floorDigit === '4') return '4th Floor';
  if (normalized.includes('1st') || normalized.includes('first')) return '1st Floor';
  if (normalized.includes('2nd') || normalized.includes('second')) return '2nd Floor';
  if (normalized.includes('3rd') || normalized.includes('third')) return '3rd Floor';
  if (normalized.includes('4th') || normalized.includes('fourth')) return '4th Floor';
  return null;
};

const floorFallbackMap: Record<string, FloorDetailsData> = {
  '1st-floor': {
    id: '1st-floor',
    routeId: '1',
    title: '1st Floor',
    about:
      'The 1st floor is designed for budget-friendly accommodation with essential facilities. It is suitable for students who prefer convenient access, affordable monthly rent, and easy movement.',
    facilities: ['Ceiling Fan', 'Standard Bed', 'Shared / Attached Bathroom', 'WiFi Access', 'Laundry Access', 'Secure Rooms'],
    monthlyFeeRange: { min: 8000, max: 9000 },
    totalRooms: 8,
    availableRooms: 6,
    statusBadge: 'Popular Floor',
    statusTone: 'blue',
    location: 'Jaffna, Sri Lanka',
    image: '/images/firstfloordetail.png',
  },
  '2nd-floor': {
    id: '2nd-floor',
    routeId: '2',
    title: '2nd Floor',
    about:
      'The 2nd floor offers improved comfort with better ventilation and a quieter environment. Ideal for students seeking balanced comfort.',
    facilities: ['Ceiling Fan', 'Stand Fan', 'Furnished Room', 'WiFi Access', 'Bathroom Facility', 'Secure Rooms'],
    monthlyFeeRange: { min: 10000, max: 11000 },
    totalRooms: 8,
    availableRooms: 5,
    statusBadge: 'Limited Rooms Available',
    statusTone: 'orange',
    location: 'Jaffna, Sri Lanka',
    image: null,
  },
  '3rd-floor': {
    id: '3rd-floor',
    routeId: '3',
    title: '3rd Floor',
    about:
      'The 3rd floor provides comfortable air-conditioned rooms with added privacy and modern facilities. Suitable for long-term residents and peaceful study space.',
    facilities: ['Air Conditioner', 'Ceiling Fan Backup', 'Premium Bed', 'Attached Bathroom', 'High-Speed WiFi', 'Secure Rooms'],
    monthlyFeeRange: { min: 15000, max: 17000 },
    totalRooms: 8,
    availableRooms: 7,
    statusBadge: 'Best for Study',
    statusTone: 'green',
    location: 'Jaffna, Sri Lanka',
    image: '/images/secondfloordetails.png',
  },
  '4th-floor': {
    id: '4th-floor',
    routeId: '4',
    title: '4th Floor',
    about:
      'The 4th floor is the premium accommodation level with spacious AC rooms, peaceful atmosphere, and better privacy. Best for premium student stays.',
    facilities: ['Air Conditioner', 'Deluxe Bed', 'Private Bathroom', 'High-Speed WiFi', 'Balcony / View', 'Secure Rooms'],
    monthlyFeeRange: { min: 18000, max: 20000 },
    totalRooms: 8,
    availableRooms: 5,
    statusBadge: 'Premium Floor',
    statusTone: 'purple',
    location: 'Jaffna, Sri Lanka',
    image: null,
  },
};

const getStatusBadgeClass = (tone: FloorDetailsData['statusTone']) => {
  if (tone === 'green') return 'bg-success/20 border border-success/40 text-success';
  if (tone === 'orange') return 'bg-warning/20 border border-warning/40 text-warning';
  if (tone === 'purple') return 'bg-secondary/25 border border-secondary/40 text-secondary';
  return 'bg-primary/20 border border-primary/40 text-primary';
};

const getAvailabilityClass = (count: number) => {
  if (count <= 0) return 'bg-error/20 border border-error/40 text-error';
  if (count <= 2) return 'bg-warning/20 border border-warning/40 text-warning';
  return 'bg-success/20 border border-success/40 text-success';
};

const RoomDetailsPage: React.FC = () => {
  const { floorId } = useParams<{ floorId: string }>();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [floorData, setFloorData] = useState<FloorDetailsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const fallbackTitle = getFallbackFloorTitle(floorId);
        const canonicalFloorId = fallbackTitle ? toFloorId(fallbackTitle) : null;

        if (!canonicalFloorId) {
          setFloorData(null);
          setRooms([]);
          return;
        }

        try {
          const floorRes = await floorService.getById(floorId || canonicalFloorId);
          setFloorData(floorRes?.success ? floorRes.data : floorFallbackMap[canonicalFloorId]);
        } catch {
          setFloorData(floorFallbackMap[canonicalFloorId]);
        }

        const roomsRes = await roomService.getAll();
        setRooms(Array.isArray(roomsRes?.data) ? roomsRes.data : []);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [floorId]);

  const canonicalFloorId = useMemo(() => {
    const title = getFallbackFloorTitle(floorId);
    return title ? toFloorId(title) : null;
  }, [floorId]);

  const floorRooms = useMemo(() => {
    if (!canonicalFloorId) return [];
    return rooms.filter((r) => toFloorId(r.floor) === canonicalFloorId);
  }, [rooms, canonicalFloorId]);

  const floor = useMemo(() => {
    if (!floorData) return null;

    const sample = floorRooms[0] || null;
    const prices = floorRooms.map((r) => Number(r.price || 0)).filter((p) => Number.isFinite(p) && p > 0);
    const availableRooms = floorRooms.length
      ? floorRooms.filter((r) => selectionAvailability(r) !== 'Not Available').length
      : floorData.availableRooms;

    const isFirstFloor = floorData.id === '1st-floor';

    return {
      id: floorData.id,
      title: floorData.title,
      totalRooms: floorRooms.length || floorData.totalRooms,
      availableRooms,
      priceMin: isFirstFloor ? 8000 : prices.length ? Math.min(...prices) : floorData.monthlyFeeRange.min,
      priceMax: isFirstFloor ? 9000 : prices.length ? Math.max(...prices) : floorData.monthlyFeeRange.max,
      image: floorData.image || sample?.image || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',
      location: floorData.location || sample?.location || 'Jaffna, Sri Lanka',
      description: floorData.about,
      facilities: floorData.facilities,
      statusBadge: floorData.statusBadge,
      statusTone: floorData.statusTone,
    };
  }, [floorData, floorRooms]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!floor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center px-6">
          <div className="text-7xl mb-6">🏠</div>
          <h2 className="text-3xl font-bold text-foreground/90 mb-3">Floor Not Found</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">The floor you are looking for does not exist.</p>
          <button onClick={() => navigate('/rooms')} className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-xl shadow-lg">
            <FaArrowLeft className="w-4 h-4" /> Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img src={floor.image} alt={floor.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-6xl mx-auto">
            <Link to="/rooms" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors text-sm font-medium">
              <FaArrowLeft className="w-4 h-4" /> Back to Rooms
            </Link>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">{floor.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-2">
                <FaMapMarkerAlt className="w-4 h-4" /> {floor.location}
              </span>
              <span className="flex items-center gap-2">
                <FaLayerGroup className="w-4 h-4" /> {floor.totalRooms} Rooms
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getAvailabilityClass(floor.availableRooms)}`}>{floor.availableRooms} Available</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border rounded-2xl shadow-md p-6 md:p-8">
              <h2 className="text-xl font-bold text-foreground mb-3">About This Floor</h2>
              <p className="text-muted-foreground leading-relaxed">{floor.description}</p>
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-md p-6 md:p-8">
              <h2 className="text-xl font-bold text-foreground mb-5">Facilities & Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {floor.facilities.map((facility) => (
                  <FacilityBadge key={facility} name={facility} />
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-md p-6 md:p-8">
              <h2 className="text-xl font-bold text-foreground mb-5">Hostel Guidelines</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hostelRules.map((rule) => (
                  <div key={rule.text} className="flex items-center gap-3 bg-surface-active border border-primary/15 rounded-xl px-4 py-3 hover:shadow-md hover:border-primary/30 transition-all duration-200 group">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                      {rule.icon}
                    </div>
                    <span className="text-foreground/90 font-medium text-sm">{rule.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl shadow-lg sticky top-24 p-6 md:p-8 border border-border">
              <div className="text-center mb-6">
                <div className="text-sm text-muted-foreground mb-1">Monthly Fee Range</div>
                <div className="text-4xl font-bold text-primary">Rs. {floor.priceMin.toLocaleString()} - {floor.priceMax.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">per month</div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-3 border-b border-border"><span className="text-muted-foreground">Total Rooms</span><span className="font-medium text-foreground">{floor.totalRooms}</span></div>
                <div className="flex justify-between py-3 border-b border-border"><span className="text-muted-foreground">Available Rooms</span><span className="font-medium text-foreground">{floor.availableRooms}</span></div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Status Badge</span>
                  <span className={`font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${getStatusBadgeClass(floor.statusTone)}`}>
                    <FaCheckCircle className="w-3.5 h-3.5" />
                    {floor.statusBadge}
                  </span>
                </div>
                <div className="flex justify-between py-3"><span className="text-muted-foreground">Location</span><span className="font-medium text-foreground flex items-center gap-1.5"><FaMapMarkerAlt className="w-3.5 h-3.5 text-error" />{floor.location}</span></div>
              </div>

              <button onClick={() => navigate(`/floor/${floor.id}/rooms`)} className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-md">
                View Rooms
              </button>

              <p className="text-xs text-muted-foreground text-center mt-4">Select a specific room from this floor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsPage;
