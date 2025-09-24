import React, {
  useState,
  useMemo,
  useCallback,
  memo,
  useRef,
  useEffect,
} from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
  Download,
  FileSpreadsheet,
  ChevronDown,
  Share,
  Printer,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { DateRangePicker, calculateDateRange, formatDateRange } from "./dashboardview";

// Date Range Options (shared from dashboardview.jsx)
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

// Custom hook for analytics data
const useAnalyticsData = () => {
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

  const productSyncData = useMemo(
    () => [
      {
        id: 1,
        name: "Item Stock",
        price: "2025",
        sku: "2025",
        barcode: "2025",
        synced: "Yes",
        marketplace: "amazon",
        status: "connected",
        error: null,
      },
      {
        id: 2,
        name: "Item Stock",
        price: "2025",
        sku: "2025",
        barcode: "2025",
        synced: "no",
        marketplace: "flipkart",
        status: "not connected",
        error: "sync",
      },
      {
        id: 3,
        name: "Item Stock",
        price: "2025",
        sku: "2025",
        barcode: "2025",
        synced: "sync",
        marketplace: "ajio",
        status: "not connected",
        error: "sync",
      },
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

  return { marketplaces, syncLogs, productSyncData, analyticsData };
};

// Analytics Tab Component
const DashboardAnalyticsGoogleReport = memo(() => {
  const [selectedAnalyticsDateRange, setSelectedAnalyticsDateRange] = useState({
    label: "Last 7 Days",
    value: "7days",
    days: 7,
  });
  const [analyticsDateRange, setAnalyticsDateRange] = useState(
    "Nov 11, 2025 – Nov 27, 2025"
  );
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef(null);

  const { marketplaces, syncLogs, productSyncData, analyticsData } = useAnalyticsData();

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

  // Optimized analytics refresh handler with stable reference
  const handleAnalyticsRefresh = useCallback(() => {
    console.log("Refreshing analytics data...", {
      dateRange: selectedAnalyticsDateRange,
      timestamp: new Date().toISOString(),
    });
    // Here you would typically call your analytics API
    // Example: refetchAnalyticsData(selectedAnalyticsDateRange);
  }, [selectedAnalyticsDateRange]);

  // Export handlers
  const handleExportPDF = useCallback(() => {
    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.text("Analytics Report", 20, 30);

      // Add date range
      doc.setFontSize(12);
      doc.text(`Date Range: ${selectedAnalyticsDateRange.label}`, 20, 45);
      doc.text(`Period: ${analyticsDateRange}`, 20, 55);
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
        `analytics-report-${selectedAnalyticsDateRange.value}-${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );

      console.log("PDF report exported successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Error generating PDF report. Please try again.");
    }
  }, [analyticsData, selectedAnalyticsDateRange, analyticsDateRange, marketplaces]);

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
          "Report Type": "Analytics Report",
          "Date Range": selectedAnalyticsDateRange.label,
          Period: analyticsDateRange,
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
      const fileName = `analytics-report-${selectedAnalyticsDateRange.value}-${
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
    selectedAnalyticsDateRange,
    analyticsDateRange,
    marketplaces,
    syncLogs,
    productSyncData,
  ]);

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
        handleExportPDF();
        break;
      case "excel":
        handleExportExcel();
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
            onRangeChange={handleAnalyticsDateRangeChange}
            dateRange={analyticsDateRange}
          />

          {/* Refresh Button */}
          <button
            onClick={handleAnalyticsRefresh}
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
});

DashboardAnalyticsGoogleReport.displayName = "DashboardAnalyticsGoogleReport";

export default DashboardAnalyticsGoogleReport;
export { useAnalyticsData };
