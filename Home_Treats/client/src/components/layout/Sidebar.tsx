/**
 * Modern Sidebar Component
 * Collapsible sidebar with role-based menu items
 */

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaBed, 
  FaDollarSign, 
  FaExclamationTriangle, 
  FaSignOutAlt,
  FaHistory,
  FaHome,
  FaUser,
  FaFileInvoiceDollar,
  FaComments,
  FaTimes,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userRole: 'admin' | 'student';
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const adminMenuItems = [
    {
      title: 'Dashboard',
      icon: <FaTachometerAlt className="w-5 h-5" />,
      href: '/dashboard',
      badge: null
    },
    {
      title: 'Students',
      icon: <FaUsers className="w-5 h-5" />,
      href: '/admin/student-management',
      badge: null
    },
    {
      title: 'Rooms',
      icon: <FaBed className="w-5 h-5" />,
      href: '/admin/room-management',
      badge: null
    },
    {
      title: 'Fees',
      icon: <FaDollarSign className="w-5 h-5" />,
      href: '/admin/fees-management',
      badge: null
    },
    {
      title: 'Complaints',
      icon: <FaExclamationTriangle className="w-5 h-5" />,
      href: '/admin/complaint-management',
      badge: null
    },
    {
      title: 'Activity Log',
      icon: <FaHistory className="w-5 h-5" />,
      href: '/admin/activity-log',
      badge: null
    },
    {
      title: 'Profile',
      icon: <FaUser className="w-5 h-5" />,
      href: '/admin/profile',
      badge: null
    }
  ];

  const studentMenuItems = [
    {
      title: 'Dashboard',
      icon: <FaHome className="w-5 h-5" />,
      href: '/dashboard',
      badge: null
    },
    {
      title: 'My Room',
      icon: <FaBed className="w-5 h-5" />,
      href: '/student/my-room',
      badge: null
    },
    {
      title: 'My Fees',
      icon: <FaFileInvoiceDollar className="w-5 h-5" />,
      href: '/student/my-fees',
      badge: { count: 3, color: 'error' }
    },
    {
      title: 'My Complaints',
      icon: <FaComments className="w-5 h-5" />,
      href: '/student/my-complaints',
      badge: { count: 2, color: 'warning' }
    },
    {
      title: 'Profile',
      icon: <FaUser className="w-5 h-5" />,
      href: '/student/profile',
      badge: null
    }
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : studentMenuItems;

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === href || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'error': return 'bg-error-500';
      case 'warning': return 'bg-warning-500';
      case 'success': return 'bg-success-500';
      default: return 'bg-primary-500';
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 top-16 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-16 bottom-0 left-0 z-40 w-72 bg-[#0a0f1a] shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-green-500/10
        lg:translate-x-0 lg:static lg:inset-0 lg:top-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-green-500/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20">
              <span className="text-white font-bold text-lg">
                {userRole === 'admin' ? 'A' : 'S'}
              </span>
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">
                {userRole === 'admin' ? 'Admin Panel' : 'Student Portal'}
              </h2>
              <p className="text-neutral-400 text-xs">
                {userRole === 'admin' ? 'Management System' : 'My Account'}
              </p>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.title}>
              <Link
                to={item.href}
                onClick={() => onToggle()} // Close on mobile after navigation
                className={`
                  group flex items-center justify-between px-4 py-3 rounded-lg text-gray-400 
                  hover:bg-white/5 hover:text-white transition-all duration-200
                  ${isActiveLink(item.href) 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-lg shadow-green-500/5' 
                    : 'hover:translate-x-1'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${isActiveLink(item.href) 
                      ? 'bg-green-500/20' 
                      : 'bg-white/5 group-hover:bg-green-500/10'
                    }
                    transition-colors duration-200
                  `}>
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.title}</span>
                </div>

                {/* Badge */}
                {item.badge && (
                  <div className="flex items-center space-x-2">
                    <span className={`
                      px-2 py-1 text-xs font-bold rounded-full
                      ${getBadgeColor(item.badge.color)} text-white
                    `}>
                      {item.badge.count}
                    </span>
                  </div>
                )}
              </Link>
            </div>
          ))}

          {/* Divider */}
          <div className="border-t border-green-500/10 my-4"></div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
                     text-gray-400 hover:bg-red-500/10 hover:text-red-400 
                     transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 group-hover:bg-red-500/10 transition-colors duration-200">
              <FaSignOutAlt className="w-5 h-5" />
            </div>
            <span className="font-medium">Logout</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-green-500/10">
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">
              Home_Treats Management System
            </p>
            <p className="text-gray-600 text-xs">
              Version 2.0.1
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
