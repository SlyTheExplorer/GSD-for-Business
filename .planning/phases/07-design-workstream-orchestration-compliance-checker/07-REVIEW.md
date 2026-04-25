---
phase: 07
status: findings
review_depth: standard
files_reviewed: 14
findings:
  critical: 0
  warning: 4
  info: 7
  total: 11
reviewed_at: 2026-04-26
---

# Phase 07: Code Review Report

**Reviewed:** 2026-04-26
**Depth:** standard
**Status:** findings (no Critical; 4 Warning; 7 Info)

## Summary

Phase 7 ships the third canonical evaluator-optimizer gate (COMPLIANCE) following the Phase 4 ALIGN / Phase 5 AUDIENCE / Phase 6 gap-detect precedents, plus the `/brief-design` single-workstream-per-session orchestrator and `/brief-add-workstream` 4-6 Q&A skeleton-write surface. Canonical-pattern preservation is good: `compliance.cjs`, `compliance-report.cjs`, and `agents/brief-compliance-checker.md` are clear copy-renames from Phase 5 audience.* with the explicit Phase 7 D-01 LOAD-BEARING DEVIATION (`mergeVerdicts` returns `FINDINGS-MATERIAL` distinct from `COMPLIANCE-OK`) correctly implemented and tested.

The PIPA disclaimer wording is byte-identical between `compliance-report.cjs` and `brief/references/compliance/korea/pipa-2026.md` (both Korean and English variants). Vocabulary-lock discipline holds for the strict-ban triple (compliance.cjs / compliance-report.cjs / brief-compliance-checker.md) — any ban-list tokens that appear are inside permitted regions (regex literals, `<vocabulary_discipline>` blocks, or the `_disclaimerFooter` function whose body is exempted by the vocabulary-lock test). No PostToolUse / SubagentStop hooks reference the new surfaces. The dispatcher cases (`compliance`, `design`, `add-workstream`) are additive and don't break existing cases. State allowlist extension (`last_design_workstream`, `workstreams_completed`, `financial_drivers`) is documented in the header and round-trips through the existing `extractFrontmatter` / `reconstructFrontmatter` preserve-wholesale path.

The 4 Warning-level findings cluster around two recurring drift patterns: (a) workflow markdown invokes a `brief-tools state set --path brief.X` dispatcher subcommand that is NOT implemented in `brief-tools.cjs` (3 call-sites across `design.md` and `design-financial-qa.md`), and (b) one workflow has `state json --path` where the actual flag is `--pick`. These are documentation-vs-runtime drift and would surface as runtime failures during Plan 07-08 canary E2E (the workflows say they're not exercised end-to-end until then, so the failures would only manifest on the v1 dogfooding pass). Other Warning items: a YAML emitter that doesn't quote individual array elements (potential malformed YAML when "Other" compliance pack contains commas / special chars) and one workflow grep example that is overly broad (matches a benign hit in `brief-validate-provenance.sh`).

The 7 Info-level findings are minor: dead-code Korean prose branch in Screen (a), Korean grammar nits in user-facing prose, ban-list `위반` token retained inside a regulatory-citation disclaimer (intentional and tested), and `validateVerdict` accepting empty strings for optional clause fields when the agent is instructed to omit them.

## Warnings

### WR-01: `brief-tools state set --path` invoked by workflow but dispatcher subcommand does not exist

**Severity:** Warning
**Files:** `brief/workflows/design.md:142-145`, `brief/workflows/design.md:294-297`, `brief/workflows/design-financial-qa.md:162-165`
**Issue:** Three workflow steps invoke `node brief/bin/brief-tools.cjs state set --path brief.<field> --value <value>`. The `state` case in `brief/bin/brief-tools.cjs` (lines 425-484) supports subcommands `json | update | get | patch | advance-plan | record-metric | update-progress | add-decision | add-blocker | resolve-blocker | record-session | begin-phase | signal-waiting | signal-resume | planned-phase | validate | sync | prune` — there is no `set` branch. Calling `state set` falls through the if-else chain to the default `state.cmdStateLoad(cwd, raw)` at line 481, which silently does the wrong thing (loads & prints state instead of writing). No CLI or library code actually persists `brief.workstream_paused`, `brief.last_design_workstream`, or `brief.financial_drivers` via this path. The workflow markdown is annotated "the body is not exercised end-to-end until Plan 08 canary, by which time Plan 07's allowlist extension exists" — but the allowlist extension (Plan 07-07) only adds documentation comments + freezes a `PHASE_7_BRIEF_FIELDS` list; it does not introduce a `state set --path` subcommand. The dispatcher is missing a `state set` arm.
**Fix:** Either (a) add a `state set --path <dotted> --value <json|string>` branch in the `case 'state':` block of `brief/bin/brief-tools.cjs` (preferred; matches how Phase 6 gap-detect.cjs persists `brief.return_stack` via `readModifyWriteStateMd` + `extractFrontmatter` + `reconstructFrontmatter`), or (b) rewrite the three workflow call-sites to invoke `node -e "..."` one-liners that read STATE.md, mutate `brief.<field>`, and call `writeStateMd` (verbose but no dispatcher change required). Option (a) is cleaner and consistent with prior allowlist write patterns. Example:
```javascript
} else if (subcommand === 'set') {
  const { path: dotted, value } = parseNamedArgs(args, ['path', 'value']);
  if (!dotted) error('state set requires --path <dotted>');
  state.cmdStateSetPath(cwd, dotted, value, raw);
}
```
with `cmdStateSetPath` implementing dotted-path mutation under the lock + frontmatter round-trip.

### WR-02: `state json --path` flag does not exist (CLI uses `--pick`)

**Severity:** Warning
**File:** `brief/workflows/design.md:323`
**Issue:** Step 7 invokes `node brief/bin/brief-tools.cjs state json --path brief.workstreams_completed`. The CLI top-level flag for field extraction is `--pick` (defined in `brief/bin/brief-tools.cjs:294-302`), not `--path`. `--path` is only recognized as a subcommand-internal flag in some other commands (e.g., the unimplemented `state set --path`, frontmatter context). When the workflow runs, `--path brief.workstreams_completed` is silently consumed as an unknown flag — `state json` emits the full STATE.md frontmatter, and the subsequent `design recommended-next --completed "$(...)"` receives the whole JSON blob rather than just the array, then probably parses it as the JSON-form workstreams_completed key OR fails the `JSON.parse(trimmed)` and falls back to `[]` (line 802-805), making `recommended_next` always derive from an empty completed list.
**Fix:** Change `--path` to `--pick`:
```bash
--completed "$(node brief/bin/brief-tools.cjs state json --pick brief.workstreams_completed --raw)"
```
Note: `--raw` is also useful here so the JSON wrapper isn't included; verify the exact pick-semantics in `core.output(... raw)` — the `--pick` extractor at lines 297-302 trims output to the picked field. This was apparently caught for the `--completed` parser tolerating both CSV and JSON-array forms (lines 798-808), but the actual data being passed through is whatever `state json` emits without any field projection — likely a multi-line JSON object that fails both branches.

### WR-03: `add-workstream write` YAML emitter does not quote array elements (malformed YAML if elements contain commas / brackets / colons)

**Severity:** Warning
**File:** `brief/bin/brief-tools.cjs:1034-1049`
**Issue:** The minimal YAML serializer for `compliance_packs`, `gates_required`, and `depends_on` writes them as flow-style arrays:
```javascript
lines.push(`gates_required: [${gates.join(', ')}]`);
lines.push(`depends_on: [${deps.join(', ')}]`);
lines.push(`compliance_packs: [${spec.compliance_packs.join(', ')}]`);
```
For `gates_required` and `depends_on` the values are constrained (canonical slugs, validated enum), so this is safe in practice. For `compliance_packs`, the workflow add-workstream.md Step 3 Q4 offers an "Other (describe — v1 advisory-only)" option that flows arbitrary user text into the array. If the user types `"DSL, eIDAS"` (with a comma) or `"GDPR Art. 5(1)(e)"` (with a colon and parentheses), the emitted YAML becomes `compliance_packs: [DSL, eIDAS, GDPR Art. 5(1)(e)]` which `yaml-mini.cjs parseYamlDocument` will misparse on the next `loadWorkstreams` call — most likely the new workstream becomes invalid and the loader throws when iterated by `/brief-design list`. This is a robustness/UX issue, not a security issue (no command injection — values are CLI argv, not shell strings).
**Fix:** Use `JSON.stringify` per element to get YAML-safe quoted strings (mirrors how the `description` field is emitted at line 1018). Apply consistently across all three array fields. Example:
```javascript
const gates = Array.isArray(spec.gates_required) && spec.gates_required.length > 0
  ? spec.gates_required
  : ['align', 'audience', 'compliance'];
lines.push(`gates_required: [${gates.map(g => JSON.stringify(g)).join(', ')}]`);
// ... same for depends_on, compliance_packs ...
```
Alternative: enforce an enum allow-list at the dispatcher layer for `compliance_packs` (reject anything not in `['PIPA', 'ISMS-P', 'MyData']`) and route the "Other" branch into a free-text `compliance_packs_other: "..."` field that is per-line quoted. The current Step 4 in `add-workstream.md` (line 246-247) lists known packs only — but the workflow's Q4 explicitly accepts "Other" answers, so the dispatcher should defensively normalize.

### WR-04: design.md `no_hooks_assertion` example regex is too broad and would always fail in current tree

**Severity:** Warning
**File:** `brief/workflows/design.md:367-370`
**Issue:** The structural-test snippet documents:
```
! grep -rE "brief-design|design\.md|brief_design|compliance|add-workstream" hooks/ 2>/dev/null
MUST return exit 0
```
However, running this exact grep in the current tree returns hits in `hooks/brief-validate-provenance.sh` and `hooks/dist/brief-validate-provenance.sh`:
```
ALLOWLIST_REGEX='^(brief/references/compliance/|brief/references/.*-vocabulary\.md|...)'
```
Because the pattern includes the bare token `compliance` (matching anywhere in any line), the example would always exit 1 — the assertion in the workflow markdown is structurally wrong. The actual `tests/brief-compliance-no-hooks.test.cjs` uses narrower patterns (`compliance-checker|brief-compliance-checker|compliance_checker|compliance\.cjs`) which correctly skip the validator hook. So the runtime test passes; only the workflow-prose example is buggy.
**Fix:** Replace the inline grep example in `design.md` with the same narrow pattern the test uses, OR with a more semantically scoped regex like:
```
! grep -rE "brief/workflows/design|brief-workstream-designer|brief/workflows/add-workstream|agents/brief-compliance-checker" hooks/ 2>/dev/null
```
Subordinate concern: same review applies to whether `brief-design` substring (line 368) would match a substring inside `hooks/brief-prompt-guard.js` etc. — no current hits, but the wide token `compliance` is the load-bearing miss.

## Info

### IN-01: Screen (a) Korean description branch is dead code (cannot execute given the if-condition)

**Severity:** Info
**File:** `brief/bin/lib/compliance.cjs:138-145`
**Issue:** `runDeterministicScreen` Screen (a) gates on `if (packs.length === 0 && !korea && !hasKoreanProse)` — i.e., `korea === false`. Yet inside that block the description ternary reads `description: korea ? '<Korean text>' : '<English text>'`. The Korean branch is unreachable: at this point in the function `korea` is guaranteed false. The Korean string `'적용 가능한 compliance pack이 선언되지 않았습니다 — pass-through 모드로 게이트가 실행되었습니다 ...'` will never render.
**Fix:** Drop the ternary and emit the English-only string:
```javascript
description: 'No applicable compliance packs declared; gate ran in pass-through mode.',
```
Side note: if reviewers want a Korean pass-through message rendered when a Korean planner runs an artifact with `compliance_packs: []` AND `region: "kr"` AND no Korean prose in the artifact body, the if-condition would need to be relaxed to allow `korea === true` cases too — but that's a behavior change, not a code-cleanup. Current intent appears to be "pass-through only when no Korea signals at all", in which case the Korean string is genuinely vestigial.

### IN-02: `validateVerdict` accepts empty strings for optional CC-01 clause fields though agent is instructed to omit them

**Severity:** Info
**File:** `brief/bin/lib/compliance.cjs:60-65`
**Issue:** The optional clause-extension validator accepts any string, including empty. The agent prompt at `agents/brief-compliance-checker.md:174` says "Omit them rather than emit empty strings or hallucinated citations." But if the agent emits `regulation_clause: ""`, `validateVerdict` returns null (passes), and the empty value rounds-trips into the `.compliance.md` rendering as an empty bullet via `compliance-report.cjs:14-18` which checks `if (f.regulation_clause)` truthy — so an empty string is filtered there. Net effect: empty strings pass validation, are silently dropped in render. This is harmless but contradicts the agent contract.
**Fix:** Strengthen the validator (defensive, low-cost):
```javascript
for (const opt of ['regulation_clause', 'required_evidence', 'found_in_artifact', 'gap']) {
  if (f[opt] !== undefined) {
    if (typeof f[opt] !== 'string') return `findings[${i}].${opt} present but not string`;
    if (f[opt].length === 0) return `findings[${i}].${opt} present but empty (omit instead)`;
  }
}
```
Forces the agent to actually omit per the prompt, and prevents silent semantic drift.

### IN-03: Korean disclaimer text retains `위반` (KO ban-list token) — intentional verbatim citation, exempted by test

**Severity:** Info
**File:** `brief/bin/lib/compliance-report.cjs:24`
**Issue:** The `_disclaimerFooter` Korean string contains `위반` ("violation") which is on the Phase 7 KO ban-list. This is by design — the wording is verbatim regulatory citation text from `brief/references/compliance/korea/pipa-2026.md` (D-03 LOAD-BEARING byte-identical lock), and the vocabulary-lock test at `tests/brief-compliance-vocabulary-lock.test.cjs:159-168` strips the `_disclaimerFooter` function body before grepping. Calling this out for reviewer awareness so future refactors that rename `_disclaimerFooter` or move the string to a constant must update the test's strip-pattern in lockstep.
**Fix:** None required — already documented in the test rationale comment (test lines 161-165). Optionally: move the verbatim disclaimer text to a top-level `const PIPA_DISCLAIMER_KO_VERBATIM = '...'` and adjust the test's strip-regex to match the constant declaration. Makes the intent (verbatim citation) more visible and shrinks the function-body-stripping regex's blast radius.

### IN-04: Korean grammar nit in design.md user-facing paused-status message

**Severity:** Info
**File:** `brief/workflows/design.md:150-151`
**Issue:** The Korean directive reads:
```
워크스트림 {name} 일시정지. OBJECTIVES.md에 {topic} 정보가 부족합니다.
다음을 실행: /brief-define --amend → 후 /brief-design {workstream} 재실행.
```
The phrase "→ 후" mixes an arrow glyph with the Korean nominal-suffix-ish "후" (meaning "after"). Native Korean prose would either drop the arrow ("`/brief-define --amend` 실행 후 `/brief-design ...` 재실행") or use natural conjunction ("`/brief-define --amend` 를 실행한 다음 `/brief-design ...` 를 재실행해 주세요"). The current form reads as a half-translated CLI step.
**Fix:** Replace with one of:
```
다음을 실행: /brief-define --amend 실행 후 /brief-design {workstream} 재실행.
```
or, more idiomatic:
```
다음 단계를 진행해 주세요:
  1. /brief-define --amend  실행
  2. /brief-design {workstream}  재실행
```

### IN-05: Korean prose nit in compliance.md FINDINGS-BLOCKING question — awkward "충족이 부족한 부분"

**Severity:** Info
**File:** `brief/workflows/compliance.md:225`
**Issue:** The user-facing question reads "Artifact에 규제 의무 사항 충족이 부족한 부분이 발견되었습니다." — the noun-on-noun chain `충족이 부족한 부분` ("a part where fulfillment is insufficient") parses but reads stiff. A native rewrite is shorter and more direct.
**Fix:** Replace with one of:
```
Artifact가 규제 의무 사항을 충족하지 못하는 부분이 발견되었습니다.
```
or, more concise:
```
Artifact에 충족되지 않은 규제 의무 사항이 있습니다.
```

### IN-06: design.md / add-workstream.md success messages use ✅ symbol — symbol is on the strict-ban list for compliance.cjs/compliance-report.cjs/brief-compliance-checker.md only, but precedent in other workflows allows it

**Severity:** Info
**Files:** `brief/workflows/design.md:311`, `brief/workflows/add-workstream.md:365`, `brief/workflows/add-workstream.md:375`
**Issue:** The Phase 7 vocabulary-lock test scopes the `✅ ✓ ✗` symbol ban to `compliance.cjs / compliance-report.cjs / brief-compliance-checker.md` and `brief/workflows/compliance.md`. design.md and add-workstream.md are NOT in the strict scope, and the broader `brief/workflows/*.md` corpus already uses `✅` (e.g., `discover.md:399`, `complete-milestone.md:430,444,478`, `autonomous.md:406,425,632`), so this matches existing precedent. Calling out for awareness — the symbol gives strong "everything-is-fine" affordance which is the exact UX the ban-list tries to prevent for COMPLIANCE outputs. Phase-7 design completion isn't a compliance verdict, so the contradiction is contained.
**Fix:** None required. If consistency across the planner-facing prose corpus is desired in v2, replace ✅ with `▶` (already used in design.md:343 for the recursive dispatch) or with brief text like "DONE / 완료". Defer.

### IN-07: status.cjs `formatGate` displays override-decision but state-recorded severity is not normalized to match override semantics

**Severity:** Info
**Files:** `brief/bin/lib/compliance.cjs:387-393`, `brief/bin/lib/audience.cjs:400-406` (precedent)
**Issue:** When the user force-accepts a `FINDINGS-BLOCKING` verdict via the override path, `commitComplianceVerdict` records:
```javascript
fm.brief.last_gate_results.compliance = {
  decision: override ? 'COMPLIANCE-OK' : verdict.decision,
  severity: verdict.severity,    // still 'blocking' if the original verdict was blocking
  findings_count: verdict.findings_count,
  ...
}
```
Resulting record shape: `{ decision: 'COMPLIANCE-OK', severity: 'blocking', override: true }`. The decision was force-flipped to OK but severity was left at `blocking`. Status renders the `decision` and `findings_count` and the `(override applied)` suffix (status.cjs:104-106) — severity is not surfaced to the user, so no user-visible inconsistency. But if a future log/audit consumer reads `severity` directly, they'd see a contradictory shape. This matches the audience.cjs precedent verbatim, so it's a canonical-pattern concern, not Phase 7-specific drift.
**Fix:** None required for v1 (matches Phase 5 precedent). If reviewers want stronger consistency, normalize severity to `'nice-to-have'` in the override branch, mirroring the decision flip:
```javascript
severity: override ? 'nice-to-have' : verdict.severity,
```
But this would also need to happen in audience.cjs to keep canonical-pattern lockstep.

---

_Reviewed: 2026-04-26_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

## REVIEW COMPLETE
