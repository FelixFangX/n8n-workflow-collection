# Instagram

English (global edition) | [简体中文（国内版）](../../cn/Instagram/README.md)

This folder contains standalone n8n workflows for Instagram.

## Contents

- `Create/instagram-create.redacted.json`
- `Update/instagram-update.redacted.json`

## When to use each workflow

### Create
Use this when you want to create a new monthly Instagram tracking table and bulk import data for selected accounts or pages.

### Update
Use this when you already have an Instagram table and only want to refresh engagement and post performance data.

## Dependencies

- n8n
- Lark (larksuite.com)
- Bitable
- Apify
- The Create flow also depends on OpenAI

## Usage notes

- If you are setting this up for the first time, start with `Create/README.md`.
- If you already have a table, go directly to `Update/README.md`.
- Replace placeholders with your own configuration before testing.
- These workflows depend on Apify actors, so confirm that your Apify account has the required subscription, quota, or actor access before production use.
