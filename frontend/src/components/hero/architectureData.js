/**
 * Architecture data for the SystemArchitecture visual.
 * Kept separate from the component so Step 2 interactions can
 * reference node ids without parsing JSX.
 */

export const architectureNodes = [
  {
    id: 'api',
    label: 'API Layer',
    technologies: ['REST', 'Validation', 'Auth'],
    description: 'Handles external requests and API contracts.',
  },
  {
    id: 'services',
    label: 'Services',
    technologies: ['Node.js', 'TypeScript', 'gRPC'],
    description: 'Contains application services and business logic.',
  },
  {
    id: 'events',
    label: 'Events',
    technologies: ['Queues', 'Async Processing'],
    description: 'Handles asynchronous communication and background processing.',
  },
  {
    id: 'data',
    label: 'Data Layer',
    technologies: ['PostgreSQL', 'MongoDB', 'Redis'],
    description: 'Provides persistence, caching, and data access.',
  },
];

export const technologySummary = ['Node.js', 'PostgreSQL', 'Redis', 'Docker'];

export const statusLabel = 'SYSTEM ONLINE';

export default {
  architectureNodes,
  technologySummary,
  statusLabel,
};