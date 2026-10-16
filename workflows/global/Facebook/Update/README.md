# Facebook / Update

English (global edition) | [简体中文（国内版）](../../../cn/Facebook/Update/README.md)

This workflow is the standalone Facebook version extracted from the SocialMediaTracker Update flow.

Corresponding file: `facebook-update.redacted.json`

## Purpose

- Read existing Bitable records
- Filter Facebook records only
- Re-fetch post engagement data
- Update the original table

## Configuration to replace after import

- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TABLE_ID}}`
- `{{LARK_APP_ID}}`
- `{{LARK_APP_SECRET}}`
- Apify credential binding

## Notes

Facebook page and post URL formats change often, so validate the workflow with a small sample after import.
