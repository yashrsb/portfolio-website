import path from 'node:path';
import fs from 'node:fs';
import { promises as fsp } from 'node:fs';
import crypto from 'node:crypto';
import StorageService from '../StorageService.js';
import ApiError from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';

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
 * Local filesystem implementation of StorageService.
 * All disk access lives here — no other layer touches the filesystem.
 */
class LocalStorageProvider extends StorageService {
  /**
   * @param {object} config - Local storage configuration.
   * @param {string} config.uploadDir - Absolute or relative uploads directory.
   * @param {string} config.publicBaseUrl - Base URL used to build public file URLs.
   * @param {number} config.maxSizeBytes - Maximum allowed file size in bytes.
   * @param {string[]} config.allowedMimeTypes - Allowed MIME types.
   */
  constructor(config) {
    super();
    this.uploadDir = path.resolve(config.uploadDir);
    this.publicBaseUrl = config.publicBaseUrl.replace(/\/+$/, '');
    this.maxSizeBytes = config.maxSizeBytes;
    this.allowedMimeTypes = config.allowedMimeTypes;
  }

  /**
   * Ensures the uploads directory exists.
   * @returns {Promise<void>}
   */
  async init() {
    await fsp.mkdir(this.uploadDir, { recursive: true });
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
    const base = path.basename(filename);
    if (base !== filename) {
      return false;
    }
    // Reject path separators, reserved characters, and ASCII control chars.
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
   * Persists a file to local disk.
   * @param {object} file - Multer file object.
   * @returns {Promise<object>} Stored file metadata.
   */
  async upload(file) {
    await this.validate(file);

    const storedName = generateStoredName(file.mimetype);
    const storageKey = storedName;
    const filePath = path.join(this.uploadDir, storedName);

    await fsp.writeFile(filePath, file.buffer);

    return {
      storageKey,
      storagePath: this.toRelativePath(filePath),
      storedName,
      size: file.size,
    };
  }

  /**
   * Removes a file from disk. No-op when the file is missing.
   * @param {string} storageKey - Stored filename.
   * @returns {Promise<void>}
   */
  async delete(storageKey) {
    if (!storageKey) {
      return;
    }
    const filePath = this.resolveSafePath(storageKey);
    try {
      await fsp.unlink(filePath);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }

  /**
   * Checks whether a file exists on disk.
   * @param {string} storageKey - Stored filename.
   * @returns {Promise<boolean>}
   */
  async exists(storageKey) {
    if (!storageKey) {
      return false;
    }
    try {
      await fsp.access(this.resolveSafePath(storageKey));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Builds the public URL for stored files.
   * @returns {Promise<string>} Public download URL (serves the latest resume).
   */
  async getPublicUrl() {
    return `${this.publicBaseUrl}/resume/download`;
  }

  /**
   * Opens a readable stream for a stored file.
   * @param {string} storageKey - Stored filename.
   * @returns {import('node:stream').Readable} Readable stream.
   */
  createReadStream(storageKey) {
    const filePath = this.resolveSafePath(storageKey);
    return fs.createReadStream(filePath);
  }

  /**
   * Resolves a storage key to an absolute path, guarding against traversal.
   * @param {string} storageKey - Stored filename.
   * @returns {string} Absolute path inside the uploads directory.
   */
  resolveSafePath(storageKey) {
    const resolved = path.resolve(this.uploadDir, storageKey);
    if (!resolved.startsWith(this.uploadDir + path.sep)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Invalid storage key.',
        ERROR_CODES.UNSAFE_FILENAME,
      );
    }
    return resolved;
  }

  /**
   * Converts an absolute path to a relative storage path.
   * @param {string} absolutePath - Absolute file path.
   * @returns {string} Relative path within the uploads directory.
   */
  toRelativePath(absolutePath) {
    return path.relative(this.uploadDir, absolutePath);
  }
}

export default LocalStorageProvider;
