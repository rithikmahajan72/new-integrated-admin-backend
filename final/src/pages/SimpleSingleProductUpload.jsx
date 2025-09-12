import React from 'react';

const SimpleSingleProductUpload = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Single Product Upload - Simplified
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
          <p className="text-gray-600 mb-6">
            This is a simplified version of the SingleProductUpload component to test routing.
          </p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter product name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option>Select Category</option>
                <option>T-Shirts</option>
                <option>Jeans</option>
                <option>Shoes</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>
              <input 
                type="number" 
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter price"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea 
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows="4"
                placeholder="Enter product description"
              ></textarea>
            </div>
            
            <div className="flex gap-4">
              <button className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
                Save Product
              </button>
              <button className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleSingleProductUpload;
