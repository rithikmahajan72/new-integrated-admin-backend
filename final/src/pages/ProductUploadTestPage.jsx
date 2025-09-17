import React, { useState } from 'react';
import SingleProductUpload from '../components/SingleProductUpload';
import ResponseInspector from '../components/ResponseInspector';

const ProductUploadTestPage = () => {
    const [activeTab, setActiveTab] = useState('upload');

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Product Upload & Response Testing
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Test single product upload with complete response visibility using Redux & Axios
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-500">
                                API Endpoint: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:8080</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'upload'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Upload Form
                        </button>
                        <button
                            onClick={() => setActiveTab('inspector')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'inspector'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Response Inspector
                        </button>
                        <button
                            onClick={() => setActiveTab('both')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'both'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Split View
                        </button>
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {activeTab === 'upload' && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="text-blue-600 mr-3">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-blue-800 font-medium">Upload Instructions</h3>
                                    <p className="text-blue-700 text-sm mt-1">
                                        Fill out the form below and upload a product. The response details will be captured and can be viewed in the Response Inspector tab.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <SingleProductUpload />
                    </div>
                )}

                {activeTab === 'inspector' && (
                    <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="text-green-600 mr-3">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-green-800 font-medium">Response Inspector</h3>
                                    <p className="text-green-700 text-sm mt-1">
                                        View the complete response data from your last upload operation. This shows all 38+ fields, images, videos, and raw JSON data.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <ResponseInspector title="Last Upload Response" />
                    </div>
                )}

                {activeTab === 'both' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <h3 className="text-blue-800 font-medium text-sm">Upload Form</h3>
                                <p className="text-blue-700 text-xs mt-1">Create new products and see immediate results</p>
                            </div>
                            <SingleProductUpload />
                        </div>
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <h3 className="text-green-800 font-medium text-sm">Live Response Inspector</h3>
                                <p className="text-green-700 text-xs mt-1">Real-time response data visualization</p>
                            </div>
                            <ResponseInspector title="Live Response Data" />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t mt-12">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                            <span>✅ Redux State Management</span>
                            <span>✅ Axios API Integration</span>
                            <span>✅ Complete Response Capture</span>
                            <span>✅ Image/Video Display</span>
                        </div>
                        <div>
                            <span>Backend: Port 8080 | Frontend: Development Mode</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductUploadTestPage;
