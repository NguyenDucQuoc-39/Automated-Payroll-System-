import React, { useEffect, useState } from 'react';
import { getTeacherSalaryBySchool } from '../../services/api';
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
  CircularProgress,
  Alert,
  Snackbar,
  SelectChangeEvent,
  AlertTitle
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

const TeacherSchoolReportPage: React.FC = () => {
  const [years, setYears] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [yearsRes, semRes] = await Promise.all([
          api.get('/semesters/academic-years'),
          api.get('/semesters'),
        ]);
        const ys = Array.isArray(yearsRes.data) ? yearsRes.data : [];
        setYears(ys.sort((a: string, b: string) => b.localeCompare(a)));
        setSemesters(Array.isArray(semRes.data) ? semRes.data : []);
      } catch {
        setSnackbar({ open: true, message: 'Không lấy được dữ liệu năm học/học kỳ', severity: 'error' });
      }
    };
    fetchData();
  }, []);

  const handleReport = async () => {
    if (!selectedYear && !selectedSemester) {
      setSnackbar({ open: true, message: 'Vui lòng chọn năm học hoặc học kỳ', severity: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const res = await getTeacherSalaryBySchool(
        selectedSemester ? undefined : selectedYear,
        selectedSemester
      );
      const teachers = Array.isArray(res.data?.teachers) ? res.data.teachers : [];
      setData(teachers);
      setTotal(Number(res.data?.total || 0));
    } catch {
      setSnackbar({ open: true, message: 'Không lấy được dữ liệu báo cáo', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => snackbar && setSnackbar({ ...snackbar, open: false });

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h4" gutterBottom>
        Báo Cáo Toàn Trường
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Năm học</InputLabel>
          <Select
            value={selectedYear}
            label="Năm học"
            onChange={(e: SelectChangeEvent) => {
              setSelectedYear(e.target.value);
              setSelectedSemester('');
            }}
          >
            <MenuItem value=""><em>-- Bỏ chọn --</em></MenuItem>
            {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Học kỳ</InputLabel>
          <Select
            value={selectedSemester}
            label="Học kỳ"
            onChange={(e: SelectChangeEvent) => {
              setSelectedSemester(e.target.value);
              setSelectedYear('');
            }}
          >
            <MenuItem value=""><em>-- Bỏ chọn --</em></MenuItem>
            {semesters.map((s: any) => <MenuItem key={s.id} value={s.id}>{s.name} ({s.academicYear})</MenuItem>)}
          </Select>
        </FormControl>

        <LoadingButton variant="contained" onClick={handleReport} loading={loading}>
          Xem báo cáo
        </LoadingButton>
      </Box>

      {total > 0 && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <AlertTitle>Tổng chi phí giảng dạy toàn trường</AlertTitle>
          <Typography variant="h6">{total.toLocaleString()} VNĐ</Typography>
        </Alert>
      )}

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
        </Table>
      </TableContainer>

      {snackbar && (
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Paper>
  );
};

export default TeacherSchoolReportPage;