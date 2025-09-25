import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Package,
  Star,
  Heart,
  ShoppingCart,
  TrendingUp,
  Calendar,
  MapPin,
  Layers,
  Copy,
  Tag,
  Users,
  ExternalLink,
  Move
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  fetchItems as fetchProducts,
  deleteItem as deleteProduct,
  updateItem as updateProduct,
  updateItemStatus as updateProductStatus,
  fetchItemsByStatus as fetchProductsByStatus,
  selectItemsItems as selectProductsItems,
  selectItemsLoading as selectProductsLoading,
  selectItemsError as selectProductsError,
  clearError,
  clearSuccessMessage
} from '../store/slices/itemSlice';
import {
  fetchCategories,
  selectCategories
} from '../store/slices/categoriesSlice';
import {
  fetchSubCategories,
  selectSubCategories
} from '../store/slices/subCategoriesSlice';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import LoadingSpinner from '../components/LoadingSpinner';

// Status color mapping
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'published':
    case 'active':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'inactive':
    case 'disabled':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

// Stock status component
const StockStatus = ({ sizes, variants, stockSizeOption }) => {
  const totalStock = useMemo(() => {
    if (stockSizeOption === 'sizes' && sizes?.length) {
      return sizes.reduce((total, size) => total + (size.quantity || size.stock || 0), 0);
    } else if (stockSizeOption === 'variants' && variants?.length) {
      return variants.reduce((total, variant) => {
        if (variant.sizes?.length) {
          return total + variant.sizes.reduce((vTotal, size) => vTotal + (size.quantity || size.stock || 0), 0);
        }
        return total;
      }, 0);
    }
    return 0;
  }, [sizes, variants, stockSizeOption]);

  const stockStatus = useMemo(() => {
    if (totalStock === 0) return { label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50' };
    if (totalStock <= 5) return { label: 'Low Stock', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: 'In Stock', color: 'text-green-600', bg: 'bg-green-50' };
  }, [totalStock]);

  return (
    <div className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
      {stockStatus.label} ({totalStock})
    </div>
  );
};

// Detailed stock display component for list view
const DetailedStockDisplay = ({ sizes, variants, stockSizeOption }) => {
  const stockItems = useMemo(() => {
    const items = [];
    
    if (stockSizeOption === 'sizes' && sizes?.length) {
      sizes.forEach(size => {
        const quantity = size.quantity || size.stock || 0;
        if (quantity > 0) {
          items.push({
            name: size.size || size.name,
            quantity: quantity
          });
        }
      });
    } else if (stockSizeOption === 'variants' && variants?.length) {
      variants.forEach(variant => {
        if (variant.sizes?.length) {
          variant.sizes.forEach(size => {
            const quantity = size.quantity || size.stock || 0;
            if (quantity > 0) {
              items.push({
                name: `${variant.color} - ${size.size}`,
                quantity: quantity
              });
            }
          });
        }
      });
    }
    
    return items;
  }, [sizes, variants, stockSizeOption]);

  const totalStock = stockItems.reduce((total, item) => total + item.quantity, 0);

  if (stockItems.length === 0) {
    return (
      <div className="text-xs text-red-600 font-medium">
        Out of Stock
      </div>
    );
  }

  return (
    <div className="text-xs">
      <div className={`font-medium mb-1 ${
        totalStock <= 5 ? 'text-yellow-600' : 'text-green-600'
      }`}>
        Total: {totalStock} units
      </div>
      <div className="space-y-1">
        {stockItems.slice(0, 3).map((item, index) => (
          <div key={index} className="flex justify-between text-gray-600">
            <span className="truncate mr-2">{item.name}:</span>
            <span className="font-medium">{item.quantity}</span>
          </div>
        ))}
        {stockItems.length > 3 && (
          <div className="text-gray-500 italic">
            +{stockItems.length - 3} more sizes
          </div>
        )}
      </div>
    </div>
  );
};

// Price display component with detailed size-wise breakdown
const PriceDisplay = ({ sizes, platformPricing, price, salePrice, discountPrice }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const priceInfo = useMemo(() => {
    // If using size-based pricing
    if (sizes?.length) {
      const sizesPricing = sizes
        .filter(size => size.regularPrice > 0)
        .map(size => ({
          size: size.size,
          regular: size.regularPrice,
          sale: size.salePrice || 0
        }));
      
      if (sizesPricing.length) {
        const minRegular = Math.min(...sizesPricing.map(p => p.regular));
        const maxRegular = Math.max(...sizesPricing.map(p => p.regular));
        const hasSale = sizesPricing.some(p => p.sale > 0);
        const minSale = hasSale ? Math.min(...sizesPricing.filter(p => p.sale > 0).map(p => p.sale)) : 0;
        
        return {
          summary: {
            regular: minRegular === maxRegular ? `₹${minRegular}` : `₹${minRegular} - ₹${maxRegular}`,
            sale: minSale ? `₹${minSale}` : null
          },
          details: sizesPricing,
          type: 'size-based'
        };
      }
    }
    
    // Platform pricing (prioritize Yoraa)
    if (platformPricing?.yoraa?.enabled) {
      return {
        summary: {
          regular: `₹${platformPricing.yoraa.price}`,
          sale: platformPricing.yoraa.salePrice > 0 ? `₹${platformPricing.yoraa.salePrice}` : null
        },
        type: 'platform'
      };
    }
    
    // Legacy pricing
    const saleAmount = salePrice || discountPrice;
    return {
      summary: {
        regular: price ? `₹${price}` : 'N/A',
        sale: saleAmount > 0 ? `₹${saleAmount}` : null
      },
      type: 'legacy'
    };
  }, [sizes, platformPricing, price, salePrice, discountPrice]);

  return (
    <div className="relative">
      {/* Summary View */}
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => priceInfo.details && setShowDetails(!showDetails)}
      >
        {priceInfo.summary.sale && (
          <span className="text-green-600 font-medium">{priceInfo.summary.sale}</span>
        )}
        <span className={`${priceInfo.summary.sale ? 'line-through text-gray-500' : 'text-gray-900 font-medium'}`}>
          {priceInfo.summary.regular}
        </span>
        {priceInfo.details && (
          <span className="text-blue-500 text-xs group-hover:text-blue-700">
            ({priceInfo.details.length} sizes)
          </span>
        )}
      </div>

      {/* Detailed Size-wise Breakdown */}
      {showDetails && priceInfo.details && (
        <div className="absolute top-8 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-64">
          <div className="text-sm font-medium text-gray-700 mb-2">Size-wise Pricing:</div>
          <div className="space-y-1">
            {priceInfo.details.map((sizePrice, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 uppercase font-medium">{sizePrice.size}</span>
                <div className="flex items-center gap-2">
                  {sizePrice.sale > 0 && (
                    <span className="text-green-600 font-medium">₹{sizePrice.sale}</span>
                  )}
                  <span className={`${sizePrice.sale > 0 ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    ₹{sizePrice.regular}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(false);
            }}
            className="mt-2 w-full text-xs text-blue-600 hover:text-blue-800"
          >
            Close
          </button>
        </div>
      )}
      
      {/* Click outside to close */}
      {showDetails && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

// Item card component for grid view
const ItemCard = ({ 
  item, 
  onEdit, 
  onDelete, 
  onView, 
  onToggleStatus, 
  onStatusChange,
  onAddToRecommendations,
  onMoveToSale,
  onKeepCopyAndMove,
  onMoveToEyx
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showActionPanel, setShowActionPanel] = useState(false);
  const primaryImage = item.images?.[0]?.url || item.imageUrl || '/placeholder-image.jpg';

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
    { value: 'published', label: 'Live/Published', color: 'bg-green-100 text-green-800' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden group">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={primaryImage} 
          alt={item.productName || item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            e.target.src = '/placeholder-image.jpg';
          }}
        />
        
        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(item.status)}`}>
            {item.status || 'draft'}
          </span>
        </div>
        
        {/* Quick actions on hover */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex gap-1">
            <button
              onClick={() => onView(item)}
              className="p-1.5 bg-white rounded-full shadow hover:bg-gray-50"
              title="View Details"
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => onDelete(item)}
              className="p-1.5 bg-white rounded-full shadow hover:bg-gray-50"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>

        {/* Stock status overlay */}
        <div className="absolute bottom-2 left-2">
          <StockStatus 
            sizes={item.sizes}
            variants={item.variants}
            stockSizeOption={item.stockSizeOption}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
            {item.productName || item.name}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-1">
            {item.brand && `${item.brand} • `}
            SKU: {item.productId}
          </p>
        </div>

        {/* Price */}
        <div className="mb-3">
          <PriceDisplay 
            sizes={item.sizes}
            platformPricing={item.platformPricing}
            price={item.price}
            salePrice={item.salePrice}
            discountPrice={item.discountPrice}
          />
        </div>

        {/* Category info */}
        <div className="text-xs text-gray-500 mb-3">
          {item.categoryId?.name || 'Uncategorized'} → {item.subCategoryId?.name || 'No subcategory'}
        </div>

        {/* Quick Action buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => onEdit(item)}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onView(item)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Action Panel Toggle */}
        <button
          onClick={() => setShowActionPanel(true)}
          className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <MoreVertical className="w-4 h-4" />
          More Actions & Settings
        </button>

        {/* Full-Screen Action Panel */}
        {showActionPanel && ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 10000 }}>
            {/* Left Side - Product Info (1/3 width) */}
            <div className="w-1/3 bg-white p-6 overflow-y-auto border-r border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
                <button
                  onClick={() => setShowActionPanel(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              {/* Product Image */}
              <div className="mb-6">
                <img 
                  src={primaryImage} 
                  alt={item.productName || item.name}
                  className="w-full h-64 object-cover rounded-lg bg-gray-100"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {item.productName || item.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    SKU: {item.productId}
                  </p>
                  {item.brand && (
                    <p className="text-sm text-gray-600">
                      Brand: {item.brand}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Category</h4>
                  <p className="text-sm text-gray-600">
                    {item.categoryId?.name || 'Uncategorized'} → {item.subCategoryId?.name || 'No subcategory'}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Price</h4>
                  <PriceDisplay 
                    sizes={item.sizes}
                    platformPricing={item.platformPricing}
                    price={item.price}
                    salePrice={item.salePrice}
                    discountPrice={item.discountPrice}
                  />
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Stock Status</h4>
                  <StockStatus 
                    sizes={item.sizes}
                    variants={item.variants}
                    stockSizeOption={item.stockSizeOption}
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Actions (2/3 width) */}
            <div className="flex-1 bg-white p-6 overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Actions & Settings</h2>
              
              <div className="space-y-8">
                {/* Status Management */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Status Management
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {statusOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => {
                          onStatusChange(item, option.value);
                        }}
                        className={`p-4 rounded-lg border-2 transition-all text-center ${
                          (item.status || 'draft') === option.value 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`inline-block w-3 h-3 rounded-full mb-2 ${option.color.split(' ')[0]}`}></div>
                        <div className="font-medium">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recommendations Management */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Recommendation Settings
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => onAddToRecommendations(item, 'youMayAlsoLike')}
                      className="p-4 border border-gray-300 rounded-lg hover:bg-white transition-colors text-center"
                    >
                      <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
                      <div className="font-medium">You May Also Like</div>
                      <div className="text-sm text-gray-600 mt-1">Add to recommendation list</div>
                    </button>
                    <button
                      onClick={() => onAddToRecommendations(item, 'othersAlsoBought')}
                      className="p-4 border border-gray-300 rounded-lg hover:bg-white transition-colors text-center"
                    >
                      <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                      <div className="font-medium">Others Also Bought</div>
                      <div className="text-sm text-gray-600 mt-1">Add to cross-sell list</div>
                    </button>
                  </div>
                </div>

                {/* Product Actions */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Product Management
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      onClick={() => onMoveToSale(item)}
                      className="p-4 border border-gray-300 rounded-lg hover:bg-white transition-colors text-left flex items-center gap-3"
                    >
                      <Tag className="w-6 h-6 text-green-500" />
                      <div>
                        <div className="font-medium">Move to Sale</div>
                        <div className="text-sm text-gray-600">Apply discount and move to sale section</div>
                      </div>
                    </button>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => onKeepCopyAndMove(item)}
                        className="p-4 border border-gray-300 rounded-lg hover:bg-white transition-colors text-center"
                      >
                        <Copy className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                        <div className="font-medium">Keep Copy & Move</div>
                        <div className="text-sm text-gray-600 mt-1">Duplicate before moving</div>
                      </button>
                      <button
                        onClick={() => onMoveToEyx(item)}
                        className="p-4 border border-gray-300 rounded-lg hover:bg-white transition-colors text-center"
                      >
                        <ExternalLink className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                        <div className="font-medium">Move to EYX</div>
                        <div className="text-sm text-gray-600 mt-1">Transfer to EYX platform</div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                  <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Danger Zone
                  </h3>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                        onDelete(item);
                        setShowActionPanel(false);
                      }
                    }}
                    className="w-full p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Product Permanently
                  </button>
                </div>
              </div>
            </div>
          </div>, 
          document.body
        )}
      </div>
    </div>
  );
};

// Table row component for list view
const ItemRow = ({ 
  item, 
  onEdit, 
  onDelete, 
  onView, 
  onToggleStatus, 
  onStatusChange,
  onAddToRecommendations,
  onMoveToSale,
  onKeepCopyAndMove,
  onMoveToEyx
}) => {
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const primaryImage = item.images?.[0]?.url || item.imageUrl || '/placeholder-image.jpg';

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
    { value: 'published', label: 'Live/Published', color: 'bg-green-100 text-green-800' }
  ];

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Image & Basic Info */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <img 
            src={primaryImage} 
            alt={item.productName || item.name}
            className="w-12 h-12 object-cover rounded-lg bg-gray-100"
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
          <div>
            <p className="font-medium text-gray-900 line-clamp-1">
              {item.productName || item.name}
            </p>
            <p className="text-sm text-gray-500">SKU: {item.productId}</p>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-6 py-4 text-sm text-gray-900">
        <div>
          <p>{item.categoryId?.name || 'Uncategorized'}</p>
          <p className="text-gray-500">{item.subCategoryId?.name || 'No subcategory'}</p>
        </div>
      </td>

      {/* Price */}
      <td className="px-6 py-4">
        <PriceDisplay 
          sizes={item.sizes}
          platformPricing={item.platformPricing}
          price={item.price}
          salePrice={item.salePrice}
          discountPrice={item.discountPrice}
        />
      </td>

      {/* Stock */}
      <td className="px-6 py-4">
        <DetailedStockDisplay 
          sizes={item.sizes}
          variants={item.variants}
          stockSizeOption={item.stockSizeOption}
        />
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(item.status)} hover:shadow-md transition-shadow`}
          >
            {item.status || 'draft'} ▼
          </button>
          
          {/* Status dropdown */}
          {showStatusMenu && (
            <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-md shadow-lg z-20 mt-1 min-w-32">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    onStatusChange(item, option.value);
                    setShowStatusMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                    (item.status || 'draft') === option.value ? 'bg-blue-50' : ''
                  }`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${option.color.split(' ')[0]}`}></span>
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>

      {/* Created Date */}
      <td className="px-6 py-4 text-sm text-gray-500">
        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <div className="relative">
          <button
            onClick={() => onView(item)}
            className="p-1 hover:bg-gray-100 rounded transition-colors mr-1"
            title="View Details"
          >
            <Eye className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-1 hover:bg-gray-100 rounded transition-colors mr-1"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => setShowActionPanel(true)}
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            title="More Actions"
          >
            <MoreVertical className="w-4 h-4 text-blue-600" />
          </button>
          
          {showActionPanel && ReactDOM.createPortal(
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 10000 }}>
              {/* Left Side - Product Info (1/3 width) */}
              <div className="w-1/3 bg-white p-6 overflow-y-auto border-r border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
                  <button
                    onClick={() => setShowActionPanel(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                {/* Product Image */}
                <div className="mb-6">
                  <img 
                    src={primaryImage} 
                    alt={item.productName || item.name}
                    className="w-full h-64 object-cover rounded-lg bg-gray-100"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {item.productName || item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      SKU: {item.productId}
                    </p>
                    {item.brand && (
                      <p className="text-sm text-gray-600">
                        Brand: {item.brand}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Category</h4>
                    <p className="text-sm text-gray-600">
                      {item.categoryId?.name || 'Uncategorized'} → {item.subCategoryId?.name || 'No subcategory'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Price</h4>
                    <PriceDisplay 
                      sizes={item.sizes}
                      platformPricing={item.platformPricing}
                      price={item.price}
                      salePrice={item.salePrice}
                      discountPrice={item.discountPrice}
                    />
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Stock Status</h4>
                    <DetailedStockDisplay 
                      sizes={item.sizes}
                      variants={item.variants}
                      stockSizeOption={item.stockSizeOption}
                    />
                  </div>
                </div>
              </div>

              {/* Right Side - Actions (2/3 width) */}
              <div className="flex-1 bg-white p-6 overflow-y-auto">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Actions & Settings</h2>
                
                <div className="space-y-8">
                  {/* Status Management */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Status Management
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {statusOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => {
                            onStatusChange(item, option.value);
                          }}
                          className={`p-4 rounded-lg border-2 transition-all text-center ${
                            (item.status || 'draft') === option.value 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`inline-block w-3 h-3 rounded-full mb-2 ${option.color.split(' ')[0]}`}></div>
                          <div className="font-medium">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations Management */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Recommendation Settings
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => onAddToRecommendations(item, 'youMayAlsoLike')}
                        className="p-4 border border-gray-300 rounded-lg hover:bg-white transition-colors text-center"
                      >
                        <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
                        <div className="font-medium">You May Also Like</div>
                        <div className="text-sm text-gray-600 mt-1">Add to recommendation list</div>
                      </button>
                      <button
                        onClick={() => onAddToRecommendations(item, 'othersAlsoBought')}
                        className="p-4 border border-gray-300 rounded-lg hover:bg-white transition-colors text-center"
                      >
                        <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                        <div className="font-medium">Others Also Bought</div>
                        <div className="text-sm text-gray-600 mt-1">Add to cross-sell list</div>
                      </button>
                    </div>
                  </div>

                  {/* Product Actions */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Product Management
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <button
                        onClick={() => onMoveToSale(item)}
                        className="p-4 border border-gray-300 rounded-lg hover:bg-white transition-colors text-left flex items-center gap-3"
                      >
                        <Tag className="w-6 h-6 text-green-500" />
                        <div>
                          <div className="font-medium">Move to Sale</div>
                          <div className="text-sm text-gray-600">Apply discount and move to sale section</div>
                        </div>
                      </button>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => onKeepCopyAndMove(item)}
                          className="p-4 border border-gray-300 rounded-lg hover:bg-white transition-colors text-center"
                        >
                          <Copy className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                          <div className="font-medium">Keep Copy & Move</div>
                          <div className="text-sm text-gray-600 mt-1">Duplicate before moving</div>
                        </button>
                        <button
                          onClick={() => onMoveToEyx(item)}
                          className="p-4 border border-gray-300 rounded-lg hover:bg-white transition-colors text-center"
                        >
                          <ExternalLink className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                          <div className="font-medium">Move to EYX</div>
                          <div className="text-sm text-gray-600 mt-1">Transfer to EYX platform</div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                    <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Danger Zone
                    </h3>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                          onDelete(item);
                          setShowActionPanel(false);
                        }
                      }}
                      className="w-full p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete Product Permanently
                    </button>
                  </div>
                </div>
              </div>
            </div>, 
            document.body
          )}
        </div>
      </td>
    </tr>
  );
};

const ItemManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const products = useSelector(selectProductsItems);
  const loading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);
  const categories = useSelector(selectCategories);
  const subCategories = useSelector(selectSubCategories);

  // Local state
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list' - Default to table view
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Load initial data
  useEffect(() => {
    dispatch(fetchProducts({ page: currentPage, limit: itemsPerPage }));
    dispatch(fetchCategories());
    dispatch(fetchSubCategories());
  }, [dispatch, currentPage, itemsPerPage]);

  // Filter and search logic
  const filteredProducts = useMemo(() => {
    let filtered = [...(products || [])];
    
    console.log('🔍 Filtering products - initial:', {
      products: products,
      productsLength: products?.length || 0,
      firstProduct: products?.[0] || null
    });

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        (item.productName || item.name || '').toLowerCase().includes(search) ||
        (item.productId || '').toLowerCase().includes(search) ||
        (item.brand || '').toLowerCase().includes(search) ||
        (item.description || '').toLowerCase().includes(search)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(item => item.categoryId?._id === selectedCategory || item.categoryId === selectedCategory);
    }

    // SubCategory filter
    if (selectedSubCategory) {
      filtered = filtered.filter(item => item.subCategoryId?._id === selectedSubCategory || item.subCategoryId === selectedSubCategory);
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(item => (item.status || 'draft') === selectedStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortBy === 'price') {
        aValue = a.price || a.platformPricing?.yoraa?.price || 0;
        bValue = b.price || b.platformPricing?.yoraa?.price || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, selectedSubCategory, selectedStatus, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleRefresh = useCallback(() => {
    dispatch(fetchProducts({ page: currentPage, limit: itemsPerPage }));
  }, [dispatch, currentPage, itemsPerPage]);

  const handleCreateNew = useCallback(() => {
    navigate('/upload-product');
  }, [navigate]);

  const handleEdit = useCallback((item) => {
    navigate(`/item-management/edit/${item._id}`);
  }, [navigate]);

  const handleView = useCallback((item) => {
    navigate(`/admin/products/view/${item._id}`);
  }, [navigate]);

  const handleDelete = useCallback((item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (itemToDelete) {
      try {
        await dispatch(deleteProduct(itemToDelete._id)).unwrap();
        handleRefresh();
        setShowDeleteModal(false);
        setItemToDelete(null);
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    }
  }, [dispatch, itemToDelete, handleRefresh]);

  const handleToggleStatus = useCallback(async (item) => {
    // Cycle through statuses: draft → scheduled → published → draft
    let newStatus;
    switch (item.status) {
      case 'draft':
        newStatus = 'scheduled';
        break;
      case 'scheduled':
        newStatus = 'published';
        break;
      case 'published':
        newStatus = 'draft';
        break;
      default:
        newStatus = 'draft';
    }

    try {
      // If changing to scheduled, prompt for date/time
      if (newStatus === 'scheduled') {
        const scheduledDate = prompt('Enter scheduled date (YYYY-MM-DD):');
        const scheduledTime = prompt('Enter scheduled time (HH:MM):');
        
        if (!scheduledDate || !scheduledTime) {
          alert('Scheduled date and time are required');
          return;
        }

        await dispatch(updateProduct({ 
          id: item._id, 
          data: { 
            ...item, 
            status: newStatus,
            scheduledDate,
            scheduledTime,
            publishAt: new Date(`${scheduledDate}T${scheduledTime}:00.000Z`)
          } 
        })).unwrap();
      } else {
        await dispatch(updateProduct({ 
          id: item._id, 
          data: { 
            ...item, 
            status: newStatus,
            ...(newStatus === 'published' && { publishedAt: new Date() })
          } 
        })).unwrap();
      }
      
      handleRefresh();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update product status. Please try again.');
    }
  }, [dispatch, handleRefresh]);

  // New function for direct status change using flow-based API
  const handleStatusChange = useCallback(async (item, newStatus) => {
    try {
      const statusData = { status: newStatus };
      
      if (newStatus === 'scheduled') {
        const scheduledDate = prompt('Enter scheduled date (YYYY-MM-DD):');
        const scheduledTime = prompt('Enter scheduled time (HH:MM):');
        
        if (!scheduledDate || !scheduledTime) {
          alert('Scheduled date and time are required');
          return;
        }
        
        statusData.scheduledDate = scheduledDate;
        statusData.scheduledTime = scheduledTime;
        statusData.publishAt = new Date(`${scheduledDate}T${scheduledTime}:00.000Z`);
      } else if (newStatus === 'published') {
        statusData.publishedAt = new Date();
      }

      await dispatch(updateProductStatus({ 
        productId: item._id, 
        statusData 
      })).unwrap();
      
      handleRefresh();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update product status. Please try again.');
    }
  }, [dispatch, handleRefresh]);

  // New handler functions for the dropdown options
  const handleAddToRecommendations = useCallback((item, type) => {
    console.log(`Adding ${item.productName} to ${type}`);
    // TODO: Implement API call to add item to recommendation lists
    alert(`Adding "${item.productName}" to ${type === 'youMayAlsoLike' ? 'You may also like' : 'Others also bought'} list`);
  }, []);

  const handleMoveToSale = useCallback((item) => {
    console.log(`Moving ${item.productName} to sale`);
    // TODO: Implement API call to move item to sale category
    alert(`Moving "${item.productName}" to sale section`);
  }, []);

  const handleKeepCopyAndMove = useCallback((item) => {
    console.log(`Keep copy and move ${item.productName}`);
    // TODO: Implement API call to duplicate item and move original
    alert(`Creating a copy of "${item.productName}" and moving original`);
  }, []);

  const handleMoveToEyx = useCallback((item) => {
    console.log(`Moving ${item.productName} to EYX`);
    // TODO: Implement API call to move item to EYX platform
    alert(`Moving "${item.productName}" to EYX platform`);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedStatus('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredProducts.length;
    const published = filteredProducts.filter(item => item.status === 'published').length;
    const draft = filteredProducts.filter(item => item.status === 'draft' || !item.status).length;
    const scheduled = filteredProducts.filter(item => item.status === 'scheduled').length;
    const outOfStock = filteredProducts.filter(item => {
      const stock = item.sizes?.reduce((sum, size) => sum + (size.quantity || size.stock || 0), 0) || 0;
      return stock === 0;
    }).length;

    return { total, published, draft, scheduled, outOfStock };
  }, [filteredProducts]);

  if (loading && !products?.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 mt-1">Manage your product inventory</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => navigate('/item-management-bulk-upload')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Upload className="w-5 h-5" />
                Bulk Upload
              </button>
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Live/Published</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Draft</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.outOfStock}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products, SKU, brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories?.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SubCategory Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SubCategory</label>
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All SubCategories</option>
                    {subCategories?.map(subCategory => (
                      <option key={subCategory._id} value={subCategory._id}>
                        {subCategory.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Live/Published</option>
                  </select>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="createdAt">Created Date</option>
                      <option value="updatedAt">Updated Date</option>
                      <option value="productName">Name</option>
                      <option value="price">Price</option>
                      <option value="status">Status</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing {filteredProducts.length} of {products?.length || 0} products
                </p>
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {filteredProducts.length === 0 && !loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory || selectedSubCategory || selectedStatus
                ? 'Try adjusting your filters or search terms'
                : 'Get started by creating your first product'
              }
            </p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {paginatedProducts.map((item) => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    onToggleStatus={handleToggleStatus}
                    onStatusChange={handleStatusChange}
                    onAddToRecommendations={handleAddToRecommendations}
                    onMoveToSale={handleMoveToSale}
                    onKeepCopyAndMove={handleKeepCopyAndMove}
                    onMoveToEyx={handleMoveToEyx}
                  />
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedProducts.map((item) => (
                        <ItemRow
                          key={item._id}
                          item={item}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onView={handleView}
                          onToggleStatus={handleToggleStatus}
                          onStatusChange={handleStatusChange}
                          onAddToRecommendations={handleAddToRecommendations}
                          onMoveToSale={handleMoveToSale}
                          onKeepCopyAndMove={handleKeepCopyAndMove}
                          onMoveToEyx={handleMoveToEyx}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={12}>12 per page</option>
                    <option value={24}>24 per page</option>
                    <option value={48}>48 per page</option>
                    <option value={96}>96 per page</option>
                  </select>
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} results
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Product"
          message={`Are you sure you want to delete "${itemToDelete?.productName || itemToDelete?.name}"? This action cannot be undone.`}
        />

      </div>
    </div>
  );
};

export default ItemManagement;
