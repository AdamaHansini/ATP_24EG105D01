import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, tpoOnly = false, adminOnly = false, studentOnly = false }) => {
  const userStr = localStorage.getItem('spt_user');

  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);

  if (tpoOnly && user.role !== 'tpo') {
    return <Navigate to="/dashboard" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (studentOnly && user.role !== 'student') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
