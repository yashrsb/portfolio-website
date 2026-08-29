import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('security regression tests', () => {
  describe('JWT security', () => {
    let tokenService;

    beforeEach(async () => {
      vi.clearAllMocks();
      vi.resetModules();
      tokenService = await import('../src/services/tokenService.js');
    });

    it('generates access token with correct claims', () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        role: 'ADMIN',
      };
      const token = tokenService.generateAccessToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('verifies valid access token', () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        role: 'ADMIN',
      };
      const token = tokenService.generateAccessToken(payload);

      const decoded = tokenService.verifyAccessToken(token);

      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('rejects tampered token', () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        role: 'ADMIN',
      };
      const token = tokenService.generateAccessToken(payload);
      const tampered = token.slice(0, -5) + 'xxxxx';

      expect(() => tokenService.verifyAccessToken(tampered)).toThrow();
    });

    it('rejects token with wrong issuer', async () => {
      const jwt = (await import('jsonwebtoken')).default;
      const token = jwt.sign(
        { sub: 'user-1', email: 'test@example.com', role: 'ADMIN' },
        process.env.JWT_ACCESS_SECRET,
        {
          expiresIn: '15m',
          issuer: 'wrong-issuer',
          audience: 'portfolio-admin',
        },
      );

      expect(() => tokenService.verifyAccessToken(token)).toThrow();
    });

    it('rejects token with wrong audience', async () => {
      const jwt = (await import('jsonwebtoken')).default;
      const token = jwt.sign(
        { sub: 'user-1', email: 'test@example.com', role: 'ADMIN' },
        process.env.JWT_ACCESS_SECRET,
        {
          expiresIn: '15m',
          issuer: 'portfolio-api',
          audience: 'wrong-audience',
        },
      );

      expect(() => tokenService.verifyAccessToken(token)).toThrow();
    });

    it('hashes refresh tokens consistently', () => {
      const token = 'test-refresh-token';
      const hash1 = tokenService.hashRefreshToken(token);
      const hash2 = tokenService.hashRefreshToken(token);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it('generates unique refresh tokens', () => {
      const token1 = tokenService.generateRefreshToken();
      const token2 = tokenService.generateRefreshToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe('password security', () => {
    it('hashes password securely', async () => {
      const bcrypt = (await import('bcryptjs')).default;
      const hash = await bcrypt.hash('password123', 12);
      expect(hash).not.toBe('password123');
      expect(hash.startsWith('$2')).toBe(true);
    });

    it('verifies correct password', async () => {
      const bcrypt = (await import('bcryptjs')).default;
      const hash = await bcrypt.hash('password123', 12);
      const isValid = await bcrypt.compare('password123', hash);
      expect(isValid).toBe(true);
    });

    it('rejects incorrect password', async () => {
      const bcrypt = (await import('bcryptjs')).default;
      const hash = await bcrypt.hash('password123', 12);
      const isValid = await bcrypt.compare('wrongpassword', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('input sanitization', () => {
    it('sanitizes HTML in contact messages', async () => {
      const { contactValidationRules } =
        await import('../src/validators/contactValidator.js');

      const mockReq = {
        body: {
          name: '<script>alert("xss")</script>John',
          email: 'test@example.com',
          message: 'Hello <img src=x onerror=alert(1)>',
        },
      };

      for (const rule of contactValidationRules) {
        await rule.run(mockReq);
      }

      expect(mockReq.body.name).not.toContain('<script>');
    });
  });
});

describe('authorization regression tests', () => {
  describe('role-based access control', () => {
    let authorize;

    beforeEach(async () => {
      vi.clearAllMocks();
      vi.resetModules();
      const mod = await import('../src/middlewares/authorize.js');
      authorize = mod.default;
    });

    it('ADMIN can access admin routes', () => {
      const req = { user: { role: 'ADMIN' } };
      const res = {};
      const next = vi.fn();

      authorize('ADMIN')(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('EDITOR cannot access admin-only routes', () => {
      const req = { user: { role: 'EDITOR' } };
      const res = {};
      const next = vi.fn();

      authorize('ADMIN')(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 }),
      );
    });

    it('unauthenticated users are blocked', () => {
      const req = {};
      const res = {};
      const next = vi.fn();

      authorize('ADMIN')(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 }),
      );
    });
  });
});
