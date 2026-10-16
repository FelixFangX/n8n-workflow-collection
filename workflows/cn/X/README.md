# X

[English (global edition)](../../global/X/README.md) | 简体中文（国内版）

这里放的是 X / Twitter 相关的独立 n8n workflow。

## 目录内容

- `Create/x-create.redacted.json`
- `Update/x-update.redacted.json`

## 适用场景

### Create
按月份新建 X 数据表，并采集指定账号在时间范围内的内容。

### Update
读取已有记录，重新抓取 X 帖子的互动数据并更新回表格。

## 依赖项

- n8n
- Feishu / Lark
- Bitable
- Apify
- Create 流程额外依赖 DeepSeek

## 使用建议

- 如果链接格式不是标准账号页，先检查 workflow 里的账号提取逻辑
- Create 会按年月生成搜索条件，改月份时要一起确认抓取范围
- 这套流程依赖 Apify Actor，正式调用前先确认账号已经开通对应订阅或可调用权限
