import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { AdminRoute } from './components/AdminRoute';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Overview } from './components/dashboard/Overview';
import { EnergyMonitoring } from './components/dashboard/EnergyMonitoring';
import { Analytics } from './components/dashboard/Analytics';
import { Settings } from './components/dashboard/Settings';
import { UserManagement } from './components/dashboard/UserManagement';
import { PanelManagement } from './components/dashboard/PanelManagement';
import { Toaster } from './components/ui/sonner';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Overview />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/energy"
            element={
              <PrivateRoute>
                <EnergyMonitoring />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/analytics"
            element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/users"
            element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/dashboard/panels"
            element={
              <AdminRoute>
                <PanelManagement />
              </AdminRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster 
          position="top-right" 
          richColors 
          duration={2000}
          closeButton
          limit={1}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;