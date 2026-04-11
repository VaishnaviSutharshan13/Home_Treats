/**
 * Home Page – Home_Treats Student Hostel
 * Redesigned landing page with unique layout:
 * Hero → About → Facilities → Why Choose → Gallery → Testimonials → CTA
 *
 * Room listings have been moved exclusively to the Rooms Page.
 */

import { Link } from 'react-router-dom';
import {
  FaWifi,
  FaTshirt,
  FaShieldAlt,
  FaUtensils,
  FaBed,
  FaEnvelope,
  FaArrowRight,
  FaMapMarkerAlt,
  FaPhone,
  FaStar,
  FaBuilding,
  FaCheckCircle,
  FaHeart,
  FaBook,
  FaWater,
  FaHome,
  FaQuoteLeft,
} from 'react-icons/fa';

const HERO_ROOM_IMAGE = '/images/hostel-room.jpg';
const HOSTEL_LOCATION = import.meta.env.VITE_HOSTEL_LOCATION || 'Jaffna, Sri Lanka';

/* ──────────────────────────────────────────────────
   DATA
────────────────────────────────────────────────── */

const facilities = [
  {
    icon: <FaWifi className="w-7 h-7" />,
    title: 'High-Speed WiFi',
    desc: 'Fibre broadband internet available throughout the entire building, 24/7.',
  },
  {
    icon: <FaBook className="w-7 h-7" />,
    title: 'Study Area',
    desc: 'Dedicated quiet study rooms with comfortable desks on every floor.',
  },
  {
    icon: <FaWater className="w-7 h-7" />,
    title: '24/7 Clean Water',
    desc: 'Uninterrupted clean water supply including RO-filtered drinking water dispensers.',
  },
  {
    icon: <FaShieldAlt className="w-7 h-7" />,
    title: 'Security System',
    desc: 'CCTV cameras, biometric entry and on-site security personnel round the clock.',
  },
  {
    icon: <FaTshirt className="w-7 h-7" />,
    title: 'Laundry Area',
    desc: 'Washing machines and dryers available for all residents on the ground floor.',
  },
  {
    icon: <FaUtensils className="w-7 h-7" />,
    title: 'Common Kitchen',
    desc: 'Fully equipped shared kitchen with modern appliances for all students.',
  },
];

const whyChoose = [
  {
    icon: <FaHeart className="w-8 h-8" />,
    title: 'Affordable Living',
    desc: 'We offer the most competitive room rates in the area with flexible monthly payment plans — perfect for students on a budget.',
    color: 'from-purple-500 to-violet-600',
  },
  {
    icon: <FaShieldAlt className="w-8 h-8" />,
    title: 'Safe Environment',
    desc: 'Your safety is our top priority. With 24/7 security, CCTV surveillance and biometric access, you can feel completely at home.',
    color: 'from-violet-500 to-purple-700',
  },
  {
    icon: <FaBed className="w-8 h-8" />,
    title: 'Comfortable Rooms',
    desc: 'Every room is fully furnished with quality beds, study desks, wardrobes and reliable electricity so you can focus on your studies.',
    color: 'from-purple-600 to-fuchsia-600',
  },
];

const galleryImages = [
  {
    url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
    label: 'Building Exterior',
    span: 'col-span-2 row-span-2',
  },
  {
    url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
    label: 'Room Interior',
    span: '',
  },
  {
    url: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=600&q=80',
    label: 'Study Area',
    span: '',
  },
  {
    url: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80',
    label: 'Dining Area',
    span: '',
  },
  {
    url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&q=80',
    label: 'Common Area',
    span: '',
  },
  {
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80',
    label: 'Bathroom',
    span: '',
  },
];

const testimonials = [
  {
    name: 'Amal Perera',
    course: 'BSc Computer Science, Year 2',
    review:
      'Living at Home_Treats has been an amazing experience. The WiFi is fast, the rooms are clean and the management is very helpful. I feel completely safe here!',
    rating: 5,
    avatar: 'AP',
  },
  {
    name: 'Nishadi Fernando',
    course: 'BA Business Administration, Year 3',
    review:
      'The study rooms are a lifesaver during exam season. The staff is friendly and the facilities are well-maintained. Highly recommend to all students.',
    rating: 5,
    avatar: 'NF',
  },
  {
    name: 'Kasun Jayasinghe',
    course: 'BEng Electrical Engineering, Year 1',
    review:
      'Very affordable and comfortable. The 24/7 water supply and backup electricity are great. The location is perfect — right near the university.',
    rating: 4,
    avatar: 'KJ',
  },
];

const location = import.meta.env.VITE_HOSTEL_LOCATION || 'Jaffna, Sri Lanka';

/* ──────────────────────────────────────────────────
   COMPONENT
────────────────────────────────────────────────── */
const Home = () => {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ══════════════════════════════════════════════
          1. HERO SECTION
          Soft purple gradient overlay — bright and welcoming
      ══════════════════════════════════════════════ */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${HERO_ROOM_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >

        {/* Soft purple overlay for readability + subtle blur depth */}
        <div
          className="absolute inset-0 backdrop-blur-[1px]"
          style={{
            background: 'linear-gradient(160deg, rgba(124, 58, 237, 0.6) 0%, rgba(124, 58, 237, 0.45) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-8 lg:px-12 max-w-5xl mx-auto">

          {/* Tag badge */}
          <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-sm border border-white/40 text-white text-sm font-semibold px-6 py-2.5 rounded-full mb-10 shadow-xl">
            <FaBuilding className="w-4 h-4 text-purple-200" />
            Student Hostel Building — {HOSTEL_LOCATION}
          </div>

          {/* Main Title */}
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight tracking-tight drop-shadow-xl"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,0.30)' }}
          >
            <span className="block text-white text-3xl md:text-4xl lg:text-5xl font-semibold mb-2 opacity-95 tracking-normal">
              Welcome to
            </span>
            <span
              className="block font-black"
              style={{
                background: 'linear-gradient(90deg, #ffffff 0%, #e9d5ff 50%, #ddd6fe 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: 'none',
                filter: 'drop-shadow(0 2px 12px rgba(109,40,217,0.5))',
              }}
            >
              Home_Treats
            </span>
            <span className="block text-white/90 text-2xl md:text-3xl lg:text-4xl font-semibold mt-3 tracking-wide">
              Student Hostel
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.25)' }}
          >
            Your home away from home — providing{' '}
            <span className="text-purple-200 font-semibold">safe, comfortable and affordable</span>{' '}
            accommodation for students in the heart of Colombo.
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-4 mb-14">
            {[
              { label: 'Total Rooms', value: '50+' },
              { label: 'Student Capacity', value: '120+' },
              { label: 'Floors', value: '4' },
              { label: 'Years Running', value: '8+' },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl px-7 py-3 text-center shadow-lg hover:bg-white/40 transition-all duration-300"
              >
                <div className="text-2xl font-extrabold text-white drop-shadow">{s.value}</div>
                <div className="text-xs text-purple-100 mt-0.5 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              to="/rooms"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-purple-50 text-purple-700 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-105 shadow-xl shadow-purple-900/20 border border-purple-100"
            >
              View Available Rooms
              <FaArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/contact"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-600/90 hover:bg-purple-700 border border-white/30 text-white rounded-2xl font-bold text-base transition-all duration-300 hover:scale-105 backdrop-blur-sm shadow-lg"
            >
              Book a Room
              <FaArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center shadow-lg">
            <div className="w-1 h-3 bg-white/80 rounded-full mt-2" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          2. ABOUT THE HOSTEL
      ══════════════════════════════════════════════ */}
      <section className="py-28 bg-[#f5f3ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-600 text-sm font-medium px-4 py-2 rounded-full mb-6">
                <FaHome className="w-4 h-4" />
                About Our Hostel
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-7 leading-tight tracking-tight">
                Your Home Away From{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-500">
                  Home
                </span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6 font-medium">
                Home_Treats is a modern student hostel located in the heart of Colombo, Sri Lanka. We provide
                a safe, comfortable and affordable living environment designed specifically for university
                students who need a supportive home base while they focus on their studies.
              </p>
              <p className="text-gray-500 text-base leading-relaxed mb-8">
                Our 4-floor building houses over 120 students across a range of room types — from private
                singles to budget-friendly shared rooms. With dedicated study areas, round-the-clock security,
                high-speed WiFi and a welcoming community atmosphere, Home_Treats is more than just a place
                to sleep — it is where your student life thrives.
              </p>

              {/* Building Details */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'Building Name', value: 'Home_Treats Hostel' },
                  { label: 'Total Rooms', value: '50+ Rooms' },
                  { label: 'Student Capacity', value: '120+ Students' },
                  { label: 'Location', value: 'Colombo, Sri Lanka' },
                  { label: 'Floors', value: '4 Floors' },
                  { label: 'Established', value: '2016' },
                ].map((d) => (
                  <div key={d.label} className="bg-white rounded-2xl p-4 border border-purple-500/10 shadow-md hover:shadow-lg transition-shadow duration-200">
                    <div className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">{d.label}</div>
                    <div className="text-gray-800 font-semibold">{d.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <FaMapMarkerAlt className="w-4 h-4 text-purple-600 shrink-0" />
                No. 42, University Road, Colombo 07, Sri Lanka
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border border-purple-500/20 shadow-2xl shadow-purple-500/10">
                <img
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80"
                  alt="Home_Treats Hostel Building"
                  className="w-full h-[460px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent" />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm border border-purple-500/20 rounded-xl px-4 py-3 shadow-md">
                  <div className="flex items-center gap-2 text-purple-700 font-semibold text-sm">
                    <FaStar className="w-4 h-4 text-yellow-500" />
                    Rated #1 Student Hostel in the Area
                  </div>
                </div>
              </div>
              {/* Floating badge top-right */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-4 shadow-xl shadow-purple-500/30">
                <FaShieldAlt className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          3. HOSTEL FACILITIES
      ══════════════════════════════════════════════ */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-600 text-sm font-medium px-4 py-2 rounded-full mb-4">
              What We Provide
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-5 tracking-tight">
              Hostel{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-500">
                Facilities
              </span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
              Everything you need for a comfortable student life — all included within the hostel building.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((f, i) => (
              <div
                key={i}
                className="bg-[#f5f3ff] rounded-2xl border border-purple-500/10 p-8 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-white border border-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-600 shadow-md group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="text-gray-800 font-bold text-lg mb-2 tracking-wide">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          4. WHY CHOOSE OUR HOSTEL
      ══════════════════════════════════════════════ */}
      <section className="py-28 bg-[#f5f3ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-600 text-sm font-medium px-4 py-2 rounded-full mb-4">
              <FaStar className="w-4 h-4" />
              Why Students Choose Us
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-5 tracking-tight">
              Why Choose{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-500">
                Home_Treats?
              </span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
              Hundreds of students have made Home_Treats their home — here is why they love it.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-10">
            {whyChoose.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200/60 p-9 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group text-center hover:-translate-y-2"
              >
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300`}
                >
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-wide">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Trust stats bar */}
          <div className="mt-14 bg-white rounded-2xl border border-purple-500/15 p-8 shadow-md">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: '120+', label: 'Students Currently Living' },
                { value: '8+', label: 'Years of Operation' },
                { value: '4.8★', label: 'Average Student Rating' },
                { value: '50+', label: 'Rooms Available' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-extrabold text-purple-600 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          5. BUILDING GALLERY
      ══════════════════════════════════════════════ */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-600 text-sm font-medium px-4 py-2 rounded-full mb-4">
              Photo Gallery
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-5 tracking-tight">
              Inside Our{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-500">
                Hostel Building
              </span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto font-medium">
              Take a virtual tour of our facilities — from the exterior to every comfort inside.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 auto-rows-[220px]">
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-2xl group cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300 ${img.span}`}
              >
                <img
                  src={img.url}
                  alt={img.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 text-white font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 drop-shadow-lg">
                  <FaCheckCircle className="w-4 h-4 text-purple-300" />
                  {img.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          6. TESTIMONIALS
      ══════════════════════════════════════════════ */}
      <section className="py-28 bg-[#f5f3ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-600 text-sm font-medium px-4 py-2 rounded-full mb-4">
              <FaHeart className="w-4 h-4" />
              Student Reviews
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-5 tracking-tight">
              What Our Students{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-500">
                Say
              </span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto font-medium">
              Hear directly from students who call Home_Treats their home.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200/60 p-8 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group hover:-translate-y-1 flex flex-col"
              >
                {/* Quote icon */}
                <div className="mb-5">
                  <FaQuoteLeft className="w-8 h-8 text-purple-200 group-hover:text-purple-300 transition-colors duration-300" />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <FaStar
                      key={si}
                      className={`w-4 h-4 ${si < t.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>

                {/* Review text */}
                <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-6 font-medium">"{t.review}"</p>

                {/* Student info */}
                <div className="flex items-center gap-3 pt-4 border-t border-purple-500/10">
                  <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shadow-purple-500/20">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-gray-900 font-semibold text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{t.course}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          7. CALL TO ACTION
      ══════════════════════════════════════════════ */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative bg-gradient-to-br from-purple-600 via-purple-650 to-violet-700 rounded-3xl overflow-hidden shadow-2xl">
            {/* Decorative blobs */}
            <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/5 rounded-full pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-52 h-52 bg-white/5 rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 px-8 md:px-16 py-20 md:py-24 text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
                <FaBed className="w-4 h-4" />
                Rooms Available Now
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 drop-shadow-xl tracking-tight">
                Ready to Find Your Room?
              </h2>
              <p className="text-purple-100 text-lg max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                Explore our available room types, check pricing and contact the hostel management to secure your spot today.
              </p>

              {/* Contact details */}
              <div className="flex flex-wrap justify-center gap-5 mb-12">
                {[
                  { icon: <FaPhone className="w-4 h-4" />, text: '+94 11 234 5678' },
                  { icon: <FaEnvelope className="w-4 h-4" />, text: 'info@hometreats.lk' },
                  { icon: <FaMapMarkerAlt className="w-4 h-4" />, text: 'Colombo 07, Sri Lanka' },
                ].map((c) => (
                  <div
                    key={c.text}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/20 text-white text-sm px-5 py-2.5 rounded-xl transition-all duration-200 backdrop-blur-sm shadow"
                  >
                    {c.icon}
                    {c.text}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Link
                  to="/rooms"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-purple-700 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-105 shadow-xl shadow-purple-900/20 border border-purple-100"
                >
                  <FaBed className="w-5 h-5" />
                  View Available Rooms
                  <FaArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-2xl font-bold text-base transition-all duration-300 hover:scale-105 backdrop-blur-sm shadow"
                >
                  <FaEnvelope className="w-5 h-5" />
                  Send a Booking Request
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
