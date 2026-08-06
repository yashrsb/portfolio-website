import { useState, useCallback, useEffect, useRef } from 'react';
import { useBlocker } from 'react-router-dom';

/** Text shown in the native beforeunload confirmation dialog. */
const UNLOAD_MESSAGE =
  'You have unsaved changes. Are you sure you want to leave this page?';

/**
 * useDirtyForm — tracks whether a form has unsaved changes and protects the
 * user from accidentally navigating away.
 *
 * - Sets `beforeunload` protection when dirty.
 * - Uses a react-router blocker to intercept in-app navigation.
 * - Exposes `markDirty`, `resetDirty`, and `isDirty`.
 *
 * @param {Object} [options] - Configuration.
 * @param {string} [options.message] - Custom confirmation message for in-app navigation.
 * @param {boolean} [options.enabled=true] - Whether protection is active.
 * @returns {{
 *   isDirty: boolean,
 *   markDirty: () => void,
 *   resetDirty: () => void,
 *   proceed: () => void,
 *   blockNavigation: boolean,
 * }}
 */
function useDirtyForm(options = {}) {
  const { message = 'You have unsaved changes. Discard them?', enabled = true } =
    options;

  const [isDirty, setIsDirty] = useState(false);
  const [blockNavigation, setBlockNavigation] = useState(false);
  const proceedRef = useRef(null);

  /**
   * Marks the form as having unsaved changes.
   */
  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  /**
   * Clears the dirty flag (after a successful save or an intentional discard).
   */
  const resetDirty = useCallback(() => {
    setIsDirty(false);
    if (proceedRef.current) {
      proceedRef.current();
      proceedRef.current = null;
    }
  }, []);

  // beforeunload protection for hard reloads / tab close.
  useEffect(() => {
    if (!enabled || !isDirty) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = UNLOAD_MESSAGE;
      return UNLOAD_MESSAGE;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, isDirty]);

  // react-router blocker for in-app navigation.
  const blocker = useBlocker(
    useCallback(() => isDirty && enabled, [isDirty, enabled]),
  );

  // When the blocker triggers, expose a confirm dialog to the UI.
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setBlockNavigation(true);
      proceedRef.current = blocker.proceed;
    } else {
      setBlockNavigation(false);
    }
  }, [blocker.state, blocker.proceed]);

  /**
   * Confirms leaving the page and discards unsaved changes.
   */
  const confirmLeave = useCallback(() => {
    if (proceedRef.current) {
      setIsDirty(false);
      proceedRef.current();
      proceedRef.current = null;
    }
    setBlockNavigation(false);
  }, []);

  /**
   * Cancels navigation and stays on the page.
   */
  const cancelLeave = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
    proceedRef.current = null;
    setBlockNavigation(false);
  }, [blocker]);

  return {
    isDirty,
    markDirty,
    resetDirty,
    blockNavigation,
    message,
    confirmLeave,
    cancelLeave,
  };
}

export { useDirtyForm };
export default useDirtyForm;
