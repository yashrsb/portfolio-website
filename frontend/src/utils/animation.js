/**
 * Animation utility functions.
 * Pure helpers — no side effects unless documented.
 */

/**
 * Animate a numeric value from `start` to `end` over `duration` ms.
 * Calls `onUpdate` with the current value each frame.
 * Uses requestAnimationFrame for smooth, efficient updates.
 *
 * @param {Object} options
 * @param {number} options.start - Starting value
 * @param {number} options.end - Target value
 * @param {number} options.duration - Animation duration in ms
 * @param {(value: number) => void} options.onUpdate - Frame callback
 * @returns {() => void} Cancel function
 *
 * @example
 * const cancel = animateValue({
 *   start: 0,
 *   end: 100,
 *   duration: 1200,
 *   onUpdate: (val) => setCount(Math.round(val)),
 * });
 * // Later: cancel();
 */
export function animateValue({ start, end, duration, onUpdate }) {
  const startTime = performance.now();
  let cancelled = false;

  function step(currentTime) {
    if (cancelled) return;

    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = start + (end - start) * eased;

    onUpdate(currentValue);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);

  return () => {
    cancelled = true;
  };
}

/**
 * Calculate typing animation state for a given text string.
 *
 * @param {string} text - Full text to type out
 * @param {number} charIndex - Current character index (0 to text.length)
 * @returns {string} Visible portion of the text
 */
export function getTypedText(text, charIndex) {
  return text.slice(0, charIndex);
}
