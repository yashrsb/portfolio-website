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

  it('renders tagline, bio paragraphs, strengths, interests, and goals', () => {
    mockUseProfileResult.current = { profile, loading: false, error: null };
    render(<About />);

    expect(
      screen.getByRole('heading', { level: 1, name: profile.tagline }),
    ).toBeInTheDocument();
    expect(screen.getByText('First paragraph.')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph.')).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Core Strengths' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Scalable Backend Development')).toBeInTheDocument();
    expect(screen.getByText('System Design')).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Beyond the Code' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Continuous Learning')).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: "Where I'm Heading" }),
    ).toBeInTheDocument();
    expect(screen.getByText('Grow into Staff engineering')).toBeInTheDocument();
    expect(screen.getByText('Mentor engineers')).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'How I Think About Engineering' }),
    ).toBeInTheDocument();
  });
});
