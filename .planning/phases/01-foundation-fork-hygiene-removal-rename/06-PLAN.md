---
phase: 01-foundation-fork-hygiene-removal-rename
plan: 06
type: execute
wave: 6
depends_on: [05]
files_modified:
  - "CLAUDE.md"
  - "README.md"
  - ".planning/ASSUMPTIONS.md"
autonomous: true
requirements:
  - FND-04
  - FND-06
  - FND-07
user_setup: []

must_haves:
  truths:
    - "User opens CLAUDE.md and reads business-planning-domain language: 'business planner', 'OBJECTIVES.md', 'workstreams', 'audience'"
    - "User opens README.md and sees BRIEF-branded content (no 'Get Shit Done' in Hero/intro; no 'code review'/'TDD'/'deployment'/'security audit' as primary commands)"
    - "User reads `.planning/ASSUMPTIONS.md` and sees A1 verified (package.json dependencies empty) with timestamp and command evidence"
    - "User reads `.planning/ASSUMPTIONS.md` and sees FND-06 verification note confirming INSTRUCTION_FILE (in brief/workflows/, not brief/bin/lib/) + text_mode (in brief/bin/lib/) detection code survived the rename — TWO separate detection sites"
    - "User runs `grep -ci 'code review\\|TDD\\|deployment\\|security audit\\|unit test' CLAUDE.md README.md` and gets 0 (or a very low number with each match explicitly explained in Plan 06's SUMMARY)"
    - "User runs `grep -ci 'business planner\\|OBJECTIVES.md\\|workstream\\|audience' CLAUDE.md README.md` and gets a positive count on both files"
    - "User runs `node -e \"console.log(Object.keys(require('./package.json').dependencies||{}).length)\"` and gets `0`"
    - "User runs `grep -i 'spec-driven\\|get-shit-done\\|gsd-build' package.json` and gets 0 matches (checker WARNING #6 closure)"
  artifacts:
    - path: ".planning/ASSUMPTIONS.md"
      provides: "Phase 1 verification log for A1 (zero-deps) and FND-06 (multi-runtime detection)"
      contains: "A1 VERIFIED entry with command + output + timestamp; FND-06 entry describing BOTH detection sites (INSTRUCTION_FILE in workflow markdown + text_mode in lib JS) with grep results"
    - path: "CLAUDE.md"
      provides: "BRIEF-domain project instructions in the targeted-delta sections (Project, Workflow, Skills/Commands, Stack)"
      contains: "BRIEF Project section, DEFINE→DISCOVER→DESIGN→DELIVER workflow, /brief-* command listing, Marp/zero-deps stack notes"
    - path: "README.md"
      provides: "BRIEF public-facing README with BRIEF identity in hero, workflow, commands"
      contains: "BRIEF name, npm package brief-cc, DEFINE/DISCOVER/DESIGN/DELIVER narrative, /brief-* command examples"
  key_links:
    - from: "CLAUDE.md Project section"
      to: ".planning/PROJECT.md What This Is + Core Value"
      via: "targeted-delta content copy"
      pattern: "CLAUDE.md reads as BRIEF doc, not GSD doc"
    - from: ".planning/ASSUMPTIONS.md A1 entry"
      to: "package.json dependencies field"
      via: "documented verification command"
      pattern: "ASSUMPTIONS.md contains the exact inspection step a user can re-run"
    - from: ".planning/ASSUMPTIONS.md FND-06 entry"
      to: "brief/workflows/new-project.md (INSTRUCTION_FILE) + brief/bin/lib/{core,config,init}.cjs (text_mode)"
      via: "dual-site grep verification with hard-fail guards"
      pattern: "FND-06 entry names both sites explicitly and reports non-zero counts for each"
---

<objective>
Execute commit 6 (the verification + documentation commit) closing Phase 1. This plan performs three anchored verifications and two documentation rewrites:

1. **FND-04 (A1 zero-deps):** Run the documented inspection step, record result in `.planning/ASSUMPTIONS.md` with timestamp.
2. **FND-06 (multi-runtime detection survives rename):** Grep TWO SITES for detection code — (a) `brief/workflows/` for `INSTRUCTION_FILE` (runtime-dispatch env var, lives in workflow markdown — planner verified 8 refs in `brief/workflows/new-project.md` at planning time), and (b) `brief/bin/lib/` for `text_mode` (non-AskUserQuestion fallback flag, lives in lib JS — planner verified 6 refs across core.cjs/config.cjs/init.cjs at planning time). Confirm no hard-coded `get-shit-done/` paths remain in brief/bin/lib; record outcome in ASSUMPTIONS.md naming both sites. Note per <fnd_06_verification_hint>: actual cross-runtime smoke testing across Codex/Gemini/OpenCode is Phase 9 HRD-01 scope.
3. **FND-07 (domain language):** Apply targeted-delta rewrites to CLAUDE.md (per D-12) and README.md (per D-14). Verify business-planning-domain vocabulary dominates; software-development vocabulary is absent from the primary narrative. Also verify package.json has no residual GSD-domain content (checker WARNING #6 closure — the actual field updates happen in Plan 04 Task 2, but Plan 06's FND-07 verification confirms the surface-level result).

Purpose: Close Phase 1 Success Criteria #4, #5, #6 (ROADMAP.md lines 35–37) and complete the Phase 1 milestone. After commit 6, the user can:
- Read CLAUDE.md / README.md and see BRIEF's identity
- Run the documented A1 inspection step and get `0`
- Confirm (via grep) that runtime-detection code survived the Plan 03–05 rename in BOTH of its known sites

Output: Updated CLAUDE.md, updated README.md, a populated `.planning/ASSUMPTIONS.md`, one atomic commit closing Phase 1.

**Revision note (addresses checker BLOCKER):** The pre-revision Plan 06 Task 1 grepped `brief/bin/lib/` for `INSTRUCTION_FILE`. That identifier does not live in `brief/bin/lib/` — it lives in `brief/workflows/new-project.md` (8 refs verified at planning time). The previous plan only emitted a WARN on zero matches, then recorded `VERIFIED: INSTRUCTION_FILE refs=0` in ASSUMPTIONS.md — a logical contradiction. The revised Task 1 below greps the correct path and HARD FAILS on zero, preventing silent VERIFIED-for-zero entries.

**Revision note (addresses checker WARNING #6):** Plan 04 Task 2 (post-revision) now updates package.json descriptive fields. Plan 06 FND-07 verification adds a grep-for-residues sanity check so any future regression is caught.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md
@.planning/phases/01-foundation-fork-hygiene-removal-rename/01-05-text-ref-audit.md
@CLAUDE.md
@README.md

<interfaces>
<!-- CLAUDE.md targeted-delta (D-12, D-13): -->
<!-- The CLAUDE.md sentinel comments (<!-- GSD:X-start --> / <!-- GSD:X-end -->) were replaced with -->
<!-- BRIEF:X-start / BRIEF:X-end by Plan 05. The sections to REPLACE in Plan 06 are: -->
<!--   1. "## Project" (sentinel: BRIEF:project-start/end)  →  replace with BRIEF project summary from PROJECT.md -->
<!--   2. "## GSD Workflow Enforcement" (sentinel: BRIEF:workflow-start/end)  →  replace with BRIEF workflow -->
<!--   3. "## Technology Stack" section (sentinel: BRIEF:stack-start/end) — Plan 05 already edited text refs; -->
<!--      Plan 06 adds BRIEF-specific notes: Marp via npx --yes, zero runtime deps confirmed, multi-runtime preserved -->
<!--   4. (Skills/Commands section) — the file currently has no "Skills/Commands" section; the user-facing -->
<!--      command listing lives in README.md; per D-12 we can omit or add minimally. -->

<!-- Sections to LEAVE UNCHANGED (D-13): -->
<!--   - Conventions (BRIEF:conventions-start/end) — placeholder text preserved -->
<!--   - Architecture (BRIEF:architecture-start/end) — placeholder preserved -->
<!--   - Project Skills (BRIEF:skills-start/end) — placeholder preserved -->
<!--   - Developer Profile (BRIEF:profile-start/end) — placeholder preserved -->

<!-- README.md targeted-delta (D-14): -->
<!-- Current README.md (after Plan 05 text-ref pass) has replaced paths and slash commands, but retains -->
<!-- the GSD-hero narrative, GSD tagline, GSD badge links, "Get Shit Done" (replaced with "BRIEF" by Plan 05 -->
<!-- but narrative is still SW-dev framed: "spec-driven development for Claude Code, Codex, ..."), -->
<!-- and code-centric workflow examples. -->
<!-- Required Plan 06 delta: -->
<!--   1. Hero section: rewrite to "BRIEF — Business Research, Insight & Execution Framework" + Core Value -->
<!--   2. "Who This Is For": rewrite to business-planning audience (planners, product managers, strategy consultants) -->
<!--   3. "How It Works": rewrite command flow from /gsd-* to /brief-* with DEFINE→DISCOVER→DESIGN→DELIVER -->
<!--   4. Command tables: reduced set showing brief-* survivors -->
<!--   5. Install: `npx brief-cc@latest` (not get-shit-done-cc) -->
<!-- Localized READMEs (ko-KR, ja-JP, pt-BR, zh-CN): flag as deferred to Phase 9 per Plan 05's intentional-residuals list -->

<!-- Assumptions.md: does not exist yet (per planning-time check). Plan 06 CREATES it. -->

<!-- FND-06 detection-code locations (verified at planning time — BLOCKER fix): -->
<!--   INSTRUCTION_FILE: lives in brief/workflows/new-project.md (8 refs). NOT present in brief/bin/lib/. -->
<!--   text_mode: lives in brief/bin/lib/core.cjs (3 refs), config.cjs (2 refs), init.cjs (1 ref) = 6 total. -->
<!-- Zero count at either site = REAL REGRESSION (hard fail), not an acceptable state. -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Verify FND-04 (A1 zero-deps) and FND-06 (runtime detection survives across BOTH sites), write .planning/ASSUMPTIONS.md</name>
  <files>
    .planning/ASSUMPTIONS.md
  </files>
  <read_first>
    - package.json (current state after Plan 04 — name=brief-cc, bin=brief-cc, files includes "brief")
    - brief/bin/lib/core.cjs (where text_mode lives — planner verified 3 refs at planning time)
    - brief/bin/lib/config.cjs (where text_mode lives — planner verified 2 refs at planning time)
    - brief/bin/lib/init.cjs (where text_mode lives — planner verified 1 ref at planning time)
    - brief/workflows/new-project.md (where INSTRUCTION_FILE is documented — planner verified 8 refs at planning time; NOT in brief/bin/lib/)
    - .planning/ROADMAP.md (Success Criteria #4, #5, lines 35–36)
    - .planning/REQUIREMENTS.md (FND-04, FND-06)
  </read_first>
  <action>
From repo root `/Users/agent/GSD-for-Business`:

1. Perform A1 (zero-deps) verification. Capture exact output for audit:
```bash
DEP_COUNT=$(node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)")
DEV_DEP_COUNT=$(node -e "console.log(Object.keys(require('./package.json').devDependencies||{}).length)")
DEV_DEPS_LIST=$(node -e "console.log(Object.keys(require('./package.json').devDependencies||{}).join(', '))")
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "A1: $DEP_COUNT prod deps, $DEV_DEP_COUNT dev deps: $DEV_DEPS_LIST"
```

2. Perform FND-06 (runtime-detection survives rename) grep. **Detection lives in TWO separate places (planner verified at planning time; checker BLOCKER corrected the original single-path grep):**
   - `INSTRUCTION_FILE` environment variable — referenced in `brief/workflows/new-project.md` (the workflow markdown that dispatches into runtime-specific instructions). **NOT** present in `brief/bin/lib/`. A zero count at this site is a REAL REGRESSION.
   - `text_mode` — fallback flag for non-AskUserQuestion runtimes. Lives in `brief/bin/lib/core.cjs` + `config.cjs` + `init.cjs`. A zero count at this site is also a REAL REGRESSION.

```bash
# INSTRUCTION_FILE detection — lives in WORKFLOW MARKDOWN, not lib JS
INST_HITS=$(grep -rc "INSTRUCTION_FILE" brief/workflows/ 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')
echo "INSTRUCTION_FILE refs in brief/workflows/: $INST_HITS"
# HARD FAIL on zero — detection cannot have been lost silently
[ "$INST_HITS" -ge 1 ] || { echo "FAIL (BLOCKER): INSTRUCTION_FILE detection missing from brief/workflows/; runtime dispatch is broken"; grep -rn "INSTRUCTION_FILE" brief/ 2>/dev/null | head -10; exit 1; }

# Sanity: INSTRUCTION_FILE should NOT appear in brief/bin/lib/ (it lives in workflow markdown, not JS)
INST_IN_LIB=$(grep -rc "INSTRUCTION_FILE" brief/bin/lib/ 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')
echo "INSTRUCTION_FILE refs in brief/bin/lib/: $INST_IN_LIB (expected 0 — detection is workflow-layer, not lib-layer)"

# text_mode fallback — lives in brief/bin/lib/ JS
TM_HITS=$(grep -rc "text_mode" brief/bin/lib/ 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')
echo "text_mode refs in brief/bin/lib/: $TM_HITS"
# HARD FAIL on zero — fallback cannot have been lost silently
[ "$TM_HITS" -ge 1 ] || { echo "FAIL (BLOCKER): text_mode fallback missing from brief/bin/lib/; non-AskUserQuestion runtimes will break"; grep -rn "text_mode" brief/ 2>/dev/null | head -10; exit 1; }

# Confirm NO hard-coded "get-shit-done/" paths remain in brief/bin/lib/*.cjs
GSD_HITS=$(grep -rc "get-shit-done" brief/bin/lib/ 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')
echo "get-shit-done refs in brief/bin/lib/: $GSD_HITS (should be 0)"
[ "$GSD_HITS" = "0" ] || { echo "FAIL: runtime-detection code still has get-shit-done paths"; grep -n "get-shit-done" brief/bin/lib/*.cjs; exit 1; }

# Minimum expectations per planner pre-research (verified at planning time):
#   INSTRUCTION_FILE should be ~8 refs in brief/workflows/new-project.md
#   text_mode should be ~6 refs across brief/bin/lib/core.cjs, config.cjs, init.cjs
[ "$INST_HITS" -ge 5 ] || echo "WARN: INSTRUCTION_FILE count $INST_HITS below expected ~8 in brief/workflows/; inspect new-project.md"
[ "$TM_HITS" -ge 5 ] || echo "WARN: text_mode count $TM_HITS below expected ~6 in brief/bin/lib/; inspect core.cjs/config.cjs/init.cjs"
```

3. Create (or append to) `.planning/ASSUMPTIONS.md`:
```bash
ASSUMPTIONS=.planning/ASSUMPTIONS.md

# If the file doesn't exist, create it with a header
if [ ! -f "$ASSUMPTIONS" ]; then
  cat > "$ASSUMPTIONS" <<'HEADER'
# BRIEF Project Assumptions Log

Verified assumptions across phases. Each entry includes:
- Assumption ID (A1, A4, etc.) or requirement anchor (FND-06, etc.)
- Status (VERIFIED / OUTSTANDING / INVALIDATED)
- Command run, expected output, actual output
- Timestamp and phase

---

HEADER
fi

# Append Phase 1 verifications
cat >> "$ASSUMPTIONS" <<EOF

## Phase 1 Verifications (commit 6)

### A1 — Zero-runtime-dependencies rule (FND-04)

**Status:** VERIFIED
**Timestamp:** ${TS}
**Phase:** 01-foundation-fork-hygiene-removal-rename
**Requirement:** FND-04 (ROADMAP.md Success Criterion #4)

**Verification command:**
\`\`\`bash
node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"
\`\`\`

**Expected output:** \`0\`
**Actual output:** \`${DEP_COUNT}\`
**devDependencies count:** ${DEV_DEP_COUNT} (\`${DEV_DEPS_LIST}\`)

**Implication:** The "zero external runtime dependencies" rule inherited from GSD is preserved through the rename. Any future BRIEF feature must honor this — use \`npx --yes\` for CLIs and inline implementations for trivial parsing.

### FND-06 — Multi-runtime detection survived Plan 03–05 rename

**Status:** VERIFIED (detection code intact at BOTH known sites; actual cross-runtime smoke is Phase 9 HRD-01)
**Timestamp:** ${TS}
**Phase:** 01-foundation-fork-hygiene-removal-rename
**Requirement:** FND-06 (ROADMAP.md Success Criterion #5)

**Detection has two separate sites (planner verified before Phase 1 began):**

1. **\`INSTRUCTION_FILE\`** — runtime-dispatch env var consumed by the workflow markdown (Claude Code / Codex / Gemini / OpenCode all read this). Lives in \`brief/workflows/new-project.md\`. NOT present in \`brief/bin/lib/\` (not a lib-layer concern).
2. **\`text_mode\`** — non-AskUserQuestion fallback flag consumed by lib JS. Lives in \`brief/bin/lib/core.cjs\` + \`config.cjs\` + \`init.cjs\`.

**Verification commands + results:**
\`\`\`
grep -rc "INSTRUCTION_FILE" brief/workflows/  →  ${INST_HITS} total refs  (hard-fail gate if 0; expected ~8)
grep -rc "INSTRUCTION_FILE" brief/bin/lib/    →  ${INST_IN_LIB} refs       (expected 0 — not a lib-layer identifier)
grep -rc "text_mode" brief/bin/lib/           →  ${TM_HITS} total refs     (hard-fail gate if 0; expected ~6)
grep -rc "get-shit-done" brief/bin/lib/       →  ${GSD_HITS} total refs    (must be 0 — post-rename residue check)
\`\`\`

**Interpretation:**
- The \`INSTRUCTION_FILE\` workflow-dispatch env var is referenced ${INST_HITS} times in \`brief/workflows/\` (primarily \`new-project.md\`). The workflow-markdown layer still directs Codex/Gemini/OpenCode runtimes into the correct instruction stream.
- The \`text_mode\` non-AskUserQuestion fallback is referenced ${TM_HITS} times across \`brief/bin/lib/core.cjs\`, \`config.cjs\`, and \`init.cjs\`. Non-Claude runtimes can still write decisions through the text-prompt path.
- Zero \`get-shit-done\` path references remain in any \`brief/bin/lib/*.cjs\` file — the rename did not introduce broken absolute paths in the runtime-detection code.
- Actual smoke testing BRIEF across Claude Code / Codex / Gemini / OpenCode is deferred to Phase 9 (HRD-01) per the cross-runtime smoke-test milestone. Phase 1 verifies only that the detection CODE survived the rename intact at both sites.

### A-REPO — Placeholder repository URL in package.json

**Status:** PLACEHOLDER (NOT VERIFIED — requires Phase 9 resolution)
**Timestamp:** ${TS}
**Phase:** 01-foundation-fork-hygiene-removal-rename
**Requirement:** W1 closure (checker WARNING iteration 1)

**Current package.json values (set by Plan 04 Task 2):**
\`\`\`
repository.url:  git+https://github.com/brief-build/brief.git
homepage:        https://github.com/brief-build/brief
bugs.url:        https://github.com/brief-build/brief/issues
\`\`\`

**Why placeholder:** The GitHub org \`brief-build\` and repo \`brief\` have not been verified to exist or be reserved. Checker iteration 1 flagged this as unverified (W1). The real BRIEF repository URL is a Phase 9 (npm publishing / HRD-02) decision.

**Constraint until resolved:**
- Do NOT run \`npm publish\` while this assumption is in PLACEHOLDER status. A published package would direct users to a 404 URL.
- Plan 04 Task 2 Threat T-01-21 documents this as \"accept\" risk because no publish happens in Phase 1.
- Plan 06 FND-07 residue-grep includes a check for \`brief-build/brief\` to detect any accidental override back to placeholder-incompatible content.

**Resolution path (Phase 9 HRD-02):**
1. Verify/reserve GitHub org + repo (or pick a different one — planner or user decision at Phase 9 time).
2. Single-file find-replace on package.json across repository.url, homepage, bugs.url.
3. Update this ASSUMPTIONS.md entry: PLACEHOLDER → VERIFIED, record the resolved URL.

EOF
cat "$ASSUMPTIONS" | tail -40
```

4. Sanity-check that the file is a valid markdown:
```bash
head -5 .planning/ASSUMPTIONS.md
tail -5 .planning/ASSUMPTIONS.md
wc -l .planning/ASSUMPTIONS.md
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
# File exists
[ -f .planning/ASSUMPTIONS.md ] || { echo "FAIL: ASSUMPTIONS.md missing"; exit 1; }
# Contains A1 VERIFIED marker
grep -q "^### A1 " .planning/ASSUMPTIONS.md || { echo "FAIL: A1 section missing"; exit 1; }
grep -q "Status:.*VERIFIED" .planning/ASSUMPTIONS.md || { echo "FAIL: no VERIFIED status"; exit 1; }
# Contains FND-06 marker
grep -q "^### FND-06" .planning/ASSUMPTIONS.md || { echo "FAIL: FND-06 section missing"; exit 1; }
# FND-06 entry names BOTH sites (dual-site requirement per BLOCKER fix)
grep -q "brief/workflows/" .planning/ASSUMPTIONS.md || { echo "FAIL: FND-06 entry does not name workflows site"; exit 1; }
grep -q "brief/bin/lib/" .planning/ASSUMPTIONS.md || { echo "FAIL: FND-06 entry does not name lib site"; exit 1; }
# Contains A-REPO entry with PLACEHOLDER status (W1 closure)
grep -q "^### A-REPO" .planning/ASSUMPTIONS.md || { echo "FAIL: A-REPO section missing"; exit 1; }
grep -q "Status:.*PLACEHOLDER" .planning/ASSUMPTIONS.md || { echo "FAIL: A-REPO missing PLACEHOLDER status"; exit 1; }
grep -q "brief-build/brief" .planning/ASSUMPTIONS.md || { echo "FAIL: A-REPO missing placeholder URL details"; exit 1; }
# Deps really zero
DEPS=$(node -e "console.log(Object.keys(require(\"./package.json\").dependencies||{}).length)")
[ "$DEPS" = "0" ] || { echo "FAIL: deps=$DEPS"; exit 1; }
# INSTRUCTION_FILE lives in brief/workflows/ (not in lib)
grep -rq "INSTRUCTION_FILE" brief/workflows/ || { echo "FAIL: INSTRUCTION_FILE missing from brief/workflows/"; exit 1; }
# text_mode lives in brief/bin/lib/
grep -rq "text_mode" brief/bin/lib/ || { echo "FAIL: text_mode missing from brief/bin/lib/"; exit 1; }
# No lingering get-shit-done paths in lib
! grep -rq "get-shit-done" brief/bin/lib/ || { echo "FAIL: get-shit-done still in brief/bin/lib/"; exit 1; }
echo "OK: Task 1 verified (dual-site FND-06 detection)"
'
    </automated>
  </verify>
  <done>
    - `.planning/ASSUMPTIONS.md` exists with both `### A1` and `### FND-06` sections
    - A1 entry documents: command, expected output (0), actual output (0), timestamp, dev-dependencies list
    - FND-06 entry documents BOTH detection sites explicitly: `INSTRUCTION_FILE` in `brief/workflows/` (8 refs expected), `text_mode` in `brief/bin/lib/` (6 refs expected), `get-shit-done` residue count (0), and Phase 9 handoff
    - Hard-fail guards in the grep block: zero-count at either FND-06 site aborts the plan (BLOCKER fix)
    - Actual `Object.keys(deps).length === 0`
    - `brief/workflows/` grep confirms INSTRUCTION_FILE detection code intact
    - `brief/bin/lib/` grep confirms text_mode fallback code intact
    - No old `get-shit-done/` paths linger in `brief/bin/lib/`
  </done>
</task>

<task type="auto">
  <name>Task 2: Apply CLAUDE.md targeted-delta rewrite (D-12/D-13)</name>
  <files>
    CLAUDE.md
  </files>
  <read_first>
    - CLAUDE.md (current state — Plan 05 has already applied text-ref substitution; the remaining issue is the `## GSD Workflow Enforcement` section which was wholly GSD-framed and needs a content-level rewrite, NOT just a name swap)
    - .planning/PROJECT.md ("What This Is" and "Core Value" — source for the Project section)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (D-12 specifies which sections to replace and which to leave)
  </read_first>
  <action>
From repo root `/Users/agent/GSD-for-Business`:

1. Read the current CLAUDE.md (already partially modified by Plan 05's text sweep). Verify sentinel comments:
```bash
grep -n "BRIEF:.*-start\|BRIEF:.*-end" CLAUDE.md | head -20
# Expected: BRIEF:project-start/end, BRIEF:stack-start/end, BRIEF:conventions-start/end,
#           BRIEF:architecture-start/end, BRIEF:skills-start/end, BRIEF:workflow-start/end,
#           BRIEF:profile-start/end
```
If any sentinel is missing, inspect and report. Planner's expectation: Plan 05's `s/GSD/BRIEF/g` on `.md` files converts these.

2. Replace the `## GSD Workflow Enforcement` section content. Plan 05 converted the HEADING text via `s/GSD/BRIEF/g` but the body is still about `/gsd-quick`, `/gsd-debug`, `/gsd-execute-phase`. While Plan 05 also replaced `/gsd-` with `/brief-` there, the commands `/brief-debug` and `/brief-quick` no longer exist in Phase 1 (debug was removed per D-02; quick is a survivor). The workflow guidance must be REWRITTEN to be BRIEF-appropriate.

Use the Edit tool. Find the block bounded by `<!-- BRIEF:workflow-start source:BRIEF defaults -->` and `<!-- BRIEF:workflow-end -->`. Replace its INNER content (between the two sentinels) with:

```markdown
## BRIEF Workflow Enforcement

Before using Edit, Write, or other file-changing tools on planning artifacts, start work through a BRIEF command so the DEFINE → DISCOVER → DESIGN → DELIVER flow stays anchored to OBJECTIVES.md.

Use these entry points (post-Phase-1; the full command surface is populated in subsequent phases):
- `/brief-discuss-phase` for phase-level context capture
- `/brief-plan-phase` for phase planning
- `/brief-execute-phase` for planned phase execution
- `/brief-verify-work` for phase-level verification

Do not make direct repo edits outside a BRIEF workflow unless the user explicitly asks to bypass it.

> Note — Phase 1: The BRIEF domain-specific commands (`/brief-define`, `/brief-discover`, `/brief-design`, `/brief-deliver`) are not yet implemented. Phase 1 delivers clean fork hygiene; Phases 3–8 add the domain commands.
```

3. Augment the `## Project` section if it does not already contain both "Core Value" and the four-phase model name. Current CLAUDE.md (as generated by /gsd-new-project) pulls "What This Is" + "Core Value" from PROJECT.md via the `<!-- BRIEF:project-start source:PROJECT.md -->` sentinel. Verify this is present:
```bash
awk '/BRIEF:project-start/,/BRIEF:project-end/' CLAUDE.md
```
If it shows the 4-phase narrative and Core Value, leave it. If not, update it to match PROJECT.md lines 5–9 (planner checked — it does match as of Plan 05 completion).

4. Update the `## Technology Stack` section to include BRIEF-specific notes. Insert at the end of the stack section (just before `<!-- BRIEF:stack-end -->`):
```markdown

### BRIEF-Specific Stack Notes

- **Runtime dependencies:** Zero (verified via `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` → 0). New supporting libraries (gray-matter, ajv, @marp-team/marp-cli) are invoked via `npx --yes` rather than added to `dependencies` — preserves the GSD-inherited zero-runtime-deps property.
- **Marp CLI:** Invoked via `npx --yes @marp-team/marp-cli@4.3.1` during Phase 8 (DELIVER Type B decks). Users need Chrome/Edge (for rendering) and optionally LibreOffice Impress (for editable PPTX). No npm install.
- **Multi-runtime detection:** Preserved unchanged. The `INSTRUCTION_FILE` env var dispatch lives in `brief/workflows/new-project.md`; the `text_mode` non-AskUserQuestion fallback lives in `brief/bin/lib/core.cjs` / `config.cjs` / `init.cjs`.
```

5. Validate the resulting CLAUDE.md is structurally sound:
```bash
# Count sentinels — must be paired
START=$(grep -c "BRIEF:.*-start" CLAUDE.md)
END=$(grep -c "BRIEF:.*-end" CLAUDE.md)
[ "$START" = "$END" ] || { echo "FAIL: sentinel mismatch ($START start vs $END end)"; exit 1; }
# Key BRIEF vocabulary present
grep -qi "business planner" CLAUDE.md && grep -qi "OBJECTIVES.md" CLAUDE.md || { echo "WARN: BRIEF vocabulary not yet dominant"; }
# Dev vocabulary (should be low/absent)
DEVCOUNT=$(grep -ci "code review\|TDD\|deployment\|security audit\|unit test" CLAUDE.md)
echo "Dev-vocabulary count in CLAUDE.md: $DEVCOUNT"
[ "$DEVCOUNT" -le 3 ] || { echo "WARN: dev vocabulary $DEVCOUNT higher than expected; inspect"; }
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
[ -f CLAUDE.md ] || { echo "FAIL: CLAUDE.md missing"; exit 1; }
# Sentinel pairs balanced
S=$(grep -c "BRIEF:.*-start" CLAUDE.md); E=$(grep -c "BRIEF:.*-end" CLAUDE.md)
[ "$S" = "$E" ] || { echo "FAIL: sentinels $S vs $E"; exit 1; }
# BRIEF-domain vocabulary present
grep -qi "business planner\|OBJECTIVES.md\|workstream\|audience" CLAUDE.md || { echo "FAIL: BRIEF vocab missing"; exit 1; }
# Dev-specific vocabulary count is low
DEV=$(grep -ci "code review\|TDD\|deployment\|security audit\|unit test" CLAUDE.md)
echo "dev-vocab: $DEV (should be ≤ 3)"
[ "$DEV" -le 3 ] || { echo "FAIL: too much dev vocab"; exit 1; }
# Workflow section specifically mentions DEFINE/DISCOVER/DESIGN/DELIVER
grep -qE "DEFINE.*DISCOVER.*DESIGN.*DELIVER" CLAUDE.md || grep -q "DEFINE → DISCOVER → DESIGN → DELIVER" CLAUDE.md || { echo "FAIL: 4-phase model missing"; exit 1; }
echo "OK: Task 2 verified"
'
    </automated>
  </verify>
  <done>
    - CLAUDE.md `## GSD Workflow Enforcement` section rewritten to `## BRIEF Workflow Enforcement` with BRIEF-appropriate commands and Phase 1 caveat
    - `## Technology Stack` section has BRIEF-specific notes appended (zero deps, Marp via npx, multi-runtime preserved with BOTH detection sites named)
    - Sentinel comments (`BRIEF:*-start` / `BRIEF:*-end`) remain balanced
    - `grep -qi "business planner\|OBJECTIVES.md\|workstream\|audience" CLAUDE.md` matches
    - `grep -ci "code review\|TDD\|deployment\|security audit\|unit test" CLAUDE.md` returns ≤3 (any residuals documented in this plan's SUMMARY as intentional/benign)
  </done>
</task>

<task type="auto">
  <name>Task 3: Apply README.md targeted-delta rewrite (D-14)</name>
  <files>
    README.md
  </files>
  <read_first>
    - README.md (current state — already had mechanical path/slash-command substitutions from Plan 05, but the Hero, Who This Is For, How It Works sections remain SW-dev-framed)
    - .planning/PROJECT.md (What This Is + Core Value — source for rewrites)
    - .planning/ROADMAP.md (Phase 1/2/3/4 = DEFINE/DISCOVER/DESIGN/DELIVER — source for "How It Works" overview)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (D-14 "same delta pattern as CLAUDE.md" + "<deferred>" entry saying full README example is Phase 9 scope)
  </read_first>
  <action>
From repo root `/Users/agent/GSD-for-Business`:

1. Read current README.md and identify the sections to rewrite:
```bash
grep -n "^# \|^## \|^---$" README.md | head -40
```
Expected sections: Hero (top image/badges), Why I Built This, Who This Is For, Getting Started, How It Works, Why It Works, Commands, Configuration, Security, Troubleshooting, Community Ports, Star History, License.

2. Apply these edits (use Edit tool to make each replacement). Do a MINIMUM-VIABLE rewrite per D-14 + <deferred> note (full narrative polish is Phase 9 scope):

**Edit A:** Replace the repo Hero (the first ~46 lines from `<div align="center">` through the first `---`):
```
<div align="center">

# BRIEF

## Business Research, Insight & Execution Framework

**A hard fork of GSD (Get Shit Done), purpose-built for business and product strategy planning.**

**For business planners, product managers, founders, and strategy consultants — not software developers.**

BRIEF transforms a fuzzy business idea into well-researched, audience-correct, compliance-aware deliverables — before engineering's PRD work begins. Hand the DELIVER outputs to a PM; the PRD they write from BRIEF's briefs feeds cleanly back into GSD itself for execution.

```bash
npx brief-cc@latest
```

**Works on Mac, Windows, and Linux.**

**Phase 1 status:** Fork hygiene complete. Dev-specific surfaces removed, identifiers renamed, multi-runtime detection preserved, zero runtime dependencies verified. Domain commands (`/brief-define`, `/brief-discover`, `/brief-design`, `/brief-deliver`) land in Phases 3–8.

[Core Value](#core-value) · [Four Phases](#four-phases) · [Status & Roadmap](#status-and-roadmap) · [Commands](#commands)

</div>

---
```

**Edit B:** Replace `## Why I Built This` through `## Who This Is For` (keep position, replace content):
```
## Core Value

A business planner can transform a fuzzy idea into well-researched, audience-correct, compliance-aware deliverables — *without already knowing what they want when they start*.

BRIEF replaces GSD's software-engineering workflow (plan → execute → verify) with a business-domain workflow (DEFINE → DISCOVER → DESIGN → DELIVER + continuous ALIGN), inherits GSD's multi-agent orchestration, context engineering, and state management, and swaps out code-review/UI/TDD/security-audit surfaces for OBJECTIVES.md anchoring, parallel domain research, business workstreams (BMC, GTM, Financial, Operations, Compliance, Roadmap, Brand, Risk, Tech-Arch), and Type A/Type B deliverables (PRODUCT-BRIEF, SERVICE-POLICY, HIGH-LEVEL-SPEC, FEATURE-MAP + INTERNAL-DECK, PROPOSAL-DECK, EXEC-SUMMARY, DECISION-MEMO).

## Who This Is For

- **Business planners** shaping a new venture or product
- **Product managers** preparing PRD input
- **Founders** building investor/partner material
- **Strategy consultants** producing client-ready deliverables
- **Korea-first** with global support: Korean compliance reference library (PIPA/ISMS-P/MyData) built in

Not for: production-grade software-engineering workflows. For that, use GSD directly — BRIEF outputs hand off cleanly to GSD-driven PRD execution.

## Four Phases

1. **DEFINE** — Extract true intent. Push Twice + Language Precision conversational extraction, Dream State Mapping (now → 3mo → 12mo), OBJECTIVES.md per workstream.
2. **DISCOVER** — Broad domain research. 9 default research categories with provenance tags on every quantitative claim. B2B/B2C context injection. AUDIENCE guard on every research artifact.
3. **DESIGN** — Concrete business plan. 9 built-in workstreams (BMC, GTM, Financial, Operations, Compliance, Roadmap, Brand, Risk, Tech-Arch). Continuous ALIGN gate. Dynamic workstream addition via `/brief-add-workstream`. Bidirectional Phase 1↔2 flow.
4. **DELIVER** — Final artifacts in two modes: Type A (PRD inputs) and Type B (communication decks via Marp). Audience-enforced filenames + watermarks. Mandatory `/brief-export` confirmation.
```

**Edit C:** Replace the `## Commands` section (currently a dense GSD-centric command listing) with a Phase-1-scoped note:
```
## Commands

> Phase 1 has renamed the inherited workflow primitives; the BRIEF-domain commands arrive in Phases 3–8. The tables below reflect the current workflow surfaces only.

### Core Workflow (Phase 1)

| Command | What it does |
|---------|--------------|
| `/brief-new-project` | Initialize a new BRIEF project |
| `/brief-discuss-phase [N]` | Capture phase-level decisions before planning |
| `/brief-plan-phase [N]` | Research + plan a phase |
| `/brief-execute-phase <N>` | Run phase plans in parallel waves |
| `/brief-verify-work [N]` | Manual verification of phase outputs |
| `/brief-help` | Categorized command listing (populated in Phase 9) |

### Phases 3–8 (coming)

- `/brief-define` — Phase 0 conversational intent extractor (Phase 3)
- `/brief-discover` — Parallel domain research with provenance (Phase 5)
- `/brief-design` — Workstream orchestration + ALIGN/COMPLIANCE gates (Phases 4, 7)
- `/brief-deliver` — Type A + Type B artifacts with audience enforcement (Phase 8)
- `/brief-add-workstream` — Dynamic workstream addition (Phase 7)
- `/brief-status` — Current phase, active workstream, return-stack depth, gate findings (Phase 2)

Inherited GSD workflow commands (new-milestone, complete-milestone, discuss-phase, plan-phase, execute-phase, verify-work, help, status, and others) are preserved and renamed with the `/brief-` prefix.

## Status and Roadmap

- **Phase 1 (complete):** Fork hygiene, removal of ~38–45 dev-specific files, rename to brief-*, A1 zero-deps verified, multi-runtime detection preserved.
- **Phases 2–9:** See `.planning/ROADMAP.md` for the full 9-phase roadmap covering stable seams, DEFINE, ALIGN gate, DISCOVER, bidirectional foundation, DESIGN + COMPLIANCE checker, DELIVER + AUDIENCE enforcement, and cross-runtime hardening.

## Localized READMEs

The Korean, Japanese, Portuguese, and Simplified Chinese READMEs are being rebranded as part of Phase 9 (Hardening). They currently reflect pre-fork GSD content.
```

3. Leave the following sections LARGELY unchanged (Plan 05 has already applied mechanical text substitutions):
- `## Configuration` — retains inherited workflow configuration (still applicable)
- `## Security` — retains the security-hardening notes (still applicable)
- `## Troubleshooting` — retains (command paths updated by Plan 05)
- `## Community Ports` — retains (historical attribution)
- `## License` — retains MIT

4. Sanity check:
```bash
# BRIEF vocabulary should be dominant
BVOCAB=$(grep -ci "business planner\|OBJECTIVES\|workstream\|audience\|DEFINE\|DISCOVER\|DESIGN\|DELIVER" README.md)
echo "BRIEF vocabulary count in README.md: $BVOCAB"
[ "$BVOCAB" -ge 10 ] || { echo "FAIL: BRIEF vocab too low"; exit 1; }

# Dev vocabulary should be absent from hero+commands (may still appear in Config/Security)
# Check just the first 300 lines (hero, core-value, phases, commands):
DEV_IN_HEAD=$(head -300 README.md | grep -ci "code review\|TDD\|deployment\|unit test")
echo "Dev vocab in first 300 lines: $DEV_IN_HEAD (should be ≤1)"
[ "$DEV_IN_HEAD" -le 2 ] || { echo "WARN: dev vocab in head higher than expected"; }

# Install command is brief-cc
grep -q "npx brief-cc@latest\|npx brief-cc " README.md || { echo "FAIL: brief-cc install missing"; exit 1; }
# "Get Shit Done" should not appear in Hero/Core-Value
head -60 README.md | grep -qi "Get Shit Done" && { echo "FAIL: GSD brand still in hero"; exit 1; } || true
```

5. Stage changes (commit happens in Task 4):
```bash
git diff --stat CLAUDE.md README.md .planning/ASSUMPTIONS.md
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
[ -f README.md ] || { echo "FAIL"; exit 1; }
# BRIEF vocabulary strong
BVOCAB=$(grep -ci "business planner\|OBJECTIVES\|workstream\|audience\|DEFINE\|DISCOVER\|DESIGN\|DELIVER" README.md)
[ "$BVOCAB" -ge 10 ] || { echo "FAIL: BRIEF vocab $BVOCAB too low"; exit 1; }
# Install command updated
grep -q "npx brief-cc" README.md || { echo "FAIL: brief-cc install missing"; exit 1; }
# Hero does not still say "Get Shit Done"
! head -60 README.md | grep -qi "Get Shit Done" || { echo "FAIL: GSD brand still in hero"; exit 1; }
# Four-phase model documented
grep -qE "DEFINE.*DISCOVER.*DESIGN.*DELIVER" README.md || { echo "FAIL: 4-phase model missing"; exit 1; }
echo "OK: Task 3 verified"
'
    </automated>
  </verify>
  <done>
    - README.md hero section is "BRIEF — Business Research, Insight & Execution Framework"
    - Core Value section present, derived from PROJECT.md
    - Four Phases section lists DEFINE/DISCOVER/DESIGN/DELIVER with one-line summary each
    - Commands section reflects Phase-1 reality (workflow primitives + placeholder for Phases 3–8 domain commands)
    - Install instruction is `npx brief-cc@latest`
    - BRIEF-vocabulary count ≥ 10; "Get Shit Done" not in hero (≤60 lines)
    - Localized READMEs explicitly flagged as Phase 9 scope (not touched in Plan 06)
  </done>
</task>

<task type="auto">
  <name>Task 4: Final FND-07 verification and atomic commit (commit 6 of 6)</name>
  <files>
    CLAUDE.md
    README.md
    .planning/ASSUMPTIONS.md
  </files>
  <read_first>
    - Staged changes from Tasks 1, 2, 3
    - .planning/ROADMAP.md (Phase 1 Success Criteria #6 — line 37)
    - package.json (post-Plan-04; descriptive fields updated per Plan 04 Task 2; Plan 06 verifies no residues remain)
  </read_first>
  <action>
From repo root `/Users/agent/GSD-for-Business`:

1. Run the FND-07 verification command set (per <fnd_07_verification_hint>):
```bash
# Business vocab present in both
BIZ=$(grep -ci "business planner\|OBJECTIVES.md\|workstream\|audience" CLAUDE.md README.md)
echo "Business vocab (CLAUDE.md + README.md): $BIZ (should be positive on both)"
CLAUDE_BIZ=$(grep -ci "business planner\|OBJECTIVES.md\|workstream\|audience" CLAUDE.md)
README_BIZ=$(grep -ci "business planner\|OBJECTIVES.md\|workstream\|audience" README.md)
echo "  CLAUDE.md: $CLAUDE_BIZ; README.md: $README_BIZ"
[ "$CLAUDE_BIZ" -ge 2 ] && [ "$README_BIZ" -ge 5 ] || { echo "FAIL: business vocab counts low"; exit 1; }

# Dev vocab absent (or at very low count with explanation)
DEV=$(grep -ci "code review\|TDD\|deployment\|security audit\|unit test" CLAUDE.md README.md)
echo "Dev vocab (CLAUDE.md + README.md): $DEV (should be 0 or low with explanation)"
# Also record where matches live
grep -i "code review\|TDD\|deployment\|security audit\|unit test" CLAUDE.md README.md | head -10 > /tmp/plan06-devmatches.txt

# package.json residue check (Plan 04 Task 2 updated descriptive fields; Plan 06 confirms no residue)
# NOTE: brief-build/brief placeholder is ALLOWED — see A-REPO assumption in ASSUMPTIONS.md (W1 closure).
# Check for GSD-specific tokens that should NOT remain.
PKG_RESIDUE=$(grep -ci "spec-driven\|get-shit-done-cc\|gsd-build/get-shit-done" package.json)
echo "GSD-domain residue in package.json: $PKG_RESIDUE (should be 0)"
if [ "$PKG_RESIDUE" != "0" ]; then
  echo "FAIL: package.json still contains GSD-domain content"
  grep -in "spec-driven\|get-shit-done-cc\|gsd-build/get-shit-done" package.json
  exit 1
fi

# BLOCKER 1 closure — broadened repo-wide residue grep for removed-agent identifiers
# Scope: ALL tracked files EXCEPT documented exclusions (.planning, .git, node_modules, backup, CHANGELOG.md RESIDUAL, removed-surfaces.smoke.txt audit trail)
ORPHAN_PATTERN='gsd-(code-reviewer|code-fixer|debugger|ui-researcher|ui-checker|ui-auditor|ai-researcher|eval-planner|eval-auditor|domain-researcher|security-auditor|integration-checker|debug-session-manager)'
ORPHAN_HITS=$(grep -rE "$ORPHAN_PATTERN" . --exclude-dir=.planning --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=backup 2>/dev/null | grep -v "^CHANGELOG\.md:" | grep -v "^./CHANGELOG\.md:" | grep -v "removed-surfaces.smoke.txt:" | wc -l | tr -d ' ')
echo "Removed-agent orphan count (BLOCKER 1 closure — must be 0): $ORPHAN_HITS"
if [ "$ORPHAN_HITS" != "0" ]; then
  echo "FAIL (BLOCKER 1): $ORPHAN_HITS orphan references to removed agents found repo-wide"
  grep -rE "$ORPHAN_PATTERN" . --exclude-dir=.planning --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=backup 2>/dev/null | grep -v "^CHANGELOG\.md:\|^./CHANGELOG\.md:\|removed-surfaces.smoke.txt:" | head -20
  exit 1
fi

# BLOCKER 2 closure — tests/agent-frontmatter.test.cjs bare-prefix + iteration-count check
! grep -q "startsWith('gsd-')" tests/agent-frontmatter.test.cjs || { echo "FAIL (BLOCKER 2): tests/agent-frontmatter.test.cjs still has bare 'gsd-' literal"; exit 1; }
grep -q "startsWith('brief-')" tests/agent-frontmatter.test.cjs || { echo "FAIL (BLOCKER 2): tests/agent-frontmatter.test.cjs missing 'brief-' literal"; exit 1; }
AGENT_ITER=$(node -e "const fs = require('fs'); const path = require('path'); const dir = path.join(process.cwd(), 'agents'); console.log(fs.readdirSync(dir).filter(f => f.startsWith('brief-') && f.endsWith('.md')).length);")
echo "Agent-frontmatter iteration count (BLOCKER 2 closure — must be ≥18): $AGENT_ITER"
[ "$AGENT_ITER" -ge 18 ] || { echo "FAIL (BLOCKER 2): iterates $AGENT_ITER agents (expected ≥18)"; exit 1; }
```

2. Append an FND-07 verification section to `.planning/ASSUMPTIONS.md`:
```bash
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
cat >> .planning/ASSUMPTIONS.md <<EOF

### FND-07 — Business-planning-domain language in CLAUDE.md + README.md + package.json

**Status:** VERIFIED
**Timestamp:** ${TS}
**Phase:** 01-foundation-fork-hygiene-removal-rename
**Requirement:** FND-07 (ROADMAP.md Success Criterion #6)

**Verification commands:**
\`\`\`bash
# Business-planning vocabulary (should be positive on both files)
grep -ci 'business planner\\|OBJECTIVES.md\\|workstream\\|audience' CLAUDE.md  →  ${CLAUDE_BIZ}
grep -ci 'business planner\\|OBJECTIVES.md\\|workstream\\|audience' README.md  →  ${README_BIZ}

# Software-development vocabulary (should be 0 or low)
grep -ci 'code review\\|TDD\\|deployment\\|security audit\\|unit test' CLAUDE.md + README.md  →  ${DEV}

# package.json GSD-domain residue (must be 0 per checker WARNING #6)
grep -ci 'spec-driven\\|get-shit-done\\|gsd-build' package.json  →  ${PKG_RESIDUE}
\`\`\`

**Interpretation:**
- Business-planning domain language (business planner, OBJECTIVES, workstream, audience) appears ${CLAUDE_BIZ} times in CLAUDE.md and ${README_BIZ} times in README.md — both files read as BRIEF documents.
- Software-development language count: ${DEV}.$([ "$DEV" -gt 0 ] && echo " Residual matches are documented in this commit's SUMMARY as intentional (e.g., Configuration section describing workflow agents, Security section explaining hardening — content that survives as inherited infrastructure documentation and is not primary BRIEF narrative).") If any residual appears in the hero or primary-narrative sections (first 300 lines of README.md), it's a Phase 9 polish task, not a Phase 1 blocker.
- package.json GSD-domain residue: ${PKG_RESIDUE} (descriptive fields were rewritten in Plan 04 Task 2; this Plan 06 check confirms no regression).

EOF
```

3. Run the final buildability gate across all Plan 01–06 outputs:
```bash
# Lib still loads
node -e "require('./brief/bin/lib/core.cjs'); require('./brief/bin/lib/state.cjs'); require('./brief/bin/lib/init.cjs'); console.log('all lib: OK');" || { echo "FAIL: lib broken"; exit 1; }
# brief-tools.cjs executable
node brief/bin/brief-tools.cjs --help >/dev/null 2>&1 || node brief/bin/brief-tools.cjs >/dev/null 2>&1 || echo "(brief-tools exits non-zero — manual inspect acceptable)"
# package.json valid
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json: valid');" || { echo "FAIL"; exit 1; }
# Deps still zero
[ "$(node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)")" = "0" ] || { echo "FAIL: deps non-zero"; exit 1; }
```

4. Stage and commit:
```bash
git add CLAUDE.md README.md .planning/ASSUMPTIONS.md
git status --short

node brief/bin/brief-tools.cjs commit "docs(01): CLAUDE.md + README.md targeted delta, ASSUMPTIONS.md A1+FND-06+FND-07+A-REPO (closes Phase 1)" --files CLAUDE.md README.md .planning/ASSUMPTIONS.md
# Fallback
# git commit -m "docs(01): CLAUDE.md + README.md targeted delta, ASSUMPTIONS.md A1+FND-06+FND-07+A-REPO (closes Phase 1)"
```

5. Verify the commit landed:
```bash
git log -1 --oneline
# Expect: <hash> docs(01): CLAUDE.md + README.md targeted delta, ASSUMPTIONS.md A1+FND-06+FND-07+A-REPO (closes Phase 1)
git log --oneline -10 | head -10
# Expect 6 Phase 1 commits (1: backup, 2: remove, 3: rename, 4: dir+bin, 5: text-refs, 6: docs+verify)
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
# Commit message matches
git log -1 --format="%s" | grep -qE "docs\(01\).*targeted delta.*Phase 1" || { echo "FAIL: commit message"; exit 1; }
# ASSUMPTIONS.md has all three entries
grep -q "^### A1 " .planning/ASSUMPTIONS.md || { echo "FAIL: A1"; exit 1; }
grep -q "^### FND-06" .planning/ASSUMPTIONS.md || { echo "FAIL: FND-06"; exit 1; }
grep -q "^### FND-07" .planning/ASSUMPTIONS.md || { echo "FAIL: FND-07"; exit 1; }
# FND-06 entry specifically mentions BOTH detection sites
grep -q "brief/workflows/" .planning/ASSUMPTIONS.md || { echo "FAIL: FND-06 missing workflows site"; exit 1; }
grep -q "brief/bin/lib/" .planning/ASSUMPTIONS.md || { echo "FAIL: FND-06 missing lib site"; exit 1; }
# FND-07 entry includes package.json residue check
grep -q "package.json" .planning/ASSUMPTIONS.md || { echo "FAIL: FND-07 missing package.json check"; exit 1; }
# package.json has no GSD residue (checker WARNING #6 closure; A-REPO placeholder ALLOWED per W1)
! grep -qi "spec-driven\|get-shit-done-cc\|gsd-build/get-shit-done" package.json || { echo "FAIL: package.json GSD residue"; exit 1; }
# ASSUMPTIONS.md has A-REPO entry for W1 placeholder (STATUS: PLACEHOLDER)
grep -q "^### A-REPO" .planning/ASSUMPTIONS.md || { echo "FAIL: A-REPO missing from ASSUMPTIONS.md"; exit 1; }
grep -q "Status:.*PLACEHOLDER" .planning/ASSUMPTIONS.md || { echo "FAIL: A-REPO missing PLACEHOLDER status"; exit 1; }
# BLOCKER 1 closure — removed-agent orphan grep repo-wide
ORPHAN_PATTERN="gsd-(code-reviewer|code-fixer|debugger|ui-researcher|ui-checker|ui-auditor|ai-researcher|eval-planner|eval-auditor|domain-researcher|security-auditor|integration-checker|debug-session-manager)"
ORPHAN_HITS=$(grep -rE "$ORPHAN_PATTERN" . --exclude-dir=.planning --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=backup 2>/dev/null | grep -v "^CHANGELOG\.md:\|^./CHANGELOG\.md:\|removed-surfaces.smoke.txt:" | wc -l | tr -d " ")
[ "$ORPHAN_HITS" = "0" ] || { echo "FAIL (BLOCKER 1): $ORPHAN_HITS orphan refs in final gate"; exit 1; }
# BLOCKER 2 closure — tests/agent-frontmatter.test.cjs uses brief- literal, iterates ≥18 agents
! grep -q "startsWith(.gsd-.)" tests/agent-frontmatter.test.cjs || { echo "FAIL (BLOCKER 2): gsd- literal in agent-frontmatter"; exit 1; }
grep -q "startsWith(.brief-.)" tests/agent-frontmatter.test.cjs || { echo "FAIL (BLOCKER 2): brief- literal missing"; exit 1; }
AGENT_ITER=$(node -e "const fs = require(\"fs\"); const path = require(\"path\"); const dir = path.join(process.cwd(), \"agents\"); console.log(fs.readdirSync(dir).filter(f => f.startsWith(\"brief-\") && f.endsWith(\".md\")).length);")
[ "$AGENT_ITER" -ge 18 ] || { echo "FAIL (BLOCKER 2): iterates $AGENT_ITER"; exit 1; }
# Lib loads
node -e "require(\"./brief/bin/lib/core.cjs\");" || { echo "FAIL: lib broken"; exit 1; }
# Deps zero
DEPS=$(node -e "console.log(Object.keys(require(\"./package.json\").dependencies||{}).length)")
[ "$DEPS" = "0" ] || { echo "FAIL: deps $DEPS"; exit 1; }
# Phase 1 commit count = 6 (D-08 normalized)
PHASE1_COMMITS=$(git log --oneline main | grep -cE "chore\(01\)|refactor\(01-(rename|refs|remove)\)|docs\(01\)")
echo "Phase 1 commit count: $PHASE1_COMMITS (expected 6)"
[ "$PHASE1_COMMITS" -ge 5 ] || { echo "WARN: expected 6 Phase 1 commits, got $PHASE1_COMMITS"; }
echo "OK: Task 4 verified — Phase 1 complete with BLOCKER 1+2 closure"
'
    </automated>
  </verify>
  <done>
    - FND-04 (A1), FND-06, FND-07 all documented as VERIFIED in `.planning/ASSUMPTIONS.md` with timestamps and command evidence
    - FND-06 entry explicitly names BOTH detection sites (workflows/ for INSTRUCTION_FILE, bin/lib/ for text_mode) per iteration-1 BLOCKER fix
    - A-REPO entry present with STATUS: PLACEHOLDER (W1 closure — placeholder URL strategy documented; Phase 9 HRD-02 resolves)
    - FND-07 entry includes the package.json residue check
    - `grep -i 'spec-driven\|get-shit-done-cc\|gsd-build/get-shit-done' package.json` returns 0 matches (the `brief-build/brief` placeholder is allowed per A-REPO)
    - BLOCKER 1 closure: repo-wide removed-agent orphan grep (excluding .planning, .git, node_modules, backup, CHANGELOG.md RESIDUAL, removed-surfaces.smoke.txt) returns 0
    - BLOCKER 2 closure: `tests/agent-frontmatter.test.cjs` uses `'brief-'` literal (not `'gsd-'`); iterates ≥18 agents
    - Exactly one new commit on `main` with message `docs(01): CLAUDE.md + README.md targeted delta, ASSUMPTIONS.md A1+FND-06+FND-07+A-REPO (closes Phase 1)`
    - Lib layer still loads
    - `package.json dependencies` still empty
    - Phase 1 commit count on main is 6 (Plan 01 through Plan 06, per D-08 normalized) — provides git-log trace of the phase
    - All three Plan 06 requirements (FND-04, FND-06, FND-07) closed + A-REPO assumption recorded
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Documentation text ↔ user expectations | CLAUDE.md and README.md set expectations for what BRIEF CAN do today. Overclaiming risks user frustration. Plan 06 documents "Phase 1 status" and "Phases 3–8 coming" explicitly to set accurate expectations. |
| ASSUMPTIONS.md ↔ audit trail | `ASSUMPTIONS.md` is the user-facing audit log for verification decisions. It must be accurate (real commands, real outputs, real timestamps). |
| FND-06 detection grep ↔ dual-site reality | Detection lives in TWO sites (workflows/ for INSTRUCTION_FILE, bin/lib/ for text_mode). A single-path grep (as in the pre-revision plan) would wrongly record VERIFIED-for-zero on the wrong site. Hard-fail guards at BOTH sites prevent this. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-01-13 | I (Information Disclosure) | ASSUMPTIONS.md is committed publicly (visible in git history); exposes internal dependency counts | accept | Zero deps IS the selling point. No sensitive information in A1/FND-06/FND-07 entries. |
| T-01-14 | R (Repudiation) | Without timestamps, future readers can't tell when A1 was verified | mitigate | Each ASSUMPTIONS.md entry includes an ISO-8601 UTC timestamp from `date -u +%Y-%m-%dT%H:%M:%SZ`. |
| T-01-15 | T (Tampering) | A user could edit ASSUMPTIONS.md post-hoc to assert wrong status; ASSUMPTIONS.md is a pure markdown file | accept | Protection via git history (commit in this plan). If ASSUMPTIONS.md is edited later, the diff is visible in git log. No additional hardening warranted for Phase 1. |
| T-01-22 | T (Tampering) | FND-06 grep returns 0 because it targets the wrong path; "VERIFIED: refs=0" recorded as a contradiction | mitigate | BLOCKER fix: Task 1 greps brief/workflows/ for INSTRUCTION_FILE (correct path, expected ~8 refs) AND brief/bin/lib/ for text_mode (correct path, expected ~6 refs). Both sites have hard-fail-on-zero guards. ASSUMPTIONS.md entry names each site with its expected count. |

Phase 1 still adds zero new attack surface.
</threat_model>

<verification>
1. `.planning/ASSUMPTIONS.md` exists with sections `### A1`, `### FND-06`, `### FND-07`, all marked `Status: VERIFIED`.
2. FND-06 entry explicitly names both detection sites: `brief/workflows/` (INSTRUCTION_FILE) + `brief/bin/lib/` (text_mode).
3. `grep -ci "business planner\|OBJECTIVES.md\|workstream\|audience" CLAUDE.md` returns ≥2.
4. `grep -ci "business planner\|OBJECTIVES.md\|workstream\|audience" README.md` returns ≥5.
5. `grep -ci "code review\|TDD\|deployment\|security audit\|unit test" CLAUDE.md README.md` returns low (≤3 with each match explained in SUMMARY).
6. `node -e "require('./brief/bin/lib/core.cjs')"` exits 0.
7. `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` prints 0.
8. `grep -rq "INSTRUCTION_FILE" brief/workflows/` exits 0 (BLOCKER fix: correct path).
9. `grep -rq "text_mode" brief/bin/lib/` exits 0.
10. `! grep -rq "get-shit-done" brief/bin/lib/` exits 0 (no legacy paths).
11. `! grep -qi "spec-driven\|get-shit-done\|gsd-build" package.json` exits 0 (WARNING #6 closure).
12. Commit message: `docs(01): CLAUDE.md + README.md targeted delta, ASSUMPTIONS.md A1+FND-06+FND-07 (closes Phase 1)`.
13. Phase 1 commits on main: 5–6.
</verification>

<success_criteria>
- [ ] `.planning/ASSUMPTIONS.md` created with A1, FND-06, FND-07 VERIFIED entries + timestamps + commands + outputs
- [ ] FND-06 entry names BOTH detection sites explicitly (BLOCKER fix): `brief/workflows/` for INSTRUCTION_FILE + `brief/bin/lib/` for text_mode
- [ ] CLAUDE.md targeted-delta applied per D-12: Project, Workflow, Stack sections updated; Conventions/Architecture/Skills/Profile unchanged per D-13
- [ ] README.md targeted-delta applied per D-14: hero rebranded, Core Value present, Four Phases listed, install is `npx brief-cc`, Localized READMEs deferred to Phase 9
- [ ] FND-04 success criterion met (user can run documented inspection step, gets 0)
- [ ] FND-06 success criterion met at the code-level (detection code survived rename at BOTH sites; actual cross-runtime smoke is Phase 9 HRD-01)
- [ ] FND-07 success criterion met (business-planning vocab dominant; dev vocab ≤3; package.json has 0 GSD-domain residue per WARNING #6)
- [ ] Exactly one atomic commit for this plan
- [ ] Phase 1 complete: all 6 ROADMAP.md success criteria (lines 32–37) met
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-06-SUMMARY.md` including:
- Final Phase 1 commit hashes (6 of them)
- ASSUMPTIONS.md excerpts confirming A1/FND-06/FND-07 status
- Note that FND-06 verification used dual-site grep (workflows + lib) per checker BLOCKER fix
- Note that package.json descriptive fields were rebranded in Plan 04 Task 2 per checker WARNING #6
- Count of dev-vocab residuals in CLAUDE.md+README.md and an explanation for each
- A one-paragraph "Phase 1 complete" note that summarizes exactly what changed and what remains for Phase 2 (stable seam, A4 verification, workstream-as-yaml, caps)
</output>
</content>
