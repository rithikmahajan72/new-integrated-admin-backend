import React, { useState } from 'react';
import TwoFactorAuth from './TwoFactorAuth';

const TwoFactorDemo = () => {
  const [showModal, setShowModal] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const handleSubmit = (data) => {
    console.log('Two-Factor Auth Data:', data);
    setSubmittedData(data);
    setShowModal(false);
    
    // Show success message
    alert(`Authentication submitted!\nVerification Code: ${data.verificationCode}\nEmail Password: ${data.emailPassword}\nDefault Password: ${data.defaultPassword}`);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const openModal = () => {
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-montserrat font-bold text-gray-900 mb-4">
            Two-Factor Authentication Demo
          </h1>
          <p className="text-gray-600 font-montserrat text-lg">
            Based on Figma design - Secure authentication with verification codes
          </p>
        </div>

        {/* Demo Controls */}
        <div className="text-center">
          <button
            onClick={openModal}
            className="bg-black hover:bg-gray-800 text-white font-montserrat font-bold px-8 py-4 rounded-[26.5px] text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Show Two-Factor Authentication
          </button>
        </div>

        {/* Feature Showcase */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Features List */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-montserrat font-semibold text-gray-800 mb-6">
              🔐 Security Features
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-gray-700">4-Digit Verification Code</h3>
                  <p className="text-gray-600 text-sm">Phone number verification with auto-focus navigation</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-gray-700">Email Verification</h3>
                  <p className="text-gray-600 text-sm">Secondary verification via email with password input</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-gray-700">Default Password</h3>
                  <p className="text-gray-600 text-sm">Additional security layer with default password</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-gray-700">Password Visibility Toggle</h3>
                  <p className="text-gray-600 text-sm">Show/hide password functionality with eye icons</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-gray-700">Form Validation</h3>
                  <p className="text-gray-600 text-sm">Real-time validation with disabled submit until complete</p>
                </div>
              </div>
            </div>
          </div>

          {/* UI Elements */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-montserrat font-semibold text-gray-800 mb-6">
              🎨 Design Elements
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-800 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-gray-700">Montserrat Typography</h3>
                  <p className="text-gray-600 text-sm">Bold headers with proper font weights and spacing</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-800 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-gray-700">Circular Code Inputs</h3>
                  <p className="text-gray-600 text-sm">Custom styled circular inputs for verification codes</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-800 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-gray-700">Underlined Input Fields</h3>
                  <p className="text-gray-600 text-sm">Clean underlined inputs matching Figma design</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-800 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-gray-700">Modal Overlay</h3>
                  <p className="text-gray-600 text-sm">Centered modal with shadow and backdrop blur</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-800 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-gray-700">Responsive Design</h3>
                  <p className="text-gray-600 text-sm">Mobile-first responsive layout with proper spacing</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Example */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-montserrat font-semibold text-gray-800 mb-6">
            💻 Usage Example
          </h2>
          
          <div className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-800">
{`import TwoFactorAuth from './components/TwoFactorAuth';

const App = () => {
  const [showAuth, setShowAuth] = useState(false);

  const handleSubmit = (data) => {
    console.log('Auth Data:', data);
    // Handle authentication logic
  };

  return (
    <>
      <button onClick={() => setShowAuth(true)}>
        Show Authentication
      </button>
      
      {showAuth && (
        <TwoFactorAuth
          onSubmit={handleSubmit}
          onClose={() => setShowAuth(false)}
          phoneNumber="your phone number"
          emailAddress="your email address"
        />
      )}
    </>
  );
};`}
            </pre>
          </div>
        </div>

        {/* Props Documentation */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-montserrat font-semibold text-gray-800 mb-6">
            📚 Component Props
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Prop</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Default</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-mono text-blue-600">onSubmit</td>
                  <td className="py-3 px-4">function</td>
                  <td className="py-3 px-4">Callback when form is submitted with valid data</td>
                  <td className="py-3 px-4 text-gray-500">-</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-mono text-blue-600">onClose</td>
                  <td className="py-3 px-4">function</td>
                  <td className="py-3 px-4">Callback when modal is closed</td>
                  <td className="py-3 px-4 text-gray-500">-</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-mono text-blue-600">phoneNumber</td>
                  <td className="py-3 px-4">string</td>
                  <td className="py-3 px-4">Phone number to display in instructions</td>
                  <td className="py-3 px-4">"your phone number"</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-blue-600">emailAddress</td>
                  <td className="py-3 px-4">string</td>
                  <td className="py-3 px-4">Email address to display in instructions</td>
                  <td className="py-3 px-4">"your email address"</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Last Submitted Data */}
        {submittedData && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              ✅ Last Submitted Data
            </h3>
            <div className="bg-white rounded-lg p-4 text-sm">
              <pre className="text-green-700">
                {JSON.stringify(submittedData, null, 2)}
              </pre>
            </div>
          </div>
        )}

      </div>

      {/* Two-Factor Auth Modal */}
      {showModal && (
        <TwoFactorAuth
          onSubmit={handleSubmit}
          onClose={handleClose}
          phoneNumber="+1 (555) 123-4567"
          emailAddress="user@example.com"
        />
      )}
    </div>
  );
};

export default TwoFactorDemo;
