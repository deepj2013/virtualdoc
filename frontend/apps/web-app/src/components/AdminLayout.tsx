import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import axios from 'axios';
import { initTheme } from '../utils/theme';
import { adminAPI } from '../utils/api';
import ThemeToggle from './ThemeToggle';
import {
  UsersIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  HomeIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  BellIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Format count for display (e.g., 1200 -> "1.2K", 45 -> "45")
  const formatCount = (count: number | undefined): string | undefined => {
    if (loading || (count === undefined && count !== 0)) return undefined;
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  useEffect(() => {
    initTheme();
    fetchStats();
    // Set active section based on current route
    const path = location.pathname;
    if (path.includes('/users')) setActiveSection('users');
    else if (path.includes('/tenants')) setActiveSection('tenants');
    else if (path.includes('/admins')) setActiveSection('admins');
    else if (path.includes('/roles')) setActiveSection('roles');
    else if (path.includes('/analytics')) setActiveSection('analytics');
    else if (path.includes('/billing')) setActiveSection('billing');
    else if (path.includes('/settings')) setActiveSection('settings');
    else if (path.includes('/security')) setActiveSection('security');
    else if (path.includes('/logs')) setActiveSection('logs');
    else setActiveSection('dashboard');
  }, [location]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh stats when navigating to certain pages
  useEffect(() => {
    if (location.pathname.includes('/users') || location.pathname.includes('/tenants') || location.pathname.includes('/admins')) {
      fetchStats();
    }
  }, [location.pathname]);

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

  const menuItems = [
    { id: 'dashboard', icon: HomeIcon, label: 'Dashboard', path: '/admin/dashboard', color: 'blue' },
    { 
      id: 'users', 
      icon: UsersIcon, 
      label: 'Users', 
      path: '/admin/users', 
      color: 'green', 
      count: formatCount(stats?.totalUsers) 
    },
    { 
      id: 'tenants', 
      icon: BuildingOfficeIcon, 
      label: 'Tenants', 
      path: '/admin/tenants', 
      color: 'purple', 
      count: formatCount(stats?.totalTenants) 
    },
    { 
      id: 'admins', 
      icon: UserGroupIcon, 
      label: 'Admins', 
      path: '/admin/admins', 
      color: 'indigo', 
      count: formatCount(stats?.totalAdmins) 
    },
    { id: 'roles', icon: KeyIcon, label: 'Roles & Permissions', path: '/admin/roles', color: 'orange' },
    { id: 'analytics', icon: ChartBarIcon, label: 'Analytics', path: '/admin/analytics', color: 'yellow' },
    { id: 'billing', icon: CreditCardIcon, label: 'Billing', path: '/admin/billing', color: 'pink' },
    { id: 'security', icon: ShieldCheckIcon, label: 'Security', path: '/admin/security', color: 'red' },
    { id: 'logs', icon: DocumentTextIcon, label: 'Audit Logs', path: '/admin/logs', color: 'gray' },
    { id: 'settings', icon: Cog6ToothIcon, label: 'Settings', path: '/admin/settings', color: 'slate' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏥</span>
              <span className="text-lg font-bold text-primary dark:text-primary-400">VirtualDoc</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Universal Admin</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count && (
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                  {user.firstName?.[0] || user.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.firstName || user.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Universal Admin
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Portal</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Welcome back, {user.firstName || user.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;




