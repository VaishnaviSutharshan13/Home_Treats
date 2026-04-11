import { useEffect, useMemo, useState } from 'react';
import {
  FaBars,
  FaCheck,
  FaChevronLeft,
  FaEdit,
  FaEye,
  FaFilter,
  FaPause,
  FaPlay,
  FaPlus,
  FaSearch,
  FaSpinner,
  FaTimes,
  FaUserCheck,
  FaUserPlus,
  FaUserSlash,
  FaTrash,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { roomService, studentService } from '../../services';

type StudentStatus = 'Pending' | 'Approved' | 'Rejected' | 'Inactive';

interface StudentRow {
  _id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  university: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  emergencyContact: string;
  roomNumber: string;
  floor: string;
  status: StudentStatus;
  bookingStatus: string;
  fees: string;
  createdAt: string;
}

interface StudentForm {
  name: string;
  studentId: string;
  university: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  emergencyContact: string;
  password: string;
  roomNumber: string;
  course: string;
  status: StudentStatus;
}

interface RoomOption {
  _id: string;
  roomNumber: string;
  status: 'Available' | 'Occupied' | 'Maintenance';
  occupied: number;
  capacity: number;
}

type StudentFormErrors = Partial<Record<'email' | 'phone' | 'emergencyContact', string>>;

const emptyForm: StudentForm = {
  name: '',
  studentId: '',
  university: '',
  email: '',
  phone: '',
  gender: 'Male',
  address: '',
  emergencyContact: '',
  password: '',
  roomNumber: '',
  course: 'Computer Science',
  status: 'Pending',
};

const TEN_DIGIT_REGEX = /^\d{10}$/;
const sanitizePhone = (value: string) => value.replace(/\D/g, '').slice(0, 10);
const isEmailFormatValid = (value: string) => /^\S+@\S+\.\S+$/.test(value);

const StudentManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<StudentRow | null>(null);
  const [viewing, setViewing] = useState<StudentRow | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<StudentFormErrors>({});
  const [rooms, setRooms] = useState<RoomOption[]>([]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentService.getAll({
        search,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });
      if (res.success) setStudents(res.data);
    } catch {
      showToast('Failed to fetch students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await roomService.getAll();
      setRooms(res.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchStudents();
    fetchRooms();
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchStudents, 300);
    return () => clearTimeout(t);
  }, [search, statusFilter]);

  const validateForm = () => {
    const errors: StudentFormErrors = {};
    if (!isEmailFormatValid(form.email)) errors.email = 'Invalid email';
    if (!TEN_DIGIT_REGEX.test(form.phone)) errors.phone = 'Phone must be 10 digits';
    if (!TEN_DIGIT_REGEX.test(form.emergencyContact)) errors.emergencyContact = 'Emergency must be 10 digits';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      if (editing) {
        await studentService.update(editing._id, {
          roomNumber: form.roomNumber,
          status: form.status,
        });
        showToast('Updated successfully', 'success');
      } else {
        await studentService.create(form);
        showToast('Created successfully', 'success');
      }
      setShowModal(false);
      fetchStudents();
    } catch {
      showToast('Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteStudent = async (student: StudentRow) => {
    if (!window.confirm(`Delete ${student.name}?`)) return;
    try {
      await studentService.delete(student._id);
      showToast('Deleted successfully', 'success');
      fetchStudents();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff]">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} userRole="admin" />

      <div className="lg:ml-64 p-6">
        {/* Header */}
        <div className="flex justify-between mb-4">
          <div>
            <Link to="/admin/dashboard" className="text-sm text-gray-500 flex items-center gap-1">
              <FaChevronLeft /> Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Student Management</h1>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <FaPlus /> Add
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border px-3 py-2 rounded-lg">
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-10"><FaSpinner className="animate-spin" /></div>
        ) : (
          <table className="w-full bg-white rounded-xl overflow-hidden">
            <thead className="bg-purple-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Room</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-t">
                  <td className="p-3">{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.status}</td>
                  <td>{s.roomNumber || '-'}</td>
                  <td className="flex gap-2 p-3">
                    <button onClick={() => setViewing(s)}><FaEye /></button>
                    <button onClick={() => { setEditing(s); setShowModal(true); }}><FaEdit /></button>
                    <button onClick={() => deleteStudent(s)} className="text-red-600"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <form onSubmit={submit} className="bg-white p-6 rounded-xl space-y-3 w-full max-w-md">
              <h2 className="text-lg font-bold">{editing ? 'Edit' : 'Add'} Student</h2>

              <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: sanitizePhone(e.target.value) })} required />

              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as StudentStatus })}>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
                <option>Inactive</option>
              </select>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" disabled={submitting} className="bg-purple-600 text-white px-4 py-2 rounded">
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;
