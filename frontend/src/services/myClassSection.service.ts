import api from './api';

export const getMyClassSections = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  semesterId?: string;
  academicYear?: string;
  status?: string;
}) => api.get('/class-sections/me', { params });

export default { getMyClassSections };


