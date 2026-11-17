#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsDir = path.resolve(__dirname, '../src/content/posts');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

let tags = ['随笔'];
const positional = [];
for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--dry-run') continue;
  if (arg === '--tags' && args[i + 1]) {
    tags = args[i + 1]
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    i += 1;
    continue;
  }
  if (arg.startsWith('--tags=')) {
    tags = arg
      .slice('--tags='.length)
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    continue;
  }
  positional.push(arg);
}

if (positional.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log('用法:');
  console.log('  pnpm new "文章标题"');
  console.log('  pnpm new custom-slug "文章标题" --tags "VPP,系统"');
  console.log('可选参数:');
  console.log('  --tags "A,B"  指定逗号分隔的标签列表');
  console.log('  --dry-run     仅预览生成的路径与内容，不写入磁盘');
  process.exit(positional.length === 0 ? 1 : 0);
}

let slugInput = '';
let title = '';

if (positional.length === 1) {
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
const content = `---
title: "${title.replace(/"/g, '\\"')}"
date: ${isoOffset}
summary: ""
tags: [${formattedTags}]
draft: false
---

## 背景

在这里写下正文内容...
`;

if (dryRun) {
  console.log(`[dry-run] 目标文件: ${filePath}`);
  console.log(content);
  process.exit(0);
}

fs.mkdirSync(postsDir, { recursive: true });
fs.writeFileSync(filePath, content, 'utf8');
console.log(`已创建文章: ${path.relative(process.cwd(), filePath)}`);
console.log(`访问路径预览: /posts/${slugInput}/`);

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
