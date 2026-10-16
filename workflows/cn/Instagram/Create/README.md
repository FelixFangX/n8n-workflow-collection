# Instagram / Create

[English (global edition)](../../../global/Instagram/Create/README.md) | 简体中文（国内版）

这条 workflow 是从 SocialMediaTracker 的 Create 主流程里拆出来的 Instagram 独立版本。

对应文件：`instagram-create.redacted.json`

## 用途

- 创建新的 Bitable 数据表
- 只处理 Instagram 输入链接
- 抓取 Instagram 帖子数据
- 标准化字段后批量写入新表

## 依赖项

- n8n
- Feishu / Lark
- Bitable
- DeepSeek API
- Apify

## 导入后要修改的内容

- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TEMPLATE_TABLE_ID}}`
- `{{DEEPSEEK_API_KEY}}`
- `{{FEISHU_APP_ID}}`
- `{{FEISHU_APP_SECRET}}`
- `{{INSTAGRAM_PROFILE_URL}}`

建议把 `配置参数` 节点中的 `profileUrls` 只保留 Instagram 链接，当前独立版已经收窄为单个平台输入。

## 主流程

1. 获取模板表字段和已有表名
2. 生成当月新表名
3. 创建新表
4. 解析 URL 并进入 Instagram 分支
5. 调用 Instagram Scraper
6. 标准化字段
7. 批量写入新表

## 说明

这是从总流程里裁出来的独立版本，方便单独维护 Instagram 数据采集。
