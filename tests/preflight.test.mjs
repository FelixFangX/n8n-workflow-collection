import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { preflightWorkflow, preflightTargets } from "../scripts/preflight.mjs";

const exec = promisify(execFile);
const root = path.resolve(import.meta.dirname, "..");

const workflow = (overrides = {}) => JSON.stringify({
  name: "Fixture",
  nodes: [
    { name: "Manual Trigger", type: "n8n-nodes-base.manualTrigger", typeVersion: 1, parameters: {} },
    { name: "Next", type: "n8n-nodes-base.set", typeVersion: 3.4, parameters: {} },
  ],
  connections: { "Manual Trigger": { main: [[{ node: "Next", type: "main", index: 0 }]] } },
  ...overrides,
});

const codes = (report, severity) => report.findings.filter((item) => !severity || item.severity === severity).map((item) => item.code);

test("missing connection targets and expression refs name the node path", () => {
  const report = preflightWorkflow(workflow({
    nodes: [
      { name: "Manual Trigger", type: "n8n-nodes-base.manualTrigger", typeVersion: 1, parameters: { jsCode: "return $('Gone').item;" } },
    ],
    connections: { "Manual Trigger": { main: [[{ node: "Nowhere", type: "main", index: 0 }]] } },
  }));
  assert.equal(report.layers.structural, "fail");
  assert.equal(report.layers.n8nRuntime, "not-run");
  assert.ok(codes(report, "error").includes("connection-target"));
  assert.ok(codes(report, "error").includes("missing-node-ref"));
  const target = report.findings.find((item) => item.code === "connection-target");
  assert.match(target.path, /connections\.Manual Trigger\.main\[0\]\[0\]\.node/);
  assert.match(target.message, /Nowhere/);
});

test("a disconnected write is an error and is not a clean absence of side effects", () => {
  const report = preflightWorkflow(workflow({
    nodes: [
      { name: "Manual Trigger", type: "n8n-nodes-base.manualTrigger", typeVersion: 1, parameters: {} },
      { name: "Create Record", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, parameters: { method: "POST", url: "https://example.test/records" } },
    ],
    connections: {},
  }));
  const unreachable = report.findings.find((item) => item.code === "unreachable-node");
  assert.match(unreachable.path, /nodes\[1\]\.name/);
  assert.match(unreachable.message, /Create Record/);
  assert.equal(report.recovery.status, "unverified");
  assert.notEqual(report.recovery.status, "no-irreversible-write");
  assert.equal(report.recovery.exactlyOnce, "not-claimed");
});

test("credential ids must be placeholders and secrets are not echoed", () => {
  const secret = "sk-abcdefghijklmnopqrstuvwx";
  const report = preflightWorkflow(workflow({
    nodes: [
      { name: "Manual Trigger", type: "n8n-nodes-base.manualTrigger", typeVersion: 1, parameters: {} },
      {
        name: "Scrape",
        type: "@apify/n8n-nodes-apify.apify",
        typeVersion: 1,
        parameters: { operation: "Run actor and get dataset", header: `Bearer ${secret}` },
        credentials: { apifyApi: { name: "{{APIFY_CREDENTIAL_NAME}}" } },
      },
    ],
    connections: { "Manual Trigger": { main: [[{ node: "Scrape", type: "main", index: 0 }]] } },
  }));
  assert.ok(codes(report, "error").includes("credential-id-missing"));
  assert.ok(codes(report, "error").includes("api-key") || codes(report, "error").includes("bearer-token"));
  assert.equal(JSON.stringify(report.findings).includes(secret), false);
  const cred = report.requirements.credentials[0];
  assert.equal(cred.type, "apifyApi");
  assert.equal(cred.id, null);
  assert.equal(cred.compatibility, "unknown");
});

test("a non-placeholder credential id fails closed", () => {
  const report = preflightWorkflow(workflow({
    nodes: [
      {
        name: "Manual Trigger",
        type: "n8n-nodes-base.manualTrigger",
        typeVersion: 1,
        parameters: {},
        credentials: { httpHeaderAuth: { id: "not-a-placeholder", name: "{{HEADER_CREDENTIAL_NAME}}" } },
      },
    ],
    connections: {},
  }));
  assert.ok(codes(report, "error").includes("credential-id"));
  assert.equal(report.requirements.credentials[0].id, null);
});

test("an unseen typeVersion stays unknown and is not marked incompatible", () => {
  const report = preflightWorkflow(workflow({
    nodes: [
      { name: "Manual Trigger", type: "n8n-nodes-base.manualTrigger", typeVersion: 1, parameters: {} },
      { name: "Future HTTP", type: "n8n-nodes-base.httpRequest", typeVersion: 99, parameters: { method: "GET", url: "https://example.test/list" } },
    ],
    connections: { "Manual Trigger": { main: [[{ node: "Future HTTP", type: "main", index: 0 }]] } },
  }));
  assert.equal(report.layers.structural, "pass");
  assert.equal(report.nodeVersions.find((node) => node.name === "Future HTTP").compatibility, "unknown");
  assert.equal(report.nodeVersions.find((node) => node.name === "Future HTTP").typeVersion, 99);
  assert.equal(/incompatible|unsupported by n8n|n8n \d/i.test(JSON.stringify(report)), false);
  assert.equal(report.layers.n8nRuntime, "not-run");
});

test("a missing typeVersion is a structural error", () => {
  const report = preflightWorkflow(workflow({
    nodes: [{ name: "Manual Trigger", type: "n8n-nodes-base.manualTrigger", parameters: {} }],
    connections: {},
  }));
  assert.ok(codes(report, "error").includes("node-version-missing"));
});

test("an unrecognized trigger is unknown rather than a fabricated broken graph", () => {
  const report = preflightWorkflow(workflow({
    nodes: [
      { name: "Start", type: "n8n-nodes-base.cron", typeVersion: 1, parameters: {} },
      { name: "Next", type: "n8n-nodes-base.set", typeVersion: 3.4, parameters: {} },
    ],
    connections: { Start: { main: [[{ node: "Next", type: "main", index: 0 }]] } },
  }));
  assert.ok(codes(report, "warning").includes("trigger-unknown"));
  assert.equal(codes(report, "error").includes("unreachable-node"), false);
  assert.equal(report.recovery.status, "not-assessed");
  assert.equal(report.trigger.status, "unknown");
});

test("duplicate webhook delivery without a prior read is unverified, including partial writes and retry", () => {
  const report = preflightWorkflow(JSON.stringify({
    nodes: [
      { name: "Receive", type: "n8n-nodes-base.webhook", typeVersion: 2, parameters: { path: "{{WEBHOOK_PATH}}" } },
      { name: "Remember Id", type: "n8n-nodes-base.code", typeVersion: 2, parameters: { jsCode: "return [{ json: { message_id: $json.body.message_id } }];" } },
      {
        name: "Create Record",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.2,
        retryOnFail: true,
        maxTries: 2,
        parameters: { method: "POST", url: "https://example.test/apps/{{BITABLE_APP_TOKEN}}/tables/{{BITABLE_TABLE_ID}}/records" },
      },
      {
        name: "Reply",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.2,
        parameters: { method: "POST", url: "=https://example.test/messages/{{ $json.message_id }}/reply" },
      },
    ],
    connections: {
      Receive: { main: [[{ node: "Remember Id", type: "main", index: 0 }]] },
      "Remember Id": { main: [[{ node: "Create Record", type: "main", index: 0 }]] },
      "Create Record": { main: [[{ node: "Reply", type: "main", index: 0 }]] },
    },
  }));
  assert.equal(report.layers.structural, "pass");
  assert.deepEqual(report.recovery.eventIdentity.fields, ["message_id"]);
  assert.equal(report.recovery.dedupBeforeWrite.status, "unverified");
  assert.equal(report.recovery.exactlyOnce, "not-claimed");
  assert.equal(report.recovery.durability, "not-configured");
  assert.equal(report.recovery.partialFailure.status, "unknown");
  assert.deepEqual(report.recovery.partialFailure.writes, ["Create Record", "Reply"]);
  assert.ok(codes(report, "warning").includes("retry-may-repeat-effect"));
  assert.ok(codes(report, "warning").includes("partial-failure-unknown"));
  assert.equal(report.sideEffects.find((effect) => effect.node === "Create Record").wouldSendIfExecuted, true);
  assert.equal(report.layers.externalCorrectness, "not-run");
});

test("a same-target PUT is unknown, not exactly-once", () => {
  const report = preflightWorkflow(workflow({
    nodes: [
      { name: "Manual Trigger", type: "n8n-nodes-base.manualTrigger", typeVersion: 1, parameters: {} },
      {
        name: "Update Row",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.2,
        parameters: { method: "PUT", url: "=https://example.test/tables/{{BITABLE_TABLE_ID}}/records/{{RECORD_ID}}" },
      },
    ],
    connections: { "Manual Trigger": { main: [[{ node: "Update Row", type: "main", index: 0 }]] } },
  }));
  assert.equal(report.sideEffects[0].class, "update-by-id");
  assert.equal(report.sideEffects[0].replay, "same-target");
  assert.equal(report.recovery.status, "unverified");
  assert.equal(report.recovery.exactlyOnce, "not-claimed");
  assert.ok(codes(report, "warning").includes("same-target-write-unknown"));
  assert.equal(codes(report, "error").length, 0);
});

test("a read-only graph does not claim external correctness", () => {
  const report = preflightWorkflow(workflow());
  assert.equal(report.layers.structural, "pass");
  assert.equal(report.recovery.status, "no-irreversible-write");
  assert.equal(report.layers.externalCorrectness, "not-run");
  assert.equal(report.recovery.exactlyOnce, "not-claimed");
  assert.equal("score" in report, false);
});

test("an expression method is unknown rather than assumed GET", () => {
  const report = preflightWorkflow(workflow({
    nodes: [
      { name: "Manual Trigger", type: "n8n-nodes-base.manualTrigger", typeVersion: 1, parameters: {} },
      { name: "Call", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, parameters: { method: "={{$json.method}}", url: "https://example.test/records" } },
    ],
    connections: { "Manual Trigger": { main: [[{ node: "Call", type: "main", index: 0 }]] } },
  }));
  assert.equal(report.sideEffects[0].class, "unknown");
  assert.equal(report.sideEffects[0].method, "unknown");
  assert.equal(report.recovery.status, "unverified");
});

test("zero workflow files refuse a clean result and have no quality score", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "preflight-empty-"));
  const report = await preflightTargets([dir]);
  assert.equal(report.files.length, 0);
  assert.equal(report.summary.files, 0);
  assert.equal(report.summary.structural, "fail");
  assert.ok(report.summary.errors >= 1);
  assert.equal(report.directoryFindings[0].code, "no-workflows");
  assert.equal(report.certification, "none");
  assert.equal("score" in report, false);
  assert.equal("score" in report.summary, false);
});

test("fixture files reproduce the CLI diagnostics", async () => {
  const fixtureDir = path.join(root, "tests/fixtures/preflight");
  const broken = await exec(process.execPath, ["scripts/preflight.mjs", path.join(fixtureDir, "unreachable-write.json")], { cwd: root }).catch((error) => error);
  assert.equal(broken.code, 1);
  assert.match(broken.stdout, /unreachable-node/);
  assert.match(broken.stdout, /connection-target/);
  assert.match(broken.stdout, /Create Record/);
  assert.match(broken.stdout, /certification: none/);
  assert.doesNotMatch(broken.stdout, /score/i);

  const duplicate = await exec(process.execPath, ["scripts/preflight.mjs", "--json", path.join(fixtureDir, "duplicate-event.json")], { cwd: root });
  const body = JSON.parse(duplicate.stdout);
  assert.equal(body.sends, "none");
  assert.equal(body.mode, "offline-read");
  assert.equal(body.files[0].recovery.dedupBeforeWrite.status, "unverified");
  assert.equal(body.files[0].recovery.exactlyOnce, "not-claimed");
  assert.equal(body.summary.errors, 0);
  assert.ok(body.summary.warnings > 0);

  const version = JSON.parse((await exec(process.execPath, ["scripts/preflight.mjs", "--json", path.join(fixtureDir, "unknown-version.json")], { cwd: root })).stdout);
  assert.equal(version.files[0].nodeVersions.find((node) => node.name === "Future HTTP").compatibility, "unknown");
  assert.equal(version.summary.structural, "pass");
  assert.equal(version.summary.n8nRuntime, "not-run");
});

test("the real collection passes structural preflight and stays unverified on recovery", async () => {
  const report = await preflightTargets([path.join(root, "workflows")]);
  assert.equal(report.summary.files, 22);
  assert.equal(report.summary.errors, 0);
  assert.equal(report.summary.structural, "pass");
  assert.equal(report.summary.n8nRuntime, "not-run");
  assert.equal(report.summary.externalCorrectness, "not-run");
  assert.equal(report.summary.recovery, "unverified");
  assert.ok(report.summary.warnings > 0);
  assert.equal(report.certification, "none");
  assert.equal("score" in report, false);

  const lark = report.files.find((file) => file.file.endsWith("workflows/global/Lark/FeishuBotBitable/feishu-bot-bitable-workflow.redacted.json"));
  assert.equal(lark.recovery.eventIdentity.status, "present");
  assert.deepEqual(lark.recovery.eventIdentity.fields, ["message_id"]);
  assert.equal(lark.recovery.dedupBeforeWrite.status, "unverified");
  assert.equal(lark.recovery.partialFailure.status, "unknown");
  assert.ok(lark.recovery.partialFailure.writes.includes("Create Bitable Record"));
  assert.ok(lark.recovery.partialFailure.writes.includes("Reply to Lark Message"));
  assert.ok(lark.findings.some((item) => item.code === "export-marked-active"));
  assert.ok(lark.requirements.placeholders.includes("BITABLE_APP_TOKEN"));
  assert.ok(lark.requirements.placeholders.includes("OPENAI_API_KEY"));

  const update = report.files.find((file) => file.file.endsWith("workflows/global/SocialMediaTracker/Update/social-media-effectiveness-tracker.redacted.json"));
  assert.ok(update.sideEffects.some((effect) => effect.class === "update-by-id" && effect.replay === "same-target"));
  assert.ok(update.sideEffects.some((effect) => effect.class === "actor-run" && effect.retryOnFail === true));
  assert.ok(update.findings.some((item) => item.code === "partial-failure-unknown"));
  assert.ok(update.findings.some((item) => item.code === "retry-may-repeat-effect"));
  assert.equal(update.recovery.exactlyOnce, "not-claimed");

  const facebook = report.files.find((file) => file.file.endsWith("workflows/global/Facebook/Create/facebook-create.redacted.json"));
  assert.equal(facebook.findings.some((item) => item.code === "unreachable-node"), false);
  assert.ok(facebook.sideEffects.some((effect) => effect.node === "Batch Create Lark Records" && effect.class === "create"));
  assert.ok(facebook.findings.some((item) => item.code === "swallowed-write-error" && item.message.includes("Batch Create Lark Records")));
});

test("contract doc states the supported and unsupported boundary", async () => {
  const doc = await readFile(path.join(root, "docs/import-preflight.md"), "utf8");
  assert.match(doc, /structural/);
  assert.match(doc, /not-run/);
  assert.match(doc, /not-claimed/);
  assert.match(doc, /message_id/);
  assert.match(doc, /batch_create/);
});
