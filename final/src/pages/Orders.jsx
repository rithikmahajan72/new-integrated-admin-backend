import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Filter,
  Calendar,
  ChevronDown,
  RotateCw,
  Eye,
  Edit,
  Download,
  MoreHorizontal,
  X,
  Printer,
  Scan,
  Share2,
  Check,
  AlertCircle,
  Package,
  Truck,
  User,
  FileText,
  ArrowLeft,
} from "lucide-react";

/**
 * InvoiceTemplate Component
 *
 * A professional invoice template based on the Figma design
 * Used for PDF generation and printing
 */
const InvoiceTemplate = React.memo(({ orderData, orderStatus }) => {
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const expectedDate = new Date();
  expectedDate.setDate(expectedDate.getDate() + 14);
  const expectedDateStr = expectedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-white w-full max-w-4xl mx-auto p-8 print:p-6 print:shadow-none shadow-lg font-montserrat">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button className="print:hidden flex items-center space-x-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-normal text-gray-700">Invoice</h1>
        </div>

        <div className="flex items-center space-x-4 print:hidden">
          <button className="bg-gray-100 p-3 rounded-lg hover:bg-gray-200">
            <Printer className="h-6 w-6 text-gray-600" />
          </button>
          <button className="p-3 hover:bg-gray-100 rounded-lg">
            <Share2 className="h-6 w-6 text-gray-600" />
          </button>
          <button className="p-3 hover:bg-gray-100 rounded-lg">
            <Download className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Invoice Details Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Left Side - Invoice From & To */}
        <div className="space-y-6">
          {/* Invoice From */}
          <div>
            <h3 className="text-base font-semibold text-gray-700 mb-2">
              Invoice From :
            </h3>
            <div className="space-y-1">
              <p className="text-base font-bold text-gray-700">
                Virginia Walker
              </p>
              <p className="text-sm font-semibold text-gray-600">
                9694 Krajcik Locks Suite 635
              </p>
            </div>
          </div>

          {/* Invoice To */}
          <div>
            <h3 className="text-base font-semibold text-gray-700 mb-2">
              Invoice To :
            </h3>
          </div>
        </div>

        {/* Right Side - Dates */}
        <div className="text-right space-y-2">
          <p className="text-base font-semibold text-gray-700">
            Invoice Date : {currentDate}
          </p>
          <p className="text-base font-semibold text-gray-700">
            expected Date : {expectedDateStr}
          </p>
        </div>
      </div>

      {/* Customer Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 pb-6 border-b border-gray-200">
        {/* Billed To */}
        <div>
          <h4 className="text-lg font-bold text-gray-800 mb-3">billed to</h4>
          <div className="space-y-1 text-base text-gray-600">
            <p>Full Name: {orderData.customer.name}</p>
            <p>Email: {orderData.customer.email}</p>
            <p>Phone: {orderData.customer.phone}</p>
          </div>
        </div>

        {/* Deliver To */}
        <div>
          <h4 className="text-lg font-bold text-gray-800 mb-3">Deliver to</h4>
          <div className="text-base font-semibold text-gray-600">
            <p>Address: {orderData.deliveryAddress}</p>
          </div>
        </div>

        {/* Order Info */}
        <div>
          <h4 className="text-lg font-bold text-gray-800 mb-3">Order Info</h4>
          <div className="space-y-1 text-base font-semibold text-gray-600">
            <p>Shipping: {orderData.orderInfo.shipping}</p>
            <p>Payment Method: {orderData.orderInfo.paymentMethod}</p>
            <p>Status: {orderStatus}</p>
          </div>
        </div>

        {/* Documents Submitted */}
        <div>
          <h4 className="text-lg font-bold text-gray-800 mb-3">
            documents submitted
          </h4>
          <div className="space-y-1 text-base text-gray-600">
            <p>document name</p>
            <p>{orderData.documents.name}</p>
          </div>
        </div>
      </div>

      {/* Order Items Table */}
      <div className="mb-8">
        {/* Table Header */}
        <div className="grid grid-cols-9 gap-4 py-4 border-b border-gray-200 text-sm font-bold text-gray-800">
          <div>order id</div>
          <div>date</div>
          <div className="text-center">customer name</div>
          <div>size</div>
          <div>quantity</div>
          <div>SKU</div>
          <div>barcode no.</div>
          <div>Price</div>
          <div>sale price</div>
        </div>

        {/* Table Rows */}
        {orderData.items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-9 gap-4 py-4 border-b border-gray-100 text-lg font-medium"
          >
            <div className="text-blue-600 underline">{item.id}</div>
            <div className="text-gray-900">{item.date}</div>
            <div className="text-gray-900 text-center">{item.customerName}</div>
            <div className="text-gray-900">{item.size}</div>
            <div className="text-gray-900">{item.quantity}</div>
            <div className="text-gray-900">{item.sku}</div>
            <div className="text-gray-900">{item.barcode}</div>
            <div className="text-gray-900">{item.price}</div>
            <div className="text-gray-900">{item.salePrice}</div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="flex justify-end mb-8">
        <div className="space-y-3">
          <div className="flex justify-between text-lg font-bold text-gray-600 min-w-[300px]">
            <span>Sub Total</span>
            <span className="text-gray-900">{orderData.summary.subTotal}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-600">
            <span>Shipping Rate</span>
            <span className="text-gray-900">
              {orderData.summary.shippingRate}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-600">
            <span>Promo</span>
            <span className="text-gray-900">{orderData.summary.promo}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-600">
            <span>Points</span>
            <span className="text-gray-900">{orderData.summary.points}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-600 pt-3 border-t border-gray-200">
            <span>Total</span>
            <span className="text-gray-900">{orderData.summary.total}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mt-8 pt-6 border-t border-gray-200">
        <p>© 2025 YORAA. All rights reserved.</p>
        <p className="mt-1">Thank you for your business!</p>
      </div>
    </div>
  );
});

/**
 * DocumentViewer Component
 *
 * Displays uploaded documents (front and reverse side of ID) based on the Figma design.
 * Shows document viewer screen with upload status and document images.
 */
const DocumentViewer = React.memo(({ orderId, onBack }) => {
  return (
    <div className="bg-white min-h-screen">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Order Details</span>
          </button>
        </div>

        {/* Document Title with Info Icon */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-6 h-6 bg-gray-800 text-white rounded-full text-xs font-bold mb-3">
            i
          </div>
          <h2 className="text-sm font-medium text-gray-900">
            Uploaded Indian Resident ID
          </h2>
        </div>

        {/* Upload Status Indicators */}
        <div className="flex justify-between items-start mb-8 max-w-5xl mx-auto px-4">
          {/* Front Side Upload Status */}
          <div className="flex flex-col items-start space-y-2">
            <div className="bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm">
              <span className="text-sm text-gray-600 font-normal">
                Uploaded front side
              </span>
            </div>
            <p className="text-xs text-gray-500 pl-4">
              Only .jpg and .jpeg files are allowed.
            </p>
          </div>

          {/* Reverse Side Upload Status */}
          <div className="flex flex-col items-start space-y-2">
            <div className="bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm">
              <span className="text-sm text-gray-600 font-normal">
                Uploaded reverse side
              </span>
            </div>
            <p className="text-xs text-gray-500 pl-4">
              Only .jpg and .jpeg files are allowed.
            </p>
          </div>
        </div>

        {/* Document Images Container - Main dashed border container */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 max-w-6xl mx-auto min-h-[400px]">
          <div className="grid grid-cols-2 gap-12 h-full">
            {/* Front Side Document Placeholder */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 border-4 border-blue-800 rounded-lg flex items-center justify-center bg-white">
                  {/* Document icon similar to Figma design */}
                  <div className="relative">
                    <div className="w-8 h-10 border-2 border-blue-800 rounded-sm bg-white relative">
                      <div className="absolute top-2 left-1 right-1 h-0.5 bg-blue-800 rounded"></div>
                      <div className="absolute top-4 left-1 right-1 h-0.5 bg-blue-800 rounded"></div>
                      <div className="absolute top-6 left-1 right-1 h-0.5 bg-blue-800 rounded"></div>
                      <div className="absolute bottom-2 left-2 w-1 h-1 bg-blue-800 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reverse Side Document Placeholder */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 border-4 border-blue-800 rounded-lg flex items-center justify-center bg-white">
                  {/* Document icon similar to Figma design */}
                  <div className="relative">
                    <div className="w-8 h-10 border-2 border-blue-800 rounded-sm bg-white relative">
                      <div className="absolute top-2 left-1 right-1 h-0.5 bg-blue-800 rounded"></div>
                      <div className="absolute top-4 left-1 right-1 h-0.5 bg-blue-800 rounded"></div>
                      <div className="absolute top-6 left-1 right-1 h-0.5 bg-blue-800 rounded"></div>
                      <div className="absolute bottom-2 left-2 w-1 h-1 bg-blue-800 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * OrderDetails Component
 *
 * Displays comprehensive order information including customer details,
 * order items, payment info, delivery address, and order summary.
 *
 * Features:
 * - Order status management
 * - Customer information display
 * - Order items listing
 * - Payment and delivery information
 * - Action buttons (print, download, share)
 */
const OrderDetails = React.memo(({ orderId, onBack }) => {
  // State for order status management
  const [orderStatus, setOrderStatus] = useState("Pending");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [notes, setNotes] = useState("");
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);

  // Mock order data - in real app, this would be fetched based on orderId
  const orderData = {
    id: orderId || "6743",
    status: "Pending",
    dateRange: "Feb 16,2022 - Feb 20,2022",
    customer: {
      name: "Shristi Singh",
      email: "shristi@gmail.com",
      phone: "+91 904 1212",
    },
    orderInfo: {
      shipping: "Next express",
      paymentMethod: "Paypal",
      status: "Pending",
    },
    deliveryAddress: "Dharam Colony, Palam Vihar, Gurgaon, Haryana",
    paymentInfo: {
      cardNumber: "Master Card **** **** 6557",
      businessName: "Shristi Singh",
      phone: "+91 904 231 1212",
    },
    items: [
      {
        id: "123456789222i",
        image: "/api/placeholder/130/143",
        date: "27 nov 2025",
        customerName: "pearl",
        size: "stock",
        quantity: 2025,
        sku: "2025",
        barcode: "2025",
        price: 4566,
        salePrice: 4566,
      },
      {
        id: "123456789222i",
        image: "/api/placeholder/130/143",
        date: "27 nov 2025",
        customerName: "pearl",
        size: "stock",
        quantity: 2025,
        sku: "2025",
        barcode: "2025",
        price: 4566,
        salePrice: 4566,
      },
    ],
    summary: {
      subTotal: 2025,
      shippingRate: 202,
      promo: 2025,
      points: 2025,
      total: 2025,
    },
    documents: {
      name: "aadhar card",
    },
  };

  // Status options
  const statusOptions = [
    "Pending",
    "Processing",
    "Accepted",
    "Allotted to vendor",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Rejected",
  ];

  // Status color mapping
  const getStatusColor = (status) => {
    const colorMap = {
      Pending: "bg-orange-200 text-orange-800",
      Processing: "bg-blue-200 text-blue-800",
      Accepted: "bg-green-200 text-green-800",
      "Allotted to vendor": "bg-indigo-200 text-indigo-800",
      Shipped: "bg-purple-200 text-purple-800",
      Delivered: "bg-green-500 text-white",
      Cancelled: "bg-red-200 text-red-800",
      Rejected: "bg-red-500 text-white",
    };
    return colorMap[status] || "bg-gray-200 text-gray-800";
  };

  // Event handlers
  const handleStatusChange = useCallback((status) => {
    setOrderStatus(status);
    setShowStatusDropdown(false);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownload = useCallback(() => {
    try {
      // Generate invoice data for PDF
      const invoiceData = {
        customer: {
          name: orderData.customer.name,
          email: orderData.customer.email,
          phone: orderData.customer.phone,
        },
        deliveryAddress:
          orderData.deliveryAddress || "123 Main Street, City, State 12345",
        orderInfo: {
          shipping: orderData.orderInfo.shipping,
          paymentMethod: orderData.orderInfo.paymentMethod,
        },
        documents: {
          name: orderData.documents.name,
        },
        items: orderData.items.map((item) => ({
          id: item.id,
          date: item.date,
          customerName: item.customerName,
          size: item.size,
          quantity: item.quantity,
          sku: item.sku,
          barcode: item.barcode,
          price: `₹${item.price}`,
          salePrice: `₹${item.salePrice}`,
        })),
        summary: {
          subTotal: `₹${orderData.summary.subTotal}`,
          shippingRate: `₹${orderData.summary.shippingRate}`,
          promo: `₹${orderData.summary.promo}`,
          points: `₹${orderData.summary.points}`,
          total: `₹${orderData.summary.total}`,
        },
      };

      // Create a temporary container for the invoice
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "-9999px";
      tempDiv.style.width = "210mm"; // A4 width
      tempDiv.style.height = "297mm"; // A4 height
      tempDiv.style.backgroundColor = "white";

      // Render the invoice component (simplified version for PDF)
      tempDiv.innerHTML = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #374151;">
          <h1 style="font-size: 24px; margin-bottom: 32px; color: #374151;">Invoice</h1>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px;">
            <div>
              <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Invoice From:</h3>
              <p style="font-weight: bold; margin: 0;">Virginia Walker</p>
              <p style="font-size: 14px; color: #6B7280; margin: 0;">9694 Krajcik Locks Suite 635</p>
            </div>
            <div style="text-align: right;">
              <p style="font-weight: 600; margin: 4px 0;">Invoice Date: ${new Date().toLocaleDateString(
                "en-GB"
              )}</p>
              <p style="font-weight: 600; margin: 4px 0;">Expected Date: ${new Date(
                Date.now() + 14 * 24 * 60 * 60 * 1000
              ).toLocaleDateString("en-GB")}</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #E5E7EB;">
            <div>
              <h4 style="font-size: 18px; font-weight: bold; margin-bottom: 12px;">Billed To</h4>
              <p style="margin: 4px 0;">Full Name: ${
                invoiceData.customer.name
              }</p>
              <p style="margin: 4px 0;">Email: ${invoiceData.customer.email}</p>
              <p style="margin: 4px 0;">Phone: ${invoiceData.customer.phone}</p>
            </div>
            <div>
              <h4 style="font-size: 18px; font-weight: bold; margin-bottom: 12px;">Deliver To</h4>
              <p style="margin: 4px 0;">Address: ${
                invoiceData.deliveryAddress
              }</p>
            </div>
            <div>
              <h4 style="font-size: 18px; font-weight: bold; margin-bottom: 12px;">Order Info</h4>
              <p style="margin: 4px 0;">Shipping: ${
                invoiceData.orderInfo.shipping
              }</p>
              <p style="margin: 4px 0;">Payment: ${
                invoiceData.orderInfo.paymentMethod
              }</p>
              <p style="margin: 4px 0;">Status: ${orderStatus}</p>
            </div>
            <div>
              <h4 style="font-size: 18px; font-weight: bold; margin-bottom: 12px;">Documents</h4>
              <p style="margin: 4px 0;">${invoiceData.documents.name}</p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
            <thead>
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <th style="padding: 16px 8px; text-align: left; font-size: 14px; font-weight: bold;">Order ID</th>
                <th style="padding: 16px 8px; text-align: left; font-size: 14px; font-weight: bold;">Date</th>
                <th style="padding: 16px 8px; text-align: left; font-size: 14px; font-weight: bold;">Customer</th>
                <th style="padding: 16px 8px; text-align: left; font-size: 14px; font-weight: bold;">Size</th>
                <th style="padding: 16px 8px; text-align: left; font-size: 14px; font-weight: bold;">Quantity</th>
                <th style="padding: 16px 8px; text-align: left; font-size: 14px; font-weight: bold;">SKU</th>
                <th style="padding: 16px 8px; text-align: left; font-size: 14px; font-weight: bold;">Barcode</th>
                <th style="padding: 16px 8px; text-align: left; font-size: 14px; font-weight: bold;">Price</th>
                <th style="padding: 16px 8px; text-align: left; font-size: 14px; font-weight: bold;">Sale Price</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData.items
                .map(
                  (item) => `
                <tr style="border-bottom: 1px solid #F3F4F6;">
                  <td style="padding: 16px 8px; color: #2563EB; text-decoration: underline;">${item.id}</td>
                  <td style="padding: 16px 8px;">${item.date}</td>
                  <td style="padding: 16px 8px;">${item.customerName}</td>
                  <td style="padding: 16px 8px;">${item.size}</td>
                  <td style="padding: 16px 8px;">${item.quantity}</td>
                  <td style="padding: 16px 8px;">${item.sku}</td>
                  <td style="padding: 16px 8px;">${item.barcode}</td>
                  <td style="padding: 16px 8px;">${item.price}</td>
                  <td style="padding: 16px 8px;">${item.salePrice}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div style="text-align: right; margin-bottom: 32px;">
            <div style="display: inline-block; text-align: left;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px; min-width: 300px;">
                <span style="font-weight: bold;">Sub Total</span>
                <span>${invoiceData.summary.subTotal}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="font-weight: bold;">Shipping Rate</span>
                <span>${invoiceData.summary.shippingRate}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="font-weight: bold;">Promo</span>
                <span>${invoiceData.summary.promo}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="font-weight: bold;">Points</span>
                <span>${invoiceData.summary.points}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid #E5E7EB;">
                <span style="font-weight: bold;">Total</span>
                <span style="font-weight: bold;">${
                  invoiceData.summary.total
                }</span>
              </div>
            </div>
          </div>

          <div style="text-align: center; font-size: 12px; color: #6B7280; margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
            <p>© 2025 YORAA. All rights reserved.</p>
            <p style="margin-top: 4px;">Thank you for your business!</p>
          </div>
        </div>
      `;

      document.body.appendChild(tempDiv);

      // Use browser's print functionality to save as PDF
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = tempDiv.innerHTML;

      // Add print styles
      const printStyles = document.createElement("style");
      printStyles.textContent = `
        @media print {
          @page { size: A4; margin: 0.5in; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important; }
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
        }
      `;
      document.head.appendChild(printStyles);

      window.print();

      // Restore original content
      document.body.innerHTML = originalContents;
      document.head.removeChild(printStyles);
    } catch (error) {
      console.error("Error generating invoice:", error);
      // Fallback to JSON download
      const orderInfo = {
        orderId: orderData.id,
        customer: orderData.customer,
        orderInfo: orderData.orderInfo,
        deliveryAddress: orderData.deliveryAddress,
        paymentInfo: orderData.paymentInfo,
        items: orderData.items,
        summary: orderData.summary,
        status: orderStatus,
        dateRange: orderData.dateRange,
      };

      const jsonData = JSON.stringify(orderInfo, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `order-${orderData.id}-details.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [orderId, orderData, orderStatus]);

  const handleShare = useCallback(() => {
    // Generate invoice-formatted share text
    const invoiceText = `
🧾 INVOICE - Order #${orderData.id}

📅 Invoice Date: ${new Date().toLocaleDateString("en-GB")}
📅 Expected Date: ${new Date(
      Date.now() + 14 * 24 * 60 * 60 * 1000
    ).toLocaleDateString("en-GB")}

👤 CUSTOMER DETAILS:
• Full Name: ${orderData.customer.name}
• Email: ${orderData.customer.email}
• Phone: ${orderData.customer.phone}

📦 ORDER INFORMATION:
• Shipping: ${orderData.orderInfo.shipping}
• Payment Method: ${orderData.orderInfo.paymentMethod}
• Status: ${orderStatus}
• Order Date Range: ${orderData.dateRange}

🏠 DELIVERY ADDRESS:
${orderData.deliveryAddress}

📄 DOCUMENTS SUBMITTED:
${orderData.documents.name}

🛍️ ORDER ITEMS:
${orderData.items
  .map(
    (item) => `
• Order ID: ${item.id}
  Date: ${item.date}
  Customer: ${item.customerName}
  Size: ${item.size}
  Quantity: ${item.quantity}
  SKU: ${item.sku}
  Barcode: ${item.barcode}
  Price: ₹${item.price}
  Sale Price: ₹${item.salePrice}
`
  )
  .join("")}

💰 ORDER SUMMARY:
• Sub Total: ₹${orderData.summary.subTotal}
• Shipping Rate: ₹${orderData.summary.shippingRate}
• Promo: ₹${orderData.summary.promo}
• Points: ₹${orderData.summary.points}
• TOTAL: ₹${orderData.summary.total}

© 2025 YORAA. All rights reserved.
Thank you for your business!
    `.trim();

    // Share order invoice details
    if (navigator.share) {
      navigator
        .share({
          title: `Invoice - Order #${orderData.id}`,
          text: invoiceText,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard
        .writeText(invoiceText)
        .then(() => alert("Invoice details copied to clipboard!"))
        .catch(() => alert("Unable to copy invoice details."));
    }
  }, [orderData, orderStatus]);

  const handleSave = useCallback(() => {
    // Save order changes (status, notes, etc.)
    console.log("Saving order changes:", {
      orderId: orderData.id,
      status: orderStatus,
      notes: notes,
    });
    alert("Order saved successfully!");
  }, [orderData.id, orderStatus, notes]);

  const handleViewDocuments = useCallback(() => {
    setShowDocumentViewer(true);
  }, []);

  // If showing document viewer, render the DocumentViewer component
  if (showDocumentViewer) {
    return (
      <DocumentViewer
        orderId={orderId}
        onBack={() => setShowDocumentViewer(false)}
      />
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-full mx-0 ml-4">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Orders</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900 tracking-tight capitalize">
            Order Details
          </h1>

          <h2 className="text-xl font-semibold text-gray-700 capitalize">
            Order
          </h2>
        </div>

        {/* Order Details Container */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
          {/* Order Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <span className="text-sm font-medium text-gray-800 tracking-tight">
                  Order ID: #{orderData.id}
                </span>
                <div
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold ${getStatusColor(
                    orderStatus
                  )} uppercase tracking-wide`}
                >
                  {orderStatus}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-semibold text-gray-800">
                  {orderData.dateRange}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                {/* Status Change Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="bg-gray-100 px-4 py-2 rounded-md flex items-center justify-between w-56 hover:bg-gray-200 transition"
                  >
                    <span className="text-sm font-semibold text-gray-800">
                      Change Status
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>

                  {showStatusDropdown && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 w-56">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Print Button */}
                <button
                  onClick={handlePrint}
                  className="bg-gray-100 p-2 rounded-md hover:bg-gray-200 transition"
                >
                  <Printer className="h-5 w-5 text-gray-600" />
                </button>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  className="bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 transition"
                >
                  <span className="text-sm font-semibold text-gray-800">
                    Save
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Information Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Customer Info */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start space-x-4 mb-4">
                <div className="bg-gray-900 p-3 rounded-md">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">
                    Customer
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 leading-normal">
                    <p>Full Name: {orderData.customer.name}</p>
                    <p>Email: {orderData.customer.email}</p>
                    <p>Phone: {orderData.customer.phone}</p>
                  </div>
                </div>
              </div>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition">
                View profile
              </button>
            </div>

            {/* Order Info */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start space-x-4 mb-4">
                <div className="bg-gray-900 p-3 rounded-md">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">
                    Order Info
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 font-medium">
                    <p>Shipping: {orderData.orderInfo.shipping}</p>
                    <p>Payment Method: {orderData.orderInfo.paymentMethod}</p>
                    <p>Status: {orderData.orderInfo.status}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition"
              >
                Download info
              </button>
            </div>

            {/* Delivery Info */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start space-x-4 mb-4">
                <div className="bg-gray-900 p-3 rounded-md">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">
                    Deliver To
                  </h3>
                  <div className="text-sm text-gray-600 font-medium leading-normal">
                    <p>Address: {orderData.deliveryAddress}</p>
                  </div>
                </div>
              </div>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition">
                View profile
              </button>
            </div>

            {/* Documents Info */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start space-x-4 mb-4">
                <div className="bg-gray-900 p-3 rounded-md">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">
                    Documents Submitted
                  </h3>
                  <div className="text-sm text-gray-600 font-medium leading-normal">
                    <p>Document Name:</p>
                    <p>{orderData.documents.name}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleViewDocuments}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition"
              >
                View documents
              </button>
            </div>
          </div>

          {/* Payment Info and Notes Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Payment Info */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">
                Payment Info
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-5 bg-red-600 rounded flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">M</span>
                  </div>
                  <span className="font-medium">
                    {orderData.paymentInfo.cardNumber}
                  </span>
                </div>
                <p className="font-medium">
                  Business Name:{" "}
                  <span className="text-gray-800">
                    {orderData.paymentInfo.businessName}
                  </span>
                </p>
                <p className="font-medium">
                  Phone:{" "}
                  <span className="text-gray-800">
                    {orderData.paymentInfo.phone}
                  </span>
                </p>
              </div>
            </div>

            {/* Note */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">
                Note
              </h3>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  className="w-full h-24 text-sm text-gray-800 placeholder-gray-400 bg-transparent border-none outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="bg-white rounded-2xl shadow-md mt-6">
          {/* Table Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Order
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="bg-gray-100 p-2 rounded-md hover:bg-gray-200 transition"
                >
                  <Printer className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={handleShare}
                  className="bg-gray-100 p-2 rounded-md hover:bg-gray-200 transition"
                >
                  <Share2 className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-gray-100 p-2 rounded-md hover:bg-gray-200 transition"
                >
                  <Download className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Table Column Headers */}
            <div className="grid grid-cols-10 gap-4 text-sm font-bold text-gray-500 uppercase tracking-wide">
              <div>Image</div>
              <div>Order ID</div>
              <div>Date</div>
              <div>Customer Name</div>
              <div>Size</div>
              <div>Qty</div>
              <div>SKU</div>
              <div>Barcode</div>
              <div>Price</div>
              <div>Sale Price</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="p-6 space-y-4">
            {orderData.items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-10 gap-4 items-center py-4 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <img
                    src={item.image}
                    alt="Product"
                    className="w-20 h-28 object-cover rounded-md bg-gray-100"
                  />
                </div>
                <div>
                  <span className="text-sm font-semibold text-blue-600 underline cursor-pointer">
                    {item.id}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {item.date}
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {item.customerName}
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {item.size}
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {item.quantity}
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {item.sku}
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {item.barcode}
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {item.price}
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {item.salePrice}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="flex justify-end p-6">
            <div className="space-y-4 border boder-slate-200 bg-slate-100 p-6 rounded-xl">
              <div className="flex justify-between text-base font-bold text-gray-700 min-w-[240px] border-b border-gray-200 pb-2">
                <span>Sub Total</span>
                <span className="text-gray-900">
                  {orderData.summary.subTotal}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-600">
                <span>Shipping Rate</span>
                <span className="text-gray-900">
                  {orderData.summary.shippingRate}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-600">
                <span>Promo</span>
                <span className="text-gray-900">{orderData.summary.promo}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-600">
                <span>Points</span>
                <span className="text-gray-900">
                  {orderData.summary.points}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-600 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-gray-900">{orderData.summary.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * ReturnWindowScreen Component
 *
 * A dedicated screen for managing return requests with options to:
 * - View return reason and product images
 * - Accept or reject the return
 * - Allot vendor and courier if accepted
 * - Provide explanation for rejection
 */
const ReturnWindowScreen = React.memo(({ returnId, onBack }) => {
  const [returnStatus, setReturnStatus] = useState("pending");
  const [selectedReason, setSelectedReason] = useState("");
  const [vendorAllotted, setVendorAllotted] = useState(false);
  const [courierAllotted, setCourierAllotted] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [showVendorOptions, setShowVendorOptions] = useState(false);
  const [showCourierOptions, setShowCourierOptions] = useState(false);
  const [showVendorSelection, setShowVendorSelection] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState("");

  // Sample return reasons
  const returnReasons = [
    "Size/fit issue (For Exchanging the product)",
    "Product not as expected",
    "Wrong item received",
    "Damaged/defective product",
    "Late delivery",
    "Quality not as expected",
  ];

  // Handle status change
  const handleStatusChange = useCallback((status) => {
    setReturnStatus(status);
    if (status === "accepted") {
      setShowVendorOptions(true);
    } else {
      setShowVendorOptions(false);
      setShowCourierOptions(false);
      setVendorAllotted(false);
      setCourierAllotted(false);
    }
  }, []);

  // Handle vendor allotment
  const handleVendorAllotment = useCallback((allot) => {
    setVendorAllotted(allot);
    if (allot) {
      setShowCourierOptions(true);
      setShowVendorSelection(true);
    } else {
      setShowCourierOptions(false);
      setCourierAllotted(false);
      setShowVendorSelection(false);
      setSelectedVendor("");
    }
  }, []);

  // Handle vendor selection
  const handleVendorSelection = useCallback((vendor) => {
    setSelectedVendor(vendor);
  }, []);

  // Handle vendor confirmation
  const handleVendorConfirm = useCallback(() => {
    if (selectedVendor) {
      setShowVendorSelection(false);
      console.log(`Vendor ${selectedVendor} confirmed for return ${returnId}`);
      alert(
        `Vendor "${selectedVendor}" has been successfully assigned to return ${returnId}`
      );
    }
  }, [selectedVendor, returnId]);

  // Handle courier allotment
  const handleCourierAllotment = useCallback((allot) => {
    setCourierAllotted(allot);
  }, []);

  // Handle send response
  const handleSendResponse = useCallback(() => {
    const response = {
      returnId,
      status: returnStatus,
      vendorAllotted,
      courierAllotted,
      explanation,
      timestamp: new Date().toISOString(),
    };

    console.log("Return response:", response);
    alert(
      `Return ${returnStatus} successfully!\nVendor: ${
        vendorAllotted ? "Allotted" : "Not allotted"
      }\nCourier: ${courierAllotted ? "Allotted" : "Not allotted"}`
    );

    // In a real app, this would make an API call
    onBack();
  }, [
    returnId,
    returnStatus,
    vendorAllotted,
    courierAllotted,
    explanation,
    onBack,
  ]);

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Back to Returns</span>
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Return Window Screen
          </h1>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Image Preview Section */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Image Preview
              </h3>
              <div className="space-y-4">
                <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-blue-200 rounded flex items-center justify-center">
                    <div
                      className="w-32 h-32 bg-blue-400 rounded"
                      aria-label="Product image"
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div
                      key={index}
                      className="w-full h-20 bg-gray-100 rounded overflow-hidden"
                    >
                      <div className="w-full h-full bg-blue-200 rounded flex items-center justify-center">
                        <div
                          className="w-8 h-8 bg-blue-400 rounded"
                          aria-label={`Thumbnail ${index + 1}`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reason of Return Section */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Reason of return
              </h3>
              <div className="space-y-1">
                {returnReasons.map((reason, index) => (
                  <div
                    key={index}
                    className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                      selectedReason === reason
                        ? "bg-blue-50 border-blue-200"
                        : ""
                    }`}
                    onClick={() => setSelectedReason(reason)}
                  >
                    <p className="text-sm text-gray-700">{reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Section */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Status</h3>
              <div className="space-y-4">
                <button
                  onClick={() => handleStatusChange("accepted")}
                  className={`w-full px-4 py-2 rounded-lg font-medium ${
                    returnStatus === "accepted"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Accepted
                </button>
                <button
                  onClick={() => handleStatusChange("rejected")}
                  className={`w-full px-4 py-2 rounded-lg font-medium ${
                    returnStatus === "rejected"
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Rejected
                </button>
              </div>

              {/* Vendor and Courier Allotment (only show if accepted) */}
              {showVendorOptions && (
                <div className="mt-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Allot Vendor
                    </h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleVendorAllotment(false)}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          vendorAllotted === false
                            ? "bg-gray-200 text-gray-700"
                            : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        No
                      </button>
                      <button
                        onClick={() => handleVendorAllotment(true)}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          vendorAllotted === true
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        Yes
                      </button>
                    </div>

                    {vendorAllotted &&
                      selectedVendor &&
                      !showVendorSelection && (
                        <div className="mt-4">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Assigned Vendor:
                          </div>
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 font-medium rounded-full text-sm">
                            {selectedVendor}
                          </span>
                        </div>
                      )}

                    {showVendorSelection && (
                      <div className="mt-4">
                        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 max-w-[220px]">
                          <div className="text-sm font-medium text-gray-400 mb-3">
                            vendor name
                          </div>
                          <div className="space-y-0">
                            {["ven 1", "ven 2", "ven 3"].map(
                              (vendor, index) => (
                                <div key={vendor}>
                                  <label className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded cursor-pointer">
                                    <span className="text-sm font-medium text-gray-900">
                                      {vendor}
                                    </span>
                                    <div className="relative">
                                      <input
                                        type="radio"
                                        name="vendor-selection"
                                        value={vendor}
                                        checked={selectedVendor === vendor}
                                        onChange={() =>
                                          handleVendorSelection(vendor)
                                        }
                                        className="sr-only"
                                      />
                                      <div
                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                          selectedVendor === vendor
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-300 bg-white"
                                        }`}
                                      >
                                        {selectedVendor === vendor && (
                                          <Check className="w-3 h-3 text-blue-500" />
                                        )}
                                      </div>
                                    </div>
                                  </label>
                                  {index < 2 && (
                                    <hr className="border-gray-200" />
                                  )}
                                </div>
                              )
                            )}
                          </div>
                          <button
                            onClick={handleVendorConfirm}
                            disabled={!selectedVendor}
                            className={`w-full mt-4 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 ${
                              selectedVendor
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            <span>confirm</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {showCourierOptions && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Courier Allotted
                      </h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCourierAllotment(false)}
                          className={`px-4 py-2 rounded-full text-sm font-medium ${
                            courierAllotted === false
                              ? "bg-gray-200 text-gray-700"
                              : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          No
                        </button>
                        <button
                          onClick={() => handleCourierAllotment(true)}
                          className={`px-4 py-2 rounded-full text-sm font-medium ${
                            courierAllotted === true
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          Yes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Give Reason/Explanation Section */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Give Explanation
              </h3>
              <div className="space-y-4">
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder={
                    returnStatus === "rejected"
                      ? "Provide reason for rejection..."
                      : "Add any additional notes..."
                  }
                  className="w-full h-32 p-3 border-2 border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={6}
                />
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleSendResponse}
                    className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Send Response
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * ExchangeWindowScreen Component
 *
 * A dedicated screen for managing exchange requests with options to:
 * - View exchange reason and product images
 * - Accept or reject the exchange
 * - Allot vendor and courier if accepted
 * - Provide explanation for rejection
 */
const ExchangeWindowScreen = React.memo(({ exchangeId, onBack }) => {
  const [exchangeStatus, setExchangeStatus] = useState("pending");
  const [selectedReason, setSelectedReason] = useState("");
  const [vendorAllotted, setVendorAllotted] = useState(false);
  const [courierAllotted, setCourierAllotted] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [showVendorOptions, setShowVendorOptions] = useState(false);
  const [showCourierOptions, setShowCourierOptions] = useState(false);
  const [showVendorSelection, setShowVendorSelection] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState("");

  // Sample exchange reasons
  const exchangeReasons = [
    "Size/fit issue (For Exchanging the product)",
    "Product not as expected",
    "Wrong item received",
    "Damaged/defective product",
    "Color mismatch",
    "Quality not as expected",
  ];

  // Handle status change
  const handleStatusChange = useCallback((status) => {
    setExchangeStatus(status);
    if (status === "accepted") {
      setShowVendorOptions(true);
    } else {
      setShowVendorOptions(false);
      setShowCourierOptions(false);
      setVendorAllotted(false);
      setCourierAllotted(false);
    }
  }, []);

  // Handle vendor allotment
  const handleVendorAllotment = useCallback((allot) => {
    setVendorAllotted(allot);
    if (allot) {
      setShowCourierOptions(true);
      setShowVendorSelection(true);
    } else {
      setShowCourierOptions(false);
      setCourierAllotted(false);
      setShowVendorSelection(false);
      setSelectedVendor("");
    }
  }, []);

  // Handle vendor selection
  const handleVendorSelection = useCallback((vendor) => {
    setSelectedVendor(vendor);
  }, []);

  // Handle vendor confirmation
  const handleVendorConfirm = useCallback(() => {
    if (selectedVendor) {
      setShowVendorSelection(false);
      console.log(
        `Vendor ${selectedVendor} confirmed for exchange ${exchangeId}`
      );
      alert(
        `Vendor "${selectedVendor}" has been successfully assigned to exchange ${exchangeId}`
      );
    }
  }, [selectedVendor, exchangeId]);

  // Handle courier allotment
  const handleCourierAllotment = useCallback((allot) => {
    setCourierAllotted(allot);
  }, []);

  // Handle send response
  const handleSendResponse = useCallback(() => {
    const response = {
      exchangeId,
      status: exchangeStatus,
      vendorAllotted,
      courierAllotted,
      explanation,
      timestamp: new Date().toISOString(),
    };

    console.log("Exchange response:", response);
    alert(
      `Exchange ${exchangeStatus} successfully!\nVendor: ${
        vendorAllotted ? "Allotted" : "Not allotted"
      }\nCourier: ${courierAllotted ? "Allotted" : "Not allotted"}`
    );

    // In a real app, this would make an API call
    onBack();
  }, [
    exchangeId,
    exchangeStatus,
    vendorAllotted,
    courierAllotted,
    explanation,
    onBack,
  ]);

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Back to Exchanges</span>
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Exchange Window Screen
          </h1>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Image Preview Section */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Image Preview
              </h3>
              <div className="space-y-4">
                <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-blue-200 rounded flex items-center justify-center">
                    <div
                      className="w-32 h-32 bg-blue-400 rounded"
                      aria-label="Product image"
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div
                      key={index}
                      className="w-full h-20 bg-gray-100 rounded overflow-hidden"
                    >
                      <div className="w-full h-full bg-blue-200 rounded flex items-center justify-center">
                        <div
                          className="w-8 h-8 bg-blue-400 rounded"
                          aria-label={`Thumbnail ${index + 1}`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reason of Exchange Section */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Reason of exchange
              </h3>
              <div className="space-y-1">
                {exchangeReasons.map((reason, index) => (
                  <div
                    key={index}
                    className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                      selectedReason === reason
                        ? "bg-blue-50 border-blue-200"
                        : ""
                    }`}
                    onClick={() => setSelectedReason(reason)}
                  >
                    <p className="text-sm text-gray-700">{reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Section */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Status</h3>
              <div className="space-y-4">
                <button
                  onClick={() => handleStatusChange("accepted")}
                  className={`w-full px-4 py-2 rounded-lg font-medium ${
                    exchangeStatus === "accepted"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Accepted
                </button>
                <button
                  onClick={() => handleStatusChange("rejected")}
                  className={`w-full px-4 py-2 rounded-lg font-medium ${
                    exchangeStatus === "rejected"
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Rejected
                </button>
              </div>

              {/* Vendor and Courier Allotment (only show if accepted) */}
              {showVendorOptions && (
                <div className="mt-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Allot Vendor
                    </h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleVendorAllotment(true)}
                        className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                          vendorAllotted
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleVendorAllotment(false)}
                        className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                          !vendorAllotted
                            ? "bg-red-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Vendor Selection */}
                  {showVendorSelection && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">
                        Select Vendor
                      </h4>
                      <div className="space-y-2">
                        {["ven 1", "ven 2", "ven 3"].map((vendor) => (
                          <label key={vendor} className="flex items-center">
                            <input
                              type="radio"
                              name="vendor"
                              value={vendor}
                              checked={selectedVendor === vendor}
                              onChange={() => handleVendorSelection(vendor)}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">
                              {vendor}
                            </span>
                          </label>
                        ))}
                      </div>
                      <button
                        onClick={handleVendorConfirm}
                        disabled={!selectedVendor}
                        className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Confirm Vendor
                      </button>
                    </div>
                  )}

                  {/* Courier Options */}
                  {showCourierOptions && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Allot Courier
                      </h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCourierAllotment(true)}
                          className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                            courierAllotted
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handleCourierAllotment(false)}
                          className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                            !courierAllotted
                              ? "bg-red-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Response Section */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Response</h3>
              <div className="space-y-4">
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder={
                    exchangeStatus === "rejected"
                      ? "Provide reason for rejection..."
                      : "Add any additional notes..."
                  }
                  className="w-full h-32 p-3 border-2 border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={6}
                />
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleSendResponse}
                    className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Send Response
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Orders Component
 *
 * A comprehensive orders management interface that displays order data in a table format
 * with enhanced filtering capabilities, status tracking, vendor allotment, courier management,
 * and real-time delivery status tracking.
 *
 * Features:
 * - Order listing with detailed information
 * - Multiple filter options (date, type, status)
 * - Status color coding for better visibility
 * - Clickable order IDs that navigate to order details
 * - Payment status display under order ID
 * - Vendor allotment system with Yes/No options
 * - Courier allotment integration (Shiprocket)
 * - Real-time delivery status tracking
 * - Action buttons (barcode scan, print, download/share)
 * - Responsive design with Tailwind CSS
 *
 * Performance Optimizations:
 * - useMemo for expensive computations
 * - useCallback for stable function references
 * - Optimized re-renders with proper dependency arrays
 * - Memoized child components to prevent unnecessary re-renders
 */
const Orders = React.memo(() => {
  const navigate = useNavigate();
  // State management for filters, UI controls, and enhanced order management
  const [selectedStartDate, setSelectedStartDate] = useState("06/05/1999");
  const [selectedEndDate, setSelectedEndDate] = useState("06/05/1999");
  const [filterBy, setFilterBy] = useState("Date");
  const [orderType, setOrderType] = useState("Order Type");
  const [orderStatus, setOrderStatus] = useState("Order Status");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showOrderTypeDropdown, setShowOrderTypeDropdown] = useState(false);
  const [showOrderStatusDropdown, setShowOrderStatusDropdown] = useState(false);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState({});
  const [selectedVendors, setSelectedVendors] = useState({});
  const [selectedVendorNames, setSelectedVendorNames] = useState({});
  const [allottedVendorNames, setAllottedVendorNames] = useState({});
  const [courierAllotments, setCourierAllotments] = useState({});
  const [deliveryStatuses, setDeliveryStatuses] = useState({});

  // New state for order details view
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // New state for return window screen
  const [showReturnWindow, setShowReturnWindow] = useState(false);
  const [selectedReturnId, setSelectedReturnId] = useState(null);

  // New state for exchange window screen
  const [showExchangeWindow, setShowExchangeWindow] = useState(false);
  const [selectedExchangeId, setSelectedExchangeId] = useState(null);

  // New state for tab management
  const [activeTab, setActiveTab] = useState("orders");

  // State for managing orders data - memoized to prevent recreation
  const [orders, setOrders] = useState(() => {
    const orderTimestamp = new Date().toISOString();
    return [
      {
        orderId: "1234567892220",
        paymentStatus: "Pending",
        image: "/api/placeholder/60/60",
        productName: "T shirt",
        name: "Tarnnish",
        date: "13 aug 2024",
        hsn: "406000",
        size: ["small", "medium", "large"],
        sizeQuantity: [5, 10, 115],
        quantity: 130,
        price: 4566,
        salePrice: 4566,
        sku: "bkhvhm0251",
        barcodeNo: "406000000000000",
        status: "pending",
        orderType: "prepaid",
        slotVendor: "slot vendor",
        courierAlloted: "NO",
        delivered: "NO",
        actions: "Pending",
        vendorAllotted: false,
        allottedVendorName: null,
        courierTrackingId: null,
        deliveryStatus: "Order Placed",
        lastUpdated: orderTimestamp,
      },
      {
        orderId: "1234567892221",
        paymentStatus: "Paid",
        image: "/api/placeholder/60/60",
        productName: "T shirt",
        name: "Tarnnish",
        date: "13 aug 2024",
        hsn: "406000",
        size: ["small", "medium", "large"],
        sizeQuantity: [5, 10, 115],
        quantity: 130,
        price: 4566,
        salePrice: 4566,
        sku: "bkhvhm0251",
        barcodeNo: "406000000000000",
        status: "processing",
        orderType: "cod",
        slotVendor: "slot vendor",
        courierAlloted: "YES",
        delivered: "NO",
        actions: "Processing",
        vendorAllotted: true,
        allottedVendorName: "ven 1",
        courierTrackingId: "SP123456789",
        deliveryStatus: "In Transit",
        lastUpdated: orderTimestamp,
      },
      {
        orderId: "1234567892222",
        paymentStatus: "Paid",
        image: "/api/placeholder/60/60",
        productName: "Lower",
        name: "Shristi",
        date: "14 aug 2024",
        hsn: "406001",
        size: ["small", "medium"],
        sizeQuantity: [8, 12],
        quantity: 20,
        price: 2500,
        salePrice: 2300,
        sku: "bkhvhm0252",
        barcodeNo: "406001000000000",
        status: "accepted",
        orderType: "prepaid",
        slotVendor: "vendor 2",
        courierAlloted: "YES",
        delivered: "YES",
        actions: "Delivered",
        vendorAllotted: true,
        allottedVendorName: "ven 2",
        courierTrackingId: "SP123456790",
        deliveryStatus: "Delivered",
        lastUpdated: orderTimestamp,
      },
      {
        orderId: "1234567892223",
        paymentStatus: "Pending",
        image: "/api/placeholder/60/60",
        productName: "Shorts",
        name: "Rajesh",
        date: "15 aug 2024",
        hsn: "406002",
        size: ["medium", "large"],
        sizeQuantity: [15, 25],
        quantity: 40,
        price: 1800,
        salePrice: 1650,
        sku: "bkhvhm0253",
        barcodeNo: "406002000000000",
        status: "rejected",
        orderType: "cod",
        slotVendor: "vendor 3",
        courierAlloted: "NO",
        delivered: "NO",
        actions: "Rejected",
        vendorAllotted: false,
        allottedVendorName: null,
        courierTrackingId: null,
        deliveryStatus: "Cancelled",
        lastUpdated: orderTimestamp,
      },
      {
        orderId: "1234567892224",
        paymentStatus: "Paid",
        image: "/api/placeholder/60/60",
        productName: "Jacket",
        name: "Priya",
        date: "16 aug 2024",
        hsn: "406003",
        size: ["small", "medium", "large"],
        sizeQuantity: [3, 7, 10],
        quantity: 20,
        price: 3500,
        salePrice: 3200,
        sku: "bkhvhm0254",
        barcodeNo: "406003000000000",
        status: "allotted to vendor",
        orderType: "prepaid",
        slotVendor: "vendor 1",
        courierAlloted: "YES",
        delivered: "NO",
        actions: "On way",
        vendorAllotted: true,
        allottedVendorName: "ven 3",
        courierTrackingId: "SP123456791",
        deliveryStatus: "Out for Delivery",
        lastUpdated: orderTimestamp,
      },
    ];
  });

  // Tab handler
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  /**
   * Sample return requests data
   * Memoized with static initialization to prevent recreation on each render
   */
  const returnRequests = useMemo(() => {
    const timestamp = new Date().toISOString();
    return [
      {
        orderId: "1234567892225",
        paymentStatus: "Paid",
        image: "/api/placeholder/60/60",
        productName: "T shirt",
        name: "Tarnnish",
        date: "13 aug 2024",
        hsn: "406000",
        size: ["small", "medium", "large"],
        sizeQuantity: [5, 10, 115],
        quantity: 130,
        price: 4566,
        salePrice: 4566,
        sku: "bkhvhm0251",
        barcodeNo: "406000000000000",
        status: "return requested",
        orderType: "prepaid",
        slotVendor: "slot vendor",
        courierAlloted: "NO",
        delivered: "YES",
        actions: "Return Pending",
        vendorAllotted: true,
        allottedVendorName: "ven 1",
        courierTrackingId: "SP123456792",
        deliveryStatus: "Return Requested",
        lastUpdated: timestamp,
        returnReason: "Size/fit issue (For Exchanging the product)",
        returnStatus: "pending",
      },
      {
        orderId: "1234567892226",
        paymentStatus: "Paid",
        image: "/api/placeholder/60/60",
        productName: "Lower",
        name: "Shristi",
        date: "14 aug 2024",
        hsn: "406001",
        size: ["small", "medium"],
        sizeQuantity: [8, 12],
        quantity: 20,
        price: 2500,
        salePrice: 2300,
        sku: "bkhvhm0252",
        barcodeNo: "406001000000000",
        status: "return approved",
        orderType: "prepaid",
        slotVendor: "vendor 2",
        courierAlloted: "YES",
        delivered: "YES",
        actions: "Return Approved",
        vendorAllotted: true,
        allottedVendorName: "ven 2",
        courierTrackingId: "SP123456793",
        deliveryStatus: "Return Approved",
        lastUpdated: timestamp,
        returnReason: "Product not as expected",
        returnStatus: "accepted",
      },
      {
        orderId: "1234567892227",
        paymentStatus: "Paid",
        image: "/api/placeholder/60/60",
        productName: "Shorts",
        name: "Rajesh",
        date: "15 aug 2024",
        hsn: "406002",
        size: ["medium", "large"],
        sizeQuantity: [15, 25],
        quantity: 40,
        price: 1800,
        salePrice: 1650,
        sku: "bkhvhm0253",
        barcodeNo: "406002000000000",
        status: "return rejected",
        orderType: "cod",
        slotVendor: "vendor 3",
        courierAlloted: "NO",
        delivered: "YES",
        actions: "Return Rejected",
        vendorAllotted: false,
        allottedVendorName: null,
        courierTrackingId: null,
        deliveryStatus: "Return Rejected",
        lastUpdated: timestamp,
        returnReason: "Damaged/defective product",
        returnStatus: "rejected",
      },
    ];
  }, []); // Empty dependency array since this is static data

  /**
   * Sample exchange requests data
   * Memoized with static initialization to prevent recreation on each render
   */
  const exchangeRequests = useMemo(() => {
    const timestamp = new Date().toISOString();
    return [
      {
        orderId: "1234567892230",
        paymentStatus: "Paid",
        image: "/api/placeholder/60/60",
        productName: "T shirt",
        name: "Taanish",
        date: "13 aug 2024",
        hsn: "45660000",
        size: ["small", "medium", "large"],
        sizeQuantity: [5, 10, 115],
        quantity: 130,
        price: 4566,
        salePrice: 4786,
        sku: "blk/m/inso12244513",
        barcodeNo: "45660000000000",
        status: "exchange requested",
        orderType: "prepaid",
        slotVendor: "slot vendor",
        courierAlloted: "NO",
        delivered: "YES",
        actions: "Exchange Requested",
        vendorAllotted: false,
        allottedVendorName: null,
        courierTrackingId: null,
        deliveryStatus: "Exchange Requested",
        lastUpdated: timestamp,
        exchangeReason: "Size/fit issue (For Exchanging the product)",
        exchangeStatus: "pending",
      },
      {
        orderId: "1234567892231",
        paymentStatus: "Paid",
        image: "/api/placeholder/60/60",
        productName: "Lower",
        name: "Taanish",
        date: "13 aug 2024",
        hsn: "45660000",
        size: ["medium", "large"],
        sizeQuantity: [10, 115],
        quantity: 125,
        price: 4566,
        salePrice: 4554,
        sku: "blk/m/inso11423",
        barcodeNo: "45600000000000",
        status: "exchange accepted",
        orderType: "prepaid",
        slotVendor: "slot vendor",
        courierAlloted: "YES",
        delivered: "NO",
        actions: "Exchange Accepted",
        vendorAllotted: true,
        allottedVendorName: "ven 1",
        courierTrackingId: "SP123456792",
        deliveryStatus: "Exchange In Progress",
        lastUpdated: timestamp,
        exchangeReason: "Size/fit issue (For Exchanging the product)",
        exchangeStatus: "accepted",
      },
      {
        orderId: "1234567892232",
        paymentStatus: "Paid",
        image: "/api/placeholder/60/60",
        productName: "Shorts",
        name: "Taanish",
        date: "13 aug 2024",
        hsn: "45660000",
        size: ["large"],
        sizeQuantity: [115],
        quantity: 115,
        price: 4566,
        salePrice: 4446,
        sku: "blk/m/inso1bbb23",
        barcodeNo: "45660000000000",
        status: "exchange rejected",
        orderType: "cod",
        slotVendor: "vendor 3",
        courierAlloted: "NO",
        delivered: "YES",
        actions: "Exchange Rejected",
        vendorAllotted: false,
        allottedVendorName: null,
        courierTrackingId: null,
        deliveryStatus: "Exchange Rejected",
        lastUpdated: timestamp,
        exchangeReason: "Product not as expected",
        exchangeStatus: "rejected",
      },
    ];
  }, []); // Empty dependency array since this is static data

  // Initialize allotted vendor names from existing order data - optimized for performance
  useEffect(() => {
    const initializeVendorData = () => {
      const initialAllottedVendors = {};
      const initialSelectedVendors = {};
      const allData = [...orders, ...returnRequests, ...exchangeRequests];

      for (const order of allData) {
        if (order.allottedVendorName) {
          initialAllottedVendors[order.orderId] = order.allottedVendorName;
          initialSelectedVendors[order.orderId] = true;
        } else if (order.vendorAllotted) {
          initialSelectedVendors[order.orderId] = true;
        }
      }

      setAllottedVendorNames(initialAllottedVendors);
      setSelectedVendors((prev) => ({ ...prev, ...initialSelectedVendors }));
    };

    initializeVendorData();
  }, []); // Remove dependencies to avoid recreation

  /**
   * Optimized filter handler using useCallback to prevent unnecessary re-renders
   * Resets all filters to their default state
   */
  const handleResetFilter = useCallback(() => {
    setFilterBy("Date");
    setOrderType("Order Type");
    setOrderStatus("Order Status");
    setShowDateDropdown(false);
    setShowOrderTypeDropdown(false);
    setShowOrderStatusDropdown(false);
  }, []);

  /**
   * Enhanced handlers for vendor allotment and courier management
   */
  const handleVendorAllotment = useCallback((orderId, allot) => {
    setSelectedVendors((prev) => ({
      ...prev,
      [orderId]: allot,
    }));

    if (allot) {
      setShowVendorDropdown((prev) => ({
        ...prev,
        [orderId]: true,
      }));
    } else {
      setShowVendorDropdown((prev) => ({
        ...prev,
        [orderId]: false,
      }));
      setSelectedVendorNames((prev) => ({
        ...prev,
        [orderId]: "",
      }));
      setAllottedVendorNames((prev) => ({
        ...prev,
        [orderId]: null,
      }));
    }

    console.log(
      `${allot ? "Allotting" : "Not allotting"} vendor for order ${orderId}`
    );
  }, []);

  const handleVendorSelection = useCallback(
    (orderId, vendorName) => {
      if (vendorName === "Confirmed") {
        // Close dropdown after confirmation and store the allotted vendor
        setShowVendorDropdown((prev) => ({
          ...prev,
          [orderId]: false,
        }));
        const selectedVendor = selectedVendorNames[orderId];
        if (selectedVendor) {
          setAllottedVendorNames((prev) => ({
            ...prev,
            [orderId]: selectedVendor,
          }));
          console.log(
            `Vendor ${selectedVendor} confirmed for order ${orderId}`
          );
          alert(
            `Vendor "${selectedVendor}" has been successfully assigned to order ${orderId}`
          );
        }
      } else {
        // Set selected vendor
        setSelectedVendorNames((prev) => ({
          ...prev,
          [orderId]: vendorName,
        }));
      }
    },
    [selectedVendorNames]
  );

  const handleCourierAllotment = useCallback((orderId, allot) => {
    setCourierAllotments((prev) => ({
      ...prev,
      [orderId]: allot,
    }));

    if (allot) {
      // Simulate Shiprocket integration
      const trackingId = `SP${Date.now()}`;
      setDeliveryStatuses((prev) => ({
        ...prev,
        [orderId]: "Shipped",
      }));
      console.log(
        `Courier allotted for order ${orderId}, tracking ID: ${trackingId}`
      );
    } else {
      setDeliveryStatuses((prev) => ({
        ...prev,
        [orderId]: "Pending Shipment",
      }));
    }
  }, []);

  const handleBarcodeScanning = useCallback((orderId) => {
    // In a real app, this would open camera/barcode scanner
    console.log(`Scanning barcode for order ${orderId}`);
    alert(
      `Barcode scanning for order ${orderId}\n(Camera functionality would be implemented here)`
    );
  }, []);

  const handleOrderIdClick = useCallback((orderId) => {
    // Show order details inline instead of navigating
    setSelectedOrderId(orderId);
    setShowOrderDetails(true);
  }, []);

  const handleReturnIdClick = useCallback((returnId) => {
    // Show return window screen
    setSelectedReturnId(returnId);
    setShowReturnWindow(true);
  }, []);

  const handleExchangeIdClick = useCallback((exchangeId) => {
    // Show exchange window screen
    setSelectedExchangeId(exchangeId);
    setShowExchangeWindow(true);
  }, []);

  /**
   * Order status handlers for accept/reject functionality
   */
  const handleAcceptOrder = useCallback((orderId) => {
    // Update order status to 'processing' when accepted
    console.log(`Accepting order ${orderId}`);

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.orderId === orderId ? { ...order, status: "processing" } : order
      )
    );

    alert(
      `Order ${orderId} has been accepted and status changed to Processing`
    );
  }, []);

  const handleRejectOrder = useCallback((orderId) => {
    // Update order status to 'rejected' when rejected
    console.log(`Rejecting order ${orderId}`);

    // Show confirmation dialog
    const confirmReject = window.confirm(
      `Are you sure you want to reject order ${orderId}?`
    );

    if (confirmReject) {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId ? { ...order, status: "rejected" } : order
        )
      );

      alert(`Order ${orderId} has been rejected`);
    }
  }, []);

  /**
   * Date range handlers
   */
  const handleDateRangeToggle = useCallback(() => {
    setShowDateRangePicker(!showDateRangePicker);
  }, [showDateRangePicker]);

  const handleStartDateChange = useCallback((e) => {
    setSelectedStartDate(e.target.value);
  }, []);

  const handleEndDateChange = useCallback((e) => {
    setSelectedEndDate(e.target.value);
  }, []);

  /**
   * Dropdown handlers
   */
  const handleDateDropdownToggle = useCallback(() => {
    setShowDateDropdown(!showDateDropdown);
    setShowOrderTypeDropdown(false);
    setShowOrderStatusDropdown(false);
  }, [showDateDropdown]);

  const handleOrderTypeDropdownToggle = useCallback(() => {
    setShowOrderTypeDropdown(!showOrderTypeDropdown);
    setShowDateDropdown(false);
    setShowOrderStatusDropdown(false);
  }, [showOrderTypeDropdown]);

  const handleOrderStatusDropdownToggle = useCallback(() => {
    setShowOrderStatusDropdown(!showOrderStatusDropdown);
    setShowDateDropdown(false);
    setShowOrderTypeDropdown(false);
  }, [showOrderStatusDropdown]);

  /**
   * Filter option handlers
   */
  const handleDateFilterSelect = useCallback((value) => {
    setFilterBy(value);
    setShowDateDropdown(false);
  }, []);

  const handleOrderTypeSelect = useCallback((value) => {
    setOrderType(value);
    setShowOrderTypeDropdown(false);
  }, []);

  const handleOrderStatusSelect = useCallback((value) => {
    setOrderStatus(value);
    setShowOrderStatusDropdown(false);
  }, []);

  /**
   * Close dropdowns when clicking outside - optimized event handler
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (!target.closest(".dropdown-container")) {
        setShowDateDropdown(false);
        setShowOrderTypeDropdown(false);
        setShowOrderStatusDropdown(false);
        setShowDateRangePicker(false);
      }
    };

    // Use passive listener for better performance
    document.addEventListener("mousedown", handleClickOutside, {
      passive: true,
    });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /**
   * Memoized utility function to get status-specific CSS classes
   * @param {string} status - The order status
   * @returns {string} CSS classes for styling
   */
  const getStatusColor = useMemo(
    () => (status) => {
      const statusMap = {
        accepted: "bg-green-100 text-green-700",
        processing: "bg-blue-100 text-blue-700",
        rejected: "bg-red-100 text-red-700",
        pending: "bg-yellow-100 text-yellow-700",
        "return requested": "bg-orange-100 text-orange-700",
        "return approved": "bg-green-100 text-green-700",
        "return rejected": "bg-red-100 text-red-700",
        "allotted to vendor": "bg-indigo-100 text-indigo-700",
      };
      return statusMap[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
    },
    []
  );

  /**
   * Memoized utility function to get payment status-specific CSS classes
   * @param {string} status - The payment status
   * @returns {string} CSS classes for styling
   */
  const getPaymentStatusColor = useMemo(
    () => (status) => {
      const statusMap = {
        paid: "bg-green-500 text-white",
        pending: "bg-red-500 text-white",
      };
      return statusMap[status?.toLowerCase()] || "bg-gray-500 text-white";
    },
    []
  );

  /**
   * Memoized utility function to get delivery status-specific CSS classes
   * @param {string} status - The delivery status
   * @returns {string} CSS classes for styling
   */
  const getDeliveryStatusColor = useMemo(
    () => (status) => {
      const statusMap = {
        "Order Placed": "bg-blue-100 text-blue-700",
        "Pending Shipment": "bg-yellow-100 text-yellow-700",
        Shipped: "bg-indigo-100 text-indigo-700",
        "In Transit": "bg-purple-100 text-purple-700",
        "Out for Delivery": "bg-orange-100 text-orange-700",
        Delivered: "bg-green-100 text-green-700",
        Cancelled: "bg-red-100 text-red-700",
        Returned: "bg-gray-100 text-gray-700",
        "Return Requested": "bg-orange-100 text-orange-700",
        "Return Approved": "bg-green-100 text-green-700",
        "Return Rejected": "bg-red-100 text-red-700",
      };
      return statusMap[status] || "bg-gray-100 text-gray-800";
    },
    []
  );

  /**
   * Optimized filter logic using useMemo with proper dependencies
   */
  const filteredOrders = useMemo(() => {
    // Early return for better performance
    if (!orders.length && !returnRequests.length && !exchangeRequests.length) {
      return [];
    }

    let currentData;
    switch (activeTab) {
      case "returns":
        currentData = returnRequests;
        break;
      case "exchanges":
        currentData = exchangeRequests;
        break;
      default:
        currentData = orders;
    }

    // Pre-compute filter conditions for better performance
    const hasOrderStatusFilter = orderStatus !== "Order Status";
    const hasOrderTypeFilter = orderType !== "Order Type";
    const lowerOrderStatus = hasOrderStatusFilter
      ? orderStatus.toLowerCase()
      : null;
    const lowerOrderType = hasOrderTypeFilter ? orderType.toLowerCase() : null;

    return currentData.filter((order) => {
      // Filter by order status
      if (hasOrderStatusFilter && order.status !== lowerOrderStatus) {
        return false;
      }

      // Filter by order type
      if (hasOrderTypeFilter && order.orderType !== lowerOrderType) {
        return false;
      }

      return true;
    });
  }, [
    orders,
    returnRequests,
    exchangeRequests,
    activeTab,
    orderStatus,
    orderType,
  ]);

  /**
   * Print handler for order list - optimized with better string concatenation
   */
  const handlePrintOrderList = useCallback(() => {
    // Create a formatted table for printing
    const currentData = filteredOrders;

    // Pre-compute title to avoid repeated checks
    const titles = {
      orders: "Orders List",
      returns: "Return Requests",
      exchanges: "Exchange Requests",
    };
    const title = titles[activeTab] || "Orders List";

    // Generate rows more efficiently using map instead of template literals
    const tableRows = currentData
      .map((order) => {
        const statusClass = order.status.toLowerCase().replace(/\s+/g, "-");
        return `
        <tr>
          <td>${order.orderId}</td>
          <td>${order.productName}</td>
          <td>${order.name}</td>
          <td>${order.date}</td>
          <td>${order.quantity}</td>
          <td>₹${order.price}</td>
          <td>₹${order.salePrice}</td>
          <td><span class="status status-${statusClass}">${order.status}</span></td>
          <td>${order.paymentStatus}</td>
          <td>${order.deliveryStatus}</td>
        </tr>
      `;
      })
      .join("");

    const printContent = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #333; margin-bottom: 10px; }
            .date-range { color: #666; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .status { padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
            .status-accepted { background-color: #dcfce7; color: #166534; }
            .status-processing { background-color: #dbeafe; color: #1e40af; }
            .status-rejected { background-color: #fee2e2; color: #dc2626; }
            .status-pending { background-color: #fef3c7; color: #d97706; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <div class="date-range">Date Range: ${selectedStartDate} - ${selectedEndDate}</div>
            <div class="date-range">Generated on: ${new Date().toLocaleDateString()}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>${activeTab === "returns" ? "Return ID" : "Order ID"}</th>
                <th>Product Name</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Sale Price</th>
                <th>Status</th>
                <th>Payment Status</th>
                <th>Delivery Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Open new window for printing
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else {
      // Fallback - show alert if popup blocked
      alert("Please allow popups to print the order list");
    }
  }, [activeTab, filteredOrders, selectedStartDate, selectedEndDate]);

  // If showing order details, render the OrderDetails component
  if (showOrderDetails && selectedOrderId) {
    return (
      <OrderDetails
        orderId={selectedOrderId}
        onBack={() => setShowOrderDetails(false)}
      />
    );
  }

  // If showing return window screen, render the ReturnWindowScreen component
  if (showReturnWindow && selectedReturnId) {
    return (
      <ReturnWindowScreen
        returnId={selectedReturnId}
        onBack={() => setShowReturnWindow(false)}
      />
    );
  }

  // If showing exchange window screen, render the ExchangeWindowScreen component
  if (showExchangeWindow && selectedExchangeId) {
    return (
      <ExchangeWindowScreen
        exchangeId={selectedExchangeId}
        onBack={() => setShowExchangeWindow(false)}
      />
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-full mx-0 ml-4">
        {/* Tab Navigation - Optimized with better styling and performance */}
        <div className="flex items-center space-x-8 mb-6">
          {[
            { key: "orders", label: "orders list" },
            { key: "returns", label: "return requests" },
            { key: "exchanges", label: "Exchange requests" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`text-xl font-semibold pb-2 transition-colors duration-200 ${
                activeTab === key
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Header Section - Title and date in one line */}
        <div className="w-full flex justify-end mb-6">
          <button
            onClick={handleDateRangeToggle}
            className="flex items-center gap-2 text-sm text-white bg-blue-600 px-4 py-2 rounded-lg shadow-inner border border-slate-200 hover:bg-blue-700 transition-colors duration-200"
          >
            {selectedStartDate}
            <span>-</span>
            {selectedEndDate}
            <Calendar className="h-4 w-4" />
          </button>

          {/* Date Range Picker Dropdown */}
          {showDateRangePicker && (
            <div className="dropdown-container absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 min-w-[300px]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={selectedStartDate}
                    onChange={handleStartDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={selectedEndDate}
                    onChange={handleEndDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setShowDateRangePicker(false)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowDateRangePicker(false)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter Controls Section */}
        <div className="flex items-center justify-between mb-6 p-4 rounded-lg border border-gray-200 shadow-md">
          <div className="flex items-center space-x-4">
            {/* Filter Icon and Label */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700 font-medium">
                Filter By
              </span>
            </div>

            {/* Date Filter */}
            <div className="relative dropdown-container">
              <button
                onClick={handleDateDropdownToggle}
                className="flex items-center justify-between bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px] hover:bg-gray-50"
                aria-label="Filter by date"
              >
                <span
                  className={
                    filterBy === "Date" ? "text-gray-400" : "text-gray-900"
                  }
                >
                  {filterBy}
                </span>
                <ChevronDown className="h-3 w-3 text-gray-400 ml-2" />
              </button>

              {/* Date Dropdown */}
              {showDateDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[180px]">
                  <button
                    onClick={() => handleDateFilterSelect("Today")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleDateFilterSelect("This week")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700"
                  >
                    This week
                  </button>
                  <button
                    onClick={() => handleDateFilterSelect("This month")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700"
                  >
                    This month
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      handleDateFilterSelect("select a Range");
                      setShowDateRangePicker(true);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700"
                  >
                    select a Range
                  </button>
                </div>
              )}
            </div>

            {/* Order Type Filter */}
            <div className="relative dropdown-container">
              <button
                onClick={handleOrderTypeDropdownToggle}
                className="flex items-center justify-between bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px] hover:bg-gray-50"
                aria-label="Filter by order type"
              >
                <span
                  className={
                    orderType === "Order Type"
                      ? "text-gray-400"
                      : "text-gray-900"
                  }
                >
                  {orderType}
                </span>
                <ChevronDown className="h-3 w-3 text-gray-400 ml-2" />
              </button>

              {/* Order Type Dropdown */}
              {showOrderTypeDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[140px]">
                  <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                    choose sort by
                  </div>
                  <button
                    onClick={() => handleOrderTypeSelect("Prepaid")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700"
                  >
                    Prepaid
                  </button>
                  <button
                    onClick={() => handleOrderTypeSelect("Cod")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700"
                  >
                    Cod
                  </button>
                  <button
                    onClick={() => handleOrderTypeSelect("Partial Paid")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700"
                  >
                    Partial Paid
                  </button>
                </div>
              )}
            </div>

            {/* Order Status Filter */}
            <div className="relative dropdown-container">
              <button
                onClick={handleOrderStatusDropdownToggle}
                className="flex items-center justify-between bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px] hover:bg-gray-50"
                aria-label="Filter by order status"
              >
                <span
                  className={
                    orderStatus === "Order Status"
                      ? "text-gray-400"
                      : "text-gray-900"
                  }
                >
                  {orderStatus}
                </span>
                <ChevronDown className="h-3 w-3 text-gray-400 ml-2" />
              </button>

              {/* Order Status Dropdown */}
              {showOrderStatusDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[160px]">
                  <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                    choose sort by
                  </div>
                  {activeTab === "orders" ? (
                    <>
                      <button
                        onClick={() => handleOrderStatusSelect("Pending")}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700"
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => handleOrderStatusSelect("Processing")}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700"
                      >
                        Processing
                      </button>
                      <button
                        onClick={() => handleOrderStatusSelect("Accepted")}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700"
                      >
                        Accepted
                      </button>
                      <button
                        onClick={() =>
                          handleOrderStatusSelect("Allotted to vendor")
                        }
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700"
                      >
                        Allotted to vendor
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          handleOrderStatusSelect("Return requested")
                        }
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700"
                      >
                        Return requested
                      </button>
                      <button
                        onClick={() =>
                          handleOrderStatusSelect("Return approved")
                        }
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700"
                      >
                        Return approved
                      </button>
                      <button
                        onClick={() =>
                          handleOrderStatusSelect("Return rejected")
                        }
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700"
                      >
                        Return rejected
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Print Button - Next to Order Status */}
            <button
              onClick={handlePrintOrderList}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg border border-gray-300 bg-white transition-colors"
              aria-label="Print order list"
              title="Print Order List"
            >
              <Printer className="h-4 w-4" />
            </button>
          </div>

          {/* Reset Filter Button */}
          <button
            onClick={handleResetFilter}
            className="flex items-center space-x-1 bg-red-600 border border-slate-200 shadow-sm p-2 rounded-md text-white hover:bg-red-700 text-sm font-medium"
            aria-label="Reset all filters"
          >
            <RotateCw className="h-4 w-4" />
            <span>Reset Filter</span>
          </button>
        </div>

        {/* Orders Table */}
        <section className="w-full">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              {/* Table Header */}
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                    {activeTab === "returns" ? "return id" : "order id"}
                  </th>
                  <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                    Image
                  </th>
                  <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                    Product Name
                  </th>
                  <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                    name
                  </th>
                  <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                    date
                  </th>
                  <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                    HSN
                  </th>
                  <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                    size
                  </th>
                  <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                    quantity
                  </th>
                  <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                    Price
                  </th>
                  <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                    Sale Price
                  </th>
                  <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                    SKU
                  </th>
                  <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                    barcode no.
                  </th>
                  <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                    status
                  </th>
                  {activeTab === "returns" ? (
                    <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      return to vendor
                    </th>
                  ) : (
                    <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      vendor allotment
                    </th>
                  )}
                  <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                    courier alloted
                  </th>
                  <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                    delivery status
                  </th>
                  <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    actions
                  </th>
                </tr>
              </thead>

              {/* Table Body - Optimized rendering with React.Fragment */}
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredOrders.map((order, index) => (
                  <OrderRow
                    key={order.orderId} // Use orderId as key instead of combination for better performance
                    order={order}
                    getStatusColor={getStatusColor}
                    getPaymentStatusColor={getPaymentStatusColor}
                    getDeliveryStatusColor={getDeliveryStatusColor}
                    onOrderIdClick={handleOrderIdClick}
                    onReturnIdClick={handleReturnIdClick}
                    onExchangeIdClick={handleExchangeIdClick}
                    onVendorAllotment={handleVendorAllotment}
                    onVendorSelection={handleVendorSelection}
                    onCourierAllotment={handleCourierAllotment}
                    onBarcodeScanning={handleBarcodeScanning}
                    onAcceptOrder={handleAcceptOrder}
                    onRejectOrder={handleRejectOrder}
                    showVendorDropdown={showVendorDropdown}
                    setShowVendorDropdown={setShowVendorDropdown}
                    selectedVendors={selectedVendors}
                    selectedVendorNames={selectedVendorNames}
                    allottedVendorNames={allottedVendorNames}
                    courierAllotments={courierAllotments}
                    deliveryStatuses={deliveryStatuses}
                    activeTab={activeTab}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
});

/**
 * OrderRow Component - Enhanced row component with comprehensive order management features
 * Optimized for performance with memoization and efficient re-rendering
 */
const OrderRow = React.memo(
  ({
    order,
    getStatusColor,
    getPaymentStatusColor,
    getDeliveryStatusColor,
    onOrderIdClick,
    onReturnIdClick,
    onExchangeIdClick,
    onVendorAllotment,
    onVendorSelection,
    onCourierAllotment,
    onBarcodeScanning,
    onAcceptOrder,
    onRejectOrder,
    showVendorDropdown,
    setShowVendorDropdown,
    selectedVendors,
    selectedVendorNames,
    allottedVendorNames,
    courierAllotments,
    deliveryStatuses,
    activeTab,
  }) => {
    // Memoized vendor options to prevent recreation
    const availableVendors = useMemo(() => ["ven 1", "ven 2", "ven 3"], []);

    // Memoized computed values for better performance
    const computedValues = useMemo(
      () => ({
        isVendorAllotted: selectedVendors[order.orderId],
        isCourierAllotted: courierAllotments[order.orderId],
        currentDeliveryStatus:
          deliveryStatuses[order.orderId] || order.deliveryStatus,
        vendorDropdownVisible: showVendorDropdown[order.orderId],
        selectedVendorName: selectedVendorNames[order.orderId],
        allottedVendorName: allottedVendorNames[order.orderId],
        paymentStatusClass: getPaymentStatusColor(order.paymentStatus),
        statusClass: getStatusColor(order.status),
        isPendingStatus: order.status.toLowerCase() === "pending",
      }),
      [
        order.orderId,
        order.paymentStatus,
        order.status,
        order.deliveryStatus,
        selectedVendors,
        courierAllotments,
        deliveryStatuses,
        showVendorDropdown,
        selectedVendorNames,
        allottedVendorNames,
        getPaymentStatusColor,
        getStatusColor,
      ]
    );

    /**
     * Action button handlers - memoized to prevent unnecessary re-renders
     */
    const handleView = useCallback(() => {
      switch (activeTab) {
        case "returns":
          onReturnIdClick(order.orderId);
          break;
        case "exchanges":
          onExchangeIdClick(order.orderId);
          break;
        default:
          onOrderIdClick(order.orderId);
      }
    }, [
      order.orderId,
      onOrderIdClick,
      onReturnIdClick,
      onExchangeIdClick,
      activeTab,
    ]);

    const handleEdit = useCallback(() => {
      console.log("Edit order:", order.orderId);
      // Implement edit logic here
    }, [order.orderId]);

    const handleDownload = useCallback(() => {
      console.log("Download order:", order.orderId);
      // Implement download logic here
    }, [order.orderId]);

    const handleShare = useCallback(() => {
      console.log("Share order:", order.orderId);
      const orderUrl = `${window.location.origin}/order-details/${order.orderId}`;

      if (navigator.share) {
        navigator
          .share({
            title: `Order #${order.orderId}`,
            text: `Order details for #${order.orderId}`,
            url: orderUrl,
          })
          .catch(console.error);
      } else {
        // Fallback - copy to clipboard
        navigator.clipboard
          .writeText(orderUrl)
          .then(() => alert("Order link copied to clipboard!"))
          .catch(console.error);
      }
    }, [order.orderId]);

    const handlePrint = useCallback(() => {
      console.log("Print order:", order.orderId);
      // Open order details in new window for printing
      const printWindow = window.open(
        `/order-details/${order.orderId}?print=true`,
        "_blank"
      );
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }, [order.orderId]);

    const handleBarcodeScan = useCallback(() => {
      onBarcodeScanning(order.orderId);
    }, [order.orderId, onBarcodeScanning]);

    const handleVendorAllot = useCallback(
      (allot) => {
        onVendorAllotment(order.orderId, allot);
      },
      [order.orderId, onVendorAllotment]
    );

    const handleVendorSelect = useCallback(
      (vendorName) => {
        onVendorSelection(order.orderId, vendorName);
      },
      [order.orderId, onVendorSelection]
    );

    const handleVendorConfirm = useCallback(() => {
      if (computedValues.selectedVendorName) {
        onVendorSelection(order.orderId, "Confirmed");
      }
    }, [order.orderId, onVendorSelection, computedValues.selectedVendorName]);

    const handleCourierAllot = useCallback(
      (allot) => {
        onCourierAllotment(order.orderId, allot);
      },
      [order.orderId, onCourierAllotment]
    );

    const handleAccept = useCallback(() => {
      onAcceptOrder(order.orderId);
    }, [order.orderId, onAcceptOrder]);

    const handleReject = useCallback(() => {
      onRejectOrder(order.orderId);
    }, [order.orderId, onRejectOrder]);

    // Memoized size and quantity display for better performance
    const sizeDisplay = useMemo(
      () => (
        <div className="space-y-1">
          {order.size.map((size) => (
            <div key={size} className="text-xs text-gray-600">
              {size}
            </div>
          ))}
        </div>
      ),
      [order.size]
    );

    const quantityDisplay = useMemo(
      () => (
        <div className="space-y-1">
          {order.sizeQuantity.map((qty, i) => (
            <div key={i} className="text-xs font-semibold text-gray-800">
              {qty}
            </div>
          ))}
        </div>
      ),
      [order.sizeQuantity]
    );

    // Memoized vendor selection dropdown
    const vendorDropdown = useMemo(() => {
      if (
        !computedValues.isVendorAllotted ||
        !computedValues.vendorDropdownVisible
      ) {
        return null;
      }

      return (
        <div className="relative mt-2 z-10">
          <div className="bg-white border rounded-xl shadow-lg p-4">
            <div className="text-gray-400 mb-2 font-semibold">Vendor Name</div>
            {availableVendors.map((vendor) => (
              <label
                key={vendor}
                className="flex justify-between items-center py-1"
              >
                <span className="text-sm text-gray-900">{vendor}</span>
                <input
                  type="radio"
                  className="sr-only"
                  checked={computedValues.selectedVendorName === vendor}
                  onChange={() => handleVendorSelect(vendor)}
                />
                <div
                  className={`w-5 h-5 flex items-center justify-center rounded border-2 ${
                    computedValues.selectedVendorName === vendor
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  {computedValues.selectedVendorName === vendor && (
                    <Check className="w-3 h-3 text-blue-500" />
                  )}
                </div>
              </label>
            ))}
            <button
              onClick={handleVendorConfirm}
              disabled={!computedValues.selectedVendorName}
              className={`w-full mt-3 py-2 rounded text-sm font-medium ${
                computedValues.selectedVendorName
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      );
    }, [
      computedValues.isVendorAllotted,
      computedValues.vendorDropdownVisible,
      computedValues.selectedVendorName,
      availableVendors,
      handleVendorSelect,
      handleVendorConfirm,
    ]);

    return (
      <tr className="border-b border-gray-200 hover:bg-gray-50 text-sm">
        {/* Order ID + Payment Status */}
        <td className="py-3 px-6 w-48 border-r border-gray-200">
          <div className="space-y-1">
            <button
              onClick={handleView}
              className="text-blue-600 hover:text-blue-800 font-semibold underline"
            >
              {order.orderId}
            </button>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              {activeTab === "returns" ? "RETURN STATUS" : "PAYMENT STATUS"}
            </div>
            <span
              className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${computedValues.paymentStatusClass}`}
            >
              {order.paymentStatus}
            </span>
          </div>
        </td>

        {/* Product Image */}
        <td className="py-3 px-4 w-16 border-r border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
            <div className="w-10 h-10 bg-blue-200 rounded flex items-center justify-center">
              <div
                className="w-6 h-6 bg-blue-400 rounded"
                aria-label="Product image"
              />
            </div>
          </div>
        </td>

        {/* Product Name */}
        <td className="py-3 px-4 w-40 font-medium text-gray-900 break-words border-r border-gray-200">
          {order.productName}
        </td>

        {/* Customer Name */}
        <td className="py-3 px-4 w-32 text-gray-700 border-r border-gray-200">
          {order.name}
        </td>

        {/* Order Date */}
        <td className="py-3 px-4 w-28 text-gray-700 border-r border-gray-200">
          {order.date}
        </td>

        {/* HSN */}
        <td className="py-3 px-4 w-24 text-gray-700 border-r border-gray-200">
          {order.hsn}
        </td>

        {/* Sizes */}
        <td className="py-3 px-4 w-32 border-r border-gray-200">
          {sizeDisplay}
        </td>

        {/* Quantities */}
        <td className="py-3 px-4 w-32 border-r border-gray-200">
          {quantityDisplay}
        </td>

        {/* Price */}
        <td className="py-3 px-4 w-24 font-semibold text-gray-700 border-r border-gray-200">
          ₹{order.price}
        </td>

        {/* Sale Price */}
        <td className="py-3 px-4 w-24 font-semibold text-gray-700 border-r border-gray-200">
          ₹{order.salePrice}
        </td>

        {/* SKU */}
        <td className="py-3 px-4 w-28 text-gray-700 border-r border-gray-200">
          {order.sku}
        </td>

        {/* Barcode */}
        <td className="py-3 px-3 w-40 text-xs font-mono text-gray-700 break-words border-r border-gray-200">
          {order.barcodeNo}
        </td>

        {/* Status */}
        <td className="py-3 px-4 w-32 border-r border-gray-200">
          {computedValues.isPendingStatus ? (
            <div className="space-y-2">
              <button
                onClick={handleAccept}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-1 text-xs rounded-full"
              >
                Accept
              </button>
              <button
                onClick={handleReject}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-1 text-xs rounded-full"
              >
                Reject
              </button>
            </div>
          ) : (
            <span
              className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${computedValues.statusClass}`}
            >
              {order.status}
            </span>
          )}
        </td>

        {/* Vendor Allotment */}
        <td className="py-3 px-4 w-48 text-xs border-r border-gray-200">
          <div className="space-y-2 text-center">
            <div className="text-gray-600 font-medium">
              {activeTab === "returns" ? "Return to Vendor" : "Allot Vendor"}
            </div>
            <div className="flex justify-center gap-2">
              {[false, true].map((value) => (
                <button
                  key={value ? "yes" : "no"}
                  onClick={() => handleVendorAllot(value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    value === computedValues.isVendorAllotted
                      ? activeTab === "returns" && value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {value ? "Yes" : "No"}
                </button>
              ))}
            </div>
            {(computedValues.isVendorAllotted ||
              order.allottedVendorName ||
              computedValues.allottedVendorName) && (
              <div>
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 font-medium rounded-full">
                  {computedValues.allottedVendorName ||
                    order.allottedVendorName ||
                    "Vendor Assigned"}
                </span>
              </div>
            )}
            {vendorDropdown}
          </div>
        </td>

        {/* Courier Allotment */}
        <td className="py-3 px-4 w-40 text-xs border-r border-gray-200">
          <div className="space-y-2 text-center">
            <div className="flex justify-center gap-2">
              {[false, true].map((value) => (
                <button
                  key={value ? "yes" : "no"}
                  onClick={() => handleCourierAllot(value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    value === computedValues.isCourierAllotted
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {value ? "Yes" : "No"}
                </button>
              ))}
            </div>
            {computedValues.isCourierAllotted && (
              <div className="text-green-600 font-medium">
                <Package className="inline w-4 h-4 mr-1" /> Shiprocket
              </div>
            )}
          </div>
        </td>

        {/* Delivery Status */}
        <td className="py-3 px-4 w-32 text-center border-r border-gray-200">
          <span
            className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${getDeliveryStatusColor(
              computedValues.currentDeliveryStatus
            )}`}
          >
            {computedValues.currentDeliveryStatus}
          </span>
        </td>

        {/* Action Buttons */}
        <td className="py-3 px-4 w-40">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleBarcodeScan}
              title="Scan"
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            >
              <Scan className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              title="Print"
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              title="Download"
              className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              title="Share"
              className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  },
  // Custom comparison function for better memoization
  (prevProps, nextProps) => {
    // Only re-render if essential props change
    return (
      prevProps.order.orderId === nextProps.order.orderId &&
      prevProps.order.status === nextProps.order.status &&
      prevProps.order.paymentStatus === nextProps.order.paymentStatus &&
      prevProps.selectedVendors[prevProps.order.orderId] ===
        nextProps.selectedVendors[nextProps.order.orderId] &&
      prevProps.courierAllotments[prevProps.order.orderId] ===
        nextProps.courierAllotments[nextProps.order.orderId] &&
      prevProps.showVendorDropdown[prevProps.order.orderId] ===
        nextProps.showVendorDropdown[nextProps.order.orderId] &&
      prevProps.selectedVendorNames[prevProps.order.orderId] ===
        nextProps.selectedVendorNames[nextProps.order.orderId] &&
      prevProps.allottedVendorNames[prevProps.order.orderId] ===
        nextProps.allottedVendorNames[nextProps.order.orderId] &&
      prevProps.deliveryStatuses[prevProps.order.orderId] ===
        nextProps.deliveryStatuses[nextProps.order.orderId] &&
      prevProps.activeTab === nextProps.activeTab
    );
  }
);

// Set display names for debugging
DocumentViewer.displayName = "DocumentViewer";
ReturnWindowScreen.displayName = "ReturnWindowScreen";
ExchangeWindowScreen.displayName = "ExchangeWindowScreen";
OrderDetails.displayName = "OrderDetails";
Orders.displayName = "Orders";
OrderRow.displayName = "OrderRow";

export default Orders;
