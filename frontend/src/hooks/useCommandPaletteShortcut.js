import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook to handle global keyboard shortcuts for opening the command palette.
 * Supports Cmd+K (Mac) and Ctrl+K (Windows/Linux).
 * Respects IME composition and prevents default browser behavior when palette opens.
 *
 * @param {Function} onOpen - Callback to open the command palette
 * @param {boolean} [enabled=true] - Whether the shortcut is enabled
 */
export function useCommandPaletteShortcut(onOpen, enabled = true) {
  const isComposingRef = useRef(false);

  const handleKeyDown = useCallback(
    (event) => {
      if (!enabled) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierPressed = isMac ? event.metaKey : event.ctrlKey;

      if (!modifierPressed || event.key.toLowerCase() !== 'k') {
        return;
      }

      if (isComposingRef.current) {
        return;
      }

      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable);

      if (isInputFocused && !activeElement.closest('[data-command-palette]')) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      onOpen();
    },
    [enabled, onOpen]
  );

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('compositionstart', handleCompositionStart);
    window.addEventListener('compositionend', handleCompositionEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('compositionstart', handleCompositionStart);
      window.removeEventListener('compositionend', handleCompositionEnd);
    };
  }, [handleKeyDown, handleCompositionStart, handleCompositionEnd]);
}

export default useCommandPaletteShortcut;