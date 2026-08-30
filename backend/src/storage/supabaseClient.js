import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';

let supabaseClient = null;

/**
 * Returns a singleton Supabase client configured with the server-side
 * secret key. Returns null if Supabase is not configured.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient | null}
 */
export function getSupabaseClient() {
  if (!env.supabase.url || !env.supabase.secretKey) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(env.supabase.url, env.supabase.secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    logger.info('Supabase client initialized', {
      url: env.supabase.url,
      bucket: env.supabase.storageBucket,
    });
  }

  return supabaseClient;
}

/**
 * Resets the cached Supabase client (primarily for testing).
 */
export function resetSupabaseClient() {
  supabaseClient = null;
}

export default getSupabaseClient;
