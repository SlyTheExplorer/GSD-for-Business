---
status: partial
phase: 04-first-gate-align-pattern-established
source: [04-VERIFICATION.md]
started: 2026-04-21T02:06:35Z
updated: 2026-04-21T02:06:35Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Live `/brief-define` Mode A end-to-end canary

expected: Run `/brief-define` (Mode A greenfield) in a fresh BRIEF project. After OBJECTIVES.md is approved and committed (existing Phase 3 atomic commit), Step 3.5 must automatically invoke the ALIGN gate as a visible orchestrator step. The real `brief-align-gate` subagent spawns via Task, writes verdict JSON to `.planning/.align-verdict.tmp.json`, the workflow reads the verdict, and a second atomic commit writes `.planning/ALIGN-00.md` + updates `state.brief.last_gate_results.align` in STATE.md. `/brief-status` then shows the ALIGN line populated with decision + findings_count.

Automated canary tests use a stub `llmPass` — actual real-subagent verdict emission + atomic 2-commit flow is environment-coupled and human-observable only. Verifies SC #1 end-to-end in a live runtime.

result: [pending]

### 2. TEXT_MODE parity across 4 runtimes

expected: Run the ALIGN gate Step 5A / 5B 3-path interrupt in each of the 4 supported runtimes (Claude Code, OpenAI Codex, Gemini CLI, OpenCode). In Claude Code, the interrupt should render via `AskUserQuestion` as a TUI menu. In the other three (which lack `AskUserQuestion`), it should fall back to a numbered plain-text list with the same 3 Korean verbatim options:

- DRIFTED-objective: `objective 수정하기 (/brief-define --amend)` / `이 output이 틀렸다, 다시 쓰기` / `현재 상태 승인, 계속 진행 (force-accept)`
- DRIFTED-output: `output 다시 쓰기 (re-spawn worker)` / `output을 수동으로 편집` / `현재 상태 승인, 계속 진행 (force-accept)`

Static markdown assertions in `brief-align-text-mode.test.cjs` verify prompt strings are present but NOT rendering fidelity. Verifies FND-06 cross-runtime rendering.

result: [pending]

### 3. Force-accept override — full audit trail loop

expected: Trigger a DRIFTED verdict (use `tests/fixtures/align-drifted-objective-contradiction.md` or a real misaligned OBJECTIVES.md), then select the 3rd path `현재 상태 승인, 계속 진행 (force-accept)`. The flow must:
1. Prompt user for a justification (`override_reason`) — REQUIRED, not optional.
2. Sanitize the justification via `sanitizeForPrompt` (security.cjs) to prevent prompt-injection.
3. Write to `state.brief.last_gate_results.align` with `{decision: "ALIGNED", override: true, override_reason: <sanitized>, at: <ISO>}`.
4. Emit `.planning/ALIGN-00.md` with a `## User Override` section containing the verbatim reason.
5. `/brief-status` must render `Last ALIGN  ALIGNED (override applied)` — the suffix MUST be distinct from plain `ALIGNED`.

Unit tests cover each component separately (23 tests in `state-brief-override-roundtrip.test.cjs`); full UX loop requires a human typing at a live prompt. Verifies D-07 audit-trail invariant.

result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
