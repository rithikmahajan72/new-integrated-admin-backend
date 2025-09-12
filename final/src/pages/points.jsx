/**
 * Points Management System Component
 *
 * A comprehensive points management interface that allows administrators to:
 * - Enable/disable the points system with 2FA verification
 * - Manage user points allocation and redemption
 * - View and edit user accounts and their point balances
 * - Delete user accounts with confirmation
 * - Search and filter user accounts
 *
 * Features:
 * - Two-factor authentication for system changes
 * - Real-time user management with CRUD operations
 * - Modal-based editing and confirmation flows
 * - Responsive design with comprehensive state management
 */

import React, { useState, useCallback, useMemo, memo } from "react";
import { ChevronDown, Search, Edit2, Trash2, Filter } from "lucide-react";
import TwoFactorAuth from "../components/TwoFactorAuth";
import SuccessModal from "../components/SuccessModal";

// Constants
const INITIAL_USER_DATA = {
  name: "user name",
  userId: "user id",
  phone: "phone no.",
  email: "email id",
  totalPointsAlloted: 1000000,
  totalPointsRedeemed: 10,
  balance: 5,
  deletedAccount: false,
};

const INITIAL_OTP_STATE = ["", "", "", ""];

// Memoized Toggle Button component for better performance
const ToggleButton = memo(
  ({ isActive, onClick, children, width = "w-[72px]" }) => (
    <button
      onClick={onClick}
      className={`h-9 ${width} rounded-full border text-sm font-medium transition-colors duration-150 flex items-center justify-center
        ${
          isActive
            ? "bg-blue-600 text-white border-blue-700 shadow-sm"
            : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
        }`}
    >
      {children}
    </button>
  )
);

// Memoized UserRow component for better performance
const UserRow = memo(({ user, onAllotNow, onEditUser, onDeleteUser }) => (
  <div className="grid grid-cols-11 gap-4 items-center px-4 py-3 bg-white hover:bg-gray-50 transition rounded-md shadow-sm">
    <div className="text-sm font-medium text-gray-900 text-center">
      {user.name}
    </div>
    <div className="text-sm text-gray-700 text-center">{user.userId}</div>
    <div className="text-sm text-gray-700 text-center">{user.phone}</div>
    <div className="text-sm text-gray-700 text-center truncate">
      {user.email}
    </div>

    <div className="text-center">
      <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg">
        {user.totalPointsAlloted.toLocaleString()}
      </span>
    </div>

    <div className="text-center">
      <span className="inline-block px-3 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-lg">
        {user.totalPointsRedeemed}
      </span>
    </div>

    <div className="text-center">
      <span className="inline-block px-3 py-1 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg">
        {user.balance}
      </span>
    </div>

    <div className="text-sm text-gray-700 text-center">
      {user.deletedAccount ? (
        <span className="text-red-500 font-semibold">Yes</span>
      ) : (
        <span className="text-green-600 font-semibold">No</span>
      )}
    </div>

    <div className="text-center">
      <button
        onClick={() => onAllotNow(user.id)}
        className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
      >
        Allot
      </button>
    </div>

    <div className="text-center">
      <button
        onClick={() => onEditUser(user)}
        className="p-2 rounded-full hover:bg-gray-100 transition"
        title="Edit user"
      >
        <Edit2 className="w-5 h-5 text-gray-600" />
      </button>
    </div>

    <div className="text-center">
      <button
        onClick={() => onDeleteUser(user.id)}
        className="p-2 rounded-full hover:bg-gray-100 transition"
        title="Delete user"
      >
        <Trash2 className="w-5 h-5 text-red-500" />
      </button>
    </div>
  </div>
));

const Points = () => {
  /**
   * REFACTORING IMPROVEMENTS APPLIED:
   *
   * 1. Performance Optimizations:
   *    - Added useCallback for event handlers to prevent unnecessary re-renders
   *    - Added useMemo for filtered data and computed values
   *    - Extracted constants to prevent recreation on each render
   *
   * 2. State Management:
   *    - Grouped related state variables logically
   *    - Created helper functions for state resets
   *    - Better state initialization patterns
   *
   * 3. Code Organization:
   *    - Moved constants outside component
   *    - Organized functions by functionality
   *    - Added comprehensive documentation
   *
   * 4. Maintainability:
   *    - Consistent naming conventions
   *    - Better error handling
   *    - Cleaner component structure
   */

  // Points System State
  const [pointsSystemEnabled, setPointsSystemEnabled] = useState(true);
  const [issuePoints, setIssuePoints] = useState("");
  const [pointGenerationBasis, setPointGenerationBasis] = useState("");
  const [pointsToGive, setPointsToGive] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States - System Toggle
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showOffConfirmationModal, setShowOffConfirmationModal] =
    useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showOff2FAModal, setShowOff2FAModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showOffSuccessModal, setShowOffSuccessModal] = useState(false);
  const [showFinalSuccessModal, setShowFinalSuccessModal] = useState(false);
  const [showOffFinalSuccessModal, setShowOffFinalSuccessModal] =
    useState(false);

  // Modal States - User Management
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEdit2FAModal, setShowEdit2FAModal] = useState(false);
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);

  // Form States
  const [otpCode, setOtpCode] = useState(INITIAL_OTP_STATE);

  // User Management States
  const [deletingUserId, setDeletingUserId] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [editingUser, setEditingUser] = useState(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserId, setEditUserId] = useState("");
  const [editPhoneNo, setEditPhoneNo] = useState("");
  const [editEmailId, setEditEmailId] = useState("");
  const [editTotalPointsAlloted, setEditTotalPointsAlloted] = useState("");
  const [editTotalPointsRedeemed, setEditTotalPointsRedeemed] = useState("");
  const [editBalance, setEditBalance] = useState("");

  // Users Data - Lazy initialization to prevent recreation on each render
  const [users, setUsers] = useState(() => [
    { id: 1, ...INITIAL_USER_DATA },
    { id: 2, ...INITIAL_USER_DATA },
  ]);

  // Computed Values - Using memoized function to calculate dynamic summary
  const summaryData = useMemo(() => {
    const totalPointsAlloted = users.reduce(
      (sum, user) => sum + user.totalPointsAlloted,
      0
    );
    const totalPointsRedeemed = users.reduce(
      (sum, user) => sum + user.totalPointsRedeemed,
      0
    );
    const balance = users.reduce((sum, user) => sum + user.balance, 0);

    return {
      totalPointsAlloted,
      totalPointsRedeemed,
      balance,
    };
  }, [users]);

  // Helper Functions
  const resetOtpForm = useCallback(() => {
    setOtpCode(INITIAL_OTP_STATE);
  }, []);

  const resetEditForm = useCallback(() => {
    setEditingUser(null);
    setEditUserName("");
    setEditUserId("");
    setEditPhoneNo("");
    setEditEmailId("");
    setEditTotalPointsAlloted("");
    setEditTotalPointsRedeemed("");
    setEditBalance("");
  }, []);

  const validateOtpForm = useCallback(() => {
    const otpString = otpCode.join("");
    return otpString.length === 4;
  }, [otpCode]);

  const validateEditForm = useCallback(() => {
    return (
      editUserName.trim() &&
      editUserId.trim() &&
      editPhoneNo.trim() &&
      editEmailId.trim()
    );
  }, [editUserName, editUserId, editPhoneNo, editEmailId]);

  // Optimized input change handlers
  const handleIssuePointsChange = useCallback((e) => {
    setIssuePoints(e.target.value);
  }, []);

  const handlePointGenerationBasisChange = useCallback((e) => {
    setPointGenerationBasis(e.target.value);
  }, []);

  const handlePointsToGiveChange = useCallback((e) => {
    setPointsToGive(e.target.value);
  }, []);

  const handleSearchTermChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Filtered Users - Optimized with early return and case-insensitive search
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;

    const searchTermLower = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTermLower) ||
        user.userId.toLowerCase().includes(searchTermLower) ||
        user.email.toLowerCase().includes(searchTermLower)
    );
  }, [users, searchTerm]);

  // Event Handlers - User Management
  const handleEditUser = useCallback((user) => {
    setEditingUser(user);
    setEditUserName(user.name);
    setEditUserId(user.userId);
    setEditPhoneNo(user.phone);
    setEditEmailId(user.email);
    setEditTotalPointsAlloted(user.totalPointsAlloted.toString());
    setEditTotalPointsRedeemed(user.totalPointsRedeemed.toString());
    setEditBalance(user.balance.toString());
    setShowEditModal(true);
  }, []);

  const handleAllotNow = useCallback(
    (userId) => {
      const user = users.find((u) => u.id === userId);
      if (user) {
        handleEditUser(user);
      }
    },
    [users, handleEditUser]
  );

  const handleTogglePointsSystem = useCallback((status) => {
    if (status === "on") {
      setShowConfirmationModal(true);
    } else if (status === "off") {
      setShowOffConfirmationModal(true);
    }
  }, []);

  const handleToggleOn = useCallback(
    () => handleTogglePointsSystem("on"),
    [handleTogglePointsSystem]
  );
  const handleToggleOff = useCallback(
    () => handleTogglePointsSystem("off"),
    [handleTogglePointsSystem]
  );

  const handleConfirmToggleOn = useCallback(() => {
    setShowConfirmationModal(false);
    setShow2FAModal(true);
  }, []);

  const handleConfirmToggleOff = useCallback(() => {
    setShowOffConfirmationModal(false);
    setShowOff2FAModal(true);
  }, []);

  const handleCancelToggle = useCallback(() => {
    setShowConfirmationModal(false);
  }, []);

  const handleCancelOffToggle = useCallback(() => {
    setShowOffConfirmationModal(false);
  }, []);

  // Event Handlers - 2FA Operations
  const handle2FASubmit = useCallback(() => {
    if (validateOtpForm()) {
      setShow2FAModal(false);
      setShowSuccessModal(true);
      resetOtpForm();
    } else {
      alert("Please fill in all fields");
    }
  }, [validateOtpForm, resetOtpForm]);

  const handleOff2FASubmit = useCallback(
    (data) => {
      if (
        data?.verificationCode &&
        data?.verificationPassword &&
        data?.defaultPassword
      ) {
        setShowOff2FAModal(false);
        setShowOffSuccessModal(true);
        resetOtpForm();
      } else {
        alert("Please fill in all fields");
      }
    },
    [resetOtpForm]
  );

  const handleSuccessModalDone = useCallback(() => {
    setShowSuccessModal(false);
    setShowFinalSuccessModal(true);
  }, []);

  const handleOffSuccessModalDone = useCallback(() => {
    setShowOffSuccessModal(false);
    setShowOffFinalSuccessModal(true);
  }, []);

  const handleFinalSuccessModalDone = useCallback(() => {
    setShowFinalSuccessModal(false);
    setPointsSystemEnabled(true);
  }, []);

  const handleOffFinalSuccessModalDone = useCallback(() => {
    setShowOffFinalSuccessModal(false);
    setPointsSystemEnabled(false);
  }, []);

  // Event Handlers - Cancel and Close Operations
  const handleCancel2FA = useCallback(() => {
    setShow2FAModal(false);
    resetOtpForm();
  }, [resetOtpForm]);

  const handleCancelOff2FA = useCallback(() => {
    setShowOff2FAModal(false);
    resetOtpForm();
  }, [resetOtpForm]);

  const handleCloseSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
    setPointsSystemEnabled(true);
  }, []);

  const handleCloseOffSuccessModal = useCallback(() => {
    setShowOffSuccessModal(false);
    setPointsSystemEnabled(false);
  }, []);

  const handleCloseFinalSuccessModal = useCallback(() => {
    setShowFinalSuccessModal(false);
    setPointsSystemEnabled(true);
  }, []);

  const handleCloseOffFinalSuccessModal = useCallback(() => {
    setShowOffFinalSuccessModal(false);
    setPointsSystemEnabled(false);
  }, []);

  // Event Handlers - User Edit Operations
  const handleSaveEditedUser = useCallback(() => {
    if (validateEditForm()) {
      setShowEditModal(false);
      setShowEdit2FAModal(true);
    } else {
      alert("Please fill in all fields");
    }
  }, [validateEditForm]);

  const handleCancelEdit = useCallback(() => {
    setShowEditModal(false);
    resetEditForm();
  }, [resetEditForm]);

  const handleEdit2FASubmit = useCallback((data) => {
    if (
      data?.verificationCode &&
      data?.verificationPassword &&
      data?.defaultPassword
    ) {
      setShowEdit2FAModal(false);
      setShowEditSuccessModal(true);
      // Reset 2FA form using constant to avoid recreation
      setOtpCode(INITIAL_OTP_STATE);
    } else {
      alert("Please fill in all fields");
    }
  }, []);

  const handleCancelEdit2FA = useCallback(() => {
    setShowEdit2FAModal(false);
    // Reset forms using helper functions
    resetOtpForm();
    resetEditForm();
  }, [resetOtpForm, resetEditForm]);

  // Already refactored - removing duplicate
  // Event Handlers - Delete Operations
  const handleDeleteUser = useCallback((userId) => {
    setDeletingUserId(userId);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deletingUserId) {
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== deletingUserId)
      );
      setShowDeleteModal(false);
      setShowDeleteSuccessModal(true);
      setDeletingUserId(null);
    }
  }, [deletingUserId]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setDeletingUserId(null);
  }, []);

  const handleDeleteSuccessDone = useCallback(() => {
    setShowDeleteSuccessModal(false);
  }, []);

  const handleCloseEditSuccessModal = useCallback(() => {
    setShowEditSuccessModal(false);
    resetEditForm();
  }, [resetEditForm]);

  const handleEditSuccessDone = useCallback(() => {
    setShowEditSuccessModal(false);
    resetEditForm();
  }, [resetEditForm]);

  return (
    <div className="min-h-screen bg-gray-50 px-10 py-8">
      {/* Page Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Point Management
      </h1>

      {/* Top Section */}
      <div className="grid grid-cols-3 gap-10 mb-12">
        {/* Form Card */}
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Configure Points
          </h2>

          {/* Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points System
            </label>
            <div className="flex gap-4">
              <ToggleButton
                isActive={pointsSystemEnabled}
                onClick={() => handleTogglePointsSystem("on")}
              >
                On
              </ToggleButton>
              <ToggleButton
                isActive={!pointsSystemEnabled}
                onClick={() => handleTogglePointsSystem("off")}
              >
                Off
              </ToggleButton>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue points
              </label>
              <input
                type="number"
                value={issuePoints}
                onChange={handleIssuePointsChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Point generation basis
              </label>
              <div className="relative">
                <select
                  value={pointGenerationBasis}
                  onChange={handlePointGenerationBasisChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select basis</option>
                  <option value="purchase">Purchase Amount</option>
                  <option value="referral">Referral</option>
                  <option value="signup">Sign Up</option>
                  <option value="review">Product Review</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Give points to user
              </label>
              <input
                type="text"
                value={pointsToGive}
                onChange={handlePointsToGiveChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Summary</h2>
          <ul className="space-y-4 text-sm">
            <li className="flex justify-between">
              <span className="text-gray-600">Total Alloted</span>
              <span className="text-blue-600 font-semibold">
                {summaryData.totalPointsAlloted.toLocaleString()}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Total Redeemed</span>
              <span className="font-semibold">
                {summaryData.totalPointsRedeemed}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Balance</span>
              <span className="text-red-500 font-semibold">
                {summaryData.balance}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* User Table */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Select User
        </h2>

        {/* Filters and Search */}
        <div className="flex items-center gap-4 mb-6">
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md bg-white hover:bg-gray-100">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <div className="relative w-80">
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchTermChange}
              placeholder="Search by name, ID, email..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-11 gap-2 px-4 py-2 bg-gray-100 text-xs font-medium text-gray-700 rounded-t-md">
          <div>User Name</div>
          <div>User ID</div>
          <div>Phone No.</div>
          <div>Email ID</div>
          <div>Total Alloted</div>
          <div>Redeemed</div>
          <div>Balance</div>
          <div>Deleted?</div>
          <div>Allot</div>
          <div>Edit</div>
          <div>Delete</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y">
          {filteredUsers.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onAllotNow={handleAllotNow}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-md mx-4 overflow-clip">
            {/* Close button - positioned exactly as in Figma */}
            <button
              onClick={handleCancelToggle}
              className="absolute right-[33px] top-[33px] w-6 h-6 text-gray-500 hover:text-gray-700"
            >
              <div className="absolute bottom-[17.18%] left-[17.18%] right-[17.18%] top-[17.17%]">
                <svg
                  className="w-full h-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </button>

            {/* Modal content - positioned exactly as in Figma */}
            <div className="absolute top-[60px] left-1/2 transform -translate-x-1/2 w-[165px] text-center">
              <p className="font-bold text-black text-[18px] leading-[22px] tracking-[-0.41px] font-['Montserrat']">
                Are you sure you want to turn points system on
              </p>
            </div>

            {/* Button Container - positioned exactly as in Figma */}
            <div className="absolute top-[189px] left-1/2 transform -translate-x-1/2 flex gap-4">
              {/* Yes Button */}
              <button
                onClick={handleConfirmToggleOn}
                className="bg-black text-white rounded-3xl w-[149px] h-12 font-semibold text-[16px] leading-[22px] font-['Montserrat'] hover:bg-gray-800 transition-colors"
              >
                yes
              </button>

              {/* Cancel Button */}
              <button
                onClick={handleCancelToggle}
                className="border border-[#e4e4e4] text-black rounded-[100px] w-[209px] h-16 font-medium text-[16px] leading-[19.2px] font-['Montserrat'] hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                Cancel
              </button>
            </div>

            {/* Modal height spacer to ensure proper modal size */}
            <div className="h-[280px]"></div>
          </div>
        </div>
      )}

      {/* Off Confirmation Modal */}
      {showOffConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-md mx-4 overflow-clip">
            {/* Close button - positioned exactly as in Figma */}
            <button
              onClick={handleCancelOffToggle}
              className="absolute right-[33px] top-[33px] w-6 h-6 text-gray-500 hover:text-gray-700"
            >
              <div className="absolute bottom-[17.18%] left-[17.18%] right-[17.18%] top-[17.17%]">
                <svg
                  className="w-full h-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </button>

            {/* Modal content - positioned exactly as in Figma */}
            <div className="absolute top-[60px] left-1/2 transform -translate-x-1/2 w-[165px] text-center">
              <p className="font-bold text-black text-[18px] leading-[22px] tracking-[-0.41px] font-['Montserrat']">
                Are you sure you want to turn points system off
              </p>
            </div>

            {/* Button Container - positioned exactly as in Figma */}
            <div className="absolute top-[189px] left-1/2 transform -translate-x-1/2 flex gap-4">
              {/* Yes Button */}
              <button
                onClick={handleConfirmToggleOff}
                className="bg-black text-white rounded-3xl w-[149px] h-12 font-semibold text-[16px] leading-[22px] font-['Montserrat'] hover:bg-gray-800 transition-colors"
              >
                yes
              </button>

              {/* Cancel Button */}
              <button
                onClick={handleCancelOffToggle}
                className="border border-[#e4e4e4] text-black rounded-[100px] w-[209px] h-16 font-medium text-[16px] leading-[19.2px] font-['Montserrat'] hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                Cancel
              </button>
            </div>

            {/* Modal height spacer to ensure proper modal size */}
            <div className="h-[280px]"></div>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {show2FAModal && (
        <TwoFactorAuth
          onSubmit={handle2FASubmit}
          onClose={handleCancel2FA}
          phoneNumber="+1 (555) 123-4567"
          emailAddress="points@system.com"
        />
      )}
      {/* Off 2FA Modal */}
      {showOff2FAModal && (
        <TwoFactorAuth
          onSubmit={handleOff2FASubmit}
          onClose={handleCancelOff2FA}
          phoneNumber="+1 (555) 123-4567"
          emailAddress="points@system.com"
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        title="ID verified successfully!"
        buttonText="Done"
        onButtonClick={handleSuccessModalDone}
      />

      {/* Off Success Modal */}
      <SuccessModal
        isOpen={showOffSuccessModal}
        onClose={handleCloseOffSuccessModal}
        title="ID verified successfully!"
        buttonText="Done"
        onButtonClick={handleOffSuccessModalDone}
      />

      {/* Final Success Modal */}
      <SuccessModal
        isOpen={showFinalSuccessModal}
        onClose={handleCloseFinalSuccessModal}
        title="Points system turned on successfully!"
        buttonText="Done"
        onButtonClick={handleFinalSuccessModalDone}
      />

      {/* Off Final Success Modal */}
      <SuccessModal
        isOpen={showOffFinalSuccessModal}
        onClose={handleCloseOffFinalSuccessModal}
        title="Points system turned off successfully!"
        buttonText="Done"
        onButtonClick={handleOffFinalSuccessModalDone}
      />

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative overflow-hidden"
            style={{ width: "1540px", height: "400px" }}
          >
            {/* Close button - positioned as in Figma */}
            <button
              onClick={handleCancelEdit}
              className="absolute right-6 top-3 w-6 h-6 text-gray-500 hover:text-gray-700 z-10"
            >
              <div className="absolute bottom-[17.18%] left-[17.18%] right-[17.18%] top-[17.17%]">
                <svg
                  className="w-full h-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </button>

            {/* Title - positioned as in Figma */}
            <div className="absolute left-1/2 top-[27px] transform -translate-x-1/2 -translate-y-1/2">
              <h2 className="font-['Montserrat'] text-2xl font-bold text-black text-center">
                point management
              </h2>
            </div>

            {/* Form fields layout based on Figma - horizontal arrangement */}
            <div className="absolute top-[83px] left-1/2 transform -translate-x-1/2 flex items-start gap-4">
              {/* User Name */}
              <div className="flex flex-col items-center">
                <div className="text-[16px] text-black text-center mb-2">
                  user name
                </div>
                <div className="h-[47px] w-[148px] border-2 border-black rounded-xl flex items-center justify-center">
                  <input
                    type="text"
                    value={editUserName}
                    onChange={(e) => setEditUserName(e.target.value)}
                    className="w-full h-full px-3 text-center text-[16px] text-black border-none outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* User ID */}
              <div className="flex flex-col items-center">
                <div className="text-[16px] text-black text-center mb-2">
                  user id
                </div>
                <div className="h-[47px] w-[133px] border-2 border-black rounded-xl flex items-center justify-center">
                  <input
                    type="text"
                    value={editUserId}
                    onChange={(e) => setEditUserId(e.target.value)}
                    className="w-full h-full px-3 text-center text-[16px] text-black border-none outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Phone No */}
              <div className="flex flex-col items-center">
                <div className="text-[16px] text-black text-center mb-2">
                  phone no.
                </div>
                <div className="h-[47px] w-[133px] border-2 border-black rounded-xl flex items-center justify-center">
                  <input
                    type="text"
                    value={editPhoneNo}
                    onChange={(e) => setEditPhoneNo(e.target.value)}
                    className="w-full h-full px-3 text-center text-[16px] text-black border-none outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Email ID */}
              <div className="flex flex-col items-center">
                <div className="text-[16px] text-black text-center mb-2">
                  email id
                </div>
                <div className="h-[47px] w-[189px] border-2 border-black rounded-xl flex items-center justify-center">
                  <input
                    type="text"
                    value={editEmailId}
                    onChange={(e) => setEditEmailId(e.target.value)}
                    className="w-full h-full px-3 text-center text-[16px] text-black border-none outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Total Points Alloted */}
              <div className="flex flex-col items-center">
                <div className="text-[16px] text-black text-center mb-2">
                  total points alloted
                </div>
                <div className="h-[47px] w-[169px] border-2 border-black rounded-xl flex items-center justify-center">
                  <input
                    type="number"
                    value={editTotalPointsAlloted}
                    onChange={(e) => setEditTotalPointsAlloted(e.target.value)}
                    className="w-full h-full px-3 text-center text-[21px] text-[#4379ee] font-medium border-none outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Total Points Redeemed */}
              <div className="flex flex-col items-center">
                <div className="text-[16px] text-black text-center mb-2">
                  total points redeemed
                </div>
                <div className="h-[47px] w-[149px] border-2 border-black rounded-xl flex items-center justify-center">
                  <input
                    type="number"
                    value={editTotalPointsRedeemed}
                    onChange={(e) => setEditTotalPointsRedeemed(e.target.value)}
                    className="w-full h-full px-3 text-center text-[21px] text-[#f1963a] font-medium border-none outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Balance */}
              <div className="flex flex-col items-center">
                <div className="text-[16px] text-black text-center mb-2">
                  balance
                </div>
                <div className="h-[47px] w-[133px] border-2 border-black rounded-xl flex items-center justify-center">
                  <input
                    type="number"
                    value={editBalance}
                    onChange={(e) => setEditBalance(e.target.value)}
                    className="w-full h-full px-3 text-center text-[21px] text-[#ef3826] font-medium border-none outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Buttons - positioned as in Figma */}
            <div className="absolute bottom-[60px] left-1/2 transform -translate-x-1/2 flex gap-[50px]">
              {/* Allot points button */}
              <button
                onClick={handleSaveEditedUser}
                className="bg-[#000000] rounded-[100px] w-[284px] h-[47px] flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <span className="font-['Montserrat'] font-medium text-white text-[16px]">
                  Allot points
                </span>
              </button>

              {/* Go back button */}
              <button
                onClick={handleCancelEdit}
                className="rounded-[100px] w-[284px] h-[47px] border border-[#e4e4e4] flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <span className="font-['Montserrat'] font-medium text-black text-[16px]">
                  go back
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit 2FA Modal */}
      {showEdit2FAModal && (
        <TwoFactorAuth
          onSubmit={handleEdit2FASubmit}
          onClose={handleCancelEdit2FA}
          phoneNumber="+1 (555) 123-4567"
          emailAddress="edit@points.com"
        />
      )}

      {/* Edit Success Modal */}
      <SuccessModal
        isOpen={showEditSuccessModal}
        onClose={handleCloseEditSuccessModal}
        title="Points updated successfully!"
        buttonText="Done"
        onButtonClick={handleEditSuccessDone}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-md mx-4 overflow-clip">
            {/* Close button */}
            <button
              onClick={handleCancelDelete}
              className="absolute right-[33px] top-[33px] w-6 h-6 text-gray-500 hover:text-gray-700"
            >
              <div className="absolute bottom-[17.18%] left-[17.18%] right-[17.18%] top-[17.17%]">
                <svg
                  className="w-full h-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </button>

            {/* Modal content */}
            <div className="absolute top-[60px] left-1/2 transform -translate-x-1/2 w-[200px] text-center">
              <p className="font-bold text-black text-[18px] leading-[22px] tracking-[-0.41px] font-['Montserrat']">
                Are you sure you want to delete this user?
              </p>
            </div>

            {/* Button Container */}
            <div className="absolute top-[189px] left-1/2 transform -translate-x-1/2 flex gap-4">
              <button
                onClick={handleConfirmDelete}
                className="bg-red-600 text-white rounded-3xl w-[149px] h-12 font-semibold text-[16px] leading-[22px] font-['Montserrat'] hover:bg-red-700 transition-colors"
              >
                Delete
              </button>

              <button
                onClick={handleCancelDelete}
                className="border border-[#e4e4e4] text-black rounded-[100px] w-[149px] h-12 font-medium text-[16px] leading-[19.2px] font-['Montserrat'] hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                Cancel
              </button>
            </div>

            {/* Modal height spacer */}
            <div className="h-[280px]"></div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      <SuccessModal
        isOpen={showDeleteSuccessModal}
        onClose={handleDeleteSuccessDone}
        title="User deleted successfully!"
        buttonText="Done"
        onButtonClick={handleDeleteSuccessDone}
      />
    </div>
  );
};

export default Points;
