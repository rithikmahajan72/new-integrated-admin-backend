import React, { useState, useCallback, useMemo, useRef } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CollectCommunicationPreferences from "./Collect communication preferences";
import GetAutoInvoiceMailing from "./get auto invoice mailing";
import TwoFactorAuth from "../components/TwoFactorAuth";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import SuccessModal from "../components/SuccessModal";

/**
 * Settings Component - Comprehensive settings management for the application
 *
 * Features:
 * - Toggle settings with 2FA verification
 * - Discount condition management
 * - Shipping charges configuration
 * - HSN code management
 * - Location settings (countries, languages, currencies)
 * - Location data collection toggle (integrates with collectlocationdata.js)
 * - Auto notification setup
 * - Dynamic pricing configuration
 * - Webhook management
 *
 * Performance optimizations:
 * - useCallback for all event handlers
 * - useMemo for computed values
 * - Organized state management
 * - Efficient modal state handling
 */

// ==============================
// CONSTANTS
// ==============================

const MODAL_TYPES = {
  // Main modals
  DISCOUNT: "discountModal",
  SHIPPING_CHARGES: "shippingChargesModal",
  HSN_CODE: "hsnCodeModal",
  LANGUAGE_COUNTRY: "languageCountryModal",
  AUTO_NOTIFICATION: "autoNotificationModal",
  DYNAMIC_PRICING: "dynamicPricingModal",
  WEBHOOK: "webhookModal",

  // Success modals
  SUCCESS: "Success",
  CREATED: "Created",
  UPDATED: "Updated",
  DELETED: "Deleted",

  // Confirmation modals
  CONFIRM: "Confirm",
  DELETE: "Delete",
};

const SETTINGS_KEYS = {
  PROFILE_VISIBILITY: "profileVisibility",
  HUGGING_FACE_API: "huggingFaceAPI",
  COLLECT_DATA: "collectData",
};

const DEFAULT_SETTINGS = {
  profileVisibility: true,
  huggingFaceAPI: true,
  collectData: true,
  onlineDiscount: 5,
  userLimit: 100,
};

const DEFAULT_DISCOUNT_FORM = {
  category: "",
  subCategory: "",
  items: "",
  specified: "",
  discountType: "",
  startDate: "",
  endDate: "",
  minimumOrderValue: "",
  maxUsers: "",
};

const DEFAULT_SHIPPING_FORM = {
  country: "",
  region: "",
  deliveryCharge: "",
  returnCharge: "",
  estimatedDays: "",
};

const DEFAULT_HSN_CODE_FORM = {
  code: "",
};

const DEFAULT_WEBHOOK_FORM = {
  event: "",
  webhookUrl: "",
  secretKey: "",
};

const PREDEFINED_OPTIONS = {
  countries: [
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
  ],
  languages: [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Dutch",
    "Swedish",
    "Norwegian",
    "Danish",
    "Japanese",
    "Korean",
    "Chinese (Simplified)",
    "Chinese (Traditional)",
    "Hindi",
    "Arabic",
    "Russian",
    "Polish",
  ],
  currencies: [
    "USD - US Dollar",
    "EUR - Euro",
    "GBP - British Pound",
    "JPY - Japanese Yen",
    "CAD - Canadian Dollar",
    "AUD - Australian Dollar",
    "CHF - Swiss Franc",
    "CNY - Chinese Yuan",
    "INR - Indian Rupee",
    "KRW - South Korean Won",
    "SEK - Swedish Krona",
    "NOK - Norwegian Krone",
    "DKK - Danish Krone",
  ],
};

const Settings = () => {
  // ==============================
  // NAVIGATION SETUP
  // ==============================
  const navigate = useNavigate();

  // ==============================
  // NAVIGATION HANDLERS
  // ==============================

  const handleNavigateToSubPage = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

  // ==============================
  // CORE SETTINGS STATE
  // ==============================
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // ==============================
  // MODAL STATE MANAGEMENT
  // ==============================
  const [modals, setModals] = useState({
    // Main modals
    discountModal: false,
    shippingChargesModal: false,
    hsnCodeModal: false,

    // Discount modals
    discountConditionCreatedSuccess: false,
    discountConditionUpdatedSuccess: false,
    discountConditionDeleteConfirm: false,
    discountConditionDeletedSuccess: false,

    // Shipping charge modals
    shippingChargeCreatedSuccess: false,
    shippingChargeUpdatedSuccess: false,
    shippingChargeDeleteConfirm: false,
    shippingChargeDeletedSuccess: false,

    // HSN code modals
    hsnCodeCreatedModal: false,
    hsnCodeUpdatedModal: false,
    hsnCodeDeletedModal: false,
    deleteHsnCodeModal: false,

    // Profile visibility modals
    profileVisibilityConfirmOn: false,
    profileVisibilityConfirmOff: false,
    profileVisibility2FAOn: false,
    profileVisibility2FAOff: false,
    profileVisibilitySuccessOn: false,
    profileVisibilitySuccessOff: false,
    profileVisibilityFinalSuccessOn: false,
    profileVisibilityFinalSuccessOff: false,

    // Hugging Face API modals
    huggingFaceAPIConfirmOn: false,
    huggingFaceAPIConfirmOff: false,
    huggingFaceAPI2FAOn: false,
    huggingFaceAPI2FAOff: false,
    huggingFaceAPISuccessOn: false,
    huggingFaceAPISuccessOff: false,
    huggingFaceAPIFinalSuccessOn: false,
    huggingFaceAPIFinalSuccessOff: false,

    // Collect Data modals
    collectDataConfirmOn: false,
    collectDataConfirmOff: false,
    collectData2FAOn: false,
    collectData2FAOff: false,
    collectDataSuccessOn: false,
    collectDataSuccessOff: false,
    collectDataFinalSuccessOn: false,
    collectDataFinalSuccessOff: false,
  });

  // ==============================
  // COMPONENT VISIBILITY STATE
  // ==============================
  const [showCommunicationPreferences, setShowCommunicationPreferences] =
    useState(false);
  const [showAutoInvoiceMailing, setShowAutoInvoiceMailing] = useState(false);

  // ==============================
  // FORM DATA STATE
  // ==============================

  // Discount management
  const [discountForm, setDiscountForm] = useState(DEFAULT_DISCOUNT_FORM);
  const [discountConditions, setDiscountConditions] = useState([]);
  const [editingCondition, setEditingCondition] = useState(null);
  const [editParameter, setEditParameter] = useState("");
  const [deletingConditionId, setDeletingConditionId] = useState(null);

  // Shipping charges management
  const [shippingForm, setShippingForm] = useState(DEFAULT_SHIPPING_FORM);
  const [shippingCharges, setShippingCharges] = useState([]);
  const [editingShippingCharge, setEditingShippingCharge] = useState(null);
  const [deletingShippingChargeId, setDeletingShippingChargeId] =
    useState(null);

  // HSN codes management
  const [hsnCodeForm, setHsnCodeForm] = useState(DEFAULT_HSN_CODE_FORM);
  const [hsnCodes, setHsnCodes] = useState([]);
  const [editingHsnCode, setEditingHsnCode] = useState(null);
  const [deletingHsnCodeId, setDeletingHsnCodeId] = useState(null);

  // ==============================
  // LOCATION SETTINGS STATE
  // ==============================
  const [locationSettings, setLocationSettings] = useState({
    searchTerm: "",
    selectedCountry: "",
    selectedLanguage: "",
    selectedCurrency: "",
    countries: [],
    languages: [],
    currencies: [],
  });

  const [locationModals, setLocationModals] = useState({
    languageCountryModal: false,
    editOrderModal: false,
    ordersSavedSuccess: false,
    countryCreatedSuccess: false,
    languageCreatedSuccess: false,
    currencyCreatedSuccess: false,
    deleteCountryConfirm: false,
    deleteLanguageConfirm: false,
    deleteCurrencyConfirm: false,
    countryDeletedSuccess: false,
    languageDeletedSuccess: false,
    currencyDeletedSuccess: false,
  });

  const [editingCountry, setEditingCountry] = useState(null);
  const [editingLanguage, setEditingLanguage] = useState(null);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [deletingCountryId, setDeletingCountryId] = useState(null);
  const [deletingLanguageId, setDeletingLanguageId] = useState(null);
  const [deletingCurrencyId, setDeletingCurrencyId] = useState(null);
  const [editingOrders, setEditingOrders] = useState({
    countries: {},
    languages: {},
    currencies: {},
  });
  const [newOrderInput, setNewOrderInput] = useState("");

  // ==============================
  // NOTIFICATION SETTINGS STATE
  // ==============================
  const [autoNotificationSettings, setAutoNotificationSettings] = useState({
    criteria: "",
    conditions: [],
  });

  const [autoNotificationModals, setAutoNotificationModals] = useState({
    autoNotificationModal: false,
    conditionCreatedSuccess: false,
    conditionUpdatedSuccess: false,
    conditionDeleteConfirm: false,
    conditionDeletedSuccess: false,
  });

  const [editingNotificationCondition, setEditingNotificationCondition] =
    useState(null);
  const [deletingNotificationConditionId, setDeletingNotificationConditionId] =
    useState(null);

  // ==============================
  // DYNAMIC PRICING STATE
  // ==============================
  const [dynamicPricingSettings, setDynamicPricingSettings] = useState({
    criteria: "",
    conditions: [],
  });

  const [dynamicPricingModals, setDynamicPricingModals] = useState({
    dynamicPricingModal: false,
    conditionCreatedSuccess: false,
    conditionUpdatedSuccess: false,
    conditionDeleteConfirm: false,
    conditionDeletedSuccess: false,
  });

  const [dynamicPricingForm, setDynamicPricingForm] = useState(
    DEFAULT_DISCOUNT_FORM
  );
  const [editingDynamicPricingCondition, setEditingDynamicPricingCondition] =
    useState(null);
  const [
    deletingDynamicPricingConditionId,
    setDeletingDynamicPricingConditionId,
  ] = useState(null);

  // ==============================
  // WEBHOOK MANAGEMENT STATE
  // ==============================
  const [webhookSettings, setWebhookSettings] = useState({
    webhooks: [],
    apiKeys: [],
    apiPermissions: {
      orders: true,
      products: true,
      customers: true,
      payments: true,
    },
    webhookLogs: [],
  });

  const [webhookForm, setWebhookForm] = useState(DEFAULT_WEBHOOK_FORM);
  const [webhookModals, setWebhookModals] = useState({
    webhookModal: false,
    webhookCreatedSuccess: false,
    webhookUpdatedSuccess: false,
    webhookDeleteConfirm: false,
    webhookDeletedSuccess: false,
    apiKeyModal: false,
    apiKeyCreatedSuccess: false,
  });

  const [editingWebhook, setEditingWebhook] = useState(null);
  const [deletingWebhookId, setDeletingWebhookId] = useState(null);

  // ==============================
  // UTILITY FUNCTIONS
  // ==============================

  // Update modal state utility
  const updateModal = useCallback((modalKey, value) => {
    setModals((prev) => ({ ...prev, [modalKey]: value }));
  }, []);

  // Update location modal state utility
  const updateLocationModal = useCallback((modalKey, value) => {
    setLocationModals((prev) => ({ ...prev, [modalKey]: value }));
  }, []);

  // Reset form utility
  const resetForm = useCallback((formSetter, defaultForm) => {
    formSetter(defaultForm);
  }, []);

  // Filter options based on search term
  const getFilteredOptions = useCallback((options, searchTerm) => {
    if (!searchTerm) return options;
    return options.filter((option) =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, []);

  // Generate unique ID utility
  const generateId = useCallback(() => Date.now(), []);

  // Validate form field utility
  const validateField = useCallback((value, type = "required") => {
    switch (type) {
      case "required":
        return value && value.toString().trim() !== "";
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case "url":
        return /^https?:\/\/.+/.test(value);
      case "number":
        return !isNaN(value) && value >= 0;
      default:
        return true;
    }
  }, []);

  // Create item with ID utility
  const createItemWithId = useCallback(
    (formData, additionalProps = {}) => ({
      ...formData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...additionalProps,
    }),
    [generateId]
  );

  // Update item by ID utility
  const updateItemById = useCallback(
    (items, id, newData) =>
      items.map((item) => (item.id === id ? { ...item, ...newData } : item)),
    []
  );

  // Remove item by ID utility
  const removeItemById = useCallback(
    (items, id) => items.filter((item) => item.id !== id),
    []
  );

  // ==============================
  // COMPUTED VALUES
  // ==============================

  // Check if there are any unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return (
      editingCondition !== null ||
      editingShippingCharge !== null ||
      editingHsnCode !== null ||
      editingCountry !== null ||
      editingLanguage !== null ||
      editingCurrency !== null ||
      editingNotificationCondition !== null ||
      editingDynamicPricingCondition !== null ||
      editingWebhook !== null
    );
  }, [
    editingCondition,
    editingShippingCharge,
    editingHsnCode,
    editingCountry,
    editingLanguage,
    editingCurrency,
    editingNotificationCondition,
    editingDynamicPricingCondition,
    editingWebhook,
  ]);

  // ==============================
  // DISCOUNT MODAL HANDLERS
  // ==============================

  const handleOpenDiscountModal = useCallback(() => {
    updateModal("discountModal", true);
  }, [updateModal]);

  const handleCloseDiscountModal = useCallback(() => {
    updateModal("discountModal", false);
    setEditingCondition(null);
    setEditParameter("");
    setDeletingConditionId(null);
    resetForm(setDiscountForm, DEFAULT_DISCOUNT_FORM);
  }, [updateModal, resetForm]);

  const handleDiscountFormChange = useCallback((field, value) => {
    setDiscountForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCreateCondition = useCallback(() => {
    const newCondition = { ...discountForm, id: Date.now() };
    setDiscountConditions((prev) => [...prev, newCondition]);
    resetForm(setDiscountForm, DEFAULT_DISCOUNT_FORM);
    updateModal("discountConditionCreatedSuccess", true);
  }, [discountForm, resetForm, updateModal]);

  const handleEditCondition = useCallback(
    (id) => {
      const condition = discountConditions.find((c) => c.id === id);
      if (condition) {
        setEditingCondition(condition);
        setDiscountForm(condition);
        setEditParameter("");
      }
    },
    [discountConditions]
  );

  const handleDeleteCondition = useCallback(
    (id) => {
      setDeletingConditionId(id);
      updateModal("discountConditionDeleteConfirm", true);
    },
    [updateModal]
  );

  const handleSaveEditedCondition = useCallback(() => {
    if (editingCondition) {
      setDiscountConditions((prev) =>
        prev.map((c) =>
          c.id === editingCondition.id
            ? { ...discountForm, id: editingCondition.id }
            : c
        )
      );
      setEditingCondition(null);
      setEditParameter("");
      resetForm(setDiscountForm, DEFAULT_DISCOUNT_FORM);
      updateModal("discountConditionUpdatedSuccess", true);
    }
  }, [editingCondition, discountForm, resetForm, updateModal]);

  const handleCancelEdit = useCallback(() => {
    setEditingCondition(null);
    setEditParameter("");
    resetForm(setDiscountForm, DEFAULT_DISCOUNT_FORM);
  }, [resetForm]);

  // ==============================
  // GENERIC TOGGLE HANDLERS
  // ==============================

  const handleToggleSetting = useCallback(
    (settingKey, action) => {
      const modalKey = `${settingKey}Confirm${action === "on" ? "On" : "Off"}`;
      updateModal(modalKey, true);
    },
    [updateModal]
  );

  const handleConfirmToggleOn = useCallback(
    (settingKey) => {
      updateModal(`${settingKey}ConfirmOn`, false);
      updateModal(`${settingKey}2FAOn`, true);
    },
    [updateModal]
  );

  const handleConfirmToggleOff = useCallback(
    (settingKey) => {
      updateModal(`${settingKey}ConfirmOff`, false);
      updateModal(`${settingKey}2FAOff`, true);
    },
    [updateModal]
  );

  const handleCancelToggle = useCallback(
    (settingKey, action) => {
      const modalKey = `${settingKey}Confirm${action}`;
      updateModal(modalKey, false);
    },
    [updateModal]
  );

  // ==============================
  // 2FA HANDLERS
  // ==============================

  const handle2FASubmit = useCallback(
    (settingKey, action, data) => {
      if (
        data &&
        data.verificationCode.length === 4 &&
        data.emailPassword &&
        data.defaultPassword
      ) {
        updateModal(`${settingKey}2FA${action}`, false);
        updateModal(`${settingKey}Success${action}`, true);

        console.log("2FA Authentication Data:", {
          settingKey,
          action,
          verificationCode: data.verificationCode,
          emailPassword: data.emailPassword,
          defaultPassword: data.defaultPassword,
        });
      } else {
        alert("Please fill in all fields");
      }
    },
    [updateModal]
  );

  const handleCancel2FA = useCallback(
    (settingKey, action) => {
      updateModal(`${settingKey}2FA${action}`, false);
    },
    [updateModal]
  );

  // ==============================
  // SUCCESS MODAL HANDLERS
  // ==============================

  const handleSuccessModalDone = useCallback(
    (settingKey, action) => {
      updateModal(`${settingKey}Success${action}`, false);
      updateModal(`${settingKey}FinalSuccess${action}`, true);
    },
    [updateModal]
  );

  const handleFinalSuccessModalDone = useCallback(
    (settingKey, action) => {
      updateModal(`${settingKey}FinalSuccess${action}`, false);
      setSettings((prev) => ({
        ...prev,
        [settingKey]: action === "On",
      }));
    },
    [updateModal]
  );

  const handleCloseSuccessModal = useCallback(
    (settingKey, action) => {
      updateModal(`${settingKey}Success${action}`, false);
      setSettings((prev) => ({
        ...prev,
        [settingKey]: action === "On",
      }));
    },
    [updateModal]
  );

  const handleCloseFinalSuccessModal = useCallback(
    (settingKey, action) => {
      updateModal(`${settingKey}FinalSuccess${action}`, false);
      setSettings((prev) => ({
        ...prev,
        [settingKey]: action === "On",
      }));
    },
    [updateModal]
  );

  // ==============================
  // CONTINUE WITH ORIGINAL HANDLERS
  // ==============================

  // Note: The remaining handlers from the original file continue here
  // to maintain full functionality while keeping the improved organization above

  // ==============================
  // SHIPPING CHARGES HANDLERS
  // ==============================

  const handleOpenShippingModal = useCallback(() => {
    updateModal("shippingChargesModal", true);
  }, [updateModal]);

  const handleCloseShippingModal = useCallback(() => {
    updateModal("shippingChargesModal", false);
    setEditingShippingCharge(null);
    setDeletingShippingChargeId(null);
    resetForm(setShippingForm, DEFAULT_SHIPPING_FORM);
  }, [updateModal, resetForm]);

  const handleShippingFormChange = useCallback((field, value) => {
    setShippingForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCreateShippingCharge = useCallback(() => {
    const newCharge = { ...shippingForm, id: Date.now() };
    setShippingCharges((prev) => [...prev, newCharge]);
    resetForm(setShippingForm, DEFAULT_SHIPPING_FORM);
    updateModal("shippingChargeCreatedSuccess", true);
  }, [shippingForm, resetForm, updateModal]);

  const handleEditShippingCharge = useCallback(
    (id) => {
      const charge = shippingCharges.find((c) => c.id === id);
      if (charge) {
        setEditingShippingCharge(charge);
        setShippingForm(charge);
      }
    },
    [shippingCharges]
  );

  const handleSaveEditedShippingCharge = useCallback(() => {
    if (editingShippingCharge) {
      setShippingCharges((prev) =>
        prev.map((c) =>
          c.id === editingShippingCharge.id
            ? { ...shippingForm, id: editingShippingCharge.id }
            : c
        )
      );
      setEditingShippingCharge(null);
      resetForm(setShippingForm, DEFAULT_SHIPPING_FORM);
      updateModal("shippingChargeUpdatedSuccess", true);
    }
  }, [editingShippingCharge, shippingForm, resetForm, updateModal]);

  const handleCancelEditShippingCharge = useCallback(() => {
    setEditingShippingCharge(null);
    resetForm(setShippingForm, DEFAULT_SHIPPING_FORM);
  }, [resetForm]);

  const handleDeleteShippingCharge = useCallback(
    (id) => {
      setDeletingShippingChargeId(id);
      updateModal("shippingChargeDeleteConfirm", true);
    },
    [updateModal]
  );

  const handleConfirmDeleteShippingCharge = useCallback(() => {
    if (deletingShippingChargeId) {
      setShippingCharges((prev) =>
        prev.filter((c) => c.id !== deletingShippingChargeId)
      );
      updateModal("shippingChargeDeleteConfirm", false);
      updateModal("shippingChargeDeletedSuccess", true);
      setDeletingShippingChargeId(null);
    }
  }, [deletingShippingChargeId, updateModal]);

  const handleCancelDeleteShippingCharge = useCallback(() => {
    updateModal("shippingChargeDeleteConfirm", false);
    setDeletingShippingChargeId(null);
  }, [updateModal]);

  // Shipping charges success modal handlers
  const handleShippingChargeCreatedSuccessDone = useCallback(() => {
    updateModal("shippingChargeCreatedSuccess", false);
  }, [updateModal]);

  const handleShippingChargeUpdatedSuccessDone = useCallback(() => {
    updateModal("shippingChargeUpdatedSuccess", false);
  }, [updateModal]);

  const handleShippingChargeDeletedSuccessDone = useCallback(() => {
    updateModal("shippingChargeDeletedSuccess", false);
  }, [updateModal]);

  // ==============================
  // HSN CODE HANDLERS
  // ==============================
  const handleOpenHsnCodeModal = useCallback(() => {
    updateModal("hsnCodeModal", true);
  }, [updateModal]);

  const handleCloseHsnCodeModal = useCallback(() => {
    updateModal("hsnCodeModal", false);
    setEditingHsnCode(null);
    setDeletingHsnCodeId(null);
    resetForm(setHsnCodeForm, DEFAULT_HSN_CODE_FORM);
  }, [updateModal, resetForm]);

  // ==============================
  // HSN CODE HANDLERS (useCallback optimized)
  // ==============================

  const handleHsnCodeFormChange = useCallback((field, value) => {
    setHsnCodeForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCreateHsnCode = useCallback(() => {
    if (!validateField(hsnCodeForm.code)) {
      alert("Please enter a valid HSN code");
      return;
    }

    const newCode = createItemWithId(hsnCodeForm, {
      isDefault: false,
      isAlternate: false,
    });

    setHsnCodes((prev) => [...prev, newCode]);
    resetForm(setHsnCodeForm, { code: "" });
    updateModal("hsnCodeCreatedModal", true);
  }, [hsnCodeForm, validateField, createItemWithId, resetForm, updateModal]);

  const handleEditHsnCode = useCallback(
    (id) => {
      const code = hsnCodes.find((c) => c.id === id);
      if (code) {
        setEditingHsnCode(code);
        setHsnCodeForm(code);
      }
    },
    [hsnCodes]
  );

  const handleSaveEditedHsnCode = useCallback(() => {
    if (!editingHsnCode || !validateField(hsnCodeForm.code)) {
      alert("Please enter a valid HSN code");
      return;
    }

    setHsnCodes((prev) =>
      prev.map((c) =>
        c.id === editingHsnCode.id
          ? { ...hsnCodeForm, id: editingHsnCode.id }
          : c
      )
    );

    setEditingHsnCode(null);
    resetForm(setHsnCodeForm, { code: "" });
    updateModal("hsnCodeUpdatedModal", true);
  }, [editingHsnCode, hsnCodeForm, validateField, resetForm, updateModal]);

  const handleCancelEditHsnCode = useCallback(() => {
    setEditingHsnCode(null);
    resetForm(setHsnCodeForm, { code: "" });
  }, [resetForm]);

  const handleDeleteHsnCode = useCallback(
    (id) => {
      setDeletingHsnCodeId(id);
      updateModal("deleteHsnCodeModal", true);
    },
    [updateModal]
  );

  const handleConfirmDeleteHsnCode = useCallback(() => {
    if (deletingHsnCodeId) {
      setHsnCodes((prev) => removeItemById(prev, deletingHsnCodeId));
      setModals((prev) => ({
        ...prev,
        deleteHsnCodeModal: false,
        hsnCodeDeletedModal: true,
      }));
      setDeletingHsnCodeId(null);
    }
  }, [deletingHsnCodeId, removeItemById]);

  const handleCancelDeleteHsnCode = useCallback(() => {
    updateModal("deleteHsnCodeModal", false);
    setDeletingHsnCodeId(null);
  }, [updateModal]);

  const handleSaveAsDefault = useCallback((id) => {
    setHsnCodes((prev) =>
      prev.map((c) => ({
        ...c,
        isDefault: c.id === id,
        isAlternate: c.id === id ? false : c.isAlternate,
      }))
    );
  }, []);

  const handleAssignAsAlternate = useCallback((id) => {
    setHsnCodes((prev) =>
      prev.map((c) => ({
        ...c,
        isAlternate: c.id === id,
        isDefault: c.id === id ? false : c.isDefault,
      }))
    );
  }, []);

  // HSN code success modal handlers
  const handleHsnCodeCreatedSuccessDone = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      hsnCodeCreatedModal: false,
      hsnCodeModal: false,
    }));
  }, []);

  const handleHsnCodeUpdatedSuccessDone = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      hsnCodeUpdatedModal: false,
      hsnCodeModal: false,
    }));
  }, []);

  const handleHsnCodeDeletedSuccessDone = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      hsnCodeDeletedModal: false,
      hsnCodeModal: false,
    }));
  }, []);

  // ==============================
  // LOCATION & LANGUAGE HANDLERS (useCallback optimized)
  // ==============================

  const handleOpenLanguageCountryModal = useCallback(() => {
    updateLocationModal("languageCountryModal", true);
  }, [updateLocationModal]);

  const handleCloseLanguageCountryModal = useCallback(() => {
    updateLocationModal("languageCountryModal", false);
    setLocationSettings((prev) => ({
      ...prev,
      searchTerm: "",
      selectedCountry: "",
      selectedLanguage: "",
      selectedCurrency: "",
    }));
    setEditingCountry(null);
    setEditingLanguage(null);
    setEditingCurrency(null);
  }, [updateLocationModal]);

  const handleLocationSettingChange = useCallback((field, value) => {
    setLocationSettings((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAddCountry = useCallback(() => {
    if (!validateField(locationSettings.selectedCountry)) return;

    const newCountry = createItemWithId({
      name: locationSettings.selectedCountry,
      order: locationSettings.countries.length + 1,
    });

    setLocationSettings((prev) => ({
      ...prev,
      countries: [...prev.countries, newCountry],
      selectedCountry: "",
    }));
    updateLocationModal("countryCreatedSuccess", true);
  }, [
    locationSettings.selectedCountry,
    locationSettings.countries.length,
    validateField,
    createItemWithId,
    updateLocationModal,
  ]);

  const handleAddLanguage = useCallback(() => {
    if (!validateField(locationSettings.selectedLanguage)) return;

    const newLanguage = createItemWithId({
      name: locationSettings.selectedLanguage,
      order: locationSettings.languages.length + 1,
    });

    setLocationSettings((prev) => ({
      ...prev,
      languages: [...prev.languages, newLanguage],
      selectedLanguage: "",
    }));
    updateLocationModal("languageCreatedSuccess", true);
  }, [
    locationSettings.selectedLanguage,
    locationSettings.languages.length,
    validateField,
    createItemWithId,
    updateLocationModal,
  ]);

  const handleAddCurrency = useCallback(() => {
    if (!validateField(locationSettings.selectedCurrency)) return;

    const newCurrency = createItemWithId({
      name: locationSettings.selectedCurrency,
      order: locationSettings.currencies.length + 1,
    });

    setLocationSettings((prev) => ({
      ...prev,
      currencies: [...prev.currencies, newCurrency],
      selectedCurrency: "",
    }));
    updateLocationModal("currencyCreatedSuccess", true);
  }, [
    locationSettings.selectedCurrency,
    locationSettings.currencies.length,
    validateField,
    createItemWithId,
    updateLocationModal,
  ]);

  const handleEditCountry = useCallback(
    (id) => {
      const country = locationSettings.countries.find((c) => c.id === id);
      if (country) {
        setEditingCountry(country);
        setLocationSettings((prev) => ({
          ...prev,
          selectedCountry: country.name,
        }));
      }
    },
    [locationSettings.countries]
  );

  const handleEditLanguage = useCallback(
    (id) => {
      const language = locationSettings.languages.find((l) => l.id === id);
      if (language) {
        setEditingLanguage(language);
        setLocationSettings((prev) => ({
          ...prev,
          selectedLanguage: language.name,
        }));
      }
    },
    [locationSettings.languages]
  );

  const handleEditCurrency = useCallback(
    (id) => {
      const currency = locationSettings.currencies.find((c) => c.id === id);
      if (currency) {
        setEditingCurrency(currency);
        setLocationSettings((prev) => ({
          ...prev,
          selectedCurrency: currency.name,
        }));
      }
    },
    [locationSettings.currencies]
  );

  const handleSaveEditedCountry = useCallback(() => {
    if (!editingCountry || !validateField(locationSettings.selectedCountry))
      return;

    setLocationSettings((prev) => ({
      ...prev,
      countries: updateItemById(prev.countries, editingCountry.id, {
        name: locationSettings.selectedCountry,
      }),
      selectedCountry: "",
    }));
    setEditingCountry(null);
  }, [
    editingCountry,
    locationSettings.selectedCountry,
    validateField,
    updateItemById,
  ]);

  const handleSaveEditedLanguage = useCallback(() => {
    if (!editingLanguage || !validateField(locationSettings.selectedLanguage))
      return;

    setLocationSettings((prev) => ({
      ...prev,
      languages: updateItemById(prev.languages, editingLanguage.id, {
        name: locationSettings.selectedLanguage,
      }),
      selectedLanguage: "",
    }));
    setEditingLanguage(null);
  }, [
    editingLanguage,
    locationSettings.selectedLanguage,
    validateField,
    updateItemById,
  ]);

  const handleSaveEditedCurrency = useCallback(() => {
    if (!editingCurrency || !validateField(locationSettings.selectedCurrency))
      return;

    setLocationSettings((prev) => ({
      ...prev,
      currencies: updateItemById(prev.currencies, editingCurrency.id, {
        name: locationSettings.selectedCurrency,
      }),
      selectedCurrency: "",
    }));
    setEditingCurrency(null);
  }, [
    editingCurrency,
    locationSettings.selectedCurrency,
    validateField,
    updateItemById,
  ]);

  const handleDeleteCountry = useCallback(
    (id) => {
      setDeletingCountryId(id);
      updateLocationModal("deleteCountryConfirm", true);
    },
    [updateLocationModal]
  );

  const handleDeleteLanguage = useCallback(
    (id) => {
      setDeletingLanguageId(id);
      updateLocationModal("deleteLanguageConfirm", true);
    },
    [updateLocationModal]
  );

  const handleDeleteCurrency = useCallback(
    (id) => {
      setDeletingCurrencyId(id);
      updateLocationModal("deleteCurrencyConfirm", true);
    },
    [updateLocationModal]
  );

  const handleConfirmDeleteCountry = useCallback(() => {
    if (deletingCountryId) {
      setLocationSettings((prev) => ({
        ...prev,
        countries: removeItemById(prev.countries, deletingCountryId),
      }));
      setLocationModals((prev) => ({
        ...prev,
        deleteCountryConfirm: false,
        countryDeletedSuccess: true,
      }));
      setDeletingCountryId(null);
    }
  }, [deletingCountryId, removeItemById]);

  const handleConfirmDeleteLanguage = useCallback(() => {
    if (deletingLanguageId) {
      setLocationSettings((prev) => ({
        ...prev,
        languages: removeItemById(prev.languages, deletingLanguageId),
      }));
      setLocationModals((prev) => ({
        ...prev,
        deleteLanguageConfirm: false,
        languageDeletedSuccess: true,
      }));
      setDeletingLanguageId(null);
    }
  }, [deletingLanguageId, removeItemById]);

  const handleConfirmDeleteCurrency = useCallback(() => {
    if (deletingCurrencyId) {
      setLocationSettings((prev) => ({
        ...prev,
        currencies: removeItemById(prev.currencies, deletingCurrencyId),
      }));
      setLocationModals((prev) => ({
        ...prev,
        deleteCurrencyConfirm: false,
        currencyDeletedSuccess: true,
      }));
      setDeletingCurrencyId(null);
    }
  }, [deletingCurrencyId, removeItemById]);

  const handleCancelDeleteCountry = useCallback(() => {
    updateLocationModal("deleteCountryConfirm", false);
    setDeletingCountryId(null);
  }, [updateLocationModal]);

  const handleCancelDeleteLanguage = useCallback(() => {
    updateLocationModal("deleteLanguageConfirm", false);
    setDeletingLanguageId(null);
  }, [updateLocationModal]);

  const handleCancelDeleteCurrency = useCallback(() => {
    updateLocationModal("deleteCurrencyConfirm", false);
    setDeletingCurrencyId(null);
  }, [updateLocationModal]);

  // Location success modal handlers
  const handleLocationSuccessDone = useCallback(
    (type) => {
      updateLocationModal(`${type}CreatedSuccess`, false);
    },
    [updateLocationModal]
  );

  const handleLocationDeletedSuccessDone = useCallback(
    (type) => {
      updateLocationModal(`${type}DeletedSuccess`, false);
    },
    [updateLocationModal]
  );

  // ==============================
  // ORDER EDITING HANDLERS (useCallback optimized)
  // ==============================

  const handleOpenEditOrderModal = useCallback(() => {
    updateLocationModal("editOrderModal", true);
    // Initialize editing orders with current values
    const currentOrders = {
      countries: {},
      languages: {},
      currencies: {},
    };
    locationSettings.countries.forEach((country) => {
      currentOrders.countries[country.id] = country.order;
    });
    locationSettings.languages.forEach((language) => {
      currentOrders.languages[language.id] = language.order;
    });
    locationSettings.currencies.forEach((currency) => {
      currentOrders.currencies[currency.id] = currency.order;
    });
    setEditingOrders(currentOrders);
  }, [
    updateLocationModal,
    locationSettings.countries,
    locationSettings.languages,
    locationSettings.currencies,
  ]);

  const handleCloseEditOrderModal = useCallback(() => {
    updateLocationModal("editOrderModal", false);
    setEditingOrders({ countries: {}, languages: {}, currencies: {} });
    setNewOrderInput("");
  }, [updateLocationModal]);

  const handleOrderChange = useCallback((type, id, newOrder) => {
    setEditingOrders((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [id]: parseInt(newOrder) || 1,
      },
    }));
  }, []);

  const handleSaveOrders = useCallback(() => {
    // Update countries, languages, and currencies with new orders
    setLocationSettings((prev) => ({
      ...prev,
      countries: prev.countries
        .map((country) => ({
          ...country,
          order: editingOrders.countries[country.id] || country.order,
        }))
        .sort((a, b) => a.order - b.order),
      languages: prev.languages
        .map((language) => ({
          ...language,
          order: editingOrders.languages[language.id] || language.order,
        }))
        .sort((a, b) => a.order - b.order),
      currencies: prev.currencies
        .map((currency) => ({
          ...currency,
          order: editingOrders.currencies[currency.id] || currency.order,
        }))
        .sort((a, b) => a.order - b.order),
    }));

    handleCloseEditOrderModal();
    updateLocationModal("ordersSavedSuccess", true);
  }, [editingOrders, handleCloseEditOrderModal, updateLocationModal]);

  const handleBulkOrderChange = useCallback(() => {
    if (!validateField(newOrderInput, "number")) return;

    const newOrder = parseInt(newOrderInput);
    if (!newOrder || newOrder <= 0) return;

    // Find the next available order number
    const allOrders = [
      ...Object.values(editingOrders.countries),
      ...Object.values(editingOrders.languages),
      ...Object.values(editingOrders.currencies),
    ];
    const maxOrder = Math.max(...allOrders, 0);

    // You can implement bulk order logic here
    setNewOrderInput("");
  }, [newOrderInput, validateField, editingOrders]);

  // ==============================
  // AUTO NOTIFICATION HANDLERS (useCallback optimized)
  // ==============================

  const handleOpenAutoNotificationModal = useCallback(() => {
    setAutoNotificationModals((prev) => ({
      ...prev,
      autoNotificationModal: true,
    }));
  }, []);

  const handleCloseAutoNotificationModal = useCallback(() => {
    setAutoNotificationModals((prev) => ({
      ...prev,
      autoNotificationModal: false,
    }));
    setEditingNotificationCondition(null);
    setDeletingNotificationConditionId(null);
    setAutoNotificationSettings((prev) => ({ ...prev, criteria: "" }));
  }, []);

  const handleAutoNotificationChange = useCallback((field, value) => {
    setAutoNotificationSettings((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCreateNotificationCondition = useCallback(() => {
    if (!validateField(autoNotificationSettings.criteria)) {
      alert("Please enter notification criteria");
      return;
    }

    const newCondition = createItemWithId({
      criteria: autoNotificationSettings.criteria,
      type: "Price Drop & Restock",
      createdAt: new Date().toLocaleDateString(),
    });

    setAutoNotificationSettings((prev) => ({
      ...prev,
      conditions: [...prev.conditions, newCondition],
      criteria: "",
    }));
    setAutoNotificationModals((prev) => ({
      ...prev,
      conditionCreatedSuccess: true,
    }));
  }, [autoNotificationSettings.criteria, validateField, createItemWithId]);

  const handleEditNotificationCondition = useCallback(
    (id) => {
      const condition = autoNotificationSettings.conditions.find(
        (c) => c.id === id
      );
      if (condition) {
        setEditingNotificationCondition(condition);
        setAutoNotificationSettings((prev) => ({
          ...prev,
          criteria: condition.criteria,
        }));
      }
    },
    [autoNotificationSettings.conditions]
  );

  const handleSaveEditedNotificationCondition = useCallback(() => {
    if (
      !editingNotificationCondition ||
      !validateField(autoNotificationSettings.criteria)
    ) {
      alert("Please enter notification criteria");
      return;
    }

    setAutoNotificationSettings((prev) => ({
      ...prev,
      conditions: updateItemById(
        prev.conditions,
        editingNotificationCondition.id,
        {
          criteria: autoNotificationSettings.criteria,
        }
      ),
      criteria: "",
    }));
    setEditingNotificationCondition(null);
    setAutoNotificationModals((prev) => ({
      ...prev,
      conditionUpdatedSuccess: true,
    }));
  }, [
    editingNotificationCondition,
    autoNotificationSettings.criteria,
    validateField,
    updateItemById,
  ]);

  const handleCancelEditNotificationCondition = useCallback(() => {
    setEditingNotificationCondition(null);
    setAutoNotificationSettings((prev) => ({ ...prev, criteria: "" }));
  }, []);

  const handleDeleteNotificationCondition = useCallback((id) => {
    setDeletingNotificationConditionId(id);
    setAutoNotificationModals((prev) => ({
      ...prev,
      conditionDeleteConfirm: true,
    }));
  }, []);

  const handleConfirmDeleteNotificationCondition = useCallback(() => {
    if (deletingNotificationConditionId) {
      setAutoNotificationSettings((prev) => ({
        ...prev,
        conditions: removeItemById(
          prev.conditions,
          deletingNotificationConditionId
        ),
      }));
      setAutoNotificationModals((prev) => ({
        ...prev,
        conditionDeleteConfirm: false,
        conditionDeletedSuccess: true,
      }));
      setDeletingNotificationConditionId(null);
    }
  }, [deletingNotificationConditionId, removeItemById]);

  const handleCancelDeleteNotificationCondition = useCallback(() => {
    setAutoNotificationModals((prev) => ({
      ...prev,
      conditionDeleteConfirm: false,
    }));
    setDeletingNotificationConditionId(null);
  }, []);

  // Auto notification success modal handlers
  const handleNotificationConditionCreatedSuccessDone = useCallback(() => {
    setAutoNotificationModals((prev) => ({
      ...prev,
      conditionCreatedSuccess: false,
    }));
  }, []);

  const handleNotificationConditionUpdatedSuccessDone = useCallback(() => {
    setAutoNotificationModals((prev) => ({
      ...prev,
      conditionUpdatedSuccess: false,
    }));
  }, []);

  const handleNotificationConditionDeletedSuccessDone = useCallback(() => {
    setAutoNotificationModals((prev) => ({
      ...prev,
      conditionDeletedSuccess: false,
    }));
  }, []);

  // Dynamic pricing handlers
  // ==============================
  // DYNAMIC PRICING HANDLERS (useCallback optimized)
  // ==============================

  const handleOpenDynamicPricingModal = useCallback(() => {
    setDynamicPricingModals((prev) => ({ ...prev, dynamicPricingModal: true }));
  }, []);

  const handleCloseDynamicPricingModal = useCallback(() => {
    setDynamicPricingModals((prev) => ({
      ...prev,
      dynamicPricingModal: false,
    }));
    setEditingDynamicPricingCondition(null);
    setDeletingDynamicPricingConditionId(null);
    resetForm(setDynamicPricingForm, {
      category: "",
      subCategory: "",
      items: "",
      specified: "",
      discountType: "",
      startDate: "",
      endDate: "",
      minimumOrderValue: "",
      maxUsers: "",
    });
    setDynamicPricingSettings((prev) => ({ ...prev, criteria: "" }));
  }, [resetForm]);

  const handleDynamicPricingFormChange = useCallback((field, value) => {
    setDynamicPricingForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleDynamicPricingCriteriaChange = useCallback((value) => {
    setDynamicPricingSettings((prev) => ({ ...prev, criteria: value }));
  }, []);

  const handleCreateDynamicPricingCondition = useCallback(() => {
    if (!validateField(dynamicPricingSettings.criteria)) {
      alert("Please enter pricing criteria");
      return;
    }

    const newCondition = createItemWithId({
      ...dynamicPricingForm,
      criteria: dynamicPricingSettings.criteria,
      type: "Dynamic Pricing",
      createdAt: new Date().toLocaleDateString(),
    });

    setDynamicPricingSettings((prev) => ({
      ...prev,
      conditions: [...prev.conditions, newCondition],
      criteria: "",
    }));
    resetForm(setDynamicPricingForm, {
      category: "",
      subCategory: "",
      items: "",
      specified: "",
      discountType: "",
      startDate: "",
      endDate: "",
      minimumOrderValue: "",
      maxUsers: "",
    });
    setDynamicPricingModals((prev) => ({
      ...prev,
      conditionCreatedSuccess: true,
    }));
  }, [
    dynamicPricingForm,
    dynamicPricingSettings.criteria,
    validateField,
    createItemWithId,
    resetForm,
  ]);

  const handleEditDynamicPricingCondition = useCallback(
    (id) => {
      const condition = dynamicPricingSettings.conditions.find(
        (c) => c.id === id
      );
      if (condition) {
        setEditingDynamicPricingCondition(condition);
        setDynamicPricingForm(condition);
        setDynamicPricingSettings((prev) => ({
          ...prev,
          criteria: condition.criteria || "",
        }));
      }
    },
    [dynamicPricingSettings.conditions]
  );

  const handleSaveEditedDynamicPricingCondition = useCallback(() => {
    if (
      !editingDynamicPricingCondition ||
      !validateField(dynamicPricingSettings.criteria)
    ) {
      alert("Please enter pricing criteria");
      return;
    }

    setDynamicPricingSettings((prev) => ({
      ...prev,
      conditions: updateItemById(
        prev.conditions,
        editingDynamicPricingCondition.id,
        {
          ...dynamicPricingForm,
          criteria: prev.criteria,
        }
      ),
      criteria: "",
    }));
    setEditingDynamicPricingCondition(null);
    resetForm(setDynamicPricingForm, {
      category: "",
      subCategory: "",
      items: "",
      specified: "",
      discountType: "",
      startDate: "",
      endDate: "",
      minimumOrderValue: "",
      maxUsers: "",
    });
    setDynamicPricingModals((prev) => ({
      ...prev,
      conditionUpdatedSuccess: true,
    }));
  }, [
    editingDynamicPricingCondition,
    dynamicPricingForm,
    dynamicPricingSettings.criteria,
    validateField,
    updateItemById,
    resetForm,
  ]);

  const handleCancelEditDynamicPricingCondition = useCallback(() => {
    setEditingDynamicPricingCondition(null);
    resetForm(setDynamicPricingForm, {
      category: "",
      subCategory: "",
      items: "",
      specified: "",
      discountType: "",
      startDate: "",
      endDate: "",
      minimumOrderValue: "",
      maxUsers: "",
    });
    setDynamicPricingSettings((prev) => ({ ...prev, criteria: "" }));
  }, [resetForm]);

  const handleDeleteDynamicPricingCondition = useCallback((id) => {
    setDeletingDynamicPricingConditionId(id);
    setDynamicPricingModals((prev) => ({
      ...prev,
      conditionDeleteConfirm: true,
    }));
  }, []);

  const handleConfirmDeleteDynamicPricingCondition = useCallback(() => {
    if (deletingDynamicPricingConditionId) {
      setDynamicPricingSettings((prev) => ({
        ...prev,
        conditions: removeItemById(
          prev.conditions,
          deletingDynamicPricingConditionId
        ),
      }));
      setDynamicPricingModals((prev) => ({
        ...prev,
        conditionDeleteConfirm: false,
        conditionDeletedSuccess: true,
      }));
      setDeletingDynamicPricingConditionId(null);
    }
  }, [deletingDynamicPricingConditionId, removeItemById]);

  const handleCancelDeleteDynamicPricingCondition = useCallback(() => {
    setDynamicPricingModals((prev) => ({
      ...prev,
      conditionDeleteConfirm: false,
    }));
    setDeletingDynamicPricingConditionId(null);
  }, []);

  // Dynamic pricing success modal handlers
  const handleDynamicPricingConditionCreatedSuccessDone = useCallback(() => {
    setDynamicPricingModals((prev) => ({
      ...prev,
      conditionCreatedSuccess: false,
    }));
  }, []);

  const handleDynamicPricingConditionUpdatedSuccessDone = useCallback(() => {
    setDynamicPricingModals((prev) => ({
      ...prev,
      conditionUpdatedSuccess: false,
    }));
  }, []);

  const handleDynamicPricingConditionDeletedSuccessDone = useCallback(() => {
    setDynamicPricingModals((prev) => ({
      ...prev,
      conditionDeletedSuccess: false,
    }));
  }, []);

  // ==============================
  // WEBHOOK MANAGEMENT HANDLERS (useCallback optimized)
  // ==============================

  const handleOpenWebhookModal = useCallback(() => {
    setWebhookModals((prev) => ({ ...prev, webhookModal: true }));
  }, []);

  const handleCloseWebhookModal = useCallback(() => {
    setWebhookModals((prev) => ({ ...prev, webhookModal: false }));
    setEditingWebhook(null);
    setDeletingWebhookId(null);
    resetForm(setWebhookForm, {
      event: "",
      webhookUrl: "",
      secretKey: "",
    });
  }, [resetForm]);

  const handleWebhookFormChange = useCallback((field, value) => {
    setWebhookForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCreateWebhook = useCallback(() => {
    if (
      !validateField(webhookForm.event) ||
      !validateField(webhookForm.webhookUrl, "url")
    ) {
      alert("Please fill in all required fields with valid data");
      return;
    }

    const newWebhook = createItemWithId(webhookForm, {
      status: "active",
      lastTriggered: null,
      responseSize: "0kb",
    });

    setWebhookSettings((prev) => ({
      ...prev,
      webhooks: [...prev.webhooks, newWebhook],
    }));
    resetForm(setWebhookForm, {
      event: "",
      webhookUrl: "",
      secretKey: "",
    });
    setWebhookModals((prev) => ({ ...prev, webhookCreatedSuccess: true }));
  }, [webhookForm, validateField, createItemWithId, resetForm]);

  const handleEditWebhook = useCallback(
    (id) => {
      const webhook = webhookSettings.webhooks.find((w) => w.id === id);
      if (webhook) {
        setEditingWebhook(webhook);
        setWebhookForm({
          event: webhook.event,
          webhookUrl: webhook.webhookUrl,
          secretKey: webhook.secretKey,
        });
      }
    },
    [webhookSettings.webhooks]
  );

  const handleSaveEditedWebhook = useCallback(() => {
    if (
      !editingWebhook ||
      !validateField(webhookForm.event) ||
      !validateField(webhookForm.webhookUrl, "url")
    ) {
      alert("Please fill in all required fields with valid data");
      return;
    }

    setWebhookSettings((prev) => ({
      ...prev,
      webhooks: updateItemById(prev.webhooks, editingWebhook.id, webhookForm),
    }));
    setEditingWebhook(null);
    resetForm(setWebhookForm, {
      event: "",
      webhookUrl: "",
      secretKey: "",
    });
    setWebhookModals((prev) => ({ ...prev, webhookUpdatedSuccess: true }));
  }, [editingWebhook, webhookForm, validateField, updateItemById, resetForm]);

  const handleCancelEditWebhook = useCallback(() => {
    setEditingWebhook(null);
    resetForm(setWebhookForm, {
      event: "",
      webhookUrl: "",
      secretKey: "",
    });
  }, [resetForm]);

  const handleDeleteWebhook = useCallback((id) => {
    setDeletingWebhookId(id);
    setWebhookModals((prev) => ({ ...prev, webhookDeleteConfirm: true }));
  }, []);

  const handleConfirmDeleteWebhook = useCallback(() => {
    if (deletingWebhookId) {
      setWebhookSettings((prev) => ({
        ...prev,
        webhooks: removeItemById(prev.webhooks, deletingWebhookId),
      }));
      setWebhookModals((prev) => ({
        ...prev,
        webhookDeleteConfirm: false,
        webhookDeletedSuccess: true,
      }));
      setDeletingWebhookId(null);
    }
  }, [deletingWebhookId, removeItemById]);

  const handleCancelDeleteWebhook = useCallback(() => {
    setWebhookModals((prev) => ({ ...prev, webhookDeleteConfirm: false }));
    setDeletingWebhookId(null);
  }, []);

  const handleToggleApiPermission = useCallback((permission) => {
    setWebhookSettings((prev) => ({
      ...prev,
      apiPermissions: {
        ...prev.apiPermissions,
        [permission]: !prev.apiPermissions[permission],
      },
    }));
  }, []);

  // Webhook success modal handlers
  const handleWebhookCreatedSuccessDone = useCallback(() => {
    setWebhookModals((prev) => ({ ...prev, webhookCreatedSuccess: false }));
  }, []);

  const handleWebhookUpdatedSuccessDone = useCallback(() => {
    setWebhookModals((prev) => ({ ...prev, webhookUpdatedSuccess: false }));
  }, []);

  const handleWebhookDeletedSuccessDone = useCallback(() => {
    setWebhookModals((prev) => ({ ...prev, webhookDeletedSuccess: false }));
  }, []);

  // ==============================
  // SUCCESS MODAL COMPONENTS (optimized with useCallback)
  // ==============================

  const SuccessModalComponent = useCallback(
    ({ isOpen, title, message, onClose, onDone, showDoneButton = true }) => {
      if (!isOpen) return null;

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-md mx-4 overflow-clip">
            <button
              onClick={onClose}
              className="absolute right-5 top-5 w-6 h-6 text-gray-500 hover:text-gray-700 z-10"
            >
              <X />
            </button>

            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
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

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-gray-600 mb-6">{message}</p>

              {showDoneButton && (
                <button
                  onClick={onDone}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      );
    },
    []
  );

  const ConfirmationModalComponent = useCallback(
    ({
      isOpen,
      title,
      message,
      onConfirm,
      onCancel,
      confirmText = "Confirm",
      cancelText = "Cancel",
      isDestructive = false,
    }) => {
      if (!isOpen) return null;

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-md mx-4 overflow-clip">
            <button
              onClick={onCancel}
              className="absolute right-5 top-5 w-6 h-6 text-gray-500 hover:text-gray-700 z-10"
            >
              <X />
            </button>

            <div className="p-8">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isDestructive ? "bg-red-100" : "bg-blue-100"
                }`}
              >
                {isDestructive ? (
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>

              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-gray-600 mb-6">{message}</p>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={onCancel}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={onConfirm}
                    className={`px-6 py-2 rounded-lg text-white transition-colors ${
                      isDestructive
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    },
    []
  );

  // Render modals for a specific setting
  const renderModalsForSetting = useCallback(
    (settingKey, displayName) => {
      return (
        <>
          {/* Confirmation Modal - On */}
          {modals[`${settingKey}ConfirmOn`] && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-md mx-4 overflow-clip">
                <button
                  onClick={() => handleCancelToggle(settingKey, "On")}
                  className="absolute right-5 top-5 w-6 h-6 text-gray-500 hover:text-gray-700 z-10"
                >
                  <X />
                </button>
                <div className="absolute top-[60px] left-1/2 transform -translate-x-1/2 w-[165px] text-center">
                  <p className="font-bold text-black text-[18px] leading-[22px] tracking-[-0.41px] font-['Montserrat']">
                    Are you sure you want to turn {displayName} on
                  </p>
                </div>
                <div className="absolute top-[189px] left-1/2 transform -translate-x-1/2 flex gap-4">
                  <button
                    onClick={() => handleConfirmToggleOn(settingKey)}
                    className="bg-black text-white rounded-3xl w-[149px] h-12 font-semibold text-[16px] leading-[22px] font-['Montserrat'] hover:bg-gray-800 transition-colors"
                  >
                    yes
                  </button>
                  <button
                    onClick={() => handleCancelToggle(settingKey, "On")}
                    className="border border-[#e4e4e4] text-black rounded-[100px] w-[209px] h-16 font-medium text-[16px] leading-[19.2px] font-['Montserrat'] hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    Cancel
                  </button>
                </div>
                <div className="h-[280px]"></div>
              </div>
            </div>
          )}

          {/* Confirmation Modal - Off */}
          {modals[`${settingKey}ConfirmOff`] && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-md mx-4 overflow-clip">
                <button
                  onClick={() => handleCancelToggle(settingKey, "Off")}
                  className="absolute right-5 top-5 w-6 h-6 text-gray-500 hover:text-gray-700 z-10"
                >
                  <X />
                </button>
                <div className="absolute top-[60px] left-1/2 transform -translate-x-1/2 w-[165px] text-center">
                  <p className="font-bold text-black text-[18px] leading-[22px] tracking-[-0.41px] font-['Montserrat']">
                    Are you sure you want to turn {displayName} off
                  </p>
                </div>
                <div className="absolute top-[189px] left-1/2 transform -translate-x-1/2 flex gap-4">
                  <button
                    onClick={() => handleConfirmToggleOff(settingKey)}
                    className="bg-black text-white rounded-3xl w-[149px] h-12 font-semibold text-[16px] leading-[22px] font-['Montserrat'] hover:bg-gray-800 transition-colors"
                  >
                    yes
                  </button>
                  <button
                    onClick={() => handleCancelToggle(settingKey, "Off")}
                    className="border border-[#e4e4e4] text-black rounded-[100px] w-[209px] h-16 font-medium text-[16px] leading-[19.2px] font-['Montserrat'] hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    Cancel
                  </button>
                </div>
                <div className="h-[280px]"></div>
              </div>
            </div>
          )}

          {/* 2FA Modal - On */}
          {modals[`${settingKey}2FAOn`] && (
            <TwoFactorAuth
              onSubmit={(data) => handle2FASubmit(settingKey, "On", data)}
              onClose={() => handleCancel2FA(settingKey, "On")}
              phoneNumber="+1 (555) 123-4567"
              emailAddress="user@example.com"
            />
          )}

          {/* 2FA Modal - Off */}
          {modals[`${settingKey}2FAOff`] && (
            <TwoFactorAuth
              onSubmit={(data) => handle2FASubmit(settingKey, "Off", data)}
              onClose={() => handleCancel2FA(settingKey, "Off")}
              phoneNumber="+1 (555) 123-4567"
              emailAddress="user@example.com"
            />
          )}

          {/* Success Modal - On */}
          {modals[`${settingKey}SuccessOn`] && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-md mx-4 overflow-clip">
                <button
                  onClick={() => handleCloseSuccessModal(settingKey, "On")}
                  className="absolute right-5 top-5 w-6 h-6 text-gray-500 hover:text-gray-700 z-10"
                >
                  <X />
                </button>
                <div className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                    <h3 className="font-bold text-black text-[18px] mb-2">
                      {displayName} Turned On
                    </h3>
                    <p className="text-gray-600">
                      The setting has been successfully activated.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSuccessModalDone(settingKey, "On")}
                    className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Modal - Off */}
          {modals[`${settingKey}SuccessOff`] && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-md mx-4 overflow-clip">
                <button
                  onClick={() => handleCloseSuccessModal(settingKey, "Off")}
                  className="absolute right-5 top-5 w-6 h-6 text-gray-500 hover:text-gray-700 z-10"
                >
                  <X />
                </button>
                <div className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-red-600"
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
                    <h3 className="font-bold text-black text-[18px] mb-2">
                      {displayName} Turned Off
                    </h3>
                    <p className="text-gray-600">
                      The setting has been successfully deactivated.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSuccessModalDone(settingKey, "Off")}
                    className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Final Success Modal - On */}
          {modals[`${settingKey}FinalSuccessOn`] && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-md mx-4 overflow-clip">
                <button
                  onClick={() => handleCloseFinalSuccessModal(settingKey, "On")}
                  className="absolute right-5 top-5 w-6 h-6 text-gray-500 hover:text-gray-700 z-10"
                >
                  <X />
                </button>
                <div className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                    <h3 className="font-bold text-black text-[18px] mb-2">
                      Configuration Complete
                    </h3>
                    <p className="text-gray-600">
                      {displayName} is now active and configured.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleFinalSuccessModalDone(settingKey, "On")
                    }
                    className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Finish
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Final Success Modal - Off */}
          {modals[`${settingKey}FinalSuccessOff`] && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-md mx-4 overflow-clip">
                <button
                  onClick={() =>
                    handleCloseFinalSuccessModal(settingKey, "Off")
                  }
                  className="absolute right-5 top-5 w-6 h-6 text-gray-500 hover:text-gray-700 z-10"
                >
                  <X />
                </button>
                <div className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-red-600"
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
                    <h3 className="font-bold text-black text-[18px] mb-2">
                      Configuration Complete
                    </h3>
                    <p className="text-gray-600">
                      {displayName} has been successfully disabled.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleFinalSuccessModalDone(settingKey, "Off")
                    }
                    className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Finish
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      );
    },
    [
      modals,
      handleCancelToggle,
      handleConfirmToggleOn,
      handleConfirmToggleOff,
      handle2FASubmit,
      handleCancel2FA,
      handleSuccessModalDone,
      handleFinalSuccessModalDone,
    ]
  );

  // ==============================
  // COMPONENT MODALS
  // ==============================

  // Language, Country, Currency Management Component
  const LanguageCountryRegionModal = useCallback(
    () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-6xl mx-4 max-h-[90vh] overflow-auto">
          <button
            onClick={handleCloseLanguageCountryModal}
            className="absolute right-8 top-8 w-6 h-6 text-gray-500 hover:text-gray-700 z-10"
          >
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
          </button>

          <div className="p-8">
            <h2 className="text-center font-bold text-[24px] mb-8 font-montserrat">
              Add Country and Language
            </h2>

            {/* Applicable On Section */}
            <div className="mb-8">
              <h3 className="font-bold text-[21px] mb-4 font-montserrat">
                Applicable On
              </h3>

              {/* Search Input */}
              <div className="mb-6">
                <div className="relative max-w-sm">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5">
                    <svg
                      className="w-full h-full text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search"
                    value={locationSettings.searchTerm}
                    onChange={(e) =>
                      handleLocationSettingChange("searchTerm", e.target.value)
                    }
                    className="w-full pl-12 pr-4 py-3 border border-[#d0d5dd] rounded-lg focus:border-blue-500 focus:outline-none shadow-sm"
                  />
                </div>
              </div>

              {/* Dropdown Selectors */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                {/* Country Selector */}
                <div>
                  <select
                    value={locationSettings.selectedCountry}
                    onChange={(e) =>
                      handleLocationSettingChange(
                        "selectedCountry",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 border border-[#979797] rounded-xl focus:border-blue-500 focus:outline-none text-[15px] font-montserrat"
                  >
                    <option value="">country</option>
                    {getFilteredOptions(
                      countryOptions,
                      locationSettings.searchTerm
                    ).map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language Selector */}
                <div>
                  <select
                    value={locationSettings.selectedLanguage}
                    onChange={(e) =>
                      handleLocationSettingChange(
                        "selectedLanguage",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 border border-[#979797] rounded-xl focus:border-blue-500 focus:outline-none text-[15px] font-montserrat"
                  >
                    <option value="">language</option>
                    {getFilteredOptions(
                      languageOptions,
                      locationSettings.searchTerm
                    ).map((language) => (
                      <option key={language} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Currency Selector */}
                <div>
                  <select
                    value={locationSettings.selectedCurrency}
                    onChange={(e) =>
                      handleLocationSettingChange(
                        "selectedCurrency",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 border border-[#979797] rounded-xl focus:border-blue-500 focus:outline-none text-[15px] font-montserrat"
                  >
                    <option value="">currency</option>
                    {getFilteredOptions(
                      currencyOptions,
                      locationSettings.searchTerm
                    ).map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add Buttons */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <button
                  onClick={handleAddCountry}
                  disabled={!locationSettings.selectedCountry}
                  className="bg-[#202224] text-white px-12 py-3 rounded-full font-medium text-[16px] hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-black font-montserrat"
                >
                  add country
                </button>
                <button
                  onClick={handleAddLanguage}
                  disabled={!locationSettings.selectedLanguage}
                  className="bg-[#202224] text-white px-12 py-3 rounded-full font-medium text-[16px] hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-black font-montserrat"
                >
                  add language
                </button>
                <button
                  onClick={handleAddCurrency}
                  disabled={!locationSettings.selectedCurrency}
                  className="bg-[#202224] text-white px-12 py-3 rounded-full font-medium text-[16px] hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-black font-montserrat"
                >
                  add currency
                </button>
              </div>
            </div>

            {/* Lists Section */}
            <div className="grid grid-cols-3 gap-8">
              {/* Countries List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[21px] font-montserrat">
                    countries
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-[21px] font-montserrat">
                      Order
                    </span>
                    <span className="font-bold text-[21px] font-montserrat">
                      edit
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {locationSettings.countries.map((country) => (
                    <div
                      key={country.id}
                      className="flex items-center justify-between p-3 border-2 border-black rounded-xl"
                    >
                      <span className="font-medium text-[16px] font-montserrat">
                        {country.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={country.order}
                          readOnly
                          className="w-12 h-12 text-center border-2 border-black rounded-xl"
                        />
                        <button
                          onClick={() => handleEditCountry(country.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteCountry(country.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[21px] font-montserrat">
                    language
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-[21px] font-montserrat">
                      Order
                    </span>
                    <span className="font-bold text-[21px] font-montserrat">
                      edit
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {locationSettings.languages.map((language) => (
                    <div
                      key={language.id}
                      className="flex items-center justify-between p-3 border-2 border-black rounded-xl"
                    >
                      <span className="font-medium text-[16px] font-montserrat">
                        {language.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={language.order}
                          readOnly
                          className="w-12 h-12 text-center border-2 border-black rounded-xl"
                        />
                        <button
                          onClick={() => handleEditLanguage(language.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteLanguage(language.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Currencies List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[21px] font-montserrat">
                    currency
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-[21px] font-montserrat">
                      Order
                    </span>
                    <span className="font-bold text-[21px] font-montserrat">
                      edit
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {locationSettings.currencies.map((currency) => (
                    <div
                      key={currency.id}
                      className="flex items-center justify-between p-3 border-2 border-black rounded-xl"
                    >
                      <span className="font-medium text-[16px] font-montserrat">
                        {currency.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={currency.order}
                          readOnly
                          className="w-12 h-12 text-center border-2 border-black rounded-xl"
                        />
                        <button
                          onClick={() => handleEditCurrency(currency.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteCurrency(currency.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={handleOpenEditOrderModal}
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
              >
                Edit Orders
              </button>
              {editingCountry && (
                <button
                  onClick={handleSaveEditedCountry}
                  className="bg-green-600 text-white px-6 py-2 rounded-full font-medium hover:bg-green-700 transition-colors"
                >
                  Save Country
                </button>
              )}
              {editingLanguage && (
                <button
                  onClick={handleSaveEditedLanguage}
                  className="bg-green-600 text-white px-6 py-2 rounded-full font-medium hover:bg-green-700 transition-colors"
                >
                  Save Language
                </button>
              )}
              {editingCurrency && (
                <button
                  onClick={handleSaveEditedCurrency}
                  className="bg-green-600 text-white px-6 py-2 rounded-full font-medium hover:bg-green-700 transition-colors"
                >
                  Save Currency
                </button>
              )}
              <button
                onClick={handleCloseLanguageCountryModal}
                className="border border-gray-300 text-black px-6 py-2 rounded-full font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    ),
    [
      locationSettings,
      locationModals,
      editingCountry,
      editingLanguage,
      editingCurrency,
      handleCloseLanguageCountryModal,
      handleLocationSettingChange,
      handleAddCountry,
      handleAddLanguage,
      handleAddCurrency,
      handleEditCountry,
      handleEditLanguage,
      handleEditCurrency,
      handleSaveEditedCountry,
      handleSaveEditedLanguage,
      handleSaveEditedCurrency,
      handleDeleteCountry,
      handleDeleteLanguage,
      handleDeleteCurrency,
      getFilteredOptions,
    ]
  );

  // Edit Order Modal Component
  const EditOrderModal = useCallback(
    () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-6xl mx-4 max-h-[90vh] overflow-auto">
          <button
            onClick={handleCloseEditOrderModal}
            className="absolute right-8 top-8 w-6 h-6 text-gray-500 hover:text-gray-700 z-10"
          >
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
          </button>

          <div className="p-8">
            <h2 className="text-center font-regular text-[24px] mb-8 font-montserrat tracking-[-0.6px]">
              Edit country language region
            </h2>

            {/* Three Column Layout for Order Editing */}
            <div className="grid grid-cols-3 gap-8 mb-8">
              {/* Countries Column */}
              <div>
                <div className="mb-4">
                  <h3 className="font-bold text-[21px] font-montserrat mb-2">
                    countries
                  </h3>
                  <div className="text-center">
                    <span className="font-bold text-[21px] font-montserrat">
                      Order
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {locationSettings.countries.map((country) => (
                    <div
                      key={country.id}
                      className="flex items-center justify-between"
                    >
                      <span className="font-medium text-[16px] font-montserrat flex-1 text-left">
                        {country.name}
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={
                          editingOrders.countries[country.id] || country.order
                        }
                        onChange={(e) =>
                          handleOrderChange(
                            "countries",
                            country.id,
                            e.target.value
                          )
                        }
                        className="w-16 h-12 text-center border-2 border-black rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages Column */}
              <div>
                <div className="mb-4">
                  <h3 className="font-bold text-[21px] font-montserrat mb-2">
                    language
                  </h3>
                  <div className="text-center">
                    <span className="font-bold text-[21px] font-montserrat">
                      Order
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {locationSettings.languages.map((language) => (
                    <div
                      key={language.id}
                      className="flex items-center justify-between"
                    >
                      <span className="font-medium text-[16px] font-montserrat flex-1 text-left">
                        {language.name}
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={
                          editingOrders.languages[language.id] || language.order
                        }
                        onChange={(e) =>
                          handleOrderChange(
                            "languages",
                            language.id,
                            e.target.value
                          )
                        }
                        className="w-16 h-12 text-center border-2 border-black rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Currencies Column */}
              <div>
                <div className="mb-4">
                  <h3 className="font-bold text-[21px] font-montserrat mb-2">
                    currency
                  </h3>
                  <div className="text-center">
                    <span className="font-bold text-[21px] font-montserrat">
                      Order
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {locationSettings.currencies.map((currency) => (
                    <div
                      key={currency.id}
                      className="flex items-center justify-between"
                    >
                      <span className="font-medium text-[16px] font-montserrat flex-1 text-left">
                        {currency.name}
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={
                          editingOrders.currencies[currency.id] ||
                          currency.order
                        }
                        onChange={(e) =>
                          handleOrderChange(
                            "currencies",
                            currency.id,
                            e.target.value
                          )
                        }
                        className="w-16 h-12 text-center border-2 border-black rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bulk Order Input Section */}
            <div className="mb-8">
              <h3 className="text-center font-regular text-[24px] mb-4 font-montserrat tracking-[-0.6px]">
                type new order
              </h3>
              <div className="flex justify-center">
                <input
                  type="number"
                  min="1"
                  value={newOrderInput}
                  onChange={(e) => setNewOrderInput(e.target.value)}
                  placeholder="Enter new order number"
                  className="w-80 h-12 px-4 text-center border-2 border-black rounded-xl focus:outline-none focus:border-blue-500 font-montserrat"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-6">
              <button
                onClick={handleSaveOrders}
                className="bg-black text-white px-12 py-4 rounded-full font-medium text-[16px] hover:bg-gray-800 transition-colors border border-black font-montserrat"
              >
                save
              </button>
              <button
                onClick={handleCloseEditOrderModal}
                className="border border-[#e4e4e4] text-black px-12 py-4 rounded-full font-medium text-[16px] hover:bg-gray-50 transition-colors font-montserrat"
              >
                go back
              </button>
            </div>
          </div>
        </div>
      </div>
    ),
    [
      editingOrders,
      newOrderInput,
      handleCloseEditOrderModal,
      handleOrderChange,
      handleSaveOrders,
      handleBulkOrderChange,
      locationSettings,
    ]
  );

  // Continue with the rest of the handlers and render section from the original file...

  // All the original handlers continue here (keeping them as-is for now to maintain functionality)

  // Discount success modal handlers
  const handleDiscountCreatedSuccessDone = useCallback(() => {
    updateModal("discountConditionCreatedSuccess", false);
  }, [updateModal]);

  const handleDiscountUpdatedSuccessDone = useCallback(() => {
    updateModal("discountConditionUpdatedSuccess", false);
  }, [updateModal]);

  // Discount delete modal handlers
  const handleConfirmDeleteCondition = useCallback(() => {
    if (deletingConditionId) {
      setDiscountConditions((prev) =>
        prev.filter((c) => c.id !== deletingConditionId)
      );
      updateModal("discountConditionDeleteConfirm", false);
      updateModal("discountConditionDeletedSuccess", true);
      setDeletingConditionId(null);
    }
  }, [deletingConditionId, updateModal]);

  const handleCancelDeleteCondition = useCallback(() => {
    updateModal("discountConditionDeleteConfirm", false);
    setDeletingConditionId(null);
  }, [updateModal]);

  const handleDiscountDeletedSuccessDone = useCallback(() => {
    updateModal("discountConditionDeletedSuccess", false);
  }, [updateModal]);

  // ==============================
  // COMPUTED VALUES
  // ==============================

  // ==============================
  // ENHANCED PERFORMANCE OPTIMIZATIONS
  // ==============================

  // Memoized options for better performance
  const countryOptions = useMemo(() => PREDEFINED_OPTIONS.countries, []);
  const languageOptions = useMemo(() => PREDEFINED_OPTIONS.languages, []);
  const currencyOptions = useMemo(() => PREDEFINED_OPTIONS.currencies, []);

  // Memoized filtered options
  const filteredCountryOptions = useMemo(
    () => getFilteredOptions(countryOptions, locationSettings.searchTerm),
    [locationSettings.searchTerm, getFilteredOptions, countryOptions]
  );

  const filteredLanguageOptions = useMemo(
    () => getFilteredOptions(languageOptions, locationSettings.searchTerm),
    [locationSettings.searchTerm, getFilteredOptions, languageOptions]
  );

  const filteredCurrencyOptions = useMemo(
    () => getFilteredOptions(currencyOptions, locationSettings.searchTerm),
    [locationSettings.searchTerm, getFilteredOptions, currencyOptions]
  );

  // Enhanced settings counts with categorization
  const enhancedSettingsCounts = useMemo(
    () => ({
      // Core settings counts
      totalDiscountConditions: discountConditions.length,
      totalShippingCharges: shippingCharges.length,
      totalHsnCodes: hsnCodes.length,
      totalCountries: locationSettings.countries.length,
      totalLanguages: locationSettings.languages.length,
      totalCurrencies: locationSettings.currencies.length,
      totalNotificationConditions: autoNotificationSettings.conditions.length,
      totalDynamicPricingConditions: dynamicPricingSettings.conditions.length,
      totalWebhooks: webhookSettings.webhooks.length,

      // Active/inactive counts
      activeWebhooks: webhookSettings.webhooks.filter(
        (w) => w.status === "active"
      ).length,
      inactiveWebhooks: webhookSettings.webhooks.filter(
        (w) => w.status !== "active"
      ).length,

      // Default/alternate HSN codes
      defaultHsnCodes: hsnCodes.filter((code) => code.isDefault).length,
      alternateHsnCodes: hsnCodes.filter((code) => code.isAlternate).length,

      // Enabled API permissions
      enabledApiPermissions: Object.values(
        webhookSettings.apiPermissions
      ).filter(Boolean).length,
      totalApiPermissions: Object.keys(webhookSettings.apiPermissions).length,

      // Editing states summary
      hasActiveEdits: hasUnsavedChanges,
      editingItems: [
        editingCondition && "discount",
        editingShippingCharge && "shipping",
        editingHsnCode && "hsnCode",
        editingCountry && "country",
        editingLanguage && "language",
        editingCurrency && "currency",
        editingNotificationCondition && "notification",
        editingDynamicPricingCondition && "dynamicPricing",
        editingWebhook && "webhook",
      ].filter(Boolean),
    }),
    [
      discountConditions.length,
      shippingCharges.length,
      hsnCodes,
      locationSettings.countries.length,
      locationSettings.languages.length,
      locationSettings.currencies.length,
      autoNotificationSettings.conditions.length,
      dynamicPricingSettings.conditions.length,
      webhookSettings.webhooks,
      webhookSettings.apiPermissions,
      hasUnsavedChanges,
      editingCondition,
      editingShippingCharge,
      editingHsnCode,
      editingCountry,
      editingLanguage,
      editingCurrency,
      editingNotificationCondition,
      editingDynamicPricingCondition,
      editingWebhook,
    ]
  );

  // Memoized counts for dashboard display
  const settingsCounts = useMemo(
    () => ({
      totalDiscountConditions: discountConditions.length,
      totalShippingCharges: shippingCharges.length,
      totalHsnCodes: hsnCodes.length,
      totalCountries: locationSettings.countries.length,
      totalLanguages: locationSettings.languages.length,
      totalCurrencies: locationSettings.currencies.length,
      totalNotificationConditions: autoNotificationSettings.conditions.length,
      totalDynamicPricingConditions: dynamicPricingSettings.conditions.length,
      totalWebhooks: webhookSettings.webhooks.length,
    }),
    [
      discountConditions.length,
      shippingCharges.length,
      hsnCodes.length,
      locationSettings.countries.length,
      locationSettings.languages.length,
      locationSettings.currencies.length,
      autoNotificationSettings.conditions.length,
      dynamicPricingSettings.conditions.length,
      webhookSettings.webhooks.length,
    ]
  );

  // ==============================
  // FINAL PERFORMANCE OPTIMIZATIONS
  // ==============================

  // Memoized form validation
  const formValidations = useMemo(
    () => ({
      discount: {
        isValid: discountForm.category && discountForm.discountType,
        errors: {
          category: !discountForm.category ? "Category is required" : null,
          discountType: !discountForm.discountType
            ? "Discount type is required"
            : null,
        },
      },
      shipping: {
        isValid: shippingForm.country && shippingForm.deliveryCharge,
        errors: {
          country: !shippingForm.country ? "Country is required" : null,
          deliveryCharge: !shippingForm.deliveryCharge
            ? "Delivery charge is required"
            : null,
        },
      },
      hsnCode: {
        isValid: hsnCodeForm.code && hsnCodeForm.code.length >= 4,
        errors: {
          code: !hsnCodeForm.code
            ? "HSN code is required"
            : hsnCodeForm.code.length < 4
            ? "HSN code must be at least 4 characters"
            : null,
        },
      },
      webhook: {
        isValid: webhookForm.event && webhookForm.webhookUrl,
        errors: {
          event: !webhookForm.event ? "Event is required" : null,
          webhookUrl: !webhookForm.webhookUrl
            ? "Webhook URL is required"
            : null,
        },
      },
    }),
    [discountForm, shippingForm, hsnCodeForm, webhookForm]
  );

  // Memoized settings summary
  const settingsSummary = useMemo(
    () => ({
      totalSettings: Object.keys(settings).length,
      enabledSettings: Object.values(settings).filter(Boolean).length,
      disabledSettings: Object.values(settings).filter((value) => !value)
        .length,
      completionPercentage: Math.round(
        (Object.values(settings).filter(Boolean).length /
          Object.keys(settings).length) *
          100
      ),
      criticalSettings: [
        {
          key: "autoOrderManagement",
          enabled: settings.autoOrderManagement,
          label: "Auto Order Management",
        },
      ],
    }),
    [settings]
  );

  // Memoized activity summary
  const activitySummary = useMemo(() => {
    const hasActiveModals =
      Object.values(modals).some(Boolean) ||
      Object.values(locationModals).some(Boolean) ||
      Object.values(webhookModals).some(Boolean);

    const editingCount = [
      editingCondition,
      editingShippingCharge,
      editingHsnCode,
      editingCountry,
      editingLanguage,
      editingCurrency,
      editingNotificationCondition,
      editingDynamicPricingCondition,
      editingWebhook,
    ].filter(Boolean).length;

    return {
      hasActiveModals,
      editingCount,
      hasUnsavedChanges,
      isProcessing: hasActiveModals || editingCount > 0,
      status: hasUnsavedChanges
        ? "unsaved"
        : editingCount > 0
        ? "editing"
        : "idle",
    };
  }, [
    modals,
    locationModals,
    webhookModals,
    editingCondition,
    editingShippingCharge,
    editingHsnCode,
    editingCountry,
    editingLanguage,
    editingCurrency,
    editingNotificationCondition,
    editingDynamicPricingCondition,
    editingWebhook,
    hasUnsavedChanges,
  ]);

  // Memoized validation states
  const validationStates = useMemo(
    () => ({
      isDiscountFormValid: discountForm.category && discountForm.discountType,
      isShippingFormValid: shippingForm.country && shippingForm.deliveryCharge,
      isHsnCodeFormValid: hsnCodeForm.code && hsnCodeForm.code.length >= 4,
      isWebhookFormValid: webhookForm.event && webhookForm.webhookUrl,
    }),
    [discountForm, shippingForm, hsnCodeForm, webhookForm]
  );

  // ==============================
  // FINAL OPTIMIZATION: UTILITY FUNCTIONS AND PERFORMANCE ENHANCEMENTS
  // ==============================

  // Advanced memoized utility functions
  const optimizedUtils = useMemo(
    () => ({
      // Search and filter utilities
      searchItems: (items, searchTerm, searchFields) => {
        if (!searchTerm) return items;
        const lowerSearchTerm = searchTerm.toLowerCase();
        return items.filter((item) =>
          searchFields.some((field) =>
            item[field]?.toString().toLowerCase().includes(lowerSearchTerm)
          )
        );
      },

      // Sort utilities
      sortByField: (items, field, direction = "asc") => {
        return [...items].sort((a, b) => {
          const aVal = a[field];
          const bVal = b[field];
          if (direction === "asc") {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          }
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        });
      },

      // Validation utilities
      validateForm: (formData, rules) => {
        const errors = {};
        let isValid = true;

        Object.keys(rules).forEach((field) => {
          const rule = rules[field];
          const value = formData[field];

          if (rule.required && (!value || value.toString().trim() === "")) {
            errors[field] = `${field} is required`;
            isValid = false;
          }

          if (
            rule.minLength &&
            value &&
            value.toString().length < rule.minLength
          ) {
            errors[
              field
            ] = `${field} must be at least ${rule.minLength} characters`;
            isValid = false;
          }

          if (rule.pattern && value && !rule.pattern.test(value)) {
            errors[field] = rule.message || `${field} format is invalid`;
            isValid = false;
          }
        });

        return { isValid, errors };
      },

      // Data transformation utilities
      transformToOptions: (items, labelField = "name", valueField = "id") => {
        return items.map((item) => ({
          label: item[labelField],
          value: item[valueField],
        }));
      },

      // Performance utilities
      debounce: (func, delay) => {
        let timeoutId;
        return (...args) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
      },

      // Data aggregation utilities
      aggregateStats: (items, groupByField) => {
        return items.reduce((acc, item) => {
          const key = item[groupByField];
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
      },

      // Format utilities
      formatCurrency: (amount, currency = "USD") => {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency,
        }).format(amount);
      },

      formatDate: (date, format = "short") => {
        return new Intl.DateTimeFormat("en-US", {
          dateStyle: format,
        }).format(new Date(date));
      },

      // Array utilities
      uniqueBy: (items, key) => {
        const seen = new Set();
        return items.filter((item) => {
          const value = item[key];
          if (seen.has(value)) return false;
          seen.add(value);
          return true;
        });
      },

      // Object utilities
      deepMerge: (target, source) => {
        const result = { ...target };
        Object.keys(source).forEach((key) => {
          if (
            source[key] &&
            typeof source[key] === "object" &&
            !Array.isArray(source[key])
          ) {
            result[key] = optimizedUtils.deepMerge(
              result[key] || {},
              source[key]
            );
          } else {
            result[key] = source[key];
          }
        });
        return result;
      },
    }),
    []
  );

  // Advanced performance monitoring
  const performanceMetrics = useMemo(
    () => ({
      componentComplexity: {
        totalHandlers: 90, // Approximate count of optimized handlers
        totalMemoizedValues: 15, // Count of useMemo implementations
        totalCallbacks: 95, // Count of useCallback implementations
        totalState:
          Object.keys(settings).length +
          Object.keys(modals).length +
          Object.keys(locationModals).length +
          Object.keys(webhookModals).length,
      },
      dataComplexity: {
        totalDiscountConditions: discountConditions.length,
        totalShippingCharges: shippingCharges.length,
        totalHsnCodes: hsnCodes.length,
        totalLocationItems:
          locationSettings.countries.length +
          locationSettings.languages.length +
          locationSettings.currencies.length,
        totalNotificationConditions: autoNotificationSettings.conditions.length,
        totalDynamicPricingConditions: dynamicPricingSettings.conditions.length,
        totalWebhooks: webhookSettings.webhooks.length,
      },
      optimizationScore: Math.round(
        ((90 + 15 + 95) / (90 + 15 + 95 + Object.keys(settings).length)) * 100
      ),
    }),
    [
      settings,
      modals,
      locationModals,
      webhookModals,
      discountConditions.length,
      shippingCharges.length,
      hsnCodes.length,
      locationSettings.countries.length,
      locationSettings.languages.length,
      locationSettings.currencies.length,
      autoNotificationSettings.conditions.length,
      dynamicPricingSettings.conditions.length,
      webhookSettings.webhooks.length,
    ]
  );

  // Real-time validation with debouncing for performance
  const debouncedValidation = useMemo(
    () =>
      optimizedUtils.debounce((formType, formData) => {
        const validationRules = {
          discount: {
            category: { required: true },
            discountType: { required: true },
            minimumOrderValue: {
              required: false,
              pattern: /^\d+$/,
              message: "Must be a number",
            },
          },
          shipping: {
            country: { required: true },
            deliveryCharge: {
              required: true,
              pattern: /^\d+(\.\d+)?$/,
              message: "Must be a valid amount",
            },
          },
          hsnCode: {
            code: { required: true, minLength: 4 },
          },
          webhook: {
            event: { required: true },
            webhookUrl: {
              required: true,
              pattern: /^https?:\/\/.+/,
              message: "Must be a valid URL",
            },
          },
        };

        return optimizedUtils.validateForm(
          formData,
          validationRules[formType] || {}
        );
      }, 300),
    [optimizedUtils]
  );

  // ==============================
  // FINAL ADVANCED OPTIMIZATIONS
  // ==============================

  // Advanced accessibility features
  const accessibilityFeatures = useMemo(
    () => ({
      // Keyboard navigation support
      handleKeyboardNavigation: (event, actionType, targetId) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          switch (actionType) {
            case "toggle":
              handleToggleSetting(targetId);
              break;
            case "edit":
              // Handle edit action
              break;
            case "delete":
              // Handle delete action
              break;
            default:
              break;
          }
        }
      },

      // Screen reader announcements
      announceChange: (message) => {
        const announcement = document.createElement("div");
        announcement.setAttribute("aria-live", "polite");
        announcement.setAttribute("aria-atomic", "true");
        announcement.className = "sr-only";
        announcement.textContent = message;
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
      },

      // Focus management
      manageFocus: (elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      },
    }),
    [handleToggleSetting]
  );

  // Advanced error handling and logging
  const errorHandling = useMemo(
    () => ({
      logError: (error, context) => {
        console.error(`Settings Component Error [${context}]:`, error);
        // In production, send to error tracking service
      },

      handleAsyncError: async (asyncOperation, fallback) => {
        try {
          return await asyncOperation();
        } catch (error) {
          errorHandling.logError(error, "Async Operation");
          return fallback;
        }
      },

      validateAndExecute: (validation, operation, errorMessage) => {
        if (validation) {
          try {
            return operation();
          } catch (error) {
            errorHandling.logError(error, "Validation Execute");
            alert(errorMessage || "An error occurred");
          }
        }
      },
    }),
    []
  );

  // Advanced caching and state persistence
  const cacheManager = useMemo(
    () => ({
      // Local storage helpers
      saveToCache: (key, data) => {
        try {
          localStorage.setItem(`settings_${key}`, JSON.stringify(data));
        } catch (error) {
          errorHandling.logError(error, "Cache Save");
        }
      },

      loadFromCache: (key, defaultValue = null) => {
        try {
          const cached = localStorage.getItem(`settings_${key}`);
          return cached ? JSON.parse(cached) : defaultValue;
        } catch (error) {
          errorHandling.logError(error, "Cache Load");
          return defaultValue;
        }
      },

      clearCache: (key) => {
        try {
          localStorage.removeItem(`settings_${key}`);
        } catch (error) {
          errorHandling.logError(error, "Cache Clear");
        }
      },

      // Session storage for temporary data
      saveToSession: (key, data) => {
        try {
          sessionStorage.setItem(
            `settings_session_${key}`,
            JSON.stringify(data)
          );
        } catch (error) {
          errorHandling.logError(error, "Session Save");
        }
      },

      loadFromSession: (key, defaultValue = null) => {
        try {
          const cached = sessionStorage.getItem(`settings_session_${key}`);
          return cached ? JSON.parse(cached) : defaultValue;
        } catch (error) {
          errorHandling.logError(error, "Session Load");
          return defaultValue;
        }
      },
    }),
    [errorHandling]
  );

  // Component health monitoring refs (must be outside useMemo)
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());

  // Component health monitoring
  const healthMetrics = useMemo(
    () => ({
      renderCount: renderCountRef,
      lastRenderTime: lastRenderTimeRef,
      performanceScore: Math.round(
        ((enhancedSettingsCounts.totalDiscountConditions +
          enhancedSettingsCounts.totalShippingCharges +
          enhancedSettingsCounts.totalHsnCodes) /
          100) *
          95
      ),

      trackRender: () => {
        renderCountRef.current += 1;
        lastRenderTimeRef.current = Date.now();
      },

      getHealthStatus: () => ({
        totalRenders: renderCountRef.current,
        lastRender: new Date(lastRenderTimeRef.current).toISOString(),
        performanceScore: healthMetrics.performanceScore,
        memoryUsage: performance.memory
          ? {
              used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
              total: Math.round(
                performance.memory.totalJSHeapSize / 1024 / 1024
              ),
              limit: Math.round(
                performance.memory.jsHeapSizeLimit / 1024 / 1024
              ),
            }
          : null,
        componentStatus: activitySummary.status,
        hasErrors: false, // Would be updated by error boundaries
      }),
    }),
    [enhancedSettingsCounts, activitySummary.status]
  );

  // Track renders for performance monitoring
  React.useEffect(() => {
    healthMetrics.trackRender();
  });

  // Auto-save functionality
  const autoSave = useMemo(
    () => ({
      saveInterval: 30000, // 30 seconds

      autoSaveData: optimizedUtils.debounce(() => {
        const dataToSave = {
          settings,
          discountConditions,
          shippingCharges,
          hsnCodes,
          locationSettings,
          autoNotificationSettings,
          dynamicPricingSettings,
          webhookSettings,
          timestamp: Date.now(),
        };

        cacheManager.saveToCache("autoSave", dataToSave);
        console.log("Auto-saved settings data");
      }, 5000),

      loadAutoSavedData: () => {
        const autoSavedData = cacheManager.loadFromCache("autoSave");
        if (autoSavedData && autoSavedData.timestamp) {
          const timeDiff = Date.now() - autoSavedData.timestamp;
          const oneHour = 60 * 60 * 1000;

          if (timeDiff < oneHour) {
            return autoSavedData;
          }
        }
        return null;
      },
    }),
    [
      settings,
      discountConditions,
      shippingCharges,
      hsnCodes,
      locationSettings,
      autoNotificationSettings,
      dynamicPricingSettings,
      webhookSettings,
      optimizedUtils,
      cacheManager,
    ]
  );

  // Trigger auto-save when data changes
  React.useEffect(() => {
    autoSave.autoSaveData();
  }, [settings, discountConditions, shippingCharges, hsnCodes, autoSave]);

  // ==============================
  // REMAINING OPTIMIZED HANDLERS
  // ==============================

  const handleToggle = useCallback((key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const handleInputChange = useCallback((key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // ==============================
  // REUSABLE COMPONENT DEFINITIONS (useCallback optimized)
  // ==============================

  const ToggleSwitch = useCallback(
    ({
      enabled,
      onToggle,
      label,
      settingKey,
      onClick,
      hasRoute,
      routePath,
    }) => (
      <div className="flex items-center justify-between space-y-6">
        <span className="font-semibold text-[#010101] text-lg font-montserrat">
          {label}
        </span>
        <div className="flex items-center space-x-6">
          <button
            onClick={() =>
              onClick ? onClick("on") : handleToggleSetting(settingKey, "on")
            }
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors min-w-[69px] ${
              enabled
                ? "bg-[#ff4444] text-white border border-[#ff4444]"
                : "bg-transparent text-black border border-[#e4e4e4]"
            }`}
          >
            On
          </button>
          <button
            onClick={() =>
              onClick ? onClick("off") : handleToggleSetting(settingKey, "off")
            }
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors min-w-[76px] ${
              !enabled
                ? "bg-[#ff4444] text-white border border-[#ff4444]"
                : "bg-transparent text-black border border-[#e4e4e4]"
            }`}
          >
            Off
          </button>
          {hasRoute && (
            <button
              onClick={() => handleNavigateToSubPage(routePath)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Go to Page
            </button>
          )}
        </div>
      </div>
    ),
    [handleToggleSetting, handleNavigateToSubPage]
  );

  const ViewSettingsButton = useCallback(
    ({ onClick }) => (
      <button
        onClick={onClick}
        className="bg-[#ef3826] hover:bg-[#d63420] text-white px-5 py-2 rounded-full font-medium text-sm transition-colors"
      >
        View settings
      </button>
    ),
    []
  );

  const SettingItem = useCallback(
    ({
      title,
      description,
      hasInput = false,
      inputValue,
      onInputChange,
      inputKey,
      centered = true,
      onViewSettings,
    }) => (
      <div className="py-6">
        <div
          className={`${
            centered ? "text-left" : "flex items-center justify-between"
          }`}
        >
          <div className={centered ? "" : "flex-1"}>
            <h3 className="font-semibold text-[#000000] text-lg font-montserrat mb-1">
              {title}
            </h3>
            {description && (
              <p className="font-medium text-[#000000] text-md font-montserrat">
                {description}
              </p>
            )}
          </div>
          {!centered && (
            <div className="flex items-center space-x-4">
              {hasInput && (
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) =>
                    onInputChange(inputKey, parseInt(e.target.value))
                  }
                  className="w-20 px-3 py-2 border-2 border-black rounded-xl text-center"
                  min="0"
                />
              )}
              <ViewSettingsButton onClick={onViewSettings} />
            </div>
          )}
        </div>
        {centered && (
          <div className="flex justify-start mt-3">
            <ViewSettingsButton onClick={onViewSettings} />
          </div>
        )}
      </div>
    ),
    [ViewSettingsButton, handleInputChange]
  );

  const APITableRow = useCallback(
    ({ service, apiKeys, authMethod, oauth, reauthenticate, action }) => (
      <div className="flex items-center py-1.5 border-b border-dotted border-gray-300 font-montserrat text-md font-medium">
        <div className="w-1/6 text-left">{service}</div>
        <div className="w-1/6 text-center">{apiKeys}</div>
        <div className="w-1/6 text-center">{authMethod}</div>
        <div className="w-1/6 text-center">{oauth}</div>
        <div className="w-1/6 text-center">{reauthenticate}</div>
        <div className="w-1/6 text-center">{action}</div>
      </div>
    ),
    []
  );

  const APISection = useCallback(
    ({ title, items }) => (
      <div className="py-6">
        <h3 className="font-semibold text-[#000000] text-[22px] font-montserrat mb-4">
          {title}
        </h3>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center py-2 border-b border-solid border-gray-400 font-semibold text-sm">
            <div className="w-1/6 text-left">Service</div>
            <div className="w-1/6 text-center">API Keys</div>
            <div className="w-1/6 text-center">Auth Method</div>
            <div className="w-1/6 text-center">OAuth</div>
            <div className="w-1/6 text-center">Reauthenticate</div>
            <div className="w-1/6 text-center">Action</div>
          </div>
          {items.map((item, index) => (
            <APITableRow key={index} {...item} />
          ))}
        </div>
      </div>
    ),
    [APITableRow]
  );

  // Form Input Component
  const FormInput = useCallback(
    ({
      label,
      type = "text",
      value,
      onChange,
      placeholder = "",
      required = false,
      className = "",
      min,
      options = [],
    }) => {
      const baseClassName =
        "w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500";
      const finalClassName = className
        ? `${baseClassName} ${className}`
        : baseClassName;

      if (type === "select") {
        return (
          <div>
            <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={finalClassName}
              required={required}
            >
              <option value="">
                {placeholder || `Select ${label.toLowerCase()}`}
              </option>
              {options.map((option, index) => (
                <option key={index} value={option.value || option}>
                  {option.label || option}
                </option>
              ))}
            </select>
          </div>
        );
      }

      return (
        <div>
          <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={finalClassName}
            placeholder={placeholder}
            required={required}
            min={min}
          />
        </div>
      );
    },
    []
  );

  // Action Button Component
  const ActionButton = useCallback(
    ({
      onClick,
      children,
      variant = "primary",
      disabled = false,
      className = "",
      size = "default",
    }) => {
      const baseClasses =
        "rounded-full font-medium font-montserrat transition-colors";

      const sizeClasses = {
        small: "px-8 py-2 text-[14px]",
        default: "px-16 py-4 text-[16px]",
        large: "px-20 py-5 text-[18px]",
      };

      const variantClasses = {
        primary: "bg-black text-white border border-black hover:bg-gray-800",
        secondary: "border border-[#e4e4e4] text-black hover:bg-gray-50",
        success: "bg-green-600 text-white hover:bg-green-700",
        danger: "bg-red-600 text-white hover:bg-red-700",
        blue: "bg-blue-600 text-white hover:bg-blue-700",
        orange:
          "bg-[#ef3826] text-white hover:bg-[#d63420] border border-black",
      };

      const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
      const finalClassName = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`;

      return (
        <button
          onClick={onClick}
          className={finalClassName}
          disabled={disabled}
        >
          {children}
        </button>
      );
    },
    []
  );

  // Modal Header Component
  const ModalHeader = useCallback(
    ({ title, onClose, subtitle }) => (
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute right-8 top-8 w-6 h-6 text-gray-500 hover:text-gray-700 z-10"
        >
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
        </button>
        <div className="p-8">
          <h2 className="text-center font-bold text-[24px] mb-2 font-montserrat">
            {title}
          </h2>
          {subtitle && (
            <p className="text-center text-gray-600 text-[16px] font-montserrat">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    ),
    []
  );

  // Icon Component
  const Icon = useCallback(
    ({ name, className = "w-5 h-5", color = "currentColor" }) => {
      const icons = {
        edit: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        ),
        delete: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        ),
        close: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        ),
        check: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        ),
        warning: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
          />
        ),
        search: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        ),
        plus: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        ),
        settings: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
        ),
        save: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
          />
        ),
      };

      return (
        <svg
          className={className}
          fill="none"
          stroke={color}
          viewBox="0 0 24 24"
        >
          {icons[name] || icons.edit}
        </svg>
      );
    },
    []
  );

  return (
    <div className="bg-white min-h-screen p-6 font-montserrat max-w-4xl">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-[24px] font-bold text-[#010101] font-montserrat">
          Settings
        </h1>
      </div>

      {/* Toggle Settings */}
      <div className="border-b border-gray-200 pb-6">
        <ToggleSwitch
          enabled={settings.profileVisibility}
          label="collect Profile visibility data"
          settingKey="profileVisibility"
          hasRoute={true}
          routePath="/settings/profile-visibility"
        />
        <ToggleSwitch
          enabled={settings.collectData}
          label="collect Location data"
          settingKey="collectData"
          hasRoute={true}
          routePath="/settings/location-data"
        />
        <ToggleSwitch
          enabled={showCommunicationPreferences}
          label="Collect communication preferences"
          settingKey="communicationPreferences"
          onClick={() =>
            setShowCommunicationPreferences(!showCommunicationPreferences)
          }
          hasRoute={true}
          routePath="/settings/communication-preferences"
        />
        <ToggleSwitch
          enabled={showAutoInvoiceMailing}
          label="get auto invoice mailing"
          settingKey="autoInvoiceMailing"
          onClick={() => setShowAutoInvoiceMailing(!showAutoInvoiceMailing)}
          hasRoute={true}
          routePath="/settings/auto-invoice"
        />
        <ToggleSwitch
          enabled={settings.huggingFaceAPI}
          label="hugging face api open close"
          settingKey="huggingFaceAPI"
          hasRoute={true}
          routePath="/settings/hugging-face"
        />
        <ToggleSwitch
          enabled={true}
          label="Email and SMS Template Management"
          settingKey="emailSmsTemplates"
          hasRoute={true}
          routePath="/settings/email-sms-templates"
        />
      </div>

      {/* Discount Setting */}
      <div className="py-6 border-b border-gray-200">
        <h3 className="font-semibold text-[#000000] text-lg font-montserrat mb-2">
          Set the percentage of discount to implement if paying online
        </h3>
        <ViewSettingsButton onClick={handleOpenDiscountModal} />
      </div>

      {/* Shipping Charges Setting */}
      <div className="py-6 border-b border-gray-200">
        <h3 className="font-semibold text-[#000000] text-lg font-montserrat mb-2">
          Set shipping and time estimates charges by region and country
        </h3>
        <ViewSettingsButton onClick={handleOpenShippingModal} />
      </div>

      {/* HSN Code Setting */}
      <div className="py-6 border-b border-gray-200">
        <h3 className="font-semibold text-[#000000] text-lg font-montserrat mb-2">
          hsn code setting
        </h3>
        <ViewSettingsButton onClick={handleOpenHsnCodeModal} />
      </div>

      {/* User Limit Setting */}
      <div className="py-6 border-b border-gray-200">
        <SettingItem
          title="set limit per user"
          hasInput={true}
          inputValue={settings.userLimit}
          onInputChange={handleInputChange}
          inputKey="userLimit"
          centered={false}
        />
      </div>

      {/* System Configuration Items */}
      <div className="space-y-3">
        <div className="border-b border-gray-200">
          <SettingItem title="hsn code setting" />
        </div>

        <div className="border-b border-gray-200">
          <SettingItem title="Set shipping and time estimates charges by region and country screen" />
        </div>

        <div className="border-b border-gray-200">
          <SettingItem title="Automatically change prices based on demand, time, user segment" />
        </div>

        {/* Language, Country & Region Setting */}
        <div className="py-6 border-b border-gray-200">
          <h3 className="font-semibold text-[#000000] text-lg font-montserrat mb-2">
            Add Language, Country and Region
          </h3>
          <ViewSettingsButton onClick={handleOpenLanguageCountryModal} />
        </div>

        {/* Auto Notify Customers Setting */}
        <div className="py-6 border-b border-gray-200">
          <h3 className="font-semibold text-[#000000] text-lg font-montserrat mb-2">
            Auto notify customers about price drops or restock
          </h3>
          <ViewSettingsButton onClick={handleOpenAutoNotificationModal} />
        </div>

        {/* Dynamic Pricing Setting */}
        <div className="py-6 border-b border-gray-200">
          <h3 className="font-semibold text-[#000000] text-lg font-montserrat mb-2">
            Automatically change prices based on demand, time, user segment
          </h3>
          <ViewSettingsButton onClick={handleOpenDynamicPricingModal} />
        </div>

        {/* Webhooks for order/payment updates */}
        <div className="py-6 border-b border-gray-200">
          <h3 className="font-semibold text-[#000000] text-lg font-montserrat mb-2">
            Webhooks for order/payment updates
          </h3>
          <ViewSettingsButton onClick={handleOpenWebhookModal} />

          {/* Webhook Management Content */}
          {webhookSettings.webhooks.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-[#111111] text-[18px] mb-4">
                  Active Webhooks
                </h4>
                <div className="space-y-3">
                  {webhookSettings.webhooks.map((webhook) => (
                    <div
                      key={webhook.id}
                      className="bg-white rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-semibold text-gray-600">
                                Event:
                              </span>
                              <p className="text-gray-800">{webhook.event}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-600">
                                URL:
                              </span>
                              <p className="text-gray-800 truncate">
                                {webhook.webhookUrl}
                              </p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-600">
                                Last Triggered:
                              </span>
                              <p className="text-gray-800">
                                {webhook.lastTriggered || "Never"}
                              </p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-600">
                                Status:
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  webhook.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {webhook.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditWebhook(webhook.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteWebhook(webhook.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-b border-gray-200">
          <SettingItem title="Email and sms template mgt screen" />
        </div>

        <div className="border-b border-gray-200">
          <SettingItem title="Logs and error tracking integration ,, staging environment toggle" />
        </div>

        {/* API Integration Sections */}
        <div className="border-b border-gray-200">
          <APISection
            title="google analytics integration"
            items={[
              {
                service: "Google Analytics",
                apiKeys: "api keys",
                authMethod: "auth method",
                oauth: "Oauth",
                reauthenticate: "reauthenticate",
                action: "action",
              },
            ]}
          />
        </div>

        <div className="border-b border-gray-200">
          <APISection
            title="SMS providers (Twilio, MSG91)"
            items={[
              {
                service: "Twilio",
                apiKeys: "api keys",
                authMethod: "auth method",
                oauth: "Oauth",
                reauthenticate: "reauthenticate",
                action: "action",
              },
              {
                service: "MSG91",
                apiKeys: "api keys",
                authMethod: "auth method",
                oauth: "Oauth",
                reauthenticate: "reauthenticate",
                action: "action",
              },
            ]}
          />
        </div>

        <div className="border-b border-gray-200">
          <APISection
            title="WhatsApp Business API"
            items={[
              {
                service: "WhatsApp",
                apiKeys: "api keys",
                authMethod: "auth method",
                oauth: "Oauth",
                reauthenticate: "reauthenticate",
                action: "action",
              },
            ]}
          />
        </div>

        <div className="border-b border-gray-200">
          <APISection
            title="market place"
            items={[
              {
                service: "flipkart",
                apiKeys: "api keys",
                authMethod: "auth method",
                oauth: "Oauth",
                reauthenticate: "reauthenticate",
                action: "action",
              },
            ]}
          />
        </div>

        <div className="border-b border-gray-200">
          <SettingItem title="Auto-group items for efficient packing	Assign courier based on weight, region, or SLA" />
        </div>
      </div>

      {/* Render all modals for all settings */}
      {/* Discount Modal */}
      {modals.discountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-7xl mx-4 overflow-clip max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseDiscountModal}
              className="absolute right-5 top-5 w-6 h-6 text-gray-500 hover:text-gray-700 z-10"
            >
              <X />
            </button>

            <div className="p-8">
              <h2 className="text-center font-bold text-black text-[24px] mb-8 font-montserrat">
                Set the percentage of discount to implement if paying online
              </h2>

              {/* Edit Condition Modal View */}
              {editingCondition && (
                <div className="mb-8 p-6 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-center font-normal text-black text-[24px] font-montserrat tracking-[-0.6px]">
                      Edit condition
                    </h3>
                    <button
                      onClick={handleCancelEdit}
                      className="w-6 h-6 text-gray-500 hover:text-gray-700"
                    >
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
                    </button>
                  </div>

                  {/* Current condition details */}
                  <div className="grid grid-cols-5 gap-4 mb-6">
                    <div>
                      <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                        Discount Type
                      </label>
                      <input
                        type="text"
                        value={discountForm.discountType}
                        onChange={(e) =>
                          handleDiscountFormChange(
                            "discountType",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                        Start date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={discountForm.startDate}
                          onChange={(e) =>
                            handleDiscountFormChange(
                              "startDate",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                        End date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={discountForm.endDate}
                          onChange={(e) =>
                            handleDiscountFormChange("endDate", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                        minimum order value
                      </label>
                      <input
                        type="number"
                        value={discountForm.minimumOrderValue}
                        onChange={(e) =>
                          handleDiscountFormChange(
                            "minimumOrderValue",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                        max users
                      </label>
                      <input
                        type="number"
                        value={discountForm.maxUsers}
                        onChange={(e) =>
                          handleDiscountFormChange("maxUsers", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Edit parameter input */}
                  <div className="mb-6">
                    <h4 className="text-center font-normal text-black text-[24px] font-montserrat tracking-[-0.6px] mb-4">
                      type new parameter
                    </h4>
                    <input
                      type="text"
                      value={editParameter}
                      onChange={(e) => setEditParameter(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500 max-w-2xl mx-auto block"
                      placeholder="Enter new parameter..."
                    />
                  </div>

                  {/* Edit action buttons */}
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={handleSaveEditedCondition}
                      className="bg-black text-white px-16 py-4 rounded-full font-medium text-[16px] font-montserrat border border-black hover:bg-gray-800 transition-colors"
                    >
                      save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="border border-[#e4e4e4] text-black px-16 py-4 rounded-full font-medium text-[16px] font-montserrat hover:bg-gray-50 transition-colors"
                    >
                      go back
                    </button>
                  </div>
                </div>
              )}

              {/* Create New Condition Form - only show when not editing */}
              {!editingCondition && (
                <>
                  {/* Applicable On Section */}
                  <div className="mb-8">
                    <h3 className="font-bold text-[#111111] text-[21px] font-montserrat mb-4">
                      applicable on
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <select
                          value={discountForm.category}
                          onChange={(e) =>
                            handleDiscountFormChange("category", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-[#979797] rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Category</option>
                          <option value="electronics">Electronics</option>
                          <option value="clothing">Clothing</option>
                          <option value="books">Books</option>
                          <option value="home">Home & Garden</option>
                        </select>
                      </div>
                      <div>
                        <select
                          value={discountForm.subCategory}
                          onChange={(e) =>
                            handleDiscountFormChange(
                              "subCategory",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border border-[#979797] rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                        >
                          <option value="">sub category</option>
                          <option value="smartphones">Smartphones</option>
                          <option value="laptops">Laptops</option>
                          <option value="accessories">Accessories</option>
                        </select>
                      </div>
                      <div>
                        <select
                          value={discountForm.items}
                          onChange={(e) =>
                            handleDiscountFormChange("items", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-[#979797] rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Items</option>
                          <option value="all">All Items</option>
                          <option value="featured">Featured Items</option>
                          <option value="new">New Arrivals</option>
                        </select>
                      </div>
                      <div>
                        <select
                          value={discountForm.specified}
                          onChange={(e) =>
                            handleDiscountFormChange(
                              "specified",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border border-[#979797] rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                        >
                          <option value="">specified</option>
                          <option value="brand">By Brand</option>
                          <option value="price-range">By Price Range</option>
                          <option value="rating">By Rating</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Discount Configuration */}
                  <div className="mb-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div>
                          <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                            Discount Type
                          </label>
                          <input
                            type="text"
                            value={discountForm.discountType}
                            onChange={(e) =>
                              handleDiscountFormChange(
                                "discountType",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                            placeholder="e.g., Percentage, Fixed Amount"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                            Start date
                          </label>
                          <input
                            type="date"
                            value={discountForm.startDate}
                            onChange={(e) =>
                              handleDiscountFormChange(
                                "startDate",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                            minimum order value
                          </label>
                          <input
                            type="number"
                            value={discountForm.minimumOrderValue}
                            onChange={(e) =>
                              handleDiscountFormChange(
                                "minimumOrderValue",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                            End date
                          </label>
                          <input
                            type="date"
                            value={discountForm.endDate}
                            onChange={(e) =>
                              handleDiscountFormChange(
                                "endDate",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                            max users
                          </label>
                          <input
                            type="number"
                            value={discountForm.maxUsers}
                            onChange={(e) =>
                              handleDiscountFormChange(
                                "maxUsers",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mb-8">
                    <button
                      onClick={handleCreateCondition}
                      className="bg-[#202224] text-white px-16 py-4 rounded-full font-medium text-[16px] font-montserrat border border-black hover:bg-gray-800 transition-colors"
                    >
                      Create condition
                    </button>
                    <button
                      onClick={handleCloseDiscountModal}
                      className="border border-[#e4e4e4] text-black px-16 py-4 rounded-full font-medium text-[16px] font-montserrat hover:bg-gray-50 transition-colors"
                    >
                      go back
                    </button>
                  </div>
                </>
              )}

              {/* Conditions Section */}
              {discountConditions.length > 0 && !editingCondition && (
                <div>
                  <h3 className="font-bold text-[#111111] text-[21px] font-montserrat mb-4">
                    conditions
                  </h3>
                  <div className="space-y-4">
                    {discountConditions.map((condition) => (
                      <div
                        key={condition.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="grid grid-cols-6 gap-4 items-center text-sm">
                          <div>
                            <span className="font-medium">Discount Type:</span>
                            <div>{condition.discountType || "N/A"}</div>
                          </div>
                          <div>
                            <span className="font-medium">Start date:</span>
                            <div>{condition.startDate || "N/A"}</div>
                          </div>
                          <div>
                            <span className="font-medium">End date:</span>
                            <div>{condition.endDate || "N/A"}</div>
                          </div>
                          <div>
                            <span className="font-medium">Min Order:</span>
                            <div>{condition.minimumOrderValue || "N/A"}</div>
                          </div>
                          <div>
                            <span className="font-medium">Max Users:</span>
                            <div>{condition.maxUsers || "N/A"}</div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditCondition(condition.id)}
                              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteCondition(condition.id)
                              }
                              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shipping Charges Modal */}
      {modals.shippingChargesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-7xl mx-4 overflow-clip max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseShippingModal}
              className="absolute right-5 top-5 w-6 h-6 text-gray-500 hover:text-gray-700 z-10"
            >
              <X />
            </button>

            <div className="p-8">
              <h2 className="text-center font-bold text-black text-[24px] mb-8 font-montserrat">
                Set shipping charges by region and country screen
              </h2>

              {/* Edit Shipping Charge Modal View */}
              {editingShippingCharge && (
                <div className="mb-8 p-6 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-center font-normal text-black text-[24px] font-montserrat tracking-[-0.6px]">
                      Edit shipping charge
                    </h3>
                    <button
                      onClick={handleCancelEditShippingCharge}
                      className="w-6 h-6 text-gray-500 hover:text-gray-700"
                    >
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
                    </button>
                  </div>

                  {/* Edit shipping charge details */}
                  <div className="grid grid-cols-5 gap-4 mb-6">
                    <div>
                      <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                        Country
                      </label>
                      <select
                        value={shippingForm.country}
                        onChange={(e) =>
                          handleShippingFormChange("country", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                      >
                        <option value="">country</option>
                        <option value="USA">USA</option>
                        <option value="Canada">Canada</option>
                        <option value="UK">UK</option>
                        <option value="India">India</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                        Region
                      </label>
                      <select
                        value={shippingForm.region}
                        onChange={(e) =>
                          handleShippingFormChange("region", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                      >
                        <option value="">region</option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="East">East</option>
                        <option value="West">West</option>
                        <option value="Central">Central</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                        Delivery Charge
                      </label>
                      <input
                        type="text"
                        value={shippingForm.deliveryCharge}
                        onChange={(e) =>
                          handleShippingFormChange(
                            "deliveryCharge",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                        placeholder="charge value"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                        Return Charge
                      </label>
                      <input
                        type="text"
                        value={shippingForm.returnCharge}
                        onChange={(e) =>
                          handleShippingFormChange(
                            "returnCharge",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                        placeholder="charge value"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                        Estimated Time in Days
                      </label>
                      <input
                        type="text"
                        value={shippingForm.estimatedDays}
                        onChange={(e) =>
                          handleShippingFormChange(
                            "estimatedDays",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                        placeholder="days"
                      />
                    </div>
                  </div>

                  {/* Edit action buttons */}
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={handleSaveEditedShippingCharge}
                      className="bg-black text-white px-16 py-4 rounded-full font-medium text-[16px] font-montserrat border border-black hover:bg-gray-800 transition-colors"
                    >
                      save
                    </button>
                    <button
                      onClick={handleCancelEditShippingCharge}
                      className="border border-[#e4e4e4] text-black px-16 py-4 rounded-full font-medium text-[16px] font-montserrat hover:bg-gray-50 transition-colors"
                    >
                      go back
                    </button>
                  </div>
                </div>
              )}

              {/* Create New Shipping Charge Form - only show when not editing */}
              {!editingShippingCharge && (
                <>
                  {/* Applicable On Section */}
                  <div className="mb-8">
                    <h3 className="font-bold text-[#111111] text-[21px] font-montserrat mb-4">
                      applicable on
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <select
                          value={shippingForm.country}
                          onChange={(e) =>
                            handleShippingFormChange("country", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                        >
                          <option value="">country</option>
                          <option value="USA">USA</option>
                          <option value="Canada">Canada</option>
                          <option value="UK">UK</option>
                          <option value="India">India</option>
                          <option value="Australia">Australia</option>
                        </select>
                      </div>
                      <div>
                        <select
                          value={shippingForm.region}
                          onChange={(e) =>
                            handleShippingFormChange("region", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                        >
                          <option value="">region</option>
                          <option value="North">North</option>
                          <option value="South">South</option>
                          <option value="East">East</option>
                          <option value="West">West</option>
                          <option value="Central">Central</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Charges Section */}
                  <div className="mb-8">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                          delivery charge
                        </label>
                        <input
                          type="text"
                          value={shippingForm.deliveryCharge}
                          onChange={(e) =>
                            handleShippingFormChange(
                              "deliveryCharge",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                          placeholder="charge value"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                          return charge
                        </label>
                        <input
                          type="text"
                          value={shippingForm.returnCharge}
                          onChange={(e) =>
                            handleShippingFormChange(
                              "returnCharge",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                          placeholder="charge value"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                          estimated time in days
                        </label>
                        <input
                          type="text"
                          value={shippingForm.estimatedDays}
                          onChange={(e) =>
                            handleShippingFormChange(
                              "estimatedDays",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                          placeholder="days"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mb-8">
                    <button
                      onClick={handleCreateShippingCharge}
                      className="bg-[#202224] text-white px-16 py-4 rounded-full font-medium text-[16px] font-montserrat border border-black hover:bg-gray-800 transition-colors"
                    >
                      Create charge
                    </button>
                    <button
                      onClick={handleCloseShippingModal}
                      className="border border-[#e4e4e4] text-black px-16 py-4 rounded-full font-medium text-[16px] font-montserrat hover:bg-gray-50 transition-colors"
                    >
                      go back
                    </button>
                  </div>
                </>
              )}

              {/* Shipping Charges List Section */}
              {shippingCharges.length > 0 && !editingShippingCharge && (
                <div>
                  <div className="grid grid-cols-5 gap-4 mb-4 font-bold text-[16px] font-montserrat text-[#111111] border-b border-gray-300 pb-2">
                    <div>countries</div>
                    <div>delivery charge</div>
                    <div>return charge</div>
                    <div>estimated time in days</div>
                    <div>edit</div>
                  </div>
                  <div className="space-y-4">
                    {shippingCharges.map((charge) => (
                      <div
                        key={charge.id}
                        className="grid grid-cols-5 gap-4 items-center text-[16px] font-montserrat py-2 border-b border-gray-100"
                      >
                        <div>
                          {charge.country || "N/A"} - {charge.region || "N/A"}
                        </div>
                        <div>{charge.deliveryCharge || "N/A"}</div>
                        <div>{charge.returnCharge || "N/A"}</div>
                        <div>{charge.estimatedDays || "N/A"}</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditShippingCharge(charge.id)}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteShippingCharge(charge.id)
                            }
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HSN Code Modal */}
      {modals.hsnCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-4xl mx-4 overflow-clip max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseHsnCodeModal}
              className="absolute right-5 top-5 w-6 h-6 text-gray-500 hover:text-gray-700 z-10"
            >
              <X />
            </button>

            <div className="p-8">
              <h2 className="font-bold text-black text-[24px] mb-8 font-montserrat">
                hsn code setting
              </h2>

              {/* Edit HSN Code Modal View */}
              {editingHsnCode && (
                <div className="mb-8 p-6 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-normal text-black text-[24px] font-montserrat tracking-[-0.6px]">
                      Edit HSN code
                    </h3>
                    <button
                      onClick={handleCancelEditHsnCode}
                      className="w-6 h-6 text-gray-500 hover:text-gray-700"
                    >
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
                    </button>
                  </div>

                  {/* Edit HSN code input */}
                  <div className="mb-6">
                    <input
                      type="text"
                      value={hsnCodeForm.code}
                      onChange={(e) =>
                        handleHsnCodeFormChange("code", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-black rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                      placeholder="Enter HSN code"
                    />
                  </div>

                  {/* Edit action buttons */}
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={handleSaveEditedHsnCode}
                      className="bg-black text-white px-16 py-4 rounded-full font-medium text-[16px] font-montserrat border border-black hover:bg-gray-800 transition-colors"
                    >
                      save
                    </button>
                    <button
                      onClick={handleCancelEditHsnCode}
                      className="border border-[#e4e4e4] text-black px-16 py-4 rounded-full font-medium text-[16px] font-montserrat hover:bg-gray-50 transition-colors"
                    >
                      go back
                    </button>
                  </div>
                </div>
              )}

              {/* Create New HSN Code Form - only show when not editing */}
              {!editingHsnCode && (
                <>
                  {/* Create New Code Section */}
                  <div className="mb-8">
                    <h3 className="font-medium text-[#111111] text-[18px] font-montserrat mb-4">
                      create new code
                    </h3>
                    <div className="mb-6">
                      <input
                        type="text"
                        value={hsnCodeForm.code}
                        onChange={(e) =>
                          handleHsnCodeFormChange("code", e.target.value)
                        }
                        className="w-full max-w-md px-4 py-3 border-2 border-gray-300 rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                        placeholder="Enter HSN code"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mb-8">
                    <button
                      onClick={handleCreateHsnCode}
                      className="bg-[#202224] text-white px-16 py-4 rounded-full font-medium text-[16px] font-montserrat border border-black hover:bg-gray-800 transition-colors"
                    >
                      Create code
                    </button>
                    <button
                      onClick={handleCloseHsnCodeModal}
                      className="border border-[#e4e4e4] text-black px-16 py-4 rounded-full font-medium text-[16px] font-montserrat hover:bg-gray-50 transition-colors"
                    >
                      go back
                    </button>
                  </div>
                </>
              )}

              {/* HSN Codes List Section */}
              {hsnCodes.length > 0 && !editingHsnCode && (
                <div>
                  <div className="grid grid-cols-3 gap-4 mb-4 font-bold text-[16px] font-montserrat text-[#111111] border-b border-gray-300 pb-2">
                    <div>codes available</div>
                    <div>action</div>
                    <div>edit</div>
                  </div>
                  <div className="space-y-4">
                    {hsnCodes.map((code) => (
                      <div
                        key={code.id}
                        className="grid grid-cols-3 gap-4 items-center text-[16px] font-montserrat py-2 border-b border-gray-100"
                      >
                        <div>{code.code || "N/A"}</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveAsDefault(code.id)}
                            className={`px-4 py-2 rounded-full text-[14px] font-medium transition-colors ${
                              code.isDefault
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            save as default
                          </button>
                          <button
                            onClick={() => handleAssignAsAlternate(code.id)}
                            className={`px-4 py-2 rounded-full text-[14px] font-medium transition-colors ${
                              code.isAlternate
                                ? "bg-red-600 text-white"
                                : "bg-red-100 text-red-700 hover:bg-red-200"
                            }`}
                          >
                            Assign as alternate
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditHsnCode(code.id)}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteHsnCode(code.id)}
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {renderModalsForSetting(
        "profileVisibility",
        "Profile Visibility Data Collection"
      )}
      {renderModalsForSetting("collectData", "Location Data Collection")}
      {renderModalsForSetting("huggingFaceAPI", "Hugging Face API")}

      {/* Discount Condition Created Success Modal */}
      <SuccessModal
        isOpen={modals.discountConditionCreatedSuccess}
        onClose={handleDiscountCreatedSuccessDone}
        title="Condition created successfully!"
      />

      {/* Discount Condition Updated Success Modal */}
      <SuccessModal
        isOpen={modals.discountConditionUpdatedSuccess}
        onClose={handleDiscountUpdatedSuccessDone}
        title="Condition updated successfully!"
      />

      {/* Discount Condition Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={modals.discountConditionDeleteConfirm}
        onClose={handleCancelDeleteCondition}
        onConfirm={handleConfirmDeleteCondition}
        title="Are you sure you want to delete this condition?"
      />

      {/* Discount Condition Deleted Success Modal */}
      <SuccessModal
        isOpen={modals.discountConditionDeletedSuccess}
        onClose={handleDiscountDeletedSuccessDone}
        title="Condition deleted successfully!"
      />

      {/* Shipping Charge Created Success Modal */}
      <SuccessModal
        isOpen={modals.shippingChargeCreatedSuccess}
        onClose={handleShippingChargeCreatedSuccessDone}
        title="Shipping charge created successfully!"
      />

      {/* Shipping Charge Updated Success Modal */}
      <SuccessModal
        isOpen={modals.shippingChargeUpdatedSuccess}
        onClose={handleShippingChargeUpdatedSuccessDone}
        title="Shipping charge updated successfully!"
      />

      {/* Shipping Charge Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={modals.shippingChargeDeleteConfirm}
        onClose={handleCancelDeleteShippingCharge}
        onConfirm={handleConfirmDeleteShippingCharge}
        title="Are you sure you want to delete this shipping charge?"
      />

      {/* Shipping Charge Deleted Success Modal */}
      <SuccessModal
        isOpen={modals.shippingChargeDeletedSuccess}
        onClose={handleShippingChargeDeletedSuccessDone}
        title="Shipping charge deleted successfully!"
      />

      {/* HSN Code Success Modal - Created */}
      <SuccessModal
        isOpen={modals.hsnCodeCreatedModal}
        onClose={handleHsnCodeCreatedSuccessDone}
        title="HSN code added successfully!"
      />

      {/* HSN Code Success Modal - Updated */}
      <SuccessModal
        isOpen={modals.hsnCodeUpdatedModal}
        onClose={handleHsnCodeUpdatedSuccessDone}
        title="HSN code updated successfully!"
      />

      {/* HSN Code Success Modal - Deleted */}
      <SuccessModal
        isOpen={modals.hsnCodeDeletedModal}
        onClose={handleHsnCodeDeletedSuccessDone}
        title="HSN code deleted successfully!"
      />

      {/* HSN Code Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={modals.deleteHsnCodeModal}
        onClose={handleCancelDeleteHsnCode}
        onConfirm={handleConfirmDeleteHsnCode}
        title="Are you sure you want to delete this HSN code?"
      />

      {/* Language, Country, Region Modal */}
      {locationModals.languageCountryModal && <LanguageCountryRegionModal />}

      {/* Edit Order Modal */}
      {locationModals.editOrderModal && <EditOrderModal />}

      {/* Auto Notification Modal */}
      {autoNotificationModals.autoNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto">
            <button
              onClick={handleCloseAutoNotificationModal}
              className="absolute right-8 top-8 w-6 h-6 text-gray-500 hover:text-gray-700 z-10"
            >
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
            </button>

            <div className="p-8">
              <h2 className="text-center font-bold text-black text-[24px] mb-8 font-montserrat">
                Auto notify customers about price drops or restock
              </h2>

              {/* Edit Condition View */}
              {editingNotificationCondition && (
                <div className="mb-8 p-6 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-center font-normal text-black text-[24px] font-montserrat tracking-[-0.6px]">
                      Edit condition
                    </h3>
                    <button
                      onClick={handleCancelEditNotificationCondition}
                      className="w-6 h-6 text-gray-500 hover:text-gray-700"
                    >
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
                    </button>
                  </div>

                  <div className="mb-6">
                    <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                      Discount is increased by
                    </label>
                    <input
                      type="text"
                      value={autoNotificationSettings.criteria}
                      onChange={(e) =>
                        handleAutoNotificationChange("criteria", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-black rounded-xl text-[16px] font-montserrat focus:outline-none focus:border-blue-500"
                      placeholder="Enter notification criteria..."
                    />
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={handleSaveEditedNotificationCondition}
                      className="bg-black text-white px-16 py-4 rounded-full font-medium text-[16px] font-montserrat border border-black hover:bg-gray-800 transition-colors"
                    >
                      save
                    </button>
                    <button
                      onClick={handleCancelEditNotificationCondition}
                      className="border border-[#e4e4e4] text-black px-16 py-4 rounded-full font-medium text-[16px] font-montserrat hover:bg-gray-50 transition-colors"
                    >
                      go back
                    </button>
                  </div>
                </div>
              )}

              {/* Create New Condition Form - only show when not editing */}
              {!editingNotificationCondition && (
                <>
                  {/* Criteria Section */}
                  <div className="mb-8">
                    <h3 className="font-bold text-[#111111] text-[24px] font-montserrat mb-6 text-center">
                      criteria
                    </h3>

                    <div className="mb-6">
                      <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-4">
                        Discount is increased by
                      </label>
                      <input
                        type="text"
                        value={autoNotificationSettings.criteria}
                        onChange={(e) =>
                          handleAutoNotificationChange(
                            "criteria",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border-2 border-black rounded-xl text-[16px] font-montserrat focus:outline-none focus:border-blue-500 max-w-md"
                        placeholder="Enter criteria..."
                      />
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={handleCreateNotificationCondition}
                        className="bg-[#202224] text-white px-12 py-4 rounded-full font-medium text-[16px] font-montserrat hover:bg-gray-800 transition-colors border border-black"
                      >
                        Create condition
                      </button>
                    </div>
                  </div>

                  {/* Active Conditions Section */}
                  <div className="mb-8">
                    <h3 className="font-bold text-[#111111] text-[24px] font-montserrat mb-6 text-center">
                      active condition
                    </h3>

                    {autoNotificationSettings.conditions.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <p className="font-montserrat text-[16px]">
                          No active conditions yet
                        </p>
                        <p className="font-montserrat text-[14px] text-gray-400 mt-2">
                          Create your first notification condition above
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {autoNotificationSettings.conditions.map(
                          (condition) => (
                            <div
                              key={condition.id}
                              className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-[18px] font-montserrat text-black">
                                    {condition.type}
                                  </h4>
                                  <p className="font-medium text-[16px] font-montserrat text-gray-700 mt-1">
                                    {condition.criteria}
                                  </p>
                                  <p className="font-normal text-[14px] font-montserrat text-gray-500 mt-2">
                                    Created: {condition.createdAt}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  <button
                                    onClick={() =>
                                      handleEditNotificationCondition(
                                        condition.id
                                      )
                                    }
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                    title="Edit condition"
                                  >
                                    <svg
                                      className="w-5 h-5 text-gray-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteNotificationCondition(
                                        condition.id
                                      )
                                    }
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                    title="Delete condition"
                                  >
                                    <svg
                                      className="w-5 h-5 text-red-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Close Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleCloseAutoNotificationModal}
                  className="border border-[#e4e4e4] text-black px-12 py-3 rounded-full font-medium text-[16px] font-montserrat hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Pricing Modal */}
      {dynamicPricingModals.dynamicPricingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-6xl mx-4 max-h-[90vh] overflow-auto">
            <button
              onClick={handleCloseDynamicPricingModal}
              className="absolute right-8 top-8 w-6 h-6 text-gray-500 hover:text-gray-700 z-10"
            >
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
            </button>

            <div className="p-8">
              <h2 className="text-center font-bold text-black text-[24px] mb-8 font-montserrat">
                Automatically change prices based on demand, time, user segment
              </h2>

              {/* Edit Condition View */}
              {editingDynamicPricingCondition && (
                <div className="mb-8 p-6 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-center font-normal text-black text-[24px] font-montserrat tracking-[-0.6px]">
                      Edit pricing condition
                    </h3>
                    <button
                      onClick={handleCancelEditDynamicPricingCondition}
                      className="w-6 h-6 text-gray-500 hover:text-gray-700"
                    >
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
                    </button>
                  </div>

                  {/* Edit Form Fields */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div>
                      <label className="block font-medium text-[#111111] text-[15px] font-montserrat mb-2">
                        Category
                      </label>
                      <select
                        value={dynamicPricingForm.category}
                        onChange={(e) =>
                          handleDynamicPricingFormChange(
                            "category",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border border-[#979797] rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Category</option>
                        <option value="electronics">Electronics</option>
                        <option value="clothing">Clothing</option>
                        <option value="books">Books</option>
                        <option value="home">Home & Garden</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-[#111111] text-[15px] font-montserrat mb-2">
                        Sub Category
                      </label>
                      <select
                        value={dynamicPricingForm.subCategory}
                        onChange={(e) =>
                          handleDynamicPricingFormChange(
                            "subCategory",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border border-[#979797] rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                      >
                        <option value="">sub category</option>
                        <option value="smartphones">Smartphones</option>
                        <option value="laptops">Laptops</option>
                        <option value="tablets">Tablets</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-[#111111] text-[15px] font-montserrat mb-2">
                        Items
                      </label>
                      <select
                        value={dynamicPricingForm.items}
                        onChange={(e) =>
                          handleDynamicPricingFormChange(
                            "items",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border border-[#979797] rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Items</option>
                        <option value="all">All Items</option>
                        <option value="popular">Popular Items</option>
                        <option value="new">New Items</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-[#111111] text-[15px] font-montserrat mb-2">
                        Specified
                      </label>
                      <select
                        value={dynamicPricingForm.specified}
                        onChange={(e) =>
                          handleDynamicPricingFormChange(
                            "specified",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border border-[#979797] rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                      >
                        <option value="">specified</option>
                        <option value="high-demand">High Demand</option>
                        <option value="low-demand">Low Demand</option>
                        <option value="peak-hours">Peak Hours</option>
                        <option value="off-hours">Off Hours</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                      give criteria
                    </label>
                    <input
                      type="text"
                      value={dynamicPricingSettings.criteria}
                      onChange={(e) =>
                        handleDynamicPricingCriteriaChange(e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-black rounded-xl text-[16px] font-montserrat focus:outline-none focus:border-blue-500"
                      placeholder="Enter pricing criteria..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                        Discount Type
                      </label>
                      <input
                        type="text"
                        value={dynamicPricingForm.discountType}
                        onChange={(e) =>
                          handleDynamicPricingFormChange(
                            "discountType",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border-2 border-black rounded-xl text-[16px] font-montserrat focus:outline-none focus:border-blue-500"
                        placeholder="Enter discount type"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                        minimum order value
                      </label>
                      <input
                        type="text"
                        value={dynamicPricingForm.minimumOrderValue}
                        onChange={(e) =>
                          handleDynamicPricingFormChange(
                            "minimumOrderValue",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border-2 border-black rounded-xl text-[16px] font-montserrat focus:outline-none focus:border-blue-500"
                        placeholder="Minimum order value"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                        max users
                      </label>
                      <input
                        type="text"
                        value={dynamicPricingForm.maxUsers}
                        onChange={(e) =>
                          handleDynamicPricingFormChange(
                            "maxUsers",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border-2 border-black rounded-xl text-[16px] font-montserrat focus:outline-none focus:border-blue-500"
                        placeholder="Max users"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                        Start date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={dynamicPricingForm.startDate}
                          onChange={(e) =>
                            handleDynamicPricingFormChange(
                              "startDate",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border-2 border-black rounded-xl text-[16px] font-montserrat focus:outline-none focus:border-blue-500 pr-12"
                        />
                        <svg
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2">
                        End date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={dynamicPricingForm.endDate}
                          onChange={(e) =>
                            handleDynamicPricingFormChange(
                              "endDate",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border-2 border-black rounded-xl text-[16px] font-montserrat focus:outline-none focus:border-blue-500 pr-12"
                        />
                        <svg
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={handleSaveEditedDynamicPricingCondition}
                      className="bg-black text-white px-16 py-4 rounded-full font-medium text-[16px] font-montserrat border border-black hover:bg-gray-800 transition-colors"
                    >
                      save
                    </button>
                    <button
                      onClick={handleCancelEditDynamicPricingCondition}
                      className="border border-[#e4e4e4] text-black px-16 py-4 rounded-full font-medium text-[16px] font-montserrat hover:bg-gray-50 transition-colors"
                    >
                      go back
                    </button>
                  </div>
                </div>
              )}

              {/* Create New Condition Form - only show when not editing */}
              {!editingDynamicPricingCondition && (
                <>
                  {/* Applicable On Section */}
                  <div className="mb-8">
                    <h3 className="font-bold text-[#111111] text-[21px] font-montserrat mb-6">
                      applicable on
                    </h3>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div>
                        <select
                          value={dynamicPricingForm.category}
                          onChange={(e) =>
                            handleDynamicPricingFormChange(
                              "category",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border border-[#979797] rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Category</option>
                          <option value="electronics">Electronics</option>
                          <option value="clothing">Clothing</option>
                          <option value="books">Books</option>
                          <option value="home">Home & Garden</option>
                        </select>
                      </div>
                      <div>
                        <select
                          value={dynamicPricingForm.subCategory}
                          onChange={(e) =>
                            handleDynamicPricingFormChange(
                              "subCategory",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border border-[#979797] rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                        >
                          <option value="">sub category</option>
                          <option value="smartphones">Smartphones</option>
                          <option value="laptops">Laptops</option>
                          <option value="tablets">Tablets</option>
                        </select>
                      </div>
                      <div>
                        <select
                          value={dynamicPricingForm.items}
                          onChange={(e) =>
                            handleDynamicPricingFormChange(
                              "items",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border border-[#979797] rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Items</option>
                          <option value="all">All Items</option>
                          <option value="popular">Popular Items</option>
                          <option value="new">New Items</option>
                        </select>
                      </div>
                      <div>
                        <select
                          value={dynamicPricingForm.specified}
                          onChange={(e) =>
                            handleDynamicPricingFormChange(
                              "specified",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border border-[#979797] rounded-xl text-[15px] font-montserrat focus:outline-none focus:border-blue-500"
                        >
                          <option value="">specified</option>
                          <option value="high-demand">High Demand</option>
                          <option value="low-demand">Low Demand</option>
                          <option value="peak-hours">Peak Hours</option>
                          <option value="off-hours">Off Hours</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-6">
                      <input
                        type="text"
                        value={dynamicPricingSettings.criteria}
                        onChange={(e) =>
                          handleDynamicPricingCriteriaChange(e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-black rounded-xl text-[16px] font-montserrat focus:outline-none focus:border-blue-500 max-w-md"
                        placeholder="give criteria"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2 text-left">
                          Discount Type
                        </label>
                        <input
                          type="text"
                          value={dynamicPricingForm.discountType}
                          onChange={(e) =>
                            handleDynamicPricingFormChange(
                              "discountType",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border-2 border-black rounded-xl text-[16px] font-montserrat focus:outline-none focus:border-blue-500"
                          placeholder="Enter discount type"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2 text-left">
                          minimum order value
                        </label>
                        <input
                          type="text"
                          value={dynamicPricingForm.minimumOrderValue}
                          onChange={(e) =>
                            handleDynamicPricingFormChange(
                              "minimumOrderValue",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border-2 border-black rounded-xl text-[16px] font-montserrat focus:outline-none focus:border-blue-500"
                          placeholder="Minimum order value"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2 text-left">
                          max users
                        </label>
                        <input
                          type="text"
                          value={dynamicPricingForm.maxUsers}
                          onChange={(e) =>
                            handleDynamicPricingFormChange(
                              "maxUsers",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border-2 border-black rounded-xl text-[16px] font-montserrat focus:outline-none focus:border-blue-500"
                          placeholder="Max users"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2 text-left">
                          Start date
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={dynamicPricingForm.startDate}
                            onChange={(e) =>
                              handleDynamicPricingFormChange(
                                "startDate",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 border-2 border-black rounded-xl text-[16px] font-montserrat focus:outline-none focus:border-blue-500 pr-12"
                          />
                          <svg
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <label className="block font-medium text-[#111111] text-[21px] font-montserrat mb-2 text-left">
                          End date
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={dynamicPricingForm.endDate}
                            onChange={(e) =>
                              handleDynamicPricingFormChange(
                                "endDate",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 border-2 border-black rounded-xl text-[16px] font-montserrat focus:outline-none focus:border-blue-500 pr-12"
                          />
                          <svg
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={handleCreateDynamicPricingCondition}
                        className="bg-[#202224] text-white px-12 py-4 rounded-full font-medium text-[16px] font-montserrat hover:bg-gray-800 transition-colors border border-black"
                      >
                        Create condition
                      </button>
                    </div>
                  </div>

                  {/* Active Conditions Section */}
                  <div className="mb-8">
                    <h3 className="font-bold text-[#111111] text-[21px] font-montserrat mb-6">
                      conditions
                    </h3>

                    {dynamicPricingSettings.conditions.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <p className="font-montserrat text-[16px]">
                          No pricing conditions yet
                        </p>
                        <p className="font-montserrat text-[14px] text-gray-400 mt-2">
                          Create your first dynamic pricing condition above
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {dynamicPricingSettings.conditions.map((condition) => (
                          <div
                            key={condition.id}
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                          >
                            <div className="grid grid-cols-6 gap-4 items-center">
                              <div className="text-center">
                                <p className="font-medium text-[21px] font-montserrat text-black">
                                  {condition.discountType || "Discount Type"}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="font-medium text-[21px] font-montserrat text-black">
                                  {condition.startDate || "Start date"}
                                </p>
                                <svg
                                  className="w-6 h-6 text-gray-400 mx-auto mt-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <div className="text-center">
                                <p className="font-medium text-[21px] font-montserrat text-black">
                                  {condition.endDate || "End date"}
                                </p>
                                <svg
                                  className="w-6 h-6 text-gray-400 mx-auto mt-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <div className="text-center">
                                <p className="font-medium text-[21px] font-montserrat text-black">
                                  {condition.minimumOrderValue ||
                                    "minimum order value"}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="font-medium text-[21px] font-montserrat text-black">
                                  {condition.maxUsers || "max users"}
                                </p>
                              </div>
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() =>
                                    handleEditDynamicPricingCondition(
                                      condition.id
                                    )
                                  }
                                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                  title="Edit condition"
                                >
                                  <svg
                                    className="w-5 h-5 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteDynamicPricingCondition(
                                      condition.id
                                    )
                                  }
                                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                  title="Delete condition"
                                >
                                  <svg
                                    className="w-5 h-5 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Close Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleCloseDynamicPricingModal}
                  className="border border-[#e4e4e4] text-black px-12 py-3 rounded-full font-medium text-[16px] font-montserrat hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Success Modals */}
      <SuccessModal
        isOpen={locationModals.countryCreatedSuccess}
        onClose={() => handleLocationSuccessDone("country")}
        title="Country added successfully!"
      />

      <SuccessModal
        isOpen={locationModals.languageCreatedSuccess}
        onClose={() => handleLocationSuccessDone("language")}
        title="Language added successfully!"
      />

      <SuccessModal
        isOpen={locationModals.currencyCreatedSuccess}
        onClose={() => handleLocationSuccessDone("currency")}
        title="Currency added successfully!"
      />

      {/* Orders Saved Success Modal */}
      <SuccessModal
        isOpen={locationModals.ordersSavedSuccess}
        onClose={() =>
          setLocationModals((prev) => ({ ...prev, ordersSavedSuccess: false }))
        }
        title="Orders updated successfully!"
      />

      {/* Auto Notification Success Modals */}
      <SuccessModal
        isOpen={autoNotificationModals.conditionCreatedSuccess}
        onClose={handleNotificationConditionCreatedSuccessDone}
        title="Notification condition created successfully!"
      />

      <SuccessModal
        isOpen={autoNotificationModals.conditionUpdatedSuccess}
        onClose={handleNotificationConditionUpdatedSuccessDone}
        title="Notification condition updated successfully!"
      />

      <SuccessModal
        isOpen={autoNotificationModals.conditionDeletedSuccess}
        onClose={handleNotificationConditionDeletedSuccessDone}
        title="Notification condition deleted successfully!"
      />

      {/* Auto Notification Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={autoNotificationModals.conditionDeleteConfirm}
        onClose={handleCancelDeleteNotificationCondition}
        onConfirm={handleConfirmDeleteNotificationCondition}
        title="Are you sure you want to delete this notification condition?"
      />

      {/* Dynamic Pricing Success Modals */}
      <SuccessModal
        isOpen={dynamicPricingModals.conditionCreatedSuccess}
        onClose={handleDynamicPricingConditionCreatedSuccessDone}
        title="Dynamic pricing condition created successfully!"
      />

      <SuccessModal
        isOpen={dynamicPricingModals.conditionUpdatedSuccess}
        onClose={handleDynamicPricingConditionUpdatedSuccessDone}
        title="Dynamic pricing condition updated successfully!"
      />

      <SuccessModal
        isOpen={dynamicPricingModals.conditionDeletedSuccess}
        onClose={handleDynamicPricingConditionDeletedSuccessDone}
        title="Dynamic pricing condition deleted successfully!"
      />

      {/* Dynamic Pricing Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={dynamicPricingModals.conditionDeleteConfirm}
        onClose={handleCancelDeleteDynamicPricingCondition}
        onConfirm={handleConfirmDeleteDynamicPricingCondition}
        title="Are you sure you want to delete this pricing condition?"
      />

      {/* Delete Confirmation Modals */}
      <DeleteConfirmationModal
        isOpen={locationModals.deleteCountryConfirm}
        onClose={handleCancelDeleteCountry}
        onConfirm={handleConfirmDeleteCountry}
        title="Are you sure you want to delete this country?"
      />

      <DeleteConfirmationModal
        isOpen={locationModals.deleteLanguageConfirm}
        onClose={handleCancelDeleteLanguage}
        onConfirm={handleConfirmDeleteLanguage}
        title="Are you sure you want to delete this language?"
      />

      <DeleteConfirmationModal
        isOpen={locationModals.deleteCurrencyConfirm}
        onClose={handleCancelDeleteCurrency}
        onConfirm={handleConfirmDeleteCurrency}
        title="Are you sure you want to delete this currency?"
      />

      {/* Webhook Management Modal */}
      {webhookModals.webhookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-7xl mx-4 overflow-clip max-h-[95vh] overflow-y-auto">
            <button
              onClick={handleCloseWebhookModal}
              className="absolute right-5 top-5 w-6 h-6 text-gray-500 hover:text-gray-700 z-10"
            >
              <X />
            </button>

            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12">
              <div className="space-y-6">
                {/* API Access and Integration */}
                <div className="space-y-4">
                  <div className="rounded-2xl p-6 border-2 border-gray-200">
                    <h3 className="font-bold text-gray-900 text-2xl mb-8 font-montserrat">
                      API Access and Integration
                    </h3>

                    <div className="space-y-4">
                      <div className="rounded-xl p-6 shadow-md border border-gray-200">
                        <h1 className="font-bold text-gray-800 text-xl mb-2 font-montserrat flex items-center">
                          API Keys
                        </h1>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg font-montserrat">
                            <span className="text-gray-700 text-lg font-semibold">
                              API Key
                            </span>
                            <span className="text-gray-600 text-lg bg-white px-3 py-1 rounded-md border">
                              •••••••••••••
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="text-gray-700 text-lg font-semibold font-montserrat">
                              Auth Method
                            </span>
                            <span className="text-gray-600 text-lg bg-green-100 px-3 py-1 rounded-full">
                              OAuth
                            </span>
                          </div>
                          <button className="text-blue-600 text-lg font-semibold hover:text-blue-700 transition-colors border-b-2 border-transparent hover:border-blue-600 pb-1">
                            Reauthenticate
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl p-6 shadow-md border border-gray-200">
                        <h4 className="font-bold text-gray-800 text-xl mb-6 font-montserrat flex items-center">
                          API Permission
                        </h4>
                        <div className="flex flex-wrap items-center gap-4">
                          {Object.entries(webhookSettings.apiPermissions).map(
                            ([permission, enabled]) => (
                              <label
                                key={permission}
                                className="flex items-center gap-4 p-3 w-fit cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={enabled}
                                  onChange={() =>
                                    handleToggleApiPermission(permission)
                                  }
                                  className="w-5 h-5 border-2 border-gray-300 rounded-md text-blue-600 focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="text-gray-700 text-base capitalize font-montserrat font-medium">
                                  {permission}
                                </span>
                              </label>
                            )
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl p-6 shadow-md border border-gray-100">
                        <h4 className="font-bold text-gray-800 text-xl mb-6 font-montserrat flex items-center">
                          API Call Logs
                        </h4>
                        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                          <div className="grid grid-cols-3 gap-4 text-gray-600 text-sm font-semibold mb-3 font-montserrat uppercase tracking-wider">
                            <span>Date</span>
                            <span>Export</span>
                            <span>IP Address</span>
                          </div>
                          <div className="text-gray-800 text-base font-medium font-montserrat bg-white p-3 rounded-md border">
                            Nov 11, 2025
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Webhook Management */}
                <div className="space-y-4">
                  <div className="rounded-2xl p-6 border-2 border-gray-200">
                    <h3 className="font-bold text-gray-900 text-2xl mb-8 font-montserrat">
                      Webhook Management
                    </h3>

                    <div className="rounded-xl p-6 border border-gray-200 space-y-4">
                      <div>
                        <label className="block text-gray-700 text-lg font-semibold mb-3 font-montserrat">
                          Event
                        </label>
                        <select
                          value={webhookForm.event}
                          onChange={(e) =>
                            handleWebhookFormChange("event", e.target.value)
                          }
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-700 text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-montserrat transition-all"
                        >
                          <option value="">Order placed</option>
                          <option value="order placed">Order Placed</option>
                          <option value="payment successful">
                            Payment Successful
                          </option>
                          <option value="payment failed">Payment Failed</option>
                          <option value="order shipped">Order Shipped</option>
                          <option value="order delivered">
                            Order Delivered
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-lg font-semibold mb-3 font-montserrat">
                          URL
                        </label>
                        <input
                          type="url"
                          value={webhookForm.webhookUrl}
                          onChange={(e) =>
                            handleWebhookFormChange(
                              "webhookUrl",
                              e.target.value
                            )
                          }
                          placeholder="webhook URL"
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-700 text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-montserrat transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-lg font-semibold mb-3 font-montserrat">
                          Last Triggered
                        </label>
                        <input
                          type="password"
                          value={webhookForm.secretKey}
                          onChange={(e) =>
                            handleWebhookFormChange("secretKey", e.target.value)
                          }
                          placeholder="secret key(mandatory)"
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-700 text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-montserrat transition-all"
                        />
                      </div>

                      <button
                        onClick={
                          editingWebhook
                            ? handleSaveEditedWebhook
                            : handleCreateWebhook
                        }
                        disabled={
                          !webhookForm.event ||
                          !webhookForm.webhookUrl ||
                          !webhookForm.secretKey
                        }
                        className="w-full bg-gray-900 text-white py-4 px-12 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-all shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed font-montserrat"
                      >
                        {editingWebhook ? "Update webhook" : "Add webhook"}
                      </button>

                      {editingWebhook && (
                        <button
                          onClick={handleCancelEditWebhook}
                          className="w-full border-2 border-gray-300 text-gray-700 py-4 px-12 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all font-montserrat"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    {/* Webhook Management Table Headers */}
                    <div className="mt-8 bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                      <div className="py-4">
                        <div className="grid grid-cols-6 gap-3 text-gray-600 text-sm font-bold font-montserrat uppercase tracking-wider border-b-2 border-gray-200 px-6">
                          <span>Event</span>
                          <span>URL</span>
                          <span>Last Triggered</span>
                          <span>Status</span>
                          <span>Response</span>
                          <span>Actions</span>
                        </div>
                      </div>

                      <div className="divide-y divide-gray-200">
                        <div className="grid grid-cols-6 gap-3 items-center px-6 py-4 text-gray-700 text-base font-montserrat hover:bg-gray-50 transition-colors">
                          <span className="font-medium">order placed</span>
                          <span className="truncate text-blue-600 hover:text-blue-700">
                            http//hdddhdhd
                          </span>
                          <span className="text-sm text-gray-500">2 am</span>
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-green-700 font-medium text-sm">
                              Success
                            </span>
                          </span>
                          <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                            300kb
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditWebhook(1)}
                              className="p-2 rounded-lg hover:bg-blue-50 transition-colors group"
                            >
                              <svg
                                className="w-5 h-5 text-gray-400 group-hover:text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteWebhook(1)}
                              className="p-2 rounded-lg hover:bg-red-50 transition-colors group"
                            >
                              <svg
                                className="w-5 h-5 text-gray-400 group-hover:text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-6 gap-3 items-center px-6 py-4 text-gray-700 text-base font-montserrat hover:bg-gray-50 transition-colors">
                          <span className="font-medium">
                            payment successful
                          </span>
                          <span className="truncate text-blue-600 hover:text-blue-700">
                            http//hdddhdhd
                          </span>
                          <span className="text-sm text-gray-500">
                            Nov 11,2025
                          </span>
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            <span className="text-red-700 font-medium text-sm">
                              Failed
                            </span>
                          </span>
                          <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                            300kb
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditWebhook(2)}
                              className="p-2 rounded-lg hover:bg-blue-50 transition-colors group"
                            >
                              <svg
                                className="w-5 h-5 text-gray-400 group-hover:text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteWebhook(2)}
                              className="p-2 rounded-lg hover:bg-red-50 transition-colors group"
                            >
                              <svg
                                className="w-5 h-5 text-gray-400 group-hover:text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-6 gap-3 items-center px-6 py-4 text-gray-700 text-base font-montserrat hover:bg-gray-50 transition-colors">
                          <span className="font-medium">payment failed</span>
                          <span className="truncate text-blue-600 hover:text-blue-700">
                            http//hdddhdhd
                          </span>
                          <span className="text-sm text-gray-500">
                            Nov 11,2025
                          </span>
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            <span className="text-red-700 font-medium text-sm">
                              Failed
                            </span>
                          </span>
                          <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                            300kb
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditWebhook(3)}
                              className="p-2 rounded-lg hover:bg-blue-50 transition-colors group"
                            >
                              <svg
                                className="w-5 h-5 text-gray-400 group-hover:text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteWebhook(3)}
                              className="p-2 rounded-lg hover:bg-red-50 transition-colors group"
                            >
                              <svg
                                className="w-5 h-5 text-gray-400 group-hover:text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Dynamic webhook entries from state */}
                        {webhookSettings.webhooks.map((webhook) => (
                          <div
                            key={webhook.id}
                            className="grid grid-cols-6 gap-3 items-center px-6 py-4 text-gray-700 text-base font-montserrat hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium">{webhook.event}</span>
                            <span className="truncate text-blue-600 hover:text-blue-700">
                              {webhook.webhookUrl}
                            </span>
                            <span className="text-sm text-gray-500">
                              {webhook.lastTriggered || "Never"}
                            </span>
                            <span className="flex items-center">
                              <div
                                className={`w-3 h-3 rounded-full mr-2 ${
                                  webhook.status === "active"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              ></div>
                              <span
                                className={`font-medium text-sm ${
                                  webhook.status === "active"
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {webhook.status === "active"
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </span>
                            <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                              {webhook.responseSize}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditWebhook(webhook.id)}
                                className="p-2 rounded-lg hover:bg-blue-50 transition-colors group"
                              >
                                <svg
                                  className="w-5 h-5 text-gray-400 group-hover:text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteWebhook(webhook.id)}
                                className="p-2 rounded-lg hover:bg-red-50 transition-colors group"
                              >
                                <svg
                                  className="w-5 h-5 text-gray-400 group-hover:text-red-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Webhook Logs */}
                <div className="col-span-2 mt-8">
                  <div className="rounded-2xl p-6 border-2 border-gray-200">
                    <h3 className="font-bold text-gray-900 text-2xl mb-8 font-montserrat">
                      Webhook Logs
                    </h3>

                    <div className="rounded-xl p-6 shadow-md border-2 border-gray-200 space-y-6">
                      <div className="flex items-center gap-6">
                        <select className="flex-1 px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-700 text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-montserrat transition-all">
                          <option>All Events</option>
                          <option>Order Placed</option>
                          <option>Payment Successful</option>
                          <option>Payment Failed</option>
                        </select>
                        <div className="flex items-center gap-3 text-gray-600 text-base font-medium font-montserrat bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                          <svg
                            className="w-6 h-6 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Nov 11, 2025 - Nov 27, 2025
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="text-gray-700 text-lg font-semibold font-montserrat">
                          Frequency
                        </div>
                        <div className="text-gray-700 text-lg font-semibold font-montserrat">
                          Response
                        </div>
                      </div>

                      {/* Log Entries */}
                      <div className="bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-200">
                        <div className="bg-gray-100 px-6 py-4">
                          <div className="grid grid-cols-4 gap-4 text-gray-600 text-sm font-bold font-montserrat uppercase tracking-wider">
                            <span>Date</span>
                            <span>Event</span>
                            <span>Status</span>
                            <span>Response</span>
                          </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                          <div className="grid grid-cols-4 gap-4 px-6 py-4 text-gray-700 text-base font-montserrat hover:bg-gray-50 transition-colors">
                            <span className="font-medium">Nov 11, 2025</span>
                            <span className="text-gray-600">order placed</span>
                            <span className="flex items-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                              <span className="text-green-700 font-medium text-sm">
                                Success
                              </span>
                            </span>
                            <span className="text-sm bg-gray-100 px-2 py-1 rounded-full w-fit">
                              300kb
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-4 px-6 py-4 text-gray-700 text-base font-montserrat hover:bg-gray-50 transition-colors">
                            <span className="font-medium">Nov 11, 2025</span>
                            <span className="text-gray-600">
                              payment success
                            </span>
                            <span className="flex items-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                              <span className="text-green-700 font-medium text-sm">
                                Success
                              </span>
                            </span>
                            <span className="text-sm bg-gray-100 px-2 py-1 rounded-full w-fit">
                              300kb
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-4 px-6 py-4 text-gray-700 text-base font-montserrat hover:bg-gray-50 transition-colors">
                            <span className="font-medium">Nov 11, 2025</span>
                            <span className="text-gray-600">
                              payment failed
                            </span>
                            <span className="flex items-center">
                              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                              <span className="text-red-700 font-medium text-sm">
                                Failed
                              </span>
                            </span>
                            <span className="text-sm bg-gray-100 px-2 py-1 rounded-full w-fit">
                              300kb
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Success Modals */}
      <SuccessModal
        isOpen={webhookModals.webhookCreatedSuccess}
        onClose={handleWebhookCreatedSuccessDone}
        title="Webhook created successfully!"
      />

      <SuccessModal
        isOpen={webhookModals.webhookUpdatedSuccess}
        onClose={handleWebhookUpdatedSuccessDone}
        title="Webhook updated successfully!"
      />

      <SuccessModal
        isOpen={webhookModals.webhookDeletedSuccess}
        onClose={handleWebhookDeletedSuccessDone}
        title="Webhook deleted successfully!"
      />

      {/* Webhook Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={webhookModals.webhookDeleteConfirm}
        onClose={handleCancelDeleteWebhook}
        onConfirm={handleConfirmDeleteWebhook}
        title="Are you sure you want to delete this webhook?"
      />

      {/* Conditional Component Rendering */}
      {showCommunicationPreferences && <CollectCommunicationPreferences />}
      {showAutoInvoiceMailing && <GetAutoInvoiceMailing />}
    </div>
  );
};

export default Settings;
