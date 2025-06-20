import api from './api';

export const getDegreeCoefficients = () => api.get('/degree-coefficients');
export const getDegreeCoefficientById = (id: string) => api.get(`/degree-coefficients/${id}`);
export const createDegreeCoefficient = (data: any) => api.post('/degree-coefficients', data);
export const updateDegreeCoefficient = (id: string, data: any) => api.put(`/degree-coefficients/${id}`, data);
export const deleteDegreeCoefficient = (id: string) => api.delete(`/degree-coefficients/${id}`); 