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
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import AdminNotificationComposer from '../../components/admin/AdminNotificationComposer';
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

const sanitizePhone = (value: string) => value.replace(/\s+/g, '').replace(/\D/g, '').slice(0, 10);

const isEmailFormatValid = (value: string) => /^\S+@\S+\.\S+$/.test(value);

const allowEditControlKeys = (key: string) => (
  key === 'Backspace'
  || key === 'Delete'
  || key === 'ArrowLeft'
  || key === 'ArrowRight'
  || key === 'Tab'
  || key === 'Home'
  || key === 'End'
);

const StudentManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [floorFilter, setFloorFilter] = useState('All');
  const [roomFilter, setRoomFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<StudentRow | null>(null);
  const [viewing, setViewing] = useState<StudentRow | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<StudentFormErrors>({});
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await studentService.getAll({
        search: search || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        floor: floorFilter !== 'All' ? floorFilter : undefined,
        roomNumber: roomFilter || undefined,
      });

      if (res.success) {
        setStudents(res.data || []);
      } else {
        setError(res.message || 'Failed to load students');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setRoomsLoading(true);
      const res = await roomService.getAll();
      setRooms(res?.data || []);
    } catch {
      setRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, floorFilter, roomFilter]);

  const statusColor = (status: StudentStatus) => {
    if (status === 'Approved') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'Pending') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (status === 'Inactive') return 'bg-gray-100 text-gray-700 border-gray-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (student: StudentRow) => {
    setEditing(student);
    setForm({
      name: student.name,
      studentId: student.studentId,
      university: student.university,
      email: student.email,
      phone: student.phone,
      gender: student.gender,
      address: student.address,
      emergencyContact: student.emergencyContact,
      password: '',
      roomNumber: student.roomNumber,
      course: 'Computer Science',
      status: student.status,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const setFormField = (key: keyof StudentForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value as any }));
    if (key === 'email' || key === 'phone' || key === 'emergencyContact') {
      setFormErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const setNumericFormField = (key: 'phone' | 'emergencyContact', value: string) => {
    setFormField(key, sanitizePhone(value));
  };

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isShortcut = (e.ctrlKey || e.metaKey) && ['a', 'c', 'x', 'v'].includes(e.key.toLowerCase());
    if (isShortcut || allowEditControlKeys(e.key)) return;
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumericPaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    currentValue: string,
    onChange: (value: string) => void,
  ) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    onChange(sanitizePhone(`${currentValue}${pastedText}`));
  };

  const validateForm = () => {
    if (editing) {
      setFormErrors({});
      return true;
    }

    const nextErrors: StudentFormErrors = {};

    if (!isEmailFormatValid(form.email)) {
      nextErrors.email = 'Email format is invalid';
    }

    if (!TEN_DIGIT_REGEX.test(form.phone)) {
      nextErrors.phone = 'Phone number must contain exactly 10 digits.';
    }

    if (!TEN_DIGIT_REGEX.test(form.emergencyContact)) {
      nextErrors.emergencyContact = 'Emergency contact must contain exactly 10 digits.';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      if (editing) {
        const payload = {
          roomNumber: form.roomNumber.trim(),
          status: form.status,
        };
        await studentService.update(editing._id, payload);
        showToast('Student updated successfully', 'success');
      } else {
        const payload = {
          ...form,
          studentId: form.studentId.toUpperCase(),
        };
        await studentService.create(payload);
        showToast('Student created successfully', 'success');
      }

      setShowModal(false);
      fetchStudents();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inactivateStudent = async (student: StudentRow) => {
    if (!window.confirm(`Inactivate ${student.name}?`)) return;
    try {
      await studentService.inactivate(student._id);
      showToast(`${student.name} inactivated successfully`, 'success');
      fetchStudents();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to inactivate student', 'error');
    }
  };

  const activateStudent = async (student: StudentRow) => {
    try {
      await studentService.activate(student._id);
      showToast(`${student.name} activated successfully`, 'success');
      fetchStudents();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to activate student', 'error');
    }
  };

  const approveStudent = async (student: StudentRow) => {
    try {
      await studentService.approve(student._id);
      showToast(`${student.name} approved successfully`, 'success');
      fetchStudents();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to approve student', 'error');
    }
  };

  const rejectStudent = async (student: StudentRow) => {
    try {
      await studentService.reject(student._id);
      showToast(`${student.name} rejected`, 'success');
      fetchStudents();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to reject student', 'error');
    }
  };

  const metrics = useMemo(() => {
    return {
      total: students.length,
      pending: students.filter((s) => s.status === 'Pending').length,
      approved: students.filter((s) => s.status === 'Approved').length,
      rejected: students.filter((s) => s.status === 'Rejected').length,
      inactive: students.filter((s) => s.status === 'Inactive').length,
    };
  }, [students]);

  const roomOptions = useMemo(() => {
    const currentRoom = form.roomNumber.trim();
    const baseOptions = rooms.filter((room) => room.status === 'Available' && room.occupied < room.capacity);

    if (currentRoom) {
      const selectedRoom = rooms.find((room) => room.roomNumber === currentRoom);
      if (selectedRoom && !baseOptions.some((room) => room.roomNumber === selectedRoom.roomNumber)) {
        baseOptions.unshift(selectedRoom);
      }
    }

    return [...baseOptions].sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
  }, [rooms, form.roomNumber]);

  return (
    <div className="min-h-screen bg-[#faf8ff]">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen((v) => !v)} userRole="admin" />

      <div className="lg:ml-64">
        {toast && (
          <div className="fixed top-4 right-4 z-[80]">
            <div className={`px-4 py-3 rounded-xl text-white shadow-lg ${toast.type === 'success' ? 'bg-purple-600' : 'bg-red-600'}`}>
              {toast.message}
            </div>
          </div>
        )}

        <div className="bg-white border-b border-purple-100 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <button title="Open sidebar" aria-label="Open sidebar" onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                  <FaBars />
                </button>
                <Link to="/admin/dashboard" className="inline-flex items-center gap-1 hover:text-purple-700">
                  <FaChevronLeft className="text-xs" /> Dashboard
                </Link>
                <span>/</span>
                <span className="text-gray-700">Student Management</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
              <p className="text-sm text-gray-500">Approval queue, student records, and registration lifecycle.</p>
            </div>

            <div className="flex items-center gap-2">
              <AdminNotificationComposer
                source="Student Management"
                defaultType="student"
                buttonLabel="Send Update"
              />
              <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700">
                <FaPlus /> Add Student
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric title="Total" value={metrics.total} icon={<FaUserPlus />} color="bg-purple-100 text-purple-700" />
            <Metric title="Pending" value={metrics.pending} icon={<FaSpinner />} color="bg-amber-100 text-amber-700" />
            <Metric title="Approved" value={metrics.approved} icon={<FaUserCheck />} color="bg-green-100 text-green-700" />
            <Metric title="Rejected" value={metrics.rejected} icon={<FaUserSlash />} color="bg-red-100 text-red-700" />
            <Metric title="Inactive" value={metrics.inactive} icon={<FaPause />} color="bg-gray-100 text-gray-700" />
          </div>

          <div className="bg-white border border-purple-100 rounded-2xl p-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by student name or ID"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={['All', 'Pending', 'Approved', 'Rejected', 'Inactive']} />
              <FilterSelect label="Floor" value={floorFilter} onChange={setFloorFilter} options={['All', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor']} />

              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={roomFilter}
                  onChange={(e) => setRoomFilter(e.target.value)}
                  placeholder="Filter by room number"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-purple-100 rounded-2xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="py-16 flex items-center justify-center text-gray-500 gap-2">
                <FaSpinner className="animate-spin" /> Loading students...
              </div>
            ) : error ? (
              <div className="py-12 text-center text-red-600">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#f6f1ff] text-gray-700">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Student ID</th>
                      <th className="text-left px-4 py-3 font-semibold">Name</th>
                      <th className="text-left px-4 py-3 font-semibold">Email</th>
                      <th className="text-left px-4 py-3 font-semibold">Phone</th>
                      <th className="text-left px-4 py-3 font-semibold">Status</th>
                      <th className="text-left px-4 py-3 font-semibold">Room Number</th>
                      <th className="text-left px-4 py-3 font-semibold">Floor</th>
                      <th className="text-left px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.length === 0 ? (
                      <tr>
                        <td className="px-4 py-10 text-center text-gray-500" colSpan={8}>No students found.</td>
                      </tr>
                    ) : (
                      students.map((student) => (
                        <tr key={student._id} className="hover:bg-[#fcfbff]">
                          <td className="px-4 py-3 font-semibold text-gray-700">{student.studentId}</td>
                          <td className="px-4 py-3 text-gray-800">{student.name}</td>
                          <td className="px-4 py-3 text-gray-600">{student.email}</td>
                          <td className="px-4 py-3 text-gray-600">{student.phone}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${statusColor(student.status)}`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{student.roomNumber || '-'}</td>
                          <td className="px-4 py-3 text-gray-700">{student.floor || '-'}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 text-sm">
                              <button onClick={() => setViewing(student)} className="text-purple-700 hover:text-purple-900" title="View">
                                <FaEye />
                              </button>
                              <button onClick={() => openEdit(student)} className="text-blue-700 hover:text-blue-900" title="Edit">
                                <FaEdit />
                              </button>
                              {student.status === 'Inactive' ? (
                                <button onClick={() => activateStudent(student)} className="text-green-700 hover:text-green-900" title="Activate">
                                  <FaPlay />
                                </button>
                              ) : (
                                <button onClick={() => inactivateStudent(student)} className="text-gray-700 hover:text-gray-900" title="Inactivate">
                                  <FaPause />
                                </button>
                              )}

                              {student.status !== 'Approved' && student.status !== 'Inactive' && (
                                <button onClick={() => approveStudent(student)} className="text-green-700 hover:text-green-900" title="Approve">
                                  <FaCheck />
                                </button>
                              )}

                              {student.status !== 'Rejected' && student.status !== 'Inactive' && (
                                <button onClick={() => rejectStudent(student)} className="text-red-600 hover:text-red-800" title="Reject">
                                  <FaTimes />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Student' : 'Add Student'} onClose={() => !submitting && setShowModal(false)}>
          <form onSubmit={submit} className="space-y-3">
            {editing && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Personal account details are student-managed and shown as read-only. Admin can only update Room Number and Status.
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Full Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required disabled={Boolean(editing)} />
              <Input label="Student ID" value={form.studentId} onChange={(v) => setForm((f) => ({ ...f, studentId: v.toUpperCase() }))} required disabled={Boolean(editing)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => setFormField('email', v)}
                required
                disabled={Boolean(editing)}
                error={formErrors.email}
                helper={form.email ? (isEmailFormatValid(form.email) ? `Preview: ${form.email.trim()}` : 'Use format like name@example.com') : ''}
              />
              <Input
                label="Phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={(v) => setNumericFormField('phone', v)}
                required
                disabled={Boolean(editing)}
                onKeyDown={handleNumericKeyDown}
                onPaste={(e) => handleNumericPaste(e, form.phone, (v) => setNumericFormField('phone', v))}
                error={formErrors.phone}
                helper={form.phone ? `${form.phone.length}/10 digits` : 'Enter exactly 10 digits'}
              />
            </div>

            <Input label="University / College" value={form.university} onChange={(v) => setForm((f) => ({ ...f, university: v }))} required disabled={Boolean(editing)} />
            <Input label="Address" value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} required disabled={Boolean(editing)} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Emergency Contact"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.emergencyContact}
                onChange={(v) => setNumericFormField('emergencyContact', v)}
                required
                disabled={Boolean(editing)}
                onKeyDown={handleNumericKeyDown}
                onPaste={(e) => handleNumericPaste(e, form.emergencyContact, (v) => setNumericFormField('emergencyContact', v))}
                error={formErrors.emergencyContact}
                helper={form.emergencyContact ? `${form.emergencyContact.length}/10 digits` : 'Enter exactly 10 digits'}
              />
              <div>
                <label className="block text-xs text-gray-500 mb-1">Room Number</label>
                <select
                  title="Room Number"
                  value={form.roomNumber}
                  onChange={(e) => setForm((f) => ({ ...f, roomNumber: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Not Assigned</option>
                  {roomOptions.map((room) => {
                    const isCurrentRoom = room.roomNumber === form.roomNumber.trim();
                    const isVacant = room.status === 'Available' && room.occupied < room.capacity;
                    const label = isVacant
                      ? `${room.roomNumber} (${room.capacity - room.occupied} vacant)`
                      : `${room.roomNumber} (current assignment)`;

                    return (
                      <option key={room._id} value={room.roomNumber}>
                        {label}
                      </option>
                    );
                  })}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {roomsLoading
                    ? 'Loading available rooms...'
                    : roomOptions.length > 0
                      ? 'Only vacant rooms are listed.'
                      : 'No vacant rooms available right now.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select
                label="Gender"
                value={form.gender}
                onChange={(value) => setForm((f) => ({ ...f, gender: value as StudentForm['gender'] }))}
                options={['Male', 'Female', 'Other']}
                disabled={Boolean(editing)}
              />
              <Select
                label="Status"
                value={form.status}
                onChange={(value) => setForm((f) => ({ ...f, status: value as StudentStatus }))}
                options={['Pending', 'Approved', 'Rejected', 'Inactive']}
              />
              <Input label="Password" type="password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} required={!editing} disabled={Boolean(editing)} />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60">
                {submitting ? 'Saving...' : editing ? 'Update Student' : 'Create Student'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {viewing && (
        <Modal title="Student Details" onClose={() => setViewing(null)}>
          <div className="space-y-3 text-sm">
            <Detail label="Student ID" value={viewing.studentId} />
            <Detail label="Name" value={viewing.name} />
            <Detail label="Email" value={viewing.email} />
            <Detail label="Phone" value={viewing.phone} />
            <Detail label="University" value={viewing.university} />
            <Detail label="Gender" value={viewing.gender} />
            <Detail label="Address" value={viewing.address} />
            <Detail label="Emergency Contact" value={viewing.emergencyContact} />
            <Detail label="Status" value={viewing.status} />
            <Detail label="Room Number" value={viewing.roomNumber || '-'} />
            <Detail label="Floor" value={viewing.floor || '-'} />
            <Detail label="Booking Status" value={viewing.bookingStatus || '-'} />
            <Detail label="Fees Status" value={viewing.fees || '-'} />
          </div>
        </Modal>
      )}
    </div>
  );
};

const Metric = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
  <div className="bg-white rounded-xl border border-purple-100 p-4">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1">{label}</label>
    <select title={label} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500">
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-[90] bg-black/40 p-4 flex items-center justify-center">
    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button title="Close modal" aria-label="Close modal" onClick={onClose} className="text-gray-500 hover:text-gray-700"><FaTimes /></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

const Input = ({
  label,
  value,
  onChange,
  required,
  type = 'text',
  disabled = false,
  inputMode,
  maxLength,
  onKeyDown,
  onPaste,
  error,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  disabled?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  error?: string;
  helper?: string;
}) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1">{label}</label>
    <input
      type={type}
      title={label}
      placeholder={label}
      value={value}
      required={required}
      disabled={disabled}
      inputMode={inputMode}
      maxLength={maxLength}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2.5 rounded-xl border focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-purple-500'} ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
    />
    {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : helper ? <p className="mt-1 text-xs text-gray-500">{helper}</p> : null}
  </div>
);

const Select = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1">{label}</label>
    <select title={label} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={`w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-2 gap-3 py-2 border-b border-gray-100">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-900 font-medium">{value}</span>
  </div>
);

export default StudentManagement;