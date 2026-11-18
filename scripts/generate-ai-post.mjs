#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const postsDir = path.join(rootDir, 'src/content/posts');
const usagePath = path.join(rootDir, '.github/ai-usage.json');

const OWNER = process.env.GITHUB_OWNER || 'Hi-Jiajun';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const LLM_API_KEY = process.env.LLM_API_KEY || '';
const LLM_BASE_URL = (process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-4o-mini';
const MONTHLY_CAP_RMB = Number(process.env.LLM_MONTHLY_CAP_RMB || 10);
const OFFPEAK_ONLY = String(process.env.LLM_OFFPEAK_ONLY || 'true').toLowerCase() !== 'false';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const skipIfNoKey = args.includes('--skip-if-no-key');
const allowPeak = args.includes('--allow-peak') || String(process.env.AI_ALLOW_PEAK || 'false').toLowerCase() === 'true';

function getArg(flag) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  const eq = args.find((a) => a.startsWith(`${flag}=`));
  return eq ? eq.slice(flag.length + 1) : '';
}

const mode = getArg('--mode') || process.env.AI_MODE || 'weekly-digest';
const targetRepo = (getArg('--repo') || process.env.AI_TARGET_REPO || '').trim();
const topic = (getArg('--topic') || process.env.AI_TOPIC || '').trim();
const notes = (getArg('--notes') || process.env.AI_NOTES || '').trim();
const days = Number(getArg('--days') || process.env.AI_DAYS || 7);

if (args.includes('-h') || args.includes('--help')) {
  console.log('用法:');
  console.log('  pnpm ai-post --mode weekly-digest [--days 7]');
  console.log('  pnpm ai-post --mode repo-deep-dive --repo vpp-pppoeclient');
  console.log('  pnpm ai-post --mode topic-note --topic "VPP 节点调度" [--notes "..."]');
  console.log('可选参数:');
  console.log('  --allow-peak    允许在高峰时段运行（默认仅在 DeepSeek 谷价时段执行）');
  console.log('  --dry-run       仅预览，不写入文件');
  process.exit(0);
}

/**
 * DeepSeek 官方错峰优惠（谷价）时段（北京时间 Asia/Shanghai）：
 * - 周六、周日全天
 * - 工作日 18:00–次日 09:00 以及 12:00–14:00
 * 高峰时段：工作日 09:00–12:00 与 14:00–18:00
 */
export function isDeepSeekOffPeak(date = new Date()) {
  const cst = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
  const day = cst.getDay(); // 0=Sun, 6=Sat
  const hour = cst.getHours();
  if (day === 0 || day === 6) return true;
  if (hour < 9 || (hour >= 12 && hour < 14) || hour >= 18) return true;
  return false;
}

function getCurrentCstMonth(date = new Date()) {
  const cst = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
  const y = cst.getFullYear();
  const m = String(cst.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function loadMonthlyUsage() {
  const currentMonth = getCurrentCstMonth();
  if (!fs.existsSync(usagePath)) {
    return { month: currentMonth, spentRmb: 0, calls: 0, lastUpdated: null };
  }
  const data = JSON.parse(fs.readFileSync(usagePath, 'utf8'));
  if (data.month !== currentMonth) {
    return { month: currentMonth, spentRmb: 0, calls: 0, lastUpdated: null };
  }
  return {
    month: currentMonth,
    spentRmb: Number(data.spentRmb || 0),
    calls: Number(data.calls || 0),
    lastUpdated: data.lastUpdated || null,
  };
}

function estimateCostRmb(usage, offPeak) {
  if (!usage) return 0.01;
  const cachedIn = Number(usage.prompt_cache_hit_tokens || 0);
  const totalIn = Number(usage.prompt_tokens || 0);
  const missIn = Math.max(0, totalIn - cachedIn);
  const out = Number(usage.completion_tokens || 0);
  // Conservative upper-bound estimate based on DeepSeek Flash/Chat off-peak vs peak rates (RMB per 1M tokens)
  const mult = offPeak ? 1 : 2;
  const cost = (cachedIn * 0.02 * mult + missIn * 1.0 * mult + out * 4.0 * mult) / 1_000_000;
  return Number(Math.max(cost, 0.0001).toFixed(6));
}

async function checkDeepSeekBalance() {
  if (!LLM_BASE_URL.includes('deepseek.com')) return;
  const rootApi = LLM_BASE_URL.replace(/\/v1$/, '');
  try {
    const res = await fetch(`${rootApi}/user/balance`, {
      headers: { Authorization: `Bearer ${LLM_API_KEY}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.is_available === false) {
      throw new Error('DeepSeek 账户当前不可用或余额不足');
    }
  } catch (err) {
    console.warn(`[warn] 余额预检跳过: ${err.message}`);
  }
}

async function ghFetch(endpoint) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Hi-Jiajun-blog-ai-writer',
  };
  if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${endpoint}`, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} on ${endpoint}`);
  }
  return res.json();
}

async function gatherWeeklyContext() {
  const since = new Date(Date.now() - days * 86400 * 1000);
  const repos = await ghFetch(`/users/${OWNER}/repos?per_page=30&sort=pushed&type=owner`);
  const active = repos
    .filter((r) => !r.fork && !r.private && r.name !== 'hi-jiajun.github.io' && new Date(r.pushed_at) >= since)
    .slice(0, 5);

  if (active.length === 0) return null;

  const summaries = [];
  for (const repo of active) {
    const commits = await ghFetch(`/repos/${OWNER}/${repo.name}/commits?since=${since.toISOString()}&per_page=8`).catch(() => []);
    const commitLines = Array.isArray(commits)
      ? commits.map((c) => `- ${c.commit.author?.date?.slice(0, 10) || ''}: ${c.commit.message.split('\n')[0]}`)
      : [];
    summaries.push(
      `### ${repo.name} (${repo.language || 'Mixed'}, stars=${repo.stargazers_count})\n` +
        `简介: ${repo.description || '无'}\n` +
        `近期提交:\n${commitLines.join('\n') || '- 无公开提交详情'}`
    );
  }

  return {
    aiRepo: '',
    promptContext: `请根据以下最近 ${days} 天 GitHub 账号 ${OWNER} 公开仓库的真实提交记录，撰写一篇中文「工作台周报 / 近期进展汇总」博客文章：\n\n${summaries.join('\n\n')}`,
  };
}

async function gatherRepoContext(repoName) {
  if (!repoName) throw new Error('repo-deep-dive 模式必须提供 --repo <仓库名>');
  const repo = await ghFetch(`/repos/${OWNER}/${repoName}`);
  const readmeObj = await ghFetch(`/repos/${OWNER}/${repoName}/readme`).catch(() => null);
  const readmeText = readmeObj?.content
    ? Buffer.from(readmeObj.content, 'base64').toString('utf8').slice(0, 6000)
    : '';
  const commits = await ghFetch(`/repos/${OWNER}/${repoName}/commits?per_page=15`).catch(() => []);
  const commitLines = Array.isArray(commits)
    ? commits.map((c) => `- ${c.commit.author?.date?.slice(0, 10) || ''}: ${c.commit.message.split('\n')[0]}`)
    : [];

  return {
    aiRepo: `${OWNER}/${repoName}`,
    promptContext:
      `请围绕仓库 ${OWNER}/${repoName} 撰写一篇结构清晰的技术解析博客。\n` +
      `仓库简介: ${repo.description || '无'}\n` +
      `主语言: ${repo.language || '未知'} | Stars: ${repo.stargazers_count}\n\n` +
      `近期提交:\n${commitLines.join('\n')}\n\n` +
      `README 节选:\n${readmeText}`,
  };
}

function gatherTopicContext() {
  if (!topic) throw new Error('topic-note 模式必须提供 --topic "<主题>"');
  return {
    aiRepo: targetRepo ? `${OWNER}/${targetRepo}` : '',
    promptContext:
      `请围绕技术主题「${topic}」撰写一篇中文工程技术笔记。\n` +
      (notes ? `补充提纲与要点:\n${notes}\n` : ''),
  };
}

async function callLlm(userPrompt) {
  const systemPrompt = `你是技术作者 Hi-Jiajun 的博客写作助手。请严格遵循以下规则：
1. 只陈述输入资料中明确出现的事实、版本号、工具名和边界，严禁编造基准测试数字或未测通的结论。
2. 风格简洁务实、偏向工程一线笔记，适当使用 Markdown 标题、表格、代码块和 GitHub Callout（如 > [!NOTE]）。
3. 必须严格输出合法 JSON 对象，不要包含额外解释，字段如下：
{
  "slug": "kebab-case-english-slug",
  "title": "中文文章标题",
  "summary": "60~110字的中文摘要",
  "tags": ["标签1", "标签2", "标签3"],
  "body": "Markdown 正文（不要包含 YAML frontmatter 和一级标题 #）"
}`;

  const res = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      temperature: 0.4,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LLM API ${res.status}: ${errText.slice(0, 400)}`);
  }
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  return {
    parsed: JSON.parse(cleaned),
    usage: data.usage || null,
  };
}

function formatLocalIso(d) {
  const pad = (n) => String(n).padStart(2, '0');
  const datePart = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const tzMin = -d.getTimezoneOffset();
  const sign = tzMin >= 0 ? '+' : '-';
  const abs = Math.abs(tzMin);
  return {
    datePart,
    iso: `${datePart}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`,
  };
}

async function main() {
  if (!LLM_API_KEY) {
    const msg = '未检测到 LLM_API_KEY 环境变量（可在仓库 Settings -> Secrets -> Actions 配置）。';
    if (skipIfNoKey) {
      console.log(`[skip] ${msg} 本次跳过 AI 生成。`);
      return;
    }
    throw new Error(msg);
  }

  const now = new Date();
  const offPeak = isDeepSeekOffPeak(now);
  if (OFFPEAK_ONLY && !allowPeak && !offPeak) {
    console.log('[skip] 当前处于 DeepSeek 高峰时段（工作日 09:00-12:00 / 14:00-18:00），已按配置跳过调用以保证谷价执行。');
    return;
  }

  const usageState = loadMonthlyUsage();
  if (usageState.spentRmb >= MONTHLY_CAP_RMB) {
    console.log(`[skip] 本月 (${usageState.month}) 累计用量 ¥${usageState.spentRmb.toFixed(4)} 已达到上限 ¥${MONTHLY_CAP_RMB}，停止调用。`);
    return;
  }

  await checkDeepSeekBalance();

  let ctx = null;
  if (mode === 'weekly-digest') ctx = await gatherWeeklyContext();
  else if (mode === 'repo-deep-dive') ctx = await gatherRepoContext(targetRepo);
  else if (mode === 'topic-note') ctx = gatherTopicContext();
  else throw new Error(`未知模式: ${mode}`);

  if (!ctx) {
    console.log(`[skip] 最近 ${days} 天没有新的公开仓库推送，跳过生成。`);
    return;
  }

  const { parsed: generated, usage } = await callLlm(ctx.promptContext);
  const callCost = estimateCostRmb(usage, offPeak);
  usageState.spentRmb = Number((usageState.spentRmb + callCost).toFixed(6));
  usageState.calls += 1;
  usageState.lastUpdated = now.toISOString();

  const { datePart, iso } = formatLocalIso(now);
  const safeSlug = String(generated.slug || `ai-${mode}`)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `ai-post-${Date.now()}`;

  let filePath = path.join(postsDir, `${datePart}-${safeSlug}.md`);
  if (fs.existsSync(filePath)) {
    filePath = path.join(postsDir, `${datePart}-${safeSlug}-${Date.now().toString().slice(-4)}.md`);
  }

  const tags = Array.isArray(generated.tags) && generated.tags.length > 0 ? generated.tags.slice(0, 5) : ['工作台'];
  const formattedTags = tags.map((t) => `"${String(t).replace(/"/g, '\\"')}"`).join(', ');
  const aiRepoLine = ctx.aiRepo ? `aiRepo: "${ctx.aiRepo}"\n` : '';

  const md = `---
title: "${String(generated.title).replace(/"/g, '\\"')}"
date: ${iso}
summary: "${String(generated.summary || '').replace(/"/g, '\\"')}"
tags: [${formattedTags}]
source: "ai"
aiModel: "${LLM_MODEL.replace(/"/g, '\\"')}"
${aiRepoLine}draft: false
---

${String(generated.body || '').trim()}
`;

  if (dryRun) {
    console.log(`[dry-run] 目标文件: ${filePath}`);
    console.log(`[dry-run] 本次估算费用: ¥${callCost} | 月累计: ¥${usageState.spentRmb}/${MONTHLY_CAP_RMB}`);
    console.log(md);
    return;
  }

  fs.mkdirSync(postsDir, { recursive: true });
  fs.writeFileSync(filePath, md, 'utf8');
  fs.writeFileSync(usagePath, JSON.stringify(usageState, null, 2) + '\n', 'utf8');
  console.log(`已生成 AI 文章: ${path.relative(process.cwd(), filePath)} (本次约 ¥${callCost}, 本月累计 ¥${usageState.spentRmb}/${MONTHLY_CAP_RMB})`);

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `post_path=${path.relative(process.cwd(), filePath)}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `post_title=${String(generated.title).replace(/\r?\n/g, ' ')}\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
