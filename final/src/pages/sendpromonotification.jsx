import React, { useState, useCallback, useMemo, memo } from 'react';
import { Filter, Download, Mail, Eye, Trash2 } from 'lucide-react';

// Constants and Configuration
const FILTER_OPTIONS = {
  dateRange: [
    { value: 'last 7 days', label: 'last 7 days' },
    { value: 'last 30 days', label: 'last 30 days' },
    { value: 'last 90 days', label: 'last 90 days' }
  ],
  userType: [
    { value: 'all', label: 'all' },
    { value: 'registered', label: 'registered' },
    { value: 'guest', label: 'guest' }
  ],
  countryRegion: [
    { value: 'all', label: 'all' },
    { value: 'US', label: 'United States' },
    { value: 'IN', label: 'India' }
  ],
  sortBy: [
    { value: 'last active', label: 'last active' },
    { value: 'name', label: 'name' },
    { value: 'email', label: 'email' }
  ]
};

const NOTIFICATION_TYPES = [
  { value: 'both', label: 'Email & SMS' },
  { value: 'email', label: 'Email Only' },
  { value: 'sms', label: 'SMS Only' }
];

const INITIAL_PROMO_FORM = {
  title: '',
  message: '',
  discountCode: '',
  discountPercent: '',
  expiryDate: '',
  targetAudience: 'all',
  notificationType: 'both'
};

const INITIAL_FILTERS = {
  dateRange: 'last 7 days',
  userType: 'all',
  countryRegion: 'all',
  sortBy: 'last active'
};

const INITIAL_MODAL_STATES = {
  isComposeModalOpen: false,
  isBulkModalOpen: false,
  selectedUsers: []
};

// Performance optimized constants
const STATUS_BADGE_CLASSES = {
  active: 'bg-green-100 text-green-800',
  registered: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
  default: 'bg-gray-100 text-gray-800'
};

const BASE_STATUS_CLASSES = 'inline-flex px-2 py-1 text-xs font-semibold rounded-full';

const ACTION_BUTTON_VARIANTS = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-green-600 text-white hover:bg-green-700',
  danger: 'bg-red-600 text-white hover:bg-red-700'
};

const BASE_BUTTON_CLASSES = 'px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm';
const DISABLED_CLASSES = 'opacity-50 cursor-not-allowed';

const FORM_FIELD_CLASSES = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

const USER_TABLE_FIELDS = ['userId', 'email', 'mobile', 'userName', 'userType', 'lastActive'];

const STATS_LABELS = [
  { key: 'emptyCartStatus', label: 'total users' },
  { key: 'registeredUsers', label: 'registered users' },
  { key: 'guests', label: 'guests' },
  { key: 'avgVisitTime', label: 'avg engagement' }
];

const TABLE_HEADERS = [
  'Select',
  'user id', 
  'email', 
  'mobile', 
  'user name', 
  'user type', 
  'last active', 
  'status', 
  'action'
];

/**
 * Send Promo Notification Component
 * 
 * REFACTORED ARCHITECTURE:
 * ========================
 * 
 * 1. CONSTANTS & CONFIGURATION
 *    - FILTER_OPTIONS: Dropdown option configurations
 *    - NOTIFICATION_TYPES: Email/SMS type options
 *    - INITIAL_* objects: Default state values
 * 
 * 2. STATE MANAGEMENT
 *    - filters: Filter selections (date, user type, country, sort)
 *    - modalStates: Modal visibility and selection state
 *    - promoForm: Promotional notification form data
 *    - users: User data with selection status
 * 
 * 3. COMPUTED VALUES
 *    - stats: Performance statistics (memoized)
 *    - selectedUsersCount: Count of selected users
 *    - selectedUsers: Array of selected user objects
 * 
 * 4. EVENT HANDLERS (Organized by Category)
 *    - Filter Management: handleFilterChange
 *    - User Selection: handleUserSelect, handleSelectAll
 *    - Bulk Actions: handleBulkAction, handleBulkPromoEmail, handleBulkPromoSMS
 *    - Form Management: handlePromoFormChange, resetPromoForm
 *    - User Actions: handleSendPromoEmail, handleViewProfile, handleDeleteUser
 *    - Modal Management: closeComposeModal, closeBulkModal, closeAllModals
 *    - Notification Sending: handleSendPromo
 * 
 * 5. UI HELPER FUNCTIONS
 *    - getStatusBadgeClass: Status badge styling
 *    - renderFilterSelect: Reusable filter dropdown
 *    - renderActionButton: Reusable action button
 *    - renderUserRow: Table row component
 *    - renderFormField: Reusable form field component
 * 
 * 6. COMPONENT STRUCTURE
 *    - Header with title and action buttons
 *    - Statistics dashboard
 *    - Filter controls
 *    - User data table with actions
 *    - Compose modal for individual notifications
 *    - Bulk modal for mass notifications
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - All callbacks are memoized with useCallback
 * - Computed values use useMemo
 * - Component is wrapped with memo()
 * - Helper components prevent duplicate JSX
 * - Efficient state updates with functional updates
 */
const SendPromoNotification = memo(() => {
  // State Management
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [modalStates, setModalStates] = useState(INITIAL_MODAL_STATES);
  const [promoForm, setPromoForm] = useState(INITIAL_PROMO_FORM);

  // Sample users data - In production, this would come from an API
  const [users, setUsers] = useState([
    {
      id: 1,
      userId: 'rithikmahaj',
      email: 'rithikmahajan27@gmail.com',
      mobile: '9001146595',
      userName: 'rithikmahaj',
      userType: 'guest',
      dob: '06/05/1999',
      gender: 'M',
      lastActive: '09/05/1999',
      avgVisitTime: '8hours',
      abandonedCart: 'yes',
      status: 'registered',
      isSelected: false
    },
    {
      id: 2,
      userId: 'user123',
      email: 'user123@example.com',
      mobile: '9876543210',
      userName: 'user123',
      userType: 'registered',
      dob: '15/03/1995',
      gender: 'F',
      lastActive: '15/07/1999',
      avgVisitTime: '5hours',
      abandonedCart: 'no',
      status: 'active',
      isSelected: false
    }
  ]);

  // Computed Values - Optimized with better memoization
  const stats = useMemo(() => ({
    emptyCartStatus: 2000,
    registeredUsers: 2000,
    guests: 2000,
    avgVisitTime: '1 min'
  }), []);

  const selectedUsersCount = useMemo(() => 
    users.filter(user => user.isSelected).length,
    [users]
  );

  const allUsersSelected = useMemo(() => 
    users.length > 0 && users.every(user => user.isSelected),
    [users]
  );

  const hasSelectedUsers = useMemo(() => selectedUsersCount > 0, [selectedUsersCount]);

  const isFormValid = useMemo(() => 
    Boolean(promoForm.title && promoForm.message),
    [promoForm.title, promoForm.message]
  );

  // Event Handlers - Filter Management
  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  // Event Handlers - User Selection
  const handleUserSelect = useCallback((userId) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isSelected: !user.isSelected }
        : user
    ));
  }, []);

  const handleSelectAll = useCallback(() => {
    setUsers(prev => prev.map(user => ({ ...user, isSelected: !allUsersSelected })));
  }, [allUsersSelected]);

  // Event Handlers - Bulk Actions - Optimized dependencies
  const handleBulkAction = useCallback((actionType) => {
    if (!hasSelectedUsers) return;
    
    console.log(`Sending promotional ${actionType} to:`, selectedUsersCount, 'users');
    setModalStates(prev => ({ ...prev, isBulkModalOpen: true }));
  }, [hasSelectedUsers, selectedUsersCount]);

  const handleBulkPromoEmail = useCallback(() => handleBulkAction('email'), [handleBulkAction]);
  const handleBulkPromoSMS = useCallback(() => handleBulkAction('SMS'), [handleBulkAction]);

  const handleExportCSV = useCallback(() => {
    console.log('Exporting promotional target data to CSV');
    // TODO: Implement CSV export functionality
  }, []);

  // Event Handlers - Form Management
  const handlePromoFormChange = useCallback((field, value) => {
    setPromoForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetPromoForm = useCallback(() => {
    setPromoForm(INITIAL_PROMO_FORM);
  }, []);

  // Event Handlers - Individual User Actions
  const handleSendPromoEmail = useCallback((userId) => {
    console.log('Sending promotional email to user:', userId);
    setModalStates(prev => ({ ...prev, isComposeModalOpen: true }));
  }, []);

  const handleViewProfile = useCallback((userId) => {
    console.log('Viewing profile for promotional targeting user:', userId);
    // TODO: Implement profile view functionality
  }, []);

  const handleDeleteUser = useCallback((userId) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  }, []);

  // Event Handlers - Modal Management
  const closeComposeModal = useCallback(() => {
    setModalStates(prev => ({ ...prev, isComposeModalOpen: false }));
  }, []);

  const closeBulkModal = useCallback(() => {
    setModalStates(prev => ({ ...prev, isBulkModalOpen: false }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModalStates(INITIAL_MODAL_STATES);
  }, []);

  // Event Handlers - Notification Sending - Optimized dependencies
  const handleSendPromo = useCallback(() => {
    if (!isFormValid) {
      console.warn('Title and message are required');
      return;
    }

    console.log('Sending promotional notification:', {
      ...promoForm,
      targetUsers: selectedUsersCount
    });

    // Reset form and close modals
    resetPromoForm();
    closeAllModals();
    
    // TODO: Implement actual notification sending logic
  }, [promoForm, selectedUsersCount, resetPromoForm, closeAllModals, isFormValid]);

  // UI Helper Functions - Optimized with pre-computed classes
  const getStatusBadgeClass = useCallback((status) => {
    const statusClass = STATUS_BADGE_CLASSES[status] || STATUS_BADGE_CLASSES.default;
    return `${BASE_STATUS_CLASSES} ${statusClass}`;
  }, []);

  // Render Helper Components
  const renderFilterSelect = useCallback((label, value, options, field) => (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => handleFilterChange(field, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ), [handleFilterChange]);

  // Render Helper Components - Optimized with pre-computed classes
  const renderActionButton = useCallback((onClick, icon, text, variant = 'primary', disabled = false) => {
    const Icon = icon;
    const variantClass = ACTION_BUTTON_VARIANTS[variant];
    const className = `${BASE_BUTTON_CLASSES} ${variantClass} ${disabled ? DISABLED_CLASSES : ''}`;
    
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={className}
      >
        <Icon className="h-4 w-4" />
        {text}
      </button>
    );
  }, []);

  // Render Helper Components for Table - Optimized with constants
  const renderUserRow = useCallback((user) => (
    <tr key={user.id} className={`hover:bg-gray-50 ${user.isSelected ? 'bg-blue-50' : ''}`}>
      <td className="px-4 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={user.isSelected}
          onChange={() => handleUserSelect(user.id)}
          className="rounded border-gray-300"
        />
      </td>
      {USER_TABLE_FIELDS.map(field => (
        <td key={field} className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
          {user[field]}
        </td>
      ))}
      <td className="px-4 py-4 whitespace-nowrap">
        <span className={getStatusBadgeClass(user.status)}>
          {user.status}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex gap-2">
          <button
            onClick={() => handleViewProfile(user.id)}
            className="bg-green-100 text-green-800 px-3 py-1 text-xs rounded hover:bg-green-200 flex items-center gap-1"
          >
            <Eye className="h-3 w-3" />
            view profile
          </button>
          <button
            onClick={() => handleSendPromoEmail(user.id)}
            className="bg-blue-600 text-white px-3 py-1 text-xs rounded hover:bg-blue-700 flex items-center gap-1"
          >
            <Mail className="h-3 w-3" />
            send promo
          </button>
          <button
            onClick={() => handleDeleteUser(user.id)}
            className="bg-red-600 text-white px-3 py-1 text-xs rounded hover:bg-red-700 flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            remove
          </button>
        </div>
      </td>
    </tr>
  ), [handleUserSelect, getStatusBadgeClass, handleViewProfile, handleSendPromoEmail, handleDeleteUser]);

  const renderFormField = useCallback((label, field, type = 'text', options = null, placeholder = '') => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        {type === 'textarea' ? (
          <textarea
            value={promoForm[field]}
            onChange={(e) => handlePromoFormChange(field, e.target.value)}
            rows={4}
            className={FORM_FIELD_CLASSES}
            placeholder={placeholder}
          />
        ) : type === 'select' ? (
          <select
            value={promoForm[field]}
            onChange={(e) => handlePromoFormChange(field, e.target.value)}
            className={FORM_FIELD_CLASSES}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={promoForm[field]}
            onChange={(e) => handlePromoFormChange(field, e.target.value)}
            className={FORM_FIELD_CLASSES}
            placeholder={placeholder}
            min={type === 'number' ? '0' : undefined}
            max={type === 'number' && field === 'discountPercent' ? '100' : undefined}
          />
        )}
      </div>
    );
  }, [promoForm, handlePromoFormChange]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Send Promo Notifications</h1>
        <p className="text-gray-600">Target users with promotional offers and notifications</p>
        
        {/* Action Buttons */}
        <div className="flex gap-3 mb-6 mt-4">
          {renderActionButton(
            handleBulkPromoEmail, 
            Mail, 
            `Bulk Promo Email (${selectedUsersCount})`, 
            'primary',
            !hasSelectedUsers
          )}
          {renderActionButton(
            handleBulkPromoSMS, 
            Mail, 
            `+ Bulk Promo SMS (${selectedUsersCount})`, 
            'primary',
            !hasSelectedUsers
          )}
          {renderActionButton(
            handleExportCSV, 
            Download, 
            'Export Target Users', 
            'secondary'
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          {STATS_LABELS.map(({ key, label }) => (
            <div key={key} className="text-center">
              <p className="text-sm text-gray-600 mb-1">{label}</p>
              <p className="text-xl font-bold text-gray-900">{stats[key]}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {renderFilterSelect('date range', filters.dateRange, FILTER_OPTIONS.dateRange, 'dateRange')}
          {renderFilterSelect('user type', filters.userType, FILTER_OPTIONS.userType, 'userType')}
          {renderFilterSelect('country/region', filters.countryRegion, FILTER_OPTIONS.countryRegion, 'countryRegion')}
          {renderFilterSelect('sort by', filters.sortBy, FILTER_OPTIONS.sortBy, 'sortBy')}
        </div>
      </div>

      {/* User Details Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Target Users</h2>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allUsersSelected}
                onChange={handleSelectAll}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">Select All</span>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors text-sm">
              + Sort and Export CSV
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {TABLE_HEADERS.map(header => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(renderUserRow)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compose Promo Modal */}
      {modalStates.isComposeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Compose Promotional Notification</h2>
              <button
                onClick={closeComposeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {renderFormField('Notification Title', 'title', 'text', null, 'Special Offer Just For You!')}
              {renderFormField('Promotional Message', 'message', 'textarea', null, 'Don\'t miss out on our exclusive offer...')}
              
              <div className="grid grid-cols-2 gap-4">
                {renderFormField('Discount Code', 'discountCode', 'text', null, 'SAVE20')}
                {renderFormField('Discount Percentage', 'discountPercent', 'number', null, '20')}
              </div>

              {renderFormField('Offer Expiry Date', 'expiryDate', 'date')}
              {renderFormField('Send Via', 'notificationType', 'select', NOTIFICATION_TYPES)}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={closeComposeModal}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendPromo}
                disabled={!isFormValid}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Promotional Notification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Promo Modal */}
      {modalStates.isBulkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Bulk Promotional Notification ({selectedUsersCount} users)
              </h2>
              <button
                onClick={closeBulkModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {renderFormField('Notification Title', 'title', 'text', null, 'Special Bulk Offer!')}
              {renderFormField('Promotional Message', 'message', 'textarea', null, 'Exclusive offer for our valued customers...')}
              
              <div className="grid grid-cols-2 gap-4">
                {renderFormField('Discount Code', 'discountCode', 'text', null, 'BULK25')}
                {renderFormField('Discount Percentage', 'discountPercent', 'number', null, '25')}
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={closeBulkModal}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendPromo}
                disabled={!isFormValid}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send to {selectedUsersCount} Users
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

SendPromoNotification.displayName = 'SendPromoNotification';

export default SendPromoNotification;
