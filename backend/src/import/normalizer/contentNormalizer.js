/**
 * Normalizes parsed portfolio data into Prisma-compatible create/update payloads.
 *
 * Responsibilities:
 *   - Convert date strings to Date objects
 *   - Map YAML field names to Prisma field names
 *   - Ensure correct types (arrays, booleans, integers)
 *   - Set default values where missing
 *   - Assign displayOrder based on array position
 */

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/**
 * Parses a "Mon YYYY" string into a Date object (first day of the month).
 * @param {string} str - e.g. "Jan 2022"
 * @returns {Date}
 */
const parseMonthYear = (str) => {
  if (!str) return null;
  return new Date(`${str} 01 GMT+0000`);
};

/**
 * Determines startDate, endDate, and current from YAML experience data.
 * @param {{ startDate?: string, endDate?: string|null, current?: boolean }} item
 * @returns {{ startDate: Date, endDate: Date|null, current: boolean }}
 */
const normalizeExperienceDates = (item) => {
  const startDate = parseMonthYear(item.startDate);
  const endDate = item.current ? null : parseMonthYear(item.endDate);
  return {
    startDate,
    endDate,
    current: Boolean(item.current),
  };
};

// ---------------------------------------------------------------------------
// Normalizers
// ---------------------------------------------------------------------------

/**
 * Normalizes profile data for Prisma upsert.
 * @param {object} profile - Parsed profile data.
 * @returns {object} Prisma-compatible profile payload.
 */
export function normalizeProfile(profile) {
  return {
    name: profile.name,
    headline: profile.headline,
    tagline: profile.tagline || '',
    bio: profile.bio || '',
    interests: profile.interests || [],
    goals: profile.goals || [],
    strengths: profile.strengths || [],
    stats: profile.stats || {},
    contact: profile.contact || {},
    resumeUrl: profile.resumeUrl || '#',
    profileImageUrl: profile.profileImageUrl || null,
  };
}

/**
 * Normalizes an experience entry for Prisma.
 * @param {object} item - Parsed experience data.
 * @param {number} index - Display order index.
 * @returns {object} Prisma-compatible experience payload.
 */
export function normalizeExperience(item, index) {
  const { startDate, endDate, current } = normalizeExperienceDates(item);
  return {
    company: item.company,
    companyWebsite: item.companyWebsite || null,
    role: item.role,
    startDate,
    endDate,
    current,
    location: item.location || '',
    description: item.description || '',
    technologies: item.technologies || [],
    responsibilities: item.responsibilities || [],
    achievements: item.achievements || [],
    displayOrder: index,
  };
}

/**
 * Normalizes a project entry for Prisma.
 * @param {object} item - Parsed project data.
 * @param {number} index - Display order index.
 * @returns {object} Prisma-compatible project payload.
 */
export function normalizeProject(item, index) {
  return {
    slug: item.slug,
    title: item.title,
    description: item.description,
    summary: item.summary || null,
    imageUrl: item.imageUrl || null,
    githubUrl: item.githubUrl || null,
    demoUrl: item.demoUrl || null,
    status: item.status || 'live',
    featured: Boolean(item.featured),
    displayOrder: index,
    tags: item.tags || [],
    features: item.features || [],
    techStack: item.techStack || null,
    challenges: item.challenges || [],
    lessonsLearned: item.lessonsLearned || [],
    architecture: item.architecture || null,
    architectureImage: item.architectureImage || null,
    screenshots: item.screenshots || null,
  };
}

/**
 * Normalizes a skill entry for Prisma.
 * @param {object} item - Parsed skill data.
 * @param {number} index - Display order index within its category.
 * @returns {object} Prisma-compatible skill payload.
 */
export function normalizeSkill(item) {
  return {
    name: item.name,
    category: item.category,
    proficiency: item.proficiency,
    icon: item.icon || '',
    displayOrder: 0,
  };
}

/**
 * Normalizes an education entry for Prisma.
 * @param {object} item - Parsed education data.
 * @param {number} index - Display order index.
 * @returns {object} Prisma-compatible education payload.
 */
export function normalizeEducation(item, index) {
  return {
    institution: item.institution,
    degree: item.degree,
    fieldOfStudy: item.fieldOfStudy || null,
    startYear: item.startYear,
    endYear: item.endYear,
    grade: item.grade || null,
    highlights: item.highlights || [],
    displayOrder: index,
  };
}

/**
 * Normalizes a certificate entry for Prisma.
 * @param {object} item - Parsed certificate data.
 * @param {number} index - Display order index.
 * @returns {object} Prisma-compatible certificate payload.
 */
export function normalizeCertificate(item, index) {
  return {
    name: item.name,
    issuer: item.issuer,
    date: item.date,
    url: item.url || null,
    displayOrder: index,
  };
}

/**
 * Normalizes an achievement entry for Prisma.
 * @param {object} item - Parsed achievement data.
 * @param {number} index - Display order index.
 * @returns {object} Prisma-compatible achievement payload.
 */
export function normalizeAchievement(item, index) {
  return {
    title: item.title,
    organization: item.organization,
    year: item.year,
    description: item.description || '',
    displayOrder: index,
  };
}

/**
 * Normalizes a social link entry for Prisma.
 * @param {object} item - Parsed social link data.
 * @param {number} index - Display order index.
 * @returns {object} Prisma-compatible social link payload.
 */
export function normalizeSocialLink(item, index) {
  return {
    platform: item.platform,
    url: item.url,
    icon: item.icon || null,
    displayOrder: index,
  };
}

/**
 * Normalizes a blog category entry for Prisma.
 * @param {object} category - Parsed category data.
 * @returns {object} Prisma-compatible category payload.
 */
export function normalizeBlogCategory(category) {
  return {
    slug: category.slug,
    name: category.name,
    description: category.description || null,
  };
}

/**
 * Normalizes a blog tag entry for Prisma.
 * @param {object} tag - Parsed tag data.
 * @returns {object} Prisma-compatible tag payload.
 */
export function normalizeBlogTag(tag) {
  return {
    slug: tag.slug,
    name: tag.name,
  };
}

/**
 * Normalizes a blog post entry for Prisma.
 * Tags are resolved by slug (must be imported first).
 * @param {object} post - Parsed blog post data.
 * @param {number} index - Display order index.
 * @returns {object} Prisma-compatible blog post payload.
 */
export function normalizeBlogPost(post) {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || null,
    content: post.content,
    coverImage: post.coverImage || null,
    status: post.status || 'DRAFT',
    publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
    author: post.author || null,
    featured: Boolean(post.featured),
    seoTitle: post.seoTitle || null,
    seoDescription: post.seoDescription || null,
    canonicalUrl: post.canonicalUrl || null,
    categoryId: post.categoryId || null,
    tagIds: post.tagIds || [],
  };
}

/**
 * Normalizes all portfolio data sections into Prisma-compatible payloads.
 * @param {object} data - Validated parsed YAML data.
 * @returns {object} Object with normalized sections.
 */
export function normalizePortfolioData(data) {
  const result = {};

  // Profile
  if (data.profile) {
    result.profile = normalizeProfile(data.profile);
  }

  // Experience
  result.experience = (data.experience || []).map(normalizeExperience);

  // Projects
  result.projects = (data.projects || []).map(normalizeProject);

  // Skills
  result.skills = (data.skills || []).map(normalizeSkill);

  // Education
  result.education = (data.education || []).map(normalizeEducation);

  // Certificates
  result.certificates = (data.certificates || []).map(normalizeCertificate);

  // Achievements
  result.achievements = (data.achievements || []).map(normalizeAchievement);

  // Social Links
  result.socialLinks = (data.socialLinks || []).map(normalizeSocialLink);

  // Blog
  result.blog = {
    categories: (data.blog?.categories || []).map(normalizeBlogCategory),
    tags: (data.blog?.tags || []).map(normalizeBlogTag),
    posts: (data.blog?.posts || []).map(normalizeBlogPost),
  };

  return result;
}
