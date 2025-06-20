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
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import api from '../services/api';

interface PieLabelProps {
  name: string;
  percent: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface TeacherStatisticsData  {
  byGender: {
    MALE: number;
    FEMALE: number;
    OTHER: number;
  };
  byDepartment: Record<string, number>;
  byDegree: Record<string, number>;
}

// Ánh xạ DegreeTypeEnum sang tiếng Việt
const degreeTypeMap: Record<string, string> = {
  MASTER: 'Thạc Sĩ',
  DOCTOR: 'Tiến Sĩ',
  ASSOCIATE_PROFESSOR: 'Phó Giáo Sư',
  PROFESSOR: 'Giáo Sư',
};

const Statistics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<TeacherStatisticsData | null>(null);
  const [detailedStats, setDetailedStats] = useState<any[]>([]); // State for detailed department stats

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      try {
        const response = await api.get('/teachers/teacherStatistics');
        setStatistics(response.data);

        // Prepare data for detailed department table
        const departmentData = response.data.byDepartmentDetailed; // Assuming backend sends this
        if (departmentData) {
            const formattedDetailedStats = Object.keys(departmentData).map(deptId => ({
                department: departmentData[deptId].name,
                male: departmentData[deptId].MALE || 0,
                female: departmentData[deptId].FEMALE || 0,
                total: (departmentData[deptId].MALE || 0) + (departmentData[deptId].FEMALE || 0),
            }));
            setDetailedStats(formattedDetailedStats);
        } else {
            setDetailedStats([]);
        }

      } catch (err: any) {
        console.error('Error fetching teacher statistics:', err);
        setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu thống kê giảng viên.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const formatPieLabel = ({ name, percent }: PieLabelProps) => {
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!statistics) {
    return null;
  }

  // Prepare data for charts
  const genderData = [
    { name: 'Nam', value: statistics.byGender.MALE || 0 },
    { name: 'Nữ', value: statistics.byGender.FEMALE || 0 },
    { name: 'Khác', value: statistics.byGender.OTHER || 0 },
  ].filter(item => item.value > 0);

  const departmentDataForChart = Object.keys(statistics.byDepartment).map(deptId => ({
    name: deptId, // Assuming deptId is already department name or code
    value: statistics.byDepartment[deptId],
  })).filter(item => item.value > 0);

  const degreeDataForChart = Object.keys(statistics.byDegree).map(degreeType => ({
    name: degreeTypeMap[degreeType] || degreeType, // Ánh xạ tên bằng cấp
    value: statistics.byDegree[degreeType],
  })).filter(item => item.value > 0);


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Thống Kê Giảng Viên
      </Typography>

      <Grid container spacing={3}>
        {/* Gender Distribution Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Phân bố theo Giới tính
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={formatPieLabel}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Teachers by Department Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Giảng viên theo Khoa
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={departmentDataForChart}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" name="Số lượng" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Teachers by Degree Bar Chart */}
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Giảng viên theo Bằng cấp
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={degreeDataForChart}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Số lượng" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Detailed Statistics Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Chi tiết thống kê theo khoa
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Khoa</TableCell>
                    <TableCell align="right">Nam</TableCell>
                    <TableCell align="right">Nữ</TableCell>
                    <TableCell align="right">Tổng số</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailedStats.map((row) => (
                    <TableRow key={row.department}>
                      <TableCell component="th" scope="row">
                        {row.department}
                      </TableCell>
                      <TableCell align="right">{row.male}</TableCell>
                      <TableCell align="right">{row.female}</TableCell>
                      <TableCell align="right">{row.total}</TableCell>
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

export default Statistics;
