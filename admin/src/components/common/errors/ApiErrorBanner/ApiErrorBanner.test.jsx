import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ApiErrorBanner from './ApiErrorBanner';

describe('ApiErrorBanner', () => {
  it('renders nothing when error is null', () => {
    const { container } = render(<ApiErrorBanner error={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows "Network error" title for network errors', () => {
    const error = {
      message: 'Unable to reach the server.',
      isNetworkError: true,
      isAuthError: false,
      fieldErrors: [],
    };
    render(<ApiErrorBanner error={error} />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(
      screen.getByText('Unable to reach the server.'),
    ).toBeInTheDocument();
  });

  it('shows "Conflict" title for HTTP 409 and the server message', () => {
    const error = {
      message: 'A record with this slug already exists.',
      status: 409,
      isNetworkError: false,
      isAuthError: false,
      fieldErrors: [],
    };
    render(<ApiErrorBanner error={error} />);
    expect(screen.getByText('Conflict')).toBeInTheDocument();
    expect(
      screen.getByText('A record with this slug already exists.'),
    ).toBeInTheDocument();
  });

  it('shows "Validation failed" title for HTTP 400', () => {
    const error = {
      message: 'Slug is required.',
      status: 400,
      isNetworkError: false,
      isAuthError: false,
      fieldErrors: [{ field: 'slug', message: 'Slug is required.' }],
    };
    render(<ApiErrorBanner error={error} />);
    expect(screen.getByText('Validation failed')).toBeInTheDocument();
    expect(screen.getByText(/slug:/i)).toBeInTheDocument();
  });

  it('shows "Authorization required" title for auth errors', () => {
    const error = {
      message: 'Unauthorized',
      status: 401,
      isNetworkError: false,
      isAuthError: true,
      fieldErrors: [],
    };
    render(<ApiErrorBanner error={error} />);
    expect(screen.getByText('Authorization required')).toBeInTheDocument();
  });

  it('falls back to "Something went wrong" when status is unknown', () => {
    const error = {
      message: 'Some error',
      status: 418,
      isNetworkError: false,
      isAuthError: false,
      fieldErrors: [],
    };
    render(<ApiErrorBanner error={error} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('does not show "Network error" title for an HTTP 409 response', () => {
    const error = {
      message: 'A record with this slug already exists.',
      status: 409,
      isNetworkError: false,
      isAuthError: false,
      fieldErrors: [],
    };
    render(<ApiErrorBanner error={error} />);
    expect(screen.queryByText('Network error')).not.toBeInTheDocument();
  });

  it('renders a retry button when onRetry is provided and invokes it on click', () => {
    const onRetry = vi.fn();
    const error = {
      message: 'Boom',
      status: 500,
      isNetworkError: false,
      isAuthError: false,
      fieldErrors: [],
    };
    render(<ApiErrorBanner error={error} onRetry={onRetry} />);
    const button = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
