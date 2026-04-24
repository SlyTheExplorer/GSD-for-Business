/**
 * Gap-Detect — Phase 6 gap-detector gate primitives. Copy-rename of
 * brief/bin/lib/audience.cjs with Phase-6 extensions: D-01 decisions,
 * D-03 severity routing, D-05 frame shape, D-06 append-only history,
 * D-09 topic_fingerprint contract, D-11 dual-condition pop. Plan 06-04 adds
 * runGapDetect + commitGapDetectVerdict (workflow + dispatcher entry).
 *
 * STRIDE mitigations: T-06-03-01 fingerprint-at-ingest; T-06-03-02 path
 * traversal (_resolveSafePath); T-06-03-03 prompt injection (sanitizeForPrompt);
 * T-06-03-04 history append-only (immutable .slice(0,-1) — grep-audit enforced);
 * T-06-03-05 null-safe countIterations; T-06-03-06 path-agnostic errors. Zero
 * runtime deps (A1). Refs: 06-CONTEXT.md D-05/D-06/D-09/D-11.
 */
const fs = require('fs');
const path = require('path');
const { atomicWriteFileSync, planningDir, planningPaths } = require('./core.cjs');
const { sanitizeForPrompt } = require('./security.cjs');
const {
  extractFrontmatter,
  stripFrontmatter,
  reconstructFrontmatter,
} = require('./frontmatter.cjs');
const { readModifyWriteStateMd } = require('./state.cjs');
const { detectKoreaSignalFromConfig } = require('./align.cjs');
const { siblingReportPath } = require('./audience.cjs');
const { renderGapDetectReport } = require('./gap-detect-report.cjs');

// Vocabulary-lock constants (source: brief/references/gap-detect-vocabulary.md).
const VALID_DECISIONS = new Set(['GAPS-NONE', 'GAPS-MATERIAL-ONLY', 'GAPS-BLOCKING']);
const VALID_SEVERITIES = new Set(['blocking', 'material', 'nice-to-have']);
// D-09 fingerprint regex — first char alpha, then alphanumeric kebab tokens
// (3-8 total). Plan 06-04 broadens Plan 06-03's alpha-only regex (deviation
// option a) so canonical example regulatory-citation-pipa-article-28 validates.
const FINGERPRINT_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+){2,7}$/;
const STOPWORDS = new Set(['the', 'a', 'an', 'of', 'in', 'for', 'with', 'and', 'or']);
const BAN_EN = /\b(compliant|passed|violation|failed)\b/gi;
const BAN_KO = /(준수|통과|위반|실패)/g;
const BAN_SYMBOL = /[✅✓✗]/g;

// _ensureMap — bind-and-return guard. Replaces 12+ identical 4-line blocks.
function _ensureMap(parent, key) {
  if (!parent[key] || typeof parent[key] !== 'object' || Array.isArray(parent[key])) {
    parent[key] = {};
  }
  return parent[key];
}

// validateFingerprint — pure (D-09). null=valid; string=error.
function validateFingerprint(slug) {
  if (typeof slug !== 'string') return 'not a string';
  if (slug.length === 0) return 'empty string';
  if (!FINGERPRINT_RE.test(slug)) return 'fails kebab-case 3-8 token regex';
  const stop = slug.split('-').filter((t) => STOPWORDS.has(t));
  if (stop.length > 0) return `contains stopword (${stop.join(',')})`;
  return null;
}

// validateVerdict — REQUIRES topic_fingerprint per finding (T-06-03-01).
function validateVerdict(v) {
  if (!v || typeof v !== 'object') return 'verdict not object';
  if (!VALID_DECISIONS.has(v.decision)) return `bad decision: ${v.decision}`;
  if (!VALID_SEVERITIES.has(v.severity)) return `bad severity: ${v.severity}`;
  if (typeof v.findings_count !== 'number' || v.findings_count < 0 || !Number.isInteger(v.findings_count)) {
    return 'bad findings_count (must be non-negative integer)';
  }
  if (!Array.isArray(v.findings)) return 'findings not array';
  for (let i = 0; i < v.findings.length; i++) {
    const f = v.findings[i];
    if (!f || typeof f !== 'object') return `findings[${i}] not object`;
    if (!VALID_SEVERITIES.has(f.severity)) return `findings[${i}].severity bad`;
    if (typeof f.location !== 'string') return `findings[${i}].location not string`;
    if (typeof f.description !== 'string') return `findings[${i}].description not string`;
    if (typeof f.topic_fingerprint !== 'string') return `findings[${i}].topic_fingerprint not string`;
    const fpErr = validateFingerprint(f.topic_fingerprint);
    if (fpErr) return `findings[${i}].topic_fingerprint invalid: ${fpErr}`;
  }
  if (typeof v.rationale !== 'string') return 'rationale not string';
  return null;
}

// countIterations — pure null-safe (D-06, T-06-03-05). String-equality match
// against (workstream, topic_fingerprint).
function countIterations(history, workstream, topicFingerprint) {
  if (!Array.isArray(history)) return 0;
  return history.filter((f) =>
    f && typeof f === 'object'
    && f.paused_workstream === workstream
    && f.topic_fingerprint === topicFingerprint,
  ).length;
}

// pushReturnFrame — atomic dual-array write (Pattern 1). Defensive deep-copy
// prevents post-push caller mutation from corrupting state.
function pushReturnFrame(cwd, frame) {
  if (!frame || typeof frame !== 'object') {
    throw new Error('pushReturnFrame: frame must be an object');
  }
  const required = [
    'paused_phase', 'paused_workstream', 'paused_artifact',
    'gap_text', 'triggering_topic', 'topic_fingerprint', 'pushed_at',
  ];
  for (const k of required) {
    if (typeof frame[k] !== 'string' || frame[k].length === 0) {
      throw new Error(`pushReturnFrame: frame.${k} missing or not a non-empty string`);
    }
  }
  const fpErr = validateFingerprint(frame.topic_fingerprint);
  if (fpErr) throw new Error(`pushReturnFrame: invalid topic_fingerprint: ${fpErr}`);

  readModifyWriteStateMd(planningPaths(cwd).state, (content) => {
    const body = stripFrontmatter(content);
    const fm = extractFrontmatter(content) || {};
    const brief = _ensureMap(fm, 'brief');
    if (!Array.isArray(brief.return_stack)) brief.return_stack = [];
    if (!Array.isArray(brief.return_stack_history)) brief.return_stack_history = [];
    brief.return_stack.push(JSON.parse(JSON.stringify(frame)));
    brief.return_stack_history.push(JSON.parse(JSON.stringify(frame)));
    return `---\n${reconstructFrontmatter(fm)}\n---\n\n${body}`;
  }, cwd);
}

// _resolveSafePath — path-traversal guard (T-06-03-02). Copy-verbatim from
// audience.cjs. Realpaths both sides via _canonicalize so startsWith compares
// canonical paths (handles /var → /private/var on macOS).
function _canonicalize(p) {
  let cur = p;
  while (cur && cur !== path.dirname(cur)) {
    try { return path.join(fs.realpathSync(cur), path.relative(cur, p)); }
    catch { cur = path.dirname(cur); }
  }
  return p;
}
function _resolveSafePath(cwd, candidatePath) {
  const absolute = _canonicalize(path.resolve(cwd, candidatePath));
  const planningRoot = _canonicalize(path.resolve(cwd, '.planning'));
  if (absolute !== planningRoot && !absolute.startsWith(planningRoot + path.sep)) {
    throw new Error(`path traversal refused: ${candidatePath} resolves outside .planning/`);
  }
  return absolute;
}

// popReturnFrame — immutable .slice(0,-1) (D-06, T-06-03-04). Never touches
// return_stack_history. Returns popped frame or null on empty stack.
function popReturnFrame(cwd) {
  let popped = null;
  readModifyWriteStateMd(planningPaths(cwd).state, (content) => {
    const body = stripFrontmatter(content);
    const fm = extractFrontmatter(content) || {};
    const stack = Array.isArray(fm.brief && fm.brief.return_stack) ? fm.brief.return_stack : [];
    if (stack.length === 0) return content;
    popped = stack[stack.length - 1];
    _ensureMap(fm, 'brief').return_stack = stack.slice(0, -1);
    return `---\n${reconstructFrontmatter(fm)}\n---\n\n${body}`;
  }, cwd);
  return popped;
}

// maybePopTopFrame — D-11 dual condition: (1) artifact mtime > pushed_at AND
// (2) last_gate_results.align.decision === 'ALIGNED' with align.at >
// pushed_at. T-06-03-02 wraps fs.statSync via _resolveSafePath.
function maybePopTopFrame(cwd) {
  let popped = null;
  readModifyWriteStateMd(planningPaths(cwd).state, (content) => {
    const body = stripFrontmatter(content);
    const fm = extractFrontmatter(content) || {};
    const brief = (fm && fm.brief) || {};
    const stack = Array.isArray(brief.return_stack) ? brief.return_stack : [];
    if (stack.length === 0) return content;
    const top = stack[stack.length - 1];
    if (!top || typeof top !== 'object') return content;

    let artifactWritten = false;
    try {
      const st = fs.statSync(_resolveSafePath(cwd, top.paused_artifact));
      artifactWritten = st.mtimeMs > Date.parse(top.pushed_at);
    } catch { artifactWritten = false; }
    if (!artifactWritten) return content;

    const align = brief.last_gate_results && brief.last_gate_results.align;
    if (!align || align.decision !== 'ALIGNED'
      || typeof align.at !== 'string'
      || Date.parse(align.at) <= Date.parse(top.pushed_at)) {
      return content;
    }

    popped = top;
    _ensureMap(fm, 'brief').return_stack = stack.slice(0, -1);
    return `---\n${reconstructFrontmatter(fm)}\n---\n\n${body}`;
  }, cwd);
  return popped;
}

// clearReturnStackFor — D-08 "Cancel workstream". History NEVER mutated.
function clearReturnStackFor(cwd, workstream) {
  if (typeof workstream !== 'string' || workstream.length === 0) {
    throw new Error('clearReturnStackFor: workstream must be a non-empty string');
  }
  readModifyWriteStateMd(planningPaths(cwd).state, (content) => {
    const body = stripFrontmatter(content);
    const fm = extractFrontmatter(content) || {};
    const brief = _ensureMap(fm, 'brief');
    const stack = Array.isArray(brief.return_stack) ? brief.return_stack : [];
    brief.return_stack = stack.filter((f) => f && f.paused_workstream !== workstream);
    _ensureMap(brief, 'workstream_status')[workstream] = 'cancelled-after-loop';
    return `---\n${reconstructFrontmatter(fm)}\n---\n\n${body}`;
  }, cwd);
}

// appendGapQueue — D-03 MATERIAL routing. Auto-fills detected_at.
function appendGapQueue(cwd, entry) {
  if (!entry || typeof entry !== 'object') {
    throw new Error('appendGapQueue: entry must be an object');
  }
  for (const k of ['workstream', 'artifact', 'gap_text', 'topic_fingerprint']) {
    if (typeof entry[k] !== 'string' || entry[k].length === 0) {
      throw new Error(`appendGapQueue: entry.${k} missing or not a non-empty string`);
    }
  }
  readModifyWriteStateMd(planningPaths(cwd).state, (content) => {
    const body = stripFrontmatter(content);
    const fm = extractFrontmatter(content) || {};
    const brief = _ensureMap(fm, 'brief');
    if (!Array.isArray(brief.gap_queue)) brief.gap_queue = [];
    brief.gap_queue.push({
      workstream: entry.workstream,
      artifact: entry.artifact,
      gap_text: entry.gap_text,
      topic_fingerprint: entry.topic_fingerprint,
      detected_at: new Date().toISOString(),
    });
    return `---\n${reconstructFrontmatter(fm)}\n---\n\n${body}`;
  }, cwd);
}

// writeAssumption — D-08 "Proceed with assumption" (T-06-03-03 sanitize +
// >=20 non-whitespace floor). Appends to OBJECTIVES.md#Assumptions + state log.
function writeAssumption(cwd, { justification, topic_fingerprint, workstream }) {
  if (typeof justification !== 'string') {
    throw new Error('writeAssumption: justification must be a string');
  }
  if (justification.replace(/\s+/g, '').length < 20) {
    throw new Error('writeAssumption: justification needs >=20 non-whitespace chars (D-08 meta-arbiter floor)');
  }
  if (typeof topic_fingerprint !== 'string' || topic_fingerprint.length === 0) {
    throw new Error('writeAssumption: topic_fingerprint required');
  }
  if (typeof workstream !== 'string' || workstream.length === 0) {
    throw new Error('writeAssumption: workstream required');
  }

  const sanitized = sanitizeForPrompt(justification);
  const at = new Date().toISOString();

  // OBJECTIVES.md#Assumptions append (creates section if missing).
  const objPath = path.join(planningDir(cwd), 'OBJECTIVES.md');
  if (fs.existsSync(objPath)) {
    let content = fs.readFileSync(objPath, 'utf-8');
    const bullet = `- [${at}] workstream=${workstream} | fingerprint=${topic_fingerprint}\n  > ${sanitized}`;
    if (/^## Assumptions\b/m.test(content)) {
      content = content.replace(/^(## Assumptions\b[^\n]*\n)/m, `$1\n${bullet}\n`);
    } else {
      content = content.trimEnd() + `\n\n## Assumptions\n\n${bullet}\n`;
    }
    atomicWriteFileSync(objPath, content, 'utf-8');
  }

  // state.brief.last_gate_results.gap_detect.assumption_log[] append.
  readModifyWriteStateMd(planningPaths(cwd).state, (content) => {
    const body = stripFrontmatter(content);
    const fm = extractFrontmatter(content) || {};
    const gd = _ensureMap(_ensureMap(_ensureMap(fm, 'brief'), 'last_gate_results'), 'gap_detect');
    if (!Array.isArray(gd.assumption_log)) gd.assumption_log = [];
    gd.assumption_log.push({ workstream, topic_fingerprint, justification: sanitized, at });
    return `---\n${reconstructFrontmatter(fm)}\n---\n\n${body}`;
  }, cwd);

  return { at, sanitized };
}

// writeVerdict — validate + atomic JSON write.
function writeVerdict(verdictPath, verdictObject) {
  const err = validateVerdict(verdictObject);
  if (err) throw new Error(`GAP-DETECT verdict invalid: ${err}`);
  atomicWriteFileSync(verdictPath, JSON.stringify(verdictObject, null, 2), 'utf-8');
}

// runGapDetect — Plan 06-04 entry. Phase 6 has NO deterministic screen (gap
// detection is inherently semantic). Without an llmPass, emits a GAPS-NONE
// fallback (non-blocking default — matches Phase 4/5 "no evaluator → no-op").
function runGapDetect(cwd, opts) {
  const { artifact, baseline, llmPass } = opts;
  const verdictOutPath = opts.verdictOutPath
    || path.join(planningPaths(cwd).planning, '.gap-detect-verdict.tmp.json');

  if (!fs.existsSync(artifact)) throw new Error(`runGapDetect: artifact not found at ${artifact}`);
  if (!fs.existsSync(baseline)) throw new Error(`runGapDetect: baseline not found at ${baseline}`);

  const llmVerdict = typeof llmPass === 'function'
    ? llmPass({ artifact, baseline, verdictOutPath, cwd })
    : null;
  const verdict = llmVerdict || {
    decision: 'GAPS-NONE',
    severity: 'nice-to-have',
    findings_count: 0,
    findings: [],
    rationale: 'No llmPass supplied; gap-detect skipped (non-blocking default).',
  };
  const err = validateVerdict(verdict);
  if (err) throw new Error(`runGapDetect verdict invalid: ${err}`);
  writeVerdict(verdictOutPath, verdict);
  return verdict;
}

// commitGapDetectVerdict — Plan 06-04 paired-sibling write + D-03 routing +
// state update. Override (D-07/D-08) suppresses push, flips decision to
// GAPS-NONE, records sanitized reason. Tmp verdict deleted in finally.
// STRIDE: T-06-04-01 re-validate after JSON.parse; T-06-04-02 sanitizeForPrompt
// before STATE.md write; T-06-04-03 _resolveSafePath wraps both paths;
// T-06-04-05 empty overrideReason throws synchronously. Returns:
//   { gapsPath, stateUpdated, framePushed, queueAppended, niceToHaveDropped }
function commitGapDetectVerdict(cwd, opts) {
  const verdictPath = _resolveSafePath(cwd, opts.verdictPath);
  if (!opts.artifactPath) throw new Error('commitGapDetectVerdict requires opts.artifactPath');
  const artifactPath = _resolveSafePath(cwd, opts.artifactPath);
  const workstream = opts.workstream || 'unknown';
  const pausedPhase = opts.pausedPhase || '07';
  const pushFrame = !!opts.pushFrame;
  const override = !!opts.override;
  const rawReason = override ? String(opts.overrideReason || '').trim() : '';
  if (override && !rawReason) throw new Error('overrideReason required when override=true');
  const sanitizedReason = override ? sanitizeForPrompt(rawReason) : '';

  try {
    const verdict = JSON.parse(fs.readFileSync(verdictPath, 'utf-8'));
    const err = validateVerdict(verdict);
    if (err) throw new Error(`gap-detect verdict invalid: ${err}`);

    const korea = detectKoreaSignalFromConfig(cwd);
    const gapsMd = renderGapDetectReport(verdict, { korea, artifact: opts.artifactPath });
    const gapsPath = siblingReportPath(artifactPath, 'gaps');
    atomicWriteFileSync(gapsPath, gapsMd, 'utf-8');

    // D-03 severity routing.
    const findings = Array.isArray(verdict.findings) ? verdict.findings : [];
    const blockingFindings = findings.filter((f) => f.severity === 'blocking');
    const materialFindings = findings.filter((f) => f.severity === 'material');
    const niceToHaveDropped = findings.filter((f) => f.severity === 'nice-to-have').length;

    let framePushed = false;
    if (verdict.decision === 'GAPS-BLOCKING' && pushFrame && blockingFindings.length > 0 && !override) {
      const first = blockingFindings[0];
      pushReturnFrame(cwd, {
        paused_phase: pausedPhase,
        paused_workstream: workstream,
        paused_artifact: opts.artifactPath,
        gap_text: first.description,
        triggering_topic: first.description.slice(0, 60),
        topic_fingerprint: first.topic_fingerprint,
        pushed_at: new Date().toISOString(),
      });
      framePushed = true;
    }

    let queueAppended = 0;
    for (const mf of materialFindings) {
      appendGapQueue(cwd, {
        workstream,
        artifact: opts.artifactPath,
        gap_text: mf.description,
        topic_fingerprint: mf.topic_fingerprint,
      });
      queueAppended += 1;
    }

    // state.brief.last_gate_results.gap_detect (parallels audience D-10).
    const at = new Date().toISOString();
    readModifyWriteStateMd(planningPaths(cwd).state, (content) => {
      const body = stripFrontmatter(content);
      const fm = extractFrontmatter(content) || {};
      _ensureMap(_ensureMap(fm, 'brief'), 'last_gate_results').gap_detect = {
        decision: override ? 'GAPS-NONE' : verdict.decision,
        severity: verdict.severity,
        findings_count: verdict.findings_count,
        at,
        ...(override ? { override: true, override_reason: sanitizedReason } : {}),
      };
      return `---\n${reconstructFrontmatter(fm)}\n---\n\n${body}`;
    }, cwd);

    return { gapsPath, stateUpdated: true, framePushed, queueAppended, niceToHaveDropped };
  } finally {
    try { fs.unlinkSync(verdictPath); } catch { /* already deleted */ }
  }
}

module.exports = {
  VALID_DECISIONS, VALID_SEVERITIES, FINGERPRINT_RE, STOPWORDS,
  BAN_EN, BAN_KO, BAN_SYMBOL,
  validateVerdict, validateFingerprint, countIterations,
  pushReturnFrame, popReturnFrame, maybePopTopFrame, clearReturnStackFor,
  appendGapQueue, writeAssumption, writeVerdict,
  runGapDetect, commitGapDetectVerdict,
  siblingReportPath, renderGapDetectReport, detectKoreaSignalFromConfig,
};
