import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProjectBySlug } from '../src/services/portfolioService.js';
import { getProjects } from '../src/services/portfolioService.js';

const mockFindProjects = vi.fn();
const mockFindProjectBySlug = vi.fn();

vi.mock('../src/repositories/index.js', () => ({
  findProjects: (...args) => mockFindProjects(...args),
  findProjectBySlug: (...args) => mockFindProjectBySlug(...args),
  findExperience: vi.fn(),
  findSkills: vi.fn(),
  findEducation: vi.fn(),
  findProfile: vi.fn(),
  findSocial: vi.fn(),
  createContactMessage: vi.fn(),
  updateContactEmailStatus: vi.fn(),
}));

vi.mock('../src/services/emailService.js', () => ({
  sendContactNotification: vi.fn(),
  sendMail: vi.fn(),
}));

vi.mock('../src/utils/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('portfolioService.getProjectBySlug', () => {
  beforeEach(() => {
    mockFindProjectBySlug.mockReset();
    mockFindProjectBySlug.mockResolvedValue({
      id: 'proj-1',
      slug: 'notifyhub',
      title: 'NotifyHub',
      description: 'A real-time notification platform.',
      summary: 'Real-time notifications.',
      githubUrl: 'https://github.com/yashrsb/notifyhub',
      demoUrl: null,
      status: 'live',
      featured: true,
      displayOrder: 1,
      tags: ['React', 'Node.js'],
      features: ['Real-time messaging'],
      challenges: ['Concurrency'],
      lessonsLearned: ['Use connection pooling'],
      architecture: 'Client → API → DB',
      screenshots: null,
      techStack: null,
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    });
  });

  it('returns the project when a valid slug is provided', async () => {
    const result = await getProjectBySlug('notifyhub');

    expect(mockFindProjectBySlug).toHaveBeenCalledWith('notifyhub');
    expect(result).toEqual({
      id: 'proj-1',
      slug: 'notifyhub',
      title: 'NotifyHub',
      description: 'A real-time notification platform.',
      summary: 'Real-time notifications.',
      githubUrl: 'https://github.com/yashrsb/notifyhub',
      demoUrl: null,
      status: 'live',
      featured: true,
      displayOrder: 1,
      tags: ['React', 'Node.js'],
      features: ['Real-time messaging'],
      challenges: ['Concurrency'],
      lessonsLearned: ['Use connection pooling'],
      architecture: 'Client → API → DB',
      screenshots: null,
      techStack: null,
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    });
  });

  it('returns null when the slug does not match any project', async () => {
    mockFindProjectBySlug.mockResolvedValue(null);
    const result = await getProjectBySlug('non-existent');

    expect(mockFindProjectBySlug).toHaveBeenCalledWith('non-existent');
    expect(result).toBeNull();
  });
});

describe('portfolioService.getProjects (backward compatibility)', () => {
  beforeEach(() => {
    mockFindProjects.mockReset();
    mockFindProjects.mockResolvedValue([
      { id: 'proj-1', slug: 'notifyhub', title: 'NotifyHub' },
    ]);
  });

  it('continues to return all projects', async () => {
    const result = await getProjects();

    expect(mockFindProjects).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('notifyhub');
  });
});
