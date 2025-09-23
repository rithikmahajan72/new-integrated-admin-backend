import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';

// Custom hooks for Redux store

// Auth hooks
export const useAuth = () => {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  return {
    ...auth,
    dispatch,
  };
};

// Cart hooks
export const useCart = () => {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  
  const addItem = useCallback((item) => {
    dispatch({ type: 'cart/addToCart', payload: item });
  }, [dispatch]);
  
  const removeItem = useCallback((itemId) => {
    dispatch({ type: 'cart/removeFromCart', payload: itemId });
  }, [dispatch]);
  
  const updateQuantity = useCallback((itemId, quantity) => {
    dispatch({ type: 'cart/updateQuantity', payload: { itemId, quantity } });
  }, [dispatch]);
  
  const clearCart = useCallback(() => {
    dispatch({ type: 'cart/clearCart' });
  }, [dispatch]);
  
  return {
    ...cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    dispatch,
  };
};

// Wishlist hooks
export const useWishlist = () => {
  const wishlist = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();
  
  const addItem = useCallback((item) => {
    dispatch({ type: 'wishlist/addToWishlist', payload: item });
  }, [dispatch]);
  
  const removeItem = useCallback((itemId) => {
    dispatch({ type: 'wishlist/removeFromWishlist', payload: itemId });
  }, [dispatch]);
  
  const toggleItem = useCallback((item) => {
    dispatch({ type: 'wishlist/toggleWishlistItem', payload: item });
  }, [dispatch]);
  
  const isInWishlist = useCallback((itemId) => {
    return wishlist.items.some(item => item.id === itemId);
  }, [wishlist.items]);
  
  return {
    ...wishlist,
    addItem,
    removeItem,
    toggleItem,
    isInWishlist,
    dispatch,
  };
};

// Save For Later hooks
export const useSaveForLater = () => {
  const saveForLater = useSelector((state) => state.saveForLater);
  const dispatch = useDispatch();
  
  const addItem = useCallback((item) => {
    dispatch({ type: 'saveForLater/addToSaveForLater', payload: item });
  }, [dispatch]);
  
  const removeItem = useCallback((itemId) => {
    dispatch({ type: 'saveForLater/removeFromSaveForLater', payload: itemId });
  }, [dispatch]);
  
  const toggleItem = useCallback((item) => {
    dispatch({ type: 'saveForLater/toggleSaveForLaterItem', payload: item });
  }, [dispatch]);
  
  const isInSaveForLater = useCallback((itemId) => {
    return saveForLater.items.some(item => item.id === itemId);
  }, [saveForLater.items]);
  
  const clearAll = useCallback(() => {
    dispatch({ type: 'saveForLater/clearSaveForLater' });
  }, [dispatch]);
  
  const updateNote = useCallback((itemId, note) => {
    dispatch({ type: 'saveForLater/updateSaveForLaterNote', payload: { itemId, note } });
  }, [dispatch]);
  
  const sortItems = useCallback((sortBy) => {
    dispatch({ type: 'saveForLater/sortSaveForLater', payload: sortBy });
  }, [dispatch]);
  
  const setFilters = useCallback((filters) => {
    dispatch({ type: 'saveForLater/setSaveForLaterFilters', payload: filters });
  }, [dispatch]);
  
  const clearFilters = useCallback(() => {
    dispatch({ type: 'saveForLater/clearSaveForLaterFilters' });
  }, [dispatch]);
  
  const moveToCart = useCallback((itemId, cartData) => {
    dispatch({ type: 'saveForLater/moveFromSaveForLaterToCart', payload: itemId });
    // Also add to cart
    dispatch({ type: 'cart/addToCart', payload: cartData });
  }, [dispatch]);
  
  const moveToWishlist = useCallback((itemId, item) => {
    dispatch({ type: 'saveForLater/moveFromSaveForLaterToWishlist', payload: itemId });
    // Also add to wishlist
    dispatch({ type: 'wishlist/addToWishlist', payload: item });
  }, [dispatch]);
  
  return {
    ...saveForLater,
    addItem,
    removeItem,
    toggleItem,
    isInSaveForLater,
    clearAll,
    updateNote,
    sortItems,
    setFilters,
    clearFilters,
    moveToCart,
    moveToWishlist,
    dispatch,
  };
};

// Products hooks
export const useProducts = () => {
  const products = useSelector((state) => state.products); // Backward compatibility
  const dispatch = useDispatch();
  
  const setFilters = useCallback((filters) => {
    dispatch({ type: 'products/setFilters', payload: filters });
  }, [dispatch]);
  
  const setSortBy = useCallback((sortBy) => {
    dispatch({ type: 'products/setSortBy', payload: sortBy });
  }, [dispatch]);
  
  const setCurrentPage = useCallback((page) => {
    dispatch({ type: 'products/setCurrentPage', payload: page });
  }, [dispatch]);
  
  return {
    ...products,
    setFilters,
    setSortBy,
    setCurrentPage,
    dispatch,
  };
};

// Categories hooks
export const useCategories = () => {
  const categories = useSelector((state) => state.categories);
  const dispatch = useDispatch();
  
  return {
    ...categories,
    dispatch,
  };
};

// Orders hooks
export const useOrders = () => {
  const orders = useSelector((state) => state.orders);
  const dispatch = useDispatch();
  
  return {
    ...orders,
    dispatch,
  };
};

// User hooks
export const useUser = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  
  const updateUser = useCallback((userData) => {
    dispatch({ type: 'user/updateUser', payload: userData });
  }, [dispatch]);
  
  const updatePreferences = useCallback((preferences) => {
    dispatch({ type: 'user/updatePreferences', payload: preferences });
  }, [dispatch]);
  
  return {
    ...user,
    updateUser,
    updatePreferences,
    dispatch,
  };
};

// UI hooks
export const useUI = () => {
  const ui = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  
  const openModal = useCallback((modal, data = null) => {
    dispatch({ type: 'ui/openModal', payload: { modal, data } });
  }, [dispatch]);
  
  const closeModal = useCallback((modal) => {
    dispatch({ type: 'ui/closeModal', payload: modal });
  }, [dispatch]);
  
  const addNotification = useCallback((notification) => {
    dispatch({ type: 'ui/addNotification', payload: notification });
  }, [dispatch]);
  
  const removeNotification = useCallback((id) => {
    dispatch({ type: 'ui/removeNotification', payload: id });
  }, [dispatch]);
  
  return {
    ...ui,
    openModal,
    closeModal,
    addNotification,
    removeNotification,
    dispatch,
  };
};

// Checkout hooks
export const useCheckout = () => {
  const checkout = useSelector((state) => state.checkout);
  const dispatch = useDispatch();
  
  const nextStep = useCallback(() => {
    dispatch({ type: 'checkout/nextStep' });
  }, [dispatch]);
  
  const prevStep = useCallback(() => {
    dispatch({ type: 'checkout/prevStep' });
  }, [dispatch]);
  
  const setShippingAddress = useCallback((address) => {
    dispatch({ type: 'checkout/setShippingAddress', payload: address });
  }, [dispatch]);
  
  const setPaymentMethod = useCallback((method) => {
    dispatch({ type: 'checkout/setPaymentMethod', payload: method });
  }, [dispatch]);
  
  return {
    ...checkout,
    nextStep,
    prevStep,
    setShippingAddress,
    setPaymentMethod,
    dispatch,
  };
};

// Search hooks
export const useSearch = () => {
  const search = useSelector((state) => state.search);
  const dispatch = useDispatch();
  
  const setQuery = useCallback((query) => {
    dispatch({ type: 'search/setQuery', payload: query });
  }, [dispatch]);
  
  const setResults = useCallback((results) => {
    dispatch({ type: 'search/setResults', payload: results });
  }, [dispatch]);
  
  const addToRecent = useCallback((query) => {
    dispatch({ type: 'search/addToRecentSearches', payload: query });
  }, [dispatch]);
  
  const clearSearch = useCallback(() => {
    dispatch({ type: 'search/clearSearch' });
  }, [dispatch]);
  
  return {
    ...search,
    setQuery,
    setResults,
    addToRecent,
    clearSearch,
    dispatch,
  };
};

// Push Notification hooks
export const usePushNotifications = () => {
  const pushNotifications = useSelector((state) => state.pushNotification);
  const dispatch = useDispatch();
  
  const sendNotification = useCallback((notificationData) => {
    dispatch({ type: 'pushNotification/sendPushNotification', payload: notificationData });
  }, [dispatch]);
  
  const updateNotification = useCallback((updates) => {
    dispatch({ type: 'pushNotification/updateCurrentNotification', payload: updates });
  }, [dispatch]);
  
  const resetNotification = useCallback(() => {
    dispatch({ type: 'pushNotification/resetCurrentNotification' });
  }, [dispatch]);
  
  const addToStack = useCallback((notification) => {
    dispatch({ type: 'pushNotification/addToStack', payload: notification });
  }, [dispatch]);
  
  const removeFromStack = useCallback((id) => {
    dispatch({ type: 'pushNotification/removeFromStack', payload: id });
  }, [dispatch]);
  
  return {
    ...pushNotifications,
    sendNotification,
    updateNotification,
    resetNotification,
    addToStack,
    removeFromStack,
    dispatch,
  };
};

// Combined hook for common app state
export const useAppState = () => {
  const auth = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const saveForLater = useSaveForLater();
  const ui = useUI();
  const pushNotifications = usePushNotifications();
  const promoCodes = usePromoCodes();
  
  return {
    auth,
    cart,
    wishlist,
    saveForLater,
    ui,
    pushNotifications,
    promoCodes,
  };
};

// Promo Codes hook
export const usePromoCodes = () => {
  const promoCodes = useSelector((state) => state.promoCodes);
  const dispatch = useDispatch();
  
  const fetchPromoCodes = useCallback((params) => {
    dispatch({ type: 'promoCodes/fetchPromoCodes', payload: params });
  }, [dispatch]);
  
  const createPromoCode = useCallback((promoCodeData) => {
    dispatch({ type: 'promoCodes/createPromoCode', payload: promoCodeData });
  }, [dispatch]);
  
  const updatePromoCode = useCallback((id, promoCodeData) => {
    dispatch({ type: 'promoCodes/updatePromoCode', payload: { id, promoCodeData } });
  }, [dispatch]);
  
  const deletePromoCode = useCallback((id) => {
    dispatch({ type: 'promoCodes/deletePromoCode', payload: id });
  }, [dispatch]);
  
  const validatePromoCode = useCallback((code, cartTotal) => {
    dispatch({ type: 'promoCodes/validatePromoCode', payload: { code, cartTotal } });
  }, [dispatch]);
  
  const togglePromoCodeStatus = useCallback((id, isActive) => {
    dispatch({ type: 'promoCodes/updatePromoCode', payload: { id, promoCodeData: { isActive } } });
  }, [dispatch]);
  
  const bulkToggleStatus = useCallback((ids, isActive) => {
    dispatch({ type: 'promoCodes/bulkTogglePromoCodeStatus', payload: { ids, isActive } });
  }, [dispatch]);
  
  const bulkDelete = useCallback((ids) => {
    dispatch({ type: 'promoCodes/bulkDeletePromoCodes', payload: ids });
  }, [dispatch]);
  
  const setFilters = useCallback((filters) => {
    dispatch({ type: 'promoCodes/updateFilters', payload: filters });
  }, [dispatch]);
  
  const clearFilters = useCallback(() => {
    dispatch({ type: 'promoCodes/resetFilters' });
  }, [dispatch]);
  
  const clearError = useCallback(() => {
    dispatch({ type: 'promoCodes/clearError' });
  }, [dispatch]);
  
  const getPromoCodeById = useCallback((id) => {
    return promoCodes.promoCodes.find(promo => promo._id === id);
  }, [promoCodes.promoCodes]);
  
  return {
    ...promoCodes,
    fetchPromoCodes,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    validatePromoCode,
    togglePromoCodeStatus,
    bulkToggleStatus,
    bulkDelete,
    setFilters,
    clearFilters,
    clearError,
    getPromoCodeById,
    dispatch,
  };
};

// Points hooks
export const usePoints = () => {
  const points = useSelector((state) => state.points);
  const dispatch = useDispatch();
  
  return {
    ...points,
    dispatch,
  };
};
