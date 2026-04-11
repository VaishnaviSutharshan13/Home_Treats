import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaEnvelope, FaMapMarkerAlt, FaPhone, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services';

interface BookingDraft {
  fullName: string;
  email: string;
  phone: string;
  selectedFloor: string;
}

const STORAGE_KEY = 'pending_booking_draft';

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const draft = useMemo(() => {
    const stateDraft = (location.state as { bookingDraft?: BookingDraft } | null)?.bookingDraft;
    if (stateDraft) return stateDraft;

    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as BookingDraft;
    } catch {
      return null;
    }
  }, [location.state]);

  const bookingData: BookingDraft | null = draft
    ? {
        fullName: draft.fullName || user?.name || '',
        email: draft.email || user?.email || '',
        phone: draft.phone || user?.phone || '',
        selectedFloor: draft.selectedFloor,
      }
    : null;

  const handleConfirm = async () => {
    if (!bookingData) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      const response = await bookingService.confirm({
        fullName: bookingData.fullName,
        email: bookingData.email,
        phone: bookingData.phone,
        selectedFloor: bookingData.selectedFloor,
      });

      if (!response.success) {
        setErrorMessage(response.message || 'Failed to confirm booking');
        return;
      }

      if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      sessionStorage.removeItem(STORAGE_KEY);
      setSuccessMessage('Your room booking has been successfully confirmed.');

      setTimeout(() => {
        window.location.href = '/student/dashboard';
      }, 1500);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Failed to confirm booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    navigate('/rooms');
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-surface-active/50 rounded-2xl border border-primary/20 p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-3">No Booking Details Found</h1>
            <p className="text-muted-foreground mb-6">Please select a room from the Rooms page and continue the booking process.</p>
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-hover text-primary-foreground transform hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-300 rounded-xl font-semibold transition-all"
            >
              <FaArrowLeft className="w-4 h-4" />
              Back to Rooms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Booking <span className="text-primary">Confirmation</span>
          </h1>
          <p className="text-muted-foreground">Review your details before confirming your room booking.</p>
        </div>

        {successMessage && (
          <div className="mb-6 flex items-center gap-3 bg-primary/10 border border-primary/30 text-primary px-4 py-3 rounded-xl">
            <FaCheckCircle className="w-5 h-5" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 flex items-center gap-3 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl">
            <FaTimes className="w-5 h-5" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-surface-active/50 border border-primary/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Student Information</h2>
            <div className="space-y-3 text-sm">
              <p><span className="font-semibold text-primary">Full Name:</span> <span className="text-foreground/90">{bookingData.fullName}</span></p>
              <p><span className="font-semibold text-primary">Email:</span> <span className="text-foreground/90">{bookingData.email}</span></p>
              <p><span className="font-semibold text-primary">Phone Number:</span> <span className="text-foreground/90">{bookingData.phone}</span></p>
            </div>
          </div>

          <div className="bg-surface-active/50 border border-primary/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Room Information</h2>
            <div className="space-y-3 text-sm">
              <p><span className="font-semibold text-primary">Selected Floor:</span> <span className="text-foreground/90">{bookingData.selectedFloor}</span></p>
              <p><span className="font-semibold text-primary">Room Capacity:</span> <span className="text-foreground/90">Based on assigned room</span></p>
              <p><span className="font-semibold text-primary">Number of Beds:</span> <span className="text-foreground/90">Based on assigned room</span></p>
              <p><span className="font-semibold text-primary">Monthly Rent:</span> <span className="text-foreground/90">Based on assigned room</span></p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-card border border-primary/20 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-4">Hostel Information</h2>
          <div className="space-y-3 text-sm text-foreground/90">
            <p><span className="font-semibold text-primary">Hostel Name:</span> Home_Treats Student Hostel</p>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="w-4 h-4 text-primary" />
              <span>No.11, Nallur, Jaffna, 40000, Sri Lanka</span>
            </div>
            <div className="flex items-center gap-2">
              <FaEnvelope className="w-4 h-4 text-primary" />
              <span>{bookingData.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaPhone className="w-4 h-4 text-primary" />
              <span>{bookingData.phone}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-surface-active/50 border border-primary/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Booking Confirmation</h2>
          <div className="space-y-2 text-sm text-foreground/90 mb-6">
            <p><span className="font-semibold text-primary">Selected Room:</span> {bookingData.selectedFloor}</p>
            <p><span className="font-semibold text-primary">Monthly Price:</span> Based on assigned room</p>
            <p><span className="font-semibold text-primary">Student:</span> {bookingData.fullName}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-hover text-primary-foreground transform hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-300 rounded-xl font-semibold transition-all disabled:opacity-60"
            >
              <FaCheckCircle className="w-4 h-4" />
              {submitting ? 'Confirming...' : 'Confirm Booking'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-card border border-primary/30 text-primary rounded-xl font-semibold hover:bg-surface-active transition-all"
            >
              <FaTimes className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
