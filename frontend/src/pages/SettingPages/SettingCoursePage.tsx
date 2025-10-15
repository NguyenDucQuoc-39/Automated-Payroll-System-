import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Box,
  Typography
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { getLessonCoefficients, createLessonCoefficient, deleteLessonCoefficient, updateLessonCoefficient } from '../../services/lessonCoefficient.service';
import { getAcademicYears } from '../../services/semester.service';

const SettingCoursePage = () => {
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [year, setYear] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [filterYear, setFilterYear] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

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

  const fetchData = async (yearFilter?: string) => {
    setLoading(true);
    try {
      const res = await getLessonCoefficients();
      let rows = res.data;
      if (yearFilter) {
        rows = rows.filter((item: any) => item.academicYear === yearFilter);
      }
      setData(rows);
    } catch (e) {
      showNotification('Không lấy được dữ liệu', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(filterYear);
    getAcademicYears().then(res => {
      if(Array.isArray(res.data)) {
        setAcademicYears(res.data);
      } else {
        showNotification('Không lấy được dữ liệu năm học', 'error');
      }
    });
  }, [filterYear]);

  const resetForm = () => {
    setYear('');
    setAmount('');
    setStatus('');
    setEditingItem(null);
  };

  const handleOpen = () => {
    resetForm();
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setYear(item.academicYear);
    setAmount(item.amount.toString());
    setStatus(item.status);
    setOpen(true);
  };

  const handleCreateOrUpdate = async () => {
    if (!year || !amount || !status) {
      showNotification('Vui lòng nhập đầy đủ thông tin!', 'error');
      return;
    }
    if (Number(amount) <= 0) {
      showNotification('Số tiền một tiết không được là số âm hoặc bằng 0!', 'error');
      return;
    }
    if (Number(amount) > 999999) {
      showNotification('Số tiền tối đa là 999.999 VNĐ!', 'error');
      return;
    }
    try {
      if (editingItem) {
        await updateLessonCoefficient(editingItem.id, { academicYear: year, amount: Number(amount), status });
        showNotification('Cập nhật thiết lập thành công!', 'success');
      } else {
        await createLessonCoefficient({ academicYear: year, amount: Number(amount), status });
        showNotification('Thêm thiết lập thành công!', 'success');
      }
      handleClose();
      fetchData(filterYear);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra!';
      showNotification(msg, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLessonCoefficient(id);
      fetchData(filterYear);
      showNotification('Xóa thành công!', 'success');
    } catch {
      showNotification('Có lỗi khi xóa!', 'error');
    }
    setDeleteDialog({ open: false, id: null });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Thiết Lập Hệ Số Tiết 
      </Typography>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl size = 'small' sx={{ minWidth: 200 }}>
          <InputLabel>Lọc theo năm học</InputLabel>
          <Select
            value={filterYear}
            label="Lọc theo năm học"
            onChange={e => setFilterYear(e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {academicYears.map((y: string) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen} sx={{ ml: 2, marginBottom: 2 }}>
          {editingItem ? 'Sửa thiết lập' : 'Thêm thiết lập'}
        </Button>
      </Box>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? 'Sửa Thiết Lập' : 'Thêm Thiết Lập'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="year-label">Chọn Năm Học Áp Dụng</InputLabel>
            <Select
              labelId="year-label"
              value={year}
              label="Chọn Năm Học Áp Dụng"
              onChange={e => setYear(e.target.value)}
            >
              {academicYears.map((academicYear: string) => (
                <MenuItem key={academicYear} value={academicYear}>{academicYear}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            label="Số tiền một tiết"
            type="number"
            fullWidth
            value={amount}
            onChange={e => {
              const val = e.target.value;
              if (!val || Number(val) <= 999999) setAmount(val);
            }}
            inputProps={{ min: 0, max: 999999, step: 1000 }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="status-label">Trạng Thái</InputLabel>
            <Select
              labelId="status-label"
              value={status}
              label="Trạng Thái"
              onChange={e => setStatus(e.target.value)}
            >
              <MenuItem value="ACTIVE">Hoạt Động</MenuItem>
              <MenuItem value="INACTIVE">Không Hoạt Động</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleCreateOrUpdate} variant="contained">{editingItem ? 'Cập nhật' : 'Tạo Thiết Lập'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
      >
        <DialogTitle>Bạn chắc chắn muốn xóa?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>Hủy</Button>
          <Button color="error" onClick={() => handleDelete(deleteDialog.id!)} variant="contained">Xóa</Button>
        </DialogActions>
      </Dialog>
      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ marginTop: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Năm Học</TableCell>
                <TableCell>Số Tiền Một Tiết</TableCell>
                <TableCell>Trạng Thái</TableCell>
                <TableCell>Hành Động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={row.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{row.academicYear}</TableCell>
                  <TableCell>{row.amount.toLocaleString()} VNĐ</TableCell>
                  <TableCell>{row.status === 'ACTIVE' ? 'Đang áp dụng' : 'Chưa áp dụng'}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(row)} sx={{ mr: 1 }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => setDeleteDialog({ open: true, id: row.id })}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
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

export default SettingCoursePage; 