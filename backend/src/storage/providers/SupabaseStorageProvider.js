import crypto from 'node:crypto';
import { Readable } from 'node:stream';
import StorageService from '../StorageService.js';
import ApiError from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';
import logger from '../../utils/logger.js';

/**
 * Determines the file extension from a MIME type.
 * @param {string} mimeType - MIME type.
 * @returns {string} Extension without the leading dot (defaults to 'pdf').
 */
const extensionFor = (mimeType) => {
  const map = {
    'application/pdf': 'pdf',
  };
  return map[mimeType] || 'pdf';
};

/**
 * Generates a cryptographically unique stored filename.
 * @param {string} mimeType - MIME type.
 * @returns {string} Unique stored filename.
 */
const generateStoredName = (mimeType) => {
  const random = crypto.randomBytes(16).toString('hex');
  return `${random}.${extensionFor(mimeType)}`;
};

/**
 * Supabase Storage implementation of StorageService.
 * All Supabase Storage access lives here — no other layer talks to Supabase.
 */
class SupabaseStorageProvider extends StorageService {
  /**
   * @param {object} config - Supabase storage configuration.
   * @param {import('@supabase/supabase-js').SupabaseClient} config.client - Supabase client.
   * @param {string} config.bucket - Storage bucket name.
   * @param {number} config.maxSizeBytes - Maximum allowed file size in bytes.
   * @param {string[]} config.allowedMimeTypes - Allowed MIME types.
   */
  constructor(config) {
    super();
    this.client = config.client;
    this.bucket = config.bucket;
    this.maxSizeBytes = config.maxSizeBytes;
    this.allowedMimeTypes = config.allowedMimeTypes;
  }

  /**
   * No-op for Supabase — bucket is created externally.
   * @returns {Promise<void>}
   */
  async init() {
    // Bucket creation is managed outside the application (Supabase Dashboard/terraform).
  }

  /**
   * Validates a file. Throws ApiError on any violation.
   * @param {object} file - Multer file object.
   * @returns {Promise<void>}
   */
  async validate(file) {
    if (!file || !file.buffer) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'No file was uploaded.',
        ERROR_CODES.EMPTY_FILE,
      );
    }

    if (file.size === 0 || file.buffer.length === 0) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'The uploaded file is empty.',
        ERROR_CODES.EMPTY_FILE,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Invalid file type. Allowed: ${this.allowedMimeTypes.join(', ')}.`,
        ERROR_CODES.INVALID_FILE_TYPE,
      );
    }

    if (file.size > this.maxSizeBytes) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `File exceeds the maximum allowed size of ${this.maxSizeBytes} bytes.`,
        ERROR_CODES.FILE_TOO_LARGE,
      );
    }

    if (file.originalname && !this.isSafeFilename(file.originalname)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'The uploaded filename contains unsafe characters.',
        ERROR_CODES.UNSAFE_FILENAME,
      );
    }
  }

  /**
   * Checks whether a filename is safe (no path traversal, no control chars).
   * @param {string} filename - Original filename.
   * @returns {boolean} True when safe.
   */
  isSafeFilename(filename) {
    const base = filename.split('/').pop();
    if (base !== filename) {
      return false;
    }
    const reserved = /[\\/<>:"|?*]/;
    if (reserved.test(filename)) {
      return false;
    }
    for (let i = 0; i < filename.length; i += 1) {
      const code = filename.charCodeAt(i);
      if (code < 0x20 || code === 0x7f) {
        return false;
      }
    }
    return true;
  }

  /**
   * Persists a file to Supabase Storage.
   * @param {object} file - Multer file object.
   * @returns {Promise<{ storageKey: string, storagePath: string, storedName: string, size: number }>}
   */
  async upload(file) {
    await this.validate(file);

    const storedName = generateStoredName(file.mimetype);
    const storageKey = storedName;

    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(storageKey, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      logger.error('Supabase upload failed', {
        error: error.message,
        storageKey,
      });
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Failed to upload file to storage.',
        ERROR_CODES.INTERNAL_SERVER_ERROR,
      );
    }

    logger.info('File uploaded to Supabase Storage', {
      storageKey,
      bucket: this.bucket,
      size: file.size,
    });

    return {
      storageKey,
      storagePath: storageKey,
      storedName,
      size: file.size,
    };
  }

  /**
   * Removes a file from Supabase Storage. No-op when the file is missing.
   * @param {string} storageKey - Stored filename.
   * @returns {Promise<void>}
   */
  async delete(storageKey) {
    if (!storageKey) {
      return;
    }

    const { error } = await this.client.storage
      .from(this.bucket)
      .remove([storageKey]);

    if (error) {
      // Supabase returns an error if the file doesn't exist — treat as no-op
      if (error.statusCode === '404' || error.message?.includes('not found')) {
        logger.warn('Supabase delete: file not found', { storageKey });
        return;
      }
      logger.error('Supabase delete failed', {
        error: error.message,
        storageKey,
      });
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Failed to delete file from storage.',
        ERROR_CODES.INTERNAL_SERVER_ERROR,
      );
    }

    logger.info('File deleted from Supabase Storage', {
      storageKey,
      bucket: this.bucket,
    });
  }

  /**
   * Checks whether a file exists in Supabase Storage.
   * @param {string} storageKey - Stored filename.
   * @returns {Promise<boolean>}
   */
  async exists(storageKey) {
    if (!storageKey) {
      return false;
    }

    // Use list with search to check existence — more efficient than download
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .list('', { search: storageKey });

    if (error) {
      logger.error('Supabase exists check failed', {
        error: error.message,
        storageKey,
      });
      return false;
    }

    return data?.some((item) => item.name === storageKey) ?? false;
  }

  /**
   * Builds the public URL for a stored file.
   * @returns {Promise<string>} Public download URL for the latest resume.
   */
  async getPublicUrl() {
    // Return the base public URL for the bucket — the download endpoint
    // will resolve the actual file. This matches the local provider's behavior.
    const { data } = this.client.storage
      .from(this.bucket)
      .getPublicUrl('');

    // Remove trailing slash for consistency
    return data.publicUrl.replace(/\/+$/, '');
  }

  /**
   * Gets the public URL for a specific storage key.
   * @param {string} storageKey - Stored filename.
   * @returns {Promise<string>} Public URL for the file.
   */
  async getPublicUrlForKey(storageKey) {
    if (!storageKey) {
      return '';
    }
    const { data } = this.client.storage
      .from(this.bucket)
      .getPublicUrl(storageKey);
    return data.publicUrl;
  }

  /**
   * Opens a readable stream for a stored file.
   * Downloads the file from Supabase and returns a Readable stream.
   * @param {string} storageKey - Stored filename.
   * @returns {import('node:stream').Readable} Readable stream.
   */
  createReadStream(storageKey) {
    // Return a pasynchronous stream that downloads on first read
    let buffer = null;
    let error = null;

    const stream = new Readable({
      read() {
        if (buffer) {
          this.push(buffer);
          this.push(null);
        } else if (error) {
          this.destroy(error);
        }
        // Otherwise, wait for the async download to complete
      },
    });

    // Kick off the download asynchronously
    this._downloadToBuffer(storageKey)
      .then((result) => {
        buffer = result;
        // Trigger the read again now that we have data
        stream.read();
      })
      .catch((err) => {
        error = err;
        stream.destroy(err);
      });

    return stream;
  }

  /**
   * Downloads a file from Supabase Storage to a buffer.
   * @param {string} storageKey - Stored filename.
   * @returns {Promise<Buffer>}
   */
  async _downloadToBuffer(storageKey) {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .download(storageKey);

    if (error) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        'Resume file not found.',
        ERROR_CODES.FILE_NOT_FOUND,
      );
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

export default SupabaseStorageProvider;
