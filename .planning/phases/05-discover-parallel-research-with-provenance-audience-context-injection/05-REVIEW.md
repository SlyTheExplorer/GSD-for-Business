---
phase: 05-discover-parallel-research-with-provenance-audience-context-injection
reviewed: 2026-04-23T00:00:00Z
depth: standard
files_reviewed: 48
files_reviewed_list:
  - agents/brief-align-gate.md
  - agents/brief-audience-guard.md
  - agents/brief-domain-researcher.md
  - bin/install.js
  - brief/bin/brief-tools.cjs
  - brief/bin/lib/align-report.cjs
  - brief/bin/lib/align.cjs
  - brief/bin/lib/audience-report.cjs
  - brief/bin/lib/audience.cjs
  - brief/bin/lib/context-inject.cjs
  - brief/bin/lib/status.cjs
  - brief/references/align-vocabulary.md
  - brief/references/audience-vocabulary.md
  - brief/references/compliance/korea/isms-p.md
  - brief/references/compliance/korea/mydata-2026.md
  - brief/references/compliance/korea/pipa-2026.md
  - brief/workflows/align-gate.md
  - brief/workflows/audience-guard.md
  - brief/workflows/define.md
  - brief/workflows/discover.md
  - commands/brief/discover.md
  - hooks/brief-validate-provenance.sh
  - scripts/build-hooks.js
  - tests/brief-align-canary.test.cjs
  - tests/brief-align-filename-migration.test.cjs
  - tests/brief-align-vocabulary-lock.test.cjs
  - tests/brief-audience-drifted-content.test.cjs
  - tests/brief-audience-drifted-frontmatter.test.cjs
  - tests/brief-audience-no-hook.test.cjs
  - tests/brief-audience-ok.test.cjs
  - tests/brief-audience-sibling-filename.test.cjs
  - tests/brief-audience-state-roundtrip.test.cjs
  - tests/brief-audience-vocabulary-lock.test.cjs
  - tests/brief-context-inject-roundtrip.test.cjs
  - tests/brief-discover-block-gate-preserved.test.cjs
  - tests/brief-discover-canary-e2e.test.cjs
  - tests/brief-discover-custom-topic.test.cjs
  - tests/brief-discover-multiselect.test.cjs
  - tests/brief-discover-no-new-command.test.cjs
  - tests/brief-discover-parallel-smoke.test.cjs
  - tests/brief-discover-stale-anchor-preserved.test.cjs
  - tests/brief-discover-text-mode.test.cjs
  - tests/brief-discover-wave-partition.test.cjs
  - tests/brief-korea-compliance-primers.test.cjs
  - tests/brief-provenance-false-positives.test.cjs
  - tests/brief-provenance-hook.test.cjs
  - tests/brief-provenance-negative.test.cjs
  - tests/brief-provenance-opt-in.test.cjs
  - tests/brief-provenance-positive.test.cjs
  - tests/brief-researcher-b2b-vs-b2c.test.cjs
  - tests/brief-researcher-output-provenance.test.cjs
  - tests/state-brief-override-roundtrip.test.cjs
findings:
  critical: 0
  warning: 4
  info: 7
  total: 11
status: issues_found
---

# Phase 5: Code Review Report

**Reviewed:** 2026-04-23
**Depth:** standard
**Files Reviewed:** 48
**Status:** issues_found

## Summary

Phase 5 delivers a large, disciplined increment: the parallel-research DISCOVER workflow, a paired-sibling AUDIENCE gate (`{artifact}.audience.md`), a cross-cutting `context-inject.cjs` business-context primitive, three Korea compliance primers (PIPA / ISMS-P / MyData), and an opt-in shell hook for provenance-tag enforcement. The new code follows established Phase 4 patterns (path-traversal guards, atomic writes, read-modify-write STATE.md, sanitization before state writes, ban-list vocabulary discipline), and test coverage is strong (~25 test files exercise the new surfaces, including structural audits, deterministic-screen short-circuits, and paired-sibling filename locks).

No critical issues were found. All identified issues are correctness edge cases, robustness concerns, or maintenance hygiene items. The most load-bearing concern is **WR-01**, the shell-hook word-splitting vulnerability on filenames with whitespace — a real bash-correctness bug, though mitigated in practice by the trailing `[ -f "$F" ]` guard and the opt-in nature of the hook. The other warnings are smaller regex-correctness and input-validation gaps that merit tightening but do not compromise the Phase 5 exit criteria.

Test fixture files and the three compliance primers were scanned for frontmatter validity, ban-list hygiene, and mandatory disclaimers; no issues found.

## Warnings

### WR-01: Unquoted word-splitting on staged filenames in provenance hook

**File:** `hooks/brief-validate-provenance.sh:59`
**Issue:** The line `for F in $STAGED_FILES; do` relies on unquoted shell word-splitting. Filenames containing whitespace, tab, or newline characters will be split into multiple loop iterations, each receiving a partial path. `STAGED_FILES` is obtained from `git diff --cached --name-only`, which uses newline-delimited output by default — filenames with embedded whitespace would therefore be split across whitespace (not just newlines). The subsequent `[[ ! -f "$F" ]] && continue` guard silently skips any such split pieces, so the hook appears to pass but has actually bypassed the provenance check for the real (whitespace-containing) filename.

Secondary issue on the same loop: `git diff --cached --name-only` will also produce quoted paths for filenames with special characters (controlled by `core.quotePath`), which the loop does not unquote.

**Fix:**
```bash
# Use NUL-delimited output and a while-read loop for safety.
while IFS= read -r -d '' F; do
  [[ "$F" =~ $ALLOWLIST_REGEX ]] && continue
  [[ ! "$F" =~ \.(md|txt)$ ]] && continue
  [[ ! -f "$F" ]] && continue
  # ... existing per-file logic ...
done < <(git diff --cached --name-only -z --diff-filter=AM 2>/dev/null || true)

# If you keep the empty-check, also use -z-aware:
STAGED_FILES_Z=$(git diff --cached --name-only -z --diff-filter=AM 2>/dev/null | tr -d '\0')
[ -z "$STAGED_FILES_Z" ] && exit 0
```

The existing tests pass because test fixture filenames are all simple ASCII; this is a latent bug that will surface the first time a user commits a file like `Q1 2026 budget.md`.

---

### WR-02: Regex false negative in `brief-validate-provenance.sh` EXCLUDE pattern — version strings with trailing period

**File:** `hooks/brief-validate-provenance.sh:53`
**Issue:** The `EXCLUDE_PATTERN` fragment for version strings is `(^|[^A-Za-z0-9_])[vV][0-9]+(\.[0-9]+)*([^A-Za-z0-9_]|$)`. The `(\.[0-9]+)*` group requires the dot to be followed by digits, which is fine. However, the INCLUDE_PATTERN matches `[0-9][0-9,.]*[[:space:]]*%` — a version string like `v1.2%` or bare `1.2%` would match INCLUDE via the percent branch, and EXCLUDE's version sub-pattern would not apply (since percent is not in the version char class). Also, the version exclude matches `v1.2` but NOT `v1.2.3` written as `v1.2.3,` — the trailing `,` is not a word boundary in ERE word-class terms. This is an edge case likely to bite on a comma-separated list like `migrate to v1.2.3, v2.0.0` in a .md commit — unlikely but not impossible in research/docs.

**Fix:** Add a unit test case exercising `v1.2.3,` and `v1.2.3.4` edge cases; if false-positives appear, extend the version sub-pattern's trailing anchor to include more punctuation (`([^A-Za-z0-9_]|$)` already does this, so the current pattern may in fact handle this — a targeted test would confirm). No code change mandatory, but a test fixture would close the uncertainty.

---

### WR-03: `_siblingReportPath` silently mis-targets uppercase `.MD` / `.Md` extensions

**File:** `brief/bin/lib/audience.cjs:26-30`
**Issue:** The extension check is exact-case:
```javascript
const ext = path.extname(artifactAbsPath);
const base = ext === '.md' ? artifactAbsPath.slice(0, -3) : artifactAbsPath;
return `${base}.${suffix}.md`;
```
`path.extname('foo.MD')` returns `.MD`. The branch treats this as "no match" and produces `foo.MD.audience.md` (double-extension sibling) rather than the intended `foo.audience.md`. On macOS HFS+ (case-insensitive), two files `foo.MD` and `foo.md` collide, so the sibling may even OVERWRITE the original artifact. Low probability (no user writes uppercase `.MD`), but the failure mode is destructive.

**Fix:**
```javascript
function _siblingReportPath(artifactAbsPath, suffix) {
  const ext = path.extname(artifactAbsPath);
  const base = ext.toLowerCase() === '.md'
    ? artifactAbsPath.slice(0, -ext.length)
    : artifactAbsPath;
  return `${base}.${suffix}.md`;
}
```

---

### WR-04: `commands.cmdSummaryExtract` crashes on bare `--fields` flag

**File:** `brief/bin/brief-tools.cjs:1133`
**Issue:**
```javascript
const fields = fieldsIndex !== -1 ? args[fieldsIndex + 1].split(',') : null;
```
If a caller invokes `brief-tools summary-extract path --fields` with no value after `--fields`, `args[fieldsIndex + 1]` is `undefined`, and `.split(',')` throws `TypeError: Cannot read properties of undefined (reading 'split')` — a stack trace that leaks internal paths (exactly the class of leak Phase 4 Test 10 protects against elsewhere).

This command is not touched by Phase 5 directly (it's pre-existing infrastructure), but it's listed in the review scope as part of `brief-tools.cjs`. Flagging so the pattern is fixed consistently across the dispatcher, where the Phase 5 additions (`align`, `audience`) already wrap lib calls in try/catch.

**Fix:**
```javascript
const fieldsRaw = fieldsIndex !== -1 ? args[fieldsIndex + 1] : null;
if (fieldsIndex !== -1 && (!fieldsRaw || fieldsRaw.startsWith('--'))) {
  error('--fields requires a value');
}
const fields = fieldsRaw ? fieldsRaw.split(',') : null;
```

## Info

### IN-01: `finally { try { fs.unlinkSync(verdictPath); } catch {} }` swallows all errors

**File:** `brief/bin/lib/align.cjs:369-371` and `brief/bin/lib/audience.cjs:411-413`
**Issue:** Both `commitAlignVerdict` and `commitAudienceVerdict` use `try { fs.unlinkSync(verdictPath); } catch { /* already deleted */ }` in their `finally` block. The comment says "already deleted" but the catch swallows ALL errors — `EACCES` (permission denied), `EBUSY` (file in use on Windows), `ENOTEMPTY`, etc. A permission-denied failure leaves the tmp verdict on disk silently, which could leak sanitized-but-still-sensitive override reasons across runs.

**Fix:** Narrow the catch to `ENOENT` only; log other errors:
```javascript
try { fs.unlinkSync(verdictPath); }
catch (err) { if (err.code !== 'ENOENT') console.error(`warn: could not unlink verdict tmp: ${err.code}`); }
```

### IN-02: `status.cjs` regex has unescaped `.` in phase number

**File:** `brief/bin/lib/status.cjs:55-60`
**Issue:**
```javascript
const phaseNumStr = String(currentPhase || '').replace(/[^0-9.A-Za-z]/g, '');
// ...
const strippedZero = phaseNumStr.replace(/^0+(?=\d)/, '');
const re = new RegExp(`^#{2,4}\\s*Phase\\s+${strippedZero}\\s*:\\s*(.+)$`, 'm');
```
If `currentPhase` is `"2.1"` (decimal phase), `strippedZero` becomes `"2.1"`, and the regex is `^#{2,4}\s*Phase\s+2.1\s*:` — the `.` is a regex metachar matching any single character, so this would also match `Phase 2x1:` or `Phase 2_1:`. No real ROADMAP.md would have such headers, so the false-match risk is theoretical, but the regex is subtly incorrect.

**Fix:** Escape the phase number before embedding:
```javascript
const escaped = strippedZero.replace(/[.\\*+?()[\]{}|^$]/g, '\\$&');
const re = new RegExp(`^#{2,4}\\s*Phase\\s+${escaped}\\s*:\\s*(.+)$`, 'm');
```

### IN-03: `buildBusinessContext` emits `<default></default>` XML when `audience_policy.default` is null

**File:** `brief/bin/lib/context-inject.cjs:77-78`
**Issue:**
```javascript
const policyDefault = (ctx.audience_policy && ctx.audience_policy.default) || 'internal';
```
This correctly falls back to `'internal'` when `audience_policy` is absent or has null `default`. However, when `audience_policy` is present-but-has-empty-string-default (`{default: "", permitted: [...]}`), the `||` fallback still fires — silent coercion. If a user ever writes `audience_policy: {default: "", permitted: []}` in config.json (e.g., partial amend), they will get `<default>internal</default>` in the prompt block without warning. This is defensible (fail-safe default) but might surprise planners debugging a "why does the researcher think internal?" question.

**Fix:** Document the behavior in the helper docstring, or emit a warning when `audience_policy` is present-but-default-empty.

### IN-04: `sanitizeForPrompt` receives but does not sanitize `overrideReason` for `renderAlignReport` / `renderAudienceReport` BODY section

**File:** `brief/bin/lib/align-report.cjs:53` and `brief/bin/lib/audience-report.cjs:55`
**Issue:** `commitAlignVerdict` sanitizes `rawReason` via `sanitizeForPrompt` BEFORE passing to `renderAlignReport`. The report's body section writes `Reason: ${overrideReason}` verbatim. Both call sites (align and audience) follow the same pattern. The flow is correct (sanitize at the trust boundary), but the `render*Report` helpers accept `overrideReason` as-is without validating — if a future caller forgets to sanitize upstream, the markdown body will render whatever was passed. This is a contract-enforcement gap, not an active bug.

**Fix:** Add a defensive `sanitizeForDisplay` pass inside the render helpers as belt-and-suspenders, OR add a JSDoc `@param overrideReason {string} MUST be sanitized by caller` line.

### IN-05: `commitAudienceVerdict` throws generic error when `opts.artifactPath` missing

**File:** `brief/bin/lib/audience.cjs:367-369`
**Issue:**
```javascript
if (!opts.artifactPath) {
  throw new Error('commitAudienceVerdict requires opts.artifactPath (D-11 paired-sibling)');
}
```
The error message references internal decision numbers (`D-11`) that are meaningless to end users. Since the dispatcher wraps this in `try/catch` and forwards `err.message`, this D-11 token leaks into user-facing stderr. Not security-sensitive (no path leakage), but not user-friendly.

**Fix:** Use a plain-language message, or have the dispatcher translate internal error messages:
```javascript
throw new Error('audience commit requires --artifact <path> (the artifact being evaluated)');
```

### IN-06: Fail-closed discipline works, but `workstream` regex permits leading hyphen

**File:** `brief/bin/brief-tools.cjs:282`
**Issue:**
```javascript
if (ws && !/^[a-zA-Z0-9_-]+$/.test(ws)) {
  error('Invalid workstream name: must be alphanumeric, hyphens, and underscores only');
}
```
The regex permits `-foo` as a workstream name. In command-line contexts, a leading `-` is often interpreted as a flag by downstream tools — `git -foo` would fail, but some shell helpers may interpret it differently. Not exploitable (subsequent path joining would fail noisily), but not defensive.

**Fix:** Require the first character to be alphanumeric:
```javascript
if (ws && !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(ws)) { ... }
```

### IN-07: `brief-tools.cjs` `extractField` silently returns `undefined` for bad path — no user feedback

**File:** `brief/bin/brief-tools.cjs:404-421`
**Issue:** `--pick nonexistent.field` returns empty string with exit 0. Users who typo a field name get no feedback — their pipeline reads empty string and proceeds. Combined with `--pick`'s stdout interception, a typo silently appears as "field not present" identically to "field is empty string". Not a Phase 5 addition (pre-existing), but surfaced because it sits alongside the new Phase 5 dispatchers.

**Fix:** When the field path cannot be walked at all (first part missing), emit to stderr before returning empty.

---

_Reviewed: 2026-04-23_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
