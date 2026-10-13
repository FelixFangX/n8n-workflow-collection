<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/assets/header-dark.svg">
  <img alt="n8n-workflow-collection — Redacted n8n workflows for Lark, Bitable and socials." src="./docs/assets/header-light.svg" width="100%">
</picture>

**Import-ready, redacted n8n workflows: Lark/Feishu bot messages into Bitable records and PRD drafts, plus social-media metrics tracking via Apify.** English | [简体中文](./README.zh-CN.md)

## Quickstart

1. In n8n, go to **Workflows → Import from file** and pick a `workflows/**/*.redacted.json`.
2. Replace every `{{PLACEHOLDER}}` (credentials, table IDs, webhook IDs) with your own.
3. Rebind credentials in n8n, test on a non-production Bitable, then enable.

Requires n8n, the Lark/Feishu Open Platform with Bitable, DeepSeek (for the bot flow) and Apify (for the social flows, needs actor access and quota).

## Workflows

| Workflow | Trigger | Services | Nodes | What it automates |
|---|---|---|---|---|
| [Lark / FeishuBotBitable](./workflows/Lark/FeishuBotBitable/README.md) | Webhook (Feishu bot) | Lark, Bitable, DeepSeek | 12 | Chat message → structured Bitable record + PRD draft |
| [SocialMediaTracker / Create](./workflows/SocialMediaTracker/Create/README.md) | Manual | Apify, Bitable | 32 | Monthly tracking table + bulk import across platforms |
| [SocialMediaTracker / Update](./workflows/SocialMediaTracker/Update/README.md) | Manual | Apify, Bitable | 44 | Refresh metrics for Instagram, X, YouTube, Facebook |
| [Instagram](./workflows/Instagram/README.md) · [X](./workflows/X/README.md) · [YouTube](./workflows/Youtube/README.md) · [Facebook](./workflows/Facebook/README.md) | Manual | Apify, Bitable | 17–22 | Per-platform Create / Update split-outs |

## How it works

```text
trigger (webhook | manual) ─▶ fetch (Lark API | Apify actor) ─▶ normalise (Code/Set) ─▶ write (Bitable) ─▶ notify
```

Each platform has a **Create** flow (build the table, first import) and an **Update** flow (refresh existing rows), so either can be re-run independently.

## Testing & redaction

```bash
npm test                  # tests for the redaction checker
npm run check:redaction   # scans workflows/**/*.json, prints rule + JSON path only, never the value
```

Run the check before committing any new export. Only `{{UPPER_SNAKE}}` placeholders are allowed where credentials, tokens, tenant links, webhook IDs or emails would go.

## License

[MIT](./LICENSE)
