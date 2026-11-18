# Hi-Jiajun's Workbench Blog

基于 [Astro 5](https://astro.build/) 的个人技术博客，部署在 `https://hi-jiajun.github.io/`。

支持**手写原创（`source: "manual"`）**与**自动化 AI 生成（`source: "ai"`）**双轨文章分类，所有文章均为 `src/content/posts/` 下的纯 Markdown 文件，推送 `main` 后自动构建发布，并支持通过 `repository_dispatch` 实时刷新 GitHub 个人主页 [`Hi-Jiajun/Hi-Jiajun`](https://github.com/Hi-Jiajun/Hi-Jiajun)。

## ✨ 核心特性

- **双轨文章来源区分**：手写原创与 AI 生成文章独立标记徽章、支持归档筛选、全局搜索筛选及分流 RSS（`/rss.xml`、`/rss-manual.xml`、`/rss-ai.xml`）
- **阅读与交互体验**：全局 `⌘K` / `/` 命令面板、阅读进度条、粘性滚动目录（TOC）、IDE 风格代码块复制、Callouts、阅读字号/行宽调节、关联文章推荐与 Giscus 评论（自动跟随日夜主题）
- **零摩擦写作与自动化**：交互式 `pnpm new` 向导、AI 自动生成周报/项目解析 PR 工作流、GitHub Issue 打标一键转文章 PR

## ✍️ 日常发文方式

### 方式一：本地命令新建手写文章

```bash
# 交互式向导（引导填写标题、slug、来源、标签、摘要与图片目录）
pnpm new

# 或命令行一步创建
pnpm new my-topic "我的新文章标题" --tags "VPP,系统" --with-images
```

### 方式二：GitHub Issue 一键发文

在仓库提一个 Issue（正文即 Markdown 文章），打上 `publish`（标记为手写）或 `ai-draft`（标记为 AI）标签，Actions 会自动创建文章 Pull Request 并回贴 PR 链接，确认无误后点击 Merge 即可发布。

### 方式三：AI 自动生成文章 PR

1. 在仓库 **Settings → Secrets and variables → Actions** 配置：
   - Secret `LLM_API_KEY`：OpenAI 兼容接口密钥（如 DeepSeek / OpenAI）
   - Variable `LLM_BASE_URL`（可选）：例如 `https://api.deepseek.com/v1`（默认 `https://api.openai.com/v1`）
   - Variable `LLM_MODEL`（可选）：例如 `deepseek-chat`（默认 `gpt-4o-mini`）
2. 每周一会自动扫描你近期活跃仓库提交并生成一篇草稿 PR；也可以在 Actions → **AI Auto Post PR** 中手动输入模式（`weekly-digest` / `repo-deep-dive` / `topic-note`）随时触发，或本地运行 `pnpm ai-post`。

### 实时联动 GitHub 主页（可选）

若希望博客发布新文章后**秒级**触发 [`Hi-Jiajun/Hi-Jiajun`](https://github.com/Hi-Jiajun/Hi-Jiajun) 更新（而不必等每日定时任务），可在博客仓库 Secrets 添加一个带 `repo` 权限的 PAT `PROFILE_SYNC_TOKEN`。
