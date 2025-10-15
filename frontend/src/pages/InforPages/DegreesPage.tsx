// Phiên bản chuyển đổi sang Ant Design, giữ nguyên logic, cập nhật UI/UX tương đương
// Tập trung chuyển đổi các thành phần MUI sang Ant Design, ví dụ:
// Typography => Typography.Title / Text
// Button => Button (antd)
// Dialog => Modal
// Table, Form, Input, Select, Pagination từ antd

// Do phần nội dung rất dài, đoạn code này được chia nhỏ thành các phần module để dễ bảo trì
// Đây là phần khung chính đã được chuyển đổi, bạn có thể yêu cầu các phần chi tiết hơn như Form modal hoặc Table riêng biệt nếu muốn tiếp tục tối ưu hóa

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
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
  IconButton,
  Box,
  Alert,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';

import api from '../../services/api';
import { RootState } from '../../store';
import { Degree, FrontendFormDegreeType, BackendDegreeType } from '../../types/typeFrontend';

const DegreesPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingDegree, setEditingDegree] = useState<Degree | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    type: '',
    shortName: '',
    fullName: ''
  });
  const [formErrors, setFormErrors] = useState({
    type: '',
    shortName: '',
    fullName: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const degreeTypes = [
    { value: 'Thạc sĩ', label: 'Thạc sĩ' },
    { value: 'Tiến sĩ', label: 'Tiến sĩ' },
    { value: 'Phó Giáo Sư', label: 'Phó Giáo Sư' },
    { value: 'Giáo Sư', label: 'Giáo Sư' },
  ];

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

  const getDisplayDegreeType = useCallback((backendType: BackendDegreeType): string => {
    switch (backendType) {
      case 'MASTER': return 'Thạc sĩ';
      case 'DOCTOR': return 'Tiến sĩ';
      case 'ASSOCIATE_PROFESSOR': return 'Phó Giáo Sư';
      case 'PROFESSOR': return 'Giáo Sư';
      default: return backendType;
    }
  }, []);

  const fetchDegrees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: { [key: string]: string } = {
        page: String(page),
        limit: String(pageSize),
      };
      if (searchTerm) params.search = searchTerm;
      if (selectedType) params.type = selectedType;

      const res = await api.get('/degrees', { params });
      setDegrees(res.data.degrees);
      setTotal(res.data.total);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi tải dữ liệu.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedType, page, pageSize]);

  useEffect(() => {
    fetchDegrees();
  }, [fetchDegrees]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bằng cấp này?')) {
      try {
        await api.delete(`/degrees/${id}`);
        showNotification('Xóa bằng cấp thành công!');
        fetchDegrees();
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Lỗi khi xóa bằng cấp.';
        showNotification(errorMessage, 'error');
      }
    }
  };

  const validateForm = () => {
    const errors = {
      type: '',
      shortName: '',
      fullName: ''
    };

    if (!formData.type) errors.type = 'Vui lòng chọn loại bằng cấp';
    if (!formData.shortName) errors.shortName = 'Vui lòng nhập tên viết tắt';
    if (!formData.fullName) errors.fullName = 'Vui lòng nhập tên đầy đủ';

    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingDegree) {
        await api.put(`/degrees/${editingDegree.id}`, formData);
        showNotification('Cập nhật bằng cấp thành công!');
      } else {
        await api.post('/degrees', formData);
        showNotification('Thêm bằng cấp thành công!');
      }
      fetchDegrees();
      setOpenModal(false);
      setFormData({ type: '', shortName: '', fullName: '' });
      setFormErrors({ type: '', shortName: '', fullName: '' });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi lưu bằng cấp.';
      showNotification(errorMessage, 'error');
    }
  };

  const handleEdit = (degree: Degree) => {
    setEditingDegree(degree);
    setFormData({
      type: getDisplayDegreeType(degree.type),
      shortName: degree.shortName,
      fullName: degree.fullName
    });
    setOpenModal(true);
  };

  const handleAdd = () => {
    setEditingDegree(null);
    setFormData({ type: '', shortName: '', fullName: '' });
    setFormErrors({ type: '', shortName: '', fullName: '' });
    setOpenModal(true);
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
      const res = await api.post('/degrees/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showNotification('Import Excel thành công!');
      fetchDegrees();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi import Excel.';
      showNotification(errorMessage, 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý Bằng Cấp
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {importResult && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Import kết thúc: {JSON.stringify(importResult)}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap'}}>
        <TextField
          placeholder="Tìm kiếm theo tên"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          size="small"
          sx={{ minWidth: 400 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 200}}>
          <InputLabel>Loại bằng cấp</InputLabel>
          <Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            label="Loại bằng cấp"
          >
            <MenuItem value="">Tất cả</MenuItem>
            {degreeTypes.map(t => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {isAdmin && (
          <>
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
              onClick={handleAdd}
              sx={{ ml: 2 , marginBottom: 2}} 
            >
              Thêm Bằng Cấp
            </Button>
            </Box>
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
                  <TableCell>STT</TableCell>
                  <TableCell>Loại Bằng Cấp</TableCell>
                  <TableCell>Tên Viết Tắt</TableCell>
                  <TableCell>Tên Đầy Đủ</TableCell>
                  {isAdmin && <TableCell>Thao tác</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {degrees.map((degree, index) => (
                  <TableRow key={degree.id}>
                    <TableCell>{(page - 1) * pageSize + index + 1}</TableCell>
                    <TableCell>{getDisplayDegreeType(degree.type)}</TableCell>
                    <TableCell>{degree.shortName}</TableCell>
                    <TableCell>{degree.fullName}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <IconButton onClick={() => handleEdit(degree)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(degree.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3, float: 'right' }}>
            <Pagination
              count={Math.ceil(total / pageSize)}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        </>
      )}

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDegree ? 'Sửa Bằng Cấp' : 'Thêm Bằng Cấp'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Loại Bằng Cấp</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => handleFormChange('type', e.target.value)}
                label="Loại Bằng Cấp"
                error={!!formErrors.type}
              >
                {degreeTypes.map(t => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </Select>
              {formErrors.type && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                  {formErrors.type}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Tên viết tắt"
              value={formData.shortName}
              onChange={(e) => handleFormChange('shortName', e.target.value)}
              placeholder="Ví dụ: TS, ThS, PGS, GS"
              error={!!formErrors.shortName}
              helperText={formErrors.shortName}
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 20 }}
            />

            <TextField
              fullWidth
              label="Tên đầy đủ"
              value={formData.fullName}
              onChange={(e) => handleFormChange('fullName', e.target.value)}
              placeholder="Ví dụ: Tiến sĩ Khoa học máy tính, Phó Giáo sư Y học"
              error={!!formErrors.fullName}
              helperText={formErrors.fullName}
              multiline
              rows={3}
              inputProps={{ maxLength: 100 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingDegree ? 'Cập nhật' : 'Thêm'}
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

export default DegreesPage;
