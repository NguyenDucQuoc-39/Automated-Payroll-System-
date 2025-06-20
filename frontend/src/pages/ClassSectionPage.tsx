import React, { useEffect, useState, useCallback } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Pagination,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  InputAdornment,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import api from '../services/api';
import { RootState } from '../store';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import { ClassSection, Semester, Course, Department, Teacher } from '../types/typeFrontend'; // Đảm bảo đúng đường dẫn tới types của bạn
import { getClassSections, updateClassSection } from '../services/classSection.service';
import { getTeachersByDepartment } from '../services/teacher.service';

// Định nghĩa interface cho phản hồi API của departments nếu nó có cấu trúc phân trang
interface DepartmentApiResponse {
  departments: Department[]; // Đây là mảng các khoa
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Định nghĩa interface cho phản hồi API của courses nếu nó có cấu trúc phân trang
interface CourseApiResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TeacherApiResponse {
  teachers: Teacher[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface FullClassSection extends ClassSection {
  semester: {
    id: string;
    name: string;
    academicYear: string;
    orderNumber?: number;
  };
  course: {
    id: string;
    code: string;
    name: string;
    departmentId: string;
    department: {
      id: string;
      fullName: string;
    };
  };
  assignedTeacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    fullName: string;
  } | null;
}

const CLASS_SECTION_STATUSES = ['Sắp Diễn Ra', 'Đang Diễn Ra', 'Đã Kết Thúc'];

const ClassSectionsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [classSections, setClassSections] = useState<FullClassSection[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [open, setOpen] = useState(false);
  const [openBatchDialog, setOpenBatchDialog] = useState(false);
  const [editingClassSection, setEditingClassSection] = useState<FullClassSection | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '', // Tên lớp học phần sẽ được sinh tự động
    semesterId: '',
    courseId: '',
    maxStudents: '', // Changed to string to allow empty value in TextField
    assignedTeacherId: '',
    status: 'Sắp Diễn Ra', // Default status
    departmentId: '', // Thêm departmentId vào formData để chọn khoa trước
  });

  const [batchFormData, setBatchFormData] = useState({
    semesterId: '',
    departmentId: '',
    selectedCourses: {} as Record<string, number>, // { courseId: numberOfClasses }
    maxStudentsPerClass: '', // New field for batch creation
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchErrors, setBatchErrors] = useState<string[]>([]);
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  // New state for filtering
  const [filterDepartmentId, setFilterDepartmentId] = useState('');
  const [filterSemesterId, setFilterSemesterId] = useState('');

  const [openBulkAssign, setOpenBulkAssign] = useState(false);
  const [bulkSemesterId, setBulkSemesterId] = useState('');
  const [bulkDepartmentId, setBulkDepartmentId] = useState('');
  const [bulkClassSections, setBulkClassSections] = useState<FullClassSection[]>([]);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);
  const [bulkTeachers, setBulkTeachers] = useState<Teacher[]>([]);
  const [bulkTeacherId, setBulkTeacherId] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);

  const fetchClassSections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/class-sections`, {
        params: {
          page,
          limit,
          search: searchQuery,
          departmentId: filterDepartmentId, // Thêm filter Department ID
          semesterId: filterSemesterId, // Thêm filter Semester ID
        },
      });
      // Ensure classSections is an array, even if API response is not perfectly structured
      if (response.data && Array.isArray(response.data.classSections)) {
        setClassSections(response.data.classSections);
        setTotalPages(response.data.totalPages || 1);
      } else {
        console.error('API response for class sections is not an array or malformed:', response.data);
        setClassSections([]);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách lớp học phần:', err);
      setError('Không thể tải danh sách lớp học phần. Vui lòng thử lại sau.');
      setClassSections([]); // Ensure it's an array on error
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, filterDepartmentId, filterSemesterId]); // Add filter dependencies

  const fetchSemesters = useCallback(async () => {
    try {
      const response = await api.get('/semesters?limit=100');
      // Ensure semesters is an array
      if (response.data && Array.isArray(response.data.semesters)) {
        setSemesters(response.data.semesters);
      } else if (Array.isArray(response.data)) { // Fallback if API returns array directly
        setSemesters(response.data);
      } else {
        console.error('API response for semesters is not an array or malformed:', response.data);
        setSemesters([]); // Ensure it's an array on error
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách học kỳ:', err);
      setSemesters([]); // Ensure it's an array on error
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await api.get<DepartmentApiResponse>('/departments?limit=100');
      // Ensure departments is an array
      if (response.data && Array.isArray(response.data.departments)) {
        setDepartments(response.data.departments);
      } else if (Array.isArray(response.data)) { // Fallback if API returns array directly
        setDepartments(response.data);
      }
      else {
        console.error('API response for departments is not an array or malformed:', response.data);
        setDepartments([]); // Ensure it's an array on error
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách khoa:', err);
      setDepartments([]); // Ensure it's an array on error
    }
  }, []);

  const fetchCoursesByDepartment = useCallback(async (departmentId: string) => {
    if (!departmentId) {
      setCourses([]); // Clear courses if no department selected
      return;
    }
    try {
      const response = await api.get<CourseApiResponse>(`/courses?departmentId=${departmentId}&limit=100`);
      // Ensure courses is an array
      if (response.data && Array.isArray(response.data.courses)) {
        setCourses(response.data.courses);
      } else if (Array.isArray(response.data)) { // Fallback if API returns array directly
        setCourses(response.data);
      } else {
        console.error('API response for courses is not an array or malformed:', response.data);
        setCourses([]); // Ensure it's an array on error
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách học phần theo khoa:', err);
      setCourses([]); // Ensure it's an array on error
    }
  }, []);

  const fetchTeachersByDepartment = useCallback(async (departmentId: string) => {
    if (!departmentId) {
      setTeachers([]); // Clear teachers if no department selected
      return;
    }
    try {
      const response = await api.get<TeacherApiResponse>(`/teachers/department/${departmentId}?limit=100`);
      // Ensure teachers is an array
      if (response.data && Array.isArray(response.data.teachers)) {
        const teachersWithFullName = response.data.teachers.map(t => ({
          ...t,
          fullName: `${t.firstName} ${t.lastName}`.trim(),
        }));
        setTeachers(teachersWithFullName);
      } else if (Array.isArray(response.data)) { // Fallback if API returns array directly
        const teachersWithFullName = response.data.map((t: any) => ({ // Ensure type for mapping
          ...t,
          fullName: `${t.firstName} ${t.lastName}`.trim(),
        }));
        setTeachers(teachersWithFullName);
      } else {
        console.error('API response for teachers is not an array or malformed:', response.data);
        setTeachers([]); // Ensure it's an array on error
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách giảng viên theo khoa:', err);
      setTeachers([]); // Ensure it's an array on error
    }
  }, []);


  useEffect(() => {
    fetchClassSections();
    fetchSemesters();
    fetchDepartments();
  }, [fetchClassSections, fetchSemesters, fetchDepartments]);

  // Fetch courses and teachers when departmentId changes in formData (for single creation)
  useEffect(() => {
    if (formData.departmentId) {
      fetchCoursesByDepartment(formData.departmentId);
      fetchTeachersByDepartment(formData.departmentId);
    } else {
      setCourses([]);
      setTeachers([]);
    }
  }, [formData.departmentId, fetchCoursesByDepartment, fetchTeachersByDepartment]);

  // Fetch courses when departmentId changes in batchFormData (for batch creation)
  useEffect(() => {
    if (batchFormData.departmentId) {
      fetchCoursesByDepartment(batchFormData.departmentId);
    } else {
      setCourses([]);
    }
  }, [batchFormData.departmentId, fetchCoursesByDepartment]);

  // Fetch unassigned class sections and teachers when semester/department changes
  useEffect(() => {
    if (openBulkAssign && bulkSemesterId && bulkDepartmentId) {
      setBulkLoading(true);
      setBulkClassSections([]);
      setBulkTeachers([]);
      setBulkSelectedIds([]);
      setBulkTeacherId('');
      setBulkError(null);
      setBulkSuccess(null);
      // Fetch class sections
      getClassSections({ semesterId: bulkSemesterId, departmentId: bulkDepartmentId }).then((res: any) => {
        const unassigned = (res.data.classSections || []).filter((cs: any) => !cs.assignedTeacherId && !cs.assignedTeacher);
        setBulkClassSections(unassigned);
      });
      // Fetch teachers
      getTeachersByDepartment(bulkDepartmentId).then((res: any) => setBulkTeachers(res.data));
      setBulkLoading(false);
    }
  }, [openBulkAssign, bulkSemesterId, bulkDepartmentId]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // const handleLimitChange = (event: SelectChangeEvent<number>) => {
  //   setLimit(Number(event.target.value));
  //   setPage(1); // Reset to first page when limit changes
  // };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchClassSections();
  };

  // New filter handlers
  const handleFilterDepartmentChange = (event: SelectChangeEvent<string>) => {
    setFilterDepartmentId(event.target.value);
    setPage(1); // Reset page when filter changes
  };

  const handleFilterSemesterChange = (event: SelectChangeEvent<string>) => {
    setFilterSemesterId(event.target.value);
    setPage(1); // Reset page when filter changes
  };


  const handleOpen = () => {
    setEditingClassSection(null);
    setFormData({
      code: '',
      name: '', // Tên lớp học phần sẽ được sinh tự động
      semesterId: '',
      courseId: '',
      maxStudents: '',
      assignedTeacherId: '',
      status: 'Sắp Diễn Ra',
      departmentId: '', // Reset departmentId
    });
    setCourses([]); // Clear courses
    setTeachers([]); // Clear teachers
    setOpen(true);
    setError(null); // Clear previous errors
  };

  const handleClose = () => {
    setOpen(false);
    setEditingClassSection(null);
    setError(null);
  };

  const handleOpenBatchDialog = () => {
    setBatchFormData({
      semesterId: '',
      departmentId: '',
      selectedCourses: {},
      maxStudentsPerClass: '',
    });
    setCourses([]);
    setBatchErrors([]);
    setBatchSuccessMessage(null);
    setOpenBatchDialog(true);
  };

  const handleCloseBatchDialog = () => {
    setOpenBatchDialog(false);
    setBatchErrors([]);
    setBatchSuccessMessage(null);
  };

  const handleOpenBulkAssign = () => {
    setOpenBulkAssign(true);
    setBulkSemesterId('');
    setBulkDepartmentId('');
    setBulkClassSections([]);
    setBulkSelectedIds([]);
    setBulkTeachers([]);
    setBulkTeacherId('');
    setBulkError(null);
    setBulkSuccess(null);
  };

  const handleCloseBulkAssign = () => {
    setOpenBulkAssign(false);
    setBulkSemesterId('');
    setBulkDepartmentId('');
    setBulkClassSections([]);
    setBulkSelectedIds([]);
    setBulkTeachers([]);
    setBulkTeacherId('');
    setBulkError(null);
    setBulkSuccess(null);
  };

  const handleChange = (e: SelectChangeEvent<string> | React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: value };

      // Logic tự động sinh tên lớp học phần
      // Tên Học Phần - Mã Lớp Học Phần - 001
      if (name === 'courseId' || name === 'code') {
        const currentCourseId = name === 'courseId' ? value : updatedFormData.courseId;
        const currentCode = name === 'code' ? value : updatedFormData.code;

        const selectedCourse = courses.find(course => course.id === currentCourseId);

        if (selectedCourse && currentCode) {
            // Tên lớp học phần sẽ được định dạng là "Tên Học Phần - Mã Lớp Học Phần - XXX"
            // Phần XXX sẽ được xử lý ở backend để đảm bảo tính duy nhất
            // Frontend chỉ cần hiển thị phần cố định
            updatedFormData.name = `${selectedCourse.name} - ${currentCode} - 001`; // Placeholder for frontend
        } else if (selectedCourse) {
            updatedFormData.name = `${selectedCourse.name}`;
        } else if (currentCode) {
            updatedFormData.name = currentCode;
        } else {
            updatedFormData.name = '';
        }
      }
      return updatedFormData;
    });
  };

  const handleBatchChange = (e: SelectChangeEvent<string> | React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBatchFormData((prev) => {
      const updatedFormData = { ...prev, [name]: value };
      if (name === 'departmentId') {
        updatedFormData.selectedCourses = {}; // Clear selected courses when department changes
      }
      return updatedFormData;
    });
  };

  const handleBatchCourseSelection = (courseId: string, numberOfClasses: number) => {
    setBatchFormData((prev) => ({
      ...prev,
      selectedCourses: {
        ...prev.selectedCourses,
        [courseId]: numberOfClasses > 0 ? numberOfClasses : 0, // Remove if 0 or less
      },
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { code, name, semesterId, courseId, maxStudents, assignedTeacherId, status, departmentId } = formData;

    // Validate required fields
    if (!code || !semesterId || !courseId || !status || !departmentId) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc (Mã Lớp Học Phần, Học kỳ, Khoa, Học phần, Trạng thái).');
      setLoading(false);
      return;
    }

    // Validate maxStudents
    const parsedMaxStudents = maxStudents === '' ? null : Number(maxStudents);
    if (maxStudents !== '' && (isNaN(parsedMaxStudents as number) || (parsedMaxStudents as number) <= 0)) {
      setError('Số lượng sinh viên tối đa phải là một số dương.');
      setLoading(false);
      return;
    }

    try {
      if (editingClassSection) {
        // Update Class Section
        await api.put(`/class-sections/${editingClassSection.id}`, {
          code,
          name, // Keep the name from formData, backend will handle suffix
          semesterId,
          courseId,
          maxStudents: parsedMaxStudents,
          assignedTeacherId: assignedTeacherId || null,
          status,
        });
        message.success('Cập nhật lớp học phần thành công!'); // Use alert for now
      } else {
        // Create Class Section
        await api.post('/class-sections', {
          code,
          name, // The generated name from frontend will be used as a base
          semesterId,
          courseId,
          maxStudents: parsedMaxStudents,
          assignedTeacherId: assignedTeacherId || null,
          status,
        });
        message.success('Tạo lớp học phần thành công!'); // Use alert for now
      }
      handleClose();
      fetchClassSections(); // Refresh list
    } catch (err: any) {
      console.error('Error saving class section:', err);
      const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi lưu lớp học phần.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBatchLoading(true);
    setBatchErrors([]);
    setBatchSuccessMessage(null);

    const { semesterId, departmentId, selectedCourses, maxStudentsPerClass } = batchFormData;

    if (!semesterId || !departmentId || Object.keys(selectedCourses).length === 0) {
      setBatchErrors(['Vui lòng chọn Học kỳ, Khoa và ít nhất một Học phần với số lượng lớp.']);
      setBatchLoading(false);
      return;
    }

    const parsedMaxStudents = maxStudentsPerClass === '' ? null : Number(maxStudentsPerClass);
    if (maxStudentsPerClass !== '' && (isNaN(parsedMaxStudents as number) || (parsedMaxStudents as number) <= 0)) {
      setBatchErrors(['Số lượng sinh viên tối đa phải là một số dương hoặc để trống.']);
      setBatchLoading(false);
      return;
    }

    try {
      const payload = {
        semesterId,
        departmentId,
        coursesToCreate: Object.entries(selectedCourses).map(([courseId, numberOfClasses]) => ({
          courseId,
          numberOfClasses,
          maxStudents: parsedMaxStudents, // Pass maxStudents per class for batch
        })),
        status: 'Sắp Diễn Ra', // Default status for batch created classes
      };

      const response = await api.post('/class-sections/batch', payload);

      setBatchSuccessMessage(response.data.message);
      if (response.data.errors && response.data.errors.length > 0) {
        setBatchErrors(response.data.errors);
      }
      fetchClassSections();
    } catch (err: any) {
      console.error('Error in batch creation:', err);
      const backendErrors = err.response?.data?.errors || [];
      const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi tạo hàng loạt lớp học phần.';
      setBatchErrors([errorMessage, ...backendErrors]);
    } finally {
      setBatchLoading(false);
    }
  };


  const handleEdit = (section: FullClassSection) => {
    setEditingClassSection(section);
    setFormData({
      code: section.code,
      name: section.name,
      semesterId: section.semesterId,
      courseId: section.courseId,
      maxStudents: section.maxStudents !== null && section.maxStudents !== undefined ? String(section.maxStudents) : '',
      assignedTeacherId: section.assignedTeacherId || '',
      status: section.status,
      departmentId: section.course.departmentId, // Set departmentId for editing
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lớp học phần này?')) {
      try {
        await api.delete(`/class-sections/${id}`);
        message.success('Xóa lớp học phần thành công!'); // Use alert for now
        fetchClassSections();
      } catch (err: any) {
        console.error('Error deleting class section:', err);
        const errorMessage = err.response?.data?.message || 'Không thể xóa lớp học phần này.';
        setError(errorMessage);
      }
    }
  };

  // Function to get course name without code
  const getCourseNameDisplay = (course: Course) => {
    // Assuming course.name already just contains the name and not the code.
    // If your backend `course.name` actually includes the code, you'd parse it here.
    return course.name;
  };

  const handleBulkSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setBulkSelectedIds(bulkClassSections.map(cs => cs.id));
    } else {
      setBulkSelectedIds([]);
    }
  };

  const handleBulkSelectOne = (id: string) => {
    setBulkSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkAssign = async () => {
    setBulkLoading(true);
    setBulkError(null);
    setBulkSuccess(null);
    try {
      await Promise.all(
        bulkSelectedIds.map(id => {
          const cs = bulkClassSections.find(cs => cs.id === id);
          if(!cs) return Promise.resolve();
          return updateClassSection(id, {
            code: cs.code,
            name: cs.name,
            semesterId: cs.semesterId,
            courseId: cs.courseId,
            maxStudents: cs.maxStudents,
            assignedTeacherId: bulkTeacherId,
            status: cs.status,
          });
        })
      );
      setBulkSuccess('Phân công giảng viên thành công!');
      setBulkSelectedIds([]);
      setBulkTeacherId('');
      fetchClassSections();
    } catch (err: any) {
      setBulkError('Có lỗi khi phân công giảng viên.');
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quản Lý Lớp Học Phần
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        {/* Search and Filter Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label="Tìm kiếm theo mã, tên lớp học phần"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 350 }}
          />
          <FormControl sx={{ width: 180 }} size="small">
            <InputLabel>Lọc theo Khoa</InputLabel>
            <Select
              value={filterDepartmentId}
              label="Lọc theo Khoa"
              onChange={handleFilterDepartmentChange}
            >
              <MenuItem value="">
                <em>Tất cả Khoa</em>
              </MenuItem>
              {departments.map((department) => (
                <MenuItem key={department.id} value={department.id}>
                  {department.fullName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ width: 180 }} size="small">
            <InputLabel>Lọc theo Kì Học</InputLabel>
            <Select
              value={filterSemesterId}
              label="Lọc theo Kì Học"
              onChange={handleFilterSemesterChange}
            >
              <MenuItem value="">
                <em>Tất cả Kì Học</em>
              </MenuItem>
              {semesters.map((semester) => (
                <MenuItem key={semester.id} value={semester.id}>
                  {semester.name} ({semester.academicYear})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleSearchSubmit} sx={{ mr : 2, bottom: 9 }}>
            Áp dụng bộ lọc
          </Button>
        </Box>

        {/* Add/Batch Create Buttons */}
        <Box>
          <Button
            variant="contained"
            onClick={handleOpenBatchDialog}
            sx={{ mr: 2 }}
            startIcon={<AddIcon />}
          >
            Tạo Hàng Loạt Lớp Học Phần
          </Button>
          <Button
            variant="contained"
            onClick={handleOpen}
            startIcon={<AddIcon />}
          >
            Thêm Lớp Học Phần
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 3, ml: 2 }}
            startIcon={<AddIcon />}
            onClick={handleOpenBulkAssign}
           
          >
            Phân Công Giảng Viên
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Năm Học</TableCell>
                  <TableCell>Học Kỳ</TableCell>
                  <TableCell>Mã Lớp Học Phần</TableCell>
                  <TableCell>Tên Lớp Học Phần</TableCell>
                  <TableCell>Học Phần</TableCell>
                  <TableCell>Khoa</TableCell>
                  <TableCell>Số Lượng SV</TableCell>
                  <TableCell align="center">Giảng Viên Phân Công</TableCell>
                  <TableCell>Trạng Thái</TableCell>
                  <TableCell align="right">Hành Động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classSections.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell>{section.semester.academicYear}</TableCell>
                    <TableCell>{section.semester.name}</TableCell>
                    <TableCell>{section.code}</TableCell>
                    <TableCell>{section.name}</TableCell>
                    <TableCell>{section.course.name}</TableCell>
                    <TableCell>{section.course.department.fullName}</TableCell>
                    <TableCell align="center">{section.maxStudents ?? 'N/A'}</TableCell>
                    <TableCell align="center">
                      {section.assignedTeacher
                        ? `${section.assignedTeacher.firstName} ${section.assignedTeacher.lastName} `
                        : 'Chưa phân công'}
                    </TableCell>
                    <TableCell>{section.status}</TableCell>
                    <TableCell align="right">
                      {user?.role === 'ADMIN' && (
                        <>
                          <IconButton onClick={() => handleEdit(section)} color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(section.id)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Thêm phân trang */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}

      {/* Single Class Section Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingClassSection ? 'Chỉnh Sửa Lớp Học Phần' : 'Thêm Lớp Học Phần Mới'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Học Kỳ</InputLabel>
              <Select
                name="semesterId"
                label="Học Kỳ"
                value={formData.semesterId}
                onChange={handleChange}
              >
                {semesters.map((semester) => (
                  <MenuItem key={semester.id} value={semester.id}>
                    {semester.name} ({semester.academicYear})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense" required>
              <InputLabel>Khoa</InputLabel>
              <Select
                name="departmentId"
                label="Khoa"
                value={formData.departmentId}
                onChange={handleChange}
              >
                {departments.map((department) => (
                  <MenuItem key={department.id} value={department.id}>
                    {department.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense" required disabled={!formData.departmentId}>
              <InputLabel>Học Phần</InputLabel>
              <Select
                name="courseId"
                label="Học Phần"
                value={formData.courseId}
                onChange={handleChange}
              >
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {getCourseNameDisplay(course)}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    Vui lòng chọn Khoa để tải Học Phần
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            <TextField
              margin="dense"
              name="code"
              label="Mã Lớp Học Phần (Ví dụ: KDPM)"
              type="text"
              fullWidth
              value={formData.code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
              required
            />
            <TextField
              margin="dense"
              name="name"
              label="Tên Lớp Học Phần"
              type="text"
              fullWidth
              value={formData.name}
              InputProps={{
                readOnly: true, // Make it read-only as it's auto-generated
              }}
              sx={{
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)', // Ensure text color is readable when readOnly
                },
              }}
            />
            <TextField
              margin="dense"
              name="maxStudents"
              label="Số Lượng Sinh Viên Tối Đa"
              type="number"
              fullWidth
              value={formData.maxStudents}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
              inputProps={{ min: 0 }}
              helperText="Để trống nếu không giới hạn"
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Giảng Viên Phân Công</InputLabel>
              <Select
                name="assignedTeacherId"
                label="Giảng Viên Phân Công"
                value={formData.assignedTeacherId}
                onChange={(e: SelectChangeEvent<string>) => handleChange(e)}
                disabled={!formData.departmentId} // Disable if no department selected
              >
                <MenuItem value="">
                  <em>Chưa phân công</em>
                </MenuItem>
                {teachers.length > 0 ? (
                  teachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName} ({teacher.email})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    Vui lòng chọn Khoa để tải Giảng Viên
                  </MenuItem>
                )}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Trạng Thái</InputLabel>
              <Select
                name="status"
                label="Trạng Thái"
                value={formData.status}
                onChange={handleChange}
              >
                {CLASS_SECTION_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {editingClassSection ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Batch Create Class Sections Dialog */}
      <Dialog open={openBatchDialog} onClose={handleCloseBatchDialog} maxWidth="md" fullWidth>
        <DialogTitle>Tạo Hàng Loạt Lớp Học Phần</DialogTitle>
        <form onSubmit={handleBatchSubmit}>
          <DialogContent>
            {batchErrors.length > 0 && (
              <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                {batchErrors.map((err, i) => <div key={i}>- {err}</div>)}
              </Alert>
            )}
            {batchSuccessMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {batchSuccessMessage}
              </Alert>
            )}

            <FormControl fullWidth margin="dense" required>
              <InputLabel>Học Kỳ</InputLabel>
              <Select
                name="semesterId"
                label="Học Kỳ"
                value={batchFormData.semesterId}
                onChange={handleBatchChange}
              >
                {semesters.map((semester) => (
                  <MenuItem key={semester.id} value={semester.id}>
                    {semester.name} ({semester.academicYear})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense" required>
              <InputLabel>Khoa</InputLabel>
              <Select
                name="departmentId"
                label="Khoa"
                value={batchFormData.departmentId}
                onChange={handleBatchChange}
              >
                {departments.map((department) => (
                  <MenuItem key={department.id} value={department.id}>
                    {department.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              margin="dense"
              name="maxStudentsPerClass"
              label="Số Lượng Sinh Viên Tối Đa Mỗi Lớp (cho tất cả các lớp tạo hàng loạt)"
              type="number"
              fullWidth
              value={batchFormData.maxStudentsPerClass}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBatchChange(e)}
              inputProps={{ min: 1 }}
              helperText="Để trống nếu không giới hạn cho mỗi lớp"
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>Chọn Học Phần và Số Lượng Lớp</Typography>
            {batchFormData.departmentId ? (
              <Grid container spacing={2}>
                {courses.length === 0 ? (
                  <Grid item xs={12}>
                    <Alert severity="info">Không có Học phần nào cho Khoa đã chọn.</Alert>
                  </Grid>
                ) : (
                    courses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} key={course.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #ccc', p: 1, borderRadius: '4px' }}>
                                <Typography sx={{ flexGrow: 1 }}>{getCourseNameDisplay(course)}</Typography>
                                <TextField
                                    size="small"
                                    type="number"
                                    label="Số lượng lớp"
                                    value={batchFormData.selectedCourses[course.id] || ''}
                                    onChange={(e) =>
                                        handleBatchCourseSelection(course.id, Number(e.target.value))
                                    }
                                    inputProps={{ min: 0 }}
                                    sx={{ width: 120 }}
                                />
                            </Box>
                        </Grid>
                    ))
                )}
              </Grid>
            ) : (
                <Alert severity="info">Vui lòng chọn một Khoa để xem danh sách Học phần.</Alert>
            )}

            {batchErrors.length > 0 && (
              <Alert severity="error" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
                {batchErrors.map((err, i) => <div key={i}>- {err}</div>)}
              </Alert>
            )}
            {batchSuccessMessage && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {batchSuccessMessage}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBatchDialog}>Đóng</Button>
            <Button type="submit" variant="contained" disabled={batchLoading}>
              Tạo Lớp Học Phần
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Bulk Assign Dialog */}
      <Dialog open={openBulkAssign} onClose={handleCloseBulkAssign} maxWidth="md" fullWidth>
        <DialogTitle>Phân Công Giảng Viên Hàng Loạt</DialogTitle>
        <DialogContent>
          {bulkError && <Alert severity="error">{bulkError}</Alert>}
          {bulkSuccess && <Alert severity="success">{bulkSuccess}</Alert>}
          <FormControl fullWidth margin="normal">
            <InputLabel>Chọn Năm Học (Kì Học)</InputLabel>
            <Select
              value={bulkSemesterId}
              label="Chọn Năm Học (Kì Học)"
              onChange={e => setBulkSemesterId(e.target.value)}
            >
              {semesters.map(s => (
                <MenuItem key={s.id} value={s.id}>{s.academicYear} - {s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Chọn Khoa</InputLabel>
            <Select
              value={bulkDepartmentId}
              label="Chọn Khoa"
              onChange={e => setBulkDepartmentId(e.target.value)}
            >
              {departments.map(d => (
                <MenuItem key={d.id} value={d.id}>{d.fullName}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {bulkSemesterId && bulkDepartmentId && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Chọn Lớp Học Phần Chưa Phân Công</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <input
                          type="checkbox"
                          checked={bulkSelectedIds.length === bulkClassSections.length && bulkClassSections.length > 0}
                          onChange={handleBulkSelectAll}
                        />
                      </TableCell>
                      <TableCell>Mã Lớp Học Phần</TableCell>
                      <TableCell>Tên Lớp Học Phần</TableCell>
                      <TableCell>Học Phần</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bulkClassSections.map(cs => (
                      <TableRow key={cs.id} selected={bulkSelectedIds.includes(cs.id)}>
                        <TableCell padding="checkbox">
                          <input
                            type="checkbox"
                            checked={bulkSelectedIds.includes(cs.id)}
                            onChange={() => handleBulkSelectOne(cs.id)}
                          />
                        </TableCell>
                        <TableCell>{cs.code}</TableCell>
                        <TableCell>{cs.name}</TableCell>
                        <TableCell>{cs.course.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <FormControl fullWidth margin="normal" sx={{ mt: 2 }}>
                <InputLabel>Chọn Giảng Viên</InputLabel>
                <Select
                  value={bulkTeacherId}
                  label="Chọn Giảng Viên"
                  onChange={e => setBulkTeacherId(e.target.value)}
                >
                  {bulkTeachers.map(t => (
                    <MenuItem key={t.id} value={t.id}>{t.lastName} {t.firstName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Số lớp học phần được chọn: <b>{bulkSelectedIds.length}</b>
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBulkAssign}>Hủy</Button>
          <Button
            onClick={handleBulkAssign}
            variant="contained"
            disabled={!bulkTeacherId || bulkSelectedIds.length === 0 || bulkLoading}
          >
            {bulkLoading ? 'Đang phân công...' : 'Phân Công'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassSectionsPage;
