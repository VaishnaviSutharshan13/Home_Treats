import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserFriends, FaMapMarkerAlt, FaWifi, FaTable, FaFan, FaStar, FaBed, FaBath, FaHeart, FaEye } from "react-icons/fa";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { BsFillDoorOpenFill } from "react-icons/bs";
import { IoIosCheckmarkCircle, IoIosCloseCircle, IoMdRemoveCircle } from "react-icons/io";

const FALLBACK_ROOM_IMAGE = "/images/hostel-room.jpg";

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
  roomSlug,
  detailsPath,
  priceLabel,
  onViewDetails,
}) => {
  const navigate = useNavigate();
  const [favorite, setFavorite] = useState(false);
  const [imgSrc, setImgSrc] = useState(image || FALLBACK_ROOM_IMAGE);

  const handleImageError = () => {
    if (imgSrc !== FALLBACK_ROOM_IMAGE) {
      setImgSrc(FALLBACK_ROOM_IMAGE);
    }
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-200/40">
      <div className="relative overflow-hidden">
        <img
          src={imgSrc}
          alt={title}
          className="h-56 w-full rounded-t-2xl object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={handleImageError}
        />
        <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        <div
          className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-t-2xl bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          onClick={() => (detailsPath || roomSlug) ? navigate(detailsPath || `/room/${roomSlug}`) : onViewDetails?.()}
        >
          <span className="flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-semibold text-purple-700 shadow-lg backdrop-blur-sm">
            <FaEye className="w-4 h-4" /> Quick View
          </span>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); setFavorite((f) => !f); }}
          className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow hover:bg-purple-100 transition-all duration-200 hover:scale-110"
        >
          <FaHeart className={`w-5 h-5 transition-colors duration-200 ${favorite ? "text-red-500" : "text-gray-400"}`} />
        </button>
        {/* Availability badge */}
        <span
          className={`absolute top-3 left-3 px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1 backdrop-blur-sm ${badgeStyles[availability]}`}
        >
          {badgeIcons[availability]} {availability}
        </span>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="truncate text-lg font-extrabold text-gray-900">{title}</h3>
            <p className="text-xs font-medium uppercase tracking-wide text-purple-500">Student Floor</p>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <FaStar className="text-yellow-400 w-5 h-5" />
            <span className="font-bold text-gray-800 text-base">{rating}</span>
            <span className="text-xs text-gray-400">({reviews})</span>
          </div>
        </div>

        <div className="flex items-center text-gray-500 text-sm mb-3 gap-4">
          <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-purple-400" /> {location}</span>
          <span className="flex items-center gap-1"><FaUserFriends className="text-purple-400" /> {capacity}</span>
        </div>

        <div className="flex items-end mb-3">
          <span className="text-2xl font-extrabold text-purple-700 mr-1">
            {priceLabel || `Rs. ${price?.toLocaleString()}`}
          </span>
          {!priceLabel && <span className="text-sm text-gray-400 mb-0.5">/month</span>}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {amenities.map((amenity) => (
            <span
              key={amenity}
              className="flex items-center gap-1 bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full text-xs font-medium border border-purple-100"
            >
              {amenityIcons[amenity] || <BsFillDoorOpenFill className="text-purple-400" />} {amenity}
            </span>
          ))}
        </div>

        <p className="text-gray-500 text-sm mb-5 line-clamp-2 leading-relaxed">{description}</p>

        <div className="mt-auto">
          <button
            onClick={() => (detailsPath || roomSlug) ? navigate(detailsPath || `/room/${roomSlug}`) : onViewDetails?.()}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
          >
            View Details
          </button>
        </div>
      </div>
    </article>
  );
};

export default RoomCard;
