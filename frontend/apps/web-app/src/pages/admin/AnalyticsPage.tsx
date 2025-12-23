import React, { useState, useEffect } from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { adminAPI } from '../../utils/api';

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAnalytics({ period: '30' });
      
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View platform statistics and insights</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{analytics.users?.total?.toLocaleString() || '0'}</p>
            <p className="text-sm text-green-600 dark:text-green-400">+{analytics.users?.recent || 0} this month</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Tenants</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{analytics.tenants?.total?.toLocaleString() || '0'}</p>
            <p className="text-sm text-green-600 dark:text-green-400">+{analytics.tenants?.recent || 0} this month</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Monthly Revenue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">${analytics.revenue?.toLocaleString() || '0'}</p>
            <p className="text-sm text-green-600 dark:text-green-400">Last 30 days</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Appointments</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{analytics.appointments?.toLocaleString() || '0'}</p>
            <p className="text-sm text-green-600 dark:text-green-400">Last 30 days</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-12">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h3>
          <p className="text-gray-600 dark:text-gray-400">Detailed charts and reports coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
