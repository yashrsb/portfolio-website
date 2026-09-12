/**
 * Architecture data for the SystemArchitecture visual.
 * Kept separate from the component so interactions can
 * reference node ids without parsing JSX.
 *
 * `connections` lists the connector paths that belong to
 * each node. This is an explicit, small graph model suited
 * for a known static architecture diagram.
 */

export const architectureNodes = [
  {
    id: 'api',
    label: 'API Layer',
    technologies: ['REST', 'Validation', 'Auth'],
    description:
      'Handles incoming requests, validation, authentication and API contracts.',
    connections: ['system-api', 'api-services'],
  },
  {
    id: 'services',
    label: 'Services',
    technologies: ['Node.js', 'TypeScript', 'gRPC'],
    description:
      'Contains application services and business logic that communicate through defined interfaces.',
    connections: ['api-services', 'services-data'],
  },
  {
    id: 'events',
    label: 'Events',
    technologies: ['Queues', 'Kafka', 'Async Processing'],
    description:
      'Supports asynchronous communication and background processing through event-driven patterns.',
    connections: ['events-data'],
  },
  {
    id: 'data',
    label: 'Data Layer',
    technologies: ['PostgreSQL', 'MongoDB', 'Redis'],
    description:
      'Provides persistence, caching and data access for services and events.',
    connections: ['services-data', 'events-data'],
  },
];

/**
 * Connector paths used in the SVG.
 * Each path has an id, a d attribute, and the list of node
 * ids it connects.
 */
export const architectureConnectors = [
  {
    id: 'system-api',
    d: 'M 80 96 L 80 120 L 240 120 L 240 140',
    connects: ['api', 'services'],
  },
  {
    id: 'api-services',
    d: 'M 240 96 L 240 140',
    connects: ['services', 'data'],
  },
  {
    id: 'events-data',
    d: 'M 400 122 L 400 140 L 240 140 L 240 160',
    connects: ['events', 'data'],
  },
];

/**
 * Primary request-flow path: SYSTEM → API → SERVICES → DATA
 */
export const requestFlowPath = ['api-services'];

export const technologySummary = ['Node.js', 'PostgreSQL', 'Redis', 'Docker'];

export const statusLabel = 'SYSTEM ONLINE';

export default {
  architectureNodes,
  architectureConnectors,
  requestFlowPath,
  technologySummary,
  statusLabel,
};