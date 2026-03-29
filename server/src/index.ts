import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

// Config
import connectDB from './config/database';
import { seedUsers } from './controllers/authController';
import { seedRooms } from './controllers/roomController';

// Middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import roomRoutes from './routes/roomRoutes';
import complaintRoutes from './routes/complaintRoutes';
import feesRoutes from './routes/feesRoutes';
import adminRoutes from './routes/adminRoutes';
import notificationRoutes from './routes/notificationRoutes';
import adminLogRoutes from './routes/adminLogRoutes';
import bookingRoutes from './routes/bookingRoutes';
import paymentRoutes from './routes/paymentRoutes';

// Load environment variables
dotenv.config();

// Connect to MongoDB and seed default users
connectDB().then(() => {
  seedUsers();
  seedRooms();
});

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ---------- API Routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin-logs', adminLogRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    message: 'Hostel Management API is running',
    timestamp: new Date().toISOString(),
  });
});

// ---------- Error Handling ----------
app.use(errorHandler);
app.use(notFoundHandler);

// ---------- Start Server ----------
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
