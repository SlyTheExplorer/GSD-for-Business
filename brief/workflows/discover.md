<purpose>
DISCOVER phase entry — Phase 3 ships the gate only.
- Block if OBJECTIVES.md is missing required fields (DEF-05, D-12).
- Prompt on stale-anchor if >48h since last amendment (DEF-06, D-13 — wired in Plan 06).
- Phase 5 replaces the placeholder body with the full domain-research flow.
All user-facing prompts are Korean by default.
</purpose>

<process>

## Step 0: TEXT_MODE Detection

Set TEXT_MODE=true if `--text` is present in $ARGUMENTS OR `workflow.text_mode` from init
JSON is true. When TEXT_MODE is active, replace every AskUserQuestion call (used in Plan 06
stale-anchor step) with a plain-text numbered list and ask the user to type their choice
number.

## Step 1: Block-gate (DEF-05, D-12)

Invoke `brief-tools objectives validate` as a child process or via direct lib import.

If the validation result is `{ valid: false, missing: [...] }`, the CLI emits the Pitfall 5
Korean recovery-oriented block-gate message to stderr AND exits non-zero SILENTLY — no
English "validation failed" line is printed (W-6 discipline). The workflow MUST propagate
the non-zero exit back to the caller. No pass-through. No `--force` flag exists.

The canonical block-gate message format (verbatim, from RESEARCH.md §Pitfall 5 template):

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

If OBJECTIVES.md is entirely absent, the CLI emits a dedicated Korean message
(`OBJECTIVES.md 파일이 아직 없습니다`) with a `/brief-define` start hint and the 20–35
min greenfield-session time estimate.

## Step 2: Stale-anchor check (DEF-06, D-13) — WIRED IN PLAN 06

Plan 06 fills in this step. Placeholder: invoke `brief-tools objectives stale-check`;
if `stale === true` AND this is a new-activity entry, present a 3-option AskUserQuestion:

1. 잠시 검토에 → launches `/brief-define --amend`
2. 현재 OBJECTIVES를 보고 맞으면 승인 → mtime bump after user reads the anchor
3. 이제 승인, 빠르게 진행 → immediate mtime bump

NO bypass without a choice. Under TEXT_MODE, render the three options as a plain-text
numbered list and prompt the user to type 1, 2, or 3.

## Step 3: Phase 5 Placeholder

Print:
"Phase 5 DISCOVER body — coming in Phase 5. Block-gate is live."

Exit 0.
</process>
