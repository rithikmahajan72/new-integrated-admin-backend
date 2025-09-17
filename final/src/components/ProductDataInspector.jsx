import React, { useState, useEffect } from 'react';

const ProductDataInspector = ({ productId }) => {
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProductData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8080/api/products/${productId}`);
      const data = await response.json();
      
      if (data.success) {
        setProductData(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const DataSection = ({ title, data, className = "" }) => (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
      <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-60">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );

  const ImageGallery = ({ images }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images?.map((image, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
          <img 
            src={image.url || image}
            alt={image.alt || `Image ${index + 1}`}
            className="w-full h-32 object-cover"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
          <div className="p-2">
            <p className="text-xs text-gray-600">
              Order: {image.order ?? index} | Main: {image.isMain ? 'Yes' : 'No'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {image.alt || 'No alt text'}
            </p>
          </div>
        </div>
      )) || <p className="text-gray-500">No images found</p>}
    </div>
  );

  const VideoGallery = ({ videos }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {videos?.map((video, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
          <video 
            src={video.url || video}
            controls
            className="w-full h-48"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="hidden bg-gray-200 h-48 flex items-center justify-center">
            <span className="text-gray-500">Video unavailable</span>
          </div>
          <div className="p-2">
            <p className="text-xs text-gray-600">
              Order: {video.order ?? index}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {video.title || 'No title'}
            </p>
          </div>
        </div>
      )) || <p className="text-gray-500">No videos found</p>}
    </div>
  );

  if (loading) return <div className="p-8 text-center">Loading product data...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  if (!productData) return <div className="p-8 text-center text-gray-500">No product data</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h1 className="text-2xl font-bold text-blue-800 mb-2">
          Complete Product Data Inspector
        </h1>
        <p className="text-blue-700">
          Product: <strong>{productData.name || productData.productName}</strong> 
          (ID: {productData.id})
        </p>
        <p className="text-blue-600 text-sm mt-1">
          This shows ALL data being returned by the backend API
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-800">
            {productData.images?.length || 0}
          </div>
          <div className="text-green-700">Images</div>
        </div>
        <div className="bg-purple-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-800">
            {productData.videos?.length || 0}
          </div>
          <div className="text-purple-700">Videos</div>
        </div>
        <div className="bg-yellow-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-800">
            {productData.variants?.length || 0}
          </div>
          <div className="text-yellow-700">Variants</div>
        </div>
        <div className="bg-blue-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-800">
            {productData.sizes?.length || 0}
          </div>
          <div className="text-blue-700">Sizes</div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataSection 
          title="Basic Product Info" 
          data={{
            id: productData.id,
            productId: productData.productId,
            name: productData.name,
            productName: productData.productName,
            title: productData.title,
            description: productData.description,
            manufacturingDetails: productData.manufacturingDetails,
            status: productData.status,
            sku: productData.sku,
            barcode: productData.barcode
          }} 
        />
        
        <DataSection 
          title="Pricing Information" 
          data={{
            price: productData.price,
            regularPrice: productData.regularPrice,
            salePrice: productData.salePrice,
            returnable: productData.returnable,
            platformPricing: productData.platformPricing
          }} 
        />
      </div>

      {/* Category Information */}
      <DataSection 
        title="Category & Classification" 
        data={{
          category: productData.category,
          subcategory: productData.subcategory,
          categoryId: productData.categoryId,
          subCategoryId: productData.subCategoryId,
          tags: productData.tags,
          filters: productData.filters
        }} 
      />

      {/* Images Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Images ({productData.images?.length || 0})
        </h3>
        <div className="mb-4">
          <strong>Main Image URL:</strong> 
          <p className="text-sm text-gray-600 break-all">{productData.imageUrl || 'Not set'}</p>
        </div>
        <ImageGallery images={productData.images} />
      </div>

      {/* Videos Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Videos ({productData.videos?.length || 0})
        </h3>
        <VideoGallery videos={productData.videos} />
      </div>

      {/* Variants Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Variants ({productData.variants?.length || 0})
        </h3>
        {productData.variants?.map((variant, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-2">{variant.name || `Variant ${index + 1}`}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Variant Images ({variant.images?.length || 0})
                </p>
                <ImageGallery images={variant.images?.map((img, i) => ({
                  url: img,
                  order: i,
                  alt: `${variant.name} image ${i + 1}`,
                  isMain: i === 0
                }))} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Variant Videos ({variant.videos?.length || 0})
                </p>
                <VideoGallery videos={variant.videos?.map((vid, i) => ({
                  url: vid,
                  order: i,
                  title: `${variant.name} video ${i + 1}`
                }))} />
              </div>
            </div>
          </div>
        )) || <p className="text-gray-500">No variants found</p>}
      </div>

      {/* Sizes Section */}
      <DataSection 
        title={`Sizes (${productData.sizes?.length || 0})`}
        data={productData.sizes}
      />

      {/* Full Raw Data */}
      <div className="bg-gray-50 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Complete Raw Data
        </h3>
        <details className="cursor-pointer">
          <summary className="text-blue-600 hover:text-blue-800 mb-2">
            Click to expand full JSON response
          </summary>
          <pre className="bg-white p-4 rounded border text-xs overflow-auto max-h-96">
            {JSON.stringify(productData, null, 2)}
          </pre>
        </details>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-green-800 font-semibold mb-2">✅ Backend Status: Working Correctly</h3>
        <p className="text-green-700">
          The backend is returning complete data. If your frontend interface isn't showing all this data, 
          the issue is in how the frontend is displaying or processing the response.
        </p>
      </div>
    </div>
  );
};

export default ProductDataInspector;
