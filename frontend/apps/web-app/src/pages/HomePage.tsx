import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initTheme } from '../utils/theme';
import ThemeToggle from '../components/ThemeToggle';

const HomePage: React.FC = () => {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🏥</span>
              <span className="text-xl font-bold text-primary dark:text-primary-400">VirtualDoc</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-400 font-medium transition-colors">Features</a>
              <a href="#about" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-400 font-medium transition-colors">About</a>
              <a href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-400 font-medium transition-colors">Contact</a>
              <ThemeToggle />
              <Link 
                to="/admin/login" 
                className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg font-semibold transition-all hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 dark:from-primary-800 dark:via-primary-700 dark:to-secondary-700 text-white py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Revolutionizing Healthcare with
                <span className="block bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                  Digital Innovation
                </span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                A comprehensive healthcare platform connecting doctors, patients, and medical facilities
                through advanced telemedicine, AI-powered diagnostics, and seamless care management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/admin/login" 
                  className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-all hover:shadow-xl transform hover:-translate-y-1 text-center"
                >
                  Get Started
                </Link>
                <a 
                  href="#features" 
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-all text-center"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="relative animate-slide-up">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop" 
                  alt="Modern Healthcare"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-600/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Platform Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '👨‍⚕️', title: 'Expert Doctors', desc: 'Connect with verified healthcare professionals across multiple specialties' },
              { icon: '💬', title: 'Telemedicine', desc: 'Secure video consultations from anywhere, anytime' },
              { icon: '🤖', title: 'AI Assistance', desc: 'Smart prescription generation and medical report analysis' },
              { icon: '📋', title: 'Health Records', desc: 'Comprehensive patient history and medical records management' },
              { icon: '📅', title: 'Appointment Booking', desc: 'Easy scheduling with real-time availability' },
              { icon: '💊', title: 'Medicine Shopping', desc: 'Order prescriptions and medications online' },
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Healthcare Services */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Healthcare Services
          </h2>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Comprehensive Medical Care</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                VirtualDoc provides a complete healthcare ecosystem supporting doctors, hospitals, 
                clinics, and patients with state-of-the-art technology and user-friendly interfaces.
              </p>
              <ul className="space-y-3">
                {[
                  'Multi-specialty doctor consultations',
                  'Hospital and clinic management',
                  'Patient portal and records',
                  'Lab and diagnostic services',
                  'Pharmacy integration',
                  'Insurance management',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-green-500 text-xl">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop" 
                alt="Medical Consultation"
                className="rounded-xl shadow-lg w-full h-64 object-cover"
              />
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop" 
                alt="Healthcare Team"
                className="rounded-xl shadow-lg w-full h-64 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Disease Management */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Common Conditions We Help Manage
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=200&fit=crop',
                title: 'Diabetes',
                desc: 'Comprehensive diabetes management and monitoring'
              },
              { 
                img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop',
                title: 'Cardiology',
                desc: 'Heart health monitoring and cardiovascular care'
              },
              { 
                img: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=300&h=200&fit=crop',
                title: 'Mental Health',
                desc: 'Psychiatry and psychology services'
              },
              { 
                img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&h=200&fit=crop',
                title: 'Pediatrics',
                desc: 'Child healthcare and development'
              },
            ].map((condition, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
              >
                <img 
                  src={condition.img}
                  alt={condition.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{condition.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{condition.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-800 dark:to-secondary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Healthcare?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join VirtualDoc today and experience the future of healthcare management
          </p>
          <Link 
            to="/admin/login" 
            className="inline-block px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-all hover:shadow-xl transform hover:-translate-y-1"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">VirtualDoc</h3>
              <p className="text-gray-400">Revolutionizing healthcare through technology</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><Link to="/admin/login" className="hover:text-white transition-colors">Admin Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#docs" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VirtualDoc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

