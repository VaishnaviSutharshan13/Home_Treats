import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'student';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // 1. Still reading localStorage — don't redirect yet
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  // 2. Not logged in → redirect to login
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
