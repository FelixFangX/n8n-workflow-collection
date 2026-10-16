# Youtube / Create

English | [简体中文](./README.zh-CN.md)

This workflow is the standalone YouTube version extracted from the SocialMediaTracker Create flow.

Corresponding file: `youtube-create.redacted.json`

## Purpose

- Create a new Bitable data table
- Process YouTube links only
- Collect channel or video data
- Normalize the result and write it into the new table in bulk

## Configuration to replace after import

- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TEMPLATE_TABLE_ID}}`
- `{{DEEPSEEK_API_KEY}}`
- `{{FEISHU_APP_ID}}`
- `{{FEISHU_APP_SECRET}}`
- `{{YOUTUBE_CHANNEL_URL}}`

## Notes

The `Config` node in this standalone version is already narrowed to YouTube-only input.

After import, confirm whether you want to collect channel, video, or Shorts data and adjust the Apify input accordingly.
