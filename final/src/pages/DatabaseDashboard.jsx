import React, { useState, useCallback, useMemo, memo } from "react";
import {
  Search,
  Settings,
  RotateCw,
  User,
  CheckCircle,
  Wallet,
  Truck,
  Tags,
  Package,
  BarChart,
  ShoppingCart,
  PackageCheck,
  BarChart2,
  CreditCard,
  Lock,
  Unlock,
  ShoppingCartIcon,
  Box,
  IndianRupee,
  File,
  X,
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
} from "lucide-react";
import TwoFactorAuth from "../components/TwoFactorAuth";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import SizeChartModal from "../components/SizeChartModal";
import SuccessModal from "../components/SuccessModal";

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

// Move filter options outside component to prevent recreation
const FILTER_OPTIONS = {
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
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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

// Enhanced Database Dashboard based on Figma designs
const DatabaseDashboard = () => {
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
  const [authenticated2FAUsers, setAuthenticated2FAUsers] = useState(new Set());

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
      if (searchLower && !product.article.toLowerCase().includes(searchLower)) {
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 p-6">
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
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              Advanced Filters
            </h3>
            <button
              onClick={() => resetFilters(activeTab)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition"
            >
              <RotateCw className="w-4 h-4" />
              Reset Filters
            </button>
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
        <div className="bg-white rounded-xl border border-gray-200 mb-6 shadow overflow-hidden">
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
        <div className="bg-white rounded-[8px] border border-gray-200 p-[20px]">
          {/* Filter Summary */}
          <div className="bg-slate-50 border border-gray-300 rounded-md p-4 mb-6 flex justify-between items-center flex-wrap gap-3 text-sm">
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
              <div className="bg-slate-50 border border-gray-200 rounded-lg p-4 mb-[20px]">
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
                          className={`flex items-center gap-2 cursor-pointer p-3 rounded-md border transition-colors ${
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

                <div className="mt-3 p-2 bg-amber-100 border border-amber-500 rounded-md text-[12px] text-amber-900">
                  ⚠️ Protected fields require 2FA authentication to view. Users
                  must verify identity before accessing sensitive data.
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[14px]">
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
                        <td className="p-3 border-b border-gray-100">
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-[11px] text-gray-500">
                            Created: {user.accountCreated}
                          </div>
                        </td>
                        <td className="p-3 border-b border-gray-100">
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
                                className={`px-2 py-1 text-[12px] rounded border cursor-pointer ${
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
                        <td className="p-3 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <select
                              className="px-1 py-[2px] border border-gray-300 rounded text-[12px] bg-gray-50"
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
                                className={`px-2 py-1 text-[12px] rounded border cursor-pointer ${
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
                        <td className="p-3 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-medium">
                                {protectedFields.dateOfBirth &&
                                !isSensitiveDataVisible(user.id, "dateOfBirth")
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
                                className={`px-2 py-1 text-[12px] rounded border cursor-pointer ${
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
                        <td className="p-3 border-b border-gray-100">
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
                                    <strong>City:</strong> {user.address.city},{" "}
                                    {user.address.state}
                                  </div>
                                  <div>
                                    <strong>PIN:</strong> {user.address.pincode}
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
                                className={`px-2 py-1 text-[12px] rounded border cursor-pointer whitespace-nowrap ${
                                  authenticated2FAUsers.has(user.id)
                                    ? "border-green-500 bg-green-50 text-green-800"
                                    : "border-gray-300 bg-white text-gray-700"
                                }`}
                              >
                                {isSensitiveDataVisible(user.id, "address") ? (
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
                        <td className="p-3 border-b border-gray-100 font-medium">
                          @{user.username}
                        </td>
                        <td className="p-3 border-b border-gray-100">
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
                        <td className="p-3 border-b border-gray-100">
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
                        <td className="p-3 border-b border-gray-100">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[12px]">
                              {showPassword[user.id]
                                ? user.password
                                : "••••••••••••••••"}
                            </span>
                            <button
                              onClick={() => togglePassword(user.id)}
                              className={`px-2 py-1 text-[12px] rounded border cursor-pointer ${
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
                            className={`text-[10px] px-2 py-[3px] rounded border ${
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
                        <td className="p-3 border-b border-gray-100">
                          {user.pointBalance}
                        </td>
                        <td className="p-3 border-b border-gray-100">
                          <span
                            className={`px-2 py-1 text-[12px] font-semibold rounded border ${
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
                <ShoppingCartIcon className="h-6 w-6 inline-block mr-1" /> Order
                History Data
              </h2>

              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-5 mb-5 bg-white"
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
                    <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                      <h4 className="mb-3 text-slate-700 flex items-center gap-2 font-semibold">
                        <User className="h-5 w-5 inline-block mr-1" /> Customer
                        Details
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
                      <div className="p-2 bg-white border border-gray-300 rounded text-xs">
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
                    <div className="bg-green-50 p-4 rounded-md border border-green-200">
                      <h4 className="mb-3 text-slate-700 flex items-center gap-2 font-semibold">
                        <Box className="h-5 w-5 inline-block mr-1" /> Product
                        Information
                      </h4>
                      <div className="mb-2">
                        <div className="font-semibold">SKU Format:</div>
                        <div className="font-mono text-xs p-2 bg-white border border-gray-300 rounded mt-1 break-all">
                          {order.sku}
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="font-semibold">Barcode (14-digit):</div>
                        <div className="font-mono">{order.barcode}</div>
                      </div>
                      <div>
                        <div className="font-semibold">HSN Code (8-digit):</div>
                        <div className="font-mono text-emerald-600">
                          {order.hsnCode}
                        </div>
                      </div>
                    </div>

                    {/* Pricing Information */}
                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-300">
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
                  <div className="mt-5 p-4 bg-slate-100 border border-slate-300 rounded-md">
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
                          <File className="h-5 w-5 inline-block mr-1" /> Invoice
                          Details - {order.invoiceDetails.invoiceNo}
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        Total Amount: ₹{order.invoiceDetails.totalAmount} (incl.
                        ₹{order.invoiceDetails.taxAmount} tax)
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
                <Box className="h-5 w-5 inline-block mr-1" /> Product Inventory
                Data
              </h2>

              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border border-[#e5e7eb] rounded-[8px] p-[20px] mb-[20px] bg-[#fefefe]"
                >
                  {/* Product Header */}
                  <div className="border-b border-[#e5e7eb] pb-[15px] mb-[20px] flex justify-between items-center">
                    <div>
                      <h3 className="m-0 text-[18px] font-semibold">
                        {product.article}
                      </h3>
                      <div className="text-[12px] text-[#6b7280]">
                        Brand: {product.brand} | Category: {product.category} |
                        Launched: {product.launchDate}
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
                      {product.status === "returnable"
                        ? <CheckCircle /> + "RETURNABLE"
                        : <X /> + "NON-RETURNABLE"}
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
                              className="p-[8px] px-[10px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] text-[11px] text-center"
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
                        <p className="m-0 text-[#6b7280] text-[13px] leading-[1.5] bg-[#f9fafb] p-[10px] rounded-[4px] border border-[#e5e7eb]">
                          {product.description}
                        </p>
                      </div>

                      <div>
                        <h4 className="m-0 mb-[8px] text-[#374151] flex items-center gap-2">
                          <Factory /> Manufacturing Details
                        </h4>
                        <p className="m-0 text-[#6b7280] text-[13px] bg-[#f0fdf4] p-[10px] rounded-[4px] border border-[#bbf7d0]">
                          {product.manufacturingDetails}
                        </p>
                      </div>

                      <div>
                        <h4 className="m-0 mb-[8px] text-[#374151] flex items-center gap-2">
                          <Truck /> Shipping & Returns Policy
                        </h4>
                        <p className="m-0 text-[#6b7280] text-[13px] bg-[#fef3c7] p-[10px] rounded-[4px] border border-[#fde047]">
                          {product.shippingReturns}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-[10px] flex-wrap p-[15px] bg-[#f8fafc] rounded-[6px] border border-[#e2e8f0]">
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
            <div className="border border-[#e5e7eb] rounded-[6px] overflow-hidden mb-[15px]">
              <div className="h-[450px] bg-[#f3f4f6] flex items-center justify-center text-[72px]">
                📄
              </div>
            </div>

            {/* Metadata & Actions */}
            <div className="text-center p-[15px] bg-[#f8fafc] rounded-[6px] border border-[#e2e8f0]">
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
                  className="border border-[#e5e7eb] rounded-[6px] overflow-hidden"
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
            <div className="mt-[20px] p-[15px] bg-[#f0fdf4] rounded-[6px] border border-[#bbf7d0]">
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
              You can now view sensitive password information. This session will
              remain authenticated for your convenience.
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
                  className="w-full p-[12px] border border-[#d1d5db] rounded-[6px] text-[14px]"
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
                  className="w-full p-[12px] border border-[#d1d5db] rounded-[6px] text-[14px] resize-y"
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
                    handleEditFormChange("manufacturingDetails", e.target.value)
                  }
                  rows="3"
                  className="w-full p-[12px] border border-[#d1d5db] rounded-[6px] text-[14px] resize-y"
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
                  className="w-full p-[12px] border border-[#d1d5db] rounded-[6px] text-[14px] resize-y"
                />
              </div>

              {/* Grid Section */}
              <div className="grid gap-[15px] grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                {/* Status */}
                <div>
                  <label className="block mb-[8px] font-semibold">Status</label>
                  <select
                    value={editFormData.status || ""}
                    onChange={(e) =>
                      handleEditFormChange("status", e.target.value)
                    }
                    className="w-full p-[12px] border border-[#d1d5db] rounded-[6px] text-[14px]"
                  >
                    <option value="returnable">Returnable</option>
                    <option value="non-returnable">Non-Returnable</option>
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block mb-[8px] font-semibold">Brand</label>
                  <input
                    type="text"
                    value={editFormData.brand || ""}
                    onChange={(e) =>
                      handleEditFormChange("brand", e.target.value)
                    }
                    className="w-full p-[12px] border border-[#d1d5db] rounded-[6px] text-[14px]"
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
                    className="w-full p-[12px] border border-[#d1d5db] rounded-[6px] text-[14px]"
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
                  className="p-5 border border-[#e5e7eb] rounded-lg shadow-sm bg-[#f9fafb]"
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
                        className="w-full p-[10px] border border-gray-300 rounded-lg text-sm"
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
                        className="w-full p-[10px] border border-gray-300 rounded-lg text-sm"
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
                          handleSizeChartChange(chart.id, "url", e.target.value)
                        }
                        placeholder="/charts/size_chart.jpg"
                        className="w-full p-[10px] border border-gray-300 rounded-lg text-sm"
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
};

export default DatabaseDashboard;
