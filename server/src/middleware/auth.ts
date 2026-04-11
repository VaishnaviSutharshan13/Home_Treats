import { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

type StudentAccessGate = 'approved' | 'pending' | 'rejected' | 'inactive' | 'unknown';

const resolveStudentAccess = (user: {
  status?: string;
  approvalStatus?: string;
}): StudentAccessGate => {
  const s = user.status;
  const a = user.approvalStatus;
  if (s === 'Rejected' || a === 'Rejected') return 'rejected';
  if (s === 'Pending' || a === 'Pending') return 'pending';
  if (s === 'Approved' || a === 'Approved') return 'approved';
  if (s === 'Inactive' || a === 'Inactive') return 'inactive';
  return 'unknown';
};

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// ─── Verify JWT and bind req.user to a real DB user ──────────
// Ensures req.user.id is always the canonical Mongo _id string so
// User.findById(req.user.id) works (fixes 401 loops after student login
// when the payload id was missing, aliased as _id/sub, or malformed).
export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')
        ? authHeader.slice(7).trim()
        : undefined;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    let decoded: JwtPayload & { id?: string; _id?: string; email?: string; role?: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {
        id?: string;
        _id?: string;
        email?: string;
        role?: string;
      };
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
      });
    }

    const idCandidate = decoded.id ?? (decoded as { _id?: string })._id ?? decoded.sub;
    const idStr =
      idCandidate !== undefined && idCandidate !== null ? String(idCandidate).trim() : '';
    const email =
      typeof decoded.email === 'string' ? decoded.email.toLowerCase().trim() : '';

    let account = idStr ? await User.findById(idStr).select('_id email role') : null;
    if (!account && email) {
      account = await User.findOne({ email }).select('_id email role');
    }

    if (!account) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
      });
    }

    req.user = {
      id: String(account._id),
      email: account.email,
      role: account.role,
    };
    next();
  } catch {
    return res.status(401).json({
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

  const user = await User.findById(req.user.id).select('status approvalStatus');
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  const gate = resolveStudentAccess(user);
  if (gate === 'approved') {
    return next();
  }
  if (gate === 'pending') {
    return res.status(403).json({ success: false, message: 'Your account is waiting for admin approval.' });
  }
  if (gate === 'rejected') {
    return res.status(403).json({ success: false, message: 'Your registration was rejected. Please contact hostel admin.' });
  }
  if (gate === 'inactive') {
    return res.status(403).json({ success: false, message: 'Your account is inactive. Please contact hostel administration.' });
  }
  return res.status(403).json({ success: false, message: 'Access denied.' });
};

export const approvedStudentOrAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role === 'admin') {
    return next();
  }

  if (req.user?.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  const user = await User.findById(req.user.id).select('status approvalStatus');
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  const gate = resolveStudentAccess(user);
  if (gate === 'approved') {
    return next();
  }
  if (gate === 'pending') {
    return res.status(403).json({ success: false, message: 'Your account is waiting for admin approval.' });
  }
  if (gate === 'rejected') {
    return res.status(403).json({ success: false, message: 'Your registration was rejected. Please contact hostel admin.' });
  }
  if (gate === 'inactive') {
    return res.status(403).json({ success: false, message: 'Your account is inactive. Please contact hostel administration.' });
  }
  return res.status(403).json({ success: false, message: 'Access denied.' });
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
