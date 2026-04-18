---
phase: 2
slug: stable-seam-anchor-schema-caps-workstream-as-config
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-19
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from 02-RESEARCH.md §Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` (built-in, Node 22+) + `node:assert/strict` |
| **Config file** | `scripts/run-tests.cjs` (enumerates `tests/*.test.cjs`, passes to `node --test`) |
| **Quick run command** | `node --test tests/state-brief-roundtrip.test.cjs tests/workstream-loader-discovery.test.cjs tests/workstream-loader-validation.test.cjs tests/status-renderer.test.cjs tests/frontmatter-roundtrip.test.cjs` |
| **Full suite command** | `npm test` |
| **Coverage command** | `npm run test:coverage` (c8 70% line threshold over `brief/bin/lib/*.cjs`) |
| **Estimated runtime** | ~15–25 seconds (quick), ~60–90 seconds (full) |

---

## Sampling Rate

- **After every task commit:** Run quick command above — 5 new test files PLUS `node --test tests/state.test.cjs` and `node --test tests/frontmatter.test.cjs` to catch D-04 + D-20 regressions.
- **After every plan wave:** Run `npm test` full suite. Delta-cap discipline inherited from Phase 1: empirical baseline = 63 failures; Phase 2 commits must not increase count by more than +1 (except bundled atomic commits per D-09).
- **Before `/brief-verify-work`:** Full suite green (relative to baseline) AND all FND-05/08/09/10 signals green.
- **Max feedback latency:** ~25 seconds (quick suite).

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-0X-0Y | frontmatter-extension | 1 | FND-05 (D-20) | — | null/nested-object/array-of-objects round-trip preserves JS values | unit (regression) | `node --test tests/frontmatter-roundtrip.test.cjs` | ❌ W0 | ⬜ pending |
| 02-0X-0Y | frontmatter-extension | 1 | FND-05 (D-20) | — | existing `tests/frontmatter.test.cjs` stays green post-extension | unit (regression) | `node --test tests/frontmatter.test.cjs` | ✅ exists | ⬜ pending |
| 02-0X-0Y | state-brief-schema | 2 | FND-05 (D-01/D-02/D-03) | — | `state.cjs` round-trips `state.brief.*` across 2 writes + `state json` cycle | unit (smoke) | `node --test tests/state-brief-roundtrip.test.cjs` | ❌ W0 | ⬜ pending |
| 02-0X-0Y | state-brief-schema | 2 | FND-05 (D-21) | — | `cmdStateJson` + `buildStateFrontmatter` preserve `brief:` map on rebuild | unit (regression) | same file — dedicated test case | ❌ W0 | ⬜ pending |
| 02-0X-0Y | state-brief-schema | 2 | FND-05 | — | `.planning/ASSUMPTIONS.md` appends `### A4 —` entry (VERIFIED) | doc (grep) | `grep -q "^### A4 —" .planning/ASSUMPTIONS.md` | ❌ W0 script | ⬜ pending |
| 02-0X-0Y | brief-state-version-rename | 2 | FND-05 (D-04) | — | `brief_state_version: 1.0` in STATE.md; `gsd_state_version` absent | doc (grep) | `grep -q "^brief_state_version:" .planning/STATE.md && ! grep -q "^gsd_state_version:" .planning/STATE.md` | ❌ W0 script | ⬜ pending |
| 02-0X-0Y | brief-state-version-rename | 2 | FND-05 (D-04) | — | `tests/state.test.cjs` assertions at lines 350/365/382/442 updated to `brief_state_version` and pass | unit (regression) | `node --test tests/state.test.cjs` | ✅ exists; needs edits | ⬜ pending |
| 02-0X-0Y | workstream-loader | 3 | FND-08 (D-10/D-11) | — | loader globs `brief/workstreams/*/spec.yaml` and returns parsed specs | unit | `node --test tests/workstream-loader-discovery.test.cjs` | ❌ W0 | ⬜ pending |
| 02-0X-0Y | workstream-loader | 3 | FND-08 (D-12) | — | inline YAML mini-parser handles string/number/boolean/null/list/nested map | unit | `node --test tests/workstream-loader-discovery.test.cjs` (subset) | ❌ W0 | ⬜ pending |
| 02-0X-0Y | workstream-loader | 3 | FND-08 (D-13) | — | loader rejects `name != parent dir name` with structured error | unit | `node --test tests/workstream-loader-validation.test.cjs` | ❌ W0 | ⬜ pending |
| 02-0X-0Y | workstream-loader | 3 | FND-08 (D-13) | — | loader rejects missing/unresolvable `output_artifact_template` | unit | same file | ❌ W0 | ⬜ pending |
| 02-0X-0Y | workstream-loader | 3 | FND-08 (D-13) | — | loader rejects unresolvable paths in `business_model_variants` and `region_overrides` | unit | same file | ❌ W0 | ⬜ pending |
| 02-0X-0Y | workstream-loader | 3 | FND-08 (acceptance) | — | adding a second workstream dir beyond `_example` is picked up with zero `.cjs` edits | unit (e2e) | `node --test tests/workstream-loader-discovery.test.cjs` (2-dir fixture) | ❌ W0 | ⬜ pending |
| 02-0X-0Y | workstream-loader | 3 | FND-08 (D-14) | — | `brief/workstreams/_example/spec.yaml` + `templates/artifact.md` exist and load end-to-end | file + unit | `test -f brief/workstreams/_example/spec.yaml && test -f brief/workstreams/_example/templates/artifact.md` + loader test | ❌ W0 | ⬜ pending |
| 02-0X-0Y | surface-caps-doc | 1 | FND-09 (D-06/D-09) | — | CLAUDE.md contains `## Surface Caps` with `≤12`, `≤8`, rationale, Phase 9 HRD-02 pointer | doc (grep) | `grep -q "## Surface Caps" CLAUDE.md && grep -q "≤12" CLAUDE.md && grep -q "≤8" CLAUDE.md && grep -q "Phase 9 HRD-02" CLAUDE.md` | ❌ W0 script | ⬜ pending |
| 02-0X-0Y | surface-caps-doc | 1 | FND-09 (D-06) | — | CLAUDE.md defines "user-facing" = "what bin/install.js registers under commands/<runtime>/brief/" | doc (grep) | `grep -q "user-facing" CLAUDE.md` + visual review | ❌ W0 | ⬜ pending |
| 02-0X-0Y | brief-status | 4 | FND-10 (D-15/D-16) | — | `/brief-status` renders compact dashboard against seeded `state.brief.*` | unit | `node --test tests/status-renderer.test.cjs` | ❌ W0 | ⬜ pending |
| 02-0X-0Y | brief-status | 4 | FND-10 (D-17) | — | placeholders `— (none yet)` / `— (none active)` when `brief.*` empty | unit | same file | ❌ W0 | ⬜ pending |
| 02-0X-0Y | brief-status | 4 | FND-10 (D-17) | — | does not raise when STATE.md / `brief:` map missing (single-line warning) | unit | same file | ❌ W0 | ⬜ pending |
| 02-0X-0Y | brief-status | 4 | FND-10 (D-16) | — | renders `Phase X of Y (phase_name_short)` from ROADMAP.md + STATE.md | unit | same file (roadmap fixture) | ❌ W0 | ⬜ pending |
| 02-0X-0Y | brief-status | 4 | FND-10 (D-18) | — | `commands/brief/status.md` exists with `name: brief:status` | doc (grep) | `grep -q "^name: brief:status" commands/brief/status.md` | ❌ W0 script | ⬜ pending |
| 02-0X-0Y | brief-status | 4 | FND-10 (D-19) | — | output goes to stdout plaintext; exit code 0 on success path | unit (via runGsdTools) | same file | ❌ W0 | ⬜ pending |
| 02-0X-0Y | delta-cap-guard | ALL | FND-05 (D-04 residue) | — | post-commit `npm test` failure count ≤ baseline+1 (empirical delta-cap per Phase 1 Plan 10) | npm-test regression delta | `npm test ; compare against 63 failure baseline` | ✅ `npm test` exists | ⬜ pending |

*Status legend: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*Task IDs are placeholders — planner will assign real `02-0X-0Y` IDs during plan generation.*

---

## Wave 0 Requirements

Wave 0 covers tests/fixtures that must exist BEFORE implementation tasks can be validated. Per CONTEXT.md D-05-superseded-by-D-20, the A4 verification lane is now bundled with the `frontmatter.cjs` extension lane — they share Wave 0.

- [ ] `tests/frontmatter-roundtrip.test.cjs` — new test file for D-20 nested/array/null round-trip regression
- [ ] `tests/state-brief-roundtrip.test.cjs` — new smoke test for FND-05 A4 across 2 write cycles + `state json` cycle
- [ ] `tests/workstream-loader-discovery.test.cjs` — new test file for FND-08 glob discovery
- [ ] `tests/workstream-loader-validation.test.cjs` — new test file for FND-08 schema rejection cases
- [ ] `tests/status-renderer.test.cjs` — new test file for FND-10 dashboard render
- [ ] `brief/workstreams/_example/spec.yaml` — FND-08 fixture (D-14 example workstream)
- [ ] `brief/workstreams/_example/templates/artifact.md` — template referenced by spec.yaml
- [ ] Test helpers: NONE NEW — reuse `tests/helpers.cjs :: createTempProject / cleanup / runGsdTools`
- [ ] Framework install: NONE — `node:test` + `c8` already present in devDependencies

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `/brief-status` cross-runtime parity (Claude Code / Codex / Gemini / OpenCode) | FND-10 + CLAUDE.md constraint | Each runtime's AskUserQuestion/text_mode fallback renders slightly differently; automated matrix requires spawning 4 runtimes | For v1 launch: manually invoke `/brief-status` from each runtime on the same project; confirm identical output format |
| CLAUDE.md `## Surface Caps` section survives future CLAUDE.md regenerations | FND-09 + open question OQ-2 from research | No automated regeneration hook exists yet; pre-commit hook out of scope per D-07 | Visual review after any `/brief-docs-update` or similar regeneration command |
| `/brief-status` output visual match with D-15 user-locked preview | FND-10 (USER-LOCKED) | User signed off on specific fixed-width layout; automated pixel/column diff is over-engineered | Side-by-side visual compare against D-15 preview in CONTEXT.md |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify command OR mapped Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING-file references listed above
- [ ] No watch-mode flags (tests run to completion, exit with code)
- [ ] Feedback latency < 30s on quick command
- [ ] Delta-cap guard task present (keeps baseline failure count in bounds)
- [ ] `nyquist_compliant: true` set in frontmatter (after planner maps real task IDs)

**Approval:** pending (planner fills real task IDs → checker verifies → set `nyquist_compliant: true`)
