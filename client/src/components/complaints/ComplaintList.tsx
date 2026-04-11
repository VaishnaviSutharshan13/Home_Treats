import ComplaintCard from './ComplaintCard';
import type { ComplaintItem } from './ComplaintCard';

interface ComplaintListProps {
  complaints: ComplaintItem[];
  expandedIds: string[];
  onToggleComments: (id: string) => void;
  onEdit?: (complaint: ComplaintItem) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
  onCreateClick?: () => void;
}

const ComplaintList = ({
  complaints,
  expandedIds,
  onToggleComments,
  onEdit,
  onDelete,
  emptyMessage = 'No complaints found',
  onCreateClick,
}: ComplaintListProps) => {
  if (!complaints.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-sm">
        <p className="text-base font-semibold text-foreground/90">{emptyMessage}</p>
        <p className="mt-1 text-sm text-muted-foreground">Try changing your filters or submit a new complaint.</p>
        {onCreateClick && (
          <button
            onClick={onCreateClick}
            className="mt-4 inline-flex h-11 items-center rounded-xl bg-gradient-to-r from-primary to-accent px-5 text-sm font-semibold text-white shadow-sm transition hover:from-primary-hover hover:to-accent"
          >
            Create Complaint
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {complaints.map((complaint) => (
        <ComplaintCard
          key={complaint._id}
          complaint={complaint}
          expanded={expandedIds.includes(complaint._id)}
          onToggleComments={onToggleComments}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ComplaintList;
