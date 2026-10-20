/**
 * Command registry for the Command Palette.
 * Commands are grouped by category and can be filtered/searched.
 */

/**
 * Creates navigation commands from the navigation configuration.
 * @param {Function} navigate - React Router navigate function
 * @returns {Array} Navigation commands
 */
export function createNavigationCommands(navigate) {
  const navigation = [
    { label: 'Home', path: '/', keywords: ['home', 'landing'] },
    { label: 'About', path: '/about', keywords: ['about', 'bio', 'profile'] },
    { label: 'Experience', path: '/experience', keywords: ['experience', 'work', 'career', 'jobs'] },
    { label: 'Skills', path: '/skills', keywords: ['skills', 'tech', 'stack', 'technologies'] },
    { label: 'Projects', path: '/projects', keywords: ['projects', 'portfolio', 'work', 'apps'] },
    { label: 'Blog', path: '/blog', keywords: ['blog', 'posts', 'articles', 'writing'] },
    { label: 'Education', path: '/education', keywords: ['education', 'school', 'university', 'degree'] },
    { label: 'Contact', path: '/contact', keywords: ['contact', 'email', 'message', 'reach'] },
  ];

  return navigation.map((item) => ({
    id: `nav-${item.path}`,
    title: item.label,
    description: `Go to ${item.label} page`,
    category: 'Navigation',
    keywords: item.keywords,
    action: () => navigate(item.path),
    icon: 'navigation',
  }));
}

/**
 * Creates theme commands using the theme context.
 * @param {string} currentTheme - Current theme ('light' | 'dark')
 * @param {Function} setTheme - Theme setter function
 * @returns {Array} Theme commands
 */
export function createThemeCommands(currentTheme, setTheme) {
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
    isActive: currentTheme === theme.id,
  }));
}

/**
 * Creates resume command using profile data.
 * @param {Object|null} profile - Profile data from API
 * @returns {Array} Resume command (empty if no resume URL)
 */
export function createResumeCommand(profile) {
  const resumeUrl = profile?.resumeUrl || profile?.resume_url;

  if (!resumeUrl) {
    return [];
  }

  return [{
    id: 'action-resume',
    title: 'Open Resume',
    description: 'View or download resume',
    category: 'Actions',
    keywords: ['resume', 'cv', 'download', 'document'],
    action: () => {
      window.open(resumeUrl, '_blank', 'noopener,noreferrer');
    },
    icon: 'document',
  }];
}

/**
 * Creates social commands from social links.
 * @param {Array} socialLinks - Social links from API
 * @returns {Array} Social commands
 */
export function createSocialCommands(socialLinks) {
  if (!socialLinks || !socialLinks.length) {
    return [];
  }

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
    .filter((link) => link.url && (link.url.startsWith('https:') || link.url.startsWith('http:') || link.url.startsWith('mailto:')))
    .map((link) => {
      const platform = link.platform?.toLowerCase();
      return {
        id: `social-${link.id || platform}`,
        title: `Open ${platformLabels[platform] || link.platform}`,
        description: `Visit ${platformLabels[platform] || link.platform} profile`,
        category: 'Social',
        keywords: platformKeywords[platform] || [platform],
        action: () => {
          window.open(link.url, '_blank', 'noopener,noreferrer');
        },
        icon: platform,
      };
    });
}

/**
 * Gets all commands for the palette.
 * This is the main entry point for building the command list.
 * @param {Object} deps - Dependencies (navigate, theme, setTheme, profile, socialLinks)
 * @returns {Array} All commands combined
 */
export function getAllCommands({ navigate, theme, setTheme, profile, socialLinks }) {
  return [
    ...createNavigationCommands(navigate),
    ...createThemeCommands(theme, setTheme),
    ...createResumeCommand(profile),
    ...createSocialCommands(socialLinks),
  ];
}

/**
 * Category order for display.
 */
export const CATEGORY_ORDER = ['Navigation', 'Appearance', 'Actions', 'Social'];

/**
 * Category icons mapping.
 */
export const CATEGORY_ICONS = {
  Navigation: 'navigation',
  Appearance: 'appearance',
  Actions: 'action',
  Social: 'social',
};