# Instagram / Update

[English (global edition)](../../../global/Instagram/Update/README.md) | 简体中文（国内版）

这条 workflow 是从 SocialMediaTracker 的 Update 主流程里拆出来的 Instagram 独立版本。

对应文件：`instagram-update.redacted.json`

## 用途

- 读取已有 Bitable 记录
- 只筛出 Instagram 记录
- 调用 Instagram Scraper 重新抓取数据
- 按 record_id 更新回原表

## 导入后要修改的内容

- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TABLE_ID}}`
- `{{FEISHU_APP_ID}}`
- `{{FEISHU_APP_SECRET}}`
- Apify 凭证绑定

## 主流程

1. 读取字段列表和记录
2. 按平台分组
3. 进入 Instagram 分支
4. 抓取最新帖子数据
5. 匹配原记录
6. 更新飞书记录

## 说明

适合放在日常数据刷新流程里单独跑 Instagram。
