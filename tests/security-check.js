#!/usr/bin/env node
/**
 * Static security analysis for index.html
 *
 * Purpose: Verify that index.html contains no patterns that could
 * exfiltrate user data to external servers (data leakage prevention).
 *
 * All checks are static source code analysis — no network access required.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const TARGET = path.resolve(__dirname, '..', 'index.html');

// ─── helpers ──────────────────────────────────────────────────────────────────

function readTarget() {
  if (!fs.existsSync(TARGET)) {
    console.error(`ERROR: Target file not found: ${TARGET}`);
    process.exit(2);
  }
  return fs.readFileSync(TARGET, 'utf-8');
}

/**
 * Returns all non-overlapping matches of `pattern` in `text`.
 * Always adds the 'g' flag so exec() advances.
 */
function allMatches(text, pattern) {
  const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g';
  const re = new RegExp(pattern.source, flags);
  const found = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    found.push(m[0].replace(/\s+/g, ' ').trim());
  }
  return found;
}

// ─── check runner ─────────────────────────────────────────────────────────────

const results = [];

/**
 * Assert that `pattern` does NOT appear in the file content.
 * @param {string}  name    Human-readable check name
 * @param {RegExp}  pattern Pattern that must NOT match
 * @param {string}  reason  Explanation of the security risk
 */
function forbid(name, pattern, reason) {
  const matches = allMatches(content, pattern);
  results.push({ name, passed: matches.length === 0, reason, matches });
}

// ─── load file ────────────────────────────────────────────────────────────────

const content = readTarget();

// ─── checks ───────────────────────────────────────────────────────────────────

// [1] Self-containment: no <script src="..."> at all (inline-only JS)
forbid(
  '[1] No <script src> — JS must be inline',
  /<script[^>]+src\s*=/i,
  '<script src> loads external or local JS files; all JS must be inline to prevent supply-chain attacks.'
);

// [2] No external stylesheets or font services
forbid(
  '[2] No external <link href>',
  /<link[^>]+href\s*=\s*["']https?:\/\//i,
  'External <link> loads resources from third-party servers (CDN fonts, stylesheets) that can track users.'
);

// [3] No XMLHttpRequest (XHR)
forbid(
  '[3] No XMLHttpRequest',
  /new\s+XMLHttpRequest\s*\(\s*\)/i,
  'XHR can send arbitrary data to external servers.'
);

// [4] No WebSocket connections
forbid(
  '[4] No WebSocket',
  /new\s+WebSocket\s*\(/i,
  'WebSocket opens a persistent channel to an external server, enabling real-time data leakage.'
);

// [5] No navigator.sendBeacon
forbid(
  '[5] No navigator.sendBeacon',
  /navigator\s*\.\s*sendBeacon\s*\(/i,
  'sendBeacon is designed for analytics/tracking beacons and sends data to a server.'
);

// [6] No fetch() with data-sending HTTP methods
forbid(
  '[6] No fetch() with POST / PUT / DELETE / PATCH',
  /method\s*:\s*['"`](POST|PUT|DELETE|PATCH)['"`]/i,
  'These HTTP methods send a request body to a server, enabling data exfiltration.'
);

// [7] No fetch() with a request body option
// Uses dotAll (s flag) to match across lines.
forbid(
  '[7] No fetch() with request body',
  /fetch\s*\([^;]*\{[^}]*\bbody\s*:/s,
  'A fetch() call with a body option sends user data to the target URL.'
);

// [8] No fetch() with a hardcoded external URL
forbid(
  '[8] No fetch() with hardcoded external URL',
  /fetch\s*\(\s*['"`]https?:\/\//i,
  'A hardcoded external URL in fetch() indicates a fixed third-party endpoint receiving requests.'
);

// [9] No external <img> (tracking pixels)
forbid(
  '[9] No external <img src> (tracking pixel)',
  /<img[^>]+src\s*=\s*["']https?:\/\//i,
  'External images are a classic 1×1 tracking pixel technique.'
);

// [10] No <form> submitting to an external URL
forbid(
  '[10] No <form action> to external URL',
  /<form[^>]+action\s*=\s*["']https?:\/\//i,
  'A form with an external action submits user input to a third-party server.'
);

// [11] No external <iframe>
forbid(
  '[11] No external <iframe src>',
  /<iframe[^>]+src\s*=\s*["']https?:\/\//i,
  'External iframes can embed trackers or exfiltrate data via postMessage.'
);

// [12] No dynamic import() from external URLs
forbid(
  '[12] No dynamic import() from external URL',
  /\bimport\s*\(\s*['"`]https?:\/\//i,
  'Dynamic import from an external URL loads and executes third-party code.'
);

// [13] No hardcoded non-localhost external URL strings in JS
//  (catches accidental leftover API endpoints; excludes comments and string literals
//   that are clearly schema/documentation, e.g. "https://example.com/…")
//  We look for https?:// that appear inside JS string literals (quoted).
forbid(
  '[13] No hardcoded external URL strings in JS',
  /(?<!=\s*['"`][^'"`]*)\bfetch\s*\(\s*`https?:\/\//i,
  'Template-literal URL in fetch() hardcodes an external endpoint.'
);

// ─── report ───────────────────────────────────────────────────────────────────

console.log(`\nSecurity check: ${TARGET}\n${'─'.repeat(60)}`);

let passed = 0;
let failed = 0;

for (const r of results) {
  if (r.passed) {
    console.log(`  ✓  ${r.name}`);
    passed++;
  } else {
    console.error(`  ✗  ${r.name}`);
    console.error(`     Reason : ${r.reason}`);
    r.matches.slice(0, 3).forEach(m => console.error(`     Found  : ${JSON.stringify(m)}`));
    failed++;
  }
}

console.log(`${'─'.repeat(60)}`);
console.log(`Result: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
