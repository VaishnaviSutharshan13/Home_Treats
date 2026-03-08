/**
 * Dashboard Layout Component
 * Wraps dashboard pages with sidebar and main content area
 */

import { useState } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'admin' | 'student';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userRole }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        userRole={userRole}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-0">
        {/* Top Navigation Bar */}
        <div className="bg-[#111827]/90 backdrop-blur-md shadow-sm border-b border-green-500/10 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Page Title (can be overridden by individual pages) */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-xl font-semibold text-white">
                  {userRole === 'admin' ? 'Admin Dashboard' : 'Student Dashboard'}
                </h1>
              </div>

              {/* User Info */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {userRole === 'admin' ? 'Admin User' : 'John Smith'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userRole === 'admin' ? 'admin@hometreats.lk' : 'john.smith@university.edu'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                  <span className="text-white font-semibold">
                    {userRole === 'admin' ? 'A' : 'JS'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
