import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";

const FALLBACK_IMAGE = "/images/hostel-room.jpg";

const floors = [
  {
    id: 1,
    name: "1st Floor",
    description: "Quiet and ideal for individual students",
    totalRooms: 10,
    availableRooms: 6,
    priceRange: "Rs. 12,000 - Rs. 20,000",
    facilities: ["WiFi", "Study Table", "Attached Bath", "Fan"],
    status: "available",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    name: "2nd Floor",
    description: "Perfect for shared living",
    totalRooms: 12,
    availableRooms: 4,
    priceRange: "Rs. 15,000 - Rs. 25,000",
    facilities: ["WiFi", "AC", "Study Table"],
    status: "limited",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    name: "3rd Floor",
    description: "Premium rooms with bright interiors and modern comfort",
    totalRooms: 8,
    availableRooms: 3,
    priceRange: "Rs. 20,000 - Rs. 32,000",
    facilities: ["WiFi", "AC", "Attached Bath", "Power Backup"],
    status: "available",
    image:
      "https://images.unsplash.com/photo-1616594039964-3fda1f0b9b95?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4,
    name: "4th Floor",
    description: "Currently fully occupied with a waitlist for new bookings",
    totalRooms: 15,
    availableRooms: 0,
    priceRange: "Rs. 18,000 - Rs. 30,000",
    facilities: ["WiFi", "AC", "Attached Bath", "Power Backup"],
    status: "full",
    image:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
  }
];

const Floors = () => {
  const navigate = useNavigate();
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const getStatusBadge = (status: string) => {
    if (status === "available") return "Available";
    if (status === "limited") return "Limited";
    return "Full";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <section className="w-full relative overflow-hidden flex flex-col items-center justify-center text-center py-28 sm:py-24">
        <img
          src={FALLBACK_IMAGE}
          alt="Hostel room hero"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-[2px]"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(37,99,235,0.75),rgba(88,28,135,0.7),rgba(15,23,42,0.85))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.24),transparent_38%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.14),transparent_35%)] pointer-events-none" />

        <div
          className="absolute -left-16 top-14 h-40 w-40 rounded-full bg-cyan-300/20 blur-2xl"
          style={{ animation: "floatSoft 7s ease-in-out infinite" }}
        />
        <div
          className="absolute right-8 bottom-10 h-36 w-36 rounded-full bg-fuchsia-300/20 blur-2xl"
          style={{ animation: "floatSoftAlt 8.5s ease-in-out infinite" }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <div className="text-sm text-white/80 mb-4 tracking-wide">Home &gt; Floors</div>
          <div
            className="rounded-3xl px-8 py-10 sm:px-10 sm:py-12 shadow-2xl border border-white/25 bg-white/12 backdrop-blur-xl flex flex-col items-center"
            style={{ animation: "fadeInUp 800ms ease-out both" }}
          >
            <div className="uppercase text-xs tracking-[0.26em] text-white/90 font-semibold mb-3">HOME TREATS</div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white drop-shadow-lg mb-3 leading-[1.05]">
              Our Floors
            </h1>
            <div className="w-16 h-1 bg-white/45 rounded-full mb-5"></div>
            <p className="text-base sm:text-xl md:text-2xl text-white/90 font-medium max-w-2xl">
              Discover bright, student-friendly floors with comfort-focused room options and transparent availability.
            </p>

            <div className="mt-7 flex items-center gap-3 text-white/85 text-xs sm:text-sm">
              <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">Verified Rooms</span>
              <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">Flexible Booking</span>
              <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes floatSoft {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatSoftAlt {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(12px); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <section className="max-w-7xl mx-auto mt-8 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch justify-items-center">
          {floors.map((floor) => (
            <div
              key={floor.id}
              className="group w-full h-full max-w-sm bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden flex flex-col"
            >
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
                    floor.status === "available"
                      ? "bg-green-100/95 text-green-800"
                      : floor.status === "limited"
                        ? "bg-yellow-100/95 text-yellow-800"
                        : "bg-red-100/95 text-red-800"
                  }`}
                >
                  {getStatusBadge(floor.status)}
                </div>

                <button
                  type="button"
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 text-gray-500 hover:text-red-500 shadow-sm grid place-items-center transition-colors"
                  aria-label="Add to favorites"
                >
                  <FaHeart />
                </button>

                {floor.status === "full" && (
                  <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold tracking-wide">
                      Fully Occupied
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col h-full">
              <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{floor.name}</h3>
              <p className="text-gray-600 mb-4 text-center min-h-[48px]">{floor.description}</p>
              <div className="flex justify-between mb-4">
                <span className="text-sm text-gray-500">{floor.totalRooms} Rooms</span>
                <span className="text-sm text-gray-500">{floor.availableRooms} Available</span>
              </div>
              <p className="text-lg font-semibold text-purple-600 mb-4 text-center">{floor.priceRange} / month</p>
              <div className="flex flex-wrap gap-2 mb-6 min-h-[56px] content-start">
                {floor.facilities.map((facility) => (
                  <span key={facility} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                    {facility}
                  </span>
                ))}
              </div>
              <button
                onClick={() => navigate(`/floor/${floor.id}`)}
                className="w-full mt-auto bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                View Details
              </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Floors;
