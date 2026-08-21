import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import { promises as fsp } from 'node:fs';
import os from 'node:os';
import LocalStorageProvider from '../src/storage/providers/LocalStorageProvider.js';

describe('LocalStorageProvider', () => {
  let tempDir;
  let uploadDir;
  let provider;

  beforeEach(async () => {
    tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'storage-test-'));
    uploadDir = path.join(tempDir, 'uploads');
    provider = new LocalStorageProvider({
      uploadDir,
      publicBaseUrl: 'http://localhost:5001/api/v1',
      maxSizeBytes: 5 * 1024 * 1024,
      allowedMimeTypes: ['application/pdf'],
    });
    await provider.init();
  });

  afterEach(async () => {
    await fsp.rm(tempDir, { recursive: true, force: true });
  });

  it('resolves uploadDir to an absolute path', () => {
    expect(path.isAbsolute(provider.uploadDir)).toBe(true);
  });

  it('prevents path traversal via resolveSafePath', () => {
    expect(() => provider.resolveSafePath('../../etc/passwd')).toThrow(
      'Invalid storage key.',
    );
  });

  it('prevents path traversal via resolveSafePath with absolute path', () => {
    expect(() => provider.resolveSafePath('/etc/passwd')).toThrow(
      'Invalid storage key.',
    );
  });

  it('allows valid storage keys within upload directory', async () => {
    const resolved = provider.resolveSafePath('abc123.pdf');
    expect(resolved).toBe(path.join(uploadDir, 'abc123.pdf'));
  });

  it('uploads file to the configured upload directory', async () => {
    const file = {
      buffer: Buffer.from('test content'),
      mimetype: 'application/pdf',
      originalname: 'resume.pdf',
      size: 12,
    };

    const result = await provider.upload(file);
    expect(result.storageKey).toBeDefined();
    expect(result.size).toBe(12);

    const filePath = path.join(uploadDir, result.storageKey);
    const content = await fsp.readFile(filePath, 'utf8');
    expect(content).toBe('test content');
  });

  it('deletes files that exist', async () => {
    const file = {
      buffer: Buffer.from('test'),
      mimetype: 'application/pdf',
      originalname: 'resume.pdf',
      size: 4,
    };

    const result = await provider.upload(file);
    const filePath = path.join(uploadDir, result.storageKey);
    expect(fs.existsSync(filePath)).toBe(true);

    await provider.delete(result.storageKey);
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it('delete no-ops for non-existent storage keys', async () => {
    await expect(provider.delete('nonexistent.pdf')).resolves.toBeUndefined();
  });

  it('exists returns true for uploaded files', async () => {
    const file = {
      buffer: Buffer.from('test'),
      mimetype: 'application/pdf',
      originalname: 'resume.pdf',
      size: 4,
    };

    const result = await provider.upload(file);
    const exists = await provider.exists(result.storageKey);
    expect(exists).toBe(true);
  });

  it('exists returns false for non-existent files', async () => {
    const exists = await provider.exists('nonexistent.pdf');
    expect(exists).toBe(false);
  });

  it('returns empty string for empty storage key in exists', async () => {
    const exists = await provider.exists('');
    expect(exists).toBe(false);
  });

  it('rejects empty file uploads', async () => {
    await expect(provider.upload({ buffer: null })).rejects.toThrow(
      'No file was uploaded.',
    );
  });

  it('rejects zero-size files', async () => {
    const file = {
      buffer: Buffer.alloc(0),
      mimetype: 'application/pdf',
      originalname: 'empty.pdf',
      size: 0,
    };

    await expect(provider.upload(file)).rejects.toThrow(
      'The uploaded file is empty.',
    );
  });

  it('rejects files exceeding max size', async () => {
    const file = {
      buffer: Buffer.alloc(6 * 1024 * 1024),
      mimetype: 'application/pdf',
      originalname: 'large.pdf',
      size: 6 * 1024 * 1024,
    };

    await expect(provider.upload(file)).rejects.toThrow(
      'File exceeds the maximum allowed size',
    );
  });

  it('rejects disallowed MIME types', async () => {
    const file = {
      buffer: Buffer.from('test'),
      mimetype: 'image/png',
      originalname: 'image.png',
      size: 4,
    };

    await expect(provider.upload(file)).rejects.toThrow(
      'Invalid file type.',
    );
  });

  it('rejects filenames with path separators', async () => {
    const file = {
      buffer: Buffer.from('test'),
      mimetype: 'application/pdf',
      originalname: 'path/to/resume.pdf',
      size: 4,
    };

    await expect(provider.upload(file)).rejects.toThrow(
      'unsafe characters',
    );
  });
});
