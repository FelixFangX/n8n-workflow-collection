# Facebook

[English (global edition)](../../global/Facebook/README.md) | 简体中文（国内版）

这里放的是 Facebook 相关的独立 n8n workflow。

## 目录内容

- `Create/facebook-create.redacted.json`
- `Update/facebook-update.redacted.json`

## 适用场景

### Create
新建 Facebook 数据追踪表，并按给定页面链接抓取内容。

### Update
对已有 Facebook 记录重新抓取最新数据并更新回表格。

## 依赖项

- n8n
- Feishu / Lark
- Bitable
- Apify
- Create 流程额外依赖 DeepSeek

## 使用建议

- Facebook 链接格式变化比较多，建议导入后先拿少量样本测试
- 如果返回字段和你的表不一致，先调整写回映射
- 这套流程依赖 Apify Actor，正式调用前先确认账号已经开通对应订阅或可调用权限
