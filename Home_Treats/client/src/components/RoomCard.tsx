import React from 'react';
import { FaBed, FaUsers, FaWifi, FaCar, FaDumbbell } from 'react-icons/fa';

interface RoomCardProps {
  room: {
    id: number;
    name: string;
    type: string;
    price: number;
    capacity: number;
    available: boolean;
    image: string;
    features: string[];
  };
  onViewDetails?: (room: any) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onViewDetails }) => {
  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={room.image} 
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Available Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
            room.available 
              ? 'bg-green-500/90 text-white' 
              : 'bg-red-500/90 text-white'
          }`}>
            {room.available ? 'Available' : 'Occupied'}
          </span>
        </div>
        
        {/* Quick Info */}
        <div className="absolute bottom-4 left-4 right-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaBed className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">{room.capacity} Beds</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaUsers className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">{room.type}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
            <p className="text-sm text-gray-600">{room.type} Room</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">${room.price}</div>
            <div className="text-xs text-gray-500">per month</div>
          </div>
        </div>
        
        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {room.features.slice(0, 3).map((feature, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
              {feature}
            </span>
          ))}
          {room.features.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
              +{room.features.length - 3} more
            </span>
          )}
        </div>
        
        {/* Action Button */}
        <button 
          onClick={() => onViewDetails?.(room)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          <span>View Details</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
