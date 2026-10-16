# FeishuBotBitable

[English (global edition)](../../../global/Lark/FeishuBotBitable/README.md) | 简体中文（国内版）

这套 workflow 用来处理飞书机器人发来的需求描述，把文本整理成结构化字段，并自动写入多维表格。

对应文件：`feishu-bot-bitable-workflow.redacted.json`

## 适用场景

- 让同事直接在飞书里提需求
- 自动补齐 Bitable 里的字段
- 自动生成一份简版 PRD
- 回写一条飞书卡片消息给提交人

## 主流程

1. 通过 Webhook 接收飞书消息
2. 获取 Tenant Token
3. 查询发送者信息
4. 读取 Bitable 字段列表
5. 构建 Prompt，让 DeepSeek 生成字段值
6. 再调用一次 DeepSeek 生成 PRD 文本
7. 新增一条 Bitable 记录
8. 回复飞书交互卡片

## 依赖项

- n8n
- Feishu / Lark 应用
- Bitable
- DeepSeek API

## 导入后需要替换的配置

公开版里这些值已经被替换成占位符：
- `{{WEBHOOK_PATH}}`
- `{{WEBHOOK_ID}}`
- `{{FEISHU_APP_ID}}`
- `{{FEISHU_APP_SECRET}}`
- `{{DEEPSEEK_API_KEY}}`
- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TABLE_ID}}`
- `{{BITABLE_BASE_URL}}`

建议优先检查这些节点：
- `接收飞书消息`
- `获取飞书 Tenant Token`
- `获取多维表格字段列表`
- `调用 DeepSeek 填表`
- `调用 DeepSeek 生成 PRD`
- `新增多维表格记录`
- `回复飞书消息`

## 输入与输出

### 输入
- 飞书机器人收到的文本消息
- 发送人 open_id / chat_id / message_id

### 输出
- 一条新增的 Bitable 记录
- 一段写入字段的 PRD 文本
- 一条回给用户的飞书卡片消息

## 使用建议

- Bitable 字段命名尽量稳定，方便模型按字段含义填充。
- 如果表里有“人员”“日期”“单选”“多选”字段，导入后先做一轮测试，确认字段类型映射没问题。
- 如果 PRD 字段名不是 `AI需求说明`，记得同步改代码节点里的字段名。

## 常见问题

### 1. 导入后为什么不能直接运行？
因为仓库里是脱敏后的版本，所有凭证和业务参数都要重新填。

### 2. 为什么保留了流程结构但没有保留真实地址？
这是为了可以公开分享，同时又不把生产环境配置暴露出去。

### 3. 适合直接用于生产吗？
建议先在测试表中跑通，再接正式群和正式表。
