import { FaBan, FaEye, FaSpinner } from 'react-icons/fa';
import type { ComplaintItem } from './ComplaintCard';

interface AdminComplaintTableProps {
  complaints: ComplaintItem[];
  loadingId?: string | null;
  onView: (complaint: ComplaintItem) => void;
  onStatusChange: (complaint: ComplaintItem, status: string) => void;
  onReject: (complaint: ComplaintItem) => void;
}

const statusClasses: Record<string, string> = {
  Pending: 'bg-warning/20 border border-warning/30 text-warning',
  'In Progress': 'bg-primary/20 text-primary text-primary',
  Resolved: 'bg-primary/20 border border-primary/20 text-primary',
  Rejected: 'bg-error/20 border border-error/30 text-error',
};

const priorityClasses: Record<string, string> = {
  High: 'bg-error/20 border border-error/30 text-error',
  Medium: 'bg-warning/20 border border-warning/30 text-warning',
  Low: 'bg-secondary/15 text-primary',
};

const AdminComplaintTable = ({ complaints, loadingId, onView, onStatusChange, onReject }: AdminComplaintTableProps) => {
  if (!complaints.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
        <h3 className="text-base font-semibold text-foreground/90">No complaints found</h3>
        <p className="mt-2 text-sm text-muted-foreground">Try adjusting filters to find complaints.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Student</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {complaints.map((complaint) => (
              <tr key={complaint._id} className="hover:bg-muted/80">
                <td className="px-4 py-4 align-top">
                  <p className="max-w-xs truncate text-sm font-semibold text-foreground">{complaint.title}</p>
                  <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">{complaint.description}</p>
                </td>
                <td className="px-4 py-4 text-sm text-foreground/90">{complaint.student}</td>
                <td className="px-4 py-4 text-sm text-foreground/90">{complaint.category}</td>
                <td className="px-4 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClasses[complaint.priority] || 'bg-muted text-foreground/90'}`}>
                    {complaint.priority}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[complaint.status] || 'bg-muted text-foreground/90'}`}>
                      {complaint.status}
                    </span>
                    <select
                      value={complaint.status}
                      onChange={(e) => onStatusChange(complaint, e.target.value)}
                      disabled={complaint.status === 'Rejected'}
                      className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs text-foreground/90 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-foreground/90">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(complaint)}
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-foreground/90 hover:bg-muted"
                    >
                      <FaEye /> View
                    </button>
                    <button
                      onClick={() => onReject(complaint)}
                      disabled={loadingId === complaint._id || complaint.status === 'Rejected'}
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-red-200 px-3 text-xs font-semibold text-error hover:bg-error/10 border border-error/20 disabled:opacity-60"
                    >
                      {loadingId === complaint._id ? <FaSpinner className="animate-spin" /> : <FaBan />}
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminComplaintTable;
