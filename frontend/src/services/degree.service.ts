import api from './api';
import { Degree } from '../types/typeFrontend';

export const getDegrees = async (): Promise<Degree[]> => {
  const response = await api.get('/degrees');
  return response.data;
};

export const getDegreeById = async (id: string): Promise<Degree> => {
  const response = await api.get(`/degrees/${id}`);
  return response.data;
};

export const createDegree = async (data: Omit<Degree, 'id' | 'createdAt' | 'updatedAt'>): Promise<Degree> => {
  const response = await api.post('/degrees', data);
  return response.data;
};

export const updateDegree = async (id: string, data: Partial<Degree>): Promise<Degree> => {
  const response = await api.put(`/degrees/${id}`, data);
  return response.data;
};

export const deleteDegree = async (id: string): Promise<void> => {
  await api.delete(`/degrees/${id}`);
}; 