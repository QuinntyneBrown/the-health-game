import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const FORBIDDEN = {
  api: ['components', 'domain', 'the-health-game'],
  components: ['api', 'domain', 'the-health-game'],
  domain: ['the-health-game'],
};

const IMPORT_RE = /from\s+['"]([^'"]+)['"]/g;

export function findBoundaryViolations(project, files) {
  const forbidden = FORBIDDEN[project] ?? [];
  const violations = [];
  for (const file of files) {
    for (const match of file.source.matchAll(IMPORT_RE)) {
      const target = match[1];
      const head = target.split('/')[0];
      if (forbidden.includes(head)) {
        violations.push({
          path: file.path,
          message: `'${project}' must not import '${head}' (found: ${target})`,
        });
      }
    }
  }
  return violations;
}

function readSourceFiles(root) {
  const files = [];
  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stats = statSync(full);
      if (stats.isDirectory()) {
        walk(full);
      } else if (full.endsWith('.ts') && !full.endsWith('.spec.ts')) {
        files.push({ path: full, source: readFileSync(full, 'utf8') });
      }
    }
  }
  walk(root);
  return files;
}

function main() {
  const projects = ['api', 'components', 'domain'];
  const root = new URL('../projects/', import.meta.url).pathname.replace(/^\//, '');
  let total = 0;
  for (const project of projects) {
    const projectRoot = join(root, project, 'src');
    const files = readSourceFiles(projectRoot);
    const violations = findBoundaryViolations(project, files);
    for (const v of violations) {
      console.error(`${v.path}: ${v.message}`);
    }
    total += violations.length;
  }
  if (total > 0) {
    console.error(`\n${total} module-boundary violation(s) found.`);
    process.exit(1);
  }
  console.log('Module boundaries OK');
}

if (process.argv[1]?.endsWith('check-boundaries.mjs')) {
  main();
}
