# Youtube

[English (global edition)](../../global/Youtube/README.md) | 简体中文（国内版）

这里放的是 YouTube 相关的独立 n8n workflow。

## 目录内容

- `Create/youtube-create.redacted.json`
- `Update/youtube-update.redacted.json`

## 适用场景

### Create
新建一张 YouTube 数据表，并导入频道或视频抓取结果。

### Update
根据已有记录刷新视频表现数据并更新回原表。

## 依赖项

- n8n
- Feishu / Lark
- Bitable
- Apify
- Create 流程额外依赖 DeepSeek

## 使用建议

- 导入前先确认你是抓频道、视频还是 Shorts
- 如果表里字段结构和默认映射不同，先改字段识别逻辑
- 这套流程依赖 Apify Actor，正式调用前先确认账号已经开通对应订阅或可调用权限
