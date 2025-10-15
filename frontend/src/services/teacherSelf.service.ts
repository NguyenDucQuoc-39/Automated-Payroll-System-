import api from './api';

export const getMyProfile = () => api.get('/teachers/me');

export const updateMyProfile = (data: Partial<{ firstName: string; lastName: string; gender: string; office: string; phone: string; birthDate: string }>) =>
  api.put('/teachers/me', data);

export const getMyDepartmentMembers = (params?: { search?: string }) =>
  api.get('/teachers/me/department-members', { params });

export default {
  getMyProfile,
  updateMyProfile,
  getMyDepartmentMembers,
};


