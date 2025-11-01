import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLoginPage.css';

const API_BASE_URL = 'http://localhost:3001';

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      adminRoleCode: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      tokenType: string;
    };
  };
}

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user types
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/api/admin/auth/login`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success && response.data.data) {
        // Store tokens
        localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        // Redirect to dashboard (to be created)
        navigate('/admin/dashboard');
      } else {
        setErrors([response.data.message || 'Login failed']);
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrors([error.response.data.message]);
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors(['An error occurred. Please try again.']);
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <span className="logo-icon">🏥</span>
              <span className="logo-text">VirtualDoc</span>
            </div>
            <h1>Admin Portal</h1>
            <p className="login-subtitle">Sign in to access the Universal Admin Dashboard</p>
          </div>

          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((error, index) => (
                <div key={index} className="error-message">
                  {error}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@virtualdoc.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button
              type="submit"
              className="btn-login"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <a href="#" onClick={(e) => {
                e.preventDefault();
                alert('Please contact system administrator for account creation');
              }}>
                Contact Admin
              </a>
            </p>
          </div>
        </div>

        <div className="login-info">
          <h2>Welcome Back!</h2>
          <p>Access comprehensive healthcare management tools and analytics</p>
          <div className="info-features">
            <div className="info-feature">
              <span className="feature-icon">👥</span>
              <span>Manage Users & Tenants</span>
            </div>
            <div className="info-feature">
              <span className="feature-icon">📊</span>
              <span>View Analytics & Reports</span>
            </div>
            <div className="info-feature">
              <span className="feature-icon">⚙️</span>
              <span>System Configuration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

