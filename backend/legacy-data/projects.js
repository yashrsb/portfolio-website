/**
 * Projects mock data.
 */
const projects = [
  {
    id: 'taskflow',
    title: 'TaskFlow',
    description:
      'A real-time project management tool with drag-and-drop boards, team collaboration, and automated workflows. Built for distributed teams.',
    tags: ['React', 'Node.js', 'Socket.io', 'PostgreSQL', 'Redis'],
    featured: true,
    status: 'live',
    githubUrl: 'https://github.com/alexchen/taskflow',
    liveUrl: 'https://taskflow-demo.vercel.app',
  },
  {
    id: 'codereview',
    title: 'CodeReview AI',
    description:
      'An AI-powered code review assistant that integrates with GitHub to provide automated feedback on pull requests. Supports multiple languages.',
    tags: ['Python', 'FastAPI', 'OpenAI', 'React', 'Docker'],
    featured: true,
    status: 'live',
    githubUrl: 'https://github.com/alexchen/codereview-ai',
    liveUrl: 'https://codereview-ai.example.com',
  },
  {
    id: 'devmetrics',
    title: 'DevMetrics',
    description:
      'Developer analytics dashboard that tracks code quality, velocity, and team productivity metrics across repositories.',
    tags: ['Next.js', 'TypeScript', 'GraphQL', 'MongoDB', 'D3.js'],
    featured: false,
    status: 'live',
    githubUrl: 'https://github.com/alexchen/devmetrics',
    liveUrl: 'https://devmetrics.example.com',
  },
  {
    id: 'pixelcraft',
    title: 'PixelCraft',
    description:
      'A browser-based image editing tool with filters, layers, and export options. Built entirely with Canvas API and WebAssembly.',
    tags: ['JavaScript', 'Canvas API', 'WebAssembly', 'CSS'],
    featured: false,
    status: 'live',
    githubUrl: 'https://github.com/alexchen/pixelcraft',
    liveUrl: 'https://pixelcraft.example.com',
  },
  {
    id: 'cli-toolkit',
    title: 'CLI Toolkit',
    description:
      'A collection of command-line productivity tools for developers. Includes file watchers, code generators, and project scaffolding.',
    tags: ['Node.js', 'Commander.js', 'Chalk', 'Inquirer'],
    featured: false,
    status: 'live',
    githubUrl: 'https://github.com/alexchen/cli-toolkit',
  },
  {
    id: 'openapi-hub',
    title: 'OpenAPI Hub',
    description:
      'A collaborative platform for designing, documenting, and testing REST APIs using the OpenAPI specification standard.',
    tags: ['React', 'Express', 'Swagger', 'PostgreSQL', 'Redis'],
    featured: false,
    status: 'wip',
    githubUrl: 'https://github.com/alexchen/openapi-hub',
  },
];

export default projects;
