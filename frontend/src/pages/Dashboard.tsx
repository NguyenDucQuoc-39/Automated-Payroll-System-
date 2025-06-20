import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';

const deepBlueBlack = '#0A1128'; 
const textWhite = '#FFFFFF'; 
const HeroSection = styled(Box)(({ theme }) => ({
  background: deepBlueBlack,
  borderRadius: theme.shape.borderRadius * 2, 
  color: textWhite, 
  padding: theme.spacing(8, 4), 
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)', 
  marginBottom: theme.spacing(6),
  textAlign: 'center', 
}));

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#F5F5F5', minHeight: '100vh' }}> 
      <HeroSection>
        <Typography variant="h2" component="h1" gutterBottom > 
          Hệ thống Thanh toán Lương Giảng viên
        </Typography>
        <Typography variant="h5" sx={{ maxWidth: '900px', mx: 'auto', mt: 2 }}> 
          Giải pháp quản lý toàn diện và hiệu quả, tối ưu hóa quy trình thanh toán lương cho giảng viên, mang lại sự minh bạch và tiện lợi.
        </Typography>
      </HeroSection>

    
    </Box>
  );
};

export default Dashboard;