import { test } from "node:test";
import assert from "node:assert/strict";
import { findLeaks } from "../scripts/check-redaction.mjs";

const wf = (node) => JSON.stringify({ nodes: [{ name: "n", type: "x", parameters: {}, ...node }] });
const rules = (json) => findLeaks(json).map((l) => l.rule);

test("a placeholder-only workflow is clean", () => {
  assert.deepEqual(findLeaks(wf({ credentials: { apifyApi: { id: "{{APIFY_CREDENTIAL_ID}}", name: "{{APIFY_CREDENTIAL_NAME}}" } } })), []);
});
test("real credential ids are flagged", () => {
  assert.deepEqual(rules(wf({ credentials: { larkApi: { id: "aB3dE5fG7hI9jK1l", name: "Felix Lark" } } })), ["credential-id"]);
});
test("API keys and bearer tokens are flagged", () => {
  assert.ok(rules(wf({ parameters: { key: "sk-abcdefghijklmnopqrstuvwx" } })).includes("api-key"));
  assert.ok(rules(wf({ parameters: { h: "Bearer abcdefghijklmnop1234" } })).includes("bearer-token"));
  assert.ok(rules(wf({ parameters: { t: "t-g1044abcdefghijklmnopqrstuv" } })).includes("lark-token"));
});
test("Lark app ids and Bitable/base links are flagged", () => {
  assert.ok(rules(wf({ parameters: { app: "cli_a1b2c3d4e5f6g7h8" } })).includes("lark-app-id"));
  assert.ok(rules(wf({ parameters: { url: "https://acme.feishu.cn/base/bascnAbCdEfGhIjKlMnOpQrStUv" } })).includes("lark-tenant-url"));
});
test("live webhook URLs are flagged; placeholder hosts are allowed", () => {
  assert.ok(rules(wf({ parameters: { url: "https://open.feishu.cn/open-apis/bot/v2/hook/0a1b2c3d-1111-2222-3333-444455556666" } })).includes("webhook-url"));
  assert.deepEqual(findLeaks(wf({ parameters: { url: "https://open.feishu.cn/open-apis/bot/v2/hook/{{LARK_WEBHOOK_ID}}" } })), []);
});
test("both editions' hosts and providers are covered (larksuite.com tenants, OpenAI project keys)", () => {
  assert.ok(rules(wf({ parameters: { url: "https://acme.larksuite.com/base/bascnAbCdEfGhIjKlMnOpQrStUv" } })).includes("lark-tenant-url"));
  assert.ok(rules(wf({ parameters: { key: "sk-proj-abcdefghijklmnopqrstuvwx" } })).includes("api-key"));
  assert.deepEqual(findLeaks(wf({ parameters: { url: "https://open.larksuite.com/open-apis/bitable/v1/apps/{{BITABLE_APP_TOKEN}}" } })), []);
});
test("DingTalk and WeCom robot webhook tokens are flagged; placeholders are allowed", () => {
  assert.ok(rules(wf({ parameters: { url: "https://oapi.dingtalk.com/robot/send?access_token=0123456789abcdef0123" } })).includes("im-webhook-token"));
  assert.ok(rules(wf({ parameters: { url: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=0a1b2c3d-1111-2222-3333-444455556666" } })).includes("im-webhook-token"));
  assert.deepEqual(findLeaks(wf({ parameters: { url: "https://oapi.dingtalk.com/robot/send?access_token={{DINGTALK_TOKEN}}" } })), []);
});
test("email addresses are flagged", () => {
  assert.ok(rules(wf({ parameters: { to: "someone@example-corp.com" } })).includes("email"));
});
test("leaks report where they are without echoing the secret", () => {
  const [leak] = findLeaks(wf({ parameters: { key: "sk-abcdefghijklmnopqrstuvwx" } }));
  assert.match(leak.path, /nodes\[0\]\.parameters\.key/);
  assert.ok(!JSON.stringify(leak).includes("abcdefghijklmnop"));
});
