import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreateEvent = vi.fn();
const mockGetOverview = vi.fn();
const mockGetTimeSeries = vi.fn();
const mockGetTopPages = vi.fn();
const mockGetCountries = vi.fn();
const mockGetDevices = vi.fn();
const mockGetBrowsers = vi.fn();
const mockGetProjectStats = vi.fn();
const mockGetProjectClickBreakdown = vi.fn();
const mockGetReferrers = vi.fn();

vi.mock('../src/repositories/analyticsRepository.js', () => ({
  default: {
    createEvent: (...args) => mockCreateEvent(...args),
    getOverview: (...args) => mockGetOverview(...args),
    getTimeSeries: (...args) => mockGetTimeSeries(...args),
    getTopPages: (...args) => mockGetTopPages(...args),
    getCountries: (...args) => mockGetCountries(...args),
    getDevices: (...args) => mockGetDevices(...args),
    getBrowsers: (...args) => mockGetBrowsers(...args),
    getProjectStats: (...args) => mockGetProjectStats(...args),
    getProjectClickBreakdown: (...args) => mockGetProjectClickBreakdown(...args),
    getReferrers: (...args) => mockGetReferrers(...args),
  },
}));

vi.mock('../src/lib/prisma.js', () => ({
  default: {
    project: { findUnique: vi.fn() },
    blogPost: { findUnique: vi.fn() },
    analyticsEvent: {
      create: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
    $disconnect: vi.fn(),
  },
}));

vi.mock('../src/config/env.js', () => ({
  env: {
    analytics: {
      rateLimit: { windowMs: 60000, max: 60 },
      retentionDays: 90,
    },
  },
}));

vi.mock('../src/utils/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

const { default: prisma } = await import('../src/lib/prisma.js');
const {
  recordEvent,
  resolveProjectId,
  resolveBlogPostId,
  getOverview,
  getTimeSeries,
  getProjectStats,
  getReferrers,
  computeDateRange,
  resolveCountry,
  getClientIp,
} = await import('../src/services/analyticsService.js');

describe('analyticsService.computeDateRange', () => {
  it('returns a 30-day range by default', () => {
    const range = computeDateRange(undefined);
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    const diffDays = (end - start) / (1000 * 60 * 60 * 24);

    expect(diffDays).toBeCloseTo(30, 1);
  });

  it('uses custom days when provided', () => {
    const range = computeDateRange(7);
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    const diffDays = (end - start) / (1000 * 60 * 60 * 24);

    expect(diffDays).toBeCloseTo(7, 1);
  });
});

describe('analyticsService.resolveCountry', () => {
  it('returns the cf-ipcountry header value when present', () => {
    const req = { headers: { 'cf-ipcountry': 'IN' } };
    expect(resolveCountry(req)).toBe('IN');
  });

  it('returns Unknown when no country header is present', () => {
    const req = { headers: {} };
    expect(resolveCountry(req)).toBe('Unknown');
  });

  it('returns Unknown when header is XX', () => {
    const req = { headers: { 'cf-ipcountry': 'XX' } };
    expect(resolveCountry(req)).toBe('Unknown');
  });
});

describe('analyticsService.getClientIp', () => {
  it('extracts the first IP from x-forwarded-for', () => {
    const req = { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }, ip: '127.0.0.1' };
    expect(getClientIp(req)).toBe('1.2.3.4');
  });

  it('falls back to req.ip when no forwarded header', () => {
    const req = { headers: {}, ip: '192.168.1.1' };
    expect(getClientIp(req)).toBe('192.168.1.1');
  });

  it('returns null when neither is available', () => {
    const req = { headers: {}, ip: null };
    expect(getClientIp(req)).toBeNull();
  });
});

describe('analyticsService.recordEvent', () => {
  beforeEach(() => {
    mockCreateEvent.mockReset();
  });

  it('drops events from known bots', async () => {
    const req = {
      get: () => 'Mozilla/5.0 (compatible; Googlebot/2.1)',
      headers: {},
      ip: '1.2.3.4',
      id: 'req-1',
    };

    const result = await recordEvent(req, {
      eventType: 'PAGE_VIEW',
      path: '/',
      projectId: null,
      blogPostId: null,
      metadata: null,
    });

    expect(result.recorded).toBe(false);
    expect(result.reason).toBe('bot_detected');
    expect(mockCreateEvent).not.toHaveBeenCalled();
  });

  it('creates an event for non-bot traffic', async () => {
    const req = {
      get: (header) => {
        if (header === 'user-agent')
          return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0';
        if (header === 'referer') return 'https://google.com/';
        return null;
      },
      headers: { 'x-forwarded-for': '1.2.3.4' },
      ip: '1.2.3.4',
      id: 'req-2',
    };

    mockCreateEvent.mockResolvedValue({});

    const result = await recordEvent(req, {
      eventType: 'PAGE_VIEW',
      path: '/',
      projectId: null,
      blogPostId: null,
      metadata: null,
    });

    expect(result.recorded).toBe(true);
    expect(mockCreateEvent).toHaveBeenCalledTimes(1);
    const callArg = mockCreateEvent.mock.calls[0][0];
    expect(callArg.path).toBe('/');
    expect(callArg.visitorHash).toBeDefined();
    expect(callArg.deviceType).toBe('DESKTOP');
    expect(callArg.browser).toBe('CHROME');
    expect(callArg.os).toBe('WINDOWS');
    expect(callArg.referrer).toBe('https://google.com/');
  });
});

describe('analyticsService.resolveProjectId', () => {
  beforeEach(() => {
    prisma.project.findUnique.mockReset();
  });

  it('returns the project ID for a valid slug', async () => {
    prisma.project.findUnique.mockResolvedValue({ id: 'proj-123' });
    const id = await resolveProjectId('notifyhub');
    expect(id).toBe('proj-123');
  });

  it('returns null for an invalid slug', async () => {
    prisma.project.findUnique.mockResolvedValue(null);
    const id = await resolveProjectId('nonexistent');
    expect(id).toBeNull();
  });

  it('returns null for empty slug', async () => {
    const id = await resolveProjectId('');
    expect(id).toBeNull();
  });
});

describe('analyticsService.resolveBlogPostId', () => {
  beforeEach(() => {
    prisma.blogPost.findUnique.mockReset();
  });

  it('returns the post ID for a published post', async () => {
    prisma.blogPost.findUnique.mockResolvedValue({ id: 'post-1', status: 'PUBLISHED' });
    const id = await resolveBlogPostId('my-post');
    expect(id).toBe('post-1');
  });

  it('returns null for a draft post', async () => {
    prisma.blogPost.findUnique.mockResolvedValue({ id: 'post-2', status: 'DRAFT' });
    const id = await resolveBlogPostId('draft-post');
    expect(id).toBeNull();
  });

  it('returns null for a nonexistent post', async () => {
    prisma.blogPost.findUnique.mockResolvedValue(null);
    const id = await resolveBlogPostId('missing');
    expect(id).toBeNull();
  });
});

describe('analyticsService.getOverview', () => {
  beforeEach(() => {
    mockGetOverview.mockReset();
  });

  it('fetches and returns current + previous overview', async () => {
    const mockCurrent = {
      totalVisitors: 100,
      totalPageViews: 500,
      totalProjectViews: 50,
      totalProjectClicks: 10,
      totalBlogViews: 30,
    };
    const mockPrevious = {
      totalVisitors: 80,
      totalPageViews: 400,
      totalProjectViews: 40,
      totalProjectClicks: 8,
      totalBlogViews: 20,
    };

    mockGetOverview
      .mockResolvedValueOnce(mockCurrent)
      .mockResolvedValueOnce(mockPrevious);

    const result = await getOverview({ days: '30' });

    expect(result.current).toEqual(mockCurrent);
    expect(result.previous).toEqual(mockPrevious);
    expect(mockGetOverview).toHaveBeenCalledTimes(2);
  });

  it('defaults to 30 days when days is not provided', async () => {
    mockGetOverview.mockResolvedValue({ totalVisitors: 0 });

    await getOverview({});

    expect(mockGetOverview).toHaveBeenCalledTimes(2);
    const firstCallArg = mockGetOverview.mock.calls[0][0];
    const start = new Date(firstCallArg.startDate);
    const end = new Date(firstCallArg.endDate);
    const diff = (end - start) / (1000 * 60 * 60 * 24);
    expect(diff).toBeCloseTo(30, 1);
  });
});

describe('analyticsService.getTimeSeries', () => {
  beforeEach(() => {
    mockGetTimeSeries.mockReset();
  });

  it('passes date range to repository', async () => {
    mockGetTimeSeries.mockResolvedValue([]);

    await getTimeSeries({ days: '7' });

    expect(mockGetTimeSeries).toHaveBeenCalledTimes(1);
    const arg = mockGetTimeSeries.mock.calls[0][0];
    expect(arg).toHaveProperty('startDate');
    expect(arg).toHaveProperty('endDate');
  });
});

describe('analyticsService.getProjectStats', () => {
  beforeEach(() => {
    mockGetProjectStats.mockReset();
    mockGetProjectClickBreakdown.mockReset();
  });

  it('merges click breakdown into project stats', async () => {
    mockGetProjectStats.mockResolvedValue([
      { slug: 'proj-a', title: 'Project A', views: 100, clicks: 80, uniqueVisitors: 50 },
    ]);
    mockGetProjectClickBreakdown.mockResolvedValue([
      { slug: 'proj-a', title: 'Project A', githubClicks: 60, demoClicks: 20, totalClicks: 80 },
    ]);

    const result = await getProjectStats({ days: '30' });

    expect(result[0].githubClicks).toBe(60);
    expect(result[0].demoClicks).toBe(20);
  });
});

describe('analyticsService.getReferrers', () => {
  beforeEach(() => {
    mockGetReferrers.mockReset();
  });

  it('passes date range to repository', async () => {
    mockGetReferrers.mockResolvedValue([]);

    await getReferrers({ days: '90' });

    expect(mockGetReferrers).toHaveBeenCalledTimes(1);
    const arg = mockGetReferrers.mock.calls[0][0];
    expect(arg).toHaveProperty('startDate');
    expect(arg).toHaveProperty('endDate');
  });
});
