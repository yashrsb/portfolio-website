import { portfolioSchema } from './schemas.js';

/**
 * Validates parsed portfolio data against Zod schemas.
 * Collects ALL errors instead of failing on the first one.
 *
 * @param {object} data - Parsed YAML data.
 * @returns {{ valid: boolean, errors: Array<{ section: string, issues: Array }> }}
 */
export function validatePortfolioData(data) {
  const errors = [];

  // Validate the entire portfolio structure
  const result = portfolioSchema.safeParse(data);

  if (!result.success) {
    // Group Zod issues by section (path[0] = top-level key)
    const grouped = {};

    for (const issue of result.error.issues) {
      const section = issue.path[0] || 'root';
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      });
    }

    for (const [section, issues] of Object.entries(grouped)) {
      errors.push({ section, issues });
    }
  }

  // Additional custom validations beyond Zod

  // 1. Check for duplicate project slugs
  if (data.projects?.length) {
    const slugs = data.projects.map((p) => p.slug);
    const duplicates = slugs.filter((slug, idx) => slugs.indexOf(slug) !== idx);
    if (duplicates.length > 0) {
      errors.push({
        section: 'projects',
        issues: [
          {
            path: 'slug',
            message: `Duplicate project slugs: ${[...new Set(duplicates)].join(', ')}`,
            code: 'duplicate',
          },
        ],
      });
    }
  }

  // 2. Check for duplicate skill name+category combinations
  if (data.skills?.length) {
    const seen = new Set();
    const duplicates = [];
    for (const skill of data.skills) {
      const key = `${skill.name}::${skill.category}`;
      if (seen.has(key)) {
        duplicates.push(`${skill.name} (${skill.category})`);
      }
      seen.add(key);
    }
    if (duplicates.length > 0) {
      errors.push({
        section: 'skills',
        issues: [
          {
            path: 'name/category',
            message: `Duplicate skill name+category combinations: ${duplicates.join(', ')}`,
            code: 'duplicate',
          },
        ],
      });
    }
  }

  // 3. Check for duplicate social link platforms
  if (data.socialLinks?.length) {
    const platforms = data.socialLinks.map((s) => s.platform);
    const duplicates = platforms.filter(
      (p, idx) => platforms.indexOf(p) !== idx,
    );
    if (duplicates.length > 0) {
      errors.push({
        section: 'socialLinks',
        issues: [
          {
            path: 'platform',
            message: `Duplicate social link platforms: ${[...new Set(duplicates)].join(', ')}`,
            code: 'duplicate',
          },
        ],
      });
    }
  }

  // 4. Check that endDate >= startDate for experience (if both present)
  if (data.experience?.length) {
    for (let i = 0; i < data.experience.length; i++) {
      const exp = data.experience[i];
      if (exp.startDate && exp.endDate && !exp.current) {
        const start = new Date(`${exp.startDate} 01`);
        const end = new Date(`${exp.endDate} 01`);
        if (start > end) {
          errors.push({
            section: 'experience',
            issues: [
              {
                path: `[${i}].endDate`,
                message: `End date (${exp.endDate}) is before start date (${exp.startDate}) for "${exp.company}"`,
                code: 'invalid_date_range',
              },
            ],
          });
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Formats validation errors into a human-readable report.
 *
 * @param {Array<{ section: string, issues: Array }>} errors
 * @returns {string} Formatted error report.
 */
export function formatValidationReport(errors) {
  if (errors.length === 0) {
    return '✓ All validations passed.';
  }

  const lines = ['── Validation Report ──', ''];

  for (const group of errors) {
    lines.push(`  ✗ ${group.section}:`);
    for (const issue of group.issues) {
      lines.push(`      - ${issue.path}: ${issue.message}`);
    }
    lines.push('');
  }

  lines.push(`  Found ${errors.length} section(s) with errors.`);
  lines.push('');
  lines.push('  Fix the issues above and run the import again.');

  return lines.join('\n');
}
