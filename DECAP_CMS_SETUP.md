# Decap CMS (Web UI) 配置指南

Decap CMS 提供了一个可视化的 Web 界面来管理你的博客，无需手动编辑文件。

## 🚀 快速开始

### 第一步：创建 GitHub OAuth 应用

1. 打开 https://github.com/settings/developers
2. 点击 **New OAuth App**
3. 填写信息：
   - **Application name**: `我的博客 CMS`
   - **Homepage URL**: `https://hi-jiajun.github.io`
   - **Authorization callback URL**: `https://api.netlify.com/oauth/callback`
4. 点击 **Register application**
5. 记录 **Client ID**
6. 点击 **Generate a new client secret**，记录 **Client Secret**

### 第二步：创建 Netlify OAuth 代理

由于 GitHub Pages 不支持 OAuth 回调，我们需要使用 Netlify 的 OAuth 代理服务。

1. 打开 https://app.netlify.com/
2. 使用 GitHub 账号登录
3. 点击 **New site from Git**
4. 选择 **GitHub**，授权访问
5. 选择一个仓库（可以创建一个空仓库）
6. 点击 **Deploy site**
7. 部署完成后，进入 **Site settings** → **Access control** → **OAuth**
8. 点击 **Install provider**
9. 选择 **GitHub**
10. 填入之前记录的 **Client ID** 和 **Client Secret**
11. 点击 **Save**

记录你的 Netlify 站点域名（如 `your-site.netlify.app`）

### 第三步：更新 CMS 配置

编辑 `static/admin/config.yml`，更新以下内容：

```yaml
backend:
  name: github
  repo: Hi-Jiajun/hi-jiajun.github.io
  branch: main
  base_url: https://your-site.netlify.app  # 替换为你的 Netlify 站点域名
  auth_type: pkce
  app_id: "your_github_oauth_app_id"       # 替换为你的 Client ID
```

### 第四步：提交并推送

```bash
cd /home/hiliang/Github/Blog
git add .
git commit -m "✨ 添加 Decap CMS 管理界面"
git push
```

### 第五步：访问管理界面

等待 1-2 分钟部署完成后，访问：

**https://hi-jiajun.github.io/admin/**

使用你的 GitHub 账号登录即可！

---

## 📝 使用说明

### 写文章

1. 访问 https://hi-jiajun.github.io/admin/
2. 点击 **文章** → **新建文章**
3. 填写标题、标签、分类等信息
4. 在编辑器中编写内容（支持 Markdown）
5. 点击 **保存** 或 **发布**

### 编辑文章

1. 在文章列表中找到要编辑的文章
2. 点击文章标题进入编辑
3. 修改内容后点击 **保存**

### 管理页面

1. 点击 **页面** 可以编辑关于、归档等页面
2. 点击 **博客配置** 可以修改博客标题、首页信息等

### 媒体管理

1. 点击 **媒体** 可以上传和管理图片
2. 在文章中插入图片时会自动上传

---

## 🔧 高级配置

### 自定义预览样式

编辑 `static/admin/index.html`，在 `<script>` 标签中添加自定义样式：

```javascript
CMS.registerPreviewStyle(`
  body { font-family: 'Georgia', serif; }
  h1 { color: #333; }
  p { line-height: 1.8; }
`, { raw: true });
```

### 添加更多字段

编辑 `static/admin/config.yml`，在 `collections` 中添加新字段：

```yaml
fields:
  - { label: "封面图", name: "cover", widget: "image", required: false }
  - { label: "作者", name: "author", widget: "string", default: "Your Name" }
```

---

## ❓ 常见问题

### Q: 登录时提示 "Not Found"
A: 检查 `config.yml` 中的 `repo` 是否正确

### Q: 保存文章后没有出现在博客上
A: 检查文章的 `draft` 是否为 `false`

### Q: 图片上传失败
A: 检查 `media_folder` 路径是否正确，确保 `static/images/uploads` 目录存在

### Q: 如何删除文章？
A: 目前 CMS 不支持直接删除，需要在 GitHub 仓库中手动删除文件

---

## 📚 更多资源

- [Decap CMS 官方文档](https://decapcms.org/docs/hugo/)
- [GitHub OAuth 文档](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Netlify OAuth 文档](https://docs.netlify.com/visitor-access/oauth-provider-api/)

---

## 🎨 界面预览

访问 https://hi-jiajun.github.io/admin/ 后，你将看到：

- 📝 **文章管理** - 创建、编辑、发布文章
- 📄 **页面管理** - 编辑关于、归档等页面
- 🖼️ **媒体管理** - 上传和管理图片
- ⚙️ **配置管理** - 修改博客设置

所有操作都会自动同步到你的 GitHub 仓库，并自动部署到博客！
