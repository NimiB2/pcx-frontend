import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import SupervisorDashboard from './pages/dashboard/SupervisorDashboard';
import OperatorDashboard from './pages/dashboard/OperatorDashboard';
import PlantEngineerDashboard from './pages/dashboard/PlantEngineerDashboard';
import Login from './pages/Login';
import Measurements from './pages/Measurements';
import MeasurementCapture from './pages/MeasurementCapture';
import MeasurementDetail from './pages/MeasurementDetail';
import Batches from './pages/Batches';
import BatchCreate from './pages/BatchCreate';
import BatchDetail from './pages/BatchDetail';
import {
  VRCQManager,
  CreditAllocation,
  Codebook,
  Documents,
  PunchList,
  Reconciliation,
  Reports,
  UserManagement,
  CreditsDashboard,
  NotificationsPage,
} from './pages/index';
import RegulatoryDashboard from './pages/dashboard/RegulatoryDashboard';
import Leaderboard from './pages/Leaderboard';
import MaterialFlowView from './pages/MaterialFlowView';
import './styles/App.scss';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuditProvider } from './contexts/AuditContext';
import { MESProvider } from './contexts/MESContext';
import { UserRole, isRoleAllowed } from './utils/permissions';

import theme from './theme';

/**
 * Smart Container for Dashboard
 * Routes each role to the appropriate dashboard view.
 * Source: Gap Analysis §B2, User Flows §2.1
 * 
 * Note: PlantEngineerDashboard and RegulatoryDashboard will be created in Phases 4 and 9.
 * Until then, they fall through to SupervisorDashboard.
 */
const DashboardContainer: React.FC = () => {
  const { user } = useAuth();

  if (!user?.role) {
    return <SupervisorDashboard />; // Fallback if role is undefined
  }

  if (user.role === 'field_worker') {
    return <OperatorDashboard />;
  } else if (user.role === 'plant_engineer' || user.role === 'super_admin') {
    return <PlantEngineerDashboard />;
  } else if (user.role === 'regulatory') {
    return <RegulatoryDashboard />;
  }

  // Fallback for any other roles not explicitly handled
  return <SupervisorDashboard />;
};

/**
 * Protected Route Component with Role-Based Access Control
 * 
 * If no allowedRoles are specified, any authenticated user can access.
 * If allowedRoles are specified, only users with those roles can access.
 * Unauthorized users are redirected to the dashboard.
 * 
 * Source: Frontend Architecture §6.3
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, check the user's role
  if (allowedRoles && !isRoleAllowed(user?.role, allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <DataProvider>
          <NotificationProvider>
            <AuditProvider>
              <MESProvider>
                <Router>
                  <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes */}
                    <Route path="/*" element={
                      <ProtectedRoute>
                        <Layout>
                          <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />

                            {/* Dashboard — all roles, each gets own dashboard */}
                            <Route path="/dashboard" element={<DashboardContainer />} />

                            {/* Measurements — all roles can view; Regulatory is read-only in the component */}
                            <Route path="/measurements" element={<Measurements />} />

                            {/* Measurement Capture — no Regulatory access */}
                            <Route path="/measurements/capture" element={
                              <ProtectedRoute allowedRoles={['field_worker', 'plant_engineer', 'super_admin']}>
                                <MeasurementCapture />
                              </ProtectedRoute>
                            } />
                            <Route path="/measurements/:id" element={<MeasurementDetail />} />

                            {/* Batches — Plant Engineer, Super-Admin, Regulatory (read-only in component) */}
                            <Route path="/batches" element={
                              <ProtectedRoute allowedRoles={['plant_engineer', 'super_admin', 'regulatory']}>
                                <Batches />
                              </ProtectedRoute>
                            } />
                            <Route path="/batches/create" element={
                              <ProtectedRoute allowedRoles={['plant_engineer', 'super_admin']}>
                                <BatchCreate />
                              </ProtectedRoute>
                            } />
                            <Route path="/batches/:id" element={
                              <ProtectedRoute allowedRoles={['plant_engineer', 'super_admin', 'regulatory']}>
                                <BatchDetail />
                              </ProtectedRoute>
                            } />

                            {/* VRCQ Manager — Plant Engineer, Super-Admin, Regulatory (read-only) */}
                            <Route path="/vrcq" element={
                              <ProtectedRoute allowedRoles={['plant_engineer', 'super_admin', 'regulatory']}>
                                <VRCQManager />
                              </ProtectedRoute>
                            } />

                            {/* Material Flow View — Plant Engineer, Super-Admin, Regulatory (read-only) */}
                            <Route path="/material-flow" element={
                              <ProtectedRoute allowedRoles={['plant_engineer', 'super_admin', 'regulatory']}>
                                <MaterialFlowView />
                              </ProtectedRoute>
                            } />

                            {/* Leaderboard — no Regulatory */}
                            <Route path="/leaderboard" element={
                              <ProtectedRoute allowedRoles={['field_worker', 'plant_engineer', 'super_admin']}>
                                <Leaderboard />
                              </ProtectedRoute>
                            } />

                            {/* Credits — Plant Engineer, Super-Admin, Regulatory (read-only) */}
                            <Route path="/credits/dashboard" element={
                              <ProtectedRoute allowedRoles={['plant_engineer', 'super_admin', 'regulatory']}>
                                <CreditsDashboard />
                              </ProtectedRoute>
                            } />
                            <Route path="/credits/allocation" element={
                              <ProtectedRoute allowedRoles={['super_admin']}>
                                <CreditAllocation />
                              </ProtectedRoute>
                            } />

                            {/* Codebook — Super-Admin only */}
                            <Route path="/codebook" element={
                              <ProtectedRoute allowedRoles={['super_admin']}>
                                <Codebook />
                              </ProtectedRoute>
                            } />

                            {/* Documents — Plant Engineer, Super-Admin, Regulatory (download-only in component) */}
                            <Route path="/documents" element={
                              <ProtectedRoute allowedRoles={['plant_engineer', 'super_admin', 'regulatory']}>
                                <Documents />
                              </ProtectedRoute>
                            } />

                            {/* Punch List — Plant Engineer (view), Super-Admin (configure) */}
                            <Route path="/punchlist" element={
                              <ProtectedRoute allowedRoles={['plant_engineer', 'super_admin']}>
                                <PunchList />
                              </ProtectedRoute>
                            } />

                            {/* Reconciliation — Plant Engineer, Super-Admin */}
                            <Route path="/reconciliation" element={
                              <ProtectedRoute allowedRoles={['plant_engineer', 'super_admin']}>
                                <Reconciliation />
                              </ProtectedRoute>
                            } />

                            {/* Reports — Plant Engineer, Super-Admin, Regulatory (read-only) */}
                            <Route path="/reports" element={
                              <ProtectedRoute allowedRoles={['plant_engineer', 'super_admin', 'regulatory']}>
                                <Reports />
                              </ProtectedRoute>
                            } />

                            {/* User Management — Super-Admin only */}
                            <Route path="/users" element={
                              <ProtectedRoute allowedRoles={['super_admin']}>
                                <UserManagement />
                              </ProtectedRoute>
                            } />

                            {/* Notifications — all authenticated roles */}
                            <Route path="/notifications" element={<NotificationsPage />} />
                          </Routes>
                        </Layout>
                      </ProtectedRoute>
                    } />
                  </Routes>
                </Router>
              </MESProvider>
            </AuditProvider>
          </NotificationProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
