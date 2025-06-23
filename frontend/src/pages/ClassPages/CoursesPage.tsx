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
import { message } from 'antd';

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

// **NEW:** Định nghĩa interface cho phản hồi API của courses
interface CourseApiResponse {
  courses: Course[]; // Đây là mảng các học phần
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === 'ADMIN';

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // **FIX:** API của bạn trả về một đối tượng có thuộc tính 'courses' là một mảng
      const response = await api.get<CourseApiResponse>('/courses');
      // Trích xuất mảng 'courses' từ dữ liệu phản hồi
      if (Array.isArray(response.data.courses)) {
        setCourses(response.data.courses);
      } else {
        console.error('API response for courses is not an array (nested property):', response.data.courses);
        setError('Dữ liệu học phần không đúng định dạng. Vui lòng kiểm tra lại cấu trúc API.');
      }
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError('Lỗi khi tải danh sách học phần.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      // API của bạn trả về một đối tượng có thuộc tính 'departments' là một mảng
      const response = await api.get('/departments/all');
      const departmentsData = Array.isArray(response.data) ? response.data : [];
      // Trích xuất mảng 'departments' từ dữ liệu phản hồi
      if (Array.isArray(departmentsData)) { // Đảm bảo rằng response.data.departments là một mảng
        setDepartments(departmentsData);
      } else {
        console.error('API response for departments is not an array (nested property):', response.data.departments);
        setError('Dữ liệu khoa không đúng định dạng. Vui lòng kiểm tra lại cấu trúc API.');
      }
    } catch (err: any) {
      console.error('Error fetching departments:', err);
      setError('Lỗi khi tải danh sách khoa. Vui lòng thử lại sau.');
    }
  }, []);


  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, [fetchCourses, fetchDepartments]);

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
        message.success('Cập nhật học phần thành công!');
      } else {
        await api.post('/courses', formData);
        message.success('Thêm học phần mới thành công!');
      }
      fetchCourses();
      handleClose();
    } catch (err: any) {
      console.error('Error saving course:', err);
      setError(`Lỗi khi lưu học phần: ${err.response?.data?.message || err.message}`);
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
        message.success('Xóa học phần thành công!');
        fetchCourses();
      } catch (err: any) {
        console.error('Error deleting course:', err);
        setError(`Lỗi khi xóa học phần: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Đang tải dữ liệu...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => { fetchCourses(); fetchDepartments(); }}>Thử lại</Button>
      </Box>
    );
  }


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý Học Phần
      </Typography>
      {isAdmin && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingCourse(null);
            setFormData({ code: '', name: '', credit: 1, departmentId: '' });
            handleOpen();
          }}
          sx={{ mb: 2 }}
        >
          Thêm Học Phần Mới
        </Button>
      )}

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
                  Chưa có học phần nào.
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
                      <IconButton onClick={() => handleEdit(course)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(course.id)}>
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

      <Dialog open={open} onClose={handleClose}>
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
            />
            <TextField
              margin="dense"
              name="name"
              label="Tên Học Phần"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
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
    </Box>
  );
};

export default CoursesPage;
