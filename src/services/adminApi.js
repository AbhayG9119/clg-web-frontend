import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (email, password, captchaValue, role) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
        captchaToken: captchaValue,
        role
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('designation', user.designation || '');
      return { success: true, role: user.role };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  },
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to get user info' };
    }
  },
  getMyPayments: async () => {
    try {
      const response = await api.get('/payments/my-payments');
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to fetch your payments' };
    }
  }
};

export const staffApi = {
  getDesignations: async () => {
    try {
      const response = await api.get('/staff/designations');
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to fetch designations' };
    }
  },
  addDesignation: async (name) => {
    try {
      const response = await api.post('/staff/designations', { name });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to add designation' };
    }
  },
  registerStaff: async (staffData) => {
    try {
      const response = await api.post('/users/staff/register', staffData);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to register staff' };
    }
  },
  getStaff: async () => {
    try {
      const response = await api.get('/staff');
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to fetch staff' };
    }
  }
};

export const enquiryApi = {
  addEnquiry: async (enquiryData) => {
    try {
      const response = await api.post('/enquiries', enquiryData);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to add enquiry' };
    }
  },
  getEnquiries: async () => {
    try {
      const response = await api.get('/enquiries');
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to fetch enquiries' };
    }
  },
  updateEnquiry: async (id, updateData) => {
    try {
      const response = await api.put(`/enquiries/${id}`, updateData);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update enquiry' };
    }
  }
};

export const workApi = {
  addWork: async (workData) => {
    try {
      const response = await api.post('/works', workData);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to add work' };
    }
  },
  getWorks: async () => {
    try {
      const response = await api.get('/works');
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to fetch works' };
    }
  },
  addWorkReport: async (reportData) => {
    try {
      const response = await api.post('/work-reports', reportData);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to add work report' };
    }
  }
};

export const staffAttendanceApi = {
  getStaffList: async () => {
    try {
      const response = await api.get('/erp/staff/list');
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to fetch staff list' };
    }
  },
  getAttendance: async (date) => {
    try {
      const response = await api.get('/erp/staff/attendance', { params: { date } });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to fetch attendance' };
    }
  },
  markAttendance: async (date, attendanceData) => {
    try {
      const response = await api.post('/erp/staff/attendance', { date, attendanceData });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to mark attendance' };
    }
  },
  getAttendanceRecords: async (startDate, endDate) => {
    try {
      const response = await api.get('/erp/staff/attendance/records', { params: { startDate, endDate } });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to fetch attendance records' };
    }
  },
  getLeaveRequests: async () => {
    try {
      const response = await api.get('/erp/staff/leaves');
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to fetch leave requests' };
    }
  },
  updateLeaveStatus: async (leaveId, status) => {
    try {
      const response = await api.put(`/erp/staff/leave/${leaveId}/status`, { status });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update leave status' };
    }
  },
  getMonthlyAttendance: async (month, year) => {
    try {
      const response = await api.get('/erp/staff/attendance/monthly', { params: { month, year } });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to fetch monthly attendance' };
    }
  }
};

export const userApi = {
  addUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to add user' };
    }
  },
  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/users', { params });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to fetch users' };
    }
  },
  getUser: async (id, role) => {
    try {
      const response = await api.get(`/users/${id}/${role}`);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to fetch user' };
    }
  },
  editUser: async (id, role, userData) => {
    try {
      const response = await api.put(`/users/${id}/${role}`, userData);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to edit user' };
    }
  },
  deleteUser: async (id, role) => {
    try {
      const response = await api.delete(`/users/${id}/${role}`);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to delete user' };
    }
  },
  resetPassword: async (id, role, newPassword) => {
    try {
      const response = await api.put(`/users/reset-password/${id}/${role}`, { password: newPassword });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to reset password' };
    }
  }
};

export const feesApi = {
  getMyPayments: async () => {
    try {
      const response = await api.get('/payments/my-payments');
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to fetch your payments' };
    }
  },
  searchStudent: async (query) => {
    try {
      const response = await api.get('/users', { params: { search: query, role: 'student' } });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to search students' };
    }
  },
  getStudentFees: async (studentId) => {
    try {
      const response = await api.get(`/payments/student/${studentId}`);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to fetch student fees' };
    }
  },
  collectFee: async (paymentData) => {
    try {
      const response = await api.post('/payments/initiate', paymentData);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to collect fee' };
    }
  },
  generateReceipt: async (paymentId) => {
    try {
      const response = await api.post('/receipts/generate', { paymentId });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to generate receipt' };
    }
  },
  getPaymentDetails: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to fetch payment details' };
    }
  },
  getStudentDetails: async (studentId, role) => {
    try {
      const response = await api.get(`/users/${studentId}/${role}`);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to fetch student details' };
    }
  },
  getStudentProfile: async (studentId, role) => {
    try {
      const response = await api.get(`/student/profile/${studentId}/${role}`);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to fetch student profile' };
    }
  },
  updateStudentProfile: async (studentId, role, profileData) => {
    try {
      const response = await api.put(`/student/profile/${studentId}/${role}`, profileData);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update student profile' };
    }
  }
};

export const expenseApi = {
  addExpense: async (expenseData, attachment) => {
    try {
      const formData = new FormData();
      formData.append('category', expenseData.category);
      formData.append('amount', expenseData.amount);
      formData.append('notes', expenseData.notes || '');
      if (expenseData.date) {
        formData.append('date', expenseData.date);
      }
      if (attachment) {
        formData.append('attachment', attachment);
      }

      const response = await api.post('/expenses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to add expense' };
    }
  },
  getExpenses: async (params = {}) => {
    try {
      const response = await api.get('/expenses', { params });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to fetch expenses' };
    }
  },
  getExpenseReport: async (startDate, endDate) => {
    try {
      const response = await api.get('/expenses/report', {
        params: { startDate, endDate }
      });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to generate expense report' };
    }
  },
  updateExpense: async (id, expenseData, attachment) => {
    try {
      const formData = new FormData();
      if (expenseData.category) formData.append('category', expenseData.category);
      if (expenseData.amount) formData.append('amount', expenseData.amount);
      if (expenseData.notes !== undefined) formData.append('notes', expenseData.notes);
      if (expenseData.date) formData.append('date', expenseData.date);
      if (attachment) formData.append('attachment', attachment);

      const response = await api.put(`/expenses/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update expense' };
    }
  },
  deleteExpense: async (id) => {
    try {
      const response = await api.delete(`/expenses/${id}`);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to delete expense' };
    }
  }
};
