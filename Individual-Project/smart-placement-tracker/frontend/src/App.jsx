import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import StudentsPage from './pages/StudentsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import AddCompanyPage from './pages/AddCompanyPage';
import AdminApprovalsPage from './pages/AdminApprovalsPage';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/companies" element={<ProtectedRoute><CompaniesPage /></ProtectedRoute>} />
        <Route path="/companies/add" element={<ProtectedRoute tpoOnly><AddCompanyPage /></ProtectedRoute>} />
        <Route path="/companies/:id" element={<ProtectedRoute><CompanyDetailPage /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute tpoOnly><StudentsPage /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute studentOnly><ApplicationsPage /></ProtectedRoute>} />
        <Route path="/admin/approvals" element={<ProtectedRoute adminOnly><AdminApprovalsPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
