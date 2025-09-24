import React, { useState, useCallback, useMemo, useEffect } from "react";
import { X } from "lucide-react";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import SuccessModal from "../components/SuccessModal";
import { useShipping } from "../store/hooks";

/**
 * Settings Shipping Charges Component
 * Manages shipping charges by region and country
 */

const DEFAULT_SHIPPING_FORM = {
  country: "",
  region: "",
  deliveryCharge: "",
  returnCharge: "",
  estimatedDays: "",
};

const PREDEFINED_COUNTRIES = [
  "United States",
  "Canada", 
  "United Kingdom",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Australia",
  "New Zealand",
  "Japan",
  "South Korea",
  "Singapore",
  "India",
  "China",
  "Brazil",
  "Mexico",
];

const SettingsShippingCharges = () => {
  // ==============================
  // REDUX HOOKS
  // ==============================
  const {
    charges: shippingCharges,
    loading,
    errors,
    fetchCharges,
    createCharge,
    updateCharge,
    deleteCharge,
  } = useShipping();

  // ==============================
  // LOCAL STATE MANAGEMENT
  // ==============================
  const [shippingForm, setShippingForm] = useState(DEFAULT_SHIPPING_FORM);
  const [editingShippingId, setEditingShippingId] = useState(null);

  // Modal state
  const [modals, setModals] = useState({
    shippingChargesModal: false,
    shippingChargeCreatedSuccess: false,
    shippingChargeUpdatedSuccess: false,
    shippingChargeDeleteConfirm: false,
    shippingChargeDeletedSuccess: false,
  });

  // ==============================
  // EFFECTS
  // ==============================
  useEffect(() => {
    fetchCharges();
  }, [fetchCharges]);

  // ==============================
  // HANDLERS
  // ==============================

  const handleOpenShippingModal = useCallback(() => {
    setModals(prev => ({ ...prev, shippingChargesModal: true }));
  }, []);

  const handleCloseShippingModal = useCallback(() => {
    setModals(prev => ({ ...prev, shippingChargesModal: false }));
    setShippingForm(DEFAULT_SHIPPING_FORM);
    setEditingShippingId(null);
  }, []);

  const handleShippingFormChange = useCallback((key, value) => {
    setShippingForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSaveShippingCharge = useCallback(async () => {
    try {
      if (editingShippingId) {
        // Update existing charge
        await updateCharge({ chargeId: editingShippingId, chargeData: shippingForm });
        setModals(prev => ({ 
          ...prev, 
          shippingChargesModal: false,
          shippingChargeUpdatedSuccess: true 
        }));
      } else {
        // Create new charge
        await createCharge(shippingForm);
        setModals(prev => ({ 
          ...prev, 
          shippingChargesModal: false,
          shippingChargeCreatedSuccess: true 
        }));
      }
      setShippingForm(DEFAULT_SHIPPING_FORM);
      setEditingShippingId(null);
    } catch (error) {
      console.error('Error saving shipping charge:', error);
    }
  }, [shippingForm, editingShippingId, createCharge, updateCharge]);

  const handleEditShippingCharge = useCallback((charge) => {
    const { _id, __v, createdAt, updatedAt, ...formData } = charge;
    setShippingForm(formData);
    setEditingShippingId(charge._id);
    setModals(prev => ({ ...prev, shippingChargesModal: true }));
  }, []);

  const handleDeleteShippingCharge = useCallback((id) => {
    setEditingShippingId(id);
    setModals(prev => ({ ...prev, shippingChargeDeleteConfirm: true }));
  }, []);

  const handleConfirmDeleteShippingCharge = useCallback(async () => {
    try {
      await deleteCharge(editingShippingId);
      setModals(prev => ({ 
        ...prev, 
        shippingChargeDeleteConfirm: false,
        shippingChargeDeletedSuccess: true 
      }));
      setEditingShippingId(null);
    } catch (error) {
      console.error('Error deleting shipping charge:', error);
    }
  }, [editingShippingId, deleteCharge]);

  // ==============================
  // COMPUTED VALUES
  // ==============================

  const ViewSettingsButton = useMemo(() => 
    ({ onClick }) => (
      <button
        onClick={onClick}
        className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium font-montserrat hover:bg-gray-800 transition-colors"
      >
        View Settings
      </button>
    ), []
  );

  return (
    <div className="bg-white min-h-screen p-6 font-montserrat max-w-4xl">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-[24px] font-bold text-[#010101] font-montserrat">
          Shipping Charges Settings
        </h1>
      </div>

      {/* Shipping Charges Setting */}
      <div className="py-6 border-b border-gray-200">
        <h3 className="font-semibold text-[#000000] text-lg font-montserrat mb-2">
          Set shipping and time estimates charges by region and country
        </h3>
        <ViewSettingsButton onClick={handleOpenShippingModal} />
        
        {/* Loading State */}
        {loading.fetchCharges && (
          <div className="mt-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <p className="mt-2 text-gray-600">Loading shipping charges...</p>
          </div>
        )}

        {/* Error State */}
        {errors.fetchCharges && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {errors.fetchCharges}
          </div>
        )}

        {/* Existing Charges List */}
        {!loading.fetchCharges && shippingCharges.length > 0 && (
          <div className="mt-4 space-y-2">
            {shippingCharges.map((charge, index) => (
              <div key={charge._id || charge.id || `charge-${index}`} className="p-3 border rounded-lg flex justify-between items-center">
                <div>
                  <span className="font-medium">{charge.country}</span>
                  {charge.region && <span> - {charge.region}</span>}
                  <div className="text-sm text-gray-600">
                    Delivery: ${charge.deliveryCharge} | Return: ${charge.returnCharge} | {charge.estimatedDays} days
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditShippingCharge(charge)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteShippingCharge(charge._id || charge.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading.fetchCharges && !errors.fetchCharges && shippingCharges.length === 0 && (
          <div className="mt-4 text-center py-8">
            <p className="text-gray-500">No shipping charges configured yet.</p>
            <p className="text-gray-400 text-sm mt-1">Click "View Settings" to add your first shipping charge.</p>
          </div>
        )}
      </div>

      {/* Shipping Charges Modal */}
      {modals.shippingChargesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingShippingId ? 'Edit' : 'Add'} Shipping Charge
                </h2>
                <button
                  onClick={handleCloseShippingModal}
                  className="w-6 h-6 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-full h-full" />
                </button>
              </div>

              {/* Error Display */}
              {(errors.createCharge || errors.updateCharge) && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  Error: {errors.createCharge || errors.updateCharge}
                </div>
              )}

              <div className="space-y-4">
                <select
                  value={shippingForm.country}
                  onChange={(e) => handleShippingFormChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="">Select Country</option>
                  {PREDEFINED_COUNTRIES.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  placeholder="Region (Optional)"
                  value={shippingForm.region}
                  onChange={(e) => handleShippingFormChange('region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Delivery Charge ($)"
                    value={shippingForm.deliveryCharge}
                    onChange={(e) => handleShippingFormChange('deliveryCharge', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded"
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="number"
                    placeholder="Return Charge ($)"
                    value={shippingForm.returnCharge}
                    onChange={(e) => handleShippingFormChange('returnCharge', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <input
                  type="number"
                  placeholder="Estimated Delivery Days"
                  value={shippingForm.estimatedDays}
                  onChange={(e) => handleShippingFormChange('estimatedDays', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  min="1"
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={handleCloseShippingModal}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveShippingCharge}
                  disabled={loading.createCharge || loading.updateCharge}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.createCharge || loading.updateCharge 
                    ? 'Saving...' 
                    : (editingShippingId ? 'Update' : 'Save')
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modals */}
      <SuccessModal
        isOpen={modals.shippingChargeCreatedSuccess}
        onClose={() => setModals(prev => ({ ...prev, shippingChargeCreatedSuccess: false }))}
        title="Shipping Charge Created"
        message="The shipping charge has been successfully created."
      />

      <SuccessModal
        isOpen={modals.shippingChargeUpdatedSuccess}
        onClose={() => setModals(prev => ({ ...prev, shippingChargeUpdatedSuccess: false }))}
        title="Shipping Charge Updated"
        message="The shipping charge has been successfully updated."
      />

      <SuccessModal
        isOpen={modals.shippingChargeDeletedSuccess}
        onClose={() => setModals(prev => ({ ...prev, shippingChargeDeletedSuccess: false }))}
        title="Shipping Charge Deleted"
        message="The shipping charge has been successfully deleted."
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={modals.shippingChargeDeleteConfirm}
        onClose={() => setModals(prev => ({ ...prev, shippingChargeDeleteConfirm: false }))}
        onConfirm={handleConfirmDeleteShippingCharge}
        title="Delete Shipping Charge"
        message="Are you sure you want to delete this shipping charge? This action cannot be undone."
      />
    </div>
  );
};

export default SettingsShippingCharges;
