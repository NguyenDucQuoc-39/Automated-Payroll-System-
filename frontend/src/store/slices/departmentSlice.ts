import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Department } from '../../types/department';

interface DepartmentState {
  departments: Department[];
  loading: boolean;
  error: string | null;
}

interface FetchDepartmentsParams {
  page: number;
  limit: number;
  search?: string;
}

const initialState: DepartmentState = {
  departments: [],
  loading: false,
  error: null,
};

export const fetchDepartments = createAsyncThunk(
  'departments/fetchDepartments',
  async ({ page, limit, search }: FetchDepartmentsParams) => {
    const response = await axios.get(`/api/departments`, {
      params: { page, limit, search }
    });
    return response.data;
  }
);

export const createDepartment = createAsyncThunk(
  'departments/createDepartment',
  async (department: Omit<Department, 'id'>) => {
    const response = await axios.post('/api/departments', department);
    return response.data;
  }
);

export const updateDepartment = createAsyncThunk(
  'departments/updateDepartment',
  async ({ id, ...department }: Department) => {
    const response = await axios.put(`/api/departments/${id}`, department);
    return response.data;
  }
);

export const deleteDepartment = createAsyncThunk(
  'departments/deleteDepartment',
  async (id: string) => {
    await axios.delete(`/api/departments/${id}`);
    return id;
  }
);

const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload.departments;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch departments';
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload);
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter((d) => d.id !== action.payload);
      });
  },
});

export default departmentSlice.reducer;