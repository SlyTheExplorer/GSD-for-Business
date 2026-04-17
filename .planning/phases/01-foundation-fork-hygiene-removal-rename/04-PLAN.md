---
phase: 01-foundation-fork-hygiene-removal-rename
plan: 04
type: execute
wave: 4
depends_on: [03]
files_modified:
  - "get-shit-done/"
  - "brief/"
  - "get-shit-done/bin/gsd-tools.cjs"
  - "brief/bin/brief-tools.cjs"
  - "package.json"
autonomous: true
requirements:
  - FND-03
user_setup: []

must_haves:
  truths:
    - "User runs `ls get-shit-done 2>/dev/null` and gets 'No such file or directory'"
    - "User runs `ls brief/` and sees bin/, contexts/, references/, templates/, workflows/ subdirectories"
    - "User runs `ls brief/bin/` and sees `brief-tools.cjs` and `lib/`"
    - "User runs `ls brief/bin/gsd-tools.cjs 2>/dev/null` and gets empty"
    - "User runs `cat package.json | jq -r .name` and gets `brief-cc`"
    - "User runs `cat package.json | jq -r '.bin | keys[0]'` and gets `brief-cc`"
    - "User runs `cat package.json | jq -r .description` and gets BRIEF-domain content (no 'spec-driven development')"
    - "User runs `cat package.json | jq -r '.repository.url'` and gets a BRIEF-repo URL (no 'gsd-build/get-shit-done')"
    - "User runs `node -e \"require('./brief/bin/lib/core.cjs')\"` and it succeeds"
  artifacts:
    - path: "brief/"
      provides: "Root of the inherited core library, renamed from get-shit-done/"
      contains: "bin/, contexts/, references/, templates/, workflows/"
    - path: "brief/bin/brief-tools.cjs"
      provides: "Entry-point binary for the BRIEF tool CLI (was gsd-tools.cjs)"
      contains: "same content as gsd-tools.cjs (text-ref updates inside the .cjs are Plan 05)"
    - path: "package.json"
      provides: "npm package metadata fully reflecting BRIEF identity (name, bin, files, description, keywords, repository, homepage, bugs, author)"
      contains: "\"name\": \"brief-cc\", \"bin\": { \"brief-cc\": \"bin/install.js\" }, BRIEF-domain description + keywords + repo URLs"
  key_links:
    - from: "brief/bin/brief-tools.cjs"
      to: "brief/bin/lib/core.cjs"
      via: "require('./lib/core.cjs')"
      pattern: "relative paths unchanged after directory rename"
    - from: "package.json `bin` key"
      to: "bin/install.js"
      via: "npm bin field"
      pattern: "bin entry renamed brief-cc; install.js still points here"
    - from: "package.json descriptive fields"
      to: "BRIEF domain (not GSD dev-domain)"
      via: "field content rewrite in Task 2"
      pattern: "description + keywords + repository.url + homepage + bugs.url + author all reflect BRIEF — not 'spec-driven development' or 'gsd-build/get-shit-done'"
---

<objective>
Execute commit 4 of 6 (per D-08 expanded — see Plan 06 for commit-count reconciliation): the internal rename — the `get-shit-done/` directory becomes `brief/`, the entry binary `gsd-tools.cjs` becomes `brief-tools.cjs`, and `package.json` fully switches to BRIEF identity (name, bin, files, description, keywords, repository, homepage, bugs, author).

Purpose: Honor FND-03 part 2 and D-05's aggressive-rename decision. This is the most consequential commit in Phase 1 for internal path references — after this, every `.md` and `.cjs` file that said `get-shit-done/...` or `gsd-tools` in its content is now pointing at a non-existent path. Those references are repaired in Plan 05.

**Revision note (addresses checker WARNING #6):** The pre-revision plan explicitly deferred descriptive package.json fields (description, keywords, repository, homepage, bugs, author) to Plan 05 and left them unchanged. But Plan 05's substitution patterns wouldn't match those fields (URLs end in `.git` or have no trailing slash; description talks about "spec-driven development" which isn't in the substitution dictionary). Result: `cat package.json` after Plan 06 would still describe GSD. We now update all descriptive fields in THIS plan's Task 2, where the `package.json` update is already happening.

Per D-09 (buildable state) — the definition here is narrow: `node -e "require('./brief/bin/lib/core.cjs')"` must succeed. This holds because:
- The lib/*.cjs files use RELATIVE `require()`s (e.g., `require('./state.cjs')`), not absolute `require('get-shit-done/...')` paths
- Directory rename preserves relative structure

Output: Renamed directory `brief/`, renamed binary `brief/bin/brief-tools.cjs`, fully-BRIEF-ified `package.json`, one atomic commit. Lib layer still loads cleanly after the rename.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md
@.planning/phases/01-foundation-fork-hygiene-removal-rename/01-03-SUMMARY.md

<interfaces>
<!-- Current state at planning time (verified): -->
<!-- package.json: -->
<!--   "name": "get-shit-done-cc" -->
<!--   "description": "A meta-prompting, context engineering and spec-driven development system for Claude Code, OpenCode, Gemini and Codex by TÂCHES." -->
<!--   "bin": { "get-shit-done-cc": "bin/install.js" } -->
<!--   "files": [ "bin", "commands", "get-shit-done", "agents", "hooks", "scripts" ] -->
<!--   "keywords": [ "claude", "claude-code", "ai", "meta-prompting", "context-engineering", "spec-driven-development", "gemini", "gemini-cli", "codex", "codex-cli" ] -->
<!--   "author": "TÂCHES" -->
<!--   "repository.url": "git+https://github.com/gsd-build/get-shit-done.git" -->
<!--   "homepage": "https://github.com/gsd-build/get-shit-done" -->
<!--   "bugs.url": "https://github.com/gsd-build/get-shit-done/issues" -->
<!--   "scripts.test:coverage": uses `--include 'get-shit-done/bin/lib/*.cjs'` -->

<!-- Required post-rename package.json: -->
<!--   "name": "brief-cc" -->
<!--   "description": "Meta-prompting framework for business and product strategy planning across Claude Code, OpenCode, Gemini, and Codex. Hard fork of GSD — DEFINE, DISCOVER, DESIGN, DELIVER before engineering's PRD work begins." -->
<!--   "bin": { "brief-cc": "bin/install.js" } -->
<!--   "files": [ "bin", "commands", "brief", "agents", "hooks", "scripts" ] -->
<!--   "keywords": (replace "spec-driven-development" and add BRIEF-domain keywords) -->
<!--   "author": (TBD — keep TÂCHES for now since it's the fork maintainer's attribution; user can adjust in Phase 9) -->
<!--   "repository.url": (placeholder BRIEF-repo URL; actual URL resolved in Phase 9 publishing) -->
<!--   "homepage": (placeholder matching repository.url) -->
<!--   "bugs.url": (placeholder matching repository.url) -->
<!--   "scripts.test:coverage": uses `--include 'brief/bin/lib/*.cjs'` -->

<!-- Placeholder URL strategy: -->
<!-- Plan 06's FND-07 grep will include package.json in its scope. If a Phase 9 publishing decision -->
<!-- later selects a different URL (e.g., a GitHub org), it's a simple find-and-replace on a single file. -->

<!-- get-shit-done/ contents (verified at planning time): bin/ contexts/ references/ templates/ workflows/ -->
<!-- get-shit-done/bin/ contents: gsd-tools.cjs, lib/ -->
<!-- Internal require()s in lib/*.cjs use relative paths only — confirmed by grep -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Rename directory get-shit-done → brief and binary gsd-tools.cjs → brief-tools.cjs</name>
  <files>
    get-shit-done/ (entire tree — dir rename)
    brief/ (new)
    get-shit-done/bin/gsd-tools.cjs
    brief/bin/brief-tools.cjs
  </files>
  <read_first>
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (D-05 specifies these exact renames)
    - Output of `ls get-shit-done/` (confirms the subdirectory inventory)
  </read_first>
  <action>
From repo root `/Users/agent/GSD-for-Business`:

1. Verify the current state (planning assumed exact layout; confirm at execution time):
```bash
[ -d get-shit-done ] || { echo "FAIL: get-shit-done missing"; exit 1; }
[ -f get-shit-done/bin/gsd-tools.cjs ] || { echo "FAIL: gsd-tools.cjs missing"; exit 1; }
ls get-shit-done/
# Expect: bin contexts references templates workflows
```

2. Rename the directory:
```bash
git mv get-shit-done brief
```
Git will detect this as a tree rename. All files inside are renamed atomically.

3. Rename the binary inside:
```bash
git mv brief/bin/gsd-tools.cjs brief/bin/brief-tools.cjs
```

4. Verify:
```bash
[ -d brief ] || { echo "FAIL: brief/ missing"; exit 1; }
[ ! -d get-shit-done ] || { echo "FAIL: get-shit-done/ still exists"; exit 1; }
[ -f brief/bin/brief-tools.cjs ] || { echo "FAIL: brief-tools.cjs missing"; exit 1; }
[ ! -f brief/bin/gsd-tools.cjs ] || { echo "FAIL: gsd-tools.cjs still there"; exit 1; }
# Lib files moved with the tree
ls brief/bin/lib/ | head -5
# core.cjs still loads (relative requires survive the rename)
node -e "require('./brief/bin/lib/core.cjs'); console.log('core: OK');" || { echo "FAIL: core.cjs broken post-rename"; exit 1; }
node -e "require('./brief/bin/lib/state.cjs'); console.log('state: OK');" || { echo "FAIL: state.cjs broken"; exit 1; }
node -e "require('./brief/bin/lib/init.cjs'); console.log('init: OK');" || { echo "FAIL: init.cjs broken"; exit 1; }
# graphify.cjs also survives (Plan 02 revision explicitly keeps it)
node -e "require('./brief/bin/lib/graphify.cjs'); console.log('graphify: OK');" || { echo "FAIL: graphify.cjs broken"; exit 1; }
```

5. Stage (commit happens in Task 3):
```bash
git status --short | head -30
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
[ -d brief ] || { echo "FAIL"; exit 1; }
[ ! -d get-shit-done ] || { echo "FAIL"; exit 1; }
[ -f brief/bin/brief-tools.cjs ] || { echo "FAIL"; exit 1; }
[ ! -f brief/bin/gsd-tools.cjs ] || { echo "FAIL"; exit 1; }
node -e "require(\"./brief/bin/lib/core.cjs\"); require(\"./brief/bin/lib/state.cjs\"); require(\"./brief/bin/lib/init.cjs\"); require(\"./brief/bin/lib/graphify.cjs\"); console.log(\"lib-intact: OK\");" || { echo "FAIL: lib broken"; exit 1; }
echo "OK: Task 1 verified"
'
    </automated>
  </verify>
  <done>
    - `brief/` directory exists and contains bin/, contexts/, references/, templates/, workflows/
    - `get-shit-done/` no longer exists
    - `brief/bin/brief-tools.cjs` exists; `brief/bin/gsd-tools.cjs` does not
    - `brief/bin/lib/core.cjs`, `state.cjs`, `init.cjs`, `graphify.cjs` all load successfully via `require()`
    - Changes staged, not yet committed
  </done>
</task>

<task type="auto">
  <name>Task 2: Update package.json — structural + descriptive fields (D-11 + checker WARNING #6)</name>
  <files>
    package.json
  </files>
  <read_first>
    - package.json (the actual file — read full content before editing)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (D-11 specifies `brief-cc` package name inheriting `-cc` suffix from GSD)
    - .planning/PROJECT.md (What This Is / Core Value — source for description phrasing)
    - .planning/REQUIREMENTS.md (FND-04 anchor for zero-deps assertion this task preserves)
  </read_first>
  <action>
From repo root `/Users/agent/GSD-for-Business`:

1. Read the full package.json first. The current state (verified at planning time):
```json
{
  "name": "get-shit-done-cc",
  "version": "1.36.0",
  "description": "A meta-prompting, context engineering and spec-driven development system for Claude Code, OpenCode, Gemini and Codex by TÂCHES.",
  "bin": { "get-shit-done-cc": "bin/install.js" },
  "files": [ "bin", "commands", "get-shit-done", "agents", "hooks", "scripts" ],
  "keywords": [ "claude", "claude-code", "ai", "meta-prompting", "context-engineering", "spec-driven-development", "gemini", "gemini-cli", "codex", "codex-cli" ],
  "author": "TÂCHES",
  "license": "MIT",
  "repository": { "type": "git", "url": "git+https://github.com/gsd-build/get-shit-done.git" },
  "homepage": "https://github.com/gsd-build/get-shit-done",
  "bugs": { "url": "https://github.com/gsd-build/get-shit-done/issues" },
  ...
  "scripts": {
    ...
    "test:coverage": "c8 --check-coverage --lines 70 --reporter text --include 'get-shit-done/bin/lib/*.cjs' --exclude 'tests/**' --all node scripts/run-tests.cjs"
  }
}
```

2. Apply these EXACT edits using the Edit tool (one string_replace per edit). Do them in this order to avoid partial state.

**2a. Structural edits (from pre-revision plan):**

a. Replace `"name": "get-shit-done-cc"` → `"name": "brief-cc"`

b. Replace the entire bin block:
   `"bin": {\n    "get-shit-done-cc": "bin/install.js"\n  },`
   →
   `"bin": {\n    "brief-cc": "bin/install.js"\n  },`

c. In the `files` array, replace `"get-shit-done"` → `"brief"`:
   `"files": [\n    "bin",\n    "commands",\n    "get-shit-done",\n    "agents",\n    "hooks",\n    "scripts"\n  ],`
   →
   `"files": [\n    "bin",\n    "commands",\n    "brief",\n    "agents",\n    "hooks",\n    "scripts"\n  ],`

d. In `scripts.test:coverage`, replace `--include 'get-shit-done/bin/lib/*.cjs'` → `--include 'brief/bin/lib/*.cjs'`.

**2b. Descriptive field edits (NEW per checker WARNING #6 — these were deferred in the pre-revision plan but would never be matched by Plan 05's substitution dictionary):**

e. Replace the `description` value. Find this exact line:
   `  "description": "A meta-prompting, context engineering and spec-driven development system for Claude Code, OpenCode, Gemini and Codex by TÂCHES.",`
   Replace with:
   `  "description": "Meta-prompting framework for business and product strategy planning across Claude Code, OpenCode, Gemini, and Codex. Hard fork of GSD — DEFINE, DISCOVER, DESIGN, DELIVER before engineering's PRD work begins.",`

f. Replace the `keywords` array. Find the exact array:
   `  "keywords": [\n    "claude",\n    "claude-code",\n    "ai",\n    "meta-prompting",\n    "context-engineering",\n    "spec-driven-development",\n    "gemini",\n    "gemini-cli",\n    "codex",\n    "codex-cli"\n  ],`
   Replace with:
   `  "keywords": [\n    "claude",\n    "claude-code",\n    "ai",\n    "meta-prompting",\n    "context-engineering",\n    "business-planning",\n    "strategy",\n    "prd",\n    "gemini",\n    "gemini-cli",\n    "codex",\n    "codex-cli"\n  ],`
   (removes `spec-driven-development`; adds `business-planning`, `strategy`, `prd`)

g. Update `author`. Per CONTEXT.md D-12/D-14, the BRIEF fork is by the same maintainer (swyoo@iotrust.kr owns this repo). Keep `"TÂCHES"` as it is the personal attribution string the owner used in GSD — changing to a BRIEF-specific attribution is a Phase 9 publishing decision, not a Phase 1 hygiene item. No edit needed unless the user has requested otherwise; verify the value is still present and do not modify.

h. Replace the repository URL. Find:
   `    "url": "git+https://github.com/gsd-build/get-shit-done.git"`
   Replace with:
   `    "url": "git+https://github.com/brief-build/brief.git"`
   (Placeholder — see ASSUMPTIONS.md entry `A-REPO` recorded by Plan 06 Task 1. Do NOT publish to npm until this placeholder is resolved in Phase 9.)

i. Replace the homepage URL. Find:
   `  "homepage": "https://github.com/gsd-build/get-shit-done",`
   Replace with:
   `  "homepage": "https://github.com/brief-build/brief",`

j. Replace the bugs URL. Find:
   `    "url": "https://github.com/gsd-build/get-shit-done/issues"`
   Replace with:
   `    "url": "https://github.com/brief-build/brief/issues"`

3. Verify the JSON is still valid and BRIEF-domain:
```bash
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json: valid JSON');"
# Structural checks:
node -e "const p=require('./package.json'); console.log('name:', p.name); console.log('bin:', Object.keys(p.bin).join(',')); console.log('files contains brief:', p.files.includes('brief'));"
# Descriptive checks:
node -e "const p=require('./package.json'); console.log('description:', p.description); console.log('keywords:', p.keywords.join(',')); console.log('repo:', p.repository.url); console.log('homepage:', p.homepage); console.log('bugs:', p.bugs.url);"
# Must NOT contain 'spec-driven development' or 'gsd-build/get-shit-done'
! grep -q "spec-driven development" package.json || { echo "FAIL: description residue"; exit 1; }
! grep -q "gsd-build/get-shit-done" package.json || { echo "FAIL: URL residue"; exit 1; }
! grep -q "\"get-shit-done-cc\"" package.json || { echo "FAIL: name residue"; exit 1; }
```

4. Re-verify zero dependencies (FND-04 hint anchor — the actual verification is recorded in Plan 06, but quick sanity-check here):
```bash
node -e "console.log('deps:', Object.keys(require('./package.json').dependencies || {}).length)"
# Expect: deps: 0
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
# Valid JSON
node -e "JSON.parse(require(\"fs\").readFileSync(\"package.json\",\"utf8\"));" || { echo "FAIL: invalid JSON"; exit 1; }
# Structural fields
NAME=$(node -e "console.log(require(\"./package.json\").name)")
[ "$NAME" = "brief-cc" ] || { echo "FAIL: name=$NAME"; exit 1; }
BIN=$(node -e "console.log(Object.keys(require(\"./package.json\").bin).join(\",\"))")
[ "$BIN" = "brief-cc" ] || { echo "FAIL: bin=$BIN"; exit 1; }
HAS_BRIEF=$(node -e "console.log(require(\"./package.json\").files.includes(\"brief\"))")
[ "$HAS_BRIEF" = "true" ] || { echo "FAIL: files does not include brief"; exit 1; }
HAS_GSD=$(node -e "console.log(require(\"./package.json\").files.includes(\"get-shit-done\"))")
[ "$HAS_GSD" = "false" ] || { echo "FAIL: files still includes get-shit-done"; exit 1; }
# Coverage script updated
grep -q "brief/bin/lib/\*.cjs" package.json || { echo "FAIL: coverage path not updated"; exit 1; }
! grep -q "get-shit-done/bin/lib/\*.cjs" package.json || { echo "FAIL: old coverage path remains"; exit 1; }
# Descriptive fields — BRIEF domain only, no GSD leftovers
! grep -qi "spec-driven development" package.json || { echo "FAIL: description GSD residue"; exit 1; }
! grep -q "gsd-build/get-shit-done" package.json || { echo "FAIL: URL GSD residue"; exit 1; }
! grep -q "\"spec-driven-development\"" package.json || { echo "FAIL: keywords GSD residue"; exit 1; }
# BRIEF-domain markers present
grep -qi "business" package.json || { echo "FAIL: description missing business-domain wording"; exit 1; }
grep -q "\"business-planning\"" package.json || { echo "FAIL: keywords missing business-planning"; exit 1; }
grep -q "brief-build/brief" package.json || { echo "FAIL: repo URL not BRIEF"; exit 1; }
# Zero deps preserved (A1)
DEPS=$(node -e "console.log(Object.keys(require(\"./package.json\").dependencies || {}).length)")
[ "$DEPS" = "0" ] || { echo "FAIL: dependencies not empty, got $DEPS"; exit 1; }
echo "OK: Task 2 verified (structural + descriptive fields)"
'
    </automated>
  </verify>
  <done>
    - `package.json` has `"name": "brief-cc"`
    - `package.json` bin key is `"brief-cc"` pointing at `bin/install.js`
    - `package.json` files array includes `"brief"` and does NOT include `"get-shit-done"`
    - `scripts.test:coverage` references `brief/bin/lib/*.cjs` (not `get-shit-done/bin/lib/*.cjs`)
    - `description` field describes BRIEF (business/product strategy planning), not GSD (spec-driven development)
    - `keywords` array contains `business-planning`, `strategy`, `prd`; does NOT contain `spec-driven-development`
    - `repository.url`, `homepage`, `bugs.url` all point at `brief-build/brief` (placeholder; Phase 9 may retarget)
    - `author` preserved (fork-maintainer attribution; publishing decision deferred to Phase 9)
    - `package.json` remains valid JSON
    - `dependencies` is still empty (A1 preserved)
  </done>
</task>

<task type="auto">
  <name>Task 3: Commit internal rename (commit 4 of 6)</name>
  <files>
    (staged changes from Tasks 1 and 2)
  </files>
  <read_first>
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (D-08 commit 4 message: `refactor(rename): brief-* internal directory + binary rename (get-shit-done/, gsd-tools.cjs)`; D-10 Conventional Commits)
  </read_first>
  <action>
From repo root `/Users/agent/GSD-for-Business`:

1. Inspect staged changes:
```bash
git status --short | head -40
git diff --cached --stat | tail -5
# Expected: ~hundred+ files affected by dir rename (git shows every moved file)
```

2. Commit (Conventional Commits per D-10):
```bash
node brief/bin/brief-tools.cjs commit "refactor(01-rename): brief-* internal directory + binary rename + package.json BRIEF identity (FND-03 part 2)" --files $(git diff --cached --name-only | tr '\n' ' ')
```
The binary is at its new name now — the commit command uses `brief/bin/brief-tools.cjs`, NOT the old path.

If `brief-tools.cjs commit` fails (e.g., because the .cjs still has internal references to old paths — those are Plan 05 scope), fall back to plain:
```bash
git commit -m "refactor(01-rename): brief-* internal directory + binary rename + package.json BRIEF identity (FND-03 part 2)"
```

3. Buildability re-check:
```bash
node -e "require('./brief/bin/lib/core.cjs'); console.log('core: OK post-commit');"
node -e "require('./brief/bin/lib/state.cjs'); console.log('state: OK post-commit');"
node -e "require('./brief/bin/lib/init.cjs'); console.log('init: OK post-commit');"
node -e "require('./brief/bin/lib/graphify.cjs'); console.log('graphify: OK post-commit');"
```

4. Confirm commit:
```bash
git log -1 --oneline
# Expect: <hash> refactor(01-rename): brief-* internal directory + binary rename + package.json BRIEF identity (FND-03 part 2)
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
git log -1 --format="%s" | grep -qE "refactor\(01-rename\).*internal directory" || { echo "FAIL: commit message"; exit 1; }
[ -d brief ] && [ ! -d get-shit-done ] || { echo "FAIL: dir state"; exit 1; }
[ -f brief/bin/brief-tools.cjs ] && [ ! -f brief/bin/gsd-tools.cjs ] || { echo "FAIL: binary state"; exit 1; }
NAME=$(node -e "console.log(require(\"./package.json\").name)")
[ "$NAME" = "brief-cc" ] || { echo "FAIL: package name"; exit 1; }
# Descriptive fields from Task 2 survived the commit
! grep -qi "spec-driven development" package.json || { echo "FAIL: description GSD residue post-commit"; exit 1; }
! grep -q "gsd-build/get-shit-done" package.json || { echo "FAIL: URL GSD residue post-commit"; exit 1; }
node -e "require(\"./brief/bin/lib/core.cjs\");" || { echo "FAIL: lib broken"; exit 1; }
echo "OK: commit 4 verified"
'
    </automated>
  </verify>
  <done>
    - Exactly one new commit on `main` with message `refactor(01-rename): brief-* internal directory + binary rename + package.json BRIEF identity (FND-03 part 2)`
    - All changes from Tasks 1 and 2 consolidated in this single commit (per D-08 atomic-commit rule)
    - Lib layer still loads post-commit (core, state, init, graphify)
    - `brief/bin/brief-tools.cjs` is the new entry point
    - `package.json` fully reflects BRIEF (structural + descriptive fields) — no GSD leftovers
    - Repo in buildable state per D-09 (text-references to old paths still exist in .md/.cjs — Plan 05 fixes those)
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Filesystem paths ↔ git tracked rename | `git mv` preserves the rename both for the dir and the binary. |
| package.json ↔ npm registry | Until BRIEF is actually published to npm (Phase 9 concern), `package.json` changes have no external trust impact. |
| package.json descriptive fields ↔ public perception | If BRIEF is accidentally published mid-phase (shouldn't happen; `npm publish` is a manual step), the GSD-domain description would misrepresent the project. Task 2 eliminates this risk by rewriting descriptive fields in Phase 1. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-01-07 | T (Tampering) | Hard-coded absolute path inside a .cjs file (e.g., `__dirname + '/../../get-shit-done/'`) breaks silently | mitigate | Plan 05 scope: grep `.cjs` files for any `get-shit-done` path references. Buildability gate in this plan catches any synchronous require() failures — verified with explicit `node -e require()` checks. |
| T-01-08 | D (DoS) | Test suite fails post-rename because tests hard-code `get-shit-done/bin/lib/...` paths | accept | Plan 05 fixes text references in test source files. Until then, tests referencing old paths will fail — that's an expected intermediate state. Buildability per D-09 is module-load, not full test-pass. |
| T-01-09 | E (Elevation of Privilege) | None — no privilege boundary changes | accept | Phase 1 does not introduce or relax any privilege gates. |
| T-01-21 | I (Information Disclosure) | Placeholder URLs (`brief-build/brief`) in package.json resolve to a non-existent repo; users who click through get a 404 | accept | No actual BRIEF install is happening in Phase 1 (no `npm publish` step). Phase 9 publishing work replaces the placeholder with the real URL. Documented as ASSUMPTIONS.md entry `A-REPO` (recorded by Plan 06 Task 1; STATUS: PLACEHOLDER — Phase 9 resolves before any npm publish). |

Phase 1 still adds zero new attack surface.
</threat_model>

<verification>
1. `get-shit-done/` absent, `brief/` present: `[ -d brief ] && [ ! -d get-shit-done ]`.
2. `gsd-tools.cjs` absent, `brief-tools.cjs` present: `[ -f brief/bin/brief-tools.cjs ] && [ ! -f brief/bin/gsd-tools.cjs ]`.
3. `package.json` structural fields: name=brief-cc, bin.brief-cc=bin/install.js, files contains "brief" not "get-shit-done", coverage path updated.
4. `package.json` descriptive fields: description mentions BRIEF + business/strategy (not "spec-driven development"); keywords contain `business-planning` + `strategy` + `prd` (not `spec-driven-development`); repository.url, homepage, bugs.url all point at `brief-build/brief`.
5. Lib loads: `node -e "require('./brief/bin/lib/core.cjs')"` exits 0 (core, state, init, graphify).
6. A1 holds: `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` prints 0.
7. Commit message: `refactor(01-rename): brief-* internal directory + binary rename + package.json BRIEF identity (FND-03 part 2)`.
8. `grep` for GSD residues in package.json returns zero matches across: `spec-driven development`, `spec-driven-development`, `gsd-build/get-shit-done`, `"get-shit-done-cc"`.
</verification>

<success_criteria>
- [ ] Directory rename `get-shit-done/` → `brief/` via `git mv`
- [ ] Binary rename `gsd-tools.cjs` → `brief-tools.cjs` via `git mv`
- [ ] `package.json` structural fields updated: name=`brief-cc`, bin key=`brief-cc`, files array references `brief` not `get-shit-done`, coverage path points at `brief/bin/lib/*.cjs`
- [ ] `package.json` descriptive fields updated (checker WARNING #6): description is BRIEF-domain; keywords include `business-planning`+`strategy`+`prd` and drop `spec-driven-development`; repository.url, homepage, bugs.url point at a BRIEF placeholder (`brief-build/brief`)
- [ ] Lib layer still loads (`require('./brief/bin/lib/core.cjs')`, state, init, graphify all succeed)
- [ ] Exactly one atomic commit per D-08 commit 4
- [ ] A1 preserved (dependencies still empty — zero-runtime-deps rule holds)
- [ ] Repo in buildable state per D-09
- [ ] FND-03 part 2 advanced (part 3 — text references inside .md/.cjs — is Plan 05's scope)
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-04-SUMMARY.md` recording:
- Structural package.json values (name, bin, files, test:coverage path)
- Descriptive package.json values (description, keywords, repository.url, homepage, bugs.url)
- Lib-load verification (core, state, init, graphify)
- Note of placeholder URL strategy: `brief-build/brief` is a stand-in resolved in Phase 9 publishing
- Any surprises (e.g., unexpected hard-coded `get-shit-done/` strings inside .cjs files — enumerated for Plan 05)
</output>
</content>
