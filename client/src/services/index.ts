import api from "./api";

// ─── Auth Services ───────────────────────────────────────────
export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    studentId: string;
    university: string;
    gender: "Male" | "Female" | "Other";
    address: string;
    emergencyContact: string;
    course?: string;
  }) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  verifyToken: async () => {
    const response = await api.get("/auth/verify");
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/profile");
    return response.data;
  },

  updateProfile: async (data: {
    fullName?: string;
    name?: string;
    phone?: string;
    gender?: string;
    address?: string;
    password?: string;
  }) => {
    const response = await api.put("/profile", data);
    return response.data;
  },

  updateProfileImage: async (profileImage: File) => {
    const formData = new FormData();
    formData.append("profileImage", profileImage);

    const response = await api.put("/profile/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  },
};

// ─── Student Services ────────────────────────────────────────
export const studentService = {
  getAll: async (filters?: {
    search?: string;
    status?: string;
    floor?: string;
    roomNumber?: string;
  }) => {
    const response = await api.get("/students", { params: filters || {} });
    return response.data;
  },

  getPending: async () => {
    const response = await api.get("/students/pending");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  create: async (studentData: Record<string, any>) => {
    const response = await api.post("/students", studentData);
    return response.data;
  },

  update: async (id: string, studentData: Record<string, any>) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  inactivate: async (id: string) => {
    const response = await api.put(`/students/${id}/inactivate`);
    return response.data;
  },

  activate: async (id: string) => {
    const response = await api.put(`/students/${id}/activate`);
    return response.data;
  },

  search: async (query: string) => {
    const response = await api.get(`/students/search/${query}`);
    return response.data;
  },

  approve: async (id: string) => {
    const response = await api.put(`/students/${id}/approve`);
    return response.data;
  },

  reject: async (id: string) => {
    const response = await api.put(`/students/${id}/reject`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  getApprovals: async () => {
    const response = await api.get("/students/approvals");
    return response.data;
  },
};

export const settingsService = {
  getHeroImage: async () => {
    const response = await api.get("/settings/hero-image");
    return response.data;
  },

  updateHeroImage: async (heroImage: File) => {
    const formData = new FormData();
    formData.append("heroImage", heroImage);

    const response = await api.post("/settings/hero-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

// ─── Room Services ───────────────────────────────────────────
export const roomService = {
  getAll: async () => {
    const response = await api.get("/rooms");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  create: async (roomData: Record<string, any>) => {
    const formData = new FormData();
    Object.entries(roomData).forEach(([key, value]) => {
      if (key === "image" && value instanceof File) {
        formData.append("image", value);
      } else if (key === "facilities" && Array.isArray(value)) {
        formData.append("facilities", JSON.stringify(value));
      } else if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });
    const response = await api.post("/rooms", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  update: async (id: string, roomData: Record<string, any>) => {
    const formData = new FormData();
    Object.entries(roomData).forEach(([key, value]) => {
      if (key === "image" && value instanceof File) {
        formData.append("image", value);
      } else if (key === "image" && typeof value === "string") {
        // Don't re-send existing URL — only send if it's a File
        return;
      } else if (key === "facilities" && Array.isArray(value)) {
        formData.append("facilities", JSON.stringify(value));
      } else if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });
    const response = await api.put(`/rooms/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },

  allocate: async (id: string, data: { studentId: string }) => {
    const response = await api.put(`/rooms/${id}/allocate`, data);
    return response.data;
  },

  vacate: async (id: string) => {
    const response = await api.put(`/rooms/${id}/vacate`);
    return response.data;
  },
};

// ─── Fees Services ───────────────────────────────────────────
export const feesService = {
  getAll: async () => {
    const response = await api.get("/fees");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/fees/${id}`);
    return response.data;
  },

  getByStudent: async (studentId: string) => {
    const response = await api.get(`/fees/student/${studentId}`);
    return response.data;
  },

  create: async (feeData: Record<string, any>) => {
    const response = await api.post("/fees", feeData);
    return response.data;
  },

  update: async (id: string, feeData: Record<string, any>) => {
    const response = await api.put(`/fees/${id}`, feeData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/fees/${id}`);
    return response.data;
  },

  pay: async (id: string, paymentData: Record<string, any>) => {
    const response = await api.put(`/fees/${id}/pay`, paymentData);
    return response.data;
  },

  getRevenue: async () => {
    const response = await api.get("/fees/revenue");
    return response.data;
  },

  getReceipt: async (id: string) => {
    const response = await api.get(`/fees/${id}/receipt`);
    return response.data;
  },

  getMonthlyReport: async (year: number, month: number) => {
    const response = await api.get(`/fees/report/${year}/${month}`);
    return response.data;
  },

  getUnpaid: async () => {
    const response = await api.get("/fees/unpaid");
    return response.data;
  },

  getMyFees: async () => {
    const response = await api.get("/fees/my-fees");
    return response.data;
  },
};

// ─── Complaint Services ──────────────────────────────────────
export const complaintService = {
  getAll: async (params?: {
    search?: string;
    category?: string;
    status?: string;
    priority?: string;
  }) => {
    const response = await api.get("/complaints", { params });
    return response.data;
  },

  getMy: async () => {
    const response = await api.get("/complaints/user");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  getByStudent: async (studentId: string) => {
    const response = await api.get(`/complaints/student/${studentId}`);
    return response.data;
  },

  create: async (complaintData: Record<string, any>) => {
    const response = await api.post("/complaints", complaintData);
    return response.data;
  },

  update: async (id: string, complaintData: Record<string, any>) => {
    const response = await api.put(`/complaints/${id}`, complaintData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  },

  assign: async (
    id: string,
    data: { assignedTo: string; estimatedResolution?: string },
  ) => {
    const response = await api.put(`/complaints/${id}/assign`, data);
    return response.data;
  },

  resolve: async (id: string, data: { rejectionReason?: string }) => {
    const response = await api.put(`/complaints/${id}/resolve`, data);
    return response.data;
  },

  addComment: async (id: string, data: { text: string; author: string }) => {
    const response = await api.post(`/complaints/${id}/comment`, data);
    return response.data;
  },
};

// ─── Admin Services ──────────────────────────────────────────
export const adminService = {
  getStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data;
  },

  getActivities: async () => {
    try {
      const response = await api.get("/admin/activities");
      return response.data;
    } catch (error) {
      // Return empty activities if endpoint doesn't exist
      return { success: true, data: [] };
    }
  },

  getMonthlyRevenue: async (year?: number) => {
    const response = await api.get("/admin/revenue-monthly", {
      params: year ? { year } : {},
    });
    return response.data;
  },

  getRoomOccupancy: async () => {
    const response = await api.get("/admin/room-occupancy");
    return response.data;
  },

  getRecentStudents: async (limit?: number) => {
    const response = await api.get("/admin/recent-students", {
      params: limit ? { limit } : {},
    });
    return response.data;
  },

  healthCheck: async () => {
    const response = await api.get("/admin/health");
    return response.data;
  },

  backup: async () => {
    const response = await api.post("/admin/backup");
    return response.data;
  },
};

// ─── Notification Services ───────────────────────────────────
export const notificationService = {
  getAll: async (params?: {
    limit?: number;
    type?: string;
    unreadOnly?: boolean;
  }) => {
    const response = await api.get("/notifications", { params: params || {} });
    return response.data;
  },

  getUnreadCount: async (type?: string) => {
    const response = await api.get("/notifications/unread-count", {
      params: type ? { type } : {},
    });
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put("/notifications/mark-all-read");
    return response.data;
  },

  sendAdminNotification: async (payload: {
    title: string;
    message: string;
    type: "announcement" | "fee" | "complaint" | "room" | "student";
    source:
      | "Student Management"
      | "Fees Management"
      | "Complaint Management"
      | "Room Management"
      | "General Announcement";
    recipientType: "all_students" | "selected_students";
    recipientStudentIds?: string[];
    priority?: "normal" | "important" | "urgent" | "success";
    relatedModuleId?: string;
  }) => {
    const response = await api.post("/notifications", payload);
    return response.data;
  },

  hide: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  clearAll: async () => {
    const response = await api.delete("/notifications/clear");
    return response.data;
  },
};

// ─── Booking Services ───────────────────────────────────────
export const bookingService = {
  confirm: async (payload: {
    fullName: string;
    email: string;
    phone: string;
    selectedFloor: string;
    roomId?: string;
  }) => {
    const response = await api.post("/bookings/confirm", payload);
    return response.data;
  },

  getMyBooking: async () => {
    const response = await api.get("/bookings/my-booking");
    return response.data;
  },

  getAdminBookings: async () => {
    const response = await api.get("/bookings/admin");
    return response.data;
  },

  updateStatus: async (id: string, status: "Confirmed" | "Cancelled") => {
    const response = await api.put(`/bookings/${id}/status`, { status });
    return response.data;
  },
};

// ─── Payment Services ───────────────────────────────────────
export const paymentService = {
  create: async (formData: FormData) => {
    const response = await api.post("/payments", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getStudent: async () => {
    const response = await api.get("/payments/student");
    return response.data;
  },

  getAdmin: async (params?: {
    status?: "Pending" | "Approved" | "Rejected";
    date?: string;
  }) => {
    const response = await api.get("/payments/admin", { params });
    return response.data;
  },

  updateStatus: async (id: string, status: "Approved" | "Rejected") => {
    const response = await api.put(`/payments/${id}`, { status });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  },
};

// ─── Admin Log Services ──────────────────────────────────────
export const adminLogService = {
  getLogs: async (params?: {
    page?: number;
    limit?: number;
    targetType?: string;
    action?: string;
    adminName?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get("/admin-logs", { params });
    return response.data;
  },
};
