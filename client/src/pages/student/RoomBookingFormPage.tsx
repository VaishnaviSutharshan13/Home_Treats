import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ROOM_DETAILS = {
  roomNumber: 'B-202',
  floor: '2nd Floor',
  totalBeds: 2,
  availableBeds: 2,
  status: 'Available',
};

const DURATION_OPTIONS = [
  { label: '3 months', value: '3_months' },
  { label: '6 months', value: '6_months' },
  { label: '1 year', value: '1_year' },
];

const RoomBookingFormPage: React.FC = () => {
  const [form, setForm] = useState({
    fullName: '',
    studentId: '',
    email: '',
    phone: '',
    checkIn: '',
    duration: '',
    notes: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors: any = {};
    if (!form.fullName) newErrors.fullName = 'Full name is required';
    if (!form.studentId) newErrors.studentId = 'Student ID is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.phone) newErrors.phone = 'Phone number is required';
    if (!form.checkIn) newErrors.checkIn = 'Check-in date is required';
    if (!form.duration) newErrors.duration = 'Please select duration';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 1200);
  };

  const handleCloseModal = () => {
    setSuccess(false);
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-purple-50 to-white py-10 px-2">
      <div className="w-full max-w-lg">
        {/* Room Details Card */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500/10 to-purple-300/10 border-purple-400/20">
          <Card.Header>
            <h2 className="text-xl font-bold text-purple-800 mb-1">Room {ROOM_DETAILS.roomNumber}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-700">
              <span><span className="font-semibold text-purple-600">Floor:</span> {ROOM_DETAILS.floor}</span>
              <span><span className="font-semibold text-purple-600">Total Beds:</span> {ROOM_DETAILS.totalBeds}</span>
              <span><span className="font-semibold text-purple-600">Available Beds:</span> {ROOM_DETAILS.availableBeds}</span>
              <span><span className="font-semibold text-purple-600">Status:</span> <span className="font-semibold text-green-600">{ROOM_DETAILS.status}</span></span>
            </div>
          </Card.Header>
        </Card>

        {/* Booking Form Card */}
        <Card className="bg-white/80 border-purple-400/10">
          <Card.Header>
            <h3 className="text-lg font-semibold text-purple-700 mb-2">Room Booking Form</h3>
          </Card.Header>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Student Full Name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              error={errors.fullName}
              placeholder="Enter your full name"
              autoComplete="off"
            />
            <Input
              label="Student ID"
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              error={errors.studentId}
              placeholder="e.g. STU123456"
              autoComplete="off"
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="e.g. student@email.com"
              autoComplete="off"
            />
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="e.g. 0771234567"
              autoComplete="off"
            />
            <Input
              label="Check-in Date"
              name="checkIn"
              type="date"
              value={form.checkIn}
              onChange={handleChange}
              error={errors.checkIn}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration of Stay</label>
              <select
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className={`rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none w-full ${errors.duration ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              >
                <option value="">Select duration</option>
                {DURATION_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.duration && <p className="mt-1 text-sm text-red-400">{errors.duration}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes <span className="text-gray-400">(optional)</span></label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none w-full"
                placeholder="Any special requests or notes..."
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={submitting}
              >
                Confirm Booking
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => navigate(-1)}
              >
                Cancel / Back
              </Button>
            </div>
          </form>
        </Card>
      </div>
      {/* Success Modal */}
      <Modal isOpen={success} onClose={handleCloseModal} title="Booking Successful" size="sm">
        <div className="flex flex-col items-center justify-center py-6">
          <FaCheckCircle className="text-green-500 w-14 h-14 mb-3" />
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Room booked successfully</h4>
          <Button onClick={handleCloseModal} size="md" className="mt-4 w-full">OK</Button>
        </div>
      </Modal>
    </div>
  );
};

export default RoomBookingFormPage;
