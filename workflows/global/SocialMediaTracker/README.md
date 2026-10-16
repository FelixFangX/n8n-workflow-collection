# SocialMediaTracker

English (global edition) | [简体中文（国内版）](../../cn/SocialMediaTracker/README.md)

This workflow group is used to collect and refresh social media performance data across multiple overseas platforms.

It includes two main flows:
- `Create`: create a new table and write the current month's collected results
- `Update`: refresh existing records incrementally

## Contents

- [Create](./Create/README.md)
- [Update](./Update/README.md)

## Supported platforms

The current public flow includes these platform branches:
- Instagram
- X
- YouTube
- Facebook

The update flow also contains grouping logic for `DISCORD`, but the public repo does not include a full standalone Discord workflow yet.

## Use cases

- Create a new monthly social media tracking table
- Collect data from profile or post URLs by platform
- Refresh engagement data for existing records
- Write normalized results back to Lark Base (Bitable)

## Dependencies

- n8n
- Lark (larksuite.com)
- Bitable
- Apify
- Some flows also depend on OpenAI

## Recommended reading order

If you are new to this workflow set, read the docs in this order:
1. `Create/README.md`
2. `Update/README.md`
3. `../Instagram/README.md`
4. `../X/README.md`
5. `../Youtube/README.md`
6. `../Facebook/README.md`

## Usage notes

- If you are starting from scratch, begin with `Create` for the initial table and first import.
- If you already have a table and only need refreshes, `Update` is enough.
- If your platform or link field names are different, update the field detection logic before running the workflow.
