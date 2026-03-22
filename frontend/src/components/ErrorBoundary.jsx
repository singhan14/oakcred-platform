import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('OakCred Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-error-bg flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-error text-4xl">error</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-text mb-2">Something went wrong</h1>
            <p className="text-text-muted mb-6">We encountered an unexpected error. Please try refreshing the page.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => window.location.reload()}
                className="bg-primary text-white px-5 py-2.5 rounded-lg font-heading font-semibold text-sm hover:bg-primary-dark transition-colors">
                Refresh Page
              </button>
              <button onClick={() => { this.setState({ hasError: false }); window.location.href = '/dashboard'; }}
                className="border border-border text-text px-5 py-2.5 rounded-lg font-heading font-semibold text-sm hover:bg-surface transition-colors">
                Go to Dashboard
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left bg-surface rounded-lg p-4 border border-border">
                <summary className="text-sm font-mono text-error cursor-pointer">Error details</summary>
                <pre className="text-xs text-text-muted mt-2 overflow-auto">{this.state.error.toString()}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
