#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsDir = path.resolve(__dirname, '../src/content/posts');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const jsonIdx = args.indexOf('--issue-json');
const eventPath = (jsonIdx !== -1 ? args[jsonIdx + 1] : '') || process.env.GITHUB_EVENT_PATH || '';

if (!eventPath || !fs.existsSync(eventPath)) {
  console.error('错误: 找不到 GITHUB_EVENT_PATH 或 --issue-json 文件。');
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
const issue = payload.issue || payload;
if (!issue || !issue.title) {
  console.error('错误: Issue JSON 格式无效。');
  process.exit(1);
}

const labels = (issue.labels || []).map((l) => (typeof l === 'string' ? l : l.name)).filter(Boolean);
const isAiDraft = labels.includes('ai-draft');
const controlLabels = new Set(['publish', 'ai-draft', 'ai-generated']);
const postTags = labels.filter((l) => !controlLabels.has(l));
if (postTags.length === 0) postTags.push('随笔');

const rawBody = (issue.body || '').trim();
const issueNum = issue.number || Date.now();
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const iso = `${datePart}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}+08:00`;

const fileName = `${datePart}-issue-${issueNum}.md`;
const filePath = path.join(postsDir, fileName);

const formattedTags = postTags.map((t) => `"${t.replace(/"/g, '\\"')}"`).join(', ');
const md = `---
title: "${String(issue.title).replace(/"/g, '\\"')}"
date: ${iso}
summary: ""
tags: [${formattedTags}]
source: "${isAiDraft ? 'ai' : 'manual'}"
draft: false
---

${rawBody}
`;

if (dryRun) {
  console.log(`[dry-run] 目标文件: ${filePath}`);
  console.log(md);
  process.exit(0);
}

fs.mkdirSync(postsDir, { recursive: true });
fs.writeFileSync(filePath, md, 'utf8');
console.log(`已由 Issue #${issueNum} 生成文章: ${path.relative(process.cwd(), filePath)}`);

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `post_path=${path.relative(process.cwd(), filePath)}\n`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `post_title=${String(issue.title).replace(/\r?\n/g, ' ')}\n`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `issue_number=${issueNum}\n`);
}
