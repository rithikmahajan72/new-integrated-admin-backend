import React, { useState, useCallback, useMemo } from 'react';
import {
  Download,
  User,
  ShoppingBag,
  Package
} from 'lucide-react';

// Tab content components for better performance
const UserDataView = React.memo(() => (
  <div>
    <h2 className="text-lg font-semibold text-gray-900 mb-4">User Data View</h2>
    <p className="text-gray-600">User data content would go here...</p>
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-blue-700">✅ DatabaseDashboard (no modals) is working!</p>
    </div>
  </div>
));

const OrderDataView = React.memo(() => (
  <div>
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Data View</h2>
    <p className="text-gray-600">Order data content would go here...</p>
  </div>
));

const ProductDataView = React.memo(() => (
  <div>
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Data View</h2>
    <p className="text-gray-600">Product data content would go here...</p>
  </div>
));

// Simplified DatabaseDashboard without modals to test
const DatabaseDashboardNoModals = () => {
  const [activeTab, setActiveTab] = useState('users');

  // Memoize tab configuration to prevent re-creation on every render
  const tabConfig = useMemo(() => [
    { key: 'users', label: 'User Data', icon: User, component: UserDataView },
    { key: 'orders', label: 'Order Data', icon: ShoppingBag, component: OrderDataView },
    { key: 'products', label: 'Product Data', icon: Package, component: ProductDataView }
  ], []);

  // Memoize tab change handler to prevent unnecessary re-renders
  const handleTabChange = useCallback((tabKey) => {
    setActiveTab(tabKey);
  }, []);

  // Memoize class name generator for tab buttons
  const getTabClassName = useCallback((isActive) => {
    return `flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
      isActive
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`;
  }, []);

  // Memoize the active tab content component
  const ActiveTabContent = useMemo(() => {
    const activeTabConfig = tabConfig.find(tab => tab.key === activeTab);
    return activeTabConfig ? activeTabConfig.component : null;
  }, [activeTab, tabConfig]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Database Dashboard</h1>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4 inline-block mr-2" />
                  Export All
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabConfig.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={getTabClassName(activeTab === key)}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {ActiveTabContent && <ActiveTabContent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseDashboardNoModals;
