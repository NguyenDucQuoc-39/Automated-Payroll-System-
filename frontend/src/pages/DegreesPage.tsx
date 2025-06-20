import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  TablePagination,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {  UploadOutlined } from '@ant-design/icons'; // Import from ant-design
import * as XLSX from 'xlsx'; // Import thư viện xlsx
import { message } from 'antd'; // Import message from antd

import { RootState } from '../store';
import api from '../services/api';
// Import Degree, FrontendFormDegreeType, BackendDegreeType từ file type.ts
import { Degree, FrontendFormDegreeType, BackendDegreeType } from '../types/typeFrontend';


const DegreesPage: React.FC = () => {
  // const navigate = useNavigate();
  // const dispatch = useDispatch();
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [editingDegree, setEditingDegree] = useState<Degree | null>(null);
  const [formData, setFormData] = useState({
    type: '' as FrontendFormDegreeType,
    fullName: '',
    shortName: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<FrontendFormDegreeType | ''>('');
  const [sortBy] = useState<'orderNumber' | 'shortName' | 'fullName' | 'type' | ''>('orderNumber');
  const [sortOrder] = useState<'asc' | 'desc'>('asc');

  // Thêm state cho phân trang
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  // Định nghĩa các loại bằng cấp cho frontend
  const degreeTypes: { value: FrontendFormDegreeType; label: string }[] = [
    { value: 'Thạc sĩ', label: 'Thạc sĩ' },
    { value: 'Tiến sĩ', label: 'Tiến sĩ' },
    { value: 'Phó Giáo Sư', label: 'Phó Giáo Sư' },
    { value: 'Giáo Sư', label: 'Giáo Sư' },
  ];

  // Helper function để chuyển đổi BackendDegreeType sang tiếng Việt
  const getDisplayDegreeType = useCallback((backendType: BackendDegreeType): FrontendFormDegreeType | string => {
    switch (backendType) {
      case 'MASTER': return 'Thạc sĩ';
      case 'DOCTOR': return 'Tiến sĩ';
      case 'ASSOCIATE_PROFESSOR': return 'Phó Giáo Sư';
      case 'PROFESSOR': return 'Giáo Sư';
      default: return backendType;
    }
  }, []);

  const fetchDegrees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: { [key: string]: string } = {};
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (selectedType) {
        params.type = selectedType;
      }
      if (sortBy) {
        params.sortBy = sortBy;
        params.sortOrder = sortOrder;
      }
      // Thêm params cho phân trang
      params.page = (page + 1).toString();
      params.limit = rowsPerPage.toString();

      const response = await api.get('/degrees', { params });
      setDegrees(response.data.degrees);
      setTotalCount(response.data.total);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách bằng cấp:', err);
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách bằng cấp.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedType, sortBy, sortOrder, page, rowsPerPage]);

  useEffect(() => {
    fetchDegrees();
  }, [fetchDegrees]);

  // Xử lý thay đổi trang
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Xử lý thay đổi số hàng mỗi trang
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Xử lý thay đổi loại bằng cấp
  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    setSelectedType(event.target.value as FrontendFormDegreeType | '');
    setPage(0); // Reset về trang đầu tiên khi thay đổi bộ lọc
  };

  const handleOpenFormDialog = (degree?: Degree) => {
    setImportResult(null);
    setError(null);
    if (degree) {
      setEditingDegree(degree);
      // Khi mở form sửa, chuyển BackendDegreeType sang FrontendFormDegreeType để điền vào form
      const displayType = getDisplayDegreeType(degree.type);
      // Kiểm tra xem displayType có phải là một giá trị hợp lệ của FrontendFormDegreeType không
      const initialType = degreeTypes.find(t => t.value === displayType)?.value || 'Thạc sĩ';

      setFormData({
        type: initialType,
        fullName: degree.fullName,
        shortName: degree.shortName,
      });
    } else {
      setEditingDegree(null);
      setFormData({
        type: 'Thạc sĩ' as FrontendFormDegreeType, // Mặc định một giá trị hợp lệ
        fullName: '',
        shortName: '',
      });
    }
    setOpenFormDialog(true);
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setEditingDegree(null);
    setFormData({
      type: 'Thạc sĩ' as FrontendFormDegreeType,
      fullName: '',
      shortName: '',
    });
    setError(null);
    setImportResult(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as keyof typeof formData]: value as FrontendFormDegreeType, // Cast value to FrontendFormDegreeType
    }));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.type || !formData.fullName || !formData.shortName) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc (Loại bằng cấp, Tên đầy đủ, Tên viết tắt).');
      return;
    }

    try {
      const payload = {
        type: formData.type, // Gửi giá trị tiếng Việt từ form (FrontendFormDegreeType)
        fullName: formData.fullName,
        shortName: formData.shortName,
      };

      if (editingDegree) {
        await api.put(`/degrees/${editingDegree.id}`, payload);
        message.success('Cập nhật bằng cấp thành công!');
      } else {
        await api.post('/degrees', payload);
        message.success('Thêm bằng cấp mới thành công!');
      }
      fetchDegrees();
      handleCloseFormDialog();
    } catch (err: any) {
      console.error('Lỗi khi lưu bằng cấp:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Không thể thực hiện thao tác.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bằng cấp này?')) {
      return;
    }
    setError(null);
    try {
      await api.delete(`/degrees/${id}`);
      message.success('Xóa bằng cấp thành công!');
      fetchDegrees();
    } catch (err: any) {
      console.error('Lỗi khi xóa bằng cấp:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Không thể xóa bằng cấp.');
    }
  };

  // const handleSortClick = (column: 'orderNumber' | 'shortName' | 'fullName' | 'type') => {
  //   if (sortBy === column) {
  //     setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  //   } else {
  //     setSortBy(column);
  //     setSortOrder('asc');
  //   }
  // };

  // --- Logic mới cho Import Excel ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      readExcelFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setLoading(true);
        setError(null);
        setImportResult(null);

        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        const degreesToImport = json.map((row, index) => {
          // Gửi trực tiếp giá trị đọc từ Excel (tiếng Việt) lên backend
          // Backend sẽ chịu trách nhiệm ánh xạ sang DegreeTypeEnum
          return {
            row: index + 2, // Excel rows are 1-indexed, and header is row 1, so data starts from row 2
            type: String(row['Loại bằng cấp'] || '').trim(), // Lấy nguyên giá trị tiếng Việt
            fullName: String(row['Tên đầy đủ'] || '').trim(),
            shortName: String(row['Tên viết tắt'] || '').trim(),
          };
        });

        const response = await api.post('/degrees/import', { degrees: degreesToImport });
        setImportResult(response.data);
        message.success('Hoàn tất quá trình nhập dữ liệu bằng cấp từ Excel.');
        fetchDegrees();
      } catch (err: any) {
        console.error('Lỗi khi đọc hoặc gửi file Excel:', err);
        const backendErrors = err.response?.data?.errors || [];
        const generalMessage = err.response?.data?.message || 'Lỗi khi xử lý file Excel hoặc import dữ liệu.';
        setError(generalMessage + (backendErrors.length > 0 ? `\n${backendErrors.join('\n')}` : ''));
        setImportResult(err.response?.data || null);
        message.error('Lỗi khi nhập dữ liệu bằng cấp từ Excel.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportButtonClick = () => {
    fileInputRef.current?.click();
  };
  // --- Kết thúc Logic mới cho Import Excel ---


  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý Bằng Cấp
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }}>{error}</Alert>}
      {importResult && (
        <Alert
          severity={importResult.errorCount > 0 ? 'warning' : 'success'}
          sx={{ mb: 2, whiteSpace: 'pre-line' }}
        >
          Nhập dữ liệu hoàn tất:
          <br />
          - Thành công: {importResult.successCount} bản ghi.
          <br />
          - Lỗi: {importResult.errorCount} bản ghi.
          {importResult.errors && importResult.errors.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2">Chi tiết lỗi:</Typography>
              {importResult.errors.map((err: string, index: number) => (
                <Typography key={index} variant="body2" color="error">
                  - {err}
                </Typography>
              ))}
            </Box>
          )}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        {isAdmin && (
          <>
            <Button
              variant="contained"
              component="label"
              startIcon={<AddIcon />}
              onClick={(event: React.MouseEvent) => handleOpenFormDialog()}
              sx={{ mr: 2 }}
            >
              Thêm Bằng Cấp Mới
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<UploadOutlined />}
              onClick={handleImportButtonClick}
              sx={{ ml: 2 }}
            >
              Import từ Excel
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls"
              style={{ display: 'none' }}
            />
          </>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Tìm kiếm theo tên"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Loại bằng cấp</InputLabel>
          <Select
            value={selectedType}
            label="Loại bằng cấp"
            onChange={handleTypeChange}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {degreeTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Thứ tự</TableCell>
                  <TableCell>Loại Bằng Cấp</TableCell>
                  <TableCell>Tên Viết Tắt</TableCell>
                  <TableCell>Tên Đầy Đủ</TableCell>
                  {isAdmin && <TableCell align="right">Thao tác</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {degrees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 5 : 4} align="center">
                      Chưa có dữ liệu bằng cấp.
                    </TableCell>
                  </TableRow>
                ) : (
                  degrees.map((degree) => (
                    <TableRow key={degree.id}>
                      <TableCell>{degree.orderNumber}</TableCell>
                      <TableCell>{getDisplayDegreeType(degree.type)}</TableCell>
                      <TableCell>{degree.shortName}</TableCell>
                      <TableCell>{degree.fullName}</TableCell>
                      {isAdmin && (
                        <TableCell align="right">
                          <IconButton onClick={(event: React.MouseEvent) => handleOpenFormDialog(degree)} color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(degree.id)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Thêm phân trang */}
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count}`}
          />
        </>
      )}

      <Dialog open={openFormDialog} onClose={handleCloseFormDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDegree ? 'Sửa Bằng Cấp' : 'Thêm Bằng Cấp Mới'}
        </DialogTitle>
        <form onSubmit={handleSubmitForm}>
          <DialogContent>
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Loại Bằng Cấp</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="Loại Bằng Cấp"
                onChange={handleFormChange}
              >
                {degreeTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              name="shortName"
              label="Tên viết tắt"
              fullWidth
              value={formData.shortName}
              onChange={handleFormChange}
              required
              placeholder="Ví dụ: TS, ThS, PGS, GS"
            />
            <TextField
              margin="dense"
              name="fullName"
              label="Tên đầy đủ"
              fullWidth
              value={formData.fullName}
              onChange={handleFormChange}
              required
              placeholder="Ví dụ: Tiến sĩ Khoa học máy tính, Phó Giáo sư Y học"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseFormDialog}>Hủy</Button>
            <Button type="submit" variant="contained">
              {editingDegree ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default DegreesPage;
