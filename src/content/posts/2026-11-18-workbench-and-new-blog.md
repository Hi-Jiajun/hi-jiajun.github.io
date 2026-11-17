---
title: "把公开工作台搬进博客：为什么重做这个站点"
date: 2026-11-18T00:30:00+08:00
summary: "放弃旧的 Hugo + PaperMod + CMS 模板，用 Astro 与纯 Markdown 重建一个写起来毫无摩擦的个人技术博客，并与 GitHub 个人主页自动联动。"
tags: ["博客", "工作台", "Astro"]
draft: false
---

今年 6 月第一次建 `hi-jiajun.github.io` 时，直接套了一套 Hugo + PaperMod 主题 + Sveltia/Decap CMS 模板，留下一篇 `Hello World` 后就再没动过。

原因很现实：**维护这套模板比写文章本身还麻烦**——不仅仓库里挂着 `themes/PaperMod` 子模块、折腾过一串 OAuth / Token CMS 配置，本地预览还要额外装特定版本的 Hugo，模板里甚至还留着 `Your Name`、`你的repoId` 这类占位符。

这次趁着整理 GitHub 个人主页 [`Hi-Jiajun/Hi-Jiajun`](https://github.com/Hi-Jiajun/Hi-Jiajun)，顺手把博客也彻底重做了一遍。

## 为什么换成 Astro + 纯 Markdown

对个人技术博客来说，最核心的指标只有一个：**从"突然想记点什么"到"发布上线"的阻力有多小**。

新版站点去掉了子模块和后台 CMS，只保留最直接的工作流：

```bash
pnpm new my-note "笔记标题"
# 编辑 src/content/posts/YYYY-MM-DD-my-note.md
git add . && git commit -m "post: my-note" && git push
```

也可以直接在 GitHub 网页端向 `src/content/posts/` 新增 `.md` 文件，GitHub Actions 会自动编译并在几十秒内发布到 `https://hi-jiajun.github.io/`。

## 新版站点保留了哪些必需能力

- **纯静态与高速构建**：所有文章在构建期通过 Astro Content Layer 校验与渲染。
- **工程写作友好的阅读体验**：Shiki 浅色/深色双主题高亮、一键复制代码块、自动提取文章目录（TOC）、响应式表格排版。
- **零外部依赖的站内检索**：构建期生成 `/search-index.json`，支持按 `/` 快捷键直达并实时过滤标题、标签和正文。
- **与 GitHub 主页自动联动**：站点输出的 `/rss.xml` 会被 [`Hi-Jiajun/Hi-Jiajun`](https://github.com/Hi-Jiajun/Hi-Jiajun) 仓库的自动化脚本定时拉取，新文章发布后会自动同步到 GitHub 个人主页的「最新文章」板块。

## 接下来这里会写什么

这个站点不会追求空泛的周报或水文，主要用来沉淀仓库 README 里放不下的长篇上下文：

1. 用户态网络数据面（FD.io VPP 插件开发、RFC 状态机与性能排障）。
2. macOS / Linux 驱动移植与真实硬件边界（什么已经测通、什么还缺吞吐或实机未加载）。
3. 小米 15S Pro（XRING O1）设备树还原、KMI/CRC 门禁以及 Wi-Fi 7 能力取证笔记。
4. GPU 计算模拟（Metal-on-Vulkan）与减少重复劳动的 AI 工程脚本。
