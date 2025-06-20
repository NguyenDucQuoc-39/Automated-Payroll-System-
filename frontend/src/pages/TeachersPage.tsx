import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  InputAdornment,
  TablePagination,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from '@mui/icons-material';
import api from '../services/api';
import { RootState } from '../store';
import { UploadOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { Gender, Role } from '../types/typeFrontend';

interface Degree {
  id: string;
  type: string;
  fullName: string;
}

interface Department {
  id: string;
  code: string;
  shortName: string;
  fullName: string;
}

interface Teacher {
  id: string;
  orderNumber: number;
  firstName: string;
  lastName: string;
  gender: Gender;
  office: string;
  email: string;
  degreeId: string;
  departmentId: string;
  isHead: boolean;
  degree: Degree;
  department: Department;
  createdAt: string;
  updatedAt: string;
}

interface TeacherFormState {
  id: string;
  orderNumber?: number;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  office: string;
  email: string;
  degreeId: string;
  departmentId: string;
  isHead: boolean;
  password?: string;
}

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [open, setOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<TeacherFormState>({
    id: '',
    orderNumber: undefined,
    firstName: '',
    lastName: '',
    gender: 'MALE',
    office: '',
    email: '',
    degreeId: '',
    departmentId: '',
    isHead: false,
    password: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/teachers', {
        params: {
          page: page + 1,
          pageSize: pageSize,
          search: searchQuery,
        },
      });
      const teachersData = Array.isArray(response.data.teachers) ? response.data.teachers : response.data;
      const total = response.data.totalRecords || response.data.total;

      if (Array.isArray(teachersData)) {
        setTeachers(teachersData);
        setTotalRecords(total || teachersData.length);
      } else {
        console.error("Cấu trúc phản hồi API giáo viên không đúng:", response.data);
        setTeachers([]);
        setTotalRecords(0);
        setError('Lỗi cấu trúc dữ liệu giáo viên từ máy chủ.');
      }
    } catch (err: any) {
      console.error('Error fetching teachers:', err);
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách giáo viên.');
      setTeachers([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchDegrees = async () => {
    try {
      const response = await api.get('/degrees/all');
      const degreesData = Array.isArray(response.data) ? response.data : [];

      if (Array.isArray(degreesData)) {
        setDegrees(degreesData);
      } else {
        console.error("Cấu trúc phản hồi API bằng cấp không đúng:", response.data);
        setDegrees([]);
      }
    } catch (err) {
      console.error('Error fetching degrees:', err);
      setDegrees([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments/all');
      const departmentsData = Array.isArray(response.data) ? response.data : [];

      if (Array.isArray(departmentsData)) {
        setDepartments(departmentsData);
      } else {
        console.error("Cấu trúc phản hồi API khoa không đúng:", response.data);
        setDepartments([]);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [page, pageSize, searchQuery]);

  useEffect(() => {
    fetchDegrees();
    fetchDepartments();
  }, []);

  const handleClickOpen = () => {
    setEditingTeacher(null);
    setFormData({
      id: '',
      orderNumber: undefined,
      firstName: '',
      lastName: '',
      gender: 'MALE',
      office: '',
      email: '',
      degreeId: '',
      departmentId: '',
      isHead: false,
      password: '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string | 'MALE' | 'FEMALE' | 'OTHER'>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingTeacher) {
        const updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          gender: formData.gender,
          office: formData.office,
          email: formData.email,
          degreeId: formData.degreeId,
          departmentId: formData.departmentId,
          isHead: formData.isHead,
        };
        await api.put(`/teachers/${editingTeacher.id}`, updateData);
        message.success('Cập nhật giảng viên thành công!');
      } else {
        const createData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          gender: formData.gender,
          office: formData.office,
          email: formData.email,
          degreeId: formData.degreeId,
          departmentId: formData.departmentId,
          password: formData.password,
          role: 'TEACHER' as Role,
          isHead: formData.isHead,
        };
        await api.post('/teachers', createData);
        message.success('Thêm giảng viên mới thành công!');
      }
      fetchTeachers();
      handleClose();
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.response?.data?.message || 'Lỗi khi lưu giảng viên.');
      setError(err.response?.data?.errors || 'Thông tin giảng viên bị trùng');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      id: teacher.id,
      orderNumber: teacher.orderNumber,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      gender: teacher.gender,
      office: teacher.office,
      email: teacher.email,
      degreeId: teacher.degreeId,
      departmentId: teacher.departmentId,
      isHead: teacher.isHead,
      password: '',
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giảng viên này?')) {
      try {
        setLoading(true);
        await api.delete(`/teachers/${id}`);
        message.success('Xóa giảng viên thành công!');
        fetchTeachers();
      } catch (err: any) {
        console.error('Error deleting teacher:', err);
        message.error(err.response?.data?.message || 'Lỗi khi xóa giảng viên.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      message.error('Vui lòng chọn một file Excel.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    try {
      const response = await api.post('/teachers/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success(response.data.message);
      if (response.data.errors && response.data.errors.length > 0) {
        message.warning(`Có ${response.data.errors.length} lỗi khi import: \n${response.data.errors.join('\n')}`);
      }
      fetchTeachers();
    } catch (err: any) {
      console.error('Lỗi khi import Excel:', err);
      message.error(err.response?.data?.message || 'Lỗi khi import file Excel.');
      if (err.response?.data?.errors && err.response.data.errors.length > 0) {
        const errorDetails = err.response.data.errors.join('\n');
        message.error(`Chi tiết lỗi: \n${errorDetails}`, 10);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Quản lý Giảng Viên
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Tìm kiếm giảng viên"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: '300px' }}
        />
        <Box>
          {isAdmin && (
            <>
              <Button
                variant="contained"
                component="label"
                color="success"
                startIcon={<UploadOutlined />}
                sx={{ mr: 2 }}
              >
                Import Excel
                <input
                  type="file"
                  hidden
                  accept=".xlsx, .xls"
                  onChange={handleImportExcel}
                />
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleClickOpen}
              >
                Thêm Giảng Viên
              </Button>
            </>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Mã Giảng Viên</TableCell>
                  <TableCell>Họ và Tên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Giới Tính</TableCell>
                  <TableCell>Văn Phòng</TableCell>
                  <TableCell>Bằng Cấp</TableCell>
                  <TableCell>Khoa</TableCell>
                  <TableCell>Vai Trò</TableCell>
                  {isAdmin && <TableCell align="right">Hành Động</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {teachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 10 : 9} align="center"> {/* Giảm colSpan */}
                      Không có dữ liệu giảng viên.
                    </TableCell>
                  </TableRow>
                ) : (
                  teachers.map((teacher, index) => (
                    <TableRow key={teacher.id}>
                      <TableCell>{page * pageSize + index + 1}</TableCell>
                      <TableCell>GV{teacher.orderNumber?.toString().padStart(4, '0') || 'N/A'}</TableCell>
                      <TableCell>{teacher.firstName} {teacher.lastName}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.gender === 'MALE' ? 'Nam' : teacher.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</TableCell>
                      <TableCell>{teacher.office}</TableCell>
                      <TableCell>{teacher.degree?.fullName || 'N/A'}</TableCell>
                      <TableCell>{teacher.department?.fullName || 'N/A'}</TableCell>
                      <TableCell>{teacher.isHead ? 'Trưởng Khoa' : 'Giảng Viên'}</TableCell>
                      {isAdmin && (
                        <TableCell align="right">
                          <IconButton onClick={() => handleEdit(teacher)} color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(teacher.id)} color="error">
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

          <TablePagination
            component="div"
            count={totalRecords}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={pageSize}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="Số bản ghi mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `Hiển thị ${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
            }
            backIconButtonProps={{
              'aria-label': 'Trang trước',
              disabled: page === 0,
              onClick: (event) => handleChangePage(event, page - 1),
            }}
            nextIconButtonProps={{
              'aria-label': 'Trang sau',
              disabled: page >= Math.ceil(totalRecords / pageSize) - 1,
              onClick: (event) => handleChangePage(event, page + 1),
            }}
            ActionsComponent={({ count, page, rowsPerPage, onPageChange }) => {
              const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
                onPageChange(event, 0);
              };
              const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
                onPageChange(event, page - 1);
              };
              const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
                onPageChange(event, page + 1);
              };
              const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
                onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
              };

              return (
                <Box sx={{ flexShrink: 0, ml: 2.5 }}>
                  <IconButton
                    onClick={handleFirstPageButtonClick}
                    disabled={page === 0}
                    aria-label="Trang đầu"
                  >
                    <FirstPageIcon />
                  </IconButton>
                  <IconButton
                    onClick={handleBackButtonClick}
                    disabled={page === 0}
                    aria-label="Trang trước"
                  >
                    <KeyboardArrowLeft />
                  </IconButton>
                  <IconButton
                    onClick={handleNextButtonClick}
                    disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                    aria-label="Trang sau"
                  >
                    <KeyboardArrowRight />
                  </IconButton>
                  <IconButton
                    onClick={handleLastPageButtonClick}
                    disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                    aria-label="Trang cuối"
                  >
                    <LastPageIcon />
                  </IconButton>
                </Box>
              );
            }}
          />
        </>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingTeacher ? 'Cập Nhật Giảng Viên' : 'Thêm Giảng Viên Mới'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {editingTeacher && (
              <TextField
                margin="dense"
                name="orderNumber"
                label="Mã Giảng Viên"
                fullWidth
                value={`GV${formData.orderNumber?.toString().padStart(4, '0') || 'N/A'}`}
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  '& .MuiInputBase-input.Mui-readOnly': {
                    backgroundColor: '#f5f5f5',
                    cursor: 'not-allowed',
                  },
                }}
              />
            )}
          
            <TextField
              autoFocus
              margin="dense"
              name="firstName"
              label="Họ"
              fullWidth
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="lastName"
              label="Tên"
              fullWidth
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Giới Tính</InputLabel>
              <Select
                name="gender"
                label="Giới Tính"
                value={formData.gender}
                onChange={(e) => handleChange(e as SelectChangeEvent<"MALE" | "FEMALE" | "OTHER">)}
              >
                <MenuItem value="MALE">Nam</MenuItem>
                <MenuItem value="FEMALE">Nữ</MenuItem>
                <MenuItem value="OTHER">Khác</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              name="office"
              label="Văn Phòng"
              fullWidth
              value={formData.office}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              required
            />
            {!editingTeacher && (
              <TextField
                margin="dense"
                name="password"
                label="Mật khẩu"
                type="password"
                fullWidth
                value={formData.password}
                onChange={handleChange}
                required
              />
            )}
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Bằng Cấp</InputLabel>
              <Select
                name="degreeId"
                label="Bằng cấp"
                value={formData.degreeId}
                onChange={(e) => handleChange(e as SelectChangeEvent<string>)}
              >
                <MenuItem value=""><em>Chọn bằng cấp</em></MenuItem>
                {degrees.map((degree) => (
                  <MenuItem key={degree.id} value={degree.id}>
                    {degree.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Khoa</InputLabel>
              <Select
                name="departmentId"
                label="Khoa"
                value={formData.departmentId}
                onChange={(e) => handleChange(e as SelectChangeEvent<string>)}
              >
                <MenuItem value=""><em>Chọn khoa</em></MenuItem>
                {departments.map((department) => (
                  <MenuItem key={department.id} value={department.id}>
                    {department.fullName} ({department.shortName})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Vai Trò</InputLabel>
              <Select
                name="isHead"
                label="Vai Trò"
                value={formData.isHead ? 'true' : 'false'}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    isHead: e.target.value === 'true'
                  }));
                }}
              >
                <MenuItem value="false">Giảng Viên</MenuItem>
                <MenuItem value="true">Trưởng Khoa</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {editingTeacher ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Teachers;
