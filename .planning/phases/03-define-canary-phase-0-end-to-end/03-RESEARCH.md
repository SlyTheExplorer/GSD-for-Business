# Phase 3: DEFINE Canary — Phase 0 End-to-End — Research

**Researched:** 2026-04-19
**Domain:** Conversational CLI intent extractor (the user-visible face of BRIEF). Orchestrator-workers canary proving end-to-end OBJECTIVES.md + config.json + STATE.md write through one user-facing command across multi-runtime surfaces.
**Confidence:** HIGH on existing-primitive reuse (Phase 2 seams verified); MEDIUM on conversational-prompt shapes (Korean register adaptation not yet piloted); MEDIUM on Korea-signal detection (keyword heuristic only — pilot-refinable).

## Summary

Phase 3 ships `/brief-define` as BRIEF's first domain-facing command. The canary property is load-bearing: if Mode A (Greenfield conversation → OBJECTIVES.md + 4 configs + block-gate) works end-to-end on the existing Phase 2 seams (frontmatter.cjs D-20 serializer + state.cjs D-21 allowlist + workflow+lib.cjs split), Phases 4–8 replicate the pattern at scale. If it wobbles, downstream phases must re-architect.

The technical work is almost entirely **composition of verified primitives**, not new infrastructure. Phase 2 already delivered: (a) a nested-map + array-of-objects + null serializer (frontmatter.cjs), (b) a state.brief.* allowlist that preserves nested structures through `state json` rebuilds, (c) the workflow.md + lib.cjs split pattern (status.cjs precedent), (d) the multi-runtime INSTRUCTION_FILE + text_mode fallback. `/brief-define` consumes all four. No new runtime dependencies are introduced.

The **user-visible** work is harder than the technical plumbing: Korean conversational register for Push Twice / Language Precision / Dream State Mapping, Claude-proposes-user-approves classification flow, and the block-gate message tone are where Phase 3's adoption lives-or-dies. These must land right on the first attempt because non-developer planners will form their opinion of BRIEF in the first 5 minutes of `/brief-define`.

**Primary recommendation:** Ship `/brief-define` as a single `commands/brief/define.md` + thin `brief/workflows/define.md` + feature-rich `brief/bin/lib/define.cjs` + extracted `brief/bin/lib/objectives.cjs`. Branch Mode A vs Mode B inside the workflow via the entry-question result, not via separate files (keeps each file under the Phase 2 ~400-line discipline). Korea-signal detection stays as a simple keyword regex in Phase 3 with a deliberate over-suggest bias (ANY signal triggers pre-check; user can uncheck). Write OBJECTIVES.md + config.json + STATE.md in a **single atomic commit** (`brief-tools commit --files` with all three paths) per Phase 1 D-09. The entire feature set is test-coverable with a single Korea-first B2C fixture persona that drives the A4-style round-trip smoke test.

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Area 1 — `/brief-define` Conversational Experience**

- **D-01: Dialogue format = mixed (buttons + free-text).** `AskUserQuestion` multi-choice at points where enumeration is clear; free-text at Language Precision and Push Twice depth points. Never pure multiple-choice; never pure free-form.
- **D-02: Multiple-choice questions act as seed only.** Any option selection is followed immediately by a free-text follow-up (`"구체적으로 말씀해 주세요"`, `"이 3가지와 다르다면 어떤 부분이 다른가요?"`). OBJECTIVES.md values come from free-text, not button labels.
- **D-03: Push Twice is implicit.** No `[Push Twice]` label. The second and third follow-up questions arrive naturally.
- **D-04: Dream State Mapping = hybrid format.** Prose MANDATORY for each horizon (now / 3-month / 12-month). Quantitative indicators (2–3 slots) OPTIONAL — `(해당없음)` / `(모름)` allowed.
- **D-05: `/brief-define` has 2 modes selected at entry via first-question user choice.** Regardless of whether OBJECTIVES.md exists. Mode A (Greenfield) ≈ 20–35 min. Mode B (Amendment) ≈ 3–10 min.
- **D-06: Target session lengths are soft guides, not hard caps.** Shown in entry preview only.
- **D-07: Mode B immutable-section lock.** The `## Immutable Intent` section is non-editable via the conversation. Footer: `immutable 섹션은 잠겨있습니다. 수정하려면 /brief-define --unlock-intent`. `--unlock-intent` is explicit.

**Area 2 — OBJECTIVES.md Scope and Layers**

- **D-09: Phase 3 ships ONLY project-level `.planning/OBJECTIVES.md`.** Per-workstream OBJECTIVES.md is Phase 7 scope. **Load-bearing re-interpretation:** DEF-03's "per-workstream" language is satisfied by Phase 3 + Phase 7 combined. A Phase 3 planner reading DEF-03 literally and trying to ship per-workstream files violates the canary intent.
- **D-10: Immutable/mutable classification = Claude proposes, user approves.** 3-option AskUserQuestion: `승인` / `한 항목씩 검토` / `전체 재분류`. Default heuristic: creator identity / core value / problem-statement → Immutable; audience specifics / verification metrics / hypothesized alternative tools / business_model / region / compliance_packs → Mutable.

**Area 3 — 4 Configuration-Value Declarations (DEF-04)**

- **D-11: 4 configs captured at end-of-conversation as a single confirm step.** Claude infers `business_model / region / audience_policy / compliance_packs` from the Mode A conversation. 4-option AskUserQuestion at wrap-up: `예, 승인` / `규제 팩만 재선택` / `청중 정책만 조정` / `전체 항목씩 검토`. **Korea-first policy:** compliance_packs pre-checks `PIPA / ISMS-P / MyData` ONLY when Korea signals detected. NOT unconditional default.

**Area 4 — Block and Stale-Anchor UX**

- **D-12: Block-style gate on `/brief-discover` when OBJECTIVES.md incomplete (DEF-05).** Specific, Korean, recovery-oriented. Lists exact missing fields by name. Provides single concrete recovery command (`/brief-define --amend`). Reassures content preservation ("지금 쓰신 내용은 그대로 남아있습니다"). Hard block — exit code + control flow genuinely blocks, no pass-through.
- **D-13: Stale-anchor notice fires ONLY on new activity entry.** Triggers: new `/brief-discover` in new milestone, or entering any new phase, when OBJECTIVES.md mtime > 48h. Does NOT trigger on `/brief-status`, `/brief-define --amend` re-entry, or mid-workflow calls. 3-option choice, no bypass: `잠시 검토에` / `현재 OBJECTIVES를 보고 맞으면 승인` / `이제 승인, 빠르게 진행`.

**Meta-Discipline**

- **D-08: Area-level "적정선" lock discipline.** Each gray area locked at minimum-viable decision set. Gaps during execution resolved by (a) in-phase CONTEXT amendment by executor with user sign-off, or (b) deferral to next phase. Planner, executor, verifier resolve implementation-level unknowns themselves rather than re-opening CONTEXT.

### Claude's Discretion

- Command surface for `--amend` / `--unlock-intent` / `/brief-confirm-objectives`: planner picks (flags vs. sub-commands vs. absorbed into stale-anchor flow), respecting CLAUDE.md Surface Caps.
- Exact prompt wording for Push Twice / Language Precision follow-ups. Korean default, English template fallback for non-KR.
- Heuristics for Korea-signal detection (D-11): regex / sub-agent / structured inference — any approach fine as long as CONDITIONAL not unconditional.
- Internal architecture of `brief-define.cjs` / workflow markdown split: follow Phase 2 D-18 pattern (`status.cjs` precedent).
- Mode selection UX rendering: 2-option vs 3-option (including `/brief-help`), AskUserQuestion preview text.
- Test fixture data: A4-style round-trip parallel to Phase 2 D-01; Korea-first B2C persona recommended.
- Mode A vs Mode B internal implementation: single file with switch vs. separate files vs. shared primitives — keep each file under ~400 lines.

### Deferred Ideas (OUT OF SCOPE)

- per-workstream OBJECTIVES.md files → Phase 7 `/brief-add-workstream`.
- ALIGN gate on OBJECTIVES.md output → Phase 4.
- AUDIENCE guard on OBJECTIVES.md frontmatter → Phase 5 first-wire on research artifacts.
- COMPLIANCE checker on `compliance_packs` → Phase 7.
- `/brief-help` for `/brief-define` → Phase 9 HRD-03 (basic `--help` flag output OK in Phase 3).
- Multi-language support beyond Korean/English → post-pilot v1.x if surfaced.
- Dialogue pause/resume mid-session → executor-amendment in phase-3 if it bites; suggested default = `status: in_progress` frontmatter + block-gate treats as "missing required fields".
- `/brief-confirm-objectives` as real command vs. sub-flag → planner call per Surface Caps.
- Korea-signal refinement → v1.1 after pilot.
- OBJECTIVES.md semantic validation (e.g., "3mo state more concrete than 12mo?") → Phase 4 ALIGN.
- OBJECTIVES.md format configurability (Markdown vs YAML-only) → NOT considered.
- Dream State Mapping horizon customization (6mo/24mo) → fixed horizons in Phase 3.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEF-01 | Push Twice + Language Precision conversational intent extractor (gstack `office-hours` adapted to internal-clarification) | Topic 2 (gstack SKILL.md absorption, Korean prompt templates per technique); Topic 1 (multi-turn AskUserQuestion / text_mode sequencing) |
| DEF-02 | Dream State Mapping: current → 3-month → 12-month, prose mandatory + optional metrics | Topic 1 (Dream State Mapping 3-horizon prose-first entry patterns); Topic 2 (gstack horizon prompts, Korean adaptation) |
| DEF-03 | Project-level OBJECTIVES.md with Immutable Intent / Mutable Hypotheses sections (per-workstream deferred to Phase 7 per D-09) | Topic 3 (OBJECTIVES.md frontmatter + body schema, immutable/mutable markers, status field) |
| DEF-04 | `business_model / region / audience_policy / compliance_packs` written to `.planning/config.json` under `brief.*` namespace | Topic 4 (config.json extension shape, enum values, single-source-of-truth policy) |
| DEF-05 | `/brief-discover` entry blocked (hard block, not warning) when OBJECTIVES.md missing required fields | Topic 6 (block-gate UX, shared pre-flight hook pattern, Korean recovery-oriented template) |
| DEF-06 | Stale-anchor warning when OBJECTIVES.md > 48h old on new milestone/phase entry, with 3 explicit paths | Topic 7 (stale-anchor mtime detection, dispatch-chain injection point, activity-entry trigger logic) |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Slash command dispatch | Existing BRIEF core (`commands/brief/define.md`) | — | Phase 2 precedent: `commands/brief/*.md` + `brief/workflows/*.md` pattern (D-18). Follow verbatim. |
| Multi-turn conversational flow (Push Twice, Language Precision, Dream State Mapping) | `brief/workflows/define.md` (prompt orchestration) | AskUserQuestion (native) or text_mode (fallback) | Workflow markdown is the right tier — prompts are content, not logic. Lib layer routes but does not author prompts. |
| Mode A vs Mode B branching | `brief/workflows/define.md` (single file, early mode-select switch) | `brief/bin/lib/define.cjs` (enters correct codepath by mode flag) | Keeps workflow file < ~400 lines (Phase 2 discipline) while isolating Mode-specific prompts into named subsections within the single file. |
| OBJECTIVES.md read/write + immutable-section enforcement | NEW `brief/bin/lib/objectives.cjs` | `brief/bin/lib/frontmatter.cjs` (existing D-20 serializer) | OBJECTIVES.md has its own frontmatter schema and body-section lock semantics — large enough to merit a dedicated module; too narrow to justify extending frontmatter.cjs further. |
| config.json 4-field write under `brief.*` namespace | `brief/bin/lib/define.cjs` (write) + `brief/bin/lib/config.cjs` (existing) | — | config.json is plain JSON (not frontmatter-serialized); no D-21-style allowlist needed. Direct read-merge-write. |
| STATE.md touch (`last_activity` + optional `stopped_at` update) | `brief/bin/lib/state.cjs` (existing) | — | Reuse existing primitives; the `brief:` map itself stays null/empty through end of Phase 3 per D-09 (no workstream created yet). |
| Block-gate on `/brief-discover` entry | NEW `brief/bin/lib/objectives.cjs` `validateObjectivesComplete()` + a thin `/brief-discover` command stub | Workflow markdown invokes gate first, exits on failure | Phase 3 must ship the `/brief-discover` command stub (command + workflow + lib gate) even though Phase 5 owns its body. The stub reads `brief-tools objectives validate` and exits with the D-12 error if not complete. |
| Stale-anchor 48h notice | `brief/bin/lib/objectives.cjs` `checkStaleAnchor()` | Injected at workflow entry points that qualify as "new activity" (Phase 3 wires only `/brief-discover` + `/brief-define --amend` entry; Phase 4+ phase-entry wraps) | Injected at workflow level (not command dispatch) — keeps the check bounded to "new activity" per D-13. Phase 3 doesn't need a global dispatcher hook. |
| Korea-signal detection | `brief/bin/lib/define.cjs` `detectKoreaSignals(conversation_transcript)` | Simple keyword + Korean-language regex | Heuristic; conditional pre-check in wrap-up D-11. v1.1 refinement if pilot surfaces false-positives/negatives. |
| Atomic 3-artifact commit | `brief-tools commit --files OBJECTIVES.md config.json STATE.md` | Phase 1 D-09 precedent | Single transaction — one commit containing all three writes. Rollback story is `git revert`. |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js | ≥22.0.0 | Runtime | Inherited constraint (BRIEF package.json engines). VERIFIED via `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` → 0 (ASSUMPTIONS.md A1 entry). `[VERIFIED: BRIEF package.json + A1 Phase 1 verification]` |
| CommonJS (`.cjs`) | — | Module system | All BRIEF bin-layer code is `.cjs`. Phase 3 new files follow verbatim. `[VERIFIED: existing BRIEF layout — 23+ `.cjs` files under brief/bin/lib/]` |
| `node:test` | built-in | Test runner | Phase 2 test files all use `node:test` (state-brief-roundtrip.test.cjs, status-renderer.test.cjs). Phase 3 tests extend the pattern. `[VERIFIED: tests/state-brief-roundtrip.test.cjs line 16]` |
| `c8` | ^11 | Coverage | 70% line threshold inherited. Don't lower. `[VERIFIED: BRIEF package.json + CLAUDE.md Phase 2 inheritance]` |

### Supporting (existing BRIEF primitives Phase 3 composes)

| Primitive | File | Purpose | When Phase 3 Uses It |
|-----------|------|---------|----------------------|
| `extractFrontmatter` / `reconstructFrontmatter` / `spliceFrontmatter` | `brief/bin/lib/frontmatter.cjs` | Round-trip YAML frontmatter including nested maps, arrays-of-objects, null | OBJECTIVES.md write and re-read. D-20 serializer is sufficient — no further extension needed. |
| `writeStateMd` (atomic write with frontmatter preservation) | `brief/bin/lib/state.cjs` | STATE.md writes with D-21 allowlist preserving `brief:` map | Optional STATE.md `last_activity` / `stopped_at` touch at end of `/brief-define`. |
| `cmdStateJson` with D-21 `brief:` allowlist | `brief/bin/lib/state.cjs` | JSON view of STATE.md surviving rebuild | Phase 3 verification that STATE.md survived unchanged. Not a primary write target. |
| `output` / `error` / `atomicWriteFileSync` / `planningPaths` | `brief/bin/lib/core.cjs` | Cross-cutting utilities | All Phase 3 lib code imports these verbatim. |
| `workstream-loader.cjs` (discovery-via-glob) | `brief/bin/lib/workstream-loader.cjs` | Phase 2 FND-08 workstream discovery pattern | NOT invoked by Phase 3 per D-09 (no workstream created) but informs per-workstream OBJECTIVES.md architecture for Phase 7. |
| `brief-tools.cjs init phase-op <n>` | `brief/bin/brief-tools.cjs` | Phase context JSON for workflows | `/brief-define` workflow reads via `brief-tools init phase-op` to get phase/state/config snapshot. |
| `brief-tools commit "<msg>" --files <paths>` | `brief/bin/brief-tools.cjs` | Atomic git commit | Final step of Mode A and Mode B — writes all three artifacts (OBJECTIVES.md + config.json + STATE.md) as one commit. |

### NEW Phase 3 Files (minimum-viable set)

| File | Purpose | Est. Size |
|------|---------|-----------|
| `commands/brief/define.md` | Slash command frontmatter + `@` ref to workflow | ~20 lines (matches `status.md`) |
| `brief/workflows/define.md` | Mode A + Mode B prompt orchestration | ~250-350 lines |
| `brief/bin/lib/define.cjs` | Mode detection, Korea-signal heuristic, 4-config inference, config.json write, atomic commit | ~250-350 lines |
| `brief/bin/lib/objectives.cjs` | OBJECTIVES.md read/write/validate, immutable-section enforcement, block-gate, stale-anchor | ~200-300 lines |
| `commands/brief/discover.md` (STUB) | Entry point that invokes block-gate then defers body to Phase 5 | ~30 lines |
| `brief/workflows/discover.md` (STUB) | Calls gate; emits Phase 5 placeholder message if gate passes | ~40 lines |
| `tests/brief-define-mode-a.test.cjs` | Mode A smoke: fixture → OBJECTIVES.md write → re-read deep-equal | ~150 lines |
| `tests/brief-define-mode-b.test.cjs` | Mode B immutable-lock smoke: existing OBJECTIVES.md → edit attempt → lock refuses | ~120 lines |
| `tests/brief-objectives-block-gate.test.cjs` | Block gate smoke: missing field → structured error + exit code | ~100 lines |
| `tests/brief-objectives-korea-signals.test.cjs` | Korea-signal detection smoke: KR fixture → compliance_packs pre-checked | ~80 lines |
| `tests/brief-define-text-mode.test.cjs` | text_mode parity smoke: identical fixture in text_mode → same OBJECTIVES.md output | ~130 lines |
| `tests/brief-define-stale-anchor.test.cjs` | Stale-anchor 48h smoke: mtime > 48h + activity entry → 3-option prompt | ~100 lines |

**Installation:** No new npm installs. Phase 3 adds zero runtime dependencies.

**Version verification:** N/A — no new packages. A1 VERIFIED status from ASSUMPTIONS.md MUST be preserved (inspected in Phase 1: `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` → 0).

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline `AskUserQuestion` / `text_mode` fallback | `inquirer`, `prompts`, `enquirer` (~50–120KB each) | Rejected — violates A1 zero-runtime-deps. Multi-runtime detection (`INSTRUCTION_FILE` + `text_mode`) already solves the interactive-prompt problem with zero deps. |
| Extend `frontmatter.cjs` further for OBJECTIVES.md | Keep OBJECTIVES.md logic in its own `objectives.cjs` module | Recommended path: keep frontmatter.cjs under ~400 lines (Phase 2 discipline D-12). OBJECTIVES.md has body-section semantics (not just frontmatter) — belongs in its own module. |
| Single file `define.cjs` doing everything | Split `define.cjs` (flow + config) + `objectives.cjs` (file read/write/validate) | Split recommended — `define.cjs` stays flow-oriented; `objectives.cjs` is reusable by the block-gate in discover.md stub, Phase 4 ALIGN, Phase 7 (per-workstream OBJECTIVES reuses same primitives). |
| Separate `workflows/define.md` + `workflows/define-amend.md` | Single `workflows/define.md` with mode-select switch | Single file recommended — Mode A and Mode B share ~60% of prompt material (config inference, confirmation flow, Korea-signal check). Two files means drift risk; single file with a clear switch keeps things atomic. |
| Korea-signal detection via agent sub-call | Simple keyword regex in `define.cjs` | Keyword regex recommended for Phase 3 — lower cost, predictable, and D-11 already specifies "any Korea signal → pre-check; user can uncheck" over-suggest policy. Agent sub-call is v1.1 if pilot surfaces misses. |
| Write OBJECTIVES.md as YAML-only | Markdown-with-frontmatter | Rejected explicitly (CONTEXT.md deferred). BRIEF convention is markdown-with-frontmatter; non-technical planners read Markdown, not YAML. |

## Architecture Patterns

### System Architecture Diagram

```
                  ┌──────────────────────────────────────────────┐
                  │         User: /brief-define [--amend]        │
                  │                  [--unlock-intent]           │
                  └──────────────────┬───────────────────────────┘
                                     │
                        ┌────────────▼────────────┐
                        │  commands/brief/        │
                        │     define.md           │  (slash dispatch shim)
                        └────────────┬────────────┘
                                     │  @ref
                        ┌────────────▼────────────┐
                        │  brief/workflows/       │
                        │     define.md           │  (prompt orchestration)
                        └─────────┬──────┬────────┘
                                  │      │
                    ┌─────────────┘      └──────────────┐
                    │                                   │
        ┌───────────▼───────────┐          ┌────────────▼────────────┐
        │  Entry Mode Question  │          │  --amend / --unlock-intent │
        │  "새 기획 / 고도화?"  │          │        flag handling       │
        └───────┬───────────────┘          └────────────┬───────────────┘
                │                                       │
        ┌───────▼────────┐                   ┌──────────▼──────────┐
        │    Mode A      │                   │      Mode B         │
        │  (Greenfield)  │                   │   (Amendment)       │
        │  ~20-35 min    │                   │   ~3-10 min         │
        └───────┬────────┘                   └──────────┬──────────┘
                │                                       │
        ┌───────▼─────────────────┐         ┌───────────▼──────────────┐
        │ Push Twice +            │         │ "어느 부분을 다시?"      │
        │ Language Precision      │         │ (locked immutable items  │
        │ (implicit, Korean)      │         │  visibly unselectable)   │
        └───────┬─────────────────┘         └───────────┬──────────────┘
                │                                       │
        ┌───────▼─────────────────┐                     │
        │ Dream State Mapping     │                     │
        │ (prose + opt. metrics)  │                     │
        └───────┬─────────────────┘                     │
                │                                       │
        ┌───────▼──────────────────┐                    │
        │ Claude proposes draft    │                    │
        │ (Immutable / Mutable     │                    │
        │  classification)         │                    │
        └───────┬──────────────────┘                    │
                │                                       │
        ┌───────▼──────────────────┐                    │
        │ User: 승인 /             │                    │
        │  한 항목씩 / 전체 재분류 │                    │
        └───────┬──────────────────┘                    │
                │                                       │
        ┌───────▼──────────────────┐                    │
        │ 4-config inference       │                    │
        │ (business_model / region │                    │
        │  /audience_policy /      │                    │
        │  compliance_packs)       │                    │
        │ Korea-signal? → precheck │                    │
        └───────┬──────────────────┘                    │
                │                                       │
                └──────────────┬────────────────────────┘
                               │
                  ┌────────────▼────────────┐
                  │ brief/bin/lib/          │
                  │   objectives.cjs        │
                  │     writeObjectivesMd() │  (atomic write)
                  │     validateComplete()  │  (block-gate support)
                  │     checkStaleAnchor()  │  (48h mtime check)
                  │                         │
                  │   define.cjs            │
                  │     writeConfigBrief()  │  (4 configs → config.json)
                  │     detectKoreaSignals()│
                  │     performAtomicCommit │
                  └────────────┬────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
  ┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼──────────┐
  │ .planning/     │  │ .planning/      │  │ .planning/       │
  │ OBJECTIVES.md  │  │  config.json    │  │   STATE.md       │
  │ (new / amended)│  │ (brief.* keys)  │  │ (last_activity)  │
  └────────────────┘  └─────────────────┘  └──────────────────┘
                               │
                      ┌────────▼──────────┐
                      │ brief-tools       │
                      │   commit --files  │
                      │   (atomic commit) │
                      └───────────────────┘

  SEPARATE FLOW — Phase 3 STUB of /brief-discover:

                  ┌──────────────────────────────────────────────┐
                  │         User: /brief-discover                │
                  └──────────────────┬───────────────────────────┘
                                     │
                  ┌──────────────────▼──────────────────┐
                  │  commands/brief/discover.md (STUB)  │
                  │    → brief/workflows/discover.md    │
                  └──────────────────┬──────────────────┘
                                     │
                  ┌──────────────────▼──────────────────┐
                  │  brief-tools objectives validate    │
                  │  (objectives.cjs validateComplete)  │
                  └─────┬────────────────────┬──────────┘
                        │                    │
                    pass│                    │fail
                        │                    │
              ┌─────────▼──────┐    ┌────────▼──────────┐
              │ Stale-anchor   │    │ Block gate:       │
              │ check (D-06)   │    │ D-12 Korean       │
              │ if mtime > 48h │    │ recovery-oriented │
              │ → 3-option Q   │    │ exit 1            │
              └─────┬──────────┘    └───────────────────┘
                    │
          ┌─────────▼─────────┐
          │ Phase 5           │
          │ placeholder msg   │  (Phase 3 stub emits
          │ "Phase 5 body TBD"│   "Coming in Phase 5"
          └───────────────────┘   — Phase 5 replaces)
```

### Recommended Project Structure

```
commands/brief/
├── define.md                             (NEW — slash dispatch)
└── discover.md                           (NEW STUB — gate target only)

brief/workflows/
├── define.md                             (NEW — Mode A + Mode B orchestration)
└── discover.md                           (NEW STUB — gate + Phase 5 placeholder)

brief/bin/lib/
├── define.cjs                            (NEW — Mode flow, 4-config, Korea-signal, commit)
├── objectives.cjs                        (NEW — read/write/validate/lock/stale-anchor)
├── frontmatter.cjs                       (EXISTING — reused; D-20 serializer sufficient)
├── state.cjs                             (EXISTING — reused; optional last_activity touch)
├── core.cjs                              (EXISTING — reused)
└── config.cjs                            (EXISTING — reused for config.json read-merge-write)

brief/bin/brief-tools.cjs                 (EXISTING — extend: add cases `define`, `objectives`)

tests/
├── brief-define-mode-a.test.cjs          (NEW — Mode A fixture-based smoke)
├── brief-define-mode-b.test.cjs          (NEW — Mode B immutable-lock smoke)
├── brief-objectives-block-gate.test.cjs  (NEW — DEF-05 block smoke)
├── brief-objectives-korea-signals.test.cjs(NEW — D-11 Korea detection)
├── brief-define-text-mode.test.cjs       (NEW — FND-06 text_mode parity)
├── brief-define-stale-anchor.test.cjs    (NEW — DEF-06 48h + 3-option)
└── helpers.cjs                           (EXISTING — createTempProject / cleanup / runGsdTools)

.planning/
├── OBJECTIVES.md                         (CREATED by /brief-define Mode A)
├── config.json                           (EXTENDED with brief.* keys)
└── STATE.md                              (touched — last_activity only in Phase 3 scope)

bin/install.js                            (EXISTING — extend SRC tuples: /brief-define, /brief-discover stub)
```

### Pattern 1: Mixed Dialogue (Buttons + Free-Text Refinement) — D-01, D-02

**What:** Every multiple-choice seed question is followed by a free-text refinement. The button click narrows; the free-text captures the user's own framing that goes into OBJECTIVES.md.

**When to use:** Any question where Claude can propose 2–5 discrete framings that cover most answer shapes but may miss the user's actual thinking.

**Example (AskUserQuestion variant):**

```xml
<!-- Step 1 — seed (multi-choice button) -->
<askuserquestion>
  <question>어떤 종류의 기획을 시작하시나요?</question>
  <options>
    <option>새 사업/제품 기획을 처음부터 (Mode A · 약 20–35분)</option>
    <option>기존 프로젝트를 다듬기 (Mode B · 약 3–10분)</option>
  </options>
</askuserquestion>

<!-- Step 2 — IMMEDIATE free-text follow-up (never skipped) -->
<askuserquestion>
  <question>방금 '{mode_label}'를 선택하셨습니다. 어떤 기획인지 한 문장으로 설명해 주시겠어요?</question>
  <!-- no options — free text -->
</askuserquestion>
```

**Example (`text_mode` fallback for Codex/Gemini/OpenCode):**

```
Claude: 어떤 종류의 기획을 시작하시나요?
  1) 새 사업/제품 기획을 처음부터 (Mode A · 약 20–35분)
  2) 기존 프로젝트를 다듬기 (Mode B · 약 3–10분)
  번호를 입력해주세요:
User: 1
Claude: 방금 'Mode A'를 선택하셨습니다.
        어떤 기획인지 한 문장으로 설명해 주시겠어요?
User: (free text)
```

**Source:** Phase 1 ASSUMPTIONS.md FND-06 VERIFIED entry — `brief/workflows/` references `INSTRUCTION_FILE` 8×, `brief/bin/lib/` references `text_mode` 6×. Multi-runtime fallback is live.

### Pattern 2: Push Twice (Implicit) — D-03

**What:** When a user's answer is vague, Claude asks a deepening follow-up — WITHOUT announcing it as a technique. The third follow-up (if needed) likewise arrives naturally.

**When to use:** On any answer that uses abstract words ("better UX", "efficient", "innovative") without concrete referents. Korean register specifically: gentle, reflective, curious — never interrogative.

**Example (Korean templates — drop-in per D-11 Claude's Discretion):**

Seed answer: "사용자가 더 편하게 일할 수 있도록 하고 싶어요."

```
Push 1 (implicit — no label):
"'편하게'라는 단어가 몇 가지 다른 뜻으로 쓰일 수 있어서요. 예를 들어,
 같은 일을 더 짧은 시간에 끝낸다는 뜻일 수도 있고,
 덜 집중해도 된다는 뜻일 수도 있고,
 배우는 데 걸리는 시간이 짧다는 뜻일 수도 있습니다.
 지금 머릿속에서 가장 먼저 떠오르신 게 어떤 편안함인가요?"

Push 2 (implicit, offered only if Push 1 answer is still abstract):
"'{Push 1 답변의 핵심 단어}'라고 하셨는데, 그 순간이 구체적으로 어떤 장면인지
 한 번 상상해서 묘사해 주실 수 있을까요?
 예를 들어, 누가 무엇을 하고 있고, 무엇이 다른 느낌인지."

Push 3 (rare, only if both prior pushes stayed in generic language):
"하나만 더 — 이 '{핵심}'가 안 됐다는 걸 알게 되는 신호는 무엇인가요?
 어떤 장면이 벌어지면 '아, 이 문제가 아직 안 풀렸구나' 하실 것 같으세요?"
```

**Rationale:** D-03 locks implicit rendering. The Korean conversational register prefers gradual deepening ("한 번 더 풀어주실 수 있을까요", "예를 들어 말씀해 주실 수 있을까요") over the English direct-pushback cadence. The upstream gstack `office-hours` SKILL.md uses English direct framing ("Let me push on that — can you give a concrete example?"); BRIEF must transpose this into Korean register.

**Source (pattern):** `github.com/garrytan/gstack/blob/main/office-hours/SKILL.md` — "Push Twice" technique (real answer surfaces after the 2nd or 3rd push). Absorbed as pattern, NOT dependency per PROJECT.md Context. `[CITED: gstack office-hours SKILL.md]` `[ASSUMED: Korean template wording — MUST be confirmed or refined with user before shipping; planner's call per D-03 Claude's Discretion]`

### Pattern 3: Language Precision (Force Definition of Vague Terms) — DEF-01

**What:** Whenever the user uses a term that could mean multiple different things, Claude reflects it back with a structured "which of these did you mean, or none of them?" prompt. The user's own definition becomes the OBJECTIVES.md entry.

**When to use:** Domain-specific jargon, slippery words ("scalable", "enterprise-ready", "차별화된", "혁신적인"), or any claim that shifts meaning across B2B/B2C/enterprise axis.

**Example:**

```
User: "기업 고객을 대상으로 합니다."
Claude: "'기업'이라는 단어가 사업 모델에 따라 다르게 쓰입니다.
         어떤 그림에 가장 가까우신가요?
         (1) 직원 1,000명 이상의 대기업 (Enterprise)
         (2) 직원 50–500명의 중견기업 (Mid-market)
         (3) 직원 10–50명의 중소기업 (SMB)
         (4) 위 중 어떤 것도 아니고, 다르게 정의하고 계심
         보기와 다르시면 4번을 선택하고 어떻게 정의하고 계신지 말씀해 주세요."
→ User's answer drives business_model (enterprise vs b2b vs b2b2c) inference
  AND goes literally into OBJECTIVES.md as user's own words.
```

**Source:** `github.com/garrytan/gstack/blob/main/office-hours/SKILL.md` — "Language Precision" + "Reframing as Clarification". Korean adaptation is BRIEF's domain. `[CITED: gstack office-hours SKILL.md]`

### Pattern 4: Dream State Mapping — 3-Horizon Prose-First Entry (D-04)

**What:** After Push Twice + Language Precision establish the core intent, the user walks through three time horizons (now / 3-month / 12-month). Each horizon is a prose description; each horizon optionally gets 2–3 quantitative slots.

**When to use:** Once per Mode A session, after Immutable Intent is drafted but before config inference.

**Example:**

```
Claude: "이제 세 가지 시점에서 이 프로젝트가 어떤 상태인지 그림을 그려보겠습니다.
         첫 번째 — 지금. 오늘 이 프로젝트를 처음 시작하는 순간,
         구체적으로 뭐가 보이고, 누가 있고, 무엇이 없나요?
         3–5문장으로 묘사해 주세요."
User: (prose)
Claude: "감사합니다. 혹시 — 선택이긴 한데 — 지금 시점에 대해 숫자로
         표현할 수 있는 지표가 있으신가요? 예를 들어:
         - 현재 사용자/고객 수:  (있으면 숫자, 없으면 '(해당없음)')
         - 이 문제로 인한 현재 불편 규모: (관찰하신 발언이나 숫자)
         - 대안 도구에 쓰고 있는 시간/비용: (모르시면 '(모름)')
         한 줄씩 답해주세요. 지금 단계에서는 모르셔도 괜찮습니다."
User: (any of: numbers, "(해당없음)", "(모름)", or partial)
Claude: "좋습니다. 다음은 3개월 후 시점입니다.
         3개월이 지났을 때 이 프로젝트가 어떤 상태이길 바라시나요?
         가장 단순하게, 가장 현실적으로. 3–5문장으로."
User: (prose)
Claude: (prompts for optional 3-month metrics: ~사용자 수, 발언, 수익 기준)
...
(repeats for 12-month)
```

**OBJECTIVES.md body section shape (written as the Mutable Hypotheses payload — see Topic 3):**

```markdown
## Mutable Hypotheses

### Dream State — Now
{prose}

**Quantitative indicators (optional):**
- {slot 1}: {value or (해당없음) or (모름)}
- {slot 2}: ...

### Dream State — 3-month
{prose}

**Quantitative indicators (optional):**
- ...

### Dream State — 12-month
{prose}
```

**Source:** `github.com/garrytan/gstack/blob/main/plan-ceo-review/SKILL.md` — "Dream State Mapping" horizon pattern, absorbed as inspiration per PROJECT.md. Hybrid prose+optional-metric shape is D-04 locked. `[CITED: gstack plan-ceo-review SKILL.md + CONTEXT.md D-04]`

### Pattern 5: Claude-Proposes-User-Approves (D-10)

**What:** After the conversation, Claude drafts a complete `OBJECTIVES.md` with items pre-classified into Immutable Intent vs Mutable Hypotheses. Before writing, Claude presents the draft and asks a 3-option AskUserQuestion.

**When to use:** End of Mode A conversation, before any file is written.

**Example prompt:**

```xml
<askuserquestion>
  <question>
작성된 OBJECTIVES.md 초안을 확인해 주세요.

## Immutable Intent (잠금 — 변경 시 --unlock-intent 필요)
{proposed immutable items as bullets}

## Mutable Hypotheses (자유 수정 가능)
{proposed mutable items, including Dream State Mapping horizons}

분류가 맞나요?
  </question>
  <options>
    <option>승인 (이대로 저장)</option>
    <option>한 항목씩 검토 (하나씩 물어봐 주세요)</option>
    <option>전체 재분류 (처음부터 다시)</option>
  </options>
</askuserquestion>
```

**Classification heuristic (planner MUST document in define.md workflow):**

| Item type | Default classification |
|-----------|------------------------|
| 창업자/기획자 정체성 | Immutable Intent |
| 핵심 가치 (core value) | Immutable Intent |
| 문제 정의 (problem statement) | Immutable Intent |
| 타깃 청중 구체화 (audience specifics) | Mutable Hypotheses |
| 검증 지표 (verification metrics) | Mutable Hypotheses |
| 가설된 대안 도구 (competitors) | Mutable Hypotheses |
| business_model | Mutable Hypotheses |
| region | Mutable Hypotheses |
| audience_policy | Mutable Hypotheses |
| compliance_packs | Mutable Hypotheses |
| Dream State Mapping — now / 3-month / 12-month | Mutable Hypotheses |

`[CITED: CONTEXT.md D-10 heuristic block + Pitfall #3 OBJECTIVES.md anchor drift mitigation]`

### Pattern 6: 4-Config Inference + Single Confirm Step (D-11)

**What:** Claude does not ask `business_model`, `region`, `audience_policy`, `compliance_packs` as separate questions. It infers them from the full Mode A conversation (Push Twice + Language Precision + Dream State Mapping answers) and presents them as one confirm step at the end.

**Example:**

```xml
<askuserquestion>
  <question>
대화 내용을 바탕으로 프로젝트 설정 4종을 추론했습니다:

  business_model:   b2c
                    이유: "일반 소비자", "앱 다운로드", "개인 구매" 등 언급
  region:           kr
                    이유: 대화가 한국어, 한국 시장 명시
  audience_policy:  internal (기본값)
                    이유: 명시되지 않음 — 기본값 적용
  compliance_packs: [PIPA, ISMS-P, MyData]  ← Korea 신호 감지로 미리 체크됨
                    이유: region=kr + 개인정보 처리 암시

이대로 저장할까요?
  </question>
  <options>
    <option>예, 승인</option>
    <option>규제 팩만 재선택</option>
    <option>청중 정책만 조정</option>
    <option>전체 항목씩 검토</option>
  </options>
</askuserquestion>
```

**Enum values (locked per REQUIREMENTS.md DEF-04 + research on Korea-first scope):**

- `business_model`: `b2b` | `b2c` | `b2b2c` | `enterprise`
- `region`: `kr` | `us` | `eu` | `jp` | `sg` | `other`
- `audience_policy`: `internal` | `partner` | `external` | `mixed`
- `compliance_packs`: array of identifiers. Initial Phase 3 vocabulary: `PIPA`, `ISMS-P`, `MyData`, `GDPR`, `CCPA`, `SOC-2`, `HIPAA`, `PCI-DSS`. Empty array is valid.

### Anti-Patterns to Avoid

- **Explicit "[Push Twice]" system tags in user-facing text.** D-03 violation. Breaks the "thoughtful partner, not technique executor" feel. Korean non-dev planners are sensitized to over-structured AI interaction.
- **Skipping the free-text follow-up after a button click.** D-02 violation. Treating a button label as the final OBJECTIVES.md entry loses the user's framing and produces generic, "AI-sounding" objectives.
- **Writing OBJECTIVES.md mid-conversation before user approval.** Premature disk write. User hasn't approved classification yet; a crashed session would leave a half-baked artifact that later reads weirdly.
- **Unconditionally pre-checking Korea compliance packs on every project.** D-11 violation. A US-first project that casually mentioned a Korean user will get PIPA/ISMS-P/MyData pre-checked — noise. Korea-signal must be CONDITIONAL.
- **Implementing immutable-lock as a warning-only nudge.** D-07 + Pitfall #3 violation. The lock MUST be an actual edit refuser at the OBJECTIVES.md writer layer. Soft warnings train users to click through, which is exactly how OBJECTIVES.md anchor drift wins.
- **Block-gate that exits 0 and just prints a message.** DEF-05 violation. Must exit non-zero AND control flow must actually stop — workflow must not advance. The user should be unable to run `/brief-discover` with incomplete OBJECTIVES.md even if they pass `--force` (no such flag exists).
- **Stale-anchor check on every command.** D-13 violation. Fires only on new-activity entry (new phase, new milestone, new `/brief-discover`). Firing on `/brief-status` trains users to ignore it (Pitfall #3 canonical theater failure).
- **Revealing agent telemetry to non-developer users.** Pitfall #9. Messages like "Spawning researcher agent..." / "Agent completed in 4.2s" reveal framework internals. `/brief-define` should show "생각 중…" / "추론 중…" or just a spinner dot — never internal names.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| YAML frontmatter parse/serialize | Don't write a new YAML parser | Existing `frontmatter.cjs` (D-20 verified) | `frontmatter.cjs` already handles nested maps, arrays-of-objects, and null. Phase 2 spent effort on this — reuse it. |
| Interactive CLI prompts | Don't add `inquirer`/`prompts` | Existing `INSTRUCTION_FILE` + `text_mode` fallback | Zero-runtime-deps rule (A1 VERIFIED). Two-level fallback (AskUserQuestion → text_mode numbered-list) already exists in workflows/ + lib/. |
| Atomic file writes | Don't use `fs.writeFileSync` directly | Existing `atomicWriteFileSync` in `core.cjs` | Atomic write uses temp-then-rename to avoid partial-write corruption if process crashes mid-write. Critical for OBJECTIVES.md (user's most sensitive artifact). |
| Git commit scripting | Don't shell out to `git commit` | Existing `brief-tools commit "<msg>" --files <paths>` | Handles `commit_docs` config toggle, sub-repo routing, and error normalization. Phase 1 D-09 + Phase 2 commits all use this. |
| State round-trip through JSON | Don't re-parse STATE.md manually | Existing `extractFrontmatter` + `cmdStateJson` (D-21) | D-21 preserves the `brief:` nested map through CLI rebuild. Regression guard in state-brief-roundtrip.test.cjs Cycle 3. |
| Path handling | Don't compute `.planning/` paths ad-hoc | Existing `planningPaths(cwd)` in `core.cjs` | Handles workspace detection, multi-project roots, and worktree resolution. |
| Schema validation of frontmatter | Don't add `ajv` | Inline validator (FRONTMATTER_SCHEMAS pattern in frontmatter.cjs) | ~10 fields with closed enums per Phase 3 — inline 30-line validator suffices per CLAUDE.md "What NOT to Use". |
| Korean-language detection | Don't add `franc` or similar lang-detect lib | Simple regex: `/[\u3131-\u318E\uAC00-\uD7A3]/` | Hangul block detection is 1 regex. Zero deps. Over-suggest bias per D-11 means false positives are acceptable, false negatives are bad. Regex is fine. |
| Timestamp / mtime arithmetic | Don't add `dayjs`/`date-fns` | Node `fs.statSync` + `Date.now()` | `Date.now() - stat.mtimeMs > 48 * 60 * 60 * 1000` is a 1-liner. 48h is the only threshold needed. |

**Key insight:** Phase 3 is a COMPOSITION of Phase 2 primitives, not a NEW infrastructure layer. Every "should we build X?" question has an existing Phase 2 (or inherited BRIEF) answer. Building anything new beyond `define.cjs` + `objectives.cjs` is a research-informed smell.

## Common Pitfalls

### Pitfall 1: Immutable-Lock Soft-Warning Leakage (Pitfall #3 regression)

**What goes wrong:** Mode B workflow displays immutable items as editable, user edits, submit fails silently or with a terse backend error. User feels the tool lied about the lock.

**Why it happens:** Easy to implement the lock at WRITE time only (`writeObjectivesMd` rejects edits to immutable items). UI-level enforcement (hiding those items from the selection prompt in Mode B) is separate work.

**How to avoid:** Two-layer enforcement — (1) UI layer (Mode B "어느 부분을 다시 보시겠어요?" prompt omits Immutable Intent items entirely, or shows them with a visible 🔒 marker that is non-clickable), (2) writer layer (`writeObjectivesMd` refuses any payload that mutates an immutable-section line and returns a structured error in Korean: `"Immutable Intent 항목은 --unlock-intent 플래그 없이 수정할 수 없습니다."`).

**Warning signs:** User reports "저장이 안 돼요" with no recovery hint; test asserts commit succeeded but OBJECTIVES.md immutable block remains mutated.

### Pitfall 2: Korea-Signal False Negative on English-Written Korea-Target Projects

**What goes wrong:** Korean planner writes Mode A in English (habit / tool familiarity). Korea-signal keyword regex sees no 한글 hits. Compliance packs are NOT pre-checked. User forgets to add PIPA/ISMS-P. Phase 7 COMPLIANCE checker finds a gap months later.

**Why it happens:** Keyword regex is the simplest heuristic. D-11 mandates over-suggest bias, but "over-suggest" needs to be implemented as ANY signal, not "Korean language used".

**How to avoid:** Keyword set MUST include English-in-Korea-context markers: `Korea`, `Korean`, `KR`, `Seoul`, `won` (currency), `PIPA`, `ISMS`, `MyData`, `핀테크`, `카카오`, `네이버`, `토스`, and any of the enum value `kr` or `korea` appearing in the conversation. ANY match → pre-check. User explicitly unchecks if over-suggested. Over-suggestion cost: 3-option AskUserQuestion click. Under-suggestion cost: PIPA CEO-liability exposure at 2026 amendment level. The tradeoff is asymmetric.

**Warning signs:** Korea-first B2C fixture fails to pre-check compliance_packs; pilot surfaces "I forgot PIPA" feedback.

### Pitfall 3: Atomic-Commit Partial-Success (1 of 3 writes succeeds)

**What goes wrong:** OBJECTIVES.md writes. config.json errors mid-write (disk full / permission issue). STATE.md never touched. Git repo left in inconsistent state: OBJECTIVES.md says B2C but config.json wasn't updated. `/brief-discover` block-gate inspects config.json, sees nothing, blocks. User is confused.

**Why it happens:** `fs.writeFileSync` is synchronous but not transactional across files. Three separate writes = three failure points.

**How to avoid:** Write all three artifacts to disk FIRST (using `atomicWriteFileSync` for each — which itself uses temp+rename per file). Only AFTER all three succeed, invoke `brief-tools commit --files OBJECTIVES.md config.json STATE.md "feat(03): DEFINE initial intent"`. If any individual write fails, catch the error BEFORE committing, roll back written files from their backups (or revert via git if any of the three existed previously), and present a structured error to the user.

**Warning signs:** Test that simulates mid-write failure (e.g., by making config.json read-only mid-flow) and asserts OBJECTIVES.md is NOT committed.

### Pitfall 4: Dream State Mapping Horizons Inverted (3mo > 12mo Specificity)

**What goes wrong:** User fills "now" state with rich detail. Fatigues by "3-month". Gives vague prose. By "12-month" writes "잘 되어 있어야죠" and moves on. Dream State Mapping intended to anchor 12-month objectives loses its anchor function.

**Why it happens:** Cognitive fatigue across 3 horizons × (prose + 3 optional metrics) = 12+ data points.

**How to avoid:** Pace the horizons differently. Now: full prose + metrics. 3-month: prose + metrics (same depth — this is the most important horizon for ALIGN gate). 12-month: prose mandatory but shorter (2–3 sentences OK); metrics can be skipped with explicit prompt "12개월은 아직 희망의 영역입니다 — 숫자 없이 그림만 그려주셔도 됩니다." This is NOT a decision gap — D-04 locks hybrid format. This is a Claude's Discretion prompt-wording call that the planner must bake into the workflow markdown.

**Warning signs:** Pilot user reports "3개월만 쓰고 싶어요"; OBJECTIVES.md fixture shows 12-month section is a one-liner in >30% of samples.

### Pitfall 5: Block-Gate Message Leaks Developer Terminology

**What goes wrong:** Block-gate error message reads:
```
ERROR: OBJECTIVES.md validation failed.
Missing required fields: ['business_model', 'compliance_packs']
Run `/brief-define --amend` to fix.
```
This is the Pitfall #9 Non-Developer Friction regression — `ERROR:` stack-trace tone, English labels, Python-list syntax, backtick code fences.

**Why it happens:** Default throw/output pattern from core.cjs is developer-style. Must explicitly Korean-localize the block-gate.

**How to avoid:** Canonical Korean template (planner reference — D-12 literal rendering):

```
⚠ /brief-discover는 아직 실행할 수 없습니다.

OBJECTIVES.md에 아직 작성되지 않은 필수 항목이 있습니다:
  • 비즈니스 모델 (business_model)
  • 규제 팩 (compliance_packs)

보완 방법:
  /brief-define --amend

지금 쓰신 내용은 그대로 남아있습니다.
보완이 끝나면 다시 /brief-discover를 실행해주세요.
```

No `ERROR:` stack-trace vocabulary. No square brackets. No backticks beyond the recovery command. Exit code non-zero (so wrapping shells or test harnesses can detect).

**Warning signs:** Test asserts exit code is 1 AND output contains `⚠` AND output contains the recovery command verbatim.

### Pitfall 6: Stale-Anchor Check Fires on Every Command (Trains Users to Ignore)

**What goes wrong:** Stale-anchor warning shown on `/brief-status`, `/brief-define --amend`, mid-workflow calls. User sees it 20× in a day. Learns to press Enter. Pitfall #3 anchor drift wins.

**Why it happens:** Convenient to plop the check at command dispatch.

**How to avoid:** Per D-13: check fires ONLY at (a) new `/brief-discover` invocation when in a new milestone context, (b) entering any new phase. NOT at every command. Implementation: `checkStaleAnchor()` in `objectives.cjs` is invoked from exactly two call sites in Phase 3: the `discover.md` stub workflow (before the block-gate) and NOT YET from phase-entry (Phase 4+ wires that in). Phase 3 scope does NOT install a global dispatcher hook.

**Warning signs:** Test invokes `/brief-status` on a stale OBJECTIVES.md and asserts NO stale-anchor prompt appears.

## Runtime State Inventory

(Phase 3 is a NEW-feature phase, not rename/refactor. This section is short but not omitted — a few inventory items apply.)

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — Phase 3 CREATES `.planning/OBJECTIVES.md` as a new file. No pre-existing OBJECTIVES.md in this project. No migration. | No action — greenfield write. |
| Live service config | None — Phase 3 does not integrate with external services (no n8n, no datadog, no cloud tunnels). `config.json` is a local JSON file. | No action. |
| OS-registered state | None — Phase 3 does not register Task Scheduler entries, launchd plists, pm2 processes, or systemd units. | No action. |
| Secrets/env vars | None new. Phase 3 may READ existing env vars (e.g., `GSD_WORKSTREAM`, `INSTRUCTION_FILE`) but writes no secrets. | No action. |
| Build artifacts / installed packages | None — no new npm installs. `bin/install.js` SRC tuples are extended for `/brief-define` and `/brief-discover` stub; `scripts/build-hooks.js` is NOT modified (no new hooks per CONTEXT.md code_context). | Reinstall step after `bin/install.js` tuple additions: confirm via `node bin/install.js` dry-run that the new command files are discovered. |

**Nothing found in category:** Stored data / Live service config / OS-registered state / Secrets — verified explicitly (Phase 3 is purely new artifacts + new in-repo source files; no external-state touchpoints).

## Code Examples

Verified patterns from the existing BRIEF codebase. Each snippet is load-bearing — Phase 3 implementation should lift these patterns verbatim and adapt.

### Example 1: Phase 2 `status.cjs` structure (D-18 pattern to follow for `define.cjs` / `objectives.cjs`)

```javascript
// brief/bin/lib/status.cjs (EXISTING — template for Phase 3 lib files)

const fs = require('fs');
const path = require('path');
const { planningPaths, output } = require('./core.cjs');
const { extractFrontmatter } = require('./frontmatter.cjs');

function renderStatus(cwd, raw) {
  const statePath = planningPaths(cwd).state;
  // ... read, build output, emit ...
  output({ rendered }, raw, rendered);
  return rendered;
}

module.exports = { renderStatus };
```

**Source:** `brief/bin/lib/status.cjs` (verbatim — 124 lines).

### Example 2: Atomic write pattern (from core.cjs via frontmatter.cjs)

```javascript
// Pattern used throughout BRIEF lib layer:
const { atomicWriteFileSync, normalizeMd } = require('./core.cjs');
const newContent = spliceFrontmatter(existingContent, updatedFrontmatter);
atomicWriteFileSync(fullPath, normalizeMd(newContent));
```

**Source:** `brief/bin/lib/frontmatter.cjs:378` (`cmdFrontmatterSet`).

### Example 3: A4-style round-trip test (Phase 2 precedent for Phase 3 tests)

```javascript
// tests/state-brief-roundtrip.test.cjs (EXISTING — template)

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { runGsdTools, createTempProject, cleanup } = require('./helpers.cjs');

describe('state.brief.* round-trip (A4 verification, FND-05)', () => {
  let tmpDir;
  let statePath;

  beforeEach(() => {
    tmpDir = createTempProject();
    statePath = path.join(tmpDir, '.planning', 'STATE.md');
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('Cycle 1 — writeStateMd round-trips populated D-03 payload', () => {
    // (seed fixture, write, re-read, deep-equal assertion)
    // ...
  });
});
```

**Source:** `tests/state-brief-roundtrip.test.cjs` (verbatim — 334 lines). Phase 3 tests follow this shape.

### Example 4: Proposed OBJECTIVES.md frontmatter + body (Phase 3 schema)

```markdown
---
brief_objectives_version: 1.0
status: ready                              # in_progress | ready | stale (stale set by stale-anchor check)
created_at: "2026-04-19T02:30:00Z"
last_amended: "2026-04-19T02:30:00Z"        # driven by mtime; used by stale-anchor 48h check
mode: greenfield                           # greenfield (from Mode A) | amended (from Mode B)

# MIRROR of config.json brief.* keys — config.json is PRIMARY.
# Rationale: the 4 configs must be machine-readable at .planning/config.json
# for every downstream phase's context injection; OBJECTIVES.md body is for
# human reading. Frontmatter mirror here supports Phase 4 ALIGN gate which
# reads OBJECTIVES.md as a single source to compare against workstream outputs.
business_model: b2c                        # b2b | b2c | b2b2c | enterprise
region: kr                                 # kr | us | eu | jp | sg | other
audience_policy: internal                  # internal | partner | external | mixed
compliance_packs:                          # identifiers; empty array valid
  - PIPA
  - ISMS-P
  - MyData

immutable_items:                           # Array of body-section anchors that are locked.
  - creator-identity                       # Mode B conversation must not expose these for edit
  - core-value                             # without --unlock-intent flag.
  - problem-statement
---

# OBJECTIVES

## Immutable Intent

<!-- 🔒 LOCKED — 이 섹션을 수정하려면 /brief-define --unlock-intent가 필요합니다.
     This section is non-editable via /brief-define without the unlock flag. -->

### Creator Identity
{user's own words — from Push Twice + Language Precision 대화}

### Core Value
{one or two sentences captured verbatim from the conversation}

### Problem Statement
{what the creator is trying to solve for whom}

## Mutable Hypotheses

### Target Audience Specifics
{captured from conversation; drift allowed; revisitable in Mode B}

### Verification Metrics
{optional; from Dream State Mapping quantitative slots}

### Hypothesized Alternative Tools / Competitors
{free-text list}

### Dream State — Now (as of {created_at})
{prose from D-04 Dream State Mapping horizon 1}

**Quantitative indicators (optional):**
- {slot}: {value / (해당없음) / (모름)}

### Dream State — 3-month
{prose from horizon 2}

**Quantitative indicators (optional):**
- ...

### Dream State — 12-month
{prose from horizon 3}

**Quantitative indicators (optional):**
- ...
```

**Round-trip verification:** This shape uses only nested maps, scalar strings, and string arrays — shapes already confirmed VERIFIED by `tests/frontmatter-roundtrip.test.cjs` and `tests/state-brief-roundtrip.test.cjs`. No extension of frontmatter.cjs needed.

**Source:** Synthesized from CONTEXT.md D-03/D-07/D-10 + REQUIREMENTS.md DEF-03 + Pitfall #3 mutability-layer mandate. `[CITED: 03-CONTEXT.md decisions + research/PITFALLS.md Pitfall 3]`

### Example 5: Proposed `.planning/config.json` extension (DEF-04)

Existing config.json (snapshot from `.planning/config.json`):

```json
{
  "model_profile": "quality",
  "commit_docs": true,
  "parallelization": true,
  "search_gitignored": false,
  "brave_search": false,
  "firecrawl": false,
  "exa_search": false,
  "git": { ... },
  "workflow": { ... },
  "hooks": { ... },
  "project_code": null,
  "phase_naming": "sequential",
  "agent_skills": {},
  "claude_md_path": "./CLAUDE.md",
  "mode": "interactive",
  "granularity": "fine"
}
```

After Phase 3 `/brief-define` Mode A on a Korea-first B2C fixture, the file becomes:

```json
{
  "model_profile": "quality",
  "commit_docs": true,
  "parallelization": true,
  "search_gitignored": false,
  "brave_search": false,
  "firecrawl": false,
  "exa_search": false,
  "git": { ... },
  "workflow": { ... },
  "hooks": { ... },
  "project_code": null,
  "phase_naming": "sequential",
  "agent_skills": {},
  "claude_md_path": "./CLAUDE.md",
  "mode": "interactive",
  "granularity": "fine",
  "brief": {
    "business_model": "b2c",
    "region": "kr",
    "audience_policy": "internal",
    "compliance_packs": ["PIPA", "ISMS-P", "MyData"]
  }
}
```

**Format verification:** `.planning/config.json` IS a plain JSON file (verified by direct read — no YAML frontmatter wrapper, no allowlist-style serializer). Write path is `read → merge-into-`brief`-key → JSON.stringify(obj, null, 2) → atomicWriteFileSync`. NO D-21-style allowlist extension needed. `[VERIFIED: .planning/config.json direct inspection]`

**Single-source-of-truth policy:** config.json is PRIMARY for machine-readable reads (downstream phase context injection). OBJECTIVES.md frontmatter MIRRORS the 4 fields for human reading + Phase 4 ALIGN gate's convenience. At write time, both must be updated atomically. On divergence (e.g., manual edit of one but not the other), config.json wins and OBJECTIVES.md gets flagged for re-sync at next `/brief-define --amend` entry. Phase 3 does NOT ship divergence detection — deferred to Phase 4 ALIGN or Phase 9 health check.

**Source:** CONTEXT.md D-11 "Write target" note + `.planning/config.json` direct read. `[VERIFIED]`

### Example 6: Workflow entry — mode select in `brief/workflows/define.md`

```markdown
<purpose>
Guide a business planner through BRIEF's conversational intent extraction.
Mode A (Greenfield) runs the full Push Twice + Language Precision + Dream State Mapping flow.
Mode B (Amendment) revisits mutable items only; Immutable Intent is locked.
</purpose>

<process>

## Step 0: Flag Parsing
Check invocation flags:
- `--amend` → force Mode B entry (skip mode-select question)
- `--unlock-intent` → flag set for Mode B writer to allow Immutable Intent edits
- No flag → proceed to Step 1 mode select

## Step 1: Entry Mode Selection (D-05)
Ask the first question (mixed format — button seed with context text):

<askuserquestion>
  <question>
BRIEF 기획에 오신 것을 환영합니다.
어떤 종류의 작업을 시작하시나요?
  </question>
  <options>
    <option>새 사업/제품 기획을 처음부터 (Mode A · 약 20–35분)</option>
    <option>기존 프로젝트를 다듬기 (Mode B · 약 3–10분)</option>
  </options>
</askuserquestion>

## Step 2: Branch by Mode

### Mode A (Greenfield) — Steps 2A.1–2A.8
  - 2A.1 Opening free-text: "어떤 기획인지 한 문장으로 설명해 주시겠어요?"
  - 2A.2 Push Twice + Language Precision on the core value
  - 2A.3 Language Precision on the target user ("기업"? 어떤 규모의 기업?)
  - 2A.4 Dream State Mapping horizon 1 (now) — prose + optional metrics
  - 2A.5 Dream State Mapping horizon 2 (3-month) — prose + optional metrics
  - 2A.6 Dream State Mapping horizon 3 (12-month) — prose + optional metrics
  - 2A.7 Claude proposes OBJECTIVES.md draft + 3-option AskUserQuestion (D-10)
  - 2A.8 4-config inference + single confirm step (D-11); Korea-signal check

### Mode B (Amendment) — Steps 2B.1–2B.4
  - 2B.1 Read existing .planning/OBJECTIVES.md
  - 2B.2 "어느 부분을 다시 보시겠어요?" — options EXCLUDE immutable items (unless --unlock-intent was set)
  - 2B.3 Conversational refinement on chosen mutable sections only
  - 2B.4 Updated-field confirm step

## Step 3: Atomic Write + Commit

Invoke `brief-tools define apply` which:
  1. atomicWriteFileSync to .planning/OBJECTIVES.md
  2. Read → merge → atomicWriteFileSync to .planning/config.json
  3. STATE.md last_activity touch via existing state.cjs
  4. brief-tools commit "feat(03): DEFINE <mode> — <one-line-summary>" --files .planning/OBJECTIVES.md .planning/config.json .planning/STATE.md

## Step 4: Next-Step Hint
Print: "다음 단계: /brief-discover — 선택하신 연구 영역으로 분야 조사를 시작합니다."
</process>
```

**Source:** Synthesized from `brief/workflows/status.md` structure (existing template) + 03-CONTEXT.md decisions. Keeps entire workflow file under ~400 lines per Phase 2 discipline.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| OBJECTIVES.md as a flat markdown file without mutability layers | OBJECTIVES.md with explicit `## Immutable Intent` + `## Mutable Hypotheses` sections + frontmatter mirror of 4 configs | Phase 3 (this phase) | Pitfall #3 anchor-drift mitigation. Forces explicit gesture (`--unlock-intent`) for immutable edits. |
| Business planners asked to edit JSON config directly | 4 configs inferred from conversation + single confirm step (D-11) | Phase 3 | Pitfall #9 non-developer friction. No JSON editing ever exposed to user. |
| Push Twice surfaced as labeled technique | Implicit rendering (D-03) — no visible `[Push Twice]` label | Phase 3 | Korean conversational register fit; avoids "AI is interrogating me" feel. |
| Compliance packs unconditionally pre-checked or unconditionally empty | Conditional pre-check ONLY when Korea signals detected (D-11) | Phase 3 | Balances 2026 PIPA CEO-liability risk against false-positive annoyance. |
| Stale-anchor check on every command | Fires ONLY on new-activity entry (D-13) | Phase 3 | Prevents Pitfall #3 "train users to ignore" failure mode. |

**Deprecated/outdated:**

- **Auto-detect mode by OBJECTIVES.md file presence** — considered in Q1.5 discussion, rejected in favor of explicit user-choice D-05. Reason: non-technical users want to state intent explicitly; "auto-detect guessed wrong" is a frustrating first impression.
- **Separate `/brief-amend` command** — surface cap pressure (Phase 2 D-06 ≤12 commands). `--amend` flag on `/brief-define` is the right shape.
- **Fixed round-count conversation cap** — replaced by D-06 soft-guide session lengths. Hard round caps interrupt natural conversational deepening.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Korean prompt templates for Push Twice / Language Precision / Dream State Mapping as drafted in Pattern 2–4 feel natural to Korean non-developer planners | Architecture Patterns | Risk is adoption — stiff or over-formal Korean prompts put users off. Mitigation: planner records these verbatim in workflow markdown; pilot in Phase 9 HRD-04 surfaces refinement; prompts are content-layer so v1.1 refinement does not require architecture change. `[ASSUMED]` |
| A2 | `.planning/config.json` is a plain JSON file without frontmatter-serializer-style allowlist | Standard Stack, Example 5 | Risk is architecture — if config.json uses allowlist, a D-21-style extension would be needed. Mitigated: directly inspected `.planning/config.json`, confirmed plain JSON, no allowlist. `[VERIFIED: direct inspection of .planning/config.json 2026-04-19]` |
| A3 | A single atomic commit of OBJECTIVES.md + config.json + STATE.md is the right transaction boundary per Phase 1 D-09 | Topic 5 recommendation | Risk is consistency — three commits could leave repo in inconsistent state mid-transaction (OBJECTIVES written but config.json not yet), which is what Phase 1 D-09 was designed to prevent. Verified pattern: Phase 2 Plan 02-04 committed frontmatter.cjs D-20 extension + STATE.md `brief:` map init in one atomic commit. Phase 3 follows. `[CITED: Phase 1 CONTEXT.md D-09 + Phase 2 Plan 02-04 precedent]` |
| A4 | Keyword regex for Korea-signal detection is sufficient for v1 Phase 3 (with over-suggest bias) | Topic 9, Pitfall 2 | Risk is false negatives (Pitfall 2 in this research). Mitigated by keyword set breadth (English KR/Korea/Seoul/won + Korean 핀테크/카카오/네이버/토스 + enum value kr/korea) + any-match-triggers-precheck logic. v1.1 refinement per CONTEXT.md deferred ideas. `[ASSUMED — pilot in Phase 9 HRD-04 will reveal refinement needs]` |
| A5 | `/brief-discover` command stub (not full body) is sufficient for Phase 3 block-gate target | Topic 6 recommendation | Risk is orphan stub — if Phase 5 substantially redesigns `/brief-discover` the stub may need rework. Low risk: the stub is 30+40 lines (command.md + workflow.md) calling `brief-tools objectives validate` and emitting a Phase 5 placeholder. Phase 5 replaces the placeholder; gate invocation stays put. `[ASSUMED — confirm with Phase 5 planner when that phase enters context gathering]` |
| A6 | Single file `brief/workflows/define.md` with mode-select branch stays under ~400 lines | Topic 8 recommendation | Risk is file-size bloat. Mitigated: Mode A and Mode B share ~60% of prompt material (config inference, confirm flow, Korea-signal check); only conversational steps differ. Estimated 250–350 lines total. If the estimate is wrong, executor can amend CONTEXT.md per D-08 to split files. `[ASSUMED — planner must verify at plan-creation time]` |
| A7 | OBJECTIVES.md frontmatter mirrors config.json's brief.* keys; config.json is primary for machine reads, frontmatter is human-readable + Phase 4 ALIGN convenience | Topic 3, Example 4 | Risk is divergence — user edits one file and not the other, downstream reads stale value. Mitigated: Phase 3 writes both atomically in same commit; divergence detection deferred to Phase 4 ALIGN or Phase 9 health (acknowledged in Example 5 note). Alternative considered: OBJECTIVES.md-only (no config.json mirror) — rejected because REQUIREMENTS DEF-04 mandates config.json write for context injection. `[ASSUMED — confirm single-source policy with user or defer to Phase 4 planner]` |
| A8 | Phase 3 does NOT need to install a global command-dispatcher hook for stale-anchor (D-13) | Topic 7 recommendation | Risk is scope creep — if phase-entry stale-anchor is needed in Phase 4+ and was omitted from Phase 3, Phase 4 planner must wire it. Mitigated: CONTEXT.md D-13 scopes the check to new-activity entry; Phase 3 wires it at the two relevant entry points (`/brief-discover` stub + `/brief-define --amend`). Phase 4 adds phase-entry wrap when that phase ships. `[CITED: CONTEXT.md D-13 scoping]` |

**If this table is empty:** N/A — 8 assumptions tagged for user confirmation (A1, A4–A8) or already verified (A2, A3, A8).

## Open Questions

1. **Korean prompt template exact wording (A1)**
   - What we know: D-03 locks implicit Push Twice; D-04 locks hybrid Dream State format; Claude's Discretion permits planner to author exact prose.
   - What's unclear: Whether the Pattern 2–4 Korean templates as drafted here will feel natural or clinical to pilot users.
   - Recommendation: Planner records these templates verbatim in workflow markdown as v1 baseline. Phase 9 HRD-04 pilot surfaces refinements. Do NOT open CONTEXT.md to re-debate — D-08 meta-discipline says planner/executor resolve this level of detail themselves.

2. **Dialogue pause/resume mid-session**
   - What we know: CONTEXT.md Deferred Ideas acknowledges this but offers a suggested default (status: in_progress).
   - What's unclear: Will users actually quit mid-session? Will they want to re-enter with a "resume from last question" UX, or restart fresh?
   - Recommendation: Ship v1 with the suggested default: partial writes use `status: in_progress`, block-gate treats `in_progress` as incomplete. Mode B `--amend` re-entry on `in_progress` OBJECTIVES.md jumps to the step where the conversation stopped. If pilot reveals this UX feels lossy, refine in v1.x.

3. **`/brief-confirm-objectives` as real command vs sub-flag**
   - What we know: D-13 stale-anchor flow references it; planner's call per Surface Caps discipline.
   - What's unclear: Whether a dedicated command is warranted (memorability) or a sub-flag on `/brief-status` is sufficient.
   - Recommendation: Absorb into stale-anchor 3-choice flow. The 3 options (`잠시 검토에` / `현재 OBJECTIVES를 보고 맞으면 승인` / `이제 승인, 빠르게 진행`) implement all the needed paths without a new command. Phase 3's net command additions stay at +2 (`/brief-define`, `/brief-discover` stub) preserving the "+1 per phase" implicit cadence Phase 2 D-09 narrative assumes.

4. **Mode B selection UI for mutable sections**
   - What we know: D-07 immutable lock; Mode B "어느 부분을 다시 보시겠어요?" prompt.
   - What's unclear: Whether to show Immutable Intent items with a 🔒 marker (visible but unselectable) or omit them entirely from the Mode B selection prompt.
   - Recommendation: Show with 🔒 marker as greyed-out/disabled options — surfaces the existence of the lock AND the `--unlock-intent` escape, per Pitfall 1 two-layer enforcement mandate. In `text_mode`, render as: `(잠김 — --unlock-intent 필요) 창업자 정체성`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All | ✓ | ≥22 (per engines) | None — hard requirement |
| npm | Package management | ✓ | bundled | None |
| `git` | Atomic commit via `brief-tools commit` | ✓ | (assumed) | None — BRIEF requires |
| `node:test` | Test suite | ✓ | built-in | None — stdlib |
| `c8` | Coverage | ✓ | devDependency | None |
| AskUserQuestion (runtime-native) | Interactive prompts in Claude Code | ✓ | per Claude Code runtime | `text_mode` fallback (Phase 1 FND-06 VERIFIED) for Codex/Gemini/OpenCode |
| `INSTRUCTION_FILE` env var | Non-Claude-Code runtimes | ✓ | per runtime | None needed — already wired |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** AskUserQuestion in non-Claude-Code runtimes falls back to `text_mode` numbered-list prompts — VERIFIED via Phase 1 FND-06 entry.

## Validation Architecture

(Nyquist enabled — `workflow.nyquist_validation: true` in `.planning/config.json`. This section is mandatory.)

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `node:test` (built-in Node 22) + `c8` coverage at 70% line threshold |
| Config file | None (node:test needs none; c8 in package.json scripts) |
| Quick run command | `node --test tests/brief-define-*.test.cjs` |
| Full suite command | `node scripts/run-tests.cjs` (existing BRIEF runner) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DEF-01 | Push Twice + Language Precision conversational intent extractor (Mode A flow produces OBJECTIVES.md with core_value / problem_statement populated from free-text) | integration | `node --test tests/brief-define-mode-a.test.cjs` | ❌ Wave 0 (NEW) |
| DEF-02 | Dream State Mapping produces prose for now/3mo/12mo + optional quantitative slots in OBJECTIVES.md Mutable Hypotheses section | integration | `node --test tests/brief-define-mode-a.test.cjs` (same test file; assertion on Dream State sections) | ❌ Wave 0 |
| DEF-03 | Project-level OBJECTIVES.md with `## Immutable Intent` + `## Mutable Hypotheses` sections; per-workstream NOT created (D-09 scope) | unit + integration | `node --test tests/brief-define-mode-a.test.cjs` (section presence) + `tests/brief-objectives-schema.test.cjs` (schema round-trip) | ❌ Wave 0 |
| DEF-04 | `brief.business_model`, `brief.region`, `brief.audience_policy`, `brief.compliance_packs` written to config.json with valid enum values | unit | `node --test tests/brief-define-mode-a.test.cjs` (config.json post-write deep-equal) | ❌ Wave 0 |
| DEF-05 | `/brief-discover` blocks (exit ≠ 0 + structured Korean error) when OBJECTIVES.md missing required fields | smoke | `node --test tests/brief-objectives-block-gate.test.cjs` | ❌ Wave 0 |
| DEF-06 | Stale-anchor 48h notice fires with 3 options on new-activity entry only | smoke | `node --test tests/brief-define-stale-anchor.test.cjs` | ❌ Wave 0 |

**Additional validation (not in DEF-01–06 but load-bearing):**

| Validation | Test Type | Command | File |
|------------|-----------|---------|------|
| Mode B immutable-section lock refuses write on immutable edit | smoke | `node --test tests/brief-define-mode-b.test.cjs` | ❌ Wave 0 |
| `--unlock-intent` flag permits immutable edit | smoke | same file | ❌ Wave 0 |
| Korea-signal detection triggers compliance_packs pre-check | unit | `node --test tests/brief-objectives-korea-signals.test.cjs` | ❌ Wave 0 |
| `text_mode` produces identical OBJECTIVES.md + config.json as AskUserQuestion path for same fixture | parity | `node --test tests/brief-define-text-mode.test.cjs` | ❌ Wave 0 |
| Atomic 3-artifact commit (OBJECTIVES.md + config.json + STATE.md in ONE commit) | smoke | subset of `tests/brief-define-mode-a.test.cjs` — `git log --name-only -1` assertion | ❌ Wave 0 |
| OBJECTIVES.md frontmatter round-trip through frontmatter.cjs D-20 (nested maps, arrays) | unit | extend existing `tests/frontmatter-roundtrip.test.cjs` with OBJECTIVES.md-shape fixture | existing — extend |
| Canary structural assertion (orchestrator-workers pattern works): `/brief-define` writes OBJECTIVES.md via the same workflow+lib split Phase 5+ will reuse | architectural | `node --test tests/brief-define-canary.test.cjs` — asserts `commands/brief/define.md` references `brief/workflows/define.md` + `brief-tools.cjs` dispatches to `define.cjs`/`objectives.cjs` | ❌ Wave 0 |

### Canonical Fixture — Korea-First B2C Persona

Single persona fixture that every Phase 3 smoke test uses. Derived from CONTEXT.md code_context "Korea-first B2C persona" recommendation.

```javascript
// tests/fixtures/brief-define/korea-first-b2c.cjs (NEW)

module.exports = {
  persona_name: '한국-첫-B2C-피트니스-앱-기획자',

  entry_mode: 'A',  // D-05 Mode A Greenfield

  conversation_transcript: {
    // Mode A opening — free-text seed
    opening: '퇴근 후 혼자 집에서 운동하는 1인 가구 직장인들을 위한 홈트레이닝 앱을 만들고 싶어요.',

    // Push Twice on "homework" ambiguity
    push_twice_core_value: {
      seed: '편하게 운동할 수 있게요',
      push_1_answer: '혼자서도 자세가 맞는지 확인할 수 있도록, AI가 봐주면서',
      push_2_answer: '헬스장에 가지 않아도 PT받는 느낌이 나도록, 격려와 피드백',
    },

    // Language Precision on "기업"/"개인" — lands on b2c
    language_precision_audience: {
      seed: '개인 사용자',
      refinement: '20–30대 직장인, 퇴근 후 30분–1시간, 집에서 혼자',
    },

    // Dream State Mapping
    dream_state: {
      now: {
        prose: '지금은 홈트레이닝 유튜브를 틀어놓고 따라하지만 자세가 맞는지 모르고, 혼자라 동기부여가 없어서 3일 만에 그만둡니다. 헬스장 등록해놓고 안 가는 사람이 주변에 많습니다.',
        metrics: {
          '현재 홈트 3일 유지율': '(모름)',
          '헬스장 미출석률': '약 70% (뉴스 인용)',
        },
      },
      three_month: {
        prose: 'MVP가 나와서 베타 유저 50명이 주 3회 이상 사용합니다. AI 자세 교정이 핵심 차별화로 인식됩니다.',
        metrics: {
          '베타 사용자 수': '50명',
          '주 3회 유지율': '40%+',
          '월 구독료': '(미정)',
        },
      },
      twelve_month: {
        prose: '유료 사용자 5천 명, 월 9,900원 구독 모델. 앱스토어 건강/피트니스 카테고리 상위 10위권.',
        metrics: {
          '월 구독자 수': '5,000명',
          '월 매출': '약 5천만원',
          '앱스토어 순위': '10위권',
        },
      },
    },

    // Implicit Korea signals — triggers D-11 pre-check
    korea_signals_detected: [
      'Korean language throughout',
      '직장인 (Korean employment context)',
      '퇴근 후 (Korean work-hour idiom)',
      '월 9,900원 (Korean currency)',
      '앱스토어 (Korean market mention)',
    ],

    // Expected 4-config inference
    expected_configs: {
      business_model: 'b2c',
      region: 'kr',
      audience_policy: 'internal',  // no mention of partner/external — default internal
      compliance_packs: ['PIPA', 'ISMS-P', 'MyData'],  // pre-checked because Korea signals
    },
  },

  // Expected OBJECTIVES.md shape (used for deep-equal assertions)
  expected_objectives: {
    frontmatter: {
      brief_objectives_version: '1.0',
      status: 'ready',
      mode: 'greenfield',
      business_model: 'b2c',
      region: 'kr',
      audience_policy: 'internal',
      compliance_packs: ['PIPA', 'ISMS-P', 'MyData'],
      immutable_items: ['creator-identity', 'core-value', 'problem-statement'],
    },
    body_sections_present: [
      'Immutable Intent',
      'Creator Identity',
      'Core Value',
      'Problem Statement',
      'Mutable Hypotheses',
      'Target Audience Specifics',
      'Verification Metrics',
      'Hypothesized Alternative Tools / Competitors',
      'Dream State — Now',
      'Dream State — 3-month',
      'Dream State — 12-month',
    ],
  },
};
```

### A4-Style End-to-End Round-Trip Test (OBJECTIVES.md)

Mirrors Phase 2 `state-brief-roundtrip.test.cjs` Cycle 1–3 + Placeholder pattern. Exercises the full OBJECTIVES.md lifecycle end-to-end.

```javascript
// tests/brief-define-mode-a.test.cjs (CORE TEST FILE — the canary gate)

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { runGsdTools, createTempProject, cleanup } = require('./helpers.cjs');
const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');
const fixture = require('./fixtures/brief-define/korea-first-b2c.cjs');

describe('/brief-define Mode A end-to-end (A4-style, Phase 3 canary)', () => {
  let tmpDir;
  let objectivesPath;
  let configPath;
  let statePath;

  beforeEach(() => {
    tmpDir = createTempProject();
    objectivesPath = path.join(tmpDir, '.planning', 'OBJECTIVES.md');
    configPath = path.join(tmpDir, '.planning', 'config.json');
    statePath = path.join(tmpDir, '.planning', 'STATE.md');
  });

  afterEach(() => { cleanup(tmpDir); });

  test('Cycle 1 — Mode A with Korea-first B2C fixture writes OBJECTIVES.md with correct shape', () => {
    // Inject fixture via a test-only stub or via a fixture-runner subcommand
    // (e.g., `brief-tools define apply --fixture korea-first-b2c` which the
    // test helper invokes; NOT exposed to end users).
    const result = runGsdTools(
      ['define', 'apply', '--fixture', 'korea-first-b2c.cjs'],
      tmpDir,
    );
    assert.ok(result.success, `define apply failed: ${result.error || result.output}`);

    // OBJECTIVES.md exists
    assert.ok(fs.existsSync(objectivesPath), 'OBJECTIVES.md created');

    const content = fs.readFileSync(objectivesPath, 'utf-8');
    const fm = extractFrontmatter(content);

    // Frontmatter shape matches fixture expectation
    assert.deepStrictEqual(
      {
        status: fm.status,
        mode: fm.mode,
        business_model: fm.business_model,
        region: fm.region,
        audience_policy: fm.audience_policy,
        compliance_packs: fm.compliance_packs,
        immutable_items: fm.immutable_items,
      },
      {
        status: 'ready',
        mode: 'greenfield',
        business_model: 'b2c',
        region: 'kr',
        audience_policy: 'internal',
        compliance_packs: ['PIPA', 'ISMS-P', 'MyData'],
        immutable_items: ['creator-identity', 'core-value', 'problem-statement'],
      },
      'OBJECTIVES.md frontmatter matches Korea-first B2C fixture expectation',
    );

    // Body sections present
    for (const section of fixture.expected_objectives.body_sections_present) {
      assert.match(content, new RegExp(`^#{1,3}\\s+${section}`, 'm'),
        `body section "${section}" present`);
    }
  });

  test('Cycle 2 — config.json extended with brief.* keys (4 configs)', () => {
    runGsdTools(['define', 'apply', '--fixture', 'korea-first-b2c.cjs'], tmpDir);
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    assert.deepStrictEqual(config.brief, {
      business_model: 'b2c',
      region: 'kr',
      audience_policy: 'internal',
      compliance_packs: ['PIPA', 'ISMS-P', 'MyData'],
    }, 'config.json.brief matches expected 4-config shape');

    // Non-brief keys preserved (not clobbered)
    assert.strictEqual(config.model_profile, 'quality', 'model_profile untouched');
    assert.strictEqual(config.workflow.nyquist_validation, true, 'workflow.* untouched');
  });

  test('Cycle 3 — atomic commit contains exactly 3 planning files', () => {
    runGsdTools(['define', 'apply', '--fixture', 'korea-first-b2c.cjs'], tmpDir);
    const gitLog = runGsdTools(
      ['shell', 'git', 'log', '-1', '--name-only', '--format='],
      tmpDir,
    );
    const files = gitLog.output.trim().split('\n').sort();
    assert.deepStrictEqual(files, [
      '.planning/OBJECTIVES.md',
      '.planning/STATE.md',
      '.planning/config.json',
    ], 'atomic commit contains exactly 3 planning files — canary PASS');
  });

  test('Cycle 4 — OBJECTIVES.md round-trips via frontmatter.cjs (D-20) without drift', () => {
    runGsdTools(['define', 'apply', '--fixture', 'korea-first-b2c.cjs'], tmpDir);
    const content1 = fs.readFileSync(objectivesPath, 'utf-8');
    const fm1 = extractFrontmatter(content1);

    // Simulate a re-save (e.g., by Mode B writer adding a mutable note)
    // — frontmatter must survive unchanged on non-immutable-field writes.
    // ... (read-write cycle) ...

    const fm2 = extractFrontmatter(fs.readFileSync(objectivesPath, 'utf-8'));
    assert.deepStrictEqual(fm2, fm1, 'frontmatter unchanged across write cycle');
  });
});
```

### Block-Gate Smoke Test (DEF-05)

```javascript
// tests/brief-objectives-block-gate.test.cjs

describe('/brief-discover block gate on incomplete OBJECTIVES.md (DEF-05, D-12)', () => {
  test('Missing compliance_packs → exit 1 + Korean recovery-oriented message', () => {
    const tmpDir = createTempProject();
    // Seed OBJECTIVES.md missing compliance_packs field
    fs.writeFileSync(
      path.join(tmpDir, '.planning', 'OBJECTIVES.md'),
      `---
brief_objectives_version: 1.0
status: ready
business_model: b2c
region: kr
audience_policy: internal
# compliance_packs: MISSING
---

# OBJECTIVES
`,
    );
    const result = runGsdTools(['shell', 'brief-tools', 'discover'], tmpDir);
    assert.notStrictEqual(result.exitCode, 0, 'exit code non-zero (hard block)');
    assert.match(result.output, /⚠/, 'warning glyph present');
    assert.match(result.output, /compliance_packs/, 'missing field name present');
    assert.match(result.output, /\/brief-define --amend/, 'recovery command present');
    assert.match(result.output, /그대로 남아있습니다/, 'content preservation reassurance in Korean');
  });
});
```

### Stale-Anchor Smoke Test (DEF-06)

```javascript
// tests/brief-define-stale-anchor.test.cjs

describe('Stale-anchor 48h notice (DEF-06, D-13)', () => {
  test('OBJECTIVES.md mtime > 48h + /brief-discover entry → 3-option prompt', () => {
    const tmpDir = createTempProject();
    const objPath = path.join(tmpDir, '.planning', 'OBJECTIVES.md');
    // Seed with valid OBJECTIVES.md
    seedValidObjectives(objPath);
    // Backdate mtime to 49h ago
    const pastMs = Date.now() - (49 * 60 * 60 * 1000);
    fs.utimesSync(objPath, new Date(pastMs), new Date(pastMs));
    // Invoke /brief-discover
    const result = runGsdTools(['shell', 'brief-tools', 'discover'], tmpDir);
    assert.match(result.output, /48시간/, 'stale-anchor threshold surfaced');
    assert.match(result.output, /잠시 검토에/, 'option 1 present');
    assert.match(result.output, /현재 OBJECTIVES를 보고/, 'option 2 present');
    assert.match(result.output, /이제 승인, 빠르게 진행/, 'option 3 present');
  });

  test('OBJECTIVES.md mtime > 48h + /brief-status entry → NO stale-anchor prompt', () => {
    // D-13: /brief-status MUST NOT trigger stale-anchor
    const tmpDir = createTempProject();
    const objPath = path.join(tmpDir, '.planning', 'OBJECTIVES.md');
    seedValidObjectives(objPath);
    const pastMs = Date.now() - (49 * 60 * 60 * 1000);
    fs.utimesSync(objPath, new Date(pastMs), new Date(pastMs));
    const result = runGsdTools(['status'], tmpDir);
    assert.doesNotMatch(result.output, /잠시 검토에/, 'NO stale-anchor prompt on /brief-status');
  });
});
```

### `text_mode` Parity Test (FND-06 flowdown)

```javascript
// tests/brief-define-text-mode.test.cjs

describe('/brief-define text_mode parity (FND-06)', () => {
  test('Same Korea-first B2C fixture produces same OBJECTIVES.md in text_mode', () => {
    const tmpA = createTempProject();
    const tmpB = createTempProject();

    // Run A: AskUserQuestion mode (default)
    runGsdTools(['define', 'apply', '--fixture', 'korea-first-b2c.cjs'], tmpA);

    // Run B: text_mode forced via config
    const configB = JSON.parse(fs.readFileSync(
      path.join(tmpB, '.planning', 'config.json'), 'utf-8'));
    configB.workflow.text_mode = true;
    fs.writeFileSync(
      path.join(tmpB, '.planning', 'config.json'),
      JSON.stringify(configB, null, 2),
    );
    runGsdTools(['define', 'apply', '--fixture', 'korea-first-b2c.cjs'], tmpB);

    const objA = fs.readFileSync(path.join(tmpA, '.planning', 'OBJECTIVES.md'), 'utf-8');
    const objB = fs.readFileSync(path.join(tmpB, '.planning', 'OBJECTIVES.md'), 'utf-8');
    // Normalize any non-determinism (timestamps)
    const normalize = s => s.replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z/g, '<TS>');
    assert.strictEqual(normalize(objA), normalize(objB),
      'text_mode produces identical OBJECTIVES.md to AskUserQuestion mode (FND-06)');
  });
});
```

### Canary Structural Assertion

```javascript
// tests/brief-define-canary.test.cjs — proves the orchestrator-workers pattern

describe('Phase 3 canary: orchestrator-workers pattern wired end-to-end', () => {
  test('commands/brief/define.md dispatches to brief/workflows/define.md', () => {
    const cmdMd = fs.readFileSync('commands/brief/define.md', 'utf-8');
    assert.match(cmdMd, /brief\/workflows\/define\.md/,
      'command file @refs workflow file — orchestrator pattern');
  });
  test('brief-tools.cjs routes `define` command to lib/define.cjs', () => {
    const toolsCjs = fs.readFileSync('brief/bin/brief-tools.cjs', 'utf-8');
    assert.match(toolsCjs, /case 'define'/, 'dispatcher case present');
    assert.match(toolsCjs, /require\(.\/lib\/define\.cjs/, 'lib import present');
  });
  test('brief/bin/lib/objectives.cjs exports the critical primitives Phase 5+ will reuse', () => {
    const obj = require('../brief/bin/lib/objectives.cjs');
    for (const fn of ['writeObjectivesMd', 'readObjectivesMd', 'validateObjectivesComplete',
                       'checkStaleAnchor', 'enforceImmutableLock']) {
      assert.strictEqual(typeof obj[fn], 'function',
        `objectives.cjs exports ${fn} (Phase 5+ reuse target)`);
    }
  });
});
```

### Mocking AskUserQuestion in Tests

The tests above invoke `/brief-define` end-to-end via a test-only `--fixture` flag on the `define apply` subcommand. This fixture flag SHORT-CIRCUITS the AskUserQuestion interaction loop by injecting pre-computed answers directly into the lib layer, bypassing the workflow markdown entirely. Pattern:

```javascript
// brief/bin/lib/define.cjs (NEW — fixture-aware path)

async function cmdDefineApply(cwd, flags) {
  if (flags.fixture) {
    // Test-only path: load fixture, skip interactive loop, run with canned answers
    const fixturePath = path.resolve(__dirname, '..', '..', '..',
                                     'tests', 'fixtures', 'brief-define', flags.fixture);
    const fixture = require(fixturePath);
    return applyFromFixture(cwd, fixture);
  }
  // Production path: full interactive loop
  return runInteractiveModeA(cwd);
}
```

This mirrors the Phase 2 `runGsdTools(['state', 'json'])` test pattern — drive the production CLI path with test-controlled inputs instead of mocking internal modules. Keeps test surface aligned with user surface.

### Sampling Rate

- **Per task commit:** `node --test tests/brief-define-mode-a.test.cjs tests/brief-define-mode-b.test.cjs tests/brief-objectives-block-gate.test.cjs` (the 3 smoke files). Fast (<10s) feedback on the canary core.
- **Per wave merge:** `node --test tests/brief-define-*.test.cjs tests/brief-objectives-*.test.cjs` (all Phase 3 tests).
- **Phase gate:** Full suite green before `/brief-verify-work`. `node scripts/run-tests.cjs`. Residual Phase 1 HRD-05 failures (63) remain deferred per 01-VERIFICATION.md; Phase 3 net-new failures must be 0.

### Wave 0 Gaps

- [ ] `tests/fixtures/brief-define/korea-first-b2c.cjs` — canonical fixture
- [ ] `tests/brief-define-mode-a.test.cjs` — Mode A end-to-end smoke (DEF-01, DEF-02, DEF-03, DEF-04, atomic-commit canary)
- [ ] `tests/brief-define-mode-b.test.cjs` — Mode B immutable-lock + `--unlock-intent` escape (D-07)
- [ ] `tests/brief-objectives-block-gate.test.cjs` — DEF-05 + D-12
- [ ] `tests/brief-objectives-korea-signals.test.cjs` — D-11 conditional Korea pre-check
- [ ] `tests/brief-define-text-mode.test.cjs` — FND-06 parity
- [ ] `tests/brief-define-stale-anchor.test.cjs` — DEF-06 + D-13 (positive AND negative cases — /brief-discover DOES trigger, /brief-status does NOT)
- [ ] `tests/brief-define-canary.test.cjs` — structural assertion the orchestrator-workers pattern is wired (command→workflow→lib + exported primitives for Phase 5+ reuse)

**No framework install needed** — `node:test` is built-in; `c8` is existing devDependency.

## Existing Test Patterns (Topic 11)

Closest analogs in `tests/` (by pattern type):

| Phase 3 test | Closest existing analog | What to copy |
|--------------|-------------------------|--------------|
| `brief-define-mode-a.test.cjs` (A4-style round-trip) | `tests/state-brief-roundtrip.test.cjs` (Phase 2 A4) | Cycle 1/2/3/Placeholder structure; `createTempProject` / `runGsdTools` helpers; deep-equal assertions on round-trip |
| `brief-objectives-block-gate.test.cjs` (exit code + error text) | `tests/status-renderer.test.cjs` (Phase 2 FND-10) | Dispatcher invocation pattern; output-match regex assertions |
| `brief-define-text-mode.test.cjs` (multi-runtime parity) | `tests/ask-user-questions-fallback.test.cjs` | text_mode forcing via config; fixture-pair differential assertion |
| `brief-objectives-korea-signals.test.cjs` (heuristic unit) | `tests/frontmatter-roundtrip.test.cjs` (pure lib-layer unit) | Import from lib directly; assert function behavior without disk I/O |
| `brief-define-mode-b.test.cjs` (immutable-lock) | `tests/frontmatter-cli.test.cjs` (validation CLI) | Validation-failure exit code; structured error message format |
| `brief-define-stale-anchor.test.cjs` (mtime + timing) | `tests/read-guard.test.cjs` (time-based behavior) | `fs.utimesSync` pattern for backdating; positive AND negative activity-entry test cases |
| `brief-define-canary.test.cjs` (structural) | `tests/architecture-counts.test.cjs` (repo structure) | File existence + content regex assertions on source tree |

## Risk-Adjusted Scoping (Topic 12 — "적정선" D-08)

### Minimum-Viable Set (MUST ship in Phase 3)

These are load-bearing for v1 Phase 3 canary. Missing any one breaks DEF-01–06 or the canary property.

1. `/brief-define` Mode A end-to-end on the Korea-first B2C fixture (DEF-01, DEF-02, DEF-03 project-level, DEF-04)
2. OBJECTIVES.md frontmatter + body schema with `## Immutable Intent` / `## Mutable Hypotheses` sections
3. 4-config write to `.planning/config.json` under `brief.*` namespace with Korea-signal-conditional pre-check
4. Atomic 3-artifact commit (OBJECTIVES.md + config.json + STATE.md)
5. `/brief-discover` STUB command + workflow invoking the block-gate (DEF-05)
6. Mode B immutable-section lock at the writer layer (Pitfall #3 mitigation)
7. Stale-anchor 48h check wired to `/brief-discover` entry (DEF-06)
8. Tests: Mode A smoke, Mode B lock, block-gate, Korea-signal, text_mode parity, stale-anchor, canary structural

### Nice-to-Have Set (planner may defer if Phase 3 runs long)

Executor-amendment per D-08 can defer these to Phase 4 (ALIGN) or Phase 9 (HRD polish):

1. `--unlock-intent` flag full implementation (Phase 3 may ship detection + rejection error only; full unlock flow in Phase 4 if immutable-edit demand surfaces in pilot)
2. Mode B "한 항목씩 검토" and "전체 재분류" fine-grained navigation (v1 may land with ONE option — `승인` — as tested path, and two-option refinement)
3. Dialogue pause/resume mid-session (deferred per CONTEXT.md; v1 default = `status: in_progress` + block-gate treats as incomplete)
4. OBJECTIVES.md ↔ config.json divergence detection (deferred to Phase 4 ALIGN health check)
5. `/brief-help --define` rich surface (Phase 9 HRD-03)
6. OBJECTIVES.md semantic validation ("3mo state concrete vs 12mo state") — Phase 4 ALIGN territory
7. Additional compliance pack identifiers beyond the initial 8 (PIPA/ISMS-P/MyData/GDPR/CCPA/SOC-2/HIPAA/PCI-DSS)
8. English-template fallback for non-KR projects — v1 ships Korean default; executor may ship English templates at the same time if bandwidth allows

### Flag to Planner

Over-engineering the Phase 3 canary is the single biggest risk (per D-08 meta-discipline + user's "적정선" call). If the planner finds themselves wanting to build:

- A general-purpose prompt template engine → STOP. Inline the Korean prompts into workflow markdown.
- An OBJECTIVES.md versioning system with diff history → STOP. mtime is enough for v1 stale-anchor.
- A pluggable Korea-signal detection pipeline → STOP. Keyword regex fits on one screen.
- A multi-fixture test harness → STOP. One Korea-first B2C fixture is enough for Phase 3 canary. Add fixtures in Phase 4+ when the ALIGN gate needs more variety.

The canary's job is to prove the pattern works on ONE code path. Not to generalize prematurely.

## Project Constraints (from CLAUDE.md)

- **Zero runtime dependencies (A1 VERIFIED)**: Phase 3 MUST NOT add packages to `dependencies`. All supporting needs (interactive prompts, YAML, validation) use existing primitives (`INSTRUCTION_FILE`+`text_mode`, `frontmatter.cjs` D-20, inline validation).
- **CommonJS `.cjs` only**: All new lib files under `brief/bin/lib/` are `.cjs`. No ESM.
- **Multi-runtime preservation**: Claude Code / Codex / Gemini / OpenCode all must work. `INSTRUCTION_FILE` detection and `text_mode` fallback MUST be invoked — no Claude-Code-only assumptions.
- **`node:test` + c8 70% threshold**: New tests follow `node:test` idiom. Phase 3's additions must keep coverage ≥ 70%.
- **Surface Caps ≤12 user-facing commands / ≤8 skills**: Phase 3 adds +2 user-facing commands (`/brief-define`, `/brief-discover` stub). Running count after Phase 3 ≈ 62+2 = 64 commands (still well over cap; Phase 9 HRD-02 audits down to 12). Phase 3 MUST NOT add commands beyond the requirement-mapped set.
- **Atomic buildable commits (Phase 1 D-09)**: Every Phase 3 commit leaves the repo buildable. The atomic 3-artifact commit is a single transaction.
- **BRIEF Workflow Enforcement**: Planning artifacts go through `/brief-discuss-phase` → `/brief-plan-phase` → `/brief-execute-phase` → `/brief-verify-work`. Phase 3 planner starts from `/brief-plan-phase 3`.
- **Absorb gstack patterns, don't depend on them**: Push Twice / Language Precision / Dream State Mapping content absorbed as Korean-adapted prompt templates in `brief/workflows/define.md`. No `gstack` package install. No runtime reference to the upstream files.
- **Hard rename — no `gsd-*` aliases**: Any identifier Phase 3 creates is `brief-*`. No aliases.

## Security Domain

Phase 3 does not introduce new security-surface changes. The four configs written to config.json (`business_model`, `region`, `audience_policy`, `compliance_packs`) are non-secret metadata. `audience_policy: internal` is a FRONT-MATTER default used later by AUDIENCE guard in Phase 5 — Phase 3 does not enforce audience checks.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A — BRIEF is local CLI, no user auth |
| V3 Session Management | no | N/A |
| V4 Access Control | no | N/A |
| V5 Input Validation | yes | Inline validation in `objectives.cjs` (`validateObjectivesComplete`) and `define.cjs` (4-config enum validation). No injection vector — all writes go through atomicWriteFileSync with path-traversal guards already in core.cjs. |
| V6 Cryptography | no | N/A |

### Known Threat Patterns for Phase 3

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal via fixture path injection in test-only `--fixture` flag | Tampering | `path.resolve(__dirname, 'tests/fixtures', fixtureName)` + reject fixtures not under that dir. Keep `--fixture` test-only (not documented in user-facing help). |
| Frontmatter injection via `status: "crafted\n---\nmalicious:"` | Tampering | D-20 serializer already quotes strings containing `#`/`:` and escapes control chars; VERIFIED in existing frontmatter-roundtrip tests. |
| PII leakage to OBJECTIVES.md (user inadvertently types real 주민등록번호 during Mode A) | Information Disclosure | CONTEXT.md out-of-scope for Phase 3; mention in planner notes that Phase 5+ PII scanner covers this. Phase 3 does not ship PII detection but the threat is acknowledged. |
| Immutable-section bypass via direct file edit (user edits OBJECTIVES.md in text editor, bypasses `--unlock-intent` gate) | Tampering | Phase 3 enforces lock at the writer layer — the user CAN manually edit the file with `vim`, but Mode B's next `/brief-define --amend` will detect the mutation via immutable_items frontmatter anchor + mtime cross-check. Phase 4 ALIGN reports it as a finding. |

## Sources

### Primary (HIGH confidence)

- `/Users/agent/GSD-for-Business/.planning/phases/03-define-canary-phase-0-end-to-end/03-CONTEXT.md` — 13 locked decisions + D-08 meta-discipline (direct read)
- `/Users/agent/GSD-for-Business/.planning/phases/03-define-canary-phase-0-end-to-end/03-DISCUSSION-LOG.md` — gray-area audit trail (direct read)
- `/Users/agent/GSD-for-Business/.planning/REQUIREMENTS.md` — DEF-01..DEF-06 (direct read)
- `/Users/agent/GSD-for-Business/.planning/ROADMAP.md` — Phase 3 Goal lines 71–84 (direct read)
- `/Users/agent/GSD-for-Business/.planning/STATE.md` — Project state (direct read)
- `/Users/agent/GSD-for-Business/.planning/PROJECT.md` — Vision + Key Decisions (direct read)
- `/Users/agent/GSD-for-Business/.planning/ASSUMPTIONS.md` — A1 VERIFIED (zero deps), A4 VERIFIED (state round-trip), FND-06 VERIFIED (multi-runtime) (direct read)
- `/Users/agent/GSD-for-Business/.planning/research/PITFALLS.md` — #3 OBJECTIVES.md drift, #9 non-dev friction, #12 slash cmd memorability (direct read)
- `/Users/agent/GSD-for-Business/.planning/phases/02-stable-seam-anchor-schema-caps-workstream-as-config/02-CONTEXT.md` — D-03/D-06/D-09/D-12/D-18/D-20/D-21 inherited decisions (direct read)
- `/Users/agent/GSD-for-Business/brief/bin/lib/frontmatter.cjs` — D-20 serializer behavior (direct read)
- `/Users/agent/GSD-for-Business/brief/bin/lib/status.cjs` — D-18 split pattern (direct read)
- `/Users/agent/GSD-for-Business/brief/bin/brief-tools.cjs` — SDK dispatch shape (direct read)
- `/Users/agent/GSD-for-Business/tests/state-brief-roundtrip.test.cjs` — A4-style round-trip template (direct read)
- `/Users/agent/GSD-for-Business/tests/status-renderer.test.cjs` — dispatcher test pattern (direct read)
- `/Users/agent/GSD-for-Business/.planning/config.json` — plain JSON shape (direct read, confirms A2)

### Secondary (MEDIUM confidence)

- CLAUDE.md — BRIEF project constraints (zero deps, CJS-only, Surface Caps, gstack/superpowers patterns-not-deps) — direct read
- gstack `office-hours/SKILL.md` — pattern reference for Push Twice / Language Precision / Reframing — cited in PROJECT.md Context and CLAUDE.md Patterns to Absorb, not re-fetched in this research pass (citations preserved through PROJECT.md + CLAUDE.md chain)
- gstack `plan-ceo-review/SKILL.md` — Dream State Mapping inspiration — cited via CLAUDE.md Patterns to Absorb

### Tertiary (LOW confidence — explicitly flagged)

- Korean prompt wording (Patterns 2–4): planner-draftable per D-03 Claude's Discretion; pilot refinement expected in Phase 9 HRD-04. `[ASSUMED — v1 baseline, pilot will refine]`
- Korea-signal keyword set: covers the common cases (KR/Korea/Seoul/won/핀테크/카카오/네이버/토스/kr-enum); edge cases (Korean planner writing fluent English about a non-Korea-target project) would false-positive per over-suggest bias. `[ASSUMED — v1.1 refinement deferred]`

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all primitives verified via direct file read; zero new packages.
- Architecture: HIGH — Phase 2 D-18 split pattern + D-20 serializer + D-21 allowlist all verified; Phase 3 composes them.
- Conversational prompts (Patterns 2–4): MEDIUM — Korean templates drafted from pattern understanding, not yet piloted with Korean non-developer planners. Refinement is Phase 9 HRD-04 scope.
- Korea-signal detection: MEDIUM — keyword regex with over-suggest bias is defensible for v1; false-negative risk on English-written-for-Korea-market projects mitigated by keyword breadth.
- Validation Architecture: HIGH — test patterns verified against existing Phase 2 tests; single canonical Korea-first B2C fixture sufficient to exercise all DEF-01–06 smoke.
- Block-gate Korean UX: MEDIUM — canonical template drafted; exact phrasing is planner's Claude's Discretion call.

**Research date:** 2026-04-19
**Valid until:** 2026-05-19 (30 days for stable Phase 3 planning — no fast-moving external dependencies to watch)
