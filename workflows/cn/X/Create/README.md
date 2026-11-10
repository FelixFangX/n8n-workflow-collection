# X / Create

[English (global edition)](../../../global/X/Create/README.md) | 简体中文（国内版）

这条 workflow 是从 SocialMediaTracker 的 Create 主流程里拆出来的 X 独立版本。

对应文件：`x-create.redacted.json`

## 用途

- 创建新的 Bitable 数据表
- 只处理 X / Twitter 输入链接
- 按时间范围抓取帖子数据
- 标准化字段后批量写入新表

## 导入后要修改的内容

- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TEMPLATE_TABLE_ID}}`
- `{{DEEPSEEK_API_KEY}}`
- `{{FEISHU_APP_ID}}`
- `{{FEISHU_APP_SECRET}}`
- `{{X_PROFILE_URL}}`

建议把 `配置参数` 节点中的 `profileUrls` 只保留 X / Twitter 链接，当前独立版已经收窄为单个平台输入。

## 说明

`X/Twitter 数据标准化` 连接到 `合并所有平台数据`，再进入批量写入（`/records/batch_create`）。该写入节点的 `onError` 是 `continueRegularOutput`，失败的批次仍可能走成功输出。重放去重未验证。见 [import preflight](../../../../docs/import-preflight.md)。

Create 版本会利用年月信息构造 X 的搜索条件，适合按月做归档采集。
