import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, TextField, MenuItem, Grid, Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getMyClassSections } from '../../services/myClassSection.service';
import { getSemesters, getAcademicYears } from '../../services/semester.service';

const MyClassesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // Filter states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(''); // ADDED: State for debounced search term
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [year, setYear] = useState<string>('');
  const [semesters, setSemesters] = useState<any[]>([]);
  const [semesterId, setSemesterId] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Mã lớp', width: 150 },
    { field: 'name', headerName: 'Tên lớp', flex: 1, minWidth: 250 },
    { field: 'course', headerName: 'Học phần', width: 500, valueGetter: (p: any) => p.row?.course?.name },
    { field: 'semester', headerName: 'Học kỳ', width: 200, valueGetter: (p: any) => `${p.row?.semester?.name} (${p.row?.semester?.academicYear})` },
    { field: 'totalHours', headerName: 'Tổng tiết', width: 120, valueGetter: (p: any) => p.row?.course?.totalHours },
    { field: 'totalStudents', headerName: 'Tổng số sinh viên', width: 220, valueGetter: (p: any) => p.row?.maxStudents ?? 'N/A'},
    { field: 'status', headerName: 'Trạng thái', width: 180 },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyClassSections({
        page,
        limit,
        search: debouncedSearch, // CHANGED: Use debounced search term for API call
        academicYear: year || undefined,
        semesterId: semesterId || undefined,
        status: status || undefined,
      });
      setRows(res.data.classSections || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error("Failed to load data:", error);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, year, semesterId, status]); // ADDED: Dependencies for useCallback

  // Load initial academic years
  useEffect(() => {
    const loadYears = async () => {
      const res = await getAcademicYears();
      const years = res.data || [];
      setAcademicYears(years);
      if (years.length) setYear(years[0]);
    };
    loadYears();
  }, []);

  // Load semesters when year changes
  useEffect(() => {
    if (year) {
      const loadSemesters = async () => {
        const res = await getSemesters({ academicYear: year });
        setSemesters(res.data?.semesters || res.data || []);
        setSemesterId(''); // Reset semester when year changes
      };
      loadSemesters();
    }
  }, [year]);

  // ADDED: Debouncing effect for the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // Wait 500ms after the user stops typing
    
    return () => {
      clearTimeout(timer);
    };
  }, [search]);
  
  // CHANGED: Main data loading effect
  useEffect(() => {
    load();
  }, [load]); // This now automatically runs when any dependency of `load` changes

  // ADDED: Effect to reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [year, semesterId, status, debouncedSearch]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Lớp học phần của tôi
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField select label="Năm học" fullWidth value={year} onChange={(e) => setYear(e.target.value)} size="small">
              {academicYears.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField select label="Học kỳ" fullWidth value={semesterId} onChange={(e) => setSemesterId(e.target.value)} size="small">
              <MenuItem value="">Tất cả</MenuItem>
              {semesters.map((s: any) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField select label="Trạng thái" fullWidth value={status} onChange={(e) => setStatus(e.target.value)} size="small">
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="OPEN_FOR_REGISTRATION">Sắp diễn ra</MenuItem>
              <MenuItem value="IN_PROGRESS">Đang diễn ra</MenuItem>
              <MenuItem value="COMPLETED">Đã hoàn thành</MenuItem>
              <MenuItem value="CANCELED">Đã hủy</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField 
              label="Tìm kiếm theo tên/mã lớp" 
              fullWidth 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              size="small" 
            />
          </Grid>
          {/* REMOVED: The Filter Button Grid item is gone */}
        </Grid>
      </Paper>

      <Box sx={{ height: 'auto', width: '100%' }}>
        <DataGrid
          autoHeight
          loading={loading}
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          rowCount={total}
          paginationMode="server"
          paginationModel={{ page: page - 1, pageSize: limit }}
          onPaginationModelChange={(model) => setPage(model.page + 1)}
          pageSizeOptions={[limit]}
          sx={{ border: 0 }}
        />
      </Box>
    </Box>
  );
};

export default MyClassesPage;