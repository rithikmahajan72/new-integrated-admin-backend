import React from 'react';

const SimpleDashboard = () => {
  console.log('SimpleDashboard is rendering!');
  return (
    <div className="p-8 bg-green-100">
      <h1 className="text-2xl font-bold text-green-900 mb-4">🟢 SIMPLE DASHBOARD - WORKING!</h1>
      <p className="text-green-600">
        This is a simple dashboard to test if the basic routing works.
      </p>
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h2 className="text-lg font-semibold text-green-900">Dashboard Test</h2>
        <p className="text-green-700">
          If you can see this GREEN dashboard, then the routing is working correctly.
        </p>
      </div>
    </div>
  );
};

export default SimpleDashboard;
