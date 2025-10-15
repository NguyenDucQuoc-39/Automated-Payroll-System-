import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  AppBar,
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button, // Thêm Button
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  BarChart as BarChartIcon,
  AccountCircle as AccountCircleIcon,
  Info as InfoIcon,
  Business as BusinessIcon,
  MenuBook as MenuBookIcon,
  CalendarToday as CalendarTodayIcon,
  Book as BookIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  MonetizationOn as MoneyIcon,
  Class as ClassIcon,
  CardMembership as CardMembershipIcon,
  Groups as GroupsIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Stars as StarsIcon,
} from '@mui/icons-material';
import { logout } from '../store/slices/authSlice';
import { AppDispatch } from '../store';
import logo from '../assets/logo.png'; // Đảm bảo đường dẫn này đúng

const deepBlueBlack = '#1A202C';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

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
    { text: 'Bằng Cấp', icon: <CardMembershipIcon />, path: '/degrees' },
    { text: 'Khoa', icon: <BusinessIcon />, path: '/departments' },
    { text: 'Giảng Viên', icon: <GroupsIcon />, path: '/teachers' },
    { text: 'Thống Kê Giảng Viên', icon: <BarChartIcon />, path: '/statistics' },
  ];

  const courseMenuItems = [
    { text: 'Học Kỳ', icon: <CalendarTodayIcon />, path: '/semesters' },
    { text: 'Học Phần', icon: <MenuBookIcon />, path: '/courses' },
    { text: 'Lớp Học Phần & Phân Công', icon: <ClassIcon />, path: '/class-sections' },
    { text: 'Thống Kê Số Lớp', icon: <AssessmentIcon />, path: '/class-section-statistics' },
  ];
  
  const salaryMenuItems = [
      { text: 'Thiết Lập Hệ Số Tiết Học', icon: <HourglassEmptyIcon />, path: '/tiet-he-so' },
      { text: 'Thiết Lập Hệ Số Bằng Cấp', icon: <StarsIcon />, path: '/bang-cap-he-so' },
      { text: 'Thiết Lập Hệ Số Lớp', icon: <SchoolIcon />, path: '/lop-he-so' },
      { text: 'Tính Tiền Dạy', icon: <MoneyIcon />, path: '/tinh-tien-day' },
  ];

  const reportMenuItems = [
    { text: 'Tiền dạy của giảng viên trong một năm', icon: <MoneyIcon />, path: '/report/teacher-year' },
    { text: 'Tiền dạy của giảng viên một khoa', icon: <MoneyIcon />, path: '/report/teacher-department' },
    { text: 'Tiền dạy của giảng viên toàn trường', icon: <MoneyIcon />, path: '/report/teacher-school' },
  ];
  
  // --- Hàm render menu item để tái sử dụng ---
  const renderMenuItems = (items: { text: string; icon: JSX.Element; path: string }[]) => {
    return items.map((item) => (
      <MenuItem key={item.text} onClick={() => handleNavigate(item.path)}>
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText>{item.text}</ListItemText>
      </MenuItem>
    ));
  };


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ backgroundColor: deepBlueBlack }}>
        <Toolbar>
          {/* Logo */}
          <Box
            component="img"
            src={logo}
            alt="Phenikaa Logo"
            sx={{ height: 40, mr: 2, cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          />
          
          {/* Tiêu đề hệ thống */}
          <Typography variant="h6" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Hệ thống Quản lý Giảng viên
          </Typography>

          {/* Spacer - Đẩy các mục menu sang phải */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Các nút điều hướng */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button color="inherit" onClick={() => navigate('/dashboard')}>
              <DashboardIcon sx={{mr: 1}}/>
              Trang chủ
            </Button>

            {/* Menu Quản lý thông tin */}
            <Button color="inherit" onClick={(e) => handleMenuOpen(e, setInfoMenuAnchorEl)}>
              <InfoIcon sx={{mr: 1}}/>
              Quản lý thông tin
            </Button>
            <Menu
              anchorEl={infoMenuAnchorEl}
              open={Boolean(infoMenuAnchorEl)}
              onClose={() => handleMenuClose(setInfoMenuAnchorEl)}
            >
              {renderMenuItems(infoMenuItems)}
            </Menu>

            {/* Menu Quản lý học phần */}
            <Button color="inherit" onClick={(e) => handleMenuOpen(e, setCourseMenuAnchorEl)}>
                <MenuBookIcon sx={{mr: 1}}/>
                Quản lý học phần
            </Button>
            <Menu
              anchorEl={courseMenuAnchorEl}
              open={Boolean(courseMenuAnchorEl)}
              onClose={() => handleMenuClose(setCourseMenuAnchorEl)}
            >
              {renderMenuItems(courseMenuItems)}
            </Menu>
            
            {/* Menu Thiết lập & tính tiền */}
            <Button color="inherit" onClick={(e) => handleMenuOpen(e, setSalaryMenuAnchorEl)}>
                <SettingsIcon sx={{mr: 1}}/>
                Thiết lập & Tính tiền
            </Button>
            <Menu
              anchorEl={salaryMenuAnchorEl}
              open={Boolean(salaryMenuAnchorEl)}
              onClose={() => handleMenuClose(setSalaryMenuAnchorEl)}
            >
              {renderMenuItems(salaryMenuItems)}
            </Menu>

             {/* Menu Báo cáo */}
            <Button color="inherit" onClick={(e) => handleMenuOpen(e, setReportMenuAnchorEl)}>
                <AssessmentIcon sx={{mr: 1}}/>
                Báo cáo
            </Button>
            <Menu
              anchorEl={reportMenuAnchorEl}
              open={Boolean(reportMenuAnchorEl)}
              onClose={() => handleMenuClose(setReportMenuAnchorEl)}
            >
              {renderMenuItems(reportMenuItems)}
            </Menu>
          </Box>

          {/* Menu người dùng */}
          <div>
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
              <MenuItem onClick={() => { handleNavigate('/profile'); handleUserMenuClose(); }}>Hồ sơ</MenuItem>
              <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      
      {/* Nội dung chính của trang */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%', // Chiếm toàn bộ chiều rộng
          mt: 8, // Khoảng cách từ đầu trang (bằng chiều cao AppBar)
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;