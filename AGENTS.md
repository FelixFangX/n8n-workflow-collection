# AGENTS.md

- Test: `npm test && npm run check:redaction && npm run check:manifests` (Node 22, no dependencies).
- Adding or re-exporting a workflow: redact first (only `{{UPPER_SNAKE}}` placeholders), then add or update its `workflow.manifest.json` ([schema](./schema/manifest.schema.json)). CI fails on drift.
- Never commit real credential ids, tokens, tenant URLs, webhook ids or emails. The checker prints rule + path only.
- Keep `settings.availableInMCP` false in exports; exposure is the instance owner's decision.
- Seams: `findLeaks` (scripts/check-redaction.mjs), `validateManifest`/`loadManifests` (scripts/manifests.mjs).
