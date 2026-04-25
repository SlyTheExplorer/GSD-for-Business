/**
 * BRIEF Phase 7 Plan 07 — Surface cap structural test
 *
 * Phase 7 ships exactly NET +2 user-facing commands:
 *   - commands/brief/design.md
 *   - commands/brief/add-workstream.md
 *
 * Forbidden command files (must NOT exist) — these would re-introduce
 * on-demand re-gate ceremony that Phase 7 explicitly rejects per surface
 * cap (CLAUDE.md "≤12 user-facing slash commands") and per CONTEXT.md
 * "Why Phase 7 is the heaviest" — surface-cap discipline.
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const COMMANDS_DIR = path.join(__dirname, '..', 'commands', 'brief');

test('Phase 7 NET +2 commands present: design.md + add-workstream.md', () => {
  assert.ok(
    fs.existsSync(path.join(COMMANDS_DIR, 'design.md')),
    'commands/brief/design.md must exist'
  );
  assert.ok(
    fs.existsSync(path.join(COMMANDS_DIR, 'add-workstream.md')),
    'commands/brief/add-workstream.md must exist'
  );
});

test('Surface cap: forbidden Phase 7 commands MUST NOT exist (no on-demand re-gate ceremony)', () => {
  const FORBIDDEN = [
    'recompliance.md',
    'realign-workstream.md',
    'design-all.md',
    'refinancial.md',
    'recompliance-pack.md',
    'redesign.md',
    'relax-compliance.md',
    'skip-gates.md',
  ];
  for (const f of FORBIDDEN) {
    const fp = path.join(COMMANDS_DIR, f);
    assert.ok(
      !fs.existsSync(fp),
      `Forbidden command file should NOT exist: ${fp} ` +
      `(re-gating happens via re-running /brief-design or via FINDINGS-BLOCKING force-accept)`
    );
  }
});

test('No commands/brief/*-workstream*.md beyond add-workstream.md (excluding inherited workstreams.md)', () => {
  // The plan must_haves require "NET +2 commands (design + add-workstream)".
  // Inherited GSD scaffolding (commands/brief/workstreams.md) is the parallel-
  // milestone management surface from Phase 1 fork hygiene — it is NOT a
  // Phase 7-introduced command. The Phase 9 HRD-02 audit prunes inherited
  // surface; Phases 3-8 must not ADD new ones.
  //
  // Filter: catch only Phase 7-introduced workstream commands (excluding the
  // inherited workstreams.md). Anything matching `*workstream*.md` BEYOND
  // `add-workstream.md` and the inherited `workstreams.md` is a regression.
  const cmds = fs.readdirSync(COMMANDS_DIR)
    .filter(f => /workstream/.test(f) && f.endsWith('.md'))
    .filter(f => f !== 'workstreams.md'); // inherited from GSD; out of Phase 7 scope
  assert.deepStrictEqual(
    cmds.sort(),
    ['add-workstream.md'],
    `Only add-workstream.md (Phase 7 NET +1) should reference 'workstream' beyond ` +
    `the inherited workstreams.md; got: ${cmds.join(',')}`
  );
});

test('Surface cap: forbidden re-* prefix and *-all suffix patterns absent for Phase 7 keywords', () => {
  const cmds = fs.readdirSync(COMMANDS_DIR).filter(f => f.endsWith('.md'));
  // Catch any future drift: re-{compliance,align,design,financial,workstream}* etc.
  const phase7Keywords = ['compliance', 'design', 'workstream', 'financial'];
  for (const cmd of cmds) {
    if (cmd === 'add-workstream.md' || cmd === 'design.md' || cmd === 'workstreams.md') continue;
    for (const kw of phase7Keywords) {
      const reShape = new RegExp(`^re-?${kw}|^${kw}-all\\.md$`, 'i');
      assert.ok(
        !reShape.test(cmd),
        `Phase 7 surface-cap regression: ${cmd} matches forbidden re-${kw}/${kw}-all pattern`
      );
    }
  }
});
