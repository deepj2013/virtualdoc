import React, { useState, useEffect } from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import { adminAPI } from '../../utils/api';

const BillingPage: React.FC = () => {
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBilling();
  }, []);

  const fetchBilling = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getBilling();
      
      if (response.data.success) {
        setBilling(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch billing info');
      console.error('Error fetching billing:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading billing info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Subscriptions</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage subscriptions, payments, and billing</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {billing && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">${billing.totalRevenue?.toLocaleString() || '0'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">This month</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Active Subscriptions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{billing.activeSubscriptions?.toLocaleString() || '0'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Tenants</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pending Payments</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">${billing.pendingPayments?.toLocaleString() || '0'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Outstanding</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-12">
          <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Billing Management</h3>
          <p className="text-gray-600 dark:text-gray-400">Detailed billing and subscription management interface coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
