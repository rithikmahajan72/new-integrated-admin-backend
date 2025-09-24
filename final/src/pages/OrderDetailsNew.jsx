import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Calendar, 
  ChevronDown, 
  Printer, 
  Download, 
  Share2,
  User,
  Package,
  FileText,
  ArrowLeft,
  Edit,
  Check,
  X,
  Truck,
  AlertCircle,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Loader2,
  Save,
  RotateCcw,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';
import useOrderManagement from '../hooks/useOrderManagement';

/**
 * Enhanced OrderDetails Component with Redux Integration
 * 
 * Features:
 * - Real-time order data from Redux store
 * - Status management with admin controls
 * - Vendor allotment functionality
 * - Courier tracking integration
 * - Return/Exchange processing
 * - Invoice generation and sharing
 * - Activity timeline
 * - Responsive design
 */
const OrderDetailsNew = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Local state for UI interactions
  const [showInvoice, setShowInvoice] = useState(false);
  const [actionDropdown, setActionDropdown] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [editingVendor, setEditingVendor] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Redux integration
  const {
    getOrderById,
    updateOrderStatus,
    allotVendor,
    updateCourierStatus,
    processReturn,
    processExchange,
    addOrderNote,
    vendors,
    loading,
    error
  } = useOrderManagement();

  const { orders } = useSelector(state => state.orderManagement);
  const order = orders.find(o => o._id === orderId);

  // Initialize component data
  useEffect(() => {
    if (orderId && !order) {
      getOrderById(orderId);
    }
  }, [orderId, order, getOrderById]);

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
      setSelectedVendor(order.vendor?.name || '');
      setNotes(order.notes || '');
    }
  }, [order]);

  // Status options with proper order flow
  const statusOptions = useMemo(() => [
    'Pending',
    'Processing',
    'Accepted',
    'Rejected',
    'Allotted to Vendor',
    'Picked Up',
    'In Transit',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
    'Returned',
    'Exchanged'
  ], []);

  // Status color mapping
  const getStatusColor = useCallback((status) => {
    const colorMap = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Processing': 'bg-blue-100 text-blue-800 border-blue-200',
      'Accepted': 'bg-green-100 text-green-800 border-green-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200',
      'Allotted to Vendor': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Picked Up': 'bg-purple-100 text-purple-800 border-purple-200',
      'In Transit': 'bg-orange-100 text-orange-800 border-orange-200',
      'Out for Delivery': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Delivered': 'bg-green-100 text-green-800 border-green-200',
      'Cancelled': 'bg-gray-100 text-gray-800 border-gray-200',
      'Returned': 'bg-red-100 text-red-800 border-red-200',
      'Exchanged': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  }, []);

  // Event handlers
  const handleStatusUpdate = useCallback(async (newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, notes);
      setSelectedStatus(newStatus);
      setEditingStatus(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }, [orderId, notes, updateOrderStatus]);

  const handleVendorAllotment = useCallback(async (vendorId) => {
    try {
      await allotVendor(orderId, vendorId);
      setEditingVendor(false);
    } catch (error) {
      console.error('Failed to allot vendor:', error);
    }
  }, [orderId, allotVendor]);

  const handleAddNote = useCallback(async () => {
    try {
      await addOrderNote(orderId, notes);
      setShowNotes(false);
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  }, [orderId, notes, addOrderNote]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownload = useCallback(() => {
    if (!order) return;
    
    const invoiceData = {
      orderNumber: order.orderNumber,
      date: new Date(order.createdAt).toLocaleDateString(),
      customer: order.customerDetails,
      items: order.items,
      total: order.totalAmount,
      status: order.status
    };
    
    // Create downloadable invoice
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(invoiceData, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `invoice-${order.orderNumber}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [order]);

  const handleShare = useCallback(() => {
    if (!order || !navigator.share) {
      // Fallback for browsers that don't support Web Share API
      const shareText = `Order ${order?.orderNumber} - Status: ${order?.status}`;
      navigator.clipboard.writeText(shareText);
      alert('Order details copied to clipboard!');
      return;
    }

    navigator.share({
      title: `Order ${order.orderNumber}`,
      text: `Order Status: ${order.status}`,
      url: window.location.href,
    });
  }, [order]);

  const handleReturn = useCallback(async (reason) => {
    try {
      await processReturn(orderId, reason);
    } catch (error) {
      console.error('Failed to process return:', error);
    }
  }, [orderId, processReturn]);

  const handleExchange = useCallback(async (reason, newItems) => {
    try {
      await processExchange(orderId, reason, newItems);
    } catch (error) {
      console.error('Failed to process exchange:', error);
    }
  }, [orderId, processExchange]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">Failed to load order details</p>
          <button 
            onClick={() => getOrderById(orderId)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Order not found
  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="h-8 w-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Order not found</p>
          <button 
            onClick={() => navigate('/orders')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/orders')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Orders</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Order {order.orderNumber}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'details', label: 'Order Details', icon: Package },
              { id: 'timeline', label: 'Timeline', icon: Clock },
              { id: 'documents', label: 'Documents', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 pb-2 border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600">₹{order.totalAmount}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium">{order.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.paymentStatus === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Items</p>
                    <p className="font-medium">{order.items?.length || 0} items</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <img
                          src={item.image || '/api/placeholder/80/80'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">Size: {item.size}</span>
                          <span className="text-sm text-gray-600">Color: {item.color}</span>
                          <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{item.price}</p>
                        <p className="text-sm text-gray-600">₹{item.price * item.quantity} total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{order.subtotal || order.totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">₹{order.shippingCost || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">₹{order.tax || 0}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-₹{order.discount}</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Management */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Management</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Status
                    </label>
                    {editingStatus ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleStatusUpdate(selectedStatus)}
                          className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingStatus(false)}
                          className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <button
                          onClick={() => setEditingStatus(true)}
                          className="p-1 text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Vendor Management */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned Vendor
                    </label>
                    {editingVendor ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={selectedVendor}
                          onChange={(e) => setSelectedVendor(e.target.value)}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Vendor</option>
                          {vendors?.map((vendor) => (
                            <option key={vendor.id} value={vendor.id}>
                              {vendor.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleVendorAllotment(selectedVendor)}
                          className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingVendor(false)}
                          className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-900">
                          {order.vendor?.name || 'Not assigned'}
                        </span>
                        <button
                          onClick={() => setEditingVendor(true)}
                          className="p-1 text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Notes
                      </label>
                      <button
                        onClick={() => setShowNotes(!showNotes)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {showNotes ? 'Hide' : 'Add Note'}
                      </button>
                    </div>
                    {showNotes && (
                      <div className="space-y-2">
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add a note about this order..."
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                        />
                        <button
                          onClick={handleAddNote}
                          className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          <Save className="h-3 w-3" />
                          <span>Save Note</span>
                        </button>
                      </div>
                    )}
                    {order.notes && !showNotes && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                        {order.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.customerDetails?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">Customer</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.customerDetails?.email || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">Email</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.customerDetails?.phone || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">Phone</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Delivery Address</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.shippingAddress?.street}<br />
                        {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                        {order.shippingAddress?.zipCode}, {order.shippingAddress?.country}
                      </p>
                    </div>
                  </div>
                  
                  {order.trackingNumber && (
                    <div className="flex items-center space-x-3">
                      <Truck className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Tracking Number</p>
                        <p className="text-sm text-gray-600">{order.trackingNumber}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Expected Delivery</p>
                      <p className="text-sm text-gray-600">
                        {order.expectedDelivery 
                          ? new Date(order.expectedDelivery).toLocaleDateString()
                          : 'TBD'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleReturn('Customer request')}
                    className="flex items-center justify-center space-x-2 px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 text-sm"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Process Return</span>
                  </button>
                  
                  <button
                    onClick={() => handleExchange('Customer request', [])}
                    className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Process Exchange</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Timeline</h2>
            
            <div className="space-y-6">
              {order.timeline?.map((event, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-8">No timeline events available</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Documents</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {order.documents?.map((doc, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-600">{doc.type}</p>
                    </div>
                  </div>
                  <button className="mt-3 w-full bg-gray-50 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-100 text-sm">
                    View Document
                  </button>
                </div>
              )) || (
                <div className="col-span-full text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No documents available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsNew;
