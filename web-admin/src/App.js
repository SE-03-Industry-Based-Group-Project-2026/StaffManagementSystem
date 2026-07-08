import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { LanguageProvider } from './context/LanguageContext';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StaffManagement from './pages/StaffManagement';
import DepartmentManagement from './pages/DepartmentManagement';
import LeaveTypes from './pages/LeaveTypes';
import LeaveRequests from './pages/LeaveRequests';
import AttendanceManagement from './pages/AttendanceManagement';
import Complaints from './pages/Complaints';
import Announcements from './pages/Announcements';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import ProfileRequests from './pages/ProfileRequests';
import TaskAllocation from './pages/TaskAllocation';

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

function ProtectedRoute({ children, allowedRoles }) {
  const user = getUser();
  const isAuthenticated = !!user?.id;
  const role = user?.role || user?.role_name;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const allOfficerRoles = ['Admin', 'Secretary', 'Chairman', 'Praja Officer'];

  return (
    <LanguageProvider>
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={allOfficerRoles}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
                      path="/tasks"
            element={
              <ProtectedRoute allowedRoles={allOfficerRoles}>
                <TaskAllocation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <StaffManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/departments"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DepartmentManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leave-types"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <LeaveTypes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leave-requests"
            element={
              <ProtectedRoute allowedRoles={allOfficerRoles}>
                <LeaveRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRoles={allOfficerRoles}>
                <AttendanceManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaints"
            element={
              <ProtectedRoute allowedRoles={allOfficerRoles}>
                <Complaints />
              </ProtectedRoute>
            }
          />

          <Route
            path="/announcements"
            element={
              <ProtectedRoute allowedRoles={allOfficerRoles}>
                <Announcements />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={allOfficerRoles}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={allOfficerRoles}>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AuditLogs />
              </ProtectedRoute>
            }
          />

                    <Route
            path="/profile-requests"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ProfileRequests />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;