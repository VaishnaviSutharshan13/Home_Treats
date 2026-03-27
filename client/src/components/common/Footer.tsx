import { Link } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaWhatsapp, FaBed } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Section 1 - Logo and Text */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-md shadow-purple-200">
                <FaBed className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Home<span className="text-purple-600">_Treats</span></span>
            </div>
            <p className="text-gray-500 leading-relaxed mb-4 text-sm">
              Premium student accommodation in Sri Lanka. Safe, affordable, and comfortable living spaces.
            </p>
            {/* Social Media Icons */}
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-gray-50 border border-gray-200 hover:bg-purple-50 hover:border-purple-300 rounded-lg flex items-center justify-center transition-all duration-300">
                <FaFacebook className="w-4 h-4 text-gray-500 hover:text-purple-600" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-50 border border-gray-200 hover:bg-purple-50 hover:border-purple-300 rounded-lg flex items-center justify-center transition-all duration-300">
                <FaTwitter className="w-4 h-4 text-gray-500 hover:text-purple-600" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-50 border border-gray-200 hover:bg-purple-50 hover:border-purple-300 rounded-lg flex items-center justify-center transition-all duration-300">
                <FaInstagram className="w-4 h-4 text-gray-500 hover:text-purple-600" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-50 border border-gray-200 hover:bg-purple-50 hover:border-purple-300 rounded-lg flex items-center justify-center transition-all duration-300">
                <FaLinkedin className="w-4 h-4 text-gray-500 hover:text-purple-600" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-50 border border-gray-200 hover:bg-purple-50 hover:border-purple-300 rounded-lg flex items-center justify-center transition-all duration-300">
                <FaWhatsapp className="w-4 h-4 text-gray-500 hover:text-purple-600" />
              </a>
            </div>
          </div>

          {/* Section 2 - Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-purple-700 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-500 hover:text-purple-600 transition-colors duration-200 text-sm block">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="text-gray-500 hover:text-purple-600 transition-colors duration-200 text-sm block">
                  Rooms
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-500 hover:text-purple-600 transition-colors duration-200 text-sm block">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-500 hover:text-purple-600 transition-colors duration-200 text-sm block">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 3 - Facilities */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-purple-700 uppercase tracking-wider">Facilities</h3>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li>High-Speed WiFi</li>
              <li>24/7 Security</li>
              <li>Study Areas</li>
              <li>Laundry Service</li>
              <li>Parking Area</li>
              <li>Cafeteria</li>
            </ul>
          </div>

          {/* Section 4 - Contact Info */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-purple-700 uppercase tracking-wider">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <FaEnvelope className="text-purple-600 mr-3 flex-shrink-0 w-4 h-4" />
                <a href="mailto:info@hometreats.lk" className="text-gray-500 text-sm hover:text-purple-600 transition-colors duration-200">
                  info@hometreats.lk
                </a>
              </div>
              <div className="flex items-center">
                <FaPhone className="text-purple-600 mr-3 flex-shrink-0 w-4 h-4" />
                <a href="tel:+94762932003" className="text-gray-500 text-sm hover:text-purple-600 transition-colors duration-200">
                  +94 76 293 2003
                </a>
              </div>
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-purple-600 mr-3 mt-1 flex-shrink-0 w-4 h-4" />
                <span className="text-gray-500 text-sm">
                  No.11, Nallur<br />
                  Jaffna, 40000<br />
                  Sri Lanka
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom - Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-400 text-sm">
            &copy; 2026 Home_Treats. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm">
            Built with <span className="text-purple-600">♥</span> for students
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
