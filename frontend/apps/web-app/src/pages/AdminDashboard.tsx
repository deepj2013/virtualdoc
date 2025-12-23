import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initTheme } from '../utils/theme';
import { adminAPI } from '../utils/api';
import {
  UsersIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initTheme();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
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

  const statsData = stats ? [
    { label: 'Total Users', value: stats.totalUsers?.toLocaleString() || '0', change: '+12%', icon: UsersIcon, color: 'blue' },
    { label: 'Active Tenants', value: stats.activeTenants?.toLocaleString() || '0', change: `Total: ${stats.totalTenants || 0}`, icon: BuildingOfficeIcon, color: 'green' },
    { label: 'Total Admins', value: stats.totalAdmins?.toLocaleString() || '0', change: 'Active', icon: UserGroupIcon, color: 'purple' },
    { label: 'Upcoming Appointments', value: stats.upcomingAppointments?.toLocaleString() || '0', change: 'Today', icon: ServerIcon, color: 'yellow' },
  ] : [
    { label: 'Total Users', value: '...', change: '...', icon: UsersIcon, color: 'blue' },
    { label: 'Active Tenants', value: '...', change: '...', icon: BuildingOfficeIcon, color: 'green' },
    { label: 'Total Admins', value: '...', change: '...', icon: UserGroupIcon, color: 'purple' },
    { label: 'Upcoming Appointments', value: '...', change: '...', icon: ServerIcon, color: 'yellow' },
  ];

  const quickActions = [
    { icon: UsersIcon, label: 'Add New User', path: '/admin/users/new', color: 'blue' },
    { icon: BuildingOfficeIcon, label: 'Create Tenant', path: '/admin/tenants/new', color: 'green' },
    { icon: UserGroupIcon, label: 'Assign Admin', path: '/admin/admins/new', color: 'purple' },
    { icon: ChartBarIcon, label: 'View Reports', path: '/admin/analytics', color: 'yellow' },
  ];

  const menuItems = [
    { id: 'users', icon: UsersIcon, label: 'Users', path: '/admin/users', color: 'green', count: stats?.totalUsers?.toLocaleString() || '0', desc: 'Manage all platform users, roles, and permissions' },
    { id: 'tenants', icon: BuildingOfficeIcon, label: 'Tenants', path: '/admin/tenants', color: 'purple', count: stats?.totalTenants?.toLocaleString() || '0', desc: 'Create and manage hospitals, clinics, and organizations' },
    { id: 'admins', icon: UserGroupIcon, label: 'Admins', path: '/admin/admins', color: 'indigo', count: stats?.totalAdmins?.toLocaleString() || '0', desc: 'Manage admin users and their access levels' },
    { id: 'analytics', icon: ChartBarIcon, label: 'Analytics', path: '/admin/analytics', color: 'yellow', desc: 'View platform statistics and insights' },
    { id: 'billing', icon: CreditCardIcon, label: 'Billing', path: '/admin/billing', color: 'pink', desc: 'Manage subscriptions, payments, and billing' },
    { id: 'security', icon: ShieldCheckIcon, label: 'Security', path: '/admin/security', color: 'red', desc: 'Monitor security, sessions, and access logs' },
    { id: 'logs', icon: DocumentTextIcon, label: 'Audit Logs', path: '/admin/logs', color: 'gray', desc: 'View audit logs and system activity' },
    { id: 'settings', icon: Cog6ToothIcon, label: 'Settings', path: '/admin/settings', color: 'slate', desc: 'Configure system settings and preferences' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">Welcome back, {user.firstName || user.email}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => handleNavigation(action.path)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all text-left group"
              >
                <div className={`w-12 h-12 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 text-${action.color}-600 dark:text-${action.color}-400`} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{action.label}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Click to get started</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Features Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Platform Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-lg bg-${item.color}-100 dark:bg-${item.color}-900/20`}>
                    <Icon className={`w-8 h-8 text-${item.color}-600 dark:text-${item.color}-400`} />
                  </div>
                  {item.count && (
                    <span className="ml-auto text-2xl font-bold text-gray-900 dark:text-white">
                      {item.count}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.label}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{item.desc}</p>
                <div className="text-primary-600 dark:text-primary-400 font-medium group-hover:underline">
                  Manage →
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
