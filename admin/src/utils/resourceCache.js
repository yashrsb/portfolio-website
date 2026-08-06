/**
 * Lightweight in-memory resource cache.
 *
 * Store: Map<cacheKey, { data, expiresAt }> with a max-entry cap.
 * Supports TTL, deduplication of identical simultaneous GET requests, and
 * manual invalidation.
 */
import { CACHE } from '../constants/api';

/**
 * @typedef {Object} CacheEntry
 * @property {*} data - The cached payload.
 * @property {number} expiresAt - Epoch ms when the entry expires.
 */

/** @type {Map<string, CacheEntry>} */
const store = new Map();

/** @type {Map<string, Promise<*>>} */
const inflight = new Map();

/**
 * Builds a stable cache key from a URL + serializable params.
 * @param {string} url - The request URL.
 * @param {object} [params] - Query params.
 * @returns {string} The cache key.
 */
export const buildKey = (url, params = {}) => {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }
  const sorted = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});
  return `${url}?${JSON.stringify(sorted)}`;
};

/**
 * Returns a cached value if present and not expired.
 * @param {string} key - The cache key.
 * @returns {*} The cached value or undefined.
 */
export const get = (key) => {
  const entry = store.get(key);
  if (!entry) {
    return undefined;
  }
  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return undefined;
  }
  return entry.data;
};

/**
 * Stores a value in the cache with a TTL.
 * @param {string} key - The cache key.
 * @param {*} value - The value to cache.
 * @param {number} [ttl=CACHE.ttl] - Time-to-live in ms.
 */
export const set = (key, value, ttl = CACHE.ttl) => {
  prune();
  store.set(key, { data: value, expiresAt: Date.now() + ttl });
};

/**
 * Deduplicates identical simultaneous GET requests.
 * Returns the in-flight promise when a fetch for the same key is already
 * active, otherwise registers the given promise and clears it on settle.
 * @param {string} key - The cache key.
 * @param {Promise<*>} promise - The fetch promise.
 * @returns {Promise<*>} The shared promise.
 */
export const dedupe = (key, promise) => {
  if (inflight.has(key)) {
    return inflight.get(key);
  }
  inflight.set(key, promise);
  const clear = () => {
    inflight.delete(key);
  };
  promise.then(clear, clear);
  return promise;
};

/**
 * Invalidates a specific cache key.
 * @param {string} key - The cache key to remove.
 */
export const invalidate = (key) => {
  store.delete(key);
};

/**
 * Clears the entire cache.
 */
export const clear = () => {
  store.clear();
};

/**
 * Removes expired entries and enforces the max-entry cap.
 */
const prune = () => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) {
      store.delete(key);
    }
  }
  if (store.size > CACHE.maxEntries) {
    let overflow = store.size - CACHE.maxEntries;
    for (const key of store.keys()) {
      if (overflow <= 0) break;
      store.delete(key);
      overflow -= 1;
    }
  }
};

export default { buildKey, get, set, dedupe, invalidate, clear };
