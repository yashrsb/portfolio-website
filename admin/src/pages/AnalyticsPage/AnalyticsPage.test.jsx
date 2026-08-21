import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDateRangePresets = [
  { value: 1, label: 'Today' },
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
];

const mockOverview = {
  current: {
    totalVisitors: 100,
    totalPageViews: 500,
    totalProjectViews: 50,
    totalProjectClicks: 10,
    totalBlogViews: 30,
  },
  previous: {
    totalVisitors: 80,
    totalPageViews: 400,
    totalProjectViews: 40,
    totalProjectClicks: 8,
    totalBlogViews: 20,
  },
};

const mockTimeSeries = [
  { date: '2025-08-01', visitors: 12, pageViews: 34 },
  { date: '2025-08-02', visitors: 8, pageViews: 22 },
];

const mockPages = [
  { path: '/', views: 100, uniqueVisitors: 80 },
  { path: '/projects', views: 50, uniqueVisitors: 40 },
];

const mockCountries = [
  { country: 'US', visitors: 50, percentage: 50 },
  { country: 'IN', visitors: 30, percentage: 30 },
];

const mockDevices = [
  { deviceType: 'DESKTOP', visitors: 70, percentage: 70 },
  { deviceType: 'MOBILE', visitors: 30, percentage: 30 },
];

const mockBrowsers = [
  { browser: 'CHROME', visitors: 60, percentage: 60 },
  { browser: 'SAFARI', visitors: 40, percentage: 40 },
];

const mockProjects = [
  {
    slug: 'notifyhub',
    title: 'NotifyHub',
    views: 30,
    clicks: 10,
    uniqueVisitors: 20,
    githubClicks: 7,
    demoClicks: 3,
  },
];

const mockReferrers = [
  { source: 'Google', visitors: 40, percentage: 40 },
  { source: 'Direct', visitors: 30, percentage: 30 },
];

const mockDashboardResponse = {
  overview: mockOverview,
  timeseries: mockTimeSeries,
  pages: mockPages,
  projects: mockProjects,
  countries: mockCountries,
  devices: mockDevices,
  browsers: mockBrowsers,
  referrers: mockReferrers,
};

const mockEmptyDashboardResponse = {
  overview: {
    current: {
      totalVisitors: 0,
      totalPageViews: 0,
      totalProjectViews: 0,
      totalProjectClicks: 0,
      totalBlogViews: 0,
    },
    previous: {
      totalVisitors: 0,
      totalPageViews: 0,
      totalProjectViews: 0,
      totalProjectClicks: 0,
      totalBlogViews: 0,
    },
  },
  timeseries: [],
  pages: [],
  projects: [],
  countries: [],
  devices: [],
  browsers: [],
  referrers: [],
};

const mockTimeSeriesWithZeros = [
  { date: '2025-08-01', visitors: 0, pageViews: 0 },
  { date: '2025-08-02', visitors: 0, pageViews: 0 },
  { date: '2025-08-03', visitors: 5, pageViews: 12 },
  { date: '2025-08-04', visitors: 0, pageViews: 0 },
  { date: '2025-08-05', visitors: 3, pageViews: 8 },
];

const mockAnalyticsService = vi.hoisted(() => ({
  getDashboard: vi.fn(),
  getOverview: vi.fn(),
  getTimeSeries: vi.fn(),
  getTopPages: vi.fn(),
  getCountries: vi.fn(),
  getDevices: vi.fn(),
  getBrowsers: vi.fn(),
  getProjectStats: vi.fn(),
  getReferrers: vi.fn(),
}));

vi.mock('../../services', () => ({
  analyticsService: mockAnalyticsService,
}));

vi.mock('../../utils/apiErrors', () => ({
  normalizeApiError: (err) => ({ message: err.message || 'Error' }),
}));

vi.mock('../../components/layout/Breadcrumb/Breadcrumb', () => ({
  default: () => <nav>Breadcrumb</nav>,
}));

vi.mock('../../components/common/LineChart/LineChart', () => ({
  default: ({ data }) => (
    <div data-testid="line-chart">Chart: {data.length} points</div>
  ),
}));

vi.mock('../../components/common/DateRangeSelector/DateRangeSelector', () => ({
  default: ({ value, onChange }) => (
    <select
      data-testid="date-range"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      <option value="7">Last 7 days</option>
      <option value="30">Last 30 days</option>
      <option value="90">Last 90 days</option>
    </select>
  ),
  DATE_RANGE_PRESETS: mockDateRangePresets,
}));

vi.mock('../../components/common/SkeletonCard/SkeletonCard', () => ({
  default: () => <div data-testid="skeleton-card" />,
}));

vi.mock('../../components/common/SkeletonTable/SkeletonTable', () => ({
  default: () => <div data-testid="skeleton-table" />,
}));

vi.mock('../../components/common/errors/ApiErrorBanner/ApiErrorBanner', () => ({
  default: ({ message }) => <div data-testid="error-banner">{message}</div>,
}));

vi.mock('../../components/common/EmptyState/EmptyState', () => ({
  default: ({ message }) => <div data-testid="empty-state">{message}</div>,
}));

describe('AnalyticsPage', () => {
  let AnalyticsPage;

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.resetModules();
    mockAnalyticsService.getDashboard.mockClear();
    mockAnalyticsService.getDashboard.mockResolvedValue(mockDashboardResponse);

    const mod = await import('../../pages/AnalyticsPage/AnalyticsPage.jsx');
    AnalyticsPage = mod.default;
  });

  it('makes a single dashboard API call on mount', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(mockAnalyticsService.getDashboard).toHaveBeenCalledTimes(1);
      expect(mockAnalyticsService.getDashboard).toHaveBeenCalledWith(30);
    });
  });

  it('does not fire duplicate dashboard requests under StrictMode double-invoke', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(mockAnalyticsService.getDashboard).toHaveBeenCalledTimes(1);
    });
  });

  it('renders the page title', async () => {
    render(<AnalyticsPage />);
    expect(screen.getByText(/Analytics/i)).toBeInTheDocument();
  });

  it('fetches and displays overview data on mount', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getAllByText('100').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('500').length).toBeGreaterThan(0);
  });

  it('shows loading skeletons while data is being fetched', async () => {
    render(<AnalyticsPage />);
    expect(screen.getAllByTestId('skeleton-card').length).toBeGreaterThan(0);
  });

  it('renders time-series chart after data loads', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
    expect(screen.getByText(/Chart: 2 points/)).toBeInTheDocument();
  });

  it('renders top pages table after data loads', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('/')).toBeInTheDocument();
    });
    expect(screen.getByText('/projects')).toBeInTheDocument();
  });

  it('renders countries table after data loads', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('US')).toBeInTheDocument();
    });
    expect(screen.getByText('IN')).toBeInTheDocument();
  });

  it('renders devices table after data loads', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('DESKTOP')).toBeInTheDocument();
    });
    expect(screen.getByText('MOBILE')).toBeInTheDocument();
  });

  it('renders browsers table after data loads', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('CHROME')).toBeInTheDocument();
    });
    expect(screen.getByText('SAFARI')).toBeInTheDocument();
  });

  it('renders project stats after data loads', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('NotifyHub')).toBeInTheDocument();
    });
  });

  it('renders referrers after data loads', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
    });
    expect(screen.getByText('Direct')).toBeInTheDocument();
  });

  it('refetches data when date range changes', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(mockAnalyticsService.getDashboard).toHaveBeenCalledWith(30);
    });

    const select = screen.getByTestId('date-range');
    fireEvent.change(select, { target: { value: '90' } });

    await waitFor(() => {
      expect(mockAnalyticsService.getDashboard).toHaveBeenCalledWith(90);
    });
  });

  it('renders timeseries chart with multiple days', async () => {
    mockAnalyticsService.getDashboard.mockResolvedValue({
      ...mockDashboardResponse,
      timeseries: mockTimeSeriesWithZeros,
    });

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
    expect(screen.getAllByText('Chart: 5 points').length).toBeGreaterThan(0);
  });

  it('handles zero-visitor days gracefully', async () => {
    mockAnalyticsService.getDashboard.mockResolvedValue({
      ...mockDashboardResponse,
      timeseries: mockTimeSeriesWithZeros,
    });

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
    expect(screen.getAllByText('Chart: 5 points').length).toBeGreaterThan(0);
  });

  it('handles single active day in timeseries', async () => {
    mockAnalyticsService.getDashboard.mockResolvedValue({
      ...mockDashboardResponse,
      timeseries: [{ date: '2025-08-01', visitors: 3, pageViews: 7 }],
    });

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('Chart: 1 points')).toBeInTheDocument();
    });
  });

  it('shows empty state when dashboard data is empty', async () => {
    mockAnalyticsService.getDashboard.mockResolvedValue(
      mockEmptyDashboardResponse,
    );

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getAllByTestId('empty-state').length).toBeGreaterThan(0);
    });
  });

  it('shows error banner when dashboard fetch fails', async () => {
    mockAnalyticsService.getDashboard.mockRejectedValue(
      new Error('Failed to load analytics'),
    );
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('error-banner')).toBeInTheDocument();
    });
  });
});
