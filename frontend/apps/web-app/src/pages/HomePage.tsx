import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initTheme } from '../utils/theme';
import ThemeToggle from '../components/ThemeToggle';
import {
  UserIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  VideoCameraIcon,
  BeakerIcon,
  HeartIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CheckBadgeIcon,
  StarIcon,
  ArrowRightIcon,
  PhoneIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginType, setLoginType] = useState<'patient' | 'doctor' | 'hospital' | 'admin' | null>(null);

  useEffect(() => {
    initTheme();
  }, []);

  const handleLoginClick = (type: 'patient' | 'doctor' | 'hospital' | 'admin') => {
    setLoginType(type);
    setShowLoginModal(true);
  };

  const handleLoginNavigation = (type: 'patient' | 'doctor' | 'hospital' | 'admin') => {
    if (type === 'admin') {
      navigate('/admin/login');
    } else {
      navigate('/admin/login');
    }
  };

  const services = [
    {
      icon: VideoCameraIcon,
      title: 'Online Doctor Consultation',
      description: 'Video consultations with verified doctors across 50+ specialties. Get instant prescriptions and follow-up care.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: BeakerIcon,
      title: 'Lab Tests at Home',
      description: 'Book lab tests with home sample collection, digital reports, and expert analysis. 100+ test options available.',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: HeartIcon,
      title: 'Healthcare Plans',
      description: 'Comprehensive health packages for preventive care, monthly subscriptions, and wellness monitoring.',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: ClipboardDocumentCheckIcon,
      title: 'Health Records',
      description: 'Digital health records management, medical history tracking, and seamless record sharing.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      icon: UserGroupIcon,
      title: 'Nursing & Care Services',
      description: 'Professional nurses, caretakers, and wardboys for home care, post-surgery support, and elderly care.',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop',
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      icon: BuildingOfficeIcon,
      title: 'Hospital Management',
      description: 'Complete hospital and clinic management solutions with appointment scheduling and patient management.',
      image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&h=400&fit=crop',
      gradient: 'from-indigo-500 to-blue-500',
    },
  ];

  const specialties = [
    'General Physician', 'Cardiology', 'Dermatology', 'Pediatrics', 'Gynecology',
    'Orthopedics', 'Neurology', 'Psychiatry', 'ENT', 'Ophthalmology',
    'Gastroenterology', 'Urology', 'Oncology', 'Endocrinology', 'Pulmonology',
    'Nephrology', 'Rheumatology', 'Hematology', 'Infectious Diseases', 'Emergency Medicine',
  ];

  const stats = [
    { number: '500+', label: 'Top Doctors', icon: '👨‍⚕️' },
    { number: '50+', label: 'Specialties', icon: '🏥' },
    { number: '100K+', label: 'Consultations', icon: '💬' },
    { number: '4.8', label: 'Rating', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏥</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">VirtualDoc</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#services" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Services</a>
              <a href="#specialties" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Specialties</a>
              <a href="#care" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Care Services</a>
              <ThemeToggle />
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-5 py-2.5 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => handleLoginClick('patient')}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Sign Up
              </button>
            </div>
            <div className="md:hidden">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 dark:from-blue-900 dark:via-cyan-800 dark:to-teal-800 text-white py-24 sm:py-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                <SparklesIcon className="w-4 h-4" />
                <span>Trusted by 100K+ Patients</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                Access Top, Experienced Doctors
                <span className="block bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-300 bg-clip-text text-transparent mt-2">
                  Within Minutes
                </span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Carefully selected specialists you can trust - available when you need them.
                Book appointments, consult online, get lab tests, and access complete healthcare services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleLoginClick('patient')}
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-50 transition-all hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <span>Book an Appointment</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
                <a
                  href="#services"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-all text-center"
                >
                  Explore Services
                </a>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-4xl mb-2">{stat.icon}</div>
                    <div className="text-3xl font-bold mb-1">{stat.number}</div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop&q=80" 
                  alt="Doctor Consultation"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/40 to-transparent"></div>
              </div>
              {/* Floating Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckBadgeIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">Verified Doctors</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">100% Trusted</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">24/7 Available</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Always Here</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Our Services</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive healthcare solutions designed to meet all your medical needs
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div
                  key={idx}
                  className="group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div 
                      className="absolute inset-0 opacity-80 group-hover:opacity-90 transition-opacity"
                      style={{
                        background: service.gradient === 'from-blue-500 to-cyan-500' ? 'linear-gradient(to bottom right, rgb(59 130 246), rgb(6 182 212))' :
                                   service.gradient === 'from-emerald-500 to-teal-500' ? 'linear-gradient(to bottom right, rgb(16 185 129), rgb(20 184 166))' :
                                   service.gradient === 'from-pink-500 to-rose-500' ? 'linear-gradient(to bottom right, rgb(236 72 153), rgb(244 63 94))' :
                                   service.gradient === 'from-purple-500 to-indigo-500' ? 'linear-gradient(to bottom right, rgb(168 85 247), rgb(99 102 241))' :
                                   service.gradient === 'from-orange-500 to-amber-500' ? 'linear-gradient(to bottom right, rgb(249 115 22), rgb(245 158 11))' :
                                   'linear-gradient(to bottom right, rgb(99 102 241), rgb(59 130 246))'
                      }}
                    ></div>
                    <div className="absolute top-4 right-4">
                      <div className={`w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{service.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{service.description}</p>
                    <a href="#" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:gap-3 transition-all group/link">
                      Learn More <ArrowRightIcon className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section id="specialties" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Our Specialties</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Book online consultation with top doctors across 50+ medical specialties
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {specialties.map((specialty, idx) => (
              <a
                key={idx}
                href="#"
                className="group p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl hover:shadow-lg transition-all border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium transition-colors">{specialty}</span>
                  <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all" />
                </div>
              </a>
            ))}
          </div>
          <div className="text-center mt-12">
            <a href="#" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg">
              View All Specialties <ArrowRightIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Care Services Section */}
      <section id="care" className="py-24 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-800 dark:via-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Professional Care Services</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get professional healthcare support at home with our trained care providers
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Professional Nurses',
                description: 'Experienced registered nurses for post-surgery care, medication management, wound care, and medical monitoring at home.',
                features: ['24/7 availability', 'Post-surgery care', 'Medication management', 'Health monitoring'],
                image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=400&fit=crop&q=80',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                title: 'Caretakers',
                description: 'Compassionate caretakers for elderly care, chronic illness support, daily assistance, and companionship.',
                features: ['Elderly care', 'Daily assistance', 'Companionship', 'Personal care'],
                image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop&q=80',
                gradient: 'from-emerald-500 to-teal-500',
              },
              {
                title: 'Wardboys',
                description: 'Trained wardboys for hospital assistance, patient support, mobility assistance, and basic medical care.',
                features: ['Patient support', 'Mobility assistance', 'Hospital assistance', 'Basic care'],
                image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop&q=80',
                gradient: 'from-orange-500 to-amber-500',
              },
            ].map((service, idx) => (
              <div
                key={idx}
                className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all border border-gray-200 dark:border-gray-700 transform hover:-translate-y-2"
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div 
                    className="absolute inset-0 opacity-60 group-hover:opacity-70 transition-opacity"
                    style={{
                      background: service.gradient === 'from-blue-500 to-cyan-500' ? 'linear-gradient(to bottom right, rgb(59 130 246), rgb(6 182 212))' :
                                   service.gradient === 'from-emerald-500 to-teal-500' ? 'linear-gradient(to bottom right, rgb(16 185 129), rgb(20 184 166))' :
                                   'linear-gradient(to bottom right, rgb(249 115 22), rgb(245 158 11))'
                    }}
                  ></div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{service.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{service.description}</p>
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <div className="w-5 h-5 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg transform hover:-translate-y-0.5">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Why Choose VirtualDoc?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Trusted by thousands of patients and hundreds of doctors for reliable, accessible healthcare
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: CheckBadgeIcon, title: 'Verified Doctors', desc: 'All doctors are verified and experienced professionals', bgGradient: 'from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20', iconColor: 'text-blue-600 dark:text-blue-400' },
              { icon: ShieldCheckIcon, title: 'HIPAA Certified', desc: '100% data security with enterprise-grade encryption', bgGradient: 'from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20', iconColor: 'text-green-600 dark:text-green-400' },
              { icon: ClockIcon, title: '24/7 Availability', desc: 'Access healthcare services anytime, anywhere', bgGradient: 'from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20', iconColor: 'text-purple-600 dark:text-purple-400' },
              { icon: StarIcon, title: 'Top Rated', desc: '4.8+ rating from thousands of satisfied patients', bgGradient: 'from-amber-100 to-amber-200 dark:from-amber-900/20 dark:to-amber-800/20', iconColor: 'text-amber-600 dark:text-amber-400' },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="text-center p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl hover:shadow-xl transition-all border border-gray-200 dark:border-gray-600 transform hover:-translate-y-1">
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.bgGradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-10 h-10 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">What Our Patients Say</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">4.8 rating by patients across 950+ cities</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Priya Sharma', rating: 5, text: 'Amazing experience with VirtualDoc! The online consultation was seamless and the doctor was very professional. Highly recommend!', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80' },
              { name: 'Rohit Kumar', rating: 5, text: 'Quick and efficient service. The lab test booking was hassle-free and results were delivered on time. Great platform!', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80' },
              { name: 'Sneha Patel', rating: 5, text: 'Wonderful experience! The doctor was very patient and explained everything clearly. The follow-up care was excellent too.', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80' },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Patient</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Login/Signup Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {loginType ? `Login as ${loginType.charAt(0).toUpperCase() + loginType.slice(1)}` : 'Choose Your Account Type'}
                </h2>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginType(null);
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {!loginType ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { type: 'patient', icon: UserIcon, title: 'Patient', desc: 'Book appointments, consult doctors, access health records', gradient: 'from-blue-500 to-cyan-500' },
                    { type: 'doctor', icon: UserGroupIcon, title: 'Doctor', desc: 'Manage appointments, consultations, and patient records', gradient: 'from-emerald-500 to-teal-500' },
                    { type: 'hospital', icon: BuildingOfficeIcon, title: 'Hospital/Clinic', desc: 'Complete hospital management and operations', gradient: 'from-purple-500 to-indigo-500' },
                    { type: 'admin', icon: ShieldCheckIcon, title: 'Admin', desc: 'Platform administration and management', gradient: 'from-orange-500 to-amber-500' },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.type}
                        onClick={() => handleLoginClick(option.type as any)}
                        className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-transparent hover:shadow-xl transition-all text-left group hover:scale-105 transition-transform"
                        style={{
                          background: option.gradient === 'from-blue-500 to-cyan-500' ? 'linear-gradient(to bottom right, rgb(59 130 246), rgb(6 182 212))' :
                                       option.gradient === 'from-emerald-500 to-teal-500' ? 'linear-gradient(to bottom right, rgb(16 185 129), rgb(20 184 166))' :
                                       option.gradient === 'from-purple-500 to-indigo-500' ? 'linear-gradient(to bottom right, rgb(168 85 247), rgb(99 102 241))' :
                                       'linear-gradient(to bottom right, rgb(249 115 22), rgb(245 158 11))'
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2 text-white">{option.title}</h3>
                            <p className="text-white/90 text-sm">{option.desc}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      {loginType === 'patient' && 'Login to book appointments and access your health records'}
                      {loginType === 'doctor' && 'Login to manage your practice and consultations'}
                      {loginType === 'hospital' && 'Login to manage your hospital operations'}
                      {loginType === 'admin' && 'Login to access admin dashboard'}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleLoginNavigation(loginType)}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => handleLoginNavigation(loginType)}
                      className="flex-1 px-6 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-xl font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 dark:from-blue-900 dark:via-cyan-800 dark:to-teal-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl font-bold mb-4">Ready to Experience Better Healthcare?</h2>
          <p className="text-xl mb-10 text-white/90">
            Join thousands of satisfied patients and healthcare providers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleLoginClick('patient')}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-50 transition-all hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <span>Get Started Now</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
            <a
              href="#contact"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-all"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🏥</span>
                </div>
                <span className="text-2xl font-bold">VirtualDoc</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Revolutionizing healthcare through technology. Access quality healthcare anytime, anywhere.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <PhoneIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">24/7 Support</span>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg">For Patients</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Book Appointment</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Online Consultation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Lab Tests</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Health Records</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Care Services</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg">For Healthcare Providers</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><button onClick={() => handleLoginClick('doctor')} className="hover:text-white transition-colors">Doctor Login</button></li>
                <li><button onClick={() => handleLoginClick('hospital')} className="hover:text-white transition-colors">Hospital Login</button></li>
                <li><button onClick={() => handleLoginClick('admin')} className="hover:text-white transition-colors">Admin Login</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Partner With Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Join as Doctor</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">&copy; 2024 VirtualDoc. All rights reserved.</p>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <ShieldCheckIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">HIPAA & ISO 27001 Certified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
