import React from 'react';

const TestPushNotification = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Push Notification Test Page</h1>
      <p className="text-gray-600">This is a test to verify that push notification routing is working.</p>
      <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
        <p className="text-green-700">✅ If you can see this message, the routing is working correctly!</p>
      </div>
    </div>
  );
};

export default TestPushNotification;
