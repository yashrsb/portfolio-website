import { describe, it, expect, beforeEach, vi } from 'vitest';
import SupabaseStorageProvider from '../src/storage/providers/SupabaseStorageProvider.js';

/**
 * Creates a mock Supabase client for testing.
 * @param {object} options - Configuration for the mock.
 * @param {Function} options.uploadFn - Mock upload function.
 * @param {Function} options.removeFn - Mock remove function.
 * @param {Function} options.listFn - Mock list function.
 * @param {Function} options.downloadFn - Mock download function.
 * @param {Function} options.getPublicUrlFn - Mock getPublicUrl function.
 * @returns {object} Mock Supabase client.
 */
const createMockSupabaseClient = (options = {}) => {
  const {
    uploadFn = vi.fn(),
    removeFn = vi.fn(),
    listFn = vi.fn(),
    downloadFn = vi.fn().mockResolvedValue({
      data: new Blob(['test content']),
      error: null,
    }),
    getPublicUrlFn = vi.fn(),
  } = options;

  const bucket = {
    upload: uploadFn,
    remove: removeFn,
    list: listFn,
    download: downloadFn,
    getPublicUrl: getPublicUrlFn,
  };

  return {
    storage: {
      from: vi.fn().mockReturnValue(bucket),
    },
  };
};

describe('SupabaseStorageProvider', () => {
  let mockClient;
  let provider;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();
    provider = new SupabaseStorageProvider({
      client: mockClient,
      bucket: 'resumes',
      maxSizeBytes: 5 * 1024 * 1024,
      allowedMimeTypes: ['application/pdf'],
    });
  });

  describe('constructor', () => {
    it('configures provider with correct settings', () => {
      expect(provider.bucket).toBe('resumes');
      expect(provider.maxSizeBytes).toBe(5 * 1024 * 1024);
      expect(provider.allowedMimeTypes).toEqual(['application/pdf']);
    });
  });

  describe('init', () => {
    it('is a no-op', async () => {
      await expect(provider.init()).resolves.toBeUndefined();
    });
  });

  describe('validate', () => {
    it('rejects null file', async () => {
      await expect(provider.validate(null)).rejects.toThrow('No file was uploaded.');
    });

    it('rejects file with null buffer', async () => {
      await expect(provider.validate({ buffer: null })).rejects.toThrow(
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

      await expect(provider.validate(file)).rejects.toThrow(
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

      await expect(provider.validate(file)).rejects.toThrow(
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

      await expect(provider.validate(file)).rejects.toThrow('Invalid file type.');
    });

    it('rejects filenames with path separators', async () => {
      const file = {
        buffer: Buffer.from('test'),
        mimetype: 'application/pdf',
        originalname: 'path/to/resume.pdf',
        size: 4,
      };

      await expect(provider.validate(file)).rejects.toThrow('unsafe characters');
    });

    it('accepts valid PDF files', async () => {
      const file = {
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf',
        originalname: 'resume.pdf',
        size: 12,
      };

      await expect(provider.validate(file)).resolves.toBeUndefined();
    });
  });

  describe('isSafeFilename', () => {
    it('returns true for simple filenames', () => {
      expect(provider.isSafeFilename('resume.pdf')).toBe(true);
    });

    it('returns false for path traversal', () => {
      expect(provider.isSafeFilename('../etc/passwd')).toBe(false);
    });

    it('returns false for absolute paths', () => {
      expect(provider.isSafeFilename('/etc/passwd')).toBe(false);
    });

    it('returns false for reserved characters', () => {
      expect(provider.isSafeFilename('file<name>.pdf')).toBe(false);
    });

    it('returns false for control characters', () => {
      expect(provider.isSafeFilename('file\x00name.pdf')).toBe(false);
    });
  });

  describe('upload', () => {
    it('uploads file to Supabase Storage', async () => {
      const uploadFn = vi.fn().mockResolvedValue({ data: {}, error: null });
      mockClient.storage.from.mockReturnValue({
        upload: uploadFn,
      });

      const file = {
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf',
        originalname: 'resume.pdf',
        size: 12,
      };

      const result = await provider.upload(file);

      expect(result.storageKey).toBeDefined();
      expect(result.storageKey).toMatch(/\.pdf$/);
      expect(result.size).toBe(12);
      expect(result.storedName).toBe(result.storageKey);

      expect(uploadFn).toHaveBeenCalledWith(
        expect.stringMatching(/\.pdf$/),
        file.buffer,
        expect.objectContaining({
          contentType: 'application/pdf',
          upsert: false,
        }),
      );
    });

    it('throws ApiError on upload failure', async () => {
      const uploadFn = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' },
      });
      mockClient.storage.from.mockReturnValue({
        upload: uploadFn,
      });

      const file = {
        buffer: Buffer.from('test'),
        mimetype: 'application/pdf',
        originalname: 'resume.pdf',
        size: 4,
      };

      await expect(provider.upload(file)).rejects.toThrow(
        'Failed to upload file to storage.',
      );
    });

    it('validates file before upload', async () => {
      const uploadFn = vi.fn();
      mockClient.storage.from.mockReturnValue({
        upload: uploadFn,
      });

      const file = {
        buffer: null,
        mimetype: 'application/pdf',
        originalname: 'resume.pdf',
        size: 0,
      };

      await expect(provider.upload(file)).rejects.toThrow('No file was uploaded.');
      expect(uploadFn).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes file from Supabase Storage', async () => {
      const removeFn = vi.fn().mockResolvedValue({ data: {}, error: null });
      mockClient.storage.from.mockReturnValue({
        remove: removeFn,
      });

      await provider.delete('test-file.pdf');

      expect(removeFn).toHaveBeenCalledWith(['test-file.pdf']);
    });

    it('no-ops for empty storage key', async () => {
      const removeFn = vi.fn();
      mockClient.storage.from.mockReturnValue({
        remove: removeFn,
      });

      await expect(provider.delete('')).resolves.toBeUndefined();
      expect(removeFn).not.toHaveBeenCalled();
    });

    it('no-ops for null storage key', async () => {
      const removeFn = vi.fn();
      mockClient.storage.from.mockReturnValue({
        remove: removeFn,
      });

      await expect(provider.delete(null)).resolves.toBeUndefined();
      expect(removeFn).not.toHaveBeenCalled();
    });

    it('no-ops when file not found', async () => {
      const removeFn = vi.fn().mockResolvedValue({
        data: null,
        error: { statusCode: '404', message: 'Not Found' },
      });
      mockClient.storage.from.mockReturnValue({
        remove: removeFn,
      });

      await expect(provider.delete('nonexistent.pdf')).resolves.toBeUndefined();
    });

    it('throws ApiError on delete failure', async () => {
      const removeFn = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Network error' },
      });
      mockClient.storage.from.mockReturnValue({
        remove: removeFn,
      });

      await expect(provider.delete('test.pdf')).rejects.toThrow(
        'Failed to delete file from storage.',
      );
    });
  });

  describe('exists', () => {
    it('returns true when file exists', async () => {
      const listFn = vi.fn().mockResolvedValue({
        data: [{ name: 'test.pdf' }, { name: 'other.pdf' }],
        error: null,
      });
      mockClient.storage.from.mockReturnValue({
        list: listFn,
      });

      const exists = await provider.exists('test.pdf');
      expect(exists).toBe(true);
    });

    it('returns false when file does not exist', async () => {
      const listFn = vi.fn().mockResolvedValue({
        data: [{ name: 'other.pdf' }],
        error: null,
      });
      mockClient.storage.from.mockReturnValue({
        list: listFn,
      });

      const exists = await provider.exists('test.pdf');
      expect(exists).toBe(false);
    });

    it('returns false for empty storage key', async () => {
      const listFn = vi.fn();
      mockClient.storage.from.mockReturnValue({
        list: listFn,
      });

      const exists = await provider.exists('');
      expect(exists).toBe(false);
      expect(listFn).not.toHaveBeenCalled();
    });

    it('returns false on list error', async () => {
      const listFn = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Network error' },
      });
      mockClient.storage.from.mockReturnValue({
        list: listFn,
      });

      const exists = await provider.exists('test.pdf');
      expect(exists).toBe(false);
    });
  });

  describe('getPublicUrl', () => {
    it('returns bucket base public URL', async () => {
      const getPublicUrlFn = vi.fn().mockReturnValue({
        data: { publicUrl: 'https://project.supabase.co/storage/v1/object/public/resumes/' },
      });
      mockClient.storage.from.mockReturnValue({
        getPublicUrl: getPublicUrlFn,
      });

      const url = await provider.getPublicUrl();

      expect(url).toBe('https://project.supabase.co/storage/v1/object/public/resumes');
      expect(getPublicUrlFn).toHaveBeenCalledWith('');
    });
  });

  describe('getPublicUrlForKey', () => {
    it('returns public URL for specific file', async () => {
      const getPublicUrlFn = vi.fn().mockReturnValue({
        data: { publicUrl: 'https://project.supabase.co/storage/v1/object/public/resumes/test.pdf' },
      });
      mockClient.storage.from.mockReturnValue({
        getPublicUrl: getPublicUrlFn,
      });

      const url = await provider.getPublicUrlForKey('test.pdf');

      expect(url).toBe('https://project.supabase.co/storage/v1/object/public/resumes/test.pdf');
      expect(getPublicUrlFn).toHaveBeenCalledWith('test.pdf');
    });

    it('returns empty string for empty storage key', async () => {
      const getPublicUrlFn = vi.fn();
      mockClient.storage.from.mockReturnValue({
        getPublicUrl: getPublicUrlFn,
      });

      const url = await provider.getPublicUrlForKey('');

      expect(url).toBe('');
      expect(getPublicUrlFn).not.toHaveBeenCalled();
    });
  });

  describe('createReadStream', () => {
    it('returns a Readable stream', () => {
      const stream = provider.createReadStream('test.pdf');
      expect(stream).toBeDefined();
      expect(typeof stream.pipe).toBe('function');
    });
  });
});
