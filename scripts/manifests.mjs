#!/usr/bin/env node
// Agent-callable workflow manifests (schema/manifest.schema.json).
// Usage: node scripts/manifests.mjs list [--json] | check
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const TRIGGER_TYPES = { webhook: /\.webhook$/, manual: /\.manualTrigger$/, schedule: /\.scheduleTrigger$/, chat: /chatTrigger$/, form: /formTrigger$/ };
const EDITIONS = ["global", "cn"];
const REQUIRED = ["id", "edition", "workflowFile", "workflowName", "description", "trigger", "input", "output", "sideEffects", "requiresConfirmation", "mcp"];

/** @returns {string[]} problems; empty when the manifest matches the workflow export */
export function validateManifest(m, workflow) {
  const errs = [];
  for (const k of REQUIRED) if (m[k] === undefined) errs.push(`missing ${k}`);
  if (m.edition !== undefined && !EDITIONS.includes(m.edition)) errs.push(`edition must be one of ${EDITIONS.join(", ")}`);
  if (m.workflowName !== workflow.name) errs.push(`workflowName "${m.workflowName}" != export name "${workflow.name}"`);
  if (typeof m.description === "string" && (m.description.length === 0 || m.description.length > 300)) errs.push("description must be 1-300 chars");
  if (!Array.isArray(m.sideEffects) || m.sideEffects.length === 0) errs.push("sideEffects must list at least one effect");
  if (m.input?.type !== "object") errs.push("input must be a JSON Schema object");
  const node = workflow.nodes?.find((n) => n.name === m.trigger?.node);
  if (!node) errs.push(`trigger node "${m.trigger?.node}" not found in workflow`);
  else if (!TRIGGER_TYPES[m.trigger.type]?.test(node.type)) errs.push(`trigger type ${m.trigger.type} doesn't match node type ${node.type}`);
  const ex = m.mcp?.executeWorkflow ?? {};
  if (ex.triggerNodeName !== m.trigger?.node) errs.push("mcp.executeWorkflow.triggerNodeName must equal trigger.node");
  if (m.trigger?.type === "webhook" && ex.inputs?.type !== "webhook") errs.push("webhook workflows need mcp.executeWorkflow.inputs {type: webhook, webhookData}");
  if (m.trigger?.type === "webhook" && !ex.inputs?.webhookData) errs.push("missing example webhookData");
  return errs;
}

async function* files(dir, name) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* files(p, name);
    else if (name(e.name)) yield p;
  }
}

/** Load every manifest under dir and validate it; also reports workflow exports that have no manifest. */
export async function loadManifests(dir = "workflows") {
  const out = [];
  const covered = new Set();
  for await (const p of files(dir, (n) => n === "workflow.manifest.json")) {
    const manifest = JSON.parse(await readFile(p, "utf8"));
    const wfPath = path.join(path.dirname(p), manifest.workflowFile ?? "");
    covered.add(wfPath);
    let errors;
    try {
      errors = validateManifest(manifest, JSON.parse(await readFile(wfPath, "utf8")));
    } catch {
      errors = [`workflowFile ${manifest.workflowFile} not readable`];
    }
    const folder = path.relative(dir, p).split(path.sep)[0];
    if (EDITIONS.includes(folder) && manifest.edition !== folder) errors.push(`edition "${manifest.edition}" doesn't match folder workflows/${folder}`);
    out.push({ path: p, manifest, errors });
  }
  for await (const p of files(dir, (n) => n.endsWith(".redacted.json"))) {
    if (!covered.has(p)) out.push({ path: p, manifest: { id: p }, errors: ["workflow has no workflow.manifest.json"] });
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [cmd = "list", ...rest] = process.argv.slice(2);
  const all = await loadManifests("workflows");
  const bad = all.filter((m) => m.errors.length);
  if (cmd === "check") {
    for (const m of bad) for (const e of m.errors) console.log(`${m.path}: ${e}`);
    console.log(bad.length ? `✗ ${bad.length} manifest problem(s)` : `✓ ${all.length} manifests valid`);
    process.exit(bad.length ? 1 : 0);
  }
  if (rest.includes("--json")) console.log(JSON.stringify(all.map((m) => ({ ...m.manifest, path: path.dirname(m.path), valid: !m.errors.length })), null, 2));
  else for (const m of all) console.log(`${m.manifest.id.padEnd(34)} ${(m.manifest.edition ?? "?").padEnd(6)} ${m.manifest.trigger?.type ?? "?"}  ${m.manifest.description ?? ""}`);
  process.exit(bad.length ? 1 : 0);
}
