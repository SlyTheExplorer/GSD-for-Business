<purpose>
Guide a business planner through BRIEF's conversational intent extraction.
Mode A (Greenfield) runs the full deepening + Language Precision + Dream State Mapping flow and produces a new `.planning/OBJECTIVES.md`.
Mode B (Amendment) revisits mutable sections only; the Immutable Intent section is locked unless `--unlock-intent` is supplied.
All user-facing prompts are Korean by default (D-01, Phase 3 `<specifics>`).
</purpose>

<process>

## Step 0: Flag Parsing + TEXT_MODE Detection

Check invocation flags from `$ARGUMENTS`:

- `--amend` → force Mode B entry (skip the mode-select question in Step 1).
- `--unlock-intent` → flag passed through to `objectives.cjs` writer so
  Immutable Intent fields may be edited in Mode B. This flag is an explicit,
  named, intentional escape (CONTEXT.md D-07) — never silently enabled.

Set `TEXT_MODE=true` if `--text` is present in `$ARGUMENTS` OR
`workflow.text_mode` from the init JSON is true. When TEXT_MODE is active,
replace every AskUserQuestion call with a plain-text numbered list and ask
the user to type their choice number. Free-text prompts remain free-text in
both modes; only the button-seed primitive changes shape.

This TEXT_MODE fallback is the canonical #2012 remedy for runtimes that do
not support AskUserQuestion (OpenAI Codex, Gemini CLI, OpenCode, …).

## Step 1: Entry Mode Selection (D-05)

Mode is detected by the user's answer to this first question — NEVER by
probing the filesystem for an existing `.planning/OBJECTIVES.md`.

<askuserquestion>
  <question>
BRIEF 기획에 오신 것을 환영합니다.
어떤 종류의 작업을 시작하시나요?

- Mode A를 고르면: 처음부터 대화형으로 짧게 20–35분 정도 의도를 정리합니다.
- Mode B를 고르면: 이미 있는 OBJECTIVES.md의 일부(수정 가능한 가설 영역)만 3–10분 안에 빠르게 다듬습니다.

어느 쪽이 지금 하시려는 작업에 가까우신가요?
  </question>
  <options>
    <option>새 사업/제품 기획을 처음부터 (Mode A · 약 20–35분)</option>
    <option>기존 프로젝트를 다듬기 (Mode B · 약 3–10분)</option>
  </options>
</askuserquestion>

If `--amend` was supplied, skip this prompt entirely and proceed directly to
Step 2B (Mode B). If the user's answer selects Mode A, proceed to Step 2A.

## Step 2A: Mode A (Greenfield)

### 2A.1 — Opening free-text (D-02 seed-then-free-text)

After the user selects Mode A, ask one free-text question:

> "방금 'Mode A'를 선택하셨습니다. 어떤 기획인지 한 문장으로 설명해 주시겠어요?
>  (누구를 위해 / 무엇을 / 왜 만드시는지 정도면 충분합니다.)"

Save the answer verbatim — it becomes the seed for the Immutable Intent
`problem-statement` and feeds Step 2A.2 (Push on the core value) and Step
2A.3 (Language Precision on the audience).

### 2A.2 — Push on the core value (D-03 IMPLICIT — NO visible label)

Examine the opening answer. If it contains abstract value words ("편하게",
"더 좋게", "효율적으로", "차별화된", "혁신적인", etc.), ask ONE deepening
follow-up in natural Korean conversational register. Never label this turn
with an internal technique name or meta-tag in the prose shown to the user.

Push 1 template (Language Precision flavor, lift from 03-RESEARCH.md §Pattern 2):

> "'편하게'라는 단어가 몇 가지 다른 뜻으로 쓰일 수 있어서요. 같은 일을 더
>  짧은 시간에 끝낸다는 뜻일 수도 있고, 덜 집중해도 된다는 뜻일 수도 있고,
>  배우는 데 걸리는 시간이 짧다는 뜻일 수도 있습니다. 지금 머릿속에서 가장
>  먼저 떠오르신 게 어떤 편안함인가요?"

If the Push 1 answer is still abstract, ask a Push 2 (scene-visualization):

> "'{Push 1 답변의 핵심 단어}'라고 하셨는데, 그 순간이 구체적으로 어떤
>  장면인지 한 번 상상해서 묘사해 주실 수 있을까요? 예를 들어, 누가 무엇을
>  하고 있고, 무엇이 다른 느낌인지."

Push 3 is rare (03-RESEARCH.md §Pattern 2). Only ask if both prior answers
stayed in generic language:

> "하나만 더 — 이 '{핵심}'가 안 됐다는 걸 알게 되는 신호는 무엇인가요?
>  어떤 장면이 벌어지면 '아, 이 문제가 아직 안 풀렸구나' 하실 것 같으세요?"

The final refined answer is the Immutable Intent `core-value` value. The
user sees natural Korean conversation — never an internal technique tag or
meta-label (D-03).

### 2A.3 — Language Precision on target user (D-01)

If the user's audience phrase contains a slippery word ("기업", "사용자",
"고객", "브랜드", "플랫폼"), reflect it back with a structured "which of
these did you mean, or none of them?" prompt in numbered format:

<askuserquestion>
  <question>
'{사용자가 쓴 단어}'이라고 하셨는데, 사업 모델에 따라 의미가 꽤 다르게
쓰입니다. 어떤 그림에 가장 가까우신가요?
  </question>
  <options>
    <option>직원 1,000명 이상의 대기업 (Enterprise)</option>
    <option>직원 50–500명의 중견기업 (Mid-market)</option>
    <option>직원 10–50명의 중소기업 (SMB)</option>
    <option>위 중 어떤 것도 아니고, 다르게 정의하고 계심</option>
  </options>
</askuserquestion>

If the user picks the "다르게 정의하고 계심" option, immediately ask
"어떻게 정의하고 계신지 한 문장으로 말씀해 주세요." and treat that
free-text as the authoritative answer. Buttons are seeds only (D-02) — the
free-text definition is what lands in OBJECTIVES.md Mutable Hypotheses
`target-audience`.

### 2A.4 — Dream State Mapping · Now (D-04 hybrid prose + optional metrics)

> "이제 세 가지 시점에서 이 프로젝트가 어떤 상태인지 그림을 그려보겠습니다.
>  첫 번째 — 지금. 오늘 이 프로젝트를 처음 시작하는 순간, 구체적으로 뭐가
>  보이고, 누가 있고, 무엇이 없나요? 3–5문장으로 묘사해 주세요."

Save the prose verbatim. Then offer 2–3 OPTIONAL quantitative slots:

> "혹시 — 선택이긴 한데 — 지금 시점에 대해 숫자로 표현할 수 있는 지표가
>  있으신가요? 예를 들어:
>  - 현재 사용자/고객 수 :  (있으면 숫자, 없으면 '(해당없음)')
>  - 이 문제로 인한 현재 불편 규모 : (관찰하신 발언이나 숫자)
>  - 대안 도구에 쓰고 있는 시간/비용 : (모르시면 '(모름)')
>  한 줄씩 답해주세요. 지금 단계에서는 모르셔도 괜찮습니다."

Accept `(해당없음)` / `(모름)` / partial answers without pushback.

### 2A.5 — Dream State Mapping · 3-month

> "감사합니다. 다음은 3개월 후 시점입니다. 3개월이 지났을 때 이 프로젝트가
>  어떤 상태이길 바라시나요? 가장 단순하게, 가장 현실적으로. 3–5문장으로."

Same optional-metrics tail as 2A.4 (users, 관찰 발언, 수익 기준).

### 2A.6 — Dream State Mapping · 12-month

> "마지막으로 12개월 후 시점입니다. 12개월은 아직 희망의 영역입니다 —
>  숫자 없이 그림만 그려주셔도 됩니다. 2–3문장이면 충분합니다."

Pacing note (03-RESEARCH.md Pitfall 4): keep 12-month shorter than the
prior horizons; fatigue is highest here.

### 2A.7 — Claude proposes draft + 3-option approval (D-10)

Draft OBJECTIVES.md in memory using the classification heuristic below.
Present the draft and ask:

<askuserquestion>
  <question>
작성된 OBJECTIVES.md 초안을 확인해 주세요.

## Immutable Intent (잠금 — 변경 시 --unlock-intent 필요)
- 창업자/기획자 정체성: {creator-identity}
- 핵심 가치: {core-value}
- 문제 정의: {problem-statement}

## Mutable Hypotheses (자유 수정 가능)
- 타깃 청중: {target-audience}
- 검증 지표: {verification-metrics}
- 가설된 대안 도구: {competitors}
- Dream State — 지금: {dream-now}
- Dream State — 3개월: {dream-3m}
- Dream State — 12개월: {dream-12m}

분류가 맞나요?
  </question>
  <options>
    <option>승인 (이대로 저장)</option>
    <option>한 항목씩 검토 (하나씩 물어봐 주세요)</option>
    <option>전체 재분류 (처음부터 다시)</option>
  </options>
</askuserquestion>

**D-10 default classification heuristic (codified in define workflow per
CONTEXT.md so it is not re-derived per session):**

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
| Dream State — now / 3-month / 12-month | Mutable Hypotheses |

The `immutable_items` frontmatter list defaults to
`['creator-identity', 'core-value', 'problem-statement']` (matches
`brief/bin/lib/define.cjs` `IMMUTABLE_DEFAULT_ITEMS`).

### 2A.8 — 4-config inference + Korea-signal pre-check (D-11)

→ **Plan 03-04 fills in this step.** It will infer `business_model`,
`region`, `audience_policy`, and `compliance_packs` from the full Mode A
transcript, apply the Korea-signal keyword regex (over-suggest bias), and
present a 4-option confirm (`예, 승인` / `규제 팩만 재선택` / `청중 정책만 조정` / `전체 항목씩 검토`).

In Plan 02 the fixture path short-circuits Step 2A.8 — `applyFromFixture`
in `brief/bin/lib/define.cjs` consumes the fixture's `expected_configs`
block directly.

## Step 2B: Mode B (Amendment)

### 2B.1 — Read existing OBJECTIVES.md

Invoke `objectives.readObjectivesMd(cwd)` (via lib import from
`brief/bin/lib/define.cjs`) to load the current frontmatter + body. If the
file does not exist, exit with:

> "OBJECTIVES.md가 아직 없습니다. `/brief-define` 를 `--amend` 없이 실행해
>  Mode A(새 기획)로 시작해 주세요."

### 2B.2 — Section Picker (D-07 + Pitfall #1 two-layer enforcement)

Present a multi-choice picker that lists ONLY the Mutable Hypotheses
section headings as selectable options. Immutable Intent items are shown in
an adjacent read-only block with the 🔒 marker — the picker MUST NOT allow
clicking a 🔒-marked item by default (that is the `--unlock-intent` path).

The picker header itself carries a visible 🔒 glyph so the user sees the
lock boundary even before scanning the options (W-5 reinforcement).

<askuserquestion>
  <question>
🔒 어느 부분을 다시 보시겠어요?

(잠긴 항목은 `/brief-define --amend --unlock-intent` 로 다시 실행해야 편집할 수 있습니다.)

## Mutable Hypotheses
  </question>
  <options>
    <option>Target Audience Specifics</option>
    <option>Verification Metrics</option>
    <option>Hypothesized Alternative Tools / Competitors</option>
    <option>Dream State — Now</option>
    <option>Dream State — 3-month</option>
    <option>Dream State — 12-month</option>
  </options>
</askuserquestion>

Immediately after the picker, display the Immutable Intent items as a
read-only block (NOT as AskUserQuestion options) so the user sees exactly
what is locked and how to unlock if truly needed:

```
## Immutable Intent  (잠김)
  🔒 Creator Identity        — /brief-define --amend --unlock-intent 로만 편집 가능
  🔒 Core Value              — /brief-define --amend --unlock-intent 로만 편집 가능
  🔒 Problem Statement       — /brief-define --amend --unlock-intent 로만 편집 가능
```

In TEXT_MODE (when AskUserQuestion is not available — Codex / Gemini /
OpenCode), render the picker as a plain-text numbered list of the mutable
sections. The Immutable Intent items appear below the numbered list with a
`(잠김 — --unlock-intent 필요)` suffix and are NOT assigned a number, so the
user cannot pick them by typing a number.

Footer on every Mode B question (D-07 verbatim):

```
immutable 섹션은 잠겨있습니다. 수정하려면 /brief-define --unlock-intent
```

### 2B.3 — Conversational refinement on chosen mutable sections

For each user-selected mutable section, ask one focused free-text question
in Korean:

- Target Audience Specifics: "타깃 사용자에 대해 업데이트하실 내용이 있으신가요?"
- Verification Metrics: "검증 지표 중 추가하거나 수정하실 항목이 있으신가요?"
- Hypothesized Alternative Tools / Competitors: "가설된 대안 도구나 경쟁 제품 중 최근에 달라진 것이 있으신가요?"
- Dream State — Now / 3-month / 12-month: "이 시점의 상태를 어떻게 업데이트하시겠어요?"

### 2B.4 — Confirm updated fields + atomic write

Display the proposed diff (old → new) for each updated section. Ask:

<askuserquestion>
  <question>변경 사항을 저장할까요?</question>
  <options>
    <option>예, 저장</option>
    <option>한 항목씩 다시 확인</option>
    <option>취소 (저장하지 않음)</option>
  </options>
</askuserquestion>

On approval, invoke `applyModeBAmendment(cwd, selectedSections, payload, {unlockIntent})`
(where `unlockIntent` is TRUE only if the user originally invoked
`/brief-define --amend --unlock-intent`). The lib writes the delta via
`objectives.writeObjectivesMd` — if the user somehow tried to mutate an
immutable item without `--unlock-intent` (e.g., a UI-layer bypass in a
runtime that ignored the 🔒 marker), the writer throws the Korean error and
control returns to 2B.2 with a reminder of the `--unlock-intent` escape.

When `--unlock-intent` is in effect AND an immutable edit actually occurs,
an audit-log line is appended to `.planning/OBJECTIVES-UNLOCK-AUDIT.log`
(format: `<ISO8601Timestamp> UNLOCK <field>`) — append-only, one line per
mutated immutable field.

## Step 3: Atomic Write + Commit

→ **Plan 03-04 fills in this step.** It will invoke `brief-tools define apply`
which runs:

1. `objectives.writeObjectivesMd(cwd, payload, {unlockIntent})` → writes
   `.planning/OBJECTIVES.md`.
2. Read → merge → `atomicWriteFileSync` to `.planning/config.json` under
   the `brief.*` namespace (non-Korea projects get empty `compliance_packs`).
3. `.planning/STATE.md` `last_activity` touch via the existing state.cjs
   primitive.
4. `brief-tools commit "feat(03): DEFINE <mode> — <one-line>" --files .planning/OBJECTIVES.md .planning/config.json .planning/STATE.md`
   — all three files land in a single commit (Phase 1 D-09 atomic discipline).

In Plan 02, interactive sessions exit at Step 2A.7 after the approval
prompt. Fixture-driven test runs invoke
`brief-tools define apply --fixture <name>` which short-circuits directly
into `objectives.writeObjectivesMd` (only OBJECTIVES.md is written; the
config.json and STATE.md legs are Plan 04 scope).

## Step 4: Next-Step Hint

Print:

> "다음 단계: /brief-discover — 선택하신 연구 영역으로 분야 조사를
>  시작합니다. (Plan 03-05에서 blocked-gate가 OBJECTIVES.md의 필수 항목을
>  먼저 검사합니다.)"

</process>
