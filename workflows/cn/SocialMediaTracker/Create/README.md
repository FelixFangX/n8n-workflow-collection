# SocialMediaTracker / Create

[English (global edition)](../../../global/SocialMediaTracker/Create/README.md) | 简体中文（国内版）

这条 workflow 用来根据一组社媒主页链接，创建新表并批量写入帖子数据。

对应文件：`social-media-effectiveness-tracker-create.redacted.json`

## 主流程

1. 设置基础参数：年月、Bitable 参数、社媒主页链接、DeepSeek Key
2. 获取 Tenant Token
3. 读取已有表名和模板表字段
4. 用 DeepSeek 生成一个新的表名
5. 按模板字段创建新表
6. 解析输入链接，按平台拆分成 Instagram / X / YouTube / Facebook 分支
7. 调用 Apify 抓取各平台内容
8. 统一整理字段结构
9. 批量写入新表

## 依赖项

- n8n
- Feishu / Lark
- Bitable
- DeepSeek API
- Apify

## 导入后要改的内容

重点看 `配置参数` 节点，里面的占位符都需要替换：
- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TEMPLATE_TABLE_ID}}`
- `{{DEEPSEEK_API_KEY}}`
- `{{INSTAGRAM_PROFILE_URL}}`
- `{{FACEBOOK_PROFILE_URL}}`
- `{{X_PROFILE_URL}}`
- `{{YOUTUBE_CHANNEL_URL}}`
- `{{FEISHU_APP_ID}}`
- `{{FEISHU_APP_SECRET}}`

另外还要确认：
- 模板表字段是否适合你的业务
- 新表命名规则是否符合你们的习惯
- Bitable 字段类型和 Apify 返回结果是否能对上

## 输入

主要输入是一组社媒主页链接，当前流程按照链接域名识别平台：
- instagram.com
- x.com / twitter.com
- youtube.com
- facebook.com

## 输出

- 新建的一张 Bitable 表
- 批量写入的新记录
- 按平台统一处理后的帖子数据

## 使用建议

- 先准备一张结构干净的模板表，避免新表字段失控。
- 同一个月如果反复跑，先确认表名策略，避免重复建表。
- 如果你只想抓某几个平台，可以删掉不用的 profile URL。

## 常见问题

### 1. 为什么这里还保留 DeepSeek？
因为它被用来根据已有表名规律生成新表名，不只是做文本生成。

### 2. 为什么 profile URL 用占位符而不是示例账号？
因为这个流程本身就是围绕真实账号列表跑的，直接用占位符更清楚。

### 3. 导入后最容易出错的是哪里？
通常是模板表字段、Apify 凭证和 profile URL 格式。
