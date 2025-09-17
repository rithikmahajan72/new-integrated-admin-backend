import React from 'react';
import ProductManagement from '../components/ProductManagement';

const ProductManagementPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <ProductManagement />
      </div>
    </div>
  );
};

export default ProductManagementPage;
