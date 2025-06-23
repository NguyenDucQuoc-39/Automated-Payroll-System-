// src/pages/ClassSectionStatisticsPage.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';
import { ClassSectionStatisticsData } from '../../types/typeFrontend';

const ClassSectionStatisticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<ClassSectionStatisticsData | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await api.get<ClassSectionStatisticsData>('/class-sections/statistics');
        setStatistics(response.data);
      } catch (err: any) {
        console.error('Error fetching class section statistics:', err);
        setError(err.response?.data?.message || 'Đã xảy ra lỗi khi lấy dữ liệu thống kê lớp học phần.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Đang tải dữ liệu thống kê...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!statistics) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Không có dữ liệu thống kê để hiển thị.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Thống Kê Số Lớp
      </Typography>

      <Grid container spacing={3}>
        {/* Biểu đồ số lớp học phần theo Khoa */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Số Lớp Học Phần theo Khoa
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={statistics.byDepartment}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="classSectionCount" name="Số Lớp Học Phần" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Biểu đồ số lớp học phần theo Năm Học/Kì Học */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Số Lớp Học Phần theo Học Kỳ
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={statistics.bySemester}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semester" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="classSectionCount" name="Số Lớp Học Phần" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Bảng chi tiết thống kê tổng số sinh viên theo Khoa */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Bảng Thống Kê
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Khoa</TableCell>
                    <TableCell align="right">Tổng số lớp học phần</TableCell>
                    <TableCell align="right">Tổng số sinh viên tối đa</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statistics.byDepartment.map((row) => (
                    <TableRow key={row.department}>
                      <TableCell component="th" scope="row">
                        {row.department}
                      </TableCell>
                      <TableCell align="right">{row.classSectionCount}</TableCell>
                      <TableCell align="right">{row.totalMaxStudents}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClassSectionStatisticsPage;