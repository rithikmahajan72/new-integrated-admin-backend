import React, { useState } from 'react';
import SuccessModal from '../components/SuccessModal';
import { Save, Edit, Trash2, Upload, RefreshCw, CheckCircle } from 'lucide-react';

/**
 * SuccessModalDemo Component
 * 
 * Demonstrates the SuccessModal component with various use cases:
 * - Item saved successfully
 * - Item updated successfully  
 * - Item deleted successfully
 * - Upload completed
 * - Custom messages
 * - Auto-close functionality
 */
const SuccessModalDemo = () => {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    autoClose: false,
    buttonText: 'Done'
  });

  // Open modal with specific configuration
  const openModal = (title, autoClose = false, buttonText = 'Done') => {
    setModalConfig({
      isOpen: true,
      title,
      autoClose,
      buttonText
    });
  };

  // Close modal
  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const demoScenarios = [
    {
      icon: Save,
      title: "Save Success",
      message: "Item saved successfully!",
      color: "bg-blue-500",
      autoClose: false
    },
    {
      icon: Edit,
      title: "Update Success", 
      message: "Item updated successfully!",
      color: "bg-green-500",
      autoClose: false
    },
    {
      icon: Trash2,
      title: "Delete Success",
      message: "Item deleted successfully!",
      color: "bg-red-500",
      autoClose: false
    },
    {
      icon: Upload,
      title: "Upload Success",
      message: "File uploaded successfully!",
      color: "bg-purple-500",
      autoClose: false
    },
    {
      icon: RefreshCw,
      title: "Auto-Close Demo",
      message: "This modal will auto-close in 3 seconds!",
      color: "bg-orange-500",
      autoClose: true
    },
    {
      icon: CheckCircle,
      title: "Custom Button Text",
      message: "Settings saved successfully!",
      color: "bg-teal-500",
      buttonText: "Continue",
      autoClose: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 font-montserrat">
            Success Modal Demo
          </h1>
          <p className="text-gray-600 text-lg font-montserrat">
            Interactive demonstration of the dynamic SuccessModal component
          </p>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {demoScenarios.map((scenario, index) => {
            const IconComponent = scenario.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-200"
                onClick={() => openModal(
                  scenario.message, 
                  scenario.autoClose, 
                  scenario.buttonText || 'Done'
                )}
              >
                <div className={`w-12 h-12 ${scenario.color} rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2 font-montserrat">
                  {scenario.title}
                </h3>
                <p className="text-gray-600 text-center text-sm font-montserrat">
                  Click to show: "{scenario.message}"
                </p>
                {scenario.autoClose && (
                  <div className="mt-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full text-center font-montserrat">
                    Auto-closes in 3s
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Test Buttons */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center font-montserrat">
            Quick Test Buttons
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => openModal("Item saved successfully!")}
              className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors font-montserrat"
            >
              Test Save Success
            </button>
            <button
              onClick={() => openModal("Changes saved successfully!")}
              className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors font-montserrat"
            >
              Test Update Success
            </button>
            <button
              onClick={() => openModal("Item removed successfully!")}
              className="bg-red-600 text-white px-6 py-3 rounded-full font-medium hover:bg-red-700 transition-colors font-montserrat"
            >
              Test Delete Success
            </button>
            <button
              onClick={() => openModal("Processing complete!", true)}
              className="bg-green-600 text-white px-6 py-3 rounded-full font-medium hover:bg-green-700 transition-colors font-montserrat"
            >
              Test Auto-Close
            </button>
          </div>
        </div>

        {/* Component Features */}
        <div className="mt-12 bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center font-montserrat">
            Component Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 font-montserrat">Design Features:</h3>
              <ul className="space-y-2 text-gray-600 font-montserrat">
                <li>✅ Figma-accurate design with green checkmark</li>
                <li>✅ Consistent shadow and rounded corners</li>
                <li>✅ Montserrat fonts throughout</li>
                <li>✅ Smooth animations (fadeIn, slideUp, pulse)</li>
                <li>✅ Responsive design</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 font-montserrat">Functionality:</h3>
              <ul className="space-y-2 text-gray-600 font-montserrat">
                <li>✅ Dynamic message support</li>
                <li>✅ Custom button text</li>
                <li>✅ Auto-close option</li>
                <li>✅ ESC key to close</li>
                <li>✅ Overlay click to close</li>
                <li>✅ Prevents background scrolling</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-12 bg-gray-900 rounded-xl p-8 text-white">
          <h2 className="text-xl font-bold mb-6 text-center font-montserrat">
            Usage Examples
          </h2>
          <div className="space-y-4 text-sm font-mono">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-green-400 mb-2">// Basic usage</div>
              <div>{`<SuccessModal`}</div>
              <div>{`  isOpen={showModal}`}</div>
              <div>{`  onClose={() => setShowModal(false)}`}</div>
              <div>{`  title="Item saved successfully!"`}</div>
              <div>{`/>`}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-green-400 mb-2">// With auto-close and custom button</div>
              <div>{`<SuccessModal`}</div>
              <div>{`  isOpen={showModal}`}</div>
              <div>{`  onClose={() => setShowModal(false)}`}</div>
              <div>{`  title="Settings updated successfully!"`}</div>
              <div>{`  autoClose={true}`}</div>
              <div>{`  buttonText="Continue"`}</div>
              <div>{`/>`}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        autoClose={modalConfig.autoClose}
        buttonText={modalConfig.buttonText}
      />
    </div>
  );
};

export default SuccessModalDemo;
