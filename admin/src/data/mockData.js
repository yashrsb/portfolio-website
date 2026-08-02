/**
 * Mock data for the admin dashboard.
 *
 * This mirrors the shape of the Prisma models / public portfolio data.
 * In Phase 8 these will be replaced by real API calls.
 */

/**
 * @typedef {Object} Project
 * @property {string} id - Unique id
 * @property {string} title - Project title
 * @property {string} slug - URL slug
 * @property {string} description - Full description
 * @property {string} summary - Short summary
 * @property {'live' | 'wip' | 'archived'} status - Publication status
 * @property {boolean} featured - Whether the project is featured
 * @property {string} githubUrl - GitHub repository URL
 * @property {string} demoUrl - Live demo URL
 * @property {string} imageUrl - Cover image URL
 * @property {number} displayOrder - Sort order
 * @property {string} updatedAt - Last-updated timestamp
 */

const projects = [
  {
    id: 'p1',
    title: 'TaskFlow',
    slug: 'taskflow',
    summary: 'Real-time project management tool for distributed teams.',
    description:
      'A real-time project management tool with drag-and-drop boards, team collaboration, and automated workflows. Built for distributed teams.',
    status: 'live',
    featured: true,
    githubUrl: 'https://github.com/alexchen/taskflow',
    demoUrl: 'https://taskflow-demo.vercel.app',
    imageUrl: '',
    displayOrder: 1,
    updatedAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'p2',
    title: 'CodeReview AI',
    slug: 'codereview-ai',
    summary: 'AI-powered code review assistant that integrates with GitHub.',
    description:
      'An AI-powered code review assistant that integrates with GitHub to provide automated feedback on pull requests. Supports multiple languages.',
    status: 'live',
    featured: true,
    githubUrl: 'https://github.com/alexchen/codereview-ai',
    demoUrl: 'https://codereview-ai.example.com',
    imageUrl: '',
    displayOrder: 2,
    updatedAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'p3',
    title: 'DevMetrics',
    slug: 'devmetrics',
    summary: 'Developer analytics dashboard for engineering teams.',
    description:
      'Developer analytics dashboard that tracks code quality, velocity, and team productivity metrics across repositories.',
    status: 'live',
    featured: false,
    githubUrl: 'https://github.com/alexchen/devmetrics',
    demoUrl: 'https://devmetrics.example.com',
    imageUrl: '',
    displayOrder: 3,
    updatedAt: '2026-01-08T10:00:00.000Z',
  },
  {
    id: 'p4',
    title: 'PixelCraft',
    slug: 'pixelcraft',
    summary: 'Browser-based image editing tool built with Canvas API.',
    description:
      'A browser-based image editing tool with filters, layers, and export options. Built entirely with Canvas API and WebAssembly.',
    status: 'live',
    featured: false,
    githubUrl: 'https://github.com/alexchen/pixelcraft',
    demoUrl: 'https://pixelcraft.example.com',
    imageUrl: '',
    displayOrder: 4,
    updatedAt: '2026-01-05T10:00:00.000Z',
  },
  {
    id: 'p5',
    title: 'CLI Toolkit',
    slug: 'cli-toolkit',
    summary: 'Collection of command-line productivity tools for developers.',
    description:
      'A collection of command-line productivity tools for developers. Includes file watchers, code generators, and project scaffolding.',
    status: 'live',
    featured: false,
    githubUrl: 'https://github.com/alexchen/cli-toolkit',
    demoUrl: '',
    imageUrl: '',
    displayOrder: 5,
    updatedAt: '2025-12-28T10:00:00.000Z',
  },
  {
    id: 'p6',
    title: 'OpenAPI Hub',
    slug: 'openapi-hub',
    summary: 'Collaborative platform for designing and testing REST APIs.',
    description:
      'A collaborative platform for designing, documenting, and testing REST APIs using the OpenAPI specification standard.',
    status: 'wip',
    featured: false,
    githubUrl: 'https://github.com/alexchen/openapi-hub',
    demoUrl: '',
    imageUrl: '',
    displayOrder: 6,
    updatedAt: '2025-12-20T10:00:00.000Z',
  },
];

/**
 * @typedef {Object} Skill
 * @property {string} id - Unique id
 * @property {string} category - Skill category
 * @property {string} name - Skill name
 * @property {number} proficiency - 0–100 proficiency level
 * @property {string} icon - Icon label
 * @property {number} displayOrder - Sort order
 */

const skills = [
  {
    id: 's1',
    category: 'Languages',
    name: 'JavaScript',
    proficiency: 95,
    icon: '🟨',
    displayOrder: 1,
  },
  {
    id: 's2',
    category: 'Languages',
    name: 'TypeScript',
    proficiency: 90,
    icon: '🔷',
    displayOrder: 2,
  },
  {
    id: 's3',
    category: 'Languages',
    name: 'Python',
    proficiency: 75,
    icon: '🐍',
    displayOrder: 3,
  },
  {
    id: 's4',
    category: 'Frontend',
    name: 'React',
    proficiency: 95,
    icon: '⚛️',
    displayOrder: 1,
  },
  {
    id: 's5',
    category: 'Frontend',
    name: 'Next.js',
    proficiency: 85,
    icon: '▲',
    displayOrder: 2,
  },
  {
    id: 's6',
    category: 'Backend',
    name: 'Node.js',
    proficiency: 90,
    icon: '💚',
    displayOrder: 1,
  },
  {
    id: 's7',
    category: 'Backend',
    name: 'Express',
    proficiency: 90,
    icon: '🚂',
    displayOrder: 2,
  },
  {
    id: 's8',
    category: 'Databases',
    name: 'PostgreSQL',
    proficiency: 85,
    icon: '🐘',
    displayOrder: 1,
  },
  {
    id: 's9',
    category: 'Databases',
    name: 'Prisma',
    proficiency: 80,
    icon: '📊',
    displayOrder: 2,
  },
  {
    id: 's10',
    category: 'Tools',
    name: 'Git',
    proficiency: 95,
    icon: '📦',
    displayOrder: 1,
  },
];

/**
 * @typedef {Object} Experience
 * @property {string} id - Unique id
 * @property {string} company - Company name
 * @property {string} role - Job title
 * @property {string} startDate - Start date (YYYY-MM)
 * @property {string} endDate - End date (YYYY-MM) or empty for current
 * @property {boolean} current - Whether the role is ongoing
 * @property {string} description - Role description
 * @property {number} displayOrder - Sort order
 */

const experience = [
  {
    id: 'e1',
    company: 'TechFlow Inc.',
    role: 'Senior Software Engineer',
    startDate: '2022-01',
    endDate: '',
    current: true,
    description:
      'Lead the frontend architecture for a SaaS platform serving 50K+ users. Drive technical decisions and mentor junior engineers.',
    displayOrder: 1,
  },
  {
    id: 'e2',
    company: 'DataSphere Labs',
    role: 'Software Engineer',
    startDate: '2019-03',
    endDate: '2021-12',
    current: false,
    description:
      'Built and maintained microservices powering a real-time data analytics platform.',
    displayOrder: 2,
  },
  {
    id: 'e3',
    company: 'StartupXYZ',
    role: 'Junior Software Engineer',
    startDate: '2017-06',
    endDate: '2019-02',
    current: false,
    description:
      'Early engineer at a seed-stage startup. Wore multiple hats to build the MVP.',
    displayOrder: 3,
  },
];

/**
 * @typedef {Object} EducationEntry
 * @property {string} id - Unique id
 * @property {string} institution - Institution name
 * @property {string} degree - Degree or program name
 * @property {string} field - Field of study
 * @property {string} startYear - Start year
 * @property {string} endYear - End year
 * @property {string} description - Description
 */

const education = [
  {
    id: 'ed1',
    institution: 'University of California, Berkeley',
    degree: 'Bachelor of Science',
    field: 'Computer Science',
    startYear: '2013',
    endYear: '2017',
    description:
      "Dean's List (4 semesters). Teaching Assistant for Data Structures. Senior Capstone in Distributed Systems.",
  },
];

/**
 * @typedef {Object} Certificate
 * @property {string} id - Unique id
 * @property {string} name - Certificate name
 * @property {string} issuer - Issuing organization
 * @property {string} year - Year obtained
 * @property {string} url - Credential URL
 */

const certificates = [
  {
    id: 'c1',
    name: 'AWS Solutions Architect — Associate',
    issuer: 'Amazon Web Services',
    year: '2022',
    url: 'https://aws.amazon.com/',
  },
  {
    id: 'c2',
    name: 'Google Cloud Professional Developer',
    issuer: 'Google Cloud',
    year: '2021',
    url: 'https://cloud.google.com/',
  },
  {
    id: 'c3',
    name: 'Meta Front-End Developer',
    issuer: 'Meta (Coursera)',
    year: '2020',
    url: 'https://coursera.org/',
  },
];

/**
 * @typedef {Object} Achievement
 * @property {string} id - Unique id
 * @property {string} title - Achievement title
 * @property {string} organization - Organization that granted it
 * @property {string} year - Year awarded
 * @property {string} description - Achievement description
 */

const achievements = [
  {
    id: 'a1',
    title: 'Engineering Excellence Award',
    organization: 'TechFlow Inc.',
    year: '2023',
    description:
      'Recognized for outstanding contributions to platform architecture and team mentorship.',
  },
  {
    id: 'a2',
    title: '1st Place — Hackathon',
    organization: 'DataSphere Labs',
    year: '2020',
    description:
      'Built a real-time data visualization tool for COVID-19 tracking in 48 hours.',
  },
  {
    id: 'a3',
    title: 'Open Source Contributor of the Year',
    organization: 'GitHub Community',
    year: '2019',
    description:
      'Awarded for significant contributions to React ecosystem tooling and documentation.',
  },
];

/**
 * @typedef {Object} SocialLink
 * @property {string} id - Unique id
 * @property {string} platform - Platform name
 * @property {string} url - Profile URL
 * @property {string} icon - Icon label
 * @property {number} displayOrder - Sort order
 */

const socialLinks = [
  {
    id: 'l1',
    platform: 'GitHub',
    url: 'https://github.com/alexchen',
    icon: '🐙',
    displayOrder: 1,
  },
  {
    id: 'l2',
    platform: 'LinkedIn',
    url: 'https://linkedin.com/in/alexchen',
    icon: '💼',
    displayOrder: 2,
  },
  {
    id: 'l3',
    platform: 'Twitter',
    url: 'https://twitter.com/alexchen',
    icon: '🐦',
    displayOrder: 3,
  },
  {
    id: 'l4',
    platform: 'Email',
    url: 'mailto:alex.chen@example.com',
    icon: '✉️',
    displayOrder: 4,
  },
];

const contactMessages = [
  {
    id: 'm1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    message: 'Interested in collaborating on an open-source project.',
    createdAt: '2026-01-14T09:30:00.000Z',
  },
  {
    id: 'm2',
    name: 'Michael Brown',
    email: 'michael@example.com',
    message: 'Love your work! Do you take freelance projects?',
    createdAt: '2026-01-12T14:00:00.000Z',
  },
  {
    id: 'm3',
    name: 'Priya Patel',
    email: 'priya@example.com',
    message: 'Would you be open to a guest appearance on our podcast?',
    createdAt: '2026-01-09T11:15:00.000Z',
  },
];

export {
  projects,
  skills,
  experience,
  education,
  certificates,
  achievements,
  socialLinks,
  contactMessages,
};
