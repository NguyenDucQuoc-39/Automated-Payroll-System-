import React, { useEffect, useState, useCallback } from 'react';
import { getTeacherSalaryByDepartment } from '../../services/api';
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
// REMOVED: LoadingButton is no longer needed

const TeacherDepartmentReportPage: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' } | null>(null);

  // Fetch data for dropdowns on initial load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, semRes] = await Promise.all([
          api.get('/departments', { params: { limit: 1000 } }),
          api.get('/semesters'),
        ]);

        if (deptRes.data && Array.isArray(deptRes.data.departments)) {
          setDepartments(deptRes.data.departments);
        } else {
          console.error('API for departments did not return an array inside a "departments" key:', deptRes.data);
          setDepartments([]);
          setSnackbar({ open: true, message: 'Định dạng dữ liệu khoa không hợp lệ', severity: 'error' });
        }

        const uniqueYears = Array.from(new Set((semRes.data || []).map((s: any) => s.academicYear))) as string[];
        setYears(uniqueYears.sort((a, b) => b.localeCompare(a)));
        setSemesters(Array.isArray(semRes.data) ? semRes.data : []);
      } catch {
        setSnackbar({ open: true, message: 'Không lấy được dữ liệu khoa/năm học/học kỳ', severity: 'error' });
      }
    };
    fetchData();
  }, []);

  // ADDED: useCallback for the report fetching logic
  const loadReport = useCallback(async () => {
    // Validation: Don't fetch if required fields are missing
    if (!selectedDepartment || (!selectedYear && !selectedSemester)) {
      setData([]); // Clear previous data
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const res = await getTeacherSalaryByDepartment(
        selectedDepartment,
        selectedSemester ? undefined : selectedYear,
        selectedSemester
      );
      setData(res.data.teachers || []);
      setTotal(res.data.total || 0);
    } catch {
      setSnackbar({ open: true, message: 'Không lấy được dữ liệu báo cáo', severity: 'error' });
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [selectedDepartment, selectedYear, selectedSemester]);


  // ADDED: useEffect to automatically call loadReport when filters change
  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleCloseSnackbar = () => snackbar && setSnackbar({ ...snackbar, open: false });

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h4" gutterBottom>
        Báo cáo tiền dạy của giảng viên một khoa
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 250 }} size="small">
          <InputLabel>Khoa</InputLabel>
          <Select
            value={selectedDepartment}
            label="Khoa"
            onChange={(e: SelectChangeEvent) => setSelectedDepartment(e.target.value)}
          >
            {departments.map((d: any) => <MenuItem key={d.id} value={d.id}>{d.fullName}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }} size="small">
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

        <FormControl sx={{ minWidth: 250 }} size="small">
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
        
        {/* REMOVED: The LoadingButton is no longer here */}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Mã GV</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tên Giảng viên</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Bằng Cấp</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Tổng Tiền Dạy</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={5} align="center">
                        <CircularProgress />
                    </TableCell>
                </TableRow>
            ) : data.length > 0 ? (
                data.map((row) => (
                    <TableRow key={row.teacherId}>
                    <TableCell>GV{row.code?.toString().padStart(4, '0')}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.degree}</TableCell>
                    <TableCell align="right">{row.totalSalary.toLocaleString()} VNĐ</TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} align="center">
                        Không có dữ liệu hoặc vui lòng chọn đầy đủ bộ lọc.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
          {data.length > 0 && (
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
          )}
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

export default TeacherDepartmentReportPage;