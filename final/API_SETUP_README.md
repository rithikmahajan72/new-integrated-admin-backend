# API Integration Setup - Frontend

This frontend project is now fully prepared for Axios integration with comprehensive API management. **No fetch calls are used - everything is built with Axios.**

## 📦 Installed Packages

- **axios**: `^1.12.0` - HTTP client for API calls
- **redux**: `^5.0.1` - State management
- **react-redux**: `^9.2.0` - React bindings for Redux
- **@reduxjs/toolkit**: `^2.9.0` - Modern Redux toolkit

## 🗂️ API Structure

```
src/
├── api/
│   ├── index.js          # Main API exports
│   ├── axiosConfig.js    # Axios instance configuration
│   ├── endpoints.js      # All API endpoint functions
│   └── utils.js          # API utilities and helpers
├── hooks/
│   └── useApi.js         # Custom React hooks for API calls
└── components/
    └── ApiExample.jsx    # Example component showing API usage
```

## 🔧 Configuration

### Environment Variables (.env.local)
```env
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_API_TIMEOUT=10000
```

### Axios Configuration
- **Base URL**: `http://localhost:8080` (your backend)
- **Timeout**: 10 seconds
- **Auto token handling**: JWT tokens from localStorage
- **Request/Response interceptors**: For auth and error handling

## 🚀 Available API Endpoints

### Authentication
- `authAPI.login(credentials)`
- `authAPI.register(userData)`
- `authAPI.logout()`
- `authAPI.verifyOTP(otpData)`
- `authAPI.forgotPassword(email)`

### Items/Products
- `itemAPI.getAllItems(params)`
- `itemAPI.getItemById(itemId)`
- `itemAPI.getItemsByCategory(categoryId)`
- `itemAPI.createItem(itemData)` (admin)
- `itemAPI.updateItem(itemId, itemData)` (admin)

### Cart Management
- `cartAPI.getCart()`
- `cartAPI.addToCart(itemData)`
- `cartAPI.updateCartItem(itemId, quantity)`
- `cartAPI.removeFromCart(itemId)`
- `cartAPI.clearCart()`

### User Management
- `userAPI.getProfile()`
- `userAPI.updateProfile(userData)`
- `userAPI.deleteAccount()`

### Orders
- `orderAPI.getAllOrders(params)`
- `orderAPI.createOrder(orderData)`
- `orderAPI.getUserOrders()`
- `orderAPI.updateOrderStatus(orderId, status)`

### Categories & Subcategories
- `categoryAPI.getAllCategories()`
- `subCategoryAPI.getAllSubCategories()`
- `subCategoryAPI.getSubCategoriesByCategory(categoryId)`

### Wishlist
- `wishlistAPI.getWishlist()`
- `wishlistAPI.addToWishlist(itemId)`
- `wishlistAPI.removeFromWishlist(itemId)`

### Address Management
- `addressAPI.getAllAddresses()`
- `addressAPI.createAddress(addressData)`
- `addressAPI.updateAddress(addressId, addressData)`
- `addressAPI.setDefaultAddress(addressId)`

### Payment
- `paymentAPI.createPaymentIntent(orderData)`
- `paymentAPI.verifyPayment(paymentData)`
- `paymentAPI.getPaymentHistory()`

### Reviews
- `reviewAPI.getItemReviews(itemId)`
- `reviewAPI.createReview(reviewData)`
- `reviewAPI.getUserReviews()`

### Notifications
- `notificationAPI.getAllNotifications()`
- `notificationAPI.markAsRead(notificationId)`
- `notificationAPI.markAllAsRead()`

### File Upload
- `imageAPI.uploadImage(formData)`
- `bulkUploadAPI.uploadItems(formData)`

## 🎣 Custom React Hooks

### useApi Hook
```jsx
import { useApi } from '../hooks/useApi';
import { itemAPI } from '../api';

const MyComponent = () => {
  const { data, loading, error, execute } = useApi(itemAPI.getAllItems);
  
  // Automatic execution on mount
  useEffect(() => {
    execute();
  }, []);
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <div>{/* Render data */}</div>}
    </div>
  );
};
```

### useAuth Hook
```jsx
import { useAuth } from '../hooks/useApi';

const MyComponent = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <div>Welcome {user.name}! <button onClick={logout}>Logout</button></div>
      ) : (
        <button onClick={() => login(token, userData)}>Login</button>
      )}
    </div>
  );
};
```

### useCart Hook
```jsx
import { useCart } from '../hooks/useApi';

const MyComponent = () => {
  const { cartItems, cartCount, addToCart, removeFromCart } = useCart();
  
  return (
    <div>
      <p>Cart: {cartCount} items</p>
      {/* Cart operations */}
    </div>
  );
};
```

## 💡 Usage Examples

### Basic API Call
```jsx
import { authAPI, apiCall } from '../api';

// Simple API call
const handleLogin = async () => {
  const result = await apiCall(authAPI.login, credentials);
  
  if (result.success) {
    console.log('Login successful:', result.data);
  } else {
    console.error('Login failed:', result.message);
  }
};
```

### API Call with Custom Error Handling
```jsx
import { itemAPI } from '../api';

const fetchItems = async () => {
  try {
    const response = await itemAPI.getAllItems({ page: 1, limit: 10 });
    setItems(response.data);
  } catch (error) {
    console.error('Failed to fetch items:', error.message);
  }
};
```

### File Upload
```jsx
import { imageAPI, createFormData } from '../api';

const handleImageUpload = async (file) => {
  const formData = createFormData({ category: 'product' }, 'image', file);
  
  try {
    const result = await imageAPI.uploadImage(formData);
    console.log('Upload successful:', result.data.imageUrl);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

## 🔐 Authentication Flow

1. **Login**: Call `authAPI.login()` → Store token in localStorage
2. **Auto-attach**: Axios interceptor automatically adds token to requests
3. **Token expiry**: Interceptor handles 401 responses and redirects to login
4. **Logout**: Call `logout()` → Clear token and redirect

## 🛠️ Error Handling

- **Network errors**: Handled automatically with user-friendly messages
- **401 Unauthorized**: Auto-redirect to login page
- **403 Forbidden**: Log error and show message
- **500+ Server errors**: Log and show generic error message
- **Custom error handling**: Use `handleApiError()` utility

## 🔄 State Management Integration

The API setup works seamlessly with Redux:

```jsx
// In your Redux slice
import { itemAPI } from '../api';

const itemSlice = createSlice({
  name: 'items',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    // ... reducers
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      });
  },
});

// Async thunk
export const fetchItems = createAsyncThunk(
  'items/fetchItems',
  async (params) => {
    const response = await itemAPI.getAllItems(params);
    return response.data;
  }
);
```

## 🚨 Important Notes

1. **No Fetch Used**: All HTTP requests use Axios exclusively
2. **Token Management**: Automatic JWT token handling via interceptors
3. **Error Boundaries**: Implement React error boundaries for better UX
4. **Environment**: Update `.env.local` for different environments
5. **Backend Integration**: Ensure backend APIs match the endpoint structure

## 🧪 Testing

Use the `ApiExample.jsx` component to test API integration:

```jsx
import ApiExample from './components/ApiExample';

// Add to your router or directly render
<ApiExample />
```

This setup provides a complete, production-ready API integration layer for your React frontend with comprehensive error handling, authentication management, and state synchronization capabilities.
