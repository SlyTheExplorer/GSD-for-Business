/**
 * deliver — Type A auto-synthesis library (Phase 8 Plan 08-01).
 *
 * @stability: STABLE as of Phase 8. Additive-only changes. Plan 04/05 consume.
 *
 * Composes 4 PRD-input markdown artifacts (PRODUCT-BRIEF / SERVICE-POLICY /
 * HIGH-LEVEL-SPEC / FEATURE-MAP) deterministically from workstream artifacts
 * + OBJECTIVES.md sections. The lib itself does NO LLM calls — it reads
 * workstream artifacts, extracts named markdown sections, fills templates with
 * section content, and writes atomically. Plan 05 layers the parameterized
 * agents/brief-deliver-type-a.md over this for narrative LLM polish.
 *
 * Decision references (08-CONTEXT.md):
 *   A-D03: SERVICE-POLICY uses B2B/B2C conditional prose blocks via Phase 7
 *          D-14 byte-identity pattern (`<!--BEGIN business_model: X-->...
 *          <!--END business_model: X-->`).
 *   D-21:  Frontmatter schema extension — voice.languages = ['ko'] | ['en'] |
 *          ['ko', 'en'] (array). frontmatter.cjs already serializes arrays.
 *   D-D03: Korean (region: kr) defaults to voice.languages: ['ko']; --en option
 *          flips to ['en'] (English-only) or ['ko', 'en'] (bilingual).
 *
 * Composition discipline (A1 zero-runtime-deps + Phase 2 D-18 ≤400 lines):
 *   - Imports ONLY node fs/path + internal core.cjs / frontmatter.cjs /
 *     context-inject.cjs.
 *   - NO gray-matter, NO ajv, NO js-yaml, NO @marp-team packages.
 *   - Atomic writes via core.cjs atomicWriteFileSync (Phase 1 D-09 primitive).
 *
 * Trust boundaries (08-01-PLAN.md threat_model):
 *   T-08-01-01: Source artifact paths are constants in SYNTHESIS_MAP — no
 *               user-supplied path interpolation possible.
 *   T-08-01-02: applyConditionalProse regex uses backreference `\1` to enforce
 *               well-formed open/close markers; mismatched markers cause no
 *               match (block left intact, safe failure mode).
 *
 * References:
 *   - .planning/phases/08-deliver-type-a-type-b-audience-enforcement-marp/08-RESEARCH.md
 *     Code Example 1 (lines 1156-1297) — synthesizeTypeA contract verbatim.
 *   - .planning/phases/08-deliver-type-a-type-b-audience-enforcement-marp/08-PATTERNS.md
 *     §brief/bin/lib/deliver.cjs (lib structure analog: audience.cjs).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { atomicWriteFileSync, planningPaths } = require('./core.cjs');
const {
  extractFrontmatter,
  reconstructFrontmatter,
  stripFrontmatter,
} = require('./frontmatter.cjs');
const { buildBusinessContext } = require('./context-inject.cjs');

// ─── Type A artifact registry ───────────────────────────────────────────────
// Frozen list of the 4 PRD-input artifact keys. Used by /brief-deliver --type-a
// dispatcher (Plan 04) and brief-tools.cjs deliver subcommand (Plan 04).
const TYPE_A_ARTIFACTS = ['product-brief', 'service-policy', 'high-level-spec', 'feature-map'];
Object.freeze(TYPE_A_ARTIFACTS);

// ─── SYNTHESIS_MAP (RESEARCH.md Pattern 3 mapping table — verbatim) ────────
// Per artifact key:
//   sources: workstream artifacts (relative to .planning/) + named ## sections
//            to extract from each.
//   objectivesSections: ## headings to extract from OBJECTIVES.md.
//   template: template path (relative to cwd) — Plan 05 ships full templates;
//             Plan 08-01 tests stub them with `<!-- INSERT: ## Section -->`
//             placeholders matching the SYNTHESIS_MAP shape.
//   conditionalProse: when true, post-fill body runs through applyConditionalProse
//                     (B2B/B2C variant via Phase 7 D-14). Only service-policy
//                     uses this per A-D03.
const SYNTHESIS_MAP = Object.freeze({
  'product-brief': {
    sources: [
      {
        artifact: 'workstreams/business-model-canvas/canvas.md',
        sections: ['## Customer Segments', '## Value Proposition'],
      },
      {
        artifact: 'workstreams/go-to-market/go-to-market.md',
        sections: ['## Personas'],
      },
    ],
    objectivesSections: ['## Immutable Intent'],
    template: 'brief/templates/deliver/type-a/product-brief.md',
    conditionalProse: false,
  },
  'service-policy': {
    sources: [
      {
        artifact: 'workstreams/operations/operations.md',
        sections: ['## Process', '## Tools'],
      },
      {
        artifact: 'workstreams/compliance/compliance.md',
        sections: ['## Documented obligations addressed:'],
      },
    ],
    objectivesSections: [], // SERVICE-POLICY drives off business_model alone
    template: 'brief/templates/deliver/type-a/service-policy.md',
    conditionalProse: true, // B2B/B2C variant via Phase 7 D-14 pattern
  },
  'high-level-spec': {
    sources: [
      {
        artifact: 'workstreams/tech-arch/tech-arch.md',
        sections: ['## Component Map'],
      },
      {
        artifact: 'workstreams/roadmap/roadmap.md',
        sections: ['## Phased Roadmap'],
      },
      {
        artifact: 'workstreams/risk/risk.md',
        sections: ['## Critical Risks'],
      },
    ],
    objectivesSections: ['## Immutable Intent'],
    template: 'brief/templates/deliver/type-a/high-level-spec.md',
    conditionalProse: false,
  },
  'feature-map': {
    sources: [
      {
        artifact: 'workstreams/tech-arch/tech-arch.md',
        sections: ['## Component Map'],
      },
      {
        artifact: 'workstreams/business-model-canvas/canvas.md',
        sections: ['## Value Proposition'],
      },
    ],
    objectivesSections: [],
    template: 'brief/templates/deliver/type-a/feature-map.md',
    conditionalProse: false,
  },
});

// ─── checkDependencies ──────────────────────────────────────────────────────
// Returns { complete: boolean, missing: string[] } where `missing` enumerates
// the relative paths (under .planning/) of source artifacts the synth cannot
// find. Missing sources do NOT throw — synthesizeTypeA degrades gracefully by
// inlining a placeholder block + emitting a stderr warning (Pitfall #2 graceful
// degradation, T-08-01-01 boundary preservation).
function checkDependencies(cwd, artifactKey) {
  const config = SYNTHESIS_MAP[artifactKey];
  if (!config) {
    throw new Error(
      `deliver.checkDependencies: unknown artifactKey '${artifactKey}'. ` +
        `Valid keys: ${TYPE_A_ARTIFACTS.join(', ')}`
    );
  }
  const missing = [];
  for (const src of config.sources) {
    const fullPath = path.join(cwd, '.planning', src.artifact);
    if (!fs.existsSync(fullPath)) missing.push(src.artifact);
  }
  return { complete: missing.length === 0, missing };
}

// ─── synthesizeTypeA ────────────────────────────────────────────────────────
// Auto-synthesizes one Type A artifact from workstream sources + OBJECTIVES.md
// + business context. Writes atomically to .planning/deliverables/type-a/{key}.md.
//
// Args:
//   cwd          — project root (must contain .planning/)
//   artifactKey  — one of TYPE_A_ARTIFACTS
//   options      — { en?: boolean } — when true, voice.languages = ['en'] (or
//                  ['ko', 'en'] if Korea fixture). Default ko-only for kr fixture.
//
// Returns: { outPath, complete, missing }
//
// Side effects: writes one .md file; emits stderr warning on missing sources.
function synthesizeTypeA(cwd, artifactKey, options) {
  const opts = options || {};
  const ctx = buildBusinessContext({ cwd });
  const config = SYNTHESIS_MAP[artifactKey];
  if (!config) {
    throw new Error(
      `deliver.synthesizeTypeA: unknown artifactKey '${artifactKey}'. ` +
        `Valid keys: ${TYPE_A_ARTIFACTS.join(', ')}`
    );
  }
  const dep = checkDependencies(cwd, artifactKey);

  if (!dep.complete) {
    process.stderr.write(
      `⚠ Type A artifact '${artifactKey}' has missing source workstreams: ${dep.missing.join(', ')}. Rendering with placeholders.\n`
    );
  }

  // Read template (Plan 05 ships full templates; Plan 08-01 tests use stubs).
  const templatePath = path.join(cwd, config.template);
  if (!fs.existsSync(templatePath)) {
    throw new Error(
      `deliver.synthesizeTypeA: template not found at ${templatePath}. ` +
        `Plan 05 ships templates; for tests, stub them in test setup.`
    );
  }
  const template = fs.readFileSync(templatePath, 'utf-8');

  // Read each source artifact and extract requested sections.
  const sectionContent = {};
  for (const src of config.sources) {
    const fullPath = path.join(cwd, '.planning', src.artifact);
    if (!fs.existsSync(fullPath)) {
      // Graceful degradation: write placeholder for each requested section.
      for (const sec of src.sections) {
        sectionContent[sec] = `> ⚠️ Placeholder — ${src.artifact} workstream not completed. Run /brief-design to populate.`;
      }
      continue;
    }
    const body = stripFrontmatter(fs.readFileSync(fullPath, 'utf-8'));
    for (const sec of src.sections) {
      sectionContent[sec] = extractMarkdownSection(body, sec);
    }
  }

  // Read OBJECTIVES.md sections (additive — failures degrade silently to
  // missing-section markers because objectivesSections may be empty for
  // service-policy / feature-map).
  const objectivesPath = path.join(planningPaths(cwd).planning, 'OBJECTIVES.md');
  if (fs.existsSync(objectivesPath)) {
    const objBody = stripFrontmatter(fs.readFileSync(objectivesPath, 'utf-8'));
    for (const sec of config.objectivesSections) {
      sectionContent[sec] = extractMarkdownSection(objBody, sec);
    }
  } else {
    for (const sec of config.objectivesSections) {
      sectionContent[sec] = `<!-- ${sec} not found in source -->`;
    }
  }

  // Determine output path.
  const outDir = path.join(cwd, '.planning', 'deliverables', 'type-a');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${artifactKey}.md`);

  // Compose frontmatter (Phase 5 D-10 mandatory schema + Phase 8 D-21
  // voice.languages array). audienceDefaults are derived from business_model
  // by buildBusinessContext (Phase 5 D-13/D-14).
  const fm = {
    'audience.type': 'internal',
    'audience.confidentiality': 'internal',
    'voice.tone': ctx.audienceDefaults['voice.tone'],
    'voice.perspective': ctx.audienceDefaults['voice.perspective'],
    'business_context.model': ctx.business_model || 'b2b',
    'business_context.region': ctx.region || '',
  };
  // voice.languages derivation per Phase 8 D-D03:
  //   ctx.language === 'ko' (Korea fixture):
  //     - default → ['ko']
  //     - --en    → ['ko', 'en'] (bilingual)
  //   ctx.language === 'en' OR options.en explicit (non-Korea):
  //     - either → ['en']
  // Order matters: ko branch must run AFTER en branch so ko + --en → ['ko', 'en']
  // (RESEARCH.md Code Example 1 lines 1253-1254 verbatim semantics).
  if (opts.en || ctx.language === 'en') fm['voice.languages'] = ['en'];
  if (ctx.language === 'ko') fm['voice.languages'] = opts.en ? ['ko', 'en'] : ['ko'];

  // Fill template by replacing each `<!-- INSERT: {section} -->` placeholder.
  let body = template;
  for (const [section, content] of Object.entries(sectionContent)) {
    const placeholder = `<!-- INSERT: ${section} -->`;
    body = body.split(placeholder).join(content);
  }

  // Apply B2B/B2C conditional prose (Phase 7 D-14 byte-identity) if config.conditionalProse.
  if (config.conditionalProse) {
    body = applyConditionalProse(body, ctx.business_model);
  }

  const finalContent = `---\n${reconstructFrontmatter(fm)}\n---\n\n${body}`;
  atomicWriteFileSync(outPath, finalContent, 'utf-8');

  return { outPath, complete: dep.complete, missing: dep.missing };
}

// ─── extractMarkdownSection ─────────────────────────────────────────────────
// Returns body text between `heading` line and next same-or-higher-level heading,
// or `<!-- {heading} not found in source -->` if heading not found. Trims trailing
// whitespace per RESEARCH.md Code Example 1 lines 1275-1286.
function extractMarkdownSection(body, heading) {
  const lines = body.split(/\r?\n/);
  const startIdx = lines.findIndex((ln) => ln.trim() === heading);
  if (startIdx === -1) return `<!-- ${heading} not found in source -->`;

  // Same-or-higher-level heading terminates the section.
  const headingLevel = (heading.match(/^#+/) || [''])[0].length;
  const endIdx = lines.slice(startIdx + 1).findIndex((ln) => {
    const m = ln.match(/^(#+)\s/);
    return m && m[1].length <= headingLevel;
  });
  return lines
    .slice(startIdx + 1, endIdx === -1 ? undefined : startIdx + 1 + endIdx)
    .join('\n')
    .trim();
}

// ─── applyConditionalProse (Phase 7 D-14 byte-identity) ────────────────────
// Conditional block markers: <!--BEGIN business_model: X-->...<!--END business_model: X-->
// Backreference \1 enforces well-formed open/close pair (T-08-01-02 mitigation).
// Matching block: keeps inner content, strips markers.
// Non-matching block: drops entire block including markers.
// Mismatched/unbalanced markers cause no match — blocks left intact (safe failure).
function applyConditionalProse(body, businessModel) {
  const bm = (businessModel || '').toLowerCase();
  return body.replace(
    /<!--\s*BEGIN business_model:\s*(\w+)\s*-->[\s\S]*?<!--\s*END business_model:\s*\1\s*-->/g,
    (match, modelTag) => {
      if (modelTag.toLowerCase() === bm) {
        // Keep inner content, strip both markers.
        return match
          .replace(/<!--\s*BEGIN business_model:\s*\w+\s*-->/, '')
          .replace(/<!--\s*END business_model:\s*\w+\s*-->/, '');
      }
      return '';
    }
  );
}

module.exports = {
  synthesizeTypeA,
  TYPE_A_ARTIFACTS,
  SYNTHESIS_MAP,
  checkDependencies,
  extractMarkdownSection,
  applyConditionalProse,
};
