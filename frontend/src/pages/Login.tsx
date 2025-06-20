import React, { useState, ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Link,
} from '@mui/material';
import { login } from '../store/slices/authSlice';
import { AppDispatch } from '../store';
import { message } from 'antd';
import PhenikaaLogo from '../assets/logo_1.png'; // Make sure this path is correct


const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'STAFF',
  });
  const [error, setError] = useState<string | null>(null);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await dispatch(login({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })).unwrap();
      if (result) {
        navigate('/dashboard');
      }
    } catch (err) {
      message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#0A3B7E',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        p: 2,
      }}
    >
      <Container component="main" maxWidth="md"> {/* Changed from "xs" to "sm" for slightly larger, or you can try "md" */}
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            bgcolor: 'white',
            borderRadius: 3, // Increased border radius for more rounded corners (from 2 to 3)
            boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Box sx={{ mb: 2 }}>
            <img src={PhenikaaLogo} alt="Phenikaa University Logo" style={{ width: '150px' }} />
          </Box>
          <Typography component="h1" variant="h4" sx={{ color: '#0A3B7E', fontWeight: 'bold', mb: 3 }}>
            Đăng nhập
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Tên đăng nhập hoặc Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleTextChange}
              variant="outlined"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleTextChange}
              variant="outlined"
            />
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel id="role-label">Vai trò</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formData.role}
                label="Vai trò"
                onChange={handleSelectChange}
              >
                <MenuItem value="ADMIN">Quản trị viên</MenuItem>
                <MenuItem value="DEPARTMENT_HEAD">Trưởng khoa</MenuItem>
                <MenuItem value="ACCOUNTANT">Kế toán</MenuItem>
                <MenuItem value="STAFF">Giảng viên</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                bgcolor: '#0A3B7E',
                '&:hover': {
                  bgcolor: '#072A5D',
                },
                py: 1.5,
                fontWeight: 'bold',
                fontSize: '1rem',
              }}
            >
              Đăng nhập
            </Button>
            <Link href="#" variant="body2" sx={{ textAlign: 'center', display: 'block', mt: 1, color: '#0A3B7E' }}>
              Quên mật khẩu?
            </Link>

            <Typography variant="body2" sx={{ textAlign: 'center', my: 2, color: 'text.secondary' }}>
              Hoặc đăng nhập bằng
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                borderColor: '#ccc',
                color: '#666',
                '&:hover': {
                  borderColor: '#999',
                },
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img src="https://img.icons8.com/color/24/000000/microsoft.png" alt="Microsoft Logo" style={{ marginRight: 8 }} />
              Microsoft
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;