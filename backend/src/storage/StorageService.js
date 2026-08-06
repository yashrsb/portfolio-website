/**
 * Abstract base class for file storage providers.
 *
 * Implementations expose primitive file operations only. Higher-level
 * workflows (e.g. replace) are orchestrated by the service layer.
 *
 * Storage providers must never leak filesystem paths to callers.
 */
class StorageService {
  /**
   * Persists a file to storage.
   * @param {object} file - Multer file object ({ buffer, mimetype, originalname, size }).
   * @param {object} [options] - Provider-specific options.
   * @returns {Promise<{ storageKey: string, storagePath: string, storedName: string, size: number }>}
   */
  async upload(_file, _options) {
    throw new Error(
      'StorageService.upload() must be implemented by a subclass',
    );
  }

  /**
   * Removes a file from storage. No-op when the file does not exist.
   * @param {string} storageKey - Unique storage key or path of the file.
   * @returns {Promise<void>}
   */
  async delete(_storageKey) {
    throw new Error(
      'StorageService.delete() must be implemented by a subclass',
    );
  }

  /**
   * Checks whether a file exists in storage.
   * @param {string} storageKey - Unique storage key or path of the file.
   * @returns {Promise<boolean>}
   */
  async exists(_storageKey) {
    throw new Error(
      'StorageService.exists() must be implemented by a subclass',
    );
  }

  /**
   * Builds the public URL for a stored file.
   * @param {string} storageKey - Unique storage key or path of the file.
   * @returns {Promise<string>}
   */
  async getPublicUrl(_storageKey) {
    throw new Error(
      'StorageService.getPublicUrl() must be implemented by a subclass',
    );
  }

  /**
   * Validates a file against provider constraints (MIME, size, non-empty,
   * safe filename). Throws ApiError on failure.
   * @param {object} file - Multer file object.
   * @returns {Promise<void>}
   */
  async validate(_file) {
    throw new Error(
      'StorageService.validate() must be implemented by a subclass',
    );
  }

  /**
   * Opens a readable stream for a stored file.
   * @param {string} storageKey - Unique storage key or path of the file.
   * @returns {import('node:stream').Readable}
   */
  createReadStream(_storageKey) {
    throw new Error(
      'StorageService.createReadStream() must be implemented by a subclass',
    );
  }
}

export default StorageService;
