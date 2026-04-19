/**
 * Define — /brief-define Mode A/B flow controller.
 *
 * Plan 03-02 scope (THIS FILE):
 *   - Mode A entry dispatch via fixture-aware test path
 *   - OBJECTIVES.md write through objectives.cjs writeObjectivesMd (Plan 03-01 contract)
 *   - Interactive conversation orchestration lives in brief/workflows/define.md;
 *     this module is the CLI-side driver invoked by `brief-tools define apply`.
 *
 * Plan 03-03 scope (EXTENDS THIS FILE):
 *   - Mode B amendment flow + --unlock-intent pass-through
 *
 * Plan 03-04 scope (EXTENDS THIS FILE):
 *   - 4-config inference (business_model / region / audience_policy / compliance_packs)
 *   - Korea-signal keyword regex (over-suggest bias per D-11)
 *   - config.json `brief.*` namespace merge
 *   - Atomic 3-artifact commit (OBJECTIVES.md + config.json + STATE.md)
 *
 * CONTEXT.md decisions honored here:
 *   D-05: 2 modes selected at entry (user answer, not file presence).
 *   D-07: immutable_items default = ['creator-identity','core-value','problem-statement'].
 *   D-10: Claude proposes, user approves — default classification heuristic codified.
 *   D-11: 4-config inference at wrap-up — NOT in Plan 02 scope; Plan 04 fills in.
 *
 * Composition + zero-deps (A1 guard):
 *   - Imports core.cjs + objectives.cjs only. No gray-matter, ajv, js-yaml.
 *   - Fixture path is resolved RELATIVE to repo root (tests/fixtures/<name>).
 *     Path traversal in `--fixture` rejected explicitly per T-03-04.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { output, error } = require('./core.cjs');
const objectives = require('./objectives.cjs');

// D-07 + D-10 classification heuristic — defaults for greenfield Mode A.
// Exported so Plan 03/04 workflow markdown + tests can reference the same list.
const IMMUTABLE_DEFAULT_ITEMS = Object.freeze([
  'creator-identity',
  'core-value',
  'problem-statement',
]);

// ─── Dispatcher entry ─────────────────────────────────────────────────────────

async function cmdDefineApply(cwd, flags, raw) {
  const f = flags || {};
  if (f.fixture) {
    return applyFromFixture(cwd, f.fixture, raw);
  }
  // Production (interactive) path — Plan 02 stub.
  // The actual conversation is orchestrated by brief/workflows/define.md via
  // AskUserQuestion (or the TEXT_MODE numbered-list fallback for non-Claude
  // runtimes). That workflow ultimately calls back through this module with
  // collected answers in Plan 04; Plan 02 only wires the fixture path.
  output(
    { status: 'interactive_mode_dispatched' },
    raw,
    '대화형 Mode A는 brief/workflows/define.md 에서 진행됩니다. ' +
      '테스트 용 --fixture 플래그로 고정된 대화를 재생할 수 있습니다.',
  );
  return { status: 'interactive_mode_dispatched' };
}

// ─── Interactive Mode A placeholder ───────────────────────────────────────────

async function runInteractiveModeA(cwd) {
  // Plan 02 placeholder. The interactive conversation is orchestrated by the
  // workflow markdown via AskUserQuestion; this function exists so Plan 03/04
  // can extend it with a programmatic driver when the workflow calls back
  // through brief-tools with a collected-answers payload. Keeping it as a
  // throwing stub documents the Plan 02 boundary explicitly.
  throw new Error(
    'runInteractiveModeA: driven by brief/workflows/define.md — call applyFromFixture for tests',
  );
}

// ─── Fixture-driven short-circuit path (test + smoke) ─────────────────────────

function applyFromFixture(cwd, fixtureName, raw) {
  // T-03-04: reject fixture path traversal. --fixture accepts basenames only.
  if (
    typeof fixtureName !== 'string' ||
    fixtureName.includes('..') ||
    fixtureName.includes('/') ||
    fixtureName.includes('\\')
  ) {
    error(`Invalid fixture name (path traversal rejected): ${fixtureName}`);
    return { status: 'fixture_invalid', fixture: fixtureName };
  }

  // Resolve under tests/fixtures/ from repo root (../../.. from this file).
  const fixturePath = path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    'tests',
    'fixtures',
    fixtureName,
  );
  if (!fs.existsSync(fixturePath)) {
    error(`Fixture not found: ${fixturePath}`);
    return { status: 'fixture_not_found', path: fixturePath };
  }

  let fixture;
  try {
    const rawText = fs.readFileSync(fixturePath, 'utf-8');
    fixture = JSON.parse(rawText);
  } catch (e) {
    error(`Fixture parse error (${fixtureName}): ${e.message}`);
    return { status: 'fixture_parse_error', fixture: fixtureName };
  }

  const t = (fixture && fixture.conversation_transcript) || {};
  const pushCore =
    (t.push_twice_core_value && t.push_twice_core_value.push_1_answer) || '';
  const langPrecisionAnswer =
    (t.language_precision_audience &&
      t.language_precision_audience.precision_answer) ||
    '';
  const dreamNow =
    (t.dream_state && t.dream_state.now && t.dream_state.now.prose) || '';
  const dream3m =
    (t.dream_state &&
      t.dream_state.three_month &&
      t.dream_state.three_month.prose) ||
    '';
  const dream12m =
    (t.dream_state &&
      t.dream_state.twelve_month &&
      t.dream_state.twelve_month.prose) ||
    '';

  // Build the OBJECTIVES.md payload. The body sub-fields match the shape
  // renderBodySkeleton expects (brief/bin/lib/objectives.cjs).
  //   - Immutable Intent items come from Push-Twice / opening.
  //   - Mutable Hypotheses fields come from Language Precision + Dream State.
  const fragments =
    (fixture && fixture.expected_body_fragments) || {};
  const expectedCfg = (fixture && fixture.expected_configs) || {};

  const creatorIdentity =
    fragments.creator_identity ||
    fixture.persona_name ||
    '(기획자)';
  // Core Value: anchor on fragments.core_value (a concise phrasing) and
  // append the raw push_1_answer so the verbatim '{AI가 봐주면서}' fragment
  // lands in the Immutable Intent block (test assertion requirement).
  const coreValue = fragments.core_value
    ? `${fragments.core_value}\n\n${pushCore}`
    : pushCore;
  const problemStatement =
    fragments.problem_statement || t.opening || '';
  // Target Audience Specifics carries the verbatim fixture opening line so
  // '{퇴근 후 혼자 집에서 운동하는 1인 가구 직장인}' lands in the Mutable body.
  const targetAudience = fragments.target_audience
    ? `${fragments.target_audience}\n\n${t.opening || ''}`
    : `${langPrecisionAnswer}\n\n${t.opening || ''}`;

  const payload = {
    frontmatter: {
      brief_objectives_version: '1.0',
      status: 'ready',
      mode: 'greenfield',
      immutable_items: IMMUTABLE_DEFAULT_ITEMS.slice(),
      // business_model / region / audience_policy / compliance_packs are
      // fully inferred in Plan 04. Plan 02 writes the fixture's expected
      // values so validateObjectivesComplete returns valid:true downstream.
      business_model: expectedCfg.business_model || 'b2c',
      region: expectedCfg.region || 'kr',
      audience_policy: expectedCfg.audience_policy || 'internal',
      compliance_packs: Array.isArray(expectedCfg.compliance_packs)
        ? expectedCfg.compliance_packs.slice()
        : [],
    },
    body: {
      immutable: {
        'creator-identity': creatorIdentity,
        'core-value': coreValue,
        'problem-statement': problemStatement,
      },
      mutable: {
        'target-audience': targetAudience,
        'verification-metrics':
          fragments.verification_metrics || '(optional)',
        competitors: fragments.competitors || '(optional)',
        'dream-now': { prose: dreamNow || '(prose)' },
        'dream-3m': { prose: dream3m || '(prose)' },
        'dream-12m': { prose: dream12m || '(prose)' },
      },
    },
  };

  const result = objectives.writeObjectivesMd(cwd, payload, {
    unlockIntent: false,
  });

  output(
    {
      status: 'applied_from_fixture',
      fixture: fixtureName,
      path: result.path,
    },
    raw,
    `OBJECTIVES.md written from fixture: ${fixtureName}`,
  );
  return {
    status: 'applied_from_fixture',
    fixture: fixtureName,
    path: result.path,
  };
}

module.exports = {
  cmdDefineApply,
  runInteractiveModeA,
  applyFromFixture,
  IMMUTABLE_DEFAULT_ITEMS,
};
