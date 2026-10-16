import { test } from "node:test";
import assert from "node:assert/strict";
import { checkWorkflow, checkAll } from "../scripts/check-workflows.mjs";

const wf = (o = {}) => JSON.stringify({
  name: "Demo",
  nodes: [{ name: "Start", parameters: {} }, { name: "Next", parameters: { jsCode: "return $('Start').item.json;" } }],
  connections: { Start: { main: [[{ node: "Next", type: "main", index: 0 }]] } },
  ...o,
});

test("a consistent workflow passes", () => {
  assert.deepEqual(checkWorkflow(wf()), []);
});
test("broken connections, dangling $() references and duplicate names are reported", () => {
  const errs = checkWorkflow(wf({
    nodes: [{ name: "Start", parameters: { x: "$('Gone').item" } }, { name: "Start", parameters: {} }],
    connections: { Ghost: { main: [[{ node: "Nowhere", type: "main", index: 0 }]] } },
  }));
  assert.ok(errs.some((e) => /duplicate/.test(e)));
  assert.ok(errs.some((e) => /source "Ghost"/.test(e)));
  assert.ok(errs.some((e) => /target "Nowhere"/.test(e)));
  assert.ok(errs.some((e) => /missing node "Gone"/.test(e)));
});
test("the global edition must be free of CJK text", () => {
  const zh = wf({ name: "演示" });
  assert.deepEqual(checkWorkflow(zh), []);
  assert.ok(checkWorkflow(zh, { english: true }).some((e) => /CJK/.test(e)));
});
test("invalid JSON is reported, not thrown", () => {
  assert.match(checkWorkflow("{")[0], /invalid JSON/);
});
test("every workflow in the repo is valid and paired across editions", async () => {
  const { problems, count } = await checkAll("workflows");
  assert.deepEqual(problems, []);
  assert.equal(count, 22);
});
