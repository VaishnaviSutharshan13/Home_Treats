/**
 * Dashboard Layout Component
 * Fixed sidebar + scrollable main content
 */

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import NotificationBell from '../NotificationBell';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'admin' | 'student';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userRole }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        userRole={userRole}
      />

      {/* Main content — pushed right by sidebar width on desktop */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Sticky Top Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            {/* Mobile hamburger */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Open sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Brand on mobile */}
            <span className="lg:hidden text-gray-900 font-bold text-sm">Home Treats</span>

            {/* Right side — user info + notification */}
            <div className="flex items-center gap-3 ml-auto">
              <NotificationBell />
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 leading-none">
                    {user?.name || (userRole === 'admin' ? 'Admin' : 'Student')}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">{userRole}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow shadow-purple-200">
                  <span className="text-white font-semibold text-sm">
                    {(user?.name || (userRole === 'admin' ? 'A' : 'S'))[0]?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

