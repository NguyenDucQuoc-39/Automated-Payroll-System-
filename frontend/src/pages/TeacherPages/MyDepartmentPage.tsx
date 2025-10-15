import React, { useEffect, useState, useCallback } from 'react';
import { Box, TextField, Typography, Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getMyDepartmentMembers, getMyProfile } from '../../services/teacherSelf.service';

const MyDepartmentPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [deptName, setDeptName] = useState('');

  // IMPROVEMENT: Sửa lại 'field' để là duy nhất, valueGetter sẽ định dạng nó
  const columns: GridColDef[] = [
    { field: 'orderNumber', headerName: 'Mã GV', width: 100, valueGetter: (p: any) => 'GV' + p.row?.orderNumber?.toString().padStart(4, '0') },
    { field: 'firstName' + 'lastName', headerName: 'Họ và tên', width: 300, valueGetter: (p: any) => p.row?.firstName + ' ' + p.row?.lastName },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 220 },
    //số điện thoại
    { field: 'phone', headerName: 'Số điện thoại', width: 150, valueGetter: (p: any) => p.row?.phone },
    //ngày sinh
    { field: 'birthDate', headerName: 'Ngày sinh', width: 150, valueGetter: (p: any) => p.row?.birthDate ? new Date(p.row?.birthDate).toLocaleDateString() : '' },
    //chức vụ/phòng
    { field: 'office', headerName: 'Văn phòng', width: 150, valueGetter: (p: any) => p.row?.office },
    { field: 'gender', headerName: 'Giới tính', width: 150, valueGetter: (p: any) => (p.row?.gender === 'MALE' ? 'Nam' : p.row?.gender === 'FEMALE' ? 'Nữ' : 'Khác') },
    { field: 'degree', headerName: 'Bằng cấp', width: 180, valueGetter: (p: any) => p.row?.degree?.fullName },
    { field: 'isHead', headerName: 'Chức vụ', width: 150, valueGetter: (p: any) => (p.row?.isHead ? 'Trưởng khoa' : 'Giảng viên') },
  ];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Tải song song để tăng tốc độ
      const [meRes, membersRes] = await Promise.all([
        getMyProfile(),
        getMyDepartmentMembers({ search })
      ]);
      
      setDeptName(meRes.data?.department?.fullName || meRes.data?.department?.shortName || '');
      setRows(membersRes.data || []);
    } catch (error) {
        console.error("Failed to load department data:", error);
        setRows([]);
    } 
    finally {
      setLoading(false);
    }
  }, [search]); // Chỉ phụ thuộc vào `search`

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 500); // Đợi 500ms sau khi người dùng ngừng gõ

    return () => clearTimeout(timer);
  }, [search, loadData]);

  // Load data lần đầu
  useEffect(() => {
    getMyProfile().then(me => {
        setDeptName(me.data?.department?.fullName || me.data?.department?.shortName || '');
    });
    loadData();
  }, []); // Chỉ chạy 1 lần lúc đầu


  return (
    // IMPROVEMENT: Sử dụng Paper làm container chính
    <Paper sx={{ p: 2, m: 2 }}>
      {/* IMPROVEMENT: Tạo một 'toolbar' cho tiêu đề và thanh tìm kiếm */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Giảng viên khoa {deptName}
        </Typography>
        <TextField
          label="Tìm kiếm giảng viên"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>

      {/* IMPROVEMENT: Dùng Box và autoHeight cho DataGrid */}
      <Box sx={{ height: 'auto', width: '100%' }}>
        <DataGrid
          autoHeight
          loading={loading}
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          pageSizeOptions={[10, 25, 50]} // IMPROVEMENT: Thêm tùy chọn phân trang
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          sx={{ border: 0 }} // Bỏ border để giao diện sạch hơn
        />
      </Box>
    </Paper>
  );
};

export default MyDepartmentPage;