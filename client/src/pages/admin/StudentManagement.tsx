/**
 * Modern Student Management Page
 * Table layout with search, add, edit, delete functionality, and modal forms
 * Uses real API calls via studentService
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUser, FaEnvelope, FaPhone, FaCheck, FaTimes, FaSpinner, FaEye, FaChevronLeft, FaBars } from 'react-icons/fa';
import { studentService } from '../../services';
import Sidebar from '../../components/layout/Sidebar';

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  studentId: string;
  room: string;
  course: string;
  year: string;
  joinDate: string;
  status: 'Active' | 'Inactive';
  fees: 'Paid' | 'Pending' | 'Unpaid';
  createdAt: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

const StudentManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    room: '',
    course: 'Computer Science',
    year: '1st Year',
    status: 'Active',
    emergencyContact: { name: '', phone: '', relationship: 'Parent' }
  });

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentService.getAll();
      if (response.success) {
        setStudents(response.data);
      } else {
        setError('Failed to fetch students');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Client-side filtering
  const filteredStudents = students.filter(student => {
    const term = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term) ||
      (student.studentId && student.studentId.toLowerCase().includes(term)) ||
      student.room.toLowerCase().includes(term) ||
      student.course.toLowerCase().includes(term)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-purple-500/20 text-purple-600';
      case 'Inactive': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getFeesColor = (fees: string) => {
    switch (fees) {
      case 'Paid': return 'bg-purple-500/20 text-purple-600';
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'Unpaid': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      studentId: '',
      room: '',
      course: 'Computer Science',
      year: '1st Year',
      status: 'Active',
      emergencyContact: { name: '', phone: '', relationship: 'Parent' }
    });
    setShowModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      studentId: student.studentId || '',
      room: student.room,
      course: student.course,
      year: student.year,
      status: student.status,
      emergencyContact: (student as any).emergencyContact || { name: '', phone: '', relationship: 'Parent' }
    });
    setShowModal(true);
  };

  const handleDeleteStudent = async (student: Student) => {
    if (!window.confirm(`Are you sure you want to delete ${student.name}?`)) return;

    try {
      await studentService.delete(student._id);
      showToast('Student deleted successfully', 'success');
      fetchStudents();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete student', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingStudent) {
        await studentService.update(editingStudent._id, formData);
        showToast('Student updated successfully', 'success');
      } else {
        await studentService.create(formData);
        showToast('Student added successfully', 'success');
      }
      setShowModal(false);
      fetchStudents();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading students...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-gray-50 p-8 rounded-xl shadow-lg max-w-md">
          <FaTimes className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-100 mb-2">Failed to Load Students</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchStudents}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} userRole="admin" />
      <div className="lg:ml-64">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[100] animate-fade-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg text-gray-900 flex items-center space-x-2 ${
              toast.type === 'success' ? 'bg-purple-600' : 'bg-red-600'
            }`}
          >
            {toast.type === 'success' ? <FaCheck /> : <FaTimes />}
            <span>{toast.message}</span>
            <button
              type="button"
              title="Close notification"
              aria-label="Close notification"
              onClick={() => setToast(null)}
              className="ml-2 hover:opacity-80"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-purple-500/20">
        <div className="w-full px-6 sm:px-8 lg:px-10 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <button
                  type="button"
                  title="Open sidebar"
                  aria-label="Open sidebar"
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                >
                  <FaBars className="w-5 h-5" />
                </button>
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-1.5 text-gray-500 hover:text-purple-600 text-sm mb-2 transition-colors duration-200 group"
              >
                <FaChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform duration-200" />
                <span>Dashboard</span>
                <span className="text-gray-600 mx-0.5">/</span>
                <span className="text-gray-500">Student Management</span>
              </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
              <p className="text-sm text-gray-500">Manage hostel students and information</p>
            </div>
            <button
              onClick={handleAddStudent}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors duration-300 flex items-center"
            >
              <FaPlus className="mr-2" />
              Add Student
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-purple-500/20">
        <div className="w-full px-6 sm:px-8 lg:px-10 py-4">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search students by name, email, ID, room, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full px-6 sm:px-8 lg:px-10 py-8">
        <div className="bg-gray-50 shadow-lg rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-50 divide-y divide-gray-700">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'No students match your search.' : 'No students found. Add one to get started.'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-purple-500/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center mr-3">
                            <FaUser className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">Room: {student.room}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          <div className="flex items-center mb-1">
                            <FaEnvelope className="w-3 h-3 text-gray-500 mr-2" />
                            {student.email}
                          </div>
                          <div className="flex items-center">
                            <FaPhone className="w-3 h-3 text-gray-500 mr-2" />
                            {student.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          <div className="font-medium">{student.course}</div>
                          <div className="text-gray-500">{student.year}</div>
                          <div className="text-gray-500 text-xs">
                            Joined: {student.joinDate ? new Date(student.joinDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(student.status)}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getFeesColor(student.fees)}`}>
                          {student.fees}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setViewingStudent(student)}
                            className="text-purple-600 hover:text-purple-900"
                            title="View Details"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="text-purple-600 hover:text-purple-300"
                            title="Edit Student"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Student"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-50 rounded-lg p-6 border border-purple-500/20">
            <div className="flex items-center">
              <FaUser className="text-2xl text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border border-purple-500/20">
            <div className="flex items-center">
              <FaCheck className="text-2xl text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-gray-900">{students.filter(s => s.status === 'Active').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border border-purple-500/20">
            <div className="flex items-center">
              <FaTimes className="text-2xl text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">{students.filter(s => s.status === 'Inactive').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border border-purple-500/20">
            <div className="flex items-center">
              <FaEnvelope className="text-2xl text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Pending Fees</p>
                <p className="text-2xl font-bold text-gray-900">{students.filter(s => s.fees === 'Pending' || s.fees === 'Unpaid').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{filteredStudents.length}</span> of{' '}
            <span className="font-medium">{students.length}</span> students
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => !submitting && setShowModal(false)}>
              <div className="absolute inset-0 bg-black/60"></div>
            </div>

            <div className="inline-block align-bottom bg-gray-50 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-gray-50 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-100 mb-4">
                        {editingStudent ? 'Edit Student' : 'Add New Student'}
                      </h3>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-600">Full Name</label>
                            <input
                              type="text"
                              required
                              title="Full name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="mt-1 block w-full border-gray-200 rounded-md bg-gray-100 focus:ring-purple-500 focus:border-purple-500 sm:text-sm px-3 py-2 border"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-600">Student ID</label>
                            <input
                              type="text"
                              required
                              value={formData.studentId}
                              onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                              className="mt-1 block w-full border-gray-200 rounded-md bg-gray-100 focus:ring-purple-500 focus:border-purple-500 sm:text-sm px-3 py-2 border"
                              placeholder="STU001"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600">Email</label>
                          <input
                            type="email"
                            required
                            title="Email address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="mt-1 block w-full border-gray-200 rounded-md bg-gray-100 focus:ring-purple-500 focus:border-purple-500 sm:text-sm px-3 py-2 border"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600">Phone</label>
                          <input
                            type="tel"
                            required
                            title="Phone number"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="mt-1 block w-full border-gray-200 rounded-md bg-gray-100 focus:ring-purple-500 focus:border-purple-500 sm:text-sm px-3 py-2 border"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-600">Room</label>
                            <input
                              type="text"
                              required
                              value={formData.room}
                              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                              className="mt-1 block w-full border-gray-200 rounded-md bg-gray-100 focus:ring-purple-500 focus:border-purple-500 sm:text-sm px-3 py-2 border"
                              placeholder="A-101"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-600">Status</label>
                            <select
                              title="Student status"
                              value={formData.status}
                              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                              className="mt-1 block w-full border-gray-200 rounded-md bg-gray-100 focus:ring-purple-500 focus:border-purple-500 sm:text-sm px-3 py-2 border"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-600">Course</label>
                            <select
                              title="Course"
                              value={formData.course}
                              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                              className="mt-1 block w-full border-gray-200 rounded-md bg-gray-100 focus:ring-purple-500 focus:border-purple-500 sm:text-sm px-3 py-2 border"
                            >
                              <option value="Computer Science">Computer Science</option>
                              <option value="Engineering">Engineering</option>
                              <option value="Business">Business</option>
                              <option value="Medicine">Medicine</option>
                              <option value="Arts">Arts</option>
                              <option value="Science">Science</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-600">Year</label>
                            <select
                              title="Year"
                              value={formData.year}
                              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                              className="mt-1 block w-full border-gray-200 rounded-md bg-gray-100 focus:ring-purple-500 focus:border-purple-500 sm:text-sm px-3 py-2 border"
                            >
                              <option value="1st Year">1st Year</option>
                              <option value="2nd Year">2nd Year</option>
                              <option value="3rd Year">3rd Year</option>
                              <option value="4th Year">4th Year</option>
                            </select>
                          </div>
                        </div>

                        {/* Emergency Contact Section */}
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Emergency Contact</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-600">Contact Name</label>
                              <input
                                type="text"
                                required
                                value={formData.emergencyContact.name}
                                onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, name: e.target.value } })}
                                className="mt-1 block w-full border-gray-200 rounded-md bg-gray-100 focus:ring-purple-500 focus:border-purple-500 sm:text-sm px-3 py-2 border"
                                placeholder="Guardian name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600">Contact Phone</label>
                              <input
                                type="tel"
                                required
                                value={formData.emergencyContact.phone}
                                onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, phone: e.target.value } })}
                                className="mt-1 block w-full border-gray-200 rounded-md bg-gray-100 focus:ring-purple-500 focus:border-purple-500 sm:text-sm px-3 py-2 border"
                                placeholder="+94 xx xxx xxxx"
                              />
                            </div>
                          </div>
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-600">Relationship</label>
                            <select
                              title="Emergency contact relationship"
                              value={formData.emergencyContact.relationship}
                              onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, relationship: e.target.value } })}
                              className="mt-1 block w-full border-gray-200 rounded-md bg-gray-100 focus:ring-purple-500 focus:border-purple-500 sm:text-sm px-3 py-2 border"
                            >
                              <option value="Parent">Parent</option>
                              <option value="Guardian">Guardian</option>
                              <option value="Sibling">Sibling</option>
                              <option value="Spouse">Spouse</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-500 text-base font-medium text-gray-900 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2 mt-0.5" />
                        {editingStudent ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      editingStudent ? 'Update Student' : 'Add Student'
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-100 text-base font-medium text-gray-600 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* View Student Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-50 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Student Details</h2>
              <button onClick={() => setViewingStudent(null)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4 pb-4 border-b">
                <div className="h-16 w-16 rounded-full bg-purple-500 flex items-center justify-center text-gray-900 text-xl font-bold">
                  {viewingStudent.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{viewingStudent.name}</h3>
                  <p className="text-sm text-gray-500">{viewingStudent.studentId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Email</p>
                  <p className="text-gray-100">{viewingStudent.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Phone</p>
                  <p className="text-gray-100">{viewingStudent.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Room</p>
                  <p className="text-gray-100">{viewingStudent.room}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Status</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${viewingStudent.status === 'Active' ? 'bg-purple-500/20 text-purple-600' : 'bg-red-500/20 text-red-400'}`}>
                    {viewingStudent.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Course</p>
                  <p className="text-gray-100">{viewingStudent.course}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Year</p>
                  <p className="text-gray-100">{viewingStudent.year}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Fees Status</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${viewingStudent.fees === 'Paid' ? 'bg-purple-500/20 text-purple-600' : viewingStudent.fees === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                    {viewingStudent.fees}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Join Date</p>
                  <p className="text-gray-100">{viewingStudent.joinDate ? new Date(viewingStudent.joinDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setViewingStudent(null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-900 text-gray-700 hover:bg-purple-500/5"
                >Close</button>
                <button
                  onClick={() => { handleEditStudent(viewingStudent); setViewingStudent(null); }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-600 flex items-center"
                >
                  <FaEdit className="mr-2" /> Edit Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default StudentManagement;
