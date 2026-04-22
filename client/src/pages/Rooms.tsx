import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaWifi,
  FaUserFriends,
  FaFan,
  FaBook,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBed,
} from 'react-icons/fa';
import { toFloorId } from '../utils/roomView';

interface FacilityItemProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}
const FacilityItem: React.FC<FacilityItemProps> = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center text-center bg-card rounded-xl shadow p-6 border border-border hover:shadow-lg hover:border-primary/40 transition-all duration-200">
    {icon}
    <span className="font-semibold text-primary mb-1">{title}</span>
    <span className="text-muted-foreground text-sm">{desc}</span>
  </div>
);

interface RuleItemProps {
  text: string;
}
const RuleItem: React.FC<RuleItemProps> = ({ text }) => (
  <li className="flex items-center gap-2 text-foreground/90 text-base"><FaCheckCircle className="text-primary" /> {text}</li>
);

interface BookingStepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
}
const BookingStep: React.FC<BookingStepProps> = ({ number, icon, title }) => (
  <div className="flex flex-col items-center">
    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-surface-active border-2 border-primary mb-2">
      <span className="text-xl font-bold text-primary">{number}</span>
    </div>
    {icon}
    <span className="mt-2 font-semibold text-primary text-center">{title}</span>
  </div>
);

const floorImages: { [key: string]: string } = {
  '1st Floor': '/images/1stimage.png',
  '2nd Floor': '/images/2ndfloor.jpg',
  '3rd Floor': '/images/3rdfloor.png',
  '4th Floor': '/images/4thfloor.jpg',
};

const floorCardHighlights: {
  [key: string]: {
    subtitle: string;
    points: [string, string];
  };
} = {
  '1st Floor': {
    subtitle: 'Best for New Students',
    points: ['Near Entrance', 'Easy access to common areas'],
  },
  '2nd Floor': {
    subtitle: 'Quiet Zone',
    points: ['Study Friendly', 'Calm environment'],
  },
  '3rd Floor': {
    subtitle: 'Premium Rooms',
    points: ['Best View', 'Spacious layout'],
  },
  '4th Floor': {
    subtitle: 'Top Floor',
    points: ['Private Atmosphere', 'Peaceful stay'],
  },
};

const Rooms: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3 tracking-tight">Find Your Perfect Student Room</h1>
        <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">Browse and select from our available hostel rooms.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center text-muted-foreground">Select a floor to view available rooms</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {['1st Floor', '2nd Floor', '3rd Floor', '4th Floor'].map((floor) => {
            const floorId = toFloorId(floor);
            const cardMeta = floorCardHighlights[floor];
            return (
              <div key={floor} className="bg-card rounded-2xl border border-border shadow-lg group flex flex-col overflow-hidden relative hover:-translate-y-1 hover:border-primary/40 hover:shadow-primary/5 transition-all duration-300">
                <div className="relative overflow-hidden h-48 flex items-center justify-center">
                  <img 
                    src={floorImages[floor]} 
                    alt={floor} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-black text-white mb-2">{floor}</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col p-6">
                  <h3 className="text-xl font-bold text-primary mb-4 tracking-wide">{floor}</h3>
                  <div className="space-y-2 mb-4 flex-1">
                    <div className="text-base font-semibold text-foreground">{cardMeta.subtitle}</div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <FaCheckCircle className="w-4 h-4 text-primary" /> {cardMeta.points[0]}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <FaCheckCircle className="w-4 h-4 text-primary" /> {cardMeta.points[1]}
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/floor/${floorId}`)} 
                    className="w-full px-4 py-3 bg-gradient-to-r from-primary to-primary-hover hover:scale-[1.02] transform transition-all shadow-md text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    <span>View Details</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Hostel Facilities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
          <FacilityItem icon={<FaWifi className="w-7 h-7 text-primary mb-2" />} title="High-Speed WiFi" desc="Unlimited fast internet in all rooms and common areas." />
          <FacilityItem icon={<FaBook className="w-7 h-7 text-primary mb-2" />} title="Study Area" desc="Quiet, dedicated spaces for focused study." />
          <FacilityItem icon={<FaUserFriends className="w-7 h-7 text-primary mb-2" />} title="Laundry Service" desc="On-site laundry for hassle-free living." />
          <FacilityItem icon={<FaExclamationTriangle className="w-7 h-7 text-primary mb-2" />} title="CCTV Security" desc="24/7 surveillance for your safety." />
          <FacilityItem icon={<FaFan className="w-7 h-7 text-primary mb-2" />} title="Water Supply" desc="Reliable water supply at all times." />
          <FacilityItem icon={<FaCheckCircle className="w-7 h-7 text-primary mb-2" />} title="24/7 Water Supply" desc="Round-the-clock access to water." />
          <FacilityItem icon={<FaBook className="w-7 h-7 text-primary mb-2" />} title="Common Kitchen" desc="Cook your own meals in a shared kitchen." />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-surface-active border-l-4 border-primary rounded-2xl shadow p-8">
          <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2"><FaExclamationTriangle className="text-primary" /> Important: Hostel Rules & Regulations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ul className="space-y-3">
              <RuleItem text="Valid student ID required" />
              <RuleItem text="Maintain cleanliness" />
              <RuleItem text="No smoking or alcohol" />
            </ul>
            <ul className="space-y-3">
              <RuleItem text="Visitors allowed only in common areas" />
              <RuleItem text="Respect hostel property" />
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">How Booking Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
          <BookingStep number={1} icon={<FaBed className="w-7 h-7 text-primary" />} title="Choose a room" />
          <div className="hidden md:block w-12 h-1 bg-primary/25 mx-2 rounded-full" />
          <BookingStep number={2} icon={<FaCheckCircle className="w-7 h-7 text-primary" />} title="Click Book Now" />
          <div className="hidden md:block w-12 h-1 bg-primary/25 mx-2 rounded-full" />
          <BookingStep number={3} icon={<FaBook className="w-7 h-7 text-primary" />} title="Fill the booking form" />
          <div className="hidden md:block w-12 h-1 bg-primary/25 mx-2 rounded-full" />
          <BookingStep number={4} icon={<FaUserFriends className="w-7 h-7 text-primary" />} title="Wait for admin approval" />
        </div>
      </section>
    </div>
  );
};

export default Rooms;
