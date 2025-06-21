import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { getLessonCoefficients, createLessonCoefficient, deleteLessonCoefficient } from '../services/lessonCoefficient.service';
import { getAcademicYears } from '../services/semester.service';

const TietHeSoPage = () => {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getLessonCoefficients();
      setData(res.data);
    } catch (e) {
      // handle error
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    getAcademicYears().then(res => setAcademicYears(res.data));
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCreate = async () => {
    if (year && amount && status) {
      await createLessonCoefficient({ academicYear: year, amount: Number(amount), status });
      setYear('');
      setAmount('');
      setStatus('');
      setOpen(false);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    await deleteLessonCoefficient(id);
    fetchData();
  };

  return (
    <div>
      <h2>Thiết Lập Hệ Số Tiết</h2>
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
          <TextField
            margin="normal"
            label="Số tiền một tiết"
            type="number"
            fullWidth
            value={amount}
            onChange={e => setAmount(e.target.value)}
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
                  <TableCell>{row.amount}</TableCell>
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

export default TietHeSoPage; 