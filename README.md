# n8n Workflow Collection

English | [简体中文](./README.zh-CN.md)

Reusable redacted n8n workflows for Feishu/Lark automation, Bitable workflows, and social media tracking with DeepSeek and Apify.

## What's included

### Lark / Feishu
- [`workflows/Lark/FeishuBotBitable/`](./workflows/Lark/FeishuBotBitable/README.md)
- Turn Feishu bot messages into structured Bitable records and generated PRD content.

### SocialMediaTracker
- [`workflows/SocialMediaTracker/Create/`](./workflows/SocialMediaTracker/Create/README.md)
- Create a monthly tracking table and import social media post data in bulk.

- [`workflows/SocialMediaTracker/Update/`](./workflows/SocialMediaTracker/Update/README.md)
- Refresh existing records for Instagram, X, YouTube, and Facebook.

### Standalone platform workflows
- [`workflows/Instagram/`](./workflows/Instagram/README.md)
- [`workflows/X/`](./workflows/X/README.md)
- [`workflows/Youtube/`](./workflows/Youtube/README.md)
- [`workflows/Facebook/`](./workflows/Facebook/README.md)

These are split-out platform-specific workflows for simpler reuse and maintenance.

## At a glance

| Workflow | Trigger | Services | Nodes | What it automates |
|---|---|---|---|---|
| [Lark / FeishuBotBitable](./workflows/Lark/FeishuBotBitable/README.md) | Webhook (Feishu bot) | Lark Open Platform, Bitable, DeepSeek | 12 | Chat message → structured Bitable record + generated PRD draft |
| [SocialMediaTracker / Create](./workflows/SocialMediaTracker/Create/README.md) | Manual | Apify, Bitable | 32 | Creates the monthly tracking table and bulk-imports posts from all platforms |
| [SocialMediaTracker / Update](./workflows/SocialMediaTracker/Update/README.md) | Manual | Apify, Bitable | 44 | Refreshes metrics for Instagram, X, YouTube and Facebook records |
| [Instagram](./workflows/Instagram/README.md) · [X](./workflows/X/README.md) · [YouTube](./workflows/Youtube/README.md) · [Facebook](./workflows/Facebook/README.md) | Manual | Apify, Bitable | 17–22 | Per-platform Create / Update split-outs for simpler reuse |

## Redaction check

Every workflow must contain placeholders (`{{LIKE_THIS}}`) instead of credentials, tokens, tenant links, webhook URLs or emails. Before committing a new export:

```bash
npm test                  # tests for the checker itself
npm run check:redaction   # scans workflows/**/*.json; exits 1 and prints rule + JSON path (never the value)
```

## Requirements

Most workflows expect access to:
- n8n
- Feishu / Lark Open Platform
- Feishu Bitable
- DeepSeek API
- Apify

> The social media workflows rely on Apify actors. Importing the workflow alone is not enough if your Apify account does not have the required access, quota, or subscription.

## Quick start

1. Import the target `.redacted.json` file into n8n.
2. Replace placeholders with your own credentials, IDs, and URLs.
3. Rebind credentials, webhooks, table IDs, and platform parameters in n8n.
4. Test in a non-production environment first.
5. Enable or schedule the workflow only after validation.

## Repository structure

```text
workflows/
  Lark/
    FeishuBotBitable/
  SocialMediaTracker/
    Create/
    Update/
  Instagram/
    Create/
    Update/
  X/
    Create/
    Update/
  Youtube/
    Create/
    Update/
  Facebook/
    Create/
    Update/
```

## Security note

All exported workflows in this repository are redacted before sharing. Removed or replaced values include:
- Feishu / Lark app credentials
- DeepSeek API keys
- Webhook paths and IDs
- Bitable app, table, and record identifiers
- Apify credential references
- Internal profile URLs and business-specific addresses

If you add new workflows, keep the same redaction standard before committing exports.

## Documentation map

- [Lark / Feishu workflow](./workflows/Lark/FeishuBotBitable/README.md)
- [SocialMediaTracker overview](./workflows/SocialMediaTracker/README.md)
- [SocialMediaTracker / Create](./workflows/SocialMediaTracker/Create/README.md)
- [SocialMediaTracker / Update](./workflows/SocialMediaTracker/Update/README.md)
- [Instagram overview](./workflows/Instagram/README.md)
- [Instagram / Create](./workflows/Instagram/Create/README.md)
- [Instagram / Update](./workflows/Instagram/Update/README.md)
- [X overview](./workflows/X/README.md)
- [X / Create](./workflows/X/Create/README.md)
- [X / Update](./workflows/X/Update/README.md)
- [Youtube overview](./workflows/Youtube/README.md)
- [Youtube / Create](./workflows/Youtube/Create/README.md)
- [Youtube / Update](./workflows/Youtube/Update/README.md)
- [Facebook overview](./workflows/Facebook/README.md)
- [Facebook / Create](./workflows/Facebook/Create/README.md)
- [Facebook / Update](./workflows/Facebook/Update/README.md)

## Notes

This repository is best used as a reusable workflow reference and public export collection. Most workflows still need field mapping, table design, credentials, and business rules adjusted for your own environment.
