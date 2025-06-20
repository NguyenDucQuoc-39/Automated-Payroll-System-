import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { UploadOutlined } from '@ant-design/icons';
import { message } from 'antd';

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
  InputAdornment,
  CircularProgress,
  Alert,
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
import { RootState } from '../store';
import api from '../services/api';

// Định nghĩa lại interface Department và Teacher để khớp với Prisma và các trường bạn muốn hiển thị
interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string; // Thêm trường fullName để tiện hiển thị
  isHead?: boolean;
}

interface Department {
  id: string;
  code: string;
  shortName: string;
  fullName: string;
  office: string;
  headId: string | null;
  head?: Teacher | null; // teacher detail can be null if no head
}

interface DepartmentFormState {
  code: string;
  shortName: string;
  fullName: string;
  office: string;
  headId: string | null;
}

const DepartmentPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [open, setOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentFormState>({
    code: '',
    shortName: '',
    fullName: '',
    office: '',
    headId: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ====== States cho Phân trang ======
  const [page, setPage] = useState(0); // Trang hiện tại (0-indexed cho Material-UI TablePagination)
  const [pageSize, setPageSize] = useState(10); // Số bản ghi mỗi trang
  const [totalRecords, setTotalRecords] = useState(0); // Tổng số bản ghi

  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/departments', {
        params: {
          page: page + 1, // Gửi page + 1 vì backend mong đợi 1-indexed
          pageSize: pageSize,
          search: searchQuery, // Thêm tham số tìm kiếm
        },
      });

      // SỬA TẠI ĐÂY: Điều chỉnh để khớp với cấu trúc phản hồi backend
      // Backend trả về: {departments: Array(10), total: 31, page: 1, limit: 10, totalPages: 4}
      if (response.data && Array.isArray(response.data.departments) && typeof response.data.total === 'number') {
        setDepartments(response.data.departments);
        setTotalRecords(response.data.total);
      } else {
        console.error("Cấu trúc phản hồi API khoa không đúng:", response.data);
        setDepartments([]);
        setTotalRecords(0);
        setError('Lỗi cấu trúc dữ liệu khoa từ máy chủ.');
      }
    } catch (err: any) {
      console.error('Error fetching departments:', err);
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách khoa.');
      setDepartments([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/teachers?pageSize=1000');
      // SỬA TẠI ĐÂY: Điều chỉnh để khớp với cấu trúc phản hồi backend cho teachers
      // Giả định response.data là mảng giáo viên trực tiếp, hoặc có thể là { data: [...] }
      const teachersData = Array.isArray(response.data) ? response.data : response.data.data;

      if (Array.isArray(teachersData)) {
        const teachersWithFullName = teachersData.map((t: any) => ({
          ...t,
          fullName: `${t.firstName} ${t.lastName}`,
        }));
        setTeachers(teachersWithFullName);
      } else {
        console.error("Cấu trúc phản hồi API giáo viên không đúng:", response.data);
        setTeachers([]);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
      // Có thể đặt một thông báo lỗi cho người dùng nếu cần
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [page, pageSize, searchQuery]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleClickOpen = () => {
    setEditingDepartment(null);
    setFormData({
      code: '',
      shortName: '',
      fullName: '',
      office: '',
      headId: null,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? null : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingDepartment) {
        await api.put(`/departments/${editingDepartment.id}`, formData);
        message.success('Cập nhật khoa thành công!');
      } else {
        await api.post('/departments', formData);
        message.success('Thêm khoa thành công!');
      }
      fetchDepartments();
      handleClose();
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.response?.data?.message || 'Lỗi khi lưu khoa.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      code: department.code,
      shortName: department.shortName,
      fullName: department.fullName,
      office: department.office,
      headId: department.headId || null,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khoa này?')) {
      try {
        await api.delete(`/departments/${id}`);
        message.success('Xóa khoa thành công!');
        fetchDepartments();
      } catch (err: any) {
        console.error('Error deleting department:', err);
        message.error(err.response?.data?.message || 'Lỗi khi xóa khoa.');
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
      const response = await api.post('/departments/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success(response.data.message);
      if (response.data.errors && response.data.errors.length > 0) {
        message.warning(`Có ${response.data.errors.length} lỗi khi import: \n${response.data.errors.join('\n')}`);
      }
      fetchDepartments();
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
        Quản Lý Khoa
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Tìm kiếm khoa"
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
                Thêm Khoa
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
                  <TableCell>Mã Khoa</TableCell>
                  <TableCell>Tên Viết Tắt</TableCell>
                  <TableCell align="center">Tên Đầy Đủ</TableCell>
                  <TableCell>Văn Phòng</TableCell>
                  <TableCell>Trưởng Khoa</TableCell>
                  {isAdmin && <TableCell align="right">Hành Động</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 7 : 6} align="center">
                      Không có dữ liệu khoa.
                    </TableCell>
                  </TableRow>
                ) : (
                  departments.map((department, index) => (
                    <TableRow key={department.id}>
                      <TableCell>{page * pageSize + index + 1}</TableCell>
                      <TableCell>{department.code}</TableCell>
                      <TableCell>{department.shortName}</TableCell>
                      <TableCell align="center">{department.fullName}</TableCell>
                      <TableCell>{department.office}</TableCell>
                      <TableCell>
                        {department.head ? `${department.head.firstName} ${department.head.lastName} ` : 'Chưa có'}
                      </TableCell>
                      {isAdmin && (
                        <TableCell align="right">
                          <IconButton onClick={() => handleEdit(department)} color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(department.id)} color="error">
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
        <DialogTitle>{editingDepartment ? 'Cập Nhật Khoa' : 'Thêm Khoa Mới'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              autoFocus
              margin="dense"
              name="code"
              label="Mã Khoa"
              fullWidth
              value={formData.code}
              onChange={handleChange}
              required
              disabled={!!editingDepartment}
            />
            <TextField
              margin="dense"
              name="shortName"
              label="Tên Viết Tắt"
              fullWidth
              value={formData.shortName}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="fullName"
              label="Tên Đầy Đủ"
              fullWidth
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="office"
              label="Văn Phòng Khoa"
              fullWidth
              value={formData.office}
              onChange={handleChange}
              required
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Trưởng Khoa</InputLabel>
              <Select
                name="headId"
                value={formData.headId || ''}
                label="Trưởng Khoa"
                onChange={handleSelectChange}
              >
                <MenuItem value="">
                  <em>Chưa có</em>
                </MenuItem>
                {teachers.map((teacher) => (
                  <MenuItem key={teacher.id} value={teacher.id}>
                    {teacher.fullName} ({teacher.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {editingDepartment ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default DepartmentPage;
