/**
 * Modern Navbar Component
 * Clean, professional design with sticky positioning and responsive mobile menu
 */

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaBed, FaInfoCircle, FaEnvelope, FaSignInAlt, FaBars, FaTimes, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, isAdmin, isStudent, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  // Public navigation items
  const publicNavItems = [
    { name: 'Home', href: '/', icon: <FaHome className="w-4 h-4" /> },
    { name: 'Rooms', href: '/rooms', icon: <FaBed className="w-4 h-4" /> },
    { name: 'About', href: '/about', icon: <FaInfoCircle className="w-4 h-4" /> },
    { name: 'Contact', href: '/contact', icon: <FaEnvelope className="w-4 h-4" /> },
  ];

  // Dashboard link based on role
  const dashboardLink = isAdmin
    ? { name: 'Dashboard', href: '/admin/dashboard', icon: <FaTachometerAlt className="w-4 h-4" /> }
    : isStudent
    ? { name: 'Dashboard', href: '/student/dashboard', icon: <FaTachometerAlt className="w-4 h-4" /> }
    : null;

  // Build nav items: public + dashboard if authenticated
  const navItems = dashboardLink
    ? [...publicNavItems, dashboardLink]
    : publicNavItems;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'shadow-lg shadow-black/20' 
        : ''
    }`}
      style={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left Side */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-3 group transition-all duration-300"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:shadow-green-500/40 transition-all duration-300">
                <FaBed className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Home<span className="text-green-400">_Treats</span></span>
                <p className="text-xs text-gray-400">Premium Living</p>
              </div>
            </Link>
          </div>

          {/* Navigation - Center (Desktop) */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.href
                    ? 'text-green-400'
                    : 'text-gray-300 hover:text-green-400'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
                {location.pathname === item.href && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-green-400 rounded-full"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Right Side - Auth & Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-red-400 rounded-lg transition-all duration-200 hover:bg-white/5"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-green-400 rounded-lg transition-all duration-200"
                >
                  <FaSignInAlt className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-green-400 hover:bg-white/5 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="w-5 h-5" />
              ) : (
                <FaBars className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-green-500/20" style={{ background: 'rgba(15, 23, 42, 0.95)' }}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                    location.pathname === item.href
                      ? 'text-green-400 bg-green-500/10'
                      : 'text-gray-300 hover:text-green-400 hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
            
            <div className="pt-4 pb-3 border-t border-green-500/20">
              {isAuthenticated ? (
                <div className="space-y-2 px-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-base font-medium text-gray-300 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all duration-200"
                  >
                    <FaSignOutAlt className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 px-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-base font-medium text-gray-300 hover:text-green-400 hover:bg-white/5 rounded-lg transition-all duration-200"
                  >
                    <FaSignInAlt className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-300"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
