# Facebook / Create

English | [简体中文](./README.zh-CN.md)

This workflow is the standalone Facebook version extracted from the SocialMediaTracker Create flow.

Corresponding file: `facebook-create.redacted.json`

## Purpose

- Create a new Bitable data table
- Process Facebook links only
- Collect post data and write it into the new table

## Configuration to replace after import

- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TEMPLATE_TABLE_ID}}`
- `{{DEEPSEEK_API_KEY}}`
- `{{FEISHU_APP_ID}}`
- `{{FEISHU_APP_SECRET}}`
- `{{FACEBOOK_PROFILE_URL}}`

## Notes

The standalone `Config` node is already narrowed to Facebook-only input.

Keep only Facebook links in `profileUrls` to avoid mixing platforms.
