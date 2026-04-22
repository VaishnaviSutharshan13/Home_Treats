import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

// Pages
import About from "./pages/About";
import BookingForm from "./pages/BookingForm";
import ContactUs from "./pages/ContactUs";
import Floors from "./pages/Floors";
import FloorDetails from "./pages/FloorDetails";
import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import RoomDetailsPage from "./pages/RoomDetailsPage";
import RoomSelectionPage from "./pages/RoomSelectionPage";

// Auth Pages
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Admin Pages
import ActivityLog from "./pages/admin/ActivityLog";
import AdminProfile from "./pages/admin/AdminProfile";
import ComplaintManagement from "./pages/admin/ComplaintManagement";
import AdminDashboard from "./pages/admin/Dashboard";
import FeesManagement from "./pages/admin/FeesManagement";
import RoomManagement from "./pages/admin/RoomManagement";
import RoomRequests from "./pages/admin/RoomRequests";
import StudentManagement from "./pages/admin/StudentManagement";

// Student Pages
import Profile from "./pages/Profile";
import MyComplaints from "./pages/student/MyComplaints";
import MyFees from "./pages/student/MyFees";
import MyRoom from "./pages/student/MyRoom";
import RoomBooking from "./pages/student/RoomBooking";
import RoomBookingFormPage from "./pages/student/RoomBookingFormPage";
import StudentDashboard from "./pages/student/StudentDashboard";

// Layouts & Context
import Footer from "./components/common/Footer";
import Navbar from "./components/common/Navbar";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactUs />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Public Browse Routes */}
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/floor/:floorId" element={<RoomDetailsPage />} />
          <Route path="/floor/:floorId/rooms" element={<RoomSelectionPage />} />

          {/* Protected Routes */}
          {/* Shared Authenticated Routes (Admin + Student) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/floors" element={<Floors />} />
            <Route path="/legacy-floor/:floorId" element={<FloorDetails />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="student-profile/:id" element={<Profile />} />
              <Route path="student-management" element={<StudentManagement />} />
              <Route path="room-management" element={<RoomManagement />} />
              <Route path="room-requests" element={<RoomRequests />} />
              <Route path="fees-management" element={<FeesManagement />} />
              <Route
                path="complaint-management"
                element={<ComplaintManagement />}
              />
              <Route
                path="approvals"
                element={<Navigate to="/admin/student-management" replace />}
              />
              <Route path="activity-log" element={<ActivityLog />} />
            </Route>
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute requiredRole="student" />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<Profile />} />
            <Route path="/student/my-room" element={<MyRoom />} />
            <Route path="/student/my-fees" element={<MyFees />} />
            <Route path="/student/my-complaints" element={<MyComplaints />} />
            <Route path="/student/book-room" element={<RoomBooking />} />
            <Route
              path="/student/booking-form"
              element={<RoomBookingFormPage />}
            />
          </Route>

          {/* Booking Route: login required only */}
          <Route element={<ProtectedRoute />}>
            <Route path="/booking" element={<BookingForm />} />
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
