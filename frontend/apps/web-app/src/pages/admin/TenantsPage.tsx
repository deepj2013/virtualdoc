import React, { useState, useEffect } from 'react';
import { BuildingOfficeIcon, PlusIcon, MagnifyingGlassIcon, PencilIcon } from '@heroicons/react/24/outline';
import { adminAPI } from '../../utils/api';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: string;
  subdomain: string | null;
  is_active: boolean;
  subscription_tier: string;
  user_count: number;
  patient_count: number;
  created_at: string;
}

const TenantsPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTenants();
  }, [page, search]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.listTenants({
        page,
        limit: 20,
        search: search || undefined,
      });
      
      if (response.data.success) {
        setTenants(response.data.data.tenants || []);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tenants');
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tenants Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage hospitals, clinics, and organizations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold">
          <PlusIcon className="w-5 h-5" />
          Create Tenant
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tenants by name, type, or domain..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tenants...</p>
          </div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tenants found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Subscription</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Users</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Patients</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">{tenant.name}</div>
                        {tenant.subdomain && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{tenant.subdomain}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 capitalize">
                          {tenant.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 capitalize">
                          {tenant.subscription_tier}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{tenant.user_count || 0}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{tenant.patient_count || 0}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          tenant.is_active
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}>
                          {tenant.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                >
                  Previous
                </button>
                <span className="text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TenantsPage;
