#!/usr/bin/env node
// Fails if any workflow JSON under workflows/ still contains credentials,
// tokens, tenant links, webhook URLs or email addresses.
// Usage: node scripts/check-redaction.mjs [dir=workflows]
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const PLACEHOLDER = /\{\{[A-Z0-9_]+\}\}/;
const RULES = [
  ["api-key", /\b(sk-|ghp_|gho_|github_pat_|xox[abpr]-|AKIA)[A-Za-z0-9_-]{12,}/],
  ["bearer-token", /Bearer\s+(?!\{\{)[A-Za-z0-9._-]{12,}/],
  ["lark-token", /\b[tu]-[a-z0-9]{20,}/i],
  ["lark-app-id", /\bcli_[a-z0-9]{12,}/],
  ["lark-tenant-url", /https?:\/\/(?!open\.)[a-z0-9-]+\.(feishu\.cn|larksuite\.com)\/(base|wiki|docx|sheets)\/[A-Za-z0-9]{10,}/],
  ["webhook-url", /https?:\/\/[^\s"']*\/hook\/(?!\{\{)[A-Za-z0-9-]{8,}/],
  ["email", /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/],
];

function* walk(value, at) {
  if (typeof value === "string") yield [at, value];
  else if (Array.isArray(value)) for (const [i, v] of value.entries()) yield* walk(v, `${at}[${i}]`);
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) yield* walk(v, at ? `${at}.${k}` : k);
}

/** @returns {{rule: string, path: string}[]} never includes the matched value */
export function findLeaks(json) {
  const doc = JSON.parse(json);
  const leaks = [];
  for (const [at, s] of walk(doc, "")) {
    if (/\.credentials\.[^.]+\.id$/.test(at)) {
      if (!PLACEHOLDER.test(s)) leaks.push({ rule: "credential-id", path: at });
      continue;
    }
    for (const [rule, re] of RULES) if (re.test(s)) leaks.push({ rule, path: at });
  }
  return leaks;
}

async function* jsonFiles(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* jsonFiles(p);
    else if (e.name.endsWith(".json")) yield p;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let total = 0;
  for await (const f of jsonFiles(process.argv[2] ?? "workflows")) {
    for (const l of findLeaks(await readFile(f, "utf8"))) { total++; console.log(`${f}: ${l.rule} at ${l.path}`); }
  }
  console.log(total ? `✗ ${total} possible leak(s)` : "✓ no leaks found");
  process.exit(total ? 1 : 0);
}
