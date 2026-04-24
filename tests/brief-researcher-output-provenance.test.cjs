/**
 * brief-researcher-output-provenance.test.cjs — Phase 5 Plan 02 Task 4.
 *
 * Structural verification that the agent prompt at
 * agents/brief-domain-researcher.md contains the D-07 agent-output self-
 * check instructions. The runtime verification — does the agent actually
 * emit tagged output when invoked — is a Plan 08 canary E2E concern
 * requiring live LLM invocation and is tested there.
 *
 * Covers VALIDATION.md test-id 5-02-03 (DSC-04 agent-output self-check).
 *
 * Style reference: tests/brief-align-vocabulary-lock.test.cjs — "grep agent
 * prompt for required vocabulary" shape. This test applies the equivalent
 * discipline to the researcher prompt: assert the presence of every
 * instruction that agent behavior depends on.
 *
 * References:
 *   - 05-02-PLAN.md Task 4
 *   - 05-VALIDATION.md row 5-02-03
 *   - 05-CONTEXT.md D-07 (agent-output + pre-commit double-layer),
 *     D-08 (confidence-band), D-10 (AUDIENCE frontmatter), D-15 (B2B/B2C lens)
 *   - agents/brief-domain-researcher.md (the SUT)
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const agentPath = path.join(__dirname, '..', 'agents', 'brief-domain-researcher.md');

test('agent prompt exists', () => {
  assert.ok(fs.existsSync(agentPath), 'agents/brief-domain-researcher.md must exist');
});

// Read once; all structural assertions share this body.
const body = fs.readFileSync(agentPath, 'utf-8');

test('agent prompt instructs tagging every quantitative claim (D-07 agent-output layer)', () => {
  assert.match(body, /\[VERIFIED:/);
  assert.match(body, /\[ASSUMED:/);
  assert.match(body, /\[FOUNDER-INPUT\]/);
});

test('agent prompt includes self-check instruction (D-07 pre-write scan)', () => {
  assert.match(body, /SELF-CHECK|self-check/i);
});

test('agent prompt includes confidence-band discipline (D-08)', () => {
  // Must instruct ranges for market-size claims and show GOOD vs BAD examples.
  assert.match(body, /range|RANGE|범위/);
  assert.match(body, /GOOD/);
  assert.match(body, /BAD/);
});

test('agent prompt includes B2B/B2C conditional lens (D-15)', () => {
  assert.match(body, /b2b/i);
  assert.match(body, /b2c/i);
  assert.match(body, /enterprise/i);
  assert.match(body, /business_model/);
});

test('agent prompt enumerates the 9 default categories (DSC-01)', () => {
  const required = [
    /Market Sizing/,
    /Competitor Landscape/,
    /Customer Research/,
    /Regulation.*Compliance/,
    /Technology.*Feasibility/,
    /Distribution Channels/,
    /Pricing Benchmarks/,
    /Case Studies/,
    /Trends.*Forecasts/,
  ];
  for (const r of required) {
    assert.match(body, r, `agent prompt missing category: ${r}`);
  }
});

test('agent prompt includes Custom category (DSC-02) with {{TOPIC}} interpolation', () => {
  assert.match(body, /Custom/);
  assert.match(body, /\{\{TOPIC\}\}/);
});

test('agent prompt enforces vocabulary ban-list (consistency with ALIGN)', () => {
  // The prompt MUST tell the agent not to use pass/fail vocabulary.
  assert.match(body, /compliant|passed|violation|failed|준수|통과|위반|실패/);
  // AND must use "NOT" or "Do NOT" or "never" somewhere near the ban-list words.
  assert.match(body, /do not|Do NOT|never|NOT/i);
});

test('agent prompt sets MANDATORY audience frontmatter (D-10 3 hard-required fields)', () => {
  assert.match(body, /audience\.type/);
  assert.match(body, /audience\.confidentiality/);
  assert.match(body, /business_context\.model|business_context:[\s\S]*model:/);
});

test('agent prompt references {{OUT_PATH}} for write target', () => {
  assert.match(body, /\{\{OUT_PATH\}\}/);
});
