import React, { createContext, useContext, useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "admin" | "student";
  phone?: string;
  profileImage?: string;
  studentId?: string;
  adminId?: string;
  university?: string;
  gender?: "Male" | "Female" | "Other";
  address?: string;
  emergencyContact?: string;
  status?: "Pending" | "Approved" | "Rejected" | "Inactive";
  approvalStatus?: "Pending" | "Approved" | "Rejected";
  room?: string;
  roomNumber?: string;
  course?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (nextUser: Partial<User>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  loading: boolean;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const normalizeUser = (rawUser: User | null): User | null => {
    if (!rawUser) return null;

    const normalizedApprovalStatus = rawUser.approvalStatus || rawUser.status;

    return {
      ...rawUser,
      approvalStatus: normalizedApprovalStatus as User["approvalStatus"],
    };
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (!token || !userData) {
        setLoading(false);
        return;
      }

      try {
        const parsedUser = normalizeUser(JSON.parse(userData));

        // Verify persisted token before allowing protected routes to render.
        const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!verifyResponse.ok) {
          throw new Error("Invalid session");
        }

        const verifyData = await verifyResponse.json();
        const verifiedUser = normalizeUser(verifyData?.data || parsedUser);

        setUser(verifiedUser);
        localStorage.setItem("user", JSON.stringify(verifiedUser));
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    void bootstrapAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setAuthError(null);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const normalizedUser = normalizeUser(data.data.user);
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(normalizedUser));
        setUser(normalizedUser);
        setIsAuthenticated(true);
        return true;
      }
      setAuthError(data.message || "Login failed");
      return false;
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("Unable to connect to server. Please try again.");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (nextUser: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const merged = normalizeUser({ ...prev, ...nextUser } as User);
      localStorage.setItem("user", JSON.stringify(merged));
      return merged;
    });
  };

  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";
  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAuthenticated,
        isAdmin,
        isStudent,
        loading,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
