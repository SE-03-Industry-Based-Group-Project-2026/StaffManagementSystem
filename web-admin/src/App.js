import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { LanguageProvider } from './context/LanguageContext';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StaffManagement from './pages/StaffManagement';
import DepartmentManagement from './pages/DepartmentManagement';
import LeaveTypes from './pages/LeaveTypes';
import LeaveRequests from './pages/LeaveRequests';
import Complaints from './pages/Complaints';
import Announcements from './pages/Announcements';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import ProfileRequests from './pages/ProfileRequests';
import TaskAllocation from './pages/TaskAllocation';
import MyProfile from './pages/MyProfile';
import SystemPrivileges from './pages/SystemPrivileges'; 

function getUser() {
  try {
    return JSON.parse(
      localStorage.getItem('user') || '{}'
    );
  } catch {
    return {};
  }
}

function getUserRole(user) {
  return (
    user?.roles?.role_name ||
    user?.role ||
    user?.role_name ||
    ''
  );
}

function ProtectedRoute({
  children,
  allowedRoles
}) {
  const user = getUser();
  const isAuthenticated = Boolean(user?.id);
  const role = getUserRole(user);

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    Array.isArray(allowedRoles) &&
    !allowedRoles.includes(role)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}

function App() {
  const dashboardRoles = [
    'Admin',
    'Secretary',
    'Chairman',
    'CC Officer',
    'Subject Officer',
  ];

  const managementRoles = [
    'Admin',
    'Secretary',
    'Chairman',
    'CC Officer',
    'Subject Officer'
  ];

  const staffManagementRoles = [
    'Admin',
    'Subject Officer',
    'Secretary',
    'Chairman',
    'CC Officer'
  ];

  const profileRoles = [
    'Admin',
    'Secretary',
    'Chairman',
    'CC Officer',
    'Subject Officer'
  ];

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
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                allowedRoles={dashboardRoles}
              >
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff"
            element={
              <ProtectedRoute
                allowedRoles={staffManagementRoles}
              >
                <StaffManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/departments"
            element={
              <ProtectedRoute
                allowedRoles={['Admin','Secretary','Chairman','CC Officer','Subject Officer']}
              >
                <DepartmentManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leave-types"
            element={
              <ProtectedRoute
                allowedRoles={[
                  'Subject Officer',
                  'Secretary',
                  'Chairman',
                  'CC Officer'
                ]}
              >
                <LeaveTypes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leave-requests"
            element={
              <ProtectedRoute
                allowedRoles={[
                  'Subject Officer',
                  'CC Officer',
                  'Secretary',
                  'Chairman'
                ]}
              >
                <LeaveRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaints"
            element={
              <ProtectedRoute
                allowedRoles={managementRoles}
              >
                <Complaints />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks"
            element={
              <ProtectedRoute
                allowedRoles={managementRoles}
              >
                <TaskAllocation />
              </ProtectedRoute>
            }
          />

          <Route
            path="/announcements"
            element={
              <ProtectedRoute
                allowedRoles={managementRoles}
              >
                <Announcements />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute
                allowedRoles={dashboardRoles}
              >
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute
                allowedRoles={managementRoles}
              >
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute
                allowedRoles={['Admin']}
              >
                <AuditLogs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile-requests"
            element={
              <ProtectedRoute
                allowedRoles={['Admin']}
              >
                <ProfileRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-profile"
            element={
              <ProtectedRoute
                allowedRoles={profileRoles}
              >
                <MyProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/system-privileges"
            element={
              <ProtectedRoute
                allowedRoles={['Admin']}
              >
                <SystemPrivileges />
              </ProtectedRoute>
            }
          />


          <Route
            path="/"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;