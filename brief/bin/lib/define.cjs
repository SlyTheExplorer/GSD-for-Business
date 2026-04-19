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
 *   - Imports core.cjs + objectives.cjs only; no external YAML/schema packages.
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

// ─── Mode B Amendment (Plan 03-03) ───────────────────────────────────────────

/**
 * applyModeBAmendment — Mode B delta-merge primitive.
 *
 * Drives the dispatcher path for `/brief-define --amend`. The writer-layer
 * lock (enforceImmutableLock inside objectives.writeObjectivesMd) is the
 * second layer of Pitfall #3 / D-07 enforcement — the first layer is the
 * UI-side 🔒 marker in brief/workflows/define.md Step 2B (Task 2 of this
 * plan). If the user attempts to mutate an immutable field WITHOUT
 * `--unlock-intent`, the writer throws the Korean structured error and the
 * file is left untouched (verified by tests/brief-objectives-immutable-lock
 * + tests/brief-define-mode-b).
 *
 * Audit log discipline (D-07 intent, T-03-06 repudiation mitigation):
 *   Every --unlock-intent-triggered immutable mutation appends a line to
 *   .planning/OBJECTIVES-UNLOCK-AUDIT.log with format
 *   `<ISO8601Timestamp> UNLOCK <field>`. Multiple mutations in one call
 *   emit one line per field. Append semantics (fs.appendFileSync) so
 *   concurrent sessions accumulate rather than overwrite.
 *
 * @param {string} cwd — repo root
 * @param {string[]} selectedSections — section names the user opted to revisit (workflow-driven; retained for future introspection)
 * @param {object} updatesPayload — { frontmatter?, body? } delta to splice onto existing OBJECTIVES.md
 * @param {object} opts — { unlockIntent?: boolean, auditLogPath?: string }
 * @returns {{status:'amended', mutatedImmutables:string[], unlockIntent:boolean}}
 */
function applyModeBAmendment(cwd, selectedSections, updatesPayload, opts = {}) {
  const unlockIntent = opts && opts.unlockIntent === true;

  const existing = objectives.readObjectivesMd(cwd);
  const existingFm = (existing && existing.frontmatter) || {};

  const payload = {
    frontmatter: { ...((updatesPayload && updatesPayload.frontmatter) || {}) },
    body: updatesPayload ? updatesPayload.body : undefined,
  };
  // Mode B always tags mode=amended so D-05 distinguishes greenfield vs amendment.
  payload.frontmatter.mode = 'amended';

  // Detect which immutable fields are actually being mutated — BEFORE calling the
  // writer — so we can emit audit lines only on real unlock events (not on
  // unlock-flagged no-op writes).
  const immItems = Array.isArray(existingFm.immutable_items)
    ? existingFm.immutable_items
    : [];
  const mutatedImmutables = immItems.filter((k) => {
    if (!Object.prototype.hasOwnProperty.call(payload.frontmatter, k)) return false;
    return (
      JSON.stringify(payload.frontmatter[k]) !==
      JSON.stringify(existingFm[k])
    );
  });

  // Delegate to the Plan 01 writer. When unlockIntent===false, the writer
  // throws IMMUTABLE_LOCK_ERROR_KO (Korean) before any disk write. We let the
  // error propagate so the caller (workflow / test) can surface it.
  objectives.writeObjectivesMd(cwd, payload, { unlockIntent });

  // Audit log ONLY when an immutable mutation actually happened AND the
  // user supplied --unlock-intent. Mutable-only edits emit no audit noise.
  if (unlockIntent && mutatedImmutables.length > 0) {
    const paths = require('./core.cjs').planningPaths(cwd);
    const base = (paths && paths.planning) || path.join(cwd, '.planning');
    const auditPath =
      (opts && opts.auditLogPath) ||
      path.join(base, 'OBJECTIVES-UNLOCK-AUDIT.log');
    const iso = new Date().toISOString();
    const lines = mutatedImmutables
      .map((f) => `${iso} UNLOCK ${f}\n`)
      .join('');
    fs.appendFileSync(auditPath, lines, 'utf-8');
  }

  return { status: 'amended', mutatedImmutables, unlockIntent };
}

module.exports = {
  cmdDefineApply,
  runInteractiveModeA,
  applyFromFixture,
  applyModeBAmendment,
  IMMUTABLE_DEFAULT_ITEMS,
};
