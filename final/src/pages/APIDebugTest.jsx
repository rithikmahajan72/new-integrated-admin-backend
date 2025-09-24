import React, { useEffect, useState } from 'react';
import axios from 'axios';

const APIDebugTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testAPI = async (endpoint, name) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/${endpoint}`);
      setResults(prev => ({
        ...prev,
        [name]: {
          success: true,
          data: response.data,
          status: response.status
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: {
          success: false,
          error: error.message,
          response: error.response?.data,
          status: error.response?.status
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Test all endpoints on mount
    const runTests = async () => {
      await testAPI('items', 'items');
      await testAPI('categories', 'categories');
      await testAPI('subcategories', 'subcategories');
    };
    
    runTests();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Debug Test</h1>
      
      <div className="space-y-6">
        {Object.entries(results).map(([name, result]) => (
          <div key={name} className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2 capitalize">
              {name} API Test
            </h2>
            
            <div className={`p-3 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="font-medium">
                Status: {result.success ? 'SUCCESS' : 'FAILED'}
              </p>
              
              {result.success ? (
                <div>
                  <p>HTTP Status: {result.status}</p>
                  <p>Data Length: {
                    Array.isArray(result.data) ? result.data.length :
                    result.data?.items ? result.data.items.length :
                    result.data?.data ? result.data.data.length : 'Unknown'
                  }</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer">Show Response</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div>
                  <p>Error: {result.error}</p>
                  {result.status && <p>HTTP Status: {result.status}</p>}
                  {result.response && (
                    <details className="mt-2">
                      <summary className="cursor-pointer">Show Error Response</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(result.response, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2">Testing APIs...</p>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Test Redux Actions</h3>
        <button
          onClick={() => window.location.href = '/manage-reviews'}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Go to Manage Reviews (Test Redux)
        </button>
      </div>
    </div>
  );
};

export default APIDebugTest;
