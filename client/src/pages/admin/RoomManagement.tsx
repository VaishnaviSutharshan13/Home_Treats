/**
 * Admin Room Management Page – Home_Treats
 * Card-based layout with room images, Multer file upload, search/filter,
 * full CRUD, allocate / vacate, and modern TailwindCSS responsive design.
 * All prices in LKR.
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaBed,
  FaUsers,
  FaTimes,
  FaCheck,
  FaSpinner,
  FaUserPlus,
  FaSignOutAlt,
  FaWifi,
  FaSnowflake,
  FaChair,
  FaDoorOpen,
  FaBath,
  FaHandsHelping,
  FaLock,
  FaCamera,
  FaMapMarkerAlt,
  FaFilter,
  FaWrench,
  FaEye,
  FaChevronLeft,
  FaBars,
} from 'react-icons/fa';
import { roomService } from '../../services';
import Sidebar from '../../components/layout/Sidebar';
import AdminNotificationComposer from '../../components/admin/AdminNotificationComposer';

// ─── Types ───────────────────────────────────────────────────
interface Room {
  _id: string;
  name: string;
  roomNumber: string;
  block: string;
  floor: string;
  capacity: number;
  occupied: number;
  type: 'Single Room' | 'Double Room' | 'Dormitory';
  status: 'Available' | 'Occupied' | 'Maintenance';
  students: string[];
  facilities: string[];
  price: number;
  description: string;
  image: string;
  location: string;
  lastMaintenance: string;
  createdAt: string;
}

interface RoomFormData {
  name: string;
  roomNumber: string;
  block: string;
  floor: string;
  capacity: number;
  type: string;
  status: string;
  price: number;
  description: string;
  image: File | null;
  imagePreview: string;
  facilities: string[];
  location: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

// ─── Constants ───────────────────────────────────────────────
const ALL_FACILITIES = ['WiFi', 'AC', 'Study Table', 'Wardrobe', 'Private Bathroom', 'Common Area', 'Lockers'];

const FACILITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <FaWifi />,
  AC: <FaSnowflake />,
  'Study Table': <FaChair />,
  Wardrobe: <FaDoorOpen />,
  'Private Bathroom': <FaBath />,
  'Common Area': <FaHandsHelping />,
  Lockers: <FaLock />,
};

const INITIAL_FORM: RoomFormData = {
  name: '',
  roomNumber: '',
  block: 'Block A',
  floor: '1st Floor',
  capacity: 1,
  type: 'Single Room',
  status: 'Available',
  price: 4000,
  description: '',
  image: null,
  imagePreview: '',
  facilities: [],
  location: 'Jaffna, Sri Lanka',
};

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// ─── Helpers ─────────────────────────────────────────────────
const formatLKR = (amount: number) =>
  `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const resolveImageUrl = (img?: string) => {
  if (!img) return 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600';
  if (img.startsWith('http')) return img;
  return `${API_BASE}${img}`;
};

// ─── Component ───────────────────────────────────────────────
const RoomManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<RoomFormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [allocateRoomId, setAllocateRoomId] = useState<string | null>(null);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [allocating, setAllocating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Toast helpers ───────────────────────────────────────
  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // ─── Fetch rooms ─────────────────────────────────────────
  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await roomService.getAll();
      setRooms(res.data ?? res);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  // ─── Filtering ───────────────────────────────────────────
  const filteredRooms = rooms.filter((room) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      room.name?.toLowerCase().includes(term) ||
      room.roomNumber.toLowerCase().includes(term) ||
      room.type.toLowerCase().includes(term) ||
      room.block.toLowerCase().includes(term);
    const matchesStatus = filterStatus === 'All' || room.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'Occupied': return 'bg-red-100 text-red-700 border border-red-200';
      case 'Maintenance': return 'bg-amber-100 text-amber-700 border border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  // ─── Modal helpers ───────────────────────────────────────
  const handleAddRoom = () => {
    setEditingRoom(null);
    setFormData(INITIAL_FORM);
    setShowModal(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name ?? '',
      roomNumber: room.roomNumber,
      block: room.block,
      floor: room.floor,
      capacity: room.capacity,
      type: room.type,
      status: room.status ?? 'Available',
      price: room.price ?? 4000,
      description: room.description ?? '',
      image: null,
      imagePreview: room.image ? resolveImageUrl(room.image) : '',
      facilities: room.facilities ?? [],
      location: room.location ?? 'Jaffna, Sri Lanka',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRoom(null);
    setFormData(INITIAL_FORM);
  };

  // ─── Image handling ──────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be under 5 MB', 'error');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  // ─── Delete ──────────────────────────────────────────────
  const handleDeleteRoom = async () => {
    if (!deleteTarget) return;
    try {
      await roomService.delete(deleteTarget._id);
      setRooms((prev) => prev.filter((r) => r._id !== deleteTarget._id));
      showToast('Room deleted successfully', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to delete room', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  // ─── Create / Update ────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        name: formData.name,
        roomNumber: formData.roomNumber,
        block: formData.block,
        floor: formData.floor,
        capacity: formData.capacity,
        type: formData.type,
        price: formData.price,
        description: formData.description,
        facilities: formData.facilities,
        location: formData.location,
      };
      if (editingRoom) payload.status = formData.status;
      if (formData.image) payload.image = formData.image;

      if (editingRoom) {
        const res = await roomService.update(editingRoom._id, payload);
        const updated = res.data ?? res;
        setRooms((prev) => prev.map((r) => (r._id === editingRoom._id ? { ...r, ...updated } : r)));
        showToast('Room updated successfully', 'success');
      } else {
        const res = await roomService.create(payload);
        const created = res.data ?? res;
        setRooms((prev) => [created, ...prev]);
        showToast('Room created successfully', 'success');
      }
      closeModal();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save room', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Allocate student ───────────────────────────────────
  const openAllocateModal = (roomId: string) => {
    setAllocateRoomId(roomId);
    setStudentIdInput('');
    setShowAllocateModal(true);
  };

  const handleAllocate = async () => {
    if (!allocateRoomId || !studentIdInput.trim()) return;
    setAllocating(true);
    try {
      const res = await roomService.allocate(allocateRoomId, { studentId: studentIdInput.trim() });
      const updated = res.data ?? res;
      setRooms((prev) => prev.map((r) => (r._id === allocateRoomId ? { ...r, ...updated } : r)));
      showToast('Student allocated successfully', 'success');
      setShowAllocateModal(false);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to allocate student', 'error');
    } finally {
      setAllocating(false);
    }
  };

  // ─── Vacate room ────────────────────────────────────────
  const handleVacate = async (roomId: string) => {
    try {
      const res = await roomService.vacate(roomId);
      const updated = res.data ?? res;
      setRooms((prev) => prev.map((r) => (r._id === roomId ? { ...r, ...updated } : r)));
      showToast('Room vacated successfully', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to vacate room', 'error');
    }
  };

  // ─── Facility checkbox toggle ───────────────────────────
  const toggleFacility = (facility: string) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} userRole="admin" />
      <div className="lg:ml-64">
      {/* ── Toast Notifications ─────────────────────────── */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-5 py-3 rounded-xl shadow-lg text-gray-900 text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              t.type === 'success' ? 'bg-purple-600' : 'bg-red-600'
            }`}
          >
            {t.type === 'success' ? <FaCheck /> : <FaTimes />}
            {t.message}
          </div>
        ))}
      </div>

      {/* ── Header ──────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full px-6 sm:px-8 lg:px-10 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                title="Open sidebar"
                aria-label="Open sidebar"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
              >
                <FaBars className="w-5 h-5" />
              </button>
              <div className="flex flex-col">
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center gap-1.5 text-gray-500 hover:text-purple-600 text-xs mb-1 transition-colors duration-200 group"
                >
                  <FaChevronLeft className="w-2.5 h-2.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
                  <span>Dashboard</span>
                  <span className="text-gray-600 mx-0.5">/</span>
                  <span className="text-gray-500">Room Management</span>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
                <p className="text-sm text-gray-500">Manage hostel rooms, allocations & availability</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AdminNotificationComposer
                source="Room Management"
                defaultType="room"
                buttonLabel="Send Room Update"
              />
              <button
                onClick={handleAddRoom}
                className="bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-600 transition-all duration-200 flex items-center font-medium shadow-sm hover:shadow-md"
              >
                <FaPlus className="mr-2" />
                Add New Room
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Summary Stats ───────────────────────────────── */}
      <div className="w-full px-6 sm:px-8 lg:px-10 pt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Rooms', count: rooms.length, icon: <FaBed className="text-xl" />, color: 'bg-purple-500/10 text-purple-600', accent: 'border-purple-500/20' },
            { label: 'Available', count: rooms.filter((r) => r.status === 'Available').length, icon: <FaCheck className="text-xl" />, color: 'bg-purple-50 text-purple-700', accent: 'border-purple-200' },
            { label: 'Occupied', count: rooms.filter((r) => r.status === 'Occupied').length, icon: <FaUsers className="text-xl" />, color: 'bg-red-50 text-red-700', accent: 'border-red-200' },
            { label: 'Maintenance', count: rooms.filter((r) => r.status === 'Maintenance').length, icon: <FaWrench className="text-xl" />, color: 'bg-amber-50 text-amber-700', accent: 'border-amber-200' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center gap-4`}>
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Search & Filter Bar ─────────────────────────── */}
      <div className="w-full px-6 sm:px-8 lg:px-10 pt-6">
        <div className="bg-gray-50 rounded-xl border border-purple-500/20 p-4 flex flex-col sm:flex-row gap-3 shadow-sm">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, room number, type or block..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            {['All', 'Available', 'Occupied', 'Maintenance'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filterStatus === s
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────── */}
      <div className="w-full px-6 sm:px-8 lg:px-10 py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <FaSpinner className="w-10 h-10 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-500 text-lg">Loading rooms...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button onClick={fetchRooms} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredRooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <FaBed className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium text-gray-500">
              {searchTerm || filterStatus !== 'All' ? 'No rooms match your search.' : 'No rooms yet.'}
            </p>
            {!searchTerm && filterStatus === 'All' && (
              <button onClick={handleAddRoom} className="mt-4 text-purple-600 font-medium hover:underline">
                Add your first room
              </button>
            )}
          </div>
        )}

        {/* ── Room Cards Grid ─────────────────────────────── */}
        {!loading && !error && filteredRooms.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {filteredRooms.map((room) => (
              <div
                key={room._id}
                className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-purple-500/10 transition-shadow duration-300 group"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={resolveImageUrl(room.image)}
                    alt={room.name || room.roomNumber}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600';
                    }}
                  />
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusStyle(room.status)}`}>
                    {room.status}
                  </span>
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-gray-100 shadow-sm">
                    {formatLKR(room.price)}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3 className="text-base font-semibold text-purple-600 leading-tight line-clamp-1 mb-1">
                    {room.name || room.roomNumber}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                    <FaMapMarkerAlt className="text-gray-500" />
                    {room.block} &middot; {room.floor} &middot; {room.roomNumber}
                  </p>

                  <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1 bg-gray-100/60 px-2 py-0.5 rounded-md text-gray-600">
                      <FaBed className="text-gray-500 text-xs" />
                      {room.type}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-gray-100/60 px-2 py-0.5 rounded-md text-gray-600">
                      <FaUsers className="text-gray-500 text-xs" />
                      {room.occupied}/{room.capacity} beds
                    </span>
                  </div>

                  {room.facilities && room.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {room.facilities.slice(0, 4).map((f) => (
                        <span key={f} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 text-xs font-medium">
                          {FACILITY_ICONS[f] || null}
                          {f}
                        </span>
                      ))}
                      {room.facilities.length > 4 && (
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-xs font-medium">
                          +{room.facilities.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setViewingRoom(room)}
                      className="flex items-center justify-center gap-1.5 text-sm font-medium text-purple-600 bg-purple-500/10 hover:bg-purple-500/20 py-2 px-3 rounded-lg transition-colors"
                      title="View Room"
                    >
                      <FaEye className="text-xs" /> View
                    </button>
                    <button
                      onClick={() => handleEditRoom(room)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-purple-600 bg-purple-500/10 hover:bg-purple-500/20 py-2 px-3 rounded-lg transition-colors"
                      title="Edit Room"
                    >
                      <FaEdit className="text-xs" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(room)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 py-2 px-3 rounded-lg transition-colors"
                      title="Delete Room"
                    >
                      <FaTrash className="text-xs" /> Delete
                    </button>
                    {room.occupied < room.capacity && room.status !== 'Maintenance' && (
                      <button
                        onClick={() => openAllocateModal(room._id)}
                        className="flex items-center justify-center text-purple-600 bg-purple-500/10 hover:bg-purple-500/20 p-2.5 rounded-lg transition-colors"
                        title="Allocate Student"
                      >
                        <FaUserPlus />
                      </button>
                    )}
                    {room.occupied > 0 && (
                      <button
                        onClick={() => handleVacate(room._id)}
                        className="flex items-center justify-center text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 p-2.5 rounded-lg transition-colors"
                        title="Vacate Room"
                      >
                        <FaSignOutAlt />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════ */}
      {/*  Add / Edit Room Modal                              */}
      {/* ════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-start justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
            <div className="relative bg-gray-50 rounded-2xl w-full max-w-2xl">
              <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingRoom ? 'Edit Room' : 'Add New Room'}
                  </h3>
                  <button type="button" title="Close room modal" aria-label="Close room modal" onClick={closeModal} className="text-gray-500 hover:text-gray-600 transition-colors">
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-5">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Room Image</label>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-400 flex items-center justify-center overflow-hidden cursor-pointer transition-colors relative group"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {formData.imagePreview ? (
                          <>
                            <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <FaCamera className="text-gray-900 text-lg" />
                            </div>
                          </>
                        ) : (
                          <div className="text-center text-gray-500">
                            <FaCamera className="mx-auto text-xl mb-1" />
                            <span className="text-xs">Upload</span>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        title="Upload room image"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="text-xs text-gray-500">
                        <p>Click to upload room image</p>
                        <p className="mt-1">JPEG, PNG, WebP — Max 5 MB</p>
                        {formData.image && (
                          <p className="mt-1 text-purple-600 font-medium">{formData.image.name}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Room Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Room Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nallur Comfort Single"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg bg-gray-100 text-gray-900 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                    />
                  </div>

                  {/* Room Number & Location */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Room Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. A-101"
                        value={formData.roomNumber}
                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg bg-gray-100 text-gray-900 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                      <input
                        type="text"
                        title="Room location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg bg-gray-100 text-gray-900 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Block & Floor */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Block *</label>
                      <select
                        title="Room block"
                        value={formData.block}
                        onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg bg-gray-100 text-gray-900 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                      >
                        {['Block A', 'Block B', 'Block C', 'Block D'].map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Floor *</label>
                      <select
                        title="Room floor"
                        value={formData.floor}
                        onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg bg-gray-100 text-gray-900 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                      >
                        {['1st Floor', '2nd Floor', '3rd Floor', '4th Floor'].map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Type & Capacity */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Room Type *</label>
                      <select
                        title="Room type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg bg-gray-100 text-gray-900 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                      >
                        <option value="Single Room">Single Room</option>
                        <option value="Double Room">Double Room</option>
                        <option value="Dormitory">Dormitory</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Beds (Capacity) *</label>
                      <input
                        type="number"
                        title="Beds capacity"
                        min={1}
                        max={10}
                        required
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                        className="w-full border border-gray-200 rounded-lg bg-gray-100 text-gray-900 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Price & Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Price (LKR) *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm font-medium">LKR</span>
                        </div>
                        <input
                          type="number"
                          title="Room price"
                          min={4000}
                          step={100}
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                          className="w-full border border-gray-200 rounded-lg bg-gray-100 text-gray-900 pl-12 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                    {editingRoom && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Availability</label>
                        <select
                          title="Room availability"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg bg-gray-100 text-gray-900 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                        >
                          <option value="Available">Available</option>
                          <option value="Occupied">Occupied</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg bg-gray-100 text-gray-900 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none"
                      placeholder="Brief description of the room..."
                    />
                  </div>

                  {/* Facilities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Facilities</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ALL_FACILITIES.map((facility) => (
                        <label
                          key={facility}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
                            formData.facilities.includes(facility)
                              ? 'border-purple-500 bg-purple-500/10 text-purple-600'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.facilities.includes(facility)}
                            onChange={() => toggleFacility(facility)}
                            className="hidden"
                          />
                          <span className="text-base">{FACILITY_ICONS[facility]}</span>
                          <span className="font-medium">{facility}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-900 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-900 text-sm font-medium text-gray-700 hover:bg-gray-100/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Saving...
                      </>
                    ) : editingRoom ? (
                      'Update Room'
                    ) : (
                      'Add Room'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════ */}
      {/*  Delete Confirmation Modal                          */}
      {/* ════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-gray-50 rounded-2xl max-w-sm w-full p-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                <FaTrash className="text-red-600 text-xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-100 mb-2">Delete Room</h3>
              <p className="text-sm text-gray-500 mb-1">Are you sure you want to delete</p>
              <p className="text-sm font-semibold text-gray-700 mb-5">
                {deleteTarget.name || deleteTarget.roomNumber}?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-900 text-sm font-medium text-gray-700 hover:bg-gray-100/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRoom}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-gray-900 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════ */}
      {/*  Allocate Student Modal                             */}
      {/* ════════════════════════════════════════════════════ */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAllocateModal(false)} />
          <div className="relative bg-gray-50 rounded-2xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Allocate Student</h3>
              <button type="button" title="Close allocate modal" aria-label="Close allocate modal" onClick={() => setShowAllocateModal(false)} className="text-gray-500 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Student ID</label>
              <input
                type="text"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                placeholder="Enter student ID..."
                className="w-full border border-gray-200 rounded-lg bg-gray-100 text-gray-900 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAllocateModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-900 text-sm font-medium text-gray-700 hover:bg-gray-100/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAllocate}
                disabled={allocating || !studentIdInput.trim()}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {allocating ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Allocating...
                  </>
                ) : (
                  <>
                    <FaUserPlus />
                    Allocate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* View Room Modal */}
      {viewingRoom && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-50 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-700">Room Details</h2>
              <button onClick={() => setViewingRoom(null)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-lg overflow-hidden h-48">
                <img src={resolveImageUrl(viewingRoom.image)} alt={viewingRoom.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{viewingRoom.name || viewingRoom.roomNumber}</h3>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle(viewingRoom.status)}`}>{viewingRoom.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Room Number</p>
                  <p className="text-gray-100">{viewingRoom.roomNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Block / Floor</p>
                  <p className="text-gray-100">{viewingRoom.block} / {viewingRoom.floor}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Type</p>
                  <p className="text-gray-100">{viewingRoom.type}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Price</p>
                  <p className="text-gray-100 font-semibold">{formatLKR(viewingRoom.price)}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Capacity</p>
                  <p className="text-gray-100">{viewingRoom.occupied} / {viewingRoom.capacity}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Location</p>
                  <p className="text-gray-100">{viewingRoom.location || 'Jaffna, Sri Lanka'}</p>
                </div>
              </div>
              {viewingRoom.facilities.length > 0 && (
                <div>
                  <p className="text-gray-500 font-medium text-sm mb-2">Facilities</p>
                  <div className="flex flex-wrap gap-2">
                    {viewingRoom.facilities.map((f) => (
                      <span key={f} className="px-2 py-1 bg-purple-500/10 text-purple-600 text-xs rounded-full border border-purple-500/20">
                        {FACILITY_ICONS[f] || '•'} {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {viewingRoom.description && (
                <div>
                  <p className="text-gray-500 font-medium text-sm mb-1">Description</p>
                  <p className="text-gray-700 text-sm">{viewingRoom.description}</p>
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button onClick={() => setViewingRoom(null)} className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-900 text-gray-700 hover:bg-purple-500/5">Close</button>
                <button onClick={() => { handleEditRoom(viewingRoom); setViewingRoom(null); }} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-600 flex items-center">
                  <FaEdit className="mr-2" /> Edit Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>  {/* lg:ml-64 */}
    </div>
  );
};

export default RoomManagement;
