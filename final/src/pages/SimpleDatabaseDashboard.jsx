import React from 'react';

const SimpleDatabaseDashboard = () => {
  return (
    <div className="p-8 bg-blue-100">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">🔵 SIMPLE DATABASE DASHBOARD</h1>
      <p className="text-blue-600">
        This is a simplified version of the database dashboard to test if the complex logic was causing issues.
      </p>
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-900">Database Test</h2>
        <p className="text-blue-700">
          If you can see this BLUE page, then the basic routing to database dashboard works.
        </p>
      </div>
    </div>
  );
};

export default SimpleDatabaseDashboard;
