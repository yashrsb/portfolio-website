import { z } from 'zod';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_SKILL_CATEGORIES = [
  'languages',
  'frontend',
  'backend',
  'databases',
  'cloud',
  'tools',
];

const VALID_PROJECT_STATUSES = ['live', 'wip', 'archived'];

const URL_REGEX = /^https?:\/\/.+/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_MONTH_YEAR =
  /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const urlOrNull = z
  .string()
  .regex(URL_REGEX, 'Must be a valid URL (http:// or https://)')
  .optional()
  .nullable();

const emailString = z
  .string()
  .regex(EMAIL_REGEX, 'Must be a valid email address');

const nonEmptyString = z.string().min(1, 'Field is required');

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

const contactSchema = z.object({
  email: emailString,
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  linkedin: z
    .string()
    .regex(URL_REGEX, 'Invalid LinkedIn URL')
    .optional()
    .nullable(),
  github: z
    .string()
    .regex(URL_REGEX, 'Invalid GitHub URL')
    .optional()
    .nullable(),
});

const statsSchema = z.object({
  experience: z.string().min(1, 'Experience value is required'),
  projects: z.number().int().nonnegative(),
  technologies: z.number().int().nonnegative(),
  openSourceContributions: z.number().int().nonnegative(),
});

export const profileSchema = z.object({
  name: nonEmptyString,
  headline: nonEmptyString,
  tagline: z.string().optional().default(''),
  bio: z.string().optional().default(''),
  interests: z.array(z.string()).optional().default([]),
  goals: z.array(z.string()).optional().default([]),
  strengths: z.array(z.string()).optional().default([]),
  stats: statsSchema,
  contact: contactSchema,
  resumeUrl: z.string().optional().default('#'),
});

// ---------------------------------------------------------------------------
// Experience
// ---------------------------------------------------------------------------

export const experienceSchema = z.object({
  company: nonEmptyString,
  role: nonEmptyString,
  startDate: z
    .string()
    .regex(DATE_MONTH_YEAR, 'Must be in "Mon YYYY" format (e.g. Jan 2022)'),
  endDate: z
    .string()
    .regex(DATE_MONTH_YEAR, 'Must be in "Mon YYYY" format')
    .optional()
    .nullable(),
  current: z.boolean().optional().default(false),
  location: z.string().optional().default(''),
  description: z.string().optional().default(''),
  technologies: z.array(z.string()).optional().default([]),
  responsibilities: z.array(z.string()).optional().default([]),
  achievements: z.array(z.string()).optional().default([]),
});

export const experienceArraySchema = z.array(experienceSchema);

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------

export const projectSchema = z.object({
  slug: nonEmptyString,
  title: nonEmptyString,
  description: nonEmptyString,
  summary: z.string().optional().nullable(),
  imageUrl: urlOrNull,
  githubUrl: urlOrNull,
  demoUrl: urlOrNull,
  status: z
    .enum(VALID_PROJECT_STATUSES, {
      errorMap: () => ({
        message: `Invalid status. Must be one of: ${VALID_PROJECT_STATUSES.join(', ')}`,
      }),
    })
    .optional()
    .default('live'),
  featured: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
});

export const projectArraySchema = z.array(projectSchema);

// ---------------------------------------------------------------------------
// Skill
// ---------------------------------------------------------------------------

export const skillSchema = z.object({
  name: nonEmptyString,
  category: z.enum(VALID_SKILL_CATEGORIES, {
    errorMap: () => ({
      message: `Invalid category. Must be one of: ${VALID_SKILL_CATEGORIES.join(', ')}`,
    }),
  }),
  proficiency: z
    .number()
    .int()
    .min(0, 'Proficiency must be between 0 and 100')
    .max(100, 'Proficiency must be between 0 and 100'),
  icon: z.string().optional().default(''),
});

export const skillArraySchema = z.array(skillSchema);

// ---------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------

export const educationSchema = z.object({
  institution: nonEmptyString,
  degree: nonEmptyString,
  fieldOfStudy: z.string().optional().nullable(),
  startYear: z
    .number()
    .int()
    .min(1900, 'Invalid start year')
    .max(2100, 'Invalid start year'),
  endYear: z
    .number()
    .int()
    .min(1900, 'Invalid end year')
    .max(2100, 'Invalid end year'),
  grade: z.string().optional().nullable(),
  highlights: z.array(z.string()).optional().default([]),
});

export const educationArraySchema = z.array(educationSchema);

// ---------------------------------------------------------------------------
// Certificate
// ---------------------------------------------------------------------------

export const certificateSchema = z.object({
  name: nonEmptyString,
  issuer: nonEmptyString,
  date: z.string().min(1, 'Date is required'),
  url: urlOrNull,
});

export const certificateArraySchema = z.array(certificateSchema);

// ---------------------------------------------------------------------------
// Achievement
// ---------------------------------------------------------------------------

export const achievementSchema = z.object({
  title: nonEmptyString,
  organization: nonEmptyString,
  year: z.number().int().min(1900, 'Invalid year').max(2100, 'Invalid year'),
  description: z.string().optional().default(''),
});

export const achievementArraySchema = z.array(achievementSchema);

// ---------------------------------------------------------------------------
// Social Link
// ---------------------------------------------------------------------------

export const socialLinkSchema = z.object({
  platform: nonEmptyString,
  url: z.string().regex(URL_REGEX, 'Must be a valid URL'),
  icon: z.string().optional().nullable(),
});

export const socialLinkArraySchema = z.array(socialLinkSchema);

// ---------------------------------------------------------------------------
// Top-level portfolio schema
// ---------------------------------------------------------------------------

export const portfolioSchema = z.object({
  profile: profileSchema,
  experience: experienceArraySchema.optional().default([]),
  projects: projectArraySchema.optional().default([]),
  skills: skillArraySchema.optional().default([]),
  education: educationArraySchema.optional().default([]),
  certificates: certificateArraySchema.optional().default([]),
  achievements: achievementArraySchema.optional().default([]),
  socialLinks: socialLinkArraySchema.optional().default([]),
});
