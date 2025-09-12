import React from 'react';

const TestRoute = () => {
  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
      <h1 style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
        Test Route Working
      </h1>
      <p style={{ color: '#666', fontSize: '16px' }}>
        This is a test component to verify routing is working correctly.
      </p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px' }}>
        <p>Current time: {new Date().toLocaleString()}</p>
        <p>Route: /test-route</p>
      </div>
    </div>
  );
};

export default TestRoute;
