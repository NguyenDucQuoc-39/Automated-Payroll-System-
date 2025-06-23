import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { getDegreeCoefficients, createDegreeCoefficient, deleteDegreeCoefficient } from '../services/degreeCoefficient.service';
import { getAcademicYears } from '../services/semester.service';
import { message } from 'antd';

const BangCapHeSoPage = () => {
  const [open, setOpen] = useState(false);
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
      message.error('Không lấy được dữ liệu');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(filterYear);
    getAcademicYears().then((res: any) => setAcademicYears(res.data));
  }, [filterYear]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCreate = async () => {
    if (!year || !thacSi || !tienSi || !phoGS || !giaoSu || !status) {
      message.error('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    if ([thacSi, tienSi, phoGS, giaoSu].some(val => Number(val) < 0)) {
      message.error('Các hệ số không được là số âm!');
      return;
    }
    await createDegreeCoefficient({ academicYear: year, master: Number(thacSi), doctor: Number(tienSi), associateProfessor: Number(phoGS), professor: Number(giaoSu), status });
    setYear('');
    setThacSi('');
    setTienSi('');
    setPhoGS('');
    setGiaoSu('');
    setStatus('');
    setOpen(false);
    fetchData(filterYear);
  };

  const handleDelete = async (id: string) => {
    await deleteDegreeCoefficient(id);
    fetchData(filterYear);
  };

  return (
    <div>
      <h2>Thiết Lập Hệ Số Bằng Cấp</h2>
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
          <TextField
            margin="normal"
            label="Thạc Sĩ (Hệ số)"
            type="number"
            fullWidth
            value={thacSi}
            onChange={e => setThacSi(e.target.value)}
          />
          <TextField
            margin="normal"
            label="Tiến Sĩ (Hệ số)"
            type="number"
            fullWidth
            value={tienSi}
            onChange={e => setTienSi(e.target.value)}
          />
          <TextField
            margin="normal"
            label="Phó Giáo Sư (Hệ số)"
            type="number"
            fullWidth
            value={phoGS}
            onChange={e => setPhoGS(e.target.value)}
          />
          <TextField
            margin="normal"
            label="Giáo Sư (Hệ số)"
            type="number"
            fullWidth
            value={giaoSu}
            onChange={e => setGiaoSu(e.target.value)}
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

export default BangCapHeSoPage; 