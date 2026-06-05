import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOT_DIR = process.cwd();
const OUTPUT_FILE = join(ROOT_DIR, 'trajectiv-front-architecture.txt');

const ignoredDirs = new Set([
  'node_modules',
  'dist',
  '.angular',
  '.git',
  '.idea',
  '.vscode',
  'coverage',
  '.cache',
]);

const ignoredFiles = new Set(['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml']);

const includedContentExtensions = new Set(['.ts', '.html', '.css', '.scss', '.json']);

const importantFiles = new Set([
  'angular.json',
  'package.json',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.base.json',
]);

const maxFileSize = 30_000;

function shouldIgnore(pathPart) {
  return ignoredDirs.has(pathPart) || ignoredFiles.has(pathPart);
}

function walk(dir, depth = 0, lines = []) {
  const entries = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !shouldIgnore(entry.name))
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = relative(ROOT_DIR, fullPath);
    const indent = '  '.repeat(depth);

    if (entry.isDirectory()) {
      lines.push(`${indent}📁 ${entry.name}/`);
      walk(fullPath, depth + 1, lines);
    } else {
      lines.push(`${indent}📄 ${entry.name}`);
    }
  }

  return lines;
}

function collectFiles(dir, files = []) {
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (shouldIgnore(entry.name)) continue;

    const fullPath = join(dir, entry.name);
    const relativePath = relative(ROOT_DIR, fullPath);

    if (entry.isDirectory()) {
      collectFiles(fullPath, files);
      continue;
    }

    const ext = extname(entry.name);
    const isImportant = importantFiles.has(entry.name);
    const isSourceFile =
      relativePath.startsWith('projects/app/src/') ||
      relativePath.startsWith('projects/core/src/') ||
      relativePath.startsWith('projects/shared-ui/src/') ||
      relativePath.startsWith('projects/themes/src/');

    if ((isImportant || isSourceFile) && includedContentExtensions.has(ext)) {
      const size = statSync(fullPath).size;

      if (size <= maxFileSize) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function renderFileContent(filePath) {
  const relativePath = relative(ROOT_DIR, filePath);
  const content = readFileSync(filePath, 'utf8');

  return [
    '',
    '============================================================',
    `FILE: ${relativePath}`,
    '============================================================',
    '',
    content,
    '',
  ].join('\n');
}

const architectureTree = walk(ROOT_DIR);
const files = collectFiles(ROOT_DIR);

const output = [
  '# Trajectiv Front Architecture Export',
  '',
  `Generated at: ${new Date().toISOString()}`,
  '',
  '## Workspace tree',
  '',
  ...architectureTree,
  '',
  '',
  '## Important files content',
  '',
  ...files.map(renderFileContent),
].join('\n');

writeFileSync(OUTPUT_FILE, output, 'utf8');

console.log(`Architecture exported to: ${OUTPUT_FILE}`);
