#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const postsDir = path.join(rootDir, 'src/content/posts');
const imagesBaseDir = path.join(rootDir, 'public/images/posts');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const withImagesFlag = args.includes('--with-images');

let tags = ['随笔'];
let source = 'manual';
let summary = '';
const positional = [];

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--dry-run' || arg === '--with-images') continue;
  if ((arg === '--tags' || arg === '-t') && args[i + 1]) {
    tags = parseTags(args[++i]);
    continue;
  }
  if (arg.startsWith('--tags=')) {
    tags = parseTags(arg.slice('--tags='.length));
    continue;
  }
  if ((arg === '--source' || arg === '-s') && args[i + 1]) {
    source = normalizeSource(args[++i]);
    continue;
  }
  if (arg.startsWith('--source=')) {
    source = normalizeSource(arg.slice('--source='.length));
    continue;
  }
  if (arg === '--summary' && args[i + 1]) {
    summary = args[++i].trim();
    continue;
  }
  if (arg === '-h' || arg === '--help') {
    printHelp();
    process.exit(0);
  }
  positional.push(arg);
}

let title = '';
let slugInput = '';
let withImages = withImagesFlag;

if (positional.length === 0) {
  // Interactive wizard mode
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    title = (await rl.question('文章标题: ')).trim();
    if (!title) {
      console.error('错误: 标题不能为空。');
      process.exit(1);
    }
    const defaultSlug = slugify(title) || `post-${Date.now().toString().slice(-4)}`;
    const slugAnswer = (await rl.question(`URL Slug (回车默认 ${defaultSlug}): `)).trim();
    slugInput = slugify(slugAnswer) || defaultSlug;

    const srcAnswer = (await rl.question('文章来源 [manual=手写(默认) / ai=AI生成]: ')).trim();
    source = normalizeSource(srcAnswer || 'manual');

    const tagsAnswer = (await rl.question('标签（逗号分隔，回车默认 随笔）: ')).trim();
    if (tagsAnswer) tags = parseTags(tagsAnswer);

    summary = (await rl.question('一句话摘要（可选，回车跳过）: ')).trim();
    const imgAnswer = (await rl.question('是否创建专属图片目录 public/images/posts/<slug>/？[y/N]: ')).trim();
    withImages = /^y(es)?$/i.test(imgAnswer);
  } finally {
    rl.close();
  }
} else if (positional.length === 1) {
  title = positional[0].trim();
  slugInput = slugify(title);
} else {
  slugInput = slugify(positional[0]);
  title = positional.slice(1).join(' ').trim();
}

const now = new Date();
const dateStr = formatDate(now);
const isoOffset = formatLocalIso(now);

if (!slugInput) {
  slugInput = `post-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
}

const fileName = `${dateStr}-${slugInput}.md`;
const filePath = path.join(postsDir, fileName);

if (fs.existsSync(filePath)) {
  console.error(`错误: 文件已存在 -> ${filePath}`);
  process.exit(1);
}

const formattedTags = tags.map((t) => `"${t.replace(/"/g, '\\"')}"`).join(', ');
const imageHint = withImages
  ? `\n<!-- 本地图片放进 public/images/posts/${slugInput}/ 后，可直接用 ![图片说明](/images/posts/${slugInput}/example.png) 引用 -->\n`
  : '';

const content = `---
title: "${title.replace(/"/g, '\\"')}"
date: ${isoOffset}
summary: "${summary.replace(/"/g, '\\"')}"
tags: [${formattedTags}]
source: "${source}"
draft: false
---
${imageHint}
## 背景

在这里写下正文内容...
`;

if (dryRun) {
  console.log(`[dry-run] 目标文件: ${filePath}`);
  if (withImages) console.log(`[dry-run] 图片目录: ${path.join(imagesBaseDir, slugInput)}`);
  console.log(content);
  process.exit(0);
}

fs.mkdirSync(postsDir, { recursive: true });
fs.writeFileSync(filePath, content, 'utf8');
console.log(`已创建文章 (${source}): ${path.relative(process.cwd(), filePath)}`);
console.log(`访问路径预览: /posts/${slugInput}/`);

if (withImages) {
  const imgDir = path.join(imagesBaseDir, slugInput);
  fs.mkdirSync(imgDir, { recursive: true });
  fs.writeFileSync(path.join(imgDir, '.gitkeep'), '', 'utf8');
  console.log(`已创建图片目录: ${path.relative(process.cwd(), imgDir)}`);
  console.log(`正文引用示例: ![描述](/images/posts/${slugInput}/cover.png)`);
}

function printHelp() {
  console.log('用法:');
  console.log('  pnpm new                                          # 交互式创建向导');
  console.log('  pnpm new "文章标题"                               # 快速新建手写文章');
  console.log('  pnpm new my-slug "文章标题" --tags "VPP,C"        # 指定 slug 与标签');
  console.log('可选参数:');
  console.log('  --source manual|ai   指定来源类型（默认 manual）');
  console.log('  --tags "A,B"         逗号分隔的标签列表');
  console.log('  --summary "..."      文章摘要');
  console.log('  --with-images        同步创建 public/images/posts/<slug>/ 目录');
  console.log('  --dry-run            仅预览，不写入磁盘');
}

function parseTags(raw) {
  const list = raw
    .split(/[,，]/)
    .map((t) => t.trim())
    .filter(Boolean);
  return list.length > 0 ? list : ['随笔'];
}

function normalizeSource(raw) {
  return raw.trim().toLowerCase() === 'ai' ? 'ai' : 'manual';
}

function slugify(raw) {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fff-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatLocalIso(d) {
  const pad = (n) => String(n).padStart(2, '0');
  const tzMinutes = -d.getTimezoneOffset();
  const sign = tzMinutes >= 0 ? '+' : '-';
  const absMin = Math.abs(tzMinutes);
  const tzH = pad(Math.floor(absMin / 60));
  const tzM = pad(absMin % 60);
  return `${formatDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${tzH}:${tzM}`;
}
