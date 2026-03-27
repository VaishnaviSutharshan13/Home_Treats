import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Seed default admin & student users on startup
export const seedUsers = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@hostel.com' });
    if (!adminExists) {
      await User.create({
        name: 'Administrator',
        email: 'admin@hostel.com',
        password: 'admin123',
        role: 'admin',
        phone: '+94 77 123 4567',
      });
      console.log('Default admin seeded: admin@hostel.com / admin123');
    }

    const studentExists = await User.findOne({ email: 'student@hostel.com' });
    if (!studentExists) {
      await User.create({
        name: 'Kavindu Perera',
        email: 'student@hostel.com',
        password: 'student123',
        role: 'student',
        phone: '+94 76 987 6543',
        studentId: 'STU001',
        room: 'A-101',
        course: 'Computer Science',
        university: 'University of Jaffna',
        gender: 'Male',
        address: 'Jaffna, Sri Lanka',
        emergencyContact: '+94 77 111 2233',
        approvalStatus: 'Approved',
        approvedAt: new Date(),
      });
      console.log('Default student seeded: student@hostel.com / student123');
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: String(email || '').toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }

    if (user.role === 'student') {
      if (user.approvalStatus === 'Pending') {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending admin approval. Please wait for approval before logging in.',
        });
      }
      if (user.approvalStatus === 'Rejected') {
        return res.status(403).json({
          success: false,
          message: 'Your registration was rejected by admin. Please contact hostel administration.',
        });
      }
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userData: Record<string, any> = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };
    if (user.role === 'student') {
      userData.studentId = user.studentId;
      userData.room = user.room;
      userData.course = user.course;
      userData.university = user.university;
      userData.gender = user.gender;
      userData.address = user.address;
      userData.emergencyContact = user.emergencyContact;
      userData.approvalStatus = user.approvalStatus;
    }

    res.json({ success: true, message: 'Login successful', data: { token, user: userData } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

// REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      studentId,
      course,
      university,
      gender,
      address,
      emergencyContact,
    } = req.body;

    const trimmedEmail = String(email || '').toLowerCase().trim();
    const trimmedStudentId = String(studentId || '').toUpperCase().trim();

    const existingUser = await User.findOne({
      $or: [{ email: trimmedEmail }, { studentId: trimmedStudentId }],
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === trimmedEmail
          ? 'User already exists with this email'
          : 'Student ID already exists',
      });
    }

    await User.create({
      name,
      email: trimmedEmail,
      password,
      role: 'student',
      phone,
      studentId: trimmedStudentId,
      course,
      university,
      gender,
      address,
      emergencyContact,
      room: '',
      approvalStatus: 'Pending',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully. Your account is pending admin approval.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

// VERIFY TOKEN
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        studentId: user.studentId,
        room: user.room,
        course: user.course,
        university: user.university,
        gender: user.gender,
        address: user.address,
        emergencyContact: user.emergencyContact,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (error: any) {
    res.status(401).json({ success: false, message: 'Invalid token', error: error.message });
  }
};

// REFRESH TOKEN
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, message: 'Token refreshed', data: { token: newToken } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Token refresh failed', error: error.message });
  }
};

// LOGOUT
export const logout = async (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logout successful' });
};

// GET current user profile
export const getProfile = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
};

// UPDATE current user profile
export const updateProfile = async (req: any, res: Response) => {
  try {
    const { name, phone, password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (password) user.password = password;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        studentId: user.studentId,
        room: user.room,
        course: user.course,
        university: user.university,
        gender: user.gender,
        address: user.address,
        emergencyContact: user.emergencyContact,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
  }
};

// FORGOT PASSWORD - generate reset token
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email' });
    }

    // Generate random reset token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetToken = hashedToken;
    user.resetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    // In production, send email with rawToken. For now, return it directly.
    res.json({
      success: true,
      message: 'Password reset token generated. Use it within 30 minutes.',
      data: { resetToken: rawToken },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error processing request', error: error.message });
  }
};

// RESET PASSWORD - reset with token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetToken: hashedToken,
      resetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error resetting password', error: error.message });
  }
};
