import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../common/Reveal/Reveal', () => ({
  default: ({ children }) => children,
}));

import BlogHero from './BlogHero';

describe('BlogHero', () => {
  it('renders the eyebrow label', () => {
    render(<BlogHero />);
    expect(screen.getByText('Engineering Notes')).toBeInTheDocument();
  });

  it('renders the headline with three lines', () => {
    render(<BlogHero />);
    const headline = screen.getByRole('heading', { level: 1 });
    expect(headline).toHaveTextContent('Building systems.');
    expect(headline).toHaveTextContent('Exploring ideas.');
    expect(headline).toHaveTextContent('Sharing what I learn.');
  });

  it('renders the description text', () => {
    render(<BlogHero />);
    expect(
      screen.getByText(
        /Practical articles on backend engineering, system design, databases/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders the decorative row with aria-hidden', () => {
    render(<BlogHero />);
    const decor = document.querySelector('[aria-hidden="true"]');
    expect(decor).toBeInTheDocument();
  });

  it('uses custom eyebrow when provided', () => {
    render(<BlogHero eyebrow="Technical Journal" />);
    expect(screen.getByText('Technical Journal')).toBeInTheDocument();
  });

  it('uses custom headline when provided', () => {
    render(<BlogHero headline="Custom Headline" />);
    expect(
      screen.getByRole('heading', { level: 1 }),
    ).toHaveTextContent('Custom Headline');
  });

  it('has a semantic h1 with id blog-hero-title', () => {
    render(<BlogHero />);
    const heading = document.getElementById('blog-hero-title');
    expect(heading).toBeInTheDocument();
    expect(heading?.tagName).toBe('H1');
  });

  it('renders a section element', () => {
    render(<BlogHero />);
    expect(document.querySelector('section')).toBeInTheDocument();
  });
});