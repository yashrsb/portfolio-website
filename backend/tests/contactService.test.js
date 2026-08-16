import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Mock Prisma repository layer so tests never hit a real database.
 */
const mockCreateContactMessage = vi.fn();
const mockUpdateContactEmailStatus = vi.fn();
vi.mock('../src/repositories/index.js', () => ({
  findProjects: vi.fn(),
  findExperience: vi.fn(),
  findSkills: vi.fn(),
  findEducation: vi.fn(),
  findProfile: vi.fn(),
  findSocial: vi.fn(),
  createContactMessage: (...args) => mockCreateContactMessage(...args),
  updateContactEmailStatus: (...args) =>
    mockUpdateContactEmailStatus(...args),
}));

/**
 * Mock email service so tests never send real emails.
 */
const mockSendContactNotification = vi.fn();
vi.mock('../src/services/emailService.js', () => ({
  sendContactNotification: (...args) => mockSendContactNotification(...args),
  sendMail: vi.fn(),
}));

vi.mock('../src/utils/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

const { submitContact } = await import('../src/services/portfolioService.js');

describe('portfolioService.submitContact', () => {
  const mockContact = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    subject: 'Hello there',
    message: 'This is a test message that is long enough.',
  };

  const mockMetadata = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 TestBrowser',
  };

  const mockCreatedMessage = {
    id: 'msg-123',
    name: 'Jane Doe',
    email: 'jane@example.com',
    subject: 'Hello there',
    message: 'This is a test message that is long enough.',
    status: 'new',
    createdAt: new Date('2026-01-01T12:00:00.000Z'),
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 TestBrowser',
    emailStatus: 'pending',
  };

  beforeEach(() => {
    mockCreateContactMessage.mockReset();
    mockUpdateContactEmailStatus.mockReset();
    mockSendContactNotification.mockReset();
  });

  it('persists the message with metadata', async () => {
    mockCreateContactMessage.mockResolvedValue(mockCreatedMessage);
    mockSendContactNotification.mockResolvedValue({ messageId: '<test>' });
    mockUpdateContactEmailStatus.mockResolvedValue({});

    await submitContact(mockContact, mockMetadata);

    expect(mockCreateContactMessage).toHaveBeenCalledTimes(1);
    expect(mockCreateContactMessage).toHaveBeenCalledWith(mockContact, mockMetadata);
  });

  it('sends a notification email after persistence', async () => {
    mockCreateContactMessage.mockResolvedValue(mockCreatedMessage);
    mockSendContactNotification.mockResolvedValue({ messageId: '<test>' });
    mockUpdateContactEmailStatus.mockResolvedValue({});

    await submitContact(mockContact, mockMetadata);

    expect(mockSendContactNotification).toHaveBeenCalledTimes(1);
    expect(mockSendContactNotification).toHaveBeenCalledWith({
      name: mockCreatedMessage.name,
      email: mockCreatedMessage.email,
      subject: mockCreatedMessage.subject,
      message: mockCreatedMessage.message,
      createdAt: mockCreatedMessage.createdAt.toISOString(),
      ipAddress: mockCreatedMessage.ipAddress,
    });
    expect(mockUpdateContactEmailStatus).toHaveBeenCalledWith(
      mockCreatedMessage.id,
      {
        emailStatus: 'sent',
        emailSentAt: expect.any(Date),
        emailError: null,
      },
    );
  });

  it('returns a safe response without email provider details', async () => {
    mockCreateContactMessage.mockResolvedValue(mockCreatedMessage);
    mockSendContactNotification.mockResolvedValue({ messageId: '<test>' });
    mockUpdateContactEmailStatus.mockResolvedValue({});

    const result = await submitContact(mockContact, mockMetadata);

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('createdAt');
    expect(result.id).toBe(mockCreatedMessage.id);
    expect(result).not.toHaveProperty('emailError');
    expect(result).not.toHaveProperty('emailStatus');
    expect(result).not.toHaveProperty('message');
  });

  it('persists the message and marks email failed when notification fails', async () => {
    mockCreateContactMessage.mockResolvedValue(mockCreatedMessage);
    mockSendContactNotification.mockRejectedValue(
      new Error('SMTP connection refused'),
    );
    mockUpdateContactEmailStatus.mockResolvedValue({});

    const result = await submitContact(mockContact, mockMetadata);

    // The visitor still gets a successful response.
    expect(result.id).toBe(mockCreatedMessage.id);

    // Email failure is recorded in the database.
    expect(mockUpdateContactEmailStatus).toHaveBeenCalledWith(
      mockCreatedMessage.id,
      {
        emailStatus: 'failed',
        emailError: 'SMTP connection refused',
      },
    );
  });

  it('still returns success when email fails (no error thrown to caller)', async () => {
    mockCreateContactMessage.mockResolvedValue(mockCreatedMessage);
    mockSendContactNotification.mockRejectedValue(
      new Error('Provider timeout'),
    );
    mockUpdateContactEmailStatus.mockResolvedValue({});

    await expect(
      submitContact(mockContact, mockMetadata),
    ).resolves.toEqual({
      id: mockCreatedMessage.id,
      createdAt: mockCreatedMessage.createdAt,
    });
  });

  it('still persists message even if email status update fails', async () => {
    mockCreateContactMessage.mockResolvedValue(mockCreatedMessage);
    mockSendContactNotification.mockRejectedValue(
      new Error('SMTP connection refused'),
    );
    mockUpdateContactEmailStatus.mockRejectedValue(
      new Error('DB write error'),
    );

    // Should not throw — the message is already stored.
    const result = await submitContact(mockContact, mockMetadata);
    expect(result.id).toBe(mockCreatedMessage.id);
  });

  it('works with empty metadata (no ipAddress/userAgent)', async () => {
    mockCreateContactMessage.mockResolvedValue(mockCreatedMessage);
    mockSendContactNotification.mockResolvedValue({ messageId: '<test>' });
    mockUpdateContactEmailStatus.mockResolvedValue({});

    await submitContact(mockContact, {});

    expect(mockCreateContactMessage).toHaveBeenCalledWith(mockContact, {});
  });
});
