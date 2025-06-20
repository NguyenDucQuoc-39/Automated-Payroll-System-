import api from './api';

export const getLessonCoefficients = () => api.get('/lesson-coefficients');
export const getLessonCoefficientById = (id: string) => api.get(`/lesson-coefficients/${id}`);
export const createLessonCoefficient = (data: any) => api.post('/lesson-coefficients', data);
export const updateLessonCoefficient = (id: string, data: any) => api.put(`/lesson-coefficients/${id}`, data);
export const deleteLessonCoefficient = (id: string) => api.delete(`/lesson-coefficients/${id}`); 