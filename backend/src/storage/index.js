import { env } from '../config/env.js';
import {
  LocalStorageProvider,
  SupabaseStorageProvider,
} from './providers/index.js';
import { getSupabaseClient } from './supabaseClient.js';
import logger from '../utils/logger.js';

/**
 * Factory that wires the active storage provider from configuration.
 * Supports 'local' and 'supabase' providers.
 *
 * @returns {import('./StorageService.js').default} Configured storage provider.
 */
const createStorageProvider = () => {
  const provider = env.storage.provider;

  if (provider === 'supabase') {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error(
        'Supabase storage provider requires SUPABASE_URL and SUPABASE_SECRET_KEY environment variables.',
      );
    }

    logger.info('Using Supabase Storage provider', {
      bucket: env.supabase.storageBucket,
    });

    return new SupabaseStorageProvider({
      client,
      bucket: env.supabase.storageBucket,
      maxSizeBytes: env.storage.maxSizeBytes,
      allowedMimeTypes: env.storage.allowedMimeTypes,
    });
  }

  if (provider === 'local') {
    if (env.storage.driver !== 'local') {
      throw new Error(
        `Unsupported storage driver: ${env.storage.driver}. Only "local" is currently supported.`,
      );
    }

    logger.info('Using Local Storage provider', {
      uploadDir: env.storage.local.uploadDir,
    });

    return new LocalStorageProvider({
      uploadDir: env.storage.local.uploadDir,
      publicBaseUrl: env.storage.local.publicBaseUrl,
      maxSizeBytes: env.storage.maxSizeBytes,
      allowedMimeTypes: env.storage.allowedMimeTypes,
    });
  }

  throw new Error(
    `Unsupported storage provider: ${provider}. Use "local" or "supabase".`,
  );
};

const storage = createStorageProvider();

export default storage;
