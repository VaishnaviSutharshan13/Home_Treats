/**
 * About Page - Home_Treats
 * Professional layout with mission, vision, facilities, and hostel images
 */

import { Link } from 'react-router-dom';
import {
  FaWifi,
  FaBook,
  FaShieldAlt,
  FaTshirt,
  FaParking,
  FaUtensils,
  FaArrowRight,
  FaCheckCircle,
  FaUsers,
  FaBed,
  FaAward,
  FaHeart,
} from 'react-icons/fa';

const About = () => {
  const facilities = [
    {
      icon: <FaWifi className="w-7 h-7" />,
      title: 'High-Speed WiFi',
      description:
        'Stay connected with blazing-fast internet throughout the entire hostel, perfect for study and streaming.',
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-500/10',
    },
    {
      icon: <FaBook className="w-7 h-7" />,
      title: 'Study Area',
      description:
        'Quiet, air-conditioned study rooms equipped with desks, power outlets, and bookshelves.',
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-500/10',
    },
    {
      icon: <FaShieldAlt className="w-7 h-7" />,
      title: '24/7 Security',
      description:
        'CCTV surveillance, biometric access, and professional security personnel around the clock.',
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-500/10',
    },
    {
      icon: <FaTshirt className="w-7 h-7" />,
      title: 'Laundry Service',
      description:
        'On-site laundry facilities with washing machines and dryers available for all residents.',
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-500/10',
    },
    {
      icon: <FaParking className="w-7 h-7" />,
      title: 'Parking Area',
      description:
        'Covered parking facilities for vehicles and secure bicycle storage for eco-friendly commuters.',
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-500/10',
    },
    {
      icon: <FaUtensils className="w-7 h-7" />,
      title: 'Cafeteria',
      description:
        'Modern dining hall serving nutritious, hygienic meals with vegetarian and non-vegetarian options.',
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-500/10',
    },
  ];

  const stats = [
    { icon: <FaBed className="w-6 h-6" />, value: '200+', label: 'Rooms' },
    { icon: <FaUsers className="w-6 h-6" />, value: '500+', label: 'Students' },
    { icon: <FaAward className="w-6 h-6" />, value: '15+', label: 'Years' },
    { icon: <FaHeart className="w-6 h-6" />, value: '98%', label: 'Satisfaction' },
  ];

  const hostelImages = [
    {
      src: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600',
      alt: 'Modern hostel lobby',
      caption: 'Welcoming Reception Area',
    },
    {
      src: 'https://images.unsplash.com/photo-1522771739485-4b4b999b6d2?w=600',
      alt: 'Study area',
      caption: 'Spacious Study Rooms',
    },
    {
      src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
      alt: 'Hostel exterior',
      caption: 'Beautiful Campus View',
    },
    {
      src: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600',
      alt: 'Common area',
      caption: 'Comfortable Common Areas',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1920')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-[#0f172a]/80 to-purple-900/60" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-slide-up">
            About <span className="text-purple-600">Home_Treats</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.15s' }}>
            Premium student accommodation designed for comfort, safety, and academic success in Sri Lanka.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative -mt-12 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white border border-purple-500/15 rounded-xl shadow-md p-6 text-center hover-lift animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-600">
                  {stat.icon}
                </div>
                <div className="text-4xl font-extrabold text-purple-600 leading-none">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-2 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Your Home Away <span className="text-purple-600">From Home</span>
              </h2>
              <p className="text-lg text-gray-500 mb-6 leading-relaxed">
                Home_Treats is a premier student accommodation provider located in the heart of Sri Lanka.
                Since our establishment, we have been dedicated to offering safe, modern, and affordable
                living spaces that support students throughout their academic journey.
              </p>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                Our hostel combines the warmth of home with world-class amenities, creating an environment
                where students can focus on their studies while enjoying a vibrant community life. We believe
                that comfortable living leads to better academic performance.
              </p>
              <div className="space-y-3">
                {[
                  'Affordable pricing starting from LKR 4,000/month',
                  'Safe and secure environment with 24/7 staff',
                  'Modern facilities with regular maintenance',
                  'Friendly community atmosphere',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <FaCheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {hostelImages.map((img, i) => (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-2xl shadow-lg group border border-purple-500/10 ${
                    i === 0 ? 'row-span-2' : ''
                  }`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                      i === 0 ? 'h-full' : 'h-48'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <span className="text-white text-sm font-medium p-4">{img.caption}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-[#f5f3ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-600 mb-4">
              Our <span className="text-purple-600 font-bold">Mission & Vision</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Mission */}
            <div className="card hover-lift border-l-4 border-l-green-500">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-600">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Our Mission</h3>
              </div>
              <p className="text-gray-500 leading-relaxed">
                To provide comfortable, safe, and affordable student accommodation that nurtures
                academic excellence and personal growth. We strive to create a supportive community
                where every resident feels at home, with access to modern amenities and a positive
                living environment that promotes learning and well-being.
              </p>
            </div>
            {/* Vision */}
            <div className="card hover-lift border-l-4 border-l-green-400">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-600">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Our Vision</h3>
              </div>
              <p className="text-gray-500 leading-relaxed">
                To become Sri Lanka's most trusted and innovative student accommodation provider,
                setting the benchmark for quality hostel living. We envision a future where every student
                has access to premium living spaces that inspire success, foster meaningful connections,
                and contribute to a thriving educational ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Premium <span className="text-purple-600">Facilities</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">
              Everything you need for a comfortable and productive stay at Home_Treats
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((facility, i) => (
              <div
                key={i}
                className="bg-purple-50 backdrop-blur-sm border border-purple-500/10 rounded-2xl p-8 hover-lift animate-fade-in group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className={`w-16 h-16 ${facility.bg} border border-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform duration-300`}
                >
                  {facility.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{facility.title}</h3>
                <p className="text-gray-500 leading-relaxed">{facility.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Join Home_Treats?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Explore our available rooms and find the perfect accommodation for your academic journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/rooms"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-purple-700 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-100 hover:scale-105 shadow-lg"
            >
              Explore Rooms
              <FaArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-50 text-purple-700 border border-white/30 rounded-xl font-semibold transition-all duration-300 hover:bg-white/20 hover:scale-105 backdrop-blur-sm"
            >
              Contact Us
              <FaArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
