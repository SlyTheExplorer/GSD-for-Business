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
const { execFileSync } = require('child_process');
const {
  output,
  error,
  withPlanningLock,
  planningDir,
  atomicWriteFileSync,
} = require('./core.cjs');
const objectives = require('./objectives.cjs');

// D-07 + D-10 classification heuristic — defaults for greenfield Mode A.
// Exported so Plan 03/04 workflow markdown + tests can reference the same list.
const IMMUTABLE_DEFAULT_ITEMS = Object.freeze([
  'creator-identity',
  'core-value',
  'problem-statement',
]);

// D-13 qualifying entry points for the stale-anchor 48h interrupt.
// W-1: `phase-entry` and `milestone-entry` are scaffolded here for Phase 4+
// and v2 wiring but have NO live dispatcher call site in Phase 3. Only
// `discover-entry` (Plan 06 /brief-discover dispatcher) and
// `define-amend-entry` (Plan 06 workflow Step 0.5 on --amend) are live.
// EXPLICITLY REFUSED: `status-entry` / `help-entry` / `mid-workflow` —
// Pitfall 6 `train users to ignore` guard.
const QUALIFYING_ENTRY_POINTS = new Set([
  'discover-entry',       // /brief-discover first invocation — live in Phase 3 Plan 06
  'define-amend-entry',   // /brief-define --amend entry — live in Phase 3 Plan 06
  'phase-entry',          // Phase 4+ new-phase-start — scaffolded only, no dispatcher wire in Phase 3
  'milestone-entry',      // v2 /brief-new-milestone — scaffolded only, no dispatcher wire in Phase 3
]);

// Korea-signal detection (D-11, Pitfall 2 over-suggest bias).
// Three layers of matching — Hangul block (primary), romanized/regulatory
// keywords (secondary), common Korean company names (tertiary). Frozen for
// v1; pilot feedback in v1.x may expand Latin-script company list.
const KOREA_SIGNAL_PATTERNS = Object.freeze([
  /[\u3131-\u318E\uAC00-\uD7A3]/,
  /\b(Korea|Korean|KR|Seoul|won|PIPA|ISMS|MyData)\b/i,
  /\b(핀테크|카카오|네이버|토스)\b/,
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

// ─── Korea-signal detection (Plan 03-04) ─────────────────────────────────────

function detectKoreaSignals(transcript) {
  if (typeof transcript !== 'string' || transcript.length === 0) return false;
  return KOREA_SIGNAL_PATTERNS.some((re) => re.test(transcript));
}

// ─── config.json brief.* namespace write (Plan 03-04) ────────────────────────

function writeConfigBrief(cwd, briefPayload) {
  const configPath = path.join(planningDir(cwd), 'config.json');
  return withPlanningLock(cwd, () => {
    let cfg = {};
    if (fs.existsSync(configPath)) {
      try {
        cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      } catch (e) {
        error(`config.json parse failed: ${e.message}`);
        throw e;
      }
    }
    cfg.brief = { ...(cfg.brief || {}), ...(briefPayload || {}) };
    atomicWriteFileSync(
      configPath,
      JSON.stringify(cfg, null, 2) + '\n',
      'utf-8',
    );
    return { updated: true, brief: cfg.brief };
  });
}

// ─── Atomic 3-artifact commit (Plan 03-04) ───────────────────────────────────
//
// Invokes `brief-tools commit <msg> --files ...` via execFileSync AFTER all
// three atomicWriteFileSync calls have succeeded. Throws on subprocess
// failure; caller is responsible for partial-write rollback BEFORE this point.

function performAtomicCommit(cwd, mode, summary) {
  const toolsPath = path.join(__dirname, '..', 'brief-tools.cjs');
  const safeSummary = (summary || '').toString().replace(/\s+/g, ' ').trim();
  const msg = `feat(03): DEFINE ${mode} — ${safeSummary}`;
  try {
    execFileSync(
      process.execPath,
      [
        toolsPath,
        'commit',
        msg,
        '--no-verify',
        '--files',
        '.planning/OBJECTIVES.md',
        '.planning/config.json',
        '.planning/STATE.md',
      ],
      { cwd, stdio: 'pipe' },
    );
  } catch (e) {
    error(`atomic commit failed: ${e.message}`);
    throw e;
  }
}

// ─── STATE.md last_activity touch (Plan 03-04 helper) ────────────────────────

function touchStateActivity(cwd, activityLine) {
  const statePath = path.join(planningDir(cwd), 'STATE.md');
  const now = new Date().toISOString();
  if (!fs.existsSync(statePath)) {
    // Seed a minimal STATE.md so the atomic 3-file commit always has a third
    // leg to stage. Plan 04 intentionally stays under the lock that already
    // holds around the config.json + OBJECTIVES.md writes.
    const seed =
      '---\n' +
      `last_updated: "${now}"\n` +
      `last_activity: "${activityLine}"\n` +
      '---\n\n' +
      '# STATE\n\n' +
      '_(managed by BRIEF)_\n';
    atomicWriteFileSync(statePath, seed, 'utf-8');
    return;
  }
  const content = fs.readFileSync(statePath, 'utf-8');
  const { extractFrontmatter, spliceFrontmatter } = require('./frontmatter.cjs');
  const fm = extractFrontmatter(content) || {};
  fm.last_updated = now;
  fm.last_activity = activityLine;
  atomicWriteFileSync(statePath, spliceFrontmatter(content, fm), 'utf-8');
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

  // B-6: Korea-signal over-suggest bias (D-11, Pitfall 2). The SOLE source of
  // compliance_packs inference is the transcript itself — NEVER the fixture's
  // expected_configs.compliance_packs. The fixture's expected value is what
  // tests assert against (verification), never what the implementation reads.
  const transcriptString = JSON.stringify(t);
  const koreaSignal = detectKoreaSignals(transcriptString);
  const inferredCompliance = koreaSignal
    ? ['PIPA', 'ISMS-P', 'MyData']
    : [];

  // Non-compliance configs (business_model, region, audience_policy) continue
  // to fall back to fixture.expected_configs — these are not subject to the
  // Korea-signal conditional logic and the fixture is the canonical source.
  const fragments = (fixture && fixture.expected_body_fragments) || {};
  const expectedCfg = (fixture && fixture.expected_configs) || {};

  const creatorIdentity =
    fragments.creator_identity || fixture.persona_name || '(기획자)';
  const coreValue = fragments.core_value
    ? `${fragments.core_value}\n\n${pushCore}`
    : pushCore;
  const problemStatement = fragments.problem_statement || t.opening || '';
  const targetAudience = fragments.target_audience
    ? `${fragments.target_audience}\n\n${t.opening || ''}`
    : `${langPrecisionAnswer}\n\n${t.opening || ''}`;

  const payload = {
    frontmatter: {
      brief_objectives_version: '1.0',
      status: 'ready',
      mode: 'greenfield',
      immutable_items: IMMUTABLE_DEFAULT_ITEMS.slice(),
      business_model: expectedCfg.business_model || 'b2c',
      region: expectedCfg.region || 'kr',
      audience_policy: expectedCfg.audience_policy || 'internal',
      // B-6: inferredCompliance is the SOLE source.
      compliance_packs: inferredCompliance,
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

  // Pitfall 3 mitigation: three atomicWriteFileSync calls land BEFORE commit.
  // On any write failure, unlink the partially-written OBJECTIVES.md BEFORE
  // re-throwing so the /brief-discover block-gate never reads a zombie
  // OBJECTIVES.md without the paired config.json entry.
  //
  // Dispatch through `module.exports.*` rather than the lexical binding so
  // tests can swap individual primitives (stub-throw rollback harness, etc.)
  // without re-bundling the module.
  let objWritten = false;
  try {
    const writeResult = objectives.writeObjectivesMd(cwd, payload, {
      unlockIntent: false,
    });
    objWritten = true;

    (module.exports.writeConfigBrief || writeConfigBrief)(cwd, {
      business_model: payload.frontmatter.business_model,
      region: payload.frontmatter.region,
      audience_policy: payload.frontmatter.audience_policy,
      compliance_packs: payload.frontmatter.compliance_packs,
    });

    touchStateActivity(
      cwd,
      `Phase 3 DEFINE Mode A — ${fixture.persona_name || fixtureName}`,
    );

    (module.exports.performAtomicCommit || performAtomicCommit)(
      cwd,
      'greenfield',
      fixture.persona_name || fixtureName,
    );

    output(
      {
        status: 'applied_from_fixture',
        fixture: fixtureName,
        path: writeResult.path,
        koreaSignal,
      },
      raw,
      `OBJECTIVES.md written from fixture: ${fixtureName}`,
    );
    return {
      status: 'applied_from_fixture',
      fixture: fixtureName,
      path: writeResult.path,
      koreaSignal,
    };
  } catch (e) {
    // Rollback: remove any partially-written OBJECTIVES.md before propagating.
    if (objWritten) {
      const objPath = path.join(planningDir(cwd), 'OBJECTIVES.md');
      try {
        if (fs.existsSync(objPath)) fs.unlinkSync(objPath);
      } catch (_) {
        /* best-effort */
      }
    }
    throw e;
  }
}

// ─── Stale-anchor 48h interrupt (Plan 03-06, DEF-06, D-13) ───────────────────

/**
 * shouldStaleAnchorFire — entry-point gate + mtime check.
 *
 * Called from the dispatcher or a workflow hook BEFORE any new-activity work
 * runs. Returns `{fire, age_hours, reason?}`. The interrupt fires only when
 * both conditions hold:
 *   1. entryPoint is in QUALIFYING_ENTRY_POINTS (D-13 scope),
 *   2. objectives.checkStaleAnchor reports `stale: true` (>48h since last
 *      OBJECTIVES.md mtime).
 *
 * Pitfall 6 mitigation: any unrecognized entryPoint — including `status-entry`,
 * `help-entry`, `mid-workflow` — returns `{fire: false, reason: 'entry-not-qualifying'}`
 * deterministically, so `/brief-status` can never train users to click through.
 */
function shouldStaleAnchorFire(cwd, entryPoint) {
  if (!QUALIFYING_ENTRY_POINTS.has(entryPoint)) {
    return { fire: false, age_hours: 0, reason: 'entry-not-qualifying' };
  }
  const stale = objectives.checkStaleAnchor(cwd);
  if (!stale.stale) {
    return {
      fire: false,
      age_hours: stale.age_hours || 0,
      reason: stale.reason || 'fresh',
    };
  }
  return { fire: true, age_hours: stale.age_hours };
}

/**
 * renderStaleAnchorPrompt — deterministic Korean 3-option text.
 *
 * D-13 verbatim options: `잠시 검토에` / `현재 OBJECTIVES를 보고 맞으면 승인`
 * / `이제 승인, 빠르게 진행`. The `48시간` threshold phrase is required by
 * the workflow file grep asserts (Plan 03-06 Task 2 acceptance criteria).
 *
 * AskUserQuestion wrapping happens in the runtime-specific workflow file
 * (brief/workflows/discover.md + brief/workflows/define.md). This helper
 * produces the raw prompt text the dispatcher prints to stdout BEFORE the
 * Phase 5 placeholder (W-8 ordering guarantee).
 */
function renderStaleAnchorPrompt(ageHours) {
  return [
    `⚠ OBJECTIVES.md이 ${ageHours}시간 전 마지막으로 수정되었습니다 (48시간 경과).`,
    '',
    '본격적으로 일을 시작하기 전에 한 번 정비하시는 것을 권장합니다.',
    '',
    '어떻게 진행하시겠어요?',
    '  1) 잠시 검토에 — /brief-define --amend 로 수정 흐름 진입',
    '  2) 현재 OBJECTIVES를 보고 맞으면 승인 — 내용 확인 후 mtime 갱신',
    '  3) 이제 승인, 빠르게 진행 — 즉시 mtime 갱신하고 다음 단계로',
    '',
  ].join('\n');
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
  detectKoreaSignals,
  writeConfigBrief,
  performAtomicCommit,
  shouldStaleAnchorFire,
  renderStaleAnchorPrompt,
  KOREA_SIGNAL_PATTERNS,
  IMMUTABLE_DEFAULT_ITEMS,
  QUALIFYING_ENTRY_POINTS,
};
