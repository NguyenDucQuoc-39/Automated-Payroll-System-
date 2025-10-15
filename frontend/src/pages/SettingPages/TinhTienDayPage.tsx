import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box, Typography, Snackbar, Alert } from '@mui/material';
import { getAllDepartments } from '../../services/department.service';
import { getSemesters } from '../../services/semester.service';
import { getTeachersByDepartment } from '../../services/teacher.service';
import { getClassSections } from '../../services/classSection.service';
import { getLessonCoefficients } from '../../services/lessonCoefficient.service';
import { getDegreeCoefficients } from '../../services/degreeCoefficient.service';
import { getClassCoefficients } from '../../services/classCoefficient.service';

const TinhTienDayPage = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [classSections, setClassSections] = useState<any[]>([]);
  const [lessonCoefficient, setLessonCoefficient] = useState<any>(null);
  const [degreeCoefficient, setDegreeCoefficient] = useState<any>(null);
  const [classCoefficients, setClassCoefficients] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  useEffect(() => {
    getAllDepartments().then(res => setDepartments(res.data));
    getSemesters().then(res => setSemesters(res.data));
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setTeachers([]);
    try {
      if (selectedDepartment) {
        const res = await getTeachersByDepartment(selectedDepartment);
        setTeachers(res.data);
      }
    } catch {
      showNotification('Không lấy được danh sách giảng viên', 'error');
    }
    setLoading(false);
  };

  const handleOpenDetail = async (teacher: any) => {
    setSelectedTeacher(teacher);
    setOpenDetail(true);
    try {
      const [lessonRes, degreeRes, classRes] = await Promise.all([
        getLessonCoefficients(),
        getDegreeCoefficients(),
        getClassCoefficients()
      ]);
      const semesterObj = semesters.find((s: any) => s.id === selectedSemester);
      setLessonCoefficient(lessonRes.data.find((x: any) => x.academicYear === semesterObj?.academicYear && x.status === 'ACTIVE'));
      setDegreeCoefficient(degreeRes.data.find((x: any) => x.academicYear === semesterObj?.academicYear && x.status === 'ACTIVE'));
      setClassCoefficients(classRes.data.filter((x: any) => x.academicYear === semesterObj?.academicYear && x.status === 'ACTIVE'));
      // Lấy danh sách lớp học phần đã dạy
      const classSectionRes = await getClassSections({ teacherId: teacher.id, semesterId: selectedSemester });
      setClassSections(classSectionRes.data.classSections.filter((cs: any) => cs.semester.id === selectedSemester && cs.course.department.id === selectedDepartment));
    } catch {
      showNotification('Không lấy được chi tiết lớp học phần', 'error');
    }
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedTeacher(null);
    setClassSections([]);
  };

  // Tính hệ số lớp dựa vào số lượng sinh viên
  const getClassCoefficient = (studentCount: number) => {
    if (!classCoefficients.length) return 1;
    const found = classCoefficients.find((c: any) => studentCount >= c.minStudents && studentCount <= c.maxStudents);
    return found ? found.coefficient : 1;
  };

  // Tính hệ số bằng cấp
  const getDegreeCoefficient = (degreeType: string) => {
    if (!degreeCoefficient) return 1;
    switch (degreeType) {
      case 'MASTER': return degreeCoefficient.master;
      case 'DOCTOR': return degreeCoefficient.doctor;
      case 'ASSOCIATE_PROFESSOR': return degreeCoefficient.associateProfessor;
      case 'PROFESSOR': return degreeCoefficient.professor;
      default: return 1;
    }
  };

  // Tính tiền dạy cho từng lớp học phần
  const calcClassSectionSalary = (cs: any) => {
    if (!lessonCoefficient) return 0;
    const classCoef = getClassCoefficient(cs.maxStudents || 0);
    const degreeCoef = getDegreeCoefficient(selectedTeacher.degree.type);
    return (cs.course.totalHours || 0) * classCoef * degreeCoef * lessonCoefficient.amount;
  };

  const totalSalary = classSections.reduce((sum, cs) => sum + calcClassSectionSalary(cs), 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tính Tiền Dạy
      </Typography>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 250, mr: 2 }} size="small">
          <InputLabel>Học Kỳ</InputLabel>
          <Select size='small' value={selectedSemester} label="Học Kỳ" onChange={e => setSelectedSemester(e.target.value)}>
            {semesters.map((s: any) => (
              <MenuItem key={s.id} value={s.id}>{s.academicYear} - {s.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200, mr: 2 }} size="small">
          <InputLabel>Khoa</InputLabel>
          <Select size='small' value={selectedDepartment} label="Khoa" onChange={e => setSelectedDepartment(e.target.value)}>
            {departments.map((d: any) => <MenuItem key={d.id} value={d.id}>{d.fullName}</MenuItem>)}
          </Select>
        </FormControl>
        <Button 
        variant="contained" 
        sx={{ mt: 1, height: 40 }} 
        onClick={handleSearch} disabled={!selectedSemester || !selectedDepartment}
        color='primary'
        >Xem báo cáo</Button>
      </Box>
      {loading ? <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box> : (
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Mã Giảng Viên</TableCell>
                <TableCell>Họ và Tên</TableCell>
                <TableCell>Bằng Cấp</TableCell>
                <TableCell>Khoa</TableCell>
                <TableCell>Thông tin chi tiết</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teachers.map((t: any, idx: number) => (
                <TableRow key={t.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{`GV${t.orderNumber?.toString().padStart(4, '0')}`}</TableCell>
                  <TableCell>{t.firstName} {t.lastName}</TableCell>
                  <TableCell>{t.degree?.fullName}</TableCell>
                  <TableCell>{t.department?.fullName}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={() => handleOpenDetail(t)}>Chi tiết</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="lg" fullWidth>
        <DialogTitle>Chi tiết tiền dạy: {selectedTeacher && `${selectedTeacher.firstName} ${selectedTeacher.lastName}`}</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Mã Lớp Học Phần</TableCell>
                  <TableCell>Tên Lớp Học Phần</TableCell>
                  <TableCell>Hệ Số Lớp</TableCell>
                  <TableCell>Hệ Số Bằng Cấp</TableCell>
                  <TableCell>Số tiết</TableCell>
                  <TableCell>Số tiền/tiết</TableCell>
                  <TableCell>Tiền dạy</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classSections.map((cs: any, idx: number) => (
                  <TableRow key={cs.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{cs.code}</TableCell>
                    <TableCell>{cs.name}</TableCell>
                    <TableCell align="center">{getClassCoefficient(cs.maxStudents || 0).toFixed(1)}</TableCell>
                    <TableCell align="center"> {getDegreeCoefficient(selectedTeacher.degree.type).toFixed(1)}</TableCell>
                    <TableCell align="center"> {cs.course.totalHours}</TableCell>
                    <TableCell>{lessonCoefficient ? lessonCoefficient.amount : ''}</TableCell>
                    <TableCell>{calcClassSectionSalary(cs).toLocaleString()} VNĐ</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={6} align="right"><b>Tổng tiền dạy</b></TableCell>
                  <TableCell colSpan={2}><b>{totalSalary.toLocaleString()} VNĐ</b></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Đóng</Button>
        </DialogActions>
      </Dialog>
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

export default TinhTienDayPage; 