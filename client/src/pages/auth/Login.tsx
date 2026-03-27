/**
 * Modern Login Page - Split Screen Authentication UI
 * Glass card design with hostel image background
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaHome, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [loginError, setLoginError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.redirectTo || location.state?.from || '/student/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoginError(null);

    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        const from = location.state?.redirectTo || location.state?.from || '/student/dashboard';
        navigate(from, {
          replace: true,
          state: location.state?.selectedRoom
            ? { selectedRoom: location.state.selectedRoom }
            : undefined,
        });
      } else {
        setLoginError('Invalid email or password');
        setIsLoading(false);
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
      setIsLoading(false);
      console.error('Login error:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hostel Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800')"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-purple-700/70"></div>
        </div>
        
        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-white p-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Welcome Back to <span className="text-purple-400">Home_Treats</span>
            </h1>
            <p className="text-xl text-purple-100 mb-8 max-w-md">
              Your comfortable and affordable student accommodation awaits
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center space-x-2 text-purple-300 hover:text-white transition-colors duration-300"
            >
              <FaHome className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <FaHome className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                Home_Treats
              </span>
            </Link>
          </div>

          {/* Glass Card Login Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200">
                <FaHome className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Sign In
              </h2>
              <p className="text-gray-500">
                Access your Home_Treats account
              </p>
            </div>

            {/* Redirect Info Message */}
            {location.state?.message && !loginError && (
              <div className="mb-6 p-4 bg-purple-500/10 backdrop-blur border border-purple-500/20 rounded-xl">
                <div className="flex items-center space-x-2">
                  <FaInfoCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-purple-400 text-sm font-medium">{location.state.message}</span>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {loginError && (
              <div className="mb-6 p-4 bg-red-500/10 backdrop-blur border border-red-500/20 rounded-xl">
                <div className="flex items-center space-x-2">
                  <FaExclamationTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">{loginError}</span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
                      formErrors.email 
                        ? 'border-red-400 focus:ring-red-400 bg-red-50' 
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    placeholder="john@example.com"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-2 text-sm text-red-400">{formErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
                      formErrors.password 
                        ? 'border-red-400 focus:ring-red-400 bg-red-50' 
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="mt-2 text-sm text-red-400">{formErrors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 bg-white"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-500">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <FaArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-purple-600 hover:text-purple-800 transition-colors duration-200"
                >
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
