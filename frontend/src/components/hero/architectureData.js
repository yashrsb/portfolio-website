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
    responsibilities: [
      'Request validation and sanitization',
      'Authentication and authorization',
      'Rate limiting and API versioning',
      'OpenAPI documentation',
    ],
    connections: ['system-api', 'api-services'],
  },
  {
    id: 'services',
    label: 'Services',
    technologies: ['Node.js', 'TypeScript', 'gRPC'],
    description:
      'Contains application services and business logic that communicate through defined interfaces.',
    responsibilities: [
      'Business logic and orchestration',
      'Inter-service communication',
      'Transaction coordination',
      'Domain event emission',
    ],
    connections: ['api-services', 'services-data'],
  },
  {
    id: 'events',
    label: 'Events',
    technologies: ['Queues', 'Kafka', 'Async Processing'],
    description:
      'Supports asynchronous communication and background processing through event-driven patterns.',
    responsibilities: [
      'Event publishing and consumption',
      'Background job processing',
      'Retry and dead-letter handling',
      'Event sourcing support',
    ],
    connections: ['events-data'],
  },
  {
    id: 'data',
    label: 'Data Layer',
    technologies: ['PostgreSQL', 'MongoDB', 'Redis'],
    description:
      'Provides persistence, caching and data access for services and events.',
    responsibilities: [
      'Relational data persistence',
      'Document storage for unstructured data',
      'In-memory caching and session store',
      'Read replica and failover management',
    ],
    connections: ['services-data', 'events-data'],
  },
];

/**
 * Shared node dimensions used by all architecture boxes.
 * Events is the reference size; all nodes now match it.
 */
export const nodeWidth = 120;
export const nodeHeight = 78;
export const nodeCornerRadius = 6;

/**
 * Node positions in the SVG viewBox (0 0 480 340).
 * Top-row nodes share y=44; Data Layer is centered below.
 */
export const nodePositions = {
  api: { x: 20, y: 44, width: nodeWidth, height: nodeHeight },
  services: { x: 180, y: 44, width: nodeWidth, height: nodeHeight },
  events: { x: 340, y: 44, width: nodeWidth, height: nodeHeight },
  data: { x: 160, y: 160, width: 160, height: nodeHeight },
};

/**
 * Connector paths used in the SVG.
 * Each path has an id, a d attribute, and the list of node
 * ids it connects.
 *
 * Top-row nodes now have height 78 (bottom at y=122).
 * Data Layer top is at y=160. The junction y=141 sits
 * midway between them.
 */
export const architectureConnectors = [
  {
    id: 'system-api',
    d: 'M 80 122 L 80 141 L 240 141 L 240 160',
    connects: ['api', 'services'],
  },
  {
    id: 'api-services',
    d: 'M 240 122 L 240 160',
    connects: ['services', 'data'],
  },
  {
    id: 'events-data',
    d: 'M 400 122 L 400 141 L 240 141 L 240 160',
    connects: ['events', 'data'],
  },
];

/**
 * Primary request-flow path: SYSTEM → API → SERVICES → DATA
 * The animation travels along this connector path.
 */
export const requestFlowPath = ['api-services'];

/**
 * Conceptual node status indicators.
 * These are illustrative UI labels, not real production metrics.
 */
export const nodeStatus = {
  api: 'online',
  services: 'online',
  events: 'online',
  data: 'online',
};

export const technologySummary = ['Node.js', 'PostgreSQL', 'Redis', 'Docker'];

export const statusLabel = 'SYSTEM ONLINE';

export default {
  architectureNodes,
  architectureConnectors,
  requestFlowPath,
  nodeStatus,
  technologySummary,
  statusLabel,
};