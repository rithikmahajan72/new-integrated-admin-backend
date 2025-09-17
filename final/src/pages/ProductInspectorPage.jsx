import React, { useState } from 'react';
import ProductDataInspector from '../components/ProductDataInspector';

const ProductInspectorPage = () => {
  const [productId, setProductId] = useState('68c9780f12ac59076d6c161f');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Product Data Inspector</h1>
          <p className="text-gray-600 mt-1">
            Debug tool to see all data returned by the backend API
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-2">
            Product ID to Inspect:
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              id="productId"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product ID..."
            />
            <button
              onClick={() => setProductId(productId)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Inspect
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <p>Try these product IDs:</p>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setProductId('68c9780f12ac59076d6c161f')}
                className="text-blue-600 hover:underline"
              >
                68c9780f12ac59076d6c161f
              </button>
              <button
                onClick={() => setProductId('68c974fdfd18449af1f46c92')}
                className="text-blue-600 hover:underline"
              >
                68c974fdfd18449af1f46c92
              </button>
            </div>
          </div>
        </div>

        {productId && <ProductDataInspector productId={productId} />}
      </div>
    </div>
  );
};

export default ProductInspectorPage;
