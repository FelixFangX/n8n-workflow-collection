#!/usr/bin/env node
// Structural checks for every workflow export, plus edition rules:
//  - JSON parses; node names are unique; every connection source/target and every $('Node') reference names an existing node
//  - workflows/global/** contains no CJK text (English edition)
//  - every global workflow has a cn counterpart at the same relative path, and vice versa
// Usage: node scripts/check-workflows.mjs [dir=workflows]
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const CJK = /[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]/;
const REF = /\$\((['"])(.*?)\1\)/g;

/** @returns {string[]} problems in one workflow export */
export function checkWorkflow(json, { english = false } = {}) {
  let wf;
  try { wf = JSON.parse(json); } catch (e) { return [`invalid JSON: ${e.message}`]; }
  const errs = [];
  const names = (wf.nodes ?? []).map((n) => n.name);
  const set = new Set(names);
  if (set.size !== names.length) errs.push(`duplicate node names: ${names.filter((n, i) => names.indexOf(n) !== i).join(", ")}`);
  for (const [src, outs] of Object.entries(wf.connections ?? {})) {
    if (!set.has(src)) errs.push(`connection source "${src}" is not a node`);
    for (const branches of Object.values(outs)) for (const branch of branches ?? []) for (const t of branch ?? []) {
      if (!set.has(t.node)) errs.push(`connection target "${t.node}" (from "${src}") is not a node`);
    }
  }
  for (const m of JSON.stringify(wf).matchAll(REF)) {
    const ref = JSON.parse(`"${m[2]}"`);
    if (!set.has(ref)) errs.push(`expression references missing node "${ref}"`);
  }
  if (english && CJK.test(json)) errs.push("global (English) edition contains CJK text");
  return errs;
}

async function* files(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* files(p);
    else yield p;
  }
}

export async function checkAll(dir = "workflows") {
  const problems = [];
  const rel = { global: new Set(), cn: new Set() };
  for await (const p of files(dir)) {
    const [edition, ...rest] = path.relative(dir, p).split(path.sep);
    if (rel[edition]) rel[edition].add(rest.join("/"));
    if (p.endsWith(".redacted.json")) {
      for (const e of checkWorkflow(await readFile(p, "utf8"), { english: edition === "global" })) problems.push(`${p}: ${e}`);
    } else if (edition === "global" && p.endsWith("workflow.manifest.json") && CJK.test(await readFile(p, "utf8"))) {
      problems.push(`${p}: global (English) edition contains CJK text`);
    }
  }
  const wfs = (s) => [...s].filter((f) => f.endsWith(".redacted.json"));
  for (const f of wfs(rel.global)) if (!rel.cn.has(f)) problems.push(`workflows/global/${f}: no cn counterpart`);
  for (const f of wfs(rel.cn)) if (!rel.global.has(f)) problems.push(`workflows/cn/${f}: no global counterpart`);
  return { problems, count: wfs(rel.global).length + wfs(rel.cn).length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { problems, count } = await checkAll(process.argv[2] ?? "workflows");
  for (const p of problems) console.log(p);
  console.log(problems.length ? `✗ ${problems.length} workflow problem(s)` : `✓ ${count} workflows valid (global + cn)`);
  process.exit(problems.length ? 1 : 0);
}
