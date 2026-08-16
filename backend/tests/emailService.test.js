import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Mock the env module so the email service can be tested without
 * requiring real environment variables.
 */
vi.mock('../src/config/env.js', () => ({
  env: {
    email: {
      provider: 'smtp',
      from: 'Portfolio <admin@example.com>',
      contactNotificationEmail: 'admin@example.com',
      smtp: {
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        user: 'smtp-user',
        pass: 'smtp-pass',
      },
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

/**
 * Mock the email provider factory so we control the `send` method.
 */
const mockSend = vi.fn();
vi.mock('../src/services/emailProviders/index.js', () => ({
  createEmailProvider: () => ({ send: mockSend }),
}));

const { sendContactNotification, sendMail } = await import(
  '../src/services/emailService.js'
);

describe('emailService', () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  describe('sendContactNotification', () => {
    const mockMessage = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'Hello there',
      message: 'This is a test message that is long enough.',
      createdAt: '2026-01-01T12:00:00.000Z',
      ipAddress: '192.168.1.1',
    };

    it('sends a notification email with correct recipient and sender', async () => {
      mockSend.mockResolvedValue({ messageId: '<test-id>' });

      await sendContactNotification(mockMessage);

      expect(mockSend).toHaveBeenCalledTimes(1);
      const call = mockSend.mock.calls[0][0];

      expect(call.to).toBe('admin@example.com');
      expect(call.from).toBe('Portfolio <admin@example.com>');
      expect(call.replyTo).toBe('jane@example.com');
      expect(call.subject).toContain('Jane Doe');
    });

    it('includes name, email, subject, and message in the email body', async () => {
      mockSend.mockResolvedValue({ messageId: '<test-id>' });

      await sendContactNotification(mockMessage);

      const call = mockSend.mock.calls[0][0];
      expect(call.text).toContain('Jane Doe');
      expect(call.text).toContain('jane@example.com');
      expect(call.text).toContain('Hello there');
      expect(call.text).toContain('This is a test message');
    });

    it('includes submission time and IP address as metadata', async () => {
      mockSend.mockResolvedValue({ messageId: '<test-id>' });

      await sendContactNotification(mockMessage);

      const call = mockSend.mock.calls[0][0];
      expect(call.text).toContain('192.168.1.1');
      expect(call.text).toContain('Jan');
    });

    it('escapes HTML in user-controlled content', async () => {
      mockSend.mockResolvedValue({ messageId: '<test-id>' });

      const maliciousMessage = {
        ...mockMessage,
        name: '<script>alert("xss")</script>Jane',
        subject: '<img src=x onerror=alert(1)>',
        message: '<b>bold</b> <script>evil()</script>',
      };

      await sendContactNotification(maliciousMessage);

      const call = mockSend.mock.calls[0][0];
      expect(call.html).not.toContain('<script>');
      expect(call.html).toContain('&lt;script&gt;');
      expect(call.html).not.toContain('<img src=x onerror=alert(1)>');
    });

    it('propagates errors from the provider', async () => {
      mockSend.mockRejectedValue(new Error('SMTP connection refused'));

      await expect(sendContactNotification(mockMessage)).rejects.toThrow(
        'SMTP connection refused',
      );
    });

    it('handles message without ipAddress', async () => {
      mockSend.mockResolvedValue({ messageId: '<test-id>' });

      await sendContactNotification({
        ...mockMessage,
        ipAddress: undefined,
      });

      const call = mockSend.mock.calls[0][0];
      expect(call.text).toContain('not recorded');
    });
  });

  describe('sendMail', () => {
    it('delegates to the provider send method', async () => {
      mockSend.mockResolvedValue({ messageId: '<raw-id>' });

      await sendMail({
        from: 'test@example.com',
        to: 'recipient@example.com',
        subject: 'Test',
        text: 'Hello',
      });

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend.mock.calls[0][0]).toMatchObject({
        from: 'test@example.com',
        to: 'recipient@example.com',
        subject: 'Test',
        text: 'Hello',
      });
    });
  });
});
