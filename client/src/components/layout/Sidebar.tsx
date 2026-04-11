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
      href: '/admin/dashboard'
    },
    {
      title: 'Students',
      icon: <FaUsers className="w-5 h-5" />,
      href: '/admin/student-management'
    },
    {
      title: 'Approvals',
      icon: <FaCheck className="w-5 h-5" />,
      href: '/admin/student-approvals'
    },
    {
      title: 'Rooms',
      icon: <FaBed className="w-5 h-5" />,
      href: '/admin/room-management'
    },
    {
      title: 'Fees',
      icon: <FaDollarSign className="w-5 h-5" />,
      href: '/admin/fees-management'
    },
    {
      title: 'Complaints',
      icon: <FaExclamationTriangle className="w-5 h-5" />,
      href: '/admin/complaint-management'
    },
    {
      title: 'Activity Log',
      icon: <FaHistory className="w-5 h-5" />,
      href: '/admin/activity-log'
    },
    {
      title: 'Profile',
      icon: <FaUser className="w-5 h-5" />,
      href: '/admin/profile'
    }
  ];

  const studentMenuItems = [
    {
      title: 'Home',
      icon: <FaHome className="w-5 h-5" />,
      href: '/student/dashboard'
    },
    {
      title: 'My Room',
      icon: <FaBed className="w-5 h-5" />,
      href: '/student/my-room'
    },
    {
      title: 'Book Room',
      icon: <FaBed className="w-5 h-5" />,
      href: '/student/book-room'
    },
    {
      title: 'Payments',
      icon: <FaFileInvoiceDollar className="w-5 h-5" />,
      href: '/student/my-fees'
    },
    {
      title: 'Complaints',
      icon: <FaComments className="w-5 h-5" />,
      href: '/student/my-complaints'
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

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar — always fixed, slides in/out on mobile */}
      <div className={`
        fixed top-0 left-0 h-screen z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out border-r border-gray-200 flex flex-col
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-200 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center shadow-md shadow-purple-500/20">
              <span className="text-white font-bold text-base">HT</span>
            </div>
            <div>
              <h2 className="text-gray-900 font-bold text-sm tracking-wide">Home Treats</h2>
              <p className="text-purple-500 text-[11px] tracking-wider uppercase">
                {userRole === 'admin' ? 'Admin Panel' : 'Student Portal'}
              </p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={onToggle}
            title="Close sidebar"
            aria-label="Close sidebar"
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.title}>
              <Link
                to={item.href}
                onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
                className={`
                  group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActiveLink(item.href)
                    ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-sm shadow-purple-100'
                    : 'text-gray-600 hover:bg-[#f5f3ff] hover:text-purple-700'
                  }
                `}
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200
                  ${isActiveLink(item.href)
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-600'
                  }
                `}>
                  {item.icon}
                </div>
                <span>{item.title}</span>
              </Link>
            </div>
          ))}

          {/* Divider */}
          <div className="!mt-4 border-t border-gray-200 pt-4">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                       text-gray-600 hover:bg-red-50 hover:text-red-600
                       transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 group-hover:bg-red-50 transition-colors duration-200 shrink-0">
                <FaSignOutAlt className="w-4 h-4" />
              </div>
              <span>Logout</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="px-4 py-3 border-t border-gray-200 shrink-0 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center">
              <span className="text-purple-600 text-[10px] font-bold">HT</span>
            </div>
            <div>
              <p className="text-gray-700 text-[11px] font-medium">Home Treats v2.0</p>
              <p className="text-gray-400 text-[10px]">Hostel Management</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
