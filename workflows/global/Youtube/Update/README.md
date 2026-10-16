# Youtube / Update

English (global edition) | [简体中文（国内版）](../../../cn/Youtube/Update/README.md)

This workflow is the standalone YouTube version extracted from the SocialMediaTracker Update flow.

Corresponding file: `youtube-update.redacted.json`

## Purpose

- Read existing Bitable records
- Filter YouTube records only
- Re-fetch video performance data
- Update the original table

## Configuration to replace after import

- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TABLE_ID}}`
- `{{LARK_APP_ID}}`
- `{{LARK_APP_SECRET}}`
- Apify credential binding

## Notes

If your table does not include fields that match the YouTube metrics you want to store, adjust the mapping nodes before running the workflow.
