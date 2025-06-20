import api from './api';

export const getSemesters = (params?: any) => api.get('/semesters', { params });
export const getAcademicYears = () => api.get('/semesters/academic-years');
export const getSemesterById = (id: string) => api.get(`/semesters/${id}`); 