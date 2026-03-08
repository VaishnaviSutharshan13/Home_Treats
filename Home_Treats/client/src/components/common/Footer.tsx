import { Link } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="w-full bg-[#0a0f1a] text-white border-t border-green-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Section 1 - Logo and Text */}
          <div>
            <div className="text-2xl font-bold mb-4">
              Home<span className="text-green-400">_Treats</span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-4">
              Premium student accommodation in Sri Lanka. Safe, affordable, and comfortable living spaces.
            </p>
            {/* Social Media Icons */}
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-white/5 border border-green-500/20 hover:bg-green-500/20 hover:border-green-400/40 rounded-lg flex items-center justify-center transition-all duration-300">
                <FaFacebook className="w-4 h-4 text-gray-400" />
              </a>
              <a href="#" className="w-9 h-9 bg-white/5 border border-green-500/20 hover:bg-green-500/20 hover:border-green-400/40 rounded-lg flex items-center justify-center transition-all duration-300">
                <FaTwitter className="w-4 h-4 text-gray-400" />
              </a>
              <a href="#" className="w-9 h-9 bg-white/5 border border-green-500/20 hover:bg-green-500/20 hover:border-green-400/40 rounded-lg flex items-center justify-center transition-all duration-300">
                <FaInstagram className="w-4 h-4 text-gray-400" />
              </a>
              <a href="#" className="w-9 h-9 bg-white/5 border border-green-500/20 hover:bg-green-500/20 hover:border-green-400/40 rounded-lg flex items-center justify-center transition-all duration-300">
                <FaLinkedin className="w-4 h-4 text-gray-400" />
              </a>
              <a href="#" className="w-9 h-9 bg-white/5 border border-green-500/20 hover:bg-green-500/20 hover:border-green-400/40 rounded-lg flex items-center justify-center transition-all duration-300">
                <FaWhatsapp className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>

          {/* Section 2 - Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-400">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-green-400 transition-colors duration-300 block">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="text-gray-400 hover:text-green-400 transition-colors duration-300 block">
                  Rooms
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-green-400 transition-colors duration-300 block">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-green-400 transition-colors duration-300 block">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 3 - Facilities */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-400">Facilities</h3>
            <ul className="space-y-2 text-gray-400">
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
            <h3 className="text-lg font-semibold mb-4 text-green-400">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <FaEnvelope className="text-green-400 mr-3 flex-shrink-0" />
                <span className="text-gray-400">info@hometreats.lk</span>
              </div>
              <div className="flex items-center">
                <FaPhone className="text-green-400 mr-3 flex-shrink-0" />
                <span className="text-gray-400">+94 81 234 5678</span>
              </div>
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-green-400 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  No. 45, Hostel Lane,<br />
                  Peradeniya Road,<br />
                  Kandy, Sri Lanka
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom - Copyright */}
        <div className="mt-8 pt-8 border-t border-green-500/10 text-center">
          <p className="text-gray-500">
            &copy; 2026 Home_Treats. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
