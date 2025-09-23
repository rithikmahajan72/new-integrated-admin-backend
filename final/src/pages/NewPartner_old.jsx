import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Plus, Edit3, Trash2, Eye, EyeOff, Shield, ShieldOff, Save, RefreshCw } from "lucide-react";
import TwoFactorAuth from "../components/TwoFactorAuth";
import SuccessModal from "../components/SuccessModal";
import {
  createPartner,
  fetchPartners,
  updatePartner,
  updatePartnerPassword,
  togglePartnerStatus,
  deletePartner,
  fetchPartnerStatistics,
  clearErrors,
  clearSuccess,
  updateFilters,
  setSelectedPartner,
  selectPartners,
  selectPartnerLoading,
  selectPartnerError,
  selectPartnerSuccess,
  selectPartnerPagination,
  selectPartnerFilters,
  selectPartnerStatistics
} from "../store/slices/partnerSlice";

// Image constants from Figma design
const imgProgressBar =
  "http://localhost:3845/assets/910f1120d3bdc0f6938634d6aef7d55a7bec572e.svg";
const imgProgressBar1 =
  "http://localhost:3845/assets/34772e9eec583c7c3b05d958ac9b0f08ea0df778.svg";
const imgProgressBar2 =
  "http://localhost:3845/assets/03d7a9eb0b3a258f8463991e4d3604bb169d1d1f.svg";
const imgProgressBar3 =
  "http://localhost:3845/assets/f3f85ecfe751f814840dadb647864a547b36ca15.svg";

const NewPartner = () => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const partners = useSelector(selectPartners);
  const loading = useSelector(selectPartnerLoading);
  const error = useSelector(selectPartnerError);
  const success = useSelector(selectPartnerSuccess);
  const pagination = useSelector(selectPartnerPagination);
  const filters = useSelector(selectPartnerFilters);
  const statistics = useSelector(selectPartnerStatistics);

  // Local state for form and UI
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    email: "",
    phone: "",
    businessName: "",
  });

  const [modalStates, setModalStates] = useState({
    showCreateModal: false,
    showConfirmModal: false,
    showSuccessModal: false,
    show2FAModal: false,
    showVerificationSuccessModal: false,
    showPartnerCreatedSuccessModal: false,
    showBlockConfirmModal: false,
    showBlock2FAModal: false,
    showBlockSuccessModal: false,
    showEditModal: false,
    showPasswordModal: false,
  });

  const [actionStates, setActionStates] = useState({
    selectedPartnerId: null,
    blockAction: "",
    pendingPartnerData: null,
    pendingBlockData: null,
    editingPartner: null,
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [editingPasswords, setEditingPasswords] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Effects
  useEffect(() => {
    dispatch(fetchPartners({ 
      page: 1, 
      limit: 10,
      search: filters.search,
      status: filters.status 
    }));
    dispatch(fetchPartnerStatistics());
  }, [dispatch, filters.search, filters.status]);

  useEffect(() => {
    if (success.create) {
      setModalStates(prev => ({
        ...prev,
        showCreateModal: false,
        showPartnerCreatedSuccessModal: true
      }));
      resetForm();
      dispatch(clearSuccess());
    }
  }, [success.create, dispatch]);

  useEffect(() => {
    if (success.update || success.passwordUpdate) {
      setModalStates(prev => ({
        ...prev,
        showEditModal: false,
        showPasswordModal: false,
        showSuccessModal: true
      }));
      dispatch(clearSuccess());
    }
  }, [success.update, success.passwordUpdate, dispatch]);

  useEffect(() => {
    if (success.delete) {
      setModalStates(prev => ({
        ...prev,
        showSuccessModal: true
      }));
      dispatch(clearSuccess());
    }
  }, [success.delete, dispatch]);

  // Helper functions
  const updateModalState = useCallback((key, value) => {
    setModalStates(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateActionState = useCallback((key, value) => {
    setActionStates(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      password: "",
      confirmPassword: "",
      email: "",
      phone: "",
      businessName: "",
    });
  }, []);

  const resetPasswordForm = useCallback(() => {
    setPasswordData({
      newPassword: "",
      confirmPassword: "",
    });
  }, []);

  // Event handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    const partnerData = {
      name: formData.name.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      businessInfo: {
        businessName: formData.businessName.trim() || undefined,
      }
    };

    updateActionState("pendingPartnerData", partnerData);
    updateModalState("show2FAModal", true);
  }, [formData, dispatch]);

  const handle2FASuccess = useCallback(() => {
    if (actionStates.pendingPartnerData) {
      dispatch(createPartner(actionStates.pendingPartnerData));
    }
    updateModalState("show2FAModal", false);
    updateModalState("showVerificationSuccessModal", true);
  }, [actionStates.pendingPartnerData, dispatch]);

  const handlePasswordSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    if (actionStates.selectedPartnerId) {
      dispatch(updatePartnerPassword({
        partnerId: actionStates.selectedPartnerId,
        passwordData: {
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword
        }
      }));
    }
  }, [passwordData, actionStates.selectedPartnerId, dispatch]);

  const handleToggleStatus = useCallback((partnerId, currentStatus) => {
    const action = currentStatus === 'active' ? 'block' : 'unblock';
    updateActionState("selectedPartnerId", partnerId);
    updateActionState("blockAction", action);
    updateModalState("showBlockConfirmModal", true);
  }, []);

  const confirmToggleStatus = useCallback(() => {
    if (actionStates.selectedPartnerId && actionStates.blockAction) {
      dispatch(togglePartnerStatus({
        partnerId: actionStates.selectedPartnerId,
        action: actionStates.blockAction,
        reason: "Admin action"
      }));
    }
    updateModalState("showBlockConfirmModal", false);
  }, [actionStates.selectedPartnerId, actionStates.blockAction, dispatch]);

  const handleDeletePartner = useCallback((partnerId) => {
    if (window.confirm("Are you sure you want to delete this partner? This action cannot be undone.")) {
      dispatch(deletePartner(partnerId));
    }
  }, [dispatch]);

  const handleEditPartner = useCallback((partner) => {
    setFormData({
      name: partner.name || "",
      password: "",
      confirmPassword: "",
      email: partner.email || "",
      phone: partner.phone || "",
      businessName: partner.businessInfo?.businessName || "",
    });
    updateActionState("editingPartner", partner);
    updateActionState("selectedPartnerId", partner._id);
    updateModalState("showEditModal", true);
  }, []);

  const handleUpdatePartner = useCallback((e) => {
    e.preventDefault();
    
    if (actionStates.selectedPartnerId) {
      const updates = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        businessInfo: {
          businessName: formData.businessName.trim() || undefined,
        }
      };

      dispatch(updatePartner({
        partnerId: actionStates.selectedPartnerId,
        updates
      }));
    }
  }, [formData, actionStates.selectedPartnerId, dispatch]);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    dispatch(updateFilters({ search: value }));
  }, [dispatch]);

  const handleStatusFilterChange = useCallback((e) => {
    const value = e.target.value;
    setStatusFilter(value);
    dispatch(updateFilters({ status: value }));
  }, [dispatch]);

  const handlePageChange = useCallback((page) => {
    dispatch(fetchPartners({ 
      page, 
      limit: 10,
      search: filters.search,
      status: filters.status 
    }));
  }, [dispatch, filters]);

  const togglePasswordVisibility = useCallback((partnerId) => {
    setEditingPasswords(prev => ({
      ...prev,
      [partnerId]: !prev[partnerId]
    }));
  }, []);

  // Modal handlers
  const closeSuccessModal = useCallback(() => {
    updateModalState("showSuccessModal", false);
    updateModalState("showPartnerCreatedSuccessModal", false);
    updateModalState("showBlockSuccessModal", false);
  }, []);

  const handle2FACancel = useCallback(() => {
    updateModalState("show2FAModal", false);
    updateActionState("pendingPartnerData", null);
  }, []);

  const handleBlock2FASuccess = useCallback(() => {
    if (actionStates.selectedPartnerId && actionStates.blockAction) {
      dispatch(togglePartnerStatus({
        partnerId: actionStates.selectedPartnerId,
        action: actionStates.blockAction,
        reason: "Admin action via 2FA"
      }));
    }
    updateModalState("showBlock2FAModal", false);
    updateModalState("showBlockSuccessModal", true);
  }, [actionStates.selectedPartnerId, actionStates.blockAction, dispatch]);

  const handleBlock2FACancel = useCallback(() => {
    updateModalState("showBlock2FAModal", false);
    updateActionState("pendingBlockData", null);
    updateActionState("selectedPartnerId", null);
    updateActionState("blockAction", "");
  }, []);

  const confirmBlock2FA = useCallback(() => {
    updateModalState("showBlockConfirmModal", false);
    updateModalState("showBlock2FAModal", true);
  }, []);

  const cancelBlockConfirm = useCallback(() => {
    updateModalState("showBlockConfirmModal", false);
    updateActionState("pendingBlockData", null);
    updateActionState("selectedPartnerId", null);
    updateActionState("blockAction", "");
  }, []);
      updateModalState("showVerificationSuccessModal", true);
    },
    [updateModalState]
  );

  const handleCancel2FA = useCallback(() => {
    updateModalState("show2FAModal", false);
    updateActionState("pendingPartnerData", null);
  }, [updateModalState, updateActionState]);

  const handleVerificationSuccessDone = useCallback(() => {
    updateModalState("showVerificationSuccessModal", false);
    updateModalState("showPartnerCreatedSuccessModal", true);
  }, [updateModalState]);

  const handlePartnerCreatedSuccessDone = useCallback(() => {
    updateModalState("showPartnerCreatedSuccessModal", false);

    // Now create the vendor and reset form
    if (actionStates.pendingPartnerData) {
      setVendors((prev) => [...prev, actionStates.pendingPartnerData]);
      updateActionState("pendingPartnerData", null);
      resetForm();
    }
  }, [
    actionStates.pendingPartnerData,
    updateModalState,
    updateActionState,
    resetForm,
  ]);

  const handlePasswordEdit = useCallback((vendorId, field, value) => {
    if (field === "password") {
      setEditingPassword((prev) => ({
        ...prev,
        [vendorId]: value,
      }));
    } else if (field === "editPassword") {
      setEditingEditPassword((prev) => ({
        ...prev,
        [vendorId]: value,
      }));
    }
  }, []);

  const savePassword = useCallback(
    (vendorId, field) => {
      const newValue =
        field === "password"
          ? editingPassword[vendorId]
          : editingEditPassword[vendorId];
      if (newValue) {
        setVendors((prev) =>
          prev.map((vendor) =>
            vendor.id === vendorId ? { ...vendor, [field]: newValue } : vendor
          )
        );

        // Clear editing state
        if (field === "password") {
          setEditingPassword((prev) => {
            const updated = { ...prev };
            delete updated[vendorId];
            return updated;
          });
        } else {
          setEditingEditPassword((prev) => {
            const updated = { ...prev };
            delete updated[vendorId];
            return updated;
          });
        }
      }
    },
    [editingPassword, editingEditPassword]
  );

  // Memoized computed values
  const selectedVendor = useMemo(
    () => vendors.find((v) => v.id === actionStates.selectedVendorId),
    [vendors, actionStates.selectedVendorId]
  );

  const blockSuccessTitle = useMemo(
    () =>
      actionStates.pendingBlockData?.action === "block"
        ? "partner blocked successfully!"
        : "partner unblocked successfully!",
    [actionStates.pendingBlockData?.action]
  );

  return (
    <div className="bg-white relative min-h-screen w-full font-['Montserrat']">
      {/* Header */}
      <div className="text-left pt-10 pb-6 px-8 border-b border-gray-200">
        <h1 className="font-bold text-gray-900 text-2xl leading-tight">
          New Partner
        </h1>
      </div>

      {/* Form Section */}
      <div className="max-w-3xl m-10">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-8 bg-white p-8 rounded-xl shadow-sm border-2 border-gray-200"
        >
          {/* Name Field */}
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2 tracking-tight font-montserrat">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter name"
              className="w-full h-[48px] px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7280FF] focus:border-[#7280FF] placeholder-gray-400 transition"
            />
          </div>

          {/* Make new id Field */}
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2 tracking-tight font-montserrat">
              Make new ID
            </label>
            <input
              type="text"
              name="newId"
              value={formData.newId}
              onChange={handleInputChange}
              required
              placeholder="Enter ID"
              className="w-full h-[48px] px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7280FF] focus:border-[#7280FF] placeholder-gray-400 transition"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2 tracking-tight font-montserrat">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter password"
              className="w-full h-[48px] px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7280FF] focus:border-[#7280FF] placeholder-gray-400 transition"
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2 tracking-tight font-montserrat">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              placeholder="Re-enter password"
              className="w-full h-[48px] px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7280FF] focus:border-[#7280FF] placeholder-gray-400 transition"
            />
          </div>

          {/* Create Partner Button */}
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-black text-white text-sm font-semibold px-10 py-3 rounded-lg hover:bg-[#333537] font-montserrat"
            >
              Create Partner
            </button>
          </div>
        </form>
      </div>

      {/* Vendors Table Section */}
      <div className="px-8">
        {vendors.length > 0 ? (
          <div className="max-w-6xl bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
            {/* Table Headers */}
            <div className="grid grid-cols-5 gap-8 py-4 px-6 bg-gray-50 border-b border-gray-200">
              <div className="text-gray-800 text-lg font-semibold text-left">
                Vendor Name
              </div>
              <div className="text-gray-800 text-lg font-semibold text-left">
                Vendor ID
              </div>
              <div className="text-gray-800 text-lg font-semibold text-center">
                Password
              </div>
              <div className="text-gray-800 text-lg font-semibold text-center">
                Edit Password
              </div>
              <div className="text-gray-800 text-lg font-semibold text-center">
                Status
              </div>
            </div>

            {/* Table Rows */}
            {vendors.map((vendor, index) => (
              <div
                key={vendor.id}
                className={`grid grid-cols-5 gap-8 items-center py-4 px-6 hover:bg-gray-50 transition ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <div className="text-gray-900 text-sm font-bold">
                  {vendor.vendorName}
                </div>
                <div className="text-gray-900 text-sm font-bold">
                  {vendor.vendorId}
                </div>

                {/* Editable Password */}
                <div className="flex items-center justify-center">
                  {editingPassword[vendor.id] !== undefined ? (
                    <input
                      type="text"
                      value={editingPassword[vendor.id]}
                      onChange={(e) =>
                        handlePasswordEdit(
                          vendor.id,
                          "password",
                          e.target.value
                        )
                      }
                      onBlur={() => savePassword(vendor.id, "password")}
                      onKeyPress={(e) =>
                        e.key === "Enter" && savePassword(vendor.id, "password")
                      }
                      className="w-32 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="text-gray-800 text-base cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition"
                      onClick={() =>
                        handlePasswordEdit(
                          vendor.id,
                          "password",
                          vendor.password
                        )
                      }
                    >
                      {vendor.password}
                    </span>
                  )}
                </div>

                {/* Editable Edit Password */}
                <div className="flex items-center justify-center">
                  {editingEditPassword[vendor.id] !== undefined ? (
                    <input
                      type="text"
                      value={editingEditPassword[vendor.id]}
                      onChange={(e) =>
                        handlePasswordEdit(
                          vendor.id,
                          "editPassword",
                          e.target.value
                        )
                      }
                      onBlur={() => savePassword(vendor.id, "editPassword")}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        savePassword(vendor.id, "editPassword")
                      }
                      className="w-32 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="text-gray-800 text-base cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition"
                      onClick={() =>
                        handlePasswordEdit(
                          vendor.id,
                          "editPassword",
                          vendor.editPassword
                        )
                      }
                    >
                      {vendor.editPassword}
                    </span>
                  )}
                </div>

                {/* Status Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() =>
                      handleBlockVendor(
                        vendor.id,
                        vendor.status === "active" ? "block" : "unblock"
                      )
                    }
                    className={`text-white text-sm px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-colors ${
                      vendor.status === "active"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {vendor.status === "active" ? "Block" : "Unblock"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="max-w-6xl bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No vendors yet
            </h3>
            <p className="text-gray-500">
              Create your first vendor to get started
            </p>
          </div>
        )}
      </div>

      {/* Block Confirmation Modal */}
      {modalStates.showBlockConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] p-8 max-w-md w-full mx-4 relative">
            {/* Close button */}
            <button
              onClick={handleCancelBlockConfirm}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Modal content */}
            <div className="text-center">
              {/* Warning Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="font-montserrat font-bold text-[18px] text-black mb-8 leading-[22px] tracking-[-0.41px]">
                are you sure you want to {actionStates.pendingBlockData?.action}{" "}
                this partner
              </h2>

              <div className="flex justify-center space-x-4">
                {/* Yes button */}
                <button
                  onClick={confirmBlockVendor}
                  className="bg-black text-white px-12 py-4 rounded-full font-medium text-[16px] font-montserrat hover:bg-gray-800 transition-colors"
                >
                  Yes
                </button>

                {/* Cancel button */}
                <button
                  onClick={handleCancelBlockConfirm}
                  className="border border-[#e4e4e4] text-black px-12 py-4 rounded-full font-medium text-[16px] font-montserrat hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {modalStates.showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 relative">
            {/* Close button */}
            <button
              onClick={closeSuccessModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Modal content */}
            <div className="text-center">
              <div className="mb-6">
                {/* Success icon */}
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              {(() => {
                const wasBlocked = selectedVendor?.status === "blocked";
                return (
                  <h2 className="text-lg font-bold text-black mb-6">
                    Vendor {wasBlocked ? "blocked" : "unblocked"} successfully
                  </h2>
                );
              })()}

              <button
                onClick={closeSuccessModal}
                className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Modal for Partner Creation */}
      {modalStates.show2FAModal && (
        <TwoFactorAuth
          onSubmit={handle2FASubmit}
          onClose={handleCancel2FA}
          phoneNumber="+91 9876543210"
          emailAddress="admin@yoraa.in"
        />
      )}

      {/* 2FA Modal for Blocking/Unblocking */}
      {modalStates.showBlock2FAModal && (
        <TwoFactorAuth
          onSubmit={handleBlock2FASubmit}
          onClose={handleCancelBlock2FA}
          phoneNumber="+91 9876543210"
          emailAddress="admin@yoraa.in"
        />
      )}

      {/* Verification Success Modal */}
      <SuccessModal
        isOpen={modalStates.showVerificationSuccessModal}
        onClose={handleVerificationSuccessDone}
        title="id verified successfully!"
        buttonText="Done"
      />

      {/* Partner Created Success Modal */}
      <SuccessModal
        isOpen={modalStates.showPartnerCreatedSuccessModal}
        onClose={handlePartnerCreatedSuccessDone}
        title="New Partner created successfully!"
        buttonText="Done"
      />

      {/* Block Success Modal */}
      <SuccessModal
        isOpen={modalStates.showBlockSuccessModal}
        onClose={handleBlockSuccessDone}
        title={blockSuccessTitle}
        buttonText="Done"
      />
    </div>
  );
};

export default NewPartner;
