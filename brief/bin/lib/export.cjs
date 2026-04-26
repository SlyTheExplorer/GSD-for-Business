/**
 * Export — /brief-export workflow lib (Plan 08-04 / DLV-08).
 *
 * Architectural keystone of Phase 8's 4-layer audience defense. Implements
 * the 7-step orchestration for every Type B export:
 *
 *   Step 0: Path-traversal guard (audience.cjs lines 336-351 byte-identity).
 *   Step 1: Cross-artifact leakage diff (TF-IDF) BEFORE AUDIENCE re-run.
 *   Step 2: AUDIENCE re-run with NEW export-run-id verdictOutPath.
 *           When severity=blocking → 3-path interrupt (frontmatter / rewrite /
 *           force-accept). force-accept commits via Phase 4 D-07 substrate
 *           (commitAudienceVerdict({override:true, overrideReason})).
 *   Step 3: COMPLIANCE re-run with NEW export-run-id verdictOutPath.
 *   Step 4: 1-step confirm UI (Korean/English variant per region).
 *   Step 5: voice-fit banned-words check (warn-only — Plan 06 agent-side
 *           regenerate is the primary mitigation).
 *   Step 6: Marp render via npx --yes @marp-team/marp-cli@4.3.1 with
 *           env-detect (Chrome/Edge/Firefox) + PDF/HTML fallback ladder.
 *   Step 7: Atomic commit (deferred to Plan 08 workflow level — for export.cjs
 *           we return { ok, output, ranFormat, fallbackReason? }).
 *
 * Layer 1 (filename encoding): {name}.{confidentiality}.{ext} per B-D01.
 * Layer 2 (watermark text): WATERMARKS_EN/KO maps per B-D02.
 * Layer 3 (1-step confirm): formatConfirmUI + askUser harness.
 *
 * Force-accept FIRST live use of Phase 4 D-07 audit-trail substrate via
 * audience.commitAudienceVerdict({override:true, overrideReason}) — STATE.md
 * write happens INSIDE that helper via readModifyWriteStateMd; no direct
 * STATE.md write here.
 *
 * Marp invocation: `npx --yes @marp-team/marp-cli@4.3.1 input -o output [...]`
 * — does NOT add any package to dependencies (A1 zero-runtime-deps preserved).
 * The local-file-access flag MUST NOT be passed to Marp (Pitfall 8 mitigation
 * per RESEARCH.md line 1145; T-08-04-03 in the plan threat register).
 *
 * Refs: 08-04-PLAN.md; 08-RESEARCH.md Code Example 2 (lines 1299-1381),
 * Pattern 1 (lines 397-444), Pattern 4 (lines 480-577), Pattern 8 (lines
 * 973-1047); 08-PATTERNS.md lines 134-244; brief/bin/lib/audience.cjs lines
 * 295-414; brief/workflows/audience-guard.md Steps 5A/5B/6.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync: realSpawnSync } = require('child_process');

const audience = require('./audience.cjs');
const compliance = require('./compliance.cjs');
const { leakageDiff } = require('./leakage-diff.cjs');
const { checkBannedWords } = require('./voice-fit.cjs');
const { extractFrontmatter, stripFrontmatter } = require('./frontmatter.cjs');
const { buildBusinessContext } = require('./context-inject.cjs');
const { planningPaths } = require('./core.cjs');
const { sanitizeForPrompt } = require('./security.cjs');

// ─── Layer 2 — Watermark text mapping (B-D02) ─────────────────────────────
// 4 confidentiality enums × 2 languages = 8 entries.
const WATERMARKS_EN = Object.freeze({
  public: 'Public',
  partner: 'Partner-only — Do not redistribute',
  internal: 'Internal — Do not distribute outside {organization}',
  confidential: 'CONFIDENTIAL — Internal use only — Do not share',
});
const WATERMARKS_KO = Object.freeze({
  public: '공개',
  partner: '파트너 전용 — 재배포 금지',
  internal: '내부용 — {조직명} 외 배포 금지',
  confidential: '기밀 — 내부 사용만 — 공유 금지',
});

function watermarkFor(confidentiality, language) {
  const map = (language === 'ko') ? WATERMARKS_KO : WATERMARKS_EN;
  return map[confidentiality] || map.confidential; // safest default
}

// ─── Path-traversal guard — audience.cjs lines 336-351 byte-identity ─────
// AUDIENCE artifactPath is dynamic; canonicalize via fs.realpathSync (walk
// parents to tolerate not-yet-existing tail) then assert containment under
// .planning/. Throws "path traversal refused: ..." on escape attempts.
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

// ─── detectBrowser — Pattern 4 lines 495-514 verbatim ────────────────────
// Probes for Chrome / Edge / Firefox across darwin / linux / win32. Returns
// { browser, path } when one is found; { browser:null, path:null } otherwise.
// Marp CLI 4 introduced --browser auto fallback (Chrome → Edge → Firefox);
// pre-checking lets exportArtifact ladder PDF→HTML when none is present.
function detectBrowser() {
  const candidates = {
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Firefox.app/Contents/MacOS/firefox',
    ],
    linux: [
      '/usr/bin/google-chrome',
      '/usr/bin/microsoft-edge',
      '/usr/bin/firefox',
      '/usr/bin/chromium-browser',
    ],
    win32: [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    ],
  };
  const list = candidates[process.platform] || [];
  for (const p of list) {
    try {
      if (fs.existsSync(p)) return { browser: path.basename(p), path: p };
    } catch { /* ignore */ }
  }
  return { browser: null, path: null };
}

// ─── detectLibreOffice — Pattern 4 lines 516-524 verbatim ────────────────
// Required ONLY for editable PPTX (--pptx-editable). Default Marp PPTX is
// image-based and does NOT need LibreOffice. Returned as a boolean for
// caller decisioning.
function detectLibreOffice() {
  const candidates = {
    darwin: ['/Applications/LibreOffice.app/Contents/MacOS/soffice'],
    linux: ['/usr/bin/libreoffice', '/usr/bin/soffice'],
    win32: ['C:\\Program Files\\LibreOffice\\program\\soffice.exe'],
  };
  const list = candidates[process.platform] || [];
  return list.some((p) => {
    try { return fs.existsSync(p); } catch { return false; }
  });
}

// ─── renderMarp — Pattern 4 lines 526-575 + env-detect + fallback ladder ─
// inputMd, outputPath, format ('pptx'|'pdf'|'html'), theme (optional),
// allowFallback (default true) → ladder PPTX → PDF → HTML when no browser.
//
// CRITICAL:
//   - Marp local-file-access flag is NEVER added to args (Pitfall 8 mitigation).
//   - 2-min hard timeout (Marp default browser-timeout 30s × ~3 attempts).
//   - First invocation pulls marp-cli + puppeteer-core (~30-60s); cached
//     thereafter (~2-5s).
function renderMarp(cwd, opts) {
  const { inputMd, outputPath, format, theme, allowFallback } = opts;
  const _spawnSync = (opts && opts._spawnSync) || realSpawnSync;
  const _detectBrowser = (opts && opts._detectBrowser) || detectBrowser;

  const browser = _detectBrowser();
  const isPptxOrPdf = format === 'pptx' || format === 'pdf';

  // Format-specific environment requirement
  if (isPptxOrPdf && !browser.browser) {
    if (allowFallback && format === 'pptx') {
      const pdfPath = outputPath.replace(/\.pptx$/i, '.pdf');
      const pdfResult = renderMarp(cwd, {
        inputMd, outputPath: pdfPath, format: 'pdf', theme,
        allowFallback: true, _spawnSync, _detectBrowser,
      });
      if (pdfResult.ok) {
        return { ok: true, ranFormat: 'pdf', outputPath: pdfPath, fallbackReason: 'no Chrome/Edge/Firefox detected' };
      }
    }
    if (allowFallback) {
      const htmlPath = outputPath.replace(/\.(pptx|pdf)$/i, '.html');
      const htmlResult = renderMarp(cwd, {
        inputMd, outputPath: htmlPath, format: 'html', theme,
        allowFallback: false, _spawnSync, _detectBrowser,
      });
      if (htmlResult.ok) {
        return { ok: true, ranFormat: 'html', outputPath: htmlPath, fallbackReason: 'no browser for PPTX/PDF rendering' };
      }
    }
    return {
      ok: false,
      error: 'Marp PPTX/PDF render requires Chrome / Edge / Firefox. None detected. Install one OR use --format html.',
    };
  }

  const args = ['--yes', '@marp-team/marp-cli@4.3.1', inputMd, '-o', outputPath];
  if (theme) args.push('--theme', theme);
  if (format === 'pptx') {
    args.push('--pptx');
    // Default: non-editable (image-based). --pptx-editable would require
    // LibreOffice + browser; not enabled here.
  } else if (format === 'pdf') {
    args.push('--pdf');
  } else if (format === 'html') {
    args.push('--html');
  }

  const result = _spawnSync('npx', args, {
    cwd,
    stdio: 'pipe',
    timeout: 120000, // 2 min hard timeout
    encoding: 'utf-8',
  });

  if (result.status !== 0) {
    return {
      ok: false,
      ranFormat: format,
      outputPath,
      error: result.stderr || `npx exited with code ${result.status}`,
      stderr: result.stderr,
    };
  }
  return { ok: true, ranFormat: format, outputPath, stderr: result.stderr };
}

// ─── runExportGates — Pattern 1 lines 413-441 verbatim ───────────────────
// Separate run-id format `export-${Date.now()}-${process.pid}`. AUDIENCE
// blocking → fail-fast (skip COMPLIANCE per Phase 7 D-02 sequential threading).
// Returns { audienceVerdict, complianceVerdict, blocked, exportRunId,
//           audienceVerdictPath, complianceVerdictPath }.
function runExportGates(cwd, opts) {
  const exportRunId = opts.exportRunId || `export-${Date.now()}-${process.pid}`;
  const baseTmp = planningPaths(cwd).planning;
  const gateFilter = opts._gate || null; // 'audience' | 'compliance' | 'both' | null (null = all gates)

  const runAudience = !gateFilter || gateFilter === 'audience' || gateFilter === 'both';
  const runComplianceGate = !gateFilter || gateFilter === 'compliance' || gateFilter === 'both';

  let audienceVerdict = null;
  let audienceVerdictPath = null;
  if (runAudience) {
    audienceVerdictPath = path.join(baseTmp, `.${exportRunId}.audience-verdict.tmp.json`);
    audienceVerdict = audience.runAudience(cwd, {
      artifact: opts.artifactPath,
      baseline: opts.baselinePath || path.join(baseTmp, 'OBJECTIVES.md'),
      verdictOutPath: audienceVerdictPath,
      llmPass: opts.audienceLlmPass,
    });

    if (audienceVerdict.severity === 'blocking') {
      return {
        audienceVerdict,
        complianceVerdict: null,
        blocked: 'audience',
        exportRunId,
        audienceVerdictPath,
        complianceVerdictPath: null,
      };
    }
  }

  let complianceVerdict = null;
  let complianceVerdictPath = null;
  if (runComplianceGate) {
    complianceVerdictPath = path.join(baseTmp, `.${exportRunId}.compliance-verdict.tmp.json`);
    complianceVerdict = compliance.runCompliance(cwd, {
      artifact: opts.artifactPath,
      baseline: opts.baselinePath || path.join(baseTmp, 'OBJECTIVES.md'),
      verdictOutPath: complianceVerdictPath,
      llmPass: opts.complianceLlmPass,
    });
  }

  return {
    audienceVerdict,
    complianceVerdict,
    blocked: null,
    exportRunId,
    audienceVerdictPath,
    complianceVerdictPath,
  };
}

// ─── formatConfirmUI — Pattern 8 lines 982-1019 (KO/EN variant) ──────────
// Bilingual 1-step confirmation display. KO when language='ko'; EN otherwise.
// Displays 6 fields: Artifact / Audience / Confidentiality / Output / Watermark
// / 3 gate verdicts (AUDIENCE / COMPLIANCE / leakage-diff).
function formatConfirmUI(opts) {
  const {
    artifactPath, fm, leakage, audienceVerdict, complianceVerdict,
    language, outputFilename, watermark,
  } = opts;
  const audienceType = (fm && fm.audience && fm.audience.type) ||
    (fm && fm['audience.type']) || 'unknown';
  const confidentiality = (fm && fm.audience && fm.audience.confidentiality) ||
    (fm && fm['audience.confidentiality']) || 'unknown';
  const audDecision = (audienceVerdict && audienceVerdict.decision) || 'AUDIENCE-OK';
  const compDecision = (complianceVerdict && complianceVerdict.decision) || 'COMPLIANCE-OK';
  const leakCount = (leakage && Array.isArray(leakage.findings)) ? leakage.findings.length : 0;
  const audMark = audDecision === 'AUDIENCE-OK' ? '✓' : '⚠';
  const compMark = compDecision === 'COMPLIANCE-OK' ? '✓' : '⚠';
  const leakMark = leakCount === 0 ? '✓' : '⚠';
  const artifactBase = path.basename(artifactPath || '');

  if (language === 'ko') {
    return [
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      ' BRIEF ► EXPORT 확인',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      ` 산출물:    ${artifactBase}`,
      ` 청중:      ${audienceType}`,
      ` 기밀도:    ${confidentiality}`,
      ` 출력:      ${outputFilename}`,
      ` 워터마크: "${watermark}"`,
      '',
      ` AUDIENCE 게이트: ${audDecision} ${audMark}`,
      ` COMPLIANCE 게이트: ${compDecision} ${compMark}`,
      ` cross-artifact 누설 검사: ${leakCount} finding ${leakMark}`,
      '',
      '── 이 산출물을 render 하시겠습니까? ──',
      ' [예, render] / [아니오, 취소]',
    ].join('\n');
  }

  return [
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    ' BRIEF ► EXPORT CONFIRMATION',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    ` Artifact:        ${artifactBase}`,
    ` Audience:        ${audienceType}`,
    ` Confidentiality: ${confidentiality}`,
    ` Output:          ${outputFilename}`,
    ` Watermark:       "${watermark}"`,
    '',
    ` AUDIENCE gate:                 ${audDecision} ${audMark}`,
    ` COMPLIANCE gate:               ${compDecision} ${compMark}`,
    ` Cross-artifact leakage diff:   ${leakCount} findings ${leakMark}`,
    '',
    '── Render this artifact? ──',
    ' [Yes, render] / [No, cancel]',
  ].join('\n');
}

// ─── exportArtifact — main 7-step orchestration ──────────────────────────
/**
 * @param {string} cwd
 * @param {string} artifactPath  Relative or absolute path under .planning/.
 * @param {object} options
 * @param {string} [options.format='pptx']            'pptx' | 'pdf' | 'html'
 * @param {string} [options.theme]                     Marp theme name or path.
 * @param {boolean} [options.allowFallback=true]       PDF/HTML fallback ladder when browser missing.
 * @param {function} [options.askUser]                 Injected ask-user harness (test mock or workflow wrapper).
 * @param {string|null} [options._gate=null]           DEV-MODE ESCAPE. When set to 'audience' | 'compliance' | 'both' (default null = run BOTH AUDIENCE and COMPLIANCE re-runs), restricts which gate(s) run. Used by `brief-tools export run --gate <name>` for targeted CLI testing. Production workflow leaves this undefined → both gates run sequentially per Phase 7 D-02 fail-fast on AUDIENCE blocking. ALIGN is NOT re-evaluated at export time — it runs at synthesis in workflows/deliver.md Step 3A.3 / 3B.4; export.cjs re-runs only AUDIENCE→COMPLIANCE for export-time staleness detection (08-REVIEW.md WR-03 documentation correction).
 * @param {string|null} [options._forceAcceptOverrideReason=null]  DEV-MODE ESCAPE. When set to a non-empty string AND askUser returns force-accept (option 2), uses this string as overrideReason WITHOUT prompting. Production workflow leaves undefined → askUser asks the user for the reason interactively. Used by `brief-tools export run --force-accept --override-reason "<reason>"` for canary E2E testing of the Phase 4 D-07 audit trail.
 * @param {function} [options._spawnSync]              TEST INJECTION — replaces child_process.spawnSync.
 * @param {function} [options._detectBrowser]          TEST INJECTION — replaces detectBrowser().
 * @returns {{ ok: boolean, output?: string, ranFormat?: string, fallbackReason?: string, reason?: string }}
 */
function exportArtifact(cwd, artifactPath, options) {
  options = options || {};
  const askUser = options.askUser;
  const format = options.format || 'pptx';
  const theme = options.theme;
  const allowFallback = options.allowFallback !== false;
  const _spawnSync = options._spawnSync;
  const _detectBrowser = options._detectBrowser;
  const _gate = options._gate || null;
  const _forceAcceptOverrideReason = options._forceAcceptOverrideReason;

  // ── Step 0: Path-traversal guard ─────────────────────────────────────
  const canonicalArtifactPath = _resolveSafePath(cwd, artifactPath);

  // Read artifact frontmatter early — needed for filename + watermark.
  const artifactContent = fs.readFileSync(canonicalArtifactPath, 'utf-8');
  const fm = extractFrontmatter(artifactContent) || {};
  const conf = (fm.audience && fm.audience.confidentiality) ||
    fm['audience.confidentiality'] || 'confidential';

  // Build business context for KO/EN detection.
  const ctx = buildBusinessContext({ cwd });
  const language = ctx.language || 'en';

  // ── Step 1: Cross-artifact leakage diff ──────────────────────────────
  const leakage = leakageDiff(canonicalArtifactPath);

  // ── Step 2: AUDIENCE re-run (separate run-id) ────────────────────────
  const exportRunId = `export-${Date.now()}-${process.pid}`;
  const baseTmp = planningPaths(cwd).planning;
  const audienceVerdictPath = path.join(baseTmp, `.${exportRunId}.audience-verdict.tmp.json`);

  let audienceVerdict = null;
  if (!_gate || _gate === 'audience' || _gate === 'both') {
    audienceVerdict = audience.runAudience(cwd, {
      artifact: canonicalArtifactPath,
      baseline: path.join(baseTmp, 'OBJECTIVES.md'),
      verdictOutPath: audienceVerdictPath,
      llmPass: options.audienceLlmPass,
    });
  }

  // BLOCKING branch: 3-path interrupt (audience-guard.md Steps 5A/5B/6).
  if (audienceVerdict && audienceVerdict.severity === 'blocking') {
    const interruptPaths = language === 'ko'
      ? ['frontmatter 수정', '데크 다시 쓰기', 'force-accept (audit trail)']
      : ['Edit frontmatter (frontmatter 수정)', 'Rewrite deck (데크 다시 쓰기)', 'force-accept (audit trail)'];

    const choice = askUser({
      title: language === 'ko'
        ? `BRIEF ► EXPORT 차단됨 (AUDIENCE: ${audienceVerdict.decision})`
        : `BRIEF ► EXPORT BLOCKED (AUDIENCE: ${audienceVerdict.decision})`,
      findings: audienceVerdict.findings,
      paths: interruptPaths,
    });

    if (choice === 0) {
      // Path 1 — frontmatter revision. Cleanup tmp and exit.
      try { fs.unlinkSync(audienceVerdictPath); } catch { /* already gone */ }
      return { ok: false, reason: 'user chose frontmatter revision' };
    }
    if (choice === 1) {
      // Path 2 — content rewrite.
      try { fs.unlinkSync(audienceVerdictPath); } catch { /* already gone */ }
      return { ok: false, reason: 'user chose content rewrite' };
    }
    if (choice === 2) {
      // Path 3 — force-accept (audit trail). Get overrideReason.
      let overrideReason;
      if (typeof _forceAcceptOverrideReason === 'string') {
        overrideReason = _forceAcceptOverrideReason;
      } else {
        overrideReason = askUser({
          prompt: language === 'ko'
            ? '승인 사유를 한 문장으로 입력해 주세요 (override_reason). 사유는 STATE.md에 기록됩니다.'
            : 'Enter override reason (will be recorded in STATE.md):',
        });
      }

      const trimmedReason = String(overrideReason || '').trim();
      if (!trimmedReason) {
        try { fs.unlinkSync(audienceVerdictPath); } catch { /* already gone */ }
        return { ok: false, reason: 'override_reason required' };
      }

      // Phase 4 D-07 substrate — override flag + sanitized reason → STATE.md.
      // commitAudienceVerdict ALREADY routes through security.cjs sanitizeForPrompt
      // (audience.cjs line 374) and writes via readModifyWriteStateMd.
      audience.commitAudienceVerdict(cwd, {
        verdictPath: audienceVerdictPath,
        artifactPath: path.relative(cwd, canonicalArtifactPath),
        override: true,
        overrideReason: trimmedReason,
      });
      // Continue with render (force-accepted).
    } else {
      // Unknown choice — treat as cancel.
      try { fs.unlinkSync(audienceVerdictPath); } catch { /* already gone */ }
      return { ok: false, reason: `unknown choice ${choice}` };
    }
  } else if (audienceVerdict) {
    // AUDIENCE-OK path — commit verdict normally (no override).
    audience.commitAudienceVerdict(cwd, {
      verdictPath: audienceVerdictPath,
      artifactPath: path.relative(cwd, canonicalArtifactPath),
    });
  }

  // ── Step 3: COMPLIANCE re-run ────────────────────────────────────────
  let complianceVerdict = null;
  let complianceVerdictPath = null;
  if (!_gate || _gate === 'compliance' || _gate === 'both') {
    complianceVerdictPath = path.join(baseTmp, `.${exportRunId}.compliance-verdict.tmp.json`);
    complianceVerdict = compliance.runCompliance(cwd, {
      artifact: canonicalArtifactPath,
      baseline: path.join(baseTmp, 'OBJECTIVES.md'),
      verdictOutPath: complianceVerdictPath,
      llmPass: options.complianceLlmPass,
    });

    // COMPLIANCE blocking has the same 3-path interrupt branch shape.
    if (complianceVerdict.severity === 'blocking') {
      const interruptPaths = language === 'ko'
        ? ['frontmatter 수정', '데크 다시 쓰기', 'force-accept (audit trail)']
        : ['Edit frontmatter', 'Rewrite deck', 'force-accept (audit trail)'];

      const choice = askUser({
        title: language === 'ko'
          ? `BRIEF ► EXPORT 차단됨 (COMPLIANCE: ${complianceVerdict.decision})`
          : `BRIEF ► EXPORT BLOCKED (COMPLIANCE: ${complianceVerdict.decision})`,
        findings: complianceVerdict.findings,
        paths: interruptPaths,
      });

      if (choice === 0) {
        try { fs.unlinkSync(complianceVerdictPath); } catch { /* already gone */ }
        return { ok: false, reason: 'user chose frontmatter revision (compliance)' };
      }
      if (choice === 1) {
        try { fs.unlinkSync(complianceVerdictPath); } catch { /* already gone */ }
        return { ok: false, reason: 'user chose content rewrite (compliance)' };
      }
      if (choice === 2) {
        let overrideReason;
        if (typeof _forceAcceptOverrideReason === 'string') {
          overrideReason = _forceAcceptOverrideReason;
        } else {
          overrideReason = askUser({
            prompt: language === 'ko'
              ? '승인 사유를 한 문장으로 입력해 주세요 (override_reason).'
              : 'Enter override reason:',
          });
        }
        const trimmedReason = String(overrideReason || '').trim();
        if (!trimmedReason) {
          try { fs.unlinkSync(complianceVerdictPath); } catch { /* already gone */ }
          return { ok: false, reason: 'override_reason required' };
        }
        compliance.commitComplianceVerdict(cwd, {
          verdictPath: complianceVerdictPath,
          artifactPath: path.relative(cwd, canonicalArtifactPath),
          override: true,
          overrideReason: trimmedReason,
        });
      } else {
        try { fs.unlinkSync(complianceVerdictPath); } catch { /* already gone */ }
        return { ok: false, reason: `unknown choice (compliance) ${choice}` };
      }
    } else {
      compliance.commitComplianceVerdict(cwd, {
        verdictPath: complianceVerdictPath,
        artifactPath: path.relative(cwd, canonicalArtifactPath),
      });
    }
  }

  // ── Step 4: 1-step confirm UI ────────────────────────────────────────
  const baseName = path.basename(canonicalArtifactPath, '.md');
  const outputFilename = `${baseName}.${conf}.${format}`;
  const folder = path.dirname(canonicalArtifactPath);
  const outPath = path.join(folder, outputFilename);
  const watermark = watermarkFor(conf, language);

  const confirmBody = formatConfirmUI({
    artifactPath: canonicalArtifactPath,
    fm,
    leakage,
    audienceVerdict,
    complianceVerdict,
    language,
    outputFilename,
    watermark,
  });

  const confirmation = askUser({
    title: language === 'ko'
      ? `BRIEF ► EXPORT 확인 (region: ${ctx.region || 'unknown'})`
      : 'BRIEF ► EXPORT CONFIRMATION',
    body: confirmBody,
    paths: language === 'ko' ? ['예, render', '아니오, 취소'] : ['Yes, render', 'No, cancel'],
  });
  if (confirmation !== 0) {
    return { ok: false, reason: 'user cancelled' };
  }

  // ── Step 5: voice-fit check (Type B external — warn-only) ────────────
  // Plan 06 agent-side regenerate is the primary mitigation; here we just
  // emit a stderr warning so the user/operator notices.
  if (conf === 'partner' || conf === 'public' || conf === 'external') {
    const body = stripFrontmatter(artifactContent);
    try {
      const fit = checkBannedWords(body, {
        isKorean: language === 'ko',
        isExternal: true,
      });
      if (fit.exceedsThreshold) {
        process.stderr.write(
          `[brief-export] voice-fit warning: banned-words density ${fit.density.toFixed(2)} exceeds threshold ${fit.threshold} ` +
          `(${fit.hits.length} hit(s) across ${fit.pages} page(s)). Plan 06 agent regenerate handles this; render proceeds.\n`,
        );
      }
    } catch { /* voice-fit failure is non-fatal */ }
  }

  // ── Step 6: Marp render via npx --yes ────────────────────────────────
  const renderResult = renderMarp(cwd, {
    inputMd: canonicalArtifactPath,
    outputPath: outPath,
    format,
    theme,
    allowFallback,
    _spawnSync,
    _detectBrowser,
  });

  if (!renderResult.ok) {
    return {
      ok: false,
      reason: renderResult.error || 'Marp render failed',
      ranFormat: renderResult.ranFormat,
    };
  }

  // ── Step 7: atomic commit deferred to Plan 08 workflow level ─────────
  // Plan 08 wires: source.md + .audience.md + .compliance.md + .{conf}.{ext}
  // + STATE.md = 1 commit through brief-tools.cjs atomic primitive.
  return {
    ok: true,
    output: renderResult.outputPath,
    ranFormat: renderResult.ranFormat,
    fallbackReason: renderResult.fallbackReason,
    audienceVerdict,
    complianceVerdict,
    leakage,
  };
}

module.exports = {
  exportArtifact,
  runExportGates,
  renderMarp,
  detectBrowser,
  detectLibreOffice,
  formatConfirmUI,
  watermarkFor,
  WATERMARKS_EN,
  WATERMARKS_KO,
};
