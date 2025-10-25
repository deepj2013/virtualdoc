import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UserGroupIcon, 
  BuildingOfficeIcon, 
  HeartIcon,
  CheckIcon,
  StarIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CogIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Landing: React.FC = () => {
  const features = [
    {
      icon: <HeartIcon className="h-8 w-8" />,
      title: "AI-Powered Healthcare",
      description: "Advanced AI assistant for voice-to-text, prescription generation, and diagnostic support"
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8" />,
      title: "Secure & Compliant",
      description: "HIPAA, GDPR, and country-specific compliance with end-to-end encryption"
    },
    {
      icon: <ChartBarIcon className="h-8 w-8" />,
      title: "Advanced Analytics",
      description: "Comprehensive reporting and population health insights"
    },
    {
      icon: <GlobeAltIcon className="h-8 w-8" />,
      title: "Global Reach",
      description: "Multi-language, multi-currency support for worldwide healthcare"
    }
  ];

  const tiers = [
    {
      name: "Community Edition",
      subtitle: "For Individual Doctors & Small Clinics",
      price: "Free",
      period: "forever",
      description: "Essential practice management tools for free, supported by community donations",
      features: [
        "Up to 1,000 patients",
        "Basic appointment scheduling",
        "Voice-to-text AI assistant",
        "Simple prescription generation",
        "Patient portal access",
        "Community support",
        "Basic reporting"
      ],
      cta: "Start Free",
      ctaLink: "/auth/register?tier=freemium",
      popular: false,
      icon: <UserGroupIcon className="h-6 w-6" />
    },
    {
      name: "Professional Edition",
      subtitle: "For Multi-Doctor Practices & Clinics",
      price: "$199",
      period: "per provider/month",
      description: "Advanced features for established practices with priority support",
      features: [
        "Unlimited patients",
        "Advanced AI features",
        "Custom workflows",
        "Advanced integrations",
        "Priority support",
        "Custom branding",
        "API access",
        "Advanced analytics"
      ],
      cta: "Start Free Trial",
      ctaLink: "/auth/register?tier=premium",
      popular: true,
      icon: <BuildingOfficeIcon className="h-6 w-6" />
    },
    {
      name: "Hospital Edition",
      subtitle: "For Large Hospitals & Healthcare Systems",
      price: "Custom",
      period: "pricing",
      description: "Comprehensive solutions for large healthcare organizations",
      features: [
        "Multi-tenant architecture",
        "Population health analytics",
        "Custom development",
        "Dedicated support",
        "On-premise deployment",
        "White-label options",
        "Advanced security",
        "24/7 support"
      ],
      cta: "Contact Sales",
      ctaLink: "/contact",
      popular: false,
      icon: <CogIcon className="h-6 w-6" />
    }
  ];

  const stats = [
    { label: "Healthcare Providers", value: "10,000+" },
    { label: "Patients Served", value: "1M+" },
    { label: "Countries", value: "50+" },
    { label: "Uptime", value: "99.9%" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <HeartIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">VirtualDoc</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/auth/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/auth/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Revolutionizing Healthcare with
            <span className="text-blue-600"> AI-Powered Solutions</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            VirtualDoc provides comprehensive healthcare management tools for doctors, patients, and healthcare organizations worldwide. 
            From individual practices to large hospital systems, we have the right solution for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold inline-flex items-center"
            >
              Get Started Free
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/demo"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose VirtualDoc?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with user-friendly design to transform healthcare delivery.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the perfect plan for your healthcare practice, from individual doctors to large hospital systems.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-lg shadow-lg p-8 ${
                  tier.popular ? 'ring-2 ring-blue-600 transform scale-105' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-blue-600">{tier.icon}</div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-gray-600 mb-4">{tier.subtitle}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                    <span className="text-gray-600 ml-2">{tier.period}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{tier.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={tier.ctaLink}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-center block transition-colors ${
                    tier.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Healthcare Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of healthcare providers who trust VirtualDoc to streamline their practice and improve patient care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/register"
              className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold inline-flex items-center justify-center"
            >
              Start Your Free Trial
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="border border-blue-300 hover:border-blue-200 text-white px-8 py-3 rounded-lg text-lg font-semibold"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <HeartIcon className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">VirtualDoc</span>
              </div>
              <p className="text-gray-400">
                Revolutionizing healthcare with AI-powered solutions for providers worldwide.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/features" className="text-gray-400 hover:text-white">Features</Link></li>
                <li><Link to="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                <li><Link to="/security" className="text-gray-400 hover:text-white">Security</Link></li>
                <li><Link to="/integrations" className="text-gray-400 hover:text-white">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-gray-400 hover:text-white">Help Center</Link></li>
                <li><Link to="/docs" className="text-gray-400 hover:text-white">Documentation</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
                <li><Link to="/status" className="text-gray-400 hover:text-white">System Status</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-white">Careers</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VirtualDoc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
