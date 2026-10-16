# AGENTS.md

- Test: `npm test && npm run check:redaction && npm run check:manifests && npm run check:workflows` (Node 22, no dependencies).
- Two editions with identical structure: `workflows/global/` (English, Lark larksuite.com + OpenAI, the default) and `workflows/cn/` (Chinese, Feishu + DeepSeek). Change both together; `check:workflows` fails if one side is missing a workflow or global contains CJK. Manifests set `edition`; cn ids end in `-cn`.
- Adding or re-exporting a workflow: redact first (only `{{UPPER_SNAKE}}` placeholders), then add or update its `workflow.manifest.json` ([schema](./schema/manifest.schema.json)). CI fails on drift.
- Never commit real credential ids, tokens, tenant URLs, webhook ids or emails. The checker prints rule + path only.
- Keep `settings.availableInMCP` false in exports; exposure is the instance owner's decision.
- Seams: `findLeaks` (scripts/check-redaction.mjs), `validateManifest`/`loadManifests` (scripts/manifests.mjs).
