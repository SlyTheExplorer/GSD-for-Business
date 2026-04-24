---
phase: 06-bidirectional-foundation-phase-1-2-return-stack
reviewed: 2026-04-23T00:00:00Z
depth: standard
files_reviewed: 23
files_reviewed_list:
  - agents/brief-gap-detector.md
  - brief/bin/brief-tools.cjs
  - brief/bin/lib/gap-detect-report.cjs
  - brief/bin/lib/gap-detect.cjs
  - brief/bin/lib/status.cjs
  - brief/references/gap-detect-vocabulary.md
  - brief/workflows/align-gate.md
  - brief/workflows/discover.md
  - brief/workflows/gap-detect.md
  - tests/brief-discover-resume-on-invocation.test.cjs
  - tests/brief-gap-detect-blocking.test.cjs
  - tests/brief-gap-detect-canary-e2e.test.cjs
  - tests/brief-gap-detect-count-iterations.test.cjs
  - tests/brief-gap-detect-frame-pop-requires-align.test.cjs
  - tests/brief-gap-detect-history-immutable.test.cjs
  - tests/brief-gap-detect-iteration-2-meta-arbiter.test.cjs
  - tests/brief-gap-detect-iteration-3-hard-cap.test.cjs
  - tests/brief-gap-detect-material-only.test.cjs
  - tests/brief-gap-detect-nice-to-have-dropped.test.cjs
  - tests/brief-gap-detect-no-hook.test.cjs
  - tests/brief-gap-detect-no-new-command.test.cjs
  - tests/brief-gap-detect-severity-routing.test.cjs
  - tests/brief-gap-detect-sibling-filename.test.cjs
  - tests/brief-gap-detect-state-roundtrip.test.cjs
  - tests/brief-gap-detect-text-mode.test.cjs
  - tests/brief-gap-detect-topic-fingerprint-slug.test.cjs
  - tests/brief-gap-detect-vocabulary-lock.test.cjs
  - tests/brief-return-stack-derived-count.test.cjs
  - tests/brief-return-stack-status-render.test.cjs
findings:
  critical: 0
  warning: 5
  info: 10
  total: 15
status: issues_found
---

# Phase 6: Code Review Report

**Reviewed:** 2026-04-23T00:00:00Z
**Depth:** standard
**Files Reviewed:** 23 (core: 3 .cjs + 1 dispatcher section + 4 markdown; tests: 19 + 1 reference)
**Status:** issues_found

## Summary

Phase 6 ships the bidirectional return-stack foundation: a 404-line `gap-detect.cjs` with
13 exported primitives (LIFO stack push/pop, topic fingerprint validation, iteration
counting, severity routing, dual-condition pop, assumption write), a 103-line
`gap-detect-report.cjs` renderer, a 166-line `status.cjs` extension, a new
`gap-detect` dispatcher case in `brief-tools.cjs`, and three workflow/agent markdowns.

The architecture is tight: append-only `return_stack_history` invariant is structurally
enforced by a grep-audit test, path-traversal guards mirror the Phase 5 AUDIENCE
precedent, the severity-routing branches are mechanically parallel to the decision
mechanism, and the STRIDE threat-model IDs (T-06-03-01 through T-06-04-05) are
cross-referenced inline. Test coverage is genuinely strong — 19 test files exercise
every primitive across unit, round-trip, structural, and E2E layers.

Five `warning`-level issues cluster around input-sanitization depth and doc/code drift:
the sanitizeForPrompt helper does not escape markdown-destructive sequences (newlines,
`---` frontmatter delimiters), the `FINGERPRINT_RE` source regex diverges from its
documented contract, and the `push-frame` dispatcher bypasses `_resolveSafePath` on the
verdict path. Ten `info`-level observations cover defense-in-depth suggestions, dev-time
traceability gaps, and minor observability improvements.

No critical (security-breaking or data-loss) issues found. Planning-artifact tests
(`brief-gap-detect-canary-e2e` + `brief-gap-detect-vocabulary-lock`) are skipped from
deep review per the in-file rationale ("dev-authored test data — skip deep review").

## Warnings

### WR-01: Fingerprint regex diverges from documented contract

**File:** `brief/bin/lib/gap-detect.cjs:34`
**Also impacts:** `brief/references/gap-detect-vocabulary.md:29`, `agents/brief-gap-detector.md:166`
**Issue:** The code-level `FINGERPRINT_RE` is
`/^[a-z][a-z0-9]*(-[a-z0-9]+){2,7}$/` (alphanumeric after first char, per the
Plan 06-04 broadening documented inline at line 31-33). However, both the agent
prompt (agents/brief-gap-detector.md:166) and the vocabulary reference
(brief/references/gap-detect-vocabulary.md:29) still assert the regex as
`^[a-z]+(-[a-z]+){2,7}$` (alpha-only tokens, the earlier Plan 06-03 form). An agent
following the documented regex strictly will emit valid slugs that pass code
validation (no digits → subset of the looser regex), but an agent reviewing the
canonical example `regulatory-citation-pipa-article-28` against the documented
regex will conclude it violates the contract (the trailing `28` is numeric, which
the documented regex rejects). This is a Pitfall #7 mitigation risk: the three
places that must agree on the contract disagree.

**Fix:** Update both doc files to match the code:

```diff
- lowercase-kebab-case regex: `^[a-z]+(-[a-z]+){2,7}$`
+ lowercase-kebab-case regex: `^[a-z][a-z0-9]*(-[a-z0-9]+){2,7}$` (first char alpha; subsequent tokens alphanumeric)
```

Apply in `brief/references/gap-detect-vocabulary.md:29` and
`agents/brief-gap-detector.md:166`.

### WR-02: `writeAssumption` does not escape markdown-destructive sequences in justification

**File:** `brief/bin/lib/gap-detect.cjs:251-264`
**Issue:** `writeAssumption` calls `sanitizeForPrompt(justification)` to defuse
`<system>` / `[INST]` / `<<SYS>>` markers (security.cjs:237-258) but does NOT strip
newlines, `---` frontmatter delimiters, or markdown heading markers. The sanitized
string is then embedded directly into an OBJECTIVES.md bullet:

```js
const bullet = `- [${at}] workstream=${workstream} | fingerprint=${topic_fingerprint}\n  > ${sanitized}`;
```

A meta-arbiter user typing a justification like:

```
Accepted per pilot customer.
  > close blockquote

---
malicious_key: yaml_value
---

## Injected Assumptions
- fake bullet appended under a synthetic section
```

will (a) prematurely terminate the block quote, (b) introduce a new `---` block that
the NEXT `extractFrontmatter` read of OBJECTIVES.md may treat as frontmatter if the
prior frontmatter stripping logic does not fully consume it, and (c) create a phantom
`## Injected Assumptions` heading that tests and downstream readers grep for. The
T-06-03-03 threat model at gap-detect.cjs:10 says "sanitizeForPrompt before STATE.md
write" — the STATE.md write is safe because `reconstructFrontmatter` YAML-serializes
the string (quoted), but the OBJECTIVES.md body write is raw markdown
interpolation. No test covers this (brief-gap-detect-state-roundtrip.test.cjs:303
exercises only the happy path "Confirmed with pilot customer that...").

**Fix:** Escape markdown structural characters before embedding in the bullet:

```js
function sanitizeForMarkdown(text) {
  // Strip newlines (single-line bullet body), escape `---` delimiters, neutralize
  // leading `#` headings at line start.
  return text
    .replace(/\r?\n+/g, ' ')
    .replace(/^(\s*)#{1,6}\s/gm, '$1\\# ')
    .replace(/^---\s*$/gm, '\\-\\-\\-');
}

const bullet = `- [${at}] workstream=${workstream} | fingerprint=${topic_fingerprint}\n  > ${sanitizeForMarkdown(sanitized)}`;
```

Add a regression test using a justification containing `\n\n---\n# Heading\n`.

### WR-03: `push-frame` dispatcher subcommand bypasses `_resolveSafePath` on verdict path

**File:** `brief/bin/brief-tools.cjs:713-714`
**Issue:** The `push-frame` subcommand reads the verdict file via direct
`fs.readFileSync(verdictPath, 'utf-8')`:

```js
if (sub === 'push-frame') {
  const verdictPath = gdVIdx !== -1 ? args[gdVIdx + 1] : null;
  ...
  try {
    const verdict = JSON.parse(require('fs').readFileSync(verdictPath, 'utf-8'));
```

This bypasses the `_resolveSafePath(cwd, opts.verdictPath)` guard that
`commitGapDetectVerdict` (gap-detect.cjs:322) applies. A malicious or careless
invocation — `brief-tools gap-detect push-frame --verdict /etc/passwd --artifact
.planning/x.md --workstream ws` — will try to read `/etc/passwd`, fail on JSON parse,
then surface `err.message` through `core.error`. T-06-03-06 ("path-agnostic errors")
says error messages must not leak absolute paths from outside `.planning/`, but the
error bubbles up via the try/catch at line 736 with the absolute path embedded.

**Fix:** Wrap the verdict path through `_resolveSafePath` or delegate to a library
function that does. The simplest fix is to require-gate the verdict via a
`gapDetect.pushFrameFromVerdict(cwd, { verdictPath, artifactPath, workstream, pausedPhase })`
wrapper in gap-detect.cjs that applies `_resolveSafePath` internally. Example:

```js
// In gap-detect.cjs — add:
function pushFrameFromVerdict(cwd, opts) {
  const verdictPath = _resolveSafePath(cwd, opts.verdictPath);
  const artifactPath = _resolveSafePath(cwd, opts.artifactPath);
  const verdict = JSON.parse(fs.readFileSync(verdictPath, 'utf-8'));
  const err = validateVerdict(verdict);
  if (err) throw new Error(`push-frame verdict invalid: ${err}`);
  const first = (verdict.findings || []).find((f) => f.severity === 'blocking');
  if (!first) throw new Error('no blocking finding in verdict — push-frame refused');
  pushReturnFrame(cwd, {
    paused_phase: opts.pausedPhase || '07',
    paused_workstream: opts.workstream,
    paused_artifact: opts.artifactPath,
    gap_text: first.description,
    triggering_topic: first.description.slice(0, 60),
    topic_fingerprint: first.topic_fingerprint,
    pushed_at: new Date().toISOString(),
  });
  return { framePushed: true, topic_fingerprint: first.topic_fingerprint,
           triggering_topic: first.description.slice(0, 60) };
}

// In brief-tools.cjs — replace the `if (sub === 'push-frame')` branch body with:
const result = gapDetect.pushFrameFromVerdict(cwd, {
  verdictPath, artifactPath, workstream, pausedPhase,
});
core.output(result, raw, `RETURNED-TO-DISCOVER\n...`);
```

### WR-04: `writeAssumption` silently no-ops when OBJECTIVES.md is missing

**File:** `brief/bin/lib/gap-detect.cjs:255-265`
**Issue:** The OBJECTIVES.md append is gated by `if (fs.existsSync(objPath))`.
If the file is missing, the function skips the write entirely, then writes only to
`state.brief.last_gate_results.gap_detect.assumption_log[]` at line 268-275, and
returns `{ at, sanitized }` as if everything succeeded. The caller has no signal
that the user's assumption was partially persisted. The D-08 contract documented
at `brief/workflows/gap-detect.md:218-221` promises "Write assumption to
`.planning/OBJECTIVES.md` under `## Assumptions` + log audit entry in
state.brief.last_gate_results.gap_detect.assumption_log[]" — when OBJECTIVES.md is
absent, only half of that happens, silently. Test coverage misses this case.

**Fix:** Choose one of:

(a) Create OBJECTIVES.md if missing (heavy-handed but explicit):

```js
if (!fs.existsSync(objPath)) {
  atomicWriteFileSync(objPath, `# OBJECTIVES\n\n## Assumptions\n\n${bullet}\n`, 'utf-8');
} else {
  let content = fs.readFileSync(objPath, 'utf-8');
  // ... existing logic ...
}
```

(b) Throw to surface the invariant violation:

```js
if (!fs.existsSync(objPath)) {
  throw new Error(`writeAssumption: OBJECTIVES.md not found at ${objPath}; cannot persist assumption to #Assumptions section`);
}
```

(c) Return a signal to the caller:

```js
let objectivesWritten = false;
if (fs.existsSync(objPath)) {
  // ... existing logic ...
  objectivesWritten = true;
}
// ... state log write ...
return { at, sanitized, objectivesWritten };
```

Option (b) is most consistent with BRIEF's fail-loud discipline. Add a regression
test that calls `writeAssumption` without OBJECTIVES.md present.

### WR-05: `maybePopTopFrame` conflates path-traversal throw with "file not found"

**File:** `brief/bin/lib/gap-detect.cjs:173-177`
**Issue:** The try/catch around `fs.statSync(_resolveSafePath(cwd, top.paused_artifact))`
catches ALL errors and silently sets `artifactWritten = false`:

```js
try {
  const st = fs.statSync(_resolveSafePath(cwd, top.paused_artifact));
  artifactWritten = st.mtimeMs > Date.parse(top.pushed_at);
} catch { artifactWritten = false; }
```

If `top.paused_artifact` has been tampered with (e.g., STATE.md hand-edited to
`"../../etc/passwd"`), `_resolveSafePath` throws "path traversal refused: ..." —
caught here and converted to "no artifact write, skip pop." The frame is then
permanently stuck on the stack (no user-visible diagnostic), and `/brief-status`
continues to display a Gap loop row that can never be resolved via the D-11
dual-condition path. Also, if `top.paused_artifact` is `undefined` (malformed
frame), `path.resolve(cwd, undefined)` throws TypeError — same silent result.

**Fix:** Distinguish "invariant violation" from "file not yet rewritten":

```js
let artifactWritten = false;
if (typeof top.paused_artifact !== 'string' || top.paused_artifact.length === 0) {
  throw new Error(`maybePopTopFrame: corrupt top frame — paused_artifact must be non-empty string`);
}
try {
  const safePath = _resolveSafePath(cwd, top.paused_artifact);
  try {
    const st = fs.statSync(safePath);
    artifactWritten = st.mtimeMs > Date.parse(top.pushed_at);
  } catch { artifactWritten = false; /* file not yet rewritten — expected */ }
} catch (e) {
  // path traversal refused — invariant violation, not a normal miss
  throw new Error(`maybePopTopFrame: paused_artifact outside .planning/ — ${e.message}`);
}
if (!artifactWritten) return content;
```

## Info

### IN-01: `writeAssumption` doesn't re-validate workstream/topic_fingerprint at library layer

**File:** `brief/bin/lib/gap-detect.cjs:237-249`
**Issue:** `writeAssumption` validates that `workstream` and `topic_fingerprint` are
non-empty strings but does NOT call `validateFingerprint(topic_fingerprint)` or
match `workstream` against `^[a-zA-Z0-9_-]+$`. The dispatcher at
`brief-tools.cjs:282` does validate workstream, but library-direct callers (tests,
future workflows) could pass `workstream = 'evil/../injection'` and it would land
in STATE.md state log. This defense-in-depth hole is a low risk today (only one
dispatcher caller), but the library interface should not assume caller discipline.

**Fix:** Add at line 247:

```js
if (!/^[a-zA-Z0-9_-]+$/.test(workstream)) {
  throw new Error('writeAssumption: workstream must match ^[a-zA-Z0-9_-]+$');
}
const fpErr = validateFingerprint(topic_fingerprint);
if (fpErr) throw new Error(`writeAssumption: invalid topic_fingerprint: ${fpErr}`);
```

### IN-02: `pushReturnFrame` does not enforce the documented "N/3" stack-depth cap

**File:** `brief/bin/lib/gap-detect.cjs:94-119`
**Issue:** `/brief-status` displays `Return stack    {N} / 3` (status.cjs:144),
suggesting a depth-3 cap, but the library never enforces it. A buggy orchestrator
or corrupted STATE.md could push a 4th frame without triggering any guard. The
D-07 hard-cap (at iteration-count 2) is a separate guard — it concerns per-topic
round-trip count, not total stack depth.

**Fix:** Choose one:

(a) Document in the function comment that "3" is a UI-only convention:

```js
// pushReturnFrame — atomic dual-array write. NOTE: /brief-status displays
// "N / 3" but 3 is a UI convention only; the library does not enforce depth.
```

(b) Enforce depth as a defensive posture:

```js
if (!Array.isArray(brief.return_stack)) brief.return_stack = [];
if (brief.return_stack.length >= 3) {
  throw new Error('pushReturnFrame: return_stack depth already 3; Phase 6 D-07 hard-cap should prevent this');
}
```

### IN-03: `commitGapDetectVerdict` drops N-1 blocking findings when N > 1

**File:** `brief/bin/lib/gap-detect.cjs:350-362`
**Issue:** On GAPS-BLOCKING with multiple blocking findings,
`commitGapDetectVerdict` takes only `blockingFindings[0]` to construct the frame.
The other blocking findings are rendered into the sibling `.gaps.md` and counted
in severity_counts, but there's no state-level tracking that they exist. D-03
("BLOCKING → push frame") is silent on N-to-1 mapping; in practice agents usually
emit one blocking finding per verdict, but nothing in the agent prompt forces
this. The return value `{ framePushed: boolean }` boolean-collapses N≥1 into
"pushed one".

**Fix:** Either (a) document the "first-blocking-wins" policy explicitly in the
function docstring, or (b) aggregate all blocking findings into the frame:

```js
if (verdict.decision === 'GAPS-BLOCKING' && pushFrame && blockingFindings.length > 0 && !override) {
  const first = blockingFindings[0];
  const aggregatedGap = blockingFindings.map((f) => f.description).join('\n\n---\n\n');
  pushReturnFrame(cwd, {
    // ... existing fields ...
    gap_text: aggregatedGap,  // was: first.description
    triggering_topic: first.description.slice(0, 60),
    topic_fingerprint: first.topic_fingerprint,
    // consider: extra_blocking_fingerprints: blockingFindings.slice(1).map(f => f.topic_fingerprint),
  });
}
return { ..., blockingFindingsPushed: 1, blockingFindingsDropped: blockingFindings.length - 1 };
```

### IN-04: `commitGapDetectVerdict` finally-block swallows unlink errors silently

**File:** `brief/bin/lib/gap-detect.cjs:391-393`
**Issue:** The tmp-verdict cleanup in the finally block uses
`try { fs.unlinkSync(verdictPath); } catch { /* already deleted */ }`. This is
safe for the "already deleted" case, but it also swallows EACCES, EBUSY,
and ENOTDIR errors. If the tmp dir has permission issues, the file containing a
sanitized override reason (potentially sensitive) lingers on disk without any
log or warning. T-06 threat model treats verdict cleanup as defense against
information-disclosure — a silent failure defeats the intent.

**Fix:** Log non-ENOENT errors but don't throw:

```js
} finally {
  try {
    fs.unlinkSync(verdictPath);
  } catch (e) {
    if (e && e.code !== 'ENOENT') {
      // Non-silent, non-throwing: surface via stderr so orchestrator sees it
      try { process.stderr.write(`WARN: tmp verdict cleanup failed: ${e.code}\n`); } catch {}
    }
  }
}
```

### IN-05: `writeAssumption` OBJECTIVES.md section detection is fragile

**File:** `brief/bin/lib/gap-detect.cjs:259-263`
**Issue:** The section-exists check uses `/^## Assumptions\b/m`. The `\b`
terminates on any non-word boundary, so `## Assumptions (draft)` matches
(good). But `### Assumptions` (H3) does NOT match the H2-anchored regex, so a
user who created `### Assumptions` manually will get a NEW `## Assumptions`
section appended at the end, and the function will never find the H3 version
again on subsequent calls — duplicate sections accumulate.

**Fix:** Expand the regex to tolerate H2/H3 and normalize:

```js
if (/^###?\s+Assumptions\b/m.test(content)) {
  // Match the first existing section regardless of H2/H3
  content = content.replace(/^(###?\s+Assumptions\b[^\n]*\n)/m, `$1\n${bullet}\n`);
} else {
  content = content.trimEnd() + `\n\n## Assumptions\n\n${bullet}\n`;
}
```

### IN-06: `status.cjs` does not sanitize `triggering_topic` before rendering

**File:** `brief/bin/lib/status.cjs:120-123`
**Issue:** `activeTopic` is read from `topFrame.triggering_topic`, which upstream
is a `.slice(0, 60)` of a blocking finding's description (brief-tools.cjs:722 or
gap-detect.cjs:356). If an agent emits a description containing ANSI escape
sequences (`\x1b[31m...`) or control characters (`\r\n`), those surface in
`/brief-status` dashboard output. Agent output is not adversarial input in
practice, but `validateVerdict` only type-checks `description` as a string — no
character-class filter. Low-severity because `triggering_topic` is also what
discover.md Step 0.5 displays in a prompt, so a defensive pass benefits both
render sites.

**Fix:** Add a narrow sanitizer for display surfaces:

```js
function sanitizeDisplayText(s) {
  if (typeof s !== 'string') return '—';
  // Strip ANSI escape sequences + control chars (except tab), truncate to 60 chars.
  return s.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
          .replace(/[\x00-\x08\x0B-\x1F\x7F]/g, '')
          .slice(0, 60)
          .trim() || '—';
}
const activeTopic = sanitizeDisplayText(topFrame && topFrame.triggering_topic);
```

### IN-07: `_canonicalize` has no traversal-depth guard

**File:** `brief/bin/lib/gap-detect.cjs:125-132`
**Issue:** `_canonicalize` walks up the directory tree with
`while (cur && cur !== path.dirname(cur))` until `realpathSync` succeeds. On a
fully-nonexistent deep path (`/a/b/c/d/e/...`), it iterates N times where N is the
path depth. Not a performance issue in normal use (most ancestors exist), but
unbounded loops on user-supplied input are a code smell.

**Fix:** Cap at a reasonable depth:

```js
function _canonicalize(p) {
  let cur = p;
  let i = 0;
  const MAX_ASCENT = 64;  // absurd depth cap
  while (cur && cur !== path.dirname(cur) && i < MAX_ASCENT) {
    try { return path.join(fs.realpathSync(cur), path.relative(cur, p)); }
    catch { cur = path.dirname(cur); i += 1; }
  }
  return p;
}
```

### IN-08: `writeAssumption` does not guard against `$1`-style regex replace collisions

**File:** `brief/bin/lib/gap-detect.cjs:260`
**Issue:** `content.replace(/^(## Assumptions\b[^\n]*\n)/m, `$1\n${bullet}\n`)`
uses a template literal for the replacement string. If `bullet` contains a
literal `$1` (unlikely — workstream matches `^[a-zA-Z0-9_-]+$` so no `$`, but
`justification` is sanitized and embedded directly), the String.replace engine
would interpret it as a back-reference. `sanitizeForPrompt` does not strip `$`,
so a crafted justification like `"$1$&$'$&"` would distort the output.

**Fix:** Use a replacer function instead of a template string to disable
back-reference interpretation:

```js
content = content.replace(/^(## Assumptions\b[^\n]*\n)/m, (_match, prefix) => `${prefix}\n${bullet}\n`);
```

### IN-09: Vocabulary-lock test filter for `BAN_*` constants is too loose

**File:** `tests/brief-gap-detect-vocabulary-lock.test.cjs:103-106`
**Issue:** The filter strips lines matching `/BAN_(EN|KO|SYMBOL)/`, which is
correct for the BAN_EN regex definition line in gap-detect.cjs. But any stray
comment containing both a ban-token AND the string `BAN_EN` (e.g.,
`// BAN_EN example: 'compliant'`) would be silently excluded from the audit.
Current source is clean, but the filter is wider than necessary.

**Fix:** Match only constant-definition lines:

```js
const libFiltered = libContent
  .split('\n')
  .filter((l) => !/^const BAN_(EN|KO|SYMBOL)\s*=/.test(l))
  .join('\n');
```

### IN-10: Grep-audit for `return_stack_history.pop/shift/splice` misses destructuring

**File:** `tests/brief-gap-detect-history-immutable.test.cjs:34-47`
**Issue:** The append-only invariant test checks for
`return_stack_history.(pop|shift|splice)` and
`return_stack_history[digit] =` assignments. It does NOT catch destructuring
reassignment like `brief.return_stack_history = [...brief.return_stack_history.slice(1)]`
or `Object.assign(brief, { return_stack_history: [] })`. A future regression
could bypass the grep. Current code is clean; this is a preventative tightening.

**Fix:** Add a broader check:

```js
// Any direct reassignment of return_stack_history to a shorter array.
// This is harder to detect syntactically — consider an AST-based check, or add:
const assignRe = /brief\.return_stack_history\s*=/g;
const assigns = src.match(assignRe) || [];
// Allow only the initialization `brief.return_stack_history = []` in pushReturnFrame.
assert.ok(assigns.length <= 1, `unexpected return_stack_history reassignment count: ${assigns.length}`);
```

---

## Notes on Scope

**Out-of-scope per review config:**
- Fixture JSON/markdown files under `tests/fixtures/gap-detect/` and
  `tests/fixtures/return-stack/` (dev-authored test data).
- Performance issues (Phase 6 scope excludes).

**Unreviewed in this pass (focus_hint boundary):**
- `brief/bin/brief-tools.cjs` outside the `case 'gap-detect'` block (lines 637-811).
  The parser logic (lines 187-226), cwd/ws resolution (lines 230-290), and other
  dispatcher cases were skipped per focus_hint's "Focus review on gap-detect.cjs,
  brief-tools.cjs dispatcher, and the workflow markdowns."
- Test helpers (`tests/helpers.cjs`) referenced by `brief-return-stack-status-render.test.cjs`.

**Strengths worth noting:**
- Append-only invariant enforced by grep-audit test (not just library discipline).
- Path-traversal guards applied consistently at `commitGapDetectVerdict` entry and
  `maybePopTopFrame` artifact read (though `push-frame` dispatcher skips it — WR-03).
- Defensive `_ensureMap` helper eliminates 12+ repetitive guard blocks.
- Frame push uses `JSON.parse(JSON.stringify(frame))` deep copy to prevent caller
  mutation; test coverage asserts this at
  `brief-gap-detect-topic-fingerprint-slug.test.cjs:230`.
- STRIDE threat-model IDs cross-referenced inline at each mitigation site.
- Vocabulary-lock test applies filter discipline that mirrors Phase 4's precedent.

---

_Reviewed: 2026-04-23T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
