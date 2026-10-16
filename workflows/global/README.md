# Global edition

English | [简体中文（国内版）](../cn/README.md)

The default, English edition. Node names, code comments, LLM prompts and chat-card text are all in English, and it uses services that are common outside mainland China.

| Workflow | Docs |
|---|---|
| Lark bot → Bitable record + PRD | [Lark/FeishuBotBitable](./Lark/FeishuBotBitable/README.md) |
| Social media tracker (all platforms) | [SocialMediaTracker](./SocialMediaTracker/README.md): [Create](./SocialMediaTracker/Create/README.md) · [Update](./SocialMediaTracker/Update/README.md) |
| Per-platform split-outs | [Instagram](./Instagram/README.md) · [X](./X/README.md) · [YouTube](./Youtube/README.md) · [Facebook](./Facebook/README.md) |

## Services

| Purpose | Global edition | China edition |
|---|---|---|
| Chat bot, Base/Bitable, contacts API | Lark, `https://open.larksuite.com` | Feishu, `https://open.feishu.cn` |
| LLM (form filling, PRD, table naming) | OpenAI `https://api.openai.com/v1/chat/completions`, model `gpt-4o-mini` | DeepSeek `https://api.deepseek.com/chat/completions`, model `deepseek-chat` |
| Social scraping | Apify actors | Apify actors (unchanged) |

Placeholders: `{{LARK_APP_ID}}`, `{{LARK_APP_SECRET}}` and `{{OPENAI_API_KEY}}` replace the China edition's `{{FEISHU_APP_ID}}`, `{{FEISHU_APP_SECRET}}` and `{{DEEPSEEK_API_KEY}}`. Any OpenAI-compatible endpoint works if you change the URL and model in the HTTP Request nodes named `OpenAI: …`.

## Field names

The workflows read and write Bitable fields by name, so these must match your table.

| Workflow | Field | Global edition expects | China edition expects |
|---|---|---|---|
| SocialMediaTracker / per-platform Update and Create | Platform | a field whose name contains `PLATFORM` (case-insensitive), default `SOCIAL MEDIA PLATFORM` | the same English names, **or** one containing `平台` |
| SocialMediaTracker / per-platform Update and Create | Post link | a field whose name contains `LINK` or `URL`, default `POSTS Link` | the same English names, **or** one containing `链接` |
| Lark/FeishuBotBitable | PRD text (written by the workflow) | `AI PRD` | `AI需求说明` |
| Lark/FeishuBotBitable | Requester's department (optional lookup) | `Requester.Department` | `提出人.部门` |
| Lark/FeishuBotBitable | Date fields shown as dates in the reply card | names containing `Date` or `Time` | names containing `日期` or `时间` |

The bot flow fills every other field from the table schema it reads at run time, so other field names can be anything. New monthly tables in the Create flows are named by the LLM after your existing tables; the fallback is `YYYY-MM` (China edition: `YYYY年M月`).

## Timezone

The bot flow's prompt and reply card use `UTC_OFFSET_HOURS = 0` (UTC) in the `Build AI Prompt` and `Build Reply Message` code nodes. Set it to your team's offset. The China edition is fixed to UTC+8.
