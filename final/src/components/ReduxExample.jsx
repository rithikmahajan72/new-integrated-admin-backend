import React, { useEffect } from 'react';
import { useAuth, useCart, useWishlist, useUI, useProducts } from '../store/hooks';
import { loginUser, registerUser } from '../store/slices/authSlice';
import { fetchProducts } from '../store/slices/productsSlice';
import { addToCartAPI } from '../store/slices/cartSlice';
import { addToWishlistAPI } from '../store/slices/wishlistSlice';

// Example component demonstrating Redux usage
const ReduxExample = () => {
  // Use custom hooks to access Redux state and actions
  const auth = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const ui = useUI();
  const products = useProducts();

  // Fetch products when component mounts
  useEffect(() => {
    if (products.items.length === 0) {
      products.dispatch(fetchProducts({ page: 1, limit: 12 }));
    }
  }, [products.dispatch, products.items.length]);

  // Handle login
  const handleLogin = async () => {
    const credentials = {
      email: 'user@example.com',
      password: 'password123'
    };

    try {
      const result = await auth.dispatch(loginUser(credentials));
      if (result.type === 'auth/loginUser/fulfilled') {
        ui.addNotification({
          type: 'success',
          message: 'Login successful!',
          duration: 3000
        });
      }
    } catch (error) {
      ui.addNotification({
        type: 'error',
        message: 'Login failed',
        duration: 3000
      });
    }
  };

  // Handle register
  const handleRegister = async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      phoneNumber: '+1234567890'
    };

    try {
      const result = await auth.dispatch(registerUser(userData));
      if (result.type === 'auth/registerUser/fulfilled') {
        ui.addNotification({
          type: 'success',
          message: 'Registration successful! Please verify OTP.',
          duration: 5000
        });
      }
    } catch (error) {
      ui.addNotification({
        type: 'error',
        message: 'Registration failed',
        duration: 3000
      });
    }
  };

  // Handle add to cart
  const handleAddToCart = async (product) => {
    const cartItem = {
      itemId: product.id,
      quantity: 1,
      size: 'M',
      color: 'Blue'
    };

    try {
      if (auth.isAuthenticated) {
        // API call for authenticated users
        await cart.dispatch(addToCartAPI(cartItem));
      } else {
        // Local cart for non-authenticated users
        cart.addItem({ ...product, ...cartItem });
      }
      
      ui.addNotification({
        type: 'success',
        message: `${product.name} added to cart!`,
        duration: 2000
      });
    } catch (error) {
      ui.addNotification({
        type: 'error',
        message: 'Failed to add item to cart',
        duration: 3000
      });
    }
  };

  // Handle add to wishlist
  const handleAddToWishlist = async (product) => {
    try {
      if (auth.isAuthenticated) {
        // API call for authenticated users
        await wishlist.dispatch(addToWishlistAPI(product));
      } else {
        // Local wishlist for non-authenticated users
        wishlist.addItem(product);
      }
      
      ui.addNotification({
        type: 'success',
        message: `${product.name} added to wishlist!`,
        duration: 2000
      });
    } catch (error) {
      ui.addNotification({
        type: 'error',
        message: 'Failed to add item to wishlist',
        duration: 3000
      });
    }
  };

  // Handle logout
  const handleLogout = () => {
    auth.dispatch({ type: 'auth/logoutUser' });
    ui.addNotification({
      type: 'info',
      message: 'Logged out successfully',
      duration: 2000
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Redux Store Example</h1>
      
      {/* Authentication Section */}
      <div className="mb-8 p-6 border rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Authentication</h2>
        
        {auth.isAuthenticated ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {auth.user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-semibold">{auth.user?.name || 'User'}</p>
                <p className="text-gray-600">{auth.user?.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="space-x-4">
            <button 
              onClick={handleLogin}
              disabled={auth.isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {auth.isLoading ? 'Logging in...' : 'Login Demo'}
            </button>
            <button 
              onClick={handleRegister}
              disabled={auth.isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {auth.isLoading ? 'Registering...' : 'Register Demo'}
            </button>
          </div>
        )}
        
        {auth.error && (
          <p className="text-red-500 mt-2">{auth.error}</p>
        )}
      </div>

      {/* Cart & Wishlist Summary */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Cart Summary</h3>
          <div className="space-y-2">
            <p>Items: <span className="font-semibold">{cart.count}</span></p>
            <p>Subtotal: <span className="font-semibold">${cart.subtotal.toFixed(2)}</span></p>
            <p>Total: <span className="font-semibold text-green-600">${cart.total.toFixed(2)}</span></p>
            <button 
              onClick={() => ui.openModal('cart')}
              className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              View Cart
            </button>
          </div>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Wishlist Summary</h3>
          <div className="space-y-2">
            <p>Items: <span className="font-semibold">{wishlist.count}</span></p>
            <button 
              onClick={() => ui.openModal('wishlist')}
              className="w-full mt-4 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
            >
              View Wishlist
            </button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Products</h2>
        
        {products.isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">Loading products...</p>
          </div>
        ) : products.error ? (
          <p className="text-red-500">{products.error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.items.slice(0, 6).map((product) => (
              <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="aspect-w-1 aspect-h-1 mb-4 bg-gray-200 rounded">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-48 object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-300 rounded flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2">${product.price}</p>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleAddToWishlist(product)}
                    className={`px-3 py-2 rounded text-sm ${
                      wishlist.isInWishlist(product.id)
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ♥
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      {ui.notifications.length > 0 && (
        <div className="fixed top-4 right-4 space-y-2 z-50">
          {ui.notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 rounded shadow-lg ${
                notification.type === 'success' ? 'bg-green-500 text-white' :
                notification.type === 'error' ? 'bg-red-500 text-white' :
                'bg-blue-500 text-white'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{notification.message}</span>
                <button
                  onClick={() => ui.removeNotification(notification.id)}
                  className="ml-4 text-white hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Redux State Debug Panel (Development only) */}
      {import.meta.env.MODE === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Redux State (Debug)</h3>
          <details className="text-sm">
            <summary className="cursor-pointer mb-2">Click to view state</summary>
            <pre className="bg-white p-2 rounded overflow-auto max-h-96">
              {JSON.stringify({
                auth: {
                  isAuthenticated: auth.isAuthenticated,
                  user: auth.user?.name,
                  isLoading: auth.isLoading
                },
                cart: {
                  count: cart.count,
                  total: cart.total,
                  isLocal: cart.isLocal
                },
                wishlist: {
                  count: wishlist.count,
                  isLocal: wishlist.isLocal
                },
                products: {
                  itemsCount: products.items.length,
                  isLoading: products.isLoading
                }
              }, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default ReduxExample;
