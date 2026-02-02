import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Measurements from './pages/Measurements';
import MeasurementCapture from './pages/MeasurementCapture';
import Batches from './pages/Batches';
import {
  BatchDetail,
  VRCQManager,
  CreditAllocation,
  Codebook,
  Documents,
  PunchList,
  Reconciliation,
  Reports,
} from './pages/index';
import './styles/App.scss';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#388e3c',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#f57c00',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/measurements" element={<Measurements />} />
            <Route path="/measurements/capture" element={<MeasurementCapture />} />
            <Route path="/batches" element={<Batches />} />
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
      </Router>
    </ThemeProvider>
  );
}

export default App;
