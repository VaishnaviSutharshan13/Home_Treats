import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { roomService } from '../services';
import { selectionAvailability, toFloorId } from '../utils/roomView';
import type { ApiRoom } from '../utils/roomView';

const FALLBACK_IMAGE = '/images/hostel-room.jpg';

interface FloorSummary {
  id: string;
  name: string;
  description: string;
  totalRooms: number;
  availableRooms: number;
  priceRange: string;
  facilities: string[];
  status: 'available' | 'limited' | 'full';
  image: string;
}

const Floors = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

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

  const floors = useMemo<FloorSummary[]>(() => {
    const grouped = new Map<string, ApiRoom[]>();
    rooms.forEach((room) => {
      const key = room.floor;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(room);
    });

    return Array.from(grouped.entries())
      .map(([floorName, floorRooms]) => {
        const prices = floorRooms.map((r) => Number(r.price || 0)).filter((p) => p > 0);
        const minPrice = prices.length ? Math.min(...prices) : 0;
        const maxPrice = prices.length ? Math.max(...prices) : 0;
        const availableRooms = floorRooms.filter((r) => selectionAvailability(r) !== 'Not Available').length;
        const totalRooms = floorRooms.length;
        const status: FloorSummary['status'] = availableRooms === 0 ? 'full' : availableRooms <= Math.ceil(totalRooms * 0.4) ? 'limited' : 'available';
        const facilities = Array.from(new Set(floorRooms.flatMap((r) => r.facilities || []))).slice(0, 4);
        const sample = floorRooms[0];

        return {
          id: toFloorId(floorName),
          name: floorName,
          description: `${availableRooms} of ${totalRooms} rooms currently available on this floor.`,
          totalRooms,
          availableRooms,
          priceRange: `Rs. ${minPrice.toLocaleString()} - Rs. ${maxPrice.toLocaleString()}`,
          facilities,
          status,
          image: sample?.image || FALLBACK_IMAGE,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [rooms]);

  const getStatusBadge = (status: string) => {
    if (status === 'available') return 'Available';
    if (status === 'limited') return 'Limited';
    return 'Full';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <section className="w-full relative overflow-hidden flex flex-col items-center justify-center text-center py-28 sm:py-24">
        <img src={FALLBACK_IMAGE} alt="Hostel room hero" className="absolute inset-0 w-full h-full object-cover scale-110 blur-[2px]" loading="eager" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(37,99,235,0.75),rgba(88,28,135,0.7),rgba(15,23,42,0.85))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.24),transparent_38%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.14),transparent_35%)] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <div className="text-sm text-white/80 mb-4 tracking-wide">Home &gt; Floors</div>
          <div className="rounded-3xl px-8 py-10 sm:px-10 sm:py-12 shadow-2xl border border-white/25 bg-white/12 backdrop-blur-xl flex flex-col items-center">
            <div className="uppercase text-xs tracking-[0.26em] text-white/90 font-semibold mb-3">HOME TREATS</div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white drop-shadow-lg mb-3 leading-[1.05]">Our Floors</h1>
            <div className="w-16 h-1 bg-white/45 rounded-full mb-5" />
            <p className="text-base sm:text-xl md:text-2xl text-white/90 font-medium max-w-2xl">Live floor availability and pricing from the current database.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto mt-8 px-4 md:px-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading floors...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch justify-items-center">
            {floors.map((floor) => (
              <div key={floor.id} className="group w-full h-full max-w-sm bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden flex flex-col">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={imageErrors[floor.id] ? FALLBACK_IMAGE : floor.image}
                    alt={`${floor.name} hostel room`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={() => setImageErrors((prev) => ({ ...prev, [floor.id]: true }))}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />

                  <div
                    className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                      floor.status === 'available'
                        ? 'bg-green-100/95 text-green-800'
                        : floor.status === 'limited'
                          ? 'bg-yellow-100/95 text-yellow-800'
                          : 'bg-red-100/95 text-red-800'
                    }`}
                  >
                    {getStatusBadge(floor.status)}
                  </div>

                  <button type="button" className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 text-gray-500 hover:text-red-500 shadow-sm grid place-items-center transition-colors" aria-label="Add to favorites">
                    <FaHeart />
                  </button>
                </div>

                <div className="p-5 flex flex-col h-full">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{floor.name}</h3>
                  <p className="text-gray-600 mb-4 text-center min-h-[48px]">{floor.description}</p>
                  <div className="flex justify-between mb-4">
                    <span className="text-sm text-gray-500">{floor.totalRooms} Rooms</span>
                    <span className="text-sm text-gray-500">{floor.availableRooms} Available</span>
                  </div>
                  <p className="text-lg font-semibold text-primary mb-4 text-center">{floor.priceRange} / month</p>
                  <div className="flex flex-wrap gap-2 mb-6 min-h-[56px] content-start">
                    {floor.facilities.map((facility) => (
                      <span key={facility} className="bg-surface-active text-primary px-2 py-1 rounded-full text-xs">{facility}</span>
                    ))}
                  </div>
                  <button onClick={() => navigate(`/floor/${floor.id}`)} className="w-full mt-auto bg-primary text-white py-2.5 rounded-lg hover:bg-primary-hover transition-colors duration-200">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Floors;
