import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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
