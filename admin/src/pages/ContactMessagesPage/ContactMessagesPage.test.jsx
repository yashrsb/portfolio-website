import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUpdate = vi.fn();
const mockRemove = vi.fn();
const mockRefresh = vi.fn();
const mockClearError = vi.fn();

const mockResourceResult = {
  data: [],
  loading: false,
  error: null,
  create: vi.fn(),
  update: mockUpdate,
  remove: mockRemove,
  refresh: mockRefresh,
  clearError: mockClearError,
};

vi.mock('../../hooks/useResource', () => ({
  useResource: () => mockResourceResult,
}));

vi.mock('../../services', () => ({
  contactMessagesService: {},
}));

vi.mock('../../services/api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
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
  default: ({ title, message }) => <div>{title}: {message}</div>,
}));

vi.mock('../../components/common/ToastStack/ToastStack.jsx', () => ({
  default: () => null,
}));

import ContactMessagesPage from './ContactMessagesPage';

const MOCK_MESSAGES = [
  {
    id: 'msg-1',
    name: 'Alice Smith',
    email: 'alice@example.com',
    subject: 'Project inquiry',
    message: 'Hello, I saw your portfolio and would like to discuss a project.',
    status: 'new',
    ipAddress: '192.168.1.1',
    createdAt: '2026-01-15T10:30:00Z',
  },
  {
    id: 'msg-2',
    name: 'Bob Jones',
    email: 'bob@example.com',
    subject: 'Collaboration opportunity',
    message: 'I have a collaboration idea I want to share.',
    status: 'read',
    ipAddress: null,
    createdAt: '2026-01-16T14:00:00Z',
  },
  {
    id: 'msg-3',
    name: 'Carol White',
    email: 'carol@example.com',
    subject: 'Archived message',
    message: 'This is an archived message.',
    status: 'archived',
    ipAddress: '10.0.0.5',
    createdAt: '2026-01-14T09:00:00Z',
  },
];

describe('ContactMessagesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResourceResult.data = [...MOCK_MESSAGES];
    mockResourceResult.loading = false;
    mockResourceResult.error = null;
  });

  it('renders the page heading and table with messages', () => {
    render(<ContactMessagesPage />);

    expect(
      screen.getByRole('heading', { name: /contact messages/i }),
    ).toBeInTheDocument();

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.getByText('Carol White')).toBeInTheDocument();
  });

  it('shows a loading skeleton while data is loading', () => {
    mockResourceResult.loading = true;
    mockResourceResult.data = [];

    render(<ContactMessagesPage />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows an empty state when there are no messages', () => {
    mockResourceResult.data = [];

    render(<ContactMessagesPage />);

    expect(
      screen.getByText('No messages found'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Messages submitted through the contact form will appear here./i,
      ),
    ).toBeInTheDocument();
  });

  it('renders status badges with correct variant', () => {
    render(<ContactMessagesPage />);

    const badges = screen.getAllByText(/new|read|archived/i);
    expect(badges.length).toBeGreaterThan(0);
  });

  it('filters messages by search query', async () => {
    const user = userEvent.setup();
    render(<ContactMessagesPage />);

    await user.type(
      screen.getByLabelText(/search messages/i),
      'Alice',
    );

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument();
    expect(screen.queryByText('Carol White')).not.toBeInTheDocument();
  });

  it('shows "Try adjusting your search terms" when search yields no results', async () => {
    const user = userEvent.setup();
    render(<ContactMessagesPage />);

    await user.type(
      screen.getByLabelText(/search messages/i),
      'nonexistent',
    );

    expect(screen.getByText('No messages found')).toBeInTheDocument();
    expect(
      screen.getByText(/Try adjusting your search terms./i),
    ).toBeInTheDocument();
  });

  it('opens the view modal with message details when View is clicked', async () => {
    const user = userEvent.setup();
    render(<ContactMessagesPage />);

    await user.click(
      screen.getByRole('button', { name: /view message from alice smith/i }),
    );

    const dialog = await screen.findByRole('dialog', { name: /message details/i });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Alice Smith')).toBeInTheDocument();
    expect(within(dialog).getByText('alice@example.com')).toBeInTheDocument();
    expect(within(dialog).getByText('Project inquiry')).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        'Hello, I saw your portfolio and would like to discuss a project.',
      ),
    ).toBeInTheDocument();
  });

  it('changes status when status select is modified in the view modal', async () => {
    const user = userEvent.setup();
    mockUpdate.mockResolvedValue({ ...MOCK_MESSAGES[0], status: 'read' });

    render(<ContactMessagesPage />);

    await user.click(
      screen.getByRole('button', { name: /view message from alice smith/i }),
    );

    await screen.findByRole('dialog', { name: /message details/i });

    const statusSelect = screen.getByRole('combobox');
    await user.selectOptions(statusSelect, 'read');

    expect(mockUpdate).toHaveBeenCalledWith('msg-1', { status: 'read' });
  });

  it('closes the view modal when Close is clicked', async () => {
    const user = userEvent.setup();
    render(<ContactMessagesPage />);

    await user.click(
      screen.getByRole('button', { name: /view message from alice smith/i }),
    );

    expect(
      await screen.findByRole('dialog', { name: /message details/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close dialog/i }));

    expect(
      screen.queryByRole('dialog', { name: /message details/i }),
    ).not.toBeInTheDocument();
  });

  it('opens the delete confirmation dialog when Delete is clicked', async () => {
    const user = userEvent.setup();
    render(<ContactMessagesPage />);

    await user.click(
      screen.getByRole('button', { name: /delete message from alice smith/i }),
    );

    expect(
      await screen.findByRole('dialog', { name: /delete message/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete the message from/i),
    ).toBeInTheDocument();
  });

  it('deletes a message when confirmation is confirmed', async () => {
    const user = userEvent.setup();
    mockRemove.mockResolvedValue({ data: null });

    render(<ContactMessagesPage />);

    await user.click(
      screen.getByRole('button', { name: /delete message from alice smith/i }),
    );

    await screen.findByRole('dialog', { name: /delete message/i });

    await user.click(
      screen.getByRole('button', { name: /^delete message$/i }),
    );

    expect(mockRemove).toHaveBeenCalledWith('msg-1');
  });

  it('closes the delete confirmation when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<ContactMessagesPage />);

    await user.click(
      screen.getByRole('button', { name: /delete message from alice smith/i }),
    );

    await screen.findByRole('dialog', { name: /delete message/i });

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('calls refresh when the Refresh button is clicked', async () => {
    const user = userEvent.setup();
    mockRefresh.mockResolvedValue();

    render(<ContactMessagesPage />);

    await user.click(screen.getByRole('button', { name: /refresh/i }));

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('displays error banner when there is an error', () => {
    mockResourceResult.error = {
      message: 'Failed to load messages',
      isNetworkError: false,
      isAuthError: false,
      fieldErrors: [],
    };

    render(<ContactMessagesPage />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Failed to load messages')).toBeInTheDocument();
  });

  it('displays network error in banner when error is a network error', () => {
    mockResourceResult.error = {
      message: 'Connection refused',
      isNetworkError: true,
      isAuthError: false,
      fieldErrors: [],
    };

    render(<ContactMessagesPage />);

    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('renders all three status columns correctly in the table', () => {
    render(<ContactMessagesPage />);

    const rows = screen.getAllByRole('row');
    // Header row + 3 data rows
    expect(rows).toHaveLength(4);
  });
});
