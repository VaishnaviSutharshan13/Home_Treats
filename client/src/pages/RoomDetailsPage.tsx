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
  FaCalendarCheck,
  FaCalendarTimes,
  FaClock,
  FaMapMarkerAlt,
  FaCheckCircle,
} from 'react-icons/fa';
import { HiOutlineLightningBolt } from 'react-icons/hi';
import { roomService } from '../services';
import { selectionAvailability, toFloorId } from '../utils/roomView';
import type { ApiRoom } from '../utils/roomView';

interface FacilityBadgeProps {
  name: string;
}

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  time: string;
  day: string;
  note: string;
  accentColor: string;
}

const facilityIcons: Record<string, React.ReactNode> = {
  WiFi: <FaWifi />,
  Fan: <FaFan />,
  AC: <FaFan />,
  'Study Table': <FaTable />,
  'Private Bathroom': <FaBath />,
  'Common Bathroom': <FaBath />,
  'Single Bed': <FaBed />,
  'Power Backup': <HiOutlineLightningBolt />,
  Wardrobe: <FaDoorOpen />,
  Lockers: <FaLock />,
  'Common Area': <FaDoorOpen />,
};

const FacilityBadge: React.FC<FacilityBadgeProps> = ({ name }) => (
  <div className="flex items-center gap-3 bg-surface-active border border-primary/15 rounded-xl px-4 py-3 hover:shadow-md hover:border-primary/30 transition-all duration-200 group">
    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-200">
      {facilityIcons[name] || <FaCheckCircle />}
    </div>
    <span className="text-foreground/90 font-medium text-sm">{name}</span>
  </div>
);

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, time, day, note, accentColor }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accentColor} text-white shadow-md`}>{icon}</div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
    </div>
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FaClock className="w-4 h-4 text-muted-foreground" />
        <span className="text-foreground/90 font-medium">{time}</span>
      </div>
      <div className="flex items-center gap-2">
        <FaCalendarCheck className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground text-sm">{day}</span>
      </div>
      <p className="text-muted-foreground text-sm italic mt-2 pl-1 border-l-2 border-primary/25 ml-1">{note}</p>
    </div>
  </div>
);

const RoomDetailsPage: React.FC = () => {
  const { floorId } = useParams<{ floorId: string }>();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const res = await roomService.getAll();
        setRooms(Array.isArray(res?.data) ? res.data : []);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const floorRooms = useMemo(() => {
    return rooms.filter((r) => toFloorId(r.floor) === floorId);
  }, [rooms, floorId]);

  const floor = useMemo(() => {
    if (!floorRooms.length) return null;
    const sample = floorRooms[0];
    const prices = floorRooms.map((r) => r.price).filter((p) => Number.isFinite(p));
    const facilities = Array.from(new Set(floorRooms.flatMap((r) => r.facilities || [])));
    const availableRooms = floorRooms.filter((r) => selectionAvailability(r) !== 'Not Available').length;

    return {
      id: toFloorId(sample.floor),
      title: sample.floor,
      totalRooms: floorRooms.length,
      availableRooms,
      priceMin: prices.length ? Math.min(...prices) : 0,
      priceMax: prices.length ? Math.max(...prices) : 0,
      image: sample.image || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',
      location: sample.location || 'Jaffna, Sri Lanka',
      description: `${sample.floor} currently has ${floorRooms.length} rooms with ${availableRooms} available for booking.`,
      facilities,
      checkIn: {
        time: '2:00 PM',
        day: 'Any working day',
        note: 'Early check-in can be requested based on room readiness.',
      },
      checkOut: {
        time: '11:00 AM',
        day: 'As per booking end date',
        note: 'Late check-out is based on availability.',
      },
    };
  }, [floorRooms]);

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
          <button onClick={() => navigate('/floors')} className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-xl shadow-lg">
            <FaArrowLeft className="w-4 h-4" /> Back to Floors
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
            <Link to="/floors" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors text-sm font-medium">
              <FaArrowLeft className="w-4 h-4" /> Back to Floors
            </Link>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">{floor.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-2">
                <FaMapMarkerAlt className="w-4 h-4" /> {floor.location}
              </span>
              <span className="flex items-center gap-2">
                <FaBed className="w-4 h-4" /> {floor.totalRooms} Rooms
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 border border-primary/200/90 text-white">{floor.availableRooms} Available</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
              <h2 className="text-xl font-bold text-foreground mb-3">About This Floor</h2>
              <p className="text-muted-foreground leading-relaxed">{floor.description}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
              <h2 className="text-xl font-bold text-foreground mb-5">Facilities & Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {floor.facilities.map((facility) => (
                  <FacilityBadge key={facility} name={facility} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-5">Check-in & Check-out Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard icon={<FaCalendarCheck className="w-5 h-5" />} title="Check-in" time={floor.checkIn.time} day={floor.checkIn.day} note={floor.checkIn.note} accentColor="bg-primary/10 border border-primary/200" />
                <InfoCard icon={<FaCalendarTimes className="w-5 h-5" />} title="Check-out" time={floor.checkOut.time} day={floor.checkOut.day} note={floor.checkOut.note} accentColor="bg-error/10 border border-error/200" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg sticky top-24 p-6 md:p-8 border border-gray-100">
              <div className="text-center mb-6">
                <div className="text-sm text-muted-foreground mb-1">Monthly Price Range</div>
                <div className="text-4xl font-bold text-primary">Rs. {floor.priceMin.toLocaleString()} - {floor.priceMax.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">per month</div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-3 border-b border-gray-100"><span className="text-muted-foreground">Total Rooms</span><span className="font-medium text-foreground">{floor.totalRooms}</span></div>
                <div className="flex justify-between py-3 border-b border-gray-100"><span className="text-muted-foreground">Available Rooms</span><span className="font-medium text-foreground">{floor.availableRooms}</span></div>
                <div className="flex justify-between py-3 border-b border-gray-100"><span className="text-muted-foreground">Status</span><span className="font-medium text-primary flex items-center gap-1.5"><FaCheckCircle className="w-4 h-4" />Live from DB</span></div>
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
