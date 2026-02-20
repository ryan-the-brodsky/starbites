import React from 'react';

class LevelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Level Error Boundary caught:', error, errorInfo);
    console.error('Error message:', error?.message);
    console.error('Component stack:', errorInfo?.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="text-center max-w-md mx-auto bg-slate-800/50 rounded-xl p-8 border border-red-500/50">
            <div className="text-5xl mb-4">&#x1F6F8;</div>
            <h2 className="text-xl font-bold text-red-400 mb-2">Houston, We Have a Problem</h2>
            <p className="text-slate-400 text-sm mb-4">
              Something went wrong loading this level. Your progress has been saved.
            </p>
            {this.state.error?.message && (
              <p className="text-slate-500 text-xs mb-4 font-mono bg-slate-900/50 p-2 rounded break-all">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleRetry}
              className="bg-cyan-600 hover:bg-cyan-500 px-6 py-2 rounded-lg font-medium text-white transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LevelErrorBoundary;
