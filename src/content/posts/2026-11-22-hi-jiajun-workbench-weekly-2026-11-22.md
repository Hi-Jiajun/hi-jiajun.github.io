---
title: "工作台周报：MT6639 Wi-Fi 研究、规则编译器 v2.5 与 Antigravity 插件化"
date: 2026-11-22T23:58:44+00:00
summary: "汇总 Hi-Jiajun 近 7 天公开仓库提交：mt6639-wifi7-dijun 推进到 v0.3.0-pre，msrouter-rules 编译器升级 v2.5 并完善发布流程，agy-control-tower 与 agy-note-offload 完成 Antigravity 原生插件化改造，profile 仓库接入博客发布触发。"
tags: ["周报", "GitHub", "Antigravity", "网络规则", "MT6639"]
source: "ai"
aiModel: "deepseek-chat"
draft: false
---

> [!NOTE]
> 本文基于 2026-11-17 至 2026-11-22 期间 GitHub 账号 Hi-Jiajun 公开仓库的真实提交记录整理，只描述已提交的内容，不含未验证的基准数据。

## 本周概览

| 仓库 | 语言 | 本周重点 |
| --- | --- | --- |
| mt6639-wifi7-dijun | Python | v0.2.0-pre → v0.3.0-pre，多设备平板适配与 6G 国家码可配置 |
| msrouter-rules | JavaScript | 规则编译器升级 v2.5，双区域 Apple 分流与原子化发布 |
| agy-control-tower | JavaScript | 从独立 skill 工作区改造为 Antigravity 原生插件，迭代至 v1.2.1 |
| agy-note-offload | JavaScript | v2.0.0 原生 ESM 架构，新增 Sidecar Web UI |
| Hi-Jiajun | Python | profile README 刷新，接入 blog-published 触发与来源徽章 |

## mt6639-wifi7-dijun：6G 与热点工作目录加固

MT6639 / Xiaomi 15S Pro（Dijun）的 Wi-Fi 与蓝牙能力研究本周推进了两个 pre 版本：

- **v0.2.0-pre**（11-17）：加固 `6g` / `hotspot` / `bt` 工作目录，对齐 OS4 staging，并同步 v0.3.0 文档；同日合入 PR #1（`fix/os4-compat-status-private-workdir`）。
- **v0.3.0-pre**（11-22）：多设备平板适配、6G 国家码可配置、hotspot v0.3.1、debug collector v0.1.1。
- 同日还有一条 CI 相关提交：在 legacy-66 国家选项握手的 sleep stub 中加入 yield，用于 CI 环境。

> [!TIP]
> 6G 国家码从硬编码改为可配置，是多设备适配的前提；热点与调试采集器拆成独立版本号，便于单独回滚。

## msrouter-rules：编译器 v2.5 与发布流程

本周规则侧改动集中在编译器能力与发布工程：

- **编译器 v2.5**（11-17）：新增 exclude 减法、trie 剪枝、CIDR 聚合与 fakeip-filter。
- **本地回流的 OxiDNS**（11-17）：接入 `local:force-proxy`。
- **声明式 deny 清理**（11-18）：19 组 cn 规则正交化，公开仓库做脱敏处理。
- **双区域 Apple 分流**（11-20）：补充 APNs / NTP 的 fakeip-filter、加密 DNS 精度与原子化发布。
- **CI**（11-17）：push 到 main 时自动发布并清理旧 release。

```text
编译器 v2.5 新增能力：
  exclude subtraction
  trie pruning
  CIDR aggregation
  fakeip-filter
```

## agy-control-tower：Antigravity 原生插件化

11-21 一天内完成了从独立 skill 工作区到原生插件的完整改造：

1. 初始化独立 control-tower skill 工作区与 sandbox selftest；
2. 转为 Antigravity 原生插件，带 sidecar 与 hooks；
3. v1.1.0 标准化为 `./plugin` 布局、统一 ESM core 并补全测试；
4. v1.2.0 引入三层设置、自适应调度、4 事件 hooks 与 live board；
5. v1.2.1 修复 `PLUGIN_DATA` 归属校验，补充标准 registry schema 提示，并在 `plugin.json` 中加入作者与仓库元数据。

## agy-note-offload：v2.0.0 与 Sidecar Web UI

同一日，note-offload 套件也完成了较大跨度迭代：

- 初始发布 hooks 与 note-offload skill；
- 转为原生 Antigravity 插件，加入 Plan Mode 感知、工作区绑定与防重复保护；
- 新增双向 agynote 工作区、rewind 状态重置与错峰 offload 规则；
- 新增辅助面板 Sidecar Web UI；
- 补充 workspace `AGENTS.md`，忽略本地 `.agents` 状态；
- 加固 offload 触发精度、`AGY_NOTE_ROOT` 隔离、状态锁与 sidecar API 鉴权；
- **v2.0.0**：原生 ESM 架构，细化 offload / Orchestrator / Sidecar 规则；
- 修复 control-tower 控制器的静默绑定问题，并加入 `rule_rev` 自动刷新。

> [!IMPORTANT]
> 两个插件仓库本周都围绕「原生插件 + sidecar + hooks」这一结构收敛，说明 Antigravity 侧的插件形态已经基本定型。

## Hi-Jiajun profile 仓库

- 11-17 至 11-22 多次 `chore: refresh profile README`；
- 11-18 新增 `blog-published` 的 `repository_dispatch` 触发，以及 AI / 人工来源徽章。

## 下周待办（基于当前未完成项）

- mt6639-wifi7-dijun 仍处于 v0.3.0-pre，需验证多设备平板适配与 6G 国家码配置的实际表现；
- msrouter-rules 的 v2.5 编译器新增能力需要更多规则集回归；
- 两个 Antigravity 插件在 v2.0.0 / v1.2.1 之后需观察 sidecar 鉴权与状态锁的稳定性。
