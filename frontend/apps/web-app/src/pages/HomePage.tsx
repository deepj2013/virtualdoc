import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="container nav-container">
          <div className="logo">
            <span className="logo-icon">🏥</span>
            <span className="logo-text">VirtualDoc</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <Link to="/admin/login" className="btn-primary">Admin Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Revolutionizing Healthcare with
              <span className="text-gradient"> Digital Innovation</span>
            </h1>
            <p className="hero-subtitle">
              A comprehensive healthcare platform connecting doctors, patients, and medical facilities
              through advanced telemedicine, AI-powered diagnostics, and seamless care management.
            </p>
            <div className="hero-buttons">
              <Link to="/admin/login" className="btn btn-large btn-primary">
                Get Started
              </Link>
              <a href="#features" className="btn btn-large btn-secondary">
                Learn More
              </a>
            </div>
          </div>
          <div className="hero-image">
            <img 
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop" 
              alt="Modern Healthcare"
              className="hero-img"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Platform Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👨‍⚕️</div>
              <h3>Expert Doctors</h3>
              <p>Connect with verified healthcare professionals across multiple specialties</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Telemedicine</h3>
              <p>Secure video consultations from anywhere, anytime</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Assistance</h3>
              <p>Smart prescription generation and medical report analysis</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Health Records</h3>
              <p>Comprehensive patient history and medical records management</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Appointment Booking</h3>
              <p>Easy scheduling with real-time availability</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💊</div>
              <h3>Medicine Shopping</h3>
              <p>Order prescriptions and medications online</p>
            </div>
          </div>
        </div>
      </section>

      {/* Healthcare Services */}
      <section className="services">
        <div className="container">
          <h2 className="section-title">Healthcare Services</h2>
          <div className="services-content">
            <div className="services-text">
              <h3>Comprehensive Medical Care</h3>
              <p>
                VirtualDoc provides a complete healthcare ecosystem supporting doctors, hospitals, 
                clinics, and patients with state-of-the-art technology and user-friendly interfaces.
              </p>
              <ul className="services-list">
                <li>✓ Multi-specialty doctor consultations</li>
                <li>✓ Hospital and clinic management</li>
                <li>✓ Patient portal and records</li>
                <li>✓ Lab and diagnostic services</li>
                <li>✓ Pharmacy integration</li>
                <li>✓ Insurance management</li>
              </ul>
            </div>
            <div className="services-images">
              <img 
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop" 
                alt="Medical Consultation"
                className="service-img"
              />
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop" 
                alt="Healthcare Team"
                className="service-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Disease Management */}
      <section className="diseases">
        <div className="container">
          <h2 className="section-title">Common Conditions We Help Manage</h2>
          <div className="diseases-grid">
            <div className="disease-card">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=200&fit=crop" 
                alt="Diabetes Care"
                className="disease-img"
              />
              <h3>Diabetes</h3>
              <p>Comprehensive diabetes management and monitoring</p>
            </div>
            <div className="disease-card">
              <img 
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop" 
                alt="Heart Care"
                className="disease-img"
              />
              <h3>Cardiology</h3>
              <p>Heart health monitoring and cardiovascular care</p>
            </div>
            <div className="disease-card">
              <img 
                src="https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=300&h=200&fit=crop" 
                alt="Mental Health"
                className="disease-img"
              />
              <h3>Mental Health</h3>
              <p>Psychiatry and psychology services</p>
            </div>
            <div className="disease-card">
              <img 
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&h=200&fit=crop" 
                alt="Pediatrics"
                className="disease-img"
              />
              <h3>Pediatrics</h3>
              <p>Child healthcare and development</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Healthcare?</h2>
            <p>Join VirtualDoc today and experience the future of healthcare management</p>
            <Link to="/admin/login" className="btn btn-large btn-primary">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>VirtualDoc</h3>
              <p>Revolutionizing healthcare through technology</p>
            </div>
            <div className="footer-section">
              <h4>Platform</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About Us</a></li>
                <li><Link to="/admin/login">Admin Portal</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#docs">Documentation</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 VirtualDoc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

