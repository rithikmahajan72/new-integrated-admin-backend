import React, { useState, useMemo, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { useResponsive } from '../hooks/useResponsive';
import { getTailwindClasses } from '../constants/styleUtils';

// Move static data and functions outside component to prevent recreation
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Wireless Headphones',
    category: 'Electronics',
    price: 299.99,
    stock: 45,
    status: 'Active',
    image: 'WH',
    created: '2024-01-15'
  },
  {
    id: 2,
    name: 'Running Shoes',
    category: 'Sports',
    price: 129.99,
    stock: 23,
    status: 'Active',
    image: 'RS',
    created: '2024-02-10'
  },
  {
    id: 3,
    name: 'Coffee Maker',
    category: 'Kitchen',
    price: 89.99,
    stock: 0,
    status: 'Out of Stock',
    image: 'CM',
    created: '2024-03-05'
  },
  {
    id: 4,
    name: 'Smartphone Case',
    category: 'Electronics',
    price: 24.99,
    stock: 156,
    status: 'Active',
    image: 'SC',
    created: '2024-01-20'
  },
  {
    id: 5,
    name: 'Yoga Mat',
    category: 'Sports',
    price: 39.99,
    stock: 78,
    status: 'Active',
    image: 'YM',
    created: '2024-02-28'
  }
];

// Memoized status color mapping
const STATUS_COLORS = {
  'Active': 'bg-green-100 text-green-800',
  'Out of Stock': 'bg-red-100 text-red-800',
  'Inactive': 'bg-gray-100 text-gray-800'
};

const getStatusColor = (status) => STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';

const getStockColor = (stock) => {
  if (stock === 0) return 'text-red-600';
  if (stock < 20) return 'text-yellow-600';
  return 'text-green-600';
};

const Products = () => {
  const responsive = useResponsive();
  const [products] = useState(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');

  // Memoize filtered products to prevent recalculation on every render
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowerSearchTerm) ||
      product.category.toLowerCase().includes(lowerSearchTerm)
    );
  }, [products, searchTerm]);

  // Memoize statistics calculations
  const stats = useMemo(() => ({
    total: products.length,
    active: products.filter(p => p.status === 'Active').length,
    outOfStock: products.filter(p => p.stock === 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock < 20).length
  }), [products]);

  // Use useCallback for event handlers to prevent child re-renders
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Memoized table row component
  const TableRow = React.memo(({ product }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 font-bold text-xs sm:text-sm">
            {product.image}
          </div>
          <div className="ml-3 sm:ml-4">
            <div className="text-sm font-medium text-gray-900">{product.name}</div>
            <div className="text-xs sm:text-sm text-gray-500">Created: {product.created}</div>
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{product.category}</div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">${product.price}</div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className={`text-sm font-medium ${getStockColor(product.stock)}`}>
          {product.stock} units
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
          {product.status}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="flex space-x-1 sm:space-x-2">
          <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
            <Eye size={16} />
          </button>
          <button className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50">
            <Edit size={16} />
          </button>
          <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  ));

  // Memoized card component
  const ProductCard = React.memo(({ product }) => (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 font-bold flex-shrink-0">
          {product.image}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{product.category}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm font-medium text-gray-900">${product.price}</span>
                <span className={`text-xs font-medium ${getStockColor(product.stock)}`}>
                  {product.stock} units
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                  {product.status}
                </span>
              </div>
            </div>
            <div className="flex space-x-1">
              <button className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50">
                <Eye size={16} />
              </button>
              <button className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50">
                <Edit size={16} />
              </button>
              <button className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ));

  return (
  <div className={`${getTailwindClasses.spacing.container} mt-14 space-y-4 sm:space-y-6`}>
      {/* Page header */}
      <div className={`${getTailwindClasses.flex.responsive}`}>
        <div>
          <h1 className={getTailwindClasses.heading.h1}>Products</h1>
          <p className={`${getTailwindClasses.text.body} text-gray-600 mt-3`}>Manage your product inventory</p>
        </div>
        <button className={`${getTailwindClasses.button.primary} flex items-center space-x-2`}>
          <Plus size={responsive.isMobile ? 16 : 20} />
          {!responsive.isMobile && <span>Add Product</span>}
        </button>
      </div>

      {/* Stats cards */}
      <div className={`${getTailwindClasses.grid.responsive4} ${getTailwindClasses.grid.gap}`}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className={`${getTailwindClasses.text.small} font-medium text-gray-500`}>Total Products</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className={`${getTailwindClasses.text.small} font-medium text-gray-500`}>Active Products</h3>
          <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className={`${getTailwindClasses.text.small} font-medium text-gray-500`}>Out of Stock</h3>
          <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">{stats.outOfStock}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className={`${getTailwindClasses.text.small} font-medium text-gray-500`}>Low Stock</h3>
          <p className="text-xl sm:text-2xl font-bold text-yellow-600 mt-1">{stats.lowStock}</p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className={`${getTailwindClasses.flex.responsiveRow} gap-3 sm:gap-4`}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={responsive.isMobile ? 16 : 20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={`pl-8 sm:pl-10 w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
          </div>
          {!responsive.isMobile && (
            <>
              <select className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="sports">Sports</option>
                <option value="kitchen">Kitchen</option>
              </select>
              <select className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
              <button className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 flex items-center space-x-2 hover:bg-gray-50 text-sm sm:text-base">
                <Filter size={responsive.isMobile ? 16 : 20} />
                <span>More Filters</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Products table/cards */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {responsive.isDesktop ? (
          // Desktop table view
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} product={product} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Mobile/Tablet card view
          <div className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg">
        <div className={`${getTailwindClasses.flex.responsive} text-sm`}>
          <div className="text-gray-700 mb-2 sm:mb-0">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredProducts.length}</span> of{' '}
            <span className="font-medium">{products.length}</span> results
          </div>
          <div className="flex space-x-1 sm:space-x-2">
            <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50">
              Previous
            </button>
            <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-600 text-white rounded-md">
              1
            </button>
            <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50">
              2
            </button>
            <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
