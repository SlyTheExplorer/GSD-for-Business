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

## Step 2: Stale-anchor check (DEF-06, D-13)

Invoke `brief-tools objectives stale-check` to get `{ stale, age_hours }`.

D-13 gating: this check runs ONLY because `/brief-discover` is a qualifying
new-activity entry point. It does NOT run on `/brief-status`, `/brief-help`,
or mid-workflow invocations (that logic lives in `shouldStaleAnchorFire` in
`brief/bin/lib/define.cjs` — `QUALIFYING_ENTRY_POINTS` closed set).

If `stale === true`:

<askuserquestion>
  <question>
⚠ OBJECTIVES.md이 {age_hours}시간 전 마지막으로 수정되었습니다 (48시간 경과).

본격적으로 일을 시작하기 전에 한 번 정비하시는 것을 권장합니다.

어떻게 진행하시겠어요?
  </question>
  <options>
    <option>잠시 검토에 — /brief-define --amend 로 수정 흐름 진입</option>
    <option>현재 OBJECTIVES를 보고 맞으면 승인 — 내용 확인 후 mtime 갱신</option>
    <option>이제 승인, 빠르게 진행 — 즉시 mtime 갱신하고 다음 단계로</option>
  </options>
</askuserquestion>

Under TEXT_MODE, render the three options as a plain-text numbered list (1/2/3)
and prompt the user to type their choice number. NO bypass — the user MUST pick
one of the three options to proceed.

Action per selection:

- **1. 잠시 검토에** — Dispatch to `/brief-define --amend`; the discover flow
  exits until the amend completes, at which point the user re-runs `/brief-discover`.
- **2. 현재 OBJECTIVES를 보고 맞으면 승인** — Display the current OBJECTIVES.md
  content (via `brief-tools objectives` or a direct read of `.planning/OBJECTIVES.md`);
  ask "내용 확인하셨나요? 맞으면 승인해 주세요." Upon approval, touch
  `.planning/OBJECTIVES.md` mtime (e.g., `fs.utimesSync` with the current time, or
  re-save via `writeObjectivesMd` with an identical payload) and continue to Step 3.
- **3. 이제 승인, 빠르게 진행** — Immediately touch `.planning/OBJECTIVES.md`
  mtime without content review; continue to Step 3.

## Step 3: Phase 5 Placeholder

Print:
"Phase 5 DISCOVER body — coming in Phase 5. Block-gate is live."

Exit 0.
</process>
