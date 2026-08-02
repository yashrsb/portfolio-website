import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';

/**
 * Determines the project root by walking up from the current working directory
 * until a package.json with sibling "frontend" and "backend" directories is found.
 * Falls back to the first package.json found, then process.cwd().
 */
const findProjectRoot = () => {
  let dir = process.cwd();
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      // Check if this is the root portfolio project (has frontend/ and backend/ siblings)
      if (
        fs.existsSync(path.join(dir, 'frontend')) &&
        fs.existsSync(path.join(dir, 'backend'))
      ) {
        return dir;
      }
    }
    dir = path.dirname(dir);
  }
  // Fallback: try direct parent or current directory
  if (fs.existsSync(path.join(process.cwd(), '..', 'package.json'))) {
    return path.resolve(process.cwd(), '..');
  }
  return process.cwd();
};

const PROJECT_ROOT = findProjectRoot();
const DEFAULT_YAML_PATH = path.join(
  PROJECT_ROOT,
  'docs',
  'portfolio-data.yaml',
);

/**
 * Reads and parses a YAML portfolio data file.
 *
 * @param {string} [filePath] - Absolute path to the YAML file.
 * @returns {object} Parsed portfolio data object.
 * @throws {Error} If the file is missing, unreadable, or contains invalid YAML.
 */
export function parseYamlFile(filePath) {
  const resolvedPath = filePath ?? DEFAULT_YAML_PATH;

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(
      `Portfolio data file not found at: ${resolvedPath}\n` +
        'Create docs/portfolio-data.yaml or run with --file=<path>',
    );
  }

  if (!resolvedPath.endsWith('.yaml') && !resolvedPath.endsWith('.yml')) {
    throw new Error(
      `Unsupported file format: ${resolvedPath}. Expected a .yaml file.`,
    );
  }

  const raw = fs.readFileSync(resolvedPath, 'utf-8');

  if (!raw || raw.trim().length === 0) {
    throw new Error(`Portfolio data file is empty: ${resolvedPath}`);
  }

  let parsed;
  try {
    parsed = yaml.parse(raw, { prettyErrors: true });
  } catch (err) {
    throw new Error(
      `Failed to parse YAML file: ${resolvedPath}\n` +
        `YAML error: ${err.message}`,
    );
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(
      `YAML file must contain a top-level object. Found: ${typeof parsed}`,
    );
  }

  return parsed;
}
