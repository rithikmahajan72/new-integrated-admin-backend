import React, {
  useState,
  useMemo,
  useCallback,
  memo,
  useRef,
  useEffect,
} from "react";
import {
  Truck,
  Tags,
  Package,
  BarChart,
  CreditCard,
  Lock,
  Unlock,
  ShoppingCartIcon,
  Box,
  IndianRupee,
  File,
  Trash,
  Pen,
  Factory,
  MapPin,
  Eye,
  EyeOff,
  Star,
  Mars,
  Venus,
  Palette,
  Plus,
  PencilRuler,
  RulerDimensionLine,
  ScrollText,
  Search,
  Filter,
  Edit2,
  Trash2,
  Download,
  Check,
  Settings,
  RotateCw,
  CheckCircle,
  Wallet,
  BarChart2,
  X,
  Users,
  ShoppingCart,
  PackageCheck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
  FileSpreadsheet,
  ChevronDown,
  CalendarRange,
  Share,
  Printer,
  User,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import TwoFactorAuth from "../components/TwoFactorAuth";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import SizeChartModal from "../components/SizeChartModal";
import SuccessModal from "../components/SuccessModal";

// Add custom styles for date picker - moved to a singleton pattern for performance
const createDatePickerStyles = (() => {
  let stylesInjected = false;

  const datePickerStyles = `
    .date-picker-dropdown {
      animation: slideDown 0.2s ease-out;
    }
    
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .date-picker-option:hover {
      background-color: #f8fafc;
    }
    
    .date-picker-option.selected {
      background-color: #dbeafe;
      color: #1d4ed8;
    }
  `;

  return () => {
    if (typeof document !== "undefined" && !stylesInjected) {
      const styleSheet = document.createElement("style");
      styleSheet.type = "text/css";
      styleSheet.innerText = datePickerStyles;
      document.head.appendChild(styleSheet);
      stylesInjected = true;
    }
  };
})();

// Inject styles once
createDatePickerStyles();

/**
 * Unified Database & Dashboard Component - Performance Optimized
 *
 * A comprehensive admin interface that combines:
 * - Dashboard analytics with real-time statistics
 * - Database inventory management with advanced filtering
 * - SMS analytics and tracking
 * - Sales charts and visualizations
 * - Product sync management across marketplaces
 * - Marketplace connection status monitoring
 * - Sync logs and error tracking with audit trail
 *
 * Performance Optimizations:
 * - Memoized components to prevent unnecessary re-renders
 * - useCallback for stable function references
 * - Optimized filtering with proper dependency arrays
 * - Extracted sub-components for better code splitting
 * - Reduced object creation in render cycles
 * - Proper key props for list items
 * - Optimized hover states and transitions
 */

// Move mock data outside component to prevent recreation on every render
const MOCK_USERS = [
  {
    id: 1,
    name: "Rajesh Kumar Sharma",
    email: "rajesh.sharma@gmail.com",
    phone: {
      countryCode: "+91",
      number: "9876543210",
    },
    dateOfBirth: "15/06/1995",
    address: {
      street: "123, MG Road, Sector 15",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      landmark: "Near Metro Station",
    },
    deleteAccount: false,
    username: "rajesh_kumar_95",
    appReviews: {
      rating: 4.5,
      reviewCount: 23,
      lastReviewDate: "2025-07-20",
    },
    gender: "male",
    password: "R@j3sh#Secure2025!",
    pointBalance: 1250,
    accountCreated: "2023-01-15",
    lastLogin: "2025-08-05",
  },
  {
    id: 2,
    name: "Priya Patel Singh",
    email: "priya.singh@hotmail.com",
    phone: {
      countryCode: "+91",
      number: "8765432109",
    },
    dateOfBirth: "22/03/1990",
    address: {
      street: "456, Park Avenue, Block B",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
      landmark: "Opposite City Mall",
    },
    deleteAccount: false,
    username: "priya_fashion_lover",
    appReviews: {
      rating: 4.8,
      reviewCount: 45,
      lastReviewDate: "2025-08-01",
    },
    gender: "female",
    password: "Pr!ya@Delhi2024#",
    pointBalance: 2750,
    accountCreated: "2022-11-08",
    lastLogin: "2025-08-06",
  },
  {
    id: 3,
    name: "Mohammed Ali Khan",
    email: "ali.khan@yahoo.com",
    phone: {
      countryCode: "+971",
      number: "501234567",
    },
    dateOfBirth: "10/12/1988",
    address: {
      street: "789, Business Bay Tower 3",
      city: "Dubai",
      state: "Dubai",
      pincode: "00000",
      landmark: "Business Bay Metro",
    },
    deleteAccount: true,
    username: "ali_dubai_shopper",
    appReviews: {
      rating: 3.9,
      reviewCount: 12,
      lastReviewDate: "2025-06-15",
    },
    gender: "male",
    password: "Ali@Dubai123!",
    pointBalance: 580,
    accountCreated: "2024-03-22",
    lastLogin: "2025-07-10",
  },
  {
    id: 4,
    name: "Sarah Johnson Williams",
    email: "sarah.williams@outlook.com",
    phone: {
      countryCode: "+1",
      number: "5551234567",
    },
    dateOfBirth: "28/09/1992",
    address: {
      street: "321, Broadway Street, Apt 4B",
      city: "New York",
      state: "New York",
      pincode: "10001",
      landmark: "Times Square Area",
    },
    deleteAccount: false,
    username: "sarah_ny_fashion",
    appReviews: {
      rating: 4.9,
      reviewCount: 67,
      lastReviewDate: "2025-08-04",
    },
    gender: "female",
    password: "S@rah#NYC2025!",
    pointBalance: 3420,
    accountCreated: "2023-05-14",
    lastLogin: "2025-08-06",
  },
];

const MOCK_ORDERS = [
  {
    id: "ORD001",
    orderId: "ORD2025001",
    email: "rajesh.sharma@gmail.com",
    name: "Rajesh Kumar Sharma",
    phone: {
      countryCode: "+91",
      number: "9876543210",
    },
    address: {
      street: "123, MG Road, Sector 15",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      landmark: "Near Metro Station",
    },
    sku: "men/tshirt/insomniac tshirt/2025/07/28/12345678",
    barcode: "12345678901234",
    prices: {
      website: 899,
      app: 849,
      wholesale: 699,
      marketplace: 920,
    },
    hsnCode: "61091000",
    documents: [
      {
        type: "invoice",
        name: "invoice_001.pdf",
        url: "/docs/invoice_001.pdf",
        sides: "single",
        uploadDate: "2025-07-28",
      },
      {
        type: "receipt",
        name: "receipt_001_front.jpg",
        url: "/docs/receipt_001_front.jpg",
        sides: "front",
        uploadDate: "2025-07-28",
      },
      {
        type: "receipt",
        name: "receipt_001_back.jpg",
        url: "/docs/receipt_001_back.jpg",
        sides: "back",
        uploadDate: "2025-07-28",
      },
    ],
    paymentStatus: "completed",
    invoiceDetails: {
      invoiceNo: "INV2025001",
      amount: 849,
      date: "2025-07-28",
      taxAmount: 127.35,
      totalAmount: 976.35,
    },
    orderDate: "2025-07-28",
    deliveryStatus: "delivered",
  },
  {
    id: "ORD002",
    orderId: "ORD2025002",
    email: "priya.singh@hotmail.com",
    name: "Priya Patel Singh",
    phone: {
      countryCode: "+91",
      number: "8765432109",
    },
    address: {
      street: "456, Park Avenue, Block B",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
      landmark: "Opposite City Mall",
    },
    sku: "women/dress/summer floral dress/2025/08/01/87654321",
    barcode: "87654321098765",
    prices: {
      website: 1299,
      app: 1199,
      wholesale: 899,
      marketplace: 1350,
    },
    hsnCode: "62043200",
    documents: [
      {
        type: "invoice",
        name: "invoice_002.pdf",
        url: "/docs/invoice_002.pdf",
        sides: "single",
        uploadDate: "2025-08-01",
      },
      {
        type: "warranty",
        name: "warranty_card.jpg",
        url: "/docs/warranty_card.jpg",
        sides: "single",
        uploadDate: "2025-08-01",
      },
    ],
    paymentStatus: "pending",
    invoiceDetails: {
      invoiceNo: "INV2025002",
      amount: 1199,
      date: "2025-08-01",
      taxAmount: 179.85,
      totalAmount: 1378.85,
    },
    orderDate: "2025-08-01",
    deliveryStatus: "processing",
  },
  {
    id: "ORD003",
    orderId: "ORD2025003",
    email: "sarah.williams@outlook.com",
    name: "Sarah Johnson Williams",
    phone: {
      countryCode: "+1",
      number: "5551234567",
    },
    address: {
      street: "321, Broadway Street, Apt 4B",
      city: "New York",
      state: "New York",
      pincode: "10001",
      landmark: "Times Square Area",
    },
    sku: "women/jeans/skinny blue jeans/2025/08/03/11223344",
    barcode: "11223344556677",
    prices: {
      website: 2499,
      app: 2299,
      wholesale: 1799,
      marketplace: 2650,
    },
    hsnCode: "62034200",
    documents: [
      {
        type: "invoice",
        name: "invoice_003.pdf",
        url: "/docs/invoice_003.pdf",
        sides: "single",
        uploadDate: "2025-08-03",
      },
      {
        type: "customs",
        name: "customs_declaration_front.jpg",
        url: "/docs/customs_front.jpg",
        sides: "front",
        uploadDate: "2025-08-03",
      },
      {
        type: "customs",
        name: "customs_declaration_back.jpg",
        url: "/docs/customs_back.jpg",
        sides: "back",
        uploadDate: "2025-08-03",
      },
    ],
    paymentStatus: "completed",
    invoiceDetails: {
      invoiceNo: "INV2025003",
      amount: 2299,
      date: "2025-08-03",
      taxAmount: 344.85,
      totalAmount: 2643.85,
    },
    orderDate: "2025-08-03",
    deliveryStatus: "shipped",
  },
];

// Constants moved outside component to prevent recreation
const FILTER_OPTIONS = {
  categories: ["Profile", "inventory list", "Order statisatics"],
  subcategories: {
    Profile: [
      "Name",
      "EMAIL",
      "PHONE",
      "Date of Birth",
      "ADDRESS",
      "delete account record",
      "user details",
      "app reviews",
      "GENDER",
      "password details",
      "points",
      "PG rent receipt – Duly stamped",
    ],
    "inventory list": ["SKU id", "bar code id", "item stock"],
    "Order statistics": [
      "cancel order",
      "return order",
      "exchange order",
      "invoice details",
    ],
  },
  sortOptions: [
    { label: "Name (A-Z)", value: "name_asc" },
    { label: "Name (Z-A)", value: "name_desc" },
    { label: "Price (Low to High)", value: "price_asc" },
    { label: "Price (High to Low)", value: "price_desc" },
    { label: "Date Added (Newest)", value: "date_desc" },
    { label: "Date Added (Oldest)", value: "date_asc" },
    { label: "Quantity (Low to High)", value: "quantity_asc" },
    { label: "Quantity (High to Low)", value: "quantity_desc" },
  ],
  users: {
    gender: [
      { value: "all", label: "All Genders" },
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
    ],
    accountStatus: [
      { value: "all", label: "All Status" },
      { value: "active", label: "Active" },
      { value: "deleted", label: "Deleted" },
    ],
    pointRange: [
      { value: "all", label: "All Points" },
      { value: "low", label: "Low (< 500)" },
      { value: "medium", label: "Medium (500-999)" },
      { value: "high", label: "High (≥ 1000)" },
    ],
  },
  orders: {
    deliveryStatus: [
      { value: "all", label: "All Delivery Status" },
      { value: "pending", label: "Pending" },
      { value: "shipped", label: "Shipped" },
      { value: "delivered", label: "Delivered" },
      { value: "cancelled", label: "Cancelled" },
    ],
    paymentStatus: [
      { value: "all", label: "All Payment Status" },
      { value: "pending", label: "Pending" },
      { value: "completed", label: "Completed" },
      { value: "failed", label: "Failed" },
      { value: "refunded", label: "Refunded" },
    ],
  },
  products: {
    status: [
      { value: "all", label: "All Status" },
      { value: "returnable", label: "Returnable" },
      { value: "non-returnable", label: "Non-Returnable" },
    ],
    brand: [
      { value: "all", label: "All Brands" },
      { value: "Adidas", label: "Adidas" },
      { value: "Nike", label: "Nike" },
      { value: "Zara", label: "Zara" },
    ],
    category: [
      { value: "all", label: "All Categories" },
      { value: "tshirt", label: "T-Shirts" },
      { value: "shoes", label: "Shoes" },
      { value: "dress", label: "Dresses" },
    ],
    stockLevel: [
      { value: "all", label: "All Stock Levels" },
      { value: "low", label: "Low (< 50)" },
      { value: "medium", label: "Medium (50-149)" },
      { value: "high", label: "High (≥ 150)" },
    ],
  },
};

// Memoized FilterSelect component to prevent unnecessary re-renders
const FilterSelect = memo(({ icon, label, value, onChange, options }) => (
  <div>
    <label className="text-sm font-medium text-gray-700 flex mb-1 items-center gap-1">
      {icon}
      {label}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border-2 border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
));

// Memoized Badge component to prevent unnecessary re-renders
const Badge = memo(({ color, icon, label }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${color} text-gray-700`}
  >
    {icon}
    {label}
  </span>
));

// Date Range Options
const DATE_RANGE_OPTIONS = [
  { label: "Today", value: "today", days: 0 },
  { label: "Yesterday", value: "yesterday", days: 1 },
  { label: "Last 7 Days", value: "7days", days: 7 },
  { label: "Last 14 Days", value: "14days", days: 14 },
  { label: "Last 30 Days", value: "30days", days: 30 },
  { label: "Last 90 Days", value: "90days", days: 90 },
  { label: "This Month", value: "thisMonth", days: null },
  { label: "Last Month", value: "lastMonth", days: null },
  { label: "This Year", value: "thisYear", days: null },
  { label: "Custom Range", value: "custom", days: null },
];

const TIME_PERIODS = ["07 Days", "30 Days", "6 Months", "7 Days"];

// Table Headers
const PRODUCT_SYNC_HEADERS = [
  "Image",
  "product name",
  "Price",
  "SKU",
  "barcode no.",
  "synced",
  "marketplace",
  "error",
  "action",
];

const INVENTORY_HEADERS = [
  "Image",
  "Product Name",
  "Category",
  "sub categories",
  "Price",
  "size",
  "quantity",
  "sale price",
  "actual price",
  "SKU",
  "barcode no.",
  "Description",
  "Manufacturing details",
  "Shipping returns and exchange",
  "meta title",
  "meta description",
  "slug URL",
  "photos",
  "size chart",
  "Action",
];

const SYNC_LOG_HEADERS = [
  "date",
  "operation",
  "market place",
  "status",
  "error message",
];

// Status Colors Configuration
const STATUS_COLORS = {
  success: "bg-[#00B69B] text-white",
  error: "bg-[#EF3826] text-white",
  warning: "bg-yellow-500 text-white",
  info: "bg-[#5088FF] text-white",
  Yes: "bg-[#00B69B] text-white",
  no: "bg-[#5088FF] text-white",
  sync: "bg-[#EF3826] text-white",
  fail: "bg-[#EF3826] text-white",
  connected: "bg-[#00B69B] hover:bg-green-600 text-white",
  "not connected": "bg-[#EF3826] hover:bg-red-600 text-white",
  "good to go": "bg-green-100 text-green-600",
  low: "bg-purple-100 text-purple-600",
  finished: "bg-red-100 text-red-600",
};

// Memoized Status Badge Component - optimized with stable function reference
const StatusBadge = memo(({ status, type = "status" }) => {
  const statusColorClass = useMemo(() => {
    if (type === "error") return STATUS_COLORS.error;
    return STATUS_COLORS[status] || STATUS_COLORS.error;
  }, [status, type]);

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${statusColorClass}`}
    >
      {status}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

// Memoized Action Buttons Component
const ActionButtons = memo(({ productId, onEdit, onDelete, onDownload }) => (
  <div className="flex gap-1">
    <button
      className="p-1.5 bg-gray-100 rounded hover:bg-gray-200"
      onClick={() => onEdit(productId)}
      aria-label="Edit product"
    >
      <Edit2 className="h-3 w-3 text-gray-600" />
    </button>
    <button
      className="p-1.5 bg-gray-100 rounded hover:bg-gray-200"
      onClick={() => onDelete(productId)}
      aria-label="Delete product"
    >
      <Trash2 className="h-3 w-3 text-gray-600" />
    </button>
    <button
      className="p-1.5 bg-gray-100 rounded hover:bg-gray-200"
      onClick={() => onDownload(productId)}
      aria-label="Download product data"
    >
      <Download className="h-3 w-3 text-gray-600" />
    </button>
  </div>
));

ActionButtons.displayName = "ActionButtons";

// Memoized Availability Button Component
const AvailabilityButton = memo(({ available, label }) => (
  <div className="flex items-center justify-center">
    <button
      className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
        available
          ? "bg-green-500 hover:bg-green-600"
          : "bg-red-500 hover:bg-red-600"
      } transition-colors cursor-pointer`}
      title={available ? `${label} available` : `No ${label.toLowerCase()}`}
    >
      {available ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
    </button>
  </div>
));

AvailabilityButton.displayName = "AvailabilityButton";

// Memoized Product Image Component
const ProductImage = memo(({ image, productName }) => (
  <div className="flex items-center gap-2">
    <div className="w-12 h-14 bg-gray-200 rounded overflow-hidden">
      <img
        src={image}
        alt={productName}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <div className="flex gap-1">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="w-3 h-3 bg-gray-300 rounded"></div>
      ))}
    </div>
  </div>
));

ProductImage.displayName = "ProductImage";

// Memoized Size Data Component
const SizeData = memo(({ sizes, dataType }) => (
  <div className="space-y-1">
    {sizes.map((size) => (
      <div
        key={`${size.size}-${dataType}`}
        className="text-sm text-gray-900 font-medium"
      >
        {dataType === "size" ? size.size : size[dataType]}
      </div>
    ))}
  </div>
));

SizeData.displayName = "SizeData";

const SettingButton = ({ isOn, onToggle, label }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-700">{label}</span>
    <button
      onClick={onToggle}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
        isOn
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {isOn ? "On" : "Off"}
    </button>
  </div>
);

const HourDropdown = ({ value, onChange, label }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-700">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-white border-2 border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
    >
      <option value="1hr">1 hour</option>
      <option value="3hr">3 hours</option>
      <option value="6hr">6 hours</option>
    </select>
  </div>
);

// Performance utility functions - extracted for reuse and memoization
const formatDateForDisplay = (date) => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateRange = (startDate, endDate) => {
  const start = formatDateForDisplay(startDate);
  const end = formatDateForDisplay(endDate);
  return startDate.toDateString() === endDate.toDateString()
    ? start
    : `${start} – ${end}`;
};

// Memoized date calculation utility
const calculateDateRange = (option) => {
  const today = new Date();
  let startDate, endDate;

  if (option.value === "custom" && option.startDate && option.endDate) {
    return {
      startDate: new Date(option.startDate),
      endDate: new Date(option.endDate),
    };
  }

  switch (option.value) {
    case "today":
      startDate = endDate = new Date(today);
      break;
    case "yesterday":
      startDate = endDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "7days":
      startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate = new Date(today);
      break;
    case "14days":
      startDate = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
      endDate = new Date(today);
      break;
    case "30days":
      startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate = new Date(today);
      break;
    case "90days":
      startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      endDate = new Date(today);
      break;
    case "thisMonth":
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today);
      break;
    case "lastMonth":
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    case "thisYear":
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today);
      break;
    default:
      startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate = new Date(today);
  }

  return { startDate, endDate };
};

// Date Range Picker Component - optimized with extracted utilities
const DateRangePicker = memo(({ selectedRange, onRangeChange, dateRange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowCustomPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRangeSelect = (option) => {
    if (option.value === "custom") {
      setShowCustomPicker(true);
    } else {
      onRangeChange(option);
      setIsOpen(false);
      setShowCustomPicker(false);
    }
  };

  const handleCustomRangeApply = () => {
    if (customStartDate && customEndDate) {
      const customOption = {
        label: "Custom Range",
        value: "custom",
        startDate: customStartDate,
        endDate: customEndDate,
      };
      onRangeChange(customOption);
      setIsOpen(false);
      setShowCustomPicker(false);
    }
  };

  const formatDateRange = () => {
    if (
      selectedRange.value === "custom" &&
      selectedRange.startDate &&
      selectedRange.endDate
    ) {
      const start = new Date(selectedRange.startDate).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
        }
      );
      const end = new Date(selectedRange.endDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${start} – ${end}`;
    }
    return dateRange;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-white bg-blue-600 px-4 py-2 rounded-lg shadow-inner border-2 border-slate-200 hover:bg-blue-700 transition-colors duration-200"
      >
        <CalendarRange className="h-4 w-4" />
        <span className="font-medium tracking-wide">{formatDateRange()}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 min-w-[280px] date-picker-dropdown">
          {!showCustomPicker ? (
            <div className="p-2">
              {DATE_RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleRangeSelect(option)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-150 date-picker-option ${
                    selectedRange.value === option.value
                      ? "selected font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Select Custom Range
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    min={customStartDate}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowCustomPicker(false)}
                    className="flex-1 px-3 py-2 text-sm text-gray-600 border-2 border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomRangeApply}
                    disabled={!customStartDate || !customEndDate}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

DateRangePicker.displayName = "DateRangePicker";

// Main Database Component
const Database = () => {
  // State management for UI interactions
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState("07 Days");
  const [selectedDateRange, setSelectedDateRange] = useState({
    label: "Last 7 Days",
    value: "7days",
    days: 7,
  });
  const [dateRange, setDateRange] = useState("Nov 11, 2025 – Nov 27, 2025");

  // Sales date range state
  const [selectedSalesDateRange, setSelectedSalesDateRange] = useState({
    label: "Last 7 Days",
    value: "7days",
    days: 7,
  });
  const [salesDateRange, setSalesDateRange] = useState(
    "Nov 11, 2025 – Nov 27, 2025"
  );

  // Analytics date range state
  const [selectedAnalyticsDateRange, setSelectedAnalyticsDateRange] = useState({
    label: "Last 7 Days",
    value: "7days",
    days: 7,
  });
  const [analyticsDateRange, setAnalyticsDateRange] = useState(
    "Nov 11, 2025 – Nov 27, 2025"
  );

  // Inventory date range state
  const [selectedInventoryDateRange, setSelectedInventoryDateRange] = useState({
    label: "Last 7 Days",
    value: "7days",
    days: 7,
  });
  const [inventoryDateRange, setInventoryDateRange] = useState(
    "Nov 11, 2025 – Nov 27, 2025"
  );

  const [filters, setFilters] = useState({
    category: "",
    subcategory: "",
    sortBy: "",
    isApplied: false,
  });

  // Data hooks - Centralized data management
  const { stats, smsStats, analyticsData } = useDashboardData();
  const { productSyncData, marketplaces, syncLogs } = useMarketplaceData();
  const { inventoryProducts } = useInventoryData();

  // Optimized filtered data with improved performance
  const searchTermLower = useMemo(() => searchTerm.toLowerCase(), [searchTerm]);

  const filteredSyncProducts = useMemo(() => {
    if (!searchTermLower) return productSyncData;

    return productSyncData.filter((product) => {
      const { name, marketplace, sku } = product;
      return (
        name.toLowerCase().includes(searchTermLower) ||
        marketplace.toLowerCase().includes(searchTermLower) ||
        sku.toLowerCase().includes(searchTermLower)
      );
    });
  }, [productSyncData, searchTermLower]);

  const filteredInventoryProducts = useMemo(() => {
    const { category: filterCategory, subcategory: filterSubcategory } =
      filters;

    return inventoryProducts.filter((product) => {
      // Early returns for better performance
      if (filterCategory && product.category !== filterCategory) return false;
      if (filterSubcategory && product.subcategory !== filterSubcategory)
        return false;

      if (!searchTermLower) return true;

      const { productName, category, sku } = product;
      return (
        productName.toLowerCase().includes(searchTermLower) ||
        category.toLowerCase().includes(searchTermLower) ||
        sku.toLowerCase().includes(searchTermLower)
      );
    });
  }, [
    inventoryProducts,
    searchTermLower,
    filters.category,
    filters.subcategory,
  ]);

  // Event handlers
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSearchTerm(""); // Reset search when switching tabs
  }, []);

  const handleTimeRangeChange = useCallback((period) => {
    setSelectedTimeRange(period);
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      category: "",
      subcategory: "",
      sortBy: "",
      isApplied: false,
    });
    setSearchTerm("");
  }, []);

  // Apply filters handler
  const handleApplyFilters = useCallback(() => {
    setFilters((prev) => ({ ...prev, isApplied: true }));
  }, []);

  // Reset applied filters handler
  const handleResetAppliedFilters = useCallback(() => {
    setFilters({
      category: "",
      subcategory: "",
      sortBy: "",
      isApplied: false,
    });
    setSearchTerm("");
  }, []);

  // Optimized date range change handler with extracted utility
  const handleDateRangeChange = useCallback((rangeOption) => {
    setSelectedDateRange(rangeOption);

    const { startDate, endDate } = calculateDateRange(rangeOption);
    const formattedRange = formatDateRange(startDate, endDate);

    setDateRange(formattedRange);

    // Here you would typically trigger data refetch with the new date range
    console.log("Date range changed:", {
      startDate,
      endDate,
      range: formattedRange,
    });
  }, []);

  // Optimized sales date range change handler
  const handleSalesDateRangeChange = useCallback((rangeOption) => {
    setSelectedSalesDateRange(rangeOption);

    const { startDate, endDate } = calculateDateRange(rangeOption);
    const formattedRange = formatDateRange(startDate, endDate);

    setSalesDateRange(formattedRange);

    // Here you would typically trigger sales data refetch with the new date range
    console.log("Sales date range changed:", {
      startDate,
      endDate,
      range: formattedRange,
    });
  }, []);

  // Optimized analytics date range change handler
  const handleAnalyticsDateRangeChange = useCallback((rangeOption) => {
    setSelectedAnalyticsDateRange(rangeOption);

    const { startDate, endDate } = calculateDateRange(rangeOption);
    const formattedRange = formatDateRange(startDate, endDate);

    setAnalyticsDateRange(formattedRange);

    // Here you would typically trigger analytics data refetch with the new date range
    console.log("Analytics date range changed:", {
      startDate,
      endDate,
      range: formattedRange,
    });
  }, []);

  // Optimized inventory date range change handler
  const handleInventoryDateRangeChange = useCallback((rangeOption) => {
    setSelectedInventoryDateRange(rangeOption);

    const { startDate, endDate } = calculateDateRange(rangeOption);
    const formattedRange = formatDateRange(startDate, endDate);

    setInventoryDateRange(formattedRange);

    // Here you would typically trigger inventory data refetch with the new date range
    console.log("Inventory date range changed:", {
      startDate,
      endDate,
      range: formattedRange,
    });
  }, []);

  // Optimized analytics refresh handler with stable reference
  const handleAnalyticsRefresh = useCallback(() => {
    console.log("Refreshing analytics data...", {
      dateRange: selectedAnalyticsDateRange,
      timestamp: new Date().toISOString(),
    });
    // Here you would typically call your analytics API
    // Example: refetchAnalyticsData(selectedAnalyticsDateRange);
  }, [selectedAnalyticsDateRange]);

  // PDF Generation Utilities - extracted for better performance and reusability
  const createProductPDFData = (product) => ({
    basicInfo: [
      ["Product Name", product.productName],
      ["Category", product.category],
      ["Subcategory", product.subcategory],
      ["SKU", product.sku],
      ["Barcode", product.barcode],
      ["Status", product.status],
      ["Returnable", product.returnable || "N/A"],
      ["Shipping & Returns", product.shippingReturns || "N/A"],
    ],
    sizeData:
      product.sizes?.map((size) => [
        size.size,
        size.quantity.toString(),
        `₹${size.salePrice}`,
        `₹${size.actualPrice}`,
        `₹${size.myntraPrice || "N/A"}`,
        `₹${size.amazonPrice || "N/A"}`,
        `₹${size.flipkartPrice || "N/A"}`,
        `₹${size.nykaPrice || "N/A"}`,
      ]) || [],
    details: [
      ["Description", product.description || "N/A"],
      ["Manufacturing Details", product.manufacturingDetails || "N/A"],
      ["Meta Title", product.metaTitle || "N/A"],
      ["Meta Description", product.metaDescription || "N/A"],
      ["Slug URL", product.slugUrl || "N/A"],
    ],
    availability: [
      ["Photos Available", product.photos ? "Yes ✓" : "No ✗"],
      ["Size Chart Available", product.sizeChart ? "Yes ✓" : "No ✗"],
    ],
  });

  const addPDFHeader = (doc, title) => {
    doc.setFontSize(24);
    doc.setFont(undefined, "bold");
    doc.text(title, 20, 30);
  };

  const addPDFSection = (doc, title, startY) => {
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text(title, 20, startY);
    return startY + 10;
  };

  const addPDFTable = (doc, headers, data, startY, headColor, styles = {}) => {
    doc.autoTable({
      startY,
      head: [headers],
      body: data,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 5, ...styles },
      headStyles: { fillColor: headColor, textColor: [255, 255, 255] },
      ...styles,
    });
    return doc.lastAutoTable.finalY;
  };

  // Optimized Action handlers with useCallback for performance
  const handleEdit = useCallback((productId) => {
    console.log("Edit product:", productId);
    // Add edit functionality here
  }, []);

  const handleDelete = useCallback((productId) => {
    console.log("Delete product:", productId);
    // Add delete functionality here
  }, []);

  const handleDownload = useCallback(
    (productId) => {
      try {
        // Find the product in the inventory
        const product = filteredInventoryProducts.find(
          (p) => p.id === productId
        );

        if (!product) {
          alert("Product not found!");
          return;
        }

        const doc = new jsPDF();
        const pdfData = createProductPDFData(product);

        // Header
        addPDFHeader(doc, "YORAA - Product Details");

        // Product basic info
        let currentY = addPDFSection(doc, "Product Information", 55);
        currentY = addPDFTable(
          doc,
          ["Field", "Value"],
          pdfData.basicInfo,
          currentY,
          [59, 130, 246],
          {
            columnStyles: {
              0: { fontStyle: "bold", fillColor: [245, 247, 250] },
            },
          }
        );

        // Size and pricing information
        if (pdfData.sizeData.length > 0) {
          currentY = addPDFSection(
            doc,
            "Size & Pricing Details",
            currentY + 20
          );
          currentY = addPDFTable(
            doc,
            [
              "Size",
              "Quantity",
              "Sale Price",
              "Actual Price",
              "Myntra",
              "Amazon",
              "Flipkart",
              "Nykaa",
            ],
            pdfData.sizeData,
            currentY,
            [34, 197, 94],
            { styles: { fontSize: 9, cellPadding: 4 } }
          );
        }

        // Product description and details
        if (currentY > 250) {
          doc.addPage();
          currentY = 30;
        }

        currentY = addPDFSection(doc, "Product Details", currentY + 20);
        currentY = addPDFTable(
          doc,
          ["Field", "Details"],
          pdfData.details,
          currentY,
          [168, 85, 247],
          {
            columnStyles: {
              0: {
                fontStyle: "bold",
                fillColor: [245, 247, 250],
                cellWidth: 50,
              },
              1: { cellWidth: 130 },
            },
          }
        );

        // Availability status
        currentY = addPDFSection(doc, "Asset Availability", currentY + 20);
        currentY = addPDFTable(
          doc,
          ["Asset Type", "Status"],
          pdfData.availability,
          currentY,
          [245, 158, 11],
          {
            columnStyles: {
              0: { fontStyle: "bold", fillColor: [245, 247, 250] },
            },
          }
        );

        // Footer
        currentY += 30;
        if (currentY > 250) {
          doc.addPage();
          currentY = 30;
        }

        doc.setFontSize(10);
        doc.setFont(undefined, "italic");
        doc.text(
          `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
          20,
          currentY
        );
        doc.text("© 2025 YORAA. All rights reserved.", 20, currentY + 10);

        // Save the PDF
        const fileName = `product-${product.sku.replace(/[/\\]/g, "-")}-${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        doc.save(fileName);

        console.log(`Product PDF downloaded: ${fileName}`);
      } catch (error) {
        console.error("Error generating product PDF:", error);
        alert("Error generating PDF. Please try again.");
      }
    },
    [filteredInventoryProducts]
  );

  // Export handlers for Views Report section
  const handleExportPDF = useCallback(() => {
    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.text("Views Report", 20, 30);

      // Add date range
      doc.setFontSize(12);
      doc.text(`Date Range: ${selectedDateRange.label}`, 20, 45);
      doc.text(`Period: ${dateRange}`, 20, 55);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 65);

      // Add analytics data section
      doc.setFontSize(14);
      doc.text("Analytics Summary", 20, 85);

      // Prepare table data
      const tableData = analyticsData.map((item, index) => [
        item.title,
        item.value,
        item.growth ? `${item.growth}%` : "N/A",
        item.growthType ? item.growthType.toUpperCase() : "N/A",
      ]);

      // Add table
      doc.autoTable({
        startY: 95,
        head: [["Metric", "Value", "Growth", "Trend"]],
        body: tableData,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        headStyles: {
          fillColor: [59, 130, 246], // Blue color
          textColor: [255, 255, 255],
        },
      });

      // Add marketplace sync summary
      const finalY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(14);
      doc.text("Marketplace Status Summary", 20, finalY);

      const marketplaceData = marketplaces.map((mp) => [
        mp.name,
        mp.status,
        mp.sellerId || "Not connected",
        mp.lastSync || "Never",
      ]);

      doc.autoTable({
        startY: finalY + 10,
        head: [["Marketplace", "Status", "Seller ID", "Last Sync"]],
        body: marketplaceData,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        headStyles: {
          fillColor: [34, 197, 94], // Green color
          textColor: [255, 255, 255],
        },
      });

      // Save the PDF
      doc.save(
        `views-report-${selectedDateRange.value}-${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );

      console.log("PDF report exported successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Error generating PDF report. Please try again.");
    }
  }, [analyticsData, selectedDateRange, dateRange, marketplaces]);

  const handleExportExcel = useCallback(() => {
    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Analytics data worksheet
      const analyticsWS = XLSX.utils.json_to_sheet(
        analyticsData.map((item, index) => ({
          Metric: item.title,
          Value: item.value,
          "Growth (%)": item.growth || "N/A",
          Trend: item.growthType || "N/A",
        }))
      );

      // Marketplace data worksheet
      const marketplaceWS = XLSX.utils.json_to_sheet(
        marketplaces.map((mp) => ({
          Marketplace: mp.name,
          Status: mp.status,
          "Seller ID": mp.sellerId || "Not connected",
          "Last Sync": mp.lastSync || "Never",
        }))
      );

      // Sync logs worksheet
      const syncLogsWS = XLSX.utils.json_to_sheet(
        syncLogs.map((log) => ({
          Date: log.date,
          Operation: log.operation,
          Marketplace: log.marketplace,
          Status: log.status,
          "Error Message": log.error || "No errors",
        }))
      );

      // Product sync data worksheet
      const productSyncWS = XLSX.utils.json_to_sheet(
        productSyncData.map((product) => ({
          "Product Name": product.name,
          Price: product.price,
          SKU: product.sku,
          Barcode: product.barcode,
          Synced: product.synced,
          Marketplace: product.marketplace,
          Status: product.status,
          Error: product.error || "No errors",
        }))
      );

      // Add worksheets to workbook
      XLSX.utils.book_append_sheet(wb, analyticsWS, "Analytics Summary");
      XLSX.utils.book_append_sheet(wb, marketplaceWS, "Marketplace Status");
      XLSX.utils.book_append_sheet(wb, syncLogsWS, "Sync Logs");
      XLSX.utils.book_append_sheet(wb, productSyncWS, "Product Sync Data");

      // Generate report info sheet
      const reportInfoWS = XLSX.utils.json_to_sheet([
        {
          "Report Type": "Views Report",
          "Date Range": selectedDateRange.label,
          Period: dateRange,
          "Generated On": new Date().toLocaleDateString(),
          "Generated At": new Date().toLocaleTimeString(),
          "Total Marketplaces": marketplaces.length,
          "Connected Marketplaces": marketplaces.filter(
            (mp) => mp.status === "connected"
          ).length,
          "Total Products": productSyncData.length,
          "Synced Products": productSyncData.filter((p) => p.synced === "Yes")
            .length,
        },
      ]);

      XLSX.utils.book_append_sheet(wb, reportInfoWS, "Report Info");

      // Write the file
      const fileName = `views-report-${selectedDateRange.value}-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(wb, fileName);

      console.log("Excel report exported successfully");
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Error generating Excel report. Please try again.");
    }
  }, [
    analyticsData,
    selectedDateRange,
    dateRange,
    marketplaces,
    syncLogs,
    productSyncData,
  ]);

  // Inventory-specific PDF export function
  const handleInventoryExportPDF = useCallback(() => {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(24);
      doc.setFont(undefined, "bold");
      doc.text("YORAA - Inventory Report", 20, 30);

      doc.setFontSize(12);
      doc.setFont(undefined, "normal");
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
      doc.text(`Total Products: ${filteredInventoryProducts.length}`, 20, 55);

      // Summary section
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text("Inventory Summary", 20, 75);

      // Calculate summary statistics
      const totalProducts = filteredInventoryProducts.length;
      const totalStock = filteredInventoryProducts.reduce((total, product) => {
        return (
          total +
          (product.sizes?.reduce(
            (sizeTotal, size) => sizeTotal + size.quantity,
            0
          ) || 0)
        );
      }, 0);

      const categories = [
        ...new Set(filteredInventoryProducts.map((p) => p.category)),
      ];
      const avgPrice =
        filteredInventoryProducts.length > 0
          ? (
              filteredInventoryProducts.reduce((total, product) => {
                const avgProductPrice =
                  product.sizes?.length > 0
                    ? product.sizes.reduce(
                        (sum, size) => sum + size.salePrice,
                        0
                      ) / product.sizes.length
                    : 0;
                return total + avgProductPrice;
              }, 0) / filteredInventoryProducts.length
            ).toFixed(2)
          : 0;

      const summaryData = [
        ["Total Products", totalProducts.toString()],
        ["Total Stock Units", totalStock.toString()],
        ["Total Categories", categories.length.toString()],
        ["Average Sale Price", `₹${avgPrice}`],
        ["Categories", categories.join(", ")],
      ];

      doc.autoTable({
        startY: 85,
        head: [["Metric", "Value"]],
        body: summaryData,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
        columnStyles: { 0: { fontStyle: "bold", fillColor: [245, 247, 250] } },
      });

      // Products table (first 20 products to avoid PDF size issues)
      const currentY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text("Product Details", 20, currentY);

      const productsToShow = filteredInventoryProducts.slice(0, 20);
      const productData = productsToShow.map((product) => {
        const totalStock =
          product.sizes?.reduce((total, size) => total + size.quantity, 0) || 0;
        const avgPrice =
          product.sizes?.length > 0
            ? (
                product.sizes.reduce((sum, size) => sum + size.salePrice, 0) /
                product.sizes.length
              ).toFixed(0)
            : "N/A";

        return [
          product.productName,
          product.category,
          product.sku,
          totalStock.toString(),
          `₹${avgPrice}`,
          product.status,
        ];
      });

      doc.autoTable({
        startY: currentY + 10,
        head: [
          [
            "Product Name",
            "Category",
            "SKU",
            "Total Stock",
            "Avg Price",
            "Status",
          ],
        ],
        body: productData,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 25 },
          2: { cellWidth: 30 },
          3: { cellWidth: 20 },
          4: { cellWidth: 25 },
          5: { cellWidth: 30 },
        },
      });

      // If there are more than 20 products, add a note
      if (filteredInventoryProducts.length > 20) {
        const noteY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont(undefined, "italic");
        doc.text(
          `Note: Showing first 20 products out of ${filteredInventoryProducts.length} total products.`,
          20,
          noteY
        );
        doc.text(
          "For complete inventory data, use the Excel export option.",
          20,
          noteY + 10
        );
      }

      // Footer
      let footerY = doc.lastAutoTable.finalY + 30;
      if (footerY > 250) {
        doc.addPage();
        footerY = 30;
      }

      doc.setFontSize(10);
      doc.setFont(undefined, "italic");
      doc.text(
        `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        20,
        footerY
      );
      doc.text("© 2025 YORAA. All rights reserved.", 20, footerY + 10);

      // Save the PDF
      const fileName = `inventory-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(fileName);

      console.log("Inventory PDF exported successfully");
    } catch (error) {
      console.error("Error exporting inventory PDF:", error);
      alert("Error generating inventory PDF report. Please try again.");
    }
  }, [filteredInventoryProducts]);

  // Inventory-specific Excel export function
  const handleInventoryExportExcel = useCallback(() => {
    try {
      const wb = XLSX.utils.book_new();

      // Main inventory data
      const inventoryData = filteredInventoryProducts.map((product) => {
        const totalStock =
          product.sizes?.reduce((total, size) => total + size.quantity, 0) || 0;
        const avgPrice =
          product.sizes?.length > 0
            ? (
                product.sizes.reduce((sum, size) => sum + size.salePrice, 0) /
                product.sizes.length
              ).toFixed(2)
            : 0;

        return {
          "Product ID": product.id,
          "Product Name": product.productName,
          Category: product.category,
          Subcategory: product.subcategory,
          SKU: product.sku,
          Barcode: product.barcode,
          Status: product.status,
          "Total Stock": totalStock,
          "Average Sale Price": `₹${avgPrice}`,
          Description: product.description || "",
          "Manufacturing Details": product.manufacturingDetails || "",
          "Shipping & Returns": product.shippingReturns || "",
          "Meta Title": product.metaTitle || "",
          "Meta Description": product.metaDescription || "",
          "Slug URL": product.slugUrl || "",
          "Photos Available": product.photos ? "Yes" : "No",
          "Size Chart Available": product.sizeChart ? "Yes" : "No",
          Returnable: product.returnable || "N/A",
        };
      });

      // Size-wise detailed data
      const detailedSizeData = [];
      filteredInventoryProducts.forEach((product) => {
        if (product.sizes && product.sizes.length > 0) {
          product.sizes.forEach((size) => {
            detailedSizeData.push({
              "Product ID": product.id,
              "Product Name": product.productName,
              SKU: product.sku,
              Size: size.size,
              Quantity: size.quantity,
              "Sale Price": `₹${size.salePrice}`,
              "Actual Price": `₹${size.actualPrice}`,
              "Myntra Price": size.myntraPrice ? `₹${size.myntraPrice}` : "N/A",
              "Amazon Price": size.amazonPrice ? `₹${size.amazonPrice}` : "N/A",
              "Flipkart Price": size.flipkartPrice
                ? `₹${size.flipkartPrice}`
                : "N/A",
              "Nykaa Price": size.nykaPrice ? `₹${size.nykaPrice}` : "N/A",
            });
          });
        }
      });

      // Summary statistics
      const totalProducts = filteredInventoryProducts.length;
      const totalStock = filteredInventoryProducts.reduce((total, product) => {
        return (
          total +
          (product.sizes?.reduce(
            (sizeTotal, size) => sizeTotal + size.quantity,
            0
          ) || 0)
        );
      }, 0);
      const categories = [
        ...new Set(filteredInventoryProducts.map((p) => p.category)),
      ];

      const summaryData = [
        { Metric: "Total Products", Value: totalProducts },
        { Metric: "Total Stock Units", Value: totalStock },
        { Metric: "Total Categories", Value: categories.length },
        { Metric: "Categories List", Value: categories.join(", ") },
        {
          Metric: "Report Generated On",
          Value: new Date().toLocaleDateString(),
        },
        {
          Metric: "Report Generated At",
          Value: new Date().toLocaleTimeString(),
        },
      ];

      // Create worksheets
      const inventoryWS = XLSX.utils.json_to_sheet(inventoryData);
      const sizesWS = XLSX.utils.json_to_sheet(detailedSizeData);
      const summaryWS = XLSX.utils.json_to_sheet(summaryData);

      // Add worksheets to workbook
      XLSX.utils.book_append_sheet(wb, inventoryWS, "Inventory Overview");
      XLSX.utils.book_append_sheet(wb, sizesWS, "Size-wise Details");
      XLSX.utils.book_append_sheet(wb, summaryWS, "Summary");

      // Generate filename and save
      const fileName = `inventory-data-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(wb, fileName);

      console.log("Inventory Excel exported successfully");
    } catch (error) {
      console.error("Error exporting inventory Excel:", error);
      alert("Error generating inventory Excel report. Please try again.");
    }
  }, [filteredInventoryProducts]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header with Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <DateRangePicker
            selectedRange={selectedDateRange}
            onRangeChange={handleDateRangeChange}
            dateRange={dateRange}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-8">
          <TabButton
            active={activeTab === "dashboard"}
            onClick={() => handleTabChange("dashboard")}
            label="Dashboard"
          />
          <TabButton
            active={activeTab === "sync"}
            onClick={() => handleTabChange("sync")}
            label="Marketplace Sync"
          />
          <TabButton
            active={activeTab === "analytics"}
            onClick={() => handleTabChange("analytics")}
            label="Analytics Reports"
          />
          <TabButton
            active={activeTab === "databaseDashboard"}
            onClick={() => handleTabChange("databaseDashboard")}
            label="DataBase Dashboard"
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-6">
        {activeTab === "dashboard" && (
          <DashboardTab
            stats={stats}
            smsStats={smsStats}
            analyticsData={analyticsData}
            selectedTimeRange={selectedTimeRange}
            onTimeRangeChange={handleTimeRangeChange}
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            selectedSalesDateRange={selectedSalesDateRange}
            onSalesDateRangeChange={handleSalesDateRangeChange}
            salesDateRange={salesDateRange}
          />
        )}

        {activeTab === "sync" && (
          <SyncTab
            productSyncData={filteredSyncProducts}
            marketplaces={marketplaces}
            syncLogs={syncLogs}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsTab
            selectedAnalyticsDateRange={selectedAnalyticsDateRange}
            onAnalyticsDateRangeChange={handleAnalyticsDateRangeChange}
            analyticsDateRange={analyticsDateRange}
            onAnalyticsRefresh={handleAnalyticsRefresh}
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
          />
        )}
        {activeTab === "databaseDashboard" && (
          <DatabaseDashboardTab
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
          />
        )}
      </div>
    </div>
  );
};

// Tab Button Component
const TabButton = memo(({ active, onClick, label }) => (
  <button
    className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
      active
        ? "border-blue-500 text-blue-600"
        : "border-transparent text-gray-500 hover:text-gray-700"
    }`}
    onClick={onClick}
  >
    {label}
  </button>
));

TabButton.displayName = "TabButton";

// Dashboard Tab Component
const DashboardTab = memo(
  ({
    stats,
    smsStats,
    analyticsData,
    selectedTimeRange,
    onTimeRangeChange,
    onExportPDF,
    onExportExcel,
    selectedSalesDateRange,
    onSalesDateRangeChange,
    salesDateRange,
  }) => (
    <div className="space-y-6">
      <StatsGrid stats={stats} />
      <SMSStatsSection smsStats={smsStats} />
      <SalesAnalyticsSection
        analyticsData={analyticsData}
        selectedTimeRange={selectedTimeRange}
        onTimeRangeChange={onTimeRangeChange}
        onExportPDF={onExportPDF}
        onExportExcel={onExportExcel}
        selectedSalesDateRange={selectedSalesDateRange}
        onSalesDateRangeChange={onSalesDateRangeChange}
        salesDateRange={salesDateRange}
      />
      <MarketplaceSettingsSection />
    </div>
  )
);

DashboardTab.displayName = "DashboardTab";

// Inventory Tab Component
// Inventory Tab Component
const InventoryTab = memo(
  ({
    products,
    searchTerm,
    filters,
    onSearchChange,
    onFilterChange,
    onResetFilters,
    onApplyFilters,
    onResetAppliedFilters,
    onEdit,
    onDelete,
    onDownload,
    selectedInventoryDateRange,
    onInventoryDateRangeChange,
    inventoryDateRange,
    onExportPDF,
    onExportExcel,
  }) => {
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const filterDropdownRef = useRef(null);
    const exportDropdownRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          filterDropdownRef.current &&
          !filterDropdownRef.current.contains(event.target)
        ) {
          setFilterDropdownOpen(false);
        }
        if (
          exportDropdownRef.current &&
          !exportDropdownRef.current.contains(event.target)
        ) {
          setExportDropdownOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Get available subcategories based on selected category
    const getSubcategories = () => {
      if (!filters.category) return [];
      return FILTER_OPTIONS.subcategories[filters.category] || [];
    };

    // Handle export functionality
    const handleExport = (type) => {
      setExportDropdownOpen(false);
      switch (type) {
        case "pdf":
          onExportPDF();
          break;
        case "excel":
          onExportExcel();
          break;
        case "share":
          if (navigator.share) {
            navigator.share({
              title: "Inventory Data",
              text: `Inventory Data for ${inventoryDateRange}`,
              url: window.location.href,
            });
          } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
          }
          break;
        case "download":
          // Implement CSV download
          const csvContent = products
            .map((product) => Object.values(product).join(","))
            .join("\n");
          const blob = new Blob([csvContent], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `inventory-data-${
            new Date().toISOString().split("T")[0]
          }.csv`;
          a.click();
          break;
        default:
          break;
      }
    };

    return (
      <div className="space-y-6">
        {/* Header with Search and Controls */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          {/* Top row with Search and Date Range */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={onSearchChange}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white focus:bg-white transition-all duration-200"
              />
            </div>

            {/* Date Range Picker */}
            <DateRangePicker
              selectedRange={selectedInventoryDateRange}
              onRangeChange={onInventoryDateRangeChange}
              dateRange={inventoryDateRange}
            />
          </div>

          {/* Filter Controls Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter Button with Dropdown */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    filterDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {filterDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Sort By
                    </h4>
                    <div className="space-y-2">
                      {FILTER_OPTIONS.sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            onFilterChange("sortBy", option.value);
                            setFilterDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                            filters.sortBy === option.value
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Category Dropdown */}
            <select
              value={filters.category}
              onChange={(e) => {
                onFilterChange("category", e.target.value);
                onFilterChange("subcategory", ""); // Reset subcategory when category changes
              }}
              className="border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <option value="">Choose DB Category</option>
              {FILTER_OPTIONS.categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            {/* Subcategory Dropdown - Only show when category is selected */}
            {filters.category && (
              <select
                value={filters.subcategory}
                onChange={(e) => onFilterChange("subcategory", e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <option value="">Choose Sub Category</option>
                {getSubcategories().map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {/* Apply/Reset Button */}
            {!filters.isApplied ? (
              <button
                onClick={onApplyFilters}
                disabled={
                  !filters.category && !filters.subcategory && !filters.sortBy
                }
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Apply
              </button>
            ) : (
              <button
                onClick={onResetAppliedFilters}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Reset Filter
              </button>
            )}

            {/* Export Dropdown */}
            <div className="relative" ref={exportDropdownRef}>
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    exportDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {exportDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
                  <div className="p-1">
                    <button
                      onClick={() => handleExport("excel")}
                      className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-2"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      <span>Excel</span>
                    </button>
                    <button
                      onClick={() => handleExport("pdf")}
                      className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4 text-red-600" />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={() => handleExport("download")}
                      className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4 text-blue-600" />
                      <span>Download CSV</span>
                    </button>
                    <button
                      onClick={() => handleExport("share")}
                      className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-2"
                    >
                      <Share className="h-4 w-4 text-blue-600" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Filter Tags */}
          {filters.isApplied && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-600">
                Active Filters:
              </span>
              {filters.sortBy && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Sort:{" "}
                  {
                    FILTER_OPTIONS.sortOptions.find(
                      (opt) => opt.value === filters.sortBy
                    )?.label
                  }
                </span>
              )}
              {filters.category && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Category: {filters.category}
                </span>
              )}
              {filters.subcategory && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  Subcategory: {filters.subcategory}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Inventory Results */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Showing Inventory Data
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {products.length} items found for {inventoryDateRange}
                  {filters.isApplied && " (filtered)"}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  {INVENTORY_HEADERS.map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-sm font-medium text-gray-900"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {products.map((product) => (
                  <InventoryProductRow
                    key={product.id}
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onDownload={onDownload}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
);

InventoryTab.displayName = "InventoryTab";

// Sync Tab Component
const SyncTab = memo(
  ({ productSyncData, marketplaces, syncLogs, searchTerm, onSearchChange }) => (
    <div className="space-y-6">
      <ProductSyncSection
        productSyncData={productSyncData}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />
      <MarketplaceConnectionsSection marketplaces={marketplaces} />
      <SyncLogsSection syncLogs={syncLogs} />
    </div>
  )
);

SyncTab.displayName = "SyncTab";

// Analytics Tab Component
const AnalyticsTab = memo(
  ({
    selectedAnalyticsDateRange,
    onAnalyticsDateRangeChange,
    analyticsDateRange,
    onAnalyticsRefresh,
    onExportPDF,
    onExportExcel,
  }) => {
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const exportDropdownRef = useRef(null);

    // Close export dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          exportDropdownRef.current &&
          !exportDropdownRef.current.contains(event.target)
        ) {
          setExportDropdownOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Real-time analytics data with dynamic values
    const analyticsStats = useMemo(() => {
      const baseDate = new Date();
      const randomVariation = () => Math.random() * 0.2 - 0.1; // ±10% variation

      return [
        {
          title: "Total Revenue",
          value: `₹${(45230 * (1 + randomVariation())).toFixed(0)}`,
          change: `${(12.5 + randomVariation() * 5).toFixed(1)}%`,
          trending: "up",
          icon: DollarSign,
          iconBg: "bg-blue-50",
          iconColor: "text-blue-600",
        },
        {
          title: "Total Orders",
          value: Math.floor(1324 * (1 + randomVariation())).toString(),
          change: `${(2.1 + randomVariation() * 3).toFixed(1)}%`,
          trending: Math.random() > 0.3 ? "down" : "up",
          icon: ShoppingCart,
          iconBg: "bg-green-50",
          iconColor: "text-green-600",
        },
        {
          title: "Total Users",
          value: Math.floor(8942 * (1 + randomVariation())).toString(),
          change: `${(8.7 + randomVariation() * 4).toFixed(1)}%`,
          trending: "up",
          icon: Users,
          iconBg: "bg-purple-50",
          iconColor: "text-purple-600",
        },
        {
          title: "Avg. Order Value",
          value: `₹${(156.8 * (1 + randomVariation())).toFixed(2)}`,
          change: `${(4.2 + randomVariation() * 2).toFixed(1)}%`,
          trending: "up",
          icon: Package,
          iconBg: "bg-yellow-50",
          iconColor: "text-yellow-600",
        },
      ];
    }, [selectedAnalyticsDateRange]);

    // Dynamic insights data
    const quickInsights = useMemo(() => {
      const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      const categories = [
        "Footwear",
        "Clothing",
        "Accessories",
        "Electronics",
        "Beauty",
      ];

      return [
        {
          title: "Best Performing Day",
          value: days[Math.floor(Math.random() * days.length)],
          subtitle: `₹${(8000 + Math.random() * 2000).toFixed(0)} revenue`,
          bgColor: "bg-green-50",
          textColor: "text-green-600",
          valueColor: "text-green-900",
        },
        {
          title: "Growth Trend",
          value: `+${(10 + Math.random() * 10).toFixed(1)}%`,
          subtitle: "vs last period",
          bgColor: "bg-blue-50",
          textColor: "text-blue-600",
          valueColor: "text-blue-900",
        },
        {
          title: "Top Category",
          value: categories[Math.floor(Math.random() * categories.length)],
          subtitle: `${Math.floor(120 + Math.random() * 80)} units sold`,
          bgColor: "bg-purple-50",
          textColor: "text-purple-600",
          valueColor: "text-purple-900",
        },
      ];
    }, [selectedAnalyticsDateRange]);

    const handleExport = (type) => {
      setExportDropdownOpen(false);
      switch (type) {
        case "pdf":
          onExportPDF();
          break;
        case "excel":
          onExportExcel();
          break;
        case "share":
          // Share functionality
          if (navigator.share) {
            navigator.share({
              title: "Analytics Report",
              text: `Analytics Report for ${analyticsDateRange}`,
              url: window.location.href,
            });
          } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
          }
          break;
        case "print":
          window.print();
          break;
        default:
          break;
      }
    };

    return (
      <div className="space-y-6">
        {/* Analytics Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Analytics Reports
            </h2>
            <p className="text-gray-600 mt-1">
              Track your business performance and insights
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Dynamic Date Range Picker */}
            <DateRangePicker
              selectedRange={selectedAnalyticsDateRange}
              onRangeChange={onAnalyticsDateRangeChange}
              dateRange={analyticsDateRange}
            />

            {/* Refresh Button */}
            <button
              onClick={onAnalyticsRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative" ref={exportDropdownRef}>
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    exportDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {exportDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
                  <div className="p-1">
                    <button
                      onClick={() => handleExport("excel")}
                      className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-2"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      <span>Export as Excel</span>
                    </button>
                    <button
                      onClick={() => handleExport("pdf")}
                      className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4 text-red-600" />
                      <span>Export as PDF</span>
                    </button>
                    <button
                      onClick={() => handleExport("share")}
                      className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-2"
                    >
                      <Share className="h-4 w-4 text-blue-600" />
                      <span>Share</span>
                    </button>
                    <button
                      onClick={() => handleExport("print")}
                      className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-2"
                    >
                      <Printer className="h-4 w-4 text-gray-600" />
                      <span>Print</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analyticsStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border-2 border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 ${stat.iconBg} rounded-lg`}>
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div
                  className={`flex items-center space-x-1 ${
                    stat.trending === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trending === "up" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">{stat.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Revenue Chart
              </h3>
              <span className="text-sm text-gray-500 font-medium">
                {analyticsDateRange}
              </span>
            </div>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  Revenue chart visualization
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Real-time data for {selectedAnalyticsDateRange.label}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Performing Products
            </h3>
            <div className="space-y-3">
              {[
                {
                  name: "T-shirt",
                  sales: Math.floor(200 + Math.random() * 100),
                  revenue: Math.floor(10000 + Math.random() * 5000),
                },
                {
                  name: "Jeans",
                  sales: Math.floor(150 + Math.random() * 80),
                  revenue: Math.floor(12000 + Math.random() * 6000),
                },
                {
                  name: "Sneakers",
                  sales: Math.floor(120 + Math.random() * 70),
                  revenue: Math.floor(15000 + Math.random() * 8000),
                },
                {
                  name: "Jacket",
                  sales: Math.floor(100 + Math.random() * 60),
                  revenue: Math.floor(18000 + Math.random() * 5000),
                },
                {
                  name: "Dress",
                  sales: Math.floor(80 + Math.random() * 50),
                  revenue: Math.floor(8000 + Math.random() * 4000),
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-t-2 pt-2"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{item.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{item.sales} sales</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickInsights.map((insight, index) => (
              <div key={index} className={`p-4 ${insight.bgColor} rounded-lg`}>
                <p className={`text-sm font-medium ${insight.textColor}`}>
                  {insight.title}
                </p>
                <p className={`text-lg font-bold ${insight.valueColor}`}>
                  {insight.value}
                </p>
                <p className={`text-xs ${insight.textColor}`}>
                  {insight.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

AnalyticsTab.displayName = "AnalyticsTab";

const DatabaseDashboardTab = memo(
  ({
    onSearchChange,
    onFilterChange,
    onResetFilters,
    onApplyFilters,
    onResetAppliedFilters,
    onExportPDF,
    onExportExcel,
  }) => {
    const [activeTab, setActiveTab] = useState("users");
    const [searchTerm, setSearchTerm] = useState("");
    const [showPassword, setShowPassword] = useState({});
    const [showSensitiveData, setShowSensitiveData] = useState({});
    const [protectedFields, setProtectedFields] = useState({
      email: true,
      phone: true,
      address: true,
      dateOfBirth: true,
    });
    const [documentPreview, setDocumentPreview] = useState(null);
    const [sizeChartPreview, setSizeChartPreview] = useState(null);
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
    const filterDropdownRef = useRef(null);
    const exportDropdownRef = useRef(null);

    // Product editing states
    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showSizeChartEditModal, setShowSizeChartEditModal] = useState(false);
    const [editingSizeCharts, setEditingSizeCharts] = useState([]);

    // Mock products state (for manipulation) - initialize with constant data
    const [products, setProducts] = useState(() => [
      {
        id: 1,
        article: "Summer Midi Dress Collection",
        image: "/api/placeholder/120/140",
        variants: [
          {
            color: "floral-red",
            size: "S",
            sku: "ZARA-DRS-FLR-S-001",
            stock: 25,
          },
          {
            color: "floral-blue",
            size: "M",
            sku: "ZARA-DRS-FLB-M-002",
            stock: 18,
          },
          {
            color: "solid-black",
            size: "L",
            sku: "ZARA-DRS-SLB-L-003",
            stock: 22,
          },
          {
            color: "floral-pink",
            size: "L",
            sku: "ZARA-DRS-FLP-L-004",
            stock: 14,
          },
          {
            color: "solid-white",
            size: "XL",
            sku: "ZARA-DRS-SLW-XL-005",
            stock: 8,
          },
        ],
        status: "returnable",
        description:
          "Elegant midi dress perfect for summer occasions. Features a flowing silhouette with delicate floral prints and breathable fabric. Ideal for both casual outings and semi-formal events.",
        manufacturingDetails:
          "Made in Spain with premium European fabrics. 100% Viscose with anti-wrinkle treatment. Eco-friendly dyeing process certified by OEKO-TEX Standard 100.",
        shippingReturns:
          "Free shipping on orders above ₹799. 30-day return policy. Free exchange within 15 days. International shipping to Europe and North America.",
        sizeCharts: [
          {
            id: 1,
            type: "inch",
            url: "/charts/women_dress_zara_inch.jpg",
            name: "Women's Dress Size Chart (Inches)",
          },
          {
            id: 2,
            type: "cm",
            url: "/charts/women_dress_zara_cm.jpg",
            name: "Women's Dress Size Chart (CM)",
          },
          {
            id: 3,
            type: "measurement",
            url: "/charts/dress_measurement_guide.jpg",
            name: "How to Measure Guide",
          },
        ],
        category: "women/dress",
        brand: "Zara",
        launchDate: "2025-05-20",
        rating: 4.4,
        reviewCount: 178,
      },
    ]);

    // 2FA states for password viewing
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [pending2FAUserId, setPending2FAUserId] = useState(null);
    const [show2FASuccess, setShow2FASuccess] = useState(false);
    const [authenticated2FAUsers, setAuthenticated2FAUsers] = useState(
      new Set()
    );

    // Filter states - move initialization outside to prevent object recreation
    const [filters, setFilters] = useState(() => ({
      users: {
        gender: "all",
        accountStatus: "all",
        pointRange: "all",
        dateRange: "all",
      },
      orders: {
        deliveryStatus: "all",
        paymentStatus: "all",
        dateRange: "all",
        priceRange: "all",
      },
      products: {
        status: "all",
        brand: "all",
        category: "all",
        stockLevel: "all",
      },
    }));

    // Optimized filtered data with more efficient filtering
    const searchLower = useMemo(() => searchTerm.toLowerCase(), [searchTerm]);

    const filteredUsers = useMemo(() => {
      return MOCK_USERS.filter((user) => {
        // Early return for search filter if it fails
        if (searchLower && !user.name.toLowerCase().includes(searchLower)) {
          return false;
        }

        // Gender filter
        if (
          filters.users.gender !== "all" &&
          user.gender !== filters.users.gender
        ) {
          return false;
        }

        // Account status filter
        if (filters.users.accountStatus !== "all") {
          const isActive = !user.deleteAccount;
          if (
            (filters.users.accountStatus === "active" && !isActive) ||
            (filters.users.accountStatus === "deleted" && isActive)
          ) {
            return false;
          }
        }

        // Point range filter
        if (filters.users.pointRange !== "all") {
          const points = user.pointBalance;
          if (
            (filters.users.pointRange === "low" && points >= 500) ||
            (filters.users.pointRange === "medium" &&
              (points < 500 || points >= 1000)) ||
            (filters.users.pointRange === "high" && points < 1000)
          ) {
            return false;
          }
        }

        return true;
      });
    }, [searchLower, filters.users]);

    const filteredOrders = useMemo(() => {
      return MOCK_ORDERS.filter((order) => {
        // Early return for search filter if it fails
        if (
          searchLower &&
          !order.name.toLowerCase().includes(searchLower) &&
          !order.orderId.toLowerCase().includes(searchLower)
        ) {
          return false;
        }

        // Delivery status filter
        if (
          filters.orders.deliveryStatus !== "all" &&
          order.deliveryStatus !== filters.orders.deliveryStatus
        ) {
          return false;
        }

        // Payment status filter
        if (
          filters.orders.paymentStatus !== "all" &&
          order.paymentStatus !== filters.orders.paymentStatus
        ) {
          return false;
        }

        return true;
      });
    }, [searchLower, filters.orders]);

    const filteredProducts = useMemo(() => {
      return products.filter((product) => {
        // Early return for search filter if it fails
        if (
          searchLower &&
          !product.article.toLowerCase().includes(searchLower)
        ) {
          return false;
        }

        // Status filter
        if (
          filters.products.status !== "all" &&
          product.status !== filters.products.status
        ) {
          return false;
        }

        // Brand filter
        if (
          filters.products.brand !== "all" &&
          product.brand !== filters.products.brand
        ) {
          return false;
        }

        // Category filter
        if (
          filters.products.category !== "all" &&
          !product.category.includes(filters.products.category)
        ) {
          return false;
        }

        // Stock level filter with optimized calculation
        if (filters.products.stockLevel !== "all") {
          const totalStock = product.variants.reduce(
            (sum, variant) => sum + variant.stock,
            0
          );
          if (
            (filters.products.stockLevel === "low" && totalStock >= 50) ||
            (filters.products.stockLevel === "medium" &&
              (totalStock < 50 || totalStock >= 150)) ||
            (filters.products.stockLevel === "high" && totalStock < 150)
          ) {
            return false;
          }
        }

        return true;
      });
    }, [searchLower, filters.products, products]);

    // Toggle password visibility with 2FA authentication
    const togglePassword = useCallback(
      (userId) => {
        // If user is already authenticated, just toggle password visibility
        if (authenticated2FAUsers.has(userId)) {
          setShowPassword((prev) => ({
            ...prev,
            [userId]: !prev[userId],
          }));
        } else {
          // Require 2FA authentication first
          setPending2FAUserId(userId);
          setShow2FAModal(true);
        }
      },
      [authenticated2FAUsers]
    );

    // Handle 2FA submission for password viewing
    const handle2FASubmit = useCallback(
      (data) => {
        if (
          data &&
          data.verificationCode.length === 4 &&
          data.emailPassword &&
          data.defaultPassword
        ) {
          setShow2FAModal(false);
          setShow2FASuccess(true);

          // Add user to authenticated users
          setAuthenticated2FAUsers(
            (prev) => new Set([...prev, pending2FAUserId])
          );

          // Show password after authentication
          setTimeout(() => {
            setShowPassword((prev) => ({
              ...prev,
              [pending2FAUserId]: true,
            }));
            setShow2FASuccess(false);
            setPending2FAUserId(null);
          }, 2000);

          console.log("2FA Authentication Data for password viewing:", {
            userId: pending2FAUserId,
            verificationCode: data.verificationCode,
            emailPassword: data.emailPassword,
            defaultPassword: data.defaultPassword,
          });
        } else {
          alert("Please fill in all fields");
        }
      },
      [pending2FAUserId]
    );

    // Handle 2FA cancellation
    const handleCancel2FA = useCallback(() => {
      setShow2FAModal(false);
      setPending2FAUserId(null);
    }, []);

    // Close 2FA success modal
    const handleClose2FASuccess = useCallback(() => {
      setShow2FASuccess(false);
      setPending2FAUserId(null);
    }, []);

    // Sensitive data protection functions - optimized with better error handling
    const maskEmail = useCallback((email) => {
      if (!email) return "";
      const [username, domain] = email.split("@");
      if (!username || !domain) return email;
      if (username.length <= 2) return "••••@" + domain;
      return (
        username.charAt(0) +
        "••••" +
        username.charAt(username.length - 1) +
        "@" +
        domain
      );
    }, []);

    const maskPhone = useCallback((phone) => {
      if (!phone) return "";
      const phoneStr = phone.toString();
      if (phoneStr.length <= 4) return "••••";
      return phoneStr.slice(0, 2) + "••••" + phoneStr.slice(-2);
    }, []);

    const maskAddress = useCallback((address) => {
      if (!address) return {};
      return {
        street: address.street
          ? address.street.charAt(0) + "•••••" + address.street.slice(-2)
          : "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode ? "••••••" : "",
        landmark: address.landmark ? "•••••" : "",
      };
    }, []);

    const maskDateOfBirth = useCallback((date) => {
      if (!date) return "";
      const parts = date.split("/");
      if (parts.length === 3) {
        return "••/" + parts[1] + "/" + parts[2]; // Hide day, show month/year
      }
      return "••/••/••••";
    }, []);

    const toggleSensitiveData = useCallback(
      (userId, field) => {
        // Check if user is authenticated for 2FA (required for any sensitive data)
        if (!authenticated2FAUsers.has(userId)) {
          setPending2FAUserId(userId);
          setShow2FAModal(true);
          return;
        }

        setShowSensitiveData((prev) => {
          const key = `${userId}_${field}`;
          return {
            ...prev,
            [key]: !prev[key],
          };
        });
      },
      [authenticated2FAUsers]
    );

    const isSensitiveDataVisible = useCallback(
      (userId, field) => {
        return showSensitiveData[`${userId}_${field}`] || false;
      },
      [showSensitiveData]
    );

    const toggleFieldProtection = useCallback((field) => {
      setProtectedFields((prev) => {
        if (prev[field] === undefined) return prev; // Prevent unnecessary updates
        return {
          ...prev,
          [field]: !prev[field],
        };
      });
    }, []);

    // Document preview
    const openDocumentPreview = useCallback((doc) => {
      setDocumentPreview(doc);
    }, []);

    // Size chart preview
    const openSizeChart = useCallback((charts) => {
      setSizeChartPreview(charts);
    }, []);

    // Filter handler - optimized to reduce object recreation
    const updateFilter = useCallback((tab, filterType, value) => {
      setFilters((prev) => {
        // Only update if value actually changed
        if (prev[tab][filterType] === value) return prev;

        return {
          ...prev,
          [tab]: {
            ...prev[tab],
            [filterType]: value,
          },
        };
      });
    }, []);

    // Reset filters - optimized
    const resetFilters = useCallback((tab) => {
      setFilters((prev) => {
        const resetValues = Object.keys(prev[tab]).reduce((acc, key) => {
          acc[key] = "all";
          return acc;
        }, {});

        return {
          ...prev,
          [tab]: resetValues,
        };
      });
    }, []);

    // Product management functions - optimized
    const handleEditProduct = useCallback((product) => {
      setEditingProduct(product);
      // Use functional update to prevent unnecessary object creation
      setEditFormData(() => ({
        article: product.article,
        description: product.description,
        manufacturingDetails: product.manufacturingDetails,
        shippingReturns: product.shippingReturns,
        status: product.status,
        brand: product.brand,
        category: product.category,
      }));
      setShowEditModal(true);
    }, []);

    const handleDeleteProduct = useCallback((product) => {
      setProductToDelete(product);
      setShowDeleteModal(true);
    }, []);

    const confirmDeleteProduct = useCallback(() => {
      if (productToDelete) {
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        setShowDeleteModal(false);
        setProductToDelete(null);
        setSuccessMessage("Product deleted successfully!");
        setShowSuccessModal(true);
      }
    }, [productToDelete]);

    const cancelDeleteProduct = useCallback(() => {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }, []);

    const handleSaveProductChanges = useCallback(() => {
      if (editingProduct && editFormData) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? { ...p, ...editFormData } : p
          )
        );
        setShowEditModal(false);
        setEditingProduct(null);
        setEditFormData({});
        setSuccessMessage("Product updated successfully!");
        setShowSuccessModal(true);
      }
    }, [editingProduct, editFormData]);

    const handleCancelEdit = useCallback(() => {
      setShowEditModal(false);
      setEditingProduct(null);
      setEditFormData({});
    }, []);

    const handleEditFormChange = useCallback((field, value) => {
      // Only update if value actually changed
      setEditFormData((prev) => {
        if (prev[field] === value) return prev;
        return {
          ...prev,
          [field]: value,
        };
      });
    }, []);

    const handleEditSizeCharts = useCallback((product) => {
      setEditingProduct(product);
      setEditingSizeCharts(() => [...product.sizeCharts]);
      setShowSizeChartEditModal(true);
    }, []);

    const handleSaveSizeCharts = useCallback(() => {
      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? { ...p, sizeCharts: editingSizeCharts }
              : p
          )
        );
        setShowSizeChartEditModal(false);
        setEditingProduct(null);
        setEditingSizeCharts([]);
        setSuccessMessage("Size charts updated successfully!");
        setShowSuccessModal(true);
      }
    }, [editingProduct, editingSizeCharts]);

    const handleCancelSizeChartEdit = useCallback(() => {
      setShowSizeChartEditModal(false);
      setEditingProduct(null);
      setEditingSizeCharts([]);
    }, []);

    const handleAddSizeChart = useCallback(() => {
      const newChart = {
        id: Date.now(),
        type: "cm",
        url: "/api/placeholder/600/800",
        name: "New Size Chart",
      };
      setEditingSizeCharts((prev) => [...prev, newChart]);
    }, []);

    const handleRemoveSizeChart = useCallback((chartId) => {
      setEditingSizeCharts((prev) =>
        prev.filter((chart) => chart.id !== chartId)
      );
    }, []);

    const handleSizeChartChange = useCallback((chartId, field, value) => {
      setEditingSizeCharts((prev) =>
        prev.map((chart) =>
          chart.id === chartId ? { ...chart, [field]: value } : chart
        )
      );
    }, []);

    // Memoize tab configuration to prevent recreation
    const tabConfig = useMemo(
      () => [
        {
          key: "users",
          icon: <User className="w-4 h-4" />,
          label: "User Data",
          desc: "Profile & Account Info",
        },
        {
          key: "orders",
          icon: <ShoppingCart className="w-4 h-4" />,
          label: "Order Data",
          desc: "Order History & Details",
        },
        {
          key: "products",
          icon: <PackageCheck className="w-4 h-4" />,
          label: "Product Data",
          desc: "Inventory & Variants",
        },
      ],
      []
    );

    // Memoize result count for performance
    const currentResultCount = useMemo(() => {
      switch (activeTab) {
        case "users":
          return filteredUsers.length;
        case "orders":
          return filteredOrders.length;
        case "products":
          return filteredProducts.length;
        default:
          return 0;
      }
    }, [
      activeTab,
      filteredUsers.length,
      filteredOrders.length,
      filteredProducts.length,
    ]);

    // Optimize search input handler
    const handleSearchChange = useCallback((e) => {
      setSearchTerm(e.target.value);
    }, []);

    return (
      <div className="px-5 py-5 pl-2.5 bg-gray-50 min-h-screen">
        <div className="max-w-none m-0 w-full">
          {/* Header Section */}
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm mb-6 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Database Dashboard
            </h1>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
              <div className="relative w-full sm:flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Search className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  placeholder="Search database..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm mb-6 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Advanced Filters
              </h3>

              <div className="flex gap-4">
                {/* Filter Dropdown */}
                <div className="relative" ref={filterDropdownRef}>
                  <button
                    onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                    className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        filterDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {filterDropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Sort By
                        </h4>
                        <div className="space-y-2">
                          {FILTER_OPTIONS.sortOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                onFilterChange("sortBy", option.value);
                                setFilterDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                                filters.sortBy === option.value
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Export Dropdown */}
                <div className="relative" ref={exportDropdownRef}>
                  <button
                    onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                    className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        exportDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {exportDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
                      <div className="p-1">
                        <button
                          onClick={() => handleExport("excel")}
                          className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-2"
                        >
                          <FileSpreadsheet className="h-4 w-4 text-green-600" />
                          <span>Export as Excel</span>
                        </button>
                        <button
                          onClick={() => handleExport("pdf")}
                          className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-2"
                        >
                          <Download className="h-4 w-4 text-red-600" />
                          <span>Export as PDF</span>
                        </button>
                        <button
                          onClick={() => handleExport("share")}
                          className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-2"
                        >
                          <Share className="h-4 w-4 text-blue-600" />
                          <span>Share</span>
                        </button>
                        <button
                          onClick={() => handleExport("print")}
                          className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-2"
                        >
                          <Printer className="h-4 w-4 text-gray-600" />
                          <span>Print</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Filters */}
            {activeTab === "users" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FilterSelect
                  icon={<User className="w-4 h-4 text-gray-500" />}
                  label="Gender"
                  value={filters.users.gender}
                  onChange={(e) =>
                    updateFilter("users", "gender", e.target.value)
                  }
                  options={FILTER_OPTIONS.users.gender}
                />
                <FilterSelect
                  icon={<CheckCircle className="w-4 h-4 text-gray-500" />}
                  label="Account Status"
                  value={filters.users.accountStatus}
                  onChange={(e) =>
                    updateFilter("users", "accountStatus", e.target.value)
                  }
                  options={FILTER_OPTIONS.users.accountStatus}
                />
                <FilterSelect
                  icon={<Wallet className="w-4 h-4 text-gray-500" />}
                  label="Point Range"
                  value={filters.users.pointRange}
                  onChange={(e) =>
                    updateFilter("users", "pointRange", e.target.value)
                  }
                  options={FILTER_OPTIONS.users.pointRange}
                />
              </div>
            )}

            {/* Order Filters */}
            {activeTab === "orders" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FilterSelect
                  icon={<Truck className="w-4 h-4 text-gray-500" />}
                  label="Delivery Status"
                  value={filters.orders.deliveryStatus}
                  onChange={(e) =>
                    updateFilter("orders", "deliveryStatus", e.target.value)
                  }
                  options={FILTER_OPTIONS.orders.deliveryStatus}
                />
                <FilterSelect
                  icon={<Wallet className="w-4 h-4 text-gray-500" />}
                  label="Payment Status"
                  value={filters.orders.paymentStatus}
                  onChange={(e) =>
                    updateFilter("orders", "paymentStatus", e.target.value)
                  }
                  options={FILTER_OPTIONS.orders.paymentStatus}
                />
              </div>
            )}

            {/* Product Filters */}
            {activeTab === "products" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FilterSelect
                  icon={<RotateCw className="w-4 h-4 text-gray-500" />}
                  label="Return Status"
                  value={filters.products.status}
                  onChange={(e) =>
                    updateFilter("products", "status", e.target.value)
                  }
                  options={FILTER_OPTIONS.products.status}
                />
                <FilterSelect
                  icon={<Tags className="w-4 h-4 text-gray-500" />}
                  label="Brand"
                  value={filters.products.brand}
                  onChange={(e) =>
                    updateFilter("products", "brand", e.target.value)
                  }
                  options={FILTER_OPTIONS.products.brand}
                />
                <FilterSelect
                  icon={<Package className="w-4 h-4 text-gray-500" />}
                  label="Category"
                  value={filters.products.category}
                  onChange={(e) =>
                    updateFilter("products", "category", e.target.value)
                  }
                  options={FILTER_OPTIONS.products.category}
                />
                <FilterSelect
                  icon={<BarChart className="w-4 h-4 text-gray-500" />}
                  label="Stock Level"
                  value={filters.products.stockLevel}
                  onChange={(e) =>
                    updateFilter("products", "stockLevel", e.target.value)
                  }
                  options={FILTER_OPTIONS.products.stockLevel}
                />
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl border-2 border-gray-200 mb-6 shadow overflow-hidden">
            <div className="flex divide-x divide-gray-200">
              {tabConfig.map(({ key, label, icon, desc }) => {
                const isActive = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex-1 px-6 py-5 text-left transition-all duration-200 outline-none group ${
                      isActive
                        ? "bg-blue-600 text-white shadow-inner"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 mb-1 text-base font-semibold ${
                        isActive ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {icon}
                      {label}
                    </div>
                    <div
                      className={`text-sm ${
                        isActive ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-[8px] border-2 border-gray-200 p-[20px]">
            {/* Filter Summary */}
            <div className="bg-slate-50 border-2 border-gray-300 rounded-md p-4 mb-6 flex justify-between items-center flex-wrap gap-3 text-sm">
              {/* Left Summary */}
              <div className="flex items-center gap-4 text-gray-700 flex-wrap">
                <span className="flex items-center gap-1 font-semibold">
                  <BarChart2 className="w-4 h-4 text-gray-600" />
                  Results: {currentResultCount} items
                </span>

                {searchTerm && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    <Search className="w-4 h-4" />"{searchTerm}"
                  </span>
                )}
              </div>

              {/* Right Active Filters */}
              <div className="flex gap-2 flex-wrap">
                {activeTab === "users" && (
                  <>
                    {filters.users.gender !== "all" && (
                      <Badge
                        color="amber-100"
                        icon={<User className="w-4 h-4" />}
                        label={filters.users.gender}
                      />
                    )}
                    {filters.users.accountStatus !== "all" && (
                      <Badge
                        color="emerald-100"
                        icon={<CheckCircle className="w-4 h-4" />}
                        label={filters.users.accountStatus}
                      />
                    )}
                    {filters.users.pointRange !== "all" && (
                      <Badge
                        color="green-50"
                        icon={<Wallet className="w-4 h-4" />}
                        label={`${filters.users.pointRange} points`}
                      />
                    )}
                  </>
                )}

                {activeTab === "orders" && (
                  <>
                    {filters.orders.deliveryStatus !== "all" && (
                      <Badge
                        color="blue-100"
                        icon={<Truck className="w-4 h-4" />}
                        label={filters.orders.deliveryStatus}
                      />
                    )}
                    {filters.orders.paymentStatus !== "all" && (
                      <Badge
                        color="amber-100"
                        icon={<CreditCard className="w-4 h-4" />}
                        label={filters.orders.paymentStatus}
                      />
                    )}
                  </>
                )}

                {activeTab === "products" && (
                  <>
                    {filters.products.status !== "all" && (
                      <Badge
                        color="green-50"
                        icon={<RotateCw className="w-4 h-4" />}
                        label={filters.products.status}
                      />
                    )}
                    {filters.products.brand !== "all" && (
                      <Badge
                        color="rose-50"
                        icon={<Tags className="w-4 h-4" />}
                        label={filters.products.brand}
                      />
                    )}
                    {filters.products.category !== "all" && (
                      <Badge
                        color="indigo-100"
                        icon={<Package className="w-4 h-4" />}
                        label={filters.products.category}
                      />
                    )}
                    {filters.products.stockLevel !== "all" && (
                      <Badge
                        color="emerald-50"
                        icon={<BarChart2 className="w-4 h-4" />}
                        label={`${filters.products.stockLevel} stock`}
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* User Data View */}
            {activeTab === "users" && (
              <div>
                <h2 className="text-[20px] font-semibold flex items-center gap-2 text-gray-900 mb-[20px]">
                  <User /> User Profile Data
                </h2>

                {/* Sensitive Data Protection Controls */}
                <div className="bg-slate-50 border-2 border-gray-200 rounded-lg p-4 mb-[20px]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[16px] font-semibold flex items-center gap-2 text-slate-800">
                      <Lock /> Data Privacy Controls
                    </span>
                    <span className="text-[12px] text-slate-500 bg-gray-200 px-2 py-[2px] rounded-full">
                      Admin Only
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(protectedFields).map(
                      ([field, isProtected]) => {
                        const formattedField =
                          field.charAt(0).toUpperCase() +
                          field.slice(1).replace(/([A-Z])/g, " $1");

                        return (
                          <label
                            key={field}
                            className={`flex items-center gap-2 cursor-pointer p-3 rounded-md border-2 transition-colors ${
                              isProtected
                                ? "bg-green-50 border-green-200 text-green-600"
                                : "bg-red-50 border-red-200 text-red-600"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isProtected}
                              onChange={() => toggleFieldProtection(field)}
                              className="sr-only"
                            />
                            <span className="flex items-center gap-2 text-sm font-medium">
                              {isProtected ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Unlock className="w-4 h-4" />
                              )}
                              Protect {formattedField}
                            </span>
                          </label>
                        );
                      }
                    )}
                  </div>

                  <div className="mt-3 p-2 bg-amber-100 border-2 border-amber-500 rounded-md text-[12px] text-amber-900">
                    ⚠️ Protected fields require 2FA authentication to view.
                    Users must verify identity before accessing sensitive data.
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-3 text-left border-b border-gray-200 min-w-[150px]">
                          Name
                        </th>
                        <th className="p-3 text-left border-b border-gray-200 min-w-[200px]">
                          Email
                        </th>
                        <th className="p-3 text-left border-b border-gray-200 min-w-[160px]">
                          Phone
                        </th>
                        <th className="p-3 text-left border-b border-gray-200 min-w-[120px]">
                          DOB
                        </th>
                        <th className="p-3 text-left border-b border-gray-200 min-w-[250px]">
                          Address
                        </th>
                        <th className="p-3 text-left border-b border-gray-200 min-w-[150px]">
                          Username
                        </th>
                        <th className="p-3 text-left border-b border-gray-200 min-w-[120px]">
                          App Reviews
                        </th>
                        <th className="p-3 text-left border-b border-gray-200 min-w-[100px]">
                          Gender
                        </th>
                        <th className="p-3 text-left border-b border-gray-200 min-w-[180px]">
                          Password
                        </th>
                        <th className="p-3 text-left border-b border-gray-200 min-w-[120px]">
                          Points
                        </th>
                        <th className="p-3 text-left border-b border-gray-200 min-w-[120px]">
                          Account Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="p-3 border-2 border-gray-200">
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-[11px] text-gray-500">
                              Created: {user.accountCreated}
                            </div>
                          </td>
                          <td className="p-3 border-2 border-gray-200">
                            <div className="flex items-center gap-2">
                              <span>
                                {protectedFields.email &&
                                !isSensitiveDataVisible(user.id, "email")
                                  ? maskEmail(user.email)
                                  : user.email}
                              </span>
                              {protectedFields.email && (
                                <button
                                  onClick={() =>
                                    toggleSensitiveData(user.id, "email")
                                  }
                                  className={`px-2 py-1 text-[12px] rounded border-2 cursor-pointer ${
                                    authenticated2FAUsers.has(user.id)
                                      ? "border-green-500 bg-green-50 text-green-800"
                                      : "border-gray-300 bg-white text-gray-700"
                                  }`}
                                >
                                  {isSensitiveDataVisible(user.id, "email") ? (
                                    "🙈"
                                  ) : authenticated2FAUsers.has(user.id) ? (
                                    <Eye className="w-4 h-4" />
                                  ) : (
                                    <EyeOff className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              Last Login: {user.lastLogin}
                            </div>
                          </td>
                          <td className="p-3 border-2 border-gray-200">
                            <div className="flex items-center gap-2">
                              <select
                                className="px-1 py-[2px] border-2 border-gray-300 rounded text-[12px] bg-gray-50"
                                value={user.phone.countryCode}
                                disabled
                              >
                                <option value="+91">🇮🇳 +91</option>
                                <option value="+1">🇺🇸 +1</option>
                                <option value="+971">🇦🇪 +971</option>
                              </select>
                              <span>
                                {protectedFields.phone &&
                                !isSensitiveDataVisible(user.id, "phone")
                                  ? maskPhone(user.phone.number)
                                  : user.phone.number}
                              </span>
                              {protectedFields.phone && (
                                <button
                                  onClick={() =>
                                    toggleSensitiveData(user.id, "phone")
                                  }
                                  className={`px-2 py-1 text-[12px] rounded border-2 cursor-pointer ${
                                    authenticated2FAUsers.has(user.id)
                                      ? "border-green-500 bg-green-50 text-green-800"
                                      : "border-gray-300 bg-white text-gray-700"
                                  }`}
                                >
                                  {isSensitiveDataVisible(user.id, "phone") ? (
                                    "🙈"
                                  ) : authenticated2FAUsers.has(user.id) ? (
                                    <Eye className="w-4 h-4" />
                                  ) : (
                                    <EyeOff className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-3 border-2 border-gray-200">
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="font-medium">
                                  {protectedFields.dateOfBirth &&
                                  !isSensitiveDataVisible(
                                    user.id,
                                    "dateOfBirth"
                                  )
                                    ? maskDateOfBirth(user.dateOfBirth)
                                    : user.dateOfBirth}
                                </div>
                                <div className="text-[11px] text-gray-500">
                                  DD/MM/YYYY
                                </div>
                              </div>
                              {protectedFields.dateOfBirth && (
                                <button
                                  onClick={() =>
                                    toggleSensitiveData(user.id, "dateOfBirth")
                                  }
                                  className={`px-2 py-1 text-[12px] rounded border-2 cursor-pointer ${
                                    authenticated2FAUsers.has(user.id)
                                      ? "border-green-500 bg-green-50 text-green-800"
                                      : "border-gray-300 bg-white text-gray-700"
                                  }`}
                                >
                                  {isSensitiveDataVisible(
                                    user.id,
                                    "dateOfBirth"
                                  ) ? (
                                    "🙈"
                                  ) : authenticated2FAUsers.has(user.id) ? (
                                    <Eye className="w-4 h-4" />
                                  ) : (
                                    <EyeOff className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-3 border-2 border-gray-200">
                            <div className="flex items-start gap-2">
                              <div className="flex-1">
                                {protectedFields.address &&
                                !isSensitiveDataVisible(user.id, "address") ? (
                                  <div>
                                    <div>
                                      <strong>Street:</strong>{" "}
                                      {maskAddress(user.address).street}
                                    </div>
                                    <div>
                                      <strong>City:</strong>{" "}
                                      {maskAddress(user.address).city},{" "}
                                      {maskAddress(user.address).state}
                                    </div>
                                    <div>
                                      <strong>PIN:</strong>{" "}
                                      {maskAddress(user.address).pincode}
                                    </div>
                                    <div className="text-[11px] text-gray-500">
                                      <MapPin className="h-4 w-4 inline-block" />{" "}
                                      {maskAddress(user.address).landmark}
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <div>
                                      <strong>Street:</strong>{" "}
                                      {user.address.street}
                                    </div>
                                    <div>
                                      <strong>City:</strong> {user.address.city}
                                      , {user.address.state}
                                    </div>
                                    <div>
                                      <strong>PIN:</strong>{" "}
                                      {user.address.pincode}
                                    </div>
                                    <div className="text-[11px] text-gray-500">
                                      <MapPin className="h-4 w-4 inline-block" />{" "}
                                      {user.address.landmark}
                                    </div>
                                  </div>
                                )}
                              </div>
                              {protectedFields.address && (
                                <button
                                  onClick={() =>
                                    toggleSensitiveData(user.id, "address")
                                  }
                                  className={`px-2 py-1 text-[12px] rounded border-2 cursor-pointer whitespace-nowrap ${
                                    authenticated2FAUsers.has(user.id)
                                      ? "border-green-500 bg-green-50 text-green-800"
                                      : "border-gray-300 bg-white text-gray-700"
                                  }`}
                                >
                                  {isSensitiveDataVisible(
                                    user.id,
                                    "address"
                                  ) ? (
                                    "🙈"
                                  ) : authenticated2FAUsers.has(user.id) ? (
                                    <Eye className="w-4 h-4" />
                                  ) : (
                                    <EyeOff className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-3 border-2 border-gray-200 font-medium">
                            @{user.username}
                          </td>
                          <td className="p-3 border-2 border-gray-200">
                            <div className="flex items-center gap-1">
                              <span>
                                <Star className="w-4 h-4" />
                              </span>
                              <span className="font-semibold">
                                {user.appReviews.rating}
                              </span>
                              <span className="text-gray-500">/5</span>
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {user.appReviews.reviewCount} reviews
                            </div>
                            <div className="text-[10px] text-gray-400">
                              Last: {user.appReviews.lastReviewDate}
                            </div>
                          </td>
                          <td className="p-3 border-2 border-gray-200">
                            <div className="flex items-center gap-1">
                              <span>
                                {user.gender === "male" ? (
                                  <Mars className="w-4 h-4 inline-block" />
                                ) : (
                                  <Venus className="w-4 h-4 inline-block" />
                                )}
                              </span>
                              <span className="capitalize">{user.gender}</span>
                            </div>
                          </td>
                          <td className="p-3 border-2 border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-[12px]">
                                {showPassword[user.id]
                                  ? user.password
                                  : "••••••••••••••••"}
                              </span>
                              <button
                                onClick={() => togglePassword(user.id)}
                                className={`px-2 py-1 text-[12px] rounded border-2 cursor-pointer ${
                                  authenticated2FAUsers.has(user.id)
                                    ? "border-green-500 bg-green-50 text-green-800"
                                    : "border-gray-300 bg-white text-gray-700"
                                }`}
                              >
                                {showPassword[user.id] ? (
                                  "🙈"
                                ) : authenticated2FAUsers.has(user.id) ? (
                                  <Eye className="w-4 h-4" />
                                ) : (
                                  <EyeOff className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <div
                              className={`text-[10px] px-2 py-[3px] rounded border-2 ${
                                authenticated2FAUsers.has(user.id)
                                  ? "text-green-600 bg-green-50 border-green-200"
                                  : "text-red-500 bg-red-50 border-red-200"
                              }`}
                            >
                              {authenticated2FAUsers.has(user.id)
                                ? "2FA Authenticated"
                                : "Requires 2FA Authentication"}
                            </div>
                          </td>
                          <td className="p-3 border-2 border-gray-200">
                            {user.pointBalance}
                          </td>
                          <td className="p-3 border-2 border-gray-200">
                            <span
                              className={`px-2 py-1 text-[12px] font-semibold rounded border-2 ${
                                user.deleteAccount
                                  ? "text-red-500 bg-red-50 border-red-200"
                                  : "text-green-600 bg-green-50 border-green-200"
                              }`}
                            >
                              {user.deleteAccount ? "Deleted" : "Active"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Order Data View */}
            {activeTab === "orders" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-5">
                  <ShoppingCartIcon className="h-6 w-6 inline-block mr-1" />{" "}
                  Order History Data
                </h2>

                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border-2 border-gray-200 rounded-lg p-5 mb-5 bg-white"
                  >
                    {/* Order Header */}
                    <div className="border-b border-gray-200 pb-4 mb-5 flex justify-between items-center">
                      <div>
                        <h3 className="text-blue-500 text-lg font-semibold mb-1 cursor-pointer">
                          <Box className="inline-block mr-1" /> Order ID:{" "}
                          {order.orderId}
                        </h3>
                        <div className="text-xs text-gray-500">
                          Order Date: {order.orderDate} | Status:
                          <span
                            className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${
                              order.deliveryStatus === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order.deliveryStatus === "shipped"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.deliveryStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          order.paymentStatus === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        <CreditCard className="inline-block mr-1" />{" "}
                        {order.paymentStatus.toUpperCase()}
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {/* Customer Information */}
                      <div className="bg-slate-50 p-4 rounded-md border-2 border-slate-200">
                        <h4 className="mb-3 text-slate-700 flex items-center gap-2 font-semibold">
                          <User className="h-5 w-5 inline-block mr-1" />{" "}
                          Customer Details
                        </h4>
                        <div className="mb-2">
                          <div className="space-y-2 flex flex-col">
                            <div>
                              <b>Name:</b> {order.name}
                            </div>
                            <div>
                              <b>Email:</b> {order.email}
                            </div>
                            <div>
                              <b>Phone:</b> {order.phone.countryCode}{" "}
                              {order.phone.number}
                            </div>
                          </div>
                        </div>
                        <div className="p-2 bg-white border-2 border-gray-300 rounded text-xs">
                          <div className="font-semibold mb-1 flex items-center gap-1">
                            <MapPin className="w-h h-4" /> Address:
                          </div>
                          {order.address.street}
                          <div>
                            {order.address.city}, {order.address.state}
                          </div>
                          <div>PIN: {order.address.pincode}</div>
                          <div className="text-gray-500 italic">
                            Landmark: {order.address.landmark}
                          </div>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="bg-green-50 p-4 rounded-md border-2 border-green-200">
                        <h4 className="mb-3 text-slate-700 flex items-center gap-2 font-semibold">
                          <Box className="h-5 w-5 inline-block mr-1" /> Product
                          Information
                        </h4>
                        <div className="mb-2">
                          <div className="font-semibold">SKU Format:</div>
                          <div className="font-mono text-xs p-2 bg-white border-2 border-gray-300 rounded mt-1 break-all">
                            {order.sku}
                          </div>
                        </div>
                        <div className="mb-2">
                          <div className="font-semibold">
                            Barcode (14-digit):
                          </div>
                          <div className="font-mono">{order.barcode}</div>
                        </div>
                        <div>
                          <div className="font-semibold">
                            HSN Code (8-digit):
                          </div>
                          <div className="font-mono text-emerald-600">
                            {order.hsnCode}
                          </div>
                        </div>
                      </div>

                      {/* Pricing Information */}
                      <div className="bg-yellow-50 p-4 rounded-md border-2 border-yellow-300">
                        <h4 className="mb-3 text-slate-700 flex items-center gap-2 font-semibold">
                          <IndianRupee className="h-5 w-5 inline-block mr-1" />{" "}
                          Multi-Platform Pricing
                        </h4>
                        <div className="mb-2">
                          <div className="space-y-2 flex flex-col">
                            <div>
                              <b>Website:</b> ₹{order.prices.website}
                            </div>
                            <div>
                              <b>App:</b> ₹{order.prices.app}
                            </div>
                            <div>
                              <b>Wholesale:</b> ₹{order.prices.wholesale}
                            </div>
                            <div>
                              <b>Marketplace:</b> ₹{order.prices.marketplace}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Documents Section */}
                    <div className="mt-5 p-4 bg-slate-100 border-2 border-slate-300 rounded-md">
                      <h4 className="mb-3 flex items-center gap-2">
                        <File className="h-5 w-5 inline-block mr-1" /> Document
                        Management
                      </h4>
                      <div className="flex gap-2 flex-wrap mb-3">
                        {order.documents.map((doc, idx) => (
                          <button
                            key={idx}
                            onClick={() => openDocumentPreview(doc)}
                            className="px-3 py-2 bg-blue-500 text-white text-xs rounded flex items-center gap-1 hover:bg-blue-600"
                          >
                            <File className="h-5 w-5 inline-block mr-1" /> View{" "}
                            {doc.type}
                            {doc.sides !== "single" && (
                              <span className="text-[10px] bg-white/20 px-1 rounded">
                                {doc.sides}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <button className="px-4 py-2 bg-emerald-600 text-white rounded text-xs">
                            <File className="h-5 w-5 inline-block mr-1" />{" "}
                            Invoice Details - {order.invoiceDetails.invoiceNo}
                          </button>
                        </div>
                        <div className="text-xs text-gray-500">
                          Total Amount: ₹{order.invoiceDetails.totalAmount}{" "}
                          (incl. ₹{order.invoiceDetails.taxAmount} tax)
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Product Data View */}
            {activeTab === "products" && (
              <div>
                <h2 className="text-[20px] font-semibold text-[#111827] mb-[20px]">
                  <Box className="h-5 w-5 inline-block mr-1" /> Product
                  Inventory Data
                </h2>

                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border-2 border-[#e5e7eb] rounded-[8px] p-[20px] mb-[20px] bg-[#fefefe]"
                  >
                    {/* Product Header */}
                    <div className="border-b border-[#e5e7eb] pb-[15px] mb-[20px] flex justify-between items-center">
                      <div>
                        <h3 className="m-0 text-[18px] font-semibold">
                          {product.article}
                        </h3>
                        <div className="text-[12px] text-[#6b7280]">
                          Brand: {product.brand} | Category: {product.category}{" "}
                          | Launched: {product.launchDate}
                        </div>
                        <div className="text-[12px] text-[#6b7280] mt-[3px]">
                          <Star className="w-4 h-4 inline-block" />{" "}
                          {product.rating}/5 ({product.reviewCount} reviews)
                        </div>
                      </div>
                      <div
                        className={
                          `px-[12px] py-[8px] rounded-[6px] text-[12px] font-semibold ` +
                          (product.status === "returnable"
                            ? "bg-[#d1fae5] text-[#065f46]"
                            : "bg-[#fef2f2] text-[#dc2626]")
                        }
                      >
                        {product.status === "returnable" ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> RETURNABLE
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <X className="w-4 h-4" /> NON-RETURNABLE
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-[250px_1fr] gap-[25px]">
                      {/* Product Image */}
                      <div>
                        <div className="w-[230px] h-[230px] bg-[#f3f4f6] rounded-[8px] flex items-center justify-center text-[72px] border-2 border-[#e5e7eb]">
                          {product.category.includes("tshirt")
                            ? "👕"
                            : product.category.includes("shoes")
                            ? "👟"
                            : product.category.includes("dress")
                            ? "👗"
                            : "📦"}
                        </div>
                        <div className="mt-[10px] text-center text-[11px] text-[#6b7280]">
                          Product Image Preview
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="space-y-6">
                        {/* Color & Size Variants */}
                        <div>
                          <h4 className="m-0 mb-[8px] text-[#374151] flex items-center gap-2">
                            <Palette /> Available Variants (
                            {product.variants.length} total)
                          </h4>
                          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-[8px]">
                            {product.variants.map((variant, idx) => (
                              <div
                                key={idx}
                                className="p-[8px] px-[10px] bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-[6px] text-[11px] text-center"
                              >
                                <div className="font-semibold capitalize">
                                  {variant.color} - {variant.size}
                                </div>
                                <div className="text-[#6b7280] text-[10px]">
                                  SKU: {variant.sku}
                                </div>
                                <div
                                  className={
                                    `text-[10px] font-semibold ` +
                                    (variant.stock > 20
                                      ? "text-[#059669]"
                                      : variant.stock > 10
                                      ? "text-[#d97706]"
                                      : "text-[#dc2626]")
                                  }
                                >
                                  Stock: {variant.stock}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Product Information */}
                        <div>
                          <h4 className="m-0 mb-[8px] text-[#374151] flex items-center gap-2">
                            <File /> Product Description
                          </h4>
                          <p className="m-0 text-[#6b7280] text-[13px] leading-[1.5] bg-[#f9fafb] p-[10px] rounded-[4px] border-2 border-[#e5e7eb]">
                            {product.description}
                          </p>
                        </div>

                        <div>
                          <h4 className="m-0 mb-[8px] text-[#374151] flex items-center gap-2">
                            <Factory /> Manufacturing Details
                          </h4>
                          <p className="m-0 text-[#6b7280] text-[13px] bg-[#f0fdf4] p-[10px] rounded-[4px] border-2 border-[#bbf7d0]">
                            {product.manufacturingDetails}
                          </p>
                        </div>

                        <div>
                          <h4 className="m-0 mb-[8px] text-[#374151] flex items-center gap-2">
                            <Truck /> Shipping & Returns Policy
                          </h4>
                          <p className="m-0 text-[#6b7280] text-[13px] bg-[#fef3c7] p-[10px] rounded-[4px] border-2 border-[#fde047]">
                            {product.shippingReturns}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-[10px] flex-wrap p-[15px] bg-[#f8fafc] rounded-[6px] border-2 border-[#e2e8f0]">
                          <button
                            onClick={() => openSizeChart(product.sizeCharts)}
                            className="px-[16px] py-[10px] bg-[#8b5cf6] text-white border-none rounded-[6px] cursor-pointer text-[12px] font-semibold flex items-center gap-[6px]"
                          >
                            <Eye className="h-4 w-4" /> View Size Charts (
                            {product.sizeCharts.length})
                          </button>
                          <button
                            onClick={() => handleEditSizeCharts(product)}
                            className="px-[16px] py-[10px] bg-[#06b6d4] text-white border-none rounded-[6px] cursor-pointer text-[12px] font-semibold flex items-center gap-[6px]"
                          >
                            <Pen className="h-4 w-4" /> Edit Size Charts
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="px-[16px] py-[10px] bg-[#f59e0b] text-white border-none rounded-[6px] cursor-pointer text-[12px] font-semibold flex items-center gap-[6px]"
                          >
                            <Pen className="h-4 w-4" /> Edit Product
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="px-[16px] py-[10px] bg-[#ef4444] text-white border-none rounded-[6px] cursor-pointer text-[12px] font-semibold flex items-center gap-[6px]"
                          >
                            <Trash className="h-4 w-4" /> Delete Product
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Document Preview Modal */}
        {documentPreview && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-[1000]">
            <div className="bg-white rounded-[8px] p-[20px] max-w-[700px] w-[90%] max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-[20px]">
                <div>
                  <h3 className="m-0">📄 Document Preview</h3>
                  <div className="text-[12px] text-[#6b7280] mt-[4px]">
                    {documentPreview.type.toUpperCase()} |{" "}
                    {documentPreview.sides.toUpperCase()} | Uploaded:{" "}
                    {documentPreview.uploadDate}
                  </div>
                </div>
                <button
                  onClick={() => setDocumentPreview(null)}
                  className="px-[12px] py-[8px] bg-[#ef4444] text-white border-none rounded-[4px] cursor-pointer font-semibold"
                >
                  ✕ Close
                </button>
              </div>

              {/* Document Box */}
              <div className="border-2 border-[#e5e7eb] rounded-[6px] overflow-hidden mb-[15px]">
                <div className="h-[450px] bg-[#f3f4f6] flex items-center justify-center text-[72px]">
                  📄
                </div>
              </div>

              {/* Metadata & Actions */}
              <div className="text-center p-[15px] bg-[#f8fafc] rounded-[6px] border-2 border-[#e2e8f0]">
                <div className="font-semibold mb-[8px]">
                  {documentPreview.name}
                </div>
                <div className="text-[12px] text-[#6b7280] mb-[12px]">
                  Document Type: {documentPreview.type} | Sides:{" "}
                  {documentPreview.sides}
                </div>
                <div className="flex gap-[10px] justify-center flex-wrap">
                  <button className="px-[12px] py-[6px] bg-[#3b82f6] text-white text-[12px] rounded-[4px] cursor-pointer">
                    📥 Download
                  </button>
                  <button className="px-[12px] py-[6px] bg-[#059669] text-white text-[12px] rounded-[4px] cursor-pointer">
                    🔍 Zoom
                  </button>
                  <button className="px-[12px] py-[6px] bg-[#dc2626] text-white text-[12px] rounded-[4px] cursor-pointer">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Size Chart Modal */}
        {sizeChartPreview && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-[1000]">
            <div className="bg-white rounded-[8px] p-[20px] max-w-[900px] w-[90%] max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-[20px]">
                <h3 className="flex items-center gap-2 font-semibold">
                  <RulerDimensionLine /> Size Charts Reference
                </h3>
                <button
                  onClick={() => setSizeChartPreview(null)}
                  className="px-[12px] py-[8px] bg-[#ef4444] text-white border-none rounded-[4px] cursor-pointer font-semibold"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Grid of charts */}
              <div className="grid gap-[20px] grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
                {sizeChartPreview.map((chart, idx) => (
                  <div
                    key={idx}
                    className="border-2 border-[#e5e7eb] rounded-[6px] overflow-hidden"
                  >
                    {/* Chart header */}
                    <div className="p-[12px] bg-[#f8fafc] border-b border-[#e5e7eb] text-center">
                      <h4 className="m-0 uppercase font-semibold">
                        {chart.type} SIZE CHART
                      </h4>
                      <div className="text-[11px] text-[#6b7280] mt-[4px]">
                        {chart.name}
                      </div>
                    </div>

                    {/* Placeholder area */}
                    <div className="h-[320px] bg-[#f3f4f6] flex items-center justify-center">
                      <PencilRuler className="h-10 w-10" />
                    </div>

                    {/* Footer */}
                    <div className="p-[10px] bg-[#fafafa] text-center text-[11px] text-[#6b7280]">
                      Click to view full size chart
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes Section */}
              <div className="mt-[20px] p-[15px] bg-[#f0fdf4] rounded-[6px] border-2 border-[#bbf7d0]">
                <div className="text-sm text-[#374151]">
                  <div className="flex items-center gap-2 font-semibold">
                    <ScrollText className="w-4 h-4" /> Size Chart Notes:
                  </div>
                  <ul className="mt-[8px] pl-[20px] list-disc">
                    <li>All measurements are in inches/cm as specified</li>
                    <li>
                      Size charts may vary between different product variants
                    </li>
                    <li>
                      Refer to individual product specifications for exact
                      measurements
                    </li>
                    <li>Contact customer support for size recommendations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2FA Modal for Password Viewing */}
        {show2FAModal && (
          <TwoFactorAuth
            onSubmit={handle2FASubmit}
            onClose={handleCancel2FA}
            phoneNumber="+91 9876543210"
            emailAddress="admin@company.com"
          />
        )}

        {/* 2FA Success Modal */}
        {show2FASuccess && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-[1000]">
            <div className="bg-white rounded-[8px] p-[30px] max-w-[400px] w-[90%] text-center shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)]">
              <div className="text-[48px] mb-[20px]">✅</div>

              <h3 className="text-[24px] font-semibold text-[#059669] mb-[15px] m-0">
                Authentication Successful!
              </h3>

              <p className="text-[14px] text-[#6b7280] mb-[25px] m-0">
                You can now view sensitive password information. This session
                will remain authenticated for your convenience.
              </p>

              <button
                onClick={handleClose2FASuccess}
                className="px-[20px] py-[10px] bg-[#059669] text-white border-none rounded-[6px] cursor-pointer text-[14px] font-semibold"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Product Edit Modal */}
        {showEditModal && editingProduct && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-[1000]">
            <div className="bg-white rounded-[8px] p-[30px] max-w-[800px] w-[90%] max-h-[80vh] overflow-y-auto shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)]">
              {/* Header */}
              <div className="flex justify-between items-center mb-[25px]">
                <h3 className="text-[24px] font-semibold flex items-center gap-2">
                  <Pen /> Edit Product
                </h3>
                <button
                  onClick={handleCancelEdit}
                  className="px-[12px] py-[8px] bg-[#ef4444] text-white border-none rounded-[4px] cursor-pointer font-semibold"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Form Body */}
              <div className="grid gap-[20px]">
                {/* Article */}
                <div>
                  <label className="block mb-[8px] font-semibold">
                    Article Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.article || ""}
                    onChange={(e) =>
                      handleEditFormChange("article", e.target.value)
                    }
                    className="w-full p-[12px] border-2 border-[#d1d5db] rounded-[6px] text-[14px]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block mb-[8px] font-semibold">
                    Description
                  </label>
                  <textarea
                    value={editFormData.description || ""}
                    onChange={(e) =>
                      handleEditFormChange("description", e.target.value)
                    }
                    rows="4"
                    className="w-full p-[12px] border-2 border-[#d1d5db] rounded-[6px] text-[14px] resize-y"
                  />
                </div>

                {/* Manufacturing Details */}
                <div>
                  <label className="block mb-[8px] font-semibold">
                    Manufacturing Details
                  </label>
                  <textarea
                    value={editFormData.manufacturingDetails || ""}
                    onChange={(e) =>
                      handleEditFormChange(
                        "manufacturingDetails",
                        e.target.value
                      )
                    }
                    rows="3"
                    className="w-full p-[12px] border-2 border-[#d1d5db] rounded-[6px] text-[14px] resize-y"
                  />
                </div>

                {/* Shipping & Returns */}
                <div>
                  <label className="block mb-[8px] font-semibold">
                    Shipping & Returns
                  </label>
                  <textarea
                    value={editFormData.shippingReturns || ""}
                    onChange={(e) =>
                      handleEditFormChange("shippingReturns", e.target.value)
                    }
                    rows="3"
                    className="w-full p-[12px] border-2 border-[#d1d5db] rounded-[6px] text-[14px] resize-y"
                  />
                </div>

                {/* Grid Section */}
                <div className="grid gap-[15px] grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                  {/* Status */}
                  <div>
                    <label className="block mb-[8px] font-semibold">
                      Status
                    </label>
                    <select
                      value={editFormData.status || ""}
                      onChange={(e) =>
                        handleEditFormChange("status", e.target.value)
                      }
                      className="w-full p-[12px] border-2 border-[#d1d5db] rounded-[6px] text-[14px]"
                    >
                      <option value="returnable">Returnable</option>
                      <option value="non-returnable">Non-Returnable</option>
                    </select>
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block mb-[8px] font-semibold">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={editFormData.brand || ""}
                      onChange={(e) =>
                        handleEditFormChange("brand", e.target.value)
                      }
                      className="w-full p-[12px] border-2 border-[#d1d5db] rounded-[6px] text-[14px]"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block mb-[8px] font-semibold">
                      Category
                    </label>
                    <input
                      type="text"
                      value={editFormData.category || ""}
                      onChange={(e) =>
                        handleEditFormChange("category", e.target.value)
                      }
                      className="w-full p-[12px] border-2 border-[#d1d5db] rounded-[6px] text-[14px]"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-[12px] mt-[30px] justify-end">
                <button
                  onClick={handleCancelEdit}
                  className="px-[24px] py-[12px] bg-[#6b7280] text-white border-none rounded-[6px] cursor-pointer text-[14px] font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProductChanges}
                  className="px-[24px] py-[12px] bg-[#059669] text-white border-none rounded-[6px] cursor-pointer text-[14px] font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Size Chart Edit Modal */}
        {showSizeChartEditModal && editingProduct && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-[1000]">
            <div className="bg-white rounded-[8px] p-[30px] max-w-[900px] w-[90%] max-h-[80vh] overflow-y-auto shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)]">
              <div className="flex justify-between items-center mb-[25px]">
                <h3 className="m-0 text-[24px] font-semibold flex items-center gap-2">
                  <PencilRuler className="h-6 w-6" /> Edit Size Charts
                </h3>
                <button
                  onClick={handleCancelSizeChartEdit}
                  className="p-1 bg-[#ef4444] text-white border-none rounded-[4px] cursor-pointer font-semibold"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-[20px]">
                <button
                  onClick={handleAddSizeChart}
                  className="px-[16px] py-[10px] bg-[#3b82f6] text-white border-none rounded-[6px] cursor-pointer text-[12px] font-semibold flex items-center gap-[6px]"
                >
                  <Plus className="h-5 w-5" /> Add Size Chart
                </button>
              </div>

              <div className="grid gap-5">
                {editingSizeCharts.map((chart, index) => (
                  <div
                    key={chart.id}
                    className="p-5 border-2 border-[#e5e7eb] rounded-lg shadow-sm bg-[#f9fafb]"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold">
                        Size Chart {index + 1}
                      </h4>
                      <button
                        onClick={() => handleRemoveSizeChart(chart.id)}
                        className="text-[#ef4444] rounded-lg font-semibold text-sm"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block mb-2 font-semibold">
                          Chart Type
                        </label>
                        <select
                          value={chart.type}
                          onChange={(e) =>
                            handleSizeChartChange(
                              chart.id,
                              "type",
                              e.target.value
                            )
                          }
                          className="w-full p-[10px] border-2 border-gray-300 rounded-lg text-sm"
                        >
                          <option value="inch">Inches</option>
                          <option value="cm">Centimeters</option>
                          <option value="measurement">Measurement Guide</option>
                        </select>
                      </div>

                      <div>
                        <label className="block mb-2 font-semibold">
                          Chart Name
                        </label>
                        <input
                          type="text"
                          value={chart.name}
                          onChange={(e) =>
                            handleSizeChartChange(
                              chart.id,
                              "name",
                              e.target.value
                            )
                          }
                          className="w-full p-[10px] border-2 border-gray-300 rounded-lg text-sm"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 font-semibold">
                          Image URL
                        </label>
                        <input
                          type="text"
                          value={chart.url}
                          onChange={(e) =>
                            handleSizeChartChange(
                              chart.id,
                              "url",
                              e.target.value
                            )
                          }
                          placeholder="/charts/size_chart.jpg"
                          className="w-full p-[10px] border-2 border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-6 gap-4">
                <button
                  onClick={handleCancelSizeChartEdit}
                  className="py-3 px-6 bg-[#6b7280] text-white rounded-lg font-semibold text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSizeCharts}
                  className="py-3 px-6 bg-[#059669] text-white rounded-lg font-semibold text-sm cursor-pointer flex items-center gap-2"
                >
                  <PencilRuler className="h-4 w-4" /> Save Size Charts
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onConfirm={confirmDeleteProduct}
          onCancel={cancelDeleteProduct}
          title={`Are you sure you want to delete "${productToDelete?.article}"?`}
          itemName={productToDelete?.article}
        />

        {/* Success Modal */}
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title={successMessage}
        />

        {/* Enhanced Size Chart Modal */}
        {sizeChartPreview && (
          <SizeChartModal
            charts={sizeChartPreview}
            onClose={() => setSizeChartPreview(null)}
          />
        )}
      </div>
    );
  }
);

DatabaseDashboardTab.displayName = "DatabaseDashboardTab";

// Custom hooks for data management (same as before but organized)
const useDashboardData = () => {
  const stats = useMemo(
    () => [
      {
        title: "Total User",
        value: "40,689",
        change: "+8.5%",
        changeType: "increase",
        period: "Up from yesterday",
        icon: Users,
        color: "bg-blue-500",
      },
      {
        title: "Total Order",
        value: "10293",
        change: "+1.3%",
        changeType: "increase",
        period: "Up from past week",
        icon: ShoppingCart,
        color: "bg-green-500",
      },
      {
        title: "Total Sales",
        value: "$89,000",
        change: "-4.3%",
        changeType: "decrease",
        period: "Down from yesterday",
        icon: DollarSign,
        color: "bg-yellow-500",
      },
      {
        title: "Total Pending",
        value: "2040",
        change: "+1.8%",
        changeType: "increase",
        period: "Up from yesterday",
        icon: Package,
        color: "bg-purple-500",
      },
      {
        title: "Sync Products",
        value: "10293",
        change: "+1.3%",
        changeType: "increase",
        period: "Up from past week",
        icon: RefreshCw,
        color: "bg-indigo-500",
      },
    ],
    []
  );

  const smsStats = useMemo(
    () => [
      { title: "SMS Sent", value: "50,000" },
      { title: "Delivery Report", value: "35%" },
      { title: "Promotional SMS", value: "₹ 3345" },
      { title: "Transactional SMS", value: "₹ 778" },
    ],
    []
  );

  const analyticsData = useMemo(
    () => [
      { title: "Visitor", value: "395", growth: "348.9", growthType: "up" },
      {
        title: "New Visitors",
        value: "932",
        growth: "565.7",
        growthType: "up",
      },
      {
        title: "Average engagement time",
        value: "1m 50",
        growth: "250.1",
        growthType: "down",
      },
      {
        title: "Total Visitors",
        value: "150K",
        growth: null,
        growthType: null,
      },
    ],
    []
  );

  return { stats, smsStats, analyticsData };
};

const useMarketplaceData = () => {
  const productSyncData = useMemo(
    () => [
      {
        id: 1,
        image: "/api/placeholder/200/200",
        name: "Item Stock",
        price: "2025",
        sku: "2025",
        barcode: "2025",
        synced: "Yes",
        marketplace: "amazon",
        status: "connected",
        error: null,
        action: "sync now",
      },
      {
        id: 2,
        image: "/api/placeholder/200/200",
        name: "Item Stock",
        price: "2025",
        sku: "2025",
        barcode: "2025",
        synced: "no",
        marketplace: "flipkart",
        status: "not connected",
        error: "sync",
        action: "sync now",
      },
      {
        id: 3,
        image: "/api/placeholder/200/200",
        name: "Item Stock",
        price: "2025",
        sku: "2025",
        barcode: "2025",
        synced: "sync",
        marketplace: "ajio",
        status: "not connected",
        error: "sync",
        action: "sync now",
      },
    ],
    []
  );

  const marketplaces = useMemo(
    () => [
      {
        id: 1,
        name: "amazon",
        sellerId: "1234",
        status: "connected",
        lastSync: "02.03pm",
      },
      {
        id: 2,
        name: "flipkart",
        sellerId: "5678",
        status: "not connected",
        lastSync: null,
      },
      {
        id: 3,
        name: "ajio",
        sellerId: "4587",
        status: "connected",
        lastSync: null,
      },
      {
        id: 4,
        name: "myntra",
        sellerId: null,
        status: "not connected",
        lastSync: null,
      },
      {
        id: 5,
        name: "nykaa",
        sellerId: null,
        status: "not connected",
        lastSync: null,
      },
    ],
    []
  );

  const syncLogs = useMemo(
    () => [
      {
        id: 1,
        date: "Nov 11,2025",
        operation: "product sync",
        marketplace: "amazon",
        status: "success",
        error: null,
      },
      {
        id: 2,
        date: "Nov 11,2025",
        operation: "inventory sync",
        marketplace: "flipkart",
        status: "fail",
        error: "connection timeout",
      },
      {
        id: 3,
        date: "Nov 11,2025",
        operation: "product sync",
        marketplace: "ajio",
        status: "fail",
        error: "invalid credentials",
      },
    ],
    []
  );

  return { productSyncData, marketplaces, syncLogs };
};

const useInventoryData = () => {
  const inventoryProducts = useMemo(
    () => [
      {
        id: 1,
        image: "/api/placeholder/120/140",
        productName: "T shirt",
        category: "T shirt",
        subcategory: "T shirt",
        returnable: "returnable",
        sizes: [
          {
            size: "small",
            quantity: 5,
            myntraPrice: 4566,
            amazonPrice: 4566,
            flipkartPrice: 4566,
            nykaPrice: 4566,
            salePrice: 4566,
            actualPrice: 4566,
          },
          {
            size: "medium",
            quantity: 10,
            myntraPrice: 4566,
            amazonPrice: 4566,
            flipkartPrice: 4566,
            nykaPrice: 4566,
            salePrice: 4566,
            actualPrice: 4566,
          },
          {
            size: "large",
            quantity: 15,
            myntraPrice: 4566,
            amazonPrice: 4566,
            flipkartPrice: 4566,
            nykaPrice: 4566,
            salePrice: 4566,
            actualPrice: 4566,
          },
        ],
        sku: "blk/m/inso123",
        barcode: "45660000000000",
        description: "this is a shirt",
        manufacturingDetails: "mfd by apparels pvt ltd",
        shippingReturns: "7 day return",
        metaTitle: "dhdhd/dhdhdh",
        metaDescription: "ths/ isnsn/s",
        slugUrl: "ths/ isnsn/s",
        photos: true,
        sizeChart: true,
        status: "good to go",
      },
      {
        id: 2,
        image: "/api/placeholder/120/140",
        productName: "T shirt",
        category: "T shirt",
        subcategory: "T shirt",
        returnable: "returnable",
        sizes: [
          {
            size: "small",
            quantity: 3,
            myntraPrice: 3999,
            amazonPrice: 3999,
            flipkartPrice: 3999,
            nykaPrice: 3999,
            salePrice: 3999,
            actualPrice: 3999,
          },
          {
            size: "medium",
            quantity: 8,
            myntraPrice: 3999,
            amazonPrice: 3999,
            flipkartPrice: 3999,
            nykaPrice: 3999,
            salePrice: 3999,
            actualPrice: 3999,
          },
          {
            size: "large",
            quantity: 12,
            myntraPrice: 3999,
            amazonPrice: 3999,
            flipkartPrice: 3999,
            nykaPrice: 3999,
            salePrice: 3999,
            actualPrice: 3999,
          },
        ],
        sku: "red/l/inso124",
        barcode: "45660000000001",
        description: "red cotton shirt",
        manufacturingDetails: "mfd by textile mills",
        shippingReturns: "7 day return",
        metaTitle: "red-shirt-cotton",
        metaDescription: "comfortable red shirt",
        slugUrl: "red-cotton-shirt",
        photos: true,
        sizeChart: true,
        status: "low",
      },
      {
        id: 3,
        image: "/api/placeholder/120/140",
        productName: "T shirt",
        category: "T shirt",
        subcategory: "T shirt",
        returnable: "returnable",
        sizes: [
          {
            size: "small",
            quantity: 0,
            myntraPrice: 2999,
            amazonPrice: 2999,
            flipkartPrice: 2999,
            nykaPrice: 2999,
            salePrice: 2999,
            actualPrice: 2999,
          },
          {
            size: "medium",
            quantity: 2,
            myntraPrice: 2999,
            amazonPrice: 2999,
            flipkartPrice: 2999,
            nykaPrice: 2999,
            salePrice: 2999,
            actualPrice: 2999,
          },
          {
            size: "large",
            quantity: 5,
            myntraPrice: 2999,
            amazonPrice: 2999,
            flipkartPrice: 2999,
            nykaPrice: 2999,
            salePrice: 2999,
            actualPrice: 2999,
          },
        ],
        sku: "blu/xl/inso125",
        barcode: "45660000000002",
        description: "blue formal shirt",
        manufacturingDetails: "mfd by fashion house",
        shippingReturns: "7 day return",
        metaTitle: "blue-formal-shirt",
        metaDescription: "professional blue shirt",
        slugUrl: "blue-formal-shirt",
        photos: true,
        sizeChart: false,
        status: "finished",
      },
    ],
    []
  );

  return { inventoryProducts };
};

// All other components remain the same but are imported from the previous implementations
// I'll include the essential ones here for completeness:

const StatsGrid = memo(({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {stats.map((stat, index) => (
      <StatCard key={`stat-${index}`} stat={stat} />
    ))}
  </div>
));

StatsGrid.displayName = "StatsGrid";

const StatCard = memo(({ stat }) => {
  const Icon = stat.icon;
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-gray-100/50 hover:border-gray-200/60 group backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-xl ${stat.color} group-hover:scale-105 transition-transform duration-200 shadow-sm`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div>
        <p className="text-base font-medium text-[#202224] opacity-75 mb-1 group-hover:opacity-90 transition-opacity duration-200">
          {stat.title}
        </p>
        <p className="text-3xl font-bold text-[#202224] tracking-wide mb-3 group-hover:text-gray-800 transition-colors duration-200">
          {stat.value}
        </p>
        <div className="flex items-center bg-gray-50/50 rounded-lg px-3 py-1.5 group-hover:bg-gray-50/80 transition-colors duration-200">
          {stat.changeType === "increase" ? (
            <TrendingUp className="h-4 w-4 text-emerald-500 mr-1.5" />
          ) : (
            <TrendingDown className="h-4 w-4 text-rose-500 mr-1.5" />
          )}
          <span
            className={`text-sm font-semibold ${
              stat.changeType === "increase"
                ? "text-[#00b69b]"
                : "text-[#f93c65]"
            }`}
          >
            {stat.change}
          </span>
          <span className="text-sm text-[#606060] ml-1">{stat.period}</span>
        </div>
      </div>
    </div>
  );
});

StatCard.displayName = "StatCard";

const SMSStatsSection = memo(({ smsStats }) => (
  <div className="bg-white rounded-2xl shadow-md p-8 border-2 border-gray-100/50">
    <h3 className="text-2xl font-bold text-gray-900 mb-6">SMS Analytics</h3>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {smsStats.map((stat, index) => (
        <div
          key={`sms-${index}`}
          className="text-left group bg-gray-50 rounded-xl p-6 border-2 border-gray-100"
        >
          <p className="text-sm font-medium text-[#101316] opacity-75 mb-2 group-hover:opacity-90 transition-opacity duration-200">
            {stat.title}
          </p>
          <p className="text-3xl font-bold text-[#202020] group-hover:text-gray-800 transition-colors duration-200">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  </div>
));

SMSStatsSection.displayName = "SMSStatsSection";

const SalesAnalyticsSection = memo(
  ({
    analyticsData,
    selectedTimeRange,
    onTimeRangeChange,
    onExportPDF,
    onExportExcel,
    selectedSalesDateRange,
    onSalesDateRangeChange,
    salesDateRange,
  }) => {
    // State for sales date range picker
    const [isSalesDatePickerOpen, setIsSalesDatePickerOpen] = useState(false);
    const [showSalesCustomPicker, setShowSalesCustomPicker] = useState(false);
    const [salesCustomStartDate, setSalesCustomStartDate] = useState("");
    const [salesCustomEndDate, setSalesCustomEndDate] = useState("");
    const salesDatePickerRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          salesDatePickerRef.current &&
          !salesDatePickerRef.current.contains(event.target)
        ) {
          setIsSalesDatePickerOpen(false);
          setShowSalesCustomPicker(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSalesRangeSelect = (option) => {
      if (option.value === "custom") {
        setShowSalesCustomPicker(true);
      } else {
        onSalesDateRangeChange(option);
        setIsSalesDatePickerOpen(false);
        setShowSalesCustomPicker(false);
      }
    };

    const handleSalesCustomRangeApply = () => {
      if (salesCustomStartDate && salesCustomEndDate) {
        const customOption = {
          label: "Custom Range",
          value: "custom",
          startDate: salesCustomStartDate,
          endDate: salesCustomEndDate,
        };
        onSalesDateRangeChange(customOption);
        setIsSalesDatePickerOpen(false);
        setShowSalesCustomPicker(false);
      }
    };

    const formatSalesDateRange = () => {
      if (
        selectedSalesDateRange.value === "custom" &&
        selectedSalesDateRange.startDate &&
        selectedSalesDateRange.endDate
      ) {
        const start = new Date(
          selectedSalesDateRange.startDate
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const end = new Date(selectedSalesDateRange.endDate).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          }
        );
        return `${start} – ${end}`;
      }
      return salesDateRange;
    };

    return (
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900">Sales Details</h3>
          <div className="flex items-center space-x-4">
            {/* Sales Date Range Picker */}
            <div className="relative" ref={salesDatePickerRef}>
              <button
                onClick={() => setIsSalesDatePickerOpen(!isSalesDatePickerOpen)}
                className="flex items-center gap-2 text-sm text-white bg-blue-600 px-4 py-2 rounded-lg shadow-inner border-2 border-slate-200 hover:bg-blue-700 transition-colors duration-200"
              >
                <CalendarRange className="h-4 w-4" />
                <span className="font-medium tracking-wide">
                  {formatSalesDateRange()}
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isSalesDatePickerOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isSalesDatePickerOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 min-w-[280px] date-picker-dropdown">
                  {!showSalesCustomPicker ? (
                    <div className="p-2">
                      {DATE_RANGE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSalesRangeSelect(option)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-150 date-picker-option ${
                            selectedSalesDateRange.value === option.value
                              ? "selected font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Select Custom Range
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={salesCustomStartDate}
                            onChange={(e) =>
                              setSalesCustomStartDate(e.target.value)
                            }
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={salesCustomEndDate}
                            onChange={(e) =>
                              setSalesCustomEndDate(e.target.value)
                            }
                            min={salesCustomStartDate}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => setShowSalesCustomPicker(false)}
                            className="flex-1 px-3 py-2 text-sm text-gray-600 border-2 border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSalesCustomRangeApply}
                            disabled={
                              !salesCustomStartDate || !salesCustomEndDate
                            }
                            className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl flex items-center justify-center mb-8 hover:from-gray-50/80 hover:to-gray-100/30 transition-all duration-300 border-2 border-gray-100/50">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">
              Chart visualization area
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {analyticsData.map((item, index) => (
            <div key={`analytics-${index}`} className="group">
              <p className="text-sm font-semibold text-[#9aa0a6] mb-2 tracking-wider group-hover:text-gray-600 transition-colors duration-200">
                {item.title}
              </p>
              <p className="text-2xl font-bold text-[#9aa0a6] mb-2 group-hover:text-gray-700 transition-colors duration-200">
                {item.value}
              </p>
              {item.growth && (
                <div className="flex items-center bg-gray-50/50 rounded-lg px-3 py-1.5 group-hover:bg-gray-50/80 transition-colors duration-200">
                  <span
                    className={`text-sm font-semibold mr-1.5 ${
                      item.growthType === "up"
                        ? "text-emerald-500"
                        : "text-rose-500"
                    }`}
                  >
                    {item.growth}
                  </span>
                  {item.growthType === "up" ? (
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-rose-500" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-6 border-t border-gray-100">
          <h4 className="text-xl font-bold text-gray-900">Views Report</h4>
          <div className="flex flex-wrap gap-3">
            {TIME_PERIODS.map((period) => (
              <button
                key={period}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  selectedTimeRange === period
                    ? "bg-zinc-900 text-white shadow-md hover:bg-zinc-800"
                    : "bg-gray-50 text-zinc-600 border-2 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                }`}
                onClick={() => onTimeRangeChange(period)}
              >
                {period}
              </button>
            ))}
            <button
              onClick={onExportPDF}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Export PDF
            </button>
            <button
              onClick={onExportExcel}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </button>
          </div>
        </div>
      </div>
    );
  }
);

SalesAnalyticsSection.displayName = "SalesAnalyticsSection";

// Performance optimization: Virtualized table row component for large datasets
const VirtualizedInventoryRow = memo(
  ({ product, onEdit, onDelete, onDownload, style }) => (
    <div
      style={style}
      className="flex hover:bg-gray-50 transition-colors duration-200 border-b border-gray-200"
    >
      <div className="flex-none w-32 px-4 py-4">
        <ProductImage image={product.image} productName={product.productName} />
      </div>
      <div className="flex-none w-48 px-4 py-4">
        <div className="text-sm font-medium text-gray-900 truncate">
          {product.productName}
        </div>
      </div>
      <div className="flex-none w-32 px-4 py-4">
        <span className="text-sm text-gray-900 font-medium truncate">
          {product.category}
        </span>
      </div>
      <div className="flex-none w-32 px-4 py-4">
        <span className="text-sm text-gray-900 font-medium truncate">
          {product.subcategory}
        </span>
      </div>
      <div className="flex-none w-24 px-4 py-4">
        <div className="text-sm text-gray-900 font-medium">
          ₹
          {product.sizes && product.sizes.length > 0
            ? product.sizes[0].salePrice
            : "N/A"}
        </div>
      </div>
      <div className="flex-none w-28 px-4 py-4">
        <ActionButtons
          productId={product.id}
          onEdit={onEdit}
          onDelete={onDelete}
          onDownload={onDownload}
        />
      </div>
    </div>
  )
);

VirtualizedInventoryRow.displayName = "VirtualizedInventoryRow";

// Optimized Inventory Product Row Component with memoized calculations
const InventoryProductRow = memo(
  ({ product, onEdit, onDelete, onDownload }) => {
    // Pre-calculate expensive operations
    const firstPrice = useMemo(
      () =>
        product.sizes && product.sizes.length > 0
          ? product.sizes[0].salePrice
          : "N/A",
      [product.sizes]
    );

    return (
      <tr className="hover:bg-gray-50 transition-colors duration-200 border-t-2 border-gray-200">
        <td className="px-4 py-4">
          <ProductImage
            image={product.image}
            productName={product.productName}
          />
        </td>
        <td className="px-4 py-4">
          <div className="text-sm font-medium text-gray-900">
            {product.productName}
          </div>
        </td>
        <td className="px-4 py-4">
          <span className="text-sm text-gray-900 font-medium">
            {product.category}
          </span>
        </td>
        <td className="px-4 py-4">
          <span className="text-sm text-gray-900 font-medium">
            {product.subcategory}
          </span>
        </td>
        <td className="px-4 py-4">
          <div className="text-sm text-gray-900 font-medium">₹{firstPrice}</div>
        </td>
        <td className="px-4 py-4">
          <SizeData sizes={product.sizes} dataType="size" />
        </td>
        <td className="px-4 py-4">
          <SizeData sizes={product.sizes} dataType="quantity" />
        </td>
        <td className="px-4 py-4">
          <SizeData sizes={product.sizes} dataType="salePrice" />
        </td>
        <td className="px-4 py-4">
          <SizeData sizes={product.sizes} dataType="actualPrice" />
        </td>
        <td className="px-4 py-4">
          <span className="text-sm text-gray-900 font-mono">{product.sku}</span>
        </td>
        <td className="px-4 py-4">
          <span className="text-sm text-gray-900 font-mono">
            {product.barcode}
          </span>
        </td>
        <td className="px-4 py-4">
          <span className="text-sm text-gray-900 max-w-xs truncate">
            {product.description}
          </span>
        </td>
        <td className="px-4 py-4">
          <span className="text-sm text-gray-900 max-w-xs truncate">
            {product.manufacturingDetails}
          </span>
        </td>
        <td className="px-4 py-4">
          <span className="text-sm text-gray-900">
            {product.shippingReturns}
          </span>
        </td>
        <td className="px-4 py-4">
          <span className="text-sm text-gray-900 max-w-xs truncate">
            {product.metaTitle}
          </span>
        </td>
        <td className="px-4 py-4">
          <span className="text-sm text-gray-900 max-w-xs truncate">
            {product.metaDescription}
          </span>
        </td>
        <td className="px-4 py-4">
          <span className="text-sm text-gray-900 max-w-xs truncate font-mono">
            {product.slugUrl}
          </span>
        </td>
        <td className="px-4 py-4">
          <AvailabilityButton available={product.photos} label="Photos" />
        </td>
        <td className="px-4 py-4">
          <AvailabilityButton
            available={product.sizeChart}
            label="Size chart"
          />
        </td>
        <td className="px-4 py-4">
          <div className="flex flex-col items-center gap-3">
            <StatusBadge status={product.status} />
            <ActionButtons
              productId={product.id}
              onEdit={onEdit}
              onDelete={onDelete}
              onDownload={onDownload}
            />
          </div>
        </td>
      </tr>
    );
  }
);

InventoryProductRow.displayName = "InventoryProductRow";

// Additional components (simplified for brevity - include all from Dashboard_optimized.js)
const ProductSyncSection = memo(
  ({ productSyncData, searchTerm, onSearchChange }) => (
    <div className="bg-white rounded-2xl shadow-md p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-10">
        Product Sync Manager
      </h2>

      <div className="mb-10">
        <div className="relative max-w-xl">
          <Search className="h-5 w-5 absolute left-4 top-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products, marketplace, or SKU..."
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white focus:bg-white transition-all duration-200 text-sm font-medium placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              {PRODUCT_SYNC_HEADERS.map((header) => (
                <th
                  key={header}
                  className="text-left py-4 px-6 font-semibold text-sm text-gray-600 uppercase tracking-wide"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productSyncData.map((product, index) => (
              <tr
                key={`sync-product-${product.id}`}
                className={`border-t-2 border-gray-200 hover:bg-gray-50 transition-colors duration-200 group ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="py-5 px-6">
                  <div className="w-16 h-16 flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-500" />
                  </div>
                </td>
                <td className="py-5 px-6 font-semibold text-gray-900 text-base group-hover:text-gray-800 transition-colors duration-200">
                  {product.name}
                </td>
                <td className="py-5 px-6 text-gray-700 text-base font-medium">
                  {product.price}
                </td>
                <td className="py-5 px-6 text-gray-700 text-sm">
                  <span className="font-mono">{product.sku}</span>
                </td>
                <td className="py-5 px-6 text-gray-700 text-sm">
                  <span className="font-mono">{product.barcode}</span>
                </td>
                <td className="py-5 px-6">
                  <span
                    className={`text-sm font-medium ${
                      product.synced === "Yes"
                        ? "text-green-600"
                        : product.synced === "no"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {product.synced === "Yes"
                      ? "Connected"
                      : product.synced === "no"
                      ? "Disconnected"
                      : product.synced}
                  </span>
                </td>
                <td className="py-5 px-6">
                  <span className="text-sm font-medium text-gray-800 capitalize">
                    {product.marketplace}
                  </span>
                </td>
                <td className="py-5 px-6">
                  <span className="text-sm text-red-600 font-medium">
                    {product.error || "No errors"}
                  </span>
                </td>
                <td className="py-5 px-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Sync Now
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
);

ProductSyncSection.displayName = "ProductSyncSection";

const MarketplaceSettingsSection = memo(() => {
  const [settings, setSettings] = useState({
    globalInventorySync: true,
    syncFrequency: true,
    globalSync: true,
    additionalSync: false,
    perMarketplaceRules: "6hr",
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const updateDropdown = (value) => {
    setSettings((prev) => ({
      ...prev,
      perMarketplaceRules: value,
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-8">
      <h3 className="text-3xl font-bold text-gray-900 mb-10">
        Marketplace Settings
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-6 tracking-tight">
            Orders from marketplace
          </h4>
          <div className="space-y-5">
            <SettingButton
              isOn={settings.globalInventorySync}
              onToggle={() => toggleSetting("globalInventorySync")}
              label="Global inventory sync"
            />
            <SettingButton
              isOn={settings.syncFrequency}
              onToggle={() => toggleSetting("syncFrequency")}
              label="Sync frequency"
            />
            <HourDropdown
              value={settings.perMarketplaceRules}
              onChange={updateDropdown}
              label="Per marketplace rules"
            />
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-6 tracking-tight">
            Out series settings
          </h4>
          <div className="space-y-5">
            <SettingButton
              isOn={settings.globalSync}
              onToggle={() => toggleSetting("globalSync")}
              label="Global sync"
            />
            <SettingButton
              isOn={settings.additionalSync}
              onToggle={() => toggleSetting("additionalSync")}
              label="Additional sync"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

MarketplaceSettingsSection.displayName = "MarketplaceSettingsSection";

const MarketplaceConnectionsSection = memo(({ marketplaces }) => (
  <div className="bg-white rounded-2xl shadow-md p-8">
    <h2 className="text-3xl font-bold text-gray-900 mb-8">
      Connect Marketplaces
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-5 tracking-tight">
          Available marketplace
        </h3>
        <div className="space-y-2 border-2 p-4 rounded-xl">
          <div className="flex justify-between items-center font-semibold pb-2 text-gray-600 uppercase text-sm tracking-wide">
            <span>Marketplace</span>
            <span>Status</span>
          </div>
          {marketplaces.map((marketplace) => (
            <div
              key={`available-${marketplace.id}`}
              className="flex justify-between items-center py-2 border-t-2 border-gray-200"
            >
              <span className="text-base text-gray-800 capitalize">
                {marketplace.name}
              </span>
              <span
                className={`text-sm font-medium ${
                  marketplace.status === "connected"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {marketplace.status === "connected"
                  ? "Connected"
                  : "Disconnected"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-5 tracking-tight">
          Connected accounts
        </h3>
        <div className="space-y-2 border-2 p-4 rounded-xl">
          <div className="grid grid-cols-3 gap-4 font-semibold pb-2 text-gray-600 uppercase text-sm tracking-wide">
            <span>Seller ID</span>
            <span>Last Sync</span>
            <span>Action</span>
          </div>
          {marketplaces.map((marketplace) => (
            <div
              key={`connected-${marketplace.id}`}
              className="grid grid-cols-3 gap-4 items-center py-3 border-t-2 border-gray-200"
            >
              <span className="text-sm text-gray-700 font-mono truncate">
                {marketplace.sellerId || "Not connected"}
              </span>
              <span className="text-sm text-gray-600">
                {marketplace.lastSync || "Never"}
              </span>
              <div className="flex justify-start">
                {marketplace.status === "connected" && (
                  <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                    Sync Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
));

MarketplaceConnectionsSection.displayName = "MarketplaceConnectionsSection";

const SyncLogsSection = memo(({ syncLogs }) => (
  <div className="bg-white rounded-2xl shadow-md p-8">
    <h2 className="text-3xl font-bold text-gray-900 mb-8">Sync Logs</h2>

    <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-50">
            {SYNC_LOG_HEADERS.map((header) => (
              <th
                key={header}
                className="text-left py-4 px-5 text-sm font-semibold text-gray-600 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {syncLogs.map((log) => (
            <tr
              key={`sync-log-${log.id}`}
              className="border-t-2 border-gray-200 hover:bg-gray-50 transition-colors duration-150"
            >
              <td className="py-4 px-5 text-sm font-medium text-gray-900 whitespace-nowrap">
                {log.date}
              </td>
              <td className="py-4 px-5 text-sm font-medium text-gray-900 capitalize whitespace-nowrap">
                {log.operation}
              </td>
              <td className="py-4 px-5 text-sm text-gray-700 capitalize whitespace-nowrap">
                {log.marketplace}
              </td>
              <td className="py-4 px-5">
                <span
                  className={`text-sm font-medium ${
                    log.status === "success" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {log.status === "success" ? "Success" : "Failed"}
                </span>
              </td>
              <td className="py-4 px-5">
                <span className="text-sm text-gray-700">
                  {log.error || "No errors"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
));

SyncLogsSection.displayName = "SyncLogsSection";

export default Database;
