import React, { useState, useMemo } from 'react';

// Performance optimization: Move styles outside component to prevent recreation on each render
const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f0f0f0',
    minHeight: '100vh'
  },
  wrapper: {
    maxWidth: '1000px',
    margin: '0 auto'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '2px solid #ccc',
    padding: '20px'
  },
  header: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 20px 0',
    textAlign: 'center'
  },
  tabContainer: {
    borderBottom: '2px solid #eee',
    marginBottom: '20px'
  },
  tabWrapper: {
    display: 'flex',
    gap: '20px'
  },
  baseButton: {
    padding: '12px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500'
  },
  activeButton: {
    backgroundColor: '#007bff',
    color: 'white'
  },
  inactiveButton: {
    backgroundColor: '#f8f9fa',
    color: '#333'
  }
};

// Performance optimization: Move tabs data outside component to prevent recreation
const TABS_DATA = [
  { key: 'users', label: '👤 User Data' },
  { key: 'orders', label: '🛒 Order Data' },
  { key: 'products', label: '� Product Data' }
];

// Performance optimization: Extract content components for better organization
const UserContent = React.memo(() => (
  <div>
    <h2 style={{
      fontSize: '22px',
      color: '#333',
      marginBottom: '15px'
    }}>
      👤 User Data View
    </h2>
    <p style={{ color: '#666', marginBottom: '20px', fontSize: '16px' }}>
      This would show user profile information, security settings, and review data.
    </p>
    <div style={{
      padding: '20px',
      backgroundColor: '#d4edda',
      border: '1px solid #c3e6cb',
      borderRadius: '6px'
    }}>
      <h3 style={{ color: '#155724', margin: '0 0 10px 0' }}>
        ✅ SUCCESS: Basic Database Dashboard Working!
      </h3>
      <p style={{ color: '#155724', margin: 0 }}>
        The routing and basic component rendering is now functional. You can click the tabs above to switch views.
      </p>
    </div>
  </div>
));

const OrderContent = React.memo(() => (
  <div>
    <h2 style={{
      fontSize: '22px',
      color: '#333',
      marginBottom: '15px'
    }}>
      🛒 Order Data View
    </h2>
    <p style={{ color: '#666', fontSize: '16px' }}>
      This would show order details, SKU information, and document downloads.
    </p>
    <div style={{
      padding: '15px',
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeaa7',
      borderRadius: '6px',
      marginTop: '15px'
    }}>
      <p style={{ color: '#856404', margin: 0 }}>
        📋 Order data would be displayed here with tables and filters.
      </p>
    </div>
  </div>
));

const ProductContent = React.memo(() => (
  <div>
    <h2 style={{
      fontSize: '22px',
      color: '#333',
      marginBottom: '15px'
    }}>
      📦 Product Data View
    </h2>
    <p style={{ color: '#666', fontSize: '16px' }}>
      This would show product variants, size charts, and manufacturing details.
    </p>
    <div style={{
      padding: '15px',
      backgroundColor: '#cce5ff',
      border: '1px solid #80bdff',
      borderRadius: '6px',
      marginTop: '15px'
    }}>
      <p style={{ color: '#004085', margin: 0 }}>
        📊 Product catalog and inventory data would be shown here.
      </p>
    </div>
  </div>
));

const DatabaseDashboardNoIcons = () => {
  const [activeTab, setActiveTab] = useState('users');

  // Performance optimization: Memoize content component to prevent unnecessary re-renders
  const currentContent = useMemo(() => {
    switch (activeTab) {
      case 'users':
        return <UserContent />;
      case 'orders':
        return <OrderContent />;
      case 'products':
        return <ProductContent />;
      default:
        return <UserContent />;
    }
  }, [activeTab]);

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          {/* Header */}
          <h1 style={styles.header}>
            📊 Database Dashboard (No External Dependencies)
          </h1>

          {/* Tab Navigation */}
          <div style={styles.tabContainer}>
            <div style={styles.tabWrapper}>
              {TABS_DATA.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    ...styles.baseButton,
                    ...(activeTab === key ? styles.activeButton : styles.inactiveButton)
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div>
            {currentContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseDashboardNoIcons;
