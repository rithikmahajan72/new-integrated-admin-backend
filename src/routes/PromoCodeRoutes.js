const express = require('express');
const router = express.Router();
const { 
  validatePromoCode, 
  createPromoCode, 
  updatePromoCode, 
  deletePromoCode, 
  getAllPromoCodes,
  getPromoCodeById,
  bulkToggleStatus,
  bulkDelete,
  getPromoCodeStats,
  searchPromoCodes,
  getPromoCodesByStatus,
  getExpiredPromoCodes,
  clonePromoCode
} = require('../controllers/promoCodeController/PromoCodeController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// Public route for validating promo codes
router.post('/promo-codes/validate', validatePromoCode);

// Admin-only routes for managing promo codes
router.get('/admin/promo-codes', isAuthenticated, isAdmin, getAllPromoCodes);
router.get('/admin/promo-codes/stats', isAuthenticated, isAdmin, getPromoCodeStats);
router.get('/admin/promo-codes/search', isAuthenticated, isAdmin, searchPromoCodes);
router.get('/admin/promo-codes/status/:status', isAuthenticated, isAdmin, getPromoCodesByStatus);
router.get('/admin/promo-codes/expired', isAuthenticated, isAdmin, getExpiredPromoCodes);
router.get('/admin/promo-codes/:id', isAuthenticated, isAdmin, getPromoCodeById);
router.post('/admin/promo-codes', isAuthenticated, isAdmin, createPromoCode);
router.post('/admin/promo-codes/bulk/toggle-status', isAuthenticated, isAdmin, bulkToggleStatus);
router.post('/admin/promo-codes/bulk/delete', isAuthenticated, isAdmin, bulkDelete);
router.post('/admin/promo-codes/:id/clone', isAuthenticated, isAdmin, clonePromoCode);
router.put('/admin/promo-codes/:id', isAuthenticated, isAdmin, updatePromoCode);
router.delete('/admin/promo-codes/:id', isAuthenticated, isAdmin, deletePromoCode);

module.exports = router;