import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Sidebar from './Sidebar';
import { PUBLIC_SITE_URL } from '../../../constants/api';

describe('Sidebar', () => {
  const renderSidebar = (props = {}) => {
    return render(
      <BrowserRouter>
        <Sidebar isOpen={true} onClose={() => {}} {...props} />
      </BrowserRouter>,
    );
  };

  it('renders the brand name', () => {
    renderSidebar();
    expect(screen.getByText('Portfolio Admin')).toBeInTheDocument();
  });

  it('renders navigation items', () => {
    renderSidebar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
  });

  it('renders the "View Public Site" link', () => {
    renderSidebar();
    const link = screen.getByText('View Public Site →');
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('A');
  });

  it('links to the configured PUBLIC_SITE_URL', () => {
    renderSidebar();
    const link = screen.getByText('View Public Site →');
    expect(link.getAttribute('href')).toBe(PUBLIC_SITE_URL);
  });

  it('retains target="_blank" and rel="noopener noreferrer"', () => {
    renderSidebar();
    const link = screen.getByText('View Public Site →');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('exports PUBLIC_SITE_URL from constants', () => {
    expect(PUBLIC_SITE_URL).toBeDefined();
    expect(typeof PUBLIC_SITE_URL).toBe('string');
  });
});
