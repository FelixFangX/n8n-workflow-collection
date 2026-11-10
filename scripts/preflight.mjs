#!/usr/bin/env node
// Offline import preflight for n8n workflow exports.
// Reads JSON only. Does not import, activate, or send HTTP.
// Usage: node scripts/preflight.mjs [file-or-dir ...] [--json]
//
// Layers this tool will state on every report:
//   structural            pass | fail     (this process)
//   n8nRuntime            not-run         (typeVersion compatibility is unknown)
//   externalCorrectness   not-run         (no Lark, OpenAI, Apify, or Bitable calls)
// Recovery is unlabeled as safe. exactlyOnce is always "not-claimed".
// A directory with zero workflow exports is a failure, not a clean score.
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { findLeaks } from "./check-redaction.mjs";

const PLACEHOLDER_ID = /^\{\{[A-Z0-9_]+\}\}$/;
const PLACEHOLDER = /\{\{([A-Z0-9_]+)\}\}/g;
const TRIGGER = /(?:^|\.)(webhook|manualTrigger|scheduleTrigger|chatTrigger|formTrigger|errorTrigger)$/;
const REF = /\$\((['"])(.*?)\1\)/g;
const IDENTITY_FIELDS = ["message_id"];

/** @param {"error"|"warning"} severity */
function finding(severity, code, at, message) {
  return { severity, code, path: at, message };
}

function nodeType(node) {
  return typeof node?.type === "string" ? node.type : "";
}

function isTrigger(node) {
  return TRIGGER.test(nodeType(node));
}

function isHttp(node) {
  return nodeType(node).endsWith(".httpRequest");
}

function isApify(node) {
  return nodeType(node).includes("n8n-nodes-apify") || nodeType(node).endsWith(".apify");
}

/** n8n expressions start with "=". Anything else non-literal is unknown, not GET. */
export function httpMethod(parameters) {
  const raw = parameters?.method ?? parameters?.httpMethod;
  if (raw === undefined || raw === "") return { method: "GET", assumedDefault: true };
  if (typeof raw !== "string") return { method: "unknown", assumedDefault: false };
  const text = raw.trim();
  if (text.startsWith("=") || text.includes("{{") || text.includes("$")) return { method: "unknown", assumedDefault: false };
  return { method: text.toUpperCase(), assumedDefault: false };
}

function urlText(parameters) {
  const raw = parameters?.url;
  if (typeof raw !== "string" || raw.trim() === "") return "";
  return raw.startsWith("=") ? raw.slice(1) : raw;
}

/** Static URL/method class. Unknown stays unknown. */
export function classifyEffect(node) {
  if (isApify(node)) {
    return {
      class: "actor-run",
      method: null,
      irreversible: "unknown",
      spend: true,
      wouldSendIfExecuted: true,
      replay: null,
    };
  }
  if (!isHttp(node)) return null;
  const { method } = httpMethod(node.parameters);
  const url = urlText(node.parameters);
  if (method === "unknown") {
    return { class: "unknown", method, irreversible: "unknown", spend: "unknown", wouldSendIfExecuted: "unknown", replay: null, url };
  }
  if (method === "GET" || method === "HEAD") {
    return { class: "read", method, irreversible: false, spend: false, wouldSendIfExecuted: false, replay: null, url };
  }
  if (method === "DELETE") {
    return { class: "delete", method, irreversible: true, spend: false, wouldSendIfExecuted: true, replay: null, url };
  }
  if (method === "PUT" || method === "PATCH") {
    const same = /\/records\//.test(url);
    return {
      class: same ? "update-by-id" : "update-unclassified",
      method,
      irreversible: "unknown",
      spend: false,
      wouldSendIfExecuted: true,
      replay: same ? "same-target" : null,
      url,
    };
  }
  if (method === "POST") {
    let effect = "write-unclassified";
    let irreversible = "unknown";
    let spend = "unknown";
    if (/chat\/completions/.test(url)) {
      effect = "model-call";
      irreversible = false;
      spend = true;
    } else if (/tenant_access_token/.test(url)) {
      effect = "auth";
      irreversible = false;
      spend = false;
    } else if (/\/reply(?:\?|$)/.test(url) || /\/messages\/.+\/reply/.test(url)) {
      effect = "notify";
      irreversible = true;
      spend = false;
    } else if (/\/records\/batch(?:_create)?(?:\?|$)/.test(url)) {
      effect = "create";
      irreversible = true;
      spend = false;
    } else if (/\/tables(?:\?|$)/.test(url)) {
      effect = "create-table";
      irreversible = true;
      spend = false;
    } else if (/\/records(?:\?|$)/.test(url)) {
      effect = "create";
      irreversible = true;
      spend = false;
    }
    return { class: effect, method, irreversible, spend, wouldSendIfExecuted: true, replay: null, url };
  }
  return { class: "unknown", method, irreversible: "unknown", spend: "unknown", wouldSendIfExecuted: "unknown", replay: null, url };
}

function repeatsOnRetry(effect) {
  if (!effect) return false;
  if (effect.class === "auth" || effect.class === "read") return false;
  return effect.wouldSendIfExecuted === true || effect.spend === true || effect.irreversible !== false;
}

function walkStrings(value, at, visit) {
  if (typeof value === "string") visit(at, value);
  else if (Array.isArray(value)) for (const [i, v] of value.entries()) walkStrings(v, `${at}[${i}]`, visit);
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) walkStrings(v, at ? `${at}.${k}` : k, visit);
  }
}

function reachableFrom(triggers, adjacent) {
  const seen = new Set();
  const order = [];
  const queue = [...triggers];
  while (queue.length) {
    const name = queue.shift();
    if (seen.has(name)) continue;
    seen.add(name);
    order.push(name);
    for (const next of adjacent.get(name) ?? []) if (!seen.has(next)) queue.push(next);
  }
  return { seen, order };
}

function ancestorsOf(name, reverse) {
  const seen = new Set();
  const queue = [...(reverse.get(name) ?? [])];
  while (queue.length) {
    const current = queue.shift();
    if (seen.has(current)) continue;
    seen.add(current);
    for (const parent of reverse.get(current) ?? []) queue.push(parent);
  }
  return seen;
}

function parametersMention(node, field) {
  return JSON.stringify(node?.parameters ?? {}).includes(field);
}

/**
 * @param {string} json
 * @param {string} file
 */
export function preflightWorkflow(json, file = "<memory>") {
  const findings = [];
  /** @type {any} */
  let wf;
  try {
    wf = JSON.parse(json);
  } catch (error) {
    findings.push(finding("error", "invalid-json", file, `invalid JSON: ${error.message}`));
    return finish(file, findings, null);
  }
  if (!wf || typeof wf !== "object" || Array.isArray(wf) || !Array.isArray(wf.nodes)) {
    findings.push(finding("error", "workflow-shape", file, "export must be an object with a nodes array"));
    return finish(file, findings, null);
  }

  const nodes = wf.nodes;
  const names = [];
  const indexByName = new Map();
  for (const [i, node] of nodes.entries()) {
    if (!node || typeof node !== "object") {
      findings.push(finding("error", "workflow-shape", `nodes[${i}]`, "node must be an object"));
      continue;
    }
    if (typeof node.name !== "string" || node.name === "") {
      findings.push(finding("error", "node-name-missing", `nodes[${i}].name`, "node name is missing"));
    } else {
      names.push(node.name);
      if (!indexByName.has(node.name)) indexByName.set(node.name, i);
    }
    if (typeof node.type !== "string" || node.type === "") {
      findings.push(finding("error", "node-type-missing", `nodes[${i}].type`, "node type is missing"));
    }
    if (typeof node.typeVersion !== "number" || !Number.isFinite(node.typeVersion)) {
      findings.push(finding(
        "error",
        "node-version-missing",
        `nodes[${i}].typeVersion`,
        "typeVersion must be a finite number. Compatibility with an n8n release is not checked",
      ));
    }
  }
  const nameSet = new Set(names);
  for (const [i, name] of names.entries()) {
    if (names.indexOf(name) !== i) {
      findings.push(finding("error", "duplicate-node-name", `nodes[${indexByName.get(name)}].name`, `duplicate node name "${name}"`));
    }
  }

  const adjacent = new Map(names.map((name) => [name, []]));
  const reverse = new Map(names.map((name) => [name, []]));
  for (const [source, outputs] of Object.entries(wf.connections ?? {})) {
    if (!nameSet.has(source)) {
      findings.push(finding("error", "connection-source", `connections.${source}`, `connection source "${source}" is not a node`));
    }
    if (!outputs || typeof outputs !== "object") continue;
    for (const [outputName, branches] of Object.entries(outputs)) {
      (branches ?? []).forEach((branch, branchIndex) => {
        (branch ?? []).forEach((target, targetIndex) => {
          const at = `connections.${source}.${outputName}[${branchIndex}][${targetIndex}].node`;
          if (!target || typeof target.node !== "string" || !nameSet.has(target.node)) {
            findings.push(finding("error", "connection-target", at, `connection target "${target?.node}" from "${source}" is not a node`));
            return;
          }
          adjacent.get(source)?.push(target.node);
          reverse.get(target.node)?.push(source);
        });
      });
    }
  }

  walkStrings(wf, "", (at, value) => {
    for (const match of value.matchAll(REF)) {
      const ref = JSON.parse(`"${match[2]}"`);
      if (!nameSet.has(ref)) {
        findings.push(finding("error", "missing-node-ref", at, `expression references missing node "${ref}"`));
      }
    }
  });

  try {
    for (const leak of findLeaks(json)) {
      findings.push(finding("error", leak.rule, leak.path, `${leak.rule} at ${leak.path}`));
    }
  } catch {
    // invalid JSON already reported
  }

  const credentials = [];
  for (const [i, node] of nodes.entries()) {
    if (!node?.credentials || typeof node.credentials !== "object") continue;
    for (const [type, cred] of Object.entries(node.credentials)) {
      const at = `nodes[${i}].credentials.${type}.id`;
      const id = cred && typeof cred.id === "string" ? cred.id : "";
      if (!PLACEHOLDER_ID.test(id)) {
        if (!findings.some((item) => item.code === "credential-id" && item.path === at)) {
          findings.push(finding(
            "error",
            id ? "credential-id" : "credential-id-missing",
            at,
            id
              ? "credential id must be a whole {{UPPER_SNAKE}} placeholder before import"
              : "credential id is missing. Import cannot bind this credential",
          ));
        }
      }
      credentials.push({
        node: node.name ?? `nodes[${i}]`,
        type,
        id: PLACEHOLDER_ID.test(id) ? id : null,
        compatibility: "unknown",
      });
    }
    if (isHttp(node) && urlText(node.parameters) === "") {
      findings.push(finding("error", "missing-request-url", `nodes[${i}].parameters.url`, `node "${node.name}" is an HTTP request with no url`));
    }
  }

  const triggers = nodes.filter((node) => node && isTrigger(node));
  const triggerNames = triggers.map((node) => node.name).filter((name) => typeof name === "string");
  let recoveryStatus = "not-assessed";
  /** @type {Set<string>} */
  let reached = new Set();
  if (triggerNames.length === 0) {
    findings.push(finding(
      "warning",
      "trigger-unknown",
      "nodes",
      "no webhook, manual, schedule, chat, form, or error trigger was recognized. Unrecognized start nodes stay unknown and are not treated as broken",
    ));
  } else {
    reached = reachableFrom(triggerNames, adjacent).seen;
    for (const [i, node] of nodes.entries()) {
      if (!node?.name || !nameSet.has(node.name)) continue;
      if (!reached.has(node.name)) {
        findings.push(finding("error", "unreachable-node", `nodes[${i}].name`, `node "${node.name}" is not reachable from a trigger`));
      }
    }
  }

  const sideEffects = [];
  for (const [i, node] of nodes.entries()) {
    if (!node?.name || (triggerNames.length > 0 && !reached.has(node.name))) continue;
    const effect = classifyEffect(node);
    if (!effect) continue;
    sideEffects.push({
      node: node.name,
      path: `nodes[${i}]`,
      class: effect.class,
      method: effect.method,
      irreversible: effect.irreversible,
      spend: effect.spend,
      wouldSendIfExecuted: effect.wouldSendIfExecuted,
      replay: effect.replay,
      retryOnFail: node.retryOnFail === true,
      maxTries: typeof node.maxTries === "number" ? node.maxTries : null,
      onError: typeof node.onError === "string" ? node.onError : null,
    });
    if (node.retryOnFail === true && repeatsOnRetry(effect)) {
      findings.push(finding(
        "warning",
        "retry-may-repeat-effect",
        `nodes[${i}]`,
        `node "${node.name}" sets retryOnFail. A retry can repeat the external call. This preflight cannot tell whether the first attempt already succeeded`,
      ));
    }
    if (node.onError === "continueRegularOutput" && effect.wouldSendIfExecuted === true) {
      findings.push(finding(
        "warning",
        "swallowed-write-error",
        `nodes[${i}].onError`,
        `node "${node.name}" uses onError continueRegularOutput. A failed write continues on the success output. That is not classified as success here`,
      ));
    }
  }

  const unreachableSends = triggerNames.length
    ? nodes.filter((node) => node?.name && !reached.has(node.name) && classifyEffect(node)?.wouldSendIfExecuted === true)
    : [];
  const irreversible = sideEffects.filter((effect) => effect.irreversible === true);
  const sameTarget = sideEffects.find((effect) => effect.replay === "same-target");
  const sendsOrSpends = sideEffects.some((effect) => effect.wouldSendIfExecuted === true || effect.spend === true || effect.irreversible !== false);
  const identityEvidence = [];
  const identityFields = [];
  if (triggers.some((node) => nodeType(node).endsWith(".webhook"))) {
    for (const field of IDENTITY_FIELDS) {
      const evidence = nodes.filter((node) => parametersMention(node, field)).map((node) => node.name).filter(Boolean);
      if (evidence.length) {
        identityFields.push(field);
        identityEvidence.push(...evidence);
      }
    }
  }

  let dedup = { status: "not-applicable", note: "No irreversible or external write was classified." };
  if (triggerNames.length === 0) {
    recoveryStatus = "not-assessed";
    dedup = { status: "unverified", note: "Trigger type was not recognized, so replay behavior was not assessed." };
  } else if (!sendsOrSpends && unreachableSends.length === 0) {
    recoveryStatus = "no-irreversible-write";
  } else if (!sendsOrSpends && unreachableSends.length > 0) {
    recoveryStatus = "unverified";
    dedup = {
      status: "unverified",
      note: "A write node is not reachable from the trigger. That is not treated as an absent side effect.",
    };
    findings.push(finding("warning", "dedup-unverified", `nodes[${indexByName.get(unreachableSends[0].name)}]`, dedup.note));
  } else {
    recoveryStatus = "unverified";
    const lookup = identityFields.length > 0 && irreversible.some((write) => {
      const prior = ancestorsOf(write.node, reverse);
      return [...prior].some((name) => {
        const node = nodes[indexByName.get(name)];
        const effect = classifyEffect(node);
        if (!effect || effect.class !== "read") return false;
        return identityFields.some((field) => effect.url?.includes(field) || parametersMention(node, field));
      });
    });
    if (lookup) {
      dedup = {
        status: "lookup-before-write",
        note: "A read mentioning the event id sits before a create. That is not a durable exactly-once store, and this preflight does not execute the read.",
      };
    } else if (identityFields.length) {
      dedup = {
        status: "unverified",
        note: `${identityFields.join(", ")} is present in the export, and no read of that id happens before the first irreversible write. Replay can repeat the write. No durable dedup store is configured here.`,
      };
      findings.push(finding(
        "warning",
        "dedup-unverified",
        irreversible[0] ? `${irreversible[0].path}` : "nodes",
        dedup.note,
      ));
    } else {
      dedup = {
        status: "unverified",
        note: "No stable external event id was found in this export. Replay dedup is unverified. No durable dedup store is configured here.",
      };
      const anchor = irreversible[0]
        ?? sideEffects.find((effect) => effect.class !== "auth" && effect.class !== "read")
        ?? sideEffects.find((effect) => effect.wouldSendIfExecuted === true);
      findings.push(finding(
        "warning",
        "dedup-unverified",
        anchor?.path ?? "nodes",
        dedup.note,
      ));
    }
    if (irreversible.length >= 2) {
      findings.push(finding(
        "warning",
        "partial-failure-unknown",
        irreversible[1].path,
        `If "${irreversible[0].node}" succeeds and "${irreversible[1].node}" fails, the earlier external write remains. Replaying the trigger is unverified and can repeat it.`,
      ));
    } else if (sideEffects.some((effect) => effect.class === "actor-run") && sideEffects.some((effect) => effect.class === "update-by-id" || effect.class === "create")) {
      const actor = sideEffects.find((effect) => effect.class === "actor-run");
      const write = sideEffects.find((effect) => effect.class === "update-by-id" || effect.class === "create");
      findings.push(finding(
        "warning",
        "partial-failure-unknown",
        write.path,
        `node "${actor.node}" and node "${write.node}" are separate external calls. One can succeed when the other fails. Replay is unverified.`,
      ));
    }
    if (sameTarget) {
      findings.push(finding(
        "warning",
        "same-target-write-unknown",
        sameTarget.path,
        `node "${sameTarget.node}" writes a URL that contains a record id. A repeat addresses that same target when the id is stable. That is not exactly-once, and the first attempt's outcome is unknown offline.`,
      ));
    }
  }

  if (wf.active === true) {
    findings.push(finding(
      "warning",
      "export-marked-active",
      "active",
      "Export has active true. Whether the target n8n version activates it on import is unknown. This preflight does not import or activate it.",
    ));
  }

  const placeholders = [...json.matchAll(PLACEHOLDER)].map((match) => match[1]);
  const detail = {
    requirements: {
      placeholders: [...new Set(placeholders)].sort(),
      credentials,
    },
    trigger: {
      status: triggerNames.length ? "known" : "unknown",
      nodes: triggers.map((node) => ({
        name: node.name,
        type: node.type,
        typeVersion: node.typeVersion ?? null,
        compatibility: "unknown",
      })),
    },
    nodeVersions: nodes.filter((node) => node && typeof node === "object").map((node) => ({
      name: node.name ?? null,
      type: node.type ?? null,
      typeVersion: typeof node.typeVersion === "number" ? node.typeVersion : null,
      compatibility: "unknown",
    })),
    sideEffects,
    recovery: {
      status: recoveryStatus,
      exactlyOnce: "not-claimed",
      durability: "not-configured",
      eventIdentity: {
        status: identityFields.length ? "present" : "absent",
        fields: identityFields,
        evidence: [...new Set(identityEvidence)],
      },
      dedupBeforeWrite: dedup,
      partialFailure: {
        status: irreversible.length >= 2 ? "unknown" : irreversible.length === 1 ? "single-write" : "none",
        writes: irreversible.map((effect) => effect.node),
      },
    },
  };
  return finish(file, findings, detail);
}

function finish(file, findings, detail) {
  findings.sort((a, b) => a.severity.localeCompare(b.severity) || a.code.localeCompare(b.code) || a.path.localeCompare(b.path) || a.message.localeCompare(b.message));
  const errors = findings.filter((item) => item.severity === "error");
  return {
    file,
    layers: {
      structural: errors.length ? "fail" : "pass",
      n8nRuntime: "not-run",
      externalCorrectness: "not-run",
    },
    findings,
    requirements: detail?.requirements ?? { placeholders: [], credentials: [] },
    trigger: detail?.trigger ?? { status: "unknown", nodes: [] },
    nodeVersions: detail?.nodeVersions ?? [],
    sideEffects: detail?.sideEffects ?? [],
    recovery: detail?.recovery ?? {
      status: "not-assessed",
      exactlyOnce: "not-claimed",
      durability: "not-configured",
      eventIdentity: { status: "absent", fields: [], evidence: [] },
      dedupBeforeWrite: { status: "unverified", note: "Export could not be assessed." },
      partialFailure: { status: "none", writes: [] },
    },
  };
}

async function* workflowFiles(entry) {
  const info = await stat(entry);
  if (info.isFile()) {
    yield entry;
    return;
  }
  for (const child of await readdir(entry, { withFileTypes: true })) {
    const full = path.join(entry, child.name);
    if (child.isDirectory()) yield* workflowFiles(full);
    else if (!child.isFile() || !child.name.endsWith(".json") || child.name === "workflow.manifest.json") continue;
    else if (child.name.endsWith(".redacted.json")) yield full;
    else {
      const text = await readFile(full, "utf8");
      try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === "object" && Array.isArray(parsed.nodes)) yield full;
      } catch {
        yield full;
      }
    }
  }
}

export async function preflightTargets(entries) {
  const files = [];
  for (const entry of entries) {
    for await (const file of workflowFiles(entry)) {
      files.push(preflightWorkflow(await readFile(file, "utf8"), file));
    }
  }
  files.sort((a, b) => a.file.localeCompare(b.file));
  const directoryFindings = [];
  if (files.length === 0) {
    directoryFindings.push(finding("error", "no-workflows", entries.join(", ") || ".", "no workflow exports found; refusing a clean result"));
  }
  const findings = [...directoryFindings, ...files.flatMap((file) => file.findings)];
  const errors = findings.filter((item) => item.severity === "error").length;
  const warnings = findings.filter((item) => item.severity === "warning").length;
  const recovery = files.some((file) => file.recovery.status === "unverified")
    ? "unverified"
    : files.some((file) => file.recovery.status === "not-assessed")
      ? "not-assessed"
      : files.length
        ? "no-irreversible-write"
        : "not-assessed";
  return {
    mode: "offline-read",
    sends: "none",
    certification: "none",
    directoryFindings,
    files,
    summary: {
      files: files.length,
      errors,
      warnings,
      structural: errors ? "fail" : files.length ? "pass" : "fail",
      n8nRuntime: "not-run",
      externalCorrectness: "not-run",
      recovery,
    },
  };
}

export function formatReport(report) {
  const lines = ["preflight mode=offline-read sends=none"];
  for (const item of report.directoryFindings ?? []) lines.push(`${item.path}: ${item.severity} ${item.code} ${item.path} ${item.message}`);
  for (const file of report.files) {
    for (const item of file.findings) lines.push(`${file.file}: ${item.severity} ${item.code} ${item.path} ${item.message}`);
  }
  const summary = report.summary;
  lines.push("---");
  lines.push(`files: ${summary.files}`);
  lines.push(`errors: ${summary.errors}`);
  lines.push(`warnings: ${summary.warnings}`);
  lines.push(`structural: ${summary.structural}`);
  lines.push("n8n-runtime: not-run");
  lines.push("external-correctness: not-run");
  lines.push(`recovery: ${summary.recovery}`);
  lines.push("exactly-once: not-claimed");
  lines.push("mode: offline-read");
  lines.push("sends: none");
  lines.push("certification: none");
  return lines.join("\n");
}

function exitCode(report) {
  return report.summary.errors > 0 || report.summary.files === 0 ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const entries = args.filter((arg) => arg !== "--json");
  const report = await preflightTargets(entries.length ? entries : ["workflows"]);
  if (report.files.length === 0 && !report.summary.errors) {
    report.summary.errors = 1;
    report.summary.structural = "fail";
  }
  console.log(json ? JSON.stringify(report, null, 2) : formatReport(report));
  process.exit(exitCode(report));
}
