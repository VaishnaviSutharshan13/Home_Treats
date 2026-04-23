import crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Student from "../models/Student";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";
const VALID_COURSES = [
  "Computer Science",
  "Engineering",
  "Business",
  "Medicine",
  "Arts",
  "Science",
];
const VALID_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const { email, studentId, identifier, password } = req.body;
    const loginIdentifier = (identifier || email || studentId || "").trim();

    if (!loginIdentifier) {
      return res
        .status(400)
        .json({ success: false, message: "Email or Student ID is required" });
    }

    const user = await User.findOne({
      $or: [
        { email: loginIdentifier.toLowerCase() },
        { studentId: loginIdentifier.toUpperCase() },
      ],
    });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "Account is deactivated." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (user.role === "student") {
      const student = await Student.findOne({
        $or: [
          user.studentId ? { studentId: user.studentId } : null,
          { email: user.email },
        ].filter(Boolean) as any,
      }).select("studentId room roomNumber status");

      // Backfill legacy student users that don't have studentId stored on User.
      if (!user.studentId && student?.studentId) {
        user.studentId = String(student.studentId).trim().toUpperCase();
      }
      if (!user.room && student?.room) {
        user.room = student.room;
      }
      if (!user.roomNumber && student?.roomNumber) {
        user.roomNumber = student.roomNumber;
      }

      const studentStatus = student?.status;
      let userStatusToSync:
        | "Pending"
        | "Approved"
        | "Rejected"
        | "Inactive"
        | undefined;

      // Map Student hostel row → User account state (do not demote approved accounts
      // when the Student record is still Inactive, which is the default before approval).
      if (studentStatus === "Active") {
        userStatusToSync = "Approved";
      } else if (studentStatus === "Inactive") {
        if (user.approvalStatus === "Rejected" || user.status === "Rejected") {
          userStatusToSync = "Rejected";
        } else if (
          user.approvalStatus === "Pending" ||
          user.status === "Pending"
        ) {
          userStatusToSync = "Pending";
        } else if (
          user.approvalStatus === "Approved" ||
          user.status === "Approved"
        ) {
          userStatusToSync = "Approved";
        } else {
          userStatusToSync = "Inactive";
        }
      } else {
        userStatusToSync = user.status;
      }

      const latestStatus = userStatusToSync || user.status || "Pending";

      if (
        user.status !== latestStatus ||
        (!user.studentId && student?.studentId)
      ) {
        user.status = latestStatus;
        await user.save();
      }

      if (latestStatus === "Pending") {
        return res.status(403).json({
          success: false,
          message: "Your registration is waiting for admin approval.",
        });
      }

      if (latestStatus === "Rejected") {
        return res.status(403).json({
          success: false,
          message:
            "Your registration was rejected by the hostel administration.",
        });
      }
    }

    const token = jwt.sign(
      { id: String(user._id), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    const userData: Record<string, any> = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };
    if (user.role === "student") {
      userData.studentId = user.studentId;
      userData.room = user.room;
      userData.roomNumber = user.roomNumber;
      userData.course = user.course;
      userData.year = user.year;
      userData.gender = user.gender;
      userData.address = user.address;
      userData.status = user.status;
      userData.approvalStatus =
        user.approvalStatus || user.status || "Pending";
    }

    res.json({
      success: true,
      message: "Login successful",
      data: { token, user: userData },
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Login failed", error: error.message });
  }
};

// REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      phone,
      studentId,
      gender,
      university,
      emergencyContact,
      course,
      year,
      address,
    } = req.body;

    const normalizedName = String(name || "").trim();
    const normalizedEmail = String(email || "")
      .toLowerCase()
      .trim();
    const normalizedStudentId = String(studentId || "")
      .toUpperCase()
      .trim();
    const normalizedPhone = String(phone || "").trim();
    const normalizedAddress = String(address || "").trim();

    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedStudentId ||
      !normalizedPhone ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    const normalizedCourse = VALID_COURSES.includes(course)
      ? course
      : "Computer Science";
    const normalizedYear = VALID_YEARS.includes(year) ? year : "1st Year";

    const [existingUserByEmail, existingStudentByEmail] = await Promise.all([
      User.findOne({ email: normalizedEmail }).select("_id"),
      Student.findOne({ email: normalizedEmail }).select("_id"),
    ]);
    if (existingUserByEmail || existingStudentByEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const [existingUserByStudentId, existingStudentByStudentId] =
      await Promise.all([
        User.findOne({ studentId: normalizedStudentId }).select("_id"),
        Student.findOne({ studentId: normalizedStudentId }).select("_id"),
      ]);

    if (existingUserByStudentId || existingStudentByStudentId) {
      return res
        .status(400)
        .json({ success: false, message: "Student ID already exists" });
    }

    let user: any = null;
    try {
      user = await User.create({
        name: normalizedName,
        email: normalizedEmail,
        password,
        role: "student",
        phone: normalizedPhone,
        studentId: normalizedStudentId,
        university,
        emergencyContact,
        gender,
        course: normalizedCourse,
        year: normalizedYear,
        address: normalizedAddress,
        room: "",
        roomNumber: "",
        status: "Pending",
        approvalStatus: "Pending",
      });

      await Student.create({
        studentId: normalizedStudentId,
        name: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        course: normalizedCourse,
        year: normalizedYear,
        roomNumber: "",
        room: "Unassigned",
        status: "Inactive",
        joinDate: new Date(),
        fees: "Pending",
        emergencyContact: {
          name: "Guardian",
          phone: emergencyContact,
          relationship: "Parent",
        },
      });
    } catch (creationError: any) {
      if (user?._id) {
        await User.findByIdAndDelete(user._id).catch(() => null);
      }

      if (creationError?.code === 11000) {
        const dupFields = Object.keys(creationError?.keyPattern || {});
        if (dupFields.includes("email")) {
          return res
            .status(400)
            .json({ success: false, message: "Email already registered" });
        }
        if (dupFields.includes("studentId")) {
          return res
            .status(400)
            .json({ success: false, message: "Student ID already exists" });
        }
        return res.status(400).json({
          success: false,
          message: "Invalid input data",
        });
      }

      throw creationError;
    }

    res.status(201).json({
      success: true,
      message:
        "Your registration request has been submitted. Please wait for admin approval.",
      data: {
        id: user._id,
        status: user.status,
      },
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      const dupFields = Object.keys(error?.keyPattern || {});
      if (dupFields.includes("email")) {
        return res
          .status(400)
          .json({ success: false, message: "Email already registered" });
      }
      if (dupFields.includes("studentId")) {
        return res
          .status(400)
          .json({ success: false, message: "Student ID already exists" });
      }
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
      error: error.message,
    });
  }
};

// VERIFY TOKEN
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Token is valid",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        studentId: user.studentId,
        room: user.room,
        roomNumber: user.roomNumber,
        course: user.course,
        year: user.year,
        gender: user.gender,
        address: user.address,
        status: user.status,
        approvalStatus: user.approvalStatus || user.status,
      },
    });
  } catch (error: any) {
    res
      .status(401)
      .json({ success: false, message: "Invalid token", error: error.message });
  }
};

// REFRESH TOKEN
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      success: true,
      message: "Token refreshed",
      data: { token: newToken },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Token refresh failed",
      error: error.message,
    });
  }
};

// LOGOUT
export const logout = async (_req: Request, res: Response) => {
  res.json({ success: true, message: "Logout successful" });
};

// GET current user profile
export const getProfile = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// UPDATE current user profile
export const updateProfile = async (req: any, res: Response) => {
  try {
    const { name, phone, password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (password) user.password = password;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        studentId: user.studentId,
        room: user.room,
        roomNumber: user.roomNumber,
        course: user.course,
        year: user.year,
        gender: user.gender,
        address: user.address,
        status: user.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// FORGOT PASSWORD - generate reset token
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No account found with that email" });
    }

    // Generate random reset token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetToken = hashedToken;
    user.resetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    // In production, send email with rawToken. For now, return it directly.
    res.json({
      success: true,
      message: "Password reset token generated. Use it within 30 minutes.",
      data: { resetToken: rawToken },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error processing request",
      error: error.message,
    });
  }
};

// RESET PASSWORD - reset with token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = password;
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: error.message,
    });
  }
};
