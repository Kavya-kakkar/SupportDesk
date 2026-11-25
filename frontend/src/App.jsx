import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';

// Pages
import AuthPage from './pages/AuthPage';
import UserTicketsPage from './pages/UserTicketsPage';
import SubmitTicketPage from './pages/SubmitTicketPage';
import TicketDetailPage from './pages/TicketDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminTicketsPage from './pages/AdminTicketsPage';
import AdminActivityLogsPage from './pages/AdminActivityLogsPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-surface font-body-md text-on-surface-variant">
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/tickets" replace />;
  }

  return children;
};

// Root index redirector based on authenticated role
const HomeRedirect = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-surface font-body-md text-on-surface-variant">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return isAdmin ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/tickets" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication routes */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          {/* User Protected Routes */}
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <UserTicketsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SubmitTicketPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TicketDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout>
                  <AdminDashboardPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout>
                  <AdminTicketsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/queue"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout>
                  <TicketDetailPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/activity"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout>
                  <AdminActivityLogsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Root and Fallback catch-all */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
