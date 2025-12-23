import React, { useState, useEffect } from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { adminAPI } from '../../utils/api';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getSettings();
      
      if (response.data.success) {
        setSettings(response.data.data.settings);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch settings');
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Configure system settings and preferences</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {settings && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">General Settings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Platform name, logo, and basic configuration</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Platform Name</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{settings.platformName || 'VirtualDoc'}</span>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Settings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">SMTP configuration and email templates</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Email Enabled</span>
                <span className={`text-sm font-medium ${settings.emailEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {settings.emailEnabled ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Security Settings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Password policies, MFA, and security rules</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">MFA Enabled</span>
                <span className={`text-sm font-medium ${settings.mfaEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {settings.mfaEnabled ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">API Settings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">API keys, rate limits, and webhooks</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Configure in system settings</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-12">
          <Cog6ToothIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">System Configuration</h3>
          <p className="text-gray-600 dark:text-gray-400">System settings interface coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
