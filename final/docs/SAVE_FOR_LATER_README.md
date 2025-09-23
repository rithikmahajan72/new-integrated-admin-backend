# Save For Later Feature Documentation

A comprehensive save-for-later functionality for the Yoraa Clothing Shop React application, built with Redux Toolkit and Axios for API integration.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [API Requirements](#api-requirements)
- [Usage](#usage)
- [Components](#components)
- [Redux Store](#redux-store)
- [API Integration](#api-integration)
- [Examples](#examples)
- [Customization](#customization)
- [Testing](#testing)

## 🎯 Overview

The Save For Later feature allows customers to save items for future consideration without adding them directly to their cart. This feature includes:

- **Redux State Management**: Complete state management with Redux Toolkit
- **API Integration**: RESTful API endpoints with Axios
- **Multiple UI Components**: Buttons, widgets, and full page interfaces
- **Persistent Storage**: Redux Persist for state persistence
- **Cross-feature Integration**: Seamless integration with cart and wishlist

## ✨ Features

### Core Functionality
- ✅ Add/remove items from save-for-later list
- ✅ Move items between save-for-later, cart, and wishlist
- ✅ Bulk operations (clear all, select multiple)
- ✅ Item notes and priority levels
- ✅ Real-time synchronization with backend
- ✅ Offline support with Redux Persist

### UI Components
- ✅ SaveForLaterButton (multiple variants)
- ✅ SaveForLaterPage (full management interface)
- ✅ SaveForLaterWidget (sidebar/summary display)
- ✅ Product card integration
- ✅ Responsive design for all screen sizes

### Advanced Features
- ✅ Authentication-aware (works for guest and logged-in users)
- ✅ Loading states and error handling
- ✅ Sorting and filtering options
- ✅ Grid and list view modes
- ✅ Drag-and-drop support (future enhancement)

## 🚀 Installation

### Prerequisites
- React 18+
- Redux Toolkit
- React Router DOM
- Axios
- Lucide React (for icons)
- Tailwind CSS

### Dependencies Already Installed
The feature uses existing project dependencies:
```json
{
  "@reduxjs/toolkit": "^1.9.x",
  "react-redux": "^8.x.x",
  "axios": "^1.x.x",
  "lucide-react": "^0.x.x",
  "react-router-dom": "^6.x.x"
}
```

### Files Created
```
src/
├── store/
│   └── slices/
│       └── saveForLaterSlice.js     # Redux slice
├── api/
│   └── endpoints.js                 # Updated with saveForLaterAPI
├── components/
│   ├── SaveForLaterButton.jsx       # Button component
│   ├── SaveForLaterWidget.jsx       # Widget component
│   └── SaveForLaterExamples.jsx     # Usage examples
├── pages/
│   └── SaveForLaterPage.jsx         # Full page interface
└── store/
    ├── store.js                     # Updated store config
    └── hooks.js                     # Updated with useSaveForLater
```

## 🔌 API Requirements

### Backend Endpoints Needed

The frontend expects the following REST API endpoints:

```javascript
// GET /api/save-for-later
// Fetch user's saved items
Response: {
  success: boolean,
  data: SaveForLaterItem[],
  count: number
}

// POST /api/save-for-later/add
Body: { item: Product, note?: string, priority?: number }
Response: { success: boolean, data: SaveForLaterItem }

// DELETE /api/save-for-later/remove/:itemId
Response: { success: boolean }

// DELETE /api/save-for-later/clear
Response: { success: boolean }

// POST /api/save-for-later/move-to-cart
Body: { itemId: string, quantity: number, size?: string, color?: string }
Response: { success: boolean }

// POST /api/save-for-later/move-to-wishlist
Body: { itemId: string, item: Product }
Response: { success: boolean }

// PUT /api/save-for-later/update-note/:itemId
Body: { note: string }
Response: { success: boolean }
```

### Data Models

```typescript
interface SaveForLaterItem {
  _id: string;
  userId: string;
  item: Product;
  note?: string;
  priority?: number;
  dateAdded: Date;
  lastModified: Date;
}

interface Product {
  _id: string;
  productName: string;
  regularPrice: number;
  salePrice?: number;
  images: string[];
  categoryId: { name: string };
  subCategoryId?: { name: string };
  brand?: string;
  description: string;
  productId: string;
  // ... other product fields
}
```

## 📖 Usage

### Basic Usage with Hooks

```jsx
import React from 'react';
import { useSaveForLater } from '../store/hooks';

const ProductCard = ({ product }) => {
  const saveForLater = useSaveForLater();
  
  const handleSaveForLater = () => {
    saveForLater.addItem(product);
  };
  
  return (
    <div className="product-card">
      <h3>{product.productName}</h3>
      <button onClick={handleSaveForLater}>
        Save For Later
      </button>
    </div>
  );
};
```

### Using Redux Selectors Directly

```jsx
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectSaveForLaterItems, 
  selectSaveForLaterCount,
  addToSaveForLaterAPI 
} from '../store/slices/saveForLaterSlice';

const MyComponent = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectSaveForLaterItems);
  const count = useSelector(selectSaveForLaterCount);
  
  const handleAdd = (item) => {
    dispatch(addToSaveForLaterAPI({ item }));
  };
  
  return (
    <div>
      <p>Saved Items: {count}</p>
      {/* Component content */}
    </div>
  );
};
```

## 🧩 Components

### SaveForLaterButton

A versatile button component with multiple variants:

```jsx
import SaveForLaterButton from '../components/SaveForLaterButton';

// Icon button (small)
<SaveForLaterButton 
  item={product} 
  variant="icon" 
  size="sm"
  showText={false}
/>

// Button with text
<SaveForLaterButton 
  item={product} 
  variant="button"
  showText={true}
/>

// Text link
<SaveForLaterButton 
  item={product} 
  variant="text"
/>
```

**Props:**
- `item` (Product, required): Product to save
- `variant` (string): 'icon', 'button', or 'text'
- `size` (string): 'sm', 'md', or 'lg'
- `showText` (boolean): Show text label
- `className` (string): Additional CSS classes
- `onClick` (function): Custom click handler

### SaveForLaterPage

Full-featured page component for managing saved items:

```jsx
import SaveForLaterPage from '../pages/SaveForLaterPage';

// Use in routing
<Route path="/save-for-later" element={<SaveForLaterPage />} />
```

**Features:**
- Grid and list view modes
- Sorting (date, price, name, priority)
- Filtering options
- Bulk operations
- Note editing
- Move to cart/wishlist actions

### SaveForLaterWidget

Compact widget for displaying saved items:

```jsx
import SaveForLaterWidget from '../components/SaveForLaterWidget';

// Sidebar widget
<SaveForLaterWidget 
  maxItems={3} 
  showInSidebar={true}
/>

// Dashboard summary
<SaveForLaterWidget 
  maxItems={5}
  className="custom-styling"
/>
```

**Props:**
- `maxItems` (number): Maximum items to display
- `showInSidebar` (boolean): Sidebar-specific styling
- `className` (string): Additional CSS classes

### QuickSaveForLaterButton

Lightweight button exported from SaveForLaterWidget:

```jsx
import { QuickSaveForLaterButton } from '../components/SaveForLaterWidget';

<QuickSaveForLaterButton item={product} />
```

## 🏪 Redux Store

### Slice Structure

```javascript
// saveForLaterSlice.js
const saveForLaterSlice = createSlice({
  name: 'saveForLater',
  initialState: {
    items: [],
    loading: false,
    error: null,
    initialized: false
  },
  reducers: {
    // Synchronous reducers
  },
  extraReducers: (builder) => {
    // Async thunk reducers
  }
});
```

### Available Actions

```javascript
// Async Thunks
dispatch(fetchSaveForLater());
dispatch(addToSaveForLaterAPI({ item, note, priority }));
dispatch(removeFromSaveForLaterAPI(itemId));
dispatch(clearSaveForLaterAPI());
dispatch(moveToCartFromSaveForLater({ itemId, cartData }));
dispatch(moveToWishlistFromSaveForLater({ itemId, item }));
dispatch(updateSaveForLaterNote({ itemId, note }));

// Sync Actions
dispatch(setSaveForLaterItems(items));
dispatch(addSaveForLaterItem(item));
dispatch(removeSaveForLaterItem(itemId));
```

### Selectors

```javascript
import {
  selectSaveForLaterItems,
  selectSaveForLaterCount,
  selectSaveForLaterLoading,
  selectSaveForLaterError,
  selectSaveForLaterInitialized,
  selectIsInSaveForLater
} from '../store/slices/saveForLaterSlice';

// Usage
const items = useSelector(selectSaveForLaterItems);
const count = useSelector(selectSaveForLaterCount);
const isLoading = useSelector(selectSaveForLaterLoading);
const error = useSelector(selectSaveForLaterError);
const isInSaveForLater = useSelector(selectIsInSaveForLater(productId));
```

### Custom Hook

```javascript
import { useSaveForLater } from '../store/hooks';

const saveForLater = useSaveForLater();

// Available methods
saveForLater.addItem(item, note?, priority?);
saveForLater.removeItem(itemId);
saveForLater.toggleItem(item);
saveForLater.clearAll();
saveForLater.moveToCart(itemId, cartData);
saveForLater.moveToWishlist(itemId, item);
saveForLater.updateNote(itemId, note);
saveForLater.isInSaveForLater(itemId);
saveForLater.refresh();
```

## 🔗 API Integration

### Endpoint Configuration

```javascript
// src/api/endpoints.js
export const saveForLaterAPI = {
  getSaveForLater: () => apiClient.get('/save-for-later'),
  addToSaveForLater: (data) => apiClient.post('/save-for-later/add', data),
  removeFromSaveForLater: (itemId) => apiClient.delete(`/save-for-later/remove/${itemId}`),
  clearSaveForLater: () => apiClient.delete('/save-for-later/clear'),
  moveToCart: (data) => apiClient.post('/save-for-later/move-to-cart', data),
  moveToWishlist: (data) => apiClient.post('/save-for-later/move-to-wishlist', data),
  updateNote: (itemId, data) => apiClient.put(`/save-for-later/update-note/${itemId}`, data)
};
```

### Error Handling

```javascript
// Automatic error handling in Redux slice
extraReducers: (builder) => {
  builder
    .addCase(fetchSaveForLater.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch saved items';
    })
    .addCase(addToSaveForLaterAPI.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to save item';
    });
}
```

## 🎨 Examples

### Product Card Integration

```jsx
import SaveForLaterButton from '../components/SaveForLaterButton';

const ProductCard = ({ product }) => (
  <div className="product-card">
    <img src={product.images[0]} alt={product.productName} />
    <div className="product-info">
      <h3>{product.productName}</h3>
      <p>₹{product.salePrice || product.regularPrice}</p>
    </div>
    <div className="product-actions">
      <button className="add-to-cart-btn">Add to Cart</button>
      <SaveForLaterButton 
        item={product} 
        variant="icon" 
        size="sm"
      />
    </div>
  </div>
);
```

### Dashboard Widget

```jsx
import SaveForLaterWidget from '../components/SaveForLaterWidget';

const DashboardSidebar = () => (
  <aside className="dashboard-sidebar">
    <SaveForLaterWidget 
      maxItems={5}
      showInSidebar={true}
      className="mb-6"
    />
  </aside>
);
```

### Navigation Integration

```jsx
import { useSelector } from 'react-redux';
import { selectSaveForLaterCount } from '../store/slices/saveForLaterSlice';

const Navigation = () => {
  const saveForLaterCount = useSelector(selectSaveForLaterCount);
  
  return (
    <nav>
      <Link to="/save-for-later" className="nav-link">
        Save For Later 
        {saveForLaterCount > 0 && (
          <span className="badge">{saveForLaterCount}</span>
        )}
      </Link>
    </nav>
  );
};
```

## 🎛️ Customization

### Styling

The components use Tailwind CSS classes. Customize by:

1. **Override classes:**
```jsx
<SaveForLaterButton 
  item={product}
  className="custom-btn-styles"
/>
```

2. **Theme customization:**
```css
/* Custom CSS */
.save-for-later-btn {
  @apply bg-purple-600 hover:bg-purple-700;
}
```

### Icons

Replace Lucide React icons:

```jsx
// In SaveForLaterButton component
import { MyCustomIcon } from '../icons';

const SaveForLaterButton = ({ item, ...props }) => {
  // Replace Bookmark/BookmarkCheck with MyCustomIcon
};
```

### API Endpoints

Customize API endpoints in `src/api/endpoints.js`:

```javascript
export const saveForLaterAPI = {
  getSaveForLater: () => apiClient.get('/api/v2/user/saved-items'),
  addToSaveForLater: (data) => apiClient.post('/api/v2/user/save-item', data),
  // ... other endpoints
};
```

## 🧪 Testing

### Component Testing

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import SaveForLaterButton from '../components/SaveForLaterButton';

const TestComponent = ({ item }) => (
  <Provider store={store}>
    <SaveForLaterButton item={item} />
  </Provider>
);

test('saves item when clicked', async () => {
  const mockItem = { _id: '1', productName: 'Test Product' };
  render(<TestComponent item={mockItem} />);
  
  const button = screen.getByRole('button');
  fireEvent.click(button);
  
  // Assert button state changes
  expect(button).toHaveClass('text-yellow-500');
});
```

### Redux Testing

```jsx
import { configureStore } from '@reduxjs/toolkit';
import saveForLaterReducer, { 
  addToSaveForLaterAPI 
} from '../store/slices/saveForLaterSlice';

const testStore = configureStore({
  reducer: {
    saveForLater: saveForLaterReducer
  }
});

test('adds item to save for later', () => {
  const mockItem = { _id: '1', productName: 'Test Product' };
  
  testStore.dispatch(addToSaveForLaterAPI({ item: mockItem }));
  
  const state = testStore.getState();
  expect(state.saveForLater.items).toHaveLength(1);
});
```

### API Testing

```jsx
import axios from 'axios';
import { saveForLaterAPI } from '../api/endpoints';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

test('fetches saved items', async () => {
  const mockData = { data: { success: true, data: [] } };
  mockedAxios.get.mockResolvedValue(mockData);
  
  const response = await saveForLaterAPI.getSaveForLater();
  
  expect(response.data.success).toBe(true);
  expect(mockedAxios.get).toHaveBeenCalledWith('/save-for-later');
});
```

## 🚀 Deployment

### Environment Variables

No additional environment variables required. Uses existing API configuration.

### Build Optimization

The feature is optimized for production:
- Redux Persist for offline support
- Memoized components to prevent unnecessary re-renders
- Efficient selectors with reselect
- Lazy loading for large lists (future enhancement)

### Backend Requirements

Ensure your backend implements the required API endpoints listed in the [API Requirements](#api-requirements) section.

## 📝 Notes

- The feature is designed to work with the existing authentication system
- Uses existing cart and wishlist patterns for consistency
- Fully responsive design works on all screen sizes
- Follows the project's existing coding standards and patterns
- Ready for production use with proper backend implementation

## 🔄 Migration from Existing Features

If you have an existing save-for-later implementation:

1. **Backup existing data:**
```javascript
const existingData = localStorage.getItem('saveForLater');
```

2. **Migrate to new format:**
```javascript
// Convert old format to new Redux state
const migratedData = existingData.map(item => ({
  ...item,
  dateAdded: new Date(),
  note: '',
  priority: 1
}));
```

3. **Initialize new state:**
```javascript
dispatch(setSaveForLaterItems(migratedData));
```

## 📞 Support

For issues or questions:
1. Check the examples in `SaveForLaterExamples.jsx`
2. Review Redux DevTools for state debugging
3. Verify API endpoints are properly implemented
4. Check browser console for error messages

The feature is complete and ready for use with proper backend integration!
