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
  Box,
  Snackbar,
  Alert,
  Typography
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { getDegreeCoefficients, createDegreeCoefficient, deleteDegreeCoefficient, updateDegreeCoefficient } from '../../services/degreeCoefficient.service';
import { getAcademicYears } from '../../services/semester.service';

const BangCapHeSoPage = () => {
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [year, setYear] = useState('');
  const [thacSi, setThacSi] = useState('');
  const [tienSi, setTienSi] = useState('');
  const [phoGS, setPhoGS] = useState('');
  const [giaoSu, setGiaoSu] = useState('');
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
      const res = await getDegreeCoefficients();
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
    getAcademicYears().then((res: any) => setAcademicYears(res.data));
  }, [filterYear]);

  const resetForm = () => {
    setYear('');
    setThacSi('');
    setTienSi('');
    setPhoGS('');
    setGiaoSu('');
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
    setThacSi(item.master.toString());
    setTienSi(item.doctor.toString());
    setPhoGS(item.associateProfessor.toString());
    setGiaoSu(item.professor.toString());
    setStatus(item.status);
    setOpen(true);
  };

  const handleCreate = async () => {
    if (!year || !thacSi || !tienSi || !phoGS || !giaoSu || !status) {
      showNotification('Vui lòng nhập đầy đủ thông tin!', 'error');
      return;
    }
    if ([thacSi, tienSi, phoGS, giaoSu].some(val => Number(val) < 0)) {
      showNotification('Các hệ số không được là số âm!', 'error');
      return;
    }

    try {
      const data = { 
        academicYear: year, 
        master: Number(thacSi), 
        doctor: Number(tienSi), 
        associateProfessor: Number(phoGS), 
        professor: Number(giaoSu), 
        status 
      };

      if (editingItem) {
        await updateDegreeCoefficient(editingItem.id, data);
        showNotification('Cập nhật hệ số bằng cấp thành công!');
      } else {
        await createDegreeCoefficient(data);
        showNotification('Thêm hệ số bằng cấp thành công!');
      }
      
      handleClose();
      fetchData(filterYear);
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Có lỗi xảy ra!', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thiết lập này?')) {
      try {
        await deleteDegreeCoefficient(id);
        showNotification('Xóa thiết lập thành công!');
        fetchData(filterYear);
      } catch (error: any) {
        showNotification(error.response?.data?.message || 'Có lỗi khi xóa!', 'error');
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Thiết Lập Hệ Số Bằng Cấp
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap'}}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
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

        <Button variant="contained" color="primary" onClick={handleOpen}
        sx={{ ml: 2 , marginBottom: 2}}
        startIcon={<AddIcon />}
        >
          {editingItem ? 'Sửa thiết lập' : 'Thêm thiết lập'}
        </Button>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Sửa Thiết Lập Hệ Số Bằng Cấp' : 'Thêm Thiết Lập Hệ Số Bằng Cấp'}
        </DialogTitle>
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
            label="Thạc Sĩ (Hệ số)"
            type="number"
            fullWidth
            value={thacSi}
            onChange={e => setThacSi(e.target.value)}
            inputProps={{ min: 0, step: 0.1 }}
          />
          <TextField
            margin="normal"
            label="Tiến Sĩ (Hệ số)"
            type="number"
            fullWidth
            value={tienSi}
            onChange={e => setTienSi(e.target.value)}
            inputProps={{ min: 0, step: 0.1 }}
          />
          <TextField
            margin="normal"
            label="Phó Giáo Sư (Hệ số)"
            type="number"
            fullWidth
            value={phoGS}
            onChange={e => setPhoGS(e.target.value)}
            inputProps={{ min: 0, step: 0.1 }}
          />
          <TextField
            margin="normal"
            label="Giáo Sư (Hệ số)"
            type="number"
            fullWidth
            value={giaoSu}
            onChange={e => setGiaoSu(e.target.value)}
            inputProps={{ min: 0, step: 0.1 }}
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
          <Button onClick={handleCreate} variant="contained">
            {editingItem ? 'Cập nhật' : 'Tạo Thiết Lập'}
          </Button>
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
                <TableCell>Thạc Sĩ</TableCell>
                <TableCell>Tiến Sĩ</TableCell>
                <TableCell>Phó Giáo Sư</TableCell>
                <TableCell>Giáo Sư</TableCell>
                <TableCell>Trạng Thái</TableCell>
                <TableCell>Hành Động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={row.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{row.academicYear}</TableCell>
                  <TableCell>{row.master}</TableCell>
                  <TableCell>{row.doctor}</TableCell>
                  <TableCell>{row.associateProfessor}</TableCell>
                  <TableCell>{row.professor}</TableCell>
                  <TableCell>
                    {row.status === 'ACTIVE' ? 'Đang áp dụng' : 'Chưa áp dụng'}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEdit(row)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(row.id)}
                    >
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

export default BangCapHeSoPage; 