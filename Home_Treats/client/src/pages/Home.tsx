/**
 * Modern Home Page - Hostel Booking Style
 * Professional layout with hero, rooms, facilities, and contact sections
 */

import { Link } from 'react-router-dom';
import { FaWifi, FaTshirt, FaShieldAlt, FaUtensils, FaBed, FaUsers, FaEnvelope, FaArrowRight, FaBath } from 'react-icons/fa';

const Home = () => {
  const rooms = [
    {
      id: 1,
      name: 'Single Room',
      price: 450,
      capacity: 1,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      features: ['Private Bathroom', 'Study Desk', 'WiFi']
    },
    {
      id: 2,
      name: 'Double Room',
      price: 320,
      capacity: 2,
      image: 'https://images.unsplash.com/photo-1522771739485-4b4b999b6d2?w=400',
      features: ['Shared Bathroom', '2 Study Desks', 'WiFi']
    },
    {
      id: 3,
      name: 'Shared Room',
      price: 280,
      capacity: 3,
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
      features: ['Shared Bathroom', '3 Study Desks', 'WiFi']
    }
  ];

  const facilities = [
    {
      icon: <FaWifi className="w-8 h-8 text-green-400" />,
      title: 'High Speed WiFi',
      description: 'Lightning-fast internet throughout the entire hostel'
    },
    {
      icon: <FaTshirt className="w-8 h-8 text-green-400" />,
      title: 'Laundry Service',
      description: 'Convenient on-site laundry facilities available 24/7'
    },
    {
      icon: <FaShieldAlt className="w-8 h-8 text-green-400" />,
      title: '24/7 Security',
      description: 'Professional security team ensuring your safety always'
    },
    {
      icon: <FaBed className="w-8 h-8 text-green-400" />,
      title: 'Study Area',
      description: 'Quiet, well-equipped study spaces for academic success'
    },
    {
      icon: <FaUtensils className="w-8 h-8 text-green-400" />,
      title: 'Cafeteria',
      description: 'Nutritious meals served daily in our modern dining hall'
    },
    {
      icon: <FaEnvelope className="w-8 h-8 text-green-400" />,
      title: 'Parking',
      description: 'Secure parking facilities available for residents'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-x-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/hostel-room.jpg')"
          }}
        >
          {/* Dark + Green gradient overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(rgba(0,0,0,0.75), rgba(22,163,74,0.55))' }}></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-slide-up" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            Comfortable Hostel Living
            <br />
            <span className="text-gradient-secondary">for Students</span>
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-12 max-w-4xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
            Affordable rooms with modern facilities
          </p>
          
          {/* Hero Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up" style={{animationDelay: '0.4s'}}>
            <Link
              to="/rooms"
              className="group relative px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-green-500/30"
            >
              <span className="flex items-center justify-center gap-2">
                Explore Rooms
                <FaArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              to="/contact"
              className="group px-8 py-4 bg-transparent border border-green-400/50 hover:bg-green-500/10 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-green-500/20 backdrop-blur-sm"
            >
              <span className="flex items-center justify-center gap-2">
                Contact Us
                <FaArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-green-400/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-green-400/60 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* About Hostel Section */}
      <section className="py-20 bg-[#111827]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              About <span className="text-green-400">Home_Treats</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Home_Treats provides safe, affordable, and comfortable accommodation for students. 
              We understand the needs of students and offer modern facilities with a focus on 
      education, comfort, and community living.
            </p>
          </div>
        </div>
      </section>

      {/* Room Showcase Section */}
      <section className="section bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Our <span className="text-gradient-primary">Room Types</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
              Choose from our variety of comfortable and affordable room options
            </p>
          </div>
          
          {/* Room Cards Grid */}
          <div className="grid-cards">
            {rooms.map((room, index) => (
              <div 
                key={room.id} 
                className="card hover-lift animate-fade-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Room Image */}
                <div className="relative h-56 overflow-hidden rounded-xl -mx-6 -mt-6 mb-0">
                  <img 
                    src={room.image} 
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-[#0f172a]/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-green-400 shadow-lg border border-green-500/20">
                    <div className="flex items-center gap-1">
                      <FaUsers className="w-3 h-3" />
                      {room.capacity} Person{room.capacity > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                
                {/* Room Details */}
                <div className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{room.name}</h3>
                      <div className="flex items-center text-gray-400">
                        <FaBed className="w-4 h-4 mr-2" />
                        <span className="text-sm">{room.capacity} Bed{room.capacity > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">${room.price}</div>
                      <div className="text-sm text-gray-500">/month</div>
                    </div>
                  </div>
                  
                  {/* Facilities Icons */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-3">
                      {room.features.map((feature, featureIndex) => (
                        <div 
                          key={featureIndex} 
                          className="flex items-center text-sm text-gray-300 bg-white/5 px-3 py-2 rounded-lg border border-green-500/10"
                        >
                          {feature.includes('WiFi') && <FaWifi className="w-4 h-4 mr-2 text-green-400" />}
                          {feature.includes('Bathroom') && <FaBath className="w-4 h-4 mr-2 text-green-400" />}
                          {feature.includes('Desk') && <FaBed className="w-4 h-4 mr-2 text-green-400" />}
                          <span className="text-xs font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Book Button */}
                  <button className="btn btn-primary w-full flex items-center justify-center gap-2">
                    <span>Book Now</span>
                    <FaArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="section bg-[#111827]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Premium <span className="text-gradient-secondary">Facilities</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need for a comfortable and productive stay
            </p>
          </div>
          
          {/* Facilities Grid */}
          <div className="grid-features">
            {facilities.map((facility, index) => (
              <div 
                key={index} 
                className="card hover-lift animate-fade-in text-center"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Icon Container */}
                <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300 group-hover:scale-110">
                  <div className="p-4">
                    {facility.icon}
                  </div>
                </div>
                
                {/* Facility Content */}
                <h3 className="text-xl font-bold text-white mb-3">{facility.title}</h3>
                <p className="text-gray-400 leading-relaxed">{facility.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Book Your Stay?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Get in touch with us to find the perfect accommodation for your needs
          </p>
          
          <Link
            to="/contact"
            className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-100 text-green-700 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <FaEnvelope className="w-5 h-5 mr-2" />
            Contact Us
            <FaArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
