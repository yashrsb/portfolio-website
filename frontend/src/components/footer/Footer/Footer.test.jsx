import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

const mockSocialLinks = [
  { id: '1', platform: 'github', url: 'https://github.com/test', icon: null, displayOrder: 1 },
  { id: '2', platform: 'linkedin', url: 'https://linkedin.com/in/test', icon: null, displayOrder: 2 },
  { id: '3', platform: 'leetcode', url: 'https://leetcode.com/test', icon: null, displayOrder: 3 },
  { id: '4', platform: 'medium', url: 'https://medium.com/test', icon: null, displayOrder: 4 },
  { id: '5', platform: 'twitter', url: 'https://twitter.com/test', icon: null, displayOrder: 5 },
  { id: '6', platform: 'email', url: 'mailto:test@example.com', icon: null, displayOrder: 6 },
  { id: '7', platform: 'custom-platform', url: 'https://custom.com', icon: null, displayOrder: 7 },
];

vi.mock('../../../hooks', () => ({
  useIntersectionObserver: () => ({ ref: () => {}, isVisible: true }),
  useSocial: () => ({ socialLinks: mockSocialLinks, loading: false, error: null }),
}));

vi.mock('../../common/Container/Container', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../common/Button/Button', () => ({
  default: ({ children, ...props }) => <button type="button" {...props}>{children}</button>,
}));

import Footer from './Footer';

describe('Footer', () => {
  it('renders copyright with current year', () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`© ${year} Portfolio`))).toBeInTheDocument();
  });

  it('renders GitHub link with accessible name', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: 'GitHub' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://github.com/test');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders LinkedIn link with accessible name', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: 'LinkedIn' });
    expect(link).toHaveAttribute('href', 'https://linkedin.com/in/test');
  });

  it('renders LeetCode link with accessible name', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: 'LeetCode' });
    expect(link).toHaveAttribute('href', 'https://leetcode.com/test');
  });

  it('renders Medium link with accessible name', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: 'Medium' });
    expect(link).toHaveAttribute('href', 'https://medium.com/test');
  });

  it('renders Twitter link with accessible name', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: 'Twitter' });
    expect(link).toHaveAttribute('href', 'https://twitter.com/test');
  });

  it('renders Email link with accessible name', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: 'Email' });
    expect(link).toHaveAttribute('href', 'mailto:test@example.com');
  });

  it('renders unknown platforms with capitalized fallback label', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: 'Custom-platform' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://custom.com');
  });

  it('renders an SVG icon for each social link', () => {
    render(<Footer />);
    const svgs = document.querySelectorAll('footer svg[aria-hidden="true"]');
    expect(svgs.length).toBe(mockSocialLinks.length);
  });

  it('renders back-to-top button', () => {
    render(<Footer />);
    const button = screen.getByRole('button', { name: '↑ Back to Top' });
    expect(button).toBeInTheDocument();
  });

  it('does not render emoji icons', () => {
    const { container } = render(<Footer />);
    expect(container.textContent).not.toMatch(/🐙/);
    expect(container.textContent).not.toMatch(/🔗/);
    expect(container.textContent).not.toMatch(/🐦/);
    expect(container.textContent).not.toMatch(/👨‍💻/);
    expect(container.textContent).not.toMatch(/✉️/);
  });
});