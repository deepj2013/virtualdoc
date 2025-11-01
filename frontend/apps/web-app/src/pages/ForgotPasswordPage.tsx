import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { initTheme } from '../utils/theme';
import ThemeToggle from '../components/ThemeToggle';

const API_BASE_URL = 'http://localhost:3001';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [otpFromServer, setOtpFromServer] = useState('');

  useEffect(() => {
    initTheme();
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/auth/forgot-password`, {
        email,
      });

      if (response.data.success) {
        // Store OTP from response (development only)
        if (response.data.data?.otp) {
          setOtpFromServer(response.data.data.otp);
          console.log('OTP Received:', response.data.data.otp);
        }
        setStep('otp');
      }
    } catch (error: any) {
      setErrors([error.response?.data?.message || 'An error occurred']);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (!otp) {
      setErrors(['Please enter the OTP']);
      return;
    }

    setStep('reset');
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (newPassword !== confirmPassword) {
      setErrors(['Passwords do not match']);
      return;
    }

    if (newPassword.length < 8) {
      setErrors(['Password must be at least 8 characters']);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });

      if (response.data.success) {
        navigate('/admin/login', { 
          state: { message: 'Password reset successfully. Please login with your new password.' }
        });
      }
    } catch (error: any) {
      setErrors([error.response?.data?.message || 'Failed to reset password']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🏥</span>
              <span className="text-xl font-bold text-primary dark:text-primary-400">VirtualDoc</span>
            </div>
            <ThemeToggle />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {step === 'email' && 'Forgot Password'}
            {step === 'otp' && 'Enter OTP'}
            {step === 'reset' && 'Reset Password'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {step === 'email' && 'Enter your email address to receive a password reset OTP'}
            {step === 'otp' && 'Enter the 6-digit OTP sent to your console (development mode)'}
            {step === 'reset' && 'Enter your new password'}
          </p>

          {otpFromServer && step === 'otp' && (
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold mb-1">
                Development Mode - OTP:
              </p>
              <p className="text-2xl font-mono font-bold text-yellow-900 dark:text-yellow-100">
                {otpFromServer}
              </p>
            </div>
          )}

          {errors.length > 0 && (
            <div className="mb-6 space-y-2">
              {errors.map((error, index) => (
                <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded">
                  {error}
                </div>
              ))}
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@virtualdoc.com"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary hover:bg-primary-600 text-white font-semibold rounded-lg transition-all hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-center text-2xl font-mono tracking-widest"
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary hover:bg-primary-600 text-white font-semibold rounded-lg transition-all hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Verify OTP
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-sm text-primary hover:text-primary-600 dark:text-primary-400"
              >
                Back to Email
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary hover:bg-primary-600 text-white font-semibold rounded-lg transition-all hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => setStep('otp')}
                className="w-full text-sm text-primary hover:text-primary-600 dark:text-primary-400"
              >
                Back to OTP
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link 
              to="/admin/login" 
              className="text-sm text-primary hover:text-primary-600 dark:text-primary-400 font-medium"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

