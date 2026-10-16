# Youtube / Create

[English](./README.md) | 简体中文

这条 workflow 是从 SocialMediaTracker 的 Create 主流程里拆出来的 YouTube 独立版本。

对应文件：`youtube-create.redacted.json`

## 用途

- 创建新的 Bitable 数据表
- 只处理 YouTube 链接
- 抓取频道或视频数据
- 标准化后批量写入新表

## 导入后要修改的内容

- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TEMPLATE_TABLE_ID}}`
- `{{DEEPSEEK_API_KEY}}`
- `{{FEISHU_APP_ID}}`
- `{{FEISHU_APP_SECRET}}`
- `{{YOUTUBE_CHANNEL_URL}}`

## 说明

当前独立版的 `Config` 已经收窄为只保留 YouTube 单个平台输入。

建议导入后先确认你要抓的是频道、视频还是 Shorts，再调整 Apify 输入。
