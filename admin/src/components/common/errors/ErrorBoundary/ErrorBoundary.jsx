import { Component } from 'react';
import styles from './ErrorBoundary.module.css';

/**
 * ErrorBoundary — class-based error boundary that catches render errors in
 * its subtree and shows a fallback instead of unmounting the whole app.
 *
 * @param {Object} props
 * @param {React.ReactNode} children - The subtree to protect.
 * @param {React.ReactNode} [fallback] - Custom fallback UI.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.wrapper} role="alert">
          <span className={styles.icon} aria-hidden="true">
            ⚠️
          </span>
          <h2 className={styles.title}>Something went wrong</h2>
          <p className={styles.message}>
            An unexpected error occurred while rendering this page. Try
            reloading the page.
          </p>
          <button
            type="button"
            className={styles.reload}
            onClick={this.handleReset}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
