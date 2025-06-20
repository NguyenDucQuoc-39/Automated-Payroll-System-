import { configureStore } from '@reduxjs/toolkit';
import departmentReducer from './slices/departmentSlice';

export const store = configureStore({
  reducer: {
    departments: departmentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 