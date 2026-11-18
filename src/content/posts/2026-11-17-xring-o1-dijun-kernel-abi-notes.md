---
title: "小米 15S Pro (XRING O1) 内核设备树与外部模块 KMI/CRC 契约梳理"
date: 2026-11-17T22:00:00+08:00
summary: "记录 dijun-kernel-devicetree 仓库的设计脉络：四套严格分层的 DTS 基线、增量 .dtso 补丁，以及锁定 6.18.32-4k VERMAGIC 与 module_layout CRC 0x60801db3 的外部模块 SDK。"
tags: ["XRING-O1", "Android-Kernel", "DeviceTree"]
source: "ai"
draft: false
---

在手机内核和外部内核模块（`.ko`）的日常折腾里，最容易踩的坑往往不是代码逻辑本身，而是**基线混用**和**符号 ABI 漂移**——拿着开源旧版设备树改完刷机失联，或者内核小版本多了一个 `+` / `-dirty` 后缀导致整批外部模块全部 `ENOEXEC`。

> [!IMPORTANT]
> 开源参考设备树（`dts-oss/6.6.30-android15-v/`）仅用于查阅宏定义与节点语义，**严禁直接当作现行真机设备树编译刷入**。

[`Hi-Jiajun/dijun-kernel-devicetree`](https://github.com/Hi-Jiajun/dijun-kernel-devicetree) 就是为了把小米 15S Pro（代号 `dijun`，XRING O1，`25042PN24C`）的设备树基线和 AOSP `android17-6.18-2026-09`（`6.18.32-4k`）内核模块构建契约固化下来。

## 四套 DTS 基线严格分层

反编译真机 `dtb` 与厂商开源代码之间往往存在节点增删、phandle 偏移和固件版本差异。仓库把四套 DTS 物理隔离：

| 目录 | 来源 / 版本 | 用途与边界 |
| --- | --- | --- |
| `dts-oss/6.6.30-android15-v/` | 官方开源 DTS (6.6.30) | 仅作宏定义与节点语义参考，严禁当作现行真机设备树 |
| `dts-reconstructed/6.6.118-os3/` | OS3 (`6.6.118`) | `base.dtb` + 全部 8 个 `dtbo` 无损还原归档 |
| `dts-reconstructed/6.18.21-os4.0.0.19/` | OS4.0.0.19 (`6.18.21`) | `base.dtb` + 全部 8 个 `dtbo` 无损还原归档 |
| `dts-reconstructed/6.18.21-os4.0.4.0/` | OS4.0.4.0 现行底包（软链 `dts-current`） | `base.dtb`（221,460 B）+ 8 个 `dtbo` 无损还原，宿主 `dtc 1.8.1` 回编逐字节一致 |

日常实验不直接修改上万行的反编译 DTS，而是在 `overlays/custom/` 中以最小 `.dtso` 叠加到现行基线上，再用增强后的 `tools/fdtdiff.py`（支持 `#*-cells` 规格化与 `/__fixups__` 对齐）做结构化对比。

## 锁定双契约：VERMAGIC 与 module_layout CRC

针对真机 `boot_b` 已验证通过的 `6.18.32-4k` 内核，仓库明确锁定两项硬契约：

- **`VERMAGIC`**：必须逐字等于 `"6.18.32-4k SMP preempt mod_unload modversions aarch64"`（绝不能带 `+` 或 `-dirty`）。
- **`module_layout` CRC**：必须严格等于 `0x60801db3`。

围绕这两条约束，仓库内置了只读符号 SDK `symvers/6.18.32-os4.0.4.0/` 和 `scripts/build-extmod.sh` 来统一外部 `.ko` 的构建，避免每次换工作目录或拉起新分支就出现 CRC 漂移；镜像打包和刷前校验则交给 `scripts/pack-vendor_boot.sh`（动态继承原镜像参数，避免跨代 `cmdline` 污染）和 `tools/abi-gate.py`（支持多分区同名消歧、模块间 CRC 校验与 `--expect-vermagic` 检查）。

## 多线 Profile 与下一步

构建脚本 `scripts/build-kernel.sh` 当前维护 `stock-abi`、`pidns`、`hmos`（导出 `dijun_hmos_ipc_api_v2` CRC `0xcf4c0200`）以及实验性 `panthor` 内建规划。把这层工程底座先钉稳，后面无论是无线能力排查还是新驱动验证，都不必反复怀疑是不是底包和符号表出了岔子。
