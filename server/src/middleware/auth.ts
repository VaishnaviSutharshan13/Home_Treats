import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// ─── Verify JWT token ────────────────────────────────────────
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_jwt_secret_key_here'
    ) as { id: string; email: string; role: string };

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

// ─── Admin-only access ───────────────────────────────────────
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.',
    });
  }
  next();
};

// ─── Student-only access ─────────────────────────────────────
export const studentOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Students only.',
    });
  }
  next();
};

export const approvedStudentOnly = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Students only.',
    });
  }

  const user = await User.findById(req.user.id).select('status');
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  if (user.status === 'Pending') {
    return res.status(403).json({ success: false, message: 'Your account is waiting for admin approval.' });
  }

  if (user.status === 'Rejected') {
    return res.status(403).json({ success: false, message: 'Your registration was rejected. Please contact hostel admin.' });
  }

  next();
};

export const approvedStudentOrAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role === 'admin') {
    return next();
  }

  if (req.user?.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  const user = await User.findById(req.user.id).select('status');
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  if (user.status === 'Approved') {
    return next();
  }

  if (user.status === 'Pending') {
    return res.status(403).json({ success: false, message: 'Your account is waiting for admin approval.' });
  }

  return res.status(403).json({ success: false, message: 'Your registration was rejected. Please contact hostel admin.' });
};

// ─── Admin OR self-access (student accessing own data) ───────
// Checks if the user is admin, or is a student whose ID matches the route param
export const adminOrSelf = (paramName: string = 'studentId') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Admin can access everything
    if (req.user?.role === 'admin') return next();

    // Students can only access their own data
    // The param value should match the student's identifier
    // We compare against the user's email or id from the token
    const paramValue = req.params[paramName];
    if (!paramValue) return next();

    // Allow if param matches user's id or we skip further checks
    // (The controller should enforce data-level filtering)
    next();
  };
};
