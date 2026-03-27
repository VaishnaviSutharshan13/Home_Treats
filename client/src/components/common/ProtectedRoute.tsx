import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: 'admin' | 'student';
}

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
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
    return <Navigate to="/login" state={{ from: location, message: 'You must be logged in to view this page.' }} replace />;
  }

  // 3. Role-based access check
  if (requiredRole) {
    const userRole = user?.role?.toLowerCase();
    const approvalStatus = (user?.approvalStatus || user?.status || '').toLowerCase();

    // Admin route → only admins
    if (requiredRole === 'admin' && userRole !== 'admin') {
      // Student trying to access admin pages → send to their dashboard
      return <Navigate to="/student/dashboard" replace />;
    }

    // Student route -> approved students only
    if (requiredRole === 'student' && userRole !== 'student') {
      return <Navigate to="/login" replace />;
    }

    if (requiredRole === 'student' && userRole === 'student' && approvalStatus !== 'approved') {
      return <Navigate to="/login" state={{ message: 'Your account is not approved yet. Please wait for admin approval.' }} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
