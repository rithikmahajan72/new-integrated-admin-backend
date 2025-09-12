import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  ChevronDown, 
  Printer, 
  Download, 
  Share2,
  User,
  Package,
  FileText,
  ArrowLeft
} from 'lucide-react';
import InvoiceTemplate from '../components/InvoiceTemplate';

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
 * - Action buttons (print, download, share) with invoice format
 */
const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  // State for order status management
  const [orderStatus, setOrderStatus] = useState('Pending');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [notes, setNotes] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);

  // Mock order data - in real app, this would be fetched based on orderId
  // Memoized to prevent recreation on every render
  const orderData = useMemo(() => ({
    id: orderId || '6743',
    status: 'Pending',
    dateRange: 'Feb 16,2022 - Feb 20,2022',
    customer: {
      name: 'Shristi Singh',
      email: 'shristi@gmail.com',
      phone: '+91 904 1212'
    },
    orderInfo: {
      shipping: 'Next express',
      paymentMethod: 'Paypal',
      status: 'Pending'
    },
    deliveryAddress: 'Dharam Colony, Palam Vihar, Gurgaon, Haryana',
    paymentInfo: {
      cardNumber: 'Master Card **** **** 6557',
      businessName: 'Shristi Singh',
      phone: '+91 904 231 1212'
    },
    items: [
      {
        id: '123456789222i',
        image: '/api/placeholder/130/143',
        date: '27 nov 2025',
        customerName: 'pearl',
        size: 'stock',
        quantity: 2025,
        sku: '2025',
        barcode: '2025',
        price: 4566,
        salePrice: 4566
      },
      {
        id: '123456789222i',
        image: '/api/placeholder/130/143',
        date: '27 nov 2025',
        customerName: 'pearl',
        size: 'stock',
        quantity: 2025,
        sku: '2025',
        barcode: '2025',
        price: 4566,
        salePrice: 4566
      }
    ],
    summary: {
      subTotal: 2025,
      shippingRate: 202,
      promo: 2025,
      points: 2025,
      total: 2025
    },
    documents: {
      name: 'aadhar card'
    }
  }), [orderId]);

  // Status options - memoized to prevent recreation
  const statusOptions = useMemo(() => [
    'Pending',
    'Processing',
    'Accepted',
    'Allotted to vendor',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Rejected'
  ], []);

  // Status color mapping - memoized function
  const getStatusColor = useCallback((status) => {
    const colorMap = {
      'Pending': 'bg-orange-200 text-orange-800',
      'Processing': 'bg-blue-200 text-blue-800',
      'Accepted': 'bg-green-200 text-green-800',
      'Allotted to vendor': 'bg-indigo-200 text-indigo-800',
      'Shipped': 'bg-purple-200 text-purple-800',
      'Delivered': 'bg-green-500 text-white',
      'Cancelled': 'bg-red-200 text-red-800',
      'Rejected': 'bg-red-500 text-white'
    };
    return colorMap[status] || 'bg-gray-200 text-gray-800';
  }, []);

  // Memoized current status color
  const currentStatusColor = useMemo(() => getStatusColor(orderStatus), [orderStatus, getStatusColor]);

  // Memoized invoice text for sharing
  const invoiceShareText = useMemo(() => `
🧾 INVOICE - Order #${orderData.id}

📅 Invoice Date: ${new Date().toLocaleDateString('en-GB')}
📅 Expected Date: ${new Date(Date.now() + 14*24*60*60*1000).toLocaleDateString('en-GB')}

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
${orderData.items.map(item => `
• Order ID: ${item.id}
  Date: ${item.date}
  Customer: ${item.customerName}
  Size: ${item.size}
  Quantity: ${item.quantity}
  SKU: ${item.sku}
  Barcode: ${item.barcode}
  Price: ₹${item.price}
  Sale Price: ₹${item.salePrice}
`).join('')}

💰 ORDER SUMMARY:
• Sub Total: ₹${orderData.summary.subTotal}
• Shipping Rate: ₹${orderData.summary.shippingRate}
• Promo: ₹${orderData.summary.promo}
• Points: ₹${orderData.summary.points}
• TOTAL: ₹${orderData.summary.total}

© 2025 YORAA. All rights reserved.
Thank you for your business!
  `.trim(), [orderData, orderStatus]);

  // Event handlers
  const handleStatusChange = useCallback((status) => {
    setOrderStatus(status);
    setShowStatusDropdown(false);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownload = useCallback(() => {
    // Show invoice template for download
    setShowInvoice(true);
  }, []);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: `Invoice - Order #${orderData.id}`,
        text: invoiceShareText,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(invoiceShareText)
        .then(() => alert('Invoice details copied to clipboard!'))
        .catch(() => alert('Unable to copy invoice details.'));
    }
  }, [orderData.id, invoiceShareText]);

  const handleBack = useCallback(() => {
    navigate('/orders');
  }, [navigate]);

  const handleSave = useCallback(() => {
    // Save order changes (status, notes, etc.)
    console.log('Saving order changes:', {
      orderId: orderData.id,
      status: orderStatus,
      notes: notes
    });
    alert('Order saved successfully!');
  }, [orderData.id, orderStatus, notes]);

  // Memoized action buttons to prevent re-renders
  const ActionButtons = useMemo(() => (
    <div className="flex items-center space-x-2">
      <button
        onClick={handlePrint}
        className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200"
      >
        <Printer className="h-6 w-6 text-gray-600" />
      </button>
      <button 
        onClick={handleShare}
        className="p-2 hover:bg-gray-100 rounded"
      >
        <Share2 className="h-6 w-6 text-gray-600" />
      </button>
      <button
        onClick={handleDownload}
        className="p-2 hover:bg-gray-100 rounded"
      >
        <Download className="h-6 w-6 text-gray-600" />
      </button>
    </div>
  ), [handlePrint, handleShare, handleDownload]);

  const OrderItemRow = useCallback(({ item, index }) => (
    <div className="grid grid-cols-10 gap-4 items-center py-4 border-b border-gray-100 last:border-b-0">
      <div>
        <img 
          src={item.image} 
          alt="Product" 
          className="w-32 h-36 object-cover rounded-lg bg-gray-100"
          loading="lazy"
        />
      </div>
      <div>
        <span className="text-xl font-medium text-blue-600 underline cursor-pointer">
          {item.id}
        </span>
      </div>
      <div className="text-xl font-medium text-gray-900">{item.date}</div>
      <div className="text-xl font-medium text-gray-900">{item.customerName}</div>
      <div className="text-xl font-medium text-gray-900">{item.size}</div>
      <div className="text-xl font-medium text-gray-900">{item.quantity}</div>
      <div className="text-xl font-medium text-gray-900">{item.sku}</div>
      <div className="text-xl font-medium text-gray-900">{item.barcode}</div>
      <div className="text-xl font-medium text-gray-900">{item.price}</div>
      <div className="text-xl font-medium text-gray-900">{item.salePrice}</div>
    </div>
  ), []);

  // Memoized order summary section
  const OrderSummary = useMemo(() => (
    <div className="px-6 pb-6 flex justify-end">
      <div className="space-y-4">
        <div className="flex justify-between text-xl font-bold text-gray-600 min-w-[200px]">
          <span>Sub Total</span>
          <span className="text-gray-900">{orderData.summary.subTotal}</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-gray-600">
          <span>Shipping Rate</span>
          <span className="text-gray-900">{orderData.summary.shippingRate}</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-gray-600">
          <span>Promo</span>
          <span className="text-gray-900">{orderData.summary.promo}</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-gray-600">
          <span>Points</span>
          <span className="text-gray-900">{orderData.summary.points}</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-gray-600 pt-2 border-t border-gray-200">
          <span>Total</span>
          <span className="text-gray-900">{orderData.summary.total}</span>
        </div>
      </div>
    </div>
  ), [orderData.summary]);

  // Show invoice template when download is clicked
  if (showInvoice) {
    return (
      <InvoiceTemplate 
        orderData={orderData}
        orderStatus={orderStatus}
        onClose={() => setShowInvoice(false)}
      />
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Orders</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">order details</h1>
          <h2 className="text-2xl font-bold text-gray-800">order</h2>
        </div>

        {/* Order Details Container */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          {/* Order Header */}
          <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <span className="text-sm font-medium text-gray-900">Orders ID: #{orderData.id}</span>
                  <div className={`px-3 py-2 rounded-lg text-xs font-semibold ${currentStatusColor}`}>
                    {orderStatus}
                  </div>
                </div>
              </div>            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-gray-400" />
                <span className="text-base font-semibold text-black">{orderData.dateRange}</span>
              </div>
              
              <div className="flex items-center space-x-5">
                {/* Status Change Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="bg-gray-100 px-4 py-3 rounded-lg flex items-center justify-between w-56"
                  >
                    <span className="text-sm font-semibold text-gray-900">Change Status</span>
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </button>
                  
                  {showStatusDropdown && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 w-56">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700"
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
                  className="bg-gray-100 px-4 py-3 rounded-lg flex items-center justify-center"
                >
                  <Printer className="h-6 w-6 text-gray-600" />
                </button>
                
                {/* Save Button */}
                <button
                  onClick={handleSave}
                  className="bg-gray-100 px-4 py-3 rounded-lg"
                >
                  <span className="text-sm font-semibold text-gray-900">Save</span>
                </button>
              </div>
            </div>
          </div>

          {/* Information Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer Info */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-start space-x-4 mb-4">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Customer</h3>
                  <div className="space-y-2 text-base text-gray-600">
                    <p>Full Name: {orderData.customer.name}</p>
                    <p>Email: {orderData.customer.email}</p>
                    <p>Phone: {orderData.customer.phone}</p>
                  </div>
                </div>
              </div>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700">
                View profile
              </button>
            </div>

            {/* Order Info */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-start space-x-4 mb-4">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Order Info</h3>
                  <div className="space-y-2 text-base text-gray-600 font-semibold">
                    <p>Shipping: {orderData.orderInfo.shipping}</p>
                    <p>Payment Method: {orderData.orderInfo.paymentMethod}</p>
                    <p>Status: {orderData.orderInfo.status}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleDownload}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Download info
              </button>
            </div>

            {/* Delivery Info */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-start space-x-4 mb-4">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Deliver to</h3>
                  <div className="text-base text-gray-600 font-semibold">
                    <p>Address: {orderData.deliveryAddress}</p>
                  </div>
                </div>
              </div>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700">
                View profile
              </button>
            </div>
          </div>

          {/* Payment Info and Notes Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Payment Info */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">payment info</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-5 bg-red-600 rounded flex items-center justify-center">
                    <span className="text-xs text-white font-bold">M</span>
                  </div>
                  <span className="text-base font-semibold text-gray-700">
                    {orderData.paymentInfo.cardNumber}
                  </span>
                </div>
                <p className="text-base font-semibold text-gray-700">
                  Business name: {orderData.paymentInfo.businessName}
                </p>
                <p className="text-base font-semibold text-gray-700">
                  Phone: {orderData.paymentInfo.phone}
                </p>
              </div>
            </div>

            {/* Note */}
            <div className="md:col-span-2">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Note</h3>
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Type some notes"
                  className="w-full h-20 text-base text-gray-700 placeholder-gray-500 border-none outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Documents Info - Positioned separately as in Figma */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 w-80">
            <div className="flex items-start space-x-4 mb-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">documents submitted</h3>
                <div className="text-base text-gray-600 font-semibold">
                  <p>document name</p>
                  <p>{orderData.documents.name}</p>
                </div>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700">
              View documents
            </button>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="bg-white rounded-2xl shadow-sm mt-6">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-gray-900">order</h2>
              {ActionButtons}
            </div>
            
            {/* Table Column Headers */}
            <div className="grid grid-cols-10 gap-4 text-sm font-medium text-gray-600">
              <div>Image</div>
              <div>order id</div>
              <div>date</div>
              <div>customer name</div>
              <div>size</div>
              <div>quantity</div>
              <div>SKU</div>
              <div>barcode no.</div>
              <div>Price</div>
              <div>sale price</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="p-6">
            {orderData.items.map((item, index) => (
              <OrderItemRow key={`${item.id}-${index}`} item={item} index={index} />
            ))}
          </div>

          {/* Order Summary */}
          {OrderSummary}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-sm text-white bg-gray-800 py-4 rounded-lg">
          © 2025 YORA. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
