import React, {useState, useEffect} from 'react';
import { Box, Typography, TextField, MenuItem, Grid, Paper, Divider, CircularProgress } from '@mui/material';
import { LoadingButton } from '@mui/lab'; // Import LoadingButton
import { getMyProfile, updateMyProfile } from '../../services/teacherSelf.service';

// --- Thêm Snackbar và Alert để hiển thị thông báo ---
import { Snackbar, Alert } from '@mui/material';

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  
  // IMPROVEMENT: State cho Snackbar để cung cấp phản hồi
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getMyProfile();
      setForm(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMyProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        gender: form.gender,
        office: form.office,
        phone: form.phone,
        birthDate: form.birthDate ? String(form.birthDate).slice(0, 10) : undefined,
      });
      // IMPROVEMENT: Hiển thị thông báo thành công
      setSnackbar({ open: true, message: 'Cập nhật hồ sơ thành công!', severity: 'success' });
      await fetchProfile(); // Tải lại dữ liệu mới
    } catch (error) {
      // IMPROVEMENT: Hiển thị thông báo lỗi
      setSnackbar({ open: true, message: 'Cập nhật thất bại, vui lòng thử lại.', severity: 'error' });
    }
    finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => snackbar && setSnackbar({ ...snackbar, open: false });

  // IMPROVEMENT: Giao diện tải dữ liệu đẹp hơn
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    // IMPROVEMENT: Bọc toàn bộ trang trong Paper
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h4" gutterBottom>Hồ sơ cá nhân</Typography>
      
      <Typography variant="h6" sx={{ mb: 2 }}>Thông tin cá nhân</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField label="Email" value={form?.email || ''} fullWidth disabled variant="filled" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Họ và tên"
            value={(form?.firstName || '') + ' ' + (form?.lastName || '')}
            onChange={e => {
              // Chia tách lấy họ và tên từ giá trị nhập vào
              const value = e.target.value || '';
              // Tách mọi thứ trước từ cuối cùng là họ, còn lại là tên
              const words = value.trim().split(' ');
              const firstName = words.length > 0 ? words.pop() ?? '' : '';
              const lastName = words.join(' ');
              handleChange('firstName', firstName);
              handleChange('lastName', lastName);
              
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField select label="Giới tính" value={form?.gender || ''} onChange={(e) => handleChange('gender', e.target.value)} fullWidth>
            <MenuItem value="MALE">Nam</MenuItem>
            <MenuItem value="FEMALE">Nữ</MenuItem>
            <MenuItem value="OTHER">Khác</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField label="Số điện thoại" value={form?.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} fullWidth />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField type="date" label="Ngày sinh" InputLabelProps={{ shrink: true }} value={form?.birthDate ? String(form.birthDate).slice(0, 10) : ''} onChange={(e) => handleChange('birthDate', e.target.value)} fullWidth />
        </Grid>
      </Grid>

      {/* IMPROVEMENT: Phân tách các nhóm thông tin */}
      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" sx={{ mb: 2 }}>Thông tin công việc</Typography>
      <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
          <TextField
            label="Chức vụ"
            value={
              form?.isDepartmentHead
                ? 'Trưởng khoa'
                : 'Giảng viên'
            }
            fullWidth 
            disabled
            variant="filled"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField label="Bằng cấp" value={form?.degree?.fullName || ''} fullWidth disabled variant="filled" />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField label="Khoa" value={form?.department?.fullName || form?.department?.fullName || ''} fullWidth disabled variant="filled" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField label="Phòng ban" value={form?.office || ''} onChange={(e) => handleChange('office', e.target.value)} fullWidth />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        {/* IMPROVEMENT: Sử dụng LoadingButton */}
        <LoadingButton variant="contained" onClick={handleSave} loading={saving}>
          Lưu thay đổi
        </LoadingButton>
      </Box>

      {/* IMPROVEMENT: Component Snackbar để hiển thị thông báo */}
      {snackbar && (
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Paper>
  );
};

export default ProfilePage;