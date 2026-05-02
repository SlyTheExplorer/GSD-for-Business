# Milestones

## v1.0 BRIEF v1.0 — Hard Fork from GSD (Shipped: 2026-05-02)

**Phases completed:** 9 phases, 66 plans, 107 tasks

**Key accomplishments:**

- Git branch `backup/original-gsd` created at pre-Phase-1 main SHA 73e95132 as the sole one-command rollback path (D-06 accepted: GSD upstream merge abandoned)
- 56 GSD development-specific files removed via git rm, audit trail written to tests/removed-surfaces.smoke.txt with 161 disposition-tagged records (149 DELETE-LINE + 3 DELETE-FILE + 9 RESIDUAL) spanning 10 scope sections across the EXPANDED-SCOPE audit (BLOCKER 1 fix). graphify.cjs + its test preserved per D-03 exception.
- Agents (18):
- None.
- 1. [Rule 1 - Bug] zsh word-splitting in unquoted exclude list caused brand-pass to modify UNIFIED EXCLUDE files
- 1. [Rule 1 — Bug] Fixed Plan-05-induced semantic regression in CLAUDE.md Project section
- SHA:
- HALT at Task 6 delta-cap gate. Source-side edits complete and verified. Working tree modified but not committed.
- PARTIAL HALT at Task 7 delta-cap gate. All 31 enumerated files rewritten and committed atomically. Out-of-scope residual documented for Plan 10.
- GATE: HALT
- One-liner:
- One-liner:
- Edit 1 — `brief/bin/lib/state.cjs:814`
- `syncStateFrontmatter` (line ~866-875, +7 lines):
- Zero-dep inline YAML parser + glob-based workstream-spec loader with D-13 schema validation and three STRIDE mitigations — ships Phase 2's FND-08 seam so Phase 7 can populate 9 real workstreams by writing spec.yaml files alone.
- 1. [Rule 1 - Bug] Strip leading zeros from `current_phase` when looking up ROADMAP phase name
- `tests/brief-objectives-roundtrip.test.cjs`
- Found during:
- `tests/brief-define-korea-signal.test.cjs`
- `/brief-discover` STUB command wires Plan 01's `validateObjectivesComplete` primitive to a user-facing slash command with a Pitfall 5 Korean recovery-oriented block-gate (DEF-05) and W-6 silent non-zero exit — no English `validation failed` leaks to stderr.
- One-liner:
- 1. [Rule 3 - Blocking] Fixed incorrect import path for `loadConfig`
- Commit:
- Hybrid ALIGN pipeline end-to-end tested via 4 fixtures + 10-test decision-path suite, with Pitfall #6 MUST-PASS canary (Immutable B2B-enterprise + Mutable App-Store-consumer contradiction) locked against regression.
- commitAlignVerdict atomically writes ALIGN-00.md + STATE.md brief.last_gate_results.align via readModifyWriteStateMd; renderAlignReport moved to align-report.cjs sibling; brief-tools.cjs align run/commit dispatcher with try/catch on both branches; formatGate renders '(override applied)' suffix distinctly from plain ALIGNED
- None — plan executed exactly as written.
- One-liner:
- `buildBusinessContext({cwd})` cross-cutting helper — one call produces XML prompt block for Task-spawn injection AND D-10 AUDIENCE frontmatter defaults, sharing identical underlying business_model/region/language values across both consumers.
- ONE `agents/brief-domain-researcher.md` parameterized by {{CATEGORY}} + {{TOPIC}} + {{OUT_PATH}} serves all 9 default DSC-01 categories AND Custom (DSC-02). The agent consumes the `<business_context>` block from Plan 01's `buildBusinessContext()`, applies a B2B/B2C conditional lens inline (D-15), and enforces provenance-tag + confidence-band discipline at prompt time (D-07 agent-output layer + D-08). 4 tests (27 passing assertions) + 2 golden fixtures lock the contract.
- Shell pre-commit hook that blocks git commits with untagged quantitative claims; 22 tests across 5 files; zero runtime deps; bilingual Korean/English error messages; opt-in via hooks.community config.
- Files verified on disk:
- 1. [Rule 1 - Bug] Test fixtures used paths outside .planning/ under Plan 04 stub-path inertness
- Three Korea compliance primer skeletons (PIPA 2026-09-11 amendment, ISMS-P 2027-07-01 mandatory, MyData 2026 10-sector expansion) shipped with verbatim legal-counsel disclaimer, YAML frontmatter schema, and 20-test smoke suite — target paths aligned with Plan 01 COMPLIANCE_PACK_TO_REFERENCE map.
- 1. [Rule 3 - Blocking] Worktree base drift at start
- Files verified on disk:
- Ten Wave 0 fixture files shipped — 6 gap-detect (agent verdicts, researcher canary, push history) + 4 return-stack (state snapshots spanning depth 0/1/3 + cross-workstream collision) — anchoring the D-01 verdict schema and D-05 7-field frame schema for Plans 02-08.
- Four content files shipping the Phase 6 gap-detector surface — D-01 decision enum + D-03 severity enum + D-09 topic_fingerprint slug contract locked in a single vocabulary reference, a zero-dep paired-sibling renderer, the third canonical gate-agent markdown, and an orchestrator workflow invoked FROM align-gate.md Step 8 per D-02.
- gap-detect.cjs lib lands 13 exported primitives in 390 lines — the Phase-6 core state-machine library implementing Patterns 1/3/4/8 (atomic dual-array push, iteration counting, fingerprint slug discipline, D-11 dual-condition pop) with D-06 append-only history enforced structurally by a grep-audit test. 64 assertions pass across 4 test files; zero runtime deps preserved (A1); Plans 04+ can now wire these primitives into the brief-tools.cjs dispatcher, status.cjs reader, and align-gate.md workflow Step 8.
- Ships the workflow + CLI surface that lets Plans 05/06/07 wire gap-detect into status.cjs, align-gate.md, and /brief-discover. runGapDetect + commitGapDetectVerdict + 7-subcommand dispatcher complete the four-part canonical gate pattern (agent + workflow + lib + dispatcher) for the third time. 23 new test assertions; 87 total gap-detect tests green; 81 adjacent align + audience tests green; 0 runtime deps; 0 new user-facing slash commands; 404-line gap-detect.cjs within the ≤420 D-18 budget; FINGERPRINT_RE broadened to keep canonical D-09 example consistent.
- status.cjs gains two Phase-6 telemetry rows (Gap loop + Round-trips) BELOW Last COMPLIANCE and ABOVE the 32-char divider, satisfying DSG-14 SC #3 (current depth + max depth + active topic + per-workstream round-trip counts) without introducing any stored counter field. D-06 derive-at-read-time discipline is structurally enforced by a grep-audit across state.cjs + gap-detect.cjs + status.cjs. File grew 130 → 165 lines (≤180 target). 12 new tests / 49 assertions pass; 8 existing status-renderer tests + 26 brief-statusline tests + 163 adjacent Phase 4/5/6 tests all regression-safe.
- Wires the Phase 6 gap-detect subsystem (Plan 02 workflow + Plan 03 primitives + Plan 04 dispatcher) into the existing Phase 4 ALIGN orchestrator via two surgical insertions — Step 4.5 (D-11 frame-pop attempt after verdict commit) and Step 8 (D-02 gap-detect post-verdict spawn). No new hooks, no new user-facing commands, no Phase 4 align.cjs contract changes. align-gate.md grows from 352 → 475 lines; 3 test files (13 assertions) lock D-07 hard-cap + D-08 meta-arbiter vocabulary + D-03 severity routing against regression. All 191 Phase 4/5/6 tests pass.
- Ships Step 0.5 into brief/workflows/discover.md — the USER-FACING entry point for the bidirectional return-stack flow. When state.brief.return_stack is non-empty, `/brief-discover` auto-detects the paused frame and offers Resume / Start-new / Show-stack with Korean variant + TEXT_MODE fallback. Resume bypasses Block-gate + Stale-anchor + Multi-select (Claude's-Discretion D-10 extension); D-11 dual-condition pop preserves gate discipline at align-gate Step 4.5. 9-assertion test suite + 303 → 429-line workflow expansion; zero new user-facing commands; A1 deps=0 preserved.
- Final-wave Phase 6 closure plan. Ships 5 test files (24 tests total, 963 lines) that exercise the full ALIGN → gap-detect → push → resume → pop cycle end-to-end + lock five structural guarantees: (1) canary state transitions [] → [frame] → []; history [] → [entry] → [entry] (append-only D-06); (2) /brief-status renders Return stack + Gap loop + Round-trips rows simultaneously after a push (DSG-11 + DSG-14 contract); (3) gap-detect is an orchestrator step, never a hook (Anti-pattern #2); (4) Phase 6 adds zero user-facing commands + A1 zero-runtime-deps preserved; (5) Phase 6 authored artifacts are ban-list-clean outside legitimate documentation homes + meta-arbiter + hard-cap + resume prompts carry TEXT_MODE numbered-list fallbacks. Phase 6 COMPLETE — both phase requirements verified end-to-end.
- Third canonical evaluator-optimizer gate instance — agent + workflow + compliance.cjs + compliance-report.cjs + dispatcher + 6 Wave 0 tests, with the LOAD-BEARING DEVIATION (FINDINGS-MATERIAL preserves distinct verdict, not collapsed to COMPLIANCE-OK) tested structurally and the mandatory verbatim PIPA CEO-personal-liability disclaimer rendering on every emitted .compliance.md.
- RED commit `415fde2`:
- Single-workstream-per-session orchestrator with sequential 3-gate threading (ALIGN → AUDIENCE → COMPLIANCE) — `/brief-design <workstream>` command shell + 7-step workflow body (399 lines, ≤400 cap) + 3 dispatcher subcommands (list / get-workstream / recommended-next with BMC/GTM/FIN/OPS/COMP/ROAD/BRAND/RISK/TECH alias resolution) + 4 Wave 0 tests (13 sub-tests) covering D-05 single-workstream contract, D-02 sequential gate ordering, D-06 OBJECTIVES amendment routing (NO return-stack push for DEFINE), and D-08 handoff structure (artifact path + 3-gate verdict + recommended-next derivation + 3-option AskUserQuestion + Skill-tool recursion anti-nesting).
- One-liner:
- Six built-in workstream bundles shipped — Strategyzer 9-block BMC, Sequoia-derived 9-section GTM, Asana-framework BRAND with Korean honorific variant, 5-category Risk Register, 4-horizon Business Roadmap (distinct from BRIEF tool roadmap), and Korea-first COMPLIANCE workstream (DSG-05; distinct from CC-01 checker) with auto-loaded PIPA + ISMS-P + MyData primers and verbatim Korean legal-counsel disclaimer — plus canary OBJECTIVES.md fixture for Plan 08 E2E.
- 3 workstream bundles shipped (10 new files), FINANCIAL 12-driver Q&A wired into design.md Step 4.5 via sub-workflow split (design.md = 400 lines), 5 Wave 0 tests green covering 40 assertions (DSG-03 + DSG-04 + DSG-09 + T-07-19/21/22/23 STRIDE mitigations)
- 3 lib files extended additively (workstream-loader + status + state), 6 NEW Wave 0 test files (30 tests total), Phase 2 D-13 5-field regression preserved, Surface cap NET +2 enforced, Anti-pattern #2 hook-purity green, all 9 built-in workstreams + _example loadable with 7-field schema, D-14 B2B/B2C conditional vocabulary lock asserted on all 9 design-prompts.md.
- Korea-first B2C fintech canary E2E (7 fixture-driven assertions) + multi-runtime TEXT_MODE parity (6 assertions across design / compliance / add-workstream workflows) + Rule 1 dispatcher fix delegating `design recommended-next` to status.cjs computeRecommendedNext
- deliver.cjs Type A synthesis lib with 4-artifact SYNTHESIS_MAP, B2B/B2C conditional prose for service-policy via Phase 7 D-14 byte-identity, graceful-degradation on missing workstreams, and Korea-first 페이앱 B2C fintech 9-workstream canary fixture reused by Plans 03/04/08.
- AI-slop banned-words density check + concreteness heuristic + Korean honorific-violation post-check lib for Type B agent output, shipping as a separate parallel lib (NOT a 5th canonical gate) with zero runtime deps and hand-written 4-exemplar reference doc
- Pure-CJS Hangul-aware Salton-1988 TF-IDF that detects copy-paste leakage from a stricter-confidentiality sibling (e.g. INTERNAL deck) into a less-strict artifact (e.g. PROPOSAL deck) and emits FINDINGS-MATERIAL severity findings when ≥3 distinctive keywords match — the LAST programmatic line of defense before user eyeballs at the `/brief-export` 1-step confirm.
- brief/bin/lib/export.cjs ships the 7-step gate orchestration (leakage-diff → AUDIENCE → COMPLIANCE → confirm UI → voice-fit warn → Marp via npx --yes → atomic-commit) with Layer 1 filename encoding, Layer 2 watermark mapping, Layer 3 1-step confirm UI, force-accept audit-trail FIRST LIVE USE through Phase 4 D-07 substrate, and PHASE_8_BRIEF_FIELDS allowlist extension — A1 zero-runtime-deps preserved.
- Parameterized brief-deliver-type-a agent (single file, {{ARTIFACT}} substituted at Task-spawn time) + 4 PRD-input templates (product-brief, service-policy with B2B/B2C conditional prose, high-level-spec, feature-map with Mermaid mindmap + ASCII fallback) matching deliver.cjs SYNTHESIS_MAP byte-identically.
- Test 3 (region: us)
- Layer 4 audience-defense pre-commit hook (`brief-validate-frontmatter.sh`) byte-identical in shape to `brief-validate-provenance.sh`, plus single-source-of-truth Marp env reference doc — all without adding a single npm runtime dependency.
- 2 NEW user-facing slash commands (`/brief-deliver` + `/brief-export`) + 2 NEW workflow orchestration files + 4 NEW brief-tools.cjs case dispatchers + status.cjs Type B force-accept visibility extension + CLAUDE.md/ARCHITECTURE.md count bumps + 3 Wave 0 RED→GREEN test files (canary E2E + vocabulary-lock + no-hooks anti-pattern). All 24/24 Wave 0 tests + 116/116 broader Phase 8 test suite + 17/17 Phase 4·5·7 vocabulary-lock regression tests pass; A1 zero-runtime-deps preserved.
- Eleven RED-state `node:test` fixtures register the Wave 1/2 verification surface with byte-identical LOCKED_12 / DELETED_57 / RUNTIMES / COMMANDS / PHASE_CATEGORIES constants and skip cleanly with per-plan rationales until Plans 01-06 ship the production code that turns each test GREEN.
- brief/bin/lib/smoke-test.cjs (NEW, 166 lines):
- 4D-categorized command listing (DEFINE/DISCOVER/DESIGN/DELIVER/HELPERS) with case-insensitive partial-keyword match and inline two-row DP Levenshtein typo suggestion (top-3, distance ≤ 3) — zero new runtime deps.
- HRD-04 partial 1/3 dogfooding journal: 6 Pitfall #9 friction rows (3 high / 3 medium / 0 blocker), B4 transparency note that pilot 1/3 is the build-team vision-keeper, and explicit Out-of-Scope deferral of 2/3 to v1.1 beta per D-D01 + D-D04
- Slug-by-slug refs removed: 0.
- HRD-05(a) per-test triage (10 DELETE-skips), HRD-05(b) ARCHITECTURE.md count sync to 12/70/26, V1-LAUNCH-GATE.md PASS verdict, RESIDUAL-FAILS-V1.md catalog of 185 deferred fails — Phase 9 closed; ready for /brief-verify-work

---
