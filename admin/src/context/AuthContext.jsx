/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Mock authentication state.
 *
 * IMPORTANT: This is UI-only for Phase 7. Real authentication
 * (JWT, cookies, refresh tokens) will be implemented in Phase 8.
 *
 * @typedef {Object} AuthState
 * @property {boolean} isAuthenticated - Whether a user is logged in
 * @property {Object|null} user - The mock logged-in user
 * @property {(email: string, password: string, remember: boolean) => void} login
 * @property {() => void} logout
 */

/**
 * @type {React.Context<AuthState>}
 */
const AuthContext = createContext(undefined);

/**
 * Mock user object. Replaced by a real session in Phase 8.
 */
const MOCK_USER = {
  name: 'Alex Chen',
  email: 'admin@example.com',
  role: 'Administrator',
};

/**
 * AuthProvider — provides mock authentication state.
 * Login accepts any non-empty credentials for now.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const isAuthenticated = user !== null;

  const login = useCallback((email, _password, remember) => {
    // eslint-disable-next-line no-unused-vars
    const _remember = remember;
    setUser({ ...MOCK_USER, email });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access mock authentication state.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
