import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { MockApiError, mockPost, mockGet, mockProfileResult, mockSocialResult } =
  vi.hoisted(() => {
    const post = vi.fn();
    const get = vi.fn();

    class ApiError extends Error {
      constructor(status, message, details) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
      }
    }

    return {
      MockApiError: ApiError,
      mockPost: post,
      mockGet: get,
      mockProfileResult: {
        profile: { contact: { email: 'test@example.com' } },
        loading: false,
        error: null,
      },
      mockSocialResult: {
        socialLinks: [],
        loading: false,
        error: null,
      },
    };
  });

vi.mock('../../services/apiClient', () => ({
  apiClient: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  ApiError: MockApiError,
}));

vi.mock('../../services/profileService', () => ({
  fetchProfile: () => mockGet('/profile'),
}));

vi.mock('../../services/socialService', () => ({
  fetchSocial: () => mockGet('/social'),
}));

vi.mock('../../hooks', () => ({
  useProfile: () => mockProfileResult,
  useSocial: () => mockSocialResult,
  usePrefersReducedMotion: () => false,
  useIntersectionObserver: () => null,
}));

vi.mock('../../components/common/Reveal/Reveal.jsx', () => ({
  default: ({ children }) => children,
}));

vi.mock('../../components/common/Container/Container.jsx', () => ({
  default: ({ children }) => children,
}));

vi.mock('../../components/common/Heading/Heading.jsx', () => ({
  default: ({ children }) => <h1>{children}</h1>,
}));

vi.mock('../../components/common/Card/Card.jsx', () => ({
  default: ({ children }) => children,
}));

vi.mock('../../components/common/LoadingState/LoadingState.jsx', () => ({
  default: () => <div>Loading</div>,
}));

vi.mock('../../components/common/ErrorState/ErrorState.jsx', () => ({
  default: ({ title, message }) => (
    <div>
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  ),
}));

import Contact from './Contact';

const VALID_FORM = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  subject: 'Hello there',
  message: 'This is a test message that is long enough.',
};

describe('Contact page', () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockGet.mockReset();
    mockProfileResult.profile = { contact: { email: 'test@example.com' } };
    mockProfileResult.loading = false;
    mockProfileResult.error = null;
    mockSocialResult.socialLinks = [];
    mockSocialResult.loading = false;
    mockSocialResult.error = null;
  });

  it('renders the contact form with name, email, subject, and message fields', () => {
    render(<Contact />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /send message/i }),
    ).toBeInTheDocument();
  });

  it('includes a hidden honeypot field', () => {
    render(<Contact />);
    const honeypot = document.querySelector('input[name="website"]');
    expect(honeypot).toBeInTheDocument();
    expect(honeypot).toHaveAttribute('aria-hidden', 'true');
    expect(honeypot).toHaveAttribute('tabindex', '-1');
  });

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Subject is required')).toBeInTheDocument();
    expect(screen.getByText('Message is required')).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.type(screen.getByLabelText(/subject/i), 'Hello there');
    await user.type(
      screen.getByLabelText(/message/i),
      'This is a test message that is long enough.',
    );
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(
      screen.getByText('A valid email address is required'),
    ).toBeInTheDocument();
  });

  it('shows validation error for short subject', async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/subject/i), 'Hi');
    await user.type(
      screen.getByLabelText(/message/i),
      'This is a test message that is long enough.',
    );
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(
      screen.getByText(/Subject must be at least 5 characters/),
    ).toBeInTheDocument();
  });

  it('shows validation error for short message', async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/subject/i), 'Hello there');
    await user.type(screen.getByLabelText(/message/i), 'Short');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(
      screen.getByText(/Message must be at least 10 characters/),
    ).toBeInTheDocument();
  });

  it('shows success state after valid submission', async () => {
    const user = userEvent.setup();
    mockPost.mockResolvedValue({
      id: 'msg-1',
      createdAt: '2026-01-01T00:00:00Z',
    });

    render(<Contact />);

    await user.type(screen.getByLabelText(/name/i), VALID_FORM.name);
    await user.type(screen.getByLabelText(/email/i), VALID_FORM.email);
    await user.type(screen.getByLabelText(/subject/i), VALID_FORM.subject);
    await user.type(screen.getByLabelText(/message/i), VALID_FORM.message);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText('Message Sent')).toBeInTheDocument();
    expect(
      screen.getByText(/Thank you for reaching out/),
    ).toBeInTheDocument();

    expect(mockPost).toHaveBeenCalledWith('/contact', {
      ...VALID_FORM,
      website: '',
    });
  });

  it('clears the form after successful submission', async () => {
    const user = userEvent.setup();
    mockPost.mockResolvedValue({ id: 'msg-1' });

    render(<Contact />);

    await user.type(screen.getByLabelText(/name/i), VALID_FORM.name);
    await user.type(screen.getByLabelText(/email/i), VALID_FORM.email);
    await user.type(screen.getByLabelText(/subject/i), VALID_FORM.subject);
    await user.type(screen.getByLabelText(/message/i), VALID_FORM.message);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText('Message Sent')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /send another message/i }),
    );

    expect(screen.getByLabelText(/name/i)).toHaveValue('');
    expect(screen.getByLabelText(/email/i)).toHaveValue('');
  });

  it('shows network error state when the server is unreachable', async () => {
    const user = userEvent.setup();
    mockPost.mockRejectedValue(
      new MockApiError(0, 'Network error — unable to reach the server'),
    );

    render(<Contact />);

    await user.type(screen.getByLabelText(/name/i), VALID_FORM.name);
    await user.type(screen.getByLabelText(/email/i), VALID_FORM.email);
    await user.type(screen.getByLabelText(/subject/i), VALID_FORM.subject);
    await user.type(screen.getByLabelText(/message/i), VALID_FORM.message);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(
      await screen.findByText(/Unable to reach the server/),
    ).toBeInTheDocument();
  });

  it('shows server error state on 500 response', async () => {
    const user = userEvent.setup();
    mockPost.mockRejectedValue(
      new MockApiError(500, 'Internal Server Error', {
        success: false,
        message: 'Internal Server Error',
        code: 'INTERNAL_SERVER_ERROR',
        errors: [],
      }),
    );

    render(<Contact />);

    await user.type(screen.getByLabelText(/name/i), VALID_FORM.name);
    await user.type(screen.getByLabelText(/email/i), VALID_FORM.email);
    await user.type(screen.getByLabelText(/subject/i), VALID_FORM.subject);
    await user.type(screen.getByLabelText(/message/i), VALID_FORM.message);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(
      await screen.findByText(/Something went wrong/),
    ).toBeInTheDocument();
  });

  it('shows spam rejected state when API returns SPAM_REJECTED', async () => {
    const user = userEvent.setup();
    mockPost.mockRejectedValue(
      new MockApiError(400, 'Invalid submission.', {
        success: false,
        message: 'Invalid submission.',
        code: 'SPAM_REJECTED',
        errors: [],
      }),
    );

    render(<Contact />);

    await user.type(screen.getByLabelText(/name/i), VALID_FORM.name);
    await user.type(screen.getByLabelText(/email/i), VALID_FORM.email);
    await user.type(screen.getByLabelText(/subject/i), VALID_FORM.subject);
    await user.type(screen.getByLabelText(/message/i), VALID_FORM.message);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(
      await screen.findByText(/flagged as spam/),
    ).toBeInTheDocument();
  });

  it('shows field-level errors from server validation response', async () => {
    const user = userEvent.setup();
    mockPost.mockRejectedValue(
      new MockApiError(400, 'Validation failed', {
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: [
          { field: 'email', message: 'A valid email address is required' },
        ],
      }),
    );

    render(<Contact />);

    await user.type(screen.getByLabelText(/name/i), VALID_FORM.name);
    await user.type(screen.getByLabelText(/email/i), 'bad-email');
    await user.type(screen.getByLabelText(/subject/i), VALID_FORM.subject);
    await user.type(screen.getByLabelText(/message/i), VALID_FORM.message);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(
      await screen.findByText('A valid email address is required'),
    ).toBeInTheDocument();
  });

  it('prevents duplicate submissions while submitting', async () => {
    const user = userEvent.setup();
    let resolvePost;
    mockPost.mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      }),
    );

    render(<Contact />);

    await user.type(screen.getByLabelText(/name/i), VALID_FORM.name);
    await user.type(screen.getByLabelText(/email/i), VALID_FORM.email);
    await user.type(screen.getByLabelText(/subject/i), VALID_FORM.subject);
    await user.type(screen.getByLabelText(/message/i), VALID_FORM.message);

    const submitButton = screen.getByRole('button', { name: /send message/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute('aria-busy', 'true');

    resolvePost({ id: 'msg-1' });

    await waitFor(() => {
      expect(screen.getByText('Message Sent')).toBeInTheDocument();
    });
  });
});
