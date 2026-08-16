import { describe, it, expect } from 'vitest';
import { contactValidationRules } from '../src/validators/contactValidator.js';

/**
 * Runs the contact validator chain against a mock request body.
 * @param {object} body - The request body to validate.
 * @returns {Promise<{passed: boolean, errors: Array, sanitizedBody: object}>}
 */
const runValidation = async (body) => {
  const req = { body: { ...body } };
  for (const rule of contactValidationRules) {
    await rule.run(req);
  }
  const { validationResult } = await import('express-validator');
  const result = validationResult(req);
  return {
    passed: result.isEmpty(),
    errors: result.array().map((e) => ({ field: e.path, message: e.msg })),
    sanitizedBody: req.body,
  };
};

describe('contactValidator', () => {
  describe('valid submission', () => {
    it('passes with all required fields correctly filled', async () => {
      const result = await runValidation({
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Hello there',
        message: 'This is a test message that is long enough.',
      });
      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('missing name', () => {
    it('fails when name is empty', async () => {
      const result = await runValidation({
        name: '',
        email: 'jane@example.com',
        subject: 'Hello there',
        message: 'This is a test message that is long enough.',
      });
      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'name',
        message: 'Name is required',
      });
    });

    it('fails when name is missing entirely', async () => {
      const result = await runValidation({
        email: 'jane@example.com',
        subject: 'Hello there',
        message: 'This is a test message that is long enough.',
      });
      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'name',
        message: 'Name is required',
      });
    });
  });

  describe('name length', () => {
    it('fails when name is too short (less than 2 chars)', async () => {
      const result = await runValidation({
        name: 'A',
        email: 'jane@example.com',
        subject: 'Hello there',
        message: 'This is a test message that is long enough.',
      });
      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'name',
        message: 'Name must be between 2 and 100 characters',
      });
    });

    it('fails when name is too long (more than 100 chars)', async () => {
      const result = await runValidation({
        name: 'A'.repeat(101),
        email: 'jane@example.com',
        subject: 'Hello there',
        message: 'This is a test message that is long enough.',
      });
      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'name',
        message: 'Name must be between 2 and 100 characters',
      });
    });
  });

  describe('invalid email', () => {
    it('fails with a malformed email address', async () => {
      const result = await runValidation({
        name: 'Jane Doe',
        email: 'not-an-email',
        subject: 'Hello there',
        message: 'This is a test message that is long enough.',
      });
      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'email',
        message: 'A valid email address is required',
      });
    });

    it('fails when email is empty', async () => {
      const result = await runValidation({
        name: 'Jane Doe',
        email: '',
        subject: 'Hello there',
        message: 'This is a test message that is long enough.',
      });
      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'email',
        message: 'Email is required',
      });
    });
  });

  describe('missing subject', () => {
    it('fails when subject is empty', async () => {
      const result = await runValidation({
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: '',
        message: 'This is a test message that is long enough.',
      });
      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'subject',
        message: 'Subject is required',
      });
    });

    it('fails when subject is too short (less than 5 chars)', async () => {
      const result = await runValidation({
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Hi',
        message: 'This is a test message that is long enough.',
      });
      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'subject',
        message: 'Subject must be between 5 and 150 characters',
      });
    });

    it('fails when subject is too long (more than 150 chars)', async () => {
      const result = await runValidation({
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'A'.repeat(151),
        message: 'This is a test message that is long enough.',
      });
      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'subject',
        message: 'Subject must be between 5 and 150 characters',
      });
    });
  });

  describe('missing message', () => {
    it('fails when message is empty', async () => {
      const result = await runValidation({
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Hello there',
        message: '',
      });
      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'message',
        message: 'Message is required',
      });
    });

    it('fails when message is too short (less than 10 chars)', async () => {
      const result = await runValidation({
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Hello there',
        message: 'Short msg',
      });
      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'message',
        message: 'Message must be between 10 and 2000 characters',
      });
    });

    it('fails when message is too long (more than 2000 chars)', async () => {
      const result = await runValidation({
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Hello there',
        message: 'A'.repeat(2001),
      });
      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'message',
        message: 'Message must be between 10 and 2000 characters',
      });
    });
  });

  describe('sanitization', () => {
    it('escapes HTML in name and subject', async () => {
      const result = await runValidation({
        name: 'Jane <script>alert(1)</script>Doe',
        email: 'jane@example.com',
        subject: 'Hello <b>there</b>',
        message: 'This is a test message that is long enough.',
      });
      expect(result.sanitizedBody.name).toBe(
        'Jane &lt;script&gt;alert(1)&lt;&#x2F;script&gt;Doe',
      );
      expect(result.sanitizedBody.subject).toBe('Hello &lt;b&gt;there&lt;&#x2F;b&gt;');
    });

    it('normalizes email to lowercase', async () => {
      const result = await runValidation({
        name: 'Jane Doe',
        email: 'JANE@Example.COM',
        subject: 'Hello there',
        message: 'This is a test message that is long enough.',
      });
      expect(result.sanitizedBody.email).toBe('jane@example.com');
    });
  });
});
