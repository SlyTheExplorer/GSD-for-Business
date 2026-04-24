/**
 * Audience — AUDIENCE gate primitives (Plan 05-04, paired-sibling activation
 * Plan 05-05). Duplicate-renamed from align.cjs per 05-RESEARCH.md §Pattern 2.
 * Phase 7 COMPLIANCE copy-renames this module; preserve literal shape. Zero
 * runtime deps (A1). Plan 05-05 Task 1 activates the paired-sibling
 * `{artifact}.audience.md` filename scheme via _siblingReportPath derivation
 * (D-11). Refs: 05-CONTEXT.md D-09/D-10/D-11.
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
const { detectKoreaSignalFromConfig } = require('./align.cjs'); // reuse existing helper
const { renderAudienceReport } = require('./audience-report.cjs');

// ─── _siblingReportPath (D-11 paired-sibling scheme) ───────────────────────
// Derives {artifact-dir}/{artifact-basename}.{suffix}.md from an artifact path.
// Phase 7 COMPLIANCE will reuse with suffix='compliance'. Exported as
// `siblingReportPath` for test fixtures and downstream gate reuse.
function _siblingReportPath(artifactAbsPath, suffix) {
  const ext = path.extname(artifactAbsPath);
  const base = ext === '.md' ? artifactAbsPath.slice(0, -3) : artifactAbsPath;
  return `${base}.${suffix}.md`;
}

// Enum constants — sourced from brief/references/audience-vocabulary.md.
const VALID_DECISIONS = new Set(['AUDIENCE-OK', 'DRIFTED-frontmatter', 'DRIFTED-content']);
const VALID_SEVERITIES = new Set(['blocking', 'material', 'nice-to-have']);
const BAN_EN = /\b(compliant|passed|violation|failed)\b/gi;
const BAN_KO = /(준수|통과|위반|실패)/g;
const BAN_SYMBOL = /[✅✓✗]/g;

// Hedging vocabulary (D-09 Screen a) — triggers DRIFTED-content when audience.type: external.
const HEDGING_EN = /\b(TBD|we believe|we think|concerns?|risk we haven't solved|still proving|not sure|gut feel|needs validation|open question|unclear|to be figured out|we aren't sure|we don't yet know|frankly|honestly|privately)\b/gi;
const HEDGING_KO = /(아직 확정 전|우려|미해결|확신 없음|걱정|확인 필요|미정|아직 모름|솔직히|사실|내부적으로는|아직 검증 전|아직 증명 전)/g;

// Mandatory frontmatter (D-10) + closed-enum values — invalid entries → blocking finding.
const MANDATORY_FRONTMATTER_FIELDS = ['audience.type', 'audience.confidentiality', 'business_context.model'];
const AUDIENCE_TYPE_ENUM = new Set(['internal', 'partner', 'external', 'public']);
const CONFIDENTIALITY_ENUM = new Set(['internal', 'confidential', 'partner', 'external', 'public']);
const BUSINESS_MODEL_ENUM = new Set(['b2b', 'b2c', 'b2b2c', 'enterprise']);

function getFrontmatterField(fm, dottedPath) {
  const parts = dottedPath.split('.');
  let cur = fm;
  for (const p of parts) {
    if (!cur || typeof cur !== 'object') return undefined;
    cur = cur[p];
  }
  return cur;
}

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
function grepBanList(artifactPath) {
  const content = fs.readFileSync(artifactPath, 'utf-8');
  const lines = content.split('\n');
  const hits = [];
  const base = path.basename(artifactPath);
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

// computeTermOverlap — parity with align.cjs for Phase 7 replication.
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

// ─── runDeterministicScreen (D-09) ─────────────────────────────────────────
// Returns { verdict, findings }.
//   - If screen (b) fires blocking (missing mandatory frontmatter), verdict
//     is a full DRIFTED-frontmatter verdict.
//   - If screen (a) fires blocking (3+ hedging hits), verdict is a full
//     DRIFTED-content verdict.
//   - Otherwise, verdict is null and findings holds any additive
//     material-severity hits (hedging 1-2x, ban-list) for the LLM pass.
function runDeterministicScreen(cwd, { artifact, baseline }) {
  const findings = [];
  const korea = detectKoreaSignalFromConfig(cwd);
  const artifactContent = fs.readFileSync(artifact, 'utf-8');
  const artifactFm = extractFrontmatter(artifactContent) || {};

  // Screen (b): 3 mandatory frontmatter fields present-and-well-formed.
  const missing = [];
  for (const field of MANDATORY_FRONTMATTER_FIELDS) {
    const v = getFrontmatterField(artifactFm, field);
    if (v === undefined || v === null || v === '') {
      missing.push(field);
      continue;
    }
    if (field === 'audience.type' && !AUDIENCE_TYPE_ENUM.has(v)) {
      missing.push(`${field} (invalid enum value: ${v})`);
    }
    if (field === 'audience.confidentiality' && !CONFIDENTIALITY_ENUM.has(v)) {
      missing.push(`${field} (invalid enum value: ${v})`);
    }
    if (field === 'business_context.model' && !BUSINESS_MODEL_ENUM.has(v)) {
      missing.push(`${field} (invalid enum value: ${v})`);
    }
  }
  if (missing.length > 0) {
    findings.push({
      severity: 'blocking',
      location: `${path.basename(artifact)}:frontmatter`,
      description: korea
        ? `필수 frontmatter 항목 누락 또는 잘못된 값: ${missing.join(', ')}`
        : `Mandatory frontmatter field missing or invalid: ${missing.join(', ')}`,
    });
    return {
      verdict: {
        decision: 'DRIFTED-frontmatter',
        severity: 'blocking',
        findings_count: findings.length,
        findings,
        rationale: 'Artifact frontmatter schema incomplete (deterministic)',
      },
      findings,
    };
  }

  // Screen (a): hedging vocabulary WHEN audience is external.
  const declaredType = getFrontmatterField(artifactFm, 'audience.type');
  const declaredConf = getFrontmatterField(artifactFm, 'audience.confidentiality');
  const isExternal = declaredType === 'external' || declaredConf === 'external';
  if (isExternal) {
    const body = stripFrontmatter(artifactContent);
    const lines = body.split('\n');
    const hedgingHits = [];
    for (let i = 0; i < lines.length; i++) {
      for (const re of [HEDGING_EN, HEDGING_KO]) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(lines[i])) !== null) {
          hedgingHits.push({ token: m[0], line: i + 1 });
        }
      }
    }
    if (hedgingHits.length >= 3) {
      // 3+ hits: blocking → DRIFTED-content short-circuit.
      findings.push({
        severity: 'blocking',
        location: `${path.basename(artifact)}:body`,
        description: korea
          ? `선언된 청중과 맞지 않는 부분: hedging 언어가 external artifact에 ${hedgingHits.length}회 등장합니다. 재작성하거나 frontmatter의 audience.type을 변경해 주세요.`
          : `Content inconsistent with declared audience: hedging vocabulary appears ${hedgingHits.length} times in external artifact. Rewrite or change frontmatter audience.type.`,
      });
      return {
        verdict: {
          decision: 'DRIFTED-content',
          severity: 'blocking',
          findings_count: findings.length,
          findings,
          rationale: 'External artifact contains 3+ hedging-vocabulary hits (deterministic)',
        },
        findings,
      };
    }
    // 1-2 hits: material finding (additive).
    for (const hit of hedgingHits) {
      findings.push({
        severity: 'material',
        location: `${path.basename(artifact)}:${hit.line}`,
        description: korea
          ? `외부용 artifact에 hedging 언어 감지: '${hit.token}' — 재작성 권장`
          : `Hedging vocabulary in external artifact: '${hit.token}' — consider rewriting`,
      });
    }
  }

  // Screen (c): ban-list grep (additive material findings).
  const banHits = grepBanList(artifact);
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
// Validates the verdict shape, then writes it atomically as JSON.
function writeVerdict(verdictPath, verdictObject) {
  const err = validateVerdict(verdictObject);
  if (err) throw new Error(`AUDIENCE verdict invalid: ${err}`);
  const serialized = JSON.stringify(verdictObject, null, 2);
  atomicWriteFileSync(verdictPath, serialized, 'utf-8');
}

// ─── mergeVerdicts (D-09 merge rule) ───────────────────────────────────────
// severity = max across det+llm findings; decision = blocking+frontmatter
// location → DRIFTED-frontmatter; other blocking → DRIFTED-content; else
// AUDIENCE-OK. llmVerdict may be null.
const SEVERITY_ORDER = { blocking: 3, material: 2, 'nice-to-have': 1 };

function mergeVerdicts(detFindings, llmVerdict) {
  const llm = llmVerdict || {
    decision: 'AUDIENCE-OK',
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
    // Frontmatter-location-referencing finding → DRIFTED-frontmatter.
    if (/frontmatter/i.test(loc) || /audience\.type|audience\.confidentiality|business_context\.model/i.test(loc)) {
      decision = 'DRIFTED-frontmatter';
    } else {
      decision = 'DRIFTED-content';
    }
  } else {
    decision = 'AUDIENCE-OK';
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

// ─── runAudience (entry point for workflow + tests) ────────────────────────
// opts: { artifact, baseline, verdictOutPath?, llmPass? }
// Read-only contract: artifact/baseline MUST NOT be mutated.
function runAudience(cwd, opts) {
  const artifact = opts.artifact;
  const baseline = opts.baseline;
  const verdictOutPath =
    opts.verdictOutPath ||
    path.join(planningPaths(cwd).planning, '.audience-verdict.tmp.json');
  const llmPass = opts.llmPass;

  const screen = runDeterministicScreen(cwd, { artifact, baseline });
  if (screen.verdict) {
    writeVerdict(verdictOutPath, screen.verdict);
    return screen.verdict;
  }

  let llmVerdict = null;
  if (typeof llmPass === 'function') {
    llmVerdict = llmPass({
      artifact,
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

// ─── _resolveSafePath (T-5-04-04) ──────────────────────────────────────────
// Path-traversal guard. Realpaths both sides (tolerating missing files by
// walking parents) so startsWith compares canonical paths.
//
// SECURITY NOTE (from 05-04-PLAN Task 2 WARNING-03): align.cjs's
// implementation is tailored to OBJECTIVES.md (single known path). AUDIENCE
// artifactPath is dynamic. This implementation accepts any path inside the
// .planning/ root; path-traversal rejection is verified in Task 6 tests.
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

// ─── commitAudienceVerdict (D-07, D-11, T-5-04-01/02/04/07) ────────────────
// Renders {artifact}.audience.md as a paired-sibling in the same directory as
// the source artifact (D-11), updates state.brief.last_gate_results.audience
// atomically via readModifyWriteStateMd, and deletes the tmp verdict file in
// finally.
//
// sanitizeForPrompt runs BEFORE state write (T-5-04-02). Caller issues the
// multi-file git commit for Pattern 4 visibility.
//
// opts.artifactPath is REQUIRED (Plan 05-05): its path determines the sibling
// report location via _siblingReportPath. Path-traversal guarded via
// _resolveSafePath (T-5-05-01 mitigation inherits align.cjs guard verbatim).
function commitAudienceVerdict(cwd, opts) {
  const verdictPath = _resolveSafePath(cwd, opts.verdictPath);
  if (!opts.artifactPath) {
    throw new Error('commitAudienceVerdict requires opts.artifactPath (D-11 paired-sibling)');
  }
  const artifactPath = _resolveSafePath(cwd, opts.artifactPath);
  const override = !!opts.override;
  const rawReason = override ? String(opts.overrideReason || '').trim() : '';
  if (override && !rawReason) throw new Error('overrideReason required when override=true');
  const sanitizedReason = override ? sanitizeForPrompt(rawReason) : '';

  try {
    const verdict = JSON.parse(fs.readFileSync(verdictPath, 'utf-8'));
    const err = validateVerdict(verdict);
    if (err) throw new Error(`AUDIENCE verdict invalid: ${err}`);

    const korea = detectKoreaSignalFromConfig(cwd);
    const audienceMd = renderAudienceReport(verdict, {
      korea,
      override,
      overrideReason: sanitizedReason,
    });
    // D-11 paired-sibling: {artifact-dir}/{artifact-basename}.audience.md.
    const audiencePath = _siblingReportPath(artifactPath, 'audience');
    atomicWriteFileSync(audiencePath, audienceMd, 'utf-8');

    const statePath = planningPaths(cwd).state;
    const at = new Date().toISOString();
    readModifyWriteStateMd(statePath, (content) => {
      const body = stripFrontmatter(content);
      const fm = extractFrontmatter(content) || {};
      if (!fm.brief || typeof fm.brief !== 'object' || Array.isArray(fm.brief)) fm.brief = {};
      if (!fm.brief.last_gate_results || typeof fm.brief.last_gate_results !== 'object') {
        fm.brief.last_gate_results = {};
      }
      fm.brief.last_gate_results.audience = {
        decision: override ? 'AUDIENCE-OK' : verdict.decision,
        severity: verdict.severity,
        findings_count: verdict.findings_count,
        at,
        ...(override ? { override: true, override_reason: sanitizedReason } : {}),
      };
      return `---\n${reconstructFrontmatter(fm)}\n---\n\n${body}`;
    }, cwd);

    return { audiencePath, stateUpdated: true };
  } finally {
    try { fs.unlinkSync(verdictPath); } catch { /* already deleted */ }
  }
}

// ─── Exports ───────────────────────────────────────────────────────────────
module.exports = {
  VALID_DECISIONS,
  VALID_SEVERITIES,
  BAN_EN,
  BAN_KO,
  BAN_SYMBOL,
  HEDGING_EN,
  HEDGING_KO,
  MANDATORY_FRONTMATTER_FIELDS,
  AUDIENCE_TYPE_ENUM,
  CONFIDENTIALITY_ENUM,
  BUSINESS_MODEL_ENUM,
  getFrontmatterField,
  validateVerdict,
  grepBanList,
  computeTermOverlap,
  detectKoreaSignalFromConfig,
  runDeterministicScreen,
  writeVerdict,
  mergeVerdicts,
  runAudience,
  renderAudienceReport,
  commitAudienceVerdict,
  siblingReportPath: _siblingReportPath,
};
