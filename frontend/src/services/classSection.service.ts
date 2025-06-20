import api from './api';

export const getClassSections = (params?: any) => api.get('/class-sections', { params });
export const getClassSectionById = (id: string) => api.get(`/class-sections/${id}`);
export const updateClassSection = (id: string, data: any) => {
  console.log('🧾 Dữ liệu gửi lên:', data);
  return api.put(`/class-sections/${id}`, data)
    .catch(error => {
      console.error('🚨 Lỗi khi cập nhật lớp học phần:', error);
      throw error;
    });
};

