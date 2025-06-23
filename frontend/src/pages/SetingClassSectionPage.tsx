import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { getClassCoefficients, createClassCoefficient, deleteClassCoefficient } from '../services/classCoefficient.service';
import { getAcademicYears } from '../services/semester.service';
import { message } from 'antd';

const LopHeSoPage = () => {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [coefficient, setCoefficient] = useState('');
  const [status, setStatus] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [filterYear, setFilterYear] = useState('');

  const fetchData = async (yearFilter?: string) => {
    setLoading(true);
    try {
      const res = await getClassCoefficients();
      let rows = res.data;
      if (yearFilter) {
        rows = rows.filter((item: any) => item.academicYear === yearFilter);
      }
      setData(rows);
    } catch (e) { message.error('Không lấy được dữ liệu'); }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(filterYear);
    getAcademicYears().then((res: any) => setAcademicYears(res.data));
  }, [filterYear]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCreate = async () => {
    if (!year || !min || !max || !coefficient || !status) {
      message.error('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    if ([min, max, coefficient].some(val => Number(val) < 0)) {
      message.error('Các giá trị số không được là số âm!');
      return;
    }
    await createClassCoefficient({ academicYear: year, minStudents: Number(min), maxStudents: Number(max), coefficient: Number(coefficient), status });
    setYear(''); setMin(''); setMax(''); setCoefficient(''); setStatus(''); setOpen(false); fetchData(filterYear);
  };

  const handleDelete = async (id: string) => {
    await deleteClassCoefficient(id);
    fetchData(filterYear);
  };

  return (
    <div>
      <h2>Thiết Lập Hệ Số Lớp</h2>
      <div style={{ marginBottom: 16 }}>
        <FormControl style={{ minWidth: 200 }}>
          <InputLabel>Lọc theo năm học</InputLabel>
          <Select value={filterYear} label="Lọc theo năm học" onChange={e => setFilterYear(e.target.value)}>
            <MenuItem value="">Tất cả</MenuItem>
            {academicYears.map((y: string) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
        </FormControl>
      </div>
      <Button variant="contained" color="primary" onClick={handleOpen}>Thêm thiết lập</Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Thêm Thiết Lập</DialogTitle>
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
          <TextField margin="normal" label="Số lượng sinh viên nhỏ nhất" type="number" fullWidth value={min} onChange={e => setMin(e.target.value)} />
          <TextField margin="normal" label="Số lượng sinh viên lớn nhất" type="number" fullWidth value={max} onChange={e => setMax(e.target.value)} />
          <TextField margin="normal" label="Hệ Số" type="number" fullWidth value={coefficient} onChange={e => setCoefficient(e.target.value)} />
          <FormControl fullWidth margin="normal">
            <InputLabel id="status-label">Trạng Thái</InputLabel>
            <Select
              labelId="status-label"
              value={status}
              label="Trạng Thái"
              onChange={e => setStatus(e.target.value)}
            >
              <MenuItem value="ACTIVE">Đang Áp Dụng</MenuItem>
              <MenuItem value="INACTIVE">Chưa Áp Dụng</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleCreate} variant="contained">Tạo Thiết Lập</Button>
        </DialogActions>
      </Dialog>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper} sx={{ marginTop: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Năm Học</TableCell>
                <TableCell align="center">Số lượng sinh viên nhỏ nhất</TableCell>
                <TableCell align="center">Số lượng sinh viên lớn nhất</TableCell>
                <TableCell>Hệ Số</TableCell>
                <TableCell>Trạng Thái</TableCell>
                <TableCell>Hành Động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={row.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{row.academicYear}</TableCell>
                  <TableCell align="center">{row.minStudents}</TableCell>
                  <TableCell align="center">{row.maxStudents}</TableCell>
                  <TableCell>{row.coefficient.toFixed(1)}</TableCell>
                  <TableCell>{row.status === 'ACTIVE' ? 'Đang áp dụng' : 'Chưa áp dụng'}</TableCell>
                  <TableCell>
                    <IconButton color="secondary" onClick={() => handleDelete(row.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default LopHeSoPage; 