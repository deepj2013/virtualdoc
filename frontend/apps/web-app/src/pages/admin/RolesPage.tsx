import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, PlusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { adminAPI } from '../../utils/api';

interface Permission {
  id: string;
  name: string;
  code: string;
  module: string;
  description: string;
}

interface RolePermission {
  permissionId: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canManage: boolean;
}

const roles = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'sub_admin', label: 'Sub Admin' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'staff', label: 'Staff' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'patient', label: 'Patient' },
];

const RolesPage: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('super_admin');
  const [rolePermissions, setRolePermissions] = useState<Record<string, RolePermission>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreatePermission, setShowCreatePermission] = useState(false);
  const [newPermission, setNewPermission] = useState({
    name: '',
    code: '',
    module: '',
    description: '',
  });

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole);
    }
  }, [selectedRole]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllPermissions();
      if (response.data.success) {
        setPermissions(response.data.data.permissions || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (role: string) => {
    try {
      const response = await adminAPI.getRolePermissions(role);
      if (response.data.success) {
        const perms: Record<string, RolePermission> = {};
        (response.data.data.permissions || []).forEach((p: any) => {
          perms[p.permission_id] = {
            permissionId: p.permission_id,
            canRead: p.can_read || false,
            canWrite: p.can_write || false,
            canDelete: p.can_delete || false,
            canManage: p.can_manage || false,
          };
        });
        setRolePermissions(perms);
      }
    } catch (err: any) {
      // Role might not have permissions yet, that's okay
      setRolePermissions({});
    }
  };

  const handlePermissionToggle = (permissionId: string, field: keyof RolePermission) => {
    setRolePermissions(prev => ({
      ...prev,
      [permissionId]: {
        ...prev[permissionId],
        permissionId,
        [field]: !prev[permissionId]?.[field],
      },
    }));
  };

  const handleSavePermissions = async () => {
    try {
      setSaving(true);
      setError(null);

      // Save permissions for selected role
      for (const permission of permissions) {
        const perm = rolePermissions[permission.id];
        if (perm) {
          await adminAPI.assignRolePermission(selectedRole, {
            permissionId: permission.id,
            canRead: perm.canRead,
            canWrite: perm.canWrite,
            canDelete: perm.canDelete,
            canManage: perm.canManage,
          });
        }
      }

      alert('Permissions saved successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await adminAPI.createPermission(newPermission);
      if (response.data.success) {
        setShowCreatePermission(false);
        setNewPermission({ name: '', code: '', module: '', description: '' });
        fetchPermissions();
        alert('Permission created successfully!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create permission');
    } finally {
      setSaving(false);
    }
  };

  const permissionsByModule = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage role-based access control</p>
        </div>
        <button
          onClick={() => setShowCreatePermission(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold"
        >
          <PlusIcon className="w-5 h-5" />
          Create Permission
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Role Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Role</h2>
            <div className="space-y-2">
              {roles.map(role => (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                    selectedRole === role.value
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Permissions for {roles.find(r => r.value === selectedRole)?.label}
              </h2>
              <button
                onClick={handleSavePermissions}
                disabled={saving}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading permissions...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
                  <div key={module}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 capitalize">
                      {module.replace('_', ' ')}
                    </h3>
                    <div className="space-y-2">
                      {modulePermissions.map(permission => {
                        const perm = rolePermissions[permission.id] || {
                          permissionId: permission.id,
                          canRead: false,
                          canWrite: false,
                          canDelete: false,
                          canManage: false,
                        };

                        return (
                          <div
                            key={permission.id}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">{permission.name}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{permission.description || permission.code}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={perm.canRead}
                                  onChange={() => handlePermissionToggle(permission.id, 'canRead')}
                                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Read</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={perm.canWrite}
                                  onChange={() => handlePermissionToggle(permission.id, 'canWrite')}
                                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Write</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={perm.canDelete}
                                  onChange={() => handlePermissionToggle(permission.id, 'canDelete')}
                                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Delete</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={perm.canManage}
                                  onChange={() => handlePermissionToggle(permission.id, 'canManage')}
                                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Manage</span>
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Permission Modal */}
      {showCreatePermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create Permission</h3>
              <button
                onClick={() => setShowCreatePermission(false)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreatePermission} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={newPermission.name}
                  onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code *
                </label>
                <input
                  type="text"
                  value={newPermission.code}
                  onChange={(e) => setNewPermission({ ...newPermission, code: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Module *
                </label>
                <input
                  type="text"
                  value={newPermission.module}
                  onChange={(e) => setNewPermission({ ...newPermission, module: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newPermission.description}
                  onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreatePermission(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPage;

