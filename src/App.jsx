import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import UserManagement from '@/pages/UserManagement';
import IncomingMail from '@/pages/IncomingMail';
import OutgoingMail from '@/pages/OutgoingMail';
import MailAssignment from '@/pages/MailAssignment';
import MailProcessing from '@/pages/MailProcessing';
import MailArchive from '@/pages/MailArchive';
import Layout from '@/components/Layout';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-slate-900 text-white">Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-slate-900 text-white">Chargement...</div>;
  }
  
  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><Layout><UserManagement /></Layout></ProtectedRoute>} />
      <Route path="/incoming-mail" element={<ProtectedRoute allowedRoles={['SECRETARIAT', 'ADMIN']}><Layout><IncomingMail /></Layout></ProtectedRoute>} />
      <Route path="/outgoing-mail" element={<ProtectedRoute allowedRoles={['SECRETARIAT', 'ADMIN']}><Layout><OutgoingMail /></Layout></ProtectedRoute>} />
      <Route path="/mail-assignment" element={<ProtectedRoute allowedRoles={['SECRETARIAT', 'DN', 'DNA', 'ADMIN']}><Layout><MailAssignment /></Layout></ProtectedRoute>} />
      <Route path="/mail-processing" element={<ProtectedRoute><Layout><MailProcessing /></Layout></ProtectedRoute>} />
      <Route path="/mail-archive" element={<ProtectedRoute><Layout><MailArchive /></Layout></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Helmet>
          <title>GesCourrier - Gestion de Courriers</title>
          <meta name="description" content="Application de gestion de courriers arrivée et départ avec workflow complet" />
        </Helmet>
        <div className="min-h-screen">
          <AppRoutes />
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;