import api from './api';

// ─── Auth Services ───────────────────────────────────────────
export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: {
    name: string;
    studentId: string;
    email: string;
    phone: string;
    gender: string;
    course: string;
    year: string;
    address: string;
    password: string;
    confirmPassword: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: { name?: string; phone?: string; password?: string }) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
};

// ─── Student Services ────────────────────────────────────────
export const studentService = {
  getAll: async () => {
    const response = await api.get('/students');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  create: async (studentData: Record<string, any>) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  update: async (id: string, studentData: Record<string, any>) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  search: async (query: string) => {
    const response = await api.get(`/students/search/${query}`);
    return response.data;
  },

  getApprovals: async () => {
    const response = await api.get('/students/approvals');
    return response.data;
  },

  approve: async (id: string) => {
    const response = await api.put(`/students/approvals/${id}/approve`);
    return response.data;
  },

  reject: async (id: string) => {
    const response = await api.put(`/students/approvals/${id}/reject`);
    return response.data;
  },
};

// ─── Room Services ───────────────────────────────────────────
export const roomService = {
  getAll: async () => {
    const response = await api.get('/rooms');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  create: async (roomData: Record<string, any>) => {
    const formData = new FormData();
    Object.entries(roomData).forEach(([key, value]) => {
      if (key === 'image' && value instanceof File) {
        formData.append('image', value);
      } else if (key === 'facilities' && Array.isArray(value)) {
        formData.append('facilities', JSON.stringify(value));
      } else if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    });
    const response = await api.post('/rooms', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id: string, roomData: Record<string, any>) => {
    const formData = new FormData();
    Object.entries(roomData).forEach(([key, value]) => {
      if (key === 'image' && value instanceof File) {
        formData.append('image', value);
      } else if (key === 'image' && typeof value === 'string') {
        // Don't re-send existing URL — only send if it's a File
        return;
      } else if (key === 'facilities' && Array.isArray(value)) {
        formData.append('facilities', JSON.stringify(value));
      } else if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    });
    const response = await api.put(`/rooms/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
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
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    feeType?: string;
    search?: string;
    sortBy?: 'amount' | 'dueDate' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') queryParams.append(key, String(value));
      });
    }
    const response = await api.get(`/fees?${queryParams.toString()}`);
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
    const response = await api.post('/fees/create', feeData);
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
    const response = await api.patch(`/fees/${id}/pay`, paymentData);
    return response.data;
  },

  getRevenue: async () => {
    const response = await api.get('/fees/revenue');
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/fees/statistics');
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
    const response = await api.get('/fees/unpaid');
    return response.data;
  },

  getStudentsWithRooms: async () => {
    const response = await api.get('/fees/students-rooms');
    return response.data;
  },

  updateOverdue: async () => {
    const response = await api.post('/fees/update-overdue');
    return response.data;
  },

  getMonthlyChart: async () => {
    const response = await api.get('/fees/monthly-chart');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/fees/analytics');
    return response.data;
  },
};

// ─── Complaint Services ──────────────────────────────────────
export const complaintService = {
  getAll: async (params?: { search?: string; category?: string; status?: string; priority?: string }) => {
    const response = await api.get('/complaints', { params });
    return response.data;
  },

  getMy: async () => {
    const response = await api.get('/complaints/user');
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
    const response = await api.post('/complaints', complaintData);
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

  assign: async (id: string, data: { assignedTo: string; estimatedResolution?: string }) => {
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
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getActivities: async () => {
    const response = await api.get('/admin/activities');
    return response.data;
  },

  getMonthlyRevenue: async (year?: number) => {
    const response = await api.get('/admin/revenue-monthly', { params: year ? { year } : {} });
    return response.data;
  },

  getRoomOccupancy: async () => {
    const response = await api.get('/admin/room-occupancy');
    return response.data;
  },

  getRecentStudents: async (limit?: number) => {
    const response = await api.get('/admin/recent-students', { params: limit ? { limit } : {} });
    return response.data;
  },

  healthCheck: async () => {
    const response = await api.get('/admin/health');
    return response.data;
  },

  backup: async () => {
    const response = await api.post('/admin/backup');
    return response.data;
  },
};

// ─── Notification Services ───────────────────────────────────
export const notificationService = {
  getAll: async (limit?: number) => {
    const response = await api.get('/notifications', { params: limit ? { limit } : {} });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  },

  clearAll: async () => {
    const response = await api.delete('/notifications/clear');
    return response.data;
  },
};

// ─── Booking Services ───────────────────────────────────────
export const bookingService = {
  confirm: async (payload: { fullName: string; email: string; phone: string; selectedFloor: string; roomId?: string }) => {
    const response = await api.post('/bookings/confirm', payload);
    return response.data;
  },

  getMyBooking: async () => {
    const response = await api.get('/bookings/my-booking');
    return response.data;
  },

  getAdminBookings: async () => {
    const response = await api.get('/bookings/admin');
    return response.data;
  },

  updateStatus: async (id: string, status: 'Confirmed' | 'Cancelled') => {
    const response = await api.put(`/bookings/${id}/status`, { status });
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
    const response = await api.get('/admin-logs', { params });
    return response.data;
  },
};
