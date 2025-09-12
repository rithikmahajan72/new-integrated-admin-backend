import React, { useState, useEffect } from 'react';
import { useApi, useAuth, useCart, useWishlist } from '../hooks/useApi';
import { authAPI, itemAPI, cartAPI, wishlistAPI } from '../api';

// Example component showing how to use the API setup
const ApiExample = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  const { cartItems, cartCount, addToCart } = useCart();
  const { wishlistItems, addToWishlist, isInWishlist } = useWishlist();
  
  // Example: Get all items with loading and error handling
  const {
    data: items,
    loading: itemsLoading,
    error: itemsError,
    execute: fetchItems
  } = useApi(itemAPI.getAllItems);

  // Example: Login API call
  const {
    loading: loginLoading,
    error: loginError,
    execute: performLogin
  } = useApi(authAPI.login);

  // Example: Add to cart API call
  const {
    loading: cartLoading,
    execute: addItemToCart
  } = useApi(cartAPI.addToCart);

  useEffect(() => {
    // Fetch items when component mounts
    fetchItems();
  }, []);

  const handleLogin = async () => {
    const credentials = {
      email: 'user@example.com',
      password: 'password123'
    };

    const result = await performLogin(credentials);
    
    if (result.success) {
      login(result.data.token, result.data.user);
      console.log('Login successful!');
    } else {
      console.error('Login failed:', result.message);
    }
  };

  const handleAddToCart = async (item) => {
    if (isAuthenticated) {
      // API call to add to cart
      const result = await addItemToCart({
        itemId: item.id,
        quantity: 1,
        size: 'M',
        color: 'blue'
      });

      if (result.success) {
        addToCart(item); // Update local state
        console.log('Item added to cart!');
      }
    } else {
      // Just add to local cart if not authenticated
      addToCart(item);
    }
  };

  const handleAddToWishlist = async (item) => {
    if (isAuthenticated) {
      // API call to add to wishlist
      try {
        await wishlistAPI.addToWishlist(item.id);
        addToWishlist(item); // Update local state
        console.log('Item added to wishlist!');
      } catch (error) {
        console.error('Failed to add to wishlist:', error);
      }
    } else {
      // Just add to local wishlist if not authenticated
      addToWishlist(item);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">API Integration Example</h1>
      
      {/* Authentication Section */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Authentication</h2>
        {isAuthenticated ? (
          <div>
            <p>Welcome, {user?.name || 'User'}!</p>
            <button 
              onClick={logout}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <p>Not logged in</p>
            <button 
              onClick={handleLogin}
              disabled={loginLoading}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              {loginLoading ? 'Logging in...' : 'Login'}
            </button>
            {loginError && <p className="text-red-500 mt-2">{loginError}</p>}
          </div>
        )}
        <p className="text-sm text-gray-600 mt-2">Cart items: {cartCount}</p>
        <p className="text-sm text-gray-600">Wishlist items: {wishlistItems.length}</p>
      </div>

      {/* Items Section */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Items</h2>
        
        {itemsLoading && <p>Loading items...</p>}
        {itemsError && <p className="text-red-500">Error: {itemsError}</p>}
        
        {items && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.slice(0, 6).map((item) => (
              <div key={item.id} className="border p-4 rounded">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-600">${item.price}</p>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={cartLoading}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm disabled:opacity-50"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleAddToWishlist(item)}
                    className={`px-3 py-1 rounded text-sm ${
                      isInWishlist(item.id) 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-300 text-black'
                    }`}
                  >
                    {isInWishlist(item.id) ? 'In Wishlist' : 'Add to Wishlist'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button 
          onClick={fetchItems}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Refresh Items
        </button>
      </div>

      {/* API Usage Instructions */}
      <div className="p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">How to use the API setup:</h3>
        <pre className="text-sm bg-white p-2 rounded overflow-x-auto">
{`// Import API functions
import { authAPI, itemAPI } from '../api';
import { useApi } from '../hooks/useApi';

// Use in component
const { data, loading, error, execute } = useApi(itemAPI.getAllItems);

// Direct API call
const result = await authAPI.login(credentials);

// With error handling
const { success, data, message } = await apiCall(itemAPI.getItemById, itemId);`}
        </pre>
      </div>
    </div>
  );
};

export default ApiExample;
