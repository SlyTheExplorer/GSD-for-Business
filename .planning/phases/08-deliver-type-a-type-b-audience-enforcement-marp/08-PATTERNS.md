# Phase 8: DELIVER — Type A + Type B + AUDIENCE Enforcement + Marp - Pattern Map

**Mapped:** 2026-04-26
**Files analyzed:** 26 NEW files + 7 MODIFIED files (33 total)
**Analogs found:** 33 / 33 (100% coverage — Phase 8 is composition + escalation, NOT new infrastructure)

## File Classification

### NEW user-facing slash commands (NET +2 — under ≤12 cap)

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `commands/brief/deliver.md` | route (slash command) | request-response | `commands/brief/discover.md` | exact (orchestrator delegating to a workflow file via `@~/.claude/brief/workflows/...`) |
| `commands/brief/export.md` | route (slash command) | request-response | `commands/brief/design.md` | exact (single-target orchestrator with sequential gate threading) |

### NEW workflow files (orchestrator-internal, NOT user-facing)

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `brief/workflows/deliver.md` | controller (orchestrator) | event-driven (Task fan-out) | `brief/workflows/discover.md` (Type B path — wave Task spawn) + `brief/workflows/design.md` (Type A path — single-target sequential) | role-match (hybrid) |
| `brief/workflows/export.md` | controller (orchestrator) | request-response (gate sequence) | `brief/workflows/audience-guard.md` (3-path interrupt + force-accept) + `brief/workflows/design.md` Step 5 (sequential 3-gate threading) | exact-composite |

### NEW lib files (CommonJS — `.cjs`, zero runtime deps)

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `brief/bin/lib/deliver.cjs` | service (Type A synthesis) | transform (file-read → template-fill → atomic-write) | `brief/bin/lib/audience.cjs` (Phase 5 lib structure) + `brief/bin/lib/context-inject.cjs` (`buildBusinessContext` consumption) | role-match (composition pattern) |
| `brief/bin/lib/export.cjs` | service (gate orchestration + Marp wrapper) | request-response (sequential gate runner + spawn) | `brief/bin/lib/audience.cjs` `runAudience`+`commitAudienceVerdict` (gate primitives) + Phase 7 `compliance.cjs` (re-execution dispatch) | exact (re-uses existing `runAudience` / `runCompliance` API verbatim with NEW `verdictOutPath`) |
| `brief/bin/lib/voice-fit.cjs` | service (regex post-check) | transform (text → density score → regenerate signal) | `brief/bin/lib/audience.cjs` `BAN_EN`/`BAN_KO`/`HEDGING_EN`/`HEDGING_KO` regex pattern (lines 35-41) + `grepBanList` function (lines 79-94) | exact (mirror regex constants + grep function shape) |
| `brief/bin/lib/leakage-diff.cjs` | service (cross-artifact TF-IDF) | transform (corpus → TF-IDF score → finding emit) | `brief/bin/lib/align.cjs` `computeTermOverlap` (lines 110-127) + Hangul-aware tokenizer regex `[\uac00-\ud7af]{2,}` | exact (extends tokenizer to TF-IDF; reuses verbatim Hangul + EN-≥4-letter regex) |

### NEW agent files (parameterized via `{{ARTIFACT}}`)

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `agents/brief-deliver-type-a.md` | controller (Task agent) | request-response (Task spawn) | `agents/brief-domain-researcher.md` (`{{CATEGORY}}` parameterized agent) | exact (rename `{{CATEGORY}}` → `{{ARTIFACT}}`) |
| `agents/brief-deliver-type-b.md` | controller (Task agent) | request-response (Task spawn) | `agents/brief-domain-researcher.md` (parameterized) + `agents/brief-audience-guard.md` (frontmatter discipline) | exact (parameterized + Marp frontmatter + banned-words inline) |

### NEW templates

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `brief/templates/deliver/type-a/product-brief.md` | template (markdown skeleton) | file I/O | `brief/workstreams/business-model-canvas/templates/artifact.md` (frontmatter + section-template skeleton) | exact |
| `brief/templates/deliver/type-a/service-policy.md` | template (markdown + B2B/B2C conditional prose) | file I/O | Same analog + Phase 7 D-14 conditional prose pattern (`<!--BEGIN business_model: X-->...<!--END business_model: X-->`) | exact |
| `brief/templates/deliver/type-a/high-level-spec.md` | template (markdown skeleton) | file I/O | Same analog | exact |
| `brief/templates/deliver/type-a/feature-map.md` | template (Mermaid mindmap or ASCII tree) | file I/O | Same analog (Mermaid block in markdown) | role-match |
| `brief/templates/deliver/type-b/internal-deck.md` | template (Marp markdown + frontmatter) | file I/O | Same analog + RESEARCH.md Example 3 Marp template (B-D02 watermark + 7-9 slides) | exact-composite |
| `brief/templates/deliver/type-b/proposal-deck.md` | template (Marp + partner-safe content) | file I/O | Same analog (different `confidentiality: partner` frontmatter + Strategy → Traction slide swap) | exact |
| `brief/templates/deliver/type-b/exec-summary.md` | template (5-section narrative markdown) | file I/O | Same analog (NO Marp directive; pure markdown) | role-match |
| `brief/templates/deliver/type-b/decision-memo.md` | template (ADR 4-section markdown) | file I/O | Same analog (NO Marp directive) | role-match |
| `brief/templates/deliver/marp-themes/default.css` | template (Marp CSS theme) | file I/O | (no analog — NEW pattern) | no analog |
| `brief/templates/deliver/marp-themes/partner.css` | template | file I/O | (no analog) | no analog |
| `brief/templates/deliver/marp-themes/confidential.css` | template | file I/O | (no analog) | no analog |

### NEW hook + reference files

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `hooks/brief-validate-frontmatter.sh` | hook (PreToolUse on Bash matcher) | event-driven (git commit detection) | `hooks/brief-validate-provenance.sh` (full byte-identity copy: opt-in gate + JSON command extract + staged-file enumeration + Korean/English block message) | exact (copy + replace REGEX patterns + replace 5 mandatory-field check) |
| `brief/references/marp-environment.md` | reference (documentation) | static | `brief/references/audience-vocabulary.md` (reference-doc shape) | role-match |
| `brief/references/voice-fit-vocabulary.md` | reference (banned-words ban-list) | static | `brief/references/audience-vocabulary.md` (Phase 5; ban-list extension procedure lines 96-99) + `brief/references/align-vocabulary.md` (Phase 4 ban-list pattern) | exact (mirror structure: Preferred KO/EN + Ban-list KO/EN + Hedging triggers) |

### MODIFIED files (additive extensions)

| Modified File | Modification Type | Closest Analog Pattern |
|---------------|-------------------|------------------------|
| `bin/install.js` | Add `'brief-validate-frontmatter.sh'` to 3 arrays + add 22-line install block | Mirror lines 4762, 5849, 6307-6328 verbatim (3 known anchor points) |
| `scripts/build-hooks.js` | Append `'brief-validate-frontmatter.sh'` to `HOOKS_TO_COPY` array | Append after line 30 (`'brief-phase-boundary.sh'`) |
| `brief/bin/brief-tools.cjs` | Add `case 'deliver'`, `case 'export'`, `case 'voice-fit'`, `case 'leakage-diff'` subcommand dispatchers | Mirror `case 'audience'` pattern (lines 558-635) — try/catch + `core.error(err.message)` + `core.output(result, raw, ...)` |
| `brief/bin/lib/state.cjs` | Add `PHASE_8_BRIEF_FIELDS = Object.freeze(['deliverable_index', 'last_export_at'])` + documenting comment in header | Mirror `PHASE_7_BRIEF_FIELDS` pattern (lines 39-43) + documentation block (lines 19-26) |
| `brief/bin/lib/status.cjs` | Extend `formatGate` to display Type B force-accept override count + most recent reason | (review existing `formatGate` — Phase 8 plan determines exact extension shape) |
| `CLAUDE.md` | Add Marp env dependency to "Constraints" + bump Surface Caps NET +2 commands count | Existing "Constraints" + "Surface Caps" sections |
| `docs/ARCHITECTURE.md` | Bump counts: commands +2, agents +2, hooks +1, workflows +2, lib +4 | Existing structural-test count audit pattern |

---

## Pattern Assignments

### `brief/bin/lib/deliver.cjs` (service, transform — Type A synthesis)

**Analog A (lib structure):** `brief/bin/lib/audience.cjs`

**Imports pattern** (audience.cjs lines 9-20 — copy verbatim, swap audience-specific imports for synthesis-specific):

```javascript
const fs = require('fs');
const path = require('path');
const { atomicWriteFileSync, planningDir, planningPaths } = require('./core.cjs');
const {
  extractFrontmatter,
  stripFrontmatter,
  reconstructFrontmatter,
} = require('./frontmatter.cjs');
const { buildBusinessContext } = require('./context-inject.cjs');
```

**Analog B (synthesis composition):** `brief/bin/lib/context-inject.cjs` `buildBusinessContext` consumer pattern

**Core pattern** (RESEARCH.md Code Example 1 lines 1156-1296 verbatim — `synthesizeTypeA`, `extractMarkdownSection`, `applyConditionalProse`, `checkDependencies`, `SYNTHESIS_MAP`).

Key shapes to copy:
- `SYNTHESIS_MAP` constant: `{ artifact-key: { sources: [...], objectivesSections: [...], template, conditionalProse } }`
- `synthesizeTypeA(cwd, artifactKey, options)` returns `{ outPath, complete, missing }`
- Atomic write via `atomicWriteFileSync` from `core.cjs` (NOT `fs.writeFileSync` — must respect Phase 1 atomic-commit primitive)
- Graceful degradation: missing source workstream → placeholder section + warning to stderr

**Conditional prose pattern** (Phase 7 D-14 byte-identity):

```javascript
function applyConditionalProse(body, businessModel) {
  const bm = (businessModel || '').toLowerCase();
  return body.replace(/<!--\s*BEGIN business_model:\s*(\w+)\s*-->[\s\S]*?<!--\s*END business_model:\s*\1\s*-->/g,
    (match, modelTag) => modelTag.toLowerCase() === bm ? match.replace(/<!--\s*BEGIN business_model:\s*\w+\s*-->/, '').replace(/<!--\s*END business_model:\s*\w+\s*-->/, '') : ''
  );
}
```

**Frontmatter composition** (Phase 5 D-10 mandatory schema + Phase 8 NEW `voice.languages`):

```javascript
const fm = {
  'audience.type': 'internal',
  'audience.confidentiality': 'internal',
  'voice.tone': ctx.audienceDefaults['voice.tone'],
  'voice.perspective': ctx.audienceDefaults['voice.perspective'],
  'business_context.model': ctx.business_model || 'b2b',
  'business_context.region': ctx.region || '',
};
if (options.en || ctx.language === 'en') fm['voice.languages'] = ['en'];
if (ctx.language === 'ko') fm['voice.languages'] = options.en ? ['ko', 'en'] : ['ko'];
```

---

### `brief/bin/lib/export.cjs` (service, request-response — gate orchestration + Marp wrapper)

**Analog A (gate primitives reuse):** `brief/bin/lib/audience.cjs` lines 295-326 (`runAudience`)

**Imports pattern** (compose Phase 5 + Phase 7 + Phase 8 NEW):

```javascript
const fs = require('fs');
const path = require('path');
const audience = require('./audience.cjs');
const compliance = require('./compliance.cjs');
const align = require('./align.cjs');
const { leakageDiff } = require('./leakage-diff.cjs');
const { extractFrontmatter } = require('./frontmatter.cjs');
const { buildBusinessContext } = require('./context-inject.cjs');
const { atomicWriteFileSync, planningPaths } = require('./core.cjs');
```

**Gate re-execution pattern** (RESEARCH.md Pattern 1 lines 397-444 — separate run-id):

```javascript
function runExportGates(cwd, opts) {
  const exportRunId = `export-${Date.now()}-${process.pid}`;
  const baseTmp = planningPaths(cwd).planning;

  // AUDIENCE re-run with separate run-id (does NOT collide with Phase 5 in-flight verdict)
  const audienceVerdictPath = path.join(baseTmp, `.${exportRunId}.audience-verdict.tmp.json`);
  const audienceVerdict = audience.runAudience(cwd, {
    artifact: opts.artifactPath,
    baseline: opts.baselinePath || path.join(baseTmp, 'OBJECTIVES.md'),
    verdictOutPath: audienceVerdictPath,
    llmPass: opts.audienceLlmPass,
  });

  if (audienceVerdict.severity === 'blocking') {
    return { audienceVerdict, complianceVerdict: null, blocked: 'audience' };
  }

  const complianceVerdictPath = path.join(baseTmp, `.${exportRunId}.compliance-verdict.tmp.json`);
  const complianceVerdict = compliance.runCompliance(cwd, {
    artifact: opts.artifactPath,
    baseline: opts.baselinePath,
    verdictOutPath: complianceVerdictPath,
    llmPass: opts.complianceLlmPass,
  });

  return { audienceVerdict, complianceVerdict, blocked: null };
}
```

**Force-accept commit pattern** (audience.cjs lines 365-414 — verbatim):

```javascript
audience.commitAudienceVerdict(cwd, {
  verdictPath: path.join(cwd, '.planning', `.${exportRunId}.audience-verdict.tmp.json`),
  artifactPath: path.relative(cwd, artifactPath),
  override: true,
  overrideReason: reason, // sanitized inside commitAudienceVerdict via security.cjs sanitizeForPrompt
});
```

State write happens INSIDE `commitAudienceVerdict` via `readModifyWriteStateMd` (audience.cjs lines 392-407):

```javascript
fm.brief.last_gate_results.audience = {
  decision: override ? 'AUDIENCE-OK' : verdict.decision,
  severity: verdict.severity,
  findings_count: verdict.findings_count,
  at,
  ...(override ? { override: true, override_reason: sanitizedReason } : {}),
};
```

**Marp invocation pattern** (RESEARCH.md Pattern 4 lines 480-577 — `npx --yes` wrapper):

```javascript
const args = ['--yes', '@marp-team/marp-cli@4.3.1', inputMd, '-o', outputPath];
if (theme) args.push('--theme', theme);
if (format === 'pptx') args.push('--pptx');
else if (format === 'pdf') args.push('--pdf');
else if (format === 'html') args.push('--html');

const result = spawnSync('npx', args, {
  cwd, stdio: 'pipe', timeout: 120000, encoding: 'utf-8',
});
```

**MUST detect Chrome/Edge/Firefox FIRST** before invoking Marp PPTX/PDF (graceful PDF→HTML fallback ladder).

**Path-traversal guard pattern** (audience.cjs lines 336-351):

```javascript
function _canonicalize(p) {
  let cur = p;
  while (cur && cur !== path.dirname(cur)) {
    try { return path.join(fs.realpathSync(cur), path.relative(cur, p)); }
    catch { cur = path.dirname(cur); }
  }
  return p;
}
function _resolveSafePath(cwd, candidatePath) {
  const absolute = _canonicalize(path.resolve(cwd, candidatePath));
  const planningRoot = _canonicalize(path.resolve(cwd, '.planning'));
  if (absolute !== planningRoot && !absolute.startsWith(planningRoot + path.sep)) {
    throw new Error(`path traversal refused: ${candidatePath} resolves outside .planning/`);
  }
  return absolute;
}
```

---

### `brief/bin/lib/voice-fit.cjs` (service, transform — banned-words + concreteness)

**Analog:** `brief/bin/lib/audience.cjs` lines 35-41 (`BAN_EN`/`BAN_KO`/`HEDGING_EN`/`HEDGING_KO` regex constants) + lines 79-94 (`grepBanList` function)

**Regex constants pattern** (NEW Phase 8 — distinct from AUDIENCE deterministic screen):

```javascript
// Source: PITFALLS.md §Pitfall #10 banned-words list (verbatim) + CONTEXT.md C-D03 한국어 8개
const BANNED_EN = /\b(leverage|synergize|transform|holistic|delve|groundbreaking|best-in-class|seamless|cutting-edge|revolutionary|game-changing|landscape|unlock|empower|robust|innovative)\b/gi;

const BANNED_KO = /(혁신적인|차별화된|게임체인저|패러다임 시프트|시너지|활용|최적화|글로벌 스탠더드)/g;

// 한국어 반말 / 구어체 (D-D04 honorific guard) — triggers ONLY when audience external + region:kr
const HONORIFIC_VIOLATION_KO = /(?:[가-힣])(야|지|라구요|거든요|는데요)\b/g;
```

**Density check function** (mirror `grepBanList` shape):

```javascript
function checkBannedWords(text, options /* { isKorean: boolean, isExternal: boolean } */) {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const pages = Math.max(1, Math.ceil(wordCount / 250));  // ~250 words/page

  const enHits = [...text.matchAll(BANNED_EN)].map((m) => ({ token: m[0], offset: m.index }));
  const koHits = options.isKorean
    ? [...text.matchAll(BANNED_KO)].map((m) => ({ token: m[0], offset: m.index }))
    : [];
  const honorificHits = (options.isKorean && options.isExternal)
    ? [...text.matchAll(HONORIFIC_VIOLATION_KO)].map((m) => ({ token: m[0], offset: m.index }))
    : [];

  return {
    density: (enHits.length + koHits.length + honorificHits.length) / pages,
    threshold: 2,
    exceedsThreshold: ((enHits.length + koHits.length + honorificHits.length) / pages) > 2,
    hits: [...enHits, ...koHits, ...honorificHits],
    pages,
  };
}
```

**ANTI-PATTERN FLAG (CRITICAL):** voice-fit.cjs MUST NOT extend `audience.cjs runDeterministicScreen`. Phase 4·5·7 vocabulary-lock test (`tests/brief-{align,audience,compliance}-vocabulary-lock.test.cjs`) asserts the canonical 3-output verdict + paired-sibling + ban-list shape stays unchanged. Phase 8 ships voice-fit as a SEPARATE lib that runs PARALLEL to AUDIENCE, NOT as a 5th gate (CONTEXT.md C-D03 explicit reject).

**Korea-signal detection** — reuse Phase 5 helper:

```javascript
const { detectKoreaSignalFromConfig } = require('./align.cjs');
// ... isKorean = detectKoreaSignalFromConfig(cwd);
```

---

### `brief/bin/lib/leakage-diff.cjs` (service, transform — TF-IDF cross-artifact diff)

**Analog:** `brief/bin/lib/align.cjs` `computeTermOverlap` lines 110-127 (Hangul-aware tokenizer)

**Tokenizer pattern** (REUSE verbatim — Hangul + EN-≥4-letter from align.cjs):

```javascript
function tokenize(text) {
  const tokens = [];
  const words = text.split(/[\s\p{P}]+/u).filter(Boolean);
  for (const w of words) {
    const lw = w.toLowerCase();
    if (lw.length >= 4 && /^[a-z][a-z0-9_-]+$/.test(lw)) tokens.push(lw);
    const koMatches = w.matchAll(/[\uac00-\ud7af]{2,}/g);
    for (const m of koMatches) tokens.push(m[0]);
  }
  return tokens;
}
```

**Stop-word filter** (NEW — extends Phase 4 ban-list pattern with cross-artifact-leakage stops):

```javascript
const STOP_WORDS_EN = new Set([
  'about', 'above', 'after', 'again', 'against', 'because', 'before', 'between',
  'during', 'every', 'further', 'should', 'their', 'there', 'these', 'those',
  'through', 'while', 'which', 'with', 'would', 'product', 'service',
  'customer', 'market', 'company', 'business', 'team', 'value',  // generic biz words
]);
const STOP_WORDS_KO = new Set([
  '있습니다', '입니다', '됩니다', '합니다', '우리는', '있는', '있고',
  '하는', '하고', '및', '또는', '이것', '저것',
  '고객', '시장', '회사', '사업', '팀', '가치', '서비스', '제품',
]);
```

**Confidentiality strictness ordering** (Phase 5 D-10 enum verbatim):

```javascript
const STRICTNESS = { public: 0, partner: 1, internal: 2, confidential: 3 };
```

**TF-IDF + finding-emit pattern** (RESEARCH.md Pattern 5 lines 593-726 — pure CJS, no `natural`/`tfidf` runtime dep):

```javascript
function leakageDiff(currentArtifactPath, options /* { folder?: string } */) {
  // 1. Read current artifact's confidentiality from frontmatter
  // 2. Enumerate same-folder siblings with stricter confidentiality
  //    (skip .audience.md / .compliance.md paired-siblings)
  // 3. For each stricter sibling: extract top-20 distinctive keywords by TF-IDF
  //    where document corpus = sibling itself + current artifact
  // 4. For each keyword: scan current artifact body for occurrences
  // 5. If ≥3 distinctive keywords match → emit finding (severity: material)
  return { findings: [...], rationale: '...' };
}
```

**ANTI-PATTERN FLAG:** Do NOT use `natural` / `tfidf-search` / `node-tfidf` runtime dep. A1 zero-deps lock. Pure-CJS implementation = ~150 LOC; runtime dep adds 1MB+ for trivial arithmetic.

---

### `agents/brief-deliver-type-a.md` (controller, request-response — Task agent)

**Analog:** `agents/brief-domain-researcher.md` (parameterized agent pattern — Phase 5 D-01 byte-identity)

**Frontmatter pattern** (domain-researcher.md lines 1-6):

```yaml
---
name: brief-deliver-type-a
description: Type A deliverable synthesis agent for BRIEF DELIVER phase. Auto-synthesizes 4 PRD-input markdown artifacts (PRODUCT-BRIEF / SERVICE-POLICY / HIGH-LEVEL-SPEC / FEATURE-MAP) from 9 workstream outputs + OBJECTIVES.md immutable intent. Parameterized at Task-spawn time by {{ARTIFACT}} + <business_context> block (from context-inject.cjs). Spawned by brief/workflows/deliver.md. Read-only — never mutates OBJECTIVES.md or workstream artifacts; Write tool used ONLY to emit the deliverable file at {{OUT_PATH}}.
tools: Read, Grep, Glob, Write
color: green
---
```

**Role section** (mirror domain-researcher.md lines 8-24):

```markdown
<role>
You are the BRIEF TYPE A DELIVERABLE SYNTHESIZER. You answer one question:
"What should the {{ARTIFACT}} contain for this project, drawn from existing workstream outputs?"

You produce a single markdown file at {{OUT_PATH}} matching the {{ARTIFACT}} schema.
You NEVER hallucinate workstream content — if a source workstream is missing, emit
a placeholder section with `> ⚠️ Placeholder — {workstream} not yet completed.` and warn.
You NEVER use pass/fail or compliance-theater vocabulary in synthesized content.

Spawned by: brief/workflows/deliver.md (orchestrator-side --type-a path).
You are NOT auto-attached via PostToolUse / SubagentStop hooks (Phase 4 Anti-pattern #2).
</role>
```

**Required-reading + business_context_contract** — copy domain-researcher.md sections lines 26-102 verbatim, swap `{{CATEGORY}}` for `{{ARTIFACT}}`.

**Anti-patterns + provenance discipline + process** — copy domain-researcher.md sections verbatim. Type A inherits the SAME provenance discipline (every quantitative claim carries `[VERIFIED:url|date]` / `[ASSUMED:reasoning]` / `[FOUNDER-INPUT]`).

---

### `agents/brief-deliver-type-b.md` (controller, request-response — Task agent + Marp + voice-fit)

**Analog:** Same `agents/brief-domain-researcher.md` parameterized pattern + `agents/brief-audience-guard.md` frontmatter discipline.

**Distinctive Type B additions:**

1. **Marp frontmatter directives** (in OUTPUT, not agent prompt):
   ```yaml
   marp: true
   theme: default
   paginate: true
   footer: '{watermark_text}'
   ```

2. **Banned-words inline ban-list** (in agent prompt — for SELF-CHECK before final output):
   ```markdown
   <banned_vocabulary>
   The following words/phrases are FORBIDDEN in your output (Pitfall #10 + C-D03):
   English: leverage / synergize / transform / holistic / delve / groundbreaking /
   best-in-class / seamless / cutting-edge / revolutionary / game-changing / landscape /
   unlock / empower / robust / innovative.
   Korean (when language=ko): 혁신적인 / 차별화된 / 게임체인저 / 패러다임 시프트 / 시너지 /
   활용 / 최적화 / 글로벌 스탠더드.

   If you write any banned word, REWRITE the sentence with concrete language.
   The voice-fit.cjs post-check will fire if density > 2/page; the workflow then
   issues a 1-shot regenerate request with banned-word feedback.
   </banned_vocabulary>
   ```

3. **Concreteness rule** (in agent prompt — C-D04 inline guide):
   ```markdown
   <concreteness_rule>
   EVERY claim must answer ONE of: "compared to what?" / "by how much?" / "when?".

   GOOD: "We reduce 15-person legal review cycles from 3 weeks to 4 days [VERIFIED:internal-pilot-2026-04|2026-04-25]."
   BAD: "We deliver innovative solutions" (no comparison, no number, no time).

   2-3 hand-written exemplars per deck style (INVESTOR-IR / EXEC-SUMMARY /
   DECISION-MEMO) ship inline below. Use them as your style anchor.
   </concreteness_rule>
   ```

4. **Korean honorific guard** (D-D04 inline — when language=ko AND audience external):
   ```markdown
   <korean_honorific_rule>
   When language=ko AND audience.confidentiality in {partner, public, external}:
   - Use 격식체 (formal endings: -습니다 / -ㅂ니다) ONLY.
   - 반말 / 구어체 BANNED: -야 / -지 / -라구요 / -거든요 / -는데요.
   - Korean 투자자/임원 culture: emphasize founder reliability + long-term
     relationship signals, NOT short-term ROI.
   - "Trust is built before terms are discussed" — vision + team stability +
     long-term partnership signals.
   </korean_honorific_rule>
   ```

5. **Process step ordering** (different from Type A — adds Marp frontmatter generation + watermark text computation):
   - Read business_context, OBJECTIVES, workstream artifacts
   - Determine watermark_text from `audience.confidentiality` (B-D02 mapping)
   - Compose Marp frontmatter + literal Cover slide watermark
   - Generate slides per D-D01 7-9 sequence (or D-D02 narrative section for EXEC/DECISION)
   - SELF-CHECK against banned_vocabulary + concreteness_rule + korean_honorific_rule (when applicable)
   - Write to `{{OUT_PATH}}` via Write tool

---

### `commands/brief/deliver.md` (route, request-response — slash command)

**Analog:** `commands/brief/discover.md` (orchestrator delegating to workflow file)

**Frontmatter pattern** (discover.md lines 1-11):

```yaml
---
name: brief:deliver
description: BRIEF DELIVER phase — auto-synthesize 4 Type A PRD-input artifacts (PRODUCT-BRIEF / SERVICE-POLICY / HIGH-LEVEL-SPEC / FEATURE-MAP) from 9 workstream outputs + OBJECTIVES.md, OR generate 1 Type B Marp deck/memo source markdown (INTERNAL-DECK / PROPOSAL-DECK / EXEC-SUMMARY / DECISION-MEMO). Type A: --type-a (4 artifacts in one shot). Type B: --type-b <name> (one artifact per invocation; Marp render via /brief-export).
argument-hint: "--type-a | --type-b <name> [--en] [--text]"
allowed-tools:
  - Read
  - Bash
  - AskUserQuestion
  - Task
  - Write
---
```

**Body shape** (discover.md lines 12-42 — `<objective>` + `<execution_context>` + `<process>`):

```markdown
<objective>
Guide the user through DELIVER phase:
  1. Branch on --type-a vs --type-b (mode parsing).
  2. Type A: synthesize 4 markdown artifacts from workstream outputs + OBJECTIVES.
  3. Type B: spawn brief-deliver-type-b agent with parameterized {{ARTIFACT}}.
  4. Each artifact passes ALIGN → AUDIENCE → COMPLIANCE gates inline (Phase 7 D-02).
  5. Atomic commit each artifact + sibling .audience.md + sibling .compliance.md + STATE.md.
</objective>

<execution_context>
@~/.claude/brief/workflows/deliver.md
@~/.claude/brief/workflows/audience-guard.md
@~/.claude/brief/workflows/compliance.md
</execution_context>

<process>
Execute the deliver workflow per brief/workflows/deliver.md.
</process>
```

---

### `commands/brief/export.md` (route, request-response — slash command)

**Analog:** Same `commands/brief/discover.md` shape, but invokes `brief/workflows/export.md`. Description emphasizes: 1-step confirm + AUDIENCE/COMPLIANCE re-execution + cross-artifact leakage diff + Marp render.

**Argument-hint:** `<artifact-name> [--format pptx|pdf|html] [--theme name] [--text]`.

---

### `brief/workflows/deliver.md` (controller, event-driven hybrid)

**Analog A (Type B path — Task spawn):** `brief/workflows/discover.md` (Phase 5; orchestrator-workers wave pattern with `<Task>` spawn)

**Analog B (Type A path — sequential gate threading):** `brief/workflows/design.md` (Phase 7; single-target sequential ALIGN → AUDIENCE → COMPLIANCE)

**Step 0 TEXT_MODE detection pattern** (discover.md lines 14-19 verbatim):

```markdown
## Step 0: TEXT_MODE Detection
Set TEXT_MODE=true if `--text` is present in $ARGUMENTS OR `workflow.text_mode` from init
JSON is true. When TEXT_MODE is active, replace every AskUserQuestion call with a plain-text
numbered list and ask the user to type their choice number.
```

**Step 1 mode parse**: `--type-a` vs `--type-b <name>` branching.

**Step 2A (Type A path) — for each of 4 artifacts:**
1. Call `brief-tools deliver synthesize --artifact <key>` (subcommand dispatcher → `deliver.cjs synthesizeTypeA`)
2. Display synthesized artifact to user
3. AskUserQuestion: `[commit as-is] / [edit before commit] / [regenerate with feedback]`
4. On commit: invoke ALIGN → AUDIENCE → COMPLIANCE inline (Phase 7 D-02 sequential — design.md Step 5 byte-identity)
5. Atomic commit (artifact + sibling .audience.md + sibling .compliance.md + STATE.md)

**Step 2B (Type B path) — single artifact:**
1. Build business_context via `context-inject.cjs buildBusinessContext` (discover.md Step 4 byte-identity)
2. Spawn brief-deliver-type-b Task with `{{ARTIFACT}}` parameterized
3. After Task returns: call `brief-tools voice-fit check --artifact <path>` (banned-words density)
4. If exceedsThreshold: 1-shot regenerate (re-spawn Task with feedback block)
5. Run AUDIENCE + COMPLIANCE gates (NOT ALIGN here — Type B from agent already conditioned on ALIGN-passed inputs)
6. User instruction: "Run /brief-export <artifact> to render Marp PPTX"

---

### `brief/workflows/export.md` (controller, request-response — gate sequence + Marp wrapper)

**Analog A (3-path interrupt + force-accept):** `brief/workflows/audience-guard.md` Steps 5A/5B/6 byte-identity

**Analog B (sequential 3-gate threading):** `brief/workflows/design.md` Step 5 (ALIGN → AUDIENCE → COMPLIANCE in series, fail-fast)

**Step ordering** (RESEARCH.md Architecture Diagram lines 234-269):

```
Step 1: leakage-diff.cjs (TF-IDF cross-artifact diff against stricter siblings)
Step 2: AUDIENCE re-run (NEW run-id, NOT colliding with Phase 5 in-flight verdict)
Step 3: COMPLIANCE re-run (NEW run-id)
Step 4: 1-step confirm UI (B-D03 verbatim format — Korean variant when region: kr)
Step 5: BLOCKING branch → 3-path interrupt (audience-guard.md Step 5A/5B/6 inheritance)
Step 6: Marp render via npx --yes (Pattern 4 — env detect + PPTX/PDF/HTML fallback)
Step 7: Atomic commit (source.md + .audience.md + .compliance.md + .{conf}.{ext} + STATE.md)
```

**1-step confirm UI display format** (CONTEXT.md B-D03 verbatim — bilingual):

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BRIEF ► EXPORT CONFIRMATION  (Korean: BRIEF ► EXPORT 확인)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Artifact: proposal-deck.md
 Audience: external-partner
 Confidentiality: partner
 Output:    proposal-deck.partner.pptx
 Watermark: "Partner-only — Do not redistribute"

 AUDIENCE gate: AUDIENCE-OK ✓
 COMPLIANCE gate: COMPLIANCE-OK ✓
 Cross-artifact leakage diff: 0 findings ✓

── Render this artifact for partner audience? ──
 [Yes, render] / [No, cancel]
```

**3-path interrupt pattern** (audience-guard.md lines 203-222 byte-identity):

```markdown
<askuserquestion>
  <question>
⚠ AUDIENCE 결과: DRIFTED-content (or DRIFTED-frontmatter)

지금 작성된 artifact가 선언된 청중과 맞지 않는 부분이 발견되었습니다.
어떻게 진행하시겠어요?
  </question>
  <options>
    <option>frontmatter 수정 (또는 content 재작성)</option>
    <option>이 데크 다시 쓰기</option>
    <option>force-accept (audit trail + reason 필수)</option>
  </options>
</askuserquestion>
```

**force-accept pattern** (audience-guard.md Step 6 lines 290-326 byte-identity — calls `brief-tools audience commit --override --override-reason`).

---

### `hooks/brief-validate-frontmatter.sh` (hook, event-driven — PreToolUse on Bash)

**Analog:** `hooks/brief-validate-provenance.sh` (Phase 5; FULL byte-identity copy with regex/check substitution)

**Opt-in gate pattern** (provenance.sh lines 16-22 — copy verbatim):

```bash
# Check opt-in config — exit silently if not enabled
if [ -f .planning/config.json ]; then
  ENABLED=$(node -e "try{const c=require('./.planning/config.json');process.stdout.write(c.hooks?.community===true?'1':'0')}catch{process.stdout.write('0')}" 2>/dev/null)
  if [ "$ENABLED" != "1" ]; then exit 0; fi
else
  exit 0
fi
```

**Command extraction pattern** (provenance.sh lines 24-32 — copy verbatim):

```bash
INPUT=$(cat)
CMD=$(echo "$INPUT" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{process.stdout.write(JSON.parse(d).tool_input?.command||'')}catch{}})" 2>/dev/null)

# Only run validation for `git commit` commands
if ! [[ "$CMD" =~ ^git[[:space:]]+commit ]]; then
  exit 0
fi

STAGED_FILES=$(git diff --cached --name-only --diff-filter=AM 2>/dev/null || true)
if [ -z "$STAGED_FILES" ]; then exit 0; fi
```

**Validation logic — REPLACE provenance regex with frontmatter 5-field check** (RESEARCH.md Pattern 7 lines 873-911 — inline 30-line node validator):

```bash
RESULT=$(node -e "
  const fs = require('fs');
  const content = fs.readFileSync('$F', 'utf-8');
  const m = content.match(/^---\\r?\\n([\\s\\S]+?)\\r?\\n---/);
  if (!m) { process.stdout.write('NO_FRONTMATTER'); process.exit(0); }
  const yaml = m[1];
  const required = ['audience.type', 'audience.confidentiality', 'voice.tone', 'voice.perspective', 'business_context.model'];
  const missing = [];
  for (const path of required) {
    // ... nested-key + flat-dotted-key lookup (see RESEARCH.md Pattern 7 lines 882-906)
    if (!found) missing.push(path);
  }
  process.stdout.write(missing.length === 0 ? 'OK' : 'MISSING:' + missing.join(','));
" 2>/dev/null)
```

**Korean/English error pattern** (provenance.sh lines 96-117 — copy structure, REPLACE message text):

```bash
KOREA=$(node -e "try{const c=require('./.planning/config.json');process.stdout.write(c.brief?.region==='kr'?'1':'0')}catch{process.stdout.write('0')}" 2>/dev/null)

if [ "$KOREA" = "1" ]; then
  REASON="⚠ 커밋이 차단되었습니다. .planning/ artifact frontmatter에 필수 항목이 누락되었습니다.

다음 파일에 audience.type, audience.confidentiality, voice.tone, voice.perspective, business_context.model 5개 필수 항목을 모두 추가해 주세요:
${VIOLATIONS}
이 hook은 .planning/config.json에서 hooks.community: false 로 변경하여 비활성화할 수 있습니다 (권장하지 않음 — Phase 8 audience 방어막 약화)."
else
  REASON="Commit blocked: .planning/ artifact frontmatter missing mandatory fields.

Add audience.type, audience.confidentiality, voice.tone, voice.perspective, business_context.model to:
${VIOLATIONS}
You can disable this hook by setting hooks.community: false in .planning/config.json (NOT recommended — weakens Phase 8 audience defense)."
fi

REASON_JSON=$(node -e "process.stdout.write(JSON.stringify(process.argv[1]))" "$REASON")
echo "{\"decision\":\"block\",\"reason\":${REASON_JSON}}"
exit 2
```

---

### `bin/install.js` modifications (3 anchors + 1 install block)

**Analog:** brief-validate-provenance.sh registration block (lines 6307-6328) — full byte-identity copy with `provenance` → `frontmatter` substitution.

**Anchor 1 — `briefHooks` array (line 4762):**
```javascript
const briefHooks = ['brief-statusline.js', ..., 'brief-validate-provenance.sh', 'brief-phase-boundary.sh', 'brief-validate-frontmatter.sh'];
```

**Anchor 2 — `expectedShHooks` array (line 5849):**
```javascript
const expectedShHooks = ['brief-session-state.sh', 'brief-validate-commit.sh', 'brief-validate-provenance.sh', 'brief-phase-boundary.sh', 'brief-validate-frontmatter.sh'];
```

**Anchor 3 — install block (insert after line 6328 — mirror lines 6307-6328 verbatim with name swap):**
```javascript
// Configure frontmatter validation hook (CC-03, opt-in via hooks.community)
const validateFrontmatterCommand = isGlobal
  ? buildHookCommand(targetDir, 'brief-validate-frontmatter.sh', hookOpts)
  : 'bash ' + localPrefix + '/hooks/brief-validate-frontmatter.sh';
const hasValidateFrontmatterHook = settings.hooks[preToolEvent].some(entry =>
  entry.hooks && entry.hooks.some(h => h.command && (h.command.includes('brief-validate-frontmatter') || h.command.includes('gsd-validate-frontmatter')))
);
const validateFrontmatterFile = path.join(targetDir, 'hooks', 'brief-validate-frontmatter.sh');
if (!hasValidateFrontmatterHook && fs.existsSync(validateFrontmatterFile)) {
  settings.hooks[preToolEvent].push({
    matcher: 'Bash',
    hooks: [{ type: 'command', command: validateFrontmatterCommand, timeout: 5 }]
  });
  console.log(`  ${green}✓${reset} Configured frontmatter validation hook (opt-in via config)`);
} else if (!hasValidateFrontmatterHook && !fs.existsSync(validateFrontmatterFile)) {
  console.warn(`  ${yellow}⚠${reset}  Skipped frontmatter validation hook — brief-validate-frontmatter.sh not found at target`);
}
```

**Anchor 4 — uninstall command-include (line 4818):** add `cmd.includes('brief-validate-frontmatter') || cmd.includes('gsd-validate-frontmatter')`.

---

### `scripts/build-hooks.js` modification (1 line)

**Analog:** Existing `HOOKS_TO_COPY` array (lines 17-31)

**Add after line 30 (`'brief-phase-boundary.sh'`):**
```javascript
'brief-validate-frontmatter.sh'
```

---

### `brief/bin/brief-tools.cjs` modifications (4 new subcommand cases)

**Analog:** `case 'audience'` (lines 558-635) — try/catch + `core.error(err.message)` + `core.output(result, raw, msg)` pattern

**Pattern shape** (audience.cjs case lines 558-635 — mirror for `deliver`, `export`, `voice-fit`, `leakage-diff`):

```javascript
case 'deliver': {
  const deliver = require('./lib/deliver.cjs');
  const subcommand = args[1];
  // ... arg index lookups for --artifact / --type / --en / --text ...

  if (subcommand === 'synthesize') {
    try {
      const result = deliver.synthesizeTypeA(cwd, artifactKey, { en });
      core.output(result, raw, `synthesized ${result.outPath}`);
    } catch (err) {
      error(err.message);
    }
    break;
  }
  // ... other subcommands ...

  error(`deliver: unknown subcommand '${subcommand}'. Valid: synthesize, ...`);
  break;
}
```

**4 new case dispatchers required:**

| Subcommand | Subcommand verbs | Lib file invoked |
|------------|------------------|------------------|
| `deliver` | `synthesize`, `list-type-a`, `list-type-b` | `lib/deliver.cjs` |
| `export` | `run`, `confirm`, `render` | `lib/export.cjs` |
| `voice-fit` | `check`, `regenerate-feedback` | `lib/voice-fit.cjs` |
| `leakage-diff` | `scan`, `report` | `lib/leakage-diff.cjs` |

---

### `brief/bin/lib/state.cjs` modifications (allowlist extension + header doc)

**Analog:** `PHASE_7_BRIEF_FIELDS` constant (lines 39-43) + header doc (lines 19-26)

**Add after `PHASE_7_BRIEF_FIELDS` (lines 39-43):**

```javascript
// Phase 8 D-21 — schema-documentation allowlist for state.brief.* fields
// added in this phase. The preserve-wholesale write path
// (syncStateFrontmatter + cmdStateJson) does not validate against this list
// — it's enforced by convention and the round-trip test in
// tests/brief-deliver-canary.test.cjs.
const PHASE_8_BRIEF_FIELDS = Object.freeze([
  'deliverable_index',     // map of deliverable-name → last_synthesized_at + last_export_at
  'last_export_at',        // ISO timestamp of most recent /brief-export invocation
]);
```

**Add to header doc block (after lines 19-26 Phase 7 documentation):**

```javascript
*   Phase 8 D-21 (this phase):
*     - deliverable_index:      map of {artifact-key: {synthesized_at, exported_at}} — set by /brief-deliver and /brief-export
*     - last_export_at:         ISO timestamp — set by /brief-export on success
```

**Add to module.exports** (line 1668):

```javascript
PHASE_8_BRIEF_FIELDS,
```

**Note (A11 verified):** `state.brief.last_gate_results.audience.override` already supported by Phase 4 D-07 substrate via nested-map preserve-wholesale; NO state.cjs change required for force-accept audit trail.

---

### `brief/bin/lib/status.cjs` modifications (formatGate Type B override display)

**Analog:** Existing `formatGate` function in status.cjs (review for current signature)

**Extension contract:** When `state.brief.last_gate_results.audience.override === true`, `formatGate('audience')` includes:
- Override indicator (e.g., `(override applied)`)
- Override count from history (if Phase 8 plan implements counter)
- Most recent `override_reason` (truncated to ~80 chars)

Per Pitfall #1: visibility helps prevent force-accept becoming a mindless workflow.

---

### Templates (8 NEW + 3 Marp themes)

#### `brief/templates/deliver/type-a/*.md` (4 files)

**Analog:** `brief/workstreams/business-model-canvas/templates/artifact.md` (frontmatter + section template skeleton)

**Frontmatter pattern** (artifact.md lines 1-11 — copy + extend with Phase 8 voice fields):

```yaml
---
audience.type: internal
audience.confidentiality: internal
voice.tone: {{voice.tone}}
voice.perspective: {{voice.perspective}}
business_context.model: {{business_model}}
business_context.region: {{region}}
voice.languages: {{languages}}              # NEW Phase 8 D-D03
deliverable: {{artifact-key}}                # NEW Phase 8
generated_by: brief-deliver-type-a
generated_at: {{ISO-timestamp}}
---
```

**Body pattern (PRODUCT-BRIEF.md):**
- Cite OBJECTIVES.md `## Immutable Intent`
- Insert section markers: `<!-- INSERT: ## Customer Segments -->`, `<!-- INSERT: ## Value Proposition -->`, `<!-- INSERT: ## Personas -->`
- These markers are filled by `deliver.cjs synthesizeTypeA` reading source workstream sections via `extractMarkdownSection` (RESEARCH.md Code Example 1 lines 1275-1286)

**Body pattern (SERVICE-POLICY.md — B2B/B2C conditional prose):**
```markdown
## Service Tiers

<!--BEGIN business_model: b2b-->
- SLA tiers: 99.9% / 99.95% / 99.99% (Standard / Premium / Enterprise)
- Enterprise support: dedicated CSM + 4-hour P1 response
- Data processing terms: standard DPA + customer-specific addendums
- Contract terms: NN/N30/N90 net payment options
<!--END business_model: b2b-->

<!--BEGIN business_model: b2c-->
- Refund policy: 30-day no-questions refund + auto-renewal cancellation
- Customer support hours: 09:00-18:00 KST (kr) / 24x7 chat (others)
- Channel coverage: app stores + web + community Discord
- Community guidelines: see /community/guidelines
<!--END business_model: b2c-->
```

#### `brief/templates/deliver/type-b/internal-deck.md` and `proposal-deck.md`

**Analog:** RESEARCH.md Code Example 3 lines 1383-1465 (Marp 7-9 slide template with frontmatter watermark + literal Cover slide content)

**Marp frontmatter pattern** (D-D01 + B-D02 — watermark text per `audience.confidentiality` enum):

```yaml
---
audience.type: internal           # internal-deck
audience.confidentiality: confidential
voice.tone: formal
voice.perspective: first-person-plural
business_context.model: {{business_model}}
business_context.region: {{region}}
voice.languages: {{languages}}
marp: true
theme: default                    # for INTERNAL; partner.css for PROPOSAL
paginate: true
footer: 'CONFIDENTIAL — Internal use only — Do not share'
---
```

**Cover slide literal watermark** (B-D02 — survives copy-paste):

```markdown
<!-- Slide 1: Cover -->
# {{project_title}}

> **CONFIDENTIAL — Internal use only — Do not share**
>
> Generated {{date}} by BRIEF
```

**7-9 slide sequence** (D-D01 lock — Sequoia/YC variant):
1. Cover (watermark)
2. Problem (BMC Customer Segments + Customer Jobs)
3. Solution (BMC Value Proposition + PRODUCT-BRIEF Core Value)
4. Market (DISCOVER market-sizing — provenance tags preserved)
5. Strategy (BMC Key Activities + GTM Channels) [INTERNAL] / Traction (RISK excluded; partner-safe) [PROPOSAL]
6. Roadmap (ROADMAP workstream)
7. Ask (executive decision request [INTERNAL] / partnership proposal [PROPOSAL])
8. (optional) Team (OPERATIONS Team — small list, redacted for partner)
9. (optional) Appendix (FINANCIAL summary — INTERNAL only)

#### `brief/templates/deliver/type-b/exec-summary.md` and `decision-memo.md`

**Analog:** Same workstream artifact.md frontmatter shape, NO Marp directives (markdown only).

**EXEC-SUMMARY narrative 5-section** (D-D02):
- `## Context` (1 paragraph)
- `## Problem` (1-2 paragraphs)
- `## Recommendation` (3-5 bullets)
- `## Risks` (3-5 bullets, RISK workstream)
- `## Ask` (1 paragraph + decision request)

**DECISION-MEMO ADR 4-section** (D-D02):
- `## Context`
- `## Decision` (1-2 sentences: "We will [verb] [object] because [reason]")
- `## Alternatives Considered` (3+ rejected options + rationale)
- `## Consequences` (positive + negative + neutral)

#### `brief/templates/deliver/marp-themes/{default,partner,confidential}.css`

**No analog** — NEW pattern. Plain CSS files referenced by Marp `--theme <path>` (RESEARCH.md "Don't Hand-Roll" table). Brand colors variabilized; ~100 LOC each.

---

### `brief/references/marp-environment.md` (reference doc)

**Analog:** `brief/references/audience-vocabulary.md` (reference-doc shape — lines 1-11 header)

**Content scope** (RESEARCH.md "Environment Availability" table + Pitfall 2 lines 1089-1098 + Pattern 4 sandbox notes lines 579-582):

- Chrome / Edge / Firefox MANDATORY for PPTX/PDF/PNG (Marp CLI 4 auto-fallback Chrome → Edge → Firefox)
- LibreOffice OPTIONAL for `--pptx-editable` (image-based PPTX works without it)
- npx --yes first invocation: 30-60s download (~50MB) — document explicitly
- Sandbox/network restrictions: enterprise environments may block npx → fallback `npm install -g @marp-team/marp-cli@4.3.1`
- GitHub Actions / Docker: may need `CHROME_NO_SANDBOX=1` env var
- Pandoc as last-resort fallback (NOT recommended for slide quality)

---

### `brief/references/voice-fit-vocabulary.md` (banned-words ban-list reference)

**Analog:** `brief/references/audience-vocabulary.md` (ban-list extension procedure lines 96-99) + `brief/references/align-vocabulary.md` (Phase 4 ban-list pattern)

**Section structure** (mirror audience-vocabulary.md):

```markdown
# Voice-Fit Vocabulary — AI Slop Ban-List + Concreteness Examples

> Source of truth for the BRIEF voice-fit.cjs banned-words check.
> Loaded by `brief/bin/lib/voice-fit.cjs` BANNED_EN / BANNED_KO regex constants.
> Grepped at CI time by `tests/brief-voice-fit-vocabulary-lock.test.cjs`.
> Rationale: PITFALLS.md §Pitfall #10 (AI Slop in Type B Artifacts) + §Pitfall #11
> (Korean Cultural Gotchas).

## Banned vocabulary (EN — 16 seed)
- leverage / synergize / transform / holistic / delve / groundbreaking
- best-in-class / seamless / cutting-edge / revolutionary / game-changing
- landscape / unlock / empower / robust / innovative

## Banned vocabulary (KO — 8 seed; CONTEXT.md C-D03)
- 혁신적인 / 차별화된 / 게임체인저 / 패러다임 시프트
- 시너지 / 활용 / 최적화 / 글로벌 스탠더드

## Honorific violations (KO — only when audience external + region:kr)
- -야 / -지 / -라구요 / -거든요 / -는데요 (반말 endings)

## Concreteness exemplars (hand-written per C-D04)
### INVESTOR-IR style (1)
[hand-written exemplar — 2-3 paragraphs of good investor pitch with specific numbers]

### EXEC-SUMMARY style (1)
[hand-written exemplar]

### DECISION-MEMO style (1)
[hand-written exemplar]

### Korean exemplar (when region:kr — 1)
[hand-written 격식체 + 구체 수치 + 출처 명시 사례]

## Ban-list extension procedure (per Phase 4 D-09 inheritance)
1. Edit THIS file first (banned-word + brief justification).
2. Add to BANNED_EN or BANNED_KO regex literal in voice-fit.cjs.
3. Add structural test in tests/brief-voice-fit-banned-words.test.cjs.
4. Phase 9 HRD-04 pilot data MAY drive new entries.
```

---

## Shared Patterns

### Korea-signal Detection
**Source:** `brief/bin/lib/align.cjs` `detectKoreaSignalFromConfig` (lines 87-101) + `brief/bin/lib/context-inject.cjs` `buildBusinessContext` (lines 151-218 — `language: 'ko'` field)

**Apply to:** `deliver.cjs`, `export.cjs`, `voice-fit.cjs`, `leakage-diff.cjs`, both Type A/B agents, both new workflows, CC-03 hook

```javascript
// In any Phase 8 lib file:
const { detectKoreaSignalFromConfig } = require('./align.cjs');
const isKorean = detectKoreaSignalFromConfig(cwd);

// OR for richer business context:
const { buildBusinessContext } = require('./context-inject.cjs');
const ctx = buildBusinessContext({ cwd });
const isKorean = ctx.language === 'ko';
```

```bash
# In CC-03 hook (brief-validate-frontmatter.sh):
KOREA=$(node -e "try{const c=require('./.planning/config.json');process.stdout.write(c.brief?.region==='kr'?'1':'0')}catch{process.stdout.write('0')}" 2>/dev/null)
```

---

### Atomic Multi-File Commit
**Source:** `brief-tools commit --files` (Phase 1 D-09 atomic-commit primitive) + `commitAudienceVerdict` lines 388-410 (atomic write + readModifyWriteStateMd)

**Apply to:** All new commits in Phase 8 (deliver.md Step 2A.5, export.md Step 7)

Atomic commit tuples:
- Type A: `{artifact}.md` + `{artifact}.audience.md` + `{artifact}.compliance.md` + `STATE.md`
- Type B (deliver.md): `{artifact}.md` + `{artifact}.audience.md` + `{artifact}.compliance.md` + `STATE.md`
- Type B (export.md): `{artifact}.md` + `{artifact}.audience.md` + `{artifact}.compliance.md` + `{artifact}.{conf}.{ext}` + `STATE.md`

---

### TEXT_MODE / Multi-Runtime Detection (FND-06)
**Source:** `brief/workflows/discover.md` lines 14-19 + `brief/workflows/audience-guard.md` lines 55-61 (Step 0)

**Apply to:** `commands/brief/deliver.md`, `commands/brief/export.md`, `brief/workflows/deliver.md`, `brief/workflows/export.md`

```markdown
## Step 0: TEXT_MODE Detection
Set TEXT_MODE=true if `--text` is present in $ARGUMENTS OR `workflow.text_mode` from init JSON is true.
When TEXT_MODE is active, replace every AskUserQuestion call with a plain-text numbered list and ask
the user to type their choice number.
```

---

### Path-Traversal Guard
**Source:** `brief/bin/lib/audience.cjs` `_canonicalize` + `_resolveSafePath` lines 336-351

**Apply to:** `export.cjs` (Marp invocation MUST canonicalize artifactPath before passing to npx); `voice-fit.cjs` (artifact path read); `leakage-diff.cjs` (folder + sibling enumeration); `deliver.cjs` (template + workstream artifact reads)

---

### Verdict Validation Schema
**Source:** `brief/bin/lib/audience.cjs` `validateVerdict` (lines 59-76) — closed-vocabulary CJS validator

**Apply to:** `export.cjs` consumes audience + compliance verdicts; MUST reuse existing `validateVerdict` from each lib (NO ajv runtime dep).

---

### Frontmatter Schema (5 mandatory + 2 NEW Phase 8 fields)
**Source:** `brief/bin/lib/audience.cjs` `MANDATORY_FRONTMATTER_FIELDS` (line 44) — Phase 5 D-10 schema

**Apply to:** All new templates (Type A 4 + Type B 4), CC-03 hook, deliver.cjs frontmatter composition

5 mandatory fields (Phase 5 D-10 lock + Phase 8 extension):
- `audience.type` (enum: internal / partner / external / public)
- `audience.confidentiality` (enum: internal / confidential / partner / external / public)
- `voice.tone` (added by Phase 8 — currently auto-populated by Phase 5 D-10 audienceDefaults)
- `voice.perspective` (same)
- `business_context.model` (enum: b2b / b2c / b2b2c / enterprise)

NEW Phase 8 additive field:
- `voice.languages` (array — `[ko]`, `[en]`, or `[ko, en]`; A10 verified — frontmatter.cjs handles via `splitInlineArray`)

---

### Frontmatter Round-Trip (nested + arrays)
**Source:** `brief/bin/lib/frontmatter.cjs` (Phase 2 D-20 — `extractFrontmatter`, `stripFrontmatter`, `reconstructFrontmatter`, `splitInlineArray`)

**Apply to:** `deliver.cjs` (Type A frontmatter composition), `export.cjs` (artifact frontmatter read), CC-03 hook (lookup nested + flat-dotted), all templates (Marp directives + voice.languages array)

---

### Business Context Injection
**Source:** `brief/bin/lib/context-inject.cjs` `buildBusinessContext` (Phase 5 D-13/D-14 STABLE API)

**Apply to:** Both Type A/B agent spawns (orchestrator pre-injects `<business_context>` block into prompt), `deliver.cjs` (synthesizes frontmatter from `audienceDefaults`), `export.cjs` (1-step confirm UI uses `language` field for Korean variant rendering)

---

### Recovery-Oriented Error Tone (Phase 4 D-11 + Phase 5 D-12)
**Source:** `brief/bin/lib/audience.cjs` runDeterministicScreen Korean error messages (lines 152-154, 191-192) — block-style with "보완 방법" / next-step hint, NO blame language

**Apply to:** CC-03 hook block messages, export.cjs 3-path interrupt messages, deliver.cjs warning messages (missing workstream → recovery hint)

---

## Anti-Patterns to Avoid (CRITICAL — Phase 8 inheritance flags)

### 5th Canonical Gate (voice-fit-guard / concreteness-guard / ko-culture-guard)
- **DO NOT** add new commands/workflows/agents for voice-fit, concreteness, or Korean honorific checks.
- These live INLINE in agent prompts + as PARALLEL libs (voice-fit.cjs), NOT as new gates.
- CONTEXT.md C-D03 / C-D04 / D-D04 explicit reject. Phase 4·5·7 vocabulary-lock test (`tests/brief-{align,audience,compliance}-vocabulary-lock.test.cjs`) will fail if 4th-instance canonical pattern broken.

### Runtime Dependency Addition
- **DO NOT** add `gray-matter` / `ajv` / `js-yaml` / `@marp-team/marp-cli` to `package.json dependencies`.
- A1 zero-deps VERIFIED (RESEARCH.md A1 line 1486). Use:
  - Inline 30-line CJS validator (CC-03 hook)
  - `frontmatter.cjs` (existing) for structured frontmatter parsing
  - `npx --yes @marp-team/marp-cli@4.3.1` (NOT installed)
  - Pure-CJS `leakage-diff.cjs` for TF-IDF (~150 LOC)

### AUDIENCE/COMPLIANCE Vocabulary Change
- **DO NOT** extend verdict enum, add severity level, or change paired-sibling filename scheme.
- Phase 4·5·7 ban-list tests will fail. Phase 8 RE-USES vocabulary as-is, only escalates policy.

### Force-Accept Without Audit Trail
- **DO NOT** allow force-accept without writing `state.brief.last_gate_results.audience.override` + `override_reason` + `override_at`.
- Phase 4 D-07 lock. The `commitAudienceVerdict(cwd, { override: true, overrideReason })` API enforces this; planner MUST use it from export.cjs (NOT bypass with direct STATE.md write).

### Always-On CC-03 Hook
- **DO NOT** make CC-03 active without `hooks.community: true` opt-in.
- Phase 5 D-06 opt-in pattern is byte-identity inheritance. Override decision deferred to Phase 9 HRD-04 pilot.

### Direct `marp` Invocation Without Env Detect
- **DO NOT** spawn npx marp without first calling `detectBrowser()` (RESEARCH.md Pattern 4 lines 495-514).
- Cryptic puppeteer/Chromium errors confuse non-developer users. Always provide PDF/HTML fallback.

### ko/en Bilingual Default
- **DO NOT** auto-emit both `.ko.md` and `.en.md`. region: kr → ko single emit; en is opt-in via `--en` flag or `voice.languages: [ko, en]` frontmatter.

### voice-fit.cjs Extending audience.cjs
- **DO NOT** import or extend `audience.cjs runDeterministicScreen` from `voice-fit.cjs`. They are SEPARATE concerns:
  - AUDIENCE (Phase 5): audience-fit signal — does the artifact match its declared audience.type?
  - voice-fit (Phase 8): AI-slop signal — does the artifact contain banned-words density > 2/page?
- Sharing regex constants is fine; sharing the runDeterministicScreen function would break vocabulary-lock test.

### Marp Custom Theme via npm Install
- **DO NOT** `npm install <theme-package>`. Marp accepts inline `--theme <css-path>`. Ship CSS files under `brief/templates/deliver/marp-themes/` and pass path.

### Inheritance Bypass — Calling audience.cjs Functions Directly Without commit
- **DO NOT** call `audience.runAudience` and then write directly to STATE.md or paired-sibling files.
- Use `audience.commitAudienceVerdict` which handles atomic state write + paired-sibling render + tmp-verdict cleanup. Same for compliance.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `brief/templates/deliver/marp-themes/default.css` | template (CSS) | file I/O | No prior CSS files in BRIEF; Marp theme system is new. RESEARCH.md "Don't Hand-Roll" recommends plain CSS (~100 LOC each). |
| `brief/templates/deliver/marp-themes/partner.css` | template (CSS) | file I/O | Same — NEW pattern. |
| `brief/templates/deliver/marp-themes/confidential.css` | template (CSS) | file I/O | Same — NEW pattern. |
| `tests/brief-deliver-marp-render-smoke.test.cjs` | test (CI smoke with Chrome) | event-driven | NEW pattern — first test in BRIEF that conditionally requires Chrome/Edge presence. Use `MARP_SMOKE=1` env-var gate (skipped if unset). |

For Marp CSS themes, planner should reference Marp CLI 4 documentation directly (`[CITED: github.com/marp-team/marp-cli — README]`) and follow the Marp theme spec. Aim for ~100 LOC per theme; brand colors variabilized at top.

For the Marp smoke test, planner should follow node:test conditional-skip pattern (`t.skip()` with reason if Chrome detection fails).

---

## Metadata

**Analog search scope:**
- `brief/bin/lib/*.cjs` (37 files)
- `agents/brief-*.md` (24 files)
- `commands/brief/*.md` (66 files)
- `brief/workflows/*.md` (~70 files)
- `hooks/brief-*.{sh,js}` (12 files)
- `brief/references/*.md` (40+ files)
- `brief/templates/**/*` (workstream + project templates)
- `bin/install.js` (hook registration patterns)
- `scripts/build-hooks.js` (HOOKS_TO_COPY array)

**Files scanned:** ~250 files across 8 directories

**Pattern extraction date:** 2026-04-26

**Key insight (composition vs new infrastructure):**
Per RESEARCH.md "Don't Hand-Roll" lines 1075-1076: "Phase 8 is composition + escalation, not new infrastructure. ~80% of the substrate is already shipped from Phases 1·2·4·5·7. The 4 NEW lib files (`deliver.cjs`, `export.cjs`, `voice-fit.cjs`, `leakage-diff.cjs`) total ~800 LOC of new CJS code; the 8 NEW templates + 2 NEW agents + 1 NEW hook + 2 NEW workflows total ~1500 LOC of new prompt/template content. Total NEW code budget ≈ 2300 LOC across 8 atomic commits."

**Pattern coverage breakdown:**
- Exact analog (byte-identity copy with substitution): 18 files (CC-03 hook, install.js mods, all commands/workflows, gate re-execution lib path)
- Role-match analog (composition pattern): 11 files (templates, NEW lib files using context-inject + frontmatter primitives)
- No analog: 4 files (3 Marp CSS themes + 1 Marp smoke test) — planner falls back to RESEARCH.md patterns
