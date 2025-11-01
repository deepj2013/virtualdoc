import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { initTheme } from '../utils/theme';
import ThemeToggle from '../components/ThemeToggle';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    initTheme();
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await axios.post(
          'http://localhost:3001/api/admin/auth/logout',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      navigate('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏥</span>
              <span className="text-lg font-bold text-primary dark:text-primary-400">VirtualDoc Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <span className="text-gray-700 dark:text-gray-300">
                Welcome, {user.firstName || user.email}
              </span>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Manage your healthcare platform</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '👥', title: 'Users', desc: 'Manage platform users' },
            { icon: '🏢', title: 'Tenants', desc: 'Manage hospitals & clinics' },
            { icon: '📊', title: 'Analytics', desc: 'View platform statistics' },
            { icon: '⚙️', title: 'Settings', desc: 'Configure system' },
          ].map((card, idx) => (
            <div 
              key={idx}
              className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 cursor-pointer"
            >
              <div className="text-5xl mb-4">{card.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{card.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

