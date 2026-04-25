# Phase 7: DESIGN — Workstream Orchestration + COMPLIANCE Checker — Pattern Map

**Mapped:** 2026-04-25
**Files analyzed:** 28 NEW + 4 MODIFIED + 28 NEW test files = 60 files
**Analogs found:** 60 / 60 (every NEW file has a stable canonical analog because Phase 7 is the FOURTH instance of the canonical gate pattern + a clean extension of Phase 2 workstream-as-config infrastructure)

This is a literal copy-rename phase wherever the canonical gate pattern (third instance), the workstream-as-config infrastructure (Phase 2 D-13 extension), and the orchestrator+workflow split (Phase 2 D-18) apply. Treat any deviation from the analog as a load-bearing decision; the only canonical-pattern deviation is Phase 7 D-01 + the merge rule preserving a distinct `FINDINGS-MATERIAL` verdict (Phase 4/5 collapse material+nice-to-have into ALIGNED/AUDIENCE-OK; Phase 7 must NOT — see CONTEXT.md `### Merge rule (mergeVerdicts copy-pattern from audience.cjs)`).

## File Classification

### NEW Files

| New File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `agents/brief-compliance-checker.md` | gate-agent | request-response (Task spawn → JSON verdict) | `agents/brief-audience-guard.md` | exact (literal copy-rename) |
| `brief/workflows/compliance.md` | gate-workflow | event-driven (orchestrator → deterministic screen → optional Task → 3-path interrupt) | `brief/workflows/audience-guard.md` | exact (literal copy-rename) |
| `brief/bin/lib/compliance.cjs` | gate-lib | request-response (workflow → exported functions → state write) | `brief/bin/lib/audience.cjs` | exact (literal copy-rename) |
| `brief/bin/lib/compliance-report.cjs` | gate-report-renderer | transform (verdict object → rendered markdown) | `brief/bin/lib/audience-report.cjs` | exact (literal copy-rename) |
| `brief/references/compliance-vocabulary.md` | vocabulary-reference | static-data (loaded by agent + ban-list-grep tests) | `brief/references/audience-vocabulary.md` | exact (literal copy-rename + extensions) |
| `commands/brief/design.md` | command-shell | request-response (slash dispatch → workflow load) | `commands/brief/discover.md` | exact (Phase 2 D-18 split — minimal command markdown that loads workflow) |
| `brief/workflows/design.md` | orchestrator-workflow | event-driven (workstream selection → Task spawn → sequential 3-gate → handoff) | `brief/workflows/discover.md` (Step 0/0.5/3/5/6/7 pattern) + `brief/workflows/audience-guard.md` (Step 3/4/5/6 routing) | exact for orchestration shape; per-step adaptations |
| `commands/brief/add-workstream.md` | command-shell | request-response (slash dispatch → workflow load) | `commands/brief/define.md` | exact (Phase 2 D-18 split) |
| `brief/workflows/add-workstream.md` | utility-workflow | request-response (Q&A 4-6 turns → 3-file atomic skeleton write) | `brief/workflows/define.md` Mode A (Step 1 free-text + Step 2A.1-2A.7 question chain → atomic write) | role-match (Q&A then atomic write); analog also informs `brief-tools commit --files` 3-file atomic write |
| `agents/brief-workstream-designer.md` (OPTIONAL — see Discretion) | parameterized-agent | request-response (Task spawn with `{slug}/design-prompts.md` injected) | `agents/brief-domain-researcher.md` (Phase 5 D-01 parameterized agent) | role-match — only used IF planner adopts parameterized-agent path; CONTEXT D-09/D-13 default is direct Task spawn from `design.md` workflow loading workstream's `design-prompts.md` content (no separate agent file) |
| `brief/workstreams/business-model-canvas/spec.yaml` | workstream-spec | static-data (loaded by `workstream-loader.cjs`) | `brief/workstreams/_example/spec.yaml` | role-match (extends with `gates_required` + `depends_on` per D-13) |
| `brief/workstreams/business-model-canvas/design-prompts.md` | workstream-design-prompts | static-prompt-data (loaded at Task spawn) | `agents/brief-domain-researcher.md` `<process>` body (Phase 5 D-15 conditional B2B/B2C prose) | role-match — extracts the parameterized prompt body to a per-workstream file |
| `brief/workstreams/business-model-canvas/templates/artifact.md` | workstream-artifact-template | static-template (worker fills slots) | `brief/workstreams/_example/templates/artifact.md` | role-match (extends with frontmatter + 9-block sections) |
| `brief/workstreams/go-to-market/{spec.yaml,design-prompts.md,templates/artifact.md}` | workstream-bundle | static-data + prompt-data + template | same trio as BMC | role-match |
| `brief/workstreams/financial/{spec.yaml,design-prompts.md,templates/artifact.md}` | workstream-bundle | static-data + prompt-data + template | same trio as BMC; FINANCIAL adds driver Q&A branch in `design.md` workflow | role-match (driver Q&A is workflow-side branch, NOT new agent file) |
| `brief/workstreams/operations/{spec.yaml,design-prompts.md,templates/artifact.md}` | workstream-bundle | static-data + prompt-data + template | same trio as BMC | role-match |
| `brief/workstreams/compliance/{spec.yaml,design-prompts.md,templates/artifact.md}` | workstream-bundle | static-data + prompt-data + template | same trio as BMC | role-match |
| `brief/workstreams/roadmap/{spec.yaml,design-prompts.md,templates/artifact.md}` | workstream-bundle | static-data + prompt-data + template | same trio as BMC | role-match |
| `brief/workstreams/brand/{spec.yaml,design-prompts.md,templates/artifact.md}` | workstream-bundle | static-data + prompt-data + template | same trio as BMC | role-match |
| `brief/workstreams/risk/{spec.yaml,design-prompts.md,templates/artifact.md}` | workstream-bundle | static-data + prompt-data + template | same trio as BMC | role-match |
| `brief/workstreams/tech-arch/{spec.yaml,design-prompts.md,templates/artifact.md}` | workstream-bundle | static-data + prompt-data + template | same trio as BMC | role-match |
| `tests/brief-compliance-canonical-shape.test.cjs` | test-file | structural-identity-test | `tests/brief-audience-vocabulary-lock.test.cjs` (and the broader `tests/brief-audience-*.test.cjs` suite as the structural mirror) | exact (test pattern is the same kind of structural greppability assertion) |
| `tests/brief-compliance-vocabulary-lock.test.cjs` | test-file | grep-audit | `tests/brief-audience-vocabulary-lock.test.cjs` | exact (literal copy-rename + extended ban-list) |
| `tests/brief-compliance-no-hooks.test.cjs` | test-file | grep-audit | `tests/brief-audience-no-hook.test.cjs` | exact (literal copy-rename) |
| `tests/brief-compliance-deterministic-screen.test.cjs` | test-file | unit-test | `tests/brief-audience-drifted-frontmatter.test.cjs` + `tests/brief-audience-drifted-content.test.cjs` | role-match (deterministic-screen behavior on Korean PIPA-pack short-circuit) |
| `tests/brief-compliance-merge-rule.test.cjs` | test-file | unit-test | `tests/brief-audience-state-roundtrip.test.cjs` (state-write pattern) | role-match — Phase 7 deviation: assert material-only findings yield `FINDINGS-MATERIAL` (NOT collapsed to OK like Phase 4/5) |
| `tests/brief-compliance-state-roundtrip.test.cjs` | test-file | unit-test | `tests/brief-audience-state-roundtrip.test.cjs` | exact (literal copy-rename) |
| `tests/brief-compliance-sibling-filename.test.cjs` | test-file | unit-test | `tests/brief-audience-sibling-filename.test.cjs` | exact (literal copy-rename) |
| `tests/brief-compliance-ok.test.cjs` | test-file | unit-test | `tests/brief-audience-ok.test.cjs` | exact (literal copy-rename) |
| `tests/brief-pipa-disclaimer-verbatim.test.cjs` | test-file | content-grep-test | (no exact analog; closest is `tests/brief-korea-compliance-primers.test.cjs`) | partial — Phase 5 primer test verifies primer file contents; Phase 7 verifies the disclaimer string in EVERY emitted `{artifact}.compliance.md` matches the primer verbatim |
| `tests/brief-design-canary-e2e.test.cjs` | test-file | E2E-canary | `tests/brief-discover-canary-e2e.test.cjs` (the Plan 05-08 inheritance pattern) | exact (literal copy-rename + DESIGN sequence) |
| `tests/brief-design-surface-cap.test.cjs` | test-file | grep-audit | `tests/brief-discover-no-new-command.test.cjs` (existing surface-cap pattern) | exact (literal copy-rename) |
| `tests/brief-design-recommended-next.test.cjs` | test-file | unit-test | `tests/brief-statusline.test.cjs` + `tests/brief-return-stack-derived-count.test.cjs` (derive-at-read pattern) | role-match (D-07 soft order computation) |
| `tests/brief-add-workstream-flow.test.cjs` | test-file | unit-test | `tests/brief-define-mode-a.test.cjs` (mode-A Q&A round-trip) | role-match |
| `tests/brief-add-workstream-name-collision.test.cjs` | test-file | unit-test | `tests/brief-define-stale-anchor.test.cjs` (block-with-Korean-error-message pattern) | role-match (D-11 BLOCK on collision; "fork or new" prompt on overlap) |
| `tests/brief-add-workstream-skeleton-atomic.test.cjs` | test-file | unit-test | `tests/atomic-write.test.cjs` + `tests/brief-define-atomic-commit.test.cjs` | role-match — 3-file atomic skeleton write |
| `tests/brief-financial-driver-qa.test.cjs` | test-file | unit-test | `tests/brief-define-text-mode-parity.test.cjs` + `tests/brief-define-mode-a.test.cjs` (mode-A's 8-12 question chain pattern) | role-match — D-15 8-12 driver Q&A round-trip |
| `tests/brief-financial-provenance.test.cjs` | test-file | grep-audit | `tests/brief-provenance-positive.test.cjs` + `tests/brief-researcher-output-provenance.test.cjs` | role-match — Phase 5 CC-04 inheritance |
| `tests/brief-workstream-loader-extensions.test.cjs` | test-file | unit-test | (no analog yet; loader test exists separately — see `brief-tools-path-refs.test.cjs` for loader-related tests) — closest is `tests/brief-define-stale-anchor.test.cjs` for "extend existing primitive with new field" test pattern | partial — Phase 2 D-13 loader test must be extended for `gates_required` + `depends_on` validation |
| `tests/brief-workstream-spec-conditional-prose.test.cjs` | test-file | grep-audit | `tests/brief-audience-vocabulary-lock.test.cjs` (file-grep-pattern) | role-match — D-14 conditional B2B/B2C presence test on the 9 built-in `design-prompts.md` files |
| `tests/brief-workstreams-9-builtin-loadable.test.cjs` | test-file | unit-test | `tests/brief-tools-path-refs.test.cjs` (multi-file load assertion) | role-match — assert all 9 built-in workstreams parse via `loadWorkstreams()` without throwing |

### MODIFIED Files

| Modified File | Role | Data Flow | Modification Type | Closest Analog (for the modification pattern) |
|---|---|---|---|---|
| `brief/bin/lib/workstream-loader.cjs` | utility | static-validator | additive (extend with `gates_required` + `depends_on` validation per Phase 7 D-13) | `brief/bin/lib/audience.cjs` `MANDATORY_FRONTMATTER_FIELDS` enum-extension pattern (lines 44-47) — additive validation following the existing closed-set discipline |
| `brief/bin/lib/status.cjs` | utility | transform | additive (extend `formatGate` for `compliance` row + soft-order "Recommended next" derivation per D-07/D-08) | `brief/bin/lib/status.cjs` itself lines 119-136 (Round-trips derive-at-read pattern is the exact precedent for "Recommended next" derive-at-read) |
| `brief/bin/brief-tools.cjs` | dispatcher | request-response | additive (register 3 NEW dispatcher cases: `compliance`, `design`, `add-workstream`) | `brief/bin/brief-tools.cjs` lines 558-635 (`case 'audience':`) is the literal copy-rename source for `case 'compliance':`; `case 'gap-detect':` (lines 637-810) is the secondary multi-subcommand template |
| `bin/install.js` | installer | file-I/O | additive (new SRC entries are picked up automatically via the existing `agentEntries`/`skillSrc` directory walks; only `commands/brief/design.md` + `commands/brief/add-workstream.md` need to be present in the source tree to be installed; the 9 workstream folders flow through the existing `brief/` skill copy at line 5685) | `bin/install.js` lines 5685-5694 (`copyWithPathReplacement(skillSrc, skillDest, ...)` already handles `brief/workstreams/{name}/`) and lines 5697-5774 (agents directory walk already picks up `brief-compliance-checker.md`). NO source code change in install.js required for the canonical canon (workstream folders + new agent + new commands all flow through existing walks). Verify in plan-phase. |

## Pattern Assignments

### `agents/brief-compliance-checker.md` (gate-agent, request-response)

**Analog:** `agents/brief-audience-guard.md` (lines 1-286). Read 1-100 for frontmatter+role+required_reading; 110-141 for decision_mechanism; 143-168 for output_contract; 226-285 for examples.

**Frontmatter pattern** (lines 1-6 of analog):

```yaml
---
name: brief-audience-guard
description: Evaluates audience fit of a candidate artifact against its own frontmatter AND against OBJECTIVES.md audience_policy. Emits a structured verdict JSON with a three-output decision (AUDIENCE-OK / DRIFTED-frontmatter / DRIFTED-content). Read-only — never mutates the artifact or baseline. Spawned by brief/workflows/audience-guard.md via Task.
tools: Read, Grep, Glob, Write
color: purple
---
```

**Required-reading pattern** (lines 34-42):

```markdown
<required_reading>
- .planning/OBJECTIVES.md
- .planning/PROJECT.md
- brief/references/audience-vocabulary.md
- {{ARTIFACT_PATH}}   (injected at Task-spawn time by the workflow)
- Frontmatter of {{ARTIFACT_PATH}} + OBJECTIVES.md audience_policy (both
  injected via <artifact_frontmatter>...</artifact_frontmatter> and
  <audience_policy>...</audience_policy> delimiters in the prompt)
</required_reading>
```

**Decision mechanism pattern** (lines 111-141):

```markdown
<decision_mechanism>
Three outputs, never pass/fail:
  - AUDIENCE-OK         (frontmatter complete; content consistent with
                         declared audience)
  - DRIFTED-frontmatter (1+ mandatory fields missing or malformed; ...)
  - DRIFTED-content     (frontmatter OK; content contradicts declared
                         audience — ...)

Severity enum (unchanged from Phase 4 D-04): blocking | material | nice-to-have

Any `blocking` finding → DRIFTED-*: ...
All findings material or lower → AUDIENCE-OK
```

**Output contract pattern** (lines 143-168 — the verdict JSON schema):

```typescript
{
  "decision": "AUDIENCE-OK" | "DRIFTED-frontmatter" | "DRIFTED-content",
  "severity": "blocking" | "material" | "nice-to-have",
  "findings_count": <integer equal to the length of the findings array>,
  "findings": [
    {
      "severity": "blocking" | "material" | "nice-to-have",
      "location": "<file>:<line-or-section>",
      "description": "<findings-vocabulary prose per vocabulary_discipline>"
    }
  ],
  "rationale": "<1-3 sentence plain-language summary for user review>"
}
```

**Deltas vs analog (literal swaps + load-bearing extensions):**
- Frontmatter `name: brief-audience-guard` → `brief-compliance-checker`
- Frontmatter `description` rewritten for compliance role; mention "Spawned by brief/workflows/compliance.md"
- Frontmatter `color: purple` → distinct color (red/orange/yellow — planner picks; pattern only requires non-collision with align-gate green / audience-guard purple / gap-detector red — verify via `agents/*.md` `color:` survey)
- `<required_reading>` adds the compliance primer files: `brief/references/compliance/korea/pipa-2026.md`, `isms-p.md`, `mydata-2026.md` (load conditional on `state.brief.compliance_packs` — but the static prompt lists them all; the workflow injects only the matching ones via `{{COMPLIANCE_REQUIRED_READING}}` template variable, mirroring Phase 5 D-13)
- `<required_reading>` swaps `brief/references/audience-vocabulary.md` → `brief/references/compliance-vocabulary.md`
- `<vocabulary_discipline>` ban-list adds: `compliant`, `passed`, `compliance verified`, `audit complete`, plus KO `준수`, `통과`, `위반`, `감사 완료`, `컴플라이언스 확인 완료` (CONTEXT.md `### Vocabulary ban-list (Phase 7 extends Phase 5)`); preferred-vocabulary swaps to compliance phrasings (CONTEXT.md `### Vocabulary ban-list (Phase 7 extends Phase 5)` KO + EN blocks)
- `<decision_mechanism>` verdict enum: `AUDIENCE-OK / DRIFTED-frontmatter / DRIFTED-content` → `COMPLIANCE-OK / FINDINGS-MATERIAL / FINDINGS-BLOCKING` (D-01)
- `<decision_mechanism>` decision derivation: simplify — `blocking → FINDINGS-BLOCKING; material → FINDINGS-MATERIAL; nice-to-have only → COMPLIANCE-OK` (CONTEXT.md `### Merge rule (mergeVerdicts copy-pattern from audience.cjs)` lines lines 224-235 — DEVIATION from Phase 4/5 collapse-to-OK behavior, structurally tested in `tests/brief-compliance-merge-rule.test.cjs`)
- `<output_contract>` JSON schema extends `findings[]` with optional `regulation_clause`, `required_evidence`, `found_in_artifact`, `gap` fields (CONTEXT.md `### The clause-level findings extension (CC-01 contract)`)
- `<examples>` rewrite — Korean PIPA Article 28 example with clause-level fields populated; Korean MyData example showing `FINDINGS-MATERIAL`; English fallback example showing pack-applicability-pass-through (Screen a)

**Cross-references (downstream consumers):**
- `brief/workflows/compliance.md` Step 2 spawns this agent via Task (mirroring `audience-guard.md` Step 2)
- `brief/bin/lib/compliance.cjs validateVerdict` enforces this output schema
- `tests/brief-compliance-canonical-shape.test.cjs` greps for the same H2 sections (`<role>`, `<required_reading>`, `<vocabulary_discipline>`, `<decision_mechanism>`, `<output_contract>`, `<process>`, `<examples>`)

---

### `brief/workflows/compliance.md` (gate-workflow, event-driven)

**Analog:** `brief/workflows/audience-guard.md` (lines 1-396). Read 1-50 for purpose+contract; 30-95 for Step 0/Step 1 deterministic-screen-then-LLM; 169-201 for Step 3/Step 4 commit; 203-289 for Step 5A/5B 3-path interrupt; 290-333 for Step 6 force-accept.

**Purpose pattern** (lines 1-28 of analog):

```markdown
<purpose>
Invoke the BRIEF AUDIENCE gate as an explicit orchestrator step (NOT a hook).

Reads: {{ARTIFACT_PATH}} (path to the research / planning artifact being
evaluated) + {{ARTIFACT_FRONTMATTER}} + {{OBJECTIVES.audience_policy}}
(both baselines).
Produces: {{ARTIFACT_PATH%.md}}.audience.md paired-sibling report + state.brief.last_gate_results.audience +
atomic git commit (AUDIENCE-OK path) OR a 3-path user interrupt
(DRIFTED-frontmatter / DRIFTED-content paths).
...
</purpose>
```

**Step 0 + Step 1 deterministic screen pattern** (lines 30-96):

```markdown
## Step 0: Parameter parsing
Read these invocation parameters:
  - ARTIFACT_PATH (required)
  - VERDICT_OUT_PATH (optional)

Verify {{ARTIFACT_PATH}} exists. ...
TEXT_MODE detection: TEXT_MODE=true if `$ARGUMENTS` contains `--text` ...

## Step 1: Deterministic screen (short-circuit path)
Invoke the `audience run` subcommand:

```
node brief/bin/brief-tools.cjs audience run \
  --artifact "{{ARTIFACT_PATH}}" \
  --baseline ".planning/OBJECTIVES.md" \
  --verdict-out "{{VERDICT_OUT_PATH}}"
```

Parse the subcommand stdout as JSON. If `short_circuited: true`, skip
Step 2 and proceed to Step 3.
```

**Step 4 atomic commit pattern** (lines 178-201):

```markdown
## Step 4: Atomic commit (AUDIENCE-OK path)
Invoke:
```
node brief/bin/brief-tools.cjs audience commit \
  --verdict "{{VERDICT_OUT_PATH}}" \
  --artifact "{{ARTIFACT_PATH}}"
```
The `audience commit` subcommand:
  1. Re-reads + re-validates the verdict file.
  2. Renders {{ARTIFACT_PATH%.md}}.audience.md ...
  3. readModifyWriteStateMd to set state.brief.last_gate_results.audience ...
  5. Stages artifact + .audience.md + STATE.md via a single
     `brief-tools commit --files` call (Pattern 4 atomic 3-file commit).
```

**Step 5/6 3-path interrupt pattern** (lines 203-333) — see analog for the verbatim AskUserQuestion XML and TEXT_MODE numbered-list shape, plus the force-accept override-reason discipline.

**Deltas vs analog:**
- Swap `audience` → `compliance` in all subcommand invocations (`audience run` → `compliance run`, `audience commit` → `compliance commit`)
- Swap `AUDIENCE` → `COMPLIANCE` in all user-facing prose
- Swap `audience-verdict.tmp.json` → `compliance-verdict.tmp.json`
- Swap `audience.md` → `compliance.md` paired-sibling filename
- Swap verdict enum strings throughout: `AUDIENCE-OK / DRIFTED-frontmatter / DRIFTED-content` → `COMPLIANCE-OK / FINDINGS-MATERIAL / FINDINGS-BLOCKING`
- Step 3 routing: `AUDIENCE-OK → Step 4 commit`, `DRIFTED-frontmatter → Step 5A`, `DRIFTED-content → Step 5B` becomes `COMPLIANCE-OK → Step 4 commit`, `FINDINGS-MATERIAL → Step 4 commit (NO interrupt — proceeds with material findings recorded inline; D-01)`, `FINDINGS-BLOCKING → Step 5 (3-path interrupt)`
- Phase 7 collapses Step 5A/5B (frontmatter/content variants) into a SINGLE Step 5 because COMPLIANCE has only one BLOCKING-routable verdict (`FINDINGS-BLOCKING`). The 3-path options become: `1. artifact 다시 쓰기 (re-spawn worker / 수동 편집)` / `2. OBJECTIVES 수정하기 (compliance_packs 또는 region 변경 필요)` / `3. 현재 상태 승인, 계속 진행 (force-accept) — 자격 있는 한국 변호사와 검토를 권장합니다` (CONTEXT.md `### 3-path interrupt (D-06 / D-08 inheritance)`)
- Step 1 deterministic screen has 3 sub-screens (a/b/c) per CONTEXT.md `### Deterministic screen + LLM pass hybrid`: (a) pack-applicability check, (b) PIPA hard-required-evidence check, (c) ban-list grep. The analog has only 3 sub-screens (a/b/c) too — different semantics but identical structural shape.
- Step 2 LLM pass adds `<business_context>...</business_context>` injection from `context-inject.cjs buildBusinessContext()` (the audience-guard analog does NOT inject business_context — it reads OBJECTIVES.md `audience_policy` directly). This is a load-bearing addition because PIPA scoping depends on `business_context.region == 'kr'` AND `business_context.compliance_packs` matching.
- Step 6 force-accept disclaimer: append the verbatim PIPA disclaimer text mentioning CEO liability (D-03) to the override-acceptance message; Korean version when `region: kr`. NOT just the audit-trail prose from the analog.
- `<no_hooks_assertion>` block: copy-rename — Phase 7 must ship `tests/brief-compliance-no-hooks.test.cjs`
- `<command_surface_assertion>` block: extend the FORBIDDEN list with `commands/brief/recompliance.md`, `commands/brief/realign-workstream.md`, `commands/brief/design-all.md`, `commands/brief/refinancial.md` (CONTEXT.md `tests/brief-design-surface-cap.test.cjs`)

**Cross-references:**
- Invoked SEQUENTIALLY by `brief/workflows/design.md` post-artifact-write block (after `brief/workflows/audience-guard.md` returns AUDIENCE-OK or override)
- May ALSO be invoked by Phase 8 DELIVER workflows (CC-01 contract — every artifact in every phase)
- `tests/brief-compliance-no-hooks.test.cjs` greps `hooks/` for any `compliance` reference

---

### `brief/bin/lib/compliance.cjs` (gate-lib, request-response)

**Analog:** `brief/bin/lib/audience.cjs` (lines 1-442). Read 1-200 for imports + constants + validators + grepBanList + computeTermOverlap + runDeterministicScreen; 232-326 for writeVerdict + mergeVerdicts + runAudience; 328-414 for commitAudienceVerdict.

**Header + imports pattern** (lines 1-21 of analog):

```javascript
/**
 * Audience — AUDIENCE gate primitives (Plan 05-04, paired-sibling activation
 * Plan 05-05). Duplicate-renamed from align.cjs per 05-RESEARCH.md §Pattern 2.
 * Phase 7 COMPLIANCE copy-renames this module; preserve literal shape. Zero
 * runtime deps (A1). ...
 */
const fs = require('fs');
const path = require('path');
const { atomicWriteFileSync, planningDir, planningPaths } = require('./core.cjs');
const { sanitizeForPrompt } = require('./security.cjs');
const {
  extractFrontmatter,
  stripFrontmatter,
  reconstructFrontmatter,
} = require('./frontmatter.cjs');
const { readModifyWriteStateMd } = require('./state.cjs');
const { detectKoreaSignalFromConfig } = require('./align.cjs'); // reuse existing helper
const { renderAudienceReport } = require('./audience-report.cjs');
```

**`_siblingReportPath` reuse pattern** (lines 22-30):

```javascript
function _siblingReportPath(artifactAbsPath, suffix) {
  const ext = path.extname(artifactAbsPath);
  const base = ext === '.md' ? artifactAbsPath.slice(0, -3) : artifactAbsPath;
  return `${base}.${suffix}.md`;
}
```

Phase 7 should NOT duplicate this — IMPORT from `audience.cjs` as the export `siblingReportPath` (line 440 of analog), exactly the way `gap-detect.cjs` line 25 already does:

```javascript
const { siblingReportPath } = require('./audience.cjs');
```

**Constants + enums pattern** (lines 32-48):

```javascript
const VALID_DECISIONS = new Set(['AUDIENCE-OK', 'DRIFTED-frontmatter', 'DRIFTED-content']);
const VALID_SEVERITIES = new Set(['blocking', 'material', 'nice-to-have']);
const BAN_EN = /\b(compliant|passed|violation|failed)\b/gi;
const BAN_KO = /(준수|통과|위반|실패)/g;
const BAN_SYMBOL = /[✅✓✗]/g;
```

**`validateVerdict` pattern** (lines 59-76):

```javascript
function validateVerdict(v) {
  if (!v || typeof v !== 'object') return 'verdict not object';
  if (!VALID_DECISIONS.has(v.decision)) return `bad decision: ${v.decision}`;
  if (!VALID_SEVERITIES.has(v.severity)) return `bad severity: ${v.severity}`;
  if (typeof v.findings_count !== 'number' || v.findings_count < 0 || !Number.isInteger(v.findings_count)) {
    return 'bad findings_count (must be non-negative integer)';
  }
  if (!Array.isArray(v.findings)) return 'findings not array';
  for (let i = 0; i < v.findings.length; i++) {
    const f = v.findings[i];
    if (!f || typeof f !== 'object') return `findings[${i}] not object`;
    if (!VALID_SEVERITIES.has(f.severity)) return `findings[${i}].severity bad`;
    if (typeof f.location !== 'string') return `findings[${i}].location not string`;
    if (typeof f.description !== 'string') return `findings[${i}].description not string`;
  }
  if (typeof v.rationale !== 'string') return 'rationale not string';
  return null;
}
```

**`runDeterministicScreen` pattern** (lines 124-230) — 3 sub-screens (a/b/c) returning either a full short-circuit verdict or `{verdict: null, findings: []}` for additive material findings. Phase 7 keeps the same 3-sub-screen shape with COMPLIANCE-specific semantics.

**`mergeVerdicts` pattern** (lines 247-293) — the LOAD-BEARING DEVIATION lives here:

```javascript
function mergeVerdicts(detFindings, llmVerdict) {
  // ... severity-max scan ...
  let decision;
  if (maxSev === 'blocking') {
    // ... routes to DRIFTED-frontmatter or DRIFTED-content based on location ...
  } else {
    decision = 'AUDIENCE-OK';   // ← Phase 4/5 collapses material+nice-to-have here
  }
  // ...
}
```

**`commitAudienceVerdict` pattern** (lines 365-414) — the atomic commit triad: render report → atomic-write sibling → readModifyWriteStateMd → unlink tmp verdict in `finally`.

**Deltas vs analog:**
- Filename + module-level prose: `Audience` → `Compliance`; `audience.cjs` → `compliance.cjs`; `audience-report.cjs` → `compliance-report.cjs`
- Import: `const { renderAudienceReport } = require('./audience-report.cjs');` → `const { renderComplianceReport } = require('./compliance-report.cjs');`
- Import: ADD `const { buildBusinessContext } = require('./context-inject.cjs');` (load-bearing — Phase 7 deterministic screen reads `compliance_packs` and `region` from business_context, NOT from OBJECTIVES.md frontmatter directly; mirrors how Phase 5 `brief-domain-researcher` consumes context-inject)
- Import: KEEP `const { detectKoreaSignalFromConfig } = require('./align.cjs');` (re-exported as the canonical helper since Phase 4)
- Import: KEEP `const { siblingReportPath } = require('./audience.cjs');` (reuse the canonical path helper — gap-detect.cjs precedent)
- `VALID_DECISIONS`: `['AUDIENCE-OK', 'DRIFTED-frontmatter', 'DRIFTED-content']` → `['COMPLIANCE-OK', 'FINDINGS-MATERIAL', 'FINDINGS-BLOCKING']`
- `BAN_EN` regex extends with: `compliance verified|audit complete|compliance OK` (case-insensitive `i` flag)
- `BAN_KO` regex extends with: `감사 완료|컴플라이언스 확인 완료`
- `MANDATORY_FRONTMATTER_FIELDS` + `AUDIENCE_TYPE_ENUM` + `CONFIDENTIALITY_ENUM` + `BUSINESS_MODEL_ENUM`: REMOVE (audience-specific; not relevant to compliance)
- `HEDGING_EN`/`HEDGING_KO`: REMOVE (audience-specific; compliance does NOT do hedging detection)
- `runDeterministicScreen` 3 sub-screens rewrite (CONTEXT.md `### Deterministic screen + LLM pass hybrid (D-03 inheritance)`):
  - Screen (a) — Pack-applicability check: read `compliance_packs` from business_context. If empty AND no Korea-region signal AND no Korean prose, return single nice-to-have finding "no applicable compliance packs declared; gate ran in pass-through mode" — short-circuit `COMPLIANCE-OK`
  - Screen (b) — PIPA hard-required-evidence check: when packs include PIPA AND artifact body matches `/(PII|personal information|customer data|biometric|location data|sensitive data|개인정보|위치정보|민감정보)/i`, AND artifact does NOT cite PIPA-specific evidence (CPO policy, blanket-consent ban, breach notification readiness), emit blocking finding with `regulation_clause: "PIPA Art. 28-8"` — short-circuit `FINDINGS-BLOCKING`
  - Screen (c) — Ban-list grep: same shape as audience.cjs `grepBanList`; additive material findings
- `mergeVerdicts` LOAD-BEARING DEVIATION:
  ```javascript
  // Phase 7 NEW logic (NOT analog):
  if (maxSev === 'blocking') decision = 'FINDINGS-BLOCKING';
  else if (maxSev === 'material') decision = 'FINDINGS-MATERIAL';   // ← preserves MATERIAL distinct verdict
  else decision = 'COMPLIANCE-OK';
  ```
  Tested in `tests/brief-compliance-merge-rule.test.cjs`. Document the deviation explicitly as a comment block in the function body.
- `runAudience` → `runCompliance` (function rename + signature kept; `opts` accepts `{artifact, baseline, verdictOutPath?, llmPass?, businessContext?}`)
- `commitAudienceVerdict` → `commitComplianceVerdict`:
  - Sibling path: `_siblingReportPath(artifactPath, 'compliance')`
  - State write: `fm.brief.last_gate_results.compliance = { decision, severity, findings_count, at, override?, override_reason? }` (mirrors audience write at lines 400-406 of analog)
  - Render call: `renderComplianceReport(verdict, { korea, override, overrideReason, packs })` (extra `packs` param for footer disclaimer rendering — see compliance-report.cjs deltas)
- `Exports`: same shape as analog — re-export `siblingReportPath` from audience.cjs (do NOT redefine), export all the `validateVerdict / grepBanList / runDeterministicScreen / writeVerdict / mergeVerdicts / runCompliance / commitComplianceVerdict / detectKoreaSignalFromConfig` names that Phase 7 structural-identity test will assert exist

**Cross-references:**
- `brief/bin/brief-tools.cjs case 'compliance':` dispatcher imports this module (mirrors `case 'audience':` line 563)
- `brief/workflows/compliance.md` Step 1 invokes `compliance run` subcommand
- `brief/workflows/compliance.md` Step 4 invokes `compliance commit` subcommand
- `tests/brief-compliance-canonical-shape.test.cjs` greps for the same exported function names as `audience.cjs`

---

### `brief/bin/lib/compliance-report.cjs` (gate-report-renderer, transform)

**Analog:** `brief/bin/lib/audience-report.cjs` (lines 1-68 — entire file is 68 lines).

**Full analog body** (canonical reference):

```javascript
const { reconstructFrontmatter } = require('./frontmatter.cjs');

function renderAudienceReport(verdict, opts) {
  const korea = !!(opts && opts.korea);
  const override = !!(opts && opts.override);
  const overrideReason = (opts && opts.overrideReason) || '';
  const now = new Date().toISOString();
  const fm = {
    decision: override ? 'AUDIENCE-OK' : verdict.decision,
    severity: verdict.severity,
    findings_count: verdict.findings_count,
    at: now,
    ...(override ? { override: true, override_reason: overrideReason } : {}),
  };
  const fmYaml = reconstructFrontmatter(fm);
  const findingsHeader = korea ? '## Findings / 발견사항' : '## Findings';
  const rationaleHeader = korea ? '## Rationale / 이유' : '## Rationale';
  const overrideHeader = korea ? '## User Override / 사용자 승인' : '## User Override';
  const findingsList = verdict.findings
    .map((f) => `- **[${f.severity}]** \`${f.location}\` — ${f.description}`)
    .join('\n');
  const parts = [ /* findings + rationale + optional override */ ];
  return `---\n${fmYaml}\n---\n\n${parts.join('\n')}`;
}

module.exports = { renderAudienceReport };
```

**Deltas vs analog:**
- Function rename: `renderAudienceReport` → `renderComplianceReport`
- `opts` signature additions: `packs: string[]` (the user's `state.brief.compliance_packs` — drives the disclaimer rendering decision); for Korean disclaimer, the `korea` flag is reused as-is
- Frontmatter `decision` override mapping: `'AUDIENCE-OK'` → `'COMPLIANCE-OK'`
- Body sections: ADD `## Documented obligations addressed` / `## Obligations needing further work` / `## Obligations BRIEF cannot verify (requires qualified Korean counsel)` headers (Korean variants) — group findings by these 3 categories using a heuristic on `severity` (blocking → "needing further work" or "cannot verify" depending on `regulation_clause` presence; material → "needing further work"; nice-to-have → "addressed (with caveat)"). Planner finalizes the heuristic in plan-phase.
- Findings list pattern: when a finding has `regulation_clause` / `required_evidence` / `found_in_artifact` / `gap`, render a richer 4-line block:
  ```
  - **[blocking]** `<location>` — <description>
    - 규정 조항: <regulation_clause>
    - 필요 증거: <required_evidence>
    - artifact 내 위치: <found_in_artifact>
    - 공백: <gap>
  ```
  Korean labels when `korea: true`; English (`Regulation clause:` / `Required evidence:` / `Found in artifact:` / `Gap:`) otherwise (CONTEXT.md `### Vocabulary ban-list (Phase 7 extends Phase 5)`).
- LOAD-BEARING ADDITION: Mandatory disclaimer footer (D-03). Always rendered. Korean when `korea: true`:
  ```
  > 2026년 개정 개인정보 보호법(PIPA)에 따라 위반 시 대표이사 개인 책임이 발생할 수 있으며, 과징금 상한은 총매출의 10%입니다. 본 findings는 자격 있는 한국 변호사와의 검토를 위한 시작점이며, 법률 자문이 아닙니다.
  ```
  English otherwise:
  ```
  > Under 2026 PIPA amendments, breaches may result in personal liability for the CEO and penalties up to 10% of total turnover. Findings here are starting points for review with qualified Korean counsel — they are not legal advice.
  ```
  The exact wording MUST match `brief/references/compliance/korea/pipa-2026.md` verbatim — `tests/brief-pipa-disclaimer-verbatim.test.cjs` enforces this.
- Module exports: `module.exports = { renderComplianceReport };`

**Cross-references:**
- Imported by `brief/bin/lib/compliance.cjs commitComplianceVerdict`
- `tests/brief-pipa-disclaimer-verbatim.test.cjs` greps emitted `{artifact}.compliance.md` for the verbatim disclaimer string

---

### `brief/references/compliance-vocabulary.md` (vocabulary-reference, static-data)

**Analog:** `brief/references/audience-vocabulary.md` (lines 1-100 — entire file).

**Top-of-file pattern** (lines 1-10 of analog):

```markdown
# AUDIENCE Vocabulary — Findings Language, Not Pass/Fail

> Source of truth for the BRIEF AUDIENCE gate's findings language.
> Extends the Phase 4 ALIGN vocabulary with AUDIENCE-specific hedging /
> internal-only vocabulary for DRIFTED-content detection (D-09).
> Loaded as `required_reading` by `agents/brief-audience-guard.md`.
> Grepped at CI time by `tests/brief-audience-vocabulary-lock.test.cjs`.
```

**Section structure** (full file — Sections: Preferred vocabulary KO; Preferred vocabulary EN; Ban-list EN; Ban-list KO; Ban-list symbols; Hedging vocabulary EN; Hedging vocabulary KO; Notes for reviewers).

**Deltas vs analog:**
- Title swap: `AUDIENCE` → `COMPLIANCE`
- Top-of-file rename: agent reference → `agents/brief-compliance-checker.md`; test reference → `tests/brief-compliance-vocabulary-lock.test.cjs`
- `## Preferred vocabulary (KO)` rewrite — replace audience-specific items with the COMPLIANCE preferred phrasings from CONTEXT.md `### Vocabulary ban-list (Phase 7 extends Phase 5)`:
  ```
  - **문서화된 의무 사항 중 반영된 것:** ...
  - **추가 작업이 필요한 의무 사항:** ...
  - **BRIEF로 확인할 수 없는 의무 사항 (자격 있는 한국 변호사 검토 필요):** ...
  - **규정 조항: ... | 필요 증거: ... | artifact 내 위치: ... | 공백: ...**
  - **2026년 개정 개인정보 보호법(PIPA)에 따라 위반 시 대표이사 개인 책임이 발생할 수 있으며, 과징금 상한은 총매출의 10%입니다.**
  ```
- `## Preferred vocabulary (EN)` rewrite — mirror the EN block from CONTEXT.md
- `## Ban-list (EN)` adds: `compliant`, `passed`, `compliance verified`, `audit complete`, `compliance OK` (when used as verdict-language; gate-internal `COMPLIANCE-OK` enum string is fine — note the inline exception); creative-avoidance: `all clear`, `no issues`
- `## Ban-list (KO)` adds: `준수` (verdict-language only), `통과`, `위반` (prefer "추가 작업이 필요한 항목" or "법적 자문 필요 항목"), `감사 완료`, `컴플라이언스 확인 완료`
- `## Ban-list (symbols)` — INHERIT verbatim from analog (`✅`, `✓`, `✗`)
- DELETE `## Hedging vocabulary` sections (audience-specific; compliance does not do hedging detection)
- ADD `## Clause-level findings format (CC-01 contract)` section explaining the 4-field extension on findings: `regulation_clause | required_evidence | found_in_artifact | gap`
- `## Notes for reviewers` — keep, swap "Phase 5/HRD-04" references to "Phase 7/HRD-04"

**Cross-references:**
- Loaded as `required_reading` by `agents/brief-compliance-checker.md`
- Grepped by `tests/brief-compliance-vocabulary-lock.test.cjs` (literal copy-rename of audience-vocabulary-lock test, with the new ban-list)
- Phase 7 D-04 lock — content depth is "1-page primer ships v1; v2 expands"

---

### `commands/brief/design.md` (command-shell, request-response)

**Analog:** `commands/brief/discover.md` (lines 1-41 — entire file).

**Full analog body**:

```markdown
---
name: brief:discover
description: BRIEF DISCOVER phase — broad parallel domain research across 9 default categories ...
argument-hint: "[--text]"
allowed-tools:
  - Read
  - Bash
  - AskUserQuestion
  - Task
  - Write
---
<objective>
Guide the user through broad parallel domain research:
  1. Block if OBJECTIVES.md is missing required fields ...
  2. Stale-anchor 3-option interrupt ...
  ...
All user-facing prompts default to Korean ...
</objective>

<execution_context>
@~/.claude/brief/workflows/discover.md
@~/.claude/brief/workflows/audience-guard.md
</execution_context>

<process>
Execute the discover workflow:
  ...
See brief/workflows/discover.md for the full workflow detail.
</process>
```

**Deltas vs analog:**
- Frontmatter `name`: `brief:discover` → `brief:design`
- Frontmatter `description`: rewrite to mention the workstream argument: "BRIEF DESIGN phase — single-workstream-per-session orchestration over 9 built-in workstreams (BMC, GTM, FINANCIAL, OPERATIONS, COMPLIANCE, ROADMAP, BRAND, RISK, TECH-ARCH) + dynamic addition. Each artifact passes ALIGN → AUDIENCE → COMPLIANCE in series."
- Frontmatter `argument-hint`: `"[--text]"` → `"<workstream-name> [args] [--text]"`
- `<execution_context>` updates:
  ```
  @~/.claude/brief/workflows/design.md
  @~/.claude/brief/workflows/align-gate.md
  @~/.claude/brief/workflows/audience-guard.md
  @~/.claude/brief/workflows/compliance.md
  ```
- `<objective>` rewrite — describe the 7-step orchestration: workstream selection (D-05), spec.yaml load (Phase 2 D-13 + Phase 7 D-13 extension), pre-flight OBJECTIVES insufficiency check (D-06), context-inject.cjs business_context build, design-prompts.md Task spawn, sequential 3-gate threading (D-02), workstream completion handoff (D-08).
- `<process>` rewrite — point to `brief/workflows/design.md`

**Cross-references:**
- `bin/install.js` agentEntries walk picks this up automatically (no install.js change required)
- `tests/brief-design-surface-cap.test.cjs` enforces this is the ONLY net-new design-side command (along with `add-workstream.md`)

---

### `brief/workflows/design.md` (orchestrator-workflow, event-driven)

**Analog:** PRIMARY = `brief/workflows/discover.md` (lines 1-429 — Step 0 / 0.5 / 1 / 2 / 3 / 4 / 5 / 6 / 7); SECONDARY = `brief/workflows/audience-guard.md` (Step 3-6 routing pattern adapted into the inside-of-design.md sequential 3-gate threading).

**Step 0 + Step 0.5 + Step 1 pre-flight pattern** (lines 12-145 of discover analog):

```markdown
## Step 0: TEXT_MODE Detection
Set TEXT_MODE=true if `--text` is present in $ARGUMENTS OR ...

## Step 0.5: Return-stack resume auto-detection (DSG-11, D-10 — Phase 6 addition)
Before running the block-gate or stale-anchor checks, check whether a paused
frame exists on `state.brief.return_stack`. ...

## Step 1: Block-gate (DEF-05, D-12)
Invoke `brief-tools objectives validate` ...

## Step 2: Stale-anchor check (DEF-06, D-13)
Invoke `brief-tools objectives stale-check` ...
```

**Step 3 multi-select + Step 4 context-inject pattern** (lines 211-296 of discover analog):

```markdown
## Step 3: Category multi-select (DSC-01, DSC-02)
Present the 9 default research categories + "Other (free-text)" as a multi-select prompt.
<askuserquestion>
  <multiSelect>true</multiSelect>
  <options>
    <option>Market Sizing — 시장 규모</option>
    ...
  </options>
</askuserquestion>

## Step 4: Build business_context block (CC-02, D-13, D-14)
Invoke `brief/bin/lib/context-inject.cjs` via a Node.js one-liner:
```bash
node -e "const { buildBusinessContext } = require('./brief/bin/lib/context-inject.cjs'); ..."
```
```

**Step 5 Task spawn pattern** (lines 297-368 of discover analog) — wave-based parallel spawn (Phase 7 only spawns ONE workstream per invocation per D-05, so wave logic simplifies to a single Task).

**Step 6 gate invocation pattern** (lines 369-391 of discover analog):

```markdown
## Step 6: AUDIENCE gate per artifact (DSG-13)
For EACH slug in the completed wave, invoke brief/workflows/audience-guard.md sequentially:
ARTIFACT_PATH = .planning/discover/${slug}.md
...
The audience-guard workflow:
  (1) runs deterministic screen ...
  (2) if no short-circuit, spawns brief-audience-guard subagent ...
  ...
```

**Deltas vs analog (the load-bearing adaptation work):**
- Step 0 TEXT_MODE detection: COPY VERBATIM
- Step 0.5 return-stack resume detection: COPY VERBATIM (re-uses Phase 6 D-10 inheritance — `/brief-design` taps return_stack only on entry/exit)
- Step 1 Block-gate (OBJECTIVES.md required-field check): COPY VERBATIM (D-06 pre-flight)
- Step 2 Stale-anchor: COPY VERBATIM
- Step 3 SINGLE-WORKSTREAM SELECTION (NOT multi-select):
  - If `$ARGUMENTS` contains `<workstream-name>` (D-05), validate it via `brief-tools workstream-loader load` and proceed
  - If absent, render an AskUserQuestion (single-select OR TEXT_MODE numbered list) with the 9 built-in workstreams + custom-added workstreams (loaded from `loadWorkstreams(cwd)`)
  - Korean prompt: `어떤 workstream을 작업하시겠어요?` listing 9 + custom
  - On selection, set `WORKSTREAM_SLUG` and proceed
- Step 4 Build business_context: COPY VERBATIM (Phase 5 D-13/D-14)
- Step 4.5 NEW — OBJECTIVES insufficiency check (D-06):
  - Inspect OBJECTIVES.md for required fields specific to the selected workstream (e.g., FINANCIAL needs `mutable_hypotheses.monetization`; BMC needs `mutable_hypotheses.target_audience`)
  - On insufficiency, write a "PAUSED — OBJECTIVES amendment needed" status to STATE.md, print Korean/English message instructing user to run `/brief-define --amend`, exit cleanly. NO return-stack push.
  - Optional: write `{artifact}.gaps.md` with severity MATERIAL noting the OBJECTIVES gap
- Step 5 SINGLE Task spawn (NOT wave) — D-05:
  - Load workstream's `design-prompts.md` content via `fs.readFileSync(`brief/workstreams/${WORKSTREAM_SLUG}/design-prompts.md`)`
  - Read template skeleton via `fs.readFileSync(`brief/workstreams/${WORKSTREAM_SLUG}/templates/artifact.md`)`
  - Spawn ONE Task with the design-prompts.md content as the agent prompt body, business_context.promptBlock injected, template skeleton injected as `{{TEMPLATE_SKELETON}}`, output path `{{OUT_PATH}} = .planning/workstreams/${WORKSTREAM_SLUG}/<derived-artifact-name>.md` (CONTEXT.md D-12 paired-sibling layout)
  - Subagent emits `{{OUT_PATH}}` artifact OR fails → fallback stub similar to discover.md lines 354-365
- Step 5.5 FINANCIAL DRIVER Q&A BRANCH (only when `WORKSTREAM_SLUG === 'financial'`, D-15):
  - Run sequence of 8-12 AskUserQuestion / TEXT_MODE numbered-list prompts covering 5 categories (revenue / cost / customers / capital / time)
  - Persist driver answers to `.planning/workstreams/financial/drivers.md` (or inline in `state.brief.financial_drivers`) with `[FOUNDER-INPUT]` provenance tag (Phase 5 CC-04 inheritance)
  - The Step 5 Task spawn for FINANCIAL receives the driver table verbatim; LLM produces 12-month projection with sensitivity bands × 0.7/1.0/1.3 and provenance tags `[VERIFIED:user-supplied]` or `[ASSUMED:multiplier-X]`
  - Analog for Q&A pattern: `brief/workflows/define.md` Mode A Steps 2A.1-2A.7 (8 sequential AskUserQuestion calls, each waiting for user answer, accumulating into a draft)
- Step 6 SEQUENTIAL 3-GATE THREADING (D-02):
  - Invoke `brief/workflows/align-gate.md` with `{{ARTIFACT_PATH}}={{OUT_PATH}}`
  - On `ALIGNED` (or override): invoke `brief/workflows/audience-guard.md`
  - On `DRIFTED-*` (non-override): exit with resume hint (fail-fast)
  - On `AUDIENCE-OK` (or override): invoke `brief/workflows/compliance.md` (NEW — Phase 7 ships)
  - On `DRIFTED-*` (non-override): exit with resume hint (fail-fast)
  - On `COMPLIANCE-OK / FINDINGS-MATERIAL` (or override): proceed to Step 7
  - On `FINDINGS-BLOCKING` (non-override): exit with resume hint (fail-fast)
- Step 7 WORKSTREAM COMPLETION HANDOFF (D-08):
  - Print artifact path + 3-gate verdict summary
  - Compute "Recommended next workstream" from `loadWorkstreams()` `depends_on` graph + STATE.md last-completed timestamps
  - AskUserQuestion (or TEXT_MODE numbered list) with: `Continue with {recommended next}` / `Stop here` / `Pick a different workstream`
  - On `Continue` → directly invoke `/brief-design {recommended-next}` recursively (Skill tool, NOT nested Task — per CONTEXT.md `### D-08 ... Skill tool, not nested Task`)
  - On `Stop here` → write `state.brief.last_design_workstream = WORKSTREAM_SLUG`, atomic commit STATE.md
  - On `Pick a different` → present full multi-choice picker + recurse
- `<no_hooks_assertion>` block: copy-rename pattern — assert no hooks reference `design`, `compliance`, `add-workstream` workflows
- `<command_surface_assertion>` block: extend FORBIDDEN list with `commands/brief/recompliance.md`, `commands/brief/realign-workstream.md`, `commands/brief/design-all.md`, `commands/brief/refinancial.md`

**Cross-references:**
- Invokes `brief/workflows/align-gate.md`, `brief/workflows/audience-guard.md`, `brief/workflows/compliance.md` sequentially
- Reads `brief/workstreams/${slug}/{spec.yaml,design-prompts.md,templates/artifact.md}` via `loadWorkstreams()`
- Uses `brief/bin/lib/context-inject.cjs buildBusinessContext()` (Phase 5 D-13)
- `tests/brief-design-canary-e2e.test.cjs` exercises the full sequence on a Korea-first B2C fintech BMC fixture

---

### `commands/brief/add-workstream.md` (command-shell, request-response)

**Analog:** `commands/brief/define.md` (lines 1-27 — entire file).

**Full analog body** (canonical reference):

```markdown
---
name: brief:define
description: BRIEF DEFINE phase — conversational intent extraction. Mode A (Greenfield) produces .planning/OBJECTIVES.md ...
argument-hint: "[--amend] [--unlock-intent] [--text]"
allowed-tools:
  - Read
  - Bash
  - AskUserQuestion
  - Write
---
<objective>
...
</objective>

<execution_context>
@~/.claude/brief/workflows/define.md
</execution_context>

<process>
Execute the define workflow body...
See brief/workflows/define.md for the full workflow detail.
</process>
```

**Deltas vs analog:**
- Frontmatter `name`: `brief:define` → `brief:add-workstream`
- Frontmatter `description`: rewrite — "BRIEF — Add a custom workstream via 1-session interactive Q&A. Auto-generates spec.yaml + design-prompts.md + templates/artifact.md skeleton with name-collision BLOCK + role-overlap fork-or-new prompt. Default `gates_required: [align, audience, compliance]`."
- Frontmatter `argument-hint`: `"[--amend] [--unlock-intent] [--text]"` → `"<workstream-name> [--text]"`
- `<execution_context>`: `@~/.claude/brief/workflows/define.md` → `@~/.claude/brief/workflows/add-workstream.md`
- `<objective>` describes the 4-step Q&A → atomic skeleton write
- `<process>` points to `brief/workflows/add-workstream.md`

**Cross-references:**
- Picked up by install.js agentEntries walk
- `tests/brief-design-surface-cap.test.cjs` confirms NET +2 surface (`design.md` + `add-workstream.md` only)

---

### `brief/workflows/add-workstream.md` (utility-workflow, request-response)

**Analog:** PRIMARY = `brief/workflows/define.md` (lines 1-200 — Step 0 flag parsing + Step 1 mode select + Step 2A Mode A 8 sequential AskUserQuestion calls); SECONDARY = `brief/workflows/audience-guard.md` lines 178-201 (Step 4 atomic-commit-via-`brief-tools commit --files` for the 3-file skeleton write).

**Step 0 flag parsing pattern** (lines 10-26 of define analog):

```markdown
## Step 0: Flag Parsing + TEXT_MODE Detection
Check invocation flags from `$ARGUMENTS`:
- `--text` ...
Set `TEXT_MODE=true` if `--text` is present in `$ARGUMENTS` OR
`workflow.text_mode` from the init JSON is true.
```

**Step 2A Mode A 8 sequential AskUserQuestion pattern** (lines 91-200 of define analog) — the canonical "ask 8-12 questions in series, each accumulating into a draft" model. Phase 7 add-workstream Q&A uses 4-6 questions per D-09.

**Deltas vs analog:**
- Step 0: parse `<workstream-name>` from `$ARGUMENTS`; TEXT_MODE detection same as analog
- Step 1: NAME COLLISION CHECK (D-11)
  - Run `loadWorkstreams(cwd)` — if `<workstream-name>` matches existing slug (or canonical alias like `BMC` → `business-model-canvas`), emit Korean error per Phase 3 D-12 block-style error tone:
    ```
    ⚠ workstream '{name}'은(는) 이미 존재합니다 (brief/workstreams/{existing-slug}/).
    다른 이름을 사용하시거나 '/brief-design {existing-slug}'를 실행해 주세요.
    ```
  - English variant otherwise; exit non-zero
- Step 2: ROLE OVERLAP DETECTION (D-11)
  - Compute keyword overlap with each existing workstream's `description` (heuristic: word-set overlap > 50%)
  - On overlap, render AskUserQuestion: `이건 GTM의 확장처럼 들립니다. 어떤가요?` with options: `Extend existing GTM` / `Genuinely new workstream` / `Cancel`
  - On `Extend` → set `extends_workstream: <parent-slug>` in spec.yaml; on `Genuinely new` → proceed isolated; on `Cancel` → exit
- Step 3: 4-6 SEQUENTIAL Q&A (D-09)
  - Q1: `이 workstream의 목표는 무엇인가요? (1-2 문장)` → `description`
  - Q2: `어떤 artifact를 생성하나요? 한 가지를 선택하거나 직접 설명해 주세요.` → `output_artifact_template` skeleton path
  - Q3: `이 workstream에 B2B/B2C 변형 콘텐츠가 있나요?` Y/N → conditional template prose toggle in `design-prompts.md`
  - Q4: `Compliance focus areas?` multi-select [`pipa`, `isms-p`, `mydata`, `none`] → influences COMPLIANCE checker pack auto-load
  - Q5: `추천 순서 — 어느 기존 workstream 다음에 실행되나요?` multi-select → `depends_on`
  - Q6 (optional): `OBJECTIVES.md 외에 추가 research prompt가 있나요?` → seeds `research_prompts[]`
  - Each AskUserQuestion has a TEXT_MODE numbered-list fallback per FND-06
- Step 4: ATOMIC SKELETON WRITE (3 files via single `brief-tools commit --files`)
  - Generate `brief/workstreams/{name}/spec.yaml` from Q&A answers; defaults: `gates_required: [align, audience, compliance]` (D-10), `name: {name}`, `research_prompts: ["…",…]`, `design_prompts: [file:design-prompts.md]`, `output_artifact_template: templates/artifact.md`, `depends_on: [...]`
  - Generate `brief/workstreams/{name}/design-prompts.md` with conditional B2B/B2C blocks (Q3 toggle): include the canonical Phase 5 D-15 prose pattern verbatim
  - Generate `brief/workstreams/{name}/templates/artifact.md` skeleton — frontmatter (`audience.type: internal`, `audience.confidentiality: internal`, `business_context.model: {{business_model}}`, `voice.tone: …`, `workstream: {name}`, `artifact_kind: <derived>`) + section H1 from Q1
  - Use atomicWriteFileSync per file, then a single `brief-tools commit --files <3 paths>` (audience-guard.md Step 4 atomic 3-file commit pattern, line 200)
  - On any individual write failure, roll back ALL 3 files (defensive — unlink any successfully-written files on the way down) — re-uses `brief-tools commit` atomicity contract
- Step 5: SUCCESS HANDOFF
  - Print: `✅ workstream '{name}' 생성 완료 — '/brief-design {name}'으로 작업을 시작할 수 있습니다.`
  - English variant otherwise

**Cross-references:**
- `brief/bin/lib/workstream-loader.cjs` MUST validate the new spec.yaml (Phase 7 D-13 extension)
- `brief/bin/brief-tools.cjs case 'add-workstream':` dispatcher
- `tests/brief-add-workstream-flow.test.cjs` exercises 4-6 Q&A round-trip
- `tests/brief-add-workstream-name-collision.test.cjs` exercises BLOCK + fork-or-new branching
- `tests/brief-add-workstream-skeleton-atomic.test.cjs` exercises the 3-file atomic write rollback

---

### 9 Built-in Workstreams (BMC / GTM / FINANCIAL / OPERATIONS / COMPLIANCE / ROADMAP / BRAND / RISK / TECH-ARCH)

Each workstream has 3 files: `spec.yaml`, `design-prompts.md`, `templates/artifact.md`.

#### `brief/workstreams/{slug}/spec.yaml`

**Analog:** `brief/workstreams/_example/spec.yaml` (full file):

```yaml
name: _example
description: Example workstream proving the loader picks up a spec.yaml without code changes (FND-08 acceptance demo; Phase 7 replaces this with real workstreams).
research_prompts:
  - "What is the current state of X in the target market?"
  - "Who are the top 3 competitors for X?"
design_prompts:
  - "Draft an artifact describing X per the template."
output_artifact_template: templates/artifact.md
```

**Deltas vs analog (per workstream):**
- `name` matches directory name (Phase 2 D-13 enforced)
- `description` workstream-specific (1-2 sentences per CONTEXT.md `## 9 Built-in Workstream Content Architecture` per workstream)
- `research_prompts` cite DISCOVER outputs (e.g., BMC pulls from customer-research, market-sizing, competitor-landscape, pricing-benchmarks per CONTEXT lines 328-331)
- `design_prompts` MUST use `[file:design-prompts.md]` pattern (CONTEXT line 332-333)
- `output_artifact_template: templates/artifact.md`
- ADD `gates_required: [align, audience, compliance]` (Phase 7 D-13 NEW)
- ADD `depends_on: []` (informational; populated per soft-recommended order — BMC has empty, GTM has `[business-model-canvas]`, FINANCIAL has `[business-model-canvas, go-to-market]`, etc.) — soft-order from CONTEXT.md `D-07: BMC → GTM → BRAND → OPERATIONS → FINANCIAL → RISK → ROADMAP → TECH-ARCH → COMPLIANCE`
- BMC spec example fully shown in CONTEXT lines 322-334 — copy verbatim

#### `brief/workstreams/{slug}/design-prompts.md`

**Analog:** `agents/brief-domain-researcher.md` `<process>` body — the parameterized prompt body that ships with conditional B2B/B2C prose (Phase 5 D-15).

**Pattern from analog (CONTEXT.md `### BMC` lines 387-400):**

```markdown
If business_model in [b2b, enterprise]:
  Section 1 (Customer Segments) emphasizes ICP firmographics: industry, company size band, geography, technographics.
  Section 3 (Channels) emphasizes sales-led motion: direct sales, partner channels, RFP processes, procurement cycle stage.
  ...

If business_model in [b2c, b2b2c]:
  Section 1 (Customer Segments) emphasizes personas: jobs-to-be-done, demographic + behavioral cohorts, psychographic frames.
  Section 3 (Channels) emphasizes distribution: app stores, social, influencer, retail/e-commerce, viral mechanics.
  ...
```

**Deltas vs analog (per workstream):**
- BMC: 9-block Strategyzer guidance with B2B/B2C conditional prose for blocks 1, 3, 4, 5
- GTM: 4-section Sequoia 10-slide adaptation (Problem / Solution / Market / GTM Plan) with B2B/B2C divergence on sales motion vs viral mechanics
- FINANCIAL: driver-based bottom-up reasoning instructions; explicit `[VERIFIED:user-supplied]` / `[ASSUMED:multiplier-X]` provenance discipline; sensitivity bands × 0.7/1.0/1.3 instruction
- OPERATIONS: org chart / hiring plan / tool stack / SOP catalogue
- COMPLIANCE: region+industry-aware findings auto-loading Phase 5 primers
- ROADMAP: phased business roadmap (distinct from BRIEF tool's `.planning/ROADMAP.md`)
- BRAND: 3-5 messaging pillars + voice attributes + tone matrix + positioning statement
- RISK: Risk Register across 5 categories (Technology / Market / Regulatory / Financial / Operational) + mitigations
- TECH-ARCH: Marty Cagan SVPG Experience/Platform team topology framing; explicit DSG-09 boundary "high-level NOT detailed design"
- All 9 design-prompts.md files MUST contain at least one `If business_model in [b2b...]:` AND at least one `If business_model in [b2c...]:` block (D-14 — `tests/brief-workstream-spec-conditional-prose.test.cjs` enforces)

#### `brief/workstreams/{slug}/templates/artifact.md`

**Analog:** `brief/workstreams/_example/templates/artifact.md` (10 lines):

```markdown
---
audience: internal
confidentiality: internal-only
voice: direct
workstream: _example
---

# Example Artifact

This is a placeholder artifact ...
```

**Deltas vs analog (per workstream):**
- Frontmatter MUST include the 3 mandatory AUDIENCE fields (Phase 5 D-10): `audience.type`, `audience.confidentiality`, `business_context.model` (with template variables `{{business_model}}` populated by context-inject at write time per Phase 5 D-13)
- Frontmatter ADDS workstream-specific fields: `workstream: <slug>`, `artifact_kind: <category>` (e.g., `bmc`, `gtm`, `financial`)
- Body sections: workstream-specific section list per CONTEXT.md `## 9 Built-in Workstream Content Architecture`
- BMC body: 9 sections matching Strategyzer canonical 9 blocks (CONTEXT lines 339-385)
- GTM body: Sequoia-10-slide-adapted 4 sections + B2B/B2C variant blocks
- FINANCIAL body: driver table + 12-month projection table + sensitivity bands + provenance tags
- All 9 templates carry a `## Sources` footer citing OBJECTIVES.md + DISCOVER outputs with `[VERIFIED:...|date]` tags (Phase 5 CC-04 inheritance)

**Cross-references for all 9 workstreams:**
- Loaded by `brief/bin/lib/workstream-loader.cjs loadWorkstreams()` — Phase 7 D-13 extends validation
- Read by `brief/workflows/design.md` Step 5 Task spawn
- `tests/brief-workstreams-9-builtin-loadable.test.cjs` asserts all 9 parse without throwing
- `tests/brief-workstream-spec-conditional-prose.test.cjs` asserts conditional B2B/B2C prose presence in all 9 design-prompts.md files

---

### `brief/bin/lib/workstream-loader.cjs` (utility, MODIFIED — additive extension)

**Analog (modification pattern):** `brief/bin/lib/audience.cjs` lines 44-47 (closed-set ENUM constants pattern) + lines 130-147 (validation loop with field-by-field type check + closed-set membership).

**Existing validation pattern** (current `workstream-loader.cjs` lines 60-83):

```javascript
if (!Array.isArray(parsed.research_prompts) || parsed.research_prompts.length === 0) {
  throw new Error(`Workstream "${dir}": missing required research_prompts (non-empty list)`);
}
if (!Array.isArray(parsed.design_prompts) || parsed.design_prompts.length === 0) {
  throw new Error(`Workstream "${dir}": missing required design_prompts (non-empty list)`);
}
if (!parsed.output_artifact_template || typeof parsed.output_artifact_template !== 'string') {
  throw new Error(`Workstream "${dir}": missing required output_artifact_template`);
}
```

**Deltas vs analog (additive extension after line 83):**

```javascript
// Phase 7 D-13 extension: gates_required + depends_on
const VALID_GATES = new Set(['align', 'audience', 'compliance']);
if (parsed.gates_required !== undefined) {
  if (!Array.isArray(parsed.gates_required)) {
    throw new Error(`Workstream "${dir}": gates_required must be a list (got ${typeof parsed.gates_required})`);
  }
  for (const g of parsed.gates_required) {
    if (!VALID_GATES.has(g)) {
      throw new Error(`Workstream "${dir}": gates_required contains invalid gate "${g}" (valid: align, audience, compliance)`);
    }
  }
}
if (parsed.depends_on !== undefined) {
  if (!Array.isArray(parsed.depends_on)) {
    throw new Error(`Workstream "${dir}": depends_on must be a list of slugs (got ${typeof parsed.depends_on})`);
  }
  for (const slug of parsed.depends_on) {
    if (typeof slug !== 'string' || slug.length === 0) {
      throw new Error(`Workstream "${dir}": depends_on contains non-string entry`);
    }
    // NOTE: forward-references allowed per D-13 — referenced workstream may not exist at load time
  }
}
```

**Default fields when absent:**
- `gates_required` defaults to `['align', 'audience', 'compliance']` (D-10)
- `depends_on` defaults to `[]`

**Apply defaults at end of loop** (after line 105 of analog — between `for (const k of Object.keys(parsed)) spec[k] = parsed[k];` and `specs.push(spec);`):

```javascript
if (spec.gates_required === undefined) spec.gates_required = ['align', 'audience', 'compliance'];
if (spec.depends_on === undefined) spec.depends_on = [];
```

**Cross-references:**
- `brief/workflows/design.md` reads `gates_required` to know which gates to run on the artifact (D-10)
- `brief/workflows/design.md` reads `depends_on` for the soft-order "Recommended next" computation (D-07)
- `brief/bin/lib/status.cjs` reads `depends_on` for the dashboard "Recommended next" line (D-08)
- `tests/brief-workstream-loader-extensions.test.cjs` asserts new field validation + defaults

---

### `brief/bin/lib/status.cjs` (utility, MODIFIED — additive extension)

**Analog (modification pattern):** `brief/bin/lib/status.cjs` itself lines 119-136 (the round-trips derive-at-read pattern is the canonical precedent for "Recommended next" derive-at-read).

**Existing dashboard pattern** (current lines 138-151):

```javascript
const lines = [
  'BRIEF Status',
  '='.repeat(32),
  phaseLine,
  `  Workstream      ${workstream}`,
  `  Return stack    ${returnStackDepth} / 3`,
  `  Last ALIGN      ${alignLine}`,
  `  Last AUDIENCE   ${audienceLine}`,
  `  Last COMPLIANCE ${complianceLine}`,
  `  Gap loop        ${activeTopic}`,
  `  Round-trips     ${roundTripLine}`,
  '-'.repeat(32),
  `  Next: ${nextHint}`,
];
```

The compliance row at line 146 already exists (`Last COMPLIANCE`). Phase 7 ACTIVATES it by writing to `state.brief.last_gate_results.compliance`. NO change to status.cjs for this — already in place.

**Phase 7 NEW additions to status.cjs:**

1. **Recommended-next derivation** (D-07 + D-08):

   ```javascript
   // Phase 7 — Recommended next workstream derivation (D-06 derive-at-read).
   // Reads loadWorkstreams() and finds the first workstream where:
   //   - depends_on are all completed (state.brief.workstreams_completed includes all)
   //   - workstream itself is not yet completed
   const { loadWorkstreams } = require('./workstream-loader.cjs');
   function computeRecommendedNext(cwd, briefState) {
     try {
       const ws = loadWorkstreams(cwd);
       const completed = new Set(Array.isArray(briefState.workstreams_completed) ? briefState.workstreams_completed : []);
       for (const s of ws) {
         if (completed.has(s.slug)) continue;
         const depsOk = (s.depends_on || []).every(d => completed.has(d));
         if (depsOk) return s.slug;
       }
       return '—';
     } catch {
       return '—';
     }
   }
   ```

2. **New dashboard line** (after `Last COMPLIANCE`):

   ```javascript
   const recommendedNext = computeRecommendedNext(cwd, brief);
   const lines = [
     // ... existing lines through Last COMPLIANCE ...
     `  Recommended next ${recommendedNext}`,
     // ... continue to Gap loop / Round-trips / Next ...
   ];
   ```

3. **D-17 resilience**: NEVER throw on missing workstreams or partial state (graceful `'—'` fallback)

**Cross-references:**
- Reads `state.brief.workstreams_completed` (Phase 7 may add this field; per Phase 2 D-21 allowlist extension pattern — verify in plan-phase whether this is added to allowlist)
- Reads `loadWorkstreams(cwd)` from the modified workstream-loader.cjs
- `tests/brief-design-recommended-next.test.cjs` exercises the derivation logic

---

### `brief/bin/brief-tools.cjs` (dispatcher, MODIFIED — 3 NEW dispatcher cases)

**Analog (modification pattern):** `brief/bin/brief-tools.cjs` lines 558-635 (`case 'audience':`) — literal copy-rename source for `case 'compliance':`. Also lines 637-810 (`case 'gap-detect':`) for multi-subcommand dispatcher pattern.

**Existing `case 'audience':` pattern** (lines 558-635):

```javascript
case 'audience': {
  const audience = require('./lib/audience.cjs');
  const audSubcommand = args[1];
  // ... arg parsing ...
  if (audSubcommand === 'run') {
    // ... runDeterministicScreen + writeVerdict on short-circuit OR emit deterministic_findings ...
    break;
  }
  if (audSubcommand === 'commit') {
    // ... commitAudienceVerdict ...
    break;
  }
  error(`audience: unknown subcommand '${audSubcommand}'. Valid: run, commit`);
  break;
}
```

**Deltas vs analog (3 NEW cases):**

#### Case 1: `case 'compliance':` (literal copy-rename of `case 'audience':`)

```javascript
case 'compliance': {
  const compliance = require('./lib/compliance.cjs');
  const compSubcommand = args[1];
  const compArtIdx = args.indexOf('--artifact');
  const compBaseIdx = args.indexOf('--baseline');
  const compOutIdx = args.indexOf('--verdict-out');
  const compVIdx = args.indexOf('--verdict');
  const compReasonIdx = args.indexOf('--override-reason');
  const compOverride = args.includes('--override');

  if (compSubcommand === 'run') {
    // ... runDeterministicScreen + writeVerdict on short-circuit OR emit deterministic_findings ...
    break;
  }
  if (compSubcommand === 'commit') {
    // ... commitComplianceVerdict ...
    break;
  }
  error(`compliance: unknown subcommand '${compSubcommand}'. Valid: run, commit`);
  break;
}
```

#### Case 2: `case 'design':` (workflow dispatcher — minimal — workflow markdown does the heavy lifting)

This is more like a thin entry point. Most of the work is in `brief/workflows/design.md`. The dispatcher handles: workstream-loader load (return JSON for the workflow to consume), state.brief.last_design_workstream write, recommended-next computation. Pattern parallels `case 'objectives':` (Phase 3 simple lookup dispatchers) — verify exact pattern in plan-phase by inspecting `case 'objectives':`.

#### Case 3: `case 'add-workstream':` (skeleton-write dispatcher)

Subcommands:
- `add-workstream check-collision --name <name>` — invokes `loadWorkstreams()` + slug-collision detection; returns JSON with `{collides: bool, existing_slug?: string}`
- `add-workstream check-overlap --name <name> --description <desc>` — keyword-overlap heuristic; returns JSON with `{overlap: bool, candidates: string[]}`
- `add-workstream write --name <name> --spec <json> --design-prompts <path> --template <path>` — atomic 3-file write

**Cross-references:**
- `brief/workflows/compliance.md` Step 1 + Step 4 invoke `compliance run` / `compliance commit`
- `brief/workflows/design.md` may invoke `design get-workstream` for spec + recommended-next lookup
- `brief/workflows/add-workstream.md` invokes the 3 `add-workstream` subcommands

---

### `bin/install.js` (installer, MODIFIED — verify additive coverage)

**Analog:** `bin/install.js` lines 5685-5774 (the existing `brief/` skill copy + `agents/` directory walk).

**Existing pattern** (line 5685, 5697-5774):

```javascript
const skillSrc = path.join(src, 'brief');
const skillDest = path.join(targetDir, 'brief');
const savedGsdArtifacts = preserveUserArtifacts(skillDest, ['USER-PROFILE.md']);
copyWithPathReplacement(skillSrc, skillDest, pathPrefix, runtime, false, isGlobal);
restoreUserArtifacts(skillDest, savedGsdArtifacts);
// ...
const agentsSrc = path.join(src, 'agents');
const agentEntries = fs.readdirSync(agentsSrc, { withFileTypes: true });
for (const entry of agentEntries) {
  if (entry.isFile() && entry.name.endsWith('.md')) {
    let content = fs.readFileSync(path.join(agentsSrc, entry.name), 'utf8');
    // ... (path replacement, attribution, runtime conversions) ...
    fs.writeFileSync(path.join(agentsDest, destName), content);
  }
}
```

**Deltas vs analog:**

The good news: `copyWithPathReplacement` is a recursive directory copy that automatically picks up:
- `brief/workflows/compliance.md` (NEW workflow markdown)
- `brief/workflows/design.md` (NEW workflow markdown)
- `brief/workflows/add-workstream.md` (NEW workflow markdown)
- `brief/bin/lib/compliance.cjs` (NEW lib)
- `brief/bin/lib/compliance-report.cjs` (NEW lib)
- `brief/references/compliance-vocabulary.md` (NEW reference)
- All 9 `brief/workstreams/{slug}/` folders + their 3 files each (NEW workstream content)

And `agentEntries` walk automatically picks up:
- `agents/brief-compliance-checker.md` (NEW agent)

And the `commands/brief/` walk (called by various `copyCommandsAs*Skills` functions starting line 5490) automatically picks up:
- `commands/brief/design.md` (NEW command)
- `commands/brief/add-workstream.md` (NEW command)

**EXPECTED:** ZERO source-code change in `install.js` for Phase 7. Verify in plan-phase by:
1. Adding the new files to a working tree
2. Running `node bin/install.js --target /tmp/test-install` and `ls /tmp/test-install/brief/workstreams/` shows all 9 + `_example`
3. `ls /tmp/test-install/agents/` shows `brief-compliance-checker.md`
4. `ls /tmp/test-install/commands/brief/` shows `design.md` and `add-workstream.md`

If a file fails to install, that's the signal something needs adding to install.js — but the Phase 5/6 precedents (which added `audience-vocabulary.md`, `gap-detect.cjs`, `gap-detector.md`, etc., all without install.js changes) suggest no change is needed.

**Cross-references:**
- `tests/agent-install-validation.test.cjs` — already exists; add Phase 7 entries to expected-files manifest

---

## Shared Patterns (cross-cutting concerns applied to multiple Phase 7 files)

### Korean-language switching

**Source:** `brief/bin/lib/align.cjs detectKoreaSignalFromConfig` (re-exported by `audience.cjs`); used by every gate's report renderer.

**Apply to:**
- `brief/bin/lib/compliance.cjs` (re-uses `detectKoreaSignalFromConfig`)
- `brief/bin/lib/compliance-report.cjs` (`opts.korea` flag drives header language + disclaimer language)
- `brief/workflows/compliance.md` (Korean error text + 3-path interrupt prose)
- `brief/workflows/design.md` (workstream selection prompt + handoff prompt + driver Q&A — Korean by default)
- `brief/workflows/add-workstream.md` (Q&A wording + collision error + success message)
- All 9 `design-prompts.md` files (conditional B2B/B2C prose can include Korean cues per workstream)

```javascript
// from align.cjs — the canonical helper
const { detectKoreaSignalFromConfig } = require('./align.cjs');
const korea = detectKoreaSignalFromConfig(cwd);
// then use korea ? '한국어 prose' : 'English prose'
```

### Atomic 3-file commit (gate verdict path)

**Source:** `brief/bin/lib/audience.cjs commitAudienceVerdict` (lines 365-414) → `brief-tools commit --files artifact .audience.md STATE.md`

**Apply to:**
- `brief/bin/lib/compliance.cjs commitComplianceVerdict` (same shape: artifact + .compliance.md + STATE.md)
- `brief/workflows/add-workstream.md` Step 4 (3-file write: spec.yaml + design-prompts.md + templates/artifact.md, BUT no STATE.md update — the workstream itself is added to disk; NO state mutation)

```javascript
// from audience.cjs commitAudienceVerdict pattern
try {
  // ... validate, render, atomic-write sibling, readModifyWriteStateMd ...
} finally {
  try { fs.unlinkSync(verdictPath); } catch { /* already deleted */ }
}
```

### Vocabulary ban-list discipline

**Source:** `brief/references/audience-vocabulary.md` + `tests/brief-audience-vocabulary-lock.test.cjs` (lines 1-208).

**Apply to:**
- `brief/references/compliance-vocabulary.md` (NEW — compliance ban-list extends audience ban-list)
- `agents/brief-compliance-checker.md` `<vocabulary_discipline>` block — ban tokens permitted ONLY inside this block
- `brief/workflows/compliance.md` — zero ban-list tokens anywhere (orchestration prose discipline)
- All emitted `{artifact}.compliance.md` outputs — zero ban-list tokens
- Enforced by `tests/brief-compliance-vocabulary-lock.test.cjs` (literal copy-rename of audience-vocabulary-lock test)

### Force-accept override audit-trail

**Source:** `brief/workflows/audience-guard.md` Step 6 (lines 290-333) + `brief/bin/lib/audience.cjs commitAudienceVerdict` override branch (lines 376-407).

**Apply to:**
- `brief/workflows/compliance.md` Step 6 — same shape; user types reason, sanitize via `security.cjs sanitizeForPrompt`, write `state.brief.last_gate_results.compliance.{override: true, override_reason}` + render `## User Override` section in `{artifact}.compliance.md`
- Override reason MUST be ≥ 20 non-whitespace chars (Phase 6 D-08 floor inheritance)

```javascript
// audience.cjs commitAudienceVerdict (lines 386-407) — verbatim shape
const sanitizedReason = override ? sanitizeForPrompt(rawReason) : '';
fm.brief.last_gate_results.audience = {
  decision: override ? 'AUDIENCE-OK' : verdict.decision,
  // ... etc ...
  ...(override ? { override: true, override_reason: sanitizedReason } : {}),
};
```

### Hooks anti-pattern enforcement

**Source:** `brief/workflows/audience-guard.md` `<no_hooks_assertion>` block (lines 350-369) + `tests/brief-audience-no-hook.test.cjs`.

**Apply to:**
- `brief/workflows/compliance.md` `<no_hooks_assertion>` (literal copy-rename — references compliance-checker / compliance.md)
- `brief/workflows/design.md` `<no_hooks_assertion>`
- `brief/workflows/add-workstream.md` `<no_hooks_assertion>`
- `tests/brief-compliance-no-hooks.test.cjs` (greps `hooks/` for any compliance-related references)

```bash
# Structural test pattern
! grep -r "compliance-checker\|brief-compliance-checker\|compliance_checker" hooks/ 2>/dev/null
! grep -r "compliance.md\|brief/workflows/compliance" hooks/ 2>/dev/null
```

### Surface-cap forbidden command list

**Source:** `brief/workflows/audience-guard.md` `<command_surface_assertion>` block (lines 372-395).

**Apply to:**
- `brief/workflows/compliance.md` `<command_surface_assertion>` — extend FORBIDDEN list with: `commands/brief/recompliance.md`, `commands/brief/realign-workstream.md`, `commands/brief/design-all.md`, `commands/brief/refinancial.md`
- `brief/workflows/design.md` `<command_surface_assertion>` — same FORBIDDEN list
- `tests/brief-design-surface-cap.test.cjs`:
  ```bash
  [ ! -f commands/brief/recompliance.md ] && \
  [ ! -f commands/brief/realign-workstream.md ] && \
  [ ! -f commands/brief/design-all.md ] && \
  [ ! -f commands/brief/refinancial.md ] && \
  [ ! -f commands/brief/recompliance-pack.md ] && \
  [ ! -f commands/brief/redesign.md ]
  ```

### Provenance tag discipline (Phase 5 CC-04 inheritance)

**Source:** Phase 5 `brief-domain-researcher.md` outputs — every research line carries `[VERIFIED:<source>|<date>]` or `[ASSUMED:<reasoning>]` or `[CITED:<url>]`.

**Apply to:**
- All 9 `brief/workstreams/{slug}/templates/artifact.md` `## Sources` footers (CITED template variables)
- `brief/workstreams/financial/templates/artifact.md` driver table cells — every projection cell carries `[VERIFIED:user-supplied]` (driver-derived) or `[ASSUMED:multiplier-X]` (sensitivity multiplier) per D-15
- `tests/brief-financial-provenance.test.cjs` enforces

### Workflow markdown + lib.cjs split (Phase 2 D-18)

**Source:** Pattern explicit in CONTEXT.md `## Established Patterns` line 313 — every gate has 3 components (agent + workflow + lib) ≤ ~400 lines per file.

**Apply to:**
- All Phase 7 NEW files maintain ≤ 400 lines:
  - `brief/bin/lib/compliance.cjs` ≤ 400 lines (split off `compliance-report.cjs` to enforce)
  - `brief/workflows/design.md` may push the limit due to FINANCIAL Q&A branch — monitor in plan-phase
  - `agents/brief-compliance-checker.md` ≤ 400 lines (analog audience-guard is 286)

---

## No Analog Found

No files in Phase 7 lack an analog. Phase 7 is the textbook canonical-pattern fourth instance + workstream-as-config extension; every file maps to a stable precedent.

The closest case to "novel" is `brief/workflows/design.md` Step 5.5 (FINANCIAL driver Q&A branch) — but the analog is `brief/workflows/define.md` Mode A's 8-question sequential AskUserQuestion chain (Steps 2A.1-2A.7), and the same TEXT_MODE numbered-list fallback discipline applies.

## Metadata

**Analog search scope:**
- `agents/*.md` (all 23 BRIEF agent files)
- `brief/workflows/*.md` (all 60+ workflow files; primarily align-gate.md / audience-guard.md / gap-detect.md / discover.md / define.md)
- `brief/bin/lib/*.cjs` (all 36 lib files; primarily align.cjs / audience.cjs / gap-detect.cjs / status.cjs / workstream-loader.cjs / context-inject.cjs)
- `brief/references/*.md` (vocabulary files + compliance/korea/ primers)
- `commands/brief/*.md` (existing commands; primarily discover.md / define.md)
- `brief/workstreams/_example/` (2 files; the only existing workstream)
- `tests/brief-*.test.cjs` (66+ test files; canary-e2e + vocabulary-lock + state-roundtrip patterns)
- `bin/install.js` (relevant copy walks at lines 5680-5774)
- `brief/bin/brief-tools.cjs` (dispatcher cases at lines 486-810)

**Files scanned:** ~150 source files + ~70 test files

**Pattern extraction date:** 2026-04-25

**Confidence per pattern domain:**
- Canonical gate pattern (third instance for COMPLIANCE): HIGH — three prior instances (ALIGN, AUDIENCE, gap-detect) stabilized the shape
- Workstream-as-config extension (D-13): HIGH — `_example/spec.yaml` already proves the loader works; Phase 7 D-13 only adds 2 fields
- Workflow markdown + lib split (Phase 2 D-18): HIGH — every existing gate follows this pattern verbatim
- 9 built-in workstream content depth: MEDIUM — content is per-workstream Discretion; Strategyzer/Sequoia/Marty Cagan canonical references are well-established but exact section lists are planner's domain
- FINANCIAL driver Q&A: MEDIUM — pattern (8-12 sequential questions) inherits from define.md Mode A, but exact question wording is Discretion
- Korean disclaimer wording: HIGH — exact verbatim string locked in `brief/references/compliance/korea/pipa-2026.md` lines 50-56
- 3-path interrupt for FINDINGS-BLOCKING: HIGH — same shape as Phase 4 D-06 / Phase 5 D-09; Korean wording locked

## PATTERN MAPPING COMPLETE

**Phase:** 7 — DESIGN — Workstream Orchestration + COMPLIANCE Checker
**Files classified:** 60 (28 NEW + 4 MODIFIED + 28 NEW test files)
**Analogs found:** 60 / 60

### Coverage
- Files with exact analog: 38 (all gate triad files; copy-rename of audience.cjs/audience-report.cjs/audience-guard.md/audience-vocabulary.md; tests; install.js inheritance)
- Files with role-match analog: 22 (9 workstream bundles × 3 files = 27, but bundled — counted as 22 by role; design.md / add-workstream.md / Q&A test files)
- Files with no analog: 0

### Key Patterns Identified
- **Canonical gate pattern (third instance for COMPLIANCE):** literal copy-rename of `audience.cjs` / `audience-report.cjs` / `agents/brief-audience-guard.md` / `brief/workflows/audience-guard.md` / `brief/references/audience-vocabulary.md`. The fourth instance gap-detect already proves the pattern is stable; Phase 7 must NOT invent novel structure. ONE load-bearing deviation: `mergeVerdicts` preserves a distinct `FINDINGS-MATERIAL` decision (Phase 4/5 collapse material+nice-to-have into ALIGNED/AUDIENCE-OK; Phase 7 must NOT collapse — structurally tested in `tests/brief-compliance-merge-rule.test.cjs`).
- **Workstream-as-config (Phase 2 D-13 + Phase 7 D-13 extension):** all 9 built-in workstreams ship as `brief/workstreams/{slug}/{spec.yaml,design-prompts.md,templates/artifact.md}` triplets — NO `.cjs` source per workstream. Loader extends with `gates_required` + `depends_on` validation. The user-facing `/brief-add-workstream` command writes the same triplet atomically (3-file commit semantics from `brief-tools commit --files`).
- **Workflow markdown + lib.cjs split (Phase 2 D-18):** preserved across all NEW files; lib + report renderer split keeps each ≤ 400 lines.
- **Sequential 3-gate threading (D-02):** lives inside `brief/workflows/design.md` post-artifact-write block; calls `brief/workflows/align-gate.md` → `audience-guard.md` → `compliance.md` in series with fail-fast on BLOCKING. Each gate workflow remains self-contained — design.md only sequences.
- **Korea-first language switching:** every NEW file inherits `detectKoreaSignalFromConfig` from `align.cjs`; Korean text is the default for `region: kr`.
- **Atomic 3-file commit pattern:** `add-workstream.md` Step 4 mirrors `audience-guard.md` Step 4 (artifact + sibling + STATE.md) — but for `add-workstream` the 3 files are spec.yaml + design-prompts.md + templates/artifact.md; NO STATE.md mutation.
- **Surface cap NET +2:** only `commands/brief/design.md` + `commands/brief/add-workstream.md` as new user-facing commands. ALL re-gating is via re-running `/brief-design <workstream>` — no `/brief-recompliance`, `/brief-realign-workstream`, `/brief-design-all`, `/brief-refinancial` allowed.
- **Hooks anti-pattern enforcement:** all 3 NEW workflows ship `<no_hooks_assertion>` blocks; structural tests (`tests/brief-compliance-no-hooks.test.cjs`) grep `hooks/` and assert empty.
- **Mandatory disclaimer footer:** every emitted `{artifact}.compliance.md` carries the verbatim PIPA disclaimer (Korean when region:kr, English otherwise) matching `brief/references/compliance/korea/pipa-2026.md` lines 50-56 — `tests/brief-pipa-disclaimer-verbatim.test.cjs` enforces.

### File Created
`/Users/agent/GSD-for-Business/.planning/phases/07-design-workstream-orchestration-compliance-checker/07-PATTERNS.md`

### Ready for Planning
Pattern mapping complete. Planner can now reference analog patterns directly in PLAN.md files. The duplicate-rename instructions for COMPLIANCE checker have concrete file-path + line-number targets in the analog. The 9 workstream bundles have a clear `_example/` precedent + per-workstream content sources from CONTEXT.md/RESEARCH.md. The 4 MODIFIED files have additive-only extension patterns documented with analog precedents (workstream-loader.cjs follows audience.cjs MANDATORY_FRONTMATTER_FIELDS shape; status.cjs follows the round-trips derive-at-read pattern from itself; brief-tools.cjs follows the case 'audience': dispatcher pattern; install.js requires NO change because existing directory walks pick up new files).
