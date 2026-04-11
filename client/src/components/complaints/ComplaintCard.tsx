import { FaClock, FaComment, FaEdit, FaExclamationTriangle, FaTrash } from 'react-icons/fa';

export interface ComplaintComment {
  text: string;
  author: string;
  createdAt: string;
}

export interface ComplaintItem {
  _id: string;
  title: string;
  description: string;
  student: string;
  room: string;
  category: string;
  priority: string;
  status: string;
  assignedTo?: string;
  estimatedResolution?: string;
  resolvedDate?: string;
  resolutionNotes?: string;
  rejectionReason?: string;
  comments?: ComplaintComment[];
  createdAt: string;
}

interface ComplaintCardProps {
  complaint: ComplaintItem;
  expanded: boolean;
  onToggleComments: (id: string) => void;
  onEdit?: (complaint: ComplaintItem) => void;
  onDelete?: (id: string) => void;
}

const badgeByStatus: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Resolved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-700',
};

const badgeByPriority: Record<string, string> = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-orange-100 text-orange-700',
  Low: 'bg-secondary/15 text-primary',
};

const canStudentEdit = (complaintStatus: string) => complaintStatus === 'Pending';

const ComplaintCard = ({ complaint, expanded, onToggleComments, onEdit, onDelete }: ComplaintCardProps) => {
  const statusClass = badgeByStatus[complaint.status] || 'bg-gray-100 text-gray-700';
  const priorityClass = badgeByPriority[complaint.priority] || 'bg-gray-100 text-gray-700';

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-gray-900">
            <FaExclamationTriangle className="text-amber-500" />
            <span className="truncate">{complaint.title}</span>
          </h3>
          <p className="text-sm leading-relaxed text-gray-600">{complaint.description}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass}`}>{complaint.priority}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>{complaint.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Category</p>
          <p className="mt-1 text-gray-800">{complaint.category}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Submitted</p>
          <p className="mt-1 text-gray-800">{new Date(complaint.createdAt).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Assigned To</p>
          <p className="mt-1 text-gray-800">{complaint.assignedTo || 'Not assigned'}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">ETA</p>
          <p className="mt-1 text-gray-800">
            {complaint.estimatedResolution ? new Date(complaint.estimatedResolution).toLocaleDateString() : '-'}
          </p>
        </div>
        {complaint.rejectionReason && (
          <div className="col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{complaint.rejectionReason}</div>
        )}
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        <button
          onClick={() => onToggleComments(complaint._id)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary"
        >
          <FaComment className="text-xs" />
          {expanded ? 'Hide comments' : 'Show comments'} ({complaint.comments?.length || 0})
        </button>

        {expanded && (
          <div className="mt-3 space-y-2">
            {complaint.comments && complaint.comments.length > 0 ? (
              complaint.comments.map((comment, index) => (
                <div key={`${complaint._id}-${index}`} className="rounded-xl bg-gray-50 p-3">
                  <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">{comment.author}</span>
                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-500">No comments yet.</div>
            )}
          </div>
        )}
      </div>

      {(onEdit || onDelete) && (
        <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4">
          {onEdit && (
            <button
              onClick={() => onEdit(complaint)}
              disabled={!canStudentEdit(complaint.status)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaEdit className="text-xs" />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(complaint._id)}
              disabled={!canStudentEdit(complaint.status)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaTrash className="text-xs" />
              Delete
            </button>
          )}
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400">
            <FaClock />
            Last update {new Date(complaint.createdAt).toLocaleDateString()}
          </span>
        </div>
      )}
    </article>
  );
};

export default ComplaintCard;
