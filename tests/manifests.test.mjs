import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { loadManifests, validateManifest } from "../scripts/manifests.mjs";

const wf = { name: "Demo", nodes: [{ name: "Hook", type: "n8n-nodes-base.webhook", parameters: { httpMethod: "POST" } }] };
const good = {
  id: "demo", workflowFile: "demo.redacted.json", workflowName: "Demo", description: "Does a thing.",
  trigger: { type: "webhook", node: "Hook" }, input: { type: "object", properties: {} }, output: { type: "object" },
  sideEffects: ["Writes a row"], requiresConfirmation: true,
  mcp: { executeWorkflow: { triggerNodeName: "Hook", inputs: { type: "webhook", webhookData: { body: {} } } } },
};

test("a manifest that matches its workflow is valid", () => {
  assert.deepEqual(validateManifest(good, wf), []);
});
test("drift is reported: renamed workflow, missing trigger node, wrong trigger type", () => {
  const errs = validateManifest({ ...good, workflowName: "Old", trigger: { type: "manual", node: "Gone" } }, wf);
  assert.ok(errs.some((e) => /workflowName/.test(e)));
  assert.ok(errs.some((e) => /trigger node "Gone"/.test(e)));
});
test("webhook manifests must give an example webhook input; side effects are required", () => {
  const errs = validateManifest({ ...good, sideEffects: [], mcp: { executeWorkflow: { triggerNodeName: "Hook" } } }, wf);
  assert.ok(errs.some((e) => /sideEffects/.test(e)));
  assert.ok(errs.some((e) => /webhookData/.test(e)));
});
test("descriptions fit in n8n's description box", () => {
  assert.ok(validateManifest({ ...good, description: "x".repeat(301) }, wf).some((e) => /description/.test(e)));
});
test("every workflow in the repo has exactly one valid manifest", async () => {
  const all = await loadManifests("workflows");
  assert.equal(all.length, 11);
  for (const m of all) assert.deepEqual(m.errors, [], m.path);
  assert.equal(new Set(all.map((m) => m.manifest.id)).size, all.length);
});
test("CLI lists manifests as JSON", () => {
  const r = spawnSync("node", ["scripts/manifests.mjs", "list", "--json"]);
  assert.equal(r.status, 0, r.stderr.toString());
  const out = JSON.parse(r.stdout);
  assert.ok(out.find((m) => m.id === "lark-requirement-to-bitable").input.required.includes("user_text"));
});
