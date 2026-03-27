import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Rooms from './pages/Rooms';
import RoomSelectionPage from './pages/RoomSelectionPage';
import RoomDetailsPage from './pages/RoomDetailsPage';
import BookingForm from './pages/BookingForm';
import ContactUs from './pages/ContactUs';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProfile from './pages/admin/AdminProfile';
import StudentManagement from './pages/admin/StudentManagement';
import RoomManagement from './pages/admin/RoomManagement';
import FeesManagement from './pages/admin/FeesManagement';
import ComplaintManagement from './pages/admin/ComplaintManagement';
import StudentApprovalManagement from './pages/admin/StudentApprovalManagement';
import ActivityLog from './pages/admin/ActivityLog';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/Profile';
import MyRoom from './pages/student/MyRoom';
import MyFees from './pages/student/MyFees';
import MyComplaints from './pages/student/MyComplaints';
import RoomBooking from './pages/student/RoomBooking';
import RoomBookingFormPage from './pages/student/RoomBookingFormPage';

// Layouts & Context
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/room-selection" element={<RoomSelectionPage />} />
          <Route path="/room/:id" element={<RoomDetailsPage />} />
          <Route path="/contact" element={<ContactUs />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected Routes */}
          {/* Admin Routes */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/student-management" element={<StudentManagement />} />
            <Route path="/admin/room-management" element={<RoomManagement />} />
            <Route path="/admin/fees-management" element={<FeesManagement />} />
            <Route path="/admin/complaint-management" element={<ComplaintManagement />} />
            <Route path="/admin/approvals" element={<StudentApprovalManagement />} />
            <Route path="/admin/activity-log" element={<ActivityLog />} />
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute requiredRole="student" />}>
            <Route path="/booking" element={<BookingForm />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/my-room" element={<MyRoom />} />
            <Route path="/student/my-fees" element={<MyFees />} />
            <Route path="/student/my-complaints" element={<MyComplaints />} />
            <Route path="/student/book-room" element={<RoomBooking />} />
            <Route path="/student/booking-form" element={<RoomBookingFormPage />} />
          </Route>

          {/* Catch-all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;
