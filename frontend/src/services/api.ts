import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ensure all requests have /api prefix
    if (config.url && !config.url.startsWith('/api')) {
      config.url = '/api' + (config.url.startsWith('/') ? config.url : '/' + config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Báo cáo: Tiền dạy của giảng viên trong một năm
export const getTeacherSalaryByYear = (year: string) =>
  api.get(`/statistics/teacher-year`, { params: { year } });

// Báo cáo: Tiền dạy của giảng viên một khoa
export const getTeacherSalaryByDepartment = (departmentId: string, year?: string, semesterId?: string) =>
  api.get(`/statistics/teacher-department`, { params: { departmentId, year, semesterId } });

// Báo cáo: Tiền dạy của giảng viên toàn trường
export const getTeacherSalaryBySchool = (year?: string, semesterId?: string) =>
  api.get(`/statistics/teacher-school`, { params: { year, semesterId } }); 