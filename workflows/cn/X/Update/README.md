# X / Update

[English (global edition)](../../../global/X/Update/README.md) | 简体中文（国内版）

这条 workflow 是从 SocialMediaTracker 的 Update 主流程里拆出来的 X 独立版本。

对应文件：`x-update.redacted.json`

## 用途

- 读取已有 Bitable 记录
- 只筛出 X / Twitter 记录
- 重新抓取互动数据
- 更新回原表

## 导入后要修改的内容

- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TABLE_ID}}`
- `{{FEISHU_APP_ID}}`
- `{{FEISHU_APP_SECRET}}`
- Apify 凭证绑定

## 说明

如果你的记录链接不是标准 X 帖子链接，导入后要重点检查匹配逻辑。
