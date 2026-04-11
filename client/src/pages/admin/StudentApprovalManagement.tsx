import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaCheck, FaEye, FaTimes } from 'react-icons/fa';
import Sidebar from '../../components/layout/Sidebar';
import { studentService } from '../../services';

type StudentApproval = {
  _id: string;
  name: string;
  studentId: string;
  email: string;
  course: string;
  year: string;
  phone?: string;
  gender?: string;
  address?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
};

const StudentApprovalManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [students, setStudents] = useState<StudentApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<StudentApproval | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const response = await studentService.getApprovals();
      if (response.success) setStudents(response.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleApprove = async (id: string) => {
    const response = await studentService.approve(id);
    if (response.success) {
      setMessage('Student Approved Successfully. Student can now login to the hostel portal');
      loadApprovals();
    }
  };

  const handleReject = async (id: string) => {
    const response = await studentService.reject(id);
    if (response.success) {
      setMessage('Student rejected successfully.');
      loadApprovals();
    }
  };

  const badgeClass = (status: StudentApproval['status']) => {
    if (status === 'Pending') return 'bg-warning/20 border border-warning/30 text-warning';
    if (status === 'Approved') return 'bg-primary/20 border border-primary/20 text-primary';
    return 'bg-error/20 border border-error/30 text-error';
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} userRole="admin" />

      <div className="lg:ml-64">
        <div className="bg-navbar shadow-sm border-b border-border px-6 py-4 sticky top-0 z-10 w-full bg-navbar/95 backdrop-blur flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-1 rounded hover:bg-muted">
                <FaBars className="w-4 h-4" />
              </button>
              <Link to="/admin/dashboard" className="hover:text-primary">Dashboard</Link>
              <span>/</span>
              <span className="text-foreground/90">Student Approval Management</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">Student Approval Management</h1>
          </div>
        </div>

        <div className="p-6">
          {message && <div className="mb-4 text-sm bg-surface-active border border-primary/25 text-primary rounded-lg px-3 py-2">{message}</div>}

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-6 text-muted-foreground">Loading student approvals...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-surface-active text-foreground/90 text-xs uppercase border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3">Student Name</th>
                      <th className="text-left px-4 py-3">Student ID</th>
                      <th className="text-left px-4 py-3">Email</th>
                      <th className="text-left px-4 py-3">Department</th>
                      <th className="text-left px-4 py-3">Year</th>
                      <th className="text-left px-4 py-3">Registration Date</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {students.map((student) => (
                      <tr key={student._id} className="text-sm">
                        <td className="px-4 py-3 text-foreground">{student.name}</td>
                        <td className="px-4 py-3 text-foreground/90">{student.studentId}</td>
                        <td className="px-4 py-3 text-foreground/90">{student.email}</td>
                        <td className="px-4 py-3 text-foreground/90">{student.course}</td>
                        <td className="px-4 py-3 text-foreground/90">{student.year}</td>
                        <td className="px-4 py-3 text-foreground/90">{new Date(student.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass(student.status)}`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(student._id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-primary/10 border border-primary/200 text-white hover:bg-primary/10 border border-primary/200"
                              disabled={student.status === 'Approved'}
                            >
                              <FaCheck className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(student._id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-error/10 border border-error/200 text-white hover:bg-error/10 border border-error/200"
                              disabled={student.status === 'Rejected'}
                            >
                              <FaTimes className="w-3 h-3" /> Reject
                            </button>
                            <button
                              onClick={() => setViewing(student)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-primary/30 text-primary hover:bg-surface-active"
                            >
                              <FaEye className="w-3 h-3" /> View
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
        </div>
      </div>

      {viewing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card rounded-xl border border-primary/15 shadow-2xl">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Student Details</h2>
              <button onClick={() => setViewing(null)} className="text-muted-foreground hover:text-foreground/90">✕</button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3 text-sm">
              <Detail label="Name" value={viewing.name} />
              <Detail label="Student ID" value={viewing.studentId} />
              <Detail label="Email" value={viewing.email} />
              <Detail label="Phone" value={viewing.phone || '-'} />
              <Detail label="Gender" value={viewing.gender || '-'} />
              <Detail label="Department" value={viewing.course} />
              <Detail label="Year" value={viewing.year} />
              <Detail label="Status" value={viewing.status} />
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Address</p>
                <p className="text-foreground/90">{viewing.address || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="text-foreground/90">{value}</p>
  </div>
);

export default StudentApprovalManagement;
