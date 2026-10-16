# FeishuBotBitable

English | [简体中文](./README.zh-CN.md)

This workflow receives requirement messages from a Feishu bot, turns them into structured fields, and writes the result into Bitable.

Corresponding file: `feishu-bot-bitable-workflow.redacted.json`

## Use cases

- Let teammates submit requirements directly in Feishu
- Fill Bitable fields automatically
- Generate a lightweight PRD automatically
- Send a Feishu card reply back to the submitter

## Main flow

1. Receive a Feishu message through a webhook
2. Get a tenant token
3. Query sender information
4. Read the Bitable field list
5. Build a prompt and ask DeepSeek to generate field values
6. Call DeepSeek again to generate PRD content
7. Create a new Bitable record
8. Reply with a Feishu interactive card

## Dependencies

- n8n
- Feishu / Lark app
- Bitable
- DeepSeek API

## Configuration to replace after import

The public export replaces these values with placeholders:
- `{{WEBHOOK_PATH}}`
- `{{WEBHOOK_ID}}`
- `{{FEISHU_APP_ID}}`
- `{{FEISHU_APP_SECRET}}`
- `{{DEEPSEEK_API_KEY}}`
- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TABLE_ID}}`
- `{{BITABLE_BASE_URL}}`

Recommended nodes to check first:
- `Receive Lark Message`
- `Get Lark Tenant Token`
- `Get Bitable Field List`
- `DeepSeek: Fill Form`
- `DeepSeek: Generate PRD`
- `Create Bitable Record`
- `Reply to Lark Message`

## Inputs and outputs

### Inputs
- Text messages sent to the Feishu bot
- Sender metadata such as `open_id`, `chat_id`, and `message_id`

### Outputs
- A new Bitable record
- PRD text written into the target field
- A Feishu card response sent back to the user

## Usage notes

- Keep Bitable field names stable so the model can map values more reliably.
- If the table uses person, date, single-select, or multi-select fields, test field mapping carefully after import.
- If the PRD field name is not `AI需求说明`, update the field name in the code node accordingly.

## FAQ

### Why can't I run it immediately after import?
Because this repository only includes redacted exports. You must re-enter credentials and business-specific settings.

### Why keep the workflow structure but remove real endpoints?
So the workflow can be shared publicly without exposing production configuration.

### Is it ready for production as-is?
Use a test table and test chat first, then move to production once the flow is validated.
