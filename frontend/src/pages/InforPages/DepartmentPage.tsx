import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Pagination,
  IconButton,
  Grid,
  Snackbar
} from '@mui/material';
import api from '../../services/api';
import { RootState } from '../../store';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
}

interface Department {
  id: string;
  code: string;
  shortName: string;
  fullName: string;
  office: string;
  headId: string | null;
  head?: Teacher | null;
}

const DepartmentPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({
    code: '',
    shortName: '',
    fullName: '',
    office: '',
    headId: ''
  });
  const [formErrors, setFormErrors] = useState({
    code: '',
    shortName: '',
    fullName: '',
    office: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const { user } = useSelector((state: RootState) => state.auth);
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

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments', {
        params: { page, pageSize, search },
      });
      setDepartments(res.data.departments);
      setTotal(res.data.total);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi tải danh sách khoa.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/teachers?pageSize=1000');
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      setTeachers(data.map((t: any) => ({ ...t, fullName: `${t.firstName} ${t.lastName}` })));
    } catch (err) {
      console.error('Error fetching teachers:', err);
      showNotification('Lỗi khi tải danh sách giảng viên.', 'error');
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const openModal = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        code: department.code,
        shortName: department.shortName,
        fullName: department.fullName,
        office: department.office,
        headId: department.headId || ''
      });
    } else {
      setEditingDepartment(null);
      setFormData({
        code: '',
        shortName: '',
        fullName: '',
        office: '',
        headId: ''
      });
    }
    setFormErrors({
      code: '',
      shortName: '',
      fullName: '',
      office: ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khoa này?')) {
      try {
        await api.delete(`/departments/${id}`);
        showNotification('Xóa khoa thành công!');
        fetchDepartments();
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Lỗi khi xóa khoa.';
        showNotification(errorMessage, 'error');
      }
    }
  };

  const validateForm = () => {
    const errors = {
      code: '',
      shortName: '',
      fullName: '',
      office: ''
    };

    if (!formData.code) errors.code = 'Vui lòng nhập mã khoa';
    if (!formData.shortName) errors.shortName = 'Vui lòng nhập tên viết tắt';
    if (!formData.fullName) errors.fullName = 'Vui lòng nhập tên đầy đủ';
    if (!formData.office) errors.office = 'Vui lòng nhập văn phòng';

    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleFinish = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        headId: formData.headId || null
      };

      if (editingDepartment) {
        await api.put(`/departments/${editingDepartment.id}`, submitData);
        showNotification('Cập nhật khoa thành công!');
      } else {
        await api.post('/departments', submitData);
        showNotification('Thêm khoa thành công!');
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi lưu khoa.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api.post('/departments/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showNotification('Import Excel thành công!');
      fetchDepartments();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Import thất bại.';
      showNotification(errorMessage, 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý Khoa
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap'}}>
        <TextField
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
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
              startIcon={<UploadIcon />}
              component="label"
              sx={{ ml: 2 , marginBottom: 2}}
              color="success"
            >
              Import Excel
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
              />
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openModal()}
              sx={{ ml: 2 , marginBottom: 2}}
            >
              Thêm Khoa
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
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã Khoa</TableCell>
                  <TableCell>Tên Viết Tắt</TableCell>
                  <TableCell>Tên Đầy Đủ</TableCell>
                  <TableCell>Văn Phòng</TableCell>
                  <TableCell>Trưởng Khoa</TableCell>
                  {isAdmin && <TableCell>Thao Tác</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>{department.code}</TableCell>
                    <TableCell>{department.shortName}</TableCell>
                    <TableCell>{department.fullName}</TableCell>
                    <TableCell>{department.office}</TableCell>
                    <TableCell>
                      {department.head ? `${department.head.firstName} ${department.head.lastName}` : 'Chưa có'}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <IconButton onClick={() => openModal(department)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(department.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Pagination
              count={Math.ceil(total / pageSize)}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        </>
      )}

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDepartment ? 'Cập nhật Khoa' : 'Thêm Khoa'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Mã Khoa"
              value={formData.code}
              onChange={(e) => handleFormChange('code', e.target.value)}
              placeholder="VD: CNTT"
              error={!!formErrors.code}
              helperText={formErrors.code}
              disabled={!!editingDepartment}
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 20 }}
            />

            <TextField
              fullWidth
              label="Tên Viết Tắt"
              value={formData.shortName}
              onChange={(e) => handleFormChange('shortName', e.target.value)}
              placeholder="VD: IT, EE"
              error={!!formErrors.shortName}
              helperText={formErrors.shortName}
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 20 }}
            />

            <TextField
              fullWidth
              label="Tên Đầy Đủ"
              value={formData.fullName}
              onChange={(e) => handleFormChange('fullName', e.target.value)}
              placeholder="VD: Khoa Công nghệ Thông tin"
              error={!!formErrors.fullName}
              helperText={formErrors.fullName}
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 100 }}
            />

            <TextField
              fullWidth
              label="Văn Phòng"
              value={formData.office}
              onChange={(e) => handleFormChange('office', e.target.value)}
              placeholder="VD: Tầng 2, nhà A1"
              error={!!formErrors.office}
              helperText={formErrors.office}
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 50 }}
            />

            <FormControl fullWidth>
              <InputLabel>Trưởng Khoa</InputLabel>
              <Select
                value={formData.headId}
                onChange={(e) => handleFormChange('headId', e.target.value)}
                label="Trưởng Khoa"
              >
                <MenuItem value="">Chọn trưởng khoa</MenuItem>
                {teachers.map((teacher) => (
                  <MenuItem key={teacher.id} value={teacher.id}>
                    {teacher.fullName} ({teacher.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Hủy</Button>
          <Button onClick={handleFinish} variant="contained" disabled={loading}>
            {editingDepartment ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
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

export default DepartmentPage;
