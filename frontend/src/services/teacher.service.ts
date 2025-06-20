import api from './api';
import { Teacher, TeacherStatistics } from '../types/typeFrontend';

export const getTeachers = (params?: any) => api.get('/teachers', { params });

export const getTeacherById = (id: string) => api.get(`/teachers/${id}`);

export const getTeachersByDepartment = (departmentId: string) => api.get(`/teachers/department/${departmentId}`);

export const createTeacher = (data: any) => api.post('/teachers', data);

export const updateTeacher = (id: string, data: any) => api.put(`/teachers/${id}`, data);

export const deleteTeacher = (id: string) => api.delete(`/teachers/${id}`);

export const getTeacherStatistics = async (filters?: { gender?: string; departmentId?: string; degreeId?: string }): Promise<TeacherStatistics> => {
  const response = await api.get('/teachers/statistics', { params: filters });
  return response.data;
}; 