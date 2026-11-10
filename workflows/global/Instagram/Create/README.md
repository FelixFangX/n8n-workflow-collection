# Instagram / Create

English (global edition) | [简体中文（国内版）](../../../cn/Instagram/Create/README.md)

This workflow is the standalone Instagram version extracted from the SocialMediaTracker Create flow.

Corresponding file: `instagram-create.redacted.json`

## Purpose

- Create a new Bitable data table
- Process Instagram input URLs only
- Collect Instagram post data
- Normalize the fields and write them into the new table in bulk

## Dependencies

- n8n
- Lark (larksuite.com)
- Bitable
- OpenAI API
- Apify

## Configuration to replace after import

- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TEMPLATE_TABLE_ID}}`
- `{{OPENAI_API_KEY}}`
- `{{LARK_APP_ID}}`
- `{{LARK_APP_SECRET}}`
- `{{INSTAGRAM_PROFILE_URL}}`

In the `Config` node, keep only Instagram links inside `profileUrls`. This standalone version is already scoped to a single platform.

## Main flow

1. Read template fields and existing table names
2. Generate a new monthly table name
3. Create a new table
4. Parse URLs and enter the Instagram branch
5. Call the Instagram scraper
6. Normalize the fields
7. Write the result to the new table in bulk

## Notes

`Instagram Normalize Data` connects to `Merge All Platform Data`, then the batch write (`/records/batch_create`). That write sets `onError` to `continueRegularOutput`, so a failed batch can continue on the success output. Replay dedup is unverified. See [import preflight](../../../../docs/import-preflight.md).

This is the Instagram-only version split out from the main workflow so it can be maintained and reused independently.
