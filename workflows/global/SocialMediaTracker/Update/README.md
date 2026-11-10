# SocialMediaTracker / Update

English (global edition) | [简体中文（国内版）](../../../cn/SocialMediaTracker/Update/README.md)

This workflow reads existing Bitable records, splits them by platform, and refreshes post data before writing updates back.

Corresponding file: `social-media-effectiveness-tracker.redacted.json`

## Main flow

1. Set Bitable parameters
2. Get a tenant token
3. Read the field list and all records
4. Detect the platform field and link field
5. Split records into Instagram, X, YouTube, and Facebook branches
6. Call Apify to fetch the latest data
7. Map the result back to the original records
8. Update Bitable by `record_id`

## Replay and partial failure

The manual trigger has no external event id in this export. Each platform PUT uses the row's `record_id`, so a repeat addresses that same row when the id is stable. That is not exactly-once: a retry cannot see whether the first PUT landed. Apify nodes set `retryOnFail` (`maxTries` 2), so a retry can start another actor run. An actor run and the Bitable write can fail separately. No durable dedup store is configured. `npm run preflight` labels this `unverified`. See [import preflight](../../../../docs/import-preflight.md).

## Dependencies

- n8n
- Lark (larksuite.com)
- Bitable
- Apify

## Configuration to replace after import

Start with the `Config` node:
- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TABLE_ID}}`
- `{{LARK_APP_ID}}`
- `{{LARK_APP_SECRET}}`

Then verify:
- the platform field name matches your table
- the link field name matches your table
- the stored link format matches Apify input requirements
- Apify credentials have been rebound in n8n

## Inputs

- An existing Bitable table
- The platform field in that table
- The post link field in that table

## Outputs

- Updated original records
- Platform-specific refreshed result sets

## Usage notes

- This flow is better for recurring refreshes than for first-time imports.
- If the table is large, reduce the page range or test with a smaller dataset first.
- Non-English field names are fine as long as the field detection logic can still match them.

## FAQ

### Why does the workflow mention Discord but the docs do not explain it fully?
Because the exported update flow still contains grouping logic for Discord, but the public repo does not include a full standalone Discord workflow.

### What usually causes update failures?
The most common issues are `record_id`, link format mismatches, and differences between Apify output fields and your table fields.

### Can this run on a schedule?
Yes, but test it manually first before attaching a cron schedule.
