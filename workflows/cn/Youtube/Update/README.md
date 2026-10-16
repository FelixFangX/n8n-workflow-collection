# Youtube / Update

[English (global edition)](../../../global/Youtube/Update/README.md) | 简体中文（国内版）

这条 workflow 是从 SocialMediaTracker 的 Update 主流程里拆出来的 YouTube 独立版本。

对应文件：`youtube-update.redacted.json`

## 用途

- 读取已有 Bitable 记录
- 只处理 YouTube 记录
- 重新抓取视频表现数据
- 更新回原表

## 导入后要修改的内容

- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TABLE_ID}}`
- `{{FEISHU_APP_ID}}`
- `{{FEISHU_APP_SECRET}}`
- Apify 凭证绑定

## 说明

如果表里没有匹配 YouTube 指标的字段，先改映射节点再跑。
