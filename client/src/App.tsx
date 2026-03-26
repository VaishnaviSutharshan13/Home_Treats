import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Layout components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Context
import { AuthProvider } from './context/AuthContext';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Rooms from './pages/Rooms';
import RoomDetails from './pages/RoomDetails';
import RoomDetailsPage from './pages/RoomDetailsPage';
import RoomSelectionPage from './pages/RoomSelectionPage';
import ContactUs from './pages/ContactUs';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import StudentManagement from './pages/admin/StudentManagement';
import RoomManagement from './pages/admin/RoomManagement';
import ComplaintManagement from './pages/admin/ComplaintManagement';
import FeesManagement from './pages/admin/FeesManagement';
import AdminProfile from './pages/admin/AdminProfile';
import ActivityLog from './pages/admin/ActivityLog';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyRoom from './pages/student/MyRoom';
import MyFees from './pages/student/MyFees';
import MyComplaints from './pages/student/MyComplaints';
import Profile from './pages/student/Profile';
import RoomBooking from './pages/student/RoomBooking';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppShell />
      </Router>
    </AuthProvider>
  );
}

/** Inner shell — uses useLocation so it must be inside Router */
function AppShell() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/student');

  return (
    <div className="min-h-screen flex flex-col">
      {!isDashboard && <Navbar />}
      <main className={`flex-grow ${!isDashboard ? 'pt-16' : ''}`}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/rooms/:id" element={<RoomDetails />} />
              <Route path="/room/:roomId" element={<RoomDetailsPage />} />
              <Route path="/select-room/:roomType" element={<RoomSelectionPage />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Admin Routes - Only for admins */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/student-management" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <StudentManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/room-management" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <RoomManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/complaint-management" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ComplaintManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/fees-management" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <FeesManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/profile" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/activity-log" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ActivityLog />
                  </ProtectedRoute>
                } 
              />
              
              {/* Student Routes */}
              <Route 
                path="/student/dashboard" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/my-room" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <MyRoom />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/my-fees" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <MyFees />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/my-complaints" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <MyComplaints />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/profile" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/book-room" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <RoomBooking />
                  </ProtectedRoute>
                } 
              />
              
              {/* Default dashboard redirect based on role */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardRedirect />
                  </ProtectedRoute>
                } 
              />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          {!isDashboard && <Footer />}
        </div>
  );
}

// Redirect to role-appropriate dashboard
function DashboardRedirect() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default App;
