'use strict';

/**
 * DSC-01 structural verification: /brief-discover workflow presents 9 default
 * research categories + "Other" via AskUserQuestion multi-select, with a
 * TEXT_MODE numbered-list fallback (FND-06 parity).
 *
 * These tests audit the WORKFLOW MARKDOWN (brief/workflows/discover.md);
 * runtime execution of AskUserQuestion is a Plan 08 canary E2E concern.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const WORKFLOW = path.join(__dirname, '..', 'brief/workflows/discover.md');
const body = fs.readFileSync(WORKFLOW, 'utf-8');

test('Workflow exists and references AskUserQuestion for multi-select', () => {
  assert.ok(fs.existsSync(WORKFLOW));
  assert.match(body, /<askuserquestion>/i);
  assert.match(body, /<multiSelect>true<\/multiSelect>/);
});

test('All 9 default categories are enumerated (DSC-01)', () => {
  const required = [
    /Market Sizing/,
    /Competitor Landscape/,
    /Customer Research/,
    /Regulation.*Compliance/,
    /Technology.*Feasibility/,
    /Distribution Channels/,
    /Pricing Benchmarks/,
    /Case Studies/,
    /Trends.*Forecasts/,
  ];
  for (const re of required) {
    assert.match(body, re, `workflow missing category: ${re}`);
  }
});

test('Zero-selection re-prompt rule exists', () => {
  assert.match(body, /최소 한 개 이상|Please pick at least one/);
});

test('TEXT_MODE numbered-list fallback exists for multi-select', () => {
  // The numbered list 1..9 should appear in the workflow markdown
  assert.match(body, /1\.\s*Market Sizing|1\.\s*Competitor/);
  assert.match(body, /10\.\s*Other/);
  assert.match(body, /쉼표|comma-separated/);
});
