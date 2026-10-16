# SocialMediaTracker / Create

English (global edition) | [简体中文（国内版）](../../../cn/SocialMediaTracker/Create/README.md)

This workflow creates a new table from a set of social profile URLs and writes post data into it in bulk.

Corresponding file: `social-media-effectiveness-tracker-create.redacted.json`

## Main flow

1. Set base parameters such as year/month, Bitable settings, profile URLs, and the OpenAI API key
2. Get a tenant token
3. Read existing table names and the template table fields
4. Use OpenAI to generate a new table name
5. Create a new table from the template fields
6. Parse input URLs and split them into Instagram, X, YouTube, and Facebook branches
7. Call Apify to collect data for each platform
8. Normalize the result schema
9. Write records into the new table in bulk

## Dependencies

- n8n
- Lark (larksuite.com)
- Bitable
- OpenAI API
- Apify

## Configuration to replace after import

Check the `Config` node first. All of these placeholders must be replaced:
- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TEMPLATE_TABLE_ID}}`
- `{{OPENAI_API_KEY}}`
- `{{INSTAGRAM_PROFILE_URL}}`
- `{{FACEBOOK_PROFILE_URL}}`
- `{{X_PROFILE_URL}}`
- `{{YOUTUBE_CHANNEL_URL}}`
- `{{LARK_APP_ID}}`
- `{{LARK_APP_SECRET}}`

Also confirm:
- the template table fields fit your use case
- the naming rule for new tables matches your convention
- the Bitable field types match the Apify output structure

## Inputs

The main input is a set of social profile URLs. The workflow currently detects platforms by domain name:
- `instagram.com`
- `x.com` / `twitter.com`
- `youtube.com`
- `facebook.com`

## Outputs

- A newly created Bitable table
- New records written in bulk
- Normalized post data from each platform branch

## Usage notes

- Start with a clean template table so the created table stays predictable.
- If you run it multiple times in the same month, confirm the table naming strategy to avoid duplicates.
- If you only need a subset of platforms, remove the unused profile URLs.

## FAQ

### Why is an LLM used here?
It is used to generate a new table name based on existing naming patterns, not only for free-text generation.

### Why use placeholders instead of example accounts?
Because the workflow is designed around real account lists, placeholders make the required configuration clearer.

### What usually breaks first after import?
Template fields, Apify credentials, and profile URL formats are the most common failure points.
