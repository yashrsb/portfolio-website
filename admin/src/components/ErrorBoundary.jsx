import { Component } from 'react';

/**
 * ErrorBoundary — catches rendering errors in the component tree below it and
 * shows a readable fallback instead of a blank page.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message || 'Something went wrong.' };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging.
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '2rem',
            textAlign: 'center',
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Something went wrong</h1>
          <p style={{ color: '#666', margin: 0 }}>{this.state.message}</p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
