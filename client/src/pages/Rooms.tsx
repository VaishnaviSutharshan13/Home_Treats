import { useMemo, useState } from 'react';
import {
  FaBed,
  FaBook,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFan,
  FaInfoCircle,
  FaSearch,
  FaShieldAlt,
  FaUserFriends,
  FaUtensils,
  FaWifi,
} from 'react-icons/fa';

type Availability = 'Available' | 'Limited' | 'Full';

interface FloorCard {
  id: number;
  floor: string;
  roomType: string;
  price: number;
  capacity: number;
  availability: Availability;
  description: string;
  features: string[];
  image: string;
  imagePrompt: string;
}

interface Facility {
  title: string;
  description: string;
  icon: JSX.Element;
}

interface Rule {
  title: string;
  description: string;
  icon: JSX.Element;
}

const FALLBACK_ROOM_IMAGE = '/images/hostel-room.jpg';

// AI image prompt reference:
// "modern student hostel room, clean bed, study desk, chair, natural sunlight, minimal interior, realistic photography, 4k"
const floorCards: FloorCard[] = [
  {
    id: 1,
    floor: '1st Floor',
    roomType: 'Standard Student Room',
    price: 14000,
    capacity: 1,
    availability: 'Available',
    description: 'Quiet single room with study table, fan, and natural daylight for focused student life.',
    features: ['WiFi', 'Study Table', 'Fan'],
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    imagePrompt:
      'modern student hostel room interior, clean bed, study table, natural lighting, minimal design, realistic photography',
  },
  {
    id: 2,
    floor: '2nd Floor',
    roomType: 'Shared Room',
    price: 12000,
    capacity: 2,
    availability: 'Limited',
    description: 'Comfortable shared room with organized layout and practical furniture for two students.',
    features: ['WiFi', 'Bunk Beds', 'Study Zone'],
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    imagePrompt:
      'shared student room with bunk beds, clean and organized, bright natural lighting, realistic photography',
  },
  {
    id: 3,
    floor: '3rd Floor',
    roomType: 'Premium Room',
    price: 22000,
    capacity: 1,
    availability: 'Available',
    description: 'Premium room with warm wooden finishes, modern lighting, and enhanced personal space.',
    features: ['WiFi', 'AC', 'Premium Desk'],
    image: 'https://images.unsplash.com/photo-1616594039964-3fda1f0b9b95?auto=format&fit=crop&w=1200&q=80',
    imagePrompt:
      'premium hostel room with wooden furniture, bright lighting, cozy environment, realistic photography',
  },
  {
    id: 4,
    floor: '4th Floor',
    roomType: 'High Demand Floor',
    price: 19000,
    capacity: 1,
    availability: 'Full',
    description: 'This floor is currently fully occupied. Join the waitlist to get notified for the next opening.',
    features: ['WiFi', 'Power Backup', 'Study Desk'],
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
    imagePrompt:
      'modern hostel room, minimal interior, clean bed setup, fully occupied status visual, realistic photography',
  },
];

const facilities: Facility[] = [
  {
    title: 'High-Speed WiFi',
    description: 'Reliable internet coverage in all floors and common zones.',
    icon: <FaWifi className="h-6 w-6 text-violet-600" />,
  },
  {
    title: 'Study Area',
    description: 'Dedicated quiet spaces designed for focused learning.',
    icon: <FaBook className="h-6 w-6 text-violet-600" />,
  },
  {
    title: 'Shared Kitchen',
    description: 'Clean and equipped kitchen for daily student needs.',
    icon: <FaUtensils className="h-6 w-6 text-violet-600" />,
  },
  {
    title: '24/7 Security',
    description: 'CCTV and managed access for a safer stay experience.',
    icon: <FaShieldAlt className="h-6 w-6 text-violet-600" />,
  },
  {
    title: 'Student Community',
    description: 'Friendly environment with shared lounges and events.',
    icon: <FaUserFriends className="h-6 w-6 text-violet-600" />,
  },
  {
    title: 'Comfort Ventilation',
    description: 'Well-ventilated rooms with fans and natural light.',
    icon: <FaFan className="h-6 w-6 text-violet-600" />,
  },
];

const rules: Rule[] = [
  {
    title: 'ID Verification',
    description: 'Carry a valid student ID during check-in and whenever requested.',
    icon: <FaCheckCircle className="h-5 w-5 text-green-600" />,
  },
  {
    title: 'Cleanliness',
    description: 'Keep your room and shared facilities clean and hygienic.',
    icon: <FaCheckCircle className="h-5 w-5 text-green-600" />,
  },
  {
    title: 'No Smoking',
    description: 'Smoking and alcohol are strictly prohibited inside hostel premises.',
    icon: <FaExclamationTriangle className="h-5 w-5 text-amber-500" />,
  },
  {
    title: 'Visitor Policy',
    description: 'Visitors are permitted only in designated common areas.',
    icon: <FaInfoCircle className="h-5 w-5 text-blue-600" />,
  },
  {
    title: 'Property Respect',
    description: 'Treat hostel assets responsibly; damages may incur penalties.',
    icon: <FaExclamationTriangle className="h-5 w-5 text-amber-500" />,
  },
  {
    title: 'Quiet Hours',
    description: 'Maintain low noise levels during study and night hours.',
    icon: <FaInfoCircle className="h-5 w-5 text-blue-600" />,
  },
];

const availabilityBadgeClass: Record<Availability, string> = {
  Available: 'bg-emerald-100 text-emerald-700',
  Limited: 'bg-amber-100 text-amber-700',
  Full: 'bg-rose-100 text-rose-700',
};

const SectionHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-8 text-center">
    <h2 className="text-[26px] font-bold text-slate-900 tracking-tight">{title}</h2>
    <p className="mt-2 text-[15px] text-slate-500 max-w-2xl mx-auto">{subtitle}</p>
  </div>
);

const PrimaryButton = ({ label }: { label: string }) => (
  <button className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:from-violet-700 hover:to-fuchsia-700 hover:shadow-lg">
    {label}
  </button>
);

const Rooms: React.FC = () => {
  const [availabilityFilter, setAvailabilityFilter] = useState<'All' | Availability>('All');
  const [imageFallbackMap, setImageFallbackMap] = useState<Record<number, boolean>>({});

  const filteredFloors = useMemo(() => {
    if (availabilityFilter === 'All') return floorCards;
    return floorCards.filter((floor) => floor.availability === availabilityFilter);
  }, [availabilityFilter]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-sm md:px-10">
          <h1 className="text-center text-[28px] font-bold tracking-tight text-slate-900 md:text-[34px]">
            Find Your Perfect Hostel Floor
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[15px] text-slate-500">
            Modern student-friendly rooms with clear availability, transparent pricing, and comfortable facilities.
          </p>

          <div className="mt-6 flex flex-wrap items-end justify-center gap-3">
            <label className="text-sm font-medium text-slate-700" htmlFor="availabilityFilter">
              Availability
            </label>
            <select
              id="availabilityFilter"
              value={availabilityFilter}
              onChange={(event) => setAvailabilityFilter(event.target.value as 'All' | Availability)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none ring-violet-200 transition focus:ring"
            >
              <option value="All">All</option>
              <option value="Available">Available</option>
              <option value="Limited">Limited</option>
              <option value="Full">Full</option>
            </select>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <FaSearch className="h-3.5 w-3.5" />
              Apply
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Floor Listings"
          subtitle="Browse all 4 floors in a structured layout designed for fast comparison and easy booking decisions."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 items-stretch">
          {filteredFloors.map((floor) => (
            <article
              key={floor.id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
            >
              <div className="relative h-[200px] overflow-hidden">
                <img
                  src={imageFallbackMap[floor.id] ? FALLBACK_ROOM_IMAGE : floor.image}
                  alt={`${floor.floor} hostel room`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={() => setImageFallbackMap((prev) => ({ ...prev, [floor.id]: true }))}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <span
                  className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${availabilityBadgeClass[floor.availability]}`}
                >
                  {floor.availability}
                </span>
              </div>

              <div className="flex h-full flex-col p-5">
                <h3 className="text-[22px] font-bold text-slate-900">{floor.floor}</h3>
                <p className="mt-1 text-sm font-medium text-violet-700">{floor.roomType}</p>

                <p className="mt-3 text-[15px] leading-6 text-slate-600">{floor.description}</p>

                <p className="mt-4 text-[21px] font-bold text-violet-700">
                  Rs. {floor.price.toLocaleString()} <span className="text-xs font-medium text-slate-400">/ month</span>
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Capacity: {floor.capacity} {floor.capacity > 1 ? 'students' : 'student'}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {floor.features.map((feature) => (
                    <span
                      key={`${floor.id}-${feature}`}
                      className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="mt-6">
                  <PrimaryButton label="View Details" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Hostel Facilities"
          subtitle="Core services and amenities crafted to support student comfort, safety, and productivity."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {facilities.map((facility) => (
            <article
              key={facility.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">
                {facility.icon}
              </div>
              <h3 className="text-[17px] font-semibold text-slate-900">{facility.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{facility.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Hostel Rules & Regulations"
          subtitle="Important guidelines that keep the hostel experience safe, respectful, and professional."
        />

        <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-lg md:p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {rules.map((rule) => (
              <div key={rule.title} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="mt-0.5">{rule.icon}</div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900">{rule.title}</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{rule.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-5xl px-4 pb-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="How Booking Works"
          subtitle="A simple 4-step process to reserve your preferred hostel room."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: 1, icon: <FaBed className="h-5 w-5 text-violet-600" />, title: 'Choose Floor' },
            { step: 2, icon: <FaSearch className="h-5 w-5 text-violet-600" />, title: 'Review Details' },
            { step: 3, icon: <FaBook className="h-5 w-5 text-violet-600" />, title: 'Submit Booking' },
            { step: 4, icon: <FaCheckCircle className="h-5 w-5 text-violet-600" />, title: 'Get Approval' },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-violet-50">{item.icon}</div>
              <p className="text-sm font-semibold text-slate-800">Step {item.step}</p>
              <p className="mt-1 text-sm text-slate-600">{item.title}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Rooms;
