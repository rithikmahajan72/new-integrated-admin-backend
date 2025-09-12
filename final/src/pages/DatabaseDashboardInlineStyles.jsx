import React, { useState, useMemo, useCallback } from 'react';

// Static styles to prevent recreation on every render
const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9fafb',
    minHeight: '100vh'
  },
  wrapper: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  header: {
    borderBottom: '1px solid #e5e7eb',
    padding: '20px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0
  },
  tabNavigation: {
    borderBottom: '1px solid #e5e7eb',
    padding: '0 20px'
  },
  tabContainer: {
    display: 'flex',
    gap: '30px'
  },
  tabButtonBase: {
    padding: '15px 8px',
    border: 'none',
    background: 'none',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '14px'
  },
  tabButtonActive: {
    borderBottom: '2px solid #3b82f6',
    color: '#3b82f6'
  },
  tabButtonInactive: {
    borderBottom: '2px solid transparent',
    color: '#6b7280'
  },
  content: {
    padding: '20px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '15px'
  },
  sectionText: {
    color: '#6b7280',
    marginBottom: '15px'
  },
  sectionTextNoMargin: {
    color: '#6b7280'
  },
  successBox: {
    padding: '15px',
    backgroundColor: '#dbeafe',
    border: '1px solid #93c5fd',
    borderRadius: '6px'
  },
  successText: {
    color: '#1e40af',
    margin: 0
  }
};

// Static tab configuration
const TAB_CONFIG = [
  { key: 'users', label: '👤 User Data' },
  { key: 'orders', label: '🛒 Order Data' },
  { key: 'products', label: '📦 Product Data' }
];

const DatabaseDashboardInlineStyles = () => {
  const [activeTab, setActiveTab] = useState('users');

  // Memoized tab click handler to prevent recreation
  const handleTabClick = useCallback((tabKey) => {
    setActiveTab(tabKey);
  }, []);

  // Memoized tab buttons to prevent unnecessary re-renders
  const tabButtons = useMemo(() => 
    TAB_CONFIG.map(({ key, label }) => {
      const isActive = activeTab === key;
      const buttonStyle = {
        ...styles.tabButtonBase,
        ...(isActive ? styles.tabButtonActive : styles.tabButtonInactive)
      };

      return (
        <button
          key={key}
          onClick={() => handleTabClick(key)}
          style={buttonStyle}
        >
          {label}
        </button>
      );
    }), [activeTab, handleTabClick]
  );

  // Memoized content components to prevent recreation
  const renderContent = useMemo(() => {
    switch (activeTab) {
      case 'users':
        return (
          <div>
            <h2 style={styles.sectionTitle}>
              User Data View
            </h2>
            <p style={styles.sectionText}>
              User data content would go here...
            </p>
            <div style={styles.successBox}>
              <p style={styles.successText}>
                ✅ DatabaseDashboard (inline styles) is working!
              </p>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div>
            <h2 style={styles.sectionTitle}>
              Order Data View
            </h2>
            <p style={styles.sectionTextNoMargin}>
              Order data content would go here...
            </p>
          </div>
        );
      case 'products':
        return (
          <div>
            <h2 style={styles.sectionTitle}>
              Product Data View
            </h2>
            <p style={styles.sectionTextNoMargin}>
              Product data content would go here...
            </p>
          </div>
        );
      default:
        return null;
    }
  }, [activeTab]);

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>
              📊 Database Dashboard (Inline Styles)
            </h1>
          </div>

          {/* Tab Navigation */}
          <div style={styles.tabNavigation}>
            <div style={styles.tabContainer}>
              {tabButtons}
            </div>
          </div>

          {/* Content Area */}
          <div style={styles.content}>
            {renderContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseDashboardInlineStyles;
