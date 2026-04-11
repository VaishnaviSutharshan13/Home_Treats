import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { bookingService, roomService } from '../../services';
import { useAuth } from '../../context/AuthContext';

interface RoomOption {
  _id: string;
  roomNumber: string;
  floor: string;
  capacity: number;
  occupied: number;
  status: string;
}

const DURATION_OPTIONS = [
  { label: '3 months', value: '3_months' },
  { label: '6 months', value: '6_months' },
  { label: '1 year', value: '1_year' },
];

const RoomBookingFormPage: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.name || '',
    studentId: user?.studentId || '',
    email: user?.email || '',
    phone: user?.phone || '',
    checkIn: '',
    duration: '',
    notes: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<RoomOption | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailableRoom = async () => {
      try {
        const res = await roomService.getAll();
        const allRooms: RoomOption[] = (res?.data || res || []) as RoomOption[];
        const room = allRooms.find((r) => r.status !== 'Maintenance' && r.occupied < r.capacity) || null;
        setSelectedRoom(room);
      } catch (error) {
        setErrorMessage('Failed to load available room details.');
      } finally {
        setLoadingRoom(false);
      }
    };

    fetchAvailableRoom();
  }, []);

  const availableBeds = useMemo(() => {
    if (!selectedRoom) return 0;
    return Math.max(selectedRoom.capacity - selectedRoom.occupied, 0);
  }, [selectedRoom]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    if (!selectedRoom) {
      setErrorMessage('No room is currently available for booking.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const response = await bookingService.confirm({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        selectedFloor: selectedRoom.floor,
        roomId: selectedRoom._id,
      });

      if (!response?.success) {
        setErrorMessage(response?.message || 'Booking failed. Please try again.');
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      setSuccess(true);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Booking failed. Please try again.');
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setSuccess(false);
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-active via-background to-card py-10 px-2">
      <div className="w-full max-w-lg">
        {errorMessage && (
          <div className="mb-4 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {errorMessage}
          </div>
        )}

        {/* Room Details Card */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/10 border-primary/20">
          <Card.Header>
            <h2 className="text-xl font-bold text-primary mb-1">
              Room {selectedRoom?.roomNumber || '-'}
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-foreground/90">
              <span><span className="font-semibold text-primary">Floor:</span> {selectedRoom?.floor || '-'}</span>
              <span><span className="font-semibold text-primary">Total Beds:</span> {selectedRoom?.capacity || '-'}</span>
              <span><span className="font-semibold text-primary">Available Beds:</span> {loadingRoom ? 'Loading...' : availableBeds}</span>
              <span>
                <span className="font-semibold text-primary">Status:</span>{' '}
                <span className="font-semibold text-primary">
                  {loadingRoom ? 'Loading...' : availableBeds > 0 ? 'Available' : 'Full'}
                </span>
              </span>
            </div>
          </Card.Header>
        </Card>

        {/* Booking Form Card */}
        <Card className="bg-card/80 border-primary/10">
          <Card.Header>
            <h3 className="text-lg font-semibold text-primary mb-2">Room Booking Form</h3>
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
              <label className="block text-sm font-medium text-foreground/90 mb-2">Duration of Stay</label>
              <select
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className={`rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none w-full ${errors.duration ? 'border-error/20 focus:border-error/20 focus:ring-red-500' : ''}`}
              >
                <option value="">Select duration</option>
                {DURATION_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.duration && <p className=" bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30">{errors.duration}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-2">Additional Notes <span className="text-gray-400">(optional)</span></label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg px-3 py-2 bg-muted/30 border border-border text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:border-primary/30"
                placeholder="Any special requests or notes..."
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={submitting}
                disabled={loadingRoom || !selectedRoom || availableBeds <= 0}
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
          <FaCheckCircle className="text-primary w-14 h-14 mb-3" />
          <h4 className="text-lg font-semibold text-foreground/90 mb-2">Room booked successfully</h4>
          <Button onClick={handleCloseModal} size="md" className="mt-4 w-full">OK</Button>
        </div>
      </Modal>
    </div>
  );
};

export default RoomBookingFormPage;
