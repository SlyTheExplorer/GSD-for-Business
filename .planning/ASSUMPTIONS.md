# BRIEF Project Assumptions Log

Verified assumptions across phases. Each entry includes:
- Assumption ID (A1, A4, etc.) or requirement anchor (FND-06, etc.)
- Status (VERIFIED / OUTSTANDING / INVALIDATED / PLACEHOLDER)
- Command run, expected output, actual output
- Timestamp and phase

---

## Phase 1 Verifications (commit 6)

### A1 — Zero-runtime-dependencies rule (FND-04)

**Status:** VERIFIED
**Timestamp:** 2026-04-18T02:04:23Z
**Phase:** 01-foundation-fork-hygiene-removal-rename
**Requirement:** FND-04 (ROADMAP.md Success Criterion #4)

**Verification command:**
```bash
node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"
```

**Expected output:** `0`
**Actual output:** `0`
**devDependencies count:** 3 (`c8, esbuild, vitest`)

**Implication:** The "zero external runtime dependencies" rule inherited from GSD is preserved through the rename. Any future BRIEF feature must honor this — use `npx --yes` for CLIs and inline implementations for trivial parsing.

### FND-06 — Multi-runtime detection survived Plan 03–05 rename

**Status:** VERIFIED (detection code intact at BOTH known sites; actual cross-runtime smoke is Phase 9 HRD-01)
**Timestamp:** 2026-04-18T02:04:23Z
**Phase:** 01-foundation-fork-hygiene-removal-rename
**Requirement:** FND-06 (ROADMAP.md Success Criterion #5)

**Detection has two separate sites (planner verified before Phase 1 began):**

1. **`INSTRUCTION_FILE`** — runtime-dispatch env var consumed by the workflow markdown (Claude Code / Codex / Gemini / OpenCode all read this). Lives in `brief/workflows/new-project.md`. NOT present in `brief/bin/lib/` (not a lib-layer concern).
2. **`text_mode`** — non-AskUserQuestion fallback flag consumed by lib JS. Lives in `brief/bin/lib/core.cjs` + `config.cjs` + `init.cjs`.

**Verification commands + results:**
```
grep -rc "INSTRUCTION_FILE" brief/workflows/  →  8 total refs  (hard-fail gate if 0; expected ~8)
grep -rc "INSTRUCTION_FILE" brief/bin/lib/    →  0 refs       (expected 0 — not a lib-layer identifier)
grep -rc "text_mode" brief/bin/lib/           →  6 total refs  (hard-fail gate if 0; expected ~6)
grep -rc "get-shit-done" brief/bin/lib/       →  0 total refs  (must be 0 — post-rename residue check)
```

**Interpretation:**
- The `INSTRUCTION_FILE` workflow-dispatch env var is referenced 8 times in `brief/workflows/` (primarily `new-project.md`). The workflow-markdown layer still directs Codex/Gemini/OpenCode runtimes into the correct instruction stream.
- The `text_mode` non-AskUserQuestion fallback is referenced 6 times across `brief/bin/lib/core.cjs`, `config.cjs`, and `init.cjs`. Non-Claude runtimes can still write decisions through the text-prompt path.
- Zero `get-shit-done` path references remain in any `brief/bin/lib/*.cjs` file — the rename did not introduce broken absolute paths in the runtime-detection code.
- Actual smoke testing BRIEF across Claude Code / Codex / Gemini / OpenCode is deferred to Phase 9 (HRD-01) per the cross-runtime smoke-test milestone. Phase 1 verifies only that the detection CODE survived the rename intact at both sites.

### A-REPO — Placeholder repository URL in package.json

**Status:** PLACEHOLDER (NOT VERIFIED — requires Phase 9 resolution)
**Timestamp:** 2026-04-18T02:04:23Z
**Phase:** 01-foundation-fork-hygiene-removal-rename
**Requirement:** W1 closure (checker WARNING iteration 1)

**Current package.json values (set by Plan 04 Task 2):**
```
repository.url:  git+https://github.com/brief-build/brief.git
homepage:        https://github.com/brief-build/brief
bugs.url:        https://github.com/brief-build/brief/issues
```

**Why placeholder:** The GitHub org `brief-build` and repo `brief` have not been verified to exist or be reserved. Checker iteration 1 flagged this as unverified (W1). The real BRIEF repository URL is a Phase 9 (npm publishing / HRD-02) decision.

**Constraint until resolved:**
- Do NOT run `npm publish` while this assumption is in PLACEHOLDER status. A published package would direct users to a 404 URL.
- Plan 04 Task 2 Threat T-01-21 documents this as "accept" risk because no publish happens in Phase 1.
- Plan 06 FND-07 residue-grep includes a check for `brief-build/brief` to detect any accidental override back to placeholder-incompatible content.

**Resolution path (Phase 9 HRD-02):**
1. Verify/reserve GitHub org + repo (or pick a different one — planner or user decision at Phase 9 time).
2. Single-file find-replace on package.json across repository.url, homepage, bugs.url.
3. Update this ASSUMPTIONS.md entry: PLACEHOLDER → VERIFIED, record the resolved URL.

### FND-07 — Business-planning-domain language in CLAUDE.md + README.md + package.json

**Status:** VERIFIED
**Timestamp:** 2026-04-18T02:09:41Z
**Phase:** 01-foundation-fork-hygiene-removal-rename
**Requirement:** FND-07 (ROADMAP.md Success Criterion #6)

**Verification commands:**
```bash
# Business-planning vocabulary (should be positive on both files)
grep -ci 'business planner\|OBJECTIVES.md\|workstream\|audience' CLAUDE.md  →  25
grep -ci 'business planner\|OBJECTIVES.md\|workstream\|audience' README.md  →  14

# Software-development vocabulary (should be 0 or low)
grep -ci 'code review\|TDD\|deployment\|security audit\|unit test' CLAUDE.md  →  2
grep -ci 'code review\|TDD\|deployment\|security audit\|unit test' README.md  →  0
combined total  →  2

# package.json GSD-domain residue (must be 0 per checker WARNING #6)
grep -ci 'spec-driven\|get-shit-done-cc\|gsd-build/get-shit-done' package.json  →  0
```

**Interpretation:**
- Business-planning domain language (business planner, OBJECTIVES, workstream, audience) appears 25 times in CLAUDE.md and 14 times in README.md — both files read as BRIEF documents.
- Software-development language count: 2 (both in CLAUDE.md lines 60 and 95 only). Both residuals appear in the `### Patterns to Absorb` and `## What NOT to Use` tables inside the Stack section, where they describe concepts BRIEF **intentionally dropped** from the superpowers / gstack references ("TDD enforcement, subagent dev, code review — intentionally dropped — they don't translate"; "TDD enforcement, subagent code review, browser automation skills don't translate to business planning"). These matches are anti-examples in a documentation table, not primary narrative, and are accepted as intentional residuals.
- README.md shows 0 dev-vocabulary matches across its entire content. The hero, Core Value, Who This Is For, Four Phases, Commands, Status and Roadmap, and Localized READMEs sections read as pure BRIEF material.
- package.json GSD-domain residue: 0. The descriptive fields were rewritten in Plan 04 Task 2; this Plan 06 check confirms no regression. The `brief-build/brief` placeholder URL is explicitly permitted (see A-REPO entry above).


---

## Phase 2 Verifications

### A4 — STATE.md round-trips state.brief.* without loss — VERIFIED

**Status:** VERIFIED
**Timestamp:** 2026-04-19T01:22:55Z
**Phase:** 02-stable-seam-anchor-schema-caps-workstream-as-config
**Requirement:** FND-05 (ROADMAP.md Success Criterion #1 for Phase 2)
**Verification source:** `tests/state-brief-roundtrip.test.cjs`

**Coverage (full D-03 schema):**
- **array-of-objects:** `return_stack` (frame `{from_phase, to_phase, reason, pushed_at}`) and `gap_queue` (`{topic, criticality, raised_at}`) round-trip via `writeStateMd` + `extractFrontmatter` with `assert.deepStrictEqual` fidelity — catches Pitfall 1 `[object Object]` drift from 02-RESEARCH.md R-1.
- **nested object leaves:** `last_gate_results.align` (`{decision, severity, findings_count, at}`) round-trips with all four fields intact. Per D-20 scalar-type contract (see `tests/frontmatter-roundtrip.test.cjs` lines 20-27), numeric scalar leaves round-trip as strings (`findings_count: '0'`), not JS numbers — documented expected behavior.
- **null leaves:** `last_gate_results.audience` and `last_gate_results.compliance` come back as JS `null`, not string `"null"` — validates D-20 rule 3.
- **scalar strings:** `current_workstream: 'bmc'` preserved as JS string.
- **placeholder shapes:** the Phase 2 initial-state fixture (all empty arrays + null leaves + null scalar) round-trips cleanly, mirroring the exact shape seeded into `.planning/STATE.md` by Plan 02-04.

**Verification command:**
```bash
node --test tests/state-brief-roundtrip.test.cjs
```

**Expected output:** 0 failures across 4 test cases (Cycle 1, Cycle 2, Cycle 3, Placeholder).

**Actual output:**
```
ℹ tests 4
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
```

**Implication — D-05 sidecar path NOT activated.** The 02-CONTEXT.md fallback plan (sidecar `.planning/state-brief.json`) is formally SUPERSEDED. The D-20 extension (`frontmatter.cjs` recursive serializer + null preservation — Plan 02-01) plus D-21 extension (`state.cjs` `cmdStateJson` + `syncStateFrontmatter` allowlist branch for `existingFm.brief` — Plan 02-04) close both halves of the round-trip defect in-place. Phase 6 keeps STATE.md as the single source of truth for return-stack state; no dual-write sidecar is required.

**R-5 stronger-test compliance.** Cycle 3 of the smoke test invokes `runGsdTools(['state', 'json'], tmpDir)` between writes and asserts the `brief:` map survives the `cmdStateJson` rebuild-from-body path. Without D-21, this cycle fails RED (silently dropped map). With D-21 (commit `03c5e6b`), this cycle passes — proving the allowlist extension is live and wired through the CLI dispatch.

**Downstream unblock:**
- **Phase 4 (ALIGN):** may write `state.brief.last_gate_results.align = {decision, severity, findings_count, at}` without round-trip drift.
- **Phase 5 (AUDIENCE):** may write `state.brief.last_gate_results.audience` via the same shape.
- **Phase 6 (Return Stack):** may push/pop `state.brief.return_stack` frames and append to `state.brief.gap_queue` without data loss across writes.
- **Phase 7 (COMPLIANCE + workstream selection):** may write `state.brief.last_gate_results.compliance` and update `state.brief.current_workstream` with string-slug values.

**Risk if future code re-introduces drop:** The regression guard is `tests/state-brief-roundtrip.test.cjs` Cycle 3 — it calls the production CLI (`brief-tools.cjs state json`) and fails loudly if either preservation branch is removed or narrowed. Any future edit to `state.cjs` that touches `cmdStateJson` or `syncStateFrontmatter` preservation logic will trip this test. The ≤63-failure delta-cap policy ensures the test is noticed at CI time.

**Relevant commits:**
- Plan 02-01 (eccd94f) — D-20 `frontmatter.cjs` recursive serializer + null preservation
- Plan 02-04 Task 1 (4ac7f94) — RED test file
- Plan 02-04 Task 2 (03c5e6b) — D-21 allowlist extension + STATE.md brief: initialization

