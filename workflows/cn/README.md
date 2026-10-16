# 国内版（China edition）

[English (global edition)](../global/README.md) | 简体中文

> This is the Chinese-localized edition for users in mainland China. The English, international edition is in [`workflows/global/`](../global/README.md).

国内版的节点名、代码注释、大模型提示词和飞书卡片文案均为中文，服务选用国内可直接访问的版本。目录结构与 `global/` 完全一致。

| 流程 | 文档 |
|---|---|
| 飞书机器人 → 多维表格记录 + PRD | [Lark/FeishuBotBitable](./Lark/FeishuBotBitable/README.md) |
| 社媒效果追踪（全平台） | [SocialMediaTracker](./SocialMediaTracker/README.md)：[Create](./SocialMediaTracker/Create/README.md) · [Update](./SocialMediaTracker/Update/README.md) |
| 单平台拆分版 | [Instagram](./Instagram/README.md) · [X](./X/README.md) · [YouTube](./Youtube/README.md) · [Facebook](./Facebook/README.md) |

## 服务选型

| 用途 | 国内版 | 国际版 |
|---|---|---|
| 机器人、多维表格、通讯录 API | 飞书 `https://open.feishu.cn` | Lark `https://open.larksuite.com` |
| 大模型（填表、PRD、表名） | DeepSeek `https://api.deepseek.com/chat/completions`，模型 `deepseek-chat` | OpenAI，模型 `gpt-4o-mini` |
| 社媒数据抓取 | Apify（保留，见下方说明） | Apify |

- 大模型调用使用 OpenAI 兼容接口。如需换成通义千问（DashScope 兼容模式 `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`）或 Moonshot（`https://api.moonshot.cn/v1/chat/completions`），只需修改 HTTP Request 节点（名称以 `调用 DeepSeek` 开头）中的 URL、`model` 和 API Key。
- 消息通知本身就走飞书，所以无需改成钉钉或企业微信。若要改用钉钉/企业微信群机器人，把 `回复飞书消息` 节点改为对应的 Webhook 请求即可。
- **Apify 未替换**：社媒流程抓取的是 Instagram、X、YouTube、Facebook 等海外平台，国内没有对等的合规替代服务。Apify 的 API 在国内访问可能不稳定，建议把 n8n 部署在能稳定访问海外网络的环境。

## 字段名约定

流程按字段名读写多维表格，字段名需要和你的表一致：

| 流程 | 字段 | 国内版 | 国际版 |
|---|---|---|---|
| 社媒追踪 / 单平台 Create、Update | 平台 | 字段名包含 `平台`，或包含 `PLATFORM`（默认 `SOCIAL MEDIA PLATFORM`） | 仅英文 `PLATFORM` |
| 社媒追踪 / 单平台 Create、Update | 帖子链接 | 字段名包含 `链接`、`LINK` 或 `URL`（默认 `POSTS Link`） | 仅英文 `LINK` / `URL` |
| 飞书机器人 | PRD 正文（由流程写入） | `AI需求说明` | `AI PRD` |
| 飞书机器人 | 提出人部门（可选，查找引用字段） | `提出人.部门` | `Requester.Department` |
| 飞书机器人 | 回复卡片中按日期显示的字段 | 名称含 `日期` 或 `时间` | 名称含 `Date` 或 `Time` |

新建月度表的兜底表名为 `YYYY年M月`。时间按北京时间（UTC+8）处理。
