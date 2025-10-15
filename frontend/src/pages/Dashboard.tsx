import React from 'react';
import { Box, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import { styled } from '@mui/system';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';

const deepBlueBlack = '#0A1128';
const textWhite = '#FFFFFF';
const accentOrange = '#FF6B35';

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${deepBlueBlack}, #1B263B)`,
  borderRadius: theme.shape.borderRadius * 2,
  color: textWhite,
  padding: theme.spacing(10, 4),
  textAlign: 'center',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
  marginBottom: theme.spacing(8),
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  textAlign: 'center',
  backgroundColor: '#FFFFFF',
  boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
  },
}));

const StepBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(4),
}));

const Footer = styled(Box)(({ theme }) => ({
  backgroundColor: deepBlueBlack,
  color: textWhite,
  padding: theme.spacing(4),
  textAlign: 'center',
  marginTop: theme.spacing(10),
}));

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      {/* Hero Section */}
      <HeroSection>
        <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
          Hệ thống Thanh toán Lương Giảng viên
        </Typography>
        <Typography variant="h6" sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}>
          Giải pháp quản lý toàn diện và hiệu quả: từ thông tin giảng viên, khoa, bằng cấp đến quy trình tính lương minh bạch – nhanh chóng và chính xác.
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            backgroundColor: accentOrange,
            color: '#fff',
            px: 4,
            py: 1.5,
            fontWeight: 'bold',
            borderRadius: 8,
            '&:hover': { backgroundColor: '#e65c2d' },
          }}
        >
          Dùng thử ngay
        </Button>
      </HeroSection>

      {/* Features Section */}
      <Box sx={{ px: 4, py: 8, maxWidth: '1200px', mx: 'auto' }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
          Tính năng nổi bật
        </Typography>
        <Typography variant="body1" textAlign="center" sx={{ mb: 6 }}>
          Hỗ trợ quản lý và thanh toán lương một cách hiện đại, chính xác và minh bạch
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <FeatureCard>
              <SchoolIcon sx={{ fontSize: 50, color: accentOrange, mb: 2 }} />
              <CardContent>
                <Typography variant="h6" fontWeight="bold">Quản lý giảng viên</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Lưu trữ thông tin khoa, bằng cấp, hồ sơ cá nhân và quá trình công tác.
                </Typography>
              </CardContent>
            </FeatureCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard>
              <AccountBalanceWalletIcon sx={{ fontSize: 50, color: accentOrange, mb: 2 }} />
              <CardContent>
                <Typography variant="h6" fontWeight="bold">Tính lương tự động</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Tính toán nhanh chóng dựa trên số tiết dạy, hệ số, phụ cấp và chính sách của trường.
                </Typography>
              </CardContent>
            </FeatureCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard>
              <AssessmentIcon sx={{ fontSize: 50, color: accentOrange, mb: 2 }} />
              <CardContent>
                <Typography variant="h6" fontWeight="bold">Báo cáo minh bạch</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Xuất bảng lương chi tiết dưới dạng PDF/Excel, đảm bảo tính công khai và chính xác.
                </Typography>
              </CardContent>
            </FeatureCard>
          </Grid>
        </Grid>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ backgroundColor: '#fff', py: 8 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
          Cách sử dụng hệ thống
        </Typography>
        <Typography variant="body1" textAlign="center" sx={{ mb: 6 }}>
          Chỉ với vài bước đơn giản, bạn đã có thể quản lý và thanh toán lương hiệu quả
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={3}>
            <StepBox>
              <TimelineIcon sx={{ fontSize: 50, color: accentOrange, mb: 2 }} />
              <Typography variant="h6" fontWeight="bold">Bước 1</Typography>
              <Typography variant="body2">Đăng nhập và quản lý thông tin giảng viên</Typography>
            </StepBox>
          </Grid>
          <Grid item xs={12} md={3}>
            <StepBox>
              <TimelineIcon sx={{ fontSize: 50, color: accentOrange, mb: 2 }} />
              <Typography variant="h6" fontWeight="bold">Bước 2</Typography>
              <Typography variant="body2">Nhập số liệu giảng dạy và hệ số</Typography>
            </StepBox>
          </Grid>
          <Grid item xs={12} md={3}>
            <StepBox>
              <TimelineIcon sx={{ fontSize: 50, color: accentOrange, mb: 2 }} />
              <Typography variant="h6" fontWeight="bold">Bước 3</Typography>
              <Typography variant="body2">Hệ thống tự động tính lương & xuất báo cáo</Typography>
            </StepBox>
          </Grid>
        </Grid>
      </Box>

      {/* Footer */}
      <Footer>
        <Typography variant="body2">
          © {new Date().getFullYear()} Hệ thống Thanh toán Lương Giảng viên. Mọi quyền được bảo lưu.
        </Typography>
      </Footer>
    </Box>
  );
};

export default Dashboard;
