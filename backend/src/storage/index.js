import { env } from '../config/env.js';
import { LocalStorageProvider } from './providers/index.js';

/**
 * Factory that wires the active storage provider from configuration.
 * Only the local provider is implemented in this milestone.
 *
 * @returns {import('./StorageService.js').default} Configured storage provider.
 */
const createStorageProvider = () => {
  if (env.storage.driver !== 'local') {
    throw new Error(
      `Unsupported storage driver: ${env.storage.driver}. Only "local" is currently supported.`,
    );
  }

  return new LocalStorageProvider({
    uploadDir: env.storage.local.uploadDir,
    publicBaseUrl: env.storage.local.publicBaseUrl,
    maxSizeBytes: env.storage.maxSizeBytes,
    allowedMimeTypes: env.storage.allowedMimeTypes,
  });
};

const storage = createStorageProvider();

export default storage;
