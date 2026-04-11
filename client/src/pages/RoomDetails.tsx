/**
 * Room Details Page
 * Full room info with booking CTA
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  FaArrowLeft,
  FaBed,
  FaUsers,
  FaMapMarkerAlt,
  FaWifi,
  FaSnowflake,
  FaChair,
  FaDoorOpen,
  FaBath,
  FaHandsHelping,
  FaLock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
} from 'react-icons/fa';
import { roomService } from '../services';

interface Room {
  _id: string;
  name: string;
  roomNumber: string;
  block: string;
  floor: string;
  capacity: number;
  occupied: number;
  type: string;
  price: number;
  status: string;
  description: string;
  image: string;
  location: string;
  facilities: string[];
  createdAt: string;
}

const facilityIcons: Record<string, ReactNode> = {
  WiFi: <FaWifi className="w-5 h-5" />,
  AC: <FaSnowflake className="w-5 h-5" />,
  'Study Table': <FaChair className="w-5 h-5" />,
  Wardrobe: <FaDoorOpen className="w-5 h-5" />,
  'Private Bathroom': <FaBath className="w-5 h-5" />,
  'Common Area': <FaHandsHelping className="w-5 h-5" />,
  Lockers: <FaLock className="w-5 h-5" />,
};

const formatLKR = (amount: number) =>
  `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await roomService.getById(id!);
        setRoom(res.data ?? res);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load room details');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <FaSpinner className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-500 text-lg">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Room not found'}</p>
          <button
            onClick={() => navigate('/rooms')}
            className="btn btn-primary"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  const availableBeds = room.capacity - room.occupied;
  const isAvailable = room.status === 'Available' && availableBeds > 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Image */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
            >
              <FaArrowLeft className="w-4 h-4" />
              Back to Rooms
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
              {room.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80">
              <span className="flex items-center gap-2">
                <FaMapMarkerAlt className="w-4 h-4" />
                {room.location || 'Jaffna, Sri Lanka'}
              </span>
              <span className="flex items-center gap-2">
                <FaBed className="w-4 h-4" />
                Room {room.roomNumber} · {room.block} · {room.floor}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  isAvailable
                    ? 'bg-primary/90 text-white'
                    : 'bg-red-500/90 text-white'
                }`}
              >
                {isAvailable ? 'Available' : room.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left – Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Room Type & Description */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                  {room.type}
                </span>
              </div>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">About this Room</h2>
              <p className="text-neutral-600 leading-relaxed">
                {room.description
                  ? room.description
                  : `This ${room.type.toLowerCase()} is located in ${room.block}, ${room.floor}. It has a capacity of ${room.capacity} bed${room.capacity > 1 ? 's' : ''} and comes equipped with modern amenities for a comfortable stay.`}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card text-center">
                <FaBed className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-neutral-900">{room.capacity}</div>
                <div className="text-sm text-neutral-500">Total Beds</div>
              </div>
              <div className="card text-center">
                <FaUsers className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-neutral-900">{availableBeds}</div>
                <div className="text-sm text-neutral-500">Available Beds</div>
              </div>
              <div className="card text-center">
                <FaMapMarkerAlt className="w-6 h-6 text-secondary-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-neutral-900">{room.block}</div>
                <div className="text-sm text-neutral-500">Block</div>
              </div>
              <div className="card text-center">
                <FaDoorOpen className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-neutral-900">{room.floor}</div>
                <div className="text-sm text-neutral-500">Floor</div>
              </div>
            </div>

            {/* Facilities */}
            {room.facilities && room.facilities.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Facilities & Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {room.facilities.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                        {facilityIcons[f] || <FaCheckCircle className="w-5 h-5" />}
                      </div>
                      <span className="text-neutral-700 font-medium text-sm">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right – Booking Card */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <div className="text-center mb-6">
                <div className="text-sm text-neutral-500 mb-1">Monthly Rate</div>
                <div className="text-4xl font-bold text-primary-600">{formatLKR(room.price)}</div>
                <div className="text-sm text-neutral-500 mt-1">per month</div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-3 border-b border-neutral-100">
                  <span className="text-neutral-500">Room Type</span>
                  <span className="font-medium text-neutral-900">{room.type}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-neutral-100">
                  <span className="text-neutral-500">Available Beds</span>
                  <span className="font-medium text-neutral-900">{availableBeds} / {room.capacity}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-neutral-100">
                  <span className="text-neutral-500">Status</span>
                  <span
                    className={`flex items-center gap-1.5 font-medium ${
                      isAvailable ? 'text-primary' : 'text-red-600'
                    }`}
                  >
                    {isAvailable ? (
                      <>
                        <FaCheckCircle className="w-4 h-4" />
                        Available
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className="w-4 h-4" />
                        {room.status}
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-neutral-500">Location</span>
                  <span className="font-medium text-neutral-900 flex items-center gap-1.5">
                    <FaMapMarkerAlt className="w-3.5 h-3.5 text-red-500" />
                    {room.location || 'Jaffna, Sri Lanka'}
                  </span>
                </div>
              </div>

              <button
                disabled={!isAvailable}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  isAvailable
                    ? 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg transform hover:scale-[1.02]'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                }`}
              >
                {isAvailable ? 'Book This Room' : 'Not Available'}
              </button>

              <p className="text-xs text-neutral-400 text-center mt-4">
                Contact admin for booking confirmation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
