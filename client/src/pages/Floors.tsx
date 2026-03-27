import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaBuilding, FaBed, FaWifi } from "react-icons/fa";

const floors = [
  {
    id: 1,
    name: "1st Floor",
    description: "Quiet and ideal for individual students",
    totalRooms: 10,
    availableRooms: 6,
    priceRange: "Rs. 12,000 - Rs. 20,000",
    facilities: ["WiFi", "Study Table", "Attached Bath", "Fan"],
    status: "available"
  },
  {
    id: 2,
    name: "2nd Floor",
    description: "Perfect for shared living",
    totalRooms: 12,
    availableRooms: 4,
    priceRange: "Rs. 15,000 - Rs. 25,000",
    facilities: ["WiFi", "AC", "Study Table"],
    status: "limited"
  },
  {
    id: 3,
    name: "3rd Floor",
    description: "Budget-friendly dormitory style",
    totalRooms: 8,
    availableRooms: 0,
    priceRange: "Rs. 10,000 - Rs. 18,000",
    facilities: ["WiFi", "Fan"],
    status: "full"
  },
  {
    id: 4,
    name: "4th Floor",
    description: "Premium rooms with best facilities",
    totalRooms: 15,
    availableRooms: 10,
    priceRange: "Rs. 18,000 - Rs. 30,000",
    facilities: ["WiFi", "AC", "Attached Bath", "Power Backup"],
    status: "available"
  }
];

const Floors = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <section className="w-full bg-gradient-to-br from-purple-800 via-purple-600 to-purple-500 relative flex flex-col items-center justify-center text-center py-28 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto px-4">
          <div className="text-sm text-white/70 mb-4 tracking-wide">Home &gt; Floors</div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-10 shadow-lg flex flex-col items-center animate-fadeIn">
            <div className="uppercase text-xs tracking-widest text-white/80 font-semibold mb-2">HOME TREATS</div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-wide text-white drop-shadow-lg mb-2">
              Our Floors
            </h1>
            <div className="w-12 h-1 bg-white/30 rounded-full mb-4"></div>
            <p className="text-base sm:text-lg md:text-xl text-white/80 font-medium mt-4">
              Browse comfortable floors at Home Treats
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto mt-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {floors.map((floor) => (
            <div key={floor.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-6 relative">
              <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${
                floor.status === 'available' ? 'bg-green-100 text-green-800' :
                floor.status === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {floor.status === 'available' ? 'Available' : floor.status === 'limited' ? 'Limited' : 'Full'}
              </div>
              <div className="absolute top-4 right-4 text-gray-400 hover:text-red-500 cursor-pointer">
                <FaHeart />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{floor.name}</h3>
              <p className="text-gray-600 mb-4">{floor.description}</p>
              <div className="flex justify-between mb-4">
                <span className="text-sm text-gray-500">{floor.totalRooms} Rooms</span>
                <span className="text-sm text-gray-500">{floor.availableRooms} Available</span>
              </div>
              <p className="text-lg font-semibold text-purple-600 mb-4">{floor.priceRange} / month</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {floor.facilities.map((facility) => (
                  <span key={facility} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                    {facility}
                  </span>
                ))}
              </div>
              <button
                onClick={() => navigate(`/floor/${floor.id}`)}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Floors;
