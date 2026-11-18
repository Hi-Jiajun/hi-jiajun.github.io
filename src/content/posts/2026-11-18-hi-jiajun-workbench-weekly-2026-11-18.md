---
title: "Hi-Jiajun 工作台周报：Profile V2、设备树 SDK 与 PPPoE 插件整理"
date: 2026-11-18T05:00:27+00:00
summary: "汇总 Hi-Jiajun 近三天公开仓库提交：Profile 升级 V2 Bento 双主题 SVG 并接入博客 RSS 同步；dijun-kernel-devicetree 同步 OS4.0.5.0 设备树基线与 6.18.32-hmos-opt2 符号 SDK；msrouter-rules 编译器升至 v2.5；vpp-pppoeclient 对齐打包与文档；mt6639-wifi7-dijun 推进 6G 兼容性修复。"
tags: ["工作台周报", "GitHub", "设备树", "VPP", "Wi-Fi"]
source: "ai"
aiModel: "deepseek-chat"
draft: false
---

## 概览

近三天（2026-11-15 ~ 2026-11-18）的公开提交集中在五个仓库：个人 Profile、小米 15S Pro 设备树、msrouter 规则编译器、VPP PPPoE 插件以及 MT6639 Wi-Fi/蓝牙能力研究。下面按仓库记录实际变更。

| 仓库 | 语言 | 主要动作 |
| --- | --- | --- |
| Hi-Jiajun | Python | Profile V2 Bento 双主题 SVG、博客 RSS 同步、repository_dispatch 触发 |
| dijun-kernel-devicetree | Python | OS4.0.5.0 设备树基线、6.18.32-hmos-opt2 符号 SDK、审计门禁 |
| msrouter-rules | JavaScript | 编译器 v2.5、force-proxy/force-direct 规则、发布流程 |
| vpp-pppoeclient | Shell | 打包、许可证、工作流与文档对齐 |
| mt6639-wifi7-dijun | Python | 6G/热点/蓝牙工作目录加固、OS4 兼容性记录 |

## Profile：V2 Bento 与博客同步

- 2026-11-17 将 Profile 升级为 V2 Bento 双主题 SVG 布局，并加入架构横幅。
- 同日重构项目分类，接入博客 RSS 同步与原生 SVG 统计。
- 2026-11-18 新增 `blog-published` 的 `repository_dispatch` 触发，以及 AI/手动来源徽章。
- 期间多次执行 `chore: refresh profile README`。

> [!NOTE]
> 提交记录未包含具体渲染效果或性能数据，本文不展开未验证的结论。

## dijun-kernel-devicetree：OS4.0.5.0 与符号 SDK

设备树仓库在 11-17 至 11-18 完成多线推进：

- **DTS**：同步 OS4.0.5.0 设备树基线与 8 个 DTBO 源码，切换 `dts-current`；此前已重构 `dts-oss` 目录防误判，补齐 OS4.0.4.0 与三代全部 8 个 DTBO 源码基线及增量 `.dtso` 层。
- **SDK**：新增 `6.18.32-hmos-opt2` 符号 SDK、Profile 与 OS4.0.5.0 模块闭包契约；同步 OS4.0.4.0/6.18.32-4k 基线、只读 `symvers` SDK、`build-extmod.sh` 与多线构建/打包/CI 门禁。
- **工具**：修复 `fdtdiff.py` 规格化与 overlay 对齐，合并 `modabi` 能力至 `abi-gate.py`，新增 `export-mod-symvers.py`。
- **公开审计**：补齐板级与模块闭包契约、完整 GPL-2.0 许可证及公开审计门禁。

```text
仓库定位：Xiaomi 15S Pro (dijun / XRING O1) kernel device trees,
GKI/KMI ABI gates, and 6.18.32-4k external module SDK
```

## msrouter-rules：编译器 v2.5

- 编译器升级至 v2.5，包含 exclude 减法、trie 剪枝、CIDR 聚合与 `fakeip-filter`。
- 为精选 OxiDNS 回流接入 `local:force-proxy`。
- 新增 `v.qwerw.cc.cd` 主机名直连与 `xingchiapi.com` 整域直连。
- CI 在 push 到 main 时发布并清理 release。

## vpp-pppoeclient：插件整理

该仓库为 FD.io VPP 的 PPPoE Client 插件独立仓库，包含 `pppoeclient` 与 `pppox`，代码同步自 `feat/pr-pppoeclient`。11-17 的提交将打包、许可证、工作流与文档对齐简化后的插件结构。

## mt6639-wifi7-dijun：6G 兼容性推进

- 发布 `v0.2.0-pre`，加固 6G/热点/蓝牙工作目录，对齐 OS4 暂存区，并同步 v0.3.0 文档。
- 合并 PR #1（`fix/os4-compat-status-private-workdir`）。
- 6G 相关修复包括：在原生事务设置前准备私有工作目录、接受经评审的稳定驱动变体、支持 `g284297` 内核与匹配的 stock WLAN 组件。
- 新增观测到的模块状态卡片，并记录 OS4 兼容性缺口；同时准备上游贡献并记录已报告的激活情况。

## 小结

三天内的提交以设备树/SDK 基线同步和 Profile 展示层升级为主，辅以规则编译器版本迭代与 Wi-Fi 研究仓库的兼容性修复。所有变更均来自公开提交记录，未包含基准测试或未测通的结论。
