import { describe, it, expect, vi } from 'vitest';
import cacheHeaders from '../src/middlewares/cacheHeaders.js';

describe('cacheHeaders middleware', () => {
  it('sets Cache-Control header on successful GET responses', () => {
    const req = { method: 'GET' };
    const res = {
      statusCode: 200,
      set: vi.fn(),
    };
    const next = vi.fn();

    cacheHeaders({ maxAge: 300 })(req, res, next);

    expect(res.set).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=60',
    );
    expect(next).toHaveBeenCalled();
  });

  it('uses default maxAge of 300 when no options provided', () => {
    const req = { method: 'GET' };
    const res = {
      statusCode: 200,
      set: vi.fn(),
    };
    const next = vi.fn();

    cacheHeaders()(req, res, next);

    expect(res.set).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=60',
    );
  });

  it('does not set header for non-GET methods', () => {
    const req = { method: 'POST' };
    const res = {
      statusCode: 201,
      set: vi.fn(),
    };
    const next = vi.fn();

    cacheHeaders()(req, res, next);

    expect(res.set).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('does not set header for error responses', () => {
    const req = { method: 'GET' };
    const res = {
      statusCode: 500,
      set: vi.fn(),
    };
    const next = vi.fn();

    cacheHeaders()(req, res, next);

    expect(res.set).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
