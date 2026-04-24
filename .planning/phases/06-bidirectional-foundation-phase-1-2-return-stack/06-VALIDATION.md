---
phase: 06
slug: bidirectional-foundation-phase-1-2-return-stack
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-24
---

# Phase 06 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (built-in, inherited) |
| **Config file** | none — test runner is `scripts/run-tests.cjs` + `package.json scripts.test` |
| **Quick run command** | `node --test tests/brief-gap-detect-*.test.cjs tests/brief-return-stack-*.test.cjs` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~3 seconds (quick) / ~60 seconds (full suite) |

---

## Sampling Rate

- **After every task commit:** Run `node --test tests/<affected-file>` (scoped quick)
- **After every plan wave:** Run `node --test tests/brief-gap-detect-*.test.cjs tests/brief-return-stack-*.test.cjs tests/brief-align-*.test.cjs` (Phase 6 + Phase 4 ALIGN regression)
- **Before `/gsd-verify-work`:** `npm test` full suite must be green (zero NEW failures beyond the 48-baseline Phase 1 deferred)
- **Max feedback latency:** 5 seconds per task, 60 seconds per wave

---

## Per-Task Verification Map

> Populated by planner from PLAN.md task list. Expected rows after planning completes: 8 plans × 3-6 tasks each ≈ 35-45 rows.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| _(pending — populated by planner)_ | | | | | | | | | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Validation Architecture (from RESEARCH.md §Validation Architecture)

### SC-1: BLOCKING push → "RETURNED-TO-DISCOVER" exit → /brief-discover resumes researcher

**Test pattern:** Golden fixture + state-mock
- **Fixtures:**
  - `tests/fixtures/gap-detect/gap-blocking-tam-unknown.md` — researcher-output with clear TAM-missing gap
  - `tests/fixtures/gap-detect/agent-return-blocking.json` — mock agent return (1 BLOCKING gap with kebab slug)
- **Tests:**
  - `tests/brief-gap-detect-state-roundtrip.test.cjs` — assert `state.brief.return_stack` gains 1 frame with 7 fields; `return_stack_history` gains 1 entry; round-trip via `node brief-tools.cjs state json` preserves deep-equal.
  - `tests/brief-gap-detect-exit-string.test.cjs` — assert orchestrator output contains literal `RETURNED-TO-DISCOVER` on push.
  - `tests/brief-discover-resume-on-invocation.test.cjs` — mock `state.brief.return_stack` with 1 frame; assert `/brief-discover` workflow (via structural grep of `brief/workflows/discover.md`) contains a Step 0.5 return-stack check + AskUserQuestion options `Resume {topic}` / `Start new session` / `Show stack`.

### SC-2: Hard-cap at iter 3 + meta-arbiter at iter 2

**Test pattern:** Iteration-counting fixture + string-equality vocabulary-lock
- **Fixtures:**
  - `tests/fixtures/gap-detect/history-1-push.json` — `return_stack_history` with 1 prior push for topic_fingerprint `market-sizing-korea-fintech-tam`
  - `tests/fixtures/gap-detect/history-2-pushes.json` — 2 prior pushes, same fingerprint
- **Tests:**
  - `tests/brief-gap-detect-count-iterations.test.cjs` — `countIterations(history, workstream, fingerprint)` returns 1 / 2 / 3 for the 3 fixtures. Cross-workstream collision: 2 pushes under workstream A + 0 under workstream B → A=2, B=0.
  - `tests/brief-gap-detect-meta-arbiter.test.cjs` — simulate 2nd push → orchestrator spawns AskUserQuestion with exact 3 options `Keep researching` / `Proceed with assumption` / `Cancel workstream`; exact prompt string matches `We've gone back to research twice for ${topic}. Is this gap genuinely blocking, or are we polishing?` (literal grep).
  - `tests/brief-gap-detect-hard-cap.test.cjs` — simulate 3rd push → orchestrator EXITS with cap message; state.brief.return_stack not mutated; no auto-proceed option present.
  - `tests/brief-gap-detect-justification-floor.test.cjs` — "Proceed with assumption" path with <20-char justification → rejected; ≥20-char → accepted and written to `OBJECTIVES.md#Assumptions`.

### SC-3: /brief-status renders return-stack + convergence telemetry

**Test pattern:** status.cjs unit + derived-count invariant
- **Fixtures:**
  - `tests/fixtures/return-stack/stack-depth-0.json` / `stack-depth-1.json` / `stack-depth-3.json` (hard-cap state)
  - `tests/fixtures/return-stack/history-cross-workstream.json` — 3 pushes: 2 for workstream A, 1 for workstream B
- **Tests:**
  - `tests/brief-return-stack-status-render.test.cjs` — status.cjs output (via CLI) shows `Return Stack: depth N/3` for each fixture; shows `triggering_topic` of top frame; shows convergence table `| Workstream | Round-trips |` with counts derived from history filter.
  - `tests/brief-return-stack-derived-count.test.cjs` — assert count is COMPUTED on read (no stored counter field anywhere in state.brief.*); grep of state.cjs for `round_trip_counter` returns zero.
  - `tests/brief-return-stack-history-immutable.test.cjs` — after a frame pop, `return_stack_history` length unchanged (append-only).

### SC-4: gap_queue with criticality; only BLOCKING triggers return

**Test pattern:** Severity-routing unit test + paired-sibling file assertions
- **Fixtures:**
  - `tests/fixtures/gap-detect/agent-return-mixed-severity.json` — 1 BLOCKING + 2 MATERIAL + 1 NICE-TO-HAVE
  - `tests/fixtures/gap-detect/agent-return-material-only.json` — 3 MATERIAL, zero BLOCKING
- **Tests:**
  - `tests/brief-gap-detect-severity-routing.test.cjs` — for mixed-severity fixture: assert 1 frame pushed to return_stack (BLOCKING only), 2 MATERIAL entries in gap_queue, NICE-TO-HAVE entries dropped (zero entries).
  - `tests/brief-gap-detect-sibling-filename.test.cjs` — `{artifact}.gaps.md` written with frontmatter `severity_counts: {blocking: 1, material: 2, nice_to_have: 1}` and body grouped by severity H3.
  - `tests/brief-gap-detect-material-proceed.test.cjs` — for material-only fixture: assert NO frame pushed; workflow proceeds; artifact's AUDIENCE frontmatter gains `material_gaps_flagged: true` caveat.

### SC cross-cutting: Frame pop requires artifact-write AND ALIGN re-pass (D-11)

- `tests/brief-gap-detect-frame-pop-requires-align.test.cjs` — 3 scenarios:
  1. Artifact not rewritten → frame stays
  2. Artifact rewritten + ALIGN returns DRIFTED → frame stays
  3. Artifact rewritten + ALIGN returns ALIGNED → frame popped (return_stack.length decreases by 1; return_stack_history length unchanged)

### SC cross-cutting: Vocabulary lock + structural gates

- `tests/brief-gap-detect-vocabulary-lock.test.cjs` — grep-audit forbids `{SKIPPED, OK, FAIL, PASS, NONE}` tokens in agent prompt; mandates `{BLOCKING, MATERIAL, NICE-TO-HAVE}` + `{GAPS-NONE, GAPS-MATERIAL-ONLY, GAPS-BLOCKING}` verdicts.
- `tests/brief-gap-detect-topic-fingerprint-slug.test.cjs` — vocabulary-lock for fingerprint discipline: assert agent prompt enforces lowercase-kebab-case regex `^[a-z][a-z0-9-]{2,60}[a-z0-9]$` + rejects fingerprints violating this at push time.
- `tests/brief-gap-detect-no-hook.test.cjs` — Anti-pattern #2: `hooks/` directory contains zero references to gap-detector; `scripts/build-hooks.js` HOOKS_TO_COPY manifest does not include gap-detector.
- `tests/brief-gap-detect-no-new-command.test.cjs` — Surface Cap: `commands/brief/` gains zero new files for Phase 6 (resume is inside /brief-discover; gap-detect is brief-tools subcommand).
- `tests/brief-gap-detect-canary-e2e.test.cjs` — full end-to-end (in-process): simulate push-blocking → RETURNED-TO-DISCOVER → resume → rewrite artifact → ALIGN re-pass → frame pop; assert state.brief.return_stack transitions [] → [frame] → [] while return_stack_history goes [] → [entry] → [entry].

**Total enumerated tests:** 18 test files (per RESEARCH.md Pattern enumeration)

---

## Wave 0 Requirements

- [ ] `tests/fixtures/gap-detect/` directory — 6 fixtures (golden BLOCKING, mixed-severity, material-only, agent-return-*, history-*)
- [ ] `tests/fixtures/return-stack/` directory — 4 fixtures (stack-depth-0/1/3, history-cross-workstream)
- [ ] Existing `node:test` + `c8` infrastructure — covers Phase 6 (no new framework install needed)

*Existing infrastructure covers all phase requirements — no Wave 0 framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cross-runtime AskUserQuestion parity (Claude Code / Codex / Gemini / OpenCode) for meta-arbiter | DSG-11 | Each runtime has a different AskUserQuestion surface; automated test cannot exercise all 4 in-process | Deferred to Phase 9 HRD-01 cross-runtime smoke test; document as Phase 6-authored test fixtures (text_mode fallback numbered-list grep) with manual verification instructions attached |
| Korean i18n of meta-arbiter prompt when `brief.region: kr` | DSG-11 | String literal matches user-facing Korean text; auto-test confirms presence but human reviews translation accuracy | Reviewer checks `brief/workflows/gap-detect.md` KR prompt block reads naturally (not literal translation); add `last_reviewed` field |

---

## Validation Sign-Off

- [ ] All plan tasks have `<automated>` verify or Wave 0 dependencies (planner populates)
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify (planner populates)
- [ ] Wave 0 covers all MISSING references (fixtures enumerated above)
- [ ] No watch-mode flags (node:test runs once, exits)
- [ ] Feedback latency < 5s per task / < 60s per wave
- [ ] `nyquist_compliant: true` set in frontmatter (planner flips after coverage verified)

**Approval:** pending
