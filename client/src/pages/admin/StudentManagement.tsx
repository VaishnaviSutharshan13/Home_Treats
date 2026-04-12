import { useEffect, useMemo, useState } from "react";
import {
  FaCheck,
  FaCheckCircle,
  FaChevronLeft,
  FaEdit,
  FaEye,
  FaPlus,
  FaSearch,
  FaSpinner,
  FaSync,
  FaTimes,
  FaTrash,
  FaUserClock,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import { roomService, studentService } from "../../services";

type StudentStatus = "Pending" | "Approved" | "Rejected" | "Inactive";

interface StudentRow {
  _id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  university: string;
  gender: "Male" | "Female" | "Other";
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
  gender: "Male" | "Female" | "Other";
  address: string;
  emergencyContact: string;
  password: string;
  confirmPassword: string;
  roomNumber: string;
  course: string;
  status: StudentStatus;
}

type StudentFormErrors = Partial<
  Record<
    | "studentId"
    | "email"
    | "phone"
    | "password"
    | "confirmPassword"
    | "emergencyContact",
    string
  >
>;

const emptyForm: StudentForm = {
  name: "",
  studentId: "",
  university: "",
  email: "",
  phone: "",
  gender: "Male",
  address: "",
  emergencyContact: "",
  password: "",
  confirmPassword: "",
  roomNumber: "",
  course: "Computer Science",
  status: "Pending",
};

const TEN_DIGIT_REGEX = /^\d{10}$/;
const STUDENT_ID_REGEX = /^[A-Z]{2}\d{8}$/;
const sanitizePhone = (value: string) => value.replace(/\D/g, "").slice(0, 10);
const isEmailFormatValid = (value: string) => /^\S+@\S+\.\S+$/.test(value);
const isStrongPassword = (value: string) => value.length >= 6;
const normalizeStudentId = (value: string) => value.trim().toUpperCase();

const statusBadgeClass: Record<StudentStatus, string> = {
  Pending: "bg-warning/20 border border-warning/30 text-warning",
  Approved: "bg-primary/20 border border-primary/20 text-primary",
  Rejected: "bg-error/20 border border-error/30 text-error",
  Inactive: "bg-muted/60 border border-border text-muted-foreground",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response
      ?.data?.message === "string"
  ) {
    return (
      (error as { response?: { data?: { message?: string } } }).response?.data
        ?.message || fallback
    );
  }
  return fallback;
};

const StudentManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<StudentRow | null>(null);
  const [viewing, setViewing] = useState<StudentRow | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<StudentFormErrors>({});
  const [roomOptions, setRoomOptions] = useState<string[]>([]);

  const canToggleActivity =
    !editing || editing.status === "Approved" || editing.status === "Inactive";

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentService.getAll({
        search,
        status: statusFilter !== "All" ? statusFilter : undefined,
      });
      if (res.success) setStudents(res.data);
    } catch {
      showToast("Failed to fetch students", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await roomService.getAll();
        const rooms: Array<{ roomNumber?: string }> = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        const options: string[] = Array.from(
          new Set(
            rooms
              .map((room) => String(room.roomNumber || "").trim())
              .filter(Boolean),
          ),
        ).sort((left, right) => left.localeCompare(right));
        setRoomOptions(options);
      } catch {
        setRoomOptions([]);
      }
    };

    loadRooms();
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchStudents, 300);
    return () => clearTimeout(t);
  }, [search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: students.length,
      pending: students.filter((s) => s.status === "Pending").length,
      approved: students.filter((s) => s.status === "Approved").length,
      rejected: students.filter((s) => s.status === "Rejected").length,
      inactive: students.filter((s) => s.status === "Inactive").length,
    };
  }, [students]);

  const openAddModal = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (student: StudentRow) => {
    setEditing(student);
    setForm({
      ...emptyForm,
      name: student.name,
      studentId: normalizeStudentId(student.studentId),
      university: student.university || "",
      email: student.email,
      phone: sanitizePhone(student.phone || ""),
      gender: student.gender || "Male",
      address: student.address || "",
      emergencyContact: sanitizePhone(student.emergencyContact || ""),
      roomNumber: student.roomNumber || "",
      status: student.status,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
  };

  const validateForm = () => {
    if (editing) {
      setFormErrors({});
      return true;
    }
    const errors: StudentFormErrors = {};
    if (!STUDENT_ID_REGEX.test(normalizeStudentId(form.studentId))) {
      errors.studentId = "Student ID must start with 2 letters followed by 8 digits";
    }
    if (!isEmailFormatValid(form.email)) errors.email = "Invalid email";
    if (!TEN_DIGIT_REGEX.test(form.phone))
      errors.phone = "Phone must be 10 digits";
    if (!TEN_DIGIT_REGEX.test(form.emergencyContact))
      errors.emergencyContact = "Emergency must be 10 digits";
    if (!isStrongPassword(form.password)) {
      errors.password = "Password must be at least 6 characters";
    }
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
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
        showToast("Updated successfully", "success");
      } else {
        await studentService.create({
          ...form,
          studentId: normalizeStudentId(form.studentId),
          email: form.email.trim().toLowerCase(),
          phone: sanitizePhone(form.phone),
          emergencyContact: sanitizePhone(form.emergencyContact),
        });
        showToast("Created successfully", "success");
      }
      closeModal();
      fetchStudents();
    } catch (error: unknown) {
      showToast(getErrorMessage(error, "Operation failed"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteStudent = async (student: StudentRow) => {
    if (!window.confirm(`Delete ${student.name}?`)) return;
    try {
      await studentService.delete(student._id);
      showToast("Deleted successfully", "success");
      fetchStudents();
    } catch (error: unknown) {
      showToast(getErrorMessage(error, "Delete failed"), "error");
    }
  };

  const handleApprove = async (student: StudentRow) => {
    try {
      const response = await studentService.approve(student._id);
      if (response.success) {
        showToast("Student approved successfully", "success");
        fetchStudents();
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to approve student");
      showToast(message, "error");
    }
  };

  const handleReject = async (student: StudentRow) => {
    try {
      const response = await studentService.reject(student._id);
      if (response.success) {
        showToast("Student rejected successfully", "success");
        fetchStudents();
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to reject student");
      showToast(message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        userRole="admin"
      />

      <div className="lg:ml-64 p-6 space-y-5">
        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 px-4 py-2 rounded-lg text-sm font-medium ${
              toast.type === "success"
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-error/15 text-error border border-error/30"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link
                to="/admin/dashboard"
                className="text-sm text-muted-foreground flex items-center gap-1"
              >
                <FaChevronLeft /> Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-foreground mt-1">
                Student Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Approve or reject new registrations, then manage active/inactive
                student lifecycle.
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="bg-linear-to-r from-primary to-primary-hover text-primary-foreground transform hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-300 px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <FaPlus /> Add Student
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
            <div className="rounded-xl border border-border bg-surface-active px-4 py-3">
              <p className="text-xs text-muted-foreground">Total Students</p>
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
              <p className="text-xs text-warning">Pending</p>
              <p className="text-xl font-bold text-warning">{stats.pending}</p>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3">
              <p className="text-xs text-primary">Approved</p>
              <p className="text-xl font-bold text-primary">{stats.approved}</p>
            </div>
            <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3">
              <p className="text-xs text-error">Rejected</p>
              <p className="text-xl font-bold text-error">{stats.rejected}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
              <p className="text-xs text-muted-foreground">Inactive</p>
              <p className="text-xl font-bold text-muted-foreground">
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
              <input
                placeholder="Search name, email, student ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl pl-9 pr-3 py-2.5 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 rounded-xl px-3 py-2.5 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
              >
                <option>All</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
                <option>Inactive</option>
              </select>
              <button
                type="button"
                onClick={fetchStudents}
                title="Refresh"
                className="px-3 rounded-xl border border-border bg-muted/30 text-foreground hover:bg-muted transition-colors"
              >
                <FaSync />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-card border border-border rounded-2xl flex items-center justify-center py-12 gap-3 text-muted-foreground">
            <FaSpinner className="animate-spin" /> Loading students...
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {students.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <FaUserClock className="mx-auto text-2xl mb-2" />
                No students found with current filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-230">
                  <thead className="bg-surface-active border-b border-border">
                    <tr>
                      <th className="p-3 text-left text-xs uppercase text-muted-foreground">
                        Student
                      </th>
                      <th className="p-3 text-left text-xs uppercase text-muted-foreground">
                        Contact
                      </th>
                      <th className="p-3 text-left text-xs uppercase text-muted-foreground">
                        Status
                      </th>
                      <th className="p-3 text-left text-xs uppercase text-muted-foreground">
                        Room
                      </th>
                      <th className="p-3 text-left text-xs uppercase text-muted-foreground">
                        Fees
                      </th>
                      <th className="p-3 text-left text-xs uppercase text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr
                        key={s._id}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-3">
                          <p className="font-semibold text-foreground">
                            {s.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s.studentId}
                          </p>
                        </td>
                        <td className="p-3">
                          <p className="text-sm text-foreground">{s.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.phone || "-"}
                          </p>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadgeClass[s.status]}`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-foreground">
                          {s.roomNumber || "-"}
                        </td>
                        <td className="p-3 text-sm text-foreground">
                          {s.fees || "-"}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {s.status === "Pending" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApprove(s)}
                                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-primary/20 bg-primary/10 text-primary"
                                  title="Approve"
                                >
                                  <FaCheck /> Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReject(s)}
                                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-error/20 bg-error/10 text-error"
                                  title="Reject"
                                >
                                  <FaTimes /> Reject
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => setViewing(s)}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-border bg-muted/40 text-foreground"
                              title="View Profile"
                            >
                              <FaEye /> View
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(s)}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-warning/20 bg-warning/10 text-warning"
                              title="Edit"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteStudent(s)}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-error/20 bg-error/10 text-error"
                              title="Delete"
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
            <form
              onSubmit={submit}
              className="bg-card p-6 rounded-2xl border border-border space-y-3 w-full max-w-lg"
            >
              <h2 className="text-lg font-bold">
                {editing ? "Edit" : "Add"} Student
              </h2>

              {!editing ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      placeholder="Full Name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                      className="w-full rounded-xl px-3 py-2.5 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                    />
                    <input
                      placeholder="Student ID"
                      value={form.studentId}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          studentId: e.target.value.toUpperCase(),
                        })
                      }
                      required
                      pattern="[A-Za-z]{2}[0-9]{8}"
                      title="Student ID must start with 2 letters followed by 8 digits"
                      className="w-full rounded-xl px-3 py-2.5 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                    />
                  </div>

                  {formErrors.studentId && (
                    <p className="text-error text-xs mt-1">
                      {formErrors.studentId}
                    </p>
                  )}

                  <input
                    placeholder="University / College"
                    value={form.university}
                    onChange={(e) =>
                      setForm({ ...form, university: e.target.value })
                    }
                    required
                    className="w-full rounded-xl px-3 py-2.5 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                  />

                  <div>
                    <input
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                      className="w-full rounded-xl px-3 py-2.5 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                    />
                    {formErrors.email && (
                      <p className="text-error text-xs mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        placeholder="Phone (10 digits)"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            phone: sanitizePhone(e.target.value),
                          })
                        }
                        required
                        className="w-full rounded-xl px-3 py-2.5 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                      />
                      {formErrors.phone && (
                        <p className="text-error text-xs mt-1">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        placeholder="Emergency Contact"
                        value={form.emergencyContact}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            emergencyContact: sanitizePhone(e.target.value),
                          })
                        }
                        required
                        className="w-full rounded-xl px-3 py-2.5 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                      />
                      {formErrors.emergencyContact && (
                        <p className="text-error text-xs mt-1">
                          {formErrors.emergencyContact}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
                        required
                        className="w-full rounded-xl px-3 py-2.5 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                      />
                      {formErrors.password && (
                        <p className="text-error text-xs mt-1">
                          {formErrors.password}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        value={form.confirmPassword}
                        onChange={(e) =>
                          setForm({ ...form, confirmPassword: e.target.value })
                        }
                        required
                        className="w-full rounded-xl px-3 py-2.5 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                      />
                      {formErrors.confirmPassword && (
                        <p className="text-error text-xs mt-1">
                          {formErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={form.gender}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          gender: e.target.value as StudentForm["gender"],
                        })
                      }
                      className="w-full rounded-xl px-3 py-2.5 bg-muted/30 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      placeholder="Course"
                      value={form.course}
                      onChange={(e) =>
                        setForm({ ...form, course: e.target.value })
                      }
                      className="w-full rounded-xl px-3 py-2.5 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                    />
                  </div>

                  <input
                    placeholder="Address"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    required
                    className="w-full rounded-xl px-3 py-2.5 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                  />

                </>
              ) : (
                <>
                  <div className="rounded-xl bg-muted/30 border border-border p-3">
                    <p className="font-semibold text-foreground">
                      {editing.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {editing.studentId} • {editing.email}
                    </p>
                  </div>

                  <div>
                    <select
                      value={form.roomNumber}
                      onChange={(e) =>
                        setForm({ ...form, roomNumber: e.target.value })
                      }
                      className="w-full rounded-xl px-3 py-2.5 bg-muted/30 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                    >
                      <option value="">Select Room</option>
                      {roomOptions.map((roomNumber: string) => (
                        <option key={roomNumber} value={roomNumber}>
                          Room {roomNumber}
                        </option>
                      ))}
                    </select>
                    {!roomOptions.length && (
                      <p className="text-xs text-muted-foreground mt-1">
                        No rooms available right now.
                      </p>
                    )}
                  </div>
                </>
              )}

              {editing ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Account Status
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, status: "Approved" })}
                      disabled={!canToggleActivity}
                      className={`rounded-xl px-3 py-2.5 border transition-colors ${
                        form.status === "Approved"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/30 border-border text-foreground hover:border-primary/30"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, status: "Inactive" })}
                      disabled={!canToggleActivity}
                      className={`rounded-xl px-3 py-2.5 border transition-colors ${
                        form.status === "Inactive"
                          ? "bg-error text-white border-error"
                          : "bg-muted/30 border-border text-foreground hover:border-error/30"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Inactive
                    </button>
                  </div>
                  {!canToggleActivity && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Pending/Rejected students can be approved or rejected from the
                      action buttons in this page.
                    </p>
                  )}
                </div>
              ) : (
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as StudentStatus })
                  }
                  className="w-full rounded-xl px-3 py-2.5 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30 appearance-none"
                >
                  <option>Pending</option>
                </select>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-muted hover:bg-muted/70 text-foreground transition-colors px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-linear-to-r from-primary to-primary-hover text-primary-foreground transform hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-300 px-4 py-2 rounded-lg"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}

        {viewing && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={() => setViewing(null)}
          >
            <div
              className="bg-card rounded-2xl border border-border p-6 max-w-2xl w-full space-y-5 text-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {viewing.name}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {viewing.studentId} • Student Profile
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${statusBadgeClass[viewing.status]}`}
                >
                  <FaCheckCircle className="text-current" />
                  {viewing.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-surface-active px-3 py-2.5">
                  <p className="text-xs text-muted-foreground">Booking</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {viewing.bookingStatus || "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-surface-active px-3 py-2.5">
                  <p className="text-xs text-muted-foreground">Fees</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {viewing.fees || "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-surface-active px-3 py-2.5">
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {new Date(viewing.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border p-4 space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Personal
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {viewing.email}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Phone:</span>{" "}
                    {viewing.phone || "-"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Gender:</span>{" "}
                    {viewing.gender || "-"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">University:</span>{" "}
                    {viewing.university || "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-border p-4 space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Accommodation
                  </p>
                  <p>
                    <span className="text-muted-foreground">Room:</span>{" "}
                    {viewing.roomNumber || "-"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Floor:</span>{" "}
                    {viewing.floor || "-"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      Emergency Contact:
                    </span>{" "}
                    {viewing.emergencyContact || "-"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Address
                </p>
                <p className="text-foreground">{viewing.address || "-"}</p>
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setViewing(null);
                    openEditModal(viewing);
                  }}
                  className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20"
                >
                  Edit Student
                </button>
                <button
                  type="button"
                  onClick={() => setViewing(null)}
                  className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/70 text-foreground"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;
