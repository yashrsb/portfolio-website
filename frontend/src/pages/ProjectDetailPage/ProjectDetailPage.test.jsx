import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockProject = {
  id: 'proj-1',
  slug: 'notifyhub',
  title: 'NotifyHub',
  description: 'A real-time notification platform.',
  summary: 'Real-time notifications via WebSocket.',
  imageUrl: 'https://example.com/notifyhub.png',
  githubUrl: 'https://github.com/yashrsb/notifyhub',
  demoUrl: 'https://notifyhub.example.com',
  status: 'live',
  featured: true,
  displayOrder: 1,
  tags: ['React', 'Node.js'],
  features: ['Real-time messaging', 'Push notifications'],
  techStack: {
    Frontend: ['React', 'Vite'],
    Backend: ['Node.js', 'Express'],
    Database: ['PostgreSQL'],
  },
  challenges: ['Concurrency', 'Database design'],
  lessonsLearned: ['Always use connection pooling'],
  architecture: 'Client → API → Services → Repository → Database',
  architectureImage: 'https://example.com/arch.png',
  screenshots: [
    {
      src: 'https://example.com/screenshot1.png',
      alt: 'Dashboard view',
      caption: 'Main dashboard',
    },
    {
      src: 'https://example.com/screenshot2.png',
      alt: 'Settings page',
      caption: 'Settings panel',
    },
  ],
};

const mockUseProject = {
  project: null,
  loading: true,
  error: null,
  notFound: false,
};

vi.mock('../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(status, message, details) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.details = details;
    }
  },
}));

vi.mock('../../services/analyticsService', () => ({
  trackProjectView: vi.fn(),
  trackProjectClick: vi.fn(),
  trackPageView: vi.fn(),
  trackBlogPostView: vi.fn(),
  trackEvent: vi.fn(),
  default: {
    trackProjectView: vi.fn(),
    trackProjectClick: vi.fn(),
    trackPageView: vi.fn(),
    trackBlogPostView: vi.fn(),
    trackEvent: vi.fn(),
  },
}));

vi.mock('../../utils/analyticsOptOut', () => ({
  isAnalyticsOptedOut: () => true,
  setAnalyticsOptOut: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ slug: 'notifyhub' }),
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('../../services/projectService', () => ({
  fetchProjects: vi.fn(),
  fetchProjectBySlug: vi.fn(),
}));

vi.mock('../../hooks', () => ({
  useProject: () => mockUseProject,
  useProjects: () => ({ projects: [], loading: false, error: null }),
  useProfile: () => ({ profile: null, loading: false, error: null }),
  useSocial: () => ({ socialLinks: [], loading: false, error: null }),
  usePrefersReducedMotion: () => false,
  useIntersectionObserver: () => ({ ref: vi.fn(), isVisible: true }),
}));

vi.mock('../../components/common/Reveal/Reveal.jsx', () => ({
  default: ({ children }) => children,
}));

vi.mock('../../components/common/Container/Container.jsx', () => ({
  default: ({ children }) => children,
}));

vi.mock('../../components/common/Section/Section.jsx', () => ({
  default: ({ title, children }) => (
    <section>
      {title && <h2>{title}</h2>}
      {children}
    </section>
  ),
}));

vi.mock('../../components/common/Heading/Heading.jsx', () => ({
  default: ({ children, subtitle }) => (
    <h1>
      {children}
      {subtitle && <p>{subtitle}</p>}
    </h1>
  ),
}));

vi.mock('../../components/common/Card/Card.jsx', () => ({
  default: ({ children, shadow, padding }) => (
    <div className={`card shadow-${shadow} padding-${padding}`}>{children}</div>
  ),
}));

vi.mock('../../components/common/Tag/Tag.jsx', () => ({
  default: ({ children, variant, size }) => (
    <span className={`tag ${variant} ${size}`}>{children}</span>
  ),
}));

vi.mock('../../components/common/Button/Button.jsx', () => ({
  default: ({ children, variant, size, onClick, ariaLabel, disabled }) => (
    <button
      className={`button ${variant} ${size}`}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

vi.mock('../../components/common/LoadingState/LoadingState.jsx', () => ({
  default: ({ label }) => <div role="status">{label}</div>,
}));

vi.mock('../../components/common/ErrorState/ErrorState.jsx', () => ({
  default: ({ title, message }) => (
    <div role="alert">
      <h2>{title}</h2>
      {message && <p>{message}</p>}
    </div>
  ),
}));

import ProjectDetailPage from './ProjectDetailPage';

describe('ProjectDetailPage', () => {
  beforeEach(() => {
    mockUseProject.project = null;
    mockUseProject.loading = true;
    mockUseProject.error = null;
    mockUseProject.notFound = false;
  });

  it('shows loading state while fetching', () => {
    mockUseProject.loading = true;
    render(<ProjectDetailPage />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading');
  });

  it('shows not-found state when project does not exist', () => {
    mockUseProject.loading = false;
    mockUseProject.notFound = true;
    render(<ProjectDetailPage />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Project Not Found')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /back to projects/i }),
    ).toBeInTheDocument();
  });

  it('shows error state on network/server error', () => {
    mockUseProject.loading = false;
    mockUseProject.error = 'Network error — unable to reach the server';
    render(<ProjectDetailPage />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Failed to load project',
    );
    expect(screen.getByText(/Network error/)).toBeInTheDocument();
  });

  it('renders the project hero with title, summary, and status', () => {
    mockUseProject.loading = false;
    mockUseProject.project = mockProject;
    render(<ProjectDetailPage />);

    expect(screen.getByText('NotifyHub')).toBeInTheDocument();
    expect(
      screen.getByText('Real-time notifications via WebSocket.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('renders GitHub and Live Demo CTAs when URLs exist', () => {
    mockUseProject.loading = false;
    mockUseProject.project = mockProject;
    render(<ProjectDetailPage />);

    expect(
      screen.getByRole('button', { name: /view github repository/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /view on github/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /live demo/i })).toHaveLength(
      2,
    );
  });

  it('hides Live Demo button when demoUrl is null', () => {
    mockUseProject.loading = false;
    mockUseProject.project = { ...mockProject, demoUrl: null };
    render(<ProjectDetailPage />);

    expect(
      screen.getByRole('button', { name: /view github repository/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /view on github/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /live demo/i })).toBeNull();
  });

  it('hides GitHub button when githubUrl is null', () => {
    mockUseProject.loading = false;
    mockUseProject.project = { ...mockProject, githubUrl: null };
    render(<ProjectDetailPage />);

    expect(
      screen.queryByRole('button', { name: /view github repository/i }),
    ).toBeNull();
    expect(
      screen.queryByRole('button', { name: /view on github/i }),
    ).toBeNull();
    expect(screen.getAllByRole('button', { name: /live demo/i })).toHaveLength(
      2,
    );
  });

  it('renders the screenshot gallery when screenshots exist', () => {
    mockUseProject.loading = false;
    mockUseProject.project = mockProject;
    render(<ProjectDetailPage />);

    expect(screen.getByText('Screenshots')).toBeInTheDocument();
    expect(
      screen.getByLabelText(/view dashboard view enlarged/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/view settings page enlarged/i),
    ).toBeInTheDocument();
  });

  it('hides the screenshots section when screenshots are unavailable', () => {
    mockUseProject.loading = false;
    mockUseProject.project = { ...mockProject, screenshots: [] };
    render(<ProjectDetailPage />);

    expect(screen.queryByText('Screenshots')).not.toBeInTheDocument();
  });

  it('renders only available sections and hides empty ones', () => {
    mockUseProject.loading = false;
    mockUseProject.project = {
      ...mockProject,
      features: [],
      challenges: [],
      lessonsLearned: [],
      architecture: null,
      architectureImage: null,
      screenshots: [],
    };
    render(<ProjectDetailPage />);

    expect(screen.queryByText('Key Features')).not.toBeInTheDocument();
    expect(screen.queryByText('Challenges')).not.toBeInTheDocument();
    expect(screen.queryByText('Lessons Learned')).not.toBeInTheDocument();
    expect(screen.queryByText('Architecture')).not.toBeInTheDocument();
    expect(screen.queryByText('Screenshots')).not.toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Tech Stack')).toBeInTheDocument();
  });

  it('sets document.title with project name', () => {
    mockUseProject.loading = false;
    mockUseProject.project = mockProject;
    render(<ProjectDetailPage />);

    expect(document.title).toBe('NotifyHub — Portfolio');
  });

  it('sets canonical URL to project slug path', () => {
    mockUseProject.loading = false;
    mockUseProject.project = mockProject;
    render(<ProjectDetailPage />);

    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical).toBeTruthy();
    expect(canonical.getAttribute('href')).toMatch(/\/projects\/notifyhub$/);
  });

  it('sets og:title to project title', () => {
    mockUseProject.loading = false;
    mockUseProject.project = mockProject;
    render(<ProjectDetailPage />);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle).toBeTruthy();
    expect(ogTitle.content).toBe('NotifyHub');
  });

  it('sets og:image when project has imageUrl', () => {
    mockUseProject.loading = false;
    mockUseProject.project = mockProject;
    render(<ProjectDetailPage />);

    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage).toBeTruthy();
    expect(ogImage.content).toBe(mockProject.imageUrl);
  });

  it('sets twitter:card to summary_large_image when image exists', () => {
    mockUseProject.loading = false;
    mockUseProject.project = mockProject;
    render(<ProjectDetailPage />);

    const card = document.querySelector('meta[name="twitter:card"]');
    expect(card).toBeTruthy();
    expect(card.content).toBe('summary_large_image');
  });

  it('sets robots to noindex when project not found', () => {
    mockUseProject.loading = false;
    mockUseProject.notFound = true;
    render(<ProjectDetailPage />);

    const robots = document.querySelector('meta[name="robots"]');
    expect(robots).toBeTruthy();
    expect(robots.content).toBe('noindex, nofollow');
  });

  it('injects SoftwareApplication JSON-LD for project', () => {
    mockUseProject.loading = false;
    mockUseProject.project = mockProject;
    render(<ProjectDetailPage />);

    const ld = document.getElementById('project-ld');
    expect(ld).toBeTruthy();
    const data = JSON.parse(ld.textContent);
    expect(data['@type']).toBe('SoftwareApplication');
    expect(data.name).toBe('NotifyHub');
  });

  it('injects BreadcrumbList JSON-LD for project', () => {
    mockUseProject.loading = false;
    mockUseProject.project = mockProject;
    render(<ProjectDetailPage />);

    const ld = document.getElementById('breadcrumb-ld');
    expect(ld).toBeTruthy();
    const data = JSON.parse(ld.textContent);
    expect(data['@type']).toBe('BreadcrumbList');
    expect(data.itemListElement).toHaveLength(2);
  });
});
