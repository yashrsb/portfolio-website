/**
 * Work experience mock data.
 */
const experience = [
  {
    company: 'TechFlow Inc.',
    role: 'Senior Software Engineer',
    date: 'Jan 2022 — Present',
    location: 'San Francisco, CA',
    description: `Lead the frontend architecture for a SaaS platform serving 50K+ users. Drive technical decisions, mentor junior engineers, and champion code quality standards across the team.`,
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
    responsibilities: [
      'Architected and built a design system used across 4 product teams',
      'Reduced page load times by 40% through code splitting and lazy loading',
      'Led migration from REST to GraphQL, improving data fetching efficiency',
      'Established CI/CD pipelines with automated testing and deployment',
    ],
    achievements: [
      'Promoted from mid-level to senior within 12 months',
      'Received Engineering Excellence Award (2023)',
      'Mentored 5 junior engineers through onboarding program',
    ],
  },
  {
    company: 'DataSphere Labs',
    role: 'Software Engineer',
    date: 'Mar 2019 — Dec 2021',
    location: 'Oakland, CA',
    description: `Built and maintained microservices powering a real-time data analytics platform. Collaborated across teams to deliver features on tight deadlines while maintaining high code quality.`,
    technologies: ['Node.js', 'React', 'Python', 'MongoDB', 'Docker', 'Redis'],
    responsibilities: [
      'Developed RESTful APIs handling 10M+ requests per day',
      'Implemented real-time data streaming with WebSocket connections',
      'Designed database schemas and optimized query performance',
      'Wrote comprehensive integration and unit tests (90%+ coverage)',
    ],
    achievements: [
      'Shipped 3 major product features in first 6 months',
      'Reduced infrastructure costs by 25% through caching strategy',
      'Contributed to internal developer tools used across engineering',
    ],
  },
  {
    company: 'StartupXYZ',
    role: 'Junior Software Engineer',
    date: 'Jun 2017 — Feb 2019',
    location: 'Remote',
    description: `Early engineer at a seed-stage startup. Wore multiple hats — frontend, backend, and infrastructure — to build the MVP and iterate based on user feedback.`,
    technologies: ['JavaScript', 'React', 'Express', 'MySQL', 'Heroku'],
    responsibilities: [
      'Built the initial product UI and API from the ground up',
      'Implemented authentication and authorization systems',
      'Set up monitoring and error tracking with Sentry and Datadog',
      'Participated in weekly on-call rotations for production support',
    ],
    achievements: [
      'Helped company grow from 0 to 1,000 paying customers',
      'Wrote engineering onboarding documentation',
      'Presented technical demos to investors and stakeholders',
    ],
  },
];

export default experience;
