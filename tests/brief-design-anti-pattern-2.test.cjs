/**
 * BRIEF Phase 7 Plan 07 — Anti-pattern #2 structural test
 *
 * Anti-pattern #2: Hook-spawned gates. The COMPLIANCE checker / design
 * orchestrator / add-workstream orchestrator MUST be invoked from explicit
 * orchestrator workflow steps — NEVER from PostToolUse / SubagentStop hooks.
 *
 * This test greps hooks/ for any reference to the Phase 7 gate workflows
 * or agents and asserts zero matches. Same discipline as Phase 4/5/6.
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const HOOKS_DIR = path.join(__dirname, '..', 'hooks');

/**
 * Recursively walk a directory and return all file paths.
 * Skips dot-directories (e.g., .git) and node_modules.
 */
function walkFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, acc);
    } else if (entry.isFile()) {
      acc.push(full);
    }
  }
  return acc;
}

const FORBIDDEN_PATTERNS = [
  /compliance-checker/,
  /brief-compliance-checker/,
  /compliance_checker/,
  /brief\/workflows\/compliance/,
  /brief\/workflows\/design/,
  /brief\/workflows\/add-workstream/,
];

test('Anti-pattern #2: hooks/ contains NO references to Phase 7 workflows or compliance-checker agent', () => {
  if (!fs.existsSync(HOOKS_DIR)) {
    // No hooks/ directory means trivially clean.
    return;
  }
  const violations = [];
  for (const filePath of walkFiles(HOOKS_DIR)) {
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch {
      continue; // unreadable (binary, permissions, etc.) — skip
    }
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(content)) {
        violations.push({ file: filePath, pattern: pattern.source });
      }
    }
  }
  assert.deepStrictEqual(
    violations,
    [],
    `Anti-pattern #2 violation — hooks/ references Phase 7 workflows/agents:\n` +
    violations.map(v => `  ${v.file} matches /${v.pattern}/`).join('\n')
  );
});

test('PostToolUse / SubagentStop in hooks/ does NOT trigger compliance gate', () => {
  if (!fs.existsSync(HOOKS_DIR)) return;
  const violations = [];
  // Multi-line patterns — concatenate hook source per file then run regex.
  const compositePatterns = [
    /PostToolUse[\s\S]{0,200}compliance/i,
    /SubagentStop[\s\S]{0,200}compliance/i,
    /PreCompact[\s\S]{0,200}compliance/i,
  ];
  for (const filePath of walkFiles(HOOKS_DIR)) {
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch {
      continue;
    }
    for (const pattern of compositePatterns) {
      if (pattern.test(content)) {
        violations.push({ file: filePath, pattern: pattern.source });
      }
    }
  }
  assert.deepStrictEqual(
    violations,
    [],
    `Hook-spawned compliance gate detected:\n` +
    violations.map(v => `  ${v.file} matches /${v.pattern}/`).join('\n')
  );
});
