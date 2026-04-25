/**
 * brief-compliance-canonical-shape.test.cjs — Plan 07-01 Task 1 / Task 3.
 *
 * Asserts that agents/brief-compliance-checker.md mirrors the canonical 7-section
 * shape that agents/brief-audience-guard.md established (Phase 5) and that
 * brief/bin/lib/compliance.cjs exports the same canonical names as
 * brief/bin/lib/audience.cjs (with the verdict-enum swap).
 *
 * Wave 0 scaffold: tests are GUARDED with a `skip` predicate that lets them be
 * green during Plan 07-01 Task 1 (when the agent + lib don't yet exist), and
 * become enforced once Task 2 + Task 3 land.
 *
 * 7 H2/XML sections asserted on agents/brief-compliance-checker.md:
 *   <role>, <required_reading>, <vocabulary_discipline>, <decision_mechanism>,
 *   <output_contract>, <process>, <examples>
 *
 * Canonical lib exports asserted on brief/bin/lib/compliance.cjs:
 *   VALID_DECISIONS, VALID_SEVERITIES, BAN_EN, BAN_KO, BAN_SYMBOL,
 *   validateVerdict, grepBanList, runDeterministicScreen, writeVerdict,
 *   mergeVerdicts, runCompliance, commitComplianceVerdict, siblingReportPath,
 *   detectKoreaSignalFromConfig
 *
 * Reference: 07-01-PLAN.md Task 1 acceptance + Task 3 promote-to-passing.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.join(__dirname, '..');
const AGENT_PATH = path.join(REPO_ROOT, 'agents/brief-compliance-checker.md');
const LIB_PATH = path.join(REPO_ROOT, 'brief/bin/lib/compliance.cjs');
const WORKFLOW_PATH = path.join(REPO_ROOT, 'brief/workflows/compliance.md');

const REQUIRED_AGENT_SECTIONS = [
  '<role>',
  '<required_reading>',
  '<vocabulary_discipline>',
  '<decision_mechanism>',
  '<output_contract>',
  '<process>',
  '<examples>',
];

const REQUIRED_LIB_EXPORTS = [
  'VALID_DECISIONS',
  'VALID_SEVERITIES',
  'BAN_EN',
  'BAN_KO',
  'BAN_SYMBOL',
  'validateVerdict',
  'grepBanList',
  'runDeterministicScreen',
  'writeVerdict',
  'mergeVerdicts',
  'runCompliance',
  'commitComplianceVerdict',
  'siblingReportPath',
  'detectKoreaSignalFromConfig',
];

test('agents/brief-compliance-checker.md has 7 canonical XML/H2 sections', { skip: !fs.existsSync(AGENT_PATH) ? 'agent file pending Task 3' : false }, () => {
  const content = fs.readFileSync(AGENT_PATH, 'utf-8');
  for (const section of REQUIRED_AGENT_SECTIONS) {
    assert.ok(
      content.includes(section),
      `agents/brief-compliance-checker.md missing canonical section ${section}. Phase 5 audience-guard establishes this 7-section shape; Phase 7 must mirror exactly.`,
    );
  }
});

test('brief/bin/lib/compliance.cjs exports canonical names from audience.cjs (with COMPLIANCE-* verdict swap)', { skip: !fs.existsSync(LIB_PATH) ? 'lib file pending Task 2' : false }, () => {
  const mod = require(LIB_PATH);
  const exported = Object.keys(mod).sort();
  for (const name of REQUIRED_LIB_EXPORTS) {
    assert.ok(
      exported.includes(name),
      `brief/bin/lib/compliance.cjs missing canonical export '${name}'. Exported: ${exported.join(', ')}`,
    );
  }
  // Verdict enum swap: COMPLIANCE-OK / FINDINGS-MATERIAL / FINDINGS-BLOCKING.
  assert.ok(mod.VALID_DECISIONS.has('COMPLIANCE-OK'), 'VALID_DECISIONS must contain COMPLIANCE-OK');
  assert.ok(mod.VALID_DECISIONS.has('FINDINGS-MATERIAL'), 'VALID_DECISIONS must contain FINDINGS-MATERIAL');
  assert.ok(mod.VALID_DECISIONS.has('FINDINGS-BLOCKING'), 'VALID_DECISIONS must contain FINDINGS-BLOCKING');
  // No leftover audience verdicts.
  assert.ok(!mod.VALID_DECISIONS.has('AUDIENCE-OK'), 'VALID_DECISIONS must NOT contain AUDIENCE-OK (verdict-enum leak)');
  assert.ok(!mod.VALID_DECISIONS.has('DRIFTED-frontmatter'), 'VALID_DECISIONS must NOT contain DRIFTED-frontmatter');
  assert.ok(!mod.VALID_DECISIONS.has('DRIFTED-content'), 'VALID_DECISIONS must NOT contain DRIFTED-content');
});

test('brief/workflows/compliance.md has Step structure mirroring audience-guard.md', { skip: !fs.existsSync(WORKFLOW_PATH) ? 'workflow file pending Task 3' : false }, () => {
  const content = fs.readFileSync(WORKFLOW_PATH, 'utf-8');
  // Mirror the audience-guard step structure: Step 0 (param parsing/TEXT_MODE),
  // Step 1 (deterministic screen), Step 2 (LLM pass), Step 3 (verdict routing),
  // Step 4 (atomic commit), Step 5 (interrupt), Step 6 (force-accept), Step 7 (exit).
  assert.match(content, /## Step 0:/, 'compliance.md must have Step 0 (param parsing)');
  assert.match(content, /## Step 1:/, 'compliance.md must have Step 1 (deterministic screen)');
  assert.match(content, /## Step 2:/, 'compliance.md must have Step 2 (LLM pass)');
  assert.match(content, /## Step 3:/, 'compliance.md must have Step 3 (verdict routing)');
  assert.match(content, /## Step 4:/, 'compliance.md must have Step 4 (atomic commit)');
  assert.match(content, /## Step 5:?/, 'compliance.md must have Step 5 (interrupt for FINDINGS-BLOCKING)');
  assert.match(content, /## Step 6:/, 'compliance.md must have Step 6 (force-accept)');
});
