/**
 * SocialIcon — Monochrome SVG icons for social platforms.
 *
 * Renders a lightweight inline SVG for known platforms.
 * Unknown platforms fall back to a generic link icon.
 *
 * All icons are `aria-hidden` and `focusable="false"` so they do
 * not add screen-reader noise. The consuming link provides the
 * accessible name via `aria-label`.
 *
 * @param {Object} props
 * @param {string} props.platform - Platform key (e.g. 'github', 'linkedin').
 * @param {string} [props.className] - Additional CSS class.
 * @param {number} [props.size=20] - Icon size in px.
 */
function SocialIcon({ platform, className, size = 20 }) {
  const icon = getIcon(platform);

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      {icon}
    </svg>
  );
}

/**
 * Returns SVG path elements for a known platform.
 * Unknown platforms return a generic link icon.
 *
 * @param {string} platform - Platform key.
 * @returns {React.ReactNode} SVG child elements.
 */
function getIcon(platform) {
  switch (platform) {
    case 'github':
      return (
        <>
          <path d="M9 19c-5 1.5-5 2.5-7 2.5 2 0 2-1 3-2" />
          <path d="M12 19c-5 1.5-5 2.5-7 2.5 2 0 2-1 3-2" />
          <path d="M15 19c5 1.5 5 2.5 7 2.5-2 0-2-1-3-2" />
          <path d="M12 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" />
        </>
      );
    case 'linkedin':
      return (
        <>
          <path d="M16 8v6" />
          <path d="M14 8h2" />
          <path d="M9 16V8" />
          <path d="M3 21V8" />
          <path d="M3 16c0-4 2-6 6-6s6 2 6 6" />
        </>
      );
    case 'twitter':
      return (
        <path d="M23 4a10 10 0 1 1-7 17 10 10 0 0 1 7-17z" />
      );
    case 'leetcode':
      return (
        <>
          <path d="M16 18l6-6-6-6" />
          <path d="M8 6l-6 6 6 6" />
          <path d="M4 12h16" />
        </>
      );
    case 'medium':
      return (
        <>
          <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
        </>
      );
    case 'email':
      return (
        <>
          <path d="M4 4h16v16H4z" />
          <path d="M4 6l8 7 8-7" />
        </>
      );
    case 'phone':
      return (
        <>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
        </>
      );
    case 'location':
      return (
        <>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </>
      );
    default:
      return (
        <>
          <path d="M18 13H6V11h12z" />
          <path d="M20 12l-6-6v4H6v4h8v4z" />
        </>
      );
  }
}

export default SocialIcon;