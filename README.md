# 🚀 我的 Hugo 博客

基于 [Hugo](https://gohugo.io/) + [PaperMod](https://github.com/adityatelange/hugo-PaperMod) 主题搭建的个人博客，使用 GitHub Pages 免费托管。

## ✨ 特性

- ⚡ **极速构建** - Hugo 静态生成，毫秒级构建
- 🎨 **简洁美观** - PaperMod 主题，支持暗黑模式
- 🔍 **全文搜索** - 内置搜索功能，无需第三方服务
- 💬 **评论系统** - 集成 Giscus，基于 GitHub Discussions
- 📱 **响应式设计** - 完美适配各种设备
- 🌐 **SEO 友好** - 自动生成 sitemap、RSS
- 📊 **阅读统计** - 显示阅读时间、字数统计
- 🏷️ **标签分类** - 支持标签和分类归档

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/Hi-Jiajun/hi-jiajun.github.io.git
cd hi-jiajun.github.io
```

### 2. 安装 Hugo

**MacOS:**
```bash
brew install hugo
```

**Linux (Ubuntu/Debian):**
```bash
wget https://github.com/gohugoio/hugo/releases/download/v0.128.0/hugo_extended_0.128.0_linux-amd64.deb
sudo dpkg -i hugo_extended_0.128.0_linux-amd64.deb
```

**Windows:**
```bash
choco install hugo-extended
```

### 3. 本地预览

```bash
hugo server -D
```

访问 http://localhost:1313 预览博客。

### 4. 创建新文章

```bash
hugo new posts/my-new-post.md
```

编辑 `content/posts/my-new-post.md` 文件即可。

## 📁 项目结构

```
blog/
├── .github/
│   └── workflows/
│       └── hugo.yaml          # GitHub Actions 部署配置
├── content/
│   ├── posts/                 # 博客文章
│   │   └── hello-world.md
│   ├── about.md               # 关于页面
│   ├── archives.md            # 归档页面
│   └── search.md              # 搜索页面
├── themes/
│   └── PaperMod/              # PaperMod 主题
├── hugo.yaml                  # Hugo 配置文件
├── GISCUS_SETUP.md            # Giscus 评论配置指南
└── README.md                  # 项目说明
```

## ⚙️ 自定义配置

### 修改基本信息

编辑 `hugo.yaml` 文件：

```yaml
title: "你的博客标题"
baseURL: "https://hi-jiajun.github.io/"

params:
  author: "你的名字"
  description: "你的博客描述"
  socialIcons:
    - name: "github"
      url: "https://github.com/Hi-Jiajun"
```

### 配置评论系统

按照 [GISCUS_SETUP.md](./GISCUS_SETUP.md) 的说明配置 Giscus 评论系统。

## 📝 写文章

### 文章模板

```markdown
---
title: "文章标题"
date: 2026-06-04T10:00:00+08:00
draft: false
tags: ["标签1", "标签2"]
categories: ["分类"]
summary: "文章摘要，会显示在列表页"
---

## 正文内容

在这里写你的文章内容...
```

### Frontmatter 参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `title` | 文章标题 | `"我的文章"` |
| `date` | 发布日期 | `2026-06-04T10:00:00+08:00` |
| `draft` | 是否为草稿 | `false` |
| `tags` | 标签 | `["Hugo", "教程"]` |
| `categories` | 分类 | `["技术"]` |
| `summary` | 文章摘要 | `"这是摘要"` |
| `showComments` | 是否显示评论 | `true` |
| `showToc` | 是否显示目录 | `true` |

## 🚀 部署

本项目使用 GitHub Actions 自动部署，每次推送到 `main` 分支都会自动构建和部署。

### 部署步骤

1. 在 GitHub 创建仓库 `hi-jiajun.github.io`
2. 推送代码到仓库
3. 进入仓库 **Settings** → **Pages**
4. **Source** 选择 **GitHub Actions**
5. 等待部署完成

部署完成后，访问 `https://hi-jiajun.github.io/` 即可看到博客。

## 🔧 常用命令

```bash
# 本地预览（包含草稿）
hugo server -D

# 创建新文章
hugo new posts/my-post.md

# 构建静态文件
hugo --minify

# 更新主题
git submodule update --remote --merge
```

## 📚 相关资源

- [Hugo 官方文档](https://gohugo.io/documentation/)
- [PaperMod 主题文档](https://adityatelange.github.io/hugo-PaperMod/)
- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [Giscus 评论系统](https://giscus.app/zh-CN)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目基于 MIT 许可证开源。
