import React, { useState } from "react";
import { FaUserFriends, FaMapMarkerAlt, FaWifi, FaTable, FaFan, FaStar, FaBed, FaBath, FaHeart } from "react-icons/fa";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { BsFillDoorOpenFill } from "react-icons/bs";
import { IoIosCheckmarkCircle, IoIosCloseCircle, IoMdRemoveCircle } from "react-icons/io";

const badgeStyles = {
  Available: "bg-green-100 text-green-700 border-green-400",
  Limited: "bg-yellow-100 text-yellow-700 border-yellow-400",
  Full: "bg-red-100 text-red-700 border-red-400",
};
const badgeIcons = {
  Available: <IoIosCheckmarkCircle className="inline mr-1 text-green-500" />,
  Limited: <IoMdRemoveCircle className="inline mr-1 text-yellow-500" />,
  Full: <IoIosCloseCircle className="inline mr-1 text-red-500" />,
};

const amenityIcons = {
  WiFi: <FaWifi className="text-purple-400" />,
  "Study Table": <FaTable className="text-purple-400" />,
  Fan: <FaFan className="text-purple-400" />,
  "Attached Bath": <FaBath className="text-purple-400" />,
  "Single Bed": <FaBed className="text-purple-400" />,
  "Power Backup": <HiOutlineLightningBolt className="text-purple-400" />,
};


const RoomCard = ({
  image,
  title,
  price,
  capacity,
  location,
  amenities = [],
  description,
  availability,
  rating,
  reviews,
  onViewDetails,
  onBookNow,
  onQuickView,
}) => {
  const [favorite, setFavorite] = useState(false);
  return (
    <div className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group animate-fadeIn flex flex-col overflow-hidden">
      {/* Image with overlay and favorite */}
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover rounded-t-2xl"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        {/* Favorite icon */}
        <button
          onClick={() => setFavorite((f) => !f)}
          className="absolute top-3 right-3 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-purple-100 transition-colors"
        >
          <FaHeart className={`w-5 h-5 ${favorite ? "text-red-500" : "text-gray-400"}`} />
        </button>
        {/* Availability badge */}
        <span
          className={`absolute top-3 left-3 px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1 ${badgeStyles[availability]}`}
        >
          {badgeIcons[availability]} {availability}
        </span>
        {/* Quick View Button (Bonus) */}
        {onQuickView && (
          <button
            onClick={onQuickView}
            className="absolute bottom-3 right-3 bg-white bg-opacity-90 text-purple-600 border border-purple-300 rounded-full px-3 py-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-200 shadow hover:scale-105"
          >
            Quick View
          </button>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        {/* Title and Rating */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-purple-700 truncate">{title}</h3>
          <div className="flex items-center gap-1">
            <FaStar className="text-yellow-400 w-5 h-5" />
            <span className="font-bold text-gray-800 text-base">{rating}</span>
            <span className="text-xs text-gray-400">({reviews})</span>
          </div>
        </div>
        {/* Compact info row */}
        <div className="flex items-center text-gray-600 text-sm mb-2 gap-4">
          <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-purple-400" /> {location}</span>
          <span className="flex items-center gap-1"><FaUserFriends className="text-purple-400" /> {capacity}</span>
        </div>
        {/* Price */}
        <div className="flex items-end mb-2">
          <span className="text-2xl font-extrabold text-gray-900 mr-1">Rs. {price}</span>
          <span className="text-sm text-gray-500 mb-1">/month</span>
        </div>
        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-2">
          {amenities.map((amenity) => (
            <span
              key={amenity}
              className="flex items-center gap-1 bg-purple-50 text-purple-600 px-2 py-1 rounded-full text-xs font-medium"
            >
              {amenityIcons[amenity] || <BsFillDoorOpenFill className="text-purple-400" />} {amenity}
            </span>
          ))}
        </div>
        {/* Description */}
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{description}</p>
        {/* Buttons */}
        <div className="mt-auto flex flex-col gap-2 sm:flex-row">
          <button
            onClick={onViewDetails}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
          >
            View Details
          </button>
          <button
            onClick={onBookNow}
            className="w-full sm:w-auto border-2 border-purple-600 text-purple-700 font-semibold py-2 px-4 rounded-lg hover:bg-purple-50 transition-all duration-200 shadow hover:scale-105 hover:shadow-lg"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
