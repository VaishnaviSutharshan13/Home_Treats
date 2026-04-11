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
  Pending: 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Resolved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-700',
};

const priorityClasses: Record<string, string> = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-orange-100 text-orange-700',
  Low: 'bg-secondary/15 text-primary',
};

const AdminComplaintTable = ({ complaints, loadingId, onView, onStatusChange, onReject }: AdminComplaintTableProps) => {
  if (!complaints.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
        <h3 className="text-base font-semibold text-gray-800">No complaints found</h3>
        <p className="mt-2 text-sm text-gray-500">Try adjusting filters to find complaints.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Student</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Created</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {complaints.map((complaint) => (
              <tr key={complaint._id} className="hover:bg-gray-50/80">
                <td className="px-4 py-4 align-top">
                  <p className="max-w-xs truncate text-sm font-semibold text-gray-900">{complaint.title}</p>
                  <p className="mt-1 max-w-xs truncate text-xs text-gray-500">{complaint.description}</p>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">{complaint.student}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{complaint.category}</td>
                <td className="px-4 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClasses[complaint.priority] || 'bg-gray-100 text-gray-700'}`}>
                    {complaint.priority}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[complaint.status] || 'bg-gray-100 text-gray-700'}`}>
                      {complaint.status}
                    </span>
                    <select
                      value={complaint.status}
                      onChange={(e) => onStatusChange(complaint, e.target.value)}
                      disabled={complaint.status === 'Rejected'}
                      className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(complaint)}
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      <FaEye /> View
                    </button>
                    <button
                      onClick={() => onReject(complaint)}
                      disabled={loadingId === complaint._id || complaint.status === 'Rejected'}
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
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
