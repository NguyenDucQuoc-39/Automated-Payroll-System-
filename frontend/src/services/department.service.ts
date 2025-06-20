import api from './api';
import { Department } from '../types/typeFrontend';

export const getDepartments = async (): Promise<Department[]> => {
  const response = await api.get('/departments');
  return response.data;
};

export const getDepartmentById = async (id: string): Promise<Department> => {
  const response = await api.get(`/departments/${id}`);
  return response.data;
};

export const createDepartment = async (data: Omit<Department, 'id' | 'createdAt' | 'updatedAt' | 'head' | 'teachers'>): Promise<Department> => {
  const response = await api.post('/departments', data);
  return response.data;
};

export const updateDepartment = async (id: string, data: Partial<Department> & { headId?: string }): Promise<Department> => {
  const response = await api.put(`/departments/${id}`, data);
  return response.data;
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await api.delete(`/departments/${id}`);
}; 