/**
 * Smoke-Test — cross-runtime stub-driven smoke verification (Phase 9
 * Plan HRD-01). Spawns 4 mock subprocesses (claude/codex/gemini/opencode)
 * with INSTRUCTION_FILE env preset per runtime + text_mode flag flip;
 * captures stdout per (runtime, command) cell; emits 4×5 PASS/FAIL/SKIP
 * matrix to .planning/SMOKE-TEST.md per B-D04 schema.
 *
 * Stub-driven by design (B-D01) — NEVER invokes real Codex/Gemini/OpenCode
 * CLIs (user-environment-dependent + API-cost-bearing). v1.1 may add
 * --live opt-in.
 *
 * Pitfall 4 (text_mode plumbing breakage) mitigation: each cell uses
 * `execFileSync` with `timeout: 5000` (5s budget); ETIMEDOUT cells return
 * FAIL with reason 'timeout 5s'. Belt-and-suspenders: env carries
 * INSTRUCTION_FILE marker AND child invocation passes `--text` flag.
 *
 * Zero runtime deps (A1). Built-in node:child_process + node:fs + node:path.
 *
 * Refs: 09-RESEARCH.md §Pattern 1 (lines 288-331), §Pitfall 4
 * (lines 525-536); 09-PATTERNS.md lines 256-332; 09-01-PLAN.md.
 */

'use strict';

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

// RUNTIMES — 4-entry stub fan-out (B-D01 + B-D03). The `text_mode_default`
// key is a stub-test marker (NOT a real env var consumed by brief-tools.cjs);
// it gates the "AskUserQuestion present despite text_mode" assertion in
// smokeOneCell. Stripped from the child env before spreading (see below).
const RUNTIMES = [
  { name: 'claude',   env: {                                   text_mode_default: false } },
  { name: 'codex',    env: { INSTRUCTION_FILE: 'AGENTS.md',    text_mode_default: true  } },
  { name: 'gemini',   env: {                                   text_mode_default: true  } },
  { name: 'opencode', env: {                                   text_mode_default: true  } },
];

// COMMANDS — 5 critical commands per B-D02 (the user-facing 4D phase entry
// points + init). buildMatrix iterates RUNTIMES × COMMANDS = 20 cells.
const COMMANDS = ['init', 'define', 'discover', 'design', 'deliver'];

/**
 * smokeOneCell(runtime, cmd, briefRoot)
 *
 * Spawn brief-tools.cjs <cmd> --smoke --text with runtime.env injected.
 * Pitfall 4 mitigation: timeout: 5000.
 *
 * @param {{name: string, env: object}} runtime
 * @param {string} cmd
 * @param {string} briefRoot — absolute path to BRIEF repo root
 * @returns {{ status: 'PASS'|'FAIL'|'SKIP', reason: string }}
 */
function smokeOneCell(runtime, cmd, briefRoot) {
  // Strip the stub-test marker from runtime.env before spreading into child
  // env — `text_mode_default` is for the assertion below only. Spread
  // runtime.env's other keys (e.g., INSTRUCTION_FILE) AFTER process.env so
  // they override any inherited values.
  const { text_mode_default, ...envOverrides } = runtime.env;
  const env = {
    ...process.env,
    ...envOverrides,
    BRIEF_RUNTIME_MOCK: runtime.name,
  };
  // WR-03 — force-clear runtime-distinguishing keys the parent shell may have
  // exported (e.g., when the harness is invoked from inside a Codex session
  // or CI with INSTRUCTION_FILE set). Without this, Claude's cell silently
  // inherits the parent's INSTRUCTION_FILE because envOverrides has no key
  // to overwrite it, and B-D03 ("INSTRUCTION_FILE is the canonical
  // non-Claude detector") is violated. Run AFTER the spread so per-runtime
  // overrides win for runtimes that DO set the key (e.g., codex).
  if (!Object.prototype.hasOwnProperty.call(envOverrides, 'INSTRUCTION_FILE')) {
    delete env.INSTRUCTION_FILE;
  }

  try {
    const out = execFileSync(
      process.execPath,
      [
        path.join(briefRoot, 'brief', 'bin', 'brief-tools.cjs'),
        cmd,
        '--smoke',
        '--text',
      ],
      { env, encoding: 'utf-8', timeout: 5000 }   // Pitfall 4: 5s cell budget
    );
    if (out.includes('AskUserQuestion') && text_mode_default === true) {
      return { status: 'FAIL', reason: 'AskUserQuestion present despite text_mode' };
    }
    return { status: 'PASS', reason: '' };
  } catch (err) {
    if (err && err.code === 'ETIMEDOUT') {
      return { status: 'FAIL', reason: 'timeout 5s' };
    }
    const firstLine = (err && err.message ? String(err.message) : 'unknown error').split('\n')[0];
    return { status: 'FAIL', reason: firstLine };
  }
}

/**
 * buildMatrix(briefRoot)
 *
 * Iterate RUNTIMES × COMMANDS = 4 × 5 = 20 cells. Returns 2D array;
 * matrix[i][j] is the cell for RUNTIMES[i] × COMMANDS[j].
 *
 * @param {string} briefRoot
 * @returns {Array<Array<{status, reason}>>}
 */
function buildMatrix(briefRoot) {
  return RUNTIMES.map((rt) => COMMANDS.map((cmd) => smokeOneCell(rt, cmd, briefRoot)));
}

/**
 * renderMatrixMarkdown(matrix)
 *
 * Produce SMOKE-TEST.md body per B-D04 schema:
 *   - Header
 *   - Run metadata
 *   - 4-row × 5-col table
 *   - "FAIL/SKIP Detail" section enumerating non-PASS cells
 *
 * @param {Array<Array<{status, reason}>>} matrix
 * @returns {string}
 */
function renderMatrixMarkdown(matrix) {
  const runDate = new Date().toISOString().slice(0, 10);
  let md = '';
  md += '# BRIEF Cross-Runtime Smoke Test — v1 Launch\n\n';
  md += '**Run:** ' + runDate + '\n';
  md += '**Approach:** Stub-driven (B-D01). NEVER invokes real Codex/Gemini/OpenCode CLIs.\n';
  md += '**Result format:** PASS / FAIL / SKIP per cell + one-line reason.\n\n';

  // Table header — 5 command columns + Runtime column.
  md += '| Runtime    | init | define | discover | design | deliver |\n';
  md += '|------------|------|--------|----------|--------|---------|\n';

  for (let i = 0; i < RUNTIMES.length; i++) {
    const row = matrix[i] || [];
    const cells = row.map((c) => (c && c.status ? c.status : 'SKIP').padEnd(4));
    // Pad runtime name to keep table readable; status cells already padded.
    md += '| ' + RUNTIMES[i].name.padEnd(10) + ' | ' + cells.join(' | ') + ' |\n';
  }
  md += '\n';

  // FAIL/SKIP Detail section — one bullet per non-PASS cell.
  md += '## FAIL/SKIP Detail\n\n';
  const detail = [];
  for (let i = 0; i < RUNTIMES.length; i++) {
    const row = matrix[i] || [];
    for (let j = 0; j < COMMANDS.length; j++) {
      const cell = row[j];
      if (!cell || cell.status === 'PASS') continue;
      detail.push('- **' + RUNTIMES[i].name + ' × ' + COMMANDS[j] + '** — ' + cell.status + ': ' + (cell.reason || '(no reason)'));
    }
  }
  if (detail.length === 0) {
    md += '(All cells PASS — text_mode fallback verified across all 4 runtimes × 5 commands.)\n';
  } else {
    md += detail.join('\n') + '\n';
  }

  return md;
}

// Reference fs only inside conditional debug paths if needed; keep import for
// downstream extensions (e.g., Plan 02 may add fs.existsSync prechecks).
void fs;

module.exports = {
  RUNTIMES,
  COMMANDS,
  smokeOneCell,
  buildMatrix,
  renderMatrixMarkdown,
};
