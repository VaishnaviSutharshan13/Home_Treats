import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'student';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // 1. Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role-based access check
  if (requiredRole) {
    const userRole = user?.role?.toLowerCase();

    // Admin route → only admins
    if (requiredRole === 'admin' && userRole !== 'admin') {
      // Student trying to access admin pages → send to their dashboard
      return <Navigate to="/student/dashboard" replace />;
    }

    // Student route → students or admins (admin can view student pages too)
    if (requiredRole === 'student' && userRole !== 'student' && userRole !== 'admin') {
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
