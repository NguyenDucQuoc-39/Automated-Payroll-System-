import React, { useEffect, useState } from 'react';
import { getTeacherSalaryByYear } from '../../services/api';
import api from '../../services/api';

// --- Material-UI Imports ---
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  CircularProgress,
  Alert,
  Snackbar,
  SelectChangeEvent
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

const TeacherYearReportPage: React.FC = () => {
  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(''); // Dùng chuỗi rỗng để Select hoạt động tốt hơn
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);

  // State cho Snackbar (thay thế message của antd)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' } | null>(null);

  // Lấy danh sách năm học từ backend
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await api.get('/semesters/academic-years');
        const ys = Array.isArray(res.data) ? res.data : [];
        setYears(ys.sort((a: string, b: string) => b.localeCompare(a)));
      } catch {
        setSnackbar({ open: true, message: 'Không lấy được danh sách năm học', severity: 'error' });
      }
    };
    fetchYears();
  }, []);

  const handleReport = async () => {
    if (!selectedYear) {
      setSnackbar({ open: true, message: 'Vui lòng chọn năm học', severity: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const res = await getTeacherSalaryByYear(selectedYear);
      const teachers = Array.isArray(res.data?.teachers) ? res.data.teachers : [];
      setData(teachers);
      setTotal(Number(res.data?.total || 0));
    } catch {
      setSnackbar({ open: true, message: 'Không lấy được dữ liệu báo cáo', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    if (snackbar) {
      setSnackbar({ ...snackbar, open: false });
    }
  };
  
  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setSelectedYear(event.target.value);
  };


  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h4" gutterBottom>
        Báo Cáo Năm
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel id="year-select-label">Năm học</InputLabel>
          <Select
            labelId="year-select-label"
            value={selectedYear}
            label="Năm học"
            onChange={handleYearChange}
          >
            {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
        </FormControl>
        <LoadingButton
          variant="contained"
          onClick={handleReport}
          loading={loading}
          loadingIndicator={<CircularProgress color="inherit" size={24} />}
        >
          Xem báo cáo
        </LoadingButton>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Mã GV</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tên Giảng viên</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Khoa</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Tổng Tiền Dạy</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.teacherId}>
                <TableCell>GV{row.code?.toString().padStart(4, '0')}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.department}</TableCell>
                <TableCell align="right">{row.totalSalary.toLocaleString()} VNĐ</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                Tổng cộng
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                {total.toLocaleString()} VNĐ
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {snackbar && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Paper>
  );
};

export default TeacherYearReportPage;