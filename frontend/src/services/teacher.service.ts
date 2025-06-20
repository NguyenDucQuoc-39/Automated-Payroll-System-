import api from './api';
import { Teacher, TeacherStatistics } from '../types/typeFrontend';

export const getTeachers = async (): Promise<Teacher[]> => {
  const response = await api.get('/teachers');
  return response.data;
};

export const getTeacherById = async (id: string): Promise<Teacher> => {
  const response = await api.get(`/teachers/${id}`);
  return response.data;
};

export const createTeacher = async (data: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt' | 'degree' | 'department'> & { password: string }): Promise<Teacher> => {
  const response = await api.post('/teachers', data);
  return response.data;
};

export const updateTeacher = async (id: string, data: Partial<Teacher> & { password?: string }): Promise<Teacher> => {
  const response = await api.put(`/teachers/${id}`, data);
  return response.data;
};

export const deleteTeacher = async (id: string): Promise<void> => {
  await api.delete(`/teachers/${id}`);
};

export const getTeacherStatistics = async (filters?: { gender?: string; departmentId?: string; degreeId?: string }): Promise<TeacherStatistics> => {
  const response = await api.get('/teachers/statistics', { params: filters });
  return response.data;
}; 