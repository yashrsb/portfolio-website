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

  it('renders new intro heading, bio paragraphs, strengths with descriptions, interests with intro, goals, and closing', () => {
    mockUseProfileResult.current = { profile, loading: false, error: null };
    render(<About />);

    // New stronger intro heading
    expect(
      screen.getByRole('heading', { level: 1, name: 'I build backend systems that are designed to last.' }),
    ).toBeInTheDocument();

    // Bio paragraphs
    expect(screen.getByText('First paragraph.')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph.')).toBeInTheDocument();

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
});