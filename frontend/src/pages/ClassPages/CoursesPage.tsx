import React, { useEffect, useState, useCallback } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Pagination,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  InputAdornment,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';

// Định nghĩa lại interface Department để khớp với cấu trúc bạn nhận được
interface Department {
  id: string;
  code: string;
  shortName: string;
  fullName: string;
  office: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
  credit: number;
  totalHours: number;
  departmentId: string;
  department: {
    id: string;
    fullName: string;
  };
}

// Định nghĩa interface cho phản hồi API của departments nếu nó có cấu trúc phân trang
interface DepartmentApiResponse {
  departments: Department[]; // Đây là mảng các khoa
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// **SỬA:** Định nghĩa interface cho phản hồi API của courses theo cấu trúc thực tế từ backend
interface CourseApiResponse {
  courses: Course[]; // Đây là mảng các học phần
  totalCount: number; // Tổng số học phần
  currentPage: number; // Trang hiện tại
  totalPages: number; // Tổng số trang
}

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [open, setOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credit: 1,
    departmentId: '',
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === 'ADMIN';

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { [key: string]: string } = {
        page: String(page),
        pageSize: String(pageSize),
      };
      if (searchQuery) params.search = searchQuery;

      console.log('Gọi API với params:', params); // Debug log

      const response = await api.get<CourseApiResponse>('/courses', { params });
      
      console.log('Response từ API:', response.data); // Debug log
      
      if (response.data.courses && Array.isArray(response.data.courses)) {
        setCourses(response.data.courses);
        // **SỬA:** Sử dụng totalCount từ API thay vì total
        setTotal(response.data.totalCount || 0);
        console.log('Đã set courses:', response.data.courses.length, 'tổng:', response.data.totalCount);
      } else {
        console.error('API response for courses không đúng định dạng:', response.data);
        setError('Dữ liệu học phần không đúng định dạng. Vui lòng kiểm tra lại cấu trúc API.');
      }
    } catch (err: any) {
      console.error('Lỗi khi fetch courses:', err);
      const errorMessage = err.response?.data?.message || 'Lỗi khi tải danh sách học phần.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery]);

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await api.get('/departments/all');
      const departmentsData = Array.isArray(response.data) ? response.data : [];
      
      if (Array.isArray(departmentsData)) {
        setDepartments(departmentsData);
        console.log('Đã load departments:', departmentsData.length);
      } else {
        console.error('API response for departments không đúng định dạng:', response.data);
        setError('Dữ liệu khoa không đúng định dạng. Vui lòng kiểm tra lại cấu trúc API.');
      }
    } catch (err: any) {
      console.error('Lỗi khi fetch departments:', err);
      const errorMessage = 'Lỗi khi tải danh sách khoa. Vui lòng thử lại sau.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCourse(null);
    setFormData({ code: '', name: '', credit: 1, departmentId: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, formData);
        showNotification('Cập nhật học phần thành công!');
      } else {
        await api.post('/courses', formData);
        showNotification('Thêm học phần mới thành công!');
      }
      fetchCourses();
      handleClose();
    } catch (err: any) {
      console.error('Lỗi khi lưu course:', err);
      const errorMessage = err.response?.data?.message || 'Lỗi khi lưu học phần.';
      showNotification(errorMessage, 'error');
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      name: course.name,
      credit: course.credit,
      departmentId: course.departmentId,
    });
    handleOpen();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa học phần này không?')) {
      try {
        await api.delete(`/courses/${id}`);
        showNotification('Xóa học phần thành công!');
        fetchCourses();
      } catch (err: any) {
        console.error('Lỗi khi xóa course:', err);
        const errorMessage = err.response?.data?.message || 'Lỗi khi xóa học phần.';
        showNotification(errorMessage, 'error');
      }
    }
  };

  if (loading && courses.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Đang tải dữ liệu...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý Học Phần
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap'}}>
        <TextField
          placeholder="Tìm kiếm học phần..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          size="small"
          sx={{ minWidth: 400 }}
        />

        {isAdmin && (
          <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingCourse(null);
              setFormData({ code: '', name: '', credit: 1, departmentId: '' });
              handleOpen();
            }}
            sx={{ ml: 2 , marginBottom: 2}}
            color="primary"
            >
              Thêm Học Phần Mới
            </Button>
          </Box>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Mã Học Phần</TableCell>
                  <TableCell>Tên Học Phần</TableCell>
                  <TableCell>Số Tín Chỉ</TableCell>
                  <TableCell>Số Tiết</TableCell>
                  <TableCell>Khoa</TableCell>
                  {isAdmin && <TableCell align="center">Hành Động</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 6 : 5} align="center">
                      {searchQuery ? 'Không tìm thấy học phần nào phù hợp.' : 'Chưa có học phần nào.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => (
                    <TableRow
                      key={course.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {course.code}
                      </TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{course.credit}</TableCell>
                      <TableCell>{course.totalHours}</TableCell>
                      <TableCell>{course.department?.fullName}</TableCell>
                      {isAdmin && (
                        <TableCell align="center">
                          <IconButton color="primary" onClick={() => handleEdit(course)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDelete(course.id)}>
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

          {/* **SỬA:** Hiển thị pagination khi có dữ liệu và tổng số > pageSize */}
          {total > 0 && total > pageSize && (
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Pagination
                count={Math.ceil(total / pageSize)}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}

          {/* Debug info - có thể xóa sau khi test xong */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Debug: Hiển thị {courses.length} học phần, Tổng: {total}, Trang: {page}, PageSize: {pageSize}
            </Typography>
          </Box>
        </>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCourse ? 'Cập nhật Học Phần' : 'Thêm Học Phần Mới'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="code"
              label="Mã Học Phần"
              fullWidth
              value={formData.code}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="name"
              label="Tên Học Phần"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Số tín chỉ"
              type="number"
              fullWidth
              inputProps={{ min: 1 }}
              value={formData.credit}
              onChange={(e) => setFormData({ ...formData, credit: Number(e.target.value) })}
              required
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="department-select-label">Khoa</InputLabel>
              <Select
                labelId="department-select-label"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                required
              >
                {departments.length > 0 ? (
                  departments.map((department) => (
                    <MenuItem key={department.id} value={department.id}>
                      {department.fullName}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    Không có khoa nào
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button type="submit" variant="contained">
              {editingCourse ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CoursesPage;
