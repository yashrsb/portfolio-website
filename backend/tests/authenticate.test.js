import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockVerifyAccessToken = vi.fn();
const mockFindUserById = vi.fn();

vi.mock('../src/services/tokenService.js', () => ({
  verifyAccessToken: (...args) => mockVerifyAccessToken(...args),
}));

vi.mock('../src/repositories/authRepository.js', () => ({
  findUserById: (...args) => mockFindUserById(...args),
}));

const authenticate = (await import('../src/middlewares/authenticate.js'))
  .default;

describe('authenticate middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = { headers: {} };
    mockRes = {};
    mockNext = vi.fn();
  });

  it('calls next() with error when Authorization header is missing', async () => {
    await authenticate(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 }),
    );
  });

  it('calls next() with error when scheme is not Bearer', async () => {
    mockReq.headers.authorization = 'Basic token123';

    await authenticate(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Authentication required. Provide a valid access token.',
      }),
    );
  });

  it('calls next() with error when token is missing', async () => {
    mockReq.headers.authorization = 'Bearer ';

    await authenticate(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 }),
    );
  });

  it('calls next() with error when token is invalid', async () => {
    mockReq.headers.authorization = 'Bearer invalid-token';
    mockVerifyAccessToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authenticate(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Access token is invalid or expired.',
      }),
    );
  });

  it('attaches req.user and req.auth on valid token', async () => {
    const mockPayload = {
      sub: 'user-1',
      email: 'test@example.com',
      role: 'ADMIN',
    };
    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN',
      isActive: true,
    };

    mockVerifyAccessToken.mockReturnValue(mockPayload);
    mockFindUserById.mockResolvedValue(mockUser);

    mockReq.headers.authorization = 'Bearer valid-token';

    await authenticate(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(mockReq.user).toEqual({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN',
      isActive: true,
    });
    expect(mockReq.auth).toEqual(mockPayload);
  });

  it('returns 401 when user is deactivated', async () => {
    const mockPayload = {
      sub: 'user-1',
      email: 'test@example.com',
      role: 'ADMIN',
    };

    mockVerifyAccessToken.mockReturnValue(mockPayload);
    mockFindUserById.mockResolvedValue({
      id: 'user-1',
      name: 'Test',
      email: 'test@example.com',
      role: 'ADMIN',
      isActive: false,
    });

    mockReq.headers.authorization = 'Bearer valid-token';

    await authenticate(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Account no longer available.',
      }),
    );
  });

  it('returns 401 when user not found in database', async () => {
    const mockPayload = {
      sub: 'deleted-user',
      email: 'test@example.com',
      role: 'ADMIN',
    };

    mockVerifyAccessToken.mockReturnValue(mockPayload);
    mockFindUserById.mockResolvedValue(null);

    mockReq.headers.authorization = 'Bearer valid-token';

    await authenticate(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Account no longer available.',
      }),
    );
  });
});

describe('authorize middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {};
    mockRes = {};
    mockNext = vi.fn();
  });

  it('allows access when user has required role', async () => {
    const { default: authorize } =
      await import('../src/middlewares/authorize.js');
    mockReq.user = { role: 'ADMIN' };
    const middleware = authorize('ADMIN');

    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('allows access when user has one of multiple allowed roles', async () => {
    const { default: authorize } =
      await import('../src/middlewares/authorize.js');
    mockReq.user = { role: 'EDITOR' };
    const middleware = authorize('ADMIN', 'EDITOR');

    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('returns 403 when user does not have required role', async () => {
    const { default: authorize } =
      await import('../src/middlewares/authorize.js');
    mockReq.user = { role: 'EDITOR' };
    const middleware = authorize('ADMIN');

    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: 'You do not have permission to perform this action.',
      }),
    );
  });

  it('returns 403 when req.user is missing', async () => {
    const { default: authorize } =
      await import('../src/middlewares/authorize.js');
    const middleware = authorize('ADMIN');

    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403 }),
    );
  });

  it('returns 403 when user role is undefined', async () => {
    const { default: authorize } =
      await import('../src/middlewares/authorize.js');
    mockReq.user = {};
    const middleware = authorize('ADMIN');

    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403 }),
    );
  });
});
