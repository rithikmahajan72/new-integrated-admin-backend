import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import all slices
import authSlice from './slices/authSlice';
import cartSlice from './slices/cartSlice';
import wishlistSlice from './slices/wishlistSlice';
import productsSlice from './slices/productsSlice';
import categoriesSlice from './slices/categoriesSlice';
import subCategoriesSlice from './slices/subCategoriesSlice';
import ordersSlice from './slices/ordersSlice';
import userSlice from './slices/userSlice';
import uiSlice from './slices/uiSlice';
import checkoutSlice from './slices/checkoutSlice';
import searchSlice from './slices/searchSlice';

// Persist configuration
const persistConfig = {
  key: 'yoraa-root',
  storage,
  whitelist: ['auth', 'cart', 'wishlist', 'user'], // Only persist these slices
  blacklist: ['ui', 'products', 'search'], // Don't persist these slices
};

// Cart persist configuration (separate config for cart)
const cartPersistConfig = {
  key: 'yoraa-cart',
  storage,
  whitelist: ['items', 'total', 'count'],
};

// Auth persist configuration
const authPersistConfig = {
  key: 'yoraa-auth',
  storage,
  whitelist: ['user', 'token', 'isAuthenticated'],
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authSlice,
  cart: cartSlice,
  wishlist: wishlistSlice,
  products: productsSlice,
  categories: categoriesSlice,
  subCategories: subCategoriesSlice,
  orders: ordersSlice,
  user: userSlice,
  ui: uiSlice,
  checkout: checkoutSlice,
  search: searchSlice,
});

// Create persisted reducer (temporarily disabled)
// const persistedReducer = persistReducer(persistConfig, rootReducer);
const persistedReducer = rootReducer;

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['register', 'rehydrate'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Helper functions for accessing state and dispatch
export const getRootState = () => store.getState();
export const getAppDispatch = () => store.dispatch;

// Export store as default
export default store;
