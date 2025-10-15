import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Box,
  CssBaseline,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import { AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import { logout } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import logo from '../assets/logo.png'; // Đảm bảo đường dẫn này đúng

const deepBlueBlack = '#1A202C';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const isTeacher = userRole === 'TEACHER';

  // State cho menu người dùng (góc phải)
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);

  // State cho các menu dropdown trên AppBar
  const [infoMenuAnchorEl, setInfoMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [courseMenuAnchorEl, setCourseMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [salaryMenuAnchorEl, setSalaryMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [reportMenuAnchorEl, setReportMenuAnchorEl] = useState<null | HTMLElement>(null);

  // --- Handlers cho Menu người dùng ---
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleUserMenuClose();
  };

  // --- Generic handler để mở các menu dropdown ---
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    setter: React.Dispatch<React.SetStateAction<HTMLElement | null>>
  ) => {
    setter(event.currentTarget);
  };
  
  // --- Generic handler để đóng các menu dropdown ---
  const handleMenuClose = (setter: React.Dispatch<React.SetStateAction<HTMLElement | null>>) => {
    setter(null);
  };

  // --- Generic handler cho việc điều hướng từ menu item ---
  const handleNavigate = (path: string) => {
    navigate(path);
    // Đóng tất cả các menu
    setInfoMenuAnchorEl(null);
    setCourseMenuAnchorEl(null);
    setSalaryMenuAnchorEl(null);
    setReportMenuAnchorEl(null);
  };

  // --- Định nghĩa các mục menu ---
  const infoMenuItems = [
    { text: 'Bằng Cấp', path: '/degrees' },
    { text: 'Khoa', path: '/departments' },
    { text: 'Giảng Viên', path: '/teachers' },
    { text: 'Thống Kê Giảng Viên', path: '/statistics' },
  ];

  const courseMenuItems = [
    { text: 'Học Kỳ', path: '/semesters' },
    { text: 'Học Phần', path: '/courses' },
    { text: 'Lớp Học Phần & Phân Công', path: '/class-sections' },
    { text: 'Thống Kê Số Lớp', path: '/class-section-statistics' },
  ];
  
  const salaryMenuItems = [
    { text: 'Thiết Lập Hệ Số Tiết Học', path: '/tiet-he-so' },
    { text: 'Thiết Lập Hệ Số Bằng Cấp', path: '/bang-cap-he-so' },
    { text: 'Thiết Lập Hệ Số Lớp', path: '/lop-he-so' },
    { text: 'Tính Tiền Dạy', path: '/tinh-tien-day' },
  ];

  const reportMenuItems = [
    { text: 'Báo Cáo Năm', path: '/report/teacher-year' },
    { text: 'Báo Cáo Khoa', path: '/report/teacher-department' },
    { text: 'Báo Cáo Toàn Trường', path: '/report/teacher-school' },
  ];
  
  // --- Hàm render menu item (đã thêm sx prop) ---
  const renderMenuItems = (items: { text: string; path: string }[]) => {
    return items.map((item) => (
      <MenuItem 
        key={item.text} 
        onClick={() => handleNavigate(item.path)}
        sx={{ fontSize: '1rem' }} // Chỉnh cỡ chữ
      >
        {item.text}
      </MenuItem>
    ));
  };

  // Kiểu dáng chung cho các nút trên AppBar
  const buttonStyles = {
    fontSize: '1rem', // Cỡ chữ 16px
    textTransform: 'none', // Ngăn việc tự động viết hoa
    mx: 1, // Thêm khoảng cách ngang giữa các nút
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ backgroundColor: deepBlueBlack }}>
        <Toolbar>
          {/* PHẦN BÊN TRÁI */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
            <Box
              component="img"
              src={logo}
              alt="Phenikaa Logo"
              sx={{ height: 40, cursor: 'pointer' }}
              onClick={() => navigate('/dashboard')}
            />
          </Box>

          {/* PHẦN Ở GIỮA - CÁC NÚT ĐIỀU HƯỚNG */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            <Button color="inherit" onClick={() => navigate('/dashboard')} sx={buttonStyles}>
              Trang chủ
            </Button>

            {!isTeacher && (
              <>
                <Button color="inherit" onClick={(e) => handleMenuOpen(e, setInfoMenuAnchorEl)} sx={buttonStyles}>
                  Quản lý thông tin
                </Button>
                <Menu
                  anchorEl={infoMenuAnchorEl}
                  open={Boolean(infoMenuAnchorEl)}
                  onClose={() => handleMenuClose(setInfoMenuAnchorEl)}
                >
                  {renderMenuItems(infoMenuItems)}
                </Menu>

                <Button color="inherit" onClick={(e) => handleMenuOpen(e, setCourseMenuAnchorEl)} sx={buttonStyles}>
                  Quản lý học phần
                </Button>
                <Menu
                  anchorEl={courseMenuAnchorEl}
                  open={Boolean(courseMenuAnchorEl)}
                  onClose={() => handleMenuClose(setCourseMenuAnchorEl)}
                >
                  {renderMenuItems(courseMenuItems)}
                </Menu>
                
                <Button color="inherit" onClick={(e) => handleMenuOpen(e, setSalaryMenuAnchorEl)} sx={buttonStyles}>
                  Thiết lập & Tính tiền
                </Button>
                <Menu
                  anchorEl={salaryMenuAnchorEl}
                  open={Boolean(salaryMenuAnchorEl)}
                  onClose={() => handleMenuClose(setSalaryMenuAnchorEl)}
                >
                  {renderMenuItems(salaryMenuItems)}
                </Menu>

                <Button color="inherit" onClick={(e) => handleMenuOpen(e, setReportMenuAnchorEl)} sx={buttonStyles}>
                  Báo cáo
                </Button>
                <Menu
                  anchorEl={reportMenuAnchorEl}
                  open={Boolean(reportMenuAnchorEl)}
                  onClose={() => handleMenuClose(setReportMenuAnchorEl)}
                >
                  {renderMenuItems(reportMenuItems)}
                </Menu>
              </>
            )}

            {isTeacher && (
              <>
                <Button color="inherit" onClick={() => navigate('/my-department')} sx={buttonStyles}>
                  Khoa của tôi
                </Button>
                <Button color="inherit" onClick={() => navigate('/my-classes')} sx={buttonStyles}>
                  Lớp của tôi
                </Button>
                <Button color="inherit" onClick={() => navigate('/my-salary')} sx={buttonStyles}>
                  Lương của tôi
                </Button>
              </>
            )}
          </Box>

          {/* PHẦN BÊN PHẢI */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleUserMenuOpen}
              color="inherit"
            >
              <AccountCircleIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={userAnchorEl}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(userAnchorEl)}
              onClose={handleUserMenuClose}
            >
              <MenuItem 
                onClick={() => { handleNavigate('/profile'); handleUserMenuClose(); }}
                sx={{ fontSize: '1rem' }} // Chỉnh cỡ chữ
              >
                Hồ sơ
              </MenuItem>
              <MenuItem 
                onClick={handleLogout}
                sx={{ fontSize: '1rem' }} // Chỉnh cỡ chữ
              >
                Đăng xuất
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Nội dung chính của trang */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;