# Phase 1: Foundation — Fork Hygiene, Removal, Rename - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-18
**Phase:** 01-foundation-fork-hygiene-removal-rename
**Areas discussed:** Removal scope, Rename boundary, CLAUDE.md rewrite, Removal extension, Commit strategy, npm package name, CLAUDE.md sections to replace

---

## Removal Scope (borderline cases)

| Option | Description | Selected |
|--------|-------------|----------|
| gsd-debug 제거 (추천) | SW debugging tool. BRIEF surfaces issues via ALIGN/COMPLIANCE findings | ✓ |
| gsd-spike + gsd-sketch + wrap-up 제거 (추천) | SW experimentation. BRIEF Phase 1 DISCOVER covers exploration | ✓ |
| gsd-pr-branch + gsd-ship + gsd-inbox 제거 (추천) | Git PR/Issue workflow. Business plans don't go through PR review | ✓ |
| gsd-forensics + gsd-graphify 제거 (추천) | SW architecture forensics. BRIEF EXEC-SUMMARY/MEMO covers similar role | ✓ |

**User's choice:** All 4 borderline categories removed.
**Notes:** Total removal expanded from 28 dev-specific files to ~38–42 files including the borderline categories.

---

## Rename Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Conservative | User-facing rename only; keep get-shit-done/, gsd-tools.cjs as inherited | |
| Aggressive (chosen) | Full rename including internal directory and binary | ✓ |
| Hybrid | Wrapper binary + keep directory paths; partial rename | |

**User's choice:** Aggressive — full rename.
**Notes:** Explicitly accepts Pitfall #8 (fork drift) trade-off in exchange for vocabulary cleanliness. ARCHITECTURE.md research recommended Conservative; user override is documented as D-06.

---

## CLAUDE.md Rewrite Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Targeted delta (추천) | Replace SW-specific sections only; reuse general structure | ✓ |
| Full rewrite | Blank-page rewrite from scratch | |
| Skip until Phase 9 | Defer all CLAUDE.md work to Hardening | |

**User's choice:** Targeted delta.
**Notes:** Most efficient; honors the existing structure of `generate-claude-md` output.

---

## Removal Extension (related files)

| Option | Description | Selected |
|--------|-------------|----------|
| templates/ 삭제 (추천) | Remove templates referenced by removed commands | ✓ |
| references/ 삭제 (추천) | Remove reference docs (tdd.md, code-review-checklists.md, etc.) | ✓ |
| tests/ 관련 테스트 삭제 (추천) | Remove tests for removed commands | ✓ |
| agents/ 관련 에이전트 정의 삭제 (추천) | Remove agent definitions for removed commands | ✓ |

**User's choice:** All 4 — recursive removal across templates, references, tests, agents.
**Notes:** Codified as D-03 in CONTEXT.md to prevent orphaned files (anti-pattern).

---

## Commit Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| 단계별 커밋 4-5개 (추천) | (1) backup branch (2) removals (3) user-facing rename (4) internal rename (5) text refs | ✓ |
| 단일 atomic 커밋 1개 | One huge commit. Clean history, but mega-commit; hard to revert | |
| 파일 종류별 커밋 8-10개 | Per-file-type commits (agents, commands, hooks, tools separately) | |

**User's choice:** Staged 4–5 commits with atomic boundaries.
**Notes:** Each commit must leave repo in buildable state (D-09).

---

## npm Package Name

| Option | Description | Selected |
|--------|-------------|----------|
| brief-cc (추천) | Inherits GSD's `-cc` (Claude Code) suffix pattern | ✓ |
| brief-cli | Generic CLI naming convention | |
| briefly | More memorable, but may be taken on npm | |
| @brief/cli (scoped) | npm scope for extensibility | |

**User's choice:** `brief-cc`.
**Notes:** Maintains lineage to GSD's `get-shit-done-cc`. Confirm availability on npm before publishing (Phase 9 concern).

---

## CLAUDE.md Targeted Delta — Sections to Replace

| Option | Description | Selected |
|--------|-------------|----------|
| Project 섹션 (추천) | Replace with BRIEF domain summary from PROJECT.md | ✓ |
| Workflow 섹션 (추천) | Replace plan→execute→verify with DEFINE→DISCOVER→DESIGN→DELIVER+ALIGN | ✓ |
| Skills/Commands 섹션 (추천) | Replace /gsd-* command listing with /brief-* listing (excluding removed) | ✓ |
| Stack 섹션 | Add BRIEF-specific notes (Marp via npx, zero deps) | ✓ |

**User's choice:** All 4 sections replaced.
**Notes:** Other sections (Conventions, Architecture, Skills placeholder) reuse the generated structure.

---

## Claude's Discretion

The following implementation details were left to Claude/planner discretion:

- Exact mechanics of rename (`git mv` vs find/sed vs Edit tool)
- Within-commit ordering (which file renamed first)
- Internal text-reference normalization edge cases
- Hooks-directory rename details and any settings.json hook path updates
- Test-suite update strategy after rename
- README.md exact section-by-section delta

## Deferred Ideas

(Captured for future phases — not Phase 1 work.)

- `brief-debug` adapted for stuck-workstream cases (revisit if pilot reveals demand — v2)
- `brief-update` self-update mechanism (Phase 9)
- README example flow demonstrating BRIEF end-to-end (Phase 9)
- Compatibility shim/migration guide for GSD users (rejected; revisit only if post-launch demand)
- Marp install verification (Phase 8)
- `workstream-spec.yaml` schema design (Phase 2)

---

*Discussion log written: 2026-04-18*
