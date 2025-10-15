import api from './api';

export const getMySalaryReport = (params: {
  mode?: 'month' | 'semester' | 'year';
  year?: string;
  month?: number | string;
  semesterId?: string;
}) => api.get('/statistics/teacher-salary/personal', { params });

export default { getMySalaryReport };


