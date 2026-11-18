---
title: "近期系统与数据面实验盘点：从 VPP 用户态 PPPoE 到驱动移植"
date: 2026-11-10T20:00:00+08:00
summary: "梳理近期几个主线仓库的真实推进状态与边界：vpp-pppoeclient、AirportMtk-macOS、ConnectX3-macOS、metal-api-emulator 与 tavily-router。"
tags: ["VPP", "macOS", "Vulkan", "系统"]
source: "ai"
draft: false
---

最近把几条一直并行推进的底层实验分别整理成了独立仓库，也顺便在这里立一份清晰的状态清单：**哪些在真机上测通了，哪些只验证到某一步，哪些代码写完了还没加载**——尽量不写含糊的"基本可用"。

> [!NOTE]
> 所有项目状态均对应公开仓库中的实测记录与已知限制，未在硬件上加载验收的模块都会明确标出。

## 1. 用户态网络数据面：`vpp-pppoeclient`

[`vpp-pppoeclient`](https://github.com/Hi-Jiajun/vpp-pppoeclient) 是为 FD.io VPP 编写的用户态 PPPoE 客户端插件，把 PPPoE 发现阶段、PPPoX 控制面、PAP / CHAP-MD5（最长支持 255 字节凭据）、IPCP / IPv6CP 协商、DHCPv6-PD、VLAN / QinQ 子接口以及 TCP MSS clamping 收拢进单个 `pppoeclient_plugin.so` 插件里，避免传统 `pppd` 加内核隧道的上下文切换开销。

仓库结构上，`main` 分支放打包脚本、CI 与说明文档，源码树位于 `master` 分支，并与向上游提交评审的 `feat/pr-pppoeclient` 分支保持同步。

## 2. macOS 原生驱动与硬件边界

这一组仓库围绕手头一台具体的机器（Ryzen 7 9700X + MAXSUN B850BKB + MediaTek MT7922 / ConnectX-3 Pro）展开，每一份都单独标出了实测边界：

- **[`AirportMtk-macOS`](https://github.com/Hi-Jiajun/AirportMtk-macOS)**：面向 MT7921/MT7922/RZ616 的 `IO80211Family` 原生 Wi-Fi 驱动。在 macOS 15.8.1 上已完成关联、WPA2 四次握手、DHCP 与 IPv4/IPv6/ICMP/TCP 通信并发布 AWDL；吞吐表现与"系统设置"里的扫描列表仍在后续工作清单中，macOS 26 的 Skywalk 前端尚未实际部署加载。
- **[`ConnectX3-macOS`](https://github.com/Hi-Jiajun/ConnectX3-macOS)**：将 FreeBSD `sys/dev/mlx4` 硬件层移植到 IOKit（`15b3:1007`）。10 Gb/s 链路协商、固件移交与 RX/TX 队列路径已在硬件上测通；M4 接口层已完成编写但尚未在真机加载验收。
- **[`MT7922-Bluetooth-macOS`](https://github.com/Hi-Jiajun/MT7922-Bluetooth-macOS)**：提供免 Xcode 的构建链、新版 `linux-firmware` 追踪与 NVRAM 干预逻辑，已与真实对端设备（AirPods Pro 3）完成配对验证。
- **[`AMD-Ryzen-9700X-macOS`](https://github.com/Hi-Jiajun/AMD-Ryzen-9700X-macOS)**：把 OpenCore 能修的（CPU timer、USB 端口限制、蓝牙唤醒风暴）、框架本身无 AMD 后端而修不了的（Apple Hypervisor 等）、以及必须重写驱动的部分分开记录。

## 3. GPU 计算与日常 AI 工具

- **[`metal-api-emulator`](https://github.com/Hi-Jiajun/metal-api-emulator)**：用 Rust 状态机（`metal-api-core`）实现宿主端 Metal 计算对象模型，再经 `metal2vulkan` 翻译 AIR 并由 `metal-api-vulkan` 执行 buffer compute 子集，方便不启动完整虚拟机的情况下做快速行为与精度对比（其中 Windows/WHPX 宿主移植已通过 `reims-vgpu` PR #57 合并到上游）。
- **[`tavily-router`](https://github.com/Hi-Jiajun/tavily-router)**：自用的一层薄网关，把多把 Tavily API Key 汇聚到单一入口，同时提供 Streamable HTTP MCP 和兼容 REST 接口，遇到 `401/429/432/433` 自动切换上游 Key，并通过 nginx 将 `/api/*` 管理面严格限制在 loopback，只输出部署配置和脚本，不带任何凭据。
