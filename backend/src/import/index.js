#!/usr/bin/env node

/**
 * Portfolio content import CLI.
 *
 * Usage:
 *   npm run import:portfolio
 *   npm run import:portfolio -- --file=docs/portfolio-data.yaml
 *   npm run import:portfolio -- --dry-run
 *
 * Options:
 *   --file=<path>     Path to the YAML data file (default: docs/portfolio-data.yaml)
 *   --dry-run         Parse, validate, and normalize without writing to the database
 *   --help            Show this help message
 */

import { parseYamlFile } from './parser/yamlParser.js';
import {
  validatePortfolioData,
  formatValidationReport,
} from './validator/validate.js';
import { normalizePortfolioData } from './normalizer/contentNormalizer.js';
import { importContent } from './service/contentImporter.js';

// ---------------------------------------------------------------------------
// CLI helpers
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const HELP_FLAGS = new Set(['--help', '-h']);
const DRY_RUN_FLAGS = new Set(['--dry-run', '--dry']);

const showHelp = () => {
  console.log(`
  Portfolio Import CLI

  Imports portfolio data from a YAML file into PostgreSQL.

  Usage:
    npm run import:portfolio
    npm run import:portfolio -- --file=docs/portfolio-data.yaml
    npm run import:portfolio -- --dry-run

  Options:
    --file=<path>     Path to the YAML data file (default: docs/portfolio-data.yaml)
    --dry-run         Parse, validate, and normalize without writing to the database
    --help, -h        Show this help message
  `);
  process.exit(0);
};

const parseArgs = () => {
  const options = { file: null, dryRun: false };

  for (const arg of args) {
    if (HELP_FLAGS.has(arg)) {
      showHelp();
    }
    if (DRY_RUN_FLAGS.has(arg)) {
      options.dryRun = true;
      continue;
    }
    if (arg.startsWith('--file=')) {
      options.file = arg.slice('--file='.length);
      continue;
    }
  }

  return options;
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const main = async () => {
  const options = parseArgs();
  let startTime;

  try {
    console.log('');
    console.log('  Portfolio Import');
    console.log('  ────────────────');
    console.log('');

    // 1. Parse
    startTime = Date.now();
    console.log('  📖 Reading portfolio data...');
    const data = parseYamlFile(options.file);
    console.log(`  ✓ YAML parsed successfully (${Date.now() - startTime}ms)`);
    console.log('');

    // 2. Validate
    startTime = Date.now();
    console.log('  🔍 Validating data...');
    const { valid, errors } = validatePortfolioData(data);

    if (!valid) {
      console.log('');
      console.log(formatValidationReport(errors));
      console.log('');
      console.log(
        '  ❌ Validation failed. No data was written to the database.',
      );
      process.exit(1);
    }
    console.log(`  ✓ All validations passed (${Date.now() - startTime}ms)`);
    console.log('');

    // 3. Normalize
    startTime = Date.now();
    console.log('  🔄 Normalizing data...');
    const normalized = normalizePortfolioData(data);
    console.log(`  ✓ Data normalized (${Date.now() - startTime}ms)`);
    console.log('');

    // 4. Dry-run check
    if (options.dryRun) {
      console.log('  🏁 Dry-run mode — no data written to database.');
      console.log('');
      console.log(`  Sections loaded:`);
      if (normalized.profile)
        console.log(`    • Profile: ${normalized.profile.name}`);
      if (normalized.experience.length)
        console.log(
          `    • Experience: ${normalized.experience.length} records`,
        );
      if (normalized.projects.length)
        console.log(`    • Projects: ${normalized.projects.length} records`);
      if (normalized.skills.length)
        console.log(`    • Skills: ${normalized.skills.length} records`);
      if (normalized.education.length)
        console.log(`    • Education: ${normalized.education.length} records`);
      if (normalized.certificates.length)
        console.log(
          `    • Certificates: ${normalized.certificates.length} records`,
        );
      if (normalized.achievements.length)
        console.log(
          `    • Achievements: ${normalized.achievements.length} records`,
        );
      if (normalized.socialLinks.length)
        console.log(
          `    • Social Links: ${normalized.socialLinks.length} records`,
        );
      console.log('');
      console.log('  Run without --dry-run to import into PostgreSQL.');
      process.exit(0);
    }

    // 5. Import
    startTime = Date.now();
    console.log('  💾 Importing into PostgreSQL...');
    const summary = await importContent(normalized);
    console.log(`  ✓ Import completed (${Date.now() - startTime}ms)`);
    console.log('');

    // 6. Summary
    console.log('  ── Import Summary ──');
    console.log('');
    if (summary.profile) console.log(`  ✓ Profile updated`);
    if (summary.experience)
      console.log(`  ✓ Experience: ${summary.experience.count} records`);
    if (summary.projects)
      console.log(`  ✓ Projects: ${summary.projects.count} records`);
    if (summary.skills)
      console.log(`  ✓ Skills: ${summary.skills.count} records`);
    if (summary.education)
      console.log(`  ✓ Education: ${summary.education.count} records`);
    if (summary.certificates)
      console.log(`  ✓ Certificates: ${summary.certificates.count} records`);
    if (summary.achievements)
      console.log(`  ✓ Achievements: ${summary.achievements.count} records`);
    if (summary.socialLinks)
      console.log(`  ✓ Social Links: ${summary.socialLinks.count} records`);
    console.log('');
    console.log('  ✅ Import completed successfully.');
    console.log('');
    process.exit(0);
  } catch (err) {
    console.error('');
    console.error(`  ❌ Import failed: ${err.message}`);
    console.error('');
    process.exit(1);
  }
};

main();
