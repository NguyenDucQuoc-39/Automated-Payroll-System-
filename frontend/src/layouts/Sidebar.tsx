import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon, // Có thể loại bỏ nếu không dùng
  BarChart as BarChartIcon,
  AccountCircle as AccountCircleIcon,
  ExpandLess,
  ExpandMore,
  Info as InfoIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  MenuBook as MenuBookIcon, // Giữ hoặc thay bằng BookIcon
  CalendarToday as CalendarTodayIcon,
  Book as BookIcon, // Giữ hoặc thay bằng MenuBookIcon
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  MonetizationOn as MoneyIcon, // Giữ nguyên MonetizationOnIcon
 
  Class as ClassIcon, // Giữ nguyên ClassIcon

  // CÁC ICON MỚI ĐƯỢC THÊM VÀO HOẶC THAY THẾ
  CardMembership as CardMembershipIcon, // Cho Bằng Cấp
  AttachMoney as AttachMoneyIcon, // Cho Hệ Số Tiết Học
  LocalAtm as LocalAtmIcon, // Cho Hệ Số Bằng Cấp
  PriceChange as PriceChangeIcon, // Cho Hệ Số Lớp
  Groups as GroupsIcon, // Thay thế PersonIcon cho Giảng Viên (nếu muốn)
  HourglassEmpty as HourglassEmptyIcon, // Một lựa chọn khác cho hệ số tiết học
  Stars as StarsIcon, // Một lựa chọn khác cho hệ số bằng cấp
  EmojiEvents as EmojiEventsIcon, // Một lựa chọn khác cho Bằng Cấp
} from '@mui/icons-material';
import { logout } from '../store/slices/authSlice';
import { AppDispatch } from '../store';
import logo from '../assets/logo.png'; // Đảm bảo đường dẫn này đúng

const drawerWidth = 240;
const deepBlueBlack = '#1A202C'; // Màu xanh đen đậm nhất quán
const selectedItemBg = '#34495E'; // Màu nền cho item được chọn

const MainLayout: React.FC = () => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [infoMenuOpen, setInfoMenuOpen] = useState(false);
  const [courseMenuOpen, setCourseMenuOpen] = useState(false);
  const [salaryMenuOpen, setSalaryMenuOpen] = useState(false);
  const [reportMenuOpen, setReportMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleInfoMenuClick = () => {
    setInfoMenuOpen(!infoMenuOpen);
  };

  const handleCourseMenuClick = () => {
    setCourseMenuOpen(!courseMenuOpen);
  };

  const handleSalaryMenuClick = () => {
    setSalaryMenuOpen(!salaryMenuOpen);
  };

  const handleReportMenuClick = () => {
    setReportMenuOpen(!reportMenuOpen);
  };

  const menuItems = [
    { text: 'Trang chủ', icon: <DashboardIcon />, path: '/dashboard' },
  ];

  const infoMenuItems = [
    { text: 'Bằng Cấp', icon: <CardMembershipIcon />, path: '/degrees',  }, // Đã thay đổi
    { text: 'Khoa', icon: <BusinessIcon />, path: '/departments' },
    { text: 'Giảng Viên', icon: <GroupsIcon />, path: '/teachers' },
    { text: 'Thống Kê Giảng Viên', icon: <BarChartIcon />, path: '/statistics' },
  ];
  
  const courseMenuItems = [
    { text: 'Học Kỳ', icon: <CalendarTodayIcon />, path: '/semesters' },
    { text: 'Học Phần', icon: <MenuBookIcon />, path: '/courses' },
    { text: 'Lớp Học Phần & Phân Công Giảng Viên', icon: <ClassIcon />, path: '/class-sections' },
    { text: 'Thống Kê Số Lớp', icon: <AssessmentIcon />, path: '/class-section-statistics' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: deepBlueBlack, // Màu xanh đen đậm nhất quán cho AppBar
          width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
          ml: { sm: `${open ? drawerWidth : 0}px` },
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            borderRadius: 0,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit" // Icons và chữ trên AppBar sẽ là màu trắng mặc định
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography textAlign={'center'} variant="h5" noWrap component="div" sx={{ flexGrow: 1 }}>
            Hệ thống Quản lý Thông Tin và Tính Lương Tự Động Của Giảng Viên
          </Typography>
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircleIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => navigate('/profile')}>Hồ sơ</MenuItem>
              <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: deepBlueBlack, // Màu xanh đen đậm nhất quán cho Drawer
            color: 'white', // Đảm bảo chữ và icon hiển thị rõ
            borderRadius: 0,
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Toolbar>
          <Box
            component="img"
            src={logo}
            alt="Phenikaa Logo"
            sx={{ width: '100%', height: 'auto', maxHeight: '60px' }}
          />
        </Toolbar>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} /> {/* Điều chỉnh màu divider để phù hợp nền tối */}
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  color: 'white', // Chữ mặc định màu trắng
                  '&.Mui-selected': {
                    backgroundColor: selectedItemBg, // Màu nền khi được chọn
                    color: 'white',
                    '&:hover': {
                      backgroundColor: selectedItemBg, // Giữ màu khi hover trên item được chọn
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)', // Hiệu ứng hover nhẹ trên nền tối
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon> {/* Icon màu trắng */}
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding>
            <ListItemButton onClick={handleInfoMenuClick} sx={{ color: 'white' }}>
              <ListItemIcon sx={{ color: 'white' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="Quản lý thông tin" />
              {infoMenuOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={infoMenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {infoMenuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    sx={{
                      pl: 4,
                      color: 'white',
                      '&.Mui-selected': {
                        backgroundColor: selectedItemBg,
                        color: 'white',
                        '&:hover': {
                          backgroundColor: selectedItemBg,
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      },
                    }}
                    selected={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                  >
                    <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>

          <ListItem disablePadding>
            <ListItemButton onClick={handleCourseMenuClick} sx={{ color: 'white' }}>
              <ListItemIcon sx={{ color: 'white' }}>
                <MenuBookIcon />
              </ListItemIcon>
              <ListItemText primary="Quản Lý Học phần" />
              {courseMenuOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={courseMenuOpen} timeout="auto" unmountOnExit>
            {courseMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  sx={{
                    pl: 4,
                    color: 'white',
                    '&.Mui-selected': {
                      backgroundColor: selectedItemBg,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: selectedItemBg,
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    },
                  }}
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </Collapse>

          <ListItem disablePadding>
            <ListItemButton onClick={handleSalaryMenuClick} sx={{ color: 'white' }}>
              <ListItemIcon sx={{ color: 'white' }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Thiết Lập Hệ Số Và Tính Tiền" />
              {salaryMenuOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={salaryMenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4, color: 'white', '&.Mui-selected': { backgroundColor: selectedItemBg, color: 'white', '&:hover': { backgroundColor: selectedItemBg } }, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' } }}
                  selected={location.pathname === '/tiet-he-so'}
                  onClick={() => navigate('/tiet-he-so')}
                >
                  <ListItemIcon sx={{ color: 'white' }}>
                    <HourglassEmptyIcon />
                  </ListItemIcon>
                  <ListItemText primary="Thiết Lập Hệ Số Tiết Học" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4, color: 'white', '&.Mui-selected': { backgroundColor: selectedItemBg, color: 'white', '&:hover': { backgroundColor: selectedItemBg } }, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' } }}
                  selected={location.pathname === '/bang-cap-he-so'}
                  onClick={() => navigate('/bang-cap-he-so')}
                >
                  <ListItemIcon sx={{ color: 'white' }}>
                    <StarsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Thiết Lập Hệ Số Bằng Cấp" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4, color: 'white', '&.Mui-selected': { backgroundColor: selectedItemBg, color: 'white', '&:hover': { backgroundColor: selectedItemBg } }, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' } }}
                  selected={location.pathname === '/lop-he-so'}
                  onClick={() => navigate('/lop-he-so')}
                >
                  <ListItemIcon sx={{ color: 'white' }}>
                    <SchoolIcon />
                  </ListItemIcon>
                  <ListItemText primary="Thiết Lập Hệ Số Lớp" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4, color: 'white', '&.Mui-selected': { backgroundColor: selectedItemBg, color: 'white', '&:hover': { backgroundColor: selectedItemBg } }, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' } }}
                  selected={location.pathname === '/tinh-tien-day'}
                  onClick={() => navigate('/tinh-tien-day')}
                >
                  <ListItemIcon sx={{ color: 'white' }}>
                    <MoneyIcon />
                  </ListItemIcon>
                  <ListItemText primary="Tính Tiền Dạy" />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>

          <ListItemButton onClick={() => setReportMenuOpen(!reportMenuOpen)} selected={location.pathname.startsWith('/report')}>
            <ListItemIcon sx={{ color: 'white' }}><AssessmentIcon /></ListItemIcon>
            <ListItemText primary="Báo cáo" />
            {reportMenuOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={reportMenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/report/teacher-year')} selected={location.pathname === '/report/teacher-year'}>
                <ListItemIcon sx={{ color: 'white' }}><MoneyIcon /></ListItemIcon>
                <ListItemText primary="Tiền dạy của giảng viên trong một năm" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/report/teacher-department')} selected={location.pathname === '/report/teacher-department'}>
                <ListItemIcon sx={{ color: 'white' }}><MoneyIcon /></ListItemIcon>
                <ListItemText primary="Tiền dạy của giảng viên một khoa" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/report/teacher-school')} selected={location.pathname === '/report/teacher-school'}>
                <ListItemIcon sx={{ color: 'white' }}><MoneyIcon /></ListItemIcon>
                <ListItemText primary="Tiền dạy của giảng viên toàn trường" />
              </ListItemButton>
            </List>
          </Collapse>
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8, // Khoảng cách từ đầu trang xuống nội dung chính (tương ứng chiều cao AppBar)
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
