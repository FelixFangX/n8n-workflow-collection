# Facebook / Create

English (global edition) | [简体中文（国内版）](../../../cn/Facebook/Create/README.md)

This workflow is the standalone Facebook version extracted from the SocialMediaTracker Create flow.

Corresponding file: `facebook-create.redacted.json`

## Purpose

- Create a new Bitable data table
- Process Facebook links only
- Collect post data and write it into the new table

## Configuration to replace after import

- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TEMPLATE_TABLE_ID}}`
- `{{OPENAI_API_KEY}}`
- `{{LARK_APP_ID}}`
- `{{LARK_APP_SECRET}}`
- `{{FACEBOOK_PROFILE_URL}}`

## Notes

`Facebook Normalize Data` connects to `Merge All Platform Data`, then the batch write (`/records/batch_create`). That write sets `onError` to `continueRegularOutput`, so a failed batch can continue on the success output. Replay dedup is unverified. See [import preflight](../../../../docs/import-preflight.md).

The standalone `Config` node is already narrowed to Facebook-only input.

Keep only Facebook links in `profileUrls` to avoid mixing platforms.
