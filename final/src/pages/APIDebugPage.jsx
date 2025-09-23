import React, { useEffect, useState } from 'react';
import axios from 'axios';

const APIDebugPage = () => {
  const [categoriesData, setCategoriesData] = useState(null);
  const [itemsData, setItemsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      console.log('Token found:', !!token);
      
      if (!token) {
        // Set the test token
        const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGNkNzFmM2YzMWViNWQ3MmE2YzhlMjUiLCJuYW1lIjoiSm9oeWVlaW50ZWVldHkgcnRvZSIsInBoTm8iOiI3MDM2NTY3ODkwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjp0cnVlLCJpc0VtYWlsVmVyaWZpZWQiOnRydWUsImlzQWRtaW4iOnRydWUsImlzUHJvZmlsZSI6dHJ1ZSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicGxhdGZvcm0iOm51bGwsImlhdCI6MTc1ODYwMDgyOCwiZXhwIjoxNzU5MjA1NjI4fQ.8ed5uquFIHV5zpLs5LfiPmq0F9S1Dd96nThOP5kTm60';
        localStorage.setItem('authToken', testToken);
        console.log('Test token set');
      }

      const finalToken = localStorage.getItem('authToken');
      const config = {
        headers: { Authorization: `Bearer ${finalToken}` }
      };

      console.log('Testing categories API...');
      const categoriesResponse = await axios.get(
        'http://localhost:8080/api/items/bundles/categories',
        config
      );
      console.log('Categories response:', categoriesResponse.data);
      setCategoriesData(categoriesResponse.data);

      console.log('Testing items API...');
      const itemsResponse = await axios.get(
        'http://localhost:8080/api/items/bundles/items',
        config
      );
      console.log('Items response:', itemsResponse.data);
      setItemsData(itemsResponse.data);

    } catch (err) {
      console.error('API Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Debug Page</h1>
      
      <button 
        onClick={testAPI}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Categories Data</h2>
          {categoriesData ? (
            <div>
              <p><strong>Categories:</strong> {categoriesData.data?.categories?.length || 0}</p>
              <p><strong>Subcategories:</strong> {categoriesData.data?.subcategories?.length || 0}</p>
              <pre className="mt-2 bg-gray-100 p-2 rounded text-sm overflow-auto max-h-64">
                {JSON.stringify(categoriesData, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-gray-500">No data loaded yet</p>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Items Data</h2>
          {itemsData ? (
            <div>
              <p><strong>Items:</strong> {itemsData.data?.items?.length || 0}</p>
              <p><strong>Total Items:</strong> {itemsData.data?.pagination?.totalItems || 0}</p>
              <pre className="mt-2 bg-gray-100 p-2 rounded text-sm overflow-auto max-h-64">
                {JSON.stringify(itemsData, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-gray-500">No data loaded yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default APIDebugPage;
