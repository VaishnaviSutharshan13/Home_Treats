import { useEffect, useMemo, useState } from 'react';
import { FaCheckCircle, FaSpinner, FaTimes } from 'react-icons/fa';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { bookingService, roomService } from '../../services';

interface Room {
  _id: string;
  roomNumber: string;
  floor: string;
  capacity: number;
  occupied: number;
  status: string;
}

const RoomBooking = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchRooms = async () => {
    try {
      const res = await roomService.getAll();
      if (res.success) {
        setRooms(res.data || []);
      }
    } catch (error) {
      setErrorMessage('Failed to load room availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const availableRooms = useMemo(
    () => rooms.filter((room) => room.status !== 'Maintenance'),
    [rooms]
  );

  const handleBookNow = (room: Room) => {
    setSelectedRoom(room);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleConfirmBooking = async () => {
    if (!selectedRoom || !user) return;

    setConfirming(true);
    setErrorMessage('');

    try {
      const response = await bookingService.confirm({
        fullName: user.name,
        email: user.email,
        phone: user.phone || '',
        selectedFloor: selectedRoom.floor,
        roomId: selectedRoom._id,
      });

      if (!response.success) {
        setErrorMessage(response.message || 'Failed to confirm booking');
        return;
      }

      if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      setSuccessMessage('Your room booking has been successfully confirmed.');
      await fetchRooms();

      setTimeout(() => {
        window.location.href = '/student/dashboard';
      }, 1500);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Failed to confirm booking');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        userRole="student"
      />

      <div className="lg:ml-64">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Room Booking</h1>
          <p className="text-gray-500 text-sm mt-1">View room availability and confirm your booking.</p>
        </div>

        <div className="p-6 space-y-6">
          {successMessage && (
            <div className="bg-purple-500/10 border border-purple-500/30 text-purple-700 rounded-xl px-4 py-3 font-medium">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 font-medium">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <FaSpinner className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {availableRooms.map((room) => {
                const availableBeds = room.capacity - room.occupied;
                const isFull = availableBeds <= 0 || room.status === 'Occupied';

                return (
                  <div key={room._id} className="bg-white rounded-2xl border border-purple-500/15 shadow-sm p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Room {room.roomNumber}</h3>
                    <div className="space-y-1 text-sm text-gray-700 mb-4">
                      <p><span className="font-semibold text-purple-600">Floor:</span> {room.floor}</p>
                      <p><span className="font-semibold text-purple-600">Total Beds:</span> {room.capacity}</p>
                      <p><span className="font-semibold text-purple-600">Available Beds:</span> {availableBeds}</p>
                      <p>
                        <span className="font-semibold text-purple-600">Status:</span>{' '}
                        <span className={isFull ? 'text-red-500 font-semibold' : 'text-purple-600 font-semibold'}>
                          {isFull ? 'Full' : 'Available'}
                        </span>
                      </p>
                    </div>

                    {!isFull ? (
                      <button
                        type="button"
                        onClick={() => handleBookNow(room)}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition"
                      >
                        Book Now
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2.5 bg-gray-200 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
                      >
                        Full
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {selectedRoom && (
            <div className="bg-white rounded-2xl border border-purple-500/20 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Confirmation</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
                <p><span className="font-semibold text-purple-600">Student Name:</span> {user?.name}</p>
                <p><span className="font-semibold text-purple-600">Email:</span> {user?.email}</p>
                <p><span className="font-semibold text-purple-600">Selected Room Number:</span> {selectedRoom.roomNumber}</p>
                <p><span className="font-semibold text-purple-600">Floor Number:</span> {selectedRoom.floor}</p>
                <p><span className="font-semibold text-purple-600">Bed Availability:</span> {selectedRoom.capacity - selectedRoom.occupied}</p>
                <p><span className="font-semibold text-purple-600">Monthly Rent:</span> LKR 5500</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={confirming}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition disabled:opacity-60"
                >
                  <FaCheckCircle className="w-4 h-4" />
                  {confirming ? 'Confirming...' : 'Confirm Booking'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  <FaTimes className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomBooking;
