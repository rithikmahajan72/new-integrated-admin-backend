import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Upload,
  Plus,
  ChevronDown,
  X,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DEFAULT_VARIANT,
  DEFAULT_PRODUCT_DATA,
  validateImageFile,
} from "../constants";
import UploadProgressLoader from "../components/UploadProgressLoader";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import {
  createProduct,
  updateProduct,
  selectCreateLoading,
  selectUpdateLoading,
  selectSuccessMessage,
  selectProductsError,
  clearSuccessMessage,
  clearError,
} from "../store/slices/productsSlice";
import {
  fetchCategories,
} from "../store/slices/categoriesSlice";
import {
  fetchSubCategories,
  fetchCategoriesForSubCategory,
} from "../store/slices/subCategoriesSlice";
import {
  fetchFilters,
  setColorFilter,
  setSizeFilter,
  setBrandFilter,
  setCategoryFilter,
  setSubcategoryFilter,
  selectAvailableFilters,
  selectAppliedFilters,
  selectFilterLoading,
  selectFilterError,
} from "../store/slices/filtersSlice";

// Constants for better maintainability
const NOTIFICATION_TYPES = {
  WARNING: "warning",
  INFO: "info",
  ERROR: "error",
  SUCCESS: "success",
};

const STOCK_SIZE_OPTIONS = {
  NO_SIZE: "noSize",
  SIZES: "sizes",
  IMPORT: "import",
};

const UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE_MB: 100,
  MAX_IMAGE_SIZE_MB: 10,
  INITIAL_IMAGE_SLOTS: 5,
  MIN_IMAGES_BEFORE_SLOT_ADD: 4,
  UPLOAD_SIMULATION_INTERVAL: 200,
  UPLOAD_SIMULATION_DURATION: 2500,
  FAILURE_SIMULATION_RATE: 0.1,
};

/**
 * SingleProductUpload Component
 *
 * Comprehensive product upload form providing:
 * - Multi-variant product creation with nested options
 * - Image/video upload with progress tracking
 * - Size chart management (common and variant-specific)
 * - Category and subcategory selection
 * - Price and inventory management
 * - Dynamic "Also Show In" options with permanent storage
 * - Excel import functionality
 * - Real-time validation and notifications
 *
 * Performance Optimizations:
 * - useCallback for all event handlers to prevent re-renders
 * - useMemo for computed values
 * - Efficient state management with proper updates
 * - Lazy loading for images
 * - Optimized file validation and upload simulation
 */

const SingleProductUpload = React.memo(() => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const createLoading = useSelector(selectCreateLoading);
  const updateLoading = useSelector(selectUpdateLoading);
  const successMessage = useSelector(selectSuccessMessage);
  const error = useSelector(selectProductsError);
  const categories = useSelector(state => state.categories.categories);
  const subCategories = useSelector(state => state.subCategories.subCategories);
  const categoriesLoading = useSelector(state => state.categories.categoriesLoading);
  const subCategoriesLoading = useSelector(state => state.subCategories.subCategoriesLoading);
  
  // Filter Redux state
  const availableFilters = useSelector(selectAvailableFilters);
  const appliedFilters = useSelector(selectAppliedFilters);
  const filterLoading = useSelector(selectFilterLoading);
  const filterError = useSelector(selectFilterError);

  // Check authentication
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const isAdmin = useMemo(() => user?.isAdmin === true, [user?.isAdmin]);

  // ==============================
  // CORE PRODUCT DATA STATE
  // ==============================
  const [productData, setProductData] = useState(DEFAULT_PRODUCT_DATA);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  // ==============================
  // FILTER STATE MANAGEMENT
  // ==============================
  const [productFilters, setProductFilters] = useState({
    color: [],
    size: [],
    brand: [],
    material: [],
    style: [],
    gender: [],
    season: []
  });
  const [selectedFilters, setSelectedFilters] = useState({
    color: '',
    size: '',
    brand: '',
    material: '',
    style: '',
    gender: '',
    season: ''
  });

  // ==============================
  // VARIANTS AND MEDIA STATE
  // ==============================
  const [variants, setVariants] = useState([
    {
      ...DEFAULT_VARIANT,
      id: 1,
      name: "Variant 1",
      images: [],
      videos: [],
      maxImageSlots: UPLOAD_CONSTANTS.INITIAL_IMAGE_SLOTS,
      uploadStatus: {
        images: [], // Array of {id, status: 'uploading'|'success'|'failed', progress: 0-100}
        videos: [],
      },
      filters: {
        color: '',
        size: '',
        brand: '',
        material: '',
        style: '',
        gender: '',
        season: ''
      },
    },
  ]);
  const [variantCount, setVariantCount] = useState(1);
  const [nestingOptions, setNestingOptions] = useState({});
  const [additionalSlotsEnabled, setAdditionalSlotsEnabled] = useState({});

  // ==============================
  // SIZE CHART AND INVENTORY STATE
  // ==============================
  const [sizeChart, setSizeChart] = useState({
    inchChart: null,
    cmChart: null,
    measurementImage: null,
  });
  const [commonSizeChart, setCommonSizeChart] = useState({
    cmChart: null,
    inchChart: null,
    measurementGuide: null,
    uploadStatus: {
      cmChart: null,
      inchChart: null,
      measurementGuide: null,
    },
  });
  const [stockSizeOption, setStockSizeOption] = useState(
    STOCK_SIZE_OPTIONS.SIZES
  );
  const [customSizes, setCustomSizes] = useState([]);
  const [excelFile, setExcelFile] = useState(null);

  // ==============================
  // ALSO SHOW IN OPTIONS STATE
  // ==============================
  const [alsoShowInOptions, setAlsoShowInOptions] = useState({
    youMightAlsoLike: { value: "no" },
    similarItems: { value: "no" },
    othersAlsoBought: { value: "no" },
  });
  const [dynamicAlsoShowInOptions, setDynamicAlsoShowInOptions] = useState([
    { id: "youMightAlsoLike", label: "You Might Also Like", value: "no" },
    { id: "similarItems", label: "Similar Items", value: "no" },
    { id: "othersAlsoBought", label: "Others Also Bought", value: "no" },
  ]);

  // ==============================
  // PERMANENT OPTIONS STATE
  // ==============================
  const [permanentOptions, setPermanentOptions] = useState([]);
  const [showPermanentConfirmModal, setShowPermanentConfirmModal] =
    useState(false);
  const [showPermanentSuccessModal, setShowPermanentSuccessModal] =
    useState(false);
  const [selectedOptionForPermanent, setSelectedOptionForPermanent] =
    useState(null);
  const [showEditPermanentModal, setShowEditPermanentModal] = useState(false);
  const [editingPermanentOption, setEditingPermanentOption] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deletingPermanentOption, setDeletingPermanentOption] = useState(null);

  // ==============================
  // UI STATE AND MODALS
  // ==============================
  const [isRecheckDropdownOpen, setIsRecheckDropdownOpen] = useState(false);
  const [showDetailedReviewModal, setShowDetailedReviewModal] = useState(false);
  const [selectedRecheckOption, setSelectedRecheckOption] =
    useState("All DETAILS");
  const [notification, setNotification] = useState(null);

  // ==============================
  // SCHEDULING MODAL STATE
  // ==============================
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // ==============================
  // REFS
  // ==============================
  const recheckDropdownRef = useRef(null);

  // ==============================
  // UTILITY FUNCTIONS
  // ==============================

  // Notification helper
  const showNotification = useCallback(
    (message, type = NOTIFICATION_TYPES.INFO, duration = 3000) => {
      setNotification({ message, type, duration });
    },
    []
  );

  // ==============================
  // EFFECTS AND LIFECYCLE
  // ==============================

  // Fetch categories on component mount
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      dispatch(fetchCategories());
    }
  }, [dispatch, isAuthenticated, isAdmin]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (selectedCategory && selectedCategory !== "") {
      dispatch(fetchSubCategories(selectedCategory));
    } else {
      dispatch(fetchSubCategories());
    }
  }, [selectedCategory, dispatch]);

  // Fetch filters on component mount
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      dispatch(fetchFilters());
    }
  }, [dispatch, isAuthenticated, isAdmin]);

  // Handle success messages
  useEffect(() => {
    if (successMessage) {
      showNotification(successMessage, NOTIFICATION_TYPES.SUCCESS);
      dispatch(clearSuccessMessage());
      
      // Navigate to ManageItems after successful creation/update
      if (successMessage.includes('created') || successMessage.includes('updated')) {
        setTimeout(() => {
          navigate('/manage-items');
        }, 2000);
      }
    }
  }, [successMessage, dispatch, showNotification, navigate]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showNotification(error, NOTIFICATION_TYPES.ERROR);
      dispatch(clearError());
    }
  }, [error, dispatch, showNotification]);

  // Notification auto-dismiss effect
  useEffect(() => {
    if (notification && notification.duration) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Permanent options localStorage management
  useEffect(() => {
    const savedPermanentOptions = localStorage.getItem(
      "yoraa_permanent_options"
    );
    if (savedPermanentOptions) {
      try {
        const parsed = JSON.parse(savedPermanentOptions);
        setPermanentOptions(parsed);

        // Add permanent options to dynamicAlsoShowInOptions if not already there
        setDynamicAlsoShowInOptions((prev) => {
          const existingIds = prev.map((opt) => opt.id);
          const newOptions = parsed.filter(
            (opt) => !existingIds.includes(opt.id)
          );
          return [
            ...prev,
            ...newOptions.map((opt) => ({ ...opt, isPermanent: true })),
          ];
        });

        // Initialize alsoShowInOptions for permanent options
        setAlsoShowInOptions((prev) => {
          const newOptions = { ...prev };
          parsed.forEach((opt) => {
            if (!newOptions[opt.id]) {
              newOptions[opt.id] = { value: "no" };
            }
          });
          return newOptions;
        });
      } catch (error) {
        console.error("Error loading permanent options:", error);
      }
    }
  }, []);

  // Save permanent options to localStorage
  useEffect(() => {
    if (permanentOptions.length > 0) {
      localStorage.setItem(
        "yoraa_permanent_options",
        JSON.stringify(permanentOptions)
      );
    }
  }, [permanentOptions]);

  // Click outside handler for recheck dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        recheckDropdownRef.current &&
        !recheckDropdownRef.current.contains(event.target)
      ) {
        setIsRecheckDropdownOpen(false);
      }
    };

    if (isRecheckDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isRecheckDropdownOpen]);

  // File validation helpers
  const validateVideoFile = useCallback((file) => {
    const allowedVideoTypes = [
      "video/mp4",
      "video/mov",
      "video/avi",
      "video/wmv",
      "video/flv",
      "video/webm",
      "video/mkv",
      "video/m4v",
      "video/3gp",
      "video/ogv",
      "application/octet-stream", // For .blend files
    ];
    const allowedExtensions = [
      ".mp4",
      ".mov",
      ".avi",
      ".wmv",
      ".flv",
      ".webm",
      ".mkv",
      ".m4v",
      ".3gp",
      ".ogv",
      ".blend",
    ];

    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));
    const isValidType =
      allowedVideoTypes.includes(file.type) ||
      allowedExtensions.includes(fileExtension);
    const isValidSize =
      file.size <= UPLOAD_CONSTANTS.MAX_FILE_SIZE_MB * 1024 * 1024;

    return {
      valid: isValidType && isValidSize,
      error: !isValidType ? "Invalid file type" : "File too large",
    };
  }, []);

  // Upload simulation helper
  const simulateUpload = useCallback((fileData, variantId, type) => {
    const interval = setInterval(() => {
      setVariants((prev) =>
        prev.map((variant) => {
          if (variant.id === variantId) {
            const updatedStatus = variant.uploadStatus[type].map((status) => {
              if (status.id === fileData.id && status.progress < 100) {
                const newProgress = Math.min(
                  status.progress + Math.random() * 25,
                  100
                );
                return {
                  ...status,
                  progress: newProgress,
                  status: newProgress >= 100 ? "success" : "uploading",
                };
              }
              return status;
            });

            return {
              ...variant,
              uploadStatus: {
                ...variant.uploadStatus,
                [type]: updatedStatus,
              },
            };
          }
          return variant;
        })
      );
    }, UPLOAD_CONSTANTS.UPLOAD_SIMULATION_INTERVAL);

    // Clear interval and potentially simulate failure
    setTimeout(() => {
      clearInterval(interval);
      // Randomly simulate upload failures
      if (Math.random() < UPLOAD_CONSTANTS.FAILURE_SIMULATION_RATE) {
        setVariants((prev) =>
          prev.map((variant) => {
            if (variant.id === variantId) {
              const updatedStatus = variant.uploadStatus[type].map((status) =>
                status.id === fileData.id
                  ? { ...status, status: "failed", progress: 0 }
                  : status
              );
              return {
                ...variant,
                uploadStatus: {
                  ...variant.uploadStatus,
                  [type]: updatedStatus,
                },
              };
            }
            return variant;
          })
        );
      }
    }, UPLOAD_CONSTANTS.UPLOAD_SIMULATION_DURATION);
  }, []);

  // ==============================
  // CORE DATA HANDLERS
  // ==============================

  const handleProductDataChange = useCallback((field, value) => {
    setProductData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleVariantChange = useCallback((variantId, field, value) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId ? { ...variant, [field]: value } : variant
      )
    );
  }, []);

  // ==============================
  // FILTER HANDLERS
  // ==============================
  const handleFilterSelect = useCallback((filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));

    // Update product filters
    setProductFilters(prev => {
      const currentFilters = prev[filterType] || [];
      const isSelected = currentFilters.includes(value);
      
      return {
        ...prev,
        [filterType]: isSelected 
          ? currentFilters.filter(f => f !== value)
          : [...currentFilters, value]
      };
    });

    // Dispatch to Redux for global state
    switch(filterType) {
      case 'color':
        dispatch(setColorFilter(value));
        break;
      case 'size':
        dispatch(setSizeFilter(value));
        break;
      case 'brand':
        dispatch(setBrandFilter(value));
        break;
      default:
        break;
    }
  }, [dispatch]);

  const handleClearFilters = useCallback(() => {
    setSelectedFilters({
      color: '',
      size: '',
      brand: '',
      material: '',
      style: '',
      gender: '',
      season: ''
    });
    
    setProductFilters({
      color: [],
      size: [],
      brand: [],
      material: [],
      style: [],
      gender: [],
      season: []
    });
  }, []);

  // Variant-specific filter handlers
  const handleVariantFilterSelect = useCallback((variantId, filterType, value) => {
    setVariants(prev => 
      prev.map(variant =>
        variant.id === variantId
          ? {
              ...variant,
              filters: {
                ...variant.filters,
                [filterType]: value
              }
            }
          : variant
      )
    );
  }, []);

  const handleVariantClearFilters = useCallback((variantId) => {
    setVariants(prev => 
      prev.map(variant =>
        variant.id === variantId
          ? {
              ...variant,
              filters: {
                color: '',
                size: '',
                brand: '',
                material: '',
                style: '',
                gender: '',
                season: ''
              }
            }
          : variant
      )
    );
  }, []);

  const addMoreVariants = useCallback(() => {
    const newVariantCount = variantCount + 1;
    const newVariant = {
      ...DEFAULT_VARIANT,
      id: Date.now(),
      name: `Variant ${newVariantCount}`,
      images: [],
      videos: [],
      maxImageSlots: UPLOAD_CONSTANTS.INITIAL_IMAGE_SLOTS,
      uploadStatus: {
        images: [],
        videos: [],
      },
      filters: {
        color: '',
        size: '',
        brand: '',
        material: '',
        style: '',
        gender: '',
        season: ''
      },
    };
    setVariants((prev) => [...prev, newVariant]);
    setVariantCount(newVariantCount);
  }, [variantCount]);

  // ==============================
  // FILE UPLOAD HANDLERS
  // ==============================

  const handleImageUpload = useCallback(
    (variantId, files, type = "images") => {
      // Find the current variant to check slot limits
      const currentVariant = variants.find((v) => v.id === variantId);
      if (!currentVariant) return;

      // Check if we're at the image slot limit
      if (type === "images") {
        const currentImageCount = currentVariant.images?.length || 0;
        const maxSlots = currentVariant.maxImageSlots || 5;
        const availableSlots = maxSlots - currentImageCount;

        if (availableSlots <= 0) {
          console.warn(
            "Maximum image slots reached. Please add more slots first."
          );
          setNotification({
            type: "warning",
            message:
              "Maximum image slots reached. Please add more slots first.",
            duration: 3000,
          });
          return;
        }

        // Limit files to available slots
        const originalFileCount = files.length;
        files = Array.from(files).slice(0, availableSlots);

        if (originalFileCount > availableSlots) {
          setNotification({
            type: "warning",
            message: `Only ${availableSlots} slot${
              availableSlots === 1 ? "" : "s"
            } available. ${originalFileCount - availableSlots} file${
              originalFileCount - availableSlots === 1 ? "" : "s"
            } not uploaded.`,
            duration: 4000,
          });
        }
      }

      // Validate each file before processing
      const validFiles = [];
      const errors = [];

      Array.from(files).forEach((file) => {
        if (type === "images") {
          const validation = validateImageFile(file);
          if (validation.valid) {
            validFiles.push(file);
          } else {
            errors.push(`${file.name}: ${validation.error}`);
          }
        } else if (type === "videos") {
          // Accept all video formats including .blend
          const allowedVideoTypes = [
            "video/mp4",
            "video/mov",
            "video/avi",
            "video/wmv",
            "video/flv",
            "video/webm",
            "video/mkv",
            "video/m4v",
            "video/3gp",
            "video/ogv",
            "application/octet-stream", // For .blend files
          ];
          const allowedExtensions = [
            ".mp4",
            ".mov",
            ".avi",
            ".wmv",
            ".flv",
            ".webm",
            ".mkv",
            ".m4v",
            ".3gp",
            ".ogv",
            ".blend",
          ];

          const fileExtension = file.name
            .toLowerCase()
            .substring(file.name.lastIndexOf("."));
          const isValidType =
            allowedVideoTypes.includes(file.type) ||
            allowedExtensions.includes(fileExtension);
          const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit for videos

          if (isValidType && isValidSize) {
            validFiles.push(file);
          } else if (!isValidType) {
            errors.push(
              `${file.name}: Invalid video format. Supported formats: MP4, MOV, AVI, WMV, FLV, WebM, MKV, M4V, 3GP, OGV, BLEND`
            );
          } else if (!isValidSize) {
            errors.push(`${file.name}: File size exceeds 100MB limit`);
          }
        }
      });

      if (errors.length > 0) {
        console.warn("File validation errors:", errors);
        // TODO: Show user-friendly error messages
      }

      if (validFiles.length > 0) {
        // Create file data objects with upload status
        const newFiles = validFiles.map((file) => ({
          id: Date.now() + Math.random(),
          file,
          name: file.name,
          progress: 0,
          status: "uploading",
          type: file.type.startsWith("image/") ? "image" : "video",
          url: URL.createObjectURL(file),
        }));

        // Update variant with new files and upload status
        setVariants((prev) =>
          prev.map((variant) => {
            if (variant.id === variantId) {
              const updatedFiles = [...(variant[type] || []), ...newFiles];
              const updatedStatus = [
                ...(variant.uploadStatus[type] || []),
                ...newFiles.map((f) => ({
                  id: f.id,
                  status: "uploading",
                  progress: 0,
                })),
              ];

              return {
                ...variant,
                [type]: updatedFiles,
                uploadStatus: {
                  ...variant.uploadStatus,
                  [type]: updatedStatus,
                },
              };
            }
            return variant;
          })
        );

        // Simulate upload progress for each file
        newFiles.forEach((fileData) => {
          const interval = setInterval(() => {
            setVariants((prev) =>
              prev.map((variant) => {
                if (variant.id === variantId) {
                  const updatedFiles = variant[type].map((f) => {
                    if (f.id === fileData.id && f.progress < 100) {
                      const newProgress = Math.min(
                        f.progress + Math.random() * 20,
                        100
                      );
                      return {
                        ...f,
                        progress: newProgress,
                        status: newProgress >= 100 ? "success" : "uploading",
                      };
                    }
                    return f;
                  });

                  const updatedStatus = variant.uploadStatus[type].map((s) => {
                    if (s.id === fileData.id) {
                      const newProgress = Math.min(
                        s.progress + Math.random() * 20,
                        100
                      );
                      return {
                        ...s,
                        progress: newProgress,
                        status: newProgress >= 100 ? "success" : "uploading",
                      };
                    }
                    return s;
                  });

                  return {
                    ...variant,
                    [type]: updatedFiles,
                    uploadStatus: {
                      ...variant.uploadStatus,
                      [type]: updatedStatus,
                    },
                  };
                }
                return variant;
              })
            );
          }, 200);

          // Clear interval when complete and potentially simulate some failures
          setTimeout(() => {
            clearInterval(interval);
            // Randomly simulate some upload failures (10% chance)
            if (Math.random() < 0.1) {
              setVariants((prev) =>
                prev.map((variant) => {
                  if (variant.id === variantId) {
                    const updatedStatus = variant.uploadStatus[type].map(
                      (s) => {
                        if (s.id === fileData.id) {
                          return { ...s, status: "failed", progress: 0 };
                        }
                        return s;
                      }
                    );

                    return {
                      ...variant,
                      uploadStatus: {
                        ...variant.uploadStatus,
                        [type]: updatedStatus,
                      },
                    };
                  }
                  return variant;
                })
              );
            }
          }, 2500);
        });

        console.log(
          `Uploading valid ${type} for variant:`,
          variantId,
          validFiles
        );
      }
    },
    [variants]
  );

  // Handle common size chart uploads with status tracking
  const handleCommonSizeChartUpload = useCallback((type, file) => {
    setCommonSizeChart((prev) => ({
      ...prev,
      [type]: file,
      uploadStatus: {
        ...prev.uploadStatus,
        [type]: { status: "uploading", progress: 0 },
      },
    }));

    // Simulate upload progress
    const simulateProgress = () => {
      const interval = setInterval(() => {
        setCommonSizeChart((prev) => {
          const currentStatus = prev.uploadStatus[type];
          if (currentStatus && currentStatus.progress < 100) {
            const newProgress = Math.min(
              currentStatus.progress + Math.random() * 25,
              100
            );
            return {
              ...prev,
              uploadStatus: {
                ...prev.uploadStatus,
                [type]: {
                  status: newProgress >= 100 ? "success" : "uploading",
                  progress: newProgress,
                },
              },
            };
          }
          return prev;
        });
      }, UPLOAD_CONSTANTS.UPLOAD_SIMULATION_INTERVAL);

      // Clear interval and potentially simulate failure
      setTimeout(() => {
        clearInterval(interval);
        if (Math.random() < 0.05) {
          // 5% chance of failure
          setCommonSizeChart((prev) => ({
            ...prev,
            uploadStatus: {
              ...prev.uploadStatus,
              [type]: { status: "failed", progress: 0 },
            },
          }));
        }
      }, 2000);
    };

    simulateProgress();
  }, []);

  // ==============================
  // FILE MANAGEMENT HANDLERS
  // ==============================

  // Remove file from variant
  const removeFile = useCallback((variantId, fileId, type = "images") => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id === variantId) {
          const updatedFiles = variant[type].filter((f) => f.id !== fileId);
          const updatedStatus = variant.uploadStatus[type].filter(
            (s) => s.id !== fileId
          );

          return {
            ...variant,
            [type]: updatedFiles,
            uploadStatus: {
              ...variant.uploadStatus,
              [type]: updatedStatus,
            },
          };
        }
        return variant;
      })
    );
  }, []);

  // Retry failed upload
  const retryUpload = useCallback((fileId, type = "images") => {
    setVariants((prev) =>
      prev.map((variant) => {
        const failedFile = variant[type]?.find((f) => f.id === fileId);
        const failedStatus = variant.uploadStatus[type]?.find((s) => s.id === fileId);
        
        if (failedFile && failedStatus && failedStatus.status === 'failed') {
          // Reset the upload status to uploading
          const updatedStatus = variant.uploadStatus[type].map((s) => {
            if (s.id === fileId) {
              return { ...s, status: "uploading", progress: 0 };
            }
            return s;
          });

          // Simulate retry upload progress
          const interval = setInterval(() => {
            setVariants((prev) =>
              prev.map((variant) => {
                const statusIndex = variant.uploadStatus[type]?.findIndex((s) => s.id === fileId);
                if (statusIndex !== -1) {
                  const updatedStatus = [...variant.uploadStatus[type]];
                  const currentStatus = updatedStatus[statusIndex];
                  
                  if (currentStatus.progress < 100) {
                    const newProgress = Math.min(
                      currentStatus.progress + Math.random() * 20,
                      100
                    );
                    updatedStatus[statusIndex] = {
                      ...currentStatus,
                      progress: newProgress,
                      status: newProgress >= 100 ? "success" : "uploading",
                    };

                    return {
                      ...variant,
                      uploadStatus: {
                        ...variant.uploadStatus,
                        [type]: updatedStatus,
                      },
                    };
                  }
                }
                return variant;
              })
            );
          }, 200);

          // Clear interval and potentially simulate failure again (lower chance)
          setTimeout(() => {
            clearInterval(interval);
            // 5% chance of failure on retry (lower than initial 10%)
            if (Math.random() < 0.05) {
              setVariants((prev) =>
                prev.map((variant) => {
                  const updatedStatus = variant.uploadStatus[type]?.map((s) => {
                    if (s.id === fileId) {
                      return { ...s, status: "failed", progress: 0 };
                    }
                    return s;
                  });

                  return {
                    ...variant,
                    uploadStatus: {
                      ...variant.uploadStatus,
                      [type]: updatedStatus,
                    },
                  };
                })
              );
            }
          }, 2500);

          return {
            ...variant,
            uploadStatus: {
              ...variant.uploadStatus,
              [type]: updatedStatus,
            },
          };
        }
        return variant;
      })
    );
  }, []);

  // Drag and drop reordering for files
  const reorderFiles = useCallback((variantId, type, startIndex, endIndex) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id === variantId) {
          const files = [...variant[type]];
          const [reorderedItem] = files.splice(startIndex, 1);
          files.splice(endIndex, 0, reorderedItem);

          return {
            ...variant,
            [type]: files,
          };
        }
        return variant;
      })
    );
  }, []);

  // Add more image slots for a variant (controlled access)
  const addMoreImageSlots = useCallback(
    (variantId) => {
      const currentVariant = variants.find((v) => v.id === variantId);
      if (!currentVariant) return;

      const currentImageCount = currentVariant.images?.length || 0;
      const currentMaxSlots =
        currentVariant.maxImageSlots || UPLOAD_CONSTANTS.INITIAL_IMAGE_SLOTS;

      // Only allow adding slots if current slots are being used
      if (
        currentMaxSlots === UPLOAD_CONSTANTS.INITIAL_IMAGE_SLOTS &&
        currentImageCount < UPLOAD_CONSTANTS.MIN_IMAGES_BEFORE_SLOT_ADD
      ) {
        showNotification(
          "Please upload at least 4 images before adding more slots",
          NOTIFICATION_TYPES.INFO
        );
        return;
      }

      setVariants((prev) =>
        prev.map((variant) => {
          if (variant.id === variantId) {
            return {
              ...variant,
              maxImageSlots:
                (variant.maxImageSlots ||
                  UPLOAD_CONSTANTS.INITIAL_IMAGE_SLOTS) + 1,
            };
          }
          return variant;
        })
      );

      // Track that additional slots have been enabled for this variant
      setAdditionalSlotsEnabled((prev) => ({
        ...prev,
        [variantId]: true,
      }));

      showNotification(
        "Additional image slot added successfully!",
        NOTIFICATION_TYPES.SUCCESS,
        2000
      );
    },
    [variants, showNotification]
  );

  // Helper function to get combined media (images + videos) for a variant
  const getCombinedMedia = useCallback(
    (variantId) => {
      const variant = variants.find((v) => v.id === variantId);
      if (!variant) return [];

      const images = (variant.images || []).map((img) => ({
        ...img,
        mediaType: "image",
      }));
      const videos = (variant.videos || []).map((vid) => ({
        ...vid,
        mediaType: "video",
      }));

      return [...images, ...videos];
    },
    [variants]
  );

  // Reorder mixed media (images and videos together)
  const reorderMixedMedia = useCallback(
    (variantId, startIndex, endIndex) => {
      setVariants((prev) =>
        prev.map((variant) => {
          if (variant.id === variantId) {
            const combinedMedia = getCombinedMedia(variantId);
            const [reorderedItem] = combinedMedia.splice(startIndex, 1);
            combinedMedia.splice(endIndex, 0, reorderedItem);

            // Separate back into images and videos
            const newImages = combinedMedia
              .filter((item) => item.mediaType === "image")
              .map(({ mediaType, ...item }) => item);
            const newVideos = combinedMedia
              .filter((item) => item.mediaType === "video")
              .map(({ mediaType, ...item }) => item);

            return {
              ...variant,
              images: newImages,
              videos: newVideos,
            };
          }
          return variant;
        })
      );
    },
    [getCombinedMedia]
  );

  // Remove media item (image or video)
  const removeMixedMedia = useCallback((variantId, itemId, mediaType) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id === variantId) {
          if (mediaType === "image") {
            return {
              ...variant,
              images: variant.images?.filter((img) => img.id !== itemId) || [],
            };
          } else if (mediaType === "video") {
            return {
              ...variant,
              videos: variant.videos?.filter((vid) => vid.id !== itemId) || [],
            };
          }
        }
        return variant;
      })
    );
  }, []);

  // ==============================
  // SIZE AND INVENTORY HANDLERS
  // ==============================

  const handleStockSizeOptionChange = useCallback((option) => {
    setStockSizeOption(option);
  }, []);

  const handleCustomSizeAdd = useCallback(() => {
    const newSize = {
      size: "",
      quantity: "",
      hsn: "",
      sku: "",
      barcode: "",
      prices: {
        amazon: "",
        flipkart: "",
        myntra: "",
        nykaa: "",
        yoraa: "",
      },
    };
    setCustomSizes((prev) => [...prev, newSize]);
  }, []);

  const handleCustomSizeChange = useCallback((index, field, value) => {
    setCustomSizes((prev) =>
      prev.map((size, i) => (i === index ? { ...size, [field]: value } : size))
    );
  }, []);

  // ==============================
  // ALSO SHOW IN OPTIONS HANDLERS
  // ==============================

  const handleAlsoShowInChange = useCallback((option, field, value) => {
    setAlsoShowInOptions((prev) => ({
      ...prev,
      [option]: { ...prev[option], [field]: value },
    }));

    // Also update dynamic options array
    setDynamicAlsoShowInOptions((prev) =>
      prev.map((item) =>
        item.id === option ? { ...item, [field]: value } : item
      )
    );
  }, []);

  // Add new "Also Show in" option
  const addAlsoShowInOption = useCallback(() => {
    const newOptionId = `customOption${Date.now()}`;
    const newOption = {
      id: newOptionId,
      label: `Custom Option ${dynamicAlsoShowInOptions.length + 1}`,
      value: "no",
      isCustom: true,
    };

    setDynamicAlsoShowInOptions((prev) => [...prev, newOption]);
    setAlsoShowInOptions((prev) => ({
      ...prev,
      [newOptionId]: { value: "no" },
    }));
  }, [dynamicAlsoShowInOptions.length]);

  // Remove custom "Also Show in" option
  const removeAlsoShowInOption = useCallback((optionId) => {
    setDynamicAlsoShowInOptions((prev) =>
      prev.filter((item) => item.id !== optionId)
    );
    setAlsoShowInOptions((prev) => {
      const newOptions = { ...prev };
      delete newOptions[optionId];
      return newOptions;
    });
  }, []);

  // Update custom option label
  const updateAlsoShowInLabel = useCallback((optionId, newLabel) => {
    setDynamicAlsoShowInOptions((prev) =>
      prev.map((item) =>
        item.id === optionId ? { ...item, label: newLabel } : item
      )
    );
  }, []);

  // ==============================
  // PERMANENT OPTIONS HANDLERS
  // ==============================

  // Handle making an option permanent
  const handleMakePermanent = useCallback((option) => {
    setSelectedOptionForPermanent(option);
    setShowPermanentConfirmModal(true);
  }, []);

  // Confirm making option permanent
  const confirmMakePermanent = useCallback(() => {
    if (selectedOptionForPermanent) {
      // Add to permanent options if not already there
      setPermanentOptions((prev) => {
        const existingOption = prev.find(
          (opt) => opt.id === selectedOptionForPermanent.id
        );
        if (!existingOption) {
          return [
            ...prev,
            { ...selectedOptionForPermanent, isPermanent: true },
          ];
        }
        return prev;
      });

      // Update the option in dynamicAlsoShowInOptions to mark as permanent
      setDynamicAlsoShowInOptions((prev) =>
        prev.map((item) =>
          item.id === selectedOptionForPermanent.id
            ? { ...item, isPermanent: true }
            : item
        )
      );
    }

    setShowPermanentConfirmModal(false);
    setShowPermanentSuccessModal(true);
    setSelectedOptionForPermanent(null);
  }, [selectedOptionForPermanent]);

  // Cancel making option permanent
  const cancelMakePermanent = useCallback(() => {
    setShowPermanentConfirmModal(false);
    setSelectedOptionForPermanent(null);
  }, []);

  // Close success modal
  const closePermanentSuccessModal = useCallback(() => {
    setShowPermanentSuccessModal(false);
  }, []);

  // Remove permanent option
  const removePermanentOption = useCallback((optionId) => {
    setPermanentOptions((prev) => {
      const updated = prev.filter((opt) => opt.id !== optionId);
      // Update localStorage
      if (updated.length === 0) {
        localStorage.removeItem("yoraa_permanent_options");
      } else {
        localStorage.setItem(
          "yoraa_permanent_options",
          JSON.stringify(updated)
        );
      }
      return updated;
    });

    // Update the option in dynamicAlsoShowInOptions to unmark as permanent
    setDynamicAlsoShowInOptions((prev) =>
      prev.map((item) =>
        item.id === optionId ? { ...item, isPermanent: false } : item
      )
    );
  }, []);

  // Handle editing a permanent option
  const handleEditPermanentOption = useCallback((option) => {
    setEditingPermanentOption({ ...option });
    setShowEditPermanentModal(true);
  }, []);

  // Save edited permanent option
  const saveEditedPermanentOption = useCallback(() => {
    if (editingPermanentOption) {
      setPermanentOptions((prev) => {
        const updated = prev.map((opt) =>
          opt.id === editingPermanentOption.id
            ? { ...editingPermanentOption }
            : opt
        );
        localStorage.setItem(
          "yoraa_permanent_options",
          JSON.stringify(updated)
        );
        return updated;
      });

      // Update the option in dynamicAlsoShowInOptions as well
      setDynamicAlsoShowInOptions((prev) =>
        prev.map((item) =>
          item.id === editingPermanentOption.id
            ? { ...item, label: editingPermanentOption.label }
            : item
        )
      );
    }

    setShowEditPermanentModal(false);
    setEditingPermanentOption(null);
  }, [editingPermanentOption]);

  // Cancel editing permanent option
  const cancelEditPermanentOption = useCallback(() => {
    setShowEditPermanentModal(false);
    setEditingPermanentOption(null);
  }, []);

  // Handle delete confirmation for permanent option
  const handleDeletePermanentOption = useCallback((option) => {
    setDeletingPermanentOption(option);
    setShowDeleteConfirmModal(true);
  }, []);

  // Confirm delete permanent option
  const confirmDeletePermanentOption = useCallback(() => {
    if (deletingPermanentOption) {
      removePermanentOption(deletingPermanentOption.id);
    }
    setShowDeleteConfirmModal(false);
    setDeletingPermanentOption(null);
  }, [deletingPermanentOption, removePermanentOption]);

  // Cancel delete permanent option
  const cancelDeletePermanentOption = useCallback(() => {
    setShowDeleteConfirmModal(false);
    setDeletingPermanentOption(null);
  }, []);

  // ==============================
  // EXCEL IMPORT HANDLERS
  // ==============================

  const handleImportExcel = useCallback((type) => {
    // Create a hidden file input element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls,.csv";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log(`Importing ${type} from Excel:`, file.name);
        handleExcelFileUpload(file);
        showNotification(
          `Excel file "${file.name}" uploaded successfully!`,
          NOTIFICATION_TYPES.SUCCESS
        );
      }
    };
    input.click();
  }, []);

  // Excel file upload handler
  const handleExcelFileUpload = useCallback((file) => {
    setExcelFile(file);
    console.log("Excel file uploaded:", file.name);
    // TODO: Implement Excel parsing logic using libraries like SheetJS (xlsx)
  }, []);

  // Handle returnable import excel functionality
  const handleReturnableImportExcel = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls,.csv";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log("Importing returnable data from Excel:", file.name);
        showNotification(
          `Returnable data imported from "${file.name}"`,
          NOTIFICATION_TYPES.SUCCESS
        );
      }
    };
    input.click();
  }, [showNotification]);

  // ==============================
  // NESTING OPTIONS HANDLERS
  // ==============================

  // Nesting options handlers
  const handleNestingOptionChange = useCallback(
    (variantId, option) => {
      if (option === "sameAsArticle1") {
        // Set all options to be copied from variant 1
        const allOptions = [
          "title",
          "description",
          "manufacturingDetails",
          "shippingReturns",
          "regularPrice",
          "salePrice",
          "stockSize",
        ];
        setNestingOptions((prev) => ({
          ...prev,
          [variantId]: allOptions,
        }));

        // Apply nesting logic - copy all data from first variant
        const firstVariant = variants[0];
        if (firstVariant) {
          handleVariantChange(variantId, "title", firstVariant?.title || "");
          handleVariantChange(
            variantId,
            "description",
            firstVariant?.description || ""
          );
          handleVariantChange(
            variantId,
            "manufacturingDetails",
            firstVariant?.manufacturingDetails || ""
          );
          handleVariantChange(
            variantId,
            "shippingReturns",
            firstVariant?.shippingReturns || ""
          );
          handleVariantChange(
            variantId,
            "regularPrice",
            firstVariant?.regularPrice || ""
          );
          handleVariantChange(
            variantId,
            "salePrice",
            firstVariant?.salePrice || ""
          );

          // Copy stock size data
          const variantToUpdate = variants.find((v) => v.id === variantId);
          if (variantToUpdate) {
            setVariants((prev) =>
              prev.map((variant) =>
                variant.id === variantId
                  ? {
                      ...variant,
                      stockSizeOption: "sizes",
                      customSizes: [...(customSizes || [])],
                    }
                  : variant
              )
            );
          }
        }
      } else {
        // Clear all options
        setNestingOptions((prev) => ({
          ...prev,
          [variantId]: [],
        }));
      }
    },
    [variants, handleVariantChange, customSizes]
  );

  // Handle individual nesting options
  const handleIndividualNestingChange = useCallback(
    (variantId, field, isChecked) => {
      setNestingOptions((prev) => {
        const currentOptions = prev[variantId] || [];
        let newOptions;

        if (isChecked) {
          newOptions = [...currentOptions, field];
        } else {
          newOptions = currentOptions.filter((option) => option !== field);
        }

        // Apply the specific field copying
        if (isChecked) {
          const firstVariant = variants[0];
          if (firstVariant) {
            switch (field) {
              case "title":
                handleVariantChange(
                  variantId,
                  "title",
                  firstVariant?.title || ""
                );
                break;
              case "description":
                handleVariantChange(
                  variantId,
                  "description",
                  firstVariant?.description || ""
                );
                break;
              case "manufacturingDetails":
                handleVariantChange(
                  variantId,
                  "manufacturingDetails",
                  firstVariant?.manufacturingDetails || ""
                );
                break;
              case "shippingReturns":
                handleVariantChange(
                  variantId,
                  "shippingReturns",
                  firstVariant?.shippingReturns || ""
                );
                break;
              case "regularPrice":
                handleVariantChange(
                  variantId,
                  "regularPrice",
                  firstVariant?.regularPrice || ""
                );
                break;
              case "salePrice":
                handleVariantChange(
                  variantId,
                  "salePrice",
                  firstVariant?.salePrice || ""
                );
                break;
              case "stockSize":
                // Copy stock size data
                setVariants((prev) =>
                  prev.map((variant) =>
                    variant.id === variantId
                      ? {
                          ...variant,
                          stockSizeOption: "sizes",
                          customSizes: [...(customSizes || [])],
                        }
                      : variant
                  )
                );
                break;
              default:
                break;
            }
          }
        }

        return {
          ...prev,
          [variantId]: newOptions,
        };
      });
    },
    [variants, handleVariantChange, customSizes]
  );

  // ==============================
  // VARIANT-SPECIFIC HANDLERS
  // ==============================

  // Variant-specific stock size handlers
  const handleVariantStockSizeOption = useCallback((variantId, option) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId
          ? { ...variant, stockSizeOption: option }
          : variant
      )
    );
  }, []);

  const handleVariantCustomSizeAdd = useCallback((variantId) => {
    const newSize = {
      size: "",
      quantity: "",
      hsn: "",
      sku: "",
      barcode: "",
      prices: {
        amazon: "",
        flipkart: "",
        myntra: "",
        nykaa: "",
        yoraa: "",
      },
    };

    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              customSizes: [...(variant.customSizes || []), newSize],
            }
          : variant
      )
    );
  }, []);

  const handleVariantCustomSizeChange = useCallback(
    (variantId, sizeIndex, field, value) => {
      setVariants((prev) =>
        prev.map((variant) =>
          variant.id === variantId
            ? {
                ...variant,
                customSizes: (variant.customSizes || []).map((size, i) =>
                  i === sizeIndex ? { ...size, [field]: value } : size
                ),
              }
            : variant
        )
      );
    },
    []
  );

  const handleVariantImportExcel = useCallback(
    (variantId, type) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".xlsx,.xls,.csv";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          console.log(
            `Importing ${type} from Excel for variant ${variantId}:`,
            file.name
          );

          if (type === "sizes") {
            // Sample data simulation
            const sampleSizes = [
              {
                size: "XS",
                quantity: "8",
                hsn: "61091000",
                sku: `SKU${variantId}01`,
                barcode: `123456789${variantId}23`,
                prices: {
                  amazon: "599",
                  flipkart: "579",
                  myntra: "589",
                  nykaa: "599",
                  yoraa: "549",
                },
              },
            ];

            setVariants((prev) =>
              prev.map((variant) =>
                variant.id === variantId
                  ? {
                      ...variant,
                      stockSizeOption: STOCK_SIZE_OPTIONS.SIZES,
                      customSizes: sampleSizes,
                    }
                  : variant
              )
            );

            showNotification(
              `Excel file "${file.name}" imported successfully for variant! ${sampleSizes.length} sizes added.`,
              NOTIFICATION_TYPES.SUCCESS
            );
          }
        }
      };
      input.click();
    },
    [showNotification]
  );

  // ==============================
  // FORM SUBMISSION HANDLERS
  // ==============================

  // Helper function to create product data for API
  const createProductDataForAPI = useCallback((status = 'draft') => {
    // Debug logging
    console.log('=== DEBUG PRODUCT DATA ===');
    console.log('productData:', productData);
    console.log('selectedCategory:', selectedCategory);
    console.log('selectedSubCategory:', selectedSubCategory);
    console.log('productName:', productData.productName);
    console.log('categoryId:', selectedCategory);
    console.log('subCategoryId:', selectedSubCategory);
    
    // Generate unique product ID
    const productId = `PRD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create the base product data
    const baseProductData = {
      productId: productId,
      productName: productData.productName || '',
      title: productData.title || productData.productName || '',
      name: productData.productName || '', // Required legacy field
      description: productData.description || '',
      manufacturingDetails: productData.manufacturingDetails || '',
      shippingAndReturns: {
        shippingDetails: [],
        returnPolicy: [],
        additionalInfo: productData.shippingReturns || ''
      },
      regularPrice: parseFloat(productData.regularPrice) || 0,
      salePrice: parseFloat(productData.salePrice) || 0,
      price: parseFloat(productData.regularPrice) || 0, // Required legacy field
      stock: Math.max(1, customSizes.reduce((total, size) => total + (parseInt(size.quantity) || 0), 0)) || 1, // Required legacy field
      returnable: productData.returnable === 'yes' || false,
      metaTitle: productData.metaTitle || productData.productName || '',
      metaDescription: productData.metaDescription || productData.description || '',
      slugUrl: productData.slugUrl || productData.productName?.toLowerCase().replace(/\s+/g, '-') || '',
      categoryId: selectedCategory,
      subCategoryId: selectedSubCategory,
      status: status === 'live' ? 'published' : status, // Convert 'live' to 'published' for backend
      
      // Platform pricing (5 different platforms as requested)
      platformPricing: {
        yoraa: { // Default platform
          enabled: true,
          price: parseFloat(productData.regularPrice) || 0,
          salePrice: parseFloat(productData.salePrice) || 0
        },
        myntra: {
          enabled: true,
          price: parseFloat(productData.regularPrice) || 0,
          salePrice: parseFloat(productData.salePrice) || 0
        },
        amazon: {
          enabled: true,
          price: parseFloat(productData.regularPrice) || 0,
          salePrice: parseFloat(productData.salePrice) || 0
        },
        flipkart: {
          enabled: true,
          price: parseFloat(productData.regularPrice) || 0,
          salePrice: parseFloat(productData.salePrice) || 0
        },
        nykaa: {
          enabled: true,
          price: parseFloat(productData.regularPrice) || 0,
          salePrice: parseFloat(productData.salePrice) || 0
        }
      },
      
      // Size and stock information
      stockSizeOption: stockSizeOption,
      sizes: stockSizeOption === STOCK_SIZE_OPTIONS.SIZES ? customSizes.map(size => ({
        size: size.size,
        quantity: parseInt(size.quantity) || 0,
        hsnCode: size.hsnCode || '',
        sku: size.sku || `${selectedCategory}/${selectedSubCategory}/${productData.productName}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/${Math.random().toString().slice(2, 10)}`,
        barcode: size.barcode || '',
        platformPricing: {
          yoraa: { price: parseFloat(size.yoraaPrice) || parseFloat(productData.regularPrice) || 0 },
          myntra: { price: parseFloat(size.myntraPrice) || parseFloat(productData.regularPrice) || 0 },
          amazon: { price: parseFloat(size.amazonPrice) || parseFloat(productData.regularPrice) || 0 },
          flipkart: { price: parseFloat(size.flipkartPrice) || parseFloat(productData.regularPrice) || 0 },
          nykaa: { price: parseFloat(size.nykaaPrice) || parseFloat(productData.regularPrice) || 0 }
        }
      })) : [],
      
      // Variants with images
      variants: variants.map(variant => ({
        name: variant.name || '',
        productName: variant.productName || '',
        title: variant.title || '',
        description: variant.description || '',
        manufacturingDetails: variant.manufacturingDetails || '',
        shippingAndReturns: {
          shippingCost: variant.shippingReturns?.shippingCost || 0,
          deliveryTime: variant.shippingReturns?.deliveryTime || '7-10 business days',
          returnPolicy: variant.shippingReturns?.returnPolicy || '30 days return',
          warranty: variant.shippingReturns?.warranty || 'No warranty'
        },
        regularPrice: variant.regularPrice || 0,
        salePrice: variant.salePrice || 0,
        images: variant.images || [],
        videos: variant.videos || [],
        filters: variant.filters || {},
        stockSizes: variant.stockSizes || [],
        customSizes: variant.customSizes || []
      })),
      
      // Also show in options - convert to boolean structure expected by backend
      alsoShowInOptions: {
        youMightAlsoLike: alsoShowInOptions?.youMightAlsoLike?.value === 'yes' || false,
        similarItems: alsoShowInOptions?.similarItems?.value === 'yes' || false,
        othersAlsoBought: alsoShowInOptions?.othersAlsoBought?.value === 'yes' || false,
        customOptions: []
      },
      
      // Size charts
      sizeChart: sizeChart,
      commonSizeChart: commonSizeChart,
      
      // Additional metadata
      filters: Object.keys(productFilters).reduce((acc, key) => {
        if (productFilters[key] && productFilters[key].length > 0) {
          acc.push({
            key: key,
            values: productFilters[key].map(value => ({ name: value, selected: true }))
          });
        }
        return acc;
      }, []),
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Debug log the final payload
    console.log('=== FINAL PAYLOAD BEING SENT ===');
    console.log(JSON.stringify(baseProductData, null, 2));
    console.log('=== END DEBUG ===');

    return baseProductData;
  }, [
    productData,
    selectedCategory,
    selectedSubCategory,
    stockSizeOption,
    customSizes,
    variants,
    alsoShowInOptions,
    sizeChart,
    commonSizeChart,
    productFilters
  ]);

  const handleSaveAsDraft = useCallback(() => {
    if (!productData.productName?.trim()) {
      showNotification("Product name is required", NOTIFICATION_TYPES.ERROR);
      return;
    }

    if (!selectedCategory || !selectedSubCategory) {
      showNotification("Category and subcategory are required", NOTIFICATION_TYPES.ERROR);
      return;
    }

    try {
      const draftData = createProductDataForAPI('draft');
      console.log('Saving draft with data:', draftData);
      dispatch(createProduct(draftData));
    } catch (error) {
      console.error('Error creating draft:', error);
      showNotification("Failed to save draft", NOTIFICATION_TYPES.ERROR);
    }
  }, [
    productData.productName,
    selectedCategory,
    selectedSubCategory,
    createProductDataForAPI,
    dispatch,
    showNotification
  ]);

  const handlePublishNow = useCallback(() => {
    if (!productData.productName?.trim()) {
      showNotification("Product name is required", NOTIFICATION_TYPES.ERROR);
      return;
    }

    if (!selectedCategory || !selectedSubCategory) {
      showNotification("Category and subcategory are required", NOTIFICATION_TYPES.ERROR);
      return;
    }

    if (!productData.regularPrice || parseFloat(productData.regularPrice) <= 0) {
      showNotification("Valid regular price is required", NOTIFICATION_TYPES.ERROR);
      return;
    }

    try {
      const publishData = createProductDataForAPI('live');
      console.log('Publishing with data:', publishData);
      dispatch(createProduct(publishData));
    } catch (error) {
      console.error('Error publishing product:', error);
      showNotification("Failed to publish product", NOTIFICATION_TYPES.ERROR);
    }
  }, [
    productData.productName,
    productData.regularPrice,
    selectedCategory,
    selectedSubCategory,
    createProductDataForAPI,
    dispatch,
    showNotification
  ]);

  const handleScheduleForLater = useCallback(() => {
    if (!productData.productName?.trim()) {
      showNotification("Product name is required", NOTIFICATION_TYPES.ERROR);
      return;
    }

    if (!selectedCategory || !selectedSubCategory) {
      showNotification("Category and subcategory are required", NOTIFICATION_TYPES.ERROR);
      return;
    }

    if (!productData.regularPrice || parseFloat(productData.regularPrice) <= 0) {
      showNotification("Valid regular price is required", NOTIFICATION_TYPES.ERROR);
      return;
    }

    // Show the scheduling modal
    setIsScheduleModalOpen(true);
  }, [
    productData.productName,
    productData.regularPrice,
    selectedCategory,
    selectedSubCategory,
    showNotification
  ]);

  // ==============================
  // SCHEDULING MODAL HANDLERS
  // ==============================
  const handleConfirmSchedule = useCallback(async () => {
    if (!scheduleDate || !scheduleTime) {
      showNotification("Please select both date and time", NOTIFICATION_TYPES.ERROR);
      return;
    }

    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    if (scheduledDateTime <= new Date()) {
      showNotification("Scheduled time must be in the future", NOTIFICATION_TYPES.ERROR);
      return;
    }

    setScheduleLoading(true);

    try {
      const scheduleData = createProductDataForAPI('scheduled');
      scheduleData.scheduledPublishDate = scheduledDateTime.toISOString();
      
      dispatch(createProduct(scheduleData));
      
      setIsScheduleModalOpen(false);
      setScheduleDate("");
      setScheduleTime("");
      
      showNotification(
        `Product scheduled for ${scheduledDateTime.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`, 
        NOTIFICATION_TYPES.SUCCESS
      );
    } catch (error) {
      showNotification("Failed to schedule product", NOTIFICATION_TYPES.ERROR);
    } finally {
      setScheduleLoading(false);
    }
  }, [
    scheduleDate,
    scheduleTime,
    createProductDataForAPI,
    dispatch,
    showNotification
  ]);

  const handleCancelSchedule = useCallback(() => {
    setIsScheduleModalOpen(false);
    setScheduleDate("");
    setScheduleTime("");
    setScheduleLoading(false);
  }, []);

  // ==============================
  // VALIDATION AND REVIEW HANDLERS
  // ==============================

  const handleRecheckDetails = useCallback((option = "All DETAILS") => {
    console.log("Rechecking details:", option);
    setSelectedRecheckOption(option);
    setIsRecheckDropdownOpen(false);

    // Implement specific validation highlighting based on selected option
    switch (option) {
      case "All DETAILS":
        console.log("Validating all product details");
        setShowDetailedReviewModal(true);
        break;
      case "All text":
        console.log("Validating all text fields");
        break;
      case "All IMAGES":
        console.log("Validating all images");
        break;
      case "SIZE CHART":
        console.log("Validating size chart");
        break;
      default:
        console.log("Validating all details");
    }
  }, []);

  // ==============================
  // UI INTERACTION HANDLERS
  // ==============================

  // Handle recheck dropdown toggle
  const toggleRecheckDropdown = useCallback(() => {
    setIsRecheckDropdownOpen((prev) => !prev);
  }, []);

  // Handle recheck option selection
  const handleRecheckOptionSelect = useCallback(
    (option) => {
      setSelectedRecheckOption(option);
      handleRecheckDetails(option);
    },
    [handleRecheckDetails]
  );

  // Close detailed review modal
  const closeDetailedReviewModal = useCallback(() => {
    setShowDetailedReviewModal(false);
  }, []);

  // ==============================
  // DRAG AND DROP HANDLERS
  // ==============================

  // File upload handlers
  const handleFileUpload = useCallback(
    (files, type = "images", variantId = 1) => {
      handleImageUpload(variantId, files, type);
    },
    [handleImageUpload]
  );

  // Drag and drop for upload areas
  const handleUploadDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleUploadDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleUploadDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleUploadDrop = useCallback(
    (e, type = "images", variantId = 1) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files, type, variantId);
      }
    },
    [handleFileUpload]
  );

  // ==============================
  // COMPUTED VALUES
  // ==============================

  // Memoized computed values for performance
  const isFormValid = useMemo(() => {
    // Check minimum conditions for publish:
    // 1. Variant 1 has product name and at least one image
    // 2. At least one platform should be available (dynamic check)
    const variant1 = variants[0];
    const hasProductName = productData.productName.trim() !== "";
    const hasImage = variant1?.images && variant1.images.length > 0;

    return hasProductName && hasImage && variants.length > 0;
  }, [productData.productName, variants]);

  // ==============================
  // RENDER COMPONENT
  // ==============================

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="px-6 py-8 flex flex-col gap-5 bg-white shadow-sm rounded-md">
        <button
          onClick={() => navigate("/manage-items")}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 w-fit"
        >
          <ChevronDown className="h-5 w-5 rotate-90 mr-2" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-[32px] sm:text-[36px] font-bold text-[#111111] font-['Montserrat'] leading-tight">
          Upload Items
        </h1>
      </div>

      {/* Main Content Container */}
      <div className="px-4 pb-8">
        {/* Returnable Section */}
        <div className="py-8 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-6 mb-6">
            <h3 className="text-[21px] font-semibold text-[#111111] font-['Montserrat'] leading-snug">
              Returnable
            </h3>

            <div className="flex items-center gap-3">
              <button
                className={`px-6 py-2 rounded-full transition-colors duration-200 flex items-center justify-center border ${
                  productData.returnable === "yes"
                    ? "bg-[#000AFF] text-white border-[#000AFF]"
                    : "bg-white text-[#000000] border-gray-300 hover:border-[#000AFF] hover:text-[#000AFF]"
                }`}
                onClick={() => handleProductDataChange("returnable", "yes")}
              >
                <span className="text-[16px] font-medium font-['Montserrat']">
                  Yes
                </span>
              </button>
              <button
                className={`px-6 py-2 rounded-full transition-colors duration-200 flex items-center justify-center border ${
                  productData.returnable === "no"
                    ? "bg-[#000AFF] text-white border-[#000AFF]"
                    : "bg-white text-[#000000] border-gray-300 hover:border-[#000AFF] hover:text-[#000AFF]"
                }`}
                onClick={() => handleProductDataChange("returnable", "no")}
              >
                <span className="text-[16px] font-medium font-['Montserrat']">
                  No
                </span>
              </button>
            </div>

            <button
              onClick={handleReturnableImportExcel}
              className="bg-[#000AFF] hover:bg-[#0000e6] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-['Montserrat'] text-sm font-medium leading-5 shadow-md border border-[#7280FF] w-[150px] justify-center transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              IMPORT
            </button>
          </div>
        </div>

        {/* List To Section */}
        <div className="py-6 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[14px] font-['Montserrat'] text-[#000000] leading-[20px]">
              List to:
            </span>

            {["amazon", "flipkart", "yoraa", "myntra", "nykaa"].map(
              (platform, index) => (
                <label
                  key={platform}
                  className="flex items-center gap-2 cursor-pointer text-[15px] text-black font-['Montserrat'] leading-[17px] transition-all"
                >
                  <input
                    type="checkbox"
                    defaultChecked={platform === "yoraa"}
                    className="w-5 h-5 accent-[#000AFF] border border-[#bcbcbc] rounded-[3px] transition-colors duration-200"
                  />
                  {platform}
                </label>
              )
            )}
          </div>
        </div>

        {/* Variant Section */}
        <div className="py-6">
          <h2 className="text-[48px] font-bold text-[#111111] font-['Montserrat'] leading-[24px] mb-8">
            varient 1
          </h2>

          <div className="flex gap-12 relative sm:flex-col">
            {/* Left Column - Product Details */}
            <div className="space-y-8">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-[#111111] font-['Montserrat'] mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={productData.productName || ""}
                  onChange={(e) =>
                    setProductData(prev => ({ ...prev, productName: e.target.value }))
                  }
                  className="w-full max-w-[400px] h-[42px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-['Montserrat']"
                  placeholder="Enter product name"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[#111111] font-['Montserrat'] mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={productData.title || ""}
                  onChange={(e) =>
                    setProductData(prev => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full max-w-[400px] h-[42px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-['Montserrat']"
                  placeholder="Enter product title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#111111] font-['Montserrat'] mb-2">
                  Description
                </label>
                <textarea
                  value={productData.description || ""}
                  onChange={(e) =>
                    setProductData(prev => ({ ...prev, description: e.target.value }))
                  }
                  rows={4}
                  className="w-full max-w-[400px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-['Montserrat']"
                  placeholder="Enter product description"
                />
              </div>

              {/* Manufacturing Details */}
              <div>
                <label className="block text-sm font-medium text-[#111111] font-['Montserrat'] mb-2">
                  Manufacturing Details
                </label>
                <textarea
                  value={productData.manufacturingDetails || ""}
                  onChange={(e) =>
                    setProductData(prev => ({ ...prev, manufacturingDetails: e.target.value }))
                  }
                  rows={3}
                  className="w-full max-w-[400px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-['Montserrat']"
                  placeholder="Enter manufacturing details (model height, etc.)"
                />
              </div>

              {/* Shipping and Returns */}
              <div>
                <label className="block text-sm font-medium text-[#111111] font-['Montserrat'] mb-2">
                  Shipping and Returns
                </label>
                <textarea
                  value={productData.shippingReturns || ""}
                  onChange={(e) =>
                    setProductData(prev => ({ ...prev, shippingReturns: e.target.value }))
                  }
                  rows={3}
                  className="w-full max-w-[400px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-['Montserrat']"
                  placeholder="Enter shipping and returns policy"
                />
              </div>

              {/* Pricing Section */}
              <div className="grid grid-cols-2 gap-4 mb-16 max-w-[400px]">
                <div>
                  <label className="block text-sm font-medium text-[#111111] font-['Montserrat'] mb-2">
                    Regular Price
                  </label>
                  <input
                    type="number"
                    value={productData.regularPrice || ""}
                    onChange={(e) =>
                      setProductData(prev => ({ ...prev, regularPrice: e.target.value }))
                    }
                    className="w-full h-[42px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-['Montserrat']"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111111] font-['Montserrat'] mb-2">
                    Sale Price
                  </label>
                  <input
                    type="number"
                    value={productData.salePrice || ""}
                    onChange={(e) =>
                      setProductData(prev => ({ ...prev, salePrice: e.target.value }))
                    }
                    className="w-full h-[42px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-['Montserrat']"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>







              {/* Legacy title field - keeping for compatibility */}
              <div style={{ display: 'none' }}>
                <input
                  type="text"
                  value={variants[0]?.title || ""}
                  onChange={(e) =>
                    handleVariantChange(1, "title", e.target.value)
                  }
                  className="w-full max-w-[400px] h-[42px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-['Montserrat']"
                  placeholder="Enter title"
                />
              </div>





              {/* Stock Size */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-[#111111] font-['Montserrat']">
                  Stock Size
                </label>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleStockSizeOptionChange("noSize")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      stockSizeOption === "noSize"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    No Size
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStockSizeOptionChange("sizes")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      stockSizeOption === "sizes"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Add Size
                  </button>
                  <button
                    type="button"
                    onClick={() => handleImportExcel("sizes")}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    Import Excel
                  </button>
                </div>

                {/* Size Table */}
                {stockSizeOption === "sizes" && (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={handleCustomSizeAdd}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Add Custom Size
                    </button>

                    {customSizes.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 rounded-md overflow-hidden">
                          <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold">
                            <tr>
                              {[
                                "Size",
                                "Quantity",
                                "HSN",
                                "SKU",
                                "Barcode",
                                "Amazon",
                                "Flipkart",
                                "Myntra",
                                "Nykaa",
                                "Yoraa",
                              ].map((header) => (
                                <th
                                  key={header}
                                  className="px-3 py-2 text-left"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {customSizes.map((sizeData, index) => (
                              <tr key={index}>
                                {[
                                  "size",
                                  "quantity",
                                  "hsn",
                                  "sku",
                                  "barcode",
                                ].map((field) => (
                                  <td key={field} className="px-3 py-2">
                                    <input
                                      type={
                                        field === "quantity" ? "number" : "text"
                                      }
                                      value={sizeData[field]}
                                      onChange={(e) =>
                                        handleCustomSizeChange(
                                          index,
                                          field,
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 border border-gray-300 rounded"
                                      placeholder={
                                        field.charAt(0).toUpperCase() +
                                        field.slice(1)
                                      }
                                    />
                                  </td>
                                ))}
                                {[
                                  "amazon",
                                  "flipkart",
                                  "myntra",
                                  "nykaa",
                                  "yoraa",
                                ].map((platform) => (
                                  <td key={platform} className="px-3 py-2">
                                    <input
                                      type="number"
                                      value={sizeData.prices[platform]}
                                      onChange={(e) =>
                                        handleCustomSizeChange(
                                          index,
                                          "prices",
                                          {
                                            ...sizeData.prices,
                                            [platform]: e.target.value,
                                          }
                                        )
                                      }
                                      className="w-full px-2 py-1 border border-gray-300 rounded"
                                      placeholder="Price"
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Meta Data Fields */}
              <div className="space-y-4 mt-8">
                <h3 className="text-lg font-semibold text-[#111111] font-['Montserrat']">
                  Meta Data Fields
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-[#111111] font-['Montserrat'] mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={productData.metaTitle || ""}
                    onChange={(e) =>
                      setProductData(prev => ({ ...prev, metaTitle: e.target.value }))
                    }
                    className="w-full max-w-[400px] h-[42px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-['Montserrat']"
                    placeholder="Enter meta title for SEO"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111111] font-['Montserrat'] mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={productData.metaDescription || ""}
                    onChange={(e) =>
                      setProductData(prev => ({ ...prev, metaDescription: e.target.value }))
                    }
                    rows={3}
                    className="w-full max-w-[400px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-['Montserrat']"
                    placeholder="Enter meta description for SEO"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111111] font-['Montserrat'] mb-2">
                    Slug URL
                  </label>
                  <input
                    type="text"
                    value={productData.slugUrl || ""}
                    onChange={(e) =>
                      setProductData(prev => ({ ...prev, slugUrl: e.target.value }))
                    }
                    className="w-full max-w-[400px] h-[42px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-['Montserrat']"
                    placeholder="product-slug-url"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Product Images */}
            <div className="space-y-6 xl:absolute right-10 top-[150px] w-[400px] sm:static 2xl:left-1/2 lg:left-1/3">
              <div>
                <h3 className="text-[32px] font-bold text-[#111111] font-['Montserrat'] leading-[24px] mb-6">
                  Product Images/videos
                </h3>

                {/* Main Product Image and Additional Images/Videos Grid */}
                <div className="space-y-4">
                  {/* Main Product Image/Video */}
                  <div className="w-[276px] h-[286px] bg-gray-100 rounded border overflow-hidden relative">
                    {(() => {
                      const combinedMedia = getCombinedMedia(variants[0]?.id);
                      const mainMedia = combinedMedia[0];

                      if (mainMedia) {
                        return (
                          <>
                            {mainMedia.mediaType === "image" ? (
                              <img
                                src={mainMedia.url}
                                alt="Main product view"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video
                                src={mainMedia.url}
                                className="w-full h-full object-cover"
                                controls
                                muted
                              />
                            )}
                            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                              Main{" "}
                              {mainMedia.mediaType === "video"
                                ? "Video"
                                : "Image"}
                            </div>
                          </>
                        );
                      } else {
                        return (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <span className="text-gray-400 text-sm font-['Montserrat']">
                              Main Product Image/Video
                            </span>
                          </div>
                        );
                      }
                    })()}
                  </div>

                  {/* Additional Images/Videos Grid (5 slots initially, expandable) */}
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({
                      length: variants[0]?.maxImageSlots || 5,
                    }).map((_, index) => {
                      const mediaIndex = index + 1; // Skip main media (index 0)
                      const combinedMedia = getCombinedMedia(variants[0]?.id);
                      const media = combinedMedia[mediaIndex];

                      return (
                        <div
                          key={`slot-${index}`}
                          className="w-[52px] h-[52px] bg-gray-100 rounded border overflow-hidden relative group cursor-pointer"
                          draggable={!!media}
                          onDragStart={(e) => {
                            if (media) {
                              e.dataTransfer.setData(
                                "text/plain",
                                mediaIndex.toString()
                              );
                              e.dataTransfer.setData(
                                "variant-id",
                                variants[0]?.id.toString()
                              );
                              e.dataTransfer.setData("type", "mixed-media");
                            }
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const dragIndex = parseInt(
                              e.dataTransfer.getData("text/plain")
                            );
                            const dragVariantId = parseInt(
                              e.dataTransfer.getData("variant-id")
                            );
                            const dragType = e.dataTransfer.getData("type");

                            if (
                              dragVariantId === variants[0]?.id &&
                              dragType === "mixed-media" &&
                              dragIndex !== mediaIndex
                            ) {
                              reorderMixedMedia(
                                variants[0]?.id,
                                dragIndex,
                                mediaIndex
                              );
                            }
                          }}
                        >
                          {media ? (
                            <>
                              {media.mediaType === "image" ? (
                                <img
                                  src={media.url}
                                  alt={`Product view ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <video
                                  src={media.url}
                                  className="w-full h-full object-cover"
                                  muted
                                />
                              )}
                              <button
                                onClick={() =>
                                  removeMixedMedia(
                                    variants[0]?.id,
                                    media.id,
                                    media.mediaType
                                  )
                                }
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-2 h-2" />
                              </button>
                              <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-[8px] text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                {media.mediaType === "video"
                                  ? "Video"
                                  : "Image"}
                              </div>
                              <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-[10px] text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                Drag
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 border-dashed border-gray-300 border-2">
                              <Plus className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add More Media Slots Button with Status */}
                  {(() => {
                    const variant = variants[0];
                    const combinedMedia = getCombinedMedia(variant?.id);
                    const currentMediaCount = combinedMedia.length;
                    const maxSlots = variant?.maxImageSlots || 5;
                    const canAddMoreSlots = currentMediaCount >= 4; // Need at least 4 media items before adding more slots
                    const slotsAvailable = maxSlots - currentMediaCount > 0;

                    if (maxSlots === 5 && currentMediaCount >= 5) {
                      // All 5 default slots are used
                      return (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600 font-['Montserrat']">
                            All 5 default slots used ({currentMediaCount}/
                            {maxSlots})
                          </div>
                          <button
                            onClick={() => addMoreImageSlots(variant?.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-['Montserrat'] flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Add Additional Slot
                          </button>
                        </div>
                      );
                    } else if (maxSlots === 5 && canAddMoreSlots) {
                      // Can add more slots (4+ media items uploaded)
                      return (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600 font-['Montserrat']">
                            Media uploaded: {currentMediaCount}/5 default slots
                          </div>
                          <button
                            onClick={() => addMoreImageSlots(variant?.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-['Montserrat'] flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Add Additional Slot
                          </button>
                        </div>
                      );
                    } else if (maxSlots > 5) {
                      // Additional slots already added
                      return (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600 font-['Montserrat']">
                            Media uploaded: {currentMediaCount}/{maxSlots} slots
                            (5 default + {maxSlots - 5} additional)
                          </div>
                          {!slotsAvailable && (
                            <button
                              onClick={() => addMoreImageSlots(variant?.id)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-['Montserrat'] flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              Add Another Slot
                            </button>
                          )}
                        </div>
                      );
                    } else {
                      // Default state
                      return (
                        <div className="text-sm text-gray-600 font-['Montserrat']">
                          Media uploaded: {currentMediaCount}/5 default slots
                          {currentMediaCount >= 4 && (
                            <button
                              onClick={() => addMoreImageSlots(variant?.id)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-['Montserrat'] flex items-center gap-1 mt-1"
                            >
                              <Plus className="w-4 h-4" />
                              Add Additional Slot
                            </button>
                          )}
                        </div>
                      );
                    }
                  })()}
                </div>

                {/* Upload Areas - Moved to the right to avoid conflicts */}
                <div className="space-y-4 mb-6 ml-8">
                  <div>
                    <h4 className="text-[21px] font-medium text-[#111111] font-['Montserrat'] mb-3">
                      Upload Images
                    </h4>
                    {(() => {
                      const variant = variants[0];
                      const combinedMedia = getCombinedMedia(variant?.id);
                      const currentMediaCount = combinedMedia.length;
                      const maxSlots = variant?.maxImageSlots || 5;
                      const slotsAvailable = maxSlots - currentMediaCount > 0;

                      return (
                        <label
                          className={`cursor-pointer ${
                            !slotsAvailable
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            disabled={!slotsAvailable}
                            onChange={(e) =>
                              slotsAvailable &&
                              handleImageUpload(
                                variants[0]?.id,
                                e.target.files,
                                "images"
                              )
                            }
                          />
                          <div
                            className={`w-[185px] h-[96px] border border-dashed rounded flex flex-col items-center justify-center transition-colors ${
                              slotsAvailable
                                ? "border-gray-300 hover:border-gray-400"
                                : "border-gray-200 bg-gray-50"
                            }`}
                            onDragOver={
                              slotsAvailable ? handleUploadDragOver : undefined
                            }
                            onDragEnter={
                              slotsAvailable ? handleUploadDragEnter : undefined
                            }
                            onDragLeave={
                              slotsAvailable ? handleUploadDragLeave : undefined
                            }
                            onDrop={
                              slotsAvailable
                                ? (e) =>
                                    handleUploadDrop(
                                      e,
                                      "images",
                                      variants[0]?.id
                                    )
                                : undefined
                            }
                          >
                            <Upload
                              className={`h-6 w-6 mb-2 ${
                                slotsAvailable
                                  ? "text-gray-400"
                                  : "text-gray-300"
                              }`}
                            />
                            <p
                              className={`text-[10px] font-medium font-['Montserrat'] text-center px-2 ${
                                slotsAvailable
                                  ? "text-[#111111]"
                                  : "text-gray-400"
                              }`}
                            >
                              {slotsAvailable
                                ? "Drop your image here PNG, JPEG allowed"
                                : "All slots occupied"}
                            </p>
                          </div>
                        </label>
                      );
                    })()}
                    {/* Upload Progress Loader for Images */}
                    <UploadProgressLoader
                      files={variants[0]?.images || []}
                      uploadStatus={variants[0]?.uploadStatus?.images || []}
                      onRemoveFile={(fileId) =>
                        removeFile(variants[0]?.id, fileId, "images")
                      }
                      onRetryUpload={(fileId) =>
                        retryUpload(fileId, "images")
                      }
                      type="images"
                      maxDisplay={5}
                    />
                  </div>

                  <div>
                    <h4 className="text-[21px] font-medium text-[#111111] font-['Montserrat'] mb-3">
                      Upload Videos
                    </h4>
                    {(() => {
                      const variant = variants[0];
                      const combinedMedia = getCombinedMedia(variant?.id);
                      const currentMediaCount = combinedMedia.length;
                      const maxSlots = variant?.maxImageSlots || 5;
                      const slotsAvailable = maxSlots - currentMediaCount > 0;

                      return (
                        <label
                          className={`cursor-pointer ${
                            !slotsAvailable
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <input
                            type="file"
                            multiple
                            accept="video/*,.blend"
                            className="hidden"
                            disabled={!slotsAvailable}
                            onChange={(e) =>
                              slotsAvailable &&
                              handleImageUpload(
                                variants[0]?.id,
                                e.target.files,
                                "videos"
                              )
                            }
                          />
                          <div
                            className={`w-[185px] h-[96px] border border-dashed rounded flex flex-col items-center justify-center transition-colors ${
                              slotsAvailable
                                ? "border-gray-300 hover:border-gray-400"
                                : "border-gray-200 bg-gray-50"
                            }`}
                            onDragOver={
                              slotsAvailable ? handleUploadDragOver : undefined
                            }
                            onDragEnter={
                              slotsAvailable ? handleUploadDragEnter : undefined
                            }
                            onDragLeave={
                              slotsAvailable ? handleUploadDragLeave : undefined
                            }
                            onDrop={
                              slotsAvailable
                                ? (e) =>
                                    handleUploadDrop(
                                      e,
                                      "videos",
                                      variants[0]?.id
                                    )
                                : undefined
                            }
                          >
                            <Upload
                              className={`h-6 w-6 mb-2 ${
                                slotsAvailable
                                  ? "text-gray-400"
                                  : "text-gray-300"
                              }`}
                            />
                            <p
                              className={`text-[10px] font-medium font-['Montserrat'] text-center px-2 ${
                                slotsAvailable
                                  ? "text-[#111111]"
                                  : "text-gray-400"
                              }`}
                            >
                              {slotsAvailable
                                ? "Drop video here MP4, MOV, BLEND, etc."
                                : "All slots occupied"}
                            </p>
                          </div>
                        </label>
                      );
                    })()}
                    {/* Upload Progress Loader for Videos */}
                    <UploadProgressLoader
                      files={variants[0]?.videos || []}
                      uploadStatus={variants[0]?.uploadStatus?.videos || []}
                      onRemoveFile={(fileId) =>
                        removeFile(variants[0]?.id, fileId, "videos")
                      }
                      onRetryUpload={(fileId) =>
                        retryUpload(fileId, "videos")
                      }
                      type="videos"
                      maxDisplay={5}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* Dynamic Filter Section for Variant 1 */}
          <div className="mt-12 py-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-black mb-2 font-['Montserrat']">
                  Variant 1 Filters
                </h3>
                <p className="text-sm text-gray-600 font-['Montserrat']">
                  Assign filters to help customers find this variant
                </p>
              </div>
              {Object.values(variants[0]?.filters || {}).some(v => v) && (
                <button
                  onClick={() => handleVariantClearFilters(variants[0]?.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            {filterLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Dynamic Filter Dropdowns for Variant 1 */}
                {availableFilters.map((filter) => {
                  const filterKey = filter.key.toLowerCase();
                  return (
                    <div key={filter._id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-3 font-['Montserrat'] capitalize">
                        {filter.key}
                      </label>
                      <select
                        value={(variants[0]?.filters && variants[0]?.filters[filterKey]) || ''}
                        onChange={(e) => handleVariantFilterSelect(variants[0]?.id, filterKey, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-['Montserrat'] bg-gray-50"
                      >
                        <option value="">Select {filter.key}</option>
                        {filter.values.map((value, index) => (
                          <option key={index} value={value.name}>
                            {value.name}
                          </option>
                        ))}
                      </select>
                      {variants[0]?.filters && variants[0]?.filters[filterKey] && (
                        <div className="mt-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-xs text-blue-600 font-medium mb-1">Selected:</div>
                          <div className="text-sm text-blue-800 font-['Montserrat']">
                            {variants[0]?.filters[filterKey]}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selected Filters Summary for Variant 1 */}
            {Object.values(variants[0]?.filters || {}).some(v => v) && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-3 font-['Montserrat']">
                  Applied Filters for Variant 1:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(variants[0]?.filters || {}).map(([key, value]) => {
                    if (!value) return null;
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {key}: {value}
                        <button
                          onClick={() => handleVariantFilterSelect(variants[0]?.id, key, '')}
                          className="ml-2 hover:text-blue-600"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {filterError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-['Montserrat']">
                  Error loading filters: {filterError}
                </p>
              </div>
            )}
          </div>

          {/* Additional Variants Section */}
          {variants.slice(1).map((variant, index) => {
            const variantNumber = index + 2;
            return (
              <div
                key={variant.id}
                className="mt-12 py-6 border-t border-gray-200"
              >
                <h2 className="text-[32px] font-bold text-[#111111] font-['Montserrat'] leading-[24px] mb-8">
                  Variant {variantNumber}
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Left Column - Variant Details */}
                  <div className="col-span-3 space-y-6">
                    {/* Nesting Options */}
                    <div className="mb-6">
                      <label className="block text-[14px] font-medium text-[#111111] font-['Montserrat'] mb-3">
                        Variant {variantNumber} Options
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-4 flex-wrap">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                nestingOptions[variant.id] ===
                                  "sameAsArticle1" ||
                                nestingOptions[variant.id]?.includes?.(
                                  "sameAsArticle1"
                                )
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleNestingOptionChange(
                                    variant.id,
                                    "sameAsArticle1"
                                  );
                                } else {
                                  handleNestingOptionChange(variant.id, "");
                                }
                              }}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-[14px] text-[#111111] font-['Montserrat']">
                              Same as article 1
                            </span>
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-4 ml-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                nestingOptions[variant.id]?.includes?.(
                                  "title"
                                ) || false
                              }
                              onChange={(e) =>
                                handleIndividualNestingChange(
                                  variant.id,
                                  "title",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-[14px] text-[#111111] font-['Montserrat']">
                              Title
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                nestingOptions[variant.id]?.includes?.(
                                  "description"
                                ) || false
                              }
                              onChange={(e) =>
                                handleIndividualNestingChange(
                                  variant.id,
                                  "description",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-[14px] text-[#111111] font-['Montserrat']">
                              Description
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                nestingOptions[variant.id]?.includes?.(
                                  "manufacturingDetails"
                                ) || false
                              }
                              onChange={(e) =>
                                handleIndividualNestingChange(
                                  variant.id,
                                  "manufacturingDetails",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-[14px] text-[#111111] font-['Montserrat']">
                              Manufacturing details
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                nestingOptions[variant.id]?.includes?.(
                                  "shippingReturns"
                                ) || false
                              }
                              onChange={(e) =>
                                handleIndividualNestingChange(
                                  variant.id,
                                  "shippingReturns",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-[14px] text-[#111111] font-['Montserrat']">
                              Shipping returns and exchange
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                nestingOptions[variant.id]?.includes?.(
                                  "regularPrice"
                                ) || false
                              }
                              onChange={(e) =>
                                handleIndividualNestingChange(
                                  variant.id,
                                  "regularPrice",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-[14px] text-[#111111] font-['Montserrat']">
                              Regular price
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                nestingOptions[variant.id]?.includes?.(
                                  "salePrice"
                                ) || false
                              }
                              onChange={(e) =>
                                handleIndividualNestingChange(
                                  variant.id,
                                  "salePrice",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-[14px] text-[#111111] font-['Montserrat']">
                              Sale price
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                nestingOptions[variant.id]?.includes?.(
                                  "stockSize"
                                ) || false
                              }
                              onChange={(e) =>
                                handleIndividualNestingChange(
                                  variant.id,
                                  "stockSize",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-[14px] text-[#111111] font-['Montserrat']">
                              Stock size
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Product Name */}
                    <div>
                      <label className="block text-[14px] font-medium text-[#111111] font-['Montserrat'] mb-2">
                        product name
                      </label>
                      <div className="w-full max-w-[400px]">
                        <input
                          type="text"
                          value={variant.productName || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variant.id,
                              "productName",
                              e.target.value
                            )
                          }
                          className="w-full h-[40px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[14px] bg-white font-['Montserrat']"
                          placeholder={`Enter product name for variant ${variantNumber}`}
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-[14px] font-medium text-[#111111] font-['Montserrat'] mb-2">
                        Title
                      </label>
                      <div className="w-full max-w-[400px]">
                        <input
                          type="text"
                          value={variant.title || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variant.id,
                              "title",
                              e.target.value
                            )
                          }
                          className="w-full h-[40px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[14px] bg-white font-['Montserrat']"
                          placeholder={`Enter title for variant ${variantNumber}`}
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[14px] font-medium text-[#111111] font-['Montserrat'] mb-2">
                        Description
                      </label>
                      <div className="w-full max-w-[500px]">
                        <textarea
                          value={variant.description || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variant.id,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full h-[100px] px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 text-[14px] bg-white font-['Montserrat']"
                          placeholder={`Enter description for variant ${variantNumber}`}
                        />
                      </div>
                    </div>

                    {/* Manufacturing Details */}
                    <div>
                      <label className="block text-[14px] font-medium text-[#111111] font-['Montserrat'] mb-2">
                        Manufacturing details
                      </label>
                      <div className="w-full max-w-[500px]">
                        <textarea
                          value={variant.manufacturingDetails || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variant.id,
                              "manufacturingDetails",
                              e.target.value
                            )
                          }
                          className="w-full h-[100px] px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 text-[14px] bg-white font-['Montserrat']"
                          placeholder={`Enter manufacturing details for variant ${variantNumber}`}
                        />
                      </div>
                    </div>

                    {/* Shipping Returns */}
                    <div>
                      <label className="block text-[14px] font-medium text-[#111111] font-['Montserrat'] mb-2">
                        Shipping returns and exchange
                      </label>
                      <div className="w-full max-w-[500px]">
                        <textarea
                          value={variant.shippingReturns || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variant.id,
                              "shippingReturns",
                              e.target.value
                            )
                          }
                          className="w-full h-[100px] px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 text-[14px] bg-white font-['Montserrat']"
                          placeholder={`Enter shipping and returns policy for variant ${variantNumber}`}
                        />
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-6 mb-6 max-w-[400px]">
                      <div>
                        <label className="block text-[14px] font-medium text-[#111111] font-['Montserrat'] mb-2">
                          Regular price
                        </label>
                        <input
                          type="number"
                          value={variant.regularPrice || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variant.id,
                              "regularPrice",
                              e.target.value
                            )
                          }
                          className="w-full h-[40px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[14px] bg-white font-['Montserrat']"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-[14px] font-medium text-[#111111] font-['Montserrat'] mb-2">
                          Sale price
                        </label>
                        <input
                          type="number"
                          value={variant.salePrice || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variant.id,
                              "salePrice",
                              e.target.value
                            )
                          }
                          className="w-full h-[40px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[14px] bg-white font-['Montserrat']"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Stock Size Section for Variant */}
                    <div className="mb-6">
                      <label className="block text-[14px] font-medium text-[#111111] font-['Montserrat'] mb-2">
                        Stock size - Variant {variantNumber}
                      </label>

                      {/* Stock Size Options */}
                      <div className="flex items-center gap-4 mb-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleVariantStockSizeOption(variant.id, "noSize")
                          }
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            (variant.stockSizeOption || "sizes") === "noSize"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          No Size
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleVariantStockSizeOption(variant.id, "sizes")
                          }
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            (variant.stockSizeOption || "sizes") === "sizes"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Add Size
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleVariantImportExcel(variant.id, "sizes")
                          }
                          className="px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                          Import Excel
                        </button>
                      </div>

                      {(variant.stockSizeOption || "sizes") === "sizes" && (
                        <>
                          {/* Add Custom Size Button */}
                          <button
                            type="button"
                            onClick={() =>
                              handleVariantCustomSizeAdd(variant.id)
                            }
                            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            Add Custom Size
                          </button>

                          {/* Custom Sizes Table */}
                          {(variant.customSizes || []).length > 0 && (
                            <div className="overflow-x-auto mb-4">
                              <table className="min-w-full border border-gray-300 rounded-lg">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Size
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Quantity
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      HSN
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      SKU
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Barcode
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Amazon
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Flipkart
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Myntra
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Nykaa
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Yoraa
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {(variant.customSizes || []).map(
                                    (sizeData, index) => (
                                      <tr key={index}>
                                        <td className="px-3 py-2">
                                          <input
                                            type="text"
                                            value={sizeData.size}
                                            onChange={(e) =>
                                              handleVariantCustomSizeChange(
                                                variant.id,
                                                index,
                                                "size",
                                                e.target.value
                                              )
                                            }
                                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                            placeholder="Size"
                                          />
                                        </td>
                                        <td className="px-3 py-2">
                                          <input
                                            type="number"
                                            value={sizeData.quantity}
                                            onChange={(e) =>
                                              handleVariantCustomSizeChange(
                                                variant.id,
                                                index,
                                                "quantity",
                                                e.target.value
                                              )
                                            }
                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                            placeholder="Qty"
                                          />
                                        </td>
                                        <td className="px-3 py-2">
                                          <input
                                            type="text"
                                            value={sizeData.hsn}
                                            onChange={(e) =>
                                              handleVariantCustomSizeChange(
                                                variant.id,
                                                index,
                                                "hsn",
                                                e.target.value
                                              )
                                            }
                                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                                            placeholder="HSN"
                                          />
                                        </td>
                                        <td className="px-3 py-2">
                                          <input
                                            type="text"
                                            value={sizeData.sku}
                                            onChange={(e) =>
                                              handleVariantCustomSizeChange(
                                                variant.id,
                                                index,
                                                "sku",
                                                e.target.value
                                              )
                                            }
                                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                                            placeholder="SKU"
                                          />
                                        </td>
                                        <td className="px-3 py-2">
                                          <input
                                            type="text"
                                            value={sizeData.barcode}
                                            onChange={(e) =>
                                              handleVariantCustomSizeChange(
                                                variant.id,
                                                index,
                                                "barcode",
                                                e.target.value
                                              )
                                            }
                                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                                            placeholder="Barcode"
                                          />
                                        </td>
                                        <td className="px-3 py-2">
                                          <input
                                            type="number"
                                            value={sizeData.prices.amazon}
                                            onChange={(e) =>
                                              handleVariantCustomSizeChange(
                                                variant.id,
                                                index,
                                                "prices",
                                                {
                                                  ...sizeData.prices,
                                                  amazon: e.target.value,
                                                }
                                              )
                                            }
                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                            placeholder="Price"
                                          />
                                        </td>
                                        <td className="px-3 py-2">
                                          <input
                                            type="number"
                                            value={sizeData.prices.flipkart}
                                            onChange={(e) =>
                                              handleVariantCustomSizeChange(
                                                variant.id,
                                                index,
                                                "prices",
                                                {
                                                  ...sizeData.prices,
                                                  flipkart: e.target.value,
                                                }
                                              )
                                            }
                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                            placeholder="Price"
                                          />
                                        </td>
                                        <td className="px-3 py-2">
                                          <input
                                            type="number"
                                            value={sizeData.prices.myntra}
                                            onChange={(e) =>
                                              handleVariantCustomSizeChange(
                                                variant.id,
                                                index,
                                                "prices",
                                                {
                                                  ...sizeData.prices,
                                                  myntra: e.target.value,
                                                }
                                              )
                                            }
                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                            placeholder="Price"
                                          />
                                        </td>
                                        <td className="px-3 py-2">
                                          <input
                                            type="number"
                                            value={sizeData.prices.nykaa}
                                            onChange={(e) =>
                                              handleVariantCustomSizeChange(
                                                variant.id,
                                                index,
                                                "prices",
                                                {
                                                  ...sizeData.prices,
                                                  nykaa: e.target.value,
                                                }
                                              )
                                            }
                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                            placeholder="Price"
                                          />
                                        </td>
                                        <td className="px-3 py-2">
                                          <input
                                            type="number"
                                            value={sizeData.prices.yoraa}
                                            onChange={(e) =>
                                              handleVariantCustomSizeChange(
                                                variant.id,
                                                index,
                                                "prices",
                                                {
                                                  ...sizeData.prices,
                                                  yoraa: e.target.value,
                                                }
                                              )
                                            }
                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                            placeholder="Price"
                                          />
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Meta Data Fields for Variant */}
                    <div className="space-y-4 mt-6">
                      <h3 className="text-lg font-semibold text-[#111111] font-['Montserrat']">
                        Meta Data Fields
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#111111] font-['Montserrat'] mb-2">
                          Meta Title
                        </label>
                        <input
                          type="text"
                          value={variant.metaTitle || ""}
                          onChange={(e) =>
                            handleVariantChange(variantNumber, "metaTitle", e.target.value)
                          }
                          className="w-full max-w-[400px] h-[42px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-['Montserrat']"
                          placeholder="Enter meta title for SEO"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#111111] font-['Montserrat'] mb-2">
                          Meta Description
                        </label>
                        <textarea
                          value={variant.metaDescription || ""}
                          onChange={(e) =>
                            handleVariantChange(variantNumber, "metaDescription", e.target.value)
                          }
                          rows={3}
                          className="w-full max-w-[400px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-['Montserrat']"
                          placeholder="Enter meta description for SEO"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#111111] font-['Montserrat'] mb-2">
                          Slug URL
                        </label>
                        <input
                          type="text"
                          value={variant.slugUrl || ""}
                          onChange={(e) =>
                            handleVariantChange(variantNumber, "slugUrl", e.target.value)
                          }
                          className="w-full max-w-[400px] h-[42px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-['Montserrat']"
                          placeholder="product-slug-url"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Variant Images */}
                  <div className="space-y-6">
                    <h3 className="text-[24px] font-bold text-[#111111] font-['Montserrat']">
                      Variant {variantNumber} Images
                    </h3>

                    {/* Main Product Image and Additional Images Grid */}
                    <div className="space-y-4">
                      {/* Main Product Image */}
                      <div className="w-[276px] h-[286px] bg-gray-100 rounded border overflow-hidden relative">
                        {variant.images && variant.images.length > 0 ? (
                          <>
                            <img
                              src={variant.images[0].url}
                              alt={`Variant ${variantNumber} main view`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                              Main
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <span className="text-gray-400 text-sm font-['Montserrat']">
                              Main Product Image
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Additional Images Grid (5 slots initially, expandable) */}
                      <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: variant.maxImageSlots || 5 }).map(
                          (_, index) => {
                            const imageIndex = index + 1; // Skip main image (index 0)
                            const image = variant.images?.[imageIndex];

                            return (
                              <div
                                key={`slot-${index}`}
                                className="w-[52px] h-[52px] bg-gray-100 rounded border overflow-hidden relative group cursor-pointer"
                                draggable={!!image}
                                onDragStart={(e) => {
                                  if (image) {
                                    e.dataTransfer.setData(
                                      "text/plain",
                                      imageIndex.toString()
                                    );
                                    e.dataTransfer.setData(
                                      "variant-id",
                                      variant.id.toString()
                                    );
                                    e.dataTransfer.setData("type", "images");
                                  }
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const dragIndex = parseInt(
                                    e.dataTransfer.getData("text/plain")
                                  );
                                  const dragVariantId = parseInt(
                                    e.dataTransfer.getData("variant-id")
                                  );
                                  const dragType =
                                    e.dataTransfer.getData("type");

                                  if (
                                    dragVariantId === variant.id &&
                                    dragType === "images" &&
                                    dragIndex !== imageIndex
                                  ) {
                                    reorderFiles(
                                      variant.id,
                                      "images",
                                      dragIndex,
                                      imageIndex
                                    );
                                  }
                                }}
                              >
                                {image ? (
                                  <>
                                    <img
                                      src={image.url}
                                      alt={`Variant ${variantNumber} view ${
                                        index + 1
                                      }`}
                                      className="w-full h-full object-cover"
                                    />
                                    <button
                                      onClick={() =>
                                        removeFile(
                                          variant.id,
                                          image.id,
                                          "images"
                                        )
                                      }
                                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="w-2 h-2" />
                                    </button>
                                    <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-[10px] text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      Drag
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-50 border-dashed border-gray-300 border-2">
                                    <Plus className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>

                      {/* Add More Images Button with Status */}
                      {(() => {
                        const currentImageCount = variant?.images?.length || 0;
                        const maxSlots = variant?.maxImageSlots || 5;
                        const canAddMoreSlots = currentImageCount >= 4; // Need at least 4 images before adding more slots
                        const slotsAvailable = maxSlots - currentImageCount > 0;

                        if (maxSlots === 5 && currentImageCount >= 5) {
                          // All 5 default slots are used
                          return (
                            <div className="space-y-2">
                              <div className="text-sm text-gray-600 font-['Montserrat']">
                                All 5 default slots used ({currentImageCount}/
                                {maxSlots})
                              </div>
                              <button
                                onClick={() => addMoreImageSlots(variant.id)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-['Montserrat'] flex items-center gap-1"
                              >
                                <Plus className="w-4 h-4" />
                                Add Additional Slot
                              </button>
                            </div>
                          );
                        } else if (maxSlots === 5 && canAddMoreSlots) {
                          // Can add more slots (4+ images uploaded)
                          return (
                            <div className="space-y-2">
                              <div className="text-sm text-gray-600 font-['Montserrat']">
                                Images uploaded: {currentImageCount}/5 default
                                slots
                              </div>
                              <button
                                onClick={() => addMoreImageSlots(variant.id)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-['Montserrat'] flex items-center gap-1"
                              >
                                <Plus className="w-4 h-4" />
                                Add Additional Slot
                              </button>
                            </div>
                          );
                        } else if (maxSlots > 5) {
                          // Additional slots already added
                          return (
                            <div className="space-y-2">
                              <div className="text-sm text-gray-600 font-['Montserrat']">
                                Images uploaded: {currentImageCount}/{maxSlots}{" "}
                                slots (5 default + {maxSlots - 5} additional)
                              </div>
                              {!slotsAvailable && (
                                <button
                                  onClick={() => addMoreImageSlots(variant.id)}
                                  className="text-blue-600 hover:text-blue-700 text-sm font-['Montserrat'] flex items-center gap-1"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Another Slot
                                </button>
                              )}
                            </div>
                          );
                        } else {
                          // Less than 4 images, cannot add more slots yet
                          return (
                            <div className="space-y-2">
                              <div className="text-sm text-gray-600 font-['Montserrat']">
                                Images uploaded: {currentImageCount}/5 default
                                slots
                              </div>
                              <div className="text-xs text-gray-500 font-['Montserrat']">
                                Upload at least 4 images to enable additional
                                slots
                              </div>
                            </div>
                          );
                        }
                      })()}

                      {/* Videos Grid if any */}
                      {variant.videos && variant.videos.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[14px] font-medium text-[#111111] font-['Montserrat']">
                            Videos
                          </h4>
                          <div className="grid grid-cols-5 gap-2">
                            {variant.videos.map((video, index) => (
                              <div
                                key={video.id}
                                className="w-[52px] h-[52px] bg-gray-100 rounded border overflow-hidden relative group cursor-move"
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData(
                                    "text/plain",
                                    index.toString()
                                  );
                                  e.dataTransfer.setData(
                                    "variant-id",
                                    variant.id.toString()
                                  );
                                  e.dataTransfer.setData("type", "videos");
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const dragIndex = parseInt(
                                    e.dataTransfer.getData("text/plain")
                                  );
                                  const dragVariantId = parseInt(
                                    e.dataTransfer.getData("variant-id")
                                  );
                                  const dragType =
                                    e.dataTransfer.getData("type");

                                  if (
                                    dragVariantId === variant.id &&
                                    dragType === "videos" &&
                                    dragIndex !== index
                                  ) {
                                    reorderFiles(
                                      variant.id,
                                      "videos",
                                      dragIndex,
                                      index
                                    );
                                  }
                                }}
                              >
                                <video
                                  src={video.url}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  onClick={() =>
                                    removeFile(variant.id, video.id, "videos")
                                  }
                                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-2 h-2" />
                                </button>
                                <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-[8px] text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  Video
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Upload Section */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[14px] font-medium text-[#111111] font-['Montserrat'] mb-3">
                          Upload image
                        </h4>
                        {(() => {
                          const currentImageCount =
                            variant?.images?.length || 0;
                          const maxSlots = variant?.maxImageSlots || 5;
                          const slotsAvailable =
                            maxSlots - currentImageCount > 0;

                          return (
                            <label
                              className={`cursor-pointer ${
                                !slotsAvailable
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                disabled={!slotsAvailable}
                                onChange={(e) =>
                                  slotsAvailable &&
                                  handleImageUpload(
                                    variant.id,
                                    e.target.files,
                                    "images"
                                  )
                                }
                              />
                              <div
                                className={`w-[185px] h-[96px] border border-dashed rounded flex flex-col items-center justify-center transition-colors ${
                                  slotsAvailable
                                    ? "border-gray-300 hover:border-gray-400"
                                    : "border-gray-200 bg-gray-50"
                                }`}
                                onDragOver={
                                  slotsAvailable
                                    ? handleUploadDragOver
                                    : undefined
                                }
                                onDragEnter={
                                  slotsAvailable
                                    ? handleUploadDragEnter
                                    : undefined
                                }
                                onDragLeave={
                                  slotsAvailable
                                    ? handleUploadDragLeave
                                    : undefined
                                }
                                onDrop={
                                  slotsAvailable
                                    ? (e) =>
                                        handleUploadDrop(
                                          e,
                                          "images",
                                          variant.id
                                        )
                                    : undefined
                                }
                              >
                                <Upload
                                  className={`h-6 w-6 mb-2 ${
                                    slotsAvailable
                                      ? "text-gray-400"
                                      : "text-gray-300"
                                  }`}
                                />
                                <p
                                  className={`text-[10px] font-medium font-['Montserrat'] text-center px-2 ${
                                    slotsAvailable
                                      ? "text-[#111111]"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {slotsAvailable
                                    ? "Drop your image here PNG. JPEG allowed"
                                    : "All slots occupied"}
                                </p>
                              </div>
                            </label>
                          );
                        })()}
                        {/* Upload Progress Loader for Images */}
                        <UploadProgressLoader
                          files={variant.images || []}
                          uploadStatus={variant.uploadStatus?.images || []}
                          onRemoveFile={(fileId) =>
                            removeFile(variant.id, fileId, "images")
                          }
                          onRetryUpload={(fileId) =>
                            retryUpload(fileId, "images")
                          }
                          type="images"
                          maxDisplay={5}
                        />
                      </div>

                      <div>
                        <h4 className="text-[14px] font-medium text-[#111111] font-['Montserrat'] mb-3">
                          Upload video
                        </h4>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            multiple
                            accept="video/*,.blend"
                            className="hidden"
                            onChange={(e) =>
                              handleImageUpload(
                                variant.id,
                                e.target.files,
                                "videos"
                              )
                            }
                          />
                          <div
                            className="w-[185px] h-[96px] border border-dashed border-gray-300 rounded flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
                            onDragOver={handleUploadDragOver}
                            onDragEnter={handleUploadDragEnter}
                            onDragLeave={handleUploadDragLeave}
                            onDrop={(e) =>
                              handleUploadDrop(e, "videos", variant.id)
                            }
                          >
                            <Upload className="h-6 w-6 text-gray-400 mb-2" />
                            <p className="text-[10px] font-medium text-[#111111] font-['Montserrat'] text-center px-2">
                              Drop video here MP4, MOV, BLEND, etc.
                            </p>
                          </div>
                        </label>
                        {/* Upload Progress Loader for Videos */}
                        <UploadProgressLoader
                          files={variant.videos || []}
                          uploadStatus={variant.uploadStatus?.videos || []}
                          onRemoveFile={(fileId) =>
                            removeFile(variant.id, fileId, "videos")
                          }
                          onRetryUpload={(fileId) =>
                            retryUpload(fileId, "videos")
                          }
                          type="videos"
                          maxDisplay={5}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Variant-specific Product Filters */}
                <div className="mt-8 py-6 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-black mb-2 font-['Montserrat']">
                        Variant {variantNumber} Filters
                      </h3>
                      <p className="text-sm text-gray-600 font-['Montserrat']">
                        Assign filters to help customers find this variant
                      </p>
                    </div>
                    {Object.values(variant.filters || {}).some(v => v) && (
                      <button
                        onClick={() => handleVariantClearFilters(variant.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>

                  {filterLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Dynamic Filter Dropdowns for Variant */}
                      {availableFilters.map((filter) => {
                        const filterKey = filter.key.toLowerCase();
                        return (
                          <div key={filter._id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-3 font-['Montserrat'] capitalize">
                              {filter.key}
                            </label>
                            <select
                              value={(variant.filters && variant.filters[filterKey]) || ''}
                              onChange={(e) => handleVariantFilterSelect(variant.id, filterKey, e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-['Montserrat'] bg-gray-50"
                            >
                              <option value="">Select {filter.key}</option>
                              {filter.values.map((value, index) => (
                                <option key={index} value={value.name}>
                                  {value.name}
                                </option>
                              ))}
                            </select>
                            {variant.filters && variant.filters[filterKey] && (
                              <div className="mt-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="text-xs text-blue-600 font-medium mb-1">Selected:</div>
                                <div className="text-sm text-blue-800 font-['Montserrat']">
                                  {variant.filters[filterKey]}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Selected Filters Summary for Variant */}
                  {Object.values(variant.filters || {}).some(v => v) && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-800 mb-3 font-['Montserrat']">
                        Applied Filters for Variant {variantNumber}:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(variant.filters || {}).map(([key, value]) => {
                          if (!value) return null;
                          return (
                            <span
                              key={key}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {key}: {value}
                              <button
                                onClick={() => handleVariantFilterSelect(variant.id, key, '')}
                                className="ml-2 hover:text-blue-600"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {filterError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 font-['Montserrat']">
                        Error loading filters: {filterError}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Dynamic Add More Variants Button - appears after variants and before size charts */}
          <div className="mt-8 py-4 flex justify-center">
            <button
              type="button"
              onClick={addMoreVariants}
              className="px-8 py-3 bg-[#000AFF] text-white rounded-lg text-[16px] font-medium font-['Montserrat'] hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add More Variants
            </button>
          </div>

          {/* Also Show In Section - Common for all variants */}
          <div className="mt-12 py-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold text-[#111111] font-['Montserrat']">
                Also Show in
              </h3>
              <button
                type="button"
                onClick={addAlsoShowInOption}
                className="px-4 py-2 bg-[#000AFF] text-white rounded-lg text-[14px] font-medium font-['Montserrat'] hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Option
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dynamicAlsoShowInOptions.map((option) => (
                <div
                  key={option.id}
                  className="space-y-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    {option.isCustom ? (
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) =>
                          updateAlsoShowInLabel(option.id, e.target.value)
                        }
                        className="text-[14px] font-medium text-[#000000] font-['Montserrat'] border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 flex-1 mr-2"
                        placeholder="Enter option name"
                      />
                    ) : (
                      <span className="text-[14px] font-medium text-[#000000] font-['Montserrat']">
                        {option.label}
                      </span>
                    )}

                    {option.isCustom && (
                      <button
                        type="button"
                        onClick={() => removeAlsoShowInOption(option.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                        title="Remove option"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleAlsoShowInChange(option.id, "value", "yes")
                      }
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        alsoShowInOptions[option.id]?.value === "yes"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAlsoShowInChange(option.id, "value", "no")
                      }
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        alsoShowInOptions[option.id]?.value === "no"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      No
                    </button>

                    {/* Make Permanent Button - only show for custom options */}
                    {option.isCustom && !option.isPermanent && (
                      <button
                        type="button"
                        onClick={() => handleMakePermanent(option)}
                        className="px-3 py-2 bg-red-500 text-white rounded-md text-xs font-medium hover:bg-red-600 transition-colors whitespace-nowrap"
                      >
                        make this a permanent option
                      </button>
                    )}

                    {/* Permanent indicator */}
                    {option.isPermanent && (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Permanent
                        </span>
                        <button
                          type="button"
                          onClick={() => handleEditPermanentOption(option)}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
                          title="Edit permanent option"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePermanentOption(option)}
                          className="flex items-center gap-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors"
                          title="Delete permanent option"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Visual indicator when options are selected */}
            {dynamicAlsoShowInOptions.some(
              (option) => alsoShowInOptions[option.id]?.value === "yes"
            ) && (
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 font-['Montserrat'] mb-2">
                  Active Options:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {dynamicAlsoShowInOptions
                    .filter(
                      (option) => alsoShowInOptions[option.id]?.value === "yes"
                    )
                    .map((option) => (
                      <span
                        key={option.id}
                        className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-['Montserrat']"
                      >
                        {option.label}
                      </span>
                    ))}
                </div>
                <p className="text-sm text-blue-700 font-['Montserrat'] mt-2">
                  These options will be applied to all variants of this product
                </p>
              </div>
            )}

            {/* Permanent Options Management */}
            {permanentOptions.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 rounded-md">
                <h4 className="text-sm font-medium text-green-800 font-['Montserrat'] mb-3">
                  Permanent Options:
                </h4>
                <div className="space-y-3">
                  {permanentOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between bg-white p-4 rounded-lg border border-green-200 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Permanent
                        </span>
                        <span className="text-sm font-medium text-gray-900 font-['Montserrat']">
                          {option.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditPermanentOption(option)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-medium transition-colors font-['Montserrat']"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePermanentOption(option)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs font-medium transition-colors font-['Montserrat']"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-green-700 font-['Montserrat'] mt-3">
                  These options are saved permanently and will be available for
                  future products.
                </p>
              </div>
            )}
          </div>

          {/* Common Size Chart Section - Only show when stockSizeOption is not 'noSize' */}
          {stockSizeOption !== "noSize" && (
            <div className="mt-12 py-6 border-t border-gray-200">
              <h3 className="text-[18px] font-bold text-[#111111] font-['Montserrat'] mb-6">
                Common Size Chart
              </h3>
              <div className="grid grid-cols-3 gap-6">
                {/* CM Chart */}
                <div>
                  <label className="block text-[14px] font-medium text-[#111111] font-['Montserrat'] mb-3">
                    Size Chart (CM)
                  </label>
                  <div className="w-[150px] h-[120px] bg-gray-100 rounded border overflow-hidden mb-3">
                    {commonSizeChart.cmChart ? (
                      <img
                        src={URL.createObjectURL(commonSizeChart.cmChart)}
                        alt="CM chart"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-sm text-gray-500 font-['Montserrat']">
                          CM Chart
                        </span>
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleCommonSizeChartUpload(
                          "cmChart",
                          e.target.files[0]
                        )
                      }
                    />
                    <span className="text-sm text-blue-600 hover:text-blue-700 font-['Montserrat']">
                      Upload CM Chart
                    </span>
                  </label>
                  {/* Status indicator for CM chart */}
                  {commonSizeChart.uploadStatus.cmChart && (
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      {commonSizeChart.uploadStatus.cmChart.status ===
                        "uploading" && (
                        <>
                          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-blue-600">
                            Uploading...{" "}
                            {Math.round(
                              commonSizeChart.uploadStatus.cmChart.progress
                            )}
                            %
                          </span>
                        </>
                      )}
                      {commonSizeChart.uploadStatus.cmChart.status ===
                        "success" && (
                        <>
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-green-600">
                            Upload successful
                          </span>
                        </>
                      )}
                      {commonSizeChart.uploadStatus.cmChart.status ===
                        "failed" && (
                        <>
                          <XCircle className="w-3 h-3 text-red-500" />
                          <span className="text-red-600">Upload failed</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Inch Chart */}
                <div>
                  <label className="block text-[14px] font-medium text-[#111111] font-['Montserrat'] mb-3">
                    Size Chart (Inches)
                  </label>
                  <div className="w-[150px] h-[120px] bg-gray-100 rounded border overflow-hidden mb-3">
                    {commonSizeChart.inchChart ? (
                      <img
                        src={URL.createObjectURL(commonSizeChart.inchChart)}
                        alt="Inch chart"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-sm text-gray-500 font-['Montserrat']">
                          Inch Chart
                        </span>
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleCommonSizeChartUpload(
                          "inchChart",
                          e.target.files[0]
                        )
                      }
                    />
                    <span className="text-sm text-blue-600 hover:text-blue-700 font-['Montserrat']">
                      Upload Inch Chart
                    </span>
                  </label>
                  {/* Status indicator for Inch chart */}
                  {commonSizeChart.uploadStatus.inchChart && (
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      {commonSizeChart.uploadStatus.inchChart.status ===
                        "uploading" && (
                        <>
                          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-blue-600">
                            Uploading...{" "}
                            {Math.round(
                              commonSizeChart.uploadStatus.inchChart.progress
                            )}
                            %
                          </span>
                        </>
                      )}
                      {commonSizeChart.uploadStatus.inchChart.status ===
                        "success" && (
                        <>
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-green-600">
                            Upload successful
                          </span>
                        </>
                      )}
                      {commonSizeChart.uploadStatus.inchChart.status ===
                        "failed" && (
                        <>
                          <XCircle className="w-3 h-3 text-red-500" />
                          <span className="text-red-600">Upload failed</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Measurement Guide */}
                <div>
                  <label className="block text-[14px] font-medium text-[#111111] font-['Montserrat'] mb-3">
                    How to Measure Guide
                  </label>
                  <div className="w-[150px] h-[120px] bg-gray-100 rounded border overflow-hidden mb-3">
                    {commonSizeChart.measurementGuide ? (
                      <img
                        src={URL.createObjectURL(
                          commonSizeChart.measurementGuide
                        )}
                        alt="Measurement guide"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-sm text-gray-500 font-['Montserrat']">
                          Guide
                        </span>
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleCommonSizeChartUpload(
                          "measurementGuide",
                          e.target.files[0]
                        )
                      }
                    />
                    <span className="text-sm text-blue-600 hover:text-blue-700 font-['Montserrat']">
                      Upload Guide
                    </span>
                  </label>
                  {/* Status indicator for Measurement guide */}
                  {commonSizeChart.uploadStatus.measurementGuide && (
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      {commonSizeChart.uploadStatus.measurementGuide.status ===
                        "uploading" && (
                        <>
                          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-blue-600">
                            Uploading...{" "}
                            {Math.round(
                              commonSizeChart.uploadStatus.measurementGuide
                                .progress
                            )}
                            %
                          </span>
                        </>
                      )}
                      {commonSizeChart.uploadStatus.measurementGuide.status ===
                        "success" && (
                        <>
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-green-600">
                            Upload successful
                          </span>
                        </>
                      )}
                      {commonSizeChart.uploadStatus.measurementGuide.status ===
                        "failed" && (
                        <>
                          <XCircle className="w-3 h-3 text-red-500" />
                          <span className="text-red-600">Upload failed</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Category Assignment Section */}
          <div className="mt-12 py-6 border-t border-gray-200">
            <h3 className="text-[18px] font-bold text-[#111111] font-['Montserrat'] mb-6">
              Category Assignment
            </h3>
            <div className="grid grid-cols-2 gap-6 max-w-[600px]">
              <div>
                <label className="block text-[14px] font-medium text-[#111111] font-['Montserrat'] mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={categoriesLoading}
                  className="w-full h-[40px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[14px] bg-white font-['Montserrat'] disabled:opacity-50"
                >
                  <option value="">
                    {categoriesLoading ? "Loading categories..." : "Select Category"}
                  </option>
                  {categories && Array.isArray(categories) && categories.map((category) => (
                    <option key={category._id || category.id} value={category._id || category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#111111] font-['Montserrat'] mb-2">
                  Subcategory
                </label>
                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  disabled={subCategoriesLoading || !selectedCategory}
                  className="w-full h-[40px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[14px] bg-white font-['Montserrat'] disabled:opacity-50"
                >
                  <option value="">
                    {subCategoriesLoading 
                      ? "Loading subcategories..." 
                      : !selectedCategory 
                        ? "Select category first"
                        : "Select Subcategory"
                    }
                  </option>
                  {subCategories && Array.isArray(subCategories) && subCategories.map((subCategory) => (
                    <option key={subCategory._id || subCategory.id} value={subCategory._id || subCategory.id}>
                      {subCategory.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {selectedCategory && selectedSubCategory && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800 font-['Montserrat']">
                  Category Path: {selectedCategory} → {selectedSubCategory}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex gap-4 flex-wrap">
            <button
              onClick={handleSaveAsDraft}
              disabled={createLoading}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg text-[16px] font-medium font-['Montserrat'] hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createLoading ? "Saving..." : "Save as Draft"}
            </button>
            
            <button
              onClick={handlePublishNow}
              disabled={createLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg text-[16px] font-medium font-['Montserrat'] hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createLoading ? "Publishing..." : "Publish Now"}
            </button>
            
            <button
              onClick={handleScheduleForLater}
              disabled={createLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg text-[16px] font-medium font-['Montserrat'] hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createLoading ? "Scheduling..." : "Schedule for Later"}
            </button>
            
            {/* Recheck Details Dropdown */}
            <div className="relative" ref={recheckDropdownRef}>
              <button
                onClick={toggleRecheckDropdown}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg text-[16px] font-medium font-['Montserrat'] hover:bg-yellow-600 transition-colors flex items-center gap-2"
              >
                Recheck Details
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isRecheckDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isRecheckDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] z-10 min-w-[218px]">
                  {/* Header */}
                  <div className="px-[21px] py-3 border-b border-gray-200">
                    <p className="font-['Montserrat'] font-medium text-[14px] text-[#bfbfbf] leading-[1.2]">
                      RECHECK DETAILS
                    </p>
                  </div>

                  {/* Options */}
                  <div className="py-2">
                    {[
                      "All DETAILS",
                      "All text",
                      "All IMAGES",
                      "SIZE CHART",
                    ].map((option, index) => (
                      <button
                        key={option}
                        onClick={() => handleRecheckOptionSelect(option)}
                        className={`w-full px-[21px] py-3 text-left font-['Montserrat'] text-[14px] text-[#000000] leading-[20px] hover:bg-gray-50 transition-colors ${
                          index < 3 ? "border-b border-gray-200" : ""
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Permanent Option Confirmation Modal */}
      {showPermanentConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 relative">
            <div className="p-6 text-center">
              <h2 className="text-lg font-bold text-black mb-6 leading-tight font-['Montserrat']">
                Are you sure you want to add this as permanent option
              </h2>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={confirmMakePermanent}
                  className="bg-black hover:bg-gray-800 text-white font-medium py-3 px-8 rounded-full transition-colors focus:outline-none font-['Montserrat']"
                >
                  yes
                </button>
                <button
                  onClick={cancelMakePermanent}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-8 rounded-full transition-colors focus:outline-none font-['Montserrat']"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Option Success Modal */}
      {showPermanentSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 relative">
            <div className="p-6 text-center">
              {/* Success checkmark icon */}
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
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

              <h2 className="text-lg font-bold text-black mb-6 leading-tight font-['Montserrat']">
                option added successfully!
              </h2>

              <button
                onClick={closePermanentSuccessModal}
                className="bg-black hover:bg-gray-800 text-white font-medium py-3 px-8 rounded-full transition-colors focus:outline-none font-['Montserrat']"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permanent Option Modal */}
      {showEditPermanentModal && editingPermanentOption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 relative">
            <div className="p-6">
              <h2 className="text-lg font-bold text-black mb-6 leading-tight font-['Montserrat']">
                Edit Permanent Option
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Montserrat']">
                  Option Label
                </label>
                <input
                  type="text"
                  value={editingPermanentOption.label}
                  onChange={(e) =>
                    setEditingPermanentOption((prev) => ({
                      ...prev,
                      label: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-['Montserrat']"
                  placeholder="Enter option label"
                />
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  onClick={cancelEditPermanentOption}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none font-['Montserrat']"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedPermanentOption}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none font-['Montserrat']"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Permanent Option Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmModal && deletingPermanentOption}
        onClose={cancelDeletePermanentOption}
        onConfirm={confirmDeletePermanentOption}
        title={`Are you sure you want to delete "${deletingPermanentOption?.label}"?`}
      />

      {/* Detailed Review Modal */}
      {showDetailedReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black font-['Montserrat']">
                Review All Details
              </h2>
              <button
                onClick={closeDetailedReviewModal}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Images and Size Chart Section */}
              <div className="mb-8">
                <h3 className="text-xl font-medium text-black mb-4 font-['Montserrat']">
                  Images and size chart
                </h3>

                {/* Uploaded Images */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-black mb-3 font-['Montserrat']">
                    Uploaded images
                  </h4>

                  {/* Display images from all variants */}
                  {variants.map((variant, variantIndex) => (
                    <div key={variant.id} className="mb-6">
                      <h5 className="text-md font-medium text-gray-700 mb-2 font-['Montserrat']">
                        {variant.name} ({variant.images?.length || 0} images)
                      </h5>
                      <div className="grid grid-cols-5 gap-4">
                        {variant.images && variant.images.length > 0 ? (
                          variant.images.map((image, imageIndex) => (
                            <div
                              key={image.id || imageIndex}
                              className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
                            >
                              <img
                                src={image.url}
                                alt={`${variant.name} - Image ${
                                  imageIndex + 1
                                }`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                          ))
                        ) : (
                          <div className="col-span-5 text-gray-400 text-sm text-center py-4">
                            No images uploaded for this variant
                          </div>
                        )}

                        {/* Fill remaining slots for better visualization */}
                        {variant.images &&
                          variant.images.length > 0 &&
                          variant.images.length < 5 &&
                          Array.from(
                            { length: 5 - variant.images.length },
                            (_, index) => (
                              <div
                                key={`empty-${variant.id}-${index}`}
                                className="aspect-square bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center"
                              >
                                <div className="text-gray-300 text-xs">
                                  Empty slot
                                </div>
                              </div>
                            )
                          )}
                      </div>
                    </div>
                  ))}

                  {/* Show message if no variants have images */}
                  {variants.every(
                    (variant) => !variant.images || variant.images.length === 0
                  ) && (
                    <div className="text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                      No images uploaded to any variants yet
                    </div>
                  )}
                </div>

                {/* Uploaded Videos */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-black mb-3 font-['Montserrat']">
                    Uploaded videos
                  </h4>

                  {/* Display videos from all variants */}
                  {variants.map((variant, variantIndex) => (
                    <div key={`videos-${variant.id}`} className="mb-6">
                      <h5 className="text-md font-medium text-gray-700 mb-2 font-['Montserrat']">
                        {variant.name} ({variant.videos?.length || 0} videos)
                      </h5>
                      <div className="grid grid-cols-3 gap-4">
                        {variant.videos && variant.videos.length > 0 ? (
                          variant.videos.map((video, videoIndex) => (
                            <div
                              key={video.id || videoIndex}
                              className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
                            >
                              <video
                                src={video.url}
                                controls
                                className="w-full h-full object-cover rounded-lg"
                                preload="metadata"
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-3 text-gray-400 text-sm text-center py-4">
                            No videos uploaded for this variant
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Show message if no variants have videos */}
                  {variants.every(
                    (variant) => !variant.videos || variant.videos.length === 0
                  ) && (
                    <div className="text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                      No videos uploaded to any variants yet
                    </div>
                  )}
                </div>

                {/* Uploaded Size Chart Images */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-black mb-3 font-['Montserrat']">
                    Uploaded Size chart images
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      {commonSizeChart.inchChart || sizeChart.inchChart ? (
                        <img
                          src={URL.createObjectURL(
                            commonSizeChart.inchChart || sizeChart.inchChart
                          )}
                          alt="Size Chart Inches"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-gray-400 text-sm text-center">
                          Size Chart
                          <br />
                          Inches
                        </div>
                      )}
                    </div>
                    <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      {commonSizeChart.cmChart || sizeChart.cmChart ? (
                        <img
                          src={URL.createObjectURL(
                            commonSizeChart.cmChart || sizeChart.cmChart
                          )}
                          alt="Size Chart CM"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-gray-400 text-sm text-center">
                          Size Chart
                          <br />
                          CM
                        </div>
                      )}
                    </div>
                    <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      {commonSizeChart.measurementGuide ||
                      sizeChart.measurementImage ? (
                        <img
                          src={URL.createObjectURL(
                            commonSizeChart.measurementGuide ||
                              sizeChart.measurementImage
                          )}
                          alt="How to Measure"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-gray-400 text-sm text-center">
                          How to
                          <br />
                          Measure
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Variant Details */}
              {variants.map((variant, index) => (
                <div
                  key={variant.id}
                  className="mb-8 border border-gray-200 rounded-lg p-6"
                >
                  <h3 className="text-2xl font-bold text-black mb-6 font-['Montserrat']">
                    Variant {index + 1}
                  </h3>

                  {/* Returnable */}
                  <div className="mb-6">
                    <label className="text-lg font-medium text-black font-['Montserrat'] block mb-2">
                      returnable
                    </label>
                    <div className="flex gap-4">
                      <button
                        className={`px-6 py-2 rounded-full font-medium font-['Montserrat'] ${
                          variant.returnable
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-black"
                        }`}
                      >
                        yes
                      </button>
                      <button
                        className={`px-6 py-2 rounded-full font-medium font-['Montserrat'] ${
                          !variant.returnable
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-black"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Product Name */}
                  <div className="mb-6">
                    <label className="text-lg font-medium text-black font-['Montserrat'] block mb-2">
                      product name
                    </label>
                    <div className="border-2 border-black rounded-lg p-3 bg-gray-50">
                      <span className="text-black font-['Montserrat']">
                        {productData.productName || "Not specified"}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="mb-6">
                    <label className="text-lg font-medium text-black font-['Montserrat'] block mb-2">
                      Title
                    </label>
                    <div className="border-2 border-black rounded-lg p-3 bg-gray-50">
                      <span className="text-black font-['Montserrat']">
                        {variant.title ||
                          productData.productName ||
                          "Not specified"}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label className="text-lg font-medium text-black font-['Montserrat'] block mb-2">
                      Description
                    </label>
                    <div className="border-2 border-black rounded-lg p-3 bg-gray-50 min-h-[100px]">
                      <span className="text-black font-['Montserrat']">
                        {variant.description ||
                          productData.description ||
                          "Not specified"}
                      </span>
                    </div>
                  </div>

                  {/* Manufacturing Details */}
                  <div className="mb-6">
                    <label className="text-lg font-medium text-black font-['Montserrat'] block mb-2">
                      Manufacturing details
                    </label>
                    <div className="border-2 border-black rounded-lg p-3 bg-gray-50 min-h-[100px]">
                      <span className="text-black font-['Montserrat']">
                        {variant.manufacturingDetails ||
                          productData.manufacturingDetails ||
                          "Not specified"}
                      </span>
                    </div>
                  </div>

                  {/* Shipping Returns and Exchange */}
                  <div className="mb-6">
                    <label className="text-lg font-medium text-black font-['Montserrat'] block mb-2">
                      Shipping returns and exchange
                    </label>
                    <div className="border-2 border-black rounded-lg p-3 bg-gray-50 min-h-[100px]">
                      <span className="text-black font-['Montserrat']">
                        {variant.shippingReturns ||
                          productData.shippingReturns ||
                          "Not specified"}
                      </span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="text-lg font-medium text-black font-['Montserrat'] block mb-2">
                        Regular price
                      </label>
                      <div className="border-2 border-black rounded-lg p-3 bg-gray-50">
                        <span className="text-black font-['Montserrat']">
                          {variant.regularPrice ||
                            productData.regularPrice ||
                            "Not specified"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-lg font-medium text-black font-['Montserrat'] block mb-2">
                        Sale price
                      </label>
                      <div className="border-2 border-black rounded-lg p-3 bg-gray-50">
                        <span className="text-black font-['Montserrat']">
                          {variant.salePrice ||
                            productData.salePrice ||
                            "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Size */}
                  <div className="mb-6">
                    <label className="text-lg font-medium text-black font-['Montserrat'] block mb-2">
                      Stock size
                    </label>
                    <div className="flex gap-4 mb-4">
                      <button
                        className={`px-4 py-2 rounded-lg font-medium font-['Montserrat'] ${
                          variant.stockSizeOption === "noSize"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-black"
                        }`}
                      >
                        No size
                      </button>
                      <button
                        className={`px-4 py-2 rounded-lg font-medium font-['Montserrat'] ${
                          variant.stockSizeOption === "sizes"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-black"
                        }`}
                      >
                        sizes
                      </button>
                    </div>

                    {/* Size Details - Mock data structure similar to Figma */}
                    {(variant.customSizes || customSizes).length > 0 && (
                      <div className="grid grid-cols-6 gap-2 text-sm">
                        <div className="font-medium">Size</div>
                        <div className="font-medium">Quantity</div>
                        <div className="font-medium">Amazon</div>
                        <div className="font-medium">Flipkart</div>
                        <div className="font-medium">Myntra</div>
                        <div className="font-medium">Nykaa</div>
                        {(variant.customSizes || customSizes)
                          .slice(0, 2)
                          .map((size, sizeIndex) => (
                            <React.Fragment key={sizeIndex}>
                              <div className="border border-gray-300 rounded p-2">
                                {size.size || "S"}
                              </div>
                              <div className="border border-gray-300 rounded p-2">
                                {size.quantity || "50"}
                              </div>
                              <div className="border border-gray-300 rounded p-2">
                                {size.prices?.amazon || "1000"}
                              </div>
                              <div className="border border-gray-300 rounded p-2">
                                {size.prices?.flipkart || "1200"}
                              </div>
                              <div className="border border-gray-300 rounded p-2">
                                {size.prices?.myntra || "1100"}
                              </div>
                              <div className="border border-gray-300 rounded p-2">
                                {size.prices?.nykaa || "1300"}
                              </div>
                            </React.Fragment>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Meta Data */}
                  <div className="mb-6">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-block mb-4 font-['Montserrat']">
                      meta data
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-lg font-medium text-black font-['Montserrat'] block mb-2">
                          meta title
                        </label>
                        <div className="border-2 border-black rounded-lg p-3 bg-gray-50">
                          <span className="text-black font-['Montserrat']">
                            {variant.metaTitle ||
                              productData.metaTitle ||
                              "Not specified"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-lg font-medium text-black font-['Montserrat'] block mb-2">
                          meta description
                        </label>
                        <div className="border-2 border-black rounded-lg p-3 bg-gray-50">
                          <span className="text-black font-['Montserrat']">
                            {variant.metaDescription ||
                              productData.metaDescription ||
                              "Not specified"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-lg font-medium text-black font-['Montserrat'] block mb-2">
                          slug URL
                        </label>
                        <div className="border-2 border-black rounded-lg p-3 bg-gray-50">
                          <span className="text-black font-['Montserrat']">
                            {variant.slugUrl ||
                              productData.slugUrl ||
                              "Not specified"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Filter Section */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-black mb-4 font-['Montserrat']">
                  Filter
                </h3>
                <h4 className="text-lg font-medium text-black mb-4 font-['Montserrat']">
                  assigned Filter
                </h4>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {/* Color Filter */}
                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="text-sm font-medium text-gray-400 mb-2 font-['Montserrat']">
                      showing colour data
                    </div>
                    <hr className="mb-2" />
                    <div className="text-black font-['Montserrat']">
                      {productData.color || "red"}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="text-sm font-medium text-gray-400 mb-2 font-['Montserrat']">
                      showing category data
                    </div>
                    <hr className="mb-2" />
                    <div className="text-black font-['Montserrat']">
                      {selectedCategory || "men"}
                    </div>
                  </div>

                  {/* Subcategory Filter */}
                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="text-sm font-medium text-gray-400 mb-2 font-['Montserrat']">
                      showing Subcategory
                    </div>
                    <hr className="mb-2" />
                    <div className="text-black font-['Montserrat']">
                      {selectedSubCategory || "jacket"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Also Showing In Section */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-black mb-4 font-['Montserrat']">
                  Also Showing in
                </h3>

                <div className="space-y-3">
                  {dynamicAlsoShowInOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between"
                    >
                      <div className="text-lg font-medium text-black font-['Montserrat']">
                        {option.label}
                      </div>
                      <div className="flex gap-2">
                        <button
                          className={`px-4 py-2 rounded-full font-medium font-['Montserrat'] ${
                            option.value === "yes"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-black"
                          }`}
                        >
                          yes
                        </button>
                        <button
                          className={`px-4 py-2 rounded-full font-medium font-['Montserrat'] ${
                            option.value === "no"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-black"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end">
              <button
                onClick={closeDetailedReviewModal}
                className="bg-black hover:bg-gray-800 text-white font-medium py-3 px-8 rounded-lg transition-colors font-['Montserrat']"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Product Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] max-w-md w-full mx-4 relative">
            {/* Modal Content */}
            <div className="p-8 relative">
              {/* Header */}
              <h2 className="text-[24px] font-bold text-black mb-8 leading-[29px] font-['Montserrat'] text-center">
                Schedule Product for Later
              </h2>

              {/* Form Fields */}
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-['Montserrat']">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full h-[50px] px-4 py-3 border border-gray-300 rounded-lg font-['Montserrat'] text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-['Montserrat']">
                    Select Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full h-[50px] px-4 py-3 border border-gray-300 rounded-lg font-['Montserrat'] text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
                {scheduleDate && scheduleTime && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 font-['Montserrat']">
                      <strong>Publish Date & Time:</strong><br />
                      {new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleConfirmSchedule}
                  disabled={
                    !scheduleDate || !scheduleTime || scheduleLoading ||
                    new Date(`${scheduleDate}T${scheduleTime}`) <= new Date()
                  }
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-['Montserrat'] font-medium py-4 px-8 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-[16px] leading-[1.2] min-w-[140px]"
                >
                  {scheduleLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Scheduling...
                    </div>
                  ) : !scheduleDate || !scheduleTime 
                    ? 'Select Date & Time' 
                    : new Date(`${scheduleDate}T${scheduleTime}`) <= new Date()
                    ? 'Past Time Selected'
                    : 'Schedule Now'
                  }
                </button>
                <button
                  onClick={handleCancelSchedule}
                  disabled={scheduleLoading}
                  className="bg-white hover:bg-gray-50 text-black font-['Montserrat'] font-medium py-4 px-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 text-[16px] leading-[1.2] border border-[#e4e4e4] min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${
            notification.type === "warning"
              ? "bg-yellow-100 border border-yellow-400 text-yellow-800"
              : notification.type === "info"
              ? "bg-blue-100 border border-blue-400 text-blue-800"
              : notification.type === "error"
              ? "bg-red-100 border border-red-400 text-red-800"
              : "bg-green-100 border border-green-400 text-green-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 text-sm font-medium font-['Montserrat']">
              {notification.message}
            </div>
            <button
              onClick={() => setNotification(null)}
              className="ml-3 text-lg leading-none hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}); // End of SingleProductUpload component

// Set display name for debugging
SingleProductUpload.displayName = "SingleProductUpload";

export default SingleProductUpload;
