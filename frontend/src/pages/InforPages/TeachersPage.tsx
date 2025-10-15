import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
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
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Typography,
  Box,
  CircularProgress,
  Pagination,
  IconButton,
  Grid,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import api from '../../services/api';
import { RootState } from '../../store';
import { Gender, Role } from '../../types/typeFrontend';

type Degree = {
  id: string;
  fullName: string;
};

type Department = {
  id: string;
  fullName: string;
  shortName: string;
};

type Teacher = {
  id: string;
  orderNumber: number;
  firstName: string;
  lastName: string;
  gender: Gender;
  office: string;
  email: string;
  degree?: Degree;
  department?: Department;
  isHead: boolean;
  phone?: string;
  birthDate?: string;
};

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedDegree, setSelectedDegree] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    phone: '',
    birthDate: '',
    office: '',
    email: '',
    password: '',
    degreeId: '',
    departmentId: '',
    isHead: ''
  });
  const [formErrors, setFormErrors] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    phone: '',
    birthDate: '',
    office: '',
    email: '',
    password: '',
    degreeId: '',
    departmentId: '',
    isHead: ''
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

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teachers', { params: { page, pageSize, search: searchQuery, departmentId: selectedDepartment, degreeId: selectedDegree } });
      const data = res.data.teachers || res.data;
      setTeachers(data);
      setTotal(res.data.totalRecords || res.data.total || data.length);
    } catch (err: any) {
      const errorMessage = 'Lỗi khi tải danh sách giảng viên.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [page, pageSize, searchQuery, selectedDepartment, selectedDegree]);

  useEffect(() => {
    api.get('/degrees/all').then(res => setDegrees(res.data || []));
    api.get('/departments/all').then(res => setDepartments(res.data || []));
  }, []);

  const validateForm = () => {
    const errors = {
      firstName: '',
      lastName: '',
      gender: '',
      phone: '',
      birthDate: '',
      office: '',
      email: '',
      password: '',
      degreeId: '',
      departmentId: '',
      isHead: ''
    };

    if (!formData.firstName) errors.firstName = 'Nhập họ';
    if (!formData.lastName) errors.lastName = 'Nhập tên';
    if (!formData.gender) errors.gender = 'Chọn giới tính';
    if (!formData.phone) errors.phone = 'Vui lòng nhập số điện thoại';
    if (!/^\d{11}$/.test(formData.phone)) errors.phone = 'Số điện thoại phải đúng 11 số, không chứa chữ cái hoặc ký tự đặc biệt';
    if (!formData.birthDate) errors.birthDate = 'Vui lòng chọn ngày sinh';
    if (formData.birthDate) {
      const today = new Date();
      const birth = new Date(formData.birthDate);
      const seventyYearsAgo = new Date(today.getFullYear() - 70, today.getMonth(), today.getDate());
      if (birth > today) {
        errors.birthDate = 'Ngày sinh không được ở trong tương lai';
      }
      if (birth < seventyYearsAgo) {
        errors.birthDate = 'Ngày sinh không được quá 70 năm trước';
      }
    }
    if (!formData.office) errors.office = 'Nhập văn phòng';
    if (!formData.email) errors.email = 'Nhập email';
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email không hợp lệ';
    if (!editingTeacher && !formData.password) errors.password = 'Nhập mật khẩu';
    if (!formData.degreeId) errors.degreeId = 'Chọn bằng cấp';
    if (!formData.departmentId) errors.departmentId = 'Chọn khoa';
    if (!formData.isHead) errors.isHead = 'Chọn vai trò';

    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleEdit = (teacher: any) => {
    setEditingTeacher(teacher);
    setFormData({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      gender: teacher.gender,
      phone: teacher.phone || '',
      birthDate: teacher.birthDate ? teacher.birthDate.split('T')[0] : '',
      office: teacher.office,
      email: teacher.email,
      password: '',
      degreeId: teacher.degreeId || teacher.degree?.id || '',
      departmentId: teacher.departmentId || teacher.department?.id || '',
      isHead: teacher.isHead ? 'true' : 'false'
    });
    setFormErrors({
      firstName: '',
      lastName: '',
      gender: '',
      phone: '',
      birthDate: '',
      office: '',
      email: '',
      password: '',
      degreeId: '',
      departmentId: '',
      isHead: ''
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giảng viên này?')) {
      try {
        await api.delete(`/teachers/${id}`);
        showNotification('Xóa giảng viên thành công!');
        fetchTeachers();
      } catch (err: any) {
        const errorMessage = 'Lỗi khi xóa giảng viên.';
        showNotification(errorMessage, 'error');
      }
    }
  };

  const handleFinish = async () => {
    if (!validateForm()) {
      showNotification('Vui lòng kiểm tra lại thông tin nhập vào.', 'warning');
      return;
    }

    try {
      const submitData = {
        ...formData,
        isHead: formData.isHead === 'true',
        phone: formData.phone,
        birthDate: formData.birthDate,
      };

      if (editingTeacher) {
        await api.put(`/teachers/${editingTeacher.id}`, submitData);
        showNotification('Cập nhật giảng viên thành công!');
      } else {
        await api.post('/teachers', {
          ...submitData,
          role: 'TEACHER',
        });
        showNotification('Thêm giảng viên thành công!');
      }
      setOpen(false);
      fetchTeachers();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Lỗi xử lý.';
      showNotification(errorMessage, 'error');
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAdd = () => {
    setEditingTeacher(null);
    setFormData({
      firstName: '',
      lastName: '',
      gender: '',
      phone: '',
      birthDate: '',
      office: '',
      email: '',
      password: '',
      degreeId: '',
      departmentId: '',
      isHead: ''
    });
    setFormErrors({
      firstName: '',
      lastName: '',
      gender: '',
      phone: '',
      birthDate: '',
      office: '',
      email: '',
      password: '',
      degreeId: '',
      departmentId: '',
      isHead: ''
    });
    setOpen(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api.post('/teachers/import', formData);
      showNotification('Import Excel thành công!');
      fetchTeachers();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Import lỗi';
      showNotification(errorMessage, 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý Giảng Viên
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          size="small"
          sx={{ minWidth: 400 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Chọn khoa</InputLabel>
          <Select
            value={selectedDepartment || ''}
            onChange={(e) => {
              setSelectedDepartment(e.target.value || null);
              setPage(1);
            }}
            label="Chọn khoa"
          >
            <MenuItem value="">Tất cả khoa</MenuItem>
            {departments.map((d) => (
              <MenuItem key={d.id} value={d.id}>{d.fullName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Chọn bằng cấp</InputLabel>
          <Select
            value={selectedDegree || ''}
            onChange={(e) => {
              setSelectedDegree(e.target.value || null);
              setPage(1);
            }}
            label="Chọn bằng cấp"
          >
            <MenuItem value="">Tất cả bằng cấp</MenuItem>
            {degrees.map((d) => (
              <MenuItem key={d.id} value={d.id}>{d.fullName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {isAdmin && (
          <>
            {/* <Button
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
            </Button> */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              sx={{ ml: 2 , marginBottom: 2}}
            >
              Thêm Giảng Viên
            </Button>
          </>
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
                  <TableCell>Mã GV</TableCell>
                  <TableCell>Họ và Tên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Giới Tính</TableCell>
                  <TableCell>Số Điện Thoại</TableCell>
                  <TableCell>Ngày Sinh</TableCell>
                  <TableCell>Văn Phòng</TableCell>
                  <TableCell>Bằng Cấp</TableCell>
                  <TableCell>Khoa</TableCell>
                  <TableCell>Vai Trò</TableCell>
                  {isAdmin && <TableCell>Hành Động</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>GV{teacher.orderNumber?.toString().padStart(4, '0')}</TableCell>
                    <TableCell>{`${teacher.firstName} ${teacher.lastName}`}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>
                      {teacher.gender === 'MALE' ? 'Nam' : teacher.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                    </TableCell>
                    <TableCell>{teacher.phone || 'N/A'}</TableCell>
                    <TableCell>
                      {teacher.birthDate ? new Date(teacher.birthDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>{teacher.office}</TableCell>
                    <TableCell>{teacher.degree?.fullName || 'N/A'}</TableCell>
                    <TableCell>{teacher.department?.fullName || 'N/A'}</TableCell>
                    <TableCell>{teacher.isHead ? 'Trưởng Khoa' : 'Giảng Viên'}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <IconButton onClick={() => handleEdit(teacher)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(teacher.id)} color="error">
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTeacher ? 'Cập nhật giảng viên' : 'Thêm giảng viên mới'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              {editingTeacher && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mã GV"
                    value={`GV${editingTeacher.orderNumber?.toString().padStart(4, '0')}`}
                    disabled
                  />
                </Grid>
              )}

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Họ"
                  value={formData.firstName}
                  onChange={(e) => handleFormChange('firstName', e.target.value)}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Tên"
                  value={formData.lastName}
                  onChange={(e) => handleFormChange('lastName', e.target.value)}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                />
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth error={!!formErrors.gender}>
                  <InputLabel>Giới tính</InputLabel>
                  <Select
                    value={formData.gender}
                    onChange={(e) => handleFormChange('gender', e.target.value)}
                    label="Giới tính"
                  >
                    <MenuItem value="MALE">Nam</MenuItem>
                    <MenuItem value="FEMALE">Nữ</MenuItem>
                    <MenuItem value="OTHER">Khác</MenuItem>
                  </Select>
                  {formErrors.gender && (
                    <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                      {formErrors.gender}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                  inputProps={{ maxLength: 11 }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Ngày sinh"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleFormChange('birthDate', e.target.value)}
                  error={!!formErrors.birthDate}
                  helperText={formErrors.birthDate}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Văn phòng"
                  value={formData.office}
                  onChange={(e) => handleFormChange('office', e.target.value)}
                  error={!!formErrors.office}
                  helperText={formErrors.office}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
              </Grid>

              {!editingTeacher && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mật khẩu"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleFormChange('password', e.target.value)}
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                  />
                </Grid>
              )}

              <Grid item xs={6}>
                <FormControl fullWidth error={!!formErrors.degreeId}>
                  <InputLabel>Bằng cấp</InputLabel>
                  <Select
                    value={formData.degreeId}
                    onChange={(e) => handleFormChange('degreeId', e.target.value)}
                    label="Bằng cấp"
                  >
                    {degrees.map((d: any) => (
                      <MenuItem key={d.id} value={d.id}>{d.fullName}</MenuItem>
                    ))}
                  </Select>
                  {formErrors.degreeId && (
                    <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                      {formErrors.degreeId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth error={!!formErrors.departmentId}>
                  <InputLabel>Khoa</InputLabel>
                  <Select
                    value={formData.departmentId}
                    onChange={(e) => handleFormChange('departmentId', e.target.value)}
                    label="Khoa"
                  >
                    {departments.map((d: any) => (
                      <MenuItem key={d.id} value={d.id}>
                        {d.fullName} ({d.shortName})
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.departmentId && (
                    <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                      {formErrors.departmentId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth error={!!formErrors.isHead}>
                  <InputLabel>Vai trò</InputLabel>
                  <Select
                    value={formData.isHead}
                    onChange={(e) => handleFormChange('isHead', e.target.value)}
                    label="Vai trò"
                  >
                    <MenuItem value="false">Giảng Viên</MenuItem>
                    <MenuItem value="true">Trưởng Khoa</MenuItem>
                  </Select>
                  {formErrors.isHead && (
                    <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                      {formErrors.isHead}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button onClick={handleFinish} variant="contained">
            {editingTeacher ? 'Cập nhật' : 'Thêm'}
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

export default Teachers;
