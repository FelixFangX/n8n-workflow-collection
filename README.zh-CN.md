# n8n Workflow Collection

[English（国际版 / global edition）](./README.md) | 简体中文（国内版）

这是一个整理后的 n8n 工作流仓库，主要包含经过脱敏处理的 Feishu / Lark、Bitable，以及社媒数据采集与更新相关 workflow。

仓库分为两个版本，内容和结构一一对应：

| 版本 | 目录 | 语言 | 服务 |
|---|---|---|---|
| **国内版**（本文档） | [`workflows/cn/`](./workflows/cn/README.md) | 中文节点名、注释、提示词和卡片文案 | 飞书 `open.feishu.cn`、DeepSeek |
| 国际版 | [`workflows/global/`](./workflows/global/README.md) | 英文 | Lark `open.larksuite.com`、OpenAI |

两个版本使用的多维表格字段名不同，详见 [`workflows/cn/README.md`](./workflows/cn/README.md#字段名约定)。

## 包含内容

### Lark / 飞书
- [`workflows/cn/Lark/FeishuBotBitable/`](./workflows/cn/Lark/FeishuBotBitable/README.md)
- 将飞书机器人消息转换为结构化 Bitable 记录，并生成 PRD 内容。

### SocialMediaTracker
- [`workflows/cn/SocialMediaTracker/Create/`](./workflows/cn/SocialMediaTracker/Create/README.md)
- 创建当月数据表，并批量导入社媒帖子数据。

- [`workflows/cn/SocialMediaTracker/Update/`](./workflows/cn/SocialMediaTracker/Update/README.md)
- 更新 Instagram、X、YouTube、Facebook 的已有记录。

### 平台独立工作流
- [`workflows/cn/Instagram/`](./workflows/cn/Instagram/README.md)
- [`workflows/cn/X/`](./workflows/cn/X/README.md)
- [`workflows/cn/Youtube/`](./workflows/cn/Youtube/README.md)
- [`workflows/cn/Facebook/`](./workflows/cn/Facebook/README.md)

这些目录提供拆分后的单平台 workflow，便于单独复用和维护。

## 依赖服务

大部分 workflow 需要以下服务或账号：
- n8n
- Feishu / Lark 开放平台
- Feishu Bitable
- DeepSeek API
- Apify

> 社媒相关 workflow 依赖 Apify Actor。仅导入 workflow 并不代表一定可用，Apify 账号仍需具备对应权限、额度或订阅能力。

## 快速开始

1. 将目标 `.redacted.json` 文件导入 n8n。
2. 按文档把占位符替换成自己的凭证、ID 和链接。
3. 在 n8n 中重新绑定凭证、Webhook、表格 ID 和平台参数。
4. 先在测试环境验证。
5. 确认无误后再启用或配置定时执行。

## 仓库结构

```text
workflows/
  global/                # 国际版（英文），结构与 cn/ 完全相同
  cn/                    # 国内版（中文）
    Lark/FeishuBotBitable/
    SocialMediaTracker/{Create,Update}/
    Instagram/{Create,Update}/
    X/{Create,Update}/
    Youtube/{Create,Update}/
    Facebook/{Create,Update}/
```

## 安全说明

仓库中的 workflow 导出均已做脱敏处理，移除或替换的内容包括：
- Feishu / Lark 应用凭证
- DeepSeek API Key
- Webhook path 和 ID
- Bitable app、table、record 相关标识
- Apify credential 引用
- 内部 profile URL 和业务地址

如果后续继续新增 workflow，建议保持同样的脱敏标准后再提交。

## 文档入口

- [Lark / 飞书工作流](./workflows/cn/Lark/FeishuBotBitable/README.md)
- [SocialMediaTracker 总览](./workflows/cn/SocialMediaTracker/README.md)
- [SocialMediaTracker / Create](./workflows/cn/SocialMediaTracker/Create/README.md)
- [SocialMediaTracker / Update](./workflows/cn/SocialMediaTracker/Update/README.md)
- [Instagram 总览](./workflows/cn/Instagram/README.md)
- [Instagram / Create](./workflows/cn/Instagram/Create/README.md)
- [Instagram / Update](./workflows/cn/Instagram/Update/README.md)
- [X 总览](./workflows/cn/X/README.md)
- [X / Create](./workflows/cn/X/Create/README.md)
- [X / Update](./workflows/cn/X/Update/README.md)
- [Youtube 总览](./workflows/cn/Youtube/README.md)
- [Youtube / Create](./workflows/cn/Youtube/Create/README.md)
- [Youtube / Update](./workflows/cn/Youtube/Update/README.md)
- [Facebook 总览](./workflows/cn/Facebook/README.md)
- [Facebook / Create](./workflows/cn/Facebook/Create/README.md)
- [Facebook / Update](./workflows/cn/Facebook/Update/README.md)

## 说明

这个仓库更适合作为可复用 workflow 样例和公开导出集合。导入后通常仍需要根据自己的字段设计、表结构、凭证和业务规则做调整。
