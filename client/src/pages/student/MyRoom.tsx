import { useState, useEffect } from 'react';
import { FaBed, FaUsers, FaWifi, FaSnowflake, FaBook, FaShower, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { roomService } from '../../services';
import Sidebar from '../../components/layout/Sidebar';

interface Room {
  _id: string;
  roomNumber: string;
  block: string;
  floor: string;
  capacity: number;
  occupied: number;
  type: string;
  status: string;
  students: string[];
  facilities: string[];
  price: number;
  description: string;
  lastMaintenance: string;
}

const MyRoom = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.studentId || user?.room) {
      fetchRoom();
    }
  }, [user?.studentId, user?.room]);

  const fetchRoom = async () => {
    if (!user?.studentId && !user?.room) {
      setError('User information not available');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await roomService.getAll();
      if (res.success && res.data) {
        // Find the room that matches the student's room
        const myRoom = res.data.find((r: Room) =>
          r.students?.includes(user?.studentId || '') ||
          r.roomNumber === user?.room
        );
        setRoom(myRoom || null);
      }
    } catch (err) {
      setError('Failed to load room information');
    } finally {
      setLoading(false);
    }
  };

  const formatLKR = (amount: number) => `LKR ${amount.toLocaleString()}`;

  const getFacilityIcon = (facility: string) => {
    const f = facility.toLowerCase();
    if (f.includes('wifi')) return <FaWifi className="w-4 h-4" />;
    if (f.includes('ac')) return <FaSnowflake className="w-4 h-4" />;
    if (f.includes('study')) return <FaBook className="w-4 h-4" />;
    if (f.includes('bathroom') || f.includes('shower')) return <FaShower className="w-4 h-4" />;
    return <FaBed className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} userRole="student" />

      <div className="lg:ml-64">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Room</h1>
              <p className="text-gray-500 text-sm mt-1">Your room details and information</p>
            </div>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FaSpinner className="animate-spin text-4xl text-indigo-600" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={fetchRoom} className="px-4 py-2 bg-indigo-600 text-gray-900 rounded-lg hover:bg-indigo-700">
                Retry
              </button>
            </div>
          ) : !room ? (
            <div className="text-center py-20">
              <FaBed className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">No Room Assigned</h2>
              <p className="text-gray-500">Contact the hostel administration to get a room assigned.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Room Header Card */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaBed className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">Room {room.roomNumber}</h2>
                        <p className="text-gray-500">{room.block} • {room.floor}</p>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    room.status === 'Available' ? 'bg-purple-100 text-purple-800' :
                    room.status === 'Occupied' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {room.status}
                  </span>
                </div>
                {room.description && (
                  <p className="text-gray-600 mt-4">{room.description}</p>
                )}
              </div>

              {/* Room Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
                  <p className="text-gray-500 text-sm">Room Type</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">{room.type}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <FaUsers className="text-gray-500" />
                    <p className="text-gray-500 text-sm">Occupancy</p>
                  </div>
                  <p className="text-xl font-bold text-gray-800 mt-1">{room.occupied} / {room.capacity}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
                  <p className="text-gray-500 text-sm">Monthly Rent</p>
                  <p className="text-xl font-bold text-purple-600 mt-1">{formatLKR(room.price)}</p>
                </div>
              </div>

              {/* Facilities */}
              {room.facilities && room.facilities.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Facilities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {room.facilities.map((facility, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <span className="text-blue-600">{getFacilityIcon(facility)}</span>
                        <span className="text-sm text-gray-700">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Roommates */}
              {room.students && room.students.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Roommates</h3>
                  <div className="space-y-3">
                    {room.students.map((student, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-semibold">{(idx + 1)}</span>
                        </div>
                        <span className="text-sm text-gray-700">{student}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Maintenance */}
              {room.lastMaintenance && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
                  Last maintenance: {new Date(room.lastMaintenance).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRoom;
