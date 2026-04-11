import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../NotificationBell";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: "admin" | "student";
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  userRole,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        userRole={userRole}
      />

      <div className="flex min-h-screen flex-col lg:ml-64">
        <header className="sticky top-0 z-30 border-b border-border bg-navbar/95 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
              aria-label="Open sidebar"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <span className="text-sm font-bold text-foreground lg:hidden">
              Home Treats
            </span>

            <div className="ml-auto flex items-center gap-3">
              <NotificationBell />
              <div className="hidden items-center gap-2.5 sm:flex">
                <div className="text-right">
                  <p className="text-sm font-medium leading-none text-foreground">
                    {user?.name || (userRole === "admin" ? "Admin" : "Student")}
                  </p>
                  <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                    {userRole}
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20">
                  <span>
                    {(user?.name ||
                      (userRole === "admin" ? "A" : "S"))[0]?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
