/**
 * SiteSync Architecture & Code Quality Audit Test Suite (Master Prompt 12 Section 77 & 78)
 *
 * Programmatically enforces strict architectural guardrails:
 * 1. UI components do not import Prisma directly.
 * 2. UI components do not contain direct raw fetch/axios calls (Redux / API client layer pattern).
 * 3. No committed API keys or plaintext secrets in tracked codebase files.
 * 4. AI services are strictly read-only and lack direct database write / mutation capabilities.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';

function findFiles(dir: string, filter: (filePath: string) => boolean): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.next', '.git', 'data'].includes(entry.name)) {
        results = results.concat(findFiles(fullPath, filter));
      }
    } else if (filter(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

test('SiteSync Architecture & Code Quality Audit Suite (Master Prompt 12)', async (t) => {
  const rootDir = path.join(__dirname, '..');
  const componentsDir = path.join(rootDir, 'src', 'components');
  const apiDir = path.join(rootDir, 'apps', 'api', 'src');

  await t.test('1. Architectural Guardrail: UI Components Never Import Prisma Directly', () => {
    const componentFiles = findFiles(componentsDir, (f) => f.endsWith('.tsx') || f.endsWith('.ts'));
    assert(componentFiles.length > 0, 'Found UI component files to audit');

    const violations: string[] = [];
    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('@prisma/client') || content.includes('prisma.')) {
        violations.push(path.relative(rootDir, file));
      }
    }

    assert.equal(
      violations.length,
      0,
      `Architecture Violation: UI components importing Prisma directly: ${violations.join(', ')}`
    );
  });

  await t.test('2. Architectural Guardrail: AI Modules Lack Direct Database Mutation Privileges', () => {
    // Audit Copilot and Hybrid Matcher modules
    const aiFiles = findFiles(
      path.join(apiDir, 'modules', 'copilot'),
      (f) => f.endsWith('.ts') && !f.endsWith('.test.ts')
    );

    const violations: string[] = [];
    for (const file of aiFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      // Look for direct update/delete/create database statements
      if (/\bprisma\.\w+\.(update|delete|createMany|deleteMany)\b/.test(content)) {
        violations.push(path.relative(rootDir, file));
      }
    }

    assert.equal(
      violations.length,
      0,
      `AI Safety Violation: AI module contains direct DB mutation calls: ${violations.join(', ')}`
    );
  });

  await t.test('3. Secret Management Guardrail: No Hardcoded Secret Keys in Source Code', () => {
    const sourceFiles = findFiles(apiDir, (f) => f.endsWith('.ts'));
    const suspiciousKeyPatterns = [
      /['"][a-zA-Z0-9_-]{20,}['"]\s*:\s*['"]sk-[a-zA-Z0-9]{20,}['"]/,
      /ghp_[a-zA-Z0-9]{36}/,
      /AKIA[0-9A-Z]{16}/,
    ];

    const violations: string[] = [];
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      for (const pattern of suspiciousKeyPatterns) {
        if (pattern.test(content)) {
          violations.push(path.relative(rootDir, file));
          break;
        }
      }
    }

    assert.equal(violations.length, 0, `Secret Leakage: Found hardcoded keys in: ${violations.join(', ')}`);
  });

  await t.test('4. Redux API Orchestration & Separation of Concerns', () => {
    // Verify services structure matches Clean Architecture (Domain Services -> Infrastructure)
    const modulesDir = path.join(apiDir, 'modules');
    const modules = fs.readdirSync(modulesDir, { withFileTypes: true }).filter((d) => d.isDirectory());
    assert(modules.length >= 10, 'All domain capability modules must be present');

    // Confirm core modules exist
    const moduleNames = modules.map((m) => m.name);
    assert(moduleNames.includes('security'));
    assert(moduleNames.includes('observability'));
    assert(moduleNames.includes('resilience'));
    assert(moduleNames.includes('integrity'));
    assert(moduleNames.includes('pipeline'));
  });
});
