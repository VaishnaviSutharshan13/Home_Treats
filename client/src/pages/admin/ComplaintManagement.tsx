import { useEffect, useMemo, useState } from "react";
import {
  FaCheckCircle,
  FaChevronLeft,
  FaClock,
  FaEdit,
  FaExclamationTriangle,
  FaEye,
  FaFilter,
  FaSearch,
  FaSpinner,
  FaSync,
  FaTimesCircle,
  FaTrash,
} from "react-icons/fa";
import { Link } from "react-router-dom";

import type { ComplaintItem } from "../../components/complaints/ComplaintCard";
import Sidebar from "../../components/layout/Sidebar";
import { complaintService } from "../../services";

type Status = "Pending" | "In Progress" | "Resolved" | "Rejected";

interface AssignState {
  complaintId: string;
  assignedTo: string;
  estimatedResolution: string;
}

const statusBadge: Record<Status, string> = {
  Pending: "bg-warning/20 border border-warning/30 text-warning",
  "In Progress": "bg-primary/20 border border-primary/20 text-primary",
  Resolved: "bg-primary/20 border border-primary/20 text-primary",
  Rejected: "bg-error/20 border border-error/30 text-error",
};

const priorityBadge: Record<string, string> = {
  High: "bg-error/20 border border-error/30 text-error",
  Medium: "bg-warning/20 border border-warning/30 text-warning",
  Low: "bg-primary/20 border border-primary/20 text-primary",
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
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

const ComplaintManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");

  const [activeComplaint, setActiveComplaint] = useState<ComplaintItem | null>(
    null,
  );

  const [assignModal, setAssignModal] = useState<AssignState | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch ─────────────────────
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await complaintService.getAll();
      setComplaints(res.data || res);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to load complaints"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // ── Filter ─────────────────────
  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.student.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());

      return (
        matchesSearch &&
        (category === "All" || c.category === category) &&
        (status === "All" || c.status === status) &&
        (priority === "All" || c.priority === priority)
      );
    });
  }, [complaints, search, category, status, priority]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    complaints.forEach((item) => set.add(item.category));
    return ["All", ...Array.from(set).sort()];
  }, [complaints]);

  const priorities = useMemo(() => {
    const set = new Set<string>();
    complaints.forEach((item) => set.add(item.priority));
    return ["All", ...Array.from(set).sort()];
  }, [complaints]);

  const stats = useMemo(() => {
    return {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === "Pending").length,
      inProgress: complaints.filter((c) => c.status === "In Progress").length,
      resolved: complaints.filter((c) => c.status === "Resolved").length,
      rejected: complaints.filter((c) => c.status === "Rejected").length,
    };
  }, [complaints]);

  // ── Helpers ─────────────────────
  const refresh = async () => fetchComplaints();

  const updateStatus = async (
    id: string,
    newStatus: Status,
    payload?: Record<string, unknown>,
  ) => {
    try {
      await complaintService.update(id, { status: newStatus, ...payload });
      showToast("Updated successfully", "success");
      await refresh();
    } catch (e: unknown) {
      showToast(getErrorMessage(e, "Update failed"), "error");
    }
  };

  // ── Actions ─────────────────────
  const assignComplaint = async () => {
    if (!assignModal?.assignedTo.trim()) return;

    await updateStatus(assignModal.complaintId, "In Progress", {
      assignedTo: assignModal.assignedTo,
      estimatedResolution: assignModal.estimatedResolution,
    });

    setAssignModal(null);
  };

  const resolveComplaint = async (id: string) => {
    await updateStatus(id, "Resolved");
  };

  const rejectComplaint = async () => {
    if (!rejectModal || !rejectReason.trim()) return;

    await updateStatus(rejectModal, "Rejected", {
      rejectionReason: rejectReason,
    });

    setRejectModal(null);
    setRejectReason("");
  };

  const deleteComplaint = async (id: string) => {
    if (!confirm("Delete this complaint?")) return;
    try {
      await complaintService.delete(id);
      showToast("Deleted successfully", "success");
      if (activeComplaint?._id === id) setActiveComplaint(null);
      await refresh();
    } catch (e: unknown) {
      showToast(getErrorMessage(e, "Delete failed"), "error");
    }
  };

  // ── UI helpers ─────────────────────
  const statusIcon = (s: Status) => {
    switch (s) {
      case "Pending":
        return <FaClock />;
      case "In Progress":
        return <FaExclamationTriangle />;
      case "Resolved":
        return <FaCheckCircle />;
      case "Rejected":
        return <FaTimesCircle />;
    }
  };

  // ── Render ─────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        userRole="admin"
      />

      <div className="lg:ml-64 p-6 space-y-6">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 px-4 py-2 rounded-lg text-sm ${
              toast.type === "success"
                ? "bg-primary/10 border border-primary/20 text-primary"
                : "bg-error/10 border border-error/20 text-error"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link
                to="/admin/dashboard"
                className="text-muted-foreground text-sm inline-flex items-center gap-2 hover:text-primary"
              >
                <FaChevronLeft /> Dashboard
              </Link>
              <h1 className="mt-2 text-2xl font-bold text-foreground">
                Complaint Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track, assign, resolve, and close student issues from one place.
              </p>
            </div>
            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground hover:bg-muted transition-colors"
            >
              <FaSync className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="rounded-xl border border-border bg-surface-active px-4 py-3">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
              <p className="text-xs text-warning">Pending</p>
              <p className="text-xl font-bold text-warning">{stats.pending}</p>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3">
              <p className="text-xs text-primary">In Progress</p>
              <p className="text-xl font-bold text-primary">
                {stats.inProgress}
              </p>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3">
              <p className="text-xs text-primary">Resolved</p>
              <p className="text-xl font-bold text-primary">{stats.resolved}</p>
            </div>
            <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3">
              <p className="text-xs text-error">Rejected</p>
              <p className="text-xl font-bold text-error">{stats.rejected}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
              <input
                className="w-full rounded-xl bg-muted/30 border border-border text-foreground placeholder-subtle pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                placeholder="Search title, student, description"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl bg-muted/30 border border-border text-foreground px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl bg-muted/30 border border-border text-foreground px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
            >
              <option>All</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Rejected</option>
            </select>

            <div className="flex gap-2">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="flex-1 rounded-xl bg-muted/30 border border-border text-foreground px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
              >
                {priorities.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  setStatus("All");
                  setPriority("All");
                }}
                className="px-3 rounded-xl border border-border bg-muted/40 text-foreground hover:bg-muted"
                title="Clear filters"
              >
                <FaFilter />
              </button>
            </div>
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="bg-card border border-border rounded-2xl p-8 flex items-center justify-center gap-3 text-muted-foreground">
            <FaSpinner className="animate-spin text-lg" />
            Loading complaints...
          </div>
        )}
        {error && (
          <div className="bg-error/10 border border-error/20 rounded-2xl p-4 text-error">
            {error}
          </div>
        )}

        {/* List */}
        {!loading && !error && (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
              {filtered.length === 0 && (
                <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                  No complaints found for current filters.
                </div>
              )}
              {filtered.map((c) => (
                <div
                  key={c._id}
                  className="bg-card p-4 rounded-2xl border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${statusBadge[c.status as Status] || "bg-muted/40 text-muted-foreground"}`}
                      >
                        {statusIcon(c.status as Status)}
                      </span>
                      <div>
                        <h3 className="font-bold text-foreground">{c.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {c.category}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${priorityBadge[c.priority] || "bg-muted/40 text-muted-foreground"}`}
                    >
                      {c.priority}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {c.description}
                  </p>

                  <div className="mt-3 text-sm grid grid-cols-2 gap-2">
                    <p>
                      <span className="text-muted-foreground">Student:</span>{" "}
                      {c.student}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Room:</span>{" "}
                      {c.room}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Status:</span>{" "}
                      {c.status}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Created:</span>{" "}
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 flex-wrap border-t border-border pt-3">
                    <button
                      onClick={() => setActiveComplaint(c)}
                      className="px-3 py-1.5 bg-muted/70 rounded-lg border border-border text-foreground hover:bg-muted flex items-center gap-1"
                    >
                      <FaEye /> View
                    </button>

                    {c.status === "Pending" && (
                      <button
                        onClick={() =>
                          setAssignModal({
                            complaintId: c._id,
                            assignedTo: "",
                            estimatedResolution: "",
                          })
                        }
                        className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-lg"
                      >
                        <FaEdit /> Assign
                      </button>
                    )}

                    {c.status === "Pending" && (
                      <button
                        onClick={() => setRejectModal(c._id)}
                        className="px-3 py-1.5 bg-error/10 border border-error/20 text-error rounded-lg"
                      >
                        Reject
                      </button>
                    )}

                    {c.status === "In Progress" && (
                      <>
                        <button
                          onClick={() => resolveComplaint(c._id)}
                          className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-lg"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => setRejectModal(c._id)}
                          className="px-3 py-1.5 bg-error/10 border border-error/20 text-error rounded-lg"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => deleteComplaint(c._id)}
                      className="px-3 py-1.5 bg-error/20 border border-error/30 text-error rounded-lg ml-auto"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card rounded-2xl border border-border p-5 h-fit lg:sticky lg:top-20">
              {activeComplaint ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-bold text-foreground">
                      {activeComplaint.title}
                    </h2>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusBadge[activeComplaint.status as Status] || "bg-muted/40 text-muted-foreground"}`}
                    >
                      {activeComplaint.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {activeComplaint.description}
                  </p>
                  <div className="mt-4 space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Student:</span>{" "}
                      {activeComplaint.student}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Room:</span>{" "}
                      {activeComplaint.room}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Category:</span>{" "}
                      {activeComplaint.category}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Priority:</span>{" "}
                      {activeComplaint.priority}
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Assigned To:
                      </span>{" "}
                      {activeComplaint.assignedTo || "-"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">ETA:</span>{" "}
                      {formatDate(activeComplaint.estimatedResolution)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Created:</span>{" "}
                      {formatDate(activeComplaint.createdAt)}
                    </p>
                    {activeComplaint.rejectionReason && (
                      <div className="bg-error/10 border border-error/20 rounded-xl p-3 text-error">
                        <p className="text-xs uppercase tracking-wide font-semibold">
                          Rejection Reason
                        </p>
                        <p className="text-sm mt-1">
                          {activeComplaint.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveComplaint(null)}
                    className="mt-4 w-full px-3 py-2 rounded-xl bg-muted/70 border border-border text-foreground hover:bg-muted"
                  >
                    Clear Selection
                  </button>
                </>
              ) : (
                <div className="text-center py-10">
                  <FaEye className="mx-auto text-muted-foreground text-2xl" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Select a complaint to view full details here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modals (simplified for clarity) */}
        {assignModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
            <div className="bg-card p-5 rounded-2xl border border-border w-full max-w-md">
              <h3 className="font-bold mb-3 text-foreground">
                Assign Complaint
              </h3>

              <input
                placeholder="Assign to"
                className="w-full mb-3 px-3 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                value={assignModal.assignedTo}
                onChange={(e) =>
                  setAssignModal({ ...assignModal, assignedTo: e.target.value })
                }
              />

              <input
                type="datetime-local"
                className="w-full mb-3 px-3 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                value={assignModal.estimatedResolution}
                onChange={(e) =>
                  setAssignModal({
                    ...assignModal,
                    estimatedResolution: e.target.value,
                  })
                }
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setAssignModal(null)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-muted/70 border border-border text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={assignComplaint}
                  className="flex-1 bg-primary/10 border border-primary/20 text-primary px-3 py-2.5 rounded-xl"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}

        {rejectModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-card p-5 rounded-2xl border border-border w-full max-w-md mx-4">
              <h3 className="font-bold mb-3 text-foreground">
                Reject Complaint
              </h3>
              <textarea
                className="w-full mb-3 min-h-25 rounded-xl bg-muted/30 border border-border text-foreground p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Reason for rejection"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setRejectModal(null);
                    setRejectReason("");
                  }}
                  className="px-3 py-2 rounded-xl bg-muted/70 border border-border text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void rejectComplaint()}
                  className="px-3 py-2 rounded-xl bg-error/20 border border-error/30 text-error"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintManagement;
