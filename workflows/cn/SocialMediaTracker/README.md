# SocialMediaTracker

[English (global edition)](../../global/SocialMediaTracker/README.md) | 简体中文（国内版）

这一组 workflow 主要用来处理海外社媒平台的数据采集和更新。

它包含两条主流程：
- `Create`：新建表并写入当月采集结果
- `Update`：对已有记录做增量更新

## 目录说明

- [Create](./Create/README.md)
- [Update](./Update/README.md)

## 支持的平台

当前流程里已经拆出了这些平台分支：
- Instagram
- X
- YouTube
- Facebook

另外在更新流程里还能看到 `DISCORD` 的分组逻辑，但当前公开结构里没有完整的独立抓取分支说明。

## 适用场景

- 每月新建一张社媒效果追踪表
- 按平台主页或帖子链接抓取数据
- 对已有记录按平台重新同步互动数据
- 把平台采集结果统一写回 Feishu Bitable

## 依赖项

- n8n
- Feishu / Lark
- Bitable
- Apify
- 部分流程依赖 DeepSeek

## 先看哪个文件

如果你是第一次接触这组流程，建议按这个顺序看：
1. `Create/README.md`
2. `Update/README.md`
3. `../Instagram/README.md`
4. `../X/README.md`
5. `../Youtube/README.md`
6. `../Facebook/README.md`

## 使用建议

- 如果你是从零开始，先用 `Create` 建表和首批导入。
- 如果你已经有表，只需要持续刷新数据，用 `Update` 就够了。
- 如果你的平台字段、链接字段命名不同，记得先改流程里的字段识别逻辑。
