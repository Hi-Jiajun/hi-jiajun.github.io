# Giscus 评论系统配置指南

Giscus 是一个基于 GitHub Discussions 的评论系统，完全免费且开源。

## 配置步骤

### 1. 启用 GitHub Discussions

1. 进入你的博客仓库（`Hi-Jiajun/hi-jiajun.github.io`）
2. 点击 **Settings** → **General**
3. 向下滚动到 **Features** 部分
4. 勾选 **Discussions**

### 2. 安装 Giscus App

1. 访问 [github.com/apps/giscus](https://github.com/apps/giscus)
2. 点击 **Install**
3. 选择你的博客仓库
4. 完成安装

### 3. 获取配置参数

1. 访问 [giscus.app/zh-CN](https://giscus.app/zh-CN)
2. 在 **仓库** 部分输入：`Hi-Jiajun/hi-jiajun.github.io`
3. 在 **页面 ↔️ Discussion 映射关系** 选择：`pathname`
4. 在 **Discussion 分类** 选择：`Announcements`（推荐）
5. 向下滚动，复制生成的配置中的 `repoId` 和 `categoryId`

### 4. 更新博客配置

打开 `hugo.yaml`，找到 `params.comments` 部分，更新以下内容：

```yaml
params:
  comments:
    provider: "giscus"
    giscus:
      repo: "Hi-Jiajun/hi-jiajun.github.io"  # 替换为你的仓库
      repoId: "R_xxxxxxxx"               # 替换为你的 repoId
      category: "Announcements"
      categoryId: "DIC_xxxxxxxx"         # 替换为你的 categoryId
      mapping: "pathname"
      reactionsEnabled: "1"
      emitMetadata: "0"
      inputPosition: "top"
      theme: "preferred_color_scheme"
      lang: "zh-CN"
```

### 5. 测试评论

1. 部署博客后，打开任意文章
2. 滚动到页面底部
3. 应该能看到评论框
4. 使用 GitHub 账号登录后即可评论

## 常见问题

### Q: 评论没有显示？
A: 检查以下几点：
- Discussions 是否已启用
- Giscus App 是否已安装
- `repoId` 和 `categoryId` 是否正确
- 仓库是否为公开仓库

### Q: 如何自定义评论样式？
A: 在 `hugo.yaml` 中修改 `theme` 参数：
- `light` - 浅色主题
- `dark` - 深色主题
- `preferred_color_scheme` - 跟随系统

### Q: 如何关闭某篇文章的评论？
A: 在文章的 frontmatter 中添加：
```yaml
comments: false
```

## 更多信息

- [Giscus 官方文档](https://giscus.app/zh-CN)
- [Giscus GitHub](https://github.com/giscus/giscus)
