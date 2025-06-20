import api from './api';

export const getDepartments = (params?: any) => api.get('/departments', { params });
export const getAllDepartments = () => api.get('/departments/all');
export const getDepartmentById = (id: string) => api.get(`/departments/${id}`);
export const createDepartment = (data: any) => api.post('/departments', data);
export const updateDepartment = (id: string, data: any) => api.put(`/departments/${id}`, data);
export const deleteDepartment = (id: string) => api.delete(`/departments/${id}`); 