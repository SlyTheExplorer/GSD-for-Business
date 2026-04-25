<purpose>
Run a 1-session interactive Q&A to add a custom workstream. Validates name (BLOCK on
collision per Phase 7 D-11), detects role overlap (fork-or-new prompt per D-11), runs 4-6
plain-language questions (D-09), atomically writes 3-file skeleton (spec.yaml +
design-prompts.md + templates/artifact.md per D-10 default `gates_required: [align,
audience, compliance]`).

The 3-file write is atomic — `brief-tools add-workstream write` calls atomicWriteFileSync
per file, then a single `brief-tools commit --files` for the 3 paths. If any file write
throws, all 3 files are unlinked (rollback) so no half-created workstream skeleton is left
behind (CONTEXT.md Risk Note inheritance).

Korean is default voice when state.brief.region == 'kr'; English fallback.
TEXT_MODE numbered-list rendering replaces every AskUserQuestion when `--text` is in
$ARGUMENTS or workflow.text_mode is true (FND-06).

Phase 7 D-09/D-10/D-11 / DSG-10 acceptance: a user can add a workstream without touching
`.cjs` source — the new workstream becomes available to `/brief-design <slug>` immediately
(workstream-loader.cjs auto-discovers the new folder; Phase 2 D-13 / FND-08).

Out of scope (deferred — see CONTEXT.md): multi-language Q&A beyond Korean / English; schema beyond Phase 7 D-13's 7 required fields; per-workstream design-prompts.md content depth tuning (v1 ships skeleton; user finishes off-line).
</purpose>

<no_hooks_assertion>
This workflow is invoked EXPLICITLY by the user via `/brief-add-workstream <name>`. No
PostToolUse / SubagentStop / SessionStart hook reaches into add-workstream.md or any of
its 3 dispatcher subcommands (check-collision / check-overlap / write). Anti-pattern #2
explicitly forbids hook-spawned add-workstream paths — workstream addition is a deliberate
user action, not a side-effect.

Verified by `tests/brief-add-workstream-no-hooks.test.cjs` (out of scope for Plan 07-04
core deliverable; covered by global hooks/* anti-pattern audit).
</no_hooks_assertion>

<process>

## Step 0: Flag parsing + TEXT_MODE detection

Parse $ARGUMENTS for the workstream name (first positional argument). Set
TEXT_MODE=true if `--text` is present in $ARGUMENTS OR `workflow.text_mode` from the init
JSON is true. When TEXT_MODE is active, replace every AskUserQuestion call with a plain-text
numbered list and ask the user to type their choice number. Free-text prompts remain
free-text in both modes; only the button-seed primitive changes shape (FND-06 canonical
#2012 remedy for runtimes that do not support AskUserQuestion — Codex, Gemini CLI,
OpenCode).

Read state to determine language (Korean when state.brief.region == 'kr'; English
otherwise):

```
node brief/bin/brief-tools.cjs state json
```

Parse the output and extract `brief.region`. Store as `LANGUAGE_KO=true` if region is `kr`,
else `LANGUAGE_KO=false`. Use this for all user-facing prompts and error messages below.

If no positional `<workstream-name>` is supplied, exit with:
- KO: `❌ /brief-add-workstream <이름> 형식으로 사용해 주세요. 예: /brief-add-workstream pricing`
- EN: `❌ Usage: /brief-add-workstream <name>. Example: /brief-add-workstream pricing`

## Step 1: Name validation — collision BLOCK (D-11)

Slugify the user-supplied name: lowercase + replace whitespace and underscores with hyphens.
Resolve canonical aliases (BMC → business-model-canvas, GTM → go-to-market, FIN → financial,
OPS → operations, COMP → compliance, ROAD → roadmap, BRAND → brand, RISK → risk, TECH →
tech-arch — same alias map as Plan 03's design.md Step 1).

Invoke the dispatcher to check whether the slug collides with an existing workstream:

```
node brief/bin/brief-tools.cjs add-workstream check-collision --name <slug>
```

Parse the JSON output. If `{collides: true}` → emit BLOCK error and exit:

- KO (state.brief.region == 'kr'):
  `⚠ 워크스트림 '{name}'은(는) 이미 brief/workstreams/{existing-slug}/ 에 존재합니다. 다른 이름을 사용하시거나 '/brief-design {existing-slug}' 로 기존 워크스트림을 사용해 주세요.`
- EN (otherwise):
  `⚠ Workstream '{name}' already exists at brief/workstreams/{existing-slug}/. Use a different name or run '/brief-design {existing-slug}' to use the existing one.`

Exit non-zero. Do NOT proceed to Q&A.

If `{collides: false}` → proceed to Step 2.

## Step 2: Q1 — Goal / description (D-09 — REQUIRED)

Ask the user (free-text):

KO: `이 workstream의 목표는 무엇인가요? (1-2 문장으로 작성해 주세요. 어떤 artifact를 만들고, 어떤 비즈니스 문제를 해결하나요?)`
EN: `What is the goal of this workstream? (1-2 sentences. What artifact does it produce, and what business problem does it address?)`

Save the answer verbatim — it becomes the spec.yaml `description` field.

## Step 2.5: Role-overlap detection (D-11 — heuristic word-set overlap > 50%)

Now that Q1's answer is collected (the description), check for role overlap with existing
workstreams. Call the dispatcher:

```
node brief/bin/brief-tools.cjs add-workstream check-overlap --name <slug> --description "<q1-answer>"
```

Parse the JSON output. Returns `{overlap: bool, candidates: [<slug>, ...]}` where each
candidate is an existing workstream whose `description` shares > 50% word-set overlap
(lowercase, whitespace-split, intersection / union > 0.5) with the user's Q1 answer.

If `overlap: true` → render the "extend or new" 2-branch AskUserQuestion (use first
candidate as the named extension target):

<askuserquestion>
  <question>
KO: 이건 기존 '{candidate}' 워크스트림의 확장처럼 들립니다. 어떤가요?
EN: This sounds like an extension of the existing '{candidate}' workstream. Which is correct?
  </question>
  <options>
    <option>KO: 기존 '{candidate}'의 확장 (extends_workstream 필드로 연결) | EN: Extend existing '{candidate}' (creates phase 2 of {candidate} workstream)</option>
    <option>KO: 진짜 새로운 workstream (계속 진행) | EN: Genuinely new workstream (proceed)</option>
    <option>KO: 취소 | EN: Cancel</option>
  </options>
</askuserquestion>

Under TEXT_MODE, render the 3 options as a plain-text numbered list (1/2/3) and prompt the
user to type their choice number. NO bypass — every AskUserQuestion must have a TEXT_MODE
fallback.

Action per selection:
- **1. Extend existing** — set `EXTENDS_WORKSTREAM=<candidate>` (passed to Step 4 spec.yaml
  builder as the optional `extends_workstream` field).
- **2. Genuinely new** — proceed unchanged; `EXTENDS_WORKSTREAM` remains unset.
- **3. Cancel** — exit cleanly with message:
  - KO: `취소되었습니다. 새로운 이름이나 기존 workstream을 사용해 주세요.`
  - EN: `Cancelled. Use a different name or work with the existing workstream.`

If `overlap: false` → proceed directly to Step 3 (skip the prompt).

## Step 3: Q2-Q6 — sequential 4-6 question Q&A (D-09)

### Q2 — Artifact shape (REQUIRED)

<askuserquestion>
  <question>
KO: 어떤 artifact를 생성하나요? 한 가지를 선택하거나 직접 설명해 주세요.
EN: What artifact does this workstream produce? Pick one or describe a custom shape.
  </question>
  <options>
    <option>KO: 단일 markdown plan (BMC, GTM 등 가장 일반적) | EN: Single markdown plan (most common — like BMC, GTM)</option>
    <option>KO: Markdown plan + 구조화된 표 (FINANCIAL drivers + projection 등) | EN: Markdown plan + structured table (like FINANCIAL drivers + projection)</option>
    <option>KO: 시각적 다이어그램 (Mermaid / ASCII tree) | EN: Visual diagram artifact (Mermaid / ASCII tree — like FEATURE-MAP)</option>
    <option>KO: 다중 파일 출력 (지역별 변형 등) | EN: Multi-file output (rare — e.g., per-region variants)</option>
    <option>KO: 직접 입력 | EN: Other (describe in 1-2 sentences)</option>
  </options>
</askuserquestion>

Save the answer as `Q2_ARTIFACT_KIND`. This drives the templates/artifact.md skeleton
shape in Step 4. Under TEXT_MODE, render as numbered list 1-5; "직접 입력 / Other" prompts
a follow-up free-text question.

### Q3 — B2B/B2C variant (REQUIRED)

<askuserquestion>
  <question>
KO: 이 workstream은 B2B와 B2C 프로젝트에서 다른 콘텐츠가 필요한가요? (예: GTM은 sales motion이 다름.)
EN: Does this workstream need different content for B2B vs B2C projects? (e.g., GTM has different sales-motion advice for each.)
  </question>
  <options>
    <option>KO: 예 (Y) — design-prompts.md에 B2B/B2C 조건부 블록 포함 | EN: Yes (Y) — design-prompts.md gets B2B/B2C conditional blocks</option>
    <option>KO: 아니오 (N) — single-track design-prompts.md | EN: No (N) — single-track design-prompts.md</option>
  </options>
</askuserquestion>

Save the answer as `Q3_B2B_B2C_VARIANT` (true if Y, false if N).

### Q4 — Compliance focus areas (OPTIONAL — recommended)

<askuserquestion>
  <question>
KO: Compliance 관련 영역을 선택해 주세요. (다중 선택 가능. v1은 한국 3개 pack만 지원합니다 — 다른 영역은 v2에서 확장 예정.)
EN: Compliance focus areas? (Multi-select. v1 only ships Korea 3 packs; others are advisory-only until v2.)
  </question>
  <options>
    <option>KO: PIPA (한국 개인정보 보호) | EN: PIPA (Korean personal information)</option>
    <option>KO: ISMS-P (한국 보안 관리 인증) | EN: ISMS-P (Korean security management certification)</option>
    <option>KO: MyData (한국 데이터 이동성) | EN: MyData (Korean data portability)</option>
    <option>KO: 해당 없음 (예: BRAND workstream — 규제 데이터 미접촉) | EN: None (e.g., a brand workstream that doesn't touch regulated data)</option>
    <option>KO: 기타 (직접 입력 — v2 확장 예정) | EN: Other (describe — v1 advisory-only)</option>
  </options>
</askuserquestion>

Save the answer as `Q4_COMPLIANCE_FOCUS` (array of selected packs). When the COMPLIANCE
checker runs on this workstream's artifact in Phase 7 D-02 sequential gate threading, it
unions `state.brief.compliance_packs` with this workstream's listed packs.

### Q5 — depends_on (OPTIONAL)

<askuserquestion>
  <question>
KO: 이 workstream은 어느 기존 workstream 다음에 실행되나요? (다중 선택 가능. 'Standalone'은 의존성이 없는 경우.)
EN: When in the design sequence does this workstream typically run? (Multi-select from existing workstreams.)
  </question>
  <options>
    <option>KO: BMC 이후 | EN: After BMC</option>
    <option>KO: GTM 이후 | EN: After GTM</option>
    <option>KO: OPERATIONS 이후 | EN: After OPERATIONS</option>
    <option>KO: FINANCIAL 이후 | EN: After FINANCIAL</option>
    <option>KO: Standalone (의존성 없음) | EN: Standalone (no dependencies)</option>
  </options>
</askuserquestion>

Save the answer as `Q5_DEPENDS_ON` (array of canonical slugs from selected options;
Standalone → empty array). Soft-order advisory only — never hard-blocks `/brief-design
<slug>` (D-07 inheritance).

### Q6 — Additional research prompts (OPTIONAL)

Free-text question:

KO: `OBJECTIVES.md에 없는 추가 research prompt가 있나요? (1-2개; 빈 칸이면 9개 default DISCOVER 카테고리만 사용.) 예: '한국 fintech SaaS 가격 벤치마크'.`
EN: `Beyond what's in OBJECTIVES.md, are there specific research prompts a researcher should run before producing this workstream's artifact? (Optional — leave blank if existing 9 default DISCOVER categories cover it.) Example: 'pricing benchmarks for SaaS in Korean fintech market'.`

Save the answer as `Q6_RESEARCH_PROMPTS` (array — split on newlines or commas; empty array
if blank).

## Step 4: Atomic 3-file skeleton write (D-10 default + D-11 extends)

Build the spec.yaml content from Q1-Q6 answers + Phase 7 D-13 required fields:

```yaml
name: <slug>                                     # MUST equal directory name (Phase 2 D-13)
description: <Q1 answer>                         # 1-2 sentences from Q1
research_prompts:                                # array — Q6 answer (default fallback if blank)
  - <Q6 answer line 1 OR fallback string>
  - ...
design_prompts:                                  # array — pointer to design-prompts.md (Phase 2 D-13 file: pattern)
  - file:design-prompts.md
output_artifact_template: templates/artifact.md  # MANDATORY (Phase 2 D-13)
gates_required: [align, audience, compliance]    # Phase 7 D-10 default — locked, all 3 gates
depends_on: [<Q5 selected canonical slugs>]      # informational soft-order only (D-07)
```

When `EXTENDS_WORKSTREAM` is set (from Step 2.5), append:
```yaml
extends_workstream: <parent-slug>                # D-11 fork — the role-overlap "extend" path
```

When `Q4_COMPLIANCE_FOCUS` has packs selected (excluding "None" / "Other"), append:
```yaml
compliance_packs: [<pack1>, <pack2>, ...]        # advisory; unions with state.brief.compliance_packs
```

Default `Q6_RESEARCH_PROMPTS` fallback (when user left it blank) — emit a single placeholder
prompt referring to the 9 default DISCOVER categories:
- KO: `"OBJECTIVES.md의 mutable hypotheses 및 .planning/discover/<category>.md 출력을 참조하세요"`
- EN: `"Refer to OBJECTIVES.md mutable hypotheses and .planning/discover/<category>.md outputs if available"`

Build the design-prompts.md content (with conditional B2B/B2C blocks if Q3 == Y):

```markdown
# Design Prompts — <slug>

> Loaded by brief/workflows/design.md Step 4 as the parameterized prompt template for the
> brief-workstream-designer agent. B2B/B2C conditional blocks per Phase 5 D-15 / Phase 7
> D-14 (when applicable).

## Goal
<Q1 answer>

<if Q3_B2B_B2C_VARIANT == true:>
## Conditional Content (B2B/B2C variant)

If business_model in [b2b, enterprise]:
  [B2B-specific guidance for this workstream — refine after first run.
   Examples: emphasize sales motion, account-based marketing, procurement cycles,
   pilot→rollout pattern, contract terms, license-seat / contract-value pricing benchmarks.]

If business_model in [b2c, b2b2c]:
  [B2C-specific guidance — refine after first run.
   Examples: emphasize personas, jobs-to-be-done, viral / word-of-mouth mechanics,
   retention cohorts, app-store economics, freemium conversion rates.]
</if>

## Output Discipline
- Honor the template skeleton in templates/artifact.md (every slot populated)
- Apply OBJECTIVES.md mutable hypotheses block as baseline truth
- All quantitative claims carry [VERIFIED|ASSUMED|FOUNDER-INPUT|CITED] provenance per Phase 5 CC-04
- Korean output body when state.brief.region == 'kr'; English otherwise

## Notes
- Edit this file to refine the prompts before running '/brief-design <slug>'
- The skeleton is generic; per-workstream tuning improves the brief-workstream-designer output
```

Build the templates/artifact.md skeleton (per Q2_ARTIFACT_KIND):

```markdown
---
audience: internal
audience.type: internal
audience.confidentiality: internal
audience.role: planner
business_context.model: {{business_model}}
voice.tone: {{voice.tone}}
voice.perspective: {{voice.perspective}}
language: {{language}}
workstream: <slug>
artifact_kind: <derived from Q2_ARTIFACT_KIND>
generated_by: brief-workstream-designer
generated_at: {{ISO-8601-UTC}}
---

# <Q1 short summary> — {{project_name}}

> Generated by /brief-design <slug>. Edit templates/artifact.md to refine the section
> structure before re-running.

## 1. <derived from Q2 — first canonical section>
{{LLM populates from OBJECTIVES.md mutable hypotheses + DISCOVER outputs}}

## 2. <derived from Q2 — second canonical section>
{{LLM populates}}

## Sources
- OBJECTIVES.md
- {{DISCOVER outputs cited inline with [VERIFIED:url|date] / [CITED:url|date] tags}}
```

When `Q2_ARTIFACT_KIND` is "Markdown plan + structured table", append a `## Driver Table` /
`## Projection Table` slot stub. When "Visual diagram", append a fenced ```mermaid block. When
"Multi-file output", note in the skeleton header that the output is multi-file (the agent
emits multiple Write calls — same brief-workstream-designer agent, different OUT_PATH per
file).

Atomic write — invoke the dispatcher subcommand:

```
node brief/bin/brief-tools.cjs add-workstream write \
  --name <slug> \
  --spec-json '<inline spec.yaml content as JSON>' \
  --design-prompts-content '<design-prompts.md content>' \
  --template-content '<templates/artifact.md content>'
```

The `add-workstream write` subcommand internally:
  1. Verifies `brief/workstreams/<slug>/` does not exist (defensive — Step 1 already
     checked, but this is a TOCTOU guard).
  2. Creates `brief/workstreams/<slug>/` and `brief/workstreams/<slug>/templates/`.
  3. Calls `atomicWriteFileSync` for each of the 3 files (spec.yaml is YAML-serialized from
     the JSON input; the other two are written verbatim).
  4. On any write failure, unlinks any successfully written files AND removes the
     workstream directory if it was created (rollback). Exits non-zero with structured
     error.
  5. On success, calls `brief-tools commit --files <3 paths>` to land the 3 files in a
     single git commit (Pattern 4 atomic commit; NO STATE.md mutation — workstream
     addition is filesystem-only).

If the dispatcher exits non-zero (rollback path), surface the error to the user and exit:
- KO: `❌ workstream '{slug}' 생성 실패. 파일이 일부만 생성되었다면 자동 롤백되었습니다. 상세: <stderr>`
- EN: `❌ Failed to create workstream '{slug}'. Any partial files were rolled back automatically. Detail: <stderr>`

## Step 5: Success message + next-steps hint

Print on success (replace `{slug}` with the resolved slug):

KO:
```
✅ workstream '{slug}' 생성 완료 — '/brief-design {slug}' 으로 작업을 시작할 수 있습니다.

다음 단계:
  1. brief/workstreams/{slug}/design-prompts.md 를 편집하여 prompt를 다듬으세요
  2. brief/workstreams/{slug}/templates/artifact.md 를 편집하여 출력 구조를 다듬으세요
  3. 준비되면 '/brief-design {slug}' 실행 — workstream-loader가 자동으로 새 폴더를 인식합니다 (코드 변경 불필요)
```

EN:
```
✅ Workstream '{slug}' created — run '/brief-design {slug}' to begin.

Next steps:
  1. Edit brief/workstreams/{slug}/design-prompts.md to refine the prompts
  2. Edit brief/workstreams/{slug}/templates/artifact.md to refine the output structure
  3. Run '/brief-design {slug}' when ready — workstream-loader auto-discovers (no code change needed)
```

</process>

<acceptance_self_check>
- spec.yaml has 7 required fields (Phase 7 D-13): name, description, research_prompts,
  design_prompts, output_artifact_template, gates_required, depends_on
- gates_required is literally `[align, audience, compliance]` (D-10 default — never override
  by accident)
- design-prompts.md has B2B/B2C conditional blocks IFF Q3 == Y
- templates/artifact.md skeleton matches Q2 artifact kind
- All 3 files are written by a single `add-workstream write` dispatcher invocation
  (atomic — `brief-tools commit --files` lands them in one git commit)
- On any write failure, all 3 files + the workstream directory are unlinked (rollback)
- Korean prompts when state.brief.region == 'kr'; English otherwise
- TEXT_MODE numbered-list fallback for every AskUserQuestion
</acceptance_self_check>
