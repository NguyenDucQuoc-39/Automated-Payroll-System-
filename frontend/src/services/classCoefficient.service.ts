import api from './api';

export const getClassCoefficients = () => api.get('/class-coefficients');
export const getClassCoefficientById = (id: string) => api.get(`/class-coefficients/${id}`);
export const createClassCoefficient = (data: any) => api.post('/class-coefficients', data);
export const updateClassCoefficient = (id: string, data: any) => api.put(`/class-coefficients/${id}`, data);
export const deleteClassCoefficient = (id: string) => api.delete(`/class-coefficients/${id}`); 