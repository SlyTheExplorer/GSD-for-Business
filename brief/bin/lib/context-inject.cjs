/**
 * context-inject — cross-cutting primitive for B2B/B2C business-context injection.
 *
 * @stability: STABLE as of Phase 5. Additive-only changes. Phase 6/7/8 inherit.
 *
 * Decision references (05-CONTEXT.md):
 *   D-13: Orchestrator pre-injects <business_context> block into Task prompt.
 *   D-14: Reusable helper buildBusinessContext() — single source of truth for
 *         business-context semantics across Phase 5/6/7/8. Serves TWO consumers:
 *         (1) Task-spawn prompt injection, (2) AUDIENCE auto-populated frontmatter.
 *   A4:   Korea compliance reference library default — pipa-2026, isms-p, mydata-2026
 *         auto-attach via state.brief.compliance_packs match.
 *
 * Composition discipline (A1 zero-runtime-deps + Phase 2 D-18 ≤400 lines):
 *   - Imports ONLY node fs/path + internal core.cjs / objectives.cjs / define.cjs.
 *   - NO gray-matter, NO ajv, NO js-yaml, NO zod, NO @marp-team packages.
 *   - Co-serves TWO consumers — promptBlock (D-13) + audienceDefaults (D-10) —
 *     from one call so underlying business_model/region/language cannot drift
 *     between the spawn-time prompt block and the frontmatter seed.
 *
 * API contract (verbatim from 05-RESEARCH.md Pattern 3):
 *
 * /**
 *  * buildBusinessContext — cross-cutting primitive (D-14).
 *  * @stability: STABLE as of Phase 5. Additive-only changes. Phase 6/7/8 inherit.
 *  *
 *  * @param {Object} opts
 *  * @param {string} [opts.cwd]             default process.cwd()
 *  * @returns {{
 *  *   business_model: string|null,
 *  *   region: string|null,
 *  *   audience_policy: {default,permitted}|null,
 *  *   compliance_packs: string[],
 *  *   korea_signal: boolean,
 *  *   language: 'ko'|'en',
 *  *   promptBlock: string,          // XML block for Task-spawn injection
 *  *   audienceDefaults: {           // AUDIENCE D-10 3 auto-populated fields
 *  *     'audience.role': string,
 *  *     'voice.tone': string,
 *  *     'voice.perspective': string
 *  *   },
 *  *   requiredReading: string[]     // compliance-pack primer file paths
 *  * }}
 *  *\/
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { planningDir } = require('./core.cjs');
const objectives = require('./objectives.cjs');
const { detectKoreaSignals } = require('./define.cjs');

// ─── Compliance pack → primer reference map (D-14 + A4 default) ────────────
// Frozen map (T-5-01-01 mitigation): prevents runtime mutation of primer paths.
// Paths reference Korea compliance primer files that Plan 06 ships under
// brief/references/compliance/korea/. Non-Korean packs will be added as the
// compliance library grows (Phase 7 / v2).
const COMPLIANCE_PACK_TO_REFERENCE = Object.freeze({
  'PIPA': 'brief/references/compliance/korea/pipa-2026.md',
  'ISMS-P': 'brief/references/compliance/korea/isms-p.md',
  'MyData': 'brief/references/compliance/korea/mydata-2026.md',
});

// ─── Prompt block XML template (D-13 inline XML choice) ────────────────────
// Rationale: matches Phase 4 `<candidate>` / `<baseline>` delimiter style, so
// cross-runtime agent prompts parse consistently (Claude/Codex/Gemini/OpenCode).
// Self-closing commentless `<!-- none -->` children when arrays are empty so
// downstream agents see the tag presence but no content.
const PROMPT_BLOCK_TEMPLATE = (ctx) => {
  const packsInner = (ctx.compliance_packs || []).length > 0
    ? (ctx.compliance_packs || []).map((p) => `    <pack>${p}</pack>`).join('\n')
    : '    <!-- none -->';
  const readingInner = (ctx.requiredReading || []).length > 0
    ? (ctx.requiredReading || []).map((f) => `    <file>${f}</file>`).join('\n')
    : '    <!-- none -->';
  const policyDefault = (ctx.audience_policy && ctx.audience_policy.default) || 'internal';
  const policyPermitted = Array.isArray(ctx.audience_policy && ctx.audience_policy.permitted)
    ? ctx.audience_policy.permitted.join(', ')
    : '';
  return `<business_context>
  <business_model>${ctx.business_model || ''}</business_model>
  <region>${ctx.region || ''}</region>
  <language>${ctx.language}</language>
  <audience_policy>
    <default>${policyDefault}</default>
    <permitted>${policyPermitted}</permitted>
  </audience_policy>
  <compliance_packs>
${packsInner}
  </compliance_packs>
  <required_reading>
${readingInner}
  </required_reading>
</business_context>`;
};

// ─── readConfigBrief — tolerant .planning/config.json brief-namespace reader ─
// T-5-01-02 mitigation: malformed JSON does NOT throw. Returns {} so callers
// always get a stable object shape. Mirrors align.cjs detectKoreaSignalFromConfig
// try/catch pattern to avoid coupling every consumer to fs error handling.
function readConfigBrief(cwd) {
  const configPath = path.join(planningDir(cwd), 'config.json');
  if (!fs.existsSync(configPath)) return {};
  try {
    const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (parsed && typeof parsed === 'object' && parsed.brief && typeof parsed.brief === 'object') {
      return parsed.brief;
    }
    return {};
  } catch {
    // Malformed config.json — safe fallback; never propagates a parse error.
    return {};
  }
}

// ─── deriveAudienceDefaults (D-10 auto-populated frontmatter fields) ───────
// Phase 5 Pattern 3 derivation table (verbatim). The 3 auto-populated fields
// are audience.role / voice.tone / voice.perspective. Planners can always
// override inline in the artifact; the defaults exist to prevent fatigue
// (Pitfall #9) on the 6-field AUDIENCE schema.
function deriveAudienceDefaults(business_model /* , region — reserved for future v1.x */) {
  const bm = (business_model || '').toLowerCase();
  if (bm === 'enterprise') {
    return {
      'audience.role': 'planner',
      'voice.tone': 'formal',
      'voice.perspective': 'third-person',
    };
  }
  if (bm === 'b2c') {
    return {
      'audience.role': 'planner',
      'voice.tone': 'direct',
      'voice.perspective': 'first-person-plural',
    };
  }
  // b2b, b2b2c, null, unknown — default bucket.
  return {
    'audience.role': 'planner',
    'voice.tone': 'formal',
    'voice.perspective': 'first-person-plural',
  };
}

// ─── buildBusinessContext (D-14) ───────────────────────────────────────────
// Single source of truth for business-context semantics across Phase 5/6/7/8.
// Returns a stable object shape — ADDITIVE-only changes allowed in future phases
// per @stability declaration.
function buildBusinessContext(opts = {}) {
  const cwd = (opts && opts.cwd) || process.cwd();

  const briefConfig = readConfigBrief(cwd);

  // OBJECTIVES.md body is read for Korea-signal fallback (Hangul scan when
  // region is absent). Missing file defaults to empty body; no throw.
  let objBody = '';
  try {
    const read = objectives.readObjectivesMd(cwd);
    if (read && typeof read.body === 'string') objBody = read.body;
  } catch {
    // Any unexpected read error — degrade gracefully to empty body.
    objBody = '';
  }

  const business_model = typeof briefConfig.business_model === 'string'
    ? briefConfig.business_model
    : null;
  const region = typeof briefConfig.region === 'string' ? briefConfig.region : null;

  // audience_policy passes through when well-formed; null otherwise so callers
  // know the user hasn't declared one yet (D-13 permits missing policy and
  // falls back to 'internal' inside the prompt template).
  let audience_policy = null;
  if (briefConfig.audience_policy && typeof briefConfig.audience_policy === 'object') {
    audience_policy = {
      default: typeof briefConfig.audience_policy.default === 'string'
        ? briefConfig.audience_policy.default
        : null,
      permitted: Array.isArray(briefConfig.audience_policy.permitted)
        ? briefConfig.audience_policy.permitted.slice()
        : [],
    };
  }

  const compliance_packs = Array.isArray(briefConfig.compliance_packs)
    ? briefConfig.compliance_packs.slice()
    : [];

  // Korea signal — region=='kr' OR Hangul detected in OBJECTIVES body.
  // Mirrors align.cjs detectKoreaSignalFromConfig but kept inline so Plan 06+
  // consumers do not transitively pull in align.cjs.
  const korea_signal = region === 'kr' || detectKoreaSignals(objBody || '');
  const language = korea_signal ? 'ko' : 'en';

  // Required reading derived from the FROZEN COMPLIANCE_PACK_TO_REFERENCE map.
  // T-5-01-04 mitigation: no user-supplied strings reach this path — only
  // the whitelisted pack names are honored.
  const requiredReading = compliance_packs
    .map((p) => COMPLIANCE_PACK_TO_REFERENCE[p])
    .filter(Boolean);

  const ctx = {
    business_model,
    region,
    audience_policy,
    compliance_packs,
    korea_signal,
    language,
    requiredReading,
  };

  ctx.promptBlock = PROMPT_BLOCK_TEMPLATE(ctx);
  ctx.audienceDefaults = deriveAudienceDefaults(business_model, region);

  return ctx;
}

module.exports = {
  buildBusinessContext,
  COMPLIANCE_PACK_TO_REFERENCE,
  // Exposed for test reuse (not part of the stable Phase 5/6/7/8 contract).
  _readConfigBrief: readConfigBrief,
  _deriveAudienceDefaults: deriveAudienceDefaults,
  _PROMPT_BLOCK_TEMPLATE: PROMPT_BLOCK_TEMPLATE,
};
