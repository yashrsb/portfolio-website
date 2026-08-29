import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRepo = {
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  recordLogin: vi.fn(),
  createRefreshToken: vi.fn(),
  findRefreshTokenByHash: vi.fn(),
  revokeRefreshToken: vi.fn(),
  revokeAllUserTokens: vi.fn(),
};

vi.mock('../src/repositories/authRepository.js', () => mockRepo);

const mockTokenService = {
  generateAccessToken: vi.fn(),
  generateRefreshToken: vi.fn(),
  hashRefreshToken: vi.fn(),
};

vi.mock('../src/services/tokenService.js', () => mockTokenService);

let bcryptCompare;

vi.mock('bcryptjs', async (importOriginal) => {
  const actual = await importOriginal();
  bcryptCompare = vi.fn();
  return {
    ...actual,
    default: {
      ...actual.default,
      compare: bcryptCompare,
    },
  };
});

const { login, refresh, logout, getCurrentUser } =
  await import('../src/services/authService.js');

describe('authService', () => {
  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'ADMIN',
    passwordHash: 'hashed-password',
    isActive: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('returns access token, refresh token, and public user on valid credentials', async () => {
      mockRepo.findUserByEmail.mockResolvedValue(mockUser);
      bcryptCompare.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue('access-token');
      mockTokenService.generateRefreshToken.mockReturnValue('refresh-token');
      mockTokenService.hashRefreshToken.mockReturnValue('hashed-refresh');

      const result = await login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user).toEqual({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN',
      });
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(mockRepo.recordLogin).toHaveBeenCalledWith('user-1');
    });

    it('throws 401 when user not found', async () => {
      mockRepo.findUserByEmail.mockResolvedValue(null);

      await expect(
        login({ email: 'unknown@example.com', password: 'password123' }),
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid email or password.',
      });
    });

    it('throws 401 when password does not match', async () => {
      mockRepo.findUserByEmail.mockResolvedValue(mockUser);
      bcryptCompare.mockResolvedValue(false);

      await expect(
        login({ email: 'test@example.com', password: 'wrong-password' }),
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid email or password.',
      });
    });

    it('throws 403 when account is deactivated', async () => {
      mockRepo.findUserByEmail.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(
        login({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toMatchObject({
        statusCode: 403,
        message: 'This account has been deactivated.',
      });
    });

    it('normalizes email to lowercase', async () => {
      mockRepo.findUserByEmail.mockResolvedValue(mockUser);
      bcryptCompare.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue('access-token');
      mockTokenService.generateRefreshToken.mockReturnValue('refresh-token');
      mockTokenService.hashRefreshToken.mockReturnValue('hashed-refresh');

      await login({ email: 'TEST@EXAMPLE.COM', password: 'password123' });

      expect(mockRepo.findUserByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('refresh', () => {
    const mockStoredToken = {
      id: 'token-1',
      tokenHash: 'hashed-refresh',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 86400000),
      revokedAt: null,
    };

    it('returns new access and refresh tokens on valid refresh', async () => {
      mockTokenService.hashRefreshToken.mockReturnValue('hashed-refresh');
      mockRepo.findRefreshTokenByHash.mockResolvedValue(mockStoredToken);
      mockRepo.findUserById.mockResolvedValue(mockUser);
      mockTokenService.generateAccessToken.mockReturnValue('new-access-token');
      mockTokenService.generateRefreshToken.mockReturnValue(
        'new-refresh-token',
      );

      const result = await refresh('valid-refresh-token');

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(mockRepo.revokeRefreshToken).toHaveBeenCalledWith('token-1');
    });

    it('throws 401 when refresh token is missing', async () => {
      await expect(refresh(null)).rejects.toMatchObject({
        statusCode: 401,
        message: 'Refresh token missing.',
      });
      await expect(refresh('')).rejects.toMatchObject({
        statusCode: 401,
        message: 'Refresh token missing.',
      });
    });

    it('throws 401 when refresh token is not found in database', async () => {
      mockTokenService.hashRefreshToken.mockReturnValue('unknown-hash');
      mockRepo.findRefreshTokenByHash.mockResolvedValue(null);

      await expect(refresh('unknown-token')).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid refresh token.',
      });
    });

    it('throws 401 and revokes all tokens when reuse is detected', async () => {
      const revokedToken = { ...mockStoredToken, revokedAt: new Date() };
      mockTokenService.hashRefreshToken.mockReturnValue('hashed-refresh');
      mockRepo.findRefreshTokenByHash.mockResolvedValue(revokedToken);

      await expect(refresh('reused-token')).rejects.toMatchObject({
        statusCode: 401,
        message: 'Refresh token reuse detected. Please log in again.',
      });
      expect(mockRepo.revokeAllUserTokens).toHaveBeenCalledWith('user-1');
    });

    it('throws 401 when refresh token is expired', async () => {
      const expiredToken = {
        ...mockStoredToken,
        expiresAt: new Date(Date.now() - 1000),
      };
      mockTokenService.hashRefreshToken.mockReturnValue('hashed-refresh');
      mockRepo.findRefreshTokenByHash.mockResolvedValue(expiredToken);

      await expect(refresh('expired-token')).rejects.toMatchObject({
        statusCode: 401,
        message: 'Refresh token expired. Please log in again.',
      });
      expect(mockRepo.revokeRefreshToken).toHaveBeenCalledWith('token-1');
    });

    it('throws 403 when user account is deactivated', async () => {
      mockTokenService.hashRefreshToken.mockReturnValue('hashed-refresh');
      mockRepo.findRefreshTokenByHash.mockResolvedValue(mockStoredToken);
      mockRepo.findUserById.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(refresh('valid-token')).rejects.toMatchObject({
        statusCode: 403,
        message: 'Account unavailable.',
      });
    });
  });

  describe('logout', () => {
    it('revokes the refresh token on logout', async () => {
      const mockStoredToken = { id: 'token-1', revokedAt: null };
      mockTokenService.hashRefreshToken.mockReturnValue('hashed-refresh');
      mockRepo.findRefreshTokenByHash.mockResolvedValue(mockStoredToken);

      await logout('valid-refresh-token');

      expect(mockRepo.revokeRefreshToken).toHaveBeenCalledWith('token-1');
    });

    it('does nothing when token is missing', async () => {
      await logout(null);
      expect(mockRepo.findRefreshTokenByHash).not.toHaveBeenCalled();
    });

    it('does nothing when token is not found', async () => {
      mockTokenService.hashRefreshToken.mockReturnValue('unknown-hash');
      mockRepo.findRefreshTokenByHash.mockResolvedValue(null);

      await logout('unknown-token');
      expect(mockRepo.revokeRefreshToken).not.toHaveBeenCalled();
    });

    it('does nothing when token is already revoked', async () => {
      const revokedToken = { id: 'token-1', revokedAt: new Date() };
      mockTokenService.hashRefreshToken.mockReturnValue('hashed-refresh');
      mockRepo.findRefreshTokenByHash.mockResolvedValue(revokedToken);

      await logout('revoked-token');
      expect(mockRepo.revokeRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('returns public user when user exists and is active', async () => {
      mockRepo.findUserById.mockResolvedValue(mockUser);

      const result = await getCurrentUser('user-1');

      expect(result).toEqual({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN',
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('throws 401 when user not found', async () => {
      mockRepo.findUserById.mockResolvedValue(null);

      await expect(getCurrentUser('unknown-id')).rejects.toMatchObject({
        statusCode: 401,
        message: 'Account no longer available.',
      });
    });

    it('throws 401 when user is deactivated', async () => {
      mockRepo.findUserById.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(getCurrentUser('user-1')).rejects.toMatchObject({
        statusCode: 401,
        message: 'Account no longer available.',
      });
    });
  });
});
