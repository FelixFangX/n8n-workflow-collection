# Facebook / Update

[English (global edition)](../../../global/Facebook/Update/README.md) | 简体中文（国内版）

这条 workflow 是从 SocialMediaTracker 的 Update 主流程里拆出来的 Facebook 独立版本。

对应文件：`facebook-update.redacted.json`

## 用途

- 读取已有 Bitable 记录
- 只筛出 Facebook 记录
- 重新抓取帖子互动数据
- 更新回原表

## 导入后要修改的内容

- `{{BITABLE_APP_TOKEN}}`
- `{{BITABLE_TABLE_ID}}`
- `{{FEISHU_APP_ID}}`
- `{{FEISHU_APP_SECRET}}`
- Apify 凭证绑定

## 说明

Facebook 页面和帖子链接格式容易变化，建议导入后先做小样本验证。
