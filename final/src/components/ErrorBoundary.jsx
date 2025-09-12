import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <h2 className="text-xl font-bold mb-4">Something went wrong!</h2>
              <details className="whitespace-pre-wrap">
                <summary className="cursor-pointer font-semibold">Error Details</summary>
                <div className="mt-4 p-4 bg-red-50 rounded">
                  <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
                  <p><strong>Component Stack:</strong> {this.state.errorInfo.componentStack}</p>
                </div>
              </details>
              <button 
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
