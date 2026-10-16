# SocialMediaTracker / Update

[English (global edition)](../../../global/SocialMediaTracker/Update/README.md) | 简体中文（国内版）

这条 workflow 用来读取已有的 Bitable 记录，按平台拆分后重新抓取和更新帖子数据。

对应文件：`social-media-effectiveness-tracker.redacted.json`

## 主流程

1. 设置 Bitable 参数
2. 获取 Tenant Token
3. 读取字段列表和所有记录
4. 识别平台字段、链接字段
5. 把记录按平台拆成 Instagram / X / YouTube / Facebook 分支
6. 调用 Apify 拉取最新数据
7. 将结果映射回原记录
8. 按 record_id 更新回 Bitable

## 依赖项

- n8n
- Feishu / Lark
- Bitable
- Apify

## 导入后需要替换的配置

先处理 `配置参数` 节点：
- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TABLE_ID}}`
- `{{FEISHU_APP_ID}}`
- `{{FEISHU_APP_SECRET}}`

再检查这些内容：
- 平台字段名是否和你的表一致
- 链接字段名是否和你的表一致
- 记录里存的链接结构是否和 Apify 输入要求一致
- Apify 凭证是否已经在 n8n 中重绑

## 输入

- 一张已有的 Bitable 表
- 表中的平台字段
- 表中的帖子链接字段

## 输出

- 更新后的原始记录
- 平台分支处理后的抓取结果

## 使用建议

- 这条流程更适合做定期更新，而不是第一次建表。
- 如果记录很多，建议先缩小分页范围或先拿测试数据跑。
- 如果字段名不是英文，也没关系，但要保证字段识别逻辑能匹配到。

## 常见问题

### 1. 为什么流程里能看到 Discord，但文档里没展开？
因为当前导出的 update workflow 里有分组逻辑，但没有完整公开成独立平台说明。

### 2. 更新失败一般是哪里出问题？
最常见的是 record_id、链接字段结构、Apify 返回字段和你的表字段对不上。

### 3. 适合放定时任务吗？
可以，但建议先手动跑通一次，再挂 cron。
