import React, { useState, useCallback, useMemo, memo } from "react";
import { Filter, Download, Mail, Eye, Trash2, Plus } from "lucide-react";
import BulkSMS from "./BulkSMS";

// Constant data moved outside component to prevent recreation on each render
const INITIAL_USERS = [
  {
    id: 1,
    userId: "rithikmaha",
    email: "rithikmahajan27@gmail.com",
    mobile: "7006114695",
    userName: "rithikmaha",
    userType: "guest",
    dob: "06/05/1999",
    gender: "M",
    lastActive: "06/05/1999",
    avgVisitTime: "9hours",
    abandonedCart: "yes",
    status: "registered",
  },
];

const STATS = {
  emptyCartStatus: 2000,
  registeredUsers: 2000,
  guests: 2000,
  avgVisitTime: "1 min",
};

const FILTER_OPTIONS = {
  dateRange: [
    { value: "last 7 days", label: "last 7 days" },
    { value: "last 30 days", label: "last 30 days" },
    { value: "last 90 days", label: "last 90 days" },
  ],
  userType: [
    { value: "all", label: "all" },
    { value: "registered", label: "registered" },
    { value: "guest", label: "guest" },
  ],
  countryRegion: [
    { value: "all", label: "all" },
    { value: "US", label: "United States" },
    { value: "IN", label: "India" },
  ],
  sortBy: [
    { value: "last active", label: "last active" },
    { value: "name", label: "name" },
    { value: "email", label: "email" },
  ],
};

// Memoized UserRow component for better table performance
const UserRow = memo(({ user, onViewProfile, onSendEmail, onDeleteUser }) => {
  const handleViewClick = useCallback(
    () => onViewProfile(user.id),
    [user.id, onViewProfile]
  );
  const handleEmailClick = useCallback(
    () => onSendEmail(user.id),
    [user.id, onSendEmail]
  );
  const handleDeleteClick = useCallback(
    () => onDeleteUser(user.id),
    [user.id, onDeleteUser]
  );

  const abandonedCartClass = useMemo(
    () =>
      user.abandonedCart === "yes"
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800",
    [user.abandonedCart]
  );

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        {user.userId}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        {user.email}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        {user.mobile}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        {user.userName}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        {user.userType}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        {user.dob}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        {user.gender}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        {user.lastActive}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        {user.avgVisitTime}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex flex-col gap-1">
          <span
            className={`w-fit px-2 py-1 text-xs font-semibold rounded-md ${abandonedCartClass}`}
          >
            {user.abandonedCart}
          </span>
          <span className="text-xs text-gray-500">{user.status}</span>
          <span className="text-xs text-gray-400">blocked to</span>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex gap-2">
          <button
            onClick={handleViewClick}
            className="bg-green-100 text-green-800 px-3 py-1 text-xs rounded hover:bg-green-200 flex items-center gap-1"
          >
            <Eye className="h-3 w-3" />
            view profile
          </button>
          <button
            onClick={handleEmailClick}
            className="bg-blue-600 text-white px-3 py-1 text-xs rounded hover:bg-blue-700 flex items-center gap-1"
          >
            <Mail className="h-3 w-3" />
            send email
          </button>
          <button
            onClick={handleDeleteClick}
            className="bg-red-600 text-white px-3 py-1 text-xs rounded hover:bg-red-700 flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            delete user
          </button>
        </div>
      </td>
    </tr>
  );
});

UserRow.displayName = "UserRow";

/**
 * Empty Cart Management Component
 *
 * A comprehensive admin interface for managing users with empty carts.
 * Based on the Figma design, this component provides:
 * - View users with empty carts
 * - Filter by date range, user type, and country/region
 * - Send bulk emails and SMS
 * - Export data for analysis
 * - Individual user actions
 *
 * Performance Optimizations:
 * - Memoized callbacks to prevent unnecessary re-renders
 * - Optimized state structure
 * - Efficient component updates
 * - Constants moved outside component
 * - Memoized filter options and user data
 */
const CartAbandonmentRecovery = memo(() => {
  // Filter states
  const [filters, setFilters] = useState({
    dateRange: "last 7 days",
    userType: "all",
    countryRegion: "all",
    sortBy: "last active",
  });

  // Page state
  const [showBulkSMS, setShowBulkSMS] = useState(false);

  // Sample users data with empty carts - using constant reference
  const [users, setUsers] = useState(INITIAL_USERS);

  // Memoized filtered users for performance
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (filters.userType !== "all" && user.userType !== filters.userType) {
        return false;
      }
      // Add more filtering logic here if needed
      return true;
    });
  }, [users, filters]);

  // Handle filter changes
  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Handle bulk actions
  const handleBulkEmail = useCallback(() => {
    console.log("Sending bulk email to users with empty carts");
  }, []);

  const handleBulkSMS = useCallback(() => {
    setShowBulkSMS(true);
  }, []);

  const handleExportCSV = useCallback(() => {
    console.log("Exporting user data to CSV");
  }, []);

  // Handle individual user actions
  const handleViewProfile = useCallback((userId) => {
    console.log("Viewing profile for user:", userId);
  }, []);

  const handleSendEmail = useCallback((userId) => {
    console.log("Sending email to user:", userId);
  }, []);

  const handleDeleteUser = useCallback((userId) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId));
  }, []);

  // Handle close bulk SMS page
  const handleCloseBulkSMS = useCallback(() => {
    setShowBulkSMS(false);
  }, []);

  // If showing bulk SMS page, render it instead
  if (showBulkSMS) {
    return <BulkSMS onClose={handleCloseBulkSMS} />;
  }

  const StatCard = ({ label, value }) => (
    <div className="bg-white shadow-sm border rounded-lg p-4 text-center">
      <p className="text-sm font-semibold text-gray-500">{label}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header and Actions */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-12">
          Empty Cart
        </h1>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleBulkSMS}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition"
          >
            <Plus className="h-4 w-4" />
            Bulk SMS/Email
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Empty Cart Status" value={STATS.emptyCartStatus} />
        <StatCard label="Registered Users" value={STATS.registeredUsers} />
        <StatCard label="Guests" value={STATS.guests} />
        <StatCard label="Avg Visit Time" value={STATS.avgVisitTime} />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {["dateRange", "userType", "countryRegion", "sortBy"].map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
              {key.replace(/([A-Z])/g, " $1")}
            </label>
            <select
              value={filters[key]}
              onChange={(e) => handleFilterChange(key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            >
              {FILTER_OPTIONS[key].map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* User Details Table */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
          <div className="flex gap-4">
            <button className="bg-slate-100 border border-slate-300 text-black px-4 py-2 rounded-lg text-sm transition flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Sort and Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <tr>
                {[
                  "User ID",
                  "Email",
                  "Mobile",
                  "Username",
                  "User Type",
                  "DOB",
                  "Gender",
                  "Last Active",
                  "Avg Visit Time",
                  "Abandon Cart",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left whitespace-nowrap"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onViewProfile={handleViewProfile}
                  onSendEmail={handleSendEmail}
                  onDeleteUser={handleDeleteUser}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

CartAbandonmentRecovery.displayName = "CartAbandonmentRecovery";

export default CartAbandonmentRecovery;
