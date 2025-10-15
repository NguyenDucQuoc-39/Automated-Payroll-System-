import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, TextField, MenuItem, Grid, Button, Paper, Divider } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getMySalaryReport } from '../../services/mySalary.service';
import { getSemesters, getAcademicYears } from '../../services/semester.service';

// IMPROVEMENT: Tạo một custom footer để hiển thị tổng tiền
const CustomFooter = ({ total }: { total: number }) => {
  return (
    <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        Tổng cộng:&nbsp;
      </Typography>
      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
        {total.toLocaleString('vi-VN')} VNĐ
      </Typography>
    </Box>
  );
};


const MySalaryPage: React.FC = () => {
  const [mode, setMode] = useState<'month' | 'semester' | 'year'>('year');
  const [years, setYears] = useState<string[]>([]);
  const [year, setYear] = useState<string>('');
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [semesterId, setSemesterId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);

  // IMPROVEMENT: Căn phải và định dạng cho các cột số/tiền tệ
  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Mã lớp', width: 140 },
    { field: 'name', headerName: 'Tên lớp', flex: 1, minWidth: 260 },
    { field: 'courseName', headerName: 'Học phần', width: 450 },
    { field: 'semesterName', headerName: 'Học kỳ', width: 180 },
    { field: 'totalHours', headerName: 'Tổng tiết', width: 110, type: 'number', align: 'right' },
    {
      field: 'lessonAmount', headerName: 'Tiền/tiết', width: 150, type: 'number', align: 'right',
      valueFormatter: (params) => params.value.toLocaleString('vi-VN')
    },
    { field: 'degreeCoeff', headerName: 'Hệ Số Bằng cấp', width: 150, type: 'number', align: 'right' },
    { field: 'classCoeff', headerName: 'Hệ Số Lớp', width: 150, type: 'number', align: 'right' },
    {
      field: 'subtotal', headerName: 'Thành tiền', width: 250, type: 'number', align: 'right',
      valueFormatter: (params) => `${params.value.toLocaleString('vi-VN')} VNĐ`
    },
  ];

  const loadInitialData = useCallback(async () => {
    const res = await getAcademicYears();
    const ys = res.data || [];
    setYears(ys);
    if (ys.length) {
      setYear(ys[0]);
    }
  }, []);

  const loadSemesters = useCallback(async () => {
    if (!year) return;
    const res = await getSemesters({ academicYear: year });
    setSemesters(res.data?.semesters || res.data || []);
  }, [year]);

  const loadReport = async () => {
    if (!year && mode !== 'semester') return; // Cần có năm để xem báo cáo tháng/năm
    if (!semesterId && mode === 'semester') return; // Cần có học kỳ

    setLoading(true);
    try {
      const res = await getMySalaryReport({
        mode,
        year: mode === 'semester' ? undefined : year, // Chỉ gửi năm nếu không phải chế độ học kỳ
        month: mode === 'month' ? month : undefined,
        semesterId: mode === 'semester' ? semesterId : undefined,
      });
      setRows(res.data.details || []);
      setTotal(res.data.total || 0);
    } catch (error) {
        console.error("Failed to load salary report:", error);
        setRows([]);
        setTotal(0);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInitialData(); }, [loadInitialData]);
  useEffect(() => { loadSemesters(); }, [loadSemesters]);
  useEffect(() => { if (mode !== 'semester') setSemesterId(''); }, [mode]);

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h4" gutterBottom>Báo cáo lương cá nhân</Typography>

      {/* IMPROVEMENT: Gom nhóm bộ lọc vào Paper */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField select label="Chế độ xem" fullWidth value={mode} onChange={(e) => setMode(e.target.value as any)} size="small">
              <MenuItem value="month">Theo tháng</MenuItem>
              <MenuItem value="semester">Theo học kỳ</MenuItem>
              <MenuItem value="year">Theo năm</MenuItem>
            </TextField>
          </Grid>
          {mode !== 'semester' && (
            <Grid item xs={12} sm={6} md={3}>
              <TextField select label="Năm học" fullWidth value={year} onChange={(e) => setYear(e.target.value)} size="small">
                {years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          {mode === 'month' && (
            <Grid item xs={12} sm={6} md={3}>
              <TextField select label="Tháng" fullWidth value={month} onChange={(e) => setMonth(Number(e.target.value))} size="small">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <MenuItem key={m} value={m}>{`Tháng ${m}`}</MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
          {mode === 'semester' && (
            <Grid item xs={12} sm={6} md={6}>
              <TextField select label="Học kỳ" fullWidth value={semesterId} onChange={(e) => setSemesterId(e.target.value)} size="small">
                {semesters.map((s: any) => <MenuItem key={s.id} value={s.id}>{`${s.name} (${s.academicYear})`}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={3}>
            <Button variant="contained" onClick={loadReport} sx={{ height: '40px' }}>Xem báo cáo</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* IMPROVEMENT: Dùng Box và autoHeight */}
      <Box sx={{ height: 'auto', width: '100%' }}>
        <DataGrid
          autoHeight
          loading={loading}
          rows={rows}
          columns={columns}
          getRowId={(row) => row.classSectionId}
          hideFooterSelectedRowCount // Ẩn số dòng được chọn
          slots={{
            footer: () => <CustomFooter total={total} />, // IMPROVEMENT: Sử dụng custom footer
          }}
          sx={{ border: 0 }}
        />
      </Box>
    </Paper>
  );
};

export default MySalaryPage;