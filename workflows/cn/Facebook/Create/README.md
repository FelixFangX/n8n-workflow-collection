# Facebook / Create

[English (global edition)](../../../global/Facebook/Create/README.md) | 简体中文（国内版）

这条 workflow 是从 SocialMediaTracker 的 Create 主流程里拆出来的 Facebook 独立版本。

对应文件：`facebook-create.redacted.json`

## 用途

- 创建新的 Bitable 数据表
- 只处理 Facebook 链接
- 抓取帖子数据并写入新表

## 导入后要修改的内容

- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TEMPLATE_TABLE_ID}}`
- `{{DEEPSEEK_API_KEY}}`
- `{{FEISHU_APP_ID}}`
- `{{FEISHU_APP_SECRET}}`
- `{{FACEBOOK_PROFILE_URL}}`

## 说明

当前独立版的 `配置参数` 已经收窄为只保留 Facebook 单个平台输入。

建议把 `profileUrls` 节点里只保留 Facebook 链接，避免混入其他平台。
