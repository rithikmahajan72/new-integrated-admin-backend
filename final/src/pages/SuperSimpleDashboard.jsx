import React from 'react';

const SuperSimpleDashboard = () => {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'yellow',
      color: 'black',
      minHeight: '400px',
      fontSize: '20px'
    }}>
      <h1 style={{fontSize: '30px', fontWeight: 'bold'}}>
        🟡 SUPER SIMPLE DASHBOARD - NO CSS DEPENDENCIES!
      </h1>
      <p>This should definitely be visible if routing works!</p>
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: 'orange',
        border: '2px solid red'
      }}>
        <h2>BRIGHT ORANGE BOX</h2>
        <p>If you can see this bright orange box with red border, routing is working!</p>
      </div>
    </div>
  );
};

export default SuperSimpleDashboard;
