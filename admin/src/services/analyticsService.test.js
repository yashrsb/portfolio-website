import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();

vi.mock('./api/apiClient', () => ({
  default: { get: (...args) => mockGet(...args) },
}));

vi.mock('../constants/api', () => ({
  API_BASE_URL: 'http://localhost:5001',
  REQUEST_TIMEOUT: 10000,
  RETRY: { maxRetries: 0, retryableStatuses: new Set() },
  AUTH_ENDPOINTS: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
  ADMIN_ENDPOINTS: {
    analytics: {
      dashboard: '/admin/analytics/dashboard',
    },
  },
}));

const { getDashboard } = await import('./analyticsService.js');

describe('adminAnalyticsService.getDashboard', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('calls the dashboard endpoint with days param', async () => {
    mockGet.mockResolvedValue({
      data: { data: { overview: {}, timeseries: [] } },
    });
    await getDashboard(30);
    expect(mockGet).toHaveBeenCalledWith('/admin/analytics/dashboard', {
      params: { days: 30 },
    });
  });

  it('returns data.data payload', async () => {
    const payload = { overview: { current: {}, previous: {} }, timeseries: [] };
    mockGet.mockResolvedValue({ data: { data: payload } });
    const result = await getDashboard();
    expect(result).toEqual(payload);
  });

  it('defaults to 30 days', async () => {
    mockGet.mockResolvedValue({ data: { data: {} } });
    await getDashboard();
    expect(mockGet).toHaveBeenCalledWith('/admin/analytics/dashboard', {
      params: { days: 30 },
    });
  });

  it('propagates errors', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    await expect(getDashboard()).rejects.toThrow('Network error');
  });
});
