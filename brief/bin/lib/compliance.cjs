/**
 * Compliance — COMPLIANCE gate primitives (Plan 07-01, third canonical instance
 * after Phase 4 ALIGN + Phase 5 AUDIENCE; gap-detect is the fourth in spirit).
 * Duplicate-renamed from audience.cjs per 07-CONTEXT.md decisions D-01..D-04 and
 * 07-RESEARCH.md §"3-output verdict, paired-sibling, vocabulary-lock canonical
 * shape." Phase 7 D-01 lock: 3-output verdict
 *   COMPLIANCE-OK / FINDINGS-MATERIAL / FINDINGS-BLOCKING.
 *
 * LOAD-BEARING DEVIATION (Phase 7 D-01) in `mergeVerdicts`: material findings
 * yield FINDINGS-MATERIAL — NOT collapsed to OK as Phase 4/5 do. CC-01 mandates
 * findings on every artifact regardless of severity; the legal-counsel
 * disclaimer must render even on non-blocking gaps. The structural test
 * tests/brief-compliance-merge-rule.test.cjs asserts this deviation.
 *
 * Zero runtime deps (A1). Refs: 07-CONTEXT.md D-01..D-04;
 * 07-RESEARCH.md lines 152-235.
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
const { siblingReportPath: _siblingReportPath } = require('./audience.cjs'); // reuse canonical helper (gap-detect.cjs precedent)
const { buildBusinessContext } = require('./context-inject.cjs');
const { renderComplianceReport } = require('./compliance-report.cjs');

// Enum constants — sourced from brief/references/compliance-vocabulary.md.
// Phase 7 D-01: verdict enum is COMPLIANCE-OK / FINDINGS-MATERIAL / FINDINGS-BLOCKING.
const VALID_DECISIONS = new Set(['COMPLIANCE-OK', 'FINDINGS-MATERIAL', 'FINDINGS-BLOCKING']);
const VALID_SEVERITIES = new Set(['blocking', 'material', 'nice-to-have']);
// EN ban-list extends Phase 5 audience: adds "compliance verified" and "audit complete".
const BAN_EN = /\b(compliant|passed|violation|failed|compliance verified|audit complete)\b/gi;
// KO ban-list extends Phase 5 audience: adds "감사 완료" and "컴플라이언스 확인 완료".
const BAN_KO = /(준수|통과|위반|실패|감사 완료|컴플라이언스 확인 완료)/g;
const BAN_SYMBOL = /[✅✓✗]/g;

// Severity ordering for max-merge.
const SEVERITY_ORDER = { blocking: 3, material: 2, 'nice-to-have': 1 };

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
    // CC-01 clause-level extension fields are optional. When present, validate type-string.
    for (const opt of ['regulation_clause', 'required_evidence', 'found_in_artifact', 'gap']) {
      if (f[opt] !== undefined && typeof f[opt] !== 'string') {
        return `findings[${i}].${opt} present but not string`;
      }
    }
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

// ─── runDeterministicScreen (07-RESEARCH.md lines 193-201) ─────────────────
// 3 sub-screens:
//   (a) Pack-applicability — empty packs + no Korea signal → COMPLIANCE-OK pass-through
//   (b) PIPA hard-required-evidence — packs include PIPA + artifact mentions personal-data
//                                     terms + lacks CPO/consent evidence → FINDINGS-BLOCKING
//                                     B2B SaaS without consumer-data tokens AND artifacts
//                                     containing explicit denial patterns ("No PII collected",
//                                     "개인정보 미수집") are EXEMPT to prevent CEO-liability
//                                     credibility-gradient false-positives (Risk Notes
//                                     mitigation per 07-CONTEXT.md / 07-02-PLAN Test 3).
//   (c) Ban-list grep — additive material findings (no short-circuit)
//
// Polymorphic signature (Plan 07-02 Task 2 contract):
//   runDeterministicScreen(cwd, opts)  — legacy form used by Plan 01 / Phase-4 sibling
//   runDeterministicScreen(opts)       — single-arg form per 07-02-PLAN Task 2
// Both forms accept opts = { artifact, baseline, businessContext, cwd? }.
function runDeterministicScreen(...args) {
  let cwd, artifact, baseline, businessContext;
  if (args.length === 1) {
    const o = args[0] || {};
    artifact = o.artifact;
    baseline = o.baseline;
    businessContext = o.businessContext;
    cwd = o.cwd || process.cwd();
  } else {
    cwd = args[0];
    const o = args[1] || {};
    artifact = o.artifact;
    baseline = o.baseline;
    businessContext = o.businessContext;
  }

  const findings = [];
  // Korea signal preference: businessContext.region trumps state-file detection.
  // Plan-01 callers pass cwd-only; Plan-02 callers pass businessContext directly.
  let korea;
  if (businessContext && typeof businessContext.region === 'string') {
    korea = businessContext.region === 'kr';
  } else {
    korea = detectKoreaSignalFromConfig(cwd);
  }
  const ctx = businessContext || buildBusinessContext({ cwd });
  const packs = Array.isArray(ctx.compliance_packs) ? ctx.compliance_packs : [];
  const businessModel = typeof ctx.business_model === 'string' ? ctx.business_model : null;
  const artifactContent = fs.readFileSync(artifact, 'utf-8');

  // Screen (a): Pack-applicability check.
  // Empty packs AND no Korea signal AND no Korean prose → pass-through COMPLIANCE-OK.
  const hasKoreanProse = /[\uac00-\ud7af]{2,}/.test(artifactContent);
  if (packs.length === 0 && !korea && !hasKoreanProse) {
    const passThrough = {
      severity: 'nice-to-have',
      location: 'baseline',
      description: korea
        ? '적용 가능한 compliance pack이 선언되지 않았습니다 — pass-through 모드로 게이트가 실행되었습니다 (no applicable compliance packs).'
        : 'No applicable compliance packs declared; gate ran in pass-through mode.',
    };
    return {
      verdict: {
        decision: 'COMPLIANCE-OK',
        severity: 'nice-to-have',
        findings_count: 1,
        findings: [passThrough],
        rationale: 'Pack-applicability pass-through (Screen a)',
      },
      findings: [passThrough],
      short_circuited: true,
    };
  }

  // Screen (b): PIPA hard-required-evidence.
  // When packs include PIPA AND artifact mentions personal-data terms AND artifact
  // lacks CPO/consent/breach-notification evidence → blocking finding,
  // short-circuit to FINDINGS-BLOCKING.
  //
  // FALSE-POSITIVE GUARD (Risk Notes / Plan 07-02 Task 2 Test 3): if artifact
  // contains an explicit personal-data DENIAL pattern (e.g., "No PII collected",
  // "PII-free", "개인정보 미수집") AND the business_model is non-consumer
  // (enterprise / b2b), the screen does NOT short-circuit — it lets the LLM
  // pass adjudicate. This prevents CEO-liability credibility-gradient
  // degradation when a B2B SaaS infra artifact merely uses "PII" to declare
  // its absence.
  if (packs.includes('PIPA')) {
    // Personal-data POSITIVE signals — broadened to require contextual usage,
    // not just lexical presence. "PII" alone matches; we then check denial.
    const personalDataRe = /(PII|personal information|customer data|biometric|location data|sensitive data|개인정보|위치정보|민감정보)/i;
    const evidenceRe = /(CPO|개인정보보호책임자|breach notification|침해 통지|consent|동의)/i;
    // Denial patterns: explicit declarations that the artifact's system does
    // NOT process the regulated category. Catches "No PII", "PII-free",
    // "no personal data", "no PII collected", "개인정보 없음", "개인정보 미수집".
    const denialRe = /\b(no PII\b|PII-free\b|no personal data\b|no PII collected\b|does not collect PII\b|does not process personal data\b|no personally identifiable information\b)|개인정보(?:\s+)?(?:없음|미수집|수집하지\s*않)/i;
    const isNonConsumerBM = businessModel === 'enterprise' || businessModel === 'b2b';

    const personalDataMatch = personalDataRe.test(artifactContent);
    const evidenceMatch = evidenceRe.test(artifactContent);
    const denialMatch = denialRe.test(artifactContent);

    // Suppress Screen (b) blocking when:
    //   - artifact has explicit denial pattern AND business_model is non-consumer, OR
    //   - artifact has explicit denial pattern AND has no consumer-positive signals
    //     beyond the PII keyword itself.
    const consumerPositiveRe = /(결제|customer signup|user registration|회원가입|consumer|end[-\s]?user data|subscriber|회원)/i;
    const hasConsumerPositive = consumerPositiveRe.test(artifactContent);
    const suppressByDenial = denialMatch && (isNonConsumerBM || !hasConsumerPositive);

    if (personalDataMatch && !evidenceMatch && !suppressByDenial) {
      const pipaFinding = {
        severity: 'blocking',
        location: `${path.basename(artifact)}:body`,
        description: korea
          ? '개인정보 처리 의무 사항에 대한 증거 부족: CPO 정책, 동의 관리, 침해 통지 절차가 artifact에 명시되어 있지 않습니다.'
          : 'Personal-information processing obligations lack evidence: CPO policy, consent management, breach notification procedures not documented in artifact.',
        regulation_clause: 'PIPA Art. 28-8',
        required_evidence: 'CPO appointment + consent management evidence',
        found_in_artifact: korea
          ? 'artifact에서 개인정보 처리 관련 용어 발견 (CPO/동의/침해 통지 명시 부족)'
          : 'artifact mentions personal-data processing terms (no CPO / consent / breach-notification evidence)',
        gap: korea
          ? 'CPO 임명, 동의 관리 정책, 침해 통지 절차에 대한 명시적 증거 부재'
          : 'No explicit evidence of CPO appointment, consent management policy, or breach notification procedures',
      };
      findings.push(pipaFinding);
      return {
        verdict: {
          decision: 'FINDINGS-BLOCKING',
          severity: 'blocking',
          findings_count: findings.length,
          findings,
          rationale: 'PIPA Art. 28-8 hard-required-evidence missing (Screen b)',
        },
        findings,
        short_circuited: true,
      };
    }
  }

  // Screen (c): Ban-list grep on artifact body. Additive material findings.
  const banHits = grepBanList(artifact);
  for (const hit of banHits) {
    findings.push({
      severity: 'material',
      location: hit.location,
      description: korea
        ? `금지 표현 감지 — 명확한 findings 언어로 다시 써주세요 (forbidden vocabulary): '${hit.token}'`
        : `Forbidden vocabulary detected — rewrite with findings language: '${hit.token}'`,
    });
  }

  return { verdict: null, findings, short_circuited: false };
}

// ─── writeVerdict ──────────────────────────────────────────────────────────
function writeVerdict(verdictPath, verdictObject) {
  const err = validateVerdict(verdictObject);
  if (err) throw new Error(`COMPLIANCE verdict invalid: ${err}`);
  const serialized = JSON.stringify(verdictObject, null, 2);
  atomicWriteFileSync(verdictPath, serialized, 'utf-8');
}

// ─── mergeVerdicts (LOAD-BEARING DEVIATION from Phase 4/5) ─────────────────
// Phase 7 D-01 deviation from Phase 4/5: material findings preserve distinct
// FINDINGS-MATERIAL state per CC-01. Phase 4 ALIGN + Phase 5 AUDIENCE collapse
// material+nice-to-have into the prior gates' OK verdicts; Phase 7 keeps them
// distinct because the legal-counsel disclaimer must render even on non-blocking gaps.
// Reference: 07-RESEARCH.md lines 224-235.
function mergeVerdicts(detFindings, llmVerdict) {
  const llm = llmVerdict || {
    decision: 'COMPLIANCE-OK',
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

  // Phase 7 D-01 deviation from Phase 4/5: material findings preserve distinct FINDINGS-MATERIAL state per CC-01
  let decision;
  if (maxSev === 'blocking') decision = 'FINDINGS-BLOCKING';
  else if (maxSev === 'material') decision = 'FINDINGS-MATERIAL';
  else decision = 'COMPLIANCE-OK';

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

// ─── runCompliance (entry point for workflow + tests) ──────────────────────
// opts: { artifact, baseline, verdictOutPath?, llmPass?, businessContext? }
// Read-only contract: artifact/baseline MUST NOT be mutated.
function runCompliance(cwd, opts) {
  const artifact = opts.artifact;
  const baseline = opts.baseline;
  const verdictOutPath =
    opts.verdictOutPath ||
    path.join(planningPaths(cwd).planning, '.compliance-verdict.tmp.json');
  const llmPass = opts.llmPass;
  const businessContext = opts.businessContext || buildBusinessContext({ cwd });

  const screen = runDeterministicScreen(cwd, { artifact, baseline, businessContext });
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
      businessContext,
      alreadyKnownFindings: screen.findings,
    });
  }

  const merged = mergeVerdicts(screen.findings, llmVerdict);
  writeVerdict(verdictOutPath, merged);
  return merged;
}

// ─── _resolveSafePath (path-traversal guard) ───────────────────────────────
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

// ─── commitComplianceVerdict ───────────────────────────────────────────────
// Renders {artifact}.compliance.md as a paired-sibling, updates
// state.brief.last_gate_results.compliance atomically, deletes verdict tmp.
function commitComplianceVerdict(cwd, opts) {
  const verdictPath = _resolveSafePath(cwd, opts.verdictPath);
  if (!opts.artifactPath) {
    throw new Error('commitComplianceVerdict requires opts.artifactPath (paired-sibling)');
  }
  const artifactPath = _resolveSafePath(cwd, opts.artifactPath);
  const override = !!opts.override;
  const rawReason = override ? String(opts.overrideReason || '').trim() : '';
  if (override && !rawReason) throw new Error('overrideReason required when override=true');
  const sanitizedReason = override ? sanitizeForPrompt(rawReason) : '';

  try {
    const verdict = JSON.parse(fs.readFileSync(verdictPath, 'utf-8'));
    const err = validateVerdict(verdict);
    if (err) throw new Error(`COMPLIANCE verdict invalid: ${err}`);

    const korea = detectKoreaSignalFromConfig(cwd);
    const ctx = buildBusinessContext({ cwd });
    const packs = Array.isArray(ctx.compliance_packs) ? ctx.compliance_packs : [];
    const complianceMd = renderComplianceReport(verdict, {
      korea,
      override,
      overrideReason: sanitizedReason,
      packs,
    });
    // Paired-sibling: {artifact-dir}/{artifact-basename}.compliance.md
    const compliancePath = _siblingReportPath(artifactPath, 'compliance');
    atomicWriteFileSync(compliancePath, complianceMd, 'utf-8');

    const statePath = planningPaths(cwd).state;
    const at = new Date().toISOString();
    readModifyWriteStateMd(statePath, (content) => {
      const body = stripFrontmatter(content);
      const fm = extractFrontmatter(content) || {};
      if (!fm.brief || typeof fm.brief !== 'object' || Array.isArray(fm.brief)) fm.brief = {};
      if (!fm.brief.last_gate_results || typeof fm.brief.last_gate_results !== 'object') {
        fm.brief.last_gate_results = {};
      }
      fm.brief.last_gate_results.compliance = {
        decision: override ? 'COMPLIANCE-OK' : verdict.decision,
        severity: verdict.severity,
        findings_count: verdict.findings_count,
        at,
        ...(override ? { override: true, override_reason: sanitizedReason } : {}),
      };
      return `---\n${reconstructFrontmatter(fm)}\n---\n\n${body}`;
    }, cwd);

    return { compliancePath, stateUpdated: true };
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
  validateVerdict,
  grepBanList,
  detectKoreaSignalFromConfig,
  runDeterministicScreen,
  writeVerdict,
  mergeVerdicts,
  runCompliance,
  commitComplianceVerdict,
  siblingReportPath: _siblingReportPath,
};
