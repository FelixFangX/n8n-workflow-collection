# SocialMediaTracker / Update

English | [简体中文](./README.zh-CN.md)

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

## Dependencies

- n8n
- Feishu / Lark
- Bitable
- Apify

## Configuration to replace after import

Start with the `Config` node:
- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TABLE_ID}}`
- `{{FEISHU_APP_ID}}`
- `{{FEISHU_APP_SECRET}}`

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
