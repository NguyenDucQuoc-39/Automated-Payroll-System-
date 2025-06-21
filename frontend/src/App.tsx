import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { getCurrentUser } from './store/slices/authSlice';
import Login from './pages/Login';
import MainLayout from './layouts/Sidebar';
import Dashboard from './pages/Dashboard';
import DegreesPage from './pages/DegreesPage';
import SemestersPage from './pages/SemestersPage';
import CoursesPage from './pages/CoursesPage';
import DepartmentPage from './pages/DepartmentPage';
import TeachersPage from './pages/TeachersPage';
import Statistics from './pages/TeachersStatisticsPage';
import ClassSectionPage from './pages/ClassSectionPage';
import ClassSectionStatistics from './pages/ClassSectionStatisticsPage';
import TietHeSoPage from './pages/SetingCoursePage';
import BangCapHeSoPage from './pages/SettingDegreePage';
import LopHeSoPage from './pages/SetingClassSectionPage';
import TinhTienDayPage from './pages/TinhTienDayPage';


const App: React.FC = () => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Nếu có token, kiểm tra authentication
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token]);

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route
        path="/"
        element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="degrees" element={<DegreesPage />} />
        <Route path="departments" element={<DepartmentPage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="semesters" element={<SemestersPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="class-sections" element={<ClassSectionPage />} />
        <Route path="class-section-statistics" element={<ClassSectionStatistics />} />
        <Route path="tiet-he-so" element={<TietHeSoPage />} />
        <Route path="bang-cap-he-so" element={<BangCapHeSoPage />} />
        <Route path="lop-he-so" element={<LopHeSoPage />} />
        <Route path="tinh-tien-day" element={<TinhTienDayPage />} />
      </Route>
    </Routes>
  );
};

export default App;
