import { describe, it, expect } from 'vitest';
import { generateDateRange } from '../src/repositories/analyticsRepository.js';

describe('generateDateRange', () => {
  it('generates all dates in the range inclusively', () => {
    const dates = generateDateRange(
      '2025-08-01T00:00:00Z',
      '2025-08-05T23:59:59Z',
    );
    expect(dates).toHaveLength(5);
    expect(dates[0]).toBe('2025-08-01');
    expect(dates[4]).toBe('2025-08-05');
  });

  it('handles single-day range', () => {
    const dates = generateDateRange(
      '2025-08-18T05:30:00Z',
      '2025-08-18T23:59:59Z',
    );
    expect(dates).toHaveLength(1);
    expect(dates[0]).toBe('2025-08-18');
  });

  it('uses UTC dates to avoid timezone off-by-one', () => {
    const dates = generateDateRange(
      '2025-08-01T12:00:00Z',
      '2025-08-03T12:00:00Z',
    );
    expect(dates).toHaveLength(3);
    expect(dates[0]).toBe('2025-08-01');
    expect(dates[1]).toBe('2025-08-02');
    expect(dates[2]).toBe('2025-08-03');
  });

  it('handles large ranges', () => {
    const dates = generateDateRange(
      '2025-07-01T00:00:00Z',
      '2025-07-31T23:59:59Z',
    );
    expect(dates).toHaveLength(31);
  });
});
