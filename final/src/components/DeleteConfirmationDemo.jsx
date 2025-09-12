import React, { useState } from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const DeleteConfirmationDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletedItems, setDeletedItems] = useState([]);
  
  const sampleItems = [
    { 
      id: 1, 
      name: "User Account - john@example.com", 
      type: "account",
      message: "This will permanently remove the user's account and all associated data.",
      icon: "👤"
    },
    { 
      id: 2, 
      name: "Product - iPhone 14 Pro", 
      type: "product",
      message: "This product will be removed from your inventory and cannot be recovered.",
      icon: "📱"
    },
    { 
      id: 3, 
      name: "Order #12345", 
      type: "order",
      message: "This order will be permanently deleted from the system.",
      icon: "📋"
    },
    { 
      id: 4, 
      name: "Comment - 'Great service!'", 
      type: "comment",
      message: "This comment will be removed from the public display.",
      isDangerous: false,
      icon: "💬"
    },
    { 
      id: 5, 
      name: "File - project_document.pdf", 
      type: "file",
      message: "This file will be permanently deleted and cannot be recovered.",
      icon: "📄"
    }
  ];

  const [currentItem, setCurrentItem] = useState(null);

  const handleDeleteClick = (item) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (currentItem) {
      setDeletedItems(prev => [...prev, currentItem.id]);
      setIsModalOpen(false);
      setCurrentItem(null);
    }
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleResetDemo = () => {
    setDeletedItems([]);
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-montserrat mb-4">
            Delete Confirmation Modal Demo
          </h1>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            A beautiful, accessible, and feature-rich delete confirmation modal with animations, 
            keyboard navigation, and customizable styling. Click on any item below to see it in action!
          </p>
          
          {/* Features Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="font-semibold text-gray-800 mb-1">Beautiful Design</h3>
              <p className="text-sm text-gray-600">Smooth animations and modern styling</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl mb-2">⌨️</div>
              <h3 className="font-semibold text-gray-800 mb-1">Keyboard Support</h3>
              <p className="text-sm text-gray-600">ESC key to close, focus management</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-gray-800 mb-1">Customizable</h3>
              <p className="text-sm text-gray-600">Different styles for different actions</p>
            </div>
          </div>
          
          {deletedItems.length > 0 && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              <p className="font-semibold">
                {deletedItems.length} item(s) have been deleted successfully!
              </p>
              <button 
                onClick={handleResetDemo}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 transition-colors"
              >
                Reset Demo
              </button>
            </div>
          )}
        </div>

        {/* Sample Items List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-100 border-b">
            <h2 className="text-xl font-semibold text-gray-800 font-montserrat">
              Sample Items to Delete
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {sampleItems.map((item) => {
              const isDeleted = deletedItems.includes(item.id);
              
              return (
                <div 
                  key={item.id} 
                  className={`px-6 py-4 flex items-center justify-between transition-all ${
                    isDeleted ? 'bg-red-50 opacity-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="text-2xl mr-4">{item.icon}</div>
                    <div>
                      <span className={`font-medium block ${
                        isDeleted ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                        {item.name}
                      </span>
                      <span className="text-sm text-gray-500 capitalize">
                        {item.type} • {item.isDangerous === false ? 'Safe action' : 'Dangerous action'}
                      </span>
                    </div>
                  </div>
                  
                  {!isDeleted && (
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                  
                  {isDeleted && (
                    <span className="text-red-500 font-semibold">Deleted</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Usage Example */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 font-montserrat mb-4">
            Usage Example
          </h2>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import DeleteConfirmationModal from './components/DeleteConfirmationModal';

const MyComponent = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Delete Item
      </button>
      
      <DeleteConfirmationModal
        isOpen={showModal}
        onConfirm={() => {
          // Handle delete action
          console.log('Item deleted');
          setShowModal(false);
        }}
        onCancel={() => setShowModal(false)}
        title="are you sure you want to delete this"
        confirmText="Yes"
        cancelText="Cancel"
      />
    </>
  );
};`}
          </pre>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title={currentItem ? `Are you sure you want to delete this ${currentItem.type}?` : "Are you sure?"}
        message={currentItem?.message}
        itemName={currentItem?.name}
        isDangerous={currentItem?.isDangerous !== false}
        confirmText={currentItem?.isDangerous === false ? "Remove" : "Delete"}
        cancelText="Cancel"
      />
    </div>
  );
};

export default DeleteConfirmationDemo;
