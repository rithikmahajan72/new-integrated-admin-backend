import React from 'react';

const SimpleManageItems = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Manage Items - Simplified
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Product Management</h2>
          <p className="text-gray-600 mb-4">
            This is a simplified version of the ManageItems component to test routing.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">Sample Product 1</h3>
              <p className="text-sm text-gray-500">Category: T-Shirts</p>
              <p className="text-lg font-bold text-green-600">$29.99</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">Sample Product 2</h3>
              <p className="text-sm text-gray-500">Category: Jeans</p>
              <p className="text-lg font-bold text-green-600">$59.99</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">Sample Product 3</h3>
              <p className="text-sm text-gray-500">Category: Shoes</p>
              <p className="text-lg font-bold text-green-600">$89.99</p>
            </div>
          </div>
          
          <div className="mt-6 flex gap-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Add New Product
            </button>
            <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Filter Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleManageItems;
