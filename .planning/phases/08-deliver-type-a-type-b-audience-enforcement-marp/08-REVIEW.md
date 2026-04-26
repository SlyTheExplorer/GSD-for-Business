---
phase: 08
status: findings
review_depth: standard
files_reviewed: 22
files_reviewed_list:
  - brief/bin/lib/deliver.cjs
  - brief/bin/lib/voice-fit.cjs
  - brief/bin/lib/leakage-diff.cjs
  - brief/bin/lib/export.cjs
  - brief/bin/brief-tools.cjs
  - brief/bin/lib/state.cjs
  - brief/bin/lib/status.cjs
  - agents/brief-deliver-type-a.md
  - agents/brief-deliver-type-b.md
  - hooks/brief-validate-frontmatter.sh
  - commands/brief/deliver.md
  - commands/brief/export.md
  - brief/workflows/deliver.md
  - brief/workflows/export.md
  - brief/templates/deliver/type-a/product-brief.md
  - brief/templates/deliver/type-a/service-policy.md
  - brief/templates/deliver/type-b/internal-deck.md
  - brief/templates/deliver/type-b/proposal-deck.md
  - brief/templates/deliver/type-b/exec-summary.md
  - brief/references/voice-fit-vocabulary.md
  - brief/references/marp-environment.md
  - bin/install.js
findings:
  blocker: 2
  warning: 5
  info: 6
  total: 13
reviewed_at: 2026-04-26
---

# Phase 08: Code Review Report

**Reviewed:** 2026-04-26
**Depth:** standard
**Status:** findings (2 BLOCKER; 5 WARNING; 6 INFO)

## Summary

Phase 8 ships the DELIVER Type A auto-synthesizer (`deliver.cjs`), Type B agent
(`brief-deliver-type-b`), Marp-driven `/brief-export` 7-step orchestration
(`export.cjs`), voice-fit banned-words density check (`voice-fit.cjs`), cross-
artifact TF-IDF leakage diff (`leakage-diff.cjs`), and the CC-03 PreToolUse-on-
Bash frontmatter validation hook. A1 zero-runtime-deps holds (verified —
`package.json` has no `dependencies` block; only `devDependencies` with c8 /
esbuild / vitest). Marp invocation correctly uses `npx --yes
@marp-team/marp-cli@4.3.1` with `--allow-local-files` NEVER passed (T-08-04
mitigation present in code + agent prompt + workflow). Force-accept routes
through `audience.commitAudienceVerdict({override:true, overrideReason})` —
NO direct STATE.md write from export.cjs. NET +2 user commands
(`/brief-deliver`, `/brief-export`) confirmed via git diff of
`commands/brief/`. NO PostToolUse / SubagentStop hooks reference Phase 8
surfaces (only the new PreToolUse-on-Bash `brief-validate-frontmatter.sh`,
which is opt-in via `config.json hooks.community: true`).

The 2 BLOCKER findings cluster on a single root cause exposed by Plan 01
deliver.cjs meeting Plan 05 templates: **synthesizeTypeA produces output
files with TWO YAML frontmatter blocks** (one freshly composed, then the
original template's frontmatter with literal `{{voice.tone}}` /
`{{business_model}}` / `{{ISO-timestamp}}` placeholders un-substituted).
The shared frontmatter parser then cannot read the FLAT-DOTTED keys
(`audience.type:`) that `reconstructFrontmatter` emits — its key regex
`^[a-zA-Z0-9_-]+:` excludes `.`. Net effect: every `/brief-deliver --type-a`
artifact, when fed to AUDIENCE.runAudience in workflow Step 3A.3, triggers
`{decision: 'DRIFTED-frontmatter', severity: 'blocking'}` because all 3
mandatory fields read as undefined. Lib tests in
`brief-deliver-type-a.test.cjs` use STUBBED templates without frontmatter
(lines 84-129) so the bug is uncaught; the canary E2E test
(`brief-deliver-canary-e2e.test.cjs` Flow 1) verifies file existence and
body-content presence but does NOT call `extractFrontmatter` on the output
or invoke `audience.runAudience`. Reproduction trace included in BR-01
finding below.

The 5 WARNING-level findings are: (1) Plan 06 Type B templates embed
`{{watermark_text}}` placeholder but no workflow step substitutes it before
Marp render — the literal placeholder string would render visibly in the
PPTX cover slide, breaking Layer 2 watermark defense; (2) the `--gate` flag
in `brief-tools export run` is pass-through unvalidated — a typo silently
disables gate execution; (3) `exportArtifact` JSDoc claims "all 3 gates:
ALIGN→AUDIENCE→COMPLIANCE" but the implementation only runs 2 (no ALIGN);
(4) `marp-environment.md` documents a `marp`-on-PATH fallback that
`export.cjs renderMarp` never implements (only `npx` is spawned); and
(5) `voice-fit-vocabulary.md` documents the honorific guard with negative
lookahead `(?![가-힣])` but the actual `HONORIFIC_VIOLATION_KO` constant
in `voice-fit.cjs` uses positive lookahead `(?=[.!?]|$)` per Plan 02
deviation — the doc was not updated.

The 6 INFO items: ARCHITECTURE.md File System Layout block has stale
counts (61 commands / 31 agents / 19 modules vs current 68 / 26 / 42);
unreachable Korean-string branch in deliver.cjs; the `_gate === 'both'`
option is functionally identical to `_gate === null` (cosmetic
redundancy); `extractMarkdownSection` degenerate behavior on
non-#-prefixed headings; `text.split(/\s+/)` page approximation
underestimates Korean prose density; and `✓` symbol use in
`formatConfirmUI` (consistent with Phase 7 IN-06 precedent — outside the
strict-ban scope, but called out for awareness).

## BLOCKER Issues

### BR-01: synthesizeTypeA emits artifacts with TWO frontmatter blocks (template's frontmatter not stripped before concatenation)

**Severity:** BLOCKER
**Files:** `brief/bin/lib/deliver.cjs:199-273`
**Plan affected:** 08-01 + 08-05 (Type A templates ship with frontmatter post-Plan 05; Plan 01 lib tests used unfrontmattered stubs and missed the contract)
**Issue:**
`synthesizeTypeA` reads the template (line 199) and assigns the FULL template content (including its `---...---` frontmatter block) to `body` at line 261. Then placeholder substitution runs over `body` (lines 262-265). Then a NEW frontmatter is composed from `fm` and prepended (line 272: ``const finalContent = `---\n${reconstructFrontmatter(fm)}\n---\n\n${body}`;``).

Net effect: the output file starts with TWO `---` blocks back-to-back. The first is the freshly-composed correct frontmatter; the second is the original template's YAML with literal `{{voice.tone}}`, `{{business_model}}`, `{{ISO-timestamp}}`, `{{project_title}}`, etc. placeholder strings un-substituted.

Reproduction (Korea B2C fixture):
```bash
mkdir -p /tmp/brief-test-fm/.planning/workstreams/business-model-canvas \
         /tmp/brief-test-fm/.planning/workstreams/go-to-market \
         /tmp/brief-test-fm/brief/templates/deliver/type-a
cp brief/templates/deliver/type-a/product-brief.md \
   /tmp/brief-test-fm/brief/templates/deliver/type-a/
echo '{"brief":{"region":"kr","business_model":"b2c","language":"ko"}}' \
   > /tmp/brief-test-fm/.planning/config.json
echo '---' > /tmp/brief-test-fm/.planning/OBJECTIVES.md
echo 'audience.type: internal' >> /tmp/brief-test-fm/.planning/OBJECTIVES.md
echo '---' >> /tmp/brief-test-fm/.planning/OBJECTIVES.md
echo '## Immutable Intent' >> /tmp/brief-test-fm/.planning/OBJECTIVES.md
echo 'mission' >> /tmp/brief-test-fm/.planning/OBJECTIVES.md
# (write minimal canvas.md and go-to-market.md fixtures)
cd /tmp/brief-test-fm && node -e "
const lib = require('PATH_TO_REPO/brief/bin/lib/deliver.cjs');
const r = lib.synthesizeTypeA(process.cwd(), 'product-brief', {});
console.log(require('fs').readFileSync(r.outPath, 'utf-8'));
"
```
First 24 lines of output:
```
---
audience.type: internal
audience.confidentiality: internal
voice.tone: direct
voice.perspective: first-person-plural
business_context.model: b2c
business_context.region: kr
voice.languages: [ko]
---

---
audience.type: internal
audience.confidentiality: internal
voice.tone: {{voice.tone}}
voice.perspective: {{voice.perspective}}
business_context.model: {{business_model}}
business_context.region: {{region}}
voice.languages: {{languages}}
deliverable: product-brief
generated_by: brief-deliver-type-a
generated_at: {{ISO-timestamp}}
---

# PRODUCT-BRIEF — {{project_title}}
```

Why uncaught:
- `tests/brief-deliver-type-a.test.cjs` uses STUBBED templates (lines 84-129) that have NO YAML frontmatter — only `# Title\n## Section\n<!-- INSERT: ... -->`. Synthesizing against unfrontmattered templates produces a single (correct) frontmatter block.
- Test 3/Test 9 in `brief-deliver-type-a-templates.test.cjs` (lines 71-89, 162-176) check that the TEMPLATE files themselves have frontmatter, NOT that the synthesized output has exactly one frontmatter block.
- `brief-deliver-canary-e2e.test.cjs` Flow 1 (lines 172-197) does `assert.match(body, /^---/)` and `assert.match(body, /audience\.type:\s*internal/)` — both match the FIRST `---` block and the duplicated `audience.type:` key (which appears in BOTH blocks), so the test passes despite the bug.

**Fix:** Strip the template's frontmatter before INSERT-fill + concatenation. One-line change at line 261:
```javascript
// Fill template by replacing each `<!-- INSERT: {section} -->` placeholder.
let body = stripFrontmatter(template);   // <-- was: `let body = template;`
for (const [section, content] of Object.entries(sectionContent)) {
  const placeholder = `<!-- INSERT: ${section} -->`;
  body = body.split(placeholder).join(content);
}
```

Add a regression test that asserts the synthesized output has EXACTLY ONE leading `---...---` frontmatter block:
```javascript
const matches = content.match(/^---\r?\n[\s\S]+?\r?\n---/g) || [];
assert.equal(content.split(/^---\s*$/m).filter(s => s.trim().startsWith('audience')).length, 1,
  'synthesized output must have exactly one frontmatter block (no template-frontmatter leak)');
```

Also recommended: extend the canary E2E (`brief-deliver-canary-e2e.test.cjs` Flow 1) to call `extractFrontmatter(synthesizedContent)` and assert non-empty, AND call `audience.runAudience(cwd, {artifact: synthesizedPath})` and assert `severity !== 'blocking'`. This is what would have caught BR-01 + BR-02 together at canary time.

---

### BR-02: deliver.cjs emits flat-dotted frontmatter keys that the BRIEF frontmatter parser CANNOT parse → all Type A artifacts trigger AUDIENCE BLOCKING in production

**Severity:** BLOCKER
**Files:** `brief/bin/lib/deliver.cjs:241-258`, downstream `brief/bin/lib/audience.cjs:128-166` (Phase 5 inheritance — flagged here because Phase 8 is the FIRST consumer to exercise this incompatibility in production)
**Plan affected:** 08-01 (cross-plan contract failure with Phase 5 audience.cjs substrate)
**Issue:**
The `fm` object built in lines 241-258 uses FLAT-DOTTED keys (e.g., `'audience.type': 'internal'`, `'audience.confidentiality': 'internal'`). When passed to `reconstructFrontmatter(fm)`, these emit YAML lines like `audience.type: internal\naudience.confidentiality: internal\n...`.

The shared parser at `brief/bin/lib/frontmatter.cjs:88` uses key regex `^(\s*)([a-zA-Z0-9_-]+):` — `.` is NOT in the character class. So lines like `audience.type: internal` fail the keyMatch test. The parser silently skips them, returning `{}` for any artifact that uses the flat-dotted form for `audience.*` / `voice.*` / `business_context.*`.

Then `audience.runAudience` (audience.cjs:128) reads the artifact frontmatter via `extractFrontmatter`, calls `getFrontmatterField(fm, 'audience.type')` (audience.cjs:49-57 — only walks NESTED objects via `.split('.')`), gets undefined for all 3 mandatory fields, and emits the BLOCKING-severity DRIFTED-frontmatter verdict.

Reproduction (using the artifact from BR-01 reproduction):
```bash
cd /tmp/brief-test-fm && node -e "
const audience = require('PATH_TO_REPO/brief/bin/lib/audience.cjs');
const result = audience.runAudience(process.cwd(), {
  artifact: '.planning/deliverables/type-a/product-brief.md',
  baseline: '.planning/OBJECTIVES.md',
});
console.log(JSON.stringify(result, null, 2));
"
```
Output:
```json
{
  "decision": "DRIFTED-frontmatter",
  "severity": "blocking",
  "findings_count": 1,
  "findings": [{
    "severity": "blocking",
    "location": "product-brief.md:frontmatter",
    "description": "필수 frontmatter 항목 누락 또는 잘못된 값: audience.type, audience.confidentiality, business_context.model"
  }],
  "rationale": "Artifact frontmatter schema incomplete (deterministic)"
}
```

Production impact: every artifact emitted by `/brief-deliver --type-a` would, in workflow Step 3A.3 (AUDIENCE inline gate), get a BLOCKING verdict and route through the audience-guard.md 3-path interrupt. Either the user force-accepts on every artifact (audit-trail noise; defeats Phase 5 audience defense), or no Type A artifact ever passes — `/brief-deliver --type-a` becomes unusable end-to-end.

NOTE on scope: the parser limitation is a pre-existing Phase 5 substrate issue, NOT a Phase 8 NEW bug per se. But Phase 8 is the FIRST phase whose lib (deliver.cjs) actively produces flat-dotted output. Plan 04 export.cjs has its OWN inline raw-fallback for reading `audience.confidentiality` (export.cjs:372-373), and Plan 03 leakage-diff.cjs has `readConfidentiality` (lines 66-84) — both work around the parser limitation. But neither audience.cjs nor compliance.cjs has a flat-dotted fallback. Phase 8 should produce frontmatter the entire stack can read.

**Fix (lowest-blast-radius — Phase 8-scoped):** restructure the `fm` object in deliver.cjs to use NESTED form, matching how Phase 5 templates and the Phase 5 audience.cjs reader expect it. Replace lines 241-258 with:
```javascript
const fm = {
  audience: {
    type: 'internal',
    confidentiality: 'internal',
  },
  voice: {
    tone: ctx.audienceDefaults['voice.tone'],
    perspective: ctx.audienceDefaults['voice.perspective'],
  },
  business_context: {
    model: ctx.business_model || 'b2b',
    region: ctx.region || '',
  },
};
// voice.languages derivation (unchanged semantics)
if (opts.en || ctx.language === 'en') fm.voice.languages = ['en'];
if (ctx.language === 'ko') fm.voice.languages = opts.en ? ['ko', 'en'] : ['ko'];
```

In parallel, ALL 4 Type A templates AND the 4 Type B templates need their YAML frontmatter restructured to nested form to be readable by AUDIENCE / COMPLIANCE downstream. Example for `product-brief.md`:
```yaml
---
audience:
  type: internal
  confidentiality: internal
voice:
  tone: {{voice.tone}}
  perspective: {{voice.perspective}}
  languages: {{languages}}
business_context:
  model: {{business_model}}
  region: {{region}}
deliverable: product-brief
generated_by: brief-deliver-type-a
generated_at: {{ISO-timestamp}}
---
```

Verify with the same `audience.runAudience` reproduction call — after fix, `severity` should be `nice-to-have` or `material` (not `blocking`), `decision` should NOT be `DRIFTED-frontmatter`.

Add a canary regression test in `brief-deliver-canary-e2e.test.cjs` Flow 1 that calls `audience.runAudience` on the synthesized artifact and asserts `severity !== 'blocking'`. This single assertion would have caught both BR-01 and BR-02.

ALTERNATIVE fix path (out of Phase 8 scope, larger blast radius): extend `extractFrontmatter` to surface flat-dotted keys, OR extend `getFrontmatterField` in audience.cjs / compliance.cjs to fall back to flat-dotted lookup. Both touch Phase 5 substrate and would need coordinated regression tests on Phase 4·5·7 inheritance.

## WARNING Issues

### WR-01: Plan 06 Type B templates embed `{{watermark_text}}` placeholder; no workflow step substitutes it before Marp render → literal placeholder visible in rendered PPTX cover slide

**Severity:** WARNING
**Files:** `brief/templates/deliver/type-b/internal-deck.md:15,21`, `brief/templates/deliver/type-b/proposal-deck.md:15,21`, `agents/brief-deliver-type-b.md:128-132`, `brief/workflows/deliver.md` (no substitution step), `brief/bin/lib/export.cjs:536` (uses `watermarkFor` for UI display only)
**Plan affected:** Plan 04 (watermarkFor producer) ↔ Plan 06 (template consumer) ↔ Plan 08 (workflow wiring) cross-plan contract
**Issue:**
Plan 06 Type B deck templates embed the literal placeholder string `{{watermark_text}}` in TWO load-bearing locations:
- frontmatter `footer: '{{watermark_text}}'` (Marp footer directive)
- Cover slide `> **{{watermark_text}}**` (Layer 2 watermark — survives copy-paste even if footer directive is stripped, per agent prompt line 119)

The agent prompt at `agents/brief-deliver-type-b.md:113` says:
> Plan 08 workflow (deliver.md) fills `{{watermark_text}}` via `watermarkFor(audience.confidentiality, language)` from Plan 04 export.cjs WATERMARKS_EN/WATERMARKS_KO mapping at template-fill time

But `brief/workflows/deliver.md` Step 3B (Type B path) has NO step that substitutes `{{watermark_text}}`. Steps 3B.1 (build context) → 3B.2 (spawn agent) → 3B.3 (voice-fit) → 3B.4 (gates) → 3B.5 (commit). Nor does `brief/bin/lib/export.cjs` perform substitution: line 536 calls `watermarkFor(conf, language)` only to populate `formatConfirmUI`'s 1-step confirm DISPLAY (line 547) — it never writes the resolved text into the artifact source markdown.

The agent's Step 3 (line 132) instructs the agent to "emit Marp frontmatter ... and Cover slide literal `> **{{watermark_text}}**`" — verbatim, with the placeholder string un-substituted. Step 2 (line 128-129) determines watermark_text but the agent is never told to USE it for substitution.

When `/brief-export` then invokes `npx --yes @marp-team/marp-cli@4.3.1` on the deck source, Marp renders the markdown as-is — the rendered PPTX cover slide displays `**{{watermark_text}}**` as quoted bold text (LITERAL), and the footer shows `{{watermark_text}}`. Layer 2 watermark defense is broken.

Why uncaught: the canary fixtures at `tests/fixtures/deliver/intentional-leak-pair/internal-deck.md` and the parallel pair do NOT contain `{{watermark_text}}` placeholders — they were authored with pre-resolved or absent watermark text, so the canary E2E (`brief-deliver-canary-e2e.test.cjs` Flow 2 line 226-227) tests `watermarkFor(...)` returns the right string in isolation, but never tests the agent → workflow → render substitution path end-to-end.

**Fix (one of):**
1. **Workflow-side substitution (preferred — keeps the agent contract simple):** Add a workflow step in `brief/workflows/deliver.md` Step 3B (between 3B.2 spawn and 3B.3 voice-fit) that reads the agent-emitted artifact, computes `watermarkFor(conf, language)` via a shell one-liner, and rewrites `{{watermark_text}}` occurrences to the resolved value. Use the dispatcher pattern that mirrors how voice-fit.cjs is invoked:
   ```bash
   node -e "
     const fs = require('fs');
     const { watermarkFor } = require('./brief/bin/lib/export.cjs');
     const { extractFrontmatter, stripFrontmatter } = require('./brief/bin/lib/frontmatter.cjs');
     const { buildBusinessContext } = require('./brief/bin/lib/context-inject.cjs');
     const path = '$OUT_PATH';
     const content = fs.readFileSync(path, 'utf-8');
     const fm = extractFrontmatter(content) || {};
     const conf = (fm.audience && fm.audience.confidentiality) || fm['audience.confidentiality'] || 'internal';
     const lang = buildBusinessContext({cwd: process.cwd()}).language || 'en';
     const wm = watermarkFor(conf, lang);
     fs.writeFileSync(path, content.split('{{watermark_text}}').join(wm));
   "
   ```
2. **Agent-side substitution (alternative):** Update `agents/brief-deliver-type-b.md` Step 3 (line 132) to instruct the agent: "embed the RESOLVED watermark text (computed in Step 2) directly — do NOT emit the literal placeholder string". Update the deck templates (internal-deck.md / proposal-deck.md) to use a different marker (e.g., `<!-- WATERMARK -->` HTML comment) so the agent has clearer signal that this is a "fill in" location, not a verbatim emit.

Recommend approach 1 (workflow-side) because it keeps Plan 04's `watermarkFor` as the single source-of-truth for watermark text without depending on agent-fill discipline.

Add an end-to-end test:
```javascript
test('Type B deck source has no {{watermark_text}} after deliver workflow Step 3B', () => {
  // setup: spawn the agent (or mock its output with the template), run the workflow substitution step
  // assert: !content.includes('{{watermark_text}}')
});
```

---

### WR-02: `brief-tools export run --gate <value>` does not validate against the closed enum {audience, compliance, both} — typo silently disables both gates

**Severity:** WARNING
**Files:** `brief/bin/brief-tools.cjs:785-786, 804`, `brief/bin/lib/export.cjs:228, 363, 388, 466`
**Plan affected:** 08-08 dispatcher Task 3 + 08-04 export.cjs `_gate` parameter contract
**Issue:**
The dispatcher passes `--gate <value>` straight through to `exportArtifact({_gate: expGate})` without enum validation:
```javascript
const expGateIdx = args.indexOf('--gate');
const expGate = expGateIdx !== -1 ? args[expGateIdx + 1] : null;
// ...
const result = exportLib.exportArtifact(cwd, expArtifactPath, {
  format: expFormat, theme: expTheme, allowFallback: true, askUser,
  _gate: expGate,           // <-- unvalidated
  _forceAcceptOverrideReason: expOverrideReason,
});
```

Inside `exportArtifact`, the gate gating is exclusive-match against the enum:
```javascript
// AUDIENCE branch (line 388):
if (!_gate || _gate === 'audience' || _gate === 'both') { ... }
// COMPLIANCE branch (line 466):
if (!_gate || _gate === 'compliance' || _gate === 'both') { ... }
```

If the user types `--gate audiece` (typo), `_gate` is the truthy string `'audiece'`. Both branches evaluate `!_gate || _gate === 'audience' || _gate === 'both'` → `false || false || false` → **NEITHER gate runs**. `audienceVerdict` and `complianceVerdict` stay `null`, the function proceeds to Step 4 (confirm UI) and Step 6 (Marp render) without ever evaluating either gate.

This is a SILENT BYPASS of the gate stack. The render still produces a PPTX/PDF/HTML output. Status output indicates `0 findings` for both gates because the `formatConfirmUI` handles null verdicts by defaulting to `'AUDIENCE-OK' / 'COMPLIANCE-OK'` (export.cjs:291-292).

**Fix:** Validate `--gate` against the closed enum at dispatcher entry. Reject unknown values with a clear error:
```javascript
const VALID_EXPORT_GATES = new Set(['audience', 'compliance', 'both']);
const expGateIdx = args.indexOf('--gate');
const expGate = expGateIdx !== -1 ? args[expGateIdx + 1] : null;
if (expGate !== null && !VALID_EXPORT_GATES.has(expGate)) {
  error(`export run: --gate must be one of ${[...VALID_EXPORT_GATES].join(' | ')} (got: '${expGate}')`);
  break;
}
```

Add a structural test in `tests/brief-export-confirm.test.cjs` (or sibling) that asserts `brief-tools export run --gate xyz --artifact <path>` exits non-zero with the expected error message.

---

### WR-03: `exportArtifact` JSDoc claims `_gate` default null = "all 3 gates: ALIGN→AUDIENCE→COMPLIANCE"; implementation only runs 2 (no ALIGN)

**Severity:** WARNING
**Files:** `brief/bin/lib/export.cjs:349`, code path lines 388-461 (AUDIENCE) + lines 466-528 (COMPLIANCE)
**Plan affected:** Plan 08-04 documentation drift
**Issue:**
The JSDoc on the `_gate` parameter reads:
> `[options._gate=null]` DEV-MODE ESCAPE. When set to `'audience' | 'compliance' | 'both'` (default null = run all 3 gates: ALIGN→AUDIENCE→COMPLIANCE per RESEARCH.md Open Questions §1 RESOLVED), restricts which gate(s) run.

But the actual `exportArtifact` body has only TWO gate sections:
- Step 2 (lines 388-461) — AUDIENCE re-run
- Step 3 (lines 466-528) — COMPLIANCE re-run

ALIGN is NOT invoked in `exportArtifact`. This is correct behavior — `/brief-export` is the Type B export step which re-runs only AUDIENCE + COMPLIANCE; ALIGN runs at synthesis time (workflow Step 3A.3 / 3B.4) and is not re-evaluated for export. But the JSDoc claim of "all 3 gates" is wrong.

**Fix:** Update JSDoc to accurately reflect the 2-gate scope:
```javascript
/**
 * @param {string|null} [options._gate=null] DEV-MODE ESCAPE. When set to
 *   'audience' | 'compliance' | 'both' (default null = run BOTH AUDIENCE and
 *   COMPLIANCE gates), restricts which gate(s) run. Used by `brief-tools
 *   export run --gate <name>` for targeted CLI testing. Production workflow
 *   leaves this undefined → both gates run sequentially per Phase 7 D-02
 *   fail-fast on AUDIENCE blocking. ALIGN is NOT re-evaluated at export time
 *   (it runs at synthesis in workflows/deliver.md Step 3A.3 / 3B.4).
 */
```

Subordinate concern: the option enum includes `'both'` which is functionally identical to `null` (both produce "run both gates"). See IN-05.

---

### WR-04: `brief/references/marp-environment.md` documents a `marp`-on-PATH fallback that `export.cjs renderMarp` does NOT implement

**Severity:** WARNING
**Files:** `brief/references/marp-environment.md:75-76`, `brief/bin/lib/export.cjs:189-201`
**Plan affected:** Plan 07 reference doc ↔ Plan 04 implementation drift
**Issue:**
`marp-environment.md` lines 71-76 says:
```
Some enterprise environments block `npx` network calls (egress firewall, npm
registry allow-listing, etc.). Workaround:
    npm install -g @marp-team/marp-cli@4.3.1
Then `/brief-export` falls back to invoking `marp` directly from PATH instead
of `npx`. The CLI on PATH is detected first; npx is only used as the second-
choice path.
```

This is a contract claim that the reference doc makes to the user. But `renderMarp` in `brief/bin/lib/export.cjs` lines 189-201 only ever spawns `npx`:
```javascript
const args = ['--yes', '@marp-team/marp-cli@4.3.1', inputMd, '-o', outputPath];
// ...
const result = _spawnSync('npx', args, { ... });
```

There is no code path that probes PATH for a globally-installed `marp` binary, no detection step, no fallback dispatch. Users in enterprise environments who follow the doc's `npm install -g` instruction would still hit the `npx` egress block — the documented workaround does not work as advertised.

**Fix (one of):**
1. **Doc-side fix (smaller blast radius — recommended for v1):** Update `marp-environment.md:75-76` to remove the false claim:
   ```
   Some enterprise environments block `npx` network calls. Workaround:
       npm install -g @marp-team/marp-cli@4.3.1
   Then pre-warm the npx cache by running once (puppeteer-core download is
   the slow part, not the marp-cli download):
       npx --yes @marp-team/marp-cli@4.3.1 --version
   /brief-export uses `npx` exclusively; the global install does NOT change
   the spawn path but DOES populate the npm cache so subsequent npx calls
   resolve without registry hits.
   ```
2. **Code-side fix (matches the documented contract):** Add a PATH probe in `renderMarp` that prefers a globally-installed `marp` over `npx`:
   ```javascript
   function _detectGlobalMarp() {
     const probe = realSpawnSync('which', ['marp'], { encoding: 'utf-8' });
     return probe.status === 0 && probe.stdout.trim() ? probe.stdout.trim() : null;
   }
   const globalMarp = _detectGlobalMarp();
   const cmd = globalMarp ? globalMarp : 'npx';
   const args = globalMarp ? [inputMd, '-o', outputPath] : ['--yes', '@marp-team/marp-cli@4.3.1', inputMd, '-o', outputPath];
   ```

Approach 1 is preferred because it preserves the existing 1-codepath simplicity.

---

### WR-05: `voice-fit-vocabulary.md` documents `HONORIFIC_VIOLATION_KO` regex with negative lookahead `(?![가-힣])`; actual `voice-fit.cjs` constant uses positive lookahead `(?=[.!?]|$)` per Plan 02 deviation

**Severity:** WARNING
**Files:** `brief/references/voice-fit-vocabulary.md:48-51`, `brief/bin/lib/voice-fit.cjs:54`
**Plan affected:** Plan 02 honorific guard regex documentation drift
**Issue:**
`brief/references/voice-fit-vocabulary.md` lines 48-51 documents the honorific check as:
> Boundary semantics: regex uses negative lookahead `(?![가-힣])` (Hangul is not
> in JavaScript's `\w` class so `\b` is a no-op for Korean text). The lookahead
> correctly suppresses noun + particle forms (e.g. 아버지가, 아버지는, 아버지를)
> where the suffix is followed by another Hangul.

But the actual constant in `voice-fit.cjs:54`:
```javascript
const HONORIFIC_VIOLATION_KO = /(?:[가-힣])(야|지|라구요|거든요|는데요)(?=[.!?]|$)/g;
```
uses POSITIVE lookahead `(?=[.!?]|$)` — requiring sentence-terminating punctuation OR end-of-string AFTER the suffix. The voice-fit.cjs comment block on lines 35-54 explains this deviation:
> Plan 08-02 Rule 1 deviation: original spec used `\b` boundary which is a no-op for Hangul; tightened to sentence-final lookahead during GREEN implementation when the Korean exemplar text exposed the false positive.

The deviation was correct (positive lookahead `(?=[.!?]|$)` is more conservative and avoids false positives on noun+particle Hangul sequences like 아버지가). But the reference doc was not updated to match. A planner extending the ban list per the reference doc would be misled about the regex semantics.

**Fix:** Update `brief/references/voice-fit-vocabulary.md` lines 47-55 to match the actual regex:
```markdown
Boundary semantics: regex uses positive lookahead `(?=[.!?]|$)` requiring
the matched suffix to be IMMEDIATELY followed by sentence-terminating
punctuation (`.`, `!`, `?`) or end-of-string. This is the most reliable
proxy for "sentence-final 반말" without morphological analysis. Hangul is
not in JavaScript's `\w` class so `\b` is a no-op; the positive lookahead
on terminator punctuation is what enforces sentence-final scoping.

False-positive suppression:
- Particles (까지, 부터, 마저) mid-sentence: NOT matched (no terminator).
- Noun + particle forms (아버지가, 아버지는, 아버지를): NOT matched
  (the 지 suffix is followed by another Hangul particle, not a terminator).
- Edge case: a noun sentence-final without a particle (편지.) still
  false-positives — grammatically rare in natural Korean prose.

This regex was tightened from `\b` (the original Plan 02 spec) to
`(?=[.!?]|$)` during Plan 02 GREEN implementation to handle Hangul
boundary semantics correctly.
```

## INFO Items

### IN-01: ARCHITECTURE.md File System Layout block has stale counts (61 commands / 31 agents / 19 modules)

**Severity:** INFO
**Files:** `docs/ARCHITECTURE.md:426, 429, 433`
**Plan affected:** 08-08 Task 4 (count-bump scope)
**Issue:**
The "Installation Files" code-block at lines 423-440 cites:
- `commands/brief/*.md             # 61 slash commands` — actual count (post-Phase 8): 68
- `bin/lib/*.cjs               # 19 domain modules` — actual: 42 .cjs files (or "23 domain modules" if Phase 8-aware: 19 inherited + 4 NEW)
- `agents/*.md                     # 31 agent definitions` — actual: 26

The summary block at line 228 correctly says "23 domain modules (19 inherited + 4 NEW Phase 8 lib modules)". But the Installation Files block at lines 426-433 was not updated.

**Fix:** Update the inline counts in the Installation Files diagram to match actuals:
```
├── commands/brief/*.md             # 68 slash commands (NET +2 in Phase 8: /brief-deliver, /brief-export)
├── brief/
│   ├── bin/brief-tools.cjs           # CLI utility
│   ├── bin/lib/*.cjs               # 23 domain modules (19 inherited + 4 NEW Phase 8)
│   ├── workflows/*.md              # 70 workflow definitions
│   ├── references/*.md             # 43 shared reference docs
│   └── templates/                  # Planning artifact templates (incl. deliver/type-a, type-b, marp-themes)
├── agents/*.md                     # 26 agent definitions (NET +2 in Phase 8: brief-deliver-type-a, brief-deliver-type-b)
```

The `# 61 slash commands` etc. counts predate Phase 8. Phase 9 HRD-02 will reduce to ≤12 user-facing per the surface cap; until then, accurate counts help reviewers track drift.

---

### IN-02: deliver.cjs `extractMarkdownSection` degenerate behavior on non-`#`-prefixed headings

**Severity:** INFO
**File:** `brief/bin/lib/deliver.cjs:282-297`
**Plan affected:** 08-01
**Issue:**
The function computes `headingLevel = (heading.match(/^#+/) || [''])[0].length` (line 288). If `heading` does NOT start with `#` (e.g., the caller passes `'Customer Segments'` without `'## '` prefix), the match falls back to `['']`, yielding `headingLevel === 0`. Then line 291's predicate `m && m[1].length <= 0` is always false (any matched heading line has at least 1 `#`), so `endIdx === -1` and the function returns the body from `startIdx + 1` to end-of-document.

In practice this never triggers because all `SYNTHESIS_MAP[].sources[].sections` entries start with `## ` (verified at lines 76-81, 92-96, 104-115, 124-130). But future maintainers extending SYNTHESIS_MAP with a non-`#` heading would silently get end-of-document body capture.

**Fix:** Add a defensive check at the top:
```javascript
function extractMarkdownSection(body, heading) {
  if (!heading.startsWith('#')) {
    throw new Error(`extractMarkdownSection: heading must start with '#' (got: '${heading}')`);
  }
  // ... rest unchanged
}
```

Or document the precondition in the JSDoc:
```javascript
// Precondition: `heading` MUST start with one or more `#` characters.
// SYNTHESIS_MAP entries should always be `## Section Name` form.
```

---

### IN-03: `_gate === 'both'` is functionally identical to `_gate === null` (cosmetic redundancy)

**Severity:** INFO
**Files:** `brief/bin/lib/export.cjs:228, 230-231, 388, 466`
**Plan affected:** 08-04 dispatcher option enum
**Issue:**
Looking at the gate dispatch:
```javascript
const runAudience = !gateFilter || gateFilter === 'audience' || gateFilter === 'both';
const runComplianceGate = !gateFilter || gateFilter === 'compliance' || gateFilter === 'both';
```
If `gateFilter === null`: both `runAudience` and `runComplianceGate` evaluate true → both run.
If `gateFilter === 'both'`: both branches evaluate true → both run.

Same outcome. The `--gate both` CLI option is a no-op compared to omitting `--gate`.

**Fix:** Either remove `'both'` from the documented enum (in the JSDoc on line 349 — call out that `--gate` accepts `'audience' | 'compliance'` or omit-for-all-gates), OR keep `'both'` for explicit-intent readability and document it as a synonym for the default. WR-03 fix already touches this JSDoc; combine the cleanup.

---

### IN-04: `voice-fit.cjs` `text.split(/\s+/)` page count approximation underestimates Korean prose density

**Severity:** INFO
**File:** `brief/bin/lib/voice-fit.cjs:70`
**Plan affected:** 08-02 banned-words density heuristic
**Issue:**
Korean text has spacing between phrases (eojeol), but Korean eojeol are denser than English words: a single eojeol typically packs 2-4 morphemes (noun + particle + verb stem). The 250-words/page approximation derived for English would yield ~150-200 eojeol/page in equivalent Korean prose density. Using English-page math on Korean text underestimates `pages`, OVER-estimating density and potentially false-tripping the threshold.

In practice the threshold is set at `density > 2` (line 88), which is fairly permissive for both languages, so the false-trip risk is low. Documenting for future tuning per Phase 9 HRD-04 pilot data.

**Fix:** Optional refinement — branch the page divisor on `options.isKorean`:
```javascript
const wordsPerPage = opts.isKorean ? 175 : 250;  // Korean eojeol density
const pages = Math.max(1, Math.ceil(wordCount / wordsPerPage));
```

OR document the approximation limit in the function header so future tuners know to revisit. Current 250 ÷ all-language is a reasonable v1 default.

---

### IN-05: `brief/templates/deliver/type-b/internal-deck.md` and `proposal-deck.md` use `voice.tone: formal` AS LITERAL STRING in frontmatter (not as `{{voice.tone}}` placeholder)

**Severity:** INFO
**Files:** `brief/templates/deliver/type-b/internal-deck.md:4-5`, `brief/templates/deliver/type-b/proposal-deck.md:4-5`, `brief/templates/deliver/type-b/exec-summary.md:4-5`, `brief/templates/deliver/type-b/decision-memo.md:4-5`
**Plan affected:** Plan 06 templates inconsistent with Plan 05 templates
**Issue:**
Compare the 4 Type B templates' frontmatter shape to the 4 Type A templates:
- Type A (e.g., `product-brief.md:4-5`): `voice.tone: {{voice.tone}}\nvoice.perspective: {{voice.perspective}}` — placeholder style.
- Type B (e.g., `internal-deck.md:4-5`): `voice.tone: formal\nvoice.perspective: first-person-plural` — hard-coded literal style.

For Type A, the synthesizer (`deliver.cjs:244-245`) reads `ctx.audienceDefaults['voice.tone']` from `deriveAudienceDefaults(business_model)` so the deck adapts to b2b/b2c/enterprise. For Type B, the agent is supposed to fill the frontmatter (Plan 06 contract) but the templates pre-bake `formal` regardless of business_model.

For internal-deck and proposal-deck this is mostly fine (formal/first-person-plural is appropriate for enterprise + executive audiences). But the frontmatter NEVER reflects the planner's b2c context, so a B2C founder using `/brief-deliver --type-b internal-deck` would still get `voice.tone: formal` (whereas Type A `product-brief.md` would adapt to `voice.tone: direct` for b2c).

This may be intentional (per Plan 06 D-D04 — Korean honorific 격식체 is required for external audiences regardless of business_model). Calling out for consistency review.

**Fix (none required for v1):** Document the Type A vs Type B frontmatter-fill contract divergence in `brief/templates/deliver/README.md` or the Plan 06 design block. If consistency with Type A is desired, swap the literals for `{{voice.tone}}` placeholders + add a workflow substitution step (similar to WR-01 watermark fill).

---

### IN-06: `brief/bin/lib/export.cjs:294-296` uses `✓` symbol in `formatConfirmUI` user-visible UI display

**Severity:** INFO
**Files:** `brief/bin/lib/export.cjs:294-296`, also `brief/workflows/export.md:139-140, 160-161`, `brief/workflows/deliver.md:120, 123`
**Plan affected:** Phase 7 IN-06 inheritance — symbol scope policy
**Issue:**
The `✓` and `✅` symbols appear in:
- `export.cjs:294-296` — the `audMark` / `compMark` / `leakMark` variables in `formatConfirmUI` (user-visible 1-step confirm UI)
- `workflows/export.md:139-140, 160-161` — confirm UI templates
- `workflows/deliver.md:120, 123` — `✅ Type A synthesized` status line

Per Phase 7 IN-06 precedent: the strict symbol-ban scope is `compliance.cjs / compliance-report.cjs / brief-compliance-checker.md / brief/workflows/compliance.md` (the COMPLIANCE-specific quartet). Outside that strict scope, `✅` and `✓` are permitted (the broader workflow corpus already uses them — `discover.md:399`, `complete-milestone.md:430,444,478`, `autonomous.md:406,425,632`).

The Phase 8 NEW deliver/export workflows fall outside the strict scope, so this matches existing precedent. The vocabulary-lock test (`tests/brief-deliver-vocabulary-lock.test.cjs`) asserts no banned VOCABULARY in narrative content but does NOT assert no banned SYMBOLS in the `formatConfirmUI` UI display path (it has a defined `assertNoBannedSymbols` helper at line 133-140 that is never called on Phase 8 source).

**Fix:** None required — matches Phase 7 IN-06 precedent. Optional v2 cleanup: replace `✓` with `▶` or `OK` in the confirm UI for symmetry with the COMPLIANCE workflow strict-ban policy. Defer.

---

_Reviewed: 2026-04-26_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

## REVIEW COMPLETE
