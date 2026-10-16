# Instagram

[English (global edition)](../../global/Instagram/README.md) | 简体中文（国内版）

这里放的是 Instagram 相关的独立 n8n workflow。

## 目录内容

- `Create/instagram-create.redacted.json`
- `Update/instagram-update.redacted.json`

## 适用场景

### Create
当你想按月新建一张 Instagram 数据追踪表，并把指定账号或页面的数据批量写进去时使用。

### Update
当你已经有一张 Instagram 数据表，只想刷新互动数据和帖子表现时使用。

## 依赖项

- n8n
- Feishu / Lark
- Bitable
- Apify
- Create 流程额外依赖 DeepSeek

## 使用建议

- 如果是第一次搭建，先看 `Create/README.md`
- 如果已经有表，直接看 `Update/README.md`
- 导入后先把占位符改成你自己的配置，再测试一轮
- 这套流程依赖 Apify Actor，正式调用前先确认账号已经开通对应订阅或可调用权限
