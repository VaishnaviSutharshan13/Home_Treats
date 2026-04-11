import { useState } from 'react';
import { FaBullhorn, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { notificationService } from '../../services';

type NotificationType = 'announcement' | 'fee' | 'complaint' | 'room' | 'student';
type NotificationSource = 'Student Management' | 'Fees Management' | 'Complaint Management' | 'Room Management' | 'General Announcement';
type Priority = 'normal' | 'important' | 'urgent' | 'success';

interface AdminNotificationComposerProps {
  source: NotificationSource;
  defaultType?: NotificationType;
  buttonLabel?: string;
  onSent?: () => void;
}

const AdminNotificationComposer: React.FC<AdminNotificationComposerProps> = ({
  source,
  defaultType = 'announcement',
  buttonLabel = 'Send Notification',
  onSent,
}) => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>(defaultType);
  const [priority, setPriority] = useState<Priority>('normal');
  const [recipientType, setRecipientType] = useState<'all_students' | 'selected_students'>('all_students');
  const [studentIdsText, setStudentIdsText] = useState('');

  const reset = () => {
    setTitle('');
    setMessage('');
    setType(defaultType);
    setPriority('normal');
    setRecipientType('all_students');
    setStudentIdsText('');
    setError('');
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const recipientStudentIds = studentIdsText
      .split(',')
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean);

    if (recipientType === 'selected_students' && recipientStudentIds.length === 0) {
      setError('Enter at least one Student ID for selected recipients.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await notificationService.sendAdminNotification({
        title,
        message,
        type,
        source,
        priority,
        recipientType,
        recipientStudentIds: recipientType === 'selected_students' ? recipientStudentIds : undefined,
      });

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to send notification');
      }

      setSuccess(response.message || 'Notification sent successfully');
      onSent?.();
      setTimeout(() => {
        close();
      }, 700);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to send notification');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-foreground bg-card hover:bg-muted font-semibold text-sm transition-colors shadow-sm"
      >
        <FaBullhorn className="w-3.5 h-3.5" />
        {buttonLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/40" onClick={close} />
          <div className="relative w-full max-w-xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
              <h3 className="text-base font-bold text-foreground">Send Announcement / Notification</h3>
              <button
                type="button"
                title="Close"
                aria-label="Close"
                onClick={close}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Source Module</label>
                  <input
                    value={source}
                    disabled
                    title="Source Module"
                    aria-label="Source Module"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as NotificationType)}
                    title="Notification type"
                    aria-label="Notification type"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors appearance-none"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="student">Student</option>
                    <option value="fee">Fee</option>
                    <option value="complaint">Complaint</option>
                    <option value="room">Room</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    title="Notification priority"
                    aria-label="Notification priority"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors appearance-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                    <option value="success">Success</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Recipients</label>
                  <select
                    value={recipientType}
                    onChange={(e) => setRecipientType(e.target.value as 'all_students' | 'selected_students')}
                    title="Notification recipients"
                    aria-label="Notification recipients"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors appearance-none"
                  >
                    <option value="all_students">All Students</option>
                    <option value="selected_students">Selected Students</option>
                  </select>
                </div>
              </div>

              {recipientType === 'selected_students' && (
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Student IDs (comma separated)</label>
                  <input
                    value={studentIdsText}
                    onChange={(e) => setStudentIdsText(e.target.value)}
                    placeholder="e.g. STU001, STU014, STU020"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground placeholder-subtle outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground placeholder-subtle outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Enter notification title"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground placeholder-subtle outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-y"
                  placeholder="Enter detailed message"
                />
              </div>

              {error && <p className="text-sm text-error">{error}</p>}
              {success && <p className="text-sm text-primary">{success}</p>}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={close}
                  className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/70 text-foreground transition-colors font-medium border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover transform hover:scale-[1.02] shadow-md text-white font-bold transition-all disabled:opacity-60"
                >
                  <FaPaperPlane className="w-3.5 h-3.5" />
                  {submitting ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminNotificationComposer;
