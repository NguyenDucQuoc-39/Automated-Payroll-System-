import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import api from '../../services/api';
import { RootState } from '../../store';
import { message } from 'antd';
import { CreateSemesterInput, UpdateSemesterInput, Semester } from '../../types/typeFrontend';

const SEMESTER_NAMES = [
  'Học Kì 1',
  'Học Kì 2',
  'Học Kì 3',
  'Học Kì Hè'
];

const SemestersPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [open, setOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [formData, setFormData] = useState<CreateSemesterInput | UpdateSemesterInput>({
    name: '',
    academicYear: '',
    startDate: '',
    endDate: '',
  });
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSemesters();
    fetchAcademicYears();
  }, [selectedAcademicYear]);

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = selectedAcademicYear ? { academicYear: selectedAcademicYear } : {};
      const response = await api.get('/semesters', { params });
      setSemesters(response.data);
    } catch (err: any) {
      console.error('Error fetching semesters:', err);
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách học kỳ.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await api.get('/semesters/academic-years');
      setAcademicYears(response.data);
    } catch (err: any) {
      console.error('Error fetching academic years:', err);
    }
  };

  const handleOpen = (semester?: Semester) => {
    setError(null);
    if (semester) {
      setEditingSemester(semester);
      setFormData({
        name: semester.name,
        academicYear: semester.academicYear,
        startDate: semester.startDate.split('T')[0],
        endDate: semester.endDate.split('T')[0],
      });
    } else {
      setEditingSemester(null);
      setFormData({
        name: '',
        academicYear: '',
        startDate: '',
        endDate: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingSemester(null);
    setFormData({
      name: '',
      academicYear: '',
      startDate: '',
      endDate: '',
    });
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAcademicYearFilterChange = (e: SelectChangeEvent) => {
    setSelectedAcademicYear(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.academicYear) {
      setError('Vui lòng nhập năm học');
      return;
    }

    const startDateTime = new Date(formData.startDate || '');
    const endDateTime = new Date(formData.endDate || '');

    // Kiểm tra năm học
    const academicYearParts = formData.academicYear.split('-');
    if (academicYearParts.length !== 2) {
      setError('Năm học không hợp lệ. Vui lòng nhập theo định dạng YYYY-YYYY (ví dụ: 2023-2024)');
      return;
    }

    const startYear = parseInt(academicYearParts[0]);
    const endYear = parseInt(academicYearParts[1]);

    if (isNaN(startYear) || isNaN(endYear) || endYear !== startYear + 1) {
      setError('Năm học không hợp lệ. Vui lòng nhập theo định dạng YYYY-YYYY (ví dụ: 2023-2024)');
      return;
    }

    // Kiểm tra ngày bắt đầu và kết thúc có nằm trong năm học không
    const startYearOfSemester = startDateTime.getFullYear();
    const endYearOfSemester = endDateTime.getFullYear();

    if (startYearOfSemester < startYear || startYearOfSemester > endYear || 
        endYearOfSemester < startYear || endYearOfSemester > endYear) {
      setError(`Ngày bắt đầu và kết thúc phải nằm trong năm học ${formData.academicYear}`);
      return;
    }

    if (startDateTime >= endDateTime) {
      setError('Ngày bắt đầu phải trước ngày kết thúc.');
      return;
    }

    const diffTime = Math.abs(endDateTime.getTime() - startDateTime.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 60) {
      setError('Thời lượng học kì phải tối thiểu 60 ngày.');
      return;
    }

    try {
      if (editingSemester) {
        await api.put(`/semesters/${editingSemester.id}`, formData);
        message.success('Cập nhật học kỳ thành công!');
      } else {
        await api.post('/semesters', formData);
        message.success('Thêm học kỳ mới thành công!');
      }
      handleClose();
      fetchSemesters();
      fetchAcademicYears();
    } catch (err: any) {
      console.error('Error saving semester:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Không thể thực hiện thao tác.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa học kỳ này không?')) {
      return;
    }
    setError(null);
    try {
      await api.delete(`/semesters/${id}`);
      message.success('Xóa học kỳ thành công!');
      fetchSemesters();
      fetchAcademicYears();
    } catch (err: any) {
      console.error('Error deleting semester:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Không thể xóa học kỳ.');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý Học Kì
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 , gap: 2, flexWrap: 'wrap'}}>
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Lọc theo Năm học</InputLabel>
          <Select
            value={selectedAcademicYear}
            label="Lọc theo Năm học"
            onChange={handleAcademicYearFilterChange}
          >
            <MenuItem value="">
              <em>Tất cả</em>
            </MenuItem>
            {academicYears.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {isAdmin && (
          <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" 
          color="primary" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpen()}
          sx={{ ml:2 , marginBottom: 2}}
          >
            Thêm Học Kì mới
          </Button>
          </Box>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Tên Học Kì</TableCell>
                <TableCell>Năm Học</TableCell>
                <TableCell>Ngày Bắt Đầu</TableCell>
                <TableCell>Ngày Kết Thúc</TableCell>
                {isAdmin && <TableCell align="right">Thao tác</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {semesters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} align="center">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                semesters.map((semester, index) => (
                  <TableRow key={semester.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{semester.name}</TableCell>
                    <TableCell>{semester.academicYear}</TableCell>
                    <TableCell>{formatDate(semester.startDate)}</TableCell>
                    <TableCell>{formatDate(semester.endDate)}</TableCell>
                    {isAdmin && (
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpen(semester)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(semester.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSemester ? 'Chỉnh sửa Học Kì' : 'Thêm Học Kì mới'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tên Học Kì</InputLabel>
              <Select
                name="name"
                value={formData.name}
                label="Tên Học Kì"
                onChange={handleChange}
                required
              >
                {SEMESTER_NAMES.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Năm Học"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              placeholder="VD: 2023-2024"
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Ngày Bắt Đầu"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Ngày Kết Thúc"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingSemester ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SemestersPage;
