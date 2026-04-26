/**
 * brief-deliver-type-a-templates.test.cjs — Phase 8 Plan 08-05 Wave 0 RED tests.
 *
 * Asserts the (Wave 0 NOT YET IMPLEMENTED) Type A agent + 4 production
 * templates ship with byte-identity to Plan 01 deliver.cjs SYNTHESIS_MAP.
 *
 *   1. agents/brief-deliver-type-a.md (parameterized {{ARTIFACT}})
 *   2. brief/templates/deliver/type-a/product-brief.md
 *   3. brief/templates/deliver/type-a/service-policy.md
 *   4. brief/templates/deliver/type-a/high-level-spec.md
 *   5. brief/templates/deliver/type-a/feature-map.md
 *
 * Wave 0 RED contract: files do not exist yet. Each test catches the
 * fs.statSync ENOENT and asserts (RED). Task 2 (GREEN) implements the agent
 * + templates which makes the read succeed and substantive assertions take
 * over.
 *
 * Zero-dep: node:test + node:assert + node:fs + node:path only.
 *
 * References:
 *   - .planning/phases/08-deliver-type-a-type-b-audience-enforcement-marp/08-05-PLAN.md Tasks 1-2 behaviors
 *   - .planning/phases/08-deliver-type-a-type-b-audience-enforcement-marp/08-PATTERNS.md lines 826-872 (template patterns) + 360-394 (agent pattern)
 *   - brief/bin/lib/deliver.cjs SYNTHESIS_MAP (Plan 01 — section markers MUST match byte-identically)
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.join(__dirname, '..');

const TPL_DIR = path.join(REPO_ROOT, 'brief', 'templates', 'deliver', 'type-a');
const AGENT = path.join(REPO_ROOT, 'agents', 'brief-deliver-type-a.md');

const TPL_PRODUCT_BRIEF = path.join(TPL_DIR, 'product-brief.md');
const TPL_SERVICE_POLICY = path.join(TPL_DIR, 'service-policy.md');
const TPL_HIGH_LEVEL_SPEC = path.join(TPL_DIR, 'high-level-spec.md');
const TPL_FEATURE_MAP = path.join(TPL_DIR, 'feature-map.md');

// Helper: fs.readFileSync wrapper that re-throws ENOENT with explicit RED context.
function readMust(p) {
  try {
    return fs.readFileSync(p, 'utf-8');
  } catch (err) {
    // Wave 0 RED: re-throw so node:test reports a failed test (file missing).
    throw err;
  }
}

// ─── Test 1 — product-brief.md exists ──────────────────────────────────────
test('Test 1 — brief/templates/deliver/type-a/product-brief.md exists', () => {
  assert.ok(fs.existsSync(TPL_PRODUCT_BRIEF), `RED: ${TPL_PRODUCT_BRIEF} not found`);
});

// ─── Test 2 — product-brief.md has all 4 INSERT placeholders ──────────────
test('Test 2 — product-brief.md contains the 4 SYNTHESIS_MAP INSERT placeholders', () => {
  const body = readMust(TPL_PRODUCT_BRIEF);
  assert.ok(body.includes('<!-- INSERT: ## Customer Segments -->'),
    'product-brief.md missing <!-- INSERT: ## Customer Segments -->');
  assert.ok(body.includes('<!-- INSERT: ## Value Proposition -->'),
    'product-brief.md missing <!-- INSERT: ## Value Proposition -->');
  assert.ok(body.includes('<!-- INSERT: ## Personas -->'),
    'product-brief.md missing <!-- INSERT: ## Personas -->');
  assert.ok(body.includes('<!-- INSERT: ## Immutable Intent -->'),
    'product-brief.md missing <!-- INSERT: ## Immutable Intent -->');
});

// ─── Test 3 — product-brief.md mandatory frontmatter ──────────────────────
test('Test 3 — product-brief.md frontmatter has 5 mandatory + voice.languages + deliverable + generated_by + generated_at', () => {
  const body = readMust(TPL_PRODUCT_BRIEF);
  // Frontmatter block bounded by --- lines.
  const fmMatch = body.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(fmMatch, 'product-brief.md missing YAML frontmatter block bounded by `---`');
  const fm = fmMatch[1];
  // 5 mandatory fields (Phase 5 D-10 schema):
  assert.ok(fm.includes('audience.type'), 'product-brief.md frontmatter missing audience.type');
  assert.ok(fm.includes('audience.confidentiality'), 'product-brief.md frontmatter missing audience.confidentiality');
  assert.ok(fm.includes('voice.tone'), 'product-brief.md frontmatter missing voice.tone');
  assert.ok(fm.includes('voice.perspective'), 'product-brief.md frontmatter missing voice.perspective');
  assert.ok(fm.includes('business_context.model'), 'product-brief.md frontmatter missing business_context.model');
  // Phase 8 D-D03 + D-21 additions:
  assert.ok(fm.includes('voice.languages'), 'product-brief.md frontmatter missing voice.languages placeholder');
  assert.ok(fm.includes('deliverable:'), 'product-brief.md frontmatter missing deliverable:');
  assert.ok(/generated_by:\s*brief-deliver-type-a/.test(fm),
    'product-brief.md frontmatter missing generated_by: brief-deliver-type-a');
  assert.ok(fm.includes('generated_at:'), 'product-brief.md frontmatter missing generated_at:');
});

// ─── Test 4 — service-policy.md INSERT placeholders ────────────────────────
test('Test 4 — service-policy.md contains the 3 SYNTHESIS_MAP INSERT placeholders', () => {
  const body = readMust(TPL_SERVICE_POLICY);
  assert.ok(body.includes('<!-- INSERT: ## Process -->'),
    'service-policy.md missing <!-- INSERT: ## Process -->');
  assert.ok(body.includes('<!-- INSERT: ## Tools -->'),
    'service-policy.md missing <!-- INSERT: ## Tools -->');
  assert.ok(body.includes('<!-- INSERT: ## Documented obligations addressed: -->'),
    'service-policy.md missing <!-- INSERT: ## Documented obligations addressed: --> (NOTE: trailing colon is byte-identical to deliver.cjs SYNTHESIS_MAP)');
});

// ─── Test 5 — service-policy.md B2B/B2C conditional prose markers ──────────
test('Test 5 — service-policy.md has BOTH B2B and B2C conditional prose blocks (Phase 7 D-14 byte-identity)', () => {
  const body = readMust(TPL_SERVICE_POLICY);
  assert.ok(body.includes('<!--BEGIN business_model: b2b-->'),
    'service-policy.md missing <!--BEGIN business_model: b2b--> open marker');
  assert.ok(body.includes('<!--END business_model: b2b-->'),
    'service-policy.md missing <!--END business_model: b2b--> close marker');
  assert.ok(body.includes('<!--BEGIN business_model: b2c-->'),
    'service-policy.md missing <!--BEGIN business_model: b2c--> open marker');
  assert.ok(body.includes('<!--END business_model: b2c-->'),
    'service-policy.md missing <!--END business_model: b2c--> close marker');
});

// ─── Test 6 — service-policy.md B2B/B2C content keywords ───────────────────
test('Test 6 — service-policy.md B2B block has 4 keywords; B2C block has 4 keywords (case-insensitive)', () => {
  const body = readMust(TPL_SERVICE_POLICY);

  // B2B keywords (case-insensitive — template uses natural capitalization).
  const b2bKeywords = ['SLA tiers', 'enterprise support', 'data processing', 'contract terms'];
  for (const kw of b2bKeywords) {
    const re = new RegExp(kw.replace(/ /g, '\\s+'), 'i');
    assert.ok(re.test(body),
      `service-policy.md B2B block missing keyword '${kw}' (case-insensitive)`);
  }

  // B2C keywords (case-insensitive).
  const b2cKeywords = ['refund policy', 'customer support hours', 'channel coverage', 'community guidelines'];
  for (const kw of b2cKeywords) {
    const re = new RegExp(kw.replace(/ /g, '\\s+'), 'i');
    assert.ok(re.test(body),
      `service-policy.md B2C block missing keyword '${kw}' (case-insensitive)`);
  }
});

// ─── Test 7 — high-level-spec.md INSERT placeholders ───────────────────────
test('Test 7 — high-level-spec.md contains the 4 SYNTHESIS_MAP INSERT placeholders', () => {
  const body = readMust(TPL_HIGH_LEVEL_SPEC);
  assert.ok(body.includes('<!-- INSERT: ## Component Map -->'),
    'high-level-spec.md missing <!-- INSERT: ## Component Map -->');
  assert.ok(body.includes('<!-- INSERT: ## Phased Roadmap -->'),
    'high-level-spec.md missing <!-- INSERT: ## Phased Roadmap -->');
  assert.ok(body.includes('<!-- INSERT: ## Critical Risks -->'),
    'high-level-spec.md missing <!-- INSERT: ## Critical Risks -->');
  assert.ok(body.includes('<!-- INSERT: ## Immutable Intent -->'),
    'high-level-spec.md missing <!-- INSERT: ## Immutable Intent -->');
});

// ─── Test 8 — feature-map.md Mermaid mindmap block + ASCII fallback ────────
test('Test 8 — feature-map.md has Mermaid mindmap block + ASCII tree fallback comment', () => {
  const body = readMust(TPL_FEATURE_MAP);
  // Mermaid mindmap block: ```mermaid\nmindmap (with optional whitespace).
  assert.ok(/```mermaid\s*\nmindmap/.test(body),
    'feature-map.md missing Mermaid mindmap fenced code block (` ```mermaid\\nmindmap `)');
  // ASCII tree alternative mentioned in template (comment / heading).
  assert.ok(/ASCII\s+tree/i.test(body),
    'feature-map.md missing ASCII tree fallback mention');
});

// ─── Test 9 — All 4 templates have YAML frontmatter + required keys ────────
test('Test 9 — All 4 Type A templates have frontmatter + deliverable + voice.languages + generated_by', () => {
  const templates = [TPL_PRODUCT_BRIEF, TPL_SERVICE_POLICY, TPL_HIGH_LEVEL_SPEC, TPL_FEATURE_MAP];
  for (const tpl of templates) {
    const body = readMust(tpl);
    const name = path.basename(tpl);
    const fmMatch = body.match(/^---\n([\s\S]*?)\n---/);
    assert.ok(fmMatch, `${name}: missing YAML frontmatter block bounded by ---`);
    const fm = fmMatch[1];
    assert.ok(fm.includes('deliverable:'), `${name}: frontmatter missing deliverable: field`);
    assert.ok(fm.includes('voice.languages'), `${name}: frontmatter missing voice.languages placeholder`);
    assert.ok(/generated_by:\s*brief-deliver-type-a/.test(fm),
      `${name}: frontmatter missing generated_by: brief-deliver-type-a`);
  }
});

// ─── Test 10 — agents/brief-deliver-type-a.md exists with frontmatter ──────
test('Test 10 — agents/brief-deliver-type-a.md exists with name + tools + color frontmatter', () => {
  assert.ok(fs.existsSync(AGENT), `RED: ${AGENT} not found`);
  const body = readMust(AGENT);
  const fmMatch = body.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(fmMatch, 'brief-deliver-type-a.md missing YAML frontmatter block');
  const fm = fmMatch[1];
  assert.ok(/name:\s*brief-deliver-type-a/.test(fm),
    'brief-deliver-type-a.md frontmatter missing name: brief-deliver-type-a');
  assert.ok(/tools:\s*Read,\s*Grep,\s*Glob,\s*Write/.test(fm),
    'brief-deliver-type-a.md frontmatter missing tools: Read, Grep, Glob, Write');
  assert.ok(/color:\s*green/.test(fm),
    'brief-deliver-type-a.md frontmatter missing color: green');
});

// ─── Test 11 — agent body has {{ARTIFACT}} placeholder ≥ 5 times ──────────
test('Test 11 — agent body contains {{ARTIFACT}} placeholder at least 5 times', () => {
  const body = readMust(AGENT);
  const matches = body.match(/\{\{ARTIFACT\}\}/g) || [];
  assert.ok(matches.length >= 5,
    `agent body has only ${matches.length} {{ARTIFACT}} occurrences; expected ≥ 5 (parameterized agent pattern)`);
});

// ─── Test 12 — agent has anti-pattern guards ──────────────────────────────
test('Test 12 — agent body contains 3 NEVER anti-patterns: hallucinate, pass/fail, auto-attached', () => {
  const body = readMust(AGENT);
  // NEVER hallucinate workstream content.
  assert.ok(/NEVER\s+hallucinate/i.test(body),
    'brief-deliver-type-a.md missing "NEVER hallucinate" anti-pattern');
  // NEVER use pass/fail vocabulary.
  assert.ok(/NEVER\s+use\s+pass\/fail/i.test(body),
    'brief-deliver-type-a.md missing "NEVER use pass/fail" anti-pattern');
  // NEVER auto-attached via PostToolUse / SubagentStop hooks.
  assert.ok(/NOT\s+auto-attached/i.test(body) || /NEVER\s+auto-attached/i.test(body),
    'brief-deliver-type-a.md missing "NOT/NEVER auto-attached" anti-pattern');
});
