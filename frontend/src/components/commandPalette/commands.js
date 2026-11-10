/**
 * Command registry for the Command Palette.
 * Commands are grouped by category and can be filtered/searched.
 */

const NAVIGATION_ITEMS = [
  { label: 'Home', path: '/', icon: 'home', keywords: ['home', 'landing'] },
  { label: 'About', path: '/about', icon: 'about', keywords: ['about', 'bio', 'profile'] },
  { label: 'Experience', path: '/experience', icon: 'experience', keywords: ['experience', 'work', 'career', 'jobs'] },
  { label: 'Skills', path: '/skills', icon: 'skills', keywords: ['skills', 'tech', 'stack', 'technologies'] },
  { label: 'Projects', path: '/projects', icon: 'projects', keywords: ['projects', 'portfolio', 'work', 'apps'] },
  { label: 'Blog', path: '/blog', icon: 'blog', keywords: ['blog', 'posts', 'articles', 'writing'] },
  { label: 'Education', path: '/education', icon: 'education', keywords: ['education', 'school', 'university', 'degree'] },
  { label: 'Contact', path: '/contact', icon: 'contact', keywords: ['contact', 'email', 'message', 'reach'] },
];

function safeExternalUrl(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    if (url.startsWith('mailto:')) return url;
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return parsed.toString();
  } catch {
    return null;
  }
  return null;
}

/**
 * Creates navigation commands from the navigation configuration.
 * @param {Function} navigate - React Router navigate function
 * @returns {Array} Navigation commands
 */
export function createNavigationCommands(navigate) {
  return NAVIGATION_ITEMS.map((item) => ({
    id: `nav-${item.path}`,
    title: item.label,
    description: `Go to ${item.label} page`,
    category: 'Navigation',
    keywords: item.keywords,
    action: () => navigate(item.path),
    icon: item.icon,
  }));
}

/**
 * Creates theme commands using the theme context.
 * @param {string} _currentTheme - Resolved theme ('light' | 'dark'), unused for active state
 * @param {Function} setTheme - Theme setter function (accepts preference)
 * @param {string} preference - Current preference ('light' | 'dark' | 'system')
 * @returns {Array} Theme commands
 */
export function createThemeCommands(_currentTheme, setTheme, preference) {
  const themes = [
    { id: 'light', label: 'Light', description: 'Switch to light theme', keywords: ['light', 'day', 'bright'] },
    { id: 'dark', label: 'Dark', description: 'Switch to dark theme', keywords: ['dark', 'night', 'dim'] },
    { id: 'system', label: 'System', description: 'Use system preference', keywords: ['system', 'auto', 'preference'] },
  ];

  return themes.map((theme) => ({
    id: `theme-${theme.id}`,
    title: `${theme.label} Theme`,
    description: theme.description,
    category: 'Appearance',
    keywords: theme.keywords,
    action: () => setTheme(theme.id),
    icon: theme.id,
    isActive: preference === theme.id,
  }));
}

/**
 * Creates resume command using profile data.
 * @param {Object|null} profile - Profile data from API
 * @returns {Array} Resume command (empty if no resume URL)
 */
export function createResumeCommand(profile) {
  const resumeUrl = safeExternalUrl(profile?.resumeUrl || profile?.resume_url);
  if (!resumeUrl) return [];

  return [
    {
      id: 'action-resume',
      title: 'Open Resume',
      description: 'View or download resume',
      category: 'Actions',
      keywords: ['resume', 'cv', 'download', 'document'],
      action: () => {
        window.open(resumeUrl, '_blank', 'noopener,noreferrer');
      },
      icon: 'document',
    },
  ];
}

/**
 * Creates social commands from social links.
 * @param {Array} socialLinks - Social links from API
 * @returns {Array} Social commands
 */
export function createSocialCommands(socialLinks) {
  if (!Array.isArray(socialLinks) || !socialLinks.length) return [];

  const platformLabels = {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
    leetcode: 'LeetCode',
    medium: 'Medium',
    email: 'Email',
  };

  const platformKeywords = {
    github: ['github', 'code', 'repos', 'git'],
    linkedin: ['linkedin', 'linked in', 'professional', 'network'],
    twitter: ['twitter', 'x', 'tweets', 'social'],
    leetcode: ['leetcode', 'algorithms', 'coding', 'problems'],
    medium: ['medium', 'blog', 'articles', 'writing'],
    email: ['email', 'mail', 'contact', 'message'],
  };

  return socialLinks
    .map((link) => {
      const url = safeExternalUrl(link?.url);
      if (!url) return null;
      const platform = (link?.platform || '').toLowerCase();
      return {
        id: `social-${link.id || platform || url}`,
        title: `Open ${platformLabels[platform] || link.platform || 'Social link'}`,
        description: `Visit ${platformLabels[platform] || link.platform || 'profile'}`,
        category: 'Social',
        keywords: platformKeywords[platform] || [platform].filter(Boolean),
        action: () => {
          if (url.startsWith('mailto:')) {
            window.location.href = url;
            return;
          }
          window.open(url, '_blank', 'noopener,noreferrer');
        },
        icon: platform || 'external',
      };
    })
    .filter(Boolean);
}

/**
 * Gets all commands for the palette.
 * @param {Object} deps - Dependencies (navigate, theme, setTheme, preference, profile, socialLinks)
 * @returns {Array} All commands combined
 */
export function getAllCommands({ navigate, theme, setTheme, preference, profile, socialLinks }) {
  return [
    ...createNavigationCommands(navigate),
    ...createThemeCommands(theme, setTheme, preference || theme),
    ...createResumeCommand(profile),
    ...createSocialCommands(socialLinks),
  ];
}

/**
 * Category order for display.
 */
export const CATEGORY_ORDER = ['Navigation', 'Appearance', 'Actions', 'Social'];

/**
 * Category icon kinds (rendered as SVG in the component).
 */
export const CATEGORY_ICONS = {
  Navigation: 'navigation',
  Appearance: 'appearance',
  Actions: 'action',
  Social: 'social',
};
