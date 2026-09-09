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
 *
 * Accepts a thunk so the request function is only invoked when no identical
 * request is already in flight. This prevents wasted network calls and avoids
 * the bug where a canceled request's rejection is shared with a fresh caller.
 *
 * If an AbortSignal is provided, the in-flight entry is removed as soon as
 * the signal fires, so the next caller starts a fresh request instead of
 * inheriting a canceled promise.
 *
 * @param {string} key - The cache key.
 * @param {() => Promise<*>} fn - Factory that returns the fetch promise.
 * @param {AbortSignal} [signal] - Optional cancellation signal.
 * @returns {Promise<*>} The shared promise.
 */
export const dedupe = (key, fn, signal) => {
  const existing = inflight.get(key);
  if (existing) {
    // If the existing request was canceled, drop it and start fresh so the
    // caller doesn't inherit a settled-with-cancel promise.
    if (existing._canceled) {
      inflight.delete(key);
    } else {
      return existing;
    }
  }

  const promise = fn();
  inflight.set(key, promise);
  const clear = () => {
    if (inflight.get(key) === promise) {
      inflight.delete(key);
    }
  };
  promise.then(clear, clear);

  // If a signal is provided, remove the inflight entry when it fires so the
  // next caller can start a fresh request.
  if (signal) {
    const onAbort = () => {
      promise._canceled = true;
      clear();
    };
    if (signal.aborted) {
      onAbort();
    } else {
      signal.addEventListener('abort', onAbort, { once: true });
    }
  }

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
