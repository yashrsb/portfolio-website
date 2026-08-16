import { describe, it, expect } from 'vitest';
import spamProtection from '../src/middlewares/spamProtection.js';
import { ERROR_CODES } from '../src/constants/errorCodes.js';

describe('spamProtection middleware', () => {
  const createMockReq = (body = {}) => ({
    body,
    ip: '192.168.1.1',
    id: 'test-request-id',
    get: () => '',
  });

  const createMockRes = () => ({});

  it('passes through when honeypot fields are empty', () => {
    const req = createMockReq({ name: 'Jane', website: '' });
    let called = false;
    const nextFn = () => {
      called = true;
    };

    spamProtection(req, createMockRes(), nextFn);

    expect(called).toBe(true);
  });

  it('passes through when honeypot fields are absent', () => {
    const req = createMockReq({ name: 'Jane' });
    let called = false;
    const nextFn = () => {
      called = true;
    };

    spamProtection(req, createMockRes(), nextFn);

    expect(called).toBe(true);
  });

  it('rejects with SPAM_REJECTED when honeypot "website" is filled', () => {
    const req = createMockReq({
      name: 'Jane',
      website: 'http://spam-bot.com',
    });

    let capturedError = null;
    const nextFn = (err) => {
      capturedError = err;
    };

    spamProtection(req, createMockRes(), nextFn);

    expect(capturedError).not.toBeNull();
    expect(capturedError.statusCode).toBe(400);
    expect(capturedError.code).toBe(ERROR_CODES.SPAM_REJECTED);
    expect(capturedError.message).toBe('Invalid submission.');
  });

  it('rejects with SPAM_REJECTED when honeypot "url" is filled', () => {
    const req = createMockReq({
      name: 'Jane',
      url: 'http://spam-bot.com',
    });

    let capturedError = null;
    const nextFn = (err) => {
      capturedError = err;
    };

    spamProtection(req, createMockRes(), nextFn);

    expect(capturedError).not.toBeNull();
    expect(capturedError.statusCode).toBe(400);
    expect(capturedError.code).toBe(ERROR_CODES.SPAM_REJECTED);
  });

  it('does not call next() (no error) when body is null', () => {
    const req = { body: null, ip: '1.2.3.4', id: 'req-1', get: () => '' };
    let called = false;
    const nextFn = () => {
      called = true;
    };

    spamProtection(req, createMockRes(), nextFn);

    expect(called).toBe(true);
  });
});
