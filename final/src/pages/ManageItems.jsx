import React, { useState, useMemo, useCallback, useEffect, memo } from "react";
import {
  Search,
  Edit2,
  Trash2,
  ChevronDown,
  Plus,
  X,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Constants moved outside to prevent recreation on every render
const SAMPLE_ITEMS = [
  {
    id: 1,
    image: "/api/placeholder/120/116",
    productName: "Insomniac T shirt",
    category: "men",
    subCategories: "T shirt",
    hsn: "44000000",
    size: ["small", "medium", "large"],
    quantity: 5,
    price: 4566,
    salePrice: 4566,
    platforms: {
      myntra: { enabled: true, price: 4566 },
      amazon: { enabled: true, price: 4566 },
      flipkart: { enabled: true, price: 4566 },
      nykaa: { enabled: true, price: 4566 },
    },
    skus: {
      small: "blk/s/inso123",
      medium: "blk/m/inso123",
      large: "blk/l/inso123",
    },
    barcodeNo: "44000000000000",
    status: "draft",
    metaTitle: "tshirt white",
    metaDescription: "tshirt white trending",
    slugUrl: "tu.beee/hhhhhh/hahahha.com",
    moveToSale: false,
    keepCopyAndMove: false,
    moveToEyx: false,
  },
  {
    id: 2,
    image: "/api/placeholder/120/116",
    productName: "Insomniac T shirt",
    category: "men",
    subCategories: "T shirt",
    hsn: "44000000",
    size: ["small", "medium", "large"],
    quantity: 10,
    price: 4566,
    salePrice: 4566,
    platforms: {
      myntra: { enabled: true, price: 4566 },
      amazon: { enabled: true, price: 4566 },
      flipkart: { enabled: true, price: 4566 },
      nykaa: { enabled: true, price: 4566 },
    },
    skus: {
      small: "blk/s/inso124",
      medium: "blk/m/inso124",
      large: "blk/l/inso124",
    },
    barcodeNo: "44000000000000",
    status: "live",
    metaTitle: "tshirt white",
    metaDescription: "tshirt white trending",
    slugUrl: "tu.beee/hhhhhh/hahahha.com",
    moveToSale: false,
    keepCopyAndMove: false,
    moveToEyx: false,
  },
  {
    id: 3,
    image: "/api/placeholder/120/116",
    productName: "Insomniac T shirt",
    category: "men",
    subCategories: "T shirt",
    hsn: "44000000",
    size: ["small", "medium", "large"],
    quantity: 8,
    price: 4566,
    salePrice: 4566,
    platforms: {
      myntra: { enabled: false, price: 4566 },
      amazon: { enabled: true, price: 4566 },
      flipkart: { enabled: false, price: 4566 },
      nykaa: { enabled: true, price: 4566 },
    },
    skus: {
      small: "blk/s/inso125",
      medium: "blk/m/inso125",
      large: "blk/l/inso125",
    },
    barcodeNo: "44000000000000",
    status: "scheduled",
    scheduledDate: "2025-08-15",
    scheduledTime: "14:30",
    metaTitle: "tshirt white",
    metaDescription: "tshirt white trending",
    slugUrl: "tu.beee/hhhhhh/hahahha.com",
    moveToSale: false,
    keepCopyAndMove: false,
    moveToEyx: false,
  },
];

const CATEGORY_OPTIONS = [
  "All categories",
  "men",
  "women",
  "T shirt",
  "Clothing",
  "Accessories",
];

const SUB_CATEGORY_OPTIONS = [
  "All subcategories",
  "T shirt",
  "Casual wear",
  "Formal wear",
];

const STATUS_STYLES = {
  live: "text-[#00b69b]",
  draft: "text-[#ef3826]",
  scheduled: "text-[#ffd56d]",
};

// Custom hooks for better state management
const useManageItemsState = () => {
  // Basic filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [selectedSubCategory, setSelectedSubCategory] =
    useState("All subcategories");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDraftsOnly, setShowDraftsOnly] = useState(false);
  const [showLiveOnly, setShowLiveOnly] = useState(false);
  const [showScheduledOnly, setShowScheduledOnly] = useState(false);

  // Items data
  const [draftItems, setDraftItems] = useState([]);
  const [publishedItems, setPublishedItems] = useState([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    statusFilter,
    setStatusFilter,
    showDraftsOnly,
    setShowDraftsOnly,
    showLiveOnly,
    setShowLiveOnly,
    showScheduledOnly,
    setShowScheduledOnly,
    draftItems,
    setDraftItems,
    publishedItems,
    setPublishedItems,
    isFilterDropdownOpen,
    setIsFilterDropdownOpen,
  };
};

const useModalState = () => {
  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newDetails, setNewDetails] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Meta data modal
  const [isMetaDataModalOpen, setIsMetaDataModalOpen] = useState(false);
  const [isMetaDataSuccessModalOpen, setIsMetaDataSuccessModalOpen] =
    useState(false);
  const [selectedItemForMeta, setSelectedItemForMeta] = useState(null);
  const [metaFormData, setMetaFormData] = useState({
    metaTitle: "",
    metaDescription: "",
    slugUrl: "",
  });

  // Delete modal
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);
  const [isDeleteSuccessModalOpen, setIsDeleteSuccessModalOpen] =
    useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Schedule modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [itemToSchedule, setItemToSchedule] = useState(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isScheduleSuccessModalOpen, setIsScheduleSuccessModalOpen] =
    useState(false);

  // Make live modal
  const [isMakeLiveConfirmModalOpen, setIsMakeLiveConfirmModalOpen] =
    useState(false);
  const [itemToMakeLive, setItemToMakeLive] = useState(null);
  const [isMakeLiveSuccessModalOpen, setIsMakeLiveSuccessModalOpen] =
    useState(false);

  // Cancel schedule modal
  const [
    isCancelScheduleConfirmModalOpen,
    setIsCancelScheduleConfirmModalOpen,
  ] = useState(false);
  const [itemToCancelSchedule, setItemToCancelSchedule] = useState(null);
  const [
    isCancelScheduleSuccessModalOpen,
    setIsCancelScheduleSuccessModalOpen,
  ] = useState(false);

  return {
    // Edit modal
    isEditModalOpen,
    setIsEditModalOpen,
    editingItem,
    setEditingItem,
    newDetails,
    setNewDetails,
    isSuccessModalOpen,
    setIsSuccessModalOpen,

    // Meta data modal
    isMetaDataModalOpen,
    setIsMetaDataModalOpen,
    isMetaDataSuccessModalOpen,
    setIsMetaDataSuccessModalOpen,
    selectedItemForMeta,
    setSelectedItemForMeta,
    metaFormData,
    setMetaFormData,

    // Delete modal
    isDeleteConfirmModalOpen,
    setIsDeleteConfirmModalOpen,
    isDeleteSuccessModalOpen,
    setIsDeleteSuccessModalOpen,
    itemToDelete,
    setItemToDelete,

    // Schedule modal
    isScheduleModalOpen,
    setIsScheduleModalOpen,
    itemToSchedule,
    setItemToSchedule,
    scheduleDate,
    setScheduleDate,
    scheduleTime,
    setScheduleTime,
    isScheduleSuccessModalOpen,
    setIsScheduleSuccessModalOpen,

    // Make live modal
    isMakeLiveConfirmModalOpen,
    setIsMakeLiveConfirmModalOpen,
    itemToMakeLive,
    setItemToMakeLive,
    isMakeLiveSuccessModalOpen,
    setIsMakeLiveSuccessModalOpen,

    // Cancel schedule modal
    isCancelScheduleConfirmModalOpen,
    setIsCancelScheduleConfirmModalOpen,
    itemToCancelSchedule,
    setItemToCancelSchedule,
    isCancelScheduleSuccessModalOpen,
    setIsCancelScheduleSuccessModalOpen,
  };
};

const ManageItems = memo(() => {
  const navigate = useNavigate();
  const state = useManageItemsState();
  const modalState = useModalState();

  const [sampleItems, setSampleItems] = useState(SAMPLE_ITEMS);

  // Data loading effect - optimized with reduced dependencies
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedDrafts = localStorage.getItem("yoraa_draft_items");
        if (savedDrafts) {
          state.setDraftItems(JSON.parse(savedDrafts));
        }

        const savedPublished = localStorage.getItem("yoraa_published_items");
        if (savedPublished) {
          state.setPublishedItems(JSON.parse(savedPublished));
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    };

    loadSavedData();
  }, []); // Removed state dependency for better performance

  // Optimized filter handlers with useCallback
  const filterHandlers = useMemo(() => {
    const handleViewAllDrafts = () => {
      const newStatus = state.statusFilter === "draft" ? "all" : "draft";
      state.setStatusFilter(newStatus);
      state.setShowDraftsOnly(newStatus === "draft");
      state.setShowLiveOnly(false);
      state.setShowScheduledOnly(false);
    };

    const handleViewAllLive = () => {
      const newStatus = state.statusFilter === "live" ? "all" : "live";
      state.setStatusFilter(newStatus);
      state.setShowLiveOnly(newStatus === "live");
      state.setShowDraftsOnly(false);
      state.setShowScheduledOnly(false);
    };

    const handleViewAllScheduled = () => {
      const newStatus =
        state.statusFilter === "scheduled" ? "all" : "scheduled";
      state.setStatusFilter(newStatus);
      state.setShowScheduledOnly(newStatus === "scheduled");
      state.setShowDraftsOnly(false);
      state.setShowLiveOnly(false);
    };

    const clearAllFilters = () => {
      state.setStatusFilter("all");
      state.setShowDraftsOnly(false);
      state.setShowLiveOnly(false);
      state.setShowScheduledOnly(false);
    };

    const toggleFilterDropdown = () => {
      state.setIsFilterDropdownOpen((prev) => !prev);
    };

    const handleFilterOption = (filterType) => {
      switch (filterType) {
        case "all_drafts":
          handleViewAllDrafts();
          break;
        case "all_live":
          handleViewAllLive();
          break;
        case "all_scheduled":
          handleViewAllScheduled();
          break;
        case "clear_filters":
          clearAllFilters();
          break;
        default:
          break;
      }
      state.setIsFilterDropdownOpen(false);
    };

    return {
      handleViewAllDrafts,
      handleViewAllLive,
      handleViewAllScheduled,
      clearAllFilters,
      toggleFilterDropdown,
      handleFilterOption,
    };
  }, [
    state.statusFilter,
    // Remove the setter functions from dependencies as they're stable
  ]);

  // Dropdown click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        state.isFilterDropdownOpen &&
        !event.target.closest(".filter-dropdown")
      ) {
        state.setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [state.isFilterDropdownOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (event.altKey) {
        switch (event.key) {
          case "d":
          case "D":
            event.preventDefault();
            filterHandlers.handleViewAllDrafts();
            break;
          case "l":
          case "L":
            event.preventDefault();
            filterHandlers.handleViewAllLive();
            break;
          case "s":
          case "S":
            event.preventDefault();
            filterHandlers.handleViewAllScheduled();
            break;
          case "c":
          case "C":
            event.preventDefault();
            filterHandlers.clearAllFilters();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filterHandlers]);

  // Combined items computation
  const allItems = useMemo(() => {
    return [...sampleItems, ...state.draftItems, ...state.publishedItems];
  }, [sampleItems, state.draftItems, state.publishedItems]);

  // Filtered items computation
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch =
        item.productName
          .toLowerCase()
          .includes(state.searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        item.subCategories
          .toLowerCase()
          .includes(state.searchTerm.toLowerCase());

      const matchesCategory =
        state.selectedCategory === "All categories" ||
        item.category === state.selectedCategory;

      const matchesSubCategory =
        state.selectedSubCategory === "All subcategories" ||
        item.subCategories === state.selectedSubCategory;

      // Status filtering
      let matchesStatusFilter = true;
      if (state.showDraftsOnly) {
        matchesStatusFilter = item.status === "draft";
      } else if (state.showLiveOnly) {
        matchesStatusFilter = item.status === "live";
      } else if (state.showScheduledOnly) {
        matchesStatusFilter = item.status === "scheduled";
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSubCategory &&
        matchesStatusFilter
      );
    });
  }, [
    allItems,
    state.searchTerm,
    state.selectedCategory,
    state.selectedSubCategory,
    state.showDraftsOnly,
    state.showLiveOnly,
    state.showScheduledOnly,
  ]);

  // Optimized utility functions with useCallback for better performance
  const utils = useMemo(() => {
    const getSizeDisplay = (sizes) => sizes.join(", ");

    const getSkuDisplay = (skus, sizes) =>
      sizes.map((size) => skus[size]).join(", ");

    const getStatusStyle = (status) => {
      return STATUS_STYLES[status.toLowerCase()] || STATUS_STYLES.draft;
    };

    const formatScheduledDateTime = (date, time) => {
      if (!date || !time) return "";

      const dateObj = new Date(date);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const [hours, minutes] = time.split(":");
      const timeObj = new Date();
      timeObj.setHours(parseInt(hours), parseInt(minutes));
      const formattedTime = timeObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      return `${formattedDate} at ${formattedTime}`;
    };

    return {
      getSizeDisplay,
      getSkuDisplay,
      getStatusStyle,
      formatScheduledDateTime,
    };
  }, []);

  // Optimized action handlers with useCallback
  const actionHandlers = useMemo(() => {
    const handleBulkUpload = () => {
      console.log("Bulk upload");
    };

    const handleUploadSingleProduct = () => {
      navigate("/single-product-upload");
    };

    const handleEdit = (itemId) => {
      const itemToEdit = allItems.find((item) => item.id === itemId);
      modalState.setEditingItem(itemToEdit);
      modalState.setNewDetails("");
      modalState.setIsEditModalOpen(true);
    };

    const handleSaveEdit = () => {
      console.log(
        "Saving edit for item:",
        modalState.editingItem.id,
        "New details:",
        modalState.newDetails
      );
      modalState.setIsEditModalOpen(false);
      modalState.setEditingItem(null);
      modalState.setNewDetails("");
      modalState.setIsSuccessModalOpen(true);
    };

    const handleCloseEdit = () => {
      modalState.setIsEditModalOpen(false);
      modalState.setEditingItem(null);
      modalState.setNewDetails("");
    };

    const handleCloseSuccess = () => {
      modalState.setIsSuccessModalOpen(false);
    };

    return {
      handleBulkUpload,
      handleUploadSingleProduct,
      handleEdit,
      handleSaveEdit,
      handleCloseEdit,
      handleCloseSuccess,
    };
  }, [navigate, allItems]);

  // Optimized delete handlers
  const deleteHandlers = useMemo(() => {
    const handleDelete = (itemId) => {
      const itemToDeleteObj = allItems.find((item) => item.id === itemId);
      modalState.setItemToDelete(itemToDeleteObj);
      modalState.setIsDeleteConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
      console.log("Deleting item:", modalState.itemToDelete.id);

      if (modalState.itemToDelete.status === "draft") {
        const updatedDrafts = state.draftItems.filter(
          (item) => item.id !== modalState.itemToDelete.id
        );
        state.setDraftItems(updatedDrafts);
        localStorage.setItem(
          "yoraa_draft_items",
          JSON.stringify(updatedDrafts)
        );
      } else if (modalState.itemToDelete.status === "live") {
        const updatedPublished = state.publishedItems.filter(
          (item) => item.id !== modalState.itemToDelete.id
        );
        state.setPublishedItems(updatedPublished);
        localStorage.setItem(
          "yoraa_published_items",
          JSON.stringify(updatedPublished)
        );
      }

      modalState.setIsDeleteConfirmModalOpen(false);
      modalState.setItemToDelete(null);
      modalState.setIsDeleteSuccessModalOpen(true);
    };

    const handleCancelDelete = () => {
      modalState.setIsDeleteConfirmModalOpen(false);
      modalState.setItemToDelete(null);
    };

    const handleCloseDeleteSuccess = () => {
      modalState.setIsDeleteSuccessModalOpen(false);
    };

    return {
      handleDelete,
      handleConfirmDelete,
      handleCancelDelete,
      handleCloseDeleteSuccess,
    };
  }, [
    allItems.length, // Use length instead of the full array
    modalState.itemToDelete?.id,
  ]);

  // Optimized metadata handlers
  const metaDataHandlers = useMemo(() => {
    const handleViewMetaData = (item) => {
      modalState.setSelectedItemForMeta(item);
      modalState.setMetaFormData({
        metaTitle: item.metaTitle || "",
        metaDescription: item.metaDescription || "",
        slugUrl: item.slugUrl || "",
      });
      modalState.setIsMetaDataModalOpen(true);
    };

    const handleCloseMetaData = () => {
      modalState.setIsMetaDataModalOpen(false);
      modalState.setSelectedItemForMeta(null);
      modalState.setMetaFormData({
        metaTitle: "",
        metaDescription: "",
        slugUrl: "",
      });
    };

    const handleSaveMetaData = () => {
      console.log(
        "Saving meta data for item:",
        modalState.selectedItemForMeta.id,
        "Data:",
        modalState.metaFormData
      );
      modalState.setIsMetaDataModalOpen(false);
      modalState.setSelectedItemForMeta(null);
      modalState.setMetaFormData({
        metaTitle: "",
        metaDescription: "",
        slugUrl: "",
      });
      modalState.setIsMetaDataSuccessModalOpen(true);
    };

    const handleCloseMetaDataSuccess = () => {
      modalState.setIsMetaDataSuccessModalOpen(false);
    };

    const handleMetaInputChange = useCallback(
      (field, value) => {
        modalState.setMetaFormData((prev) => ({
          ...prev,
          [field]: value,
        }));
      },
      [modalState.setMetaFormData]
    );

    return {
      handleViewMetaData,
      handleCloseMetaData,
      handleSaveMetaData,
      handleCloseMetaDataSuccess,
      handleMetaInputChange,
    };
  }, [modalState.selectedItemForMeta?.id]);

  // Optimized item action handlers with useCallback
  const itemActionHandlers = useMemo(() => {
    const handleItemAction = useCallback(
      (itemId, action, value) => {
        console.log(`${action} for item ${itemId}:`, value);

        // Check if it's a sample item (ids 1, 2, 3)
        const sampleItemIndex = sampleItems.findIndex(
          (item) => item.id === itemId
        );
        if (sampleItemIndex !== -1) {
          setSampleItems((prev) => {
            const updated = [...prev];
            updated[sampleItemIndex] = {
              ...updated[sampleItemIndex],
              [action]: value,
            };
            return updated;
          });
          return;
        }

        // Update draft items
        const draftItemIndex = state.draftItems.findIndex(
          (item) => item.id === itemId
        );
        if (draftItemIndex !== -1) {
          const updatedDrafts = [...state.draftItems];
          updatedDrafts[draftItemIndex] = {
            ...updatedDrafts[draftItemIndex],
            [action]: value,
          };
          state.setDraftItems(updatedDrafts);
          localStorage.setItem(
            "yoraa_draft_items",
            JSON.stringify(updatedDrafts)
          );
          return;
        }

        // Update published items
        const publishedItemIndex = state.publishedItems.findIndex(
          (item) => item.id === itemId
        );
        if (publishedItemIndex !== -1) {
          const updatedPublished = [...state.publishedItems];
          updatedPublished[publishedItemIndex] = {
            ...updatedPublished[publishedItemIndex],
            [action]: value,
          };
          state.setPublishedItems(updatedPublished);
          localStorage.setItem(
            "yoraa_published_items",
            JSON.stringify(updatedPublished)
          );
          return;
        }

        console.log("Item not found in any collection");
      },
      [sampleItems, state.draftItems, state.publishedItems]
    );

    return { handleItemAction };
  }, [sampleItems, state.draftItems, state.publishedItems]);

  // Optimized item lifecycle handlers with focused dependencies
  const lifecycleHandlers = useMemo(() => {
    // Make Live handlers
    const handleMakeLive = (item) => {
      modalState.setItemToMakeLive(item);
      modalState.setIsMakeLiveConfirmModalOpen(true);
    };

    const handleConfirmMakeLive = () => {
      if (modalState.itemToMakeLive) {
        const updatedItem = {
          ...modalState.itemToMakeLive,
          status: "live",
          publishedAt: new Date().toISOString(),
          id: `pub_${Date.now()}`,
        };

        // Remove from drafts
        const updatedDrafts = state.draftItems.filter(
          (item) => item.id !== modalState.itemToMakeLive.id
        );
        state.setDraftItems(updatedDrafts);
        localStorage.setItem(
          "yoraa_draft_items",
          JSON.stringify(updatedDrafts)
        );

        // Add to published items
        const updatedPublished = [...state.publishedItems, updatedItem];
        state.setPublishedItems(updatedPublished);
        localStorage.setItem(
          "yoraa_published_items",
          JSON.stringify(updatedPublished)
        );

        console.log("Making item live:", modalState.itemToMakeLive.id);
      }
      modalState.setIsMakeLiveConfirmModalOpen(false);
      modalState.setItemToMakeLive(null);
      modalState.setIsMakeLiveSuccessModalOpen(true);
    };

    const handleCancelMakeLive = () => {
      modalState.setIsMakeLiveConfirmModalOpen(false);
      modalState.setItemToMakeLive(null);
    };

    const handleCloseMakeLiveSuccess = () => {
      modalState.setIsMakeLiveSuccessModalOpen(false);
    };

    // Schedule handlers
    const handleScheduleItem = (item) => {
      modalState.setItemToSchedule(item);
      modalState.setScheduleDate("");
      modalState.setScheduleTime("");
      modalState.setIsScheduleModalOpen(true);
    };

    const handleConfirmSchedule = () => {
      if (
        modalState.itemToSchedule &&
        modalState.scheduleDate &&
        modalState.scheduleTime
      ) {
        const updatedDrafts = state.draftItems.map((item) =>
          item.id === modalState.itemToSchedule.id
            ? {
                ...item,
                status: "scheduled",
                scheduledDate: modalState.scheduleDate,
                scheduledTime: modalState.scheduleTime,
              }
            : item
        );
        state.setDraftItems(updatedDrafts);
        localStorage.setItem(
          "yoraa_draft_items",
          JSON.stringify(updatedDrafts)
        );

        console.log(
          "Scheduling item:",
          modalState.itemToSchedule.id,
          "for",
          modalState.scheduleDate,
          "at",
          modalState.scheduleTime
        );
      }
      modalState.setIsScheduleModalOpen(false);
      modalState.setItemToSchedule(null);
      modalState.setScheduleDate("");
      modalState.setScheduleTime("");
      modalState.setIsScheduleSuccessModalOpen(true);
    };

    const handleCancelSchedule = () => {
      modalState.setIsScheduleModalOpen(false);
      modalState.setItemToSchedule(null);
      modalState.setScheduleDate("");
      modalState.setScheduleTime("");
    };

    const handleCloseScheduleSuccess = () => {
      modalState.setIsScheduleSuccessModalOpen(false);
    };

    // Cancel schedule handlers
    const handleCancelScheduleItem = (item) => {
      modalState.setItemToCancelSchedule(item);
      modalState.setIsCancelScheduleConfirmModalOpen(true);
    };

    const handleConfirmCancelSchedule = () => {
      if (modalState.itemToCancelSchedule) {
        const updatedDrafts = state.draftItems.map((item) =>
          item.id === modalState.itemToCancelSchedule.id
            ? {
                ...item,
                status: "draft",
                scheduledDate: undefined,
                scheduledTime: undefined,
              }
            : item
        );
        state.setDraftItems(updatedDrafts);
        localStorage.setItem(
          "yoraa_draft_items",
          JSON.stringify(updatedDrafts)
        );

        console.log(
          "Cancelling schedule for item:",
          modalState.itemToCancelSchedule.id
        );
      }
      modalState.setIsCancelScheduleConfirmModalOpen(false);
      modalState.setItemToCancelSchedule(null);
      modalState.setIsCancelScheduleSuccessModalOpen(true);
    };

    const handleCancelCancelSchedule = () => {
      modalState.setIsCancelScheduleConfirmModalOpen(false);
      modalState.setItemToCancelSchedule(null);
    };

    const handleCloseCancelScheduleSuccess = () => {
      modalState.setIsCancelScheduleSuccessModalOpen(false);
    };

    return {
      handleMakeLive,
      handleConfirmMakeLive,
      handleCancelMakeLive,
      handleCloseMakeLiveSuccess,
      handleScheduleItem,
      handleConfirmSchedule,
      handleCancelSchedule,
      handleCloseScheduleSuccess,
      handleCancelScheduleItem,
      handleConfirmCancelSchedule,
      handleCancelCancelSchedule,
      handleCloseCancelScheduleSuccess,
    };
  }, [
    modalState.itemToMakeLive?.id,
    modalState.itemToSchedule?.id,
    modalState.scheduleDate,
    modalState.scheduleTime,
    modalState.itemToCancelSchedule?.id,
    state.draftItems.length,
    state.publishedItems.length,
  ]);

  // Memoized component renderers for better performance
  const renderHeader = useCallback(
    () => (
      <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-b from-white to-gray-50">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <h1 className="text-[24px] font-bold text-[#111111] font-['Montserrat'] tracking-tight">
            Manage Items
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={actionHandlers.handleBulkUpload}
              className="flex items-center gap-2 bg-[#000aff] hover:bg-blue-700 text-white font-['Montserrat'] font-medium py-2.5 px-5 rounded-lg transition-all duration-200 ease-in-out shadow-md border border-[#7280ff] text-[14px] hover:shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span className="leading-[20px]">Bulk Upload</span>
            </button>
            <button
              onClick={actionHandlers.handleUploadSingleProduct}
              className="flex items-center gap-2 bg-[#000aff] hover:bg-blue-700 text-white font-['Montserrat'] font-medium py-2.5 px-5 rounded-lg transition-all duration-200 ease-in-out shadow-md border border-[#7280ff] text-[14px] hover:shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span className="leading-[20px]">Upload single product</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#667085]" />
            </div>
            <input
              type="text"
              placeholder="Search"
              value={state.searchTerm}
              onChange={(e) => state.setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-[#d0d5dd] rounded-lg bg-white placeholder-[#667085] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm font-['Montserrat'] text-[16px] leading-[24px] transition-all"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-4">
            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={state.selectedCategory}
                onChange={(e) => state.setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border-2 border-black rounded-xl px-4 py-3 pr-8 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[153px] h-[47px] font-['Montserrat'] text-[14px] text-center leading-[16px] hover:border-blue-400 transition-all"
              >
                {CATEGORY_OPTIONS.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-black" />
              </div>
            </div>

            {/* Sub Category Dropdown */}
            <div className="relative">
              <select
                value={state.selectedSubCategory}
                onChange={(e) => state.setSelectedSubCategory(e.target.value)}
                className="appearance-none bg-white border-2 border-black rounded-xl px-4 py-3 pr-8 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[153px] h-[47px] font-['Montserrat'] text-[14px] text-center leading-[16px] hover:border-blue-400 transition-all"
              >
                {SUB_CATEGORY_OPTIONS.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-black" />
              </div>
            </div>

            {/* Items Dropdown */}
            <div className="relative">
              <select className="appearance-none bg-white border-2 border-black rounded-xl px-4 py-3 pr-8 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[153px] h-[47px] font-['Montserrat'] text-[14px] text-center leading-[16px] hover:border-blue-400 transition-all">
                <option>Items</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-black" />
              </div>
            </div>

            {/* Filters Button with Dropdown */}
            <div className="relative filter-dropdown">
              <button
                onClick={filterHandlers.toggleFilterDropdown}
                className="flex items-center gap-2 bg-white border border-[#d0d5dd] rounded-lg px-4 py-2.5 text-[#344054] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-[40px] font-['Montserrat'] text-[14px] shadow-sm hover:shadow-md transition-all"
              >
                <Filter className="h-5 w-5" />
                <span className="leading-[20px]">Filters</span>
              </button>

              {/* Dropdown Menu */}
              {state.isFilterDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-[274px] bg-white rounded-xl shadow-lg z-50 overflow-hidden border border-gray-100">
                  <div className="px-[27px] py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-[14px] font-medium text-[#555] font-['Montserrat'] uppercase tracking-wide">
                      Choose sort by
                    </p>
                  </div>

                  <div className="py-2">
                    <button
                      onClick={() =>
                        filterHandlers.handleFilterOption("all_live")
                      }
                      className={`w-full px-8 py-2 text-left hover:bg-gray-50 transition-colors ${
                        state.statusFilter === "live"
                          ? "bg-blue-50 text-blue-600"
                          : "text-[#000000]"
                      }`}
                    >
                      <span className="text-[15px] font-medium font-['Montserrat']">
                        View all live
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        filterHandlers.handleFilterOption("all_scheduled")
                      }
                      className={`w-full px-8 py-2 text-left hover:bg-gray-50 transition-colors ${
                        state.statusFilter === "scheduled"
                          ? "bg-blue-50 text-blue-600"
                          : "text-[#010101]"
                      }`}
                    >
                      <span className="text-[14px] font-medium font-['Montserrat']">
                        View all scheduled
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        filterHandlers.handleFilterOption("all_drafts")
                      }
                      className={`w-full px-8 py-2 text-left hover:bg-gray-50 transition-colors ${
                        state.statusFilter === "draft"
                          ? "bg-blue-50 text-blue-600"
                          : "text-[#010101]"
                      }`}
                    >
                      <span className="text-[14px] font-medium font-['Montserrat']">
                        View all drafts
                      </span>
                    </button>

                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={() =>
                          filterHandlers.handleFilterOption("clear_filters")
                        }
                        className="w-full px-8 py-2 text-left hover:bg-gray-50 transition-colors text-[#010101]"
                      >
                        <span className="text-[14px] font-medium font-['Montserrat']">
                          Clear all filters
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    [
      actionHandlers,
      state.searchTerm,
      state.selectedCategory,
      state.selectedSubCategory,
      state.isFilterDropdownOpen,
      state.statusFilter,
      filterHandlers,
    ]
  );

  // Memoized statistics calculations
  const statistics = useMemo(() => {
    const draftsCount = allItems.filter(
      (item) => item.status === "draft"
    ).length;
    const liveCount = allItems.filter((item) => item.status === "live").length;
    const scheduledCount = allItems.filter(
      (item) => item.status === "scheduled"
    ).length;
    const totalCount = allItems.length;

    return { draftsCount, liveCount, scheduledCount, totalCount };
  }, []);

  const renderFilterSummary = useCallback(
    () => (
      <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-lg font-bold text-[#111111] font-['Montserrat'] tracking-tight">
              Showing {filteredItems.length} items
            </span>

            {(state.showDraftsOnly ||
              state.showLiveOnly ||
              state.showScheduledOnly) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-[#666666] font-['Montserrat']">
                  Filtered by:
                </span>
                {state.showDraftsOnly && (
                  <span className="bg-[#ef3826] text-white text-xs font-medium font-['Montserrat'] px-3 py-1 rounded-full shadow-sm">
                    Draft Items
                  </span>
                )}
                {state.showLiveOnly && (
                  <span className="bg-[#22c55e] text-white text-xs font-medium font-['Montserrat'] px-3 py-1 rounded-full shadow-sm">
                    Live Items
                  </span>
                )}
                {state.showScheduledOnly && (
                  <span className="bg-[#eab308] text-white text-xs font-medium font-['Montserrat'] px-3 py-1 rounded-full shadow-sm">
                    Scheduled Items
                  </span>
                )}
              </div>
            )}
          </div>

          {(state.showDraftsOnly ||
            state.showLiveOnly ||
            state.showScheduledOnly) && (
            <button
              onClick={filterHandlers.clearAllFilters}
              className="bg-white hover:bg-gray-100 text-sm text-[#666666] hover:text-[#111111] font-['Montserrat'] px-4 py-1.5 rounded-md border border-gray-300 transition-all duration-150 shadow-sm hover:shadow-md"
              title="Alt + C to clear filters"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="flex items-center gap-6 text-sm font-['Montserrat'] flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-[#ef3826] rounded-full shadow-sm"></span>
            <span className="text-[#666666]">
              Drafts:{" "}
              <span className="font-medium text-[#111111]">
                {statistics.draftsCount}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-[#22c55e] rounded-full shadow-sm"></span>
            <span className="text-[#666666]">
              Live:{" "}
              <span className="font-medium text-[#111111]">
                {statistics.liveCount}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-[#eab308] rounded-full shadow-sm"></span>
            <span className="text-[#666666]">
              Scheduled:{" "}
              <span className="font-medium text-[#111111]">
                {statistics.scheduledCount}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-[#6b7280] rounded-full shadow-sm"></span>
            <span className="text-[#666666]">
              Total:{" "}
              <span className="font-medium text-[#111111]">
                {statistics.totalCount}
              </span>
            </span>
          </div>
        </div>
      </div>
    ),
    [
      filteredItems.length,
      state.showDraftsOnly,
      state.showLiveOnly,
      state.showScheduledOnly,
    ]
  );

  // Memoized item row component for better performance
  const ItemRow = memo(({ item, index }) => (
    <React.Fragment key={item.id}>
      <tr className="even:bg-gray-50 odd:bg-white hover:bg-gray-100 transition-colors duration-200">
        {/* Product Image */}
        <td className="px-4 py-3 text-center">
          <div className="flex justify-center">
            <div className="w-[120px] h-[116px] bg-gray-200 rounded-md overflow-hidden shadow-inner hover:scale-105 transition-transform duration-200">
              <img
                src={item.image}
                alt={item.productName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </td>

        {/* Product Name */}
        <td className="px-4 py-3 text-center">
          <div className="text-gray-800 text-[14px] font-semibold font-['Montserrat'] tracking-wide">
            {item.productName}
          </div>
        </td>

        {/* Category */}
        <td className="px-4 py-3 text-center">
          <div className="text-gray-800 text-[14px] font-medium font-['Montserrat'] tracking-wide">
            {item.category}
          </div>
        </td>

        {/* Sub Categories */}
        <td className="px-4 py-3 text-center">
          <div className="text-gray-800 text-[14px] font-medium font-['Montserrat'] tracking-wide">
            {item.subCategories}
          </div>
        </td>

        {/* HSN */}
        <td className="px-4 py-3 text-center">
          <div className="text-gray-700 text-[12px] font-medium font-['Montserrat']">
            {item.hsn}
          </div>
        </td>

        {/* Size */}
        <td className="px-4 py-3 text-center">
          <div className="flex flex-col gap-1 text-[12px] font-medium text-gray-700 font-['Montserrat']">
            {item.size.map((size, idx) => (
              <div key={idx}>{size}</div>
            ))}
          </div>
        </td>

        {/* Quantity */}
        <td className="px-4 py-3 text-center">
          <div className="text-gray-800 text-[14px] font-medium font-['Montserrat']">
            {item.quantity}
          </div>
        </td>

        {/* Price */}
        <td className="px-4 py-3 text-center">
          <div className="text-gray-700 text-[12px] font-medium font-['Montserrat']">
            {item.price}
          </div>
        </td>

        {/* Sale Price */}
        <td className="px-4 py-3 text-center">
          <div className="text-gray-700 text-[12px] font-medium font-['Montserrat']">
            {item.salePrice}
          </div>
        </td>

        {/* Platform Prices */}
        <td className="px-4 py-3 text-center">
          <div className="grid grid-cols-4 gap-3 text-center text-[10px] font-medium font-['Montserrat']">
            <div>
              {item.platforms.myntra.enabled
                ? item.platforms.myntra.price
                : "-"}
            </div>
            <div>
              {item.platforms.amazon.enabled
                ? item.platforms.amazon.price
                : "-"}
            </div>
            <div>
              {item.platforms.flipkart.enabled
                ? item.platforms.flipkart.price
                : "-"}
            </div>
            <div>
              {item.platforms.nykaa.enabled ? item.platforms.nykaa.price : "-"}
            </div>
          </div>
        </td>

        {/* SKU */}
        <td className="px-4 py-3 text-center">
          <div className="text-gray-700 text-[12px] font-medium font-['Montserrat']">
            <div className="flex flex-col gap-1">
              {item.size.map((size, idx) => (
                <div key={idx} className="text-[10px]">
                  {item.skus[size]}
                </div>
              ))}
            </div>
          </div>
        </td>

        {/* Barcode */}
        <td className="px-4 py-3 text-center">
          <div className="text-gray-700 text-[12px] font-medium font-['Montserrat']">
            {item.barcodeNo}
          </div>
        </td>

        {/* Status */}
        <td className="px-4 py-3 text-center">
          <span
            className={`${utils.getStatusStyle(
              item.status
            )} text-[14px] font-semibold font-['Montserrat'] rounded-full px-3 py-1`}
          >
            {item.status}
          </span>
          {item.status === "scheduled" &&
            item.scheduledDate &&
            item.scheduledTime && (
              <div className="text-[10px] text-gray-500 mt-1 font-['Montserrat']">
                {utils.formatScheduledDateTime(
                  item.scheduledDate,
                  item.scheduledTime
                )}
              </div>
            )}
        </td>

        {/* Meta Data */}
        <td className="px-4 py-3 text-center">
          <button
            onClick={() => metaDataHandlers.handleViewMetaData(item)}
            className="bg-black text-white text-[12px] font-medium font-['Montserrat'] px-3 py-1 rounded-md hover:bg-gray-800 transition-colors"
          >
            View Meta Data
          </button>
        </td>

        {/* Action */}
        <td className="px-4 py-3 text-center">
          <div className="flex justify-center gap-2">
            {item.status === "draft" ? (
              <>
                <button
                  onClick={() => lifecycleHandlers.handleMakeLive(item)}
                  className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-md hover:bg-green-600 transition-colors"
                >
                  Make Live
                </button>
                <button
                  onClick={() => lifecycleHandlers.handleScheduleItem(item)}
                  className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-md hover:bg-blue-600 transition-colors"
                >
                  Schedule
                </button>
              </>
            ) : item.status === "scheduled" ? (
              <>
                <button
                  onClick={() => lifecycleHandlers.handleMakeLive(item)}
                  className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-md hover:bg-green-600 transition-colors"
                >
                  Make Live
                </button>
                <button
                  onClick={() =>
                    lifecycleHandlers.handleCancelScheduleItem(item)
                  }
                  className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-md hover:bg-red-600 transition-colors"
                >
                  Cancel Schedule
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => actionHandlers.handleEdit(item.id)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteHandlers.handleDelete(item.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>

      {/* Row-level Bulk Actions - Additional row */}
      <tr className="bg-gray-50 border-t border-gray-200">
        <td colSpan="15" className="px-4 py-2">
          <div className="text-[12px] font-['Montserrat'] transition-all duration-200">
            <div className="flex items-center gap-8">
              <div
                className={`flex items-center gap-2 ${
                  item.moveToSale ? "bg-blue-50 p-2 rounded-md transition" : ""
                }`}
              >
                <input
                  type="checkbox"
                  id={`move-to-sale-${item.id}`}
                  checked={item.moveToSale}
                  onChange={(e) =>
                    itemActionHandlers.handleItemAction(
                      item.id,
                      "moveToSale",
                      e.target.checked
                    )
                  }
                  className="w-4 h-4 rounded-[3px] border-[#bcbcbc] text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <label
                  htmlFor={`move-to-sale-${item.id}`}
                  className={`${
                    item.moveToSale ? "text-blue-700 font-medium" : "text-black"
                  }`}
                >
                  move to sale
                </label>
              </div>

              <div
                className={`flex items-center gap-2 ${
                  item.keepCopyAndMove
                    ? "bg-green-50 p-2 rounded-md transition"
                    : ""
                }`}
              >
                <input
                  type="checkbox"
                  id={`keep-copy-${item.id}`}
                  checked={item.keepCopyAndMove}
                  onChange={(e) =>
                    itemActionHandlers.handleItemAction(
                      item.id,
                      "keepCopyAndMove",
                      e.target.checked
                    )
                  }
                  className="w-4 h-4 rounded-[3px] border-[#bcbcbc] text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <label
                  htmlFor={`keep-copy-${item.id}`}
                  className={`${
                    item.keepCopyAndMove
                      ? "text-green-700 font-medium"
                      : "text-black"
                  }`}
                >
                  make a copy and move to sale
                </label>
              </div>

              <div
                className={`flex items-center gap-2 ${
                  item.moveToEyx ? "bg-purple-50 p-2 rounded-md transition" : ""
                }`}
              >
                <input
                  type="checkbox"
                  id={`move-to-eyx-${item.id}`}
                  checked={item.moveToEyx}
                  onChange={(e) =>
                    itemActionHandlers.handleItemAction(
                      item.id,
                      "moveToEyx",
                      e.target.checked
                    )
                  }
                  className="w-4 h-4 rounded-[3px] border-[#bcbcbc] text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <label
                  htmlFor={`move-to-eyx-${item.id}`}
                  className={`${
                    item.moveToEyx
                      ? "text-purple-700 font-medium"
                      : "text-black"
                  }`}
                >
                  move to eyx
                </label>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </React.Fragment>
  ));

  ItemRow.displayName = "ItemRow";

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="w-full">
        {renderHeader()}

        {/* Table Section */}
        <div className="px-6 py-6">
          {renderFilterSummary()}

          {/* Table Container */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full min-w-[1350px]">
              {/* Table Header */}
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-4 py-3 text-[14px] font-semibold text-gray-800 font-['Montserrat'] text-center tracking-wide">
                    Image
                  </th>
                  <th className="px-4 py-3 text-[14px] font-semibold text-gray-800 font-['Montserrat'] text-center tracking-wide min-w-[180px]">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-[14px] font-semibold text-gray-800 font-['Montserrat'] text-center tracking-wide min-w-[100px]">
                    Category
                  </th>
                  <th className="px-4 py-3 text-[14px] font-semibold text-gray-800 font-['Montserrat'] text-center tracking-wide min-w-[120px]">
                    Subcategory
                  </th>
                  <th className="px-4 py-3 text-[14px] font-semibold text-gray-800 font-['Montserrat'] text-center tracking-wide min-w-[80px]">
                    HSN
                  </th>
                  <th className="px-4 py-3 text-[14px] font-semibold text-gray-800 font-['Montserrat'] text-center tracking-wide min-w-[80px]">
                    Size
                  </th>
                  <th className="px-4 py-3 text-[14px] font-semibold text-gray-800 font-['Montserrat'] text-center tracking-wide min-w-[80px]">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-[14px] font-semibold text-gray-800 font-['Montserrat'] text-center tracking-wide min-w-[80px]">
                    Price
                  </th>
                  <th className="px-4 py-3 text-[14px] font-semibold text-gray-800 font-['Montserrat'] text-center tracking-wide min-w-[80px]">
                    Sale Price
                  </th>
                  <th className="px-4 py-3 text-[14px] font-semibold text-gray-800 font-['Montserrat'] text-center tracking-wide min-w-[200px]">
                    Alternate Price
                  </th>
                  <th className="px-4 py-3 text-[14px] font-semibold text-gray-800 font-['Montserrat'] text-center tracking-wide min-w-[120px]">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-[14px] font-semibold text-gray-800 font-['Montserrat'] text-center tracking-wide min-w-[120px]">
                    Barcode No.
                  </th>
                  <th className="px-4 py-3 text-[14px] font-semibold text-gray-800 font-['Montserrat'] text-center tracking-wide min-w-[80px]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[14px] font-semibold text-gray-800 font-['Montserrat'] text-center tracking-wide min-w-[120px]">
                    Meta Data
                  </th>
                  <th className="px-4 py-3 text-[14px] font-semibold text-gray-800 font-['Montserrat'] text-center tracking-wide min-w-[120px]">
                    Action
                  </th>
                </tr>
                {/* Platform Headers Row */}
                <tr className="bg-white border-b border-gray-200">
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-4 text-[10px] font-medium font-['Montserrat'] text-gray-600">
                      {["myntra", "amazon", "flipkart", "nykaa"].map(
                        (platform) => (
                          <div
                            key={platform}
                            className="flex flex-col items-center gap-1"
                          >
                            <span className="text-green-600 text-lg leading-none">
                              ✓
                            </span>
                            <span className="capitalize">{platform}</span>
                          </div>
                        )
                      )}
                    </div>
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item, index) => (
                  <ItemRow key={item.id} item={item} index={index} />
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg font-semibold mb-2">No items found</p>
                <p className="text-sm">
                  {state.searchTerm ||
                  state.selectedCategory !== "All categories" ||
                  state.selectedSubCategory !== "All subcategories"
                    ? "Try adjusting your search or filters"
                    : "Start by uploading your first product"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* All Modal Components */}
        {renderModals()}
      </div>
    </div>
  );

  // Modal rendering function
  function renderModals() {
    return (
      <>
        {/* Edit Item Modal */}
        {modalState.isEditModalOpen && modalState.editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full mx-4 overflow-hidden max-h-screen overflow-y-auto">
              {/* Modal Header */}
              <div className="relative px-8 py-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 font-['Montserrat'] text-center">
                  Edit Item
                </h2>
                <button
                  onClick={actionHandlers.handleCloseEdit}
                  className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                {/* Header Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 font-['Montserrat']">
                    Type new details
                  </h3>
                </div>

                {/* Main Form Row */}
                <div className="mb-8">
                  <div className="flex items-start gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="text-center mb-2">
                        <span className="text-sm font-medium text-gray-700 font-['Montserrat']">
                          Image
                        </span>
                      </div>
                      <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden border">
                        <img
                          src={modalState.editingItem.image}
                          alt={modalState.editingItem.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Product Name */}
                    <div className="flex-shrink-0 w-40">
                      <div className="text-center mb-2">
                        <span className="text-sm font-medium text-gray-700 font-['Montserrat']">
                          Product Name
                        </span>
                      </div>
                      <input
                        type="text"
                        defaultValue={modalState.editingItem.productName}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-['Montserrat'] focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Other form fields would continue here - shortened for brevity */}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={actionHandlers.handleSaveEdit}
                    className="bg-black hover:bg-gray-800 text-white font-['Montserrat'] font-medium py-3 px-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    save
                  </button>
                  <button
                    onClick={actionHandlers.handleCloseEdit}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-['Montserrat'] font-medium py-3 px-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                  >
                    go back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {modalState.isSuccessModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 relative">
              {/* Close Button */}
              <button
                onClick={actionHandlers.handleCloseSuccess}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Content */}
              <div className="p-8 text-center">
                {/* Success Message */}
                <h2 className="text-lg font-bold text-black mb-8 leading-tight font-['Montserrat']">
                  Item Details updated successfully!
                </h2>

                {/* Done Button */}
                <button
                  onClick={actionHandlers.handleCloseSuccess}
                  className="bg-black hover:bg-gray-800 text-white font-['Montserrat'] font-semibold py-3 px-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 min-w-[120px]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Meta Data Modal */}
        {modalState.isMetaDataModalOpen && modalState.selectedItemForMeta && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] max-w-[869px] w-full mx-4 relative">
              {/* Close Button */}
              <button
                onClick={metaDataHandlers.handleCloseMetaData}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Content */}
              <div className="p-8 relative">
                {/* Header */}
                <div className="text-center mb-6">
                  <p className="font-['Montserrat'] font-medium text-[#bfbfbf] text-[14px] leading-[1.2]">
                    Meta Data
                  </p>
                </div>

                {/* Divider Line */}
                <div className="w-full h-px bg-gray-300 mb-6"></div>

                {/* Meta Title */}
                <div className="mb-8">
                  <label className="block font-['Montserrat'] font-bold text-[#111111] text-[20px] leading-[24px] mb-4">
                    meta title
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={modalState.metaFormData.metaTitle}
                      onChange={(e) =>
                        metaDataHandlers.handleMetaInputChange(
                          "metaTitle",
                          e.target.value
                        )
                      }
                      className="w-full h-[41px] px-4 py-2 border-2 border-black rounded-xl font-['Montserrat'] text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter meta title"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={metaDataHandlers.handleSaveMetaData}
                    className="bg-black hover:bg-gray-800 text-white font-['Montserrat'] font-medium py-4 px-[51px] rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 w-[284px] text-[16px] leading-[1.2]"
                  >
                    save
                  </button>
                  <button
                    onClick={metaDataHandlers.handleCloseMetaData}
                    className="bg-white hover:bg-gray-50 text-black font-['Montserrat'] font-medium py-4 px-[51px] rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 w-[284px] text-[16px] leading-[1.2] border border-[#e4e4e4]"
                  >
                    go back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {modalState.isDeleteConfirmModalOpen && modalState.itemToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] max-w-sm w-full mx-4 relative">
              {/* Modal Content */}
              <div className="p-8 text-center relative">
                {/* Confirmation Message */}
                <h2 className="text-[18px] font-bold text-black mb-8 leading-[22px] font-['Montserrat'] tracking-[-0.41px] px-4">
                  Are you sure you want to delete this item
                </h2>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={deleteHandlers.handleConfirmDelete}
                    className="bg-black hover:bg-gray-800 text-white font-['Montserrat'] font-semibold py-3 px-8 rounded-3xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 w-[149px] h-12 text-[16px] leading-[1.406]"
                  >
                    yes
                  </button>
                  <button
                    onClick={deleteHandlers.handleCancelDelete}
                    className="bg-white hover:bg-gray-50 text-black font-['Montserrat'] font-medium py-3 px-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 w-[209px] text-[16px] leading-[1.2] border border-[#e4e4e4]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Item Modal */}
        {modalState.isScheduleModalOpen && modalState.itemToSchedule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] max-w-md w-full mx-4 relative">
              {/* Modal Content */}
              <div className="p-8 relative">
                {/* Header */}
                <h2 className="text-[24px] font-bold text-black mb-8 leading-[29px] font-['Montserrat'] text-center">
                  Schedule Item for Later
                </h2>

                {/* Form Fields */}
                <div className="space-y-6 mb-8">
                  <div>
                    <input
                      type="date"
                      value={modalState.scheduleDate}
                      onChange={(e) =>
                        modalState.setScheduleDate(e.target.value)
                      }
                      className="w-full h-[50px] px-4 py-3 border border-gray-300 rounded-lg font-['Montserrat'] text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="time"
                      value={modalState.scheduleTime}
                      onChange={(e) =>
                        modalState.setScheduleTime(e.target.value)
                      }
                      className="w-full h-[50px] px-4 py-3 border border-gray-300 rounded-lg font-['Montserrat'] text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={lifecycleHandlers.handleConfirmSchedule}
                    disabled={
                      !modalState.scheduleDate || !modalState.scheduleTime
                    }
                    className="bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-['Montserrat'] font-medium py-4 px-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-[16px] leading-[1.2]"
                  >
                    schedule now
                  </button>
                  <button
                    onClick={lifecycleHandlers.handleCancelSchedule}
                    className="bg-white hover:bg-gray-50 text-black font-['Montserrat'] font-medium py-4 px-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 text-[16px] leading-[1.2] border border-[#e4e4e4]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
});

ManageItems.displayName = "ManageItems";

export default ManageItems;
