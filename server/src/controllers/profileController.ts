import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import User from '../models/User';
import Booking from '../models/Booking';
import { AuthRequest } from '../middleware/auth';

const formatProfileImageUrl = (profileImage?: string) => {
  if (!profileImage) return '';
  if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
    return profileImage;
  }
  return profileImage;
};

const buildProfileResponse = async (user: any) => {
  const profile: Record<string, any> = {
    id: user._id,
    userId: user._id,
    role: user.role,
    fullName: user.name,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    gender: user.gender || '',
    address: user.address || '',
    profileImage: formatProfileImageUrl(user.profileImage),
    dateJoined: user.createdAt,
    createdAt: user.createdAt,
  };

  if (user.role === 'admin') {
    profile.adminId = user.adminId || `ADM-${String(user._id).slice(-6).toUpperCase()}`;
  }

  if (user.role === 'student') {
    const booking = await Booking.findOne({ userId: user._id }).sort({ createdAt: -1 });
    profile.studentId = user.studentId || '';
    profile.assignedRoomNumber = booking?.roomNumber || user.room || '';
    profile.floor = booking?.selectedFloor || '';
    profile.bookingStatus = booking?.status || 'Not Booked';
    profile.emergencyContact = user.emergencyContact || '';
    profile.university = user.university || '';
    profile.approvalStatus = user.approvalStatus || 'Pending';
  }

  return profile;
};

// GET /api/profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      // 401 (not 404) so clients don’t confuse this with “route not found”, and auth interceptors can refresh session.
      return res.status(401).json({ success: false, message: 'User not found. Please sign in again.' });
    }

    const data = await buildProfileResponse(user);
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
};

// PUT /api/profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, name, phone, gender, address, password } = req.body;

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found. Please sign in again.' });
    }

    if (fullName || name) user.name = String(fullName || name).trim();
    if (phone !== undefined) user.phone = String(phone || '').trim();
    if (gender !== undefined) user.gender = gender || undefined;
    if (address !== undefined) user.address = String(address || '').trim();
    if (password) user.password = String(password);

    await user.save();

    const data = await buildProfileResponse(user);
    return res.json({ success: true, message: 'Profile updated successfully', data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
  }
};

// PUT /api/profile/image
export const updateProfileImage = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found. Please sign in again.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file (jpg, jpeg, png)' });
    }

    const previousProfileImage = user.profileImage;
    const profileImagePath = `/uploads/profile-images/${req.file.filename}`;
    user.profileImage = profileImagePath;
    await user.save();

    // Remove old local profile image file if it exists.
    if (previousProfileImage && previousProfileImage.startsWith('/uploads/profile-images/')) {
      const previousFile = path.join(process.cwd(), previousProfileImage.replace(/^\/uploads\//, 'uploads/'));
      if (fs.existsSync(previousFile)) {
        fs.unlinkSync(previousFile);
      }
    }

    const data = await buildProfileResponse(user);
    const userPayload = {
      id: data.id,
      name: data.fullName || data.name,
      email: data.email,
      profileImage: data.profileImage,
    };
    return res.json({ success: true, message: 'Profile image updated successfully', user: userPayload, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error updating profile image', error: error.message });
  }
};
