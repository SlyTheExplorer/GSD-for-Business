/**
 * yaml-mini — inline full-document YAML parser (zero-deps, closed grammar).
 *
 * Supports:
 *   - Scalars: string (quoted/unquoted), number (int/float), boolean, null (`null` or `~`)
 *   - Block lists of scalars: `key:\n  - item\n  - item`
 *   - Inline lists of scalars: `key: [a, b, c]` (quote-aware split)
 *   - Nested maps (≤ MAX_DEPTH levels deep)
 *
 * Does NOT support: YAML 1.2 anchors (&, *), tags (!!str), multi-doc (--- mid-stream),
 * merge keys (<<:), arrays of maps (not required by D-13 workstream-spec schema).
 *
 * Security posture:
 *   - T-02-05-01 Tampering: all result containers are `Object.create(null)`; the
 *     reserved keys `__proto__`, `constructor`, `prototype` cause a throw.
 *   - T-02-05-03 Denial of Service: depth cap via MAX_DEPTH; input size cap via
 *     MAX_INPUT_BYTES; both throw descriptive errors.
 */

'use strict';

const MAX_DEPTH = 10;
const MAX_INPUT_BYTES = 64 * 1024;
const RESERVED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function splitInlineArray(body) {
  const items = [];
  let current = '';
  let inQuote = null;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inQuote) {
      if (ch === inQuote) inQuote = null;
      else current += ch;
    } else if (ch === '"' || ch === "'") {
      inQuote = ch;
    } else if (ch === ',') {
      const trimmed = current.trim();
      if (trimmed) items.push(coerceScalar(trimmed));
      current = '';
    } else {
      current += ch;
    }
  }
  const trimmed = current.trim();
  if (trimmed) items.push(coerceScalar(trimmed));
  return items;
}

function coerceScalar(raw) {
  if (raw === undefined || raw === null) return null;
  const s = String(raw);
  // Quoted strings retain inner text as a string regardless of content.
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  if (s === 'null' || s === '~') return null;
  if (s === 'true') return true;
  if (s === 'false') return false;
  // Integer
  if (/^-?\d+$/.test(s)) {
    const n = parseInt(s, 10);
    if (Number.isFinite(n)) return n;
  }
  // Float
  if (/^-?\d+\.\d+$/.test(s)) {
    const n = parseFloat(s);
    if (Number.isFinite(n)) return n;
  }
  return s;
}

function assignKey(obj, key, value) {
  if (RESERVED_KEYS.has(key)) {
    throw new Error(
      `yaml-mini: reserved key "${key}" rejected (prototype-pollution guard T-02-05-01)`
    );
  }
  obj[key] = value;
}

function parseYamlDocument(yamlString) {
  if (typeof yamlString !== 'string') {
    throw new Error('yaml-mini: input must be a string');
  }
  if (Buffer.byteLength(yamlString, 'utf8') > MAX_INPUT_BYTES) {
    throw new Error(
      `yaml-mini: input exceeds ${MAX_INPUT_BYTES}-byte cap (denial-of-service guard T-02-05-03)`
    );
  }

  const root = Object.create(null);
  const lines = yamlString.split(/\r?\n/);

  // stack frames: { obj, pendingKey, indent }
  //   obj         — container (map or array) to write into
  //   pendingKey  — key whose value is being populated on subsequent lines
  //   indent      — indentation threshold; popping happens when a line is at or below
  const stack = [{ obj: root, pendingKey: null, indent: -1 }];

  for (let ln = 0; ln < lines.length; ln++) {
    const line = lines[ln];
    // Skip empty/comment-only lines.
    const stripped = line.replace(/\s+$/, '');
    if (stripped === '') continue;
    if (/^\s*#/.test(stripped)) continue;

    const indent = stripped.match(/^(\s*)/)[1].length;

    // Pop stack frames whose indent is >= current indent (we're moving up or sideways).
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    if (stack.length > MAX_DEPTH) {
      throw new Error(
        `yaml-mini: nesting exceeds MAX_DEPTH (${MAX_DEPTH}) at line ${ln + 1} ` +
        `(denial-of-service guard T-02-05-03)`
      );
    }

    const current = stack[stack.length - 1];
    const trimmed = stripped.trim();

    // List item: `- value`
    if (trimmed.startsWith('- ') || trimmed === '-') {
      const itemRaw = trimmed === '-' ? '' : trimmed.slice(2).trim();
      // If current.obj is a placeholder map created for a pending key, convert it to array.
      if (current.pendingKey !== null) {
        // Parent frame holds the map; current frame holds the placeholder.
        const parent = stack[stack.length - 2];
        if (parent && parent.obj[current.pendingKey] !== undefined) {
          // Only convert if it's still an empty placeholder.
          const existing = parent.obj[current.pendingKey];
          if (!Array.isArray(existing) && typeof existing === 'object' && Object.keys(existing).length === 0) {
            parent.obj[current.pendingKey] = [];
            current.obj = parent.obj[current.pendingKey];
          }
        }
      }
      if (Array.isArray(current.obj)) {
        current.obj.push(coerceScalar(itemRaw));
      } else {
        throw new Error(
          `yaml-mini: unexpected list item at line ${ln + 1} — parent is not an array`
        );
      }
      continue;
    }

    // Key: value line
    const keyMatch = trimmed.match(/^([a-zA-Z0-9_][a-zA-Z0-9_-]*):\s*(.*)$/);
    if (!keyMatch) {
      // Reserved keys like __proto__ start with underscores too; check explicitly.
      const reservedMatch = trimmed.match(/^(__proto__|constructor|prototype):\s*(.*)$/);
      if (reservedMatch) {
        throw new Error(
          `yaml-mini: reserved key "${reservedMatch[1]}" rejected (prototype-pollution guard T-02-05-01)`
        );
      }
      throw new Error(
        `yaml-mini: cannot parse line ${ln + 1}: ${JSON.stringify(line)}`
      );
    }

    const key = keyMatch[1];
    const rawValue = keyMatch[2];

    if (Array.isArray(current.obj)) {
      throw new Error(
        `yaml-mini: unexpected key "${key}" at line ${ln + 1} — parent is an array`
      );
    }

    if (rawValue === '') {
      // Key with no inline value → container follows on nested lines.
      const placeholder = Object.create(null);
      assignKey(current.obj, key, placeholder);
      stack.push({ obj: placeholder, pendingKey: key, indent });
      continue;
    }

    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      // Inline list.
      const arr = splitInlineArray(rawValue.slice(1, -1));
      assignKey(current.obj, key, arr);
      continue;
    }

    // Scalar value (coerce).
    assignKey(current.obj, key, coerceScalar(rawValue));
  }

  return root;
}

module.exports = { parseYamlDocument };
