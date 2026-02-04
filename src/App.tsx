import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import SupervisorDashboard from './pages/dashboard/SupervisorDashboard';
import OperatorDashboard from './pages/dashboard/OperatorDashboard';
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
} from './pages/index';
import './styles/App.scss';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

import theme from './theme';



// Smart Container for Dashboard
const DashboardContainer: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'operator') {
    return <OperatorDashboard />;
  }
  return <SupervisorDashboard />;
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <DataProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<DashboardContainer />} />
                      <Route path="/measurements" element={<Measurements />} />
                      <Route path="/measurements/capture" element={<MeasurementCapture />} />
                      <Route path="/measurements/:id" element={<MeasurementDetail />} />
                      <Route path="/batches" element={<Batches />} />
                      <Route path="/batches/create" element={<BatchCreate />} />
                      <Route path="/batches/:id" element={<BatchDetail />} />
                      <Route path="/vrcq" element={<VRCQManager />} />
                      <Route path="/credits" element={<CreditAllocation />} />
                      <Route path="/codebook" element={<Codebook />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route path="/punchlist" element={<PunchList />} />
                      <Route path="/reconciliation" element={<Reconciliation />} />
                      <Route path="/reports" element={<Reports />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

