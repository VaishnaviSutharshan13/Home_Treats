import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaHome, FaUserPlus } from 'react-icons/fa';
import { authService } from '../../services';

type FormState = {
  fullName: string;
  studentId: string;
  email: string;
  phone: string;
  gender: string;
  course: string;
  year: string;
  address: string;
  password: string;
  confirmPassword: string;
};

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormState>({
    fullName: '',
    studentId: '',
    email: '',
    phone: '',
    gender: '',
    course: '',
    year: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.course.trim()) newErrors.course = 'Course / Department is required';
    if (!formData.year) newErrors.year = 'Year of study is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await authService.register({
        name: formData.fullName.trim(),
        studentId: formData.studentId.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        course: formData.course.trim(),
        year: formData.year,
        address: formData.address.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        setSuccessMessage('Your registration request has been submitted. Please wait for admin approval.');
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setErrors({ general: response.message || 'Registration failed' });
      }
    } catch (error: any) {
      setErrors({ general: error?.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-white border border-purple-100 rounded-2xl shadow-xl shadow-purple-100/40 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-purple-600 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <FaUserPlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Student Registration</h1>
              <p className="text-xs text-purple-100">Home Treats Hostel Management</p>
            </div>
          </div>
          <Link to="/" className="text-purple-100 hover:text-white transition-colors flex items-center gap-2 text-sm">
            <FaHome className="w-4 h-4" /> Home
          </Link>
        </div>

        <div className="p-6 md:p-8">
          {successMessage && (
            <div className="mb-5 p-3 rounded-lg border border-purple-200 bg-purple-50 text-purple-800 flex items-center gap-2 text-sm">
              <FaCheckCircle className="w-4 h-4" />
              {successMessage}
            </div>
          )}

          {errors.general && (
            <div className="mb-5 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 flex items-center gap-2 text-sm">
              <FaExclamationTriangle className="w-4 h-4" />
              {errors.general}
            </div>
          )}

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name" name="fullName" value={formData.fullName} onChange={onChange} error={errors.fullName} />
            <Field label="Student ID" name="studentId" value={formData.studentId} onChange={onChange} error={errors.studentId} />
            <Field label="Email" name="email" value={formData.email} onChange={onChange} error={errors.email} type="email" />
            <Field label="Phone Number" name="phone" value={formData.phone} onChange={onChange} error={errors.phone} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-xs text-red-600 mt-1">{errors.gender}</p>}
            </div>

            <Field label="Course / Department" name="course" value={formData.course} onChange={onChange} error={errors.course} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
              <select
                name="year"
                value={formData.year}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
              {errors.year && <p className="text-xs text-red-600 mt-1">{errors.year}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={onChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
            </div>

            <Field label="Password" name="password" value={formData.password} onChange={onChange} error={errors.password} type="password" />
            <Field label="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={onChange} error={errors.confirmPassword} type="password" />

            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition disabled:opacity-70"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50 font-medium transition inline-flex items-center gap-2"
              >
                <FaArrowLeft className="w-3 h-3" /> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
    />
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

export default Register;
