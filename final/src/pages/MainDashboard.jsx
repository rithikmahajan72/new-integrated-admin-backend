import React, { useState, useCallback, memo, useEffect } from "react";
import DashboardView from "./dashboardview";
import DashboardMarketplaceSync from "./dashboardmarketplacesync";
import DashboardAnalyticsGoogleReport from "./dashboardanalyticsgooglereport";
import DashboardUsers from "./dashboardusers";
import DashboardOrders from "./dashboardorders";
import DashboardProductData from "./dashboardproductdata";

// Main Dashboard Component that orchestrates all the modular dashboard components
const Dashboard = memo(({ activeTab: propActiveTab, onTabChange: propOnTabChange }) => {
  const [activeTab, setActiveTab] = useState(propActiveTab || "dashboard");

  // Handle tab changes
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    if (propOnTabChange) {
      propOnTabChange(tab);
    }
  }, [propOnTabChange]);

  // Update local state when prop changes
  useEffect(() => {
    if (propActiveTab && propActiveTab !== activeTab) {
      setActiveTab(propActiveTab);
    }
  }, [propActiveTab, activeTab]);

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Dashboard Overview
              </h2>
              <p className="text-gray-600 mb-6">
                This is the main dashboard overview. Use the tabs above to navigate to different sections:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Marketplace Sync</h3>
                  <p className="text-blue-700 text-sm">Manage marketplace connections and product synchronization</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">Analytics Reports</h3>
                  <p className="text-green-700 text-sm">View detailed analytics and generate reports</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">User Management</h3>
                  <p className="text-purple-700 text-sm">Manage users and their activities</p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-900 mb-2">Order Management</h3>
                  <p className="text-yellow-700 text-sm">Track and manage customer orders</p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-900 mb-2">Product Data</h3>
                  <p className="text-red-700 text-sm">Manage product catalog and inventory</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Quick Stats</h3>
                  <p className="text-gray-700 text-sm">Overview of key performance metrics</p>
                </div>
              </div>
            </div>
          </div>
        );
      case "sync":
        return <DashboardMarketplaceSync />;
      case "analytics":
        return <DashboardAnalyticsGoogleReport />;
      case "users":
      case "database":
      case "databaseDashboard":
        return <DashboardUsers />;
      case "orders":
        return <DashboardOrders />;
      case "products":
        return <DashboardProductData />;
      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Dashboard Section
            </h2>
            <p className="text-gray-600">
              Content for {activeTab} will be displayed here.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Use DashboardView for consistent header and navigation */}
      <DashboardView 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      
      {/* Main Content */}
      <div className="px-6 py-6">
        {renderTabContent()}
      </div>
    </div>
  );
});

Dashboard.displayName = "Dashboard";

export default Dashboard;
