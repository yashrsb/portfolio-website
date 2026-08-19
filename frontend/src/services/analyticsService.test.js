import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isAnalyticsOptedOut,
  setAnalyticsOptOut,
} from '../utils/analyticsOptOut';
import { trackEvent, trackPageView } from '../services/analyticsService';
import { useAnalytics } from '../hooks/useAnalytics';

describe('analyticsOptOut', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns false when no opt-out flag is set', () => {
    expect(isAnalyticsOptedOut()).toBe(false);
  });

  it('returns true when analytics_opt_out is set to "true"', () => {
    setAnalyticsOptOut(true);
    expect(isAnalyticsOptedOut()).toBe(true);
  });

  it('returns false when analytics_opt_out is set to "false"', () => {
    setAnalyticsOptOut(true);
    setAnalyticsOptOut(false);
    expect(isAnalyticsOptedOut()).toBe(false);
  });

  it('handles localStorage errors gracefully', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => {
          throw new Error('localStorage unavailable');
        },
        setItem: () => {
          throw new Error('localStorage unavailable');
        },
      },
      writable: true,
      configurable: true,
    });

    expect(isAnalyticsOptedOut()).toBe(false);
    expect(() => setAnalyticsOptOut(true)).not.toThrow();

    Object.defineProperty(window, 'localStorage', original);
  });
});

describe('analyticsService.trackEvent', () => {
  let fetchMock;
  let beaconMock;
  let originalFetch;
  let originalSendBeacon;

  beforeEach(() => {
    localStorage.clear();

    originalFetch = globalThis.fetch;
    originalSendBeacon = navigator.sendBeacon;

    fetchMock = vi.fn().mockResolvedValue({ ok: true });
    globalThis.fetch = fetchMock;

    beaconMock = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', {
      value: beaconMock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    Object.defineProperty(navigator, 'sendBeacon', {
      value: originalSendBeacon,
      writable: true,
      configurable: true,
    });
  });

  it('does not send events when opted out', () => {
    localStorage.setItem('analytics_opt_out', 'true');
    trackEvent('PAGE_VIEW', '/');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(beaconMock).not.toHaveBeenCalled();
  });

  it('sends events when not opted out', () => {
    trackEvent('PAGE_VIEW', '/');
    expect(beaconMock).toHaveBeenCalled();
  });

  it('ignores invalid event types', () => {
    trackEvent('INVALID_EVENT', '/');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(beaconMock).not.toHaveBeenCalled();
  });

  it('ignores empty paths', () => {
    trackEvent('PAGE_VIEW', '');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(beaconMock).not.toHaveBeenCalled();
  });

  it('does not throw on network errors', () => {
    fetchMock.mockRejectedValue(new Error('Network error'));
    expect(() => trackEvent('PAGE_VIEW', '/')).not.toThrow();
  });

  it('trackPageView calls trackEvent with PAGE_VIEW', () => {
    trackPageView('/projects');
    expect(beaconMock).toHaveBeenCalled();
  });
});

describe('useAnalytics hook', () => {
  it('is a function', () => {
    expect(typeof useAnalytics).toBe('function');
  });
});
