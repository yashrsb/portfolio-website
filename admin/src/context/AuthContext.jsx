/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services';
import { clearSession } from '../services/tokenStore';
import { normalizeApiError } from '../utils/apiErrors';

/**
 * @typedef {Object} AuthState
 * @property {boolean} isAuthenticated - Whether a user is logged in.
 * @property {boolean} loading - True while restoring the session on boot.
 * @property {import('../services/types.js').User|null} user - The current user.
 * @property {(email: string, password: string, remember: boolean) => Promise<void>} login
 * @property {() => Promise<void>} logout
 * @property {() => Promise<void>} refresh
 * @property {() => Promise<import('../services/types.js').User>} me
 */

/**
 * @type {React.Context<AuthState>}
 */
const AuthContext = createContext(undefined);

/**
 * AuthProvider — manages the real authentication lifecycle.
 *
 * On mount it attempts to restore the session by calling /auth/me using the
 * refresh cookie (if an access token is present). During this time `loading`
 * is true so protected routes can show a loading state instead of flashing
 * the login page.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = user !== null;

  /**
   * Restores the session on first load.
   */
  useEffect(() => {
    let active = true;

    const restore = async () => {
      try {
        const currentUser = await authService.me();
        if (active) setUser(currentUser);
      } catch {
        // No valid session — leave user null.
        clearSession();
      } finally {
        if (active) setLoading(false);
      }
    };

    restore();
    return () => {
      active = false;
    };
  }, []);

/**
   * Logs a user in with real credentials.
   * @param {string} email - User email.
   * @param {string} password - User password.
   * @returns {Promise<void>}
   */
  const login = useCallback(async (email, password) => {
    try {
      const currentUser = await authService.login(email, password);
      setUser(currentUser);
    } catch (error) {
      const normalized = normalizeApiError(error);
      throw normalized;
    }
  }, []);

  /**
   * Logs the current user out.
   * @returns {Promise<void>}
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
      setUser(null);
    }
  }, []);

  /**
   * Refreshes the session and updates the current user.
   * @returns {Promise<void>}
   */
  const refresh = useCallback(async () => {
    const currentUser = await authService.me();
    setUser(currentUser);
  }, []);

  /**
   * Fetches the current user without mutating state.
   * @returns {Promise<import('../services/types.js').User>} The current user.
   */
  const me = useCallback(() => authService.me(), []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, loading, user, login, logout, refresh, me }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication state and helpers.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
