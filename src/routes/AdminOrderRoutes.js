// Import required dependencies
const express = require("express");
const {
  // Admin Order Management
  adminGetAllOrders,
  adminUpdateOrderStatus,
  adminAcceptOrder,
  adminRejectOrder,
  adminGetOrderStatistics,
  adminBulkUpdateOrders,
  
  // Vendor Management
  adminGetAvailableVendors,
  adminAllotVendor,
  
  // Courier Management
  adminUpdateCourierStatus,
  
  // Return Management
  adminGetReturnRequests,
  adminProcessReturnRequest,
  adminGetReturnStats,
  
  // Exchange Management
  adminGetExchangeRequests,
  adminProcessExchangeRequest,
  adminGetExchangeStats
} = require("../controllers/paymentController/OrderController");

const { verifyToken } = require("../middleware/VerifyToken");
const multer = require("multer");

// Initialize an Express router instance
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array("images", 3);

// ===== ADMIN ORDER MANAGEMENT ROUTES =====

// GET /api/admin/orders - Get all orders with filters
router.get("/orders", verifyToken, adminGetAllOrders);

// GET /api/admin/orders/statistics - Get order statistics
router.get("/orders/statistics", verifyToken, adminGetOrderStatistics);

// PUT /api/admin/orders/:orderId/status - Update order status
router.put("/orders/:orderId/status", verifyToken, adminUpdateOrderStatus);

// PUT /api/admin/orders/:orderId/accept - Accept order
router.put("/orders/:orderId/accept", verifyToken, adminAcceptOrder);

// PUT /api/admin/orders/:orderId/reject - Reject order
router.put("/orders/:orderId/reject", verifyToken, adminRejectOrder);

// PUT /api/admin/orders/:orderId/vendor - Allot vendor to order
router.put("/orders/:orderId/vendor", verifyToken, adminAllotVendor);

// PUT /api/admin/orders/:orderId/courier - Update courier status
router.put("/orders/:orderId/courier", verifyToken, adminUpdateCourierStatus);

// POST /api/admin/orders/bulk-update - Bulk update orders
router.post("/orders/bulk-update", verifyToken, adminBulkUpdateOrders);

// ===== VENDOR MANAGEMENT ROUTES =====

// GET /api/admin/vendors - Get all vendors
router.get("/vendors", verifyToken, adminGetAvailableVendors);

// ===== RETURN MANAGEMENT ROUTES =====

// GET /api/admin/returns - Get all returns
router.get("/returns", verifyToken, adminGetReturnRequests);

// GET /api/admin/returns/stats - Get return statistics
router.get("/returns/stats", verifyToken, adminGetReturnStats);

// PUT /api/admin/returns/:returnId/process - Process return request
router.put("/returns/:returnId/process", verifyToken, upload, adminProcessReturnRequest);

// ===== EXCHANGE MANAGEMENT ROUTES =====

// GET /api/admin/exchanges - Get all exchanges
router.get("/exchanges", verifyToken, adminGetExchangeRequests);

// GET /api/admin/exchanges/stats - Get exchange statistics
router.get("/exchanges/stats", verifyToken, adminGetExchangeStats);

// PUT /api/admin/exchanges/:exchangeId/process - Process exchange request
router.put("/exchanges/:exchangeId/process", verifyToken, upload, adminProcessExchangeRequest);

// Export the router for use in the main Express app
module.exports = router;
