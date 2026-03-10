/**
 * Rooms Page – Home_Treats
 * Hostel Building Information Page
 * Full redesign: hero → overview → gallery → room types → facilities →
 * bathrooms → water → rules → contact
 */

import { Link } from 'react-router-dom';
import {
  FaBed,
  FaUsers,
  FaMapMarkerAlt,
  FaArrowRight,
  FaCheckCircle,
  FaWifi,
  FaDoorOpen,
  FaBath,
  FaBuilding,
  FaShieldAlt,
  FaTshirt,
  FaBolt,
  FaWater,
  FaTint,
  FaDatabase,
  FaBan,
  FaClock,
  FaVolumeMute,
  FaClipboardList,
  FaPhone,
  FaEnvelope,
  FaStar,
  FaCamera,
  FaBook,
  FaChair,
  FaLayerGroup,
} from 'react-icons/fa';

/* ─────────────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────────────── */

const buildingStats = [
  { icon: <FaBuilding className="w-5 h-5" />,   label: 'Hostel Name',            value: 'Home_Treats Student Hostel' },
  { icon: <FaLayerGroup className="w-5 h-5" />, label: 'Building Type',          value: 'Student Accommodation' },
  { icon: <FaLayerGroup className="w-5 h-5" />, label: 'Total Floors',           value: '4' },
  { icon: <FaBed className="w-5 h-5" />,       label: 'Rooms per Floor',        value: '10' },
  { icon: <FaBed className="w-5 h-5" />,       label: 'Total Rooms',            value: '40' },
  { icon: <FaUsers className="w-5 h-5" />,     label: 'Students per Room',      value: '4' },
  { icon: <FaUsers className="w-5 h-5" />,     label: 'Total Student Capacity', value: '160' },
  { icon: <FaArrowRight className="w-5 h-5" />, label: 'Lifts',                value: '2 Passenger Lifts' },
];

const roomTypes = [
  {
    floor: 1,
    title: 'First Floor – Student Room',
    price: 'LKR 5500',
    period: '/ student / month',
    capacity: '4 Students',
    bedsPerRoom: '4 Beds',
    roomsOnFloor: '10 Rooms',
    studentsOnFloor: '40 Students',
    availableBeds: '6 Beds Available',
    image: 'https://images.unsplash.com/photo-1616594039964-3fdbf2b9b1aa?w=700&q=80',
    description: 'Standard shared student room with practical furniture and a study-friendly environment.',
  },
  {
    floor: 2,
    title: 'Second Floor – Student Room',
    price: 'LKR 5500',
    period: '/ student / month',
    capacity: '4 Students',
    bedsPerRoom: '4 Beds',
    roomsOnFloor: '10 Rooms',
    studentsOnFloor: '40 Students',
    availableBeds: '10 Beds Available',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&q=80',
    description: 'Simple hostel room setup with equal facilities for all students on the floor.',
  },
  {
    floor: 3,
    title: 'Third Floor – Student Room',
    price: 'LKR 5500',
    period: '/ student / month',
    capacity: '4 Students',
    bedsPerRoom: '4 Beds',
    roomsOnFloor: '10 Rooms',
    studentsOnFloor: '40 Students',
    availableBeds: '8 Beds Available',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=80',
    description: 'Comfortable student accommodation focused on fairness, simplicity and daily convenience.',
  },
  {
    floor: 4,
    title: 'Fourth Floor – Student Room',
    price: 'LKR 5500',
    period: '/ student / month',
    capacity: '4 Students',
    bedsPerRoom: '4 Beds',
    roomsOnFloor: '10 Rooms',
    studentsOnFloor: '40 Students',
    availableBeds: '9 Beds Available',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&q=80',
    description: 'Shared student room with standard facilities and access to all common hostel services.',
  },
];

const commonRoomFacilities = [
  { icon: <FaBed className="w-4 h-4" />, label: 'Single Bed' },
  { icon: <FaCheckCircle className="w-4 h-4" />, label: 'Mattress' },
  { icon: <FaBook className="w-4 h-4" />, label: 'Study Table' },
  { icon: <FaChair className="w-4 h-4" />, label: 'Chair' },
  { icon: <FaDoorOpen className="w-4 h-4" />, label: 'Wardrobe' },
  { icon: <FaWifi className="w-4 h-4" />, label: 'WiFi Access' },
  { icon: <FaBolt className="w-4 h-4" />, label: 'Electricity Supply' },
];

const sharedServices = [
  { icon: <FaWater className="w-4 h-4" />, label: 'Reliable Water Supply' },
  { icon: <FaBath className="w-4 h-4" />, label: 'Shared Bathrooms' },
  { icon: <FaTshirt className="w-4 h-4" />, label: 'Laundry Area' },
  { icon: <FaBook className="w-4 h-4" />, label: 'Study Area' },
  { icon: <FaShieldAlt className="w-4 h-4" />, label: 'Security System' },
  { icon: <FaArrowRight className="w-4 h-4" />, label: '2 Passenger Lifts' },
];

const galleryImages = [
  { url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=80',  label: 'Building Exterior',    span: 'col-span-2 row-span-2' },
  { url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80', label: 'Room Interior',        span: '' },
  { url: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=600&q=80', label: 'Study Area',           span: '' },
  { url: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80', label: 'Dining Area',          span: '' },
  { url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&q=80', label: 'Common Area',          span: '' },
  { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80', label: 'Bathroom Facilities',  span: '' },
];

const facilities = [
  { icon: <FaBed className="w-6 h-6" />,      title: 'Single Bed',         desc: 'One single bed is provided for each student.' },
  { icon: <FaCheckCircle className="w-6 h-6" />, title: 'Mattress',      desc: 'Comfortable mattress included with every bed.' },
  { icon: <FaBook className="w-6 h-6" />,     title: 'Study Table',        desc: 'Dedicated study table for daily academic work.' },
  { icon: <FaChair className="w-6 h-6" />,    title: 'Chair',              desc: 'Personal chair provided for study and room use.' },
  { icon: <FaDoorOpen className="w-6 h-6" />, title: 'Wardrobe',           desc: 'Personal wardrobe/storage space for each student.' },
  { icon: <FaWifi className="w-6 h-6" />,     title: 'WiFi Access',        desc: 'Stable high-speed WiFi access in all rooms.' },
  { icon: <FaBolt className="w-6 h-6" />,     title: 'Electricity Supply', desc: 'Reliable electricity supply for all room essentials.' },
];

const hostelRules = [
  { icon: <FaCheckCircle className="w-5 h-5 text-purple-600" />, rule: 'Maintain cleanliness and hygiene in your room and all common areas at all times.' },
  { icon: <FaBan className="w-5 h-5 text-red-400" />,           rule: 'No smoking, alcohol, or illegal substances are permitted anywhere inside the hostel.' },
  { icon: <FaClock className="w-5 h-5 text-yellow-400" />,      rule: 'Visitors are allowed only during permitted visiting hours (8:00 AM – 8:00 PM). Overnight guests are strictly prohibited.' },
  { icon: <FaVolumeMute className="w-5 h-5 text-purple-600" />,  rule: 'Maintain a quiet and peaceful environment — especially during study hours (6:00 PM – 10:00 PM) and after lights-out.' },
  { icon: <FaClipboardList className="w-5 h-5 text-purple-600" />, rule: 'Follow all hostel management guidelines and report any issues or complaints to the warden promptly.' },
  { icon: <FaUsers className="w-5 h-5 text-purple-600" />,       rule: 'Do not allow unauthorised persons to occupy or stay overnight in your room.' },
  { icon: <FaBolt className="w-5 h-5 text-yellow-400" />,       rule: 'Switch off lights, fans and electrical appliances when leaving your room to conserve energy.' },
  { icon: <FaShieldAlt className="w-5 h-5 text-purple-600" />,   rule: 'Keep your room key or access card safe. Report any lost keys to hostel management immediately.' },
];

/* ─────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────── */
const Rooms = () => {
  return (
    <div className="min-h-screen bg-white">

      {/* ── 1. HERO ───────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&q=80')",
            filter: 'brightness(0.85)',
          }}
        >
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(rgba(124,58,237,0.35), rgba(124,58,237,0.25))' }}
          />
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/40 text-white text-sm font-medium px-5 py-2.5 rounded-full mb-8 shadow-lg">
            <FaBuilding className="w-4 h-4 text-purple-200" />
            Student Hostel Building — Jaffna, Sri Lanka
          </div>

          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}
          >
            Student Hostel Building
          </h1>

          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
            This modern student hostel building provides a{' '}
            <span className="font-semibold" style={{ color: '#7c3aed' }}>safe, comfortable, and affordable</span>{' '}
            living environment with all essential facilities required for student life.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { icon: <FaBed className="w-4 h-4" />, label: 'Total Rooms', value: '40' },
              { icon: <FaUsers className="w-4 h-4" />, label: 'Student Capacity', value: '160 Students' },
              { icon: <FaBuilding className="w-4 h-4" />, label: 'Floors', value: '4' },
              { icon: <FaArrowRight className="w-4 h-4" />, label: 'Lifts', value: '2' },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl shadow-md hover:bg-white/30 transition-all duration-300"
              >
                <span className="text-purple-200">{s.icon}</span>
                <div>
                  <div className="text-xs text-purple-100 leading-none">{s.label}</div>
                  <div className="text-sm font-bold">{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#room-types"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#7c3aed] hover:bg-purple-700 text-white rounded-xl font-bold text-base transition-all duration-300 hover:scale-105 shadow-xl shadow-purple-900/20"
            >
              View Room Types <FaArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <Link
              to="/student/book-room"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-purple-50 border border-purple-300 text-purple-700 rounded-xl font-bold text-base transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Book a Room <FaArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2" />
          </div>
        </div>
      </section>

      {/* ── 2. BUILDING OVERVIEW ─────────────────── */}
      <section className="py-24 bg-[#f5f3ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text side */}
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-600 text-sm font-medium px-4 py-2 rounded-full mb-6">
                <FaBuilding className="w-4 h-4" />
                Building Overview
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                Home_Treats <span className="text-purple-600">Student Hostel</span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Home_Treats is a purpose-built student accommodation building with 4 floors, 10 rooms per floor,
                and equal room facilities for every resident. Each room houses 4 students, giving a total capacity
                of 160 students, with 2 passenger lifts for easy access to all floors.
              </p>

              {/* Overview stat grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                {buildingStats.map((s) => (
                  <div
                    key={s.label}
                    className="bg-white rounded-xl p-4 border border-purple-500/10 hover:border-purple-500/30 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-600 mb-3 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      {s.icon}
                    </div>
                    <div className="text-xs text-gray-500 mb-0.5">{s.label}</div>
                    <div className="text-gray-800 font-semibold text-sm">{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 text-gray-500 text-sm">
                <FaMapMarkerAlt className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                No.11, Nallur, Jaffna 40000, Sri Lanka
              </div>
            </div>

            {/* Image side */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-purple-500/20 shadow-2xl shadow-purple-500/10">
                <img
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=80"
                  alt="Home_Treats Hostel Building"
                  className="w-full h-[440px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent rounded-2xl pointer-events-none" />
              </div>
              <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm border border-purple-500/20 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 text-purple-600 font-semibold text-sm">
                  <FaStar className="w-4 h-4" /> Rated #1 Student Hostel in Jaffna
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-purple-500 rounded-2xl p-4 shadow-lg shadow-purple-500/30">
                <FaShieldAlt className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FLOOR STRUCTURE ───────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-600 text-sm font-medium px-4 py-2 rounded-full mb-4">
              <FaLayerGroup className="w-4 h-4" /> Floor Structure
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Floor-by-Floor <span className="text-purple-600">Room Distribution</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Each floor has the same student accommodation model for fairness and consistency.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roomTypes.map((room) => (
              <div key={room.floor} className="bg-[#f5f3ff] border border-purple-500/15 rounded-2xl p-6 shadow-sm">
                <h3 className="text-gray-900 font-bold mb-4">{room.title.replace(' – Student Room', '')}</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li><span className="font-semibold text-purple-600">Number of Rooms:</span> {room.roomsOnFloor}</li>
                  <li><span className="font-semibold text-purple-600">Students per Room:</span> {room.capacity}</li>
                  <li><span className="font-semibold text-purple-600">Beds per Room:</span> {room.bedsPerRoom}</li>
                  <li><span className="font-semibold text-purple-600">Total Students on Floor:</span> {room.studentsOnFloor}</li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. ROOM DISPLAY ──────────────────────── */}
      <section id="room-types" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-600 text-sm font-medium px-4 py-2 rounded-full mb-4">
              <FaBuilding className="w-4 h-4" /> Rooms & Accommodation
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Standard Student <span className="text-purple-600">Room Display</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              All rooms provide the same facilities and monthly rent structure across all 4 floors.
            </p>
          </div>

          <div className="mb-8 bg-[#f5f3ff] border border-purple-500/20 rounded-2xl px-6 py-5 text-center">
            <div className="text-sm text-gray-600 mb-1">Monthly Rent per Student</div>
            <div className="text-3xl font-extrabold text-purple-600">LKR 5500 / student / month</div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roomTypes.map((room, i) => (
              <div
                key={i}
                className="bg-[#f5f3ff] rounded-2xl border border-gray-200/50 overflow-hidden hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group flex flex-col"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent" />
                  <div className="absolute top-3 right-3 border border-purple-500/30 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm bg-purple-500/20 text-purple-100">
                    Floor {room.floor}
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs text-gray-600 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-gray-200/50">
                    <FaUsers className="w-3 h-3 text-purple-600" />
                    Capacity: {room.capacity}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{room.title}</h3>
                  <div className="flex items-end gap-1 mb-3">
                    <span className="text-2xl font-extrabold text-purple-600">{room.price}</span>
                    <span className="text-gray-500 text-xs mb-0.5">{room.period}</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{room.description}</p>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="bg-white border border-purple-500/10 rounded-lg px-2.5 py-2 text-gray-700">
                      <span className="font-semibold text-purple-600">Room Capacity:</span> {room.capacity}
                    </div>
                    <div className="bg-white border border-purple-500/10 rounded-lg px-2.5 py-2 text-gray-700">
                      <span className="font-semibold text-purple-600">Number of Beds:</span> {room.bedsPerRoom}
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-purple-600 mb-2">Monthly Rent: LKR 5500 / student / month</div>
                  <div className="text-xs font-semibold text-purple-600 mb-3">{room.availableBeds}</div>

                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {commonRoomFacilities.map((facility) => (
                      <div key={facility.label} className="flex items-center gap-2 text-xs text-gray-600 bg-white rounded-lg px-2.5 py-2 border border-purple-500/10">
                        <span className="text-purple-600 shrink-0">{facility.icon}</span>
                        <span>{facility.label}</span>
                      </div>
                    ))}
                  </div>

                  <ul className="space-y-1.5 mb-5 flex-1">
                    {sharedServices.slice(0, 2).map((service) => (
                      <li key={service.label} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-purple-500 shrink-0">{service.icon}</span>
                        {service.label}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/student/book-room"
                    className="w-full inline-flex items-center justify-center gap-2 bg-purple-500/10 hover:bg-purple-500 border border-purple-500/30 hover:border-purple-500 text-purple-600 hover:text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-300"
                  >
                    Book a Room <FaArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-[#f5f3ff] border border-purple-500/15 rounded-2xl p-6">
            <h3 className="text-gray-900 font-bold text-lg mb-4">Shared Services for All Students</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sharedServices.map((service) => (
                <div key={service.label} className="flex items-center gap-2 bg-white border border-purple-500/10 rounded-xl px-3 py-2.5 text-sm text-gray-700">
                  <span className="text-purple-600">{service.icon}</span>
                  {service.label}
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-gray-600 text-sm mt-8">
            * All rooms are standard student hostel rooms with equal facilities across all floors.
          </p>
        </div>
      </section>

      {/* ── 4. FACILITIES & AMENITIES ────────────── */}
      <section className="py-24 bg-[#f5f3ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-600 text-sm font-medium px-4 py-2 rounded-full mb-4">
              What We Provide
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Facilities & <span className="text-purple-600">Amenities</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Every room and common area is equipped with essential facilities to ensure a comfortable and productive student life.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200/50 p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group flex gap-4"
              >
                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center shrink-0 text-purple-600 group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-500 transition-all duration-300">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-gray-800 font-semibold mb-1">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. BATHROOM FACILITIES ───────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative rounded-2xl overflow-hidden border border-purple-500/20 shadow-2xl order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=900&q=80"
                alt="Bathroom Facilities"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent pointer-events-none" />
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-600 text-sm font-medium px-4 py-2 rounded-full mb-6">
                <FaBath className="w-4 h-4" /> Bathroom Facilities
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                Clean & Well-Maintained <span className="text-purple-600">Bathrooms</span>
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                We maintain the highest standards of hygiene across all bathroom facilities so every student
                has access to a clean, functional bathroom at all times.
              </p>

              <div className="space-y-4">
                {[
                  { title: 'Shared Bathrooms on Every Floor', desc: 'Well-maintained shared bathrooms are available on each floor for all residents.' },
                  { title: 'Separate Male/Female Units',      desc: 'Bathrooms are arranged with separate male and female sections for student comfort.' },
                  { title: 'Continuous Clean Water',          desc: 'Clean water supply maintained to all bathrooms throughout the day and night.' },
                  { title: 'Daily Cleaning Service',          desc: 'Professional cleaning staff sanitise all bathrooms at least three times daily.' },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-4 bg-[#f5f3ff] rounded-xl p-4 border border-gray-200/50 hover:border-purple-500/20 transition-colors"
                  >
                    <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <FaBath className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-gray-800 font-semibold text-sm mb-1">{item.title}</div>
                      <div className="text-gray-500 text-sm leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. WATER SERVICES ────────────────────── */}
      <section className="py-24 bg-[#f5f3ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-600 text-sm font-medium px-4 py-2 rounded-full mb-4">
              <FaWater className="w-4 h-4" /> Water Services
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Reliable <span className="text-purple-600">Water Supply</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Clean, uninterrupted water supply guaranteed for all residents — 24 hours a day, every day of the year.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: <FaWater className="w-8 h-8" />,
                title: '24/7 Clean Water Supply',
                desc: 'Non-stop clean water to every room, bathroom and common area without interruption.',
                gradient: 'from-purple-500 to-purple-600',
              },
              {
                icon: <FaTint className="w-8 h-8" />,
                title: 'Purified Drinking Water',
                desc: 'RO-filtered drinking water dispensers on every floor, free of charge for all residents.',
                gradient: 'from-purple-500 to-purple-600',
              },
              {
                icon: <FaDatabase className="w-8 h-8" />,
                title: 'Backup Water Storage',
                desc: 'Rooftop water storage tanks ensure supply continues even during municipal interruptions.',
                gradient: 'from-purple-500 to-purple-600',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-2xl border border-gray-200/50 p-8 text-center hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{card.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. HOSTEL RULES ──────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-600 text-sm font-medium px-4 py-2 rounded-full mb-6">
                <FaClipboardList className="w-4 h-4" /> Hostel Rules
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                Rules & <span className="text-purple-600">Guidelines</span>
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                All residents must follow these rules to maintain a safe, clean and peaceful living environment.
                Violations are subject to disciplinary action by hostel management.
              </p>
              <ul className="space-y-3">
                {hostelRules.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 bg-[#f5f3ff] rounded-xl p-4 border border-gray-200/50 hover:border-purple-500/20 transition-colors"
                  >
                    <span className="shrink-0 mt-0.5">{r.icon}</span>
                    <span className="text-gray-600 text-sm leading-relaxed">{r.rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6 lg:pt-24">
              <div className="rounded-2xl overflow-hidden border border-purple-500/20 shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800&q=80"
                  alt="Common Study Area"
                  className="w-full h-56 object-cover"
                />
              </div>
              <div className="bg-[#f5f3ff] rounded-2xl border border-purple-500/20 p-6">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <FaShieldAlt className="w-5 h-5 text-purple-600" /> Report an Issue
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  For rule violations, maintenance issues or emergencies, contact the hostel warden directly.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-gray-600 text-sm">
                    <FaPhone className="w-4 h-4 text-purple-600 shrink-0" />
                    +94 21 222 3456 (Warden — 24/7)
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 text-sm">
                    <FaEnvelope className="w-4 h-4 text-purple-600 shrink-0" />
                    warden@hometreats.lk
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. IMAGE GALLERY ─────────────────────── */}
      <section className="py-24 bg-[#f5f3ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-600 text-sm font-medium px-4 py-2 rounded-full mb-4">
              <FaCamera className="w-4 h-4" /> Photo Gallery
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Hostel <span className="text-purple-600">Gallery</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Take a visual tour of the building — from its exterior to every well-maintained space inside.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[220px]">
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-2xl group cursor-pointer ${img.span}`}
              >
                <img
                  src={img.url}
                  alt={img.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 text-gray-800 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                  <FaCheckCircle className="w-4 h-4 text-purple-600" />
                  {img.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. CONTACT & BOOKING ─────────────────── */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-600 text-sm font-medium px-4 py-2 rounded-full mb-4">
              <FaBed className="w-4 h-4" /> Rooms Available Now
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Book Your <span className="text-purple-600">Stay</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Contact us directly for room booking assistance. Our team will respond within 24 hours.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-purple-500/15 p-8 shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
              <h3 className="text-gray-800 font-bold text-xl mb-6">Hostel Contact Details</h3>
              <div className="space-y-5">
                {[
                  { icon: <FaPhone className="w-5 h-5" />, label: 'Phone', value: '+94 21 222 3456' },
                  { icon: <FaEnvelope className="w-5 h-5" />, label: 'Email', value: 'info@hometreats.lk' },
                  { icon: <FaMapMarkerAlt className="w-5 h-5" />, label: 'Address', value: 'No.11, Nallur\nJaffna, 40000\nSri Lanka' },
                ].map((c) => (
                  <div key={c.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 border border-purple-200 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                      {c.icon}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">{c.label}</div>
                      {c.label === 'Email' ? (
                        <a href="mailto:info@hometreats.lk" className="text-gray-700 font-medium hover:text-purple-600 transition-colors duration-200">
                          {c.value}
                        </a>
                      ) : c.label === 'Address' ? (
                        <div className="text-gray-700 font-medium whitespace-pre-line">{c.value}</div>
                      ) : (
                        <div className="text-gray-700 font-medium">{c.value}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#f5f3ff] rounded-2xl border border-gray-200/50 p-6">
              <h4 className="text-gray-800 font-semibold mb-4">Quick Booking</h4>
              <p className="text-gray-500 text-sm mb-5">
                Already know what you need? Use the main contact page or call us directly.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/20"
              >
                <FaEnvelope className="w-4 h-4" />
                Go to Full Contact Page
                <FaArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Rooms;
