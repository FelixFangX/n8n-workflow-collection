# X / Create

English (global edition) | [简体中文（国内版）](../../../cn/X/Create/README.md)

This workflow is the standalone X version extracted from the SocialMediaTracker Create flow.

Corresponding file: `x-create.redacted.json`

## Purpose

- Create a new Bitable data table
- Process X / Twitter input URLs only
- Collect post data within a time range
- Normalize the result and write it into the new table in bulk

## Configuration to replace after import

- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TEMPLATE_TABLE_ID}}`
- `{{OPENAI_API_KEY}}`
- `{{LARK_APP_ID}}`
- `{{LARK_APP_SECRET}}`
- `{{X_PROFILE_URL}}`

In the `Config` node, keep only X / Twitter links inside `profileUrls`. This standalone version is already scoped to one platform.

## Notes

The Create flow uses year/month information to build X search conditions, which makes it suitable for monthly archive-style collection.
