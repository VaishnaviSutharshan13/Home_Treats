import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FaBullhorn, FaPaperPlane, FaSearch, FaTimes } from "react-icons/fa";
import { notificationService, studentService } from "../../services";

type NotificationType =
  | "announcement"
  | "fee"
  | "complaint"
  | "room"
  | "student";
type NotificationSource =
  | "Student Management"
  | "Fees Management"
  | "Complaint Management"
  | "Room Management"
  | "General Announcement";
type Priority = "normal" | "important" | "urgent" | "success";

interface AdminNotificationComposerProps {
  source: NotificationSource;
  defaultType?: NotificationType;
  buttonLabel?: string;
  onSent?: () => void;
}

interface SelectableStudent {
  studentId: string;
  name: string;
  email?: string;
}

const AdminNotificationComposer: React.FC<AdminNotificationComposerProps> = ({
  source,
  defaultType = "announcement",
  buttonLabel = "Send Notification",
  onSent,
}) => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<NotificationType>(defaultType);
  const [priority, setPriority] = useState<Priority>("normal");
  const [recipientType, setRecipientType] = useState<
    "all_students" | "selected_students"
  >("all_students");
  const [studentIdsText, setStudentIdsText] = useState("");
  const [students, setStudents] = useState<SelectableStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const reset = () => {
    setTitle("");
    setMessage("");
    setType(defaultType);
    setPriority("normal");
    setRecipientType("all_students");
    setStudentIdsText("");
    setStudentSearch("");
    setSelectedStudentIds([]);
    setError("");
  };

  useEffect(() => {
    if (!open || recipientType !== "selected_students") return;

    const loadStudents = async () => {
      try {
        setLoadingStudents(true);
        const response = await studentService.getAll({ status: "Approved" });
        const data = (response?.data || []) as Array<{
          studentId?: string;
          name?: string;
          email?: string;
        }>;

        const normalized = data
          .filter((item) => item?.studentId)
          .map((item) => ({
            studentId: String(item.studentId).toUpperCase(),
            name: String(item.name || "Unnamed Student"),
            email: item.email,
          }));

        setStudents(normalized);
      } catch {
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [open, recipientType]);

  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const q = studentSearch.toLowerCase();
    return students.filter(
      (student) =>
        student.studentId.toLowerCase().includes(q) ||
        student.name.toLowerCase().includes(q) ||
        String(student.email || "")
          .toLowerCase()
          .includes(q),
    );
  }, [students, studentSearch]);

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const recipientStudentIds = studentIdsText
      .split(",")
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean);

    const finalRecipientStudentIds = Array.from(
      new Set([...selectedStudentIds, ...recipientStudentIds]),
    );

    if (
      recipientType === "selected_students" &&
      finalRecipientStudentIds.length === 0
    ) {
      setError("Enter at least one Student ID for selected recipients.");
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
        recipientStudentIds:
          recipientType === "selected_students"
            ? finalRecipientStudentIds
            : undefined,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to send notification");
      }

      setSuccess(response.message || "Notification sent successfully");
      onSent?.();
      setTimeout(() => {
        close();
      }, 700);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send notification",
      );
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

      {open &&
        createPortal(
          <div className="fixed inset-0 z-999 flex items-center justify-center px-4">
            <div className="fixed inset-0 bg-black/40" onClick={close} />
            <div className="relative w-full max-w-xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
                <h3 className="text-base font-bold text-foreground">
                  Send Announcement / Notification
                </h3>
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
                    <label className="block text-xs text-muted-foreground mb-1">
                      Source Module
                    </label>
                    <input
                      value={source}
                      disabled
                      title="Source Module"
                      aria-label="Source Module"
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) =>
                        setType(e.target.value as NotificationType)
                      }
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
                    <label className="block text-xs text-muted-foreground mb-1">
                      Priority
                    </label>
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
                    <label className="block text-xs text-muted-foreground mb-1">
                      Recipients
                    </label>
                    <select
                      value={recipientType}
                      onChange={(e) =>
                        setRecipientType(
                          e.target.value as
                            | "all_students"
                            | "selected_students",
                        )
                      }
                      title="Notification recipients"
                      aria-label="Notification recipients"
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors appearance-none"
                    >
                      <option value="all_students">All Students</option>
                      <option value="selected_students">
                        Selected Students
                      </option>
                    </select>
                  </div>
                </div>

                {recipientType === "selected_students" && (
                  <div className="space-y-3">
                    <label className="block text-xs text-muted-foreground mb-1">
                      Select Students
                    </label>
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
                      <input
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search by name, email, or student ID"
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground placeholder-subtle outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      />
                    </div>

                    <div className="max-h-44 overflow-y-auto rounded-xl border border-border bg-muted/20 p-2 space-y-1">
                      {loadingStudents ? (
                        <p className="text-xs text-muted-foreground px-2 py-2">
                          Loading students...
                        </p>
                      ) : filteredStudents.length === 0 ? (
                        <p className="text-xs text-muted-foreground px-2 py-2">
                          No students found.
                        </p>
                      ) : (
                        filteredStudents.map((student) => (
                          <label
                            key={student.studentId}
                            className="flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-muted cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedStudentIds.includes(
                                student.studentId,
                              )}
                              onChange={() => toggleStudent(student.studentId)}
                              className="mt-0.5"
                            />
                            <span className="text-xs text-foreground">
                              <span className="font-semibold">
                                {student.name}
                              </span>
                              <span className="block text-muted-foreground">
                                {student.studentId}
                                {student.email ? ` • ${student.email}` : ""}
                              </span>
                            </span>
                          </label>
                        ))
                      )}
                    </div>

                    <label className="block text-xs text-muted-foreground mb-1">
                      Or paste Student IDs (comma separated)
                    </label>
                    <input
                      value={studentIdsText}
                      onChange={(e) => setStudentIdsText(e.target.value)}
                      placeholder="e.g. STU001, STU014, STU020"
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground placeholder-subtle outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground placeholder-subtle outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="Enter notification title"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Message
                  </label>
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
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-primary to-primary-hover transform hover:scale-[1.02] shadow-md text-white font-bold transition-all disabled:opacity-60"
                  >
                    <FaPaperPlane className="w-3.5 h-3.5" />
                    {submitting ? "Sending..." : "Send"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default AdminNotificationComposer;
