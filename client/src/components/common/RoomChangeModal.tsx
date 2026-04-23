import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import { roomRequestService } from '../../services';

interface RoomOption {
  roomNumber: string;
}

interface RoomChangeModalProps {
  isOpen: boolean;
  currentRoomNumber: string;
  availableRooms: RoomOption[];
  onClose: () => void;
  onSubmitted: (message: string) => void;
}

type ToastType = 'success' | 'error';

interface ToastMessage {
  id: number;
  type: ToastType;
  text: string;
}

const RoomChangeModal: React.FC<RoomChangeModalProps> = ({
  isOpen,
  currentRoomNumber,
  availableRooms,
  onClose,
  onSubmitted,
}) => {
  const [mounted, setMounted] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const filteredRooms = useMemo(
    () => availableRooms.filter((room) => room.roomNumber !== currentRoomNumber),
    [availableRooms, currentRoomNumber]
  );

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setMounted(false);
        setNewRoomNumber('');
        setReason('');
      }, 180);
      return () => clearTimeout(timer);
    }

    setMounted(true);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  const showToast = (text: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3000);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newRoomNumber) {
      showToast('Please select a new room.', 'error');
      return;
    }

    if (newRoomNumber === currentRoomNumber) {
      showToast('New room cannot be the same as current room.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const response = await roomRequestService.createRoomChangeRequest({
        newRoomNumber,
        reason: reason.trim(),
      });

      if (response?.success) {
        const successMessage =
          response?.message || 'Room change request submitted successfully. Waiting for admin approval.';
        showToast(successMessage, 'success');
        onSubmitted(successMessage);
        onClose();
        return;
      }

      showToast(response?.message || 'Failed to submit room change request.', 'error');
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to submit room change request.';

      showToast(message || 'Failed to submit room change request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className={`absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <div className="fixed top-5 right-4 z-[130] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium shadow-lg ${
              toast.type === 'success'
                ? 'border-success/30 bg-success/10 text-success'
                : 'border-error/30 bg-error/10 text-error'
            }`}
          >
            {toast.type === 'success' ? <FaCheckCircle className="w-4 h-4" /> : <FaExclamationCircle className="w-4 h-4" />}
            {toast.text}
          </div>
        ))}
      </div>

      <div
        className={`relative w-full max-w-lg transform overflow-hidden rounded-2xl border border-primary/30 bg-card/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all duration-200 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl border border-primary/15 shadow-[0_0_0_1px_rgba(59,130,246,0.12),0_0_40px_rgba(59,130,246,0.12)]" />

        <div className="relative mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Room Change Request</h2>
            <p className="mt-1 text-sm text-muted-foreground">Submit a request to move to another available room.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary/40 hover:bg-surface-hover hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <FaTimes className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Current Room Number</label>
            <input
              value={currentRoomNumber || 'Not assigned'}
              readOnly
              className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">New Room Number</label>
            <select
              value={newRoomNumber}
              onChange={(event) => setNewRoomNumber(event.target.value)}
              className="w-full rounded-xl border border-border bg-muted/25 px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/25"
              disabled={submitting}
            >
              <option value="">Select available room</option>
              {filteredRooms.map((room) => (
                <option key={room.roomNumber} value={room.roomNumber}>
                  {room.roomNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Reason (Optional)</label>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Why do you need to change room?"
              rows={4}
              disabled={submitting}
              className="w-full resize-none rounded-xl border border-border bg-muted/25 px-4 py-2.5 text-sm text-foreground placeholder-subtle outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/25"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-surface-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomChangeModal;
