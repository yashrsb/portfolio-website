import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

const { mockUseProfileResult } = vi.hoisted(() => ({
  mockUseProfileResult: { current: null },
}));

vi.mock('../../services/profileService', () => ({
  fetchProfile: vi.fn(),
}));

vi.mock('../../hooks', () => ({
  useProfile: () => mockUseProfileResult.current,
}));

vi.mock('../../components/common/Reveal/Reveal.jsx', () => ({
  default: ({ children }) => children,
}));

vi.mock('../../components/common/Container/Container.jsx', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../components/common/Section/Section.jsx', () => ({
  default: ({ title, subtitle, children }) => (
    <section>
      {title && <h2>{title}</h2>}
      {subtitle && <p>{subtitle}</p>}
      {children}
    </section>
  ),
}));

vi.mock('../../components/common/LoadingState/LoadingState.jsx', () => ({
  default: ({ label }) => <div>{label}</div>,
}));

vi.mock('../../components/common/ErrorState/ErrorState.jsx', () => ({
  default: ({ title }) => <div>{title}</div>,
}));

vi.mock('../../utils/seo', () => ({
  setPageSEO: vi.fn(),
}));

import About from './About';

const profile = {
  name: 'Yash',
  tagline: 'Building scalable systems.',
  bio: 'First paragraph.\nSecond paragraph.',
  strengths: ['Scalable Backend Development', 'System Design'],
  interests: ['Continuous Learning', 'Cloud Technologies'],
  goals: ['Grow into Staff engineering', 'Mentor engineers'],
};

describe('About page', () => {
  it('shows a loading state', () => {
    mockUseProfileResult.current = { profile: null, loading: true, error: null };
    render(<About />);
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('shows an error state', () => {
    mockUseProfileResult.current = { profile: null, loading: false, error: 'Boom' };
    render(<About />);
    expect(screen.getByText('Failed to load profile')).toBeInTheDocument();
  });

  it('renders page title, tagline from profile, bio paragraphs, strengths, interests, goals', () => {
    mockUseProfileResult.current = { profile, loading: false, error: null };
    const { container } = render(<About />);

    // Page title heading (matches other pages like Experience, Skills, Projects)
    expect(
      screen.getByRole('heading', { level: 1, name: 'About' }),
    ).toBeInTheDocument();

    // Tagline from profile
    expect(screen.getByText('Building scalable systems.')).toBeInTheDocument();

    // Bio paragraphs (all use consistent .paragraph class, no .lead class)
    expect(screen.getByText('First paragraph.')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph.')).toBeInTheDocument();

    // Verify no .lead class is used (first paragraph not bold/larger)
    const leadElements = container.querySelectorAll('.lead');
    expect(leadElements).toHaveLength(0);

    // Core Strengths section
    expect(
      screen.getByRole('heading', { name: 'Core Strengths' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Scalable Backend Development')).toBeInTheDocument();
    expect(screen.getByText('System Design')).toBeInTheDocument();

    // Strength descriptions (from frontend mapping)
    expect(screen.getByText('Building maintainable backend services and APIs designed for scale.')).toBeInTheDocument();
    expect(screen.getByText('Thinking about scalability, failure modes, service boundaries, and long-term maintainability.')).toBeInTheDocument();

    // Engineering Principles
    expect(
      screen.getByRole('heading', { name: 'How I Think About Engineering' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();

    // Beyond the Code with intro
    expect(
      screen.getByRole('heading', { name: "Beyond the Code" }),
    ).toBeInTheDocument();
    expect(screen.getByText("I'm naturally curious about how things work and tend to keep learning even outside the immediate requirements of a project.")).toBeInTheDocument();
    expect(screen.getByText('Continuous Learning')).toBeInTheDocument();
    expect(screen.getByText('Cloud Technologies')).toBeInTheDocument();

    // Where I'm Heading with closing
    expect(
      screen.getByRole('heading', { name: "Where I'm Heading" }),
    ).toBeInTheDocument();
    expect(screen.getByText('Grow into Staff engineering')).toBeInTheDocument();
    expect(screen.getByText('Mentor engineers')).toBeInTheDocument();
    expect(screen.getByText("I'm still learning, still experimenting, and still looking for better ways to build software.")).toBeInTheDocument();
  });

  it('renders tagline from profile when it differs from default', () => {
    const customProfile = { ...profile, tagline: 'Custom tagline from database.' };
    mockUseProfileResult.current = { profile: customProfile, loading: false, error: null };
    render(<About />);

    expect(screen.getByText('Custom tagline from database.')).toBeInTheDocument();
    expect(screen.queryByText('I build backend systems that are designed to last.')).not.toBeInTheDocument();
  });

  it('does not render empty tagline element when tagline is empty string', () => {
    const emptyTaglineProfile = { ...profile, tagline: '' };
    mockUseProfileResult.current = { profile: emptyTaglineProfile, loading: false, error: null };
    const { container } = render(<About />);

    // Tagline paragraph should not exist
    const taglineParagraphs = container.querySelectorAll('[class*="tagline"]');
    expect(taglineParagraphs).toHaveLength(0);
  });

  it('does not render empty tagline element when tagline is whitespace only', () => {
    const whitespaceTaglineProfile = { ...profile, tagline: '   \n\t  ' };
    mockUseProfileResult.current = { profile: whitespaceTaglineProfile, loading: false, error: null };
    const { container } = render(<About />);

    const taglineParagraphs = container.querySelectorAll('[class*="tagline"]');
    expect(taglineParagraphs).toHaveLength(0);
  });

  it('does not render empty tagline element when tagline is null', () => {
    const nullTaglineProfile = { ...profile, tagline: null };
    mockUseProfileResult.current = { profile: nullTaglineProfile, loading: false, error: null };
    const { container } = render(<About />);

    const taglineParagraphs = container.querySelectorAll('[class*="tagline"]');
    expect(taglineParagraphs).toHaveLength(0);
  });

  it('renders multiple bio paragraphs as separate paragraphs', () => {
    const multiParaProfile = {
      ...profile,
      bio: 'Paragraph one.\n\nParagraph two.\nParagraph three.',
    };
    mockUseProfileResult.current = { profile: multiParaProfile, loading: false, error: null };
    render(<About />);

    expect(screen.getByText('Paragraph one.')).toBeInTheDocument();
    expect(screen.getByText('Paragraph two.')).toBeInTheDocument();
    expect(screen.getByText('Paragraph three.')).toBeInTheDocument();
  });
});