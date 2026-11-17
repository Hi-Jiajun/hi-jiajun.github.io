# Hi-Jiajun's Workbench Blog

基于 [Astro 5](https://astro.build/) 的极简个人技术博客，部署在 `https://hi-jiajun.github.io/`。

设计目标只有一件事：**写文章几乎零摩擦**——所有文章都是 `src/content/posts/` 下的纯 Markdown 文件，不依赖 Git Submodule、外部 CMS 或数据库，推送到 `main` 分支后由 GitHub Actions 自动构建发布，并与 GitHub 个人主页 [`Hi-Jiajun/Hi-Jiajun`](https://github.com/Hi-Jiajun/Hi-Jiajun) 的「最新文章」自动同步。

## ✨ 特性

- **纯 Markdown 写作**：支持 GFM 表格、Shiki 双主题代码高亮、一键复制代码、自动生成目录（TOC）
- **开箱即用**：内置浅色 / 深色主题切换、全站实时搜索（快捷键 `/`）、标签归档、RSS（`/rss.xml`）与 Sitemap
- **零 submodule / 零运维**：只需 Node.js + pnpm（或直接在 GitHub 网页端新建 `.md` 文件）

## ✍️ 日常怎么发文章

### 方式一：本地命令一键新建（推荐）

```bash
# 1. 新建一篇文章（自动生成日期前缀与 Frontmatter）
pnpm new my-topic "我的新文章标题"

# 2. 编辑生成的 src/content/posts/YYYY-MM-DD-my-topic.md

# 3. 本地实时预览（可选）
pnpm dev

# 4. 推送即自动部署
git add . && git commit -m "post: add my-topic" && git push
```

### 方式二：直接在 GitHub 网页写

在仓库 `src/content/posts/` 目录下点 **Add file → Create new file**，文件名按 `YYYY-MM-DD-slug.md` 命名，填入如下 Frontmatter 后提交即可自动发布：

```markdown
---
title: "文章标题"
date: 2026-11-18T12:00:00+08:00
summary: "一句话摘要（可选，不写会自动截取正文前 150 字）"
tags: ["VPP", "系统"]
draft: false
---

正文内容...
```

## 📁 目录结构

```text
.
├── .github/workflows/deploy.yml  # GitHub Pages 自动构建与发布
├── scripts/new-post.mjs          # pnpm new 一键新建文章脚本
├── src/
│   ├── config.ts                 # 站点信息、项目清单与赞助配置（集中维护）
│   ├── content.config.ts         # Astro Content Layer 文章集合 Schema
│   ├── content/posts/            # 所有 Markdown 文章
│   ├── components/               # 页头、页脚、文章卡片
│   ├── layouts/BaseLayout.astro  # 全局布局与暗黑模式切换
│   ├── pages/                    # 首页、文章页、标签、项目、搜索、关于、RSS
│   ├── styles/global.css         # 响应式样式与代码块主题
│   └── utils/posts.ts            # 阅读时长、摘要提取、排序工具
├── astro.config.mjs
└── package.json
```

## 🔧 本地开发命令

```bash
pnpm install   # 安装依赖
pnpm dev       # 启动本地开发服务器 (http://localhost:4321)
pnpm build     # 生成静态站点到 dist/
pnpm preview   # 预览 dist/ 构建产物
```
