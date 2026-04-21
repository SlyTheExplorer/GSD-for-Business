/**
 * Align — ALIGN gate foundational primitives (Plan 04-01).
 *
 * Exports (each consumed by Plans 04-02/03/04):
 *   validateVerdict, grepBanList, computeTermOverlap,
 *   detectKoreaSignalFromConfig, runDeterministicScreen, writeVerdict.
 *
 * Zero external runtime deps (A1). Reference: 04-RESEARCH.md §Pattern 2 / §Code
 * Examples 2+3, 04-CONTEXT.md D-03 + D-05 + D-11.
 */
const fs = require('fs');
const path = require('path');
const { atomicWriteFileSync, planningDir } = require('./core.cjs');
const objectives = require('./objectives.cjs');
const { detectKoreaSignals } = require('./define.cjs');

// ─── Enum constants (exported for test fixture use) ────────────────────────
const VALID_DECISIONS = new Set([
  'ALIGNED',
  'DRIFTED-objective-needs-update',
  'DRIFTED-output-needs-revision',
]);
const VALID_SEVERITIES = new Set(['blocking', 'material', 'nice-to-have']);

// ─── Ban-list regexes (D-05) ───────────────────────────────────────────────
// Sourced from brief/references/align-vocabulary.md. Keep this module's copy
// in sync with the reference file — the file is authoritative for humans;
// these regexes are the runtime.
const BAN_EN = /\b(compliant|passed|violation|failed)\b/gi;
const BAN_KO = /(준수|통과|위반|실패)/g;
const BAN_SYMBOL = /[✅✓✗]/g;

// ─── validateVerdict ───────────────────────────────────────────────────────
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
  }
  if (typeof v.rationale !== 'string') return 'rationale not string';
  return null;
}

// ─── grepBanList ───────────────────────────────────────────────────────────
function grepBanList(candidatePath) {
  const content = fs.readFileSync(candidatePath, 'utf-8');
  const lines = content.split('\n');
  const hits = [];
  const base = path.basename(candidatePath);
  for (let i = 0; i < lines.length; i++) {
    for (const re of [BAN_EN, BAN_KO, BAN_SYMBOL]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(lines[i])) !== null) {
        hits.push({ token: m[0], location: `${base}:${i + 1}` });
      }
    }
  }
  return hits;
}

// ─── detectKoreaSignalFromConfig ───────────────────────────────────────────
// Phase 4 D-11: prefer config.json brief.region === 'kr'; fall back to
// detectKoreaSignals(body-of-OBJECTIVES.md) if config.brief.region unset.
//
// NOTE: core.loadConfig returns a curated projection that drops the `brief.*`
// namespace (the namespace is user-written via define.cjs `writeConfigBrief`
// but not surfaced by loadConfig). We therefore read config.json directly.
// Matches the raw-read pattern in define.cjs:writeConfigBrief.
function detectKoreaSignalFromConfig(cwd) {
  const configPath = path.join(planningDir(cwd), 'config.json');
  if (fs.existsSync(configPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (parsed && parsed.brief && parsed.brief.region === 'kr') return true;
    } catch {
      // Malformed config.json — fall through to OBJECTIVES.md body check.
    }
  }
  // Fallback: scan OBJECTIVES.md body for Hangul (Phase 3 primitive).
  const { exists, body } = objectives.readObjectivesMd(cwd);
  if (!exists) return false;
  return detectKoreaSignals(body || '');
}

// ─── computeTermOverlap ────────────────────────────────────────────────────
// Deterministic keyword overlap between candidate and baseline. Returns
// {score, sharedTerms} where score is 0 when no meaningful token from
// baseline appears in candidate.
//
// Token extraction: whitespace+punctuation split; EN lowercase tokens of
// length >= 4; Korean Hangul runs of length >= 2 (Korean tokens have no case).
function computeTermOverlap(candidatePath, baselinePath) {
  const candidate = fs.readFileSync(candidatePath, 'utf-8');
  const baseline = fs.readFileSync(baselinePath, 'utf-8');
  const baselineTokens = new Set();
  const words = baseline.split(/[\s\p{P}]+/u).filter(Boolean);
  for (const w of words) {
    const lw = w.toLowerCase();
    if (lw.length >= 4) baselineTokens.add(lw);
    const koMatch = w.match(/[\uac00-\ud7af]{2,}/);
    if (koMatch) baselineTokens.add(koMatch[0]);
  }
  const candidateLower = candidate.toLowerCase();
  const sharedTerms = [];
  for (const t of baselineTokens) {
    if (candidateLower.includes(t) || candidate.includes(t)) sharedTerms.push(t);
  }
  return { score: sharedTerms.length, sharedTerms };
}

// ─── runDeterministicScreen (D-03) ─────────────────────────────────────────
// Returns { verdict, findings }.
//   - If screen short-circuits (a/b), verdict is a full verdict object.
//   - If screen does not short-circuit, verdict is null and findings holds
//     any additive ban-list hits (c) for the LLM pass to merge.
function runDeterministicScreen(cwd, { candidate, baseline }) {
  const findings = [];
  const korea = detectKoreaSignalFromConfig(cwd);

  // Screen (b): baseline required-field completeness.
  const objCheck = objectives.validateObjectivesComplete(cwd);
  if (!objCheck.valid) {
    findings.push({
      severity: 'blocking',
      location: `OBJECTIVES.md frontmatter: ${objCheck.missing.join(', ')}`,
      description: korea
        ? `필수 항목이 누락되어 있어, 이 상태에서는 alignment 판단이 의미가 없습니다. 누락 항목: ${objCheck.missing.join(', ')}`
        : `Required OBJECTIVES.md fields missing; alignment evaluation is meaningless until these are filled. Missing: ${objCheck.missing.join(', ')}`,
    });
    return {
      verdict: {
        decision: 'DRIFTED-objective-needs-update',
        severity: 'blocking',
        findings_count: findings.length,
        findings,
        rationale: 'OBJECTIVES.md schema incomplete (deterministic)',
      },
      findings,
    };
  }

  // Screen (a): zero overlap between candidate and baseline required-field terms.
  const overlap = computeTermOverlap(candidate, baseline);
  if (overlap.score === 0) {
    findings.push({
      severity: 'material',
      location: `${path.basename(candidate)}:entire-file`,
      description: korea
        ? '이 artifact가 OBJECTIVES.md의 어떤 Immutable Intent나 required field와도 겹치지 않습니다.'
        : 'Candidate has zero overlap with documented Immutable Intent or required fields.',
    });
    return {
      verdict: {
        decision: 'DRIFTED-output-needs-revision',
        severity: 'material',
        findings_count: findings.length,
        findings,
        rationale: 'Candidate has no overlap with baseline (deterministic)',
      },
      findings,
    };
  }

  // Screen (c): ban-list grep on candidate (additive — does NOT short-circuit).
  const banHits = grepBanList(candidate);
  for (const hit of banHits) {
    findings.push({
      severity: 'material',
      location: hit.location,
      description: korea
        ? `금지 표현 감지 — 명확한 findings 언어로 다시 써주세요: '${hit.token}'`
        : `Forbidden vocabulary detected — rewrite with findings language: '${hit.token}'`,
    });
  }

  return { verdict: null, findings };
}

// ─── writeVerdict ──────────────────────────────────────────────────────────
// Validates the verdict shape, then writes it atomically as JSON (no YAML,
// no preamble, no fences — pure parseable JSON per Pitfall #3).
// Path-traversal guard lives at the workflow-invocation layer (Plan 04-04);
// writeVerdict trusts its caller since in this plan it is only called from tests.
function writeVerdict(verdictPath, verdictObject) {
  const err = validateVerdict(verdictObject);
  if (err) throw new Error(`ALIGN verdict invalid: ${err}`);
  const serialized = JSON.stringify(verdictObject, null, 2);
  atomicWriteFileSync(verdictPath, serialized, 'utf-8');
}

// ─── mergeVerdicts (D-03 merge rule) ───────────────────────────────────────
// severity = max across det+llm findings; decision = blocking+OBJECTIVES.md
// location → DRIFTED-objective, other blocking → DRIFTED-output, else ALIGNED.
// llmVerdict may be null.
const SEVERITY_ORDER = { blocking: 3, material: 2, 'nice-to-have': 1 };

function mergeVerdicts(detFindings, llmVerdict) {
  const llm = llmVerdict || {
    decision: 'ALIGNED',
    severity: 'nice-to-have',
    findings: [],
    rationale: 'no semantic findings (llm pass skipped or returned null)',
  };
  const det = Array.isArray(detFindings) ? detFindings : [];
  const llmFindings = Array.isArray(llm.findings) ? llm.findings : [];
  const combinedFindings = det.concat(llmFindings);

  // Severity max scan.
  let maxSev = 'nice-to-have';
  for (const f of combinedFindings) {
    if ((SEVERITY_ORDER[f.severity] || 0) > (SEVERITY_ORDER[maxSev] || 0)) {
      maxSev = f.severity;
    }
  }

  // Decision derivation.
  let decision;
  if (maxSev === 'blocking') {
    const blocking = combinedFindings.find((f) => f.severity === 'blocking');
    const loc = (blocking && blocking.location) || '';
    if (/OBJECTIVES\.md/i.test(loc) || /frontmatter/i.test(loc)) {
      decision = 'DRIFTED-objective-needs-update';
    } else {
      decision = 'DRIFTED-output-needs-revision';
    }
  } else {
    decision = 'ALIGNED';
  }

  const rationale =
    typeof llm.rationale === 'string' && llm.rationale.length > 0
      ? llm.rationale
      : `merged verdict from ${combinedFindings.length} finding(s)`;

  return {
    decision,
    severity: maxSev,
    findings_count: combinedFindings.length,
    findings: combinedFindings,
    rationale,
  };
}

// ─── runAlign (entry point for workflow + tests) ───────────────────────────
// Drives deterministic short-circuit + LLM merge pipeline in one call.
// llmPass is injected (tests stub it; production workflow spawns Task
// directly rather than funneling through runAlign).
//
// opts: { candidate, baseline, verdictOutPath?, llmPass? }
// Returns merged verdict; writes atomically to verdictOutPath.
// Read-only contract: candidate/baseline MUST NOT be mutated (Pitfall #2,
// Test 6 in tests/brief-align.test.cjs enforces).
function runAlign(cwd, opts) {
  const candidate = opts.candidate;
  const baseline = opts.baseline;
  const verdictOutPath =
    opts.verdictOutPath ||
    path.join(planningPaths(cwd).planning, '.align-verdict.tmp.json');
  const llmPass = opts.llmPass;

  const screen = runDeterministicScreen(cwd, { candidate, baseline });
  if (screen.verdict) {
    // Short-circuit: deterministic fired blocking or material; no LLM pass
    // (D-03 precedence + Pitfall #4 avoid unnecessary LLM spend).
    writeVerdict(verdictOutPath, screen.verdict);
    return screen.verdict;
  }

  let llmVerdict = null;
  if (typeof llmPass === 'function') {
    llmVerdict = llmPass({
      candidate,
      baseline,
      verdictOutPath,
      cwd,
      alreadyKnownFindings: screen.findings,
    });
  }

  const merged = mergeVerdicts(screen.findings, llmVerdict);
  writeVerdict(verdictOutPath, merged);
  return merged;
}

// ─── Exports ───────────────────────────────────────────────────────────────
module.exports = {
  VALID_DECISIONS,
  VALID_SEVERITIES,
  BAN_EN,
  BAN_KO,
  BAN_SYMBOL,
  validateVerdict,
  grepBanList,
  computeTermOverlap,
  detectKoreaSignalFromConfig,
  runDeterministicScreen,
  writeVerdict,
  mergeVerdicts,
  runAlign,
};
