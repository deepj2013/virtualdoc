import React from 'react';

const Billing: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage billing and payment processing
        </p>
      </div>
      <div className="card">
        <p className="text-gray-500">Billing and payments coming soon...</p>
      </div>
    </div>
  );
};

export default Billing;
