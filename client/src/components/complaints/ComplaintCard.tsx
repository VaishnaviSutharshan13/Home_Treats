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
  Pending: 'bg-warning/20 border border-warning/30 text-warning',
  'In Progress': 'bg-primary/20 text-primary text-primary',
  Resolved: 'bg-primary/20 border border-primary/20 text-primary',
  Rejected: 'bg-error/20 border border-error/30 text-error',
};

const badgeByPriority: Record<string, string> = {
  High: 'bg-error/20 border border-error/30 text-error',
  Medium: 'bg-warning/20 border border-warning/30 text-warning',
  Low: 'bg-secondary/15 text-primary',
};

const canStudentEdit = (complaintStatus: string) => complaintStatus === 'Pending';

const ComplaintCard = ({ complaint, expanded, onToggleComments, onEdit, onDelete }: ComplaintCardProps) => {
  const statusClass = badgeByStatus[complaint.status] || 'bg-muted text-foreground/90';
  const priorityClass = badgeByPriority[complaint.priority] || 'bg-muted text-foreground/90';

  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md hover:border-primary/40">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-foreground">
            <FaExclamationTriangle className="text-amber-500" />
            <span className="truncate">{complaint.title}</span>
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{complaint.description}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass}`}>{complaint.priority}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>{complaint.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-border mt-4 pt-4 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</p>
          <p className="mt-1 text-foreground/90">{complaint.category}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Submitted</p>
          <p className="mt-1 text-foreground/90">{new Date(complaint.createdAt).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Assigned To</p>
          <p className="mt-1 text-foreground/90">{complaint.assignedTo || 'Not assigned'}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">ETA</p>
          <p className="mt-1 text-foreground/90">
            {complaint.estimatedResolution ? new Date(complaint.estimatedResolution).toLocaleDateString() : '-'}
          </p>
        </div>
        {complaint.rejectionReason && (
          <div className="col-span-2 rounded-xl bg-error/10 border border-error/20 p-3 text-sm text-error">{complaint.rejectionReason}</div>
        )}
      </div>

      <div className="mt-4 border-t border-border pt-4">
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
                <div key={`${complaint._id}-${index}`} className="rounded-xl bg-muted p-3">
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground/90">{comment.author}</span>
                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-foreground/90">{comment.text}</p>
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">No comments yet.</div>
            )}
          </div>
        )}
      </div>

      {(onEdit || onDelete) && (
        <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
          {onEdit && (
            <button
              onClick={() => onEdit(complaint)}
              disabled={!canStudentEdit(complaint.status)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border hover:border-primary/40 px-4 text-sm font-semibold text-foreground/90 transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaEdit className="text-xs" />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(complaint._id)}
              disabled={!canStudentEdit(complaint.status)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-error/20 px-4 text-sm font-semibold text-error transition hover:bg-error/10 hover:border-error/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaTrash className="text-xs" />
              Delete
            </button>
          )}
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
            <FaClock />
            Last update {new Date(complaint.createdAt).toLocaleDateString()}
          </span>
        </div>
      )}
    </article>
  );
};

export default ComplaintCard;
