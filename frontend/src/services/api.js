import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if token is invalid/expired AND user is already logged in
    if (error.response?.status === 401) {
      const token = sessionStorage.getItem('token');
      const currentPath = window.location.pathname;
      
      // Only clear and redirect if:
      // 1. User has a token (was logged in)
      // 2. Not already on a login page
      // 3. Error is from a protected route (not from login attempt)
      if (token && !currentPath.includes('/login') && error.config.url && !error.config.url.includes('/login')) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const adminLogin = (credentials) => 
  api.post('/auth/admin/login', credentials);

export const employeeLogin = (credentials) => 
  api.post('/auth/employee/login', credentials);

// Employee APIs
export const getAllEmployees = () => 
  api.get('/employees');

export const getEmployeeById = (id) => 
  api.get(`/employees/${id}`);

export const addEmployee = (data) => 
  api.post('/employees', data);

export const updateEmployee = (id, data) => 
  api.put(`/employees/${id}`, data);

export const deleteEmployee = (id) => 
  api.delete(`/employees/${id}`);

export const getAllDepartments = () => 
  api.get('/employees/departments');

// Attendance APIs
export const checkIn = (data) => 
  api.post('/attendance/checkin', data);

export const checkOut = (data) => 
  api.post('/attendance/checkout', data);

export const getTodayAttendance = () => 
  api.get('/attendance/today');

export const getEmployeeMonthlyAttendance = (month, year) => 
  api.get('/attendance/monthly', { params: { month, year } });

export const getAllAttendance = (params) => 
  api.get('/attendance/all', { params });

export const getDashboardStats = () => 
  api.get('/attendance/stats');

// WFH APIs
export const enableWFH = (employee_id) => 
  api.post('/wfh/enable', { employee_id });

export const disableWFH = (employee_id) => 
  api.post('/wfh/disable', { employee_id });

export const getWFHStatus = () => 
  api.get('/wfh/status');

// Early Checkout APIs
export const toggleEarlyCheckout = (employeeId, enabled) => 
  api.post('/attendance/early-checkout', { employeeId, enabled });

// PDF API
export const downloadMonthlyPDF = (month, year) => {
  return api.get('/pdf/monthly', {
    params: { month, year },
    responseType: 'blob'
  });
};

// NEW: Monthly Attendance Matrix Downloads
export const downloadMonthlyMatrixPDF = (month, year) => {
  return api.get('/pdf/monthly-matrix-pdf', {
    params: { month, year },
    responseType: 'blob'
  });
};

export const downloadMonthlyMatrixExcel = (month, year) => {
  return api.get('/pdf/monthly-matrix-excel', {
    params: { month, year },
    responseType: 'blob'
  });
};

// Holiday APIs
export const getAllHolidays = (year, month) => 
  api.get('/holidays', { params: { year, month } });

export const addHoliday = (data) => 
  api.post('/holidays', data);

export const updateHoliday = (id, data) => 
  api.put(`/holidays/${id}`, data);

export const deleteHoliday = (id) => 
  api.delete(`/holidays/${id}`);

export const toggleHolidayStatus = (id, is_enabled) => 
  api.patch(`/holidays/${id}/toggle`, { is_enabled });

export const checkHolidayStatus = (date) => 
  api.get('/holidays/check', { params: { date } });

// Settings APIs
export const getSettings = () => 
  api.get('/settings');

export const updateSettings = (data) => 
  api.put('/settings', data);

// Attendance Reset and Delete APIs
export const resetAttendance = (attendanceId, resetType) => 
  api.post('/attendance/reset', { attendanceId, resetType });

export const deleteAttendance = (id) => 
  api.delete(`/attendance/${id}`);

export default api;
