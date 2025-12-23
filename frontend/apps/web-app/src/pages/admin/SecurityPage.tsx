import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, LockClosedIcon, EyeIcon } from '@heroicons/react/24/outline';
import { adminAPI } from '../../utils/api';

const SecurityPage: React.FC = () => {
  const [security, setSecurity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSecurity();
  }, []);

  const fetchSecurity = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getSecurity();
      
      if (response.data.success) {
        setSecurity(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch security info');
      console.error('Error fetching security:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading security info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security & Access</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor security, sessions, and access logs</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {security && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <EyeIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{security.activeSessions || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <LockClosedIcon className="w-6 h-6 text-red-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Failed Logins</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{security.failedLogins24h || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Last 24 hours</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheckIcon className="w-6 h-6 text-green-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Security Score</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{security.securityScore || 98}%</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-12">
          <ShieldCheckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Security Dashboard</h3>
          <p className="text-gray-600 dark:text-gray-400">Security monitoring and access control interface coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
