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

// Products hooks
export const useProducts = () => {
  const products = useSelector((state) => state.products);
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

// Combined hook for common app state
export const useAppState = () => {
  const auth = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const ui = useUI();
  
  return {
    auth,
    cart,
    wishlist,
    ui,
  };
};
