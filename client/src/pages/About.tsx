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
      color: 'from-primary to-primary-hover',
      bg: 'bg-primary/10',
    },
    {
      icon: <FaBook className="w-7 h-7" />,
      title: 'Study Area',
      description:
        'Quiet, air-conditioned study rooms equipped with desks, power outlets, and bookshelves.',
      color: 'from-primary to-primary-hover',
      bg: 'bg-primary/10',
    },
    {
      icon: <FaShieldAlt className="w-7 h-7" />,
      title: '24/7 Security',
      description:
        'CCTV surveillance, biometric access, and professional security personnel around the clock.',
      color: 'from-primary to-primary-hover',
      bg: 'bg-primary/10',
    },
    {
      icon: <FaTshirt className="w-7 h-7" />,
      title: 'Laundry Service',
      description:
        'On-site laundry facilities with washing machines and dryers available for all residents.',
      color: 'from-primary to-primary-hover',
      bg: 'bg-primary/10',
    },
    {
      icon: <FaParking className="w-7 h-7" />,
      title: 'Parking Area',
      description:
        'Covered parking facilities for vehicles and secure bicycle storage for eco-friendly commuters.',
      color: 'from-primary to-primary-hover',
      bg: 'bg-primary/10',
    },
    {
      icon: <FaUtensils className="w-7 h-7" />,
      title: 'Cafeteria',
      description:
        'Modern dining hall serving nutritious, hygienic meals with vegetarian and non-vegetarian options.',
      color: 'from-primary to-primary-hover',
      bg: 'bg-primary/10',
    },
  ];

  const stats = [
    { icon: <FaBed className="w-6 h-6" />, value: '200+', label: 'Rooms' },
    { icon: <FaUsers className="w-6 h-6" />, value: '500+', label: 'Students' },
    { icon: <FaAward className="w-6 h-6" />, value: '15+', label: 'Years' },
    { icon: <FaHeart className="w-6 h-6" />, value: '98%', label: 'Satisfaction' },
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
          <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-[#0f172a]/80 to-primary/60" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-slide-up">
            About <span className="text-primary">Home_Treats</span>
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
                className="bg-white border border-primary/15 rounded-xl shadow-md p-6 text-center hover-lift animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                  {stat.icon}
                </div>
                <div className="text-4xl font-extrabold text-primary leading-none">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-2 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Your Home Away <span className="text-primary">From Home</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Home_Treats is a premier student accommodation provider located in the heart of Sri Lanka.
              Since our establishment, we have been dedicated to offering safe, modern, and affordable
              living spaces that support students throughout their academic journey.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
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
                  <FaCheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-surface-active/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-muted-foreground mb-4">
              Our <span className="text-primary font-bold">Mission & Vision</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Mission */}
            <div className="card hover-lift border-l-4 border-l-green-500">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Our Mission</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To provide comfortable, safe, and affordable student accommodation that nurtures
                academic excellence and personal growth. We strive to create a supportive community
                where every resident feels at home, with access to modern amenities and a positive
                living environment that promotes learning and well-being.
              </p>
            </div>
            {/* Vision */}
            <div className="card hover-lift border-l-4 border-l-green-400">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Our Vision</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
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
              Premium <span className="text-primary">Facilities</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Everything you need for a comfortable and productive stay at Home_Treats
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((facility, i) => (
              <div
                key={i}
                className="bg-surface-active backdrop-blur-sm border border-primary/10 rounded-2xl p-8 hover-lift animate-fade-in group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className={`w-16 h-16 ${facility.bg} border border-primary/20 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300`}
                >
                  {facility.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{facility.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{facility.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-hover">
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
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-semibold transition-all duration-300 hover:bg-muted hover:scale-105 shadow-lg"
            >
              Explore Rooms
              <FaArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-surface-active text-primary border border-white/30 rounded-xl font-semibold transition-all duration-300 hover:bg-white/20 hover:scale-105 backdrop-blur-sm"
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
