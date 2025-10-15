import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { getCurrentUser } from './store/slices/authSlice';
import Login from './pages/Login';
import MainLayout from './layouts/Sidebar';
import Dashboard from './pages/Dashboard';
import DegreesPage from './pages/InforPages/DegreesPage';
import SemestersPage from './pages/ClassPages/SemestersPage';
import CoursesPage from './pages/ClassPages/CoursesPage';
import DepartmentPage from './pages/InforPages/DepartmentPage';
import TeachersPage from './pages/InforPages/TeachersPage';
import Statistics from './pages/InforPages/TeachersStatisticsPage';
import ClassSectionPage from './pages/ClassPages/ClassSectionPage';
import ClassSectionStatistics from './pages/ClassPages/ClassSectionStatisticsPage';
import TietHeSoPage from './pages/SettingPages/SettingCoursePage';
import BangCapHeSoPage from './pages/SettingPages/SettingDegreePage';
import LopHeSoPage from './pages/SettingPages/SettingClassSectionPage';
import TinhTienDayPage from './pages/SettingPages/TinhTienDayPage';
import TeacherYearReportPage from './pages/ReportPages/TeacherYearReportPage';
import TeacherDepartmentReportPage from './pages/ReportPages/TeacherDepartmentReportPage';
import TeacherSchoolReportPage from './pages/ReportPages/TeacherSchoolReportPage';
import ProfilePage from './pages/TeacherPages/ProfilePage';
import MyDepartmentPage from './pages/TeacherPages/MyDepartmentPage';
import MyClassesPage from './pages/TeacherPages/MyClassesPage';
import MySalaryPage from './pages/TeacherPages/MySalaryPage';


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
        <Route path="report/teacher-year" element={<TeacherYearReportPage />} />
        <Route path="report/teacher-department" element={<TeacherDepartmentReportPage />} />
        <Route path="report/teacher-school" element={<TeacherSchoolReportPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="my-department" element={<MyDepartmentPage />} />
        <Route path="my-classes" element={<MyClassesPage />} />
        <Route path="my-salary" element={<MySalaryPage />} />
      </Route>
    </Routes>
  );
};

export default App;
