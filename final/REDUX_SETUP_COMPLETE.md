# Redux Store Setup - Complete E-commerce Solution

This Redux store is specifically designed for the Yoraa Clothing Shop e-commerce application with comprehensive state management for all aspects of an online clothing store.

## 📦 Installed Packages

- **@reduxjs/toolkit**: `^2.9.0` - Modern Redux with best practices
- **react-redux**: `^9.2.0` - React bindings for Redux
- **redux**: `^5.0.1` - Core Redux library
- **redux-persist**: `^6.0.0` - Persist Redux state to localStorage

## 🏗️ Store Structure

```
src/store/
├── index.js              # Main store configuration with persistence
├── ReduxProvider.jsx     # Provider component with state initialization
├── hooks.js              # Custom Redux hooks for easy usage
└── slices/
    ├── authSlice.js      # Authentication & user session
    ├── cartSlice.js      # Shopping cart management
    ├── wishlistSlice.js  # Wishlist functionality
    ├── productsSlice.js  # Products, filters, pagination
    ├── categoriesSlice.js # Categories & subcategories
    ├── ordersSlice.js    # Order management
    ├── userSlice.js      # User profile & preferences
    ├── uiSlice.js        # UI state (modals, notifications)
    ├── checkoutSlice.js  # Checkout process
    └── searchSlice.js    # Search functionality
```

## 🚀 Quick Setup

### 1. Wrap your app with ReduxProvider

```jsx
// src/main.jsx or src/App.jsx
import ReduxProvider from './store/ReduxProvider';

function App() {
  return (
    <ReduxProvider>
      {/* Your app components */}
    </ReduxProvider>
  );
}
```

### 2. Use custom hooks in components

```jsx
import { useAuth, useCart, useWishlist } from '../store/hooks';

function MyComponent() {
  const auth = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  
  // Your component logic
}
```

## 🔐 Authentication Slice

### Features
- **Login/Register** with API integration
- **OTP verification** for phone numbers
- **JWT token management** (auto-stored in localStorage)
- **Password reset** functionality
- **Session persistence** across browser sessions

### Usage Example
```jsx
import { useAuth } from '../store/hooks';
import { loginUser, registerUser, verifyOTP } from '../store/slices/authSlice';

function LoginComponent() {
  const auth = useAuth();
  
  const handleLogin = async () => {
    const result = await auth.dispatch(loginUser({
      email: 'user@example.com',
      password: 'password123'
    }));
    
    if (result.type === 'auth/loginUser/fulfilled') {
      console.log('Login successful!');
    }
  };
  
  return (
    <div>
      {auth.isAuthenticated ? (
        <p>Welcome, {auth.user.name}!</p>
      ) : (
        <button onClick={handleLogin} disabled={auth.isLoading}>
          {auth.isLoading ? 'Logging in...' : 'Login'}
        </button>
      )}
    </div>
  );
}
```

## 🛒 Cart Slice

### Features
- **Local & Server sync** - Works offline and syncs when authenticated
- **Automatic calculations** - Subtotal, tax, shipping, total
- **Quantity management** - Add, update, remove items
- **Size & color variants** support
- **Discount application** - Promo codes and discounts
- **Persistence** - Cart survives browser refresh

### Usage Example
```jsx
import { useCart } from '../store/hooks';

function ProductCard({ product }) {
  const cart = useCart();
  
  const handleAddToCart = () => {
    cart.addItem({
      ...product,
      quantity: 1,
      size: 'M',
      color: 'Blue'
    });
  };
  
  return (
    <div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={handleAddToCart}>
        Add to Cart ({cart.count} items)
      </button>
    </div>
  );
}
```

## ❤️ Wishlist Slice

### Features
- **Local & Server sync** - Works for both authenticated and guest users
- **Toggle functionality** - Easy add/remove
- **Sorting options** - By name, price, date added
- **Move to cart** - Direct transfer from wishlist to cart
- **Persistence** - Survives browser sessions

### Usage Example
```jsx
import { useWishlist } from '../store/hooks';

function WishlistButton({ product }) {
  const wishlist = useWishlist();
  const isInWishlist = wishlist.isInWishlist(product.id);
  
  const handleToggle = () => {
    wishlist.toggleItem(product);
  };
  
  return (
    <button 
      onClick={handleToggle}
      className={isInWishlist ? 'text-red-500' : 'text-gray-400'}
    >
      ♥ {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
    </button>
  );
}
```

## 👕 Products Slice

### Features
- **Product listing** with pagination
- **Advanced filtering** - Category, price range, size, color, brand
- **Sorting options** - Price, name, rating, newest
- **Recently viewed** products tracking
- **Product details** caching
- **Category-based** product organization
- **Stock management** - Real-time stock updates

### Usage Example
```jsx
import { useProducts } from '../store/hooks';
import { fetchProducts } from '../store/slices/productsSlice';

function ProductsPage() {
  const products = useProducts();
  
  useEffect(() => {
    products.dispatch(fetchProducts({ 
      page: 1, 
      limit: 12,
      category: 'shirts'
    }));
  }, []);
  
  const handleFilterChange = (newFilters) => {
    products.setFilters(newFilters);
    products.dispatch(fetchProducts({
      ...products.filters,
      ...newFilters
    }));
  };
  
  return (
    <div>
      {products.isLoading ? (
        <p>Loading products...</p>
      ) : (
        <div>
          {products.items.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
```

## 🏷️ Categories Slice

### Features
- **Hierarchical categories** - Categories and subcategories
- **Navigation breadcrumbs** - Automatic breadcrumb generation
- **Category caching** - Efficient data management
- **Dynamic loading** - Load subcategories on demand

### Usage Example
```jsx
import { useCategories } from '../store/hooks';
import { fetchCategories } from '../store/slices/categoriesSlice';

function CategoryNavigation() {
  const categories = useCategories();
  
  useEffect(() => {
    categories.dispatch(fetchCategories());
  }, []);
  
  return (
    <nav>
      {categories.categories.map(category => (
        <div key={category.id}>
          <h3>{category.name}</h3>
          {categories.subCategoriesByCategory[category.id]?.map(sub => (
            <a key={sub.id} href={`/category/${sub.id}`}>
              {sub.name}
            </a>
          ))}
        </div>
      ))}
    </nav>
  );
}
```

## 📦 Orders Slice

### Features
- **Order history** - Complete order management
- **Order status tracking** - Real-time status updates
- **Order details** - Full order information
- **Order cancellation** - Cancel pending orders

### Usage Example
```jsx
import { useOrders } from '../store/hooks';
import { fetchUserOrders } from '../store/slices/ordersSlice';

function OrderHistory() {
  const orders = useOrders();
  
  useEffect(() => {
    orders.dispatch(fetchUserOrders());
  }, []);
  
  return (
    <div>
      {orders.orders.map(order => (
        <div key={order.id}>
          <h4>Order #{order.id}</h4>
          <p>Status: {order.status}</p>
          <p>Total: ${order.total}</p>
        </div>
      ))}
    </div>
  );
}
```

## 💳 Checkout Slice

### Features
- **Multi-step checkout** - Cart → Shipping → Payment → Review → Complete
- **Address management** - Shipping and billing addresses
- **Payment methods** - Multiple payment options
- **Order summary** - Real-time calculations
- **Promo code support** - Discount application

### Usage Example
```jsx
import { useCheckout } from '../store/hooks';

function CheckoutPage() {
  const checkout = useCheckout();
  
  const handleNextStep = () => {
    checkout.nextStep();
  };
  
  const handleSetAddress = (address) => {
    checkout.setShippingAddress(address);
  };
  
  return (
    <div>
      <h2>Step {checkout.currentStep} of 5</h2>
      {checkout.currentStep === 2 && (
        <AddressForm onSubmit={handleSetAddress} />
      )}
      <button onClick={handleNextStep}>
        Continue
      </button>
    </div>
  );
}
```

## 🔍 Search Slice

### Features
- **Real-time search** - Instant search results
- **Search suggestions** - Auto-complete functionality
- **Recent searches** - Search history
- **Advanced filters** - Category, price filtering
- **Search persistence** - Remember search queries

### Usage Example
```jsx
import { useSearch } from '../store/hooks';

function SearchComponent() {
  const search = useSearch();
  
  const handleSearch = (query) => {
    search.setQuery(query);
    search.addToRecent(query);
    // Perform search API call
  };
  
  return (
    <div>
      <input 
        value={search.query}
        onChange={(e) => search.setQuery(e.target.value)}
        placeholder="Search products..."
      />
      <div>
        {search.recentSearches.map(recent => (
          <button key={recent} onClick={() => handleSearch(recent)}>
            {recent}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## 🎨 UI Slice

### Features
- **Modal management** - Centralized modal state
- **Notifications/Toasts** - User feedback system
- **Loading states** - Global loading indicators
- **Mobile menu** - Responsive navigation
- **Theme management** - Light/dark mode support

### Usage Example
```jsx
import { useUI } from '../store/hooks';

function MyComponent() {
  const ui = useUI();
  
  const showSuccessMessage = () => {
    ui.addNotification({
      type: 'success',
      message: 'Action completed successfully!',
      duration: 3000
    });
  };
  
  const openCartModal = () => {
    ui.openModal('cart');
  };
  
  return (
    <div>
      <button onClick={openCartModal}>View Cart</button>
      <button onClick={showSuccessMessage}>Show Success</button>
      
      {/* Notifications */}
      {ui.notifications.map(notif => (
        <div key={notif.id} className={`toast toast-${notif.type}`}>
          {notif.message}
        </div>
      ))}
    </div>
  );
}
```

## 👤 User Slice

### Features
- **User profile** - Personal information management
- **User preferences** - Settings and preferences
- **Address book** - Multiple address management
- **Notification settings** - Email, SMS, push preferences

## 🔄 Persistence Strategy

The store uses **redux-persist** with different strategies:

### Persisted Slices (Survive browser restart)
- ✅ **Auth** - User session and token
- ✅ **Cart** - Shopping cart items
- ✅ **Wishlist** - Saved items
- ✅ **User** - Profile and preferences

### Non-Persisted Slices (Reset on restart)
- ❌ **UI** - Modal states, notifications
- ❌ **Products** - Product listings (fetch fresh)
- ❌ **Search** - Search results (fetch fresh)

## 🛠️ Development Tools

### Redux DevTools Integration
```javascript
// Automatically enabled in development
devTools: process.env.NODE_ENV !== 'production'
```

### State Debugging
Use the `ReduxExample` component to view current state in development mode.

## 🔗 Integration with API

All slices are fully integrated with the Axios API setup:

```jsx
// Automatic API calls with loading/error states
const result = await dispatch(loginUser(credentials));
const products = await dispatch(fetchProducts(params));
const order = await dispatch(createOrder(orderData));
```

## 📱 Responsive & Mobile-First

The Redux store includes mobile-specific features:
- Mobile menu state management
- Touch-friendly cart/wishlist operations
- Responsive modal handling
- Mobile checkout flow optimization

## 🚀 Performance Optimizations

- **Memoized selectors** - Prevent unnecessary re-renders
- **Lazy loading** - Load data when needed
- **Caching strategies** - Cache frequently accessed data
- **Pagination** - Handle large datasets efficiently
- **Debounced searches** - Optimize search performance

## 📋 Production Ready Features

- ✅ **Error boundaries** - Graceful error handling
- ✅ **Loading states** - User feedback during operations
- ✅ **Offline support** - Local state when offline
- ✅ **Data synchronization** - Sync local/server state
- ✅ **Security** - Secure token management
- ✅ **SEO friendly** - Server-side rendering compatible
- ✅ **Accessibility** - Screen reader friendly
- ✅ **Performance** - Optimized for large catalogs

## 🎯 Best Practices Implemented

1. **Immutable updates** using Redux Toolkit
2. **Typed actions** with createSlice
3. **Async thunks** for API calls
4. **Error handling** in all async operations
5. **Loading states** for better UX
6. **Normalized state** structure
7. **Reusable selectors** for derived data
8. **Custom hooks** for component integration

This Redux setup provides a complete, production-ready state management solution for your Yoraa Clothing Shop e-commerce application!
