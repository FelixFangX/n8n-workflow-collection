# Instagram / Update

English (global edition) | [简体中文（国内版）](../../../cn/Instagram/Update/README.md)

This workflow is the standalone Instagram version extracted from the SocialMediaTracker Update flow.

Corresponding file: `instagram-update.redacted.json`

## Purpose

- Read existing Bitable records
- Filter Instagram records only
- Re-fetch Instagram data with the scraper
- Update the original table by `record_id`

## Configuration to replace after import

- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TABLE_ID}}`
- `{{LARK_APP_ID}}`
- `{{LARK_APP_SECRET}}`
- Apify credential binding

## Main flow

1. Read the field list and records
2. Group records by platform
3. Enter the Instagram branch
4. Fetch the latest post data
5. Match the result with the original records
6. Update Lark records

## Notes

This workflow works well as a standalone Instagram refresh step in a recurring update pipeline.
