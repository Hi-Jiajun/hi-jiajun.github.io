export interface ProjectItem {
  name: string;
  repo: string;
  category: 'dataplane' | 'drivers' | 'mobile' | 'gpu-ai';
  language: string;
  status: string;
  summary: string;
  highlights: string[];
  featured?: boolean;
}

export const SITE = {
  title: "Hi-Jiajun's Workbench",
  titleShort: 'Hi-Jiajun',
  titleZh: 'Hi-Jiajun 的公开工作台',
  author: 'Hi-Jiajun (KiLiminal)',
  handle: 'KiLiminal',
  location: '中国四川省眉山市',
  description: '记录用户态网络数据面、内核与驱动移植、GPU/SoC 硬件实验与 AI 自动化工作流。',
  url: 'https://hi-jiajun.github.io',
  avatar: 'https://avatars.githubusercontent.com/u/107156889?v=4',
  github: 'https://github.com/Hi-Jiajun',
  bilibili: 'https://space.bilibili.com/474179427',
  repo: 'https://github.com/Hi-Jiajun/hi-jiajun.github.io',
  email: '3138947285@qq.com',
  sponsor: {
    wechatQr: 'https://Hi-Jiajun.github.io/picx-images-hosting/wechat_qrcode.icohq9bcf.webp',
    alipayQr: 'https://Hi-Jiajun.github.io/picx-images-hosting/alipay_qrcode.7p45v27tjq.webp',
  },
} as const;

export const PROJECT_CATEGORIES: Record<
  ProjectItem['category'],
  { title: string; subtitle: string; domainLabel: string; domainColor: string; domainColorLight: string }
> = {
  dataplane: {
    title: '网络数据面与路由',
    subtitle: 'User-space dataplane & routing systems',
    domainLabel: 'DATAPLANE',
    domainColor: '#38bdf8',
    domainColorLight: '#0284c7',
  },
  drivers: {
    title: '内核驱动与硬件适配',
    subtitle: 'macOS kexts, bring-up & hardware notes',
    domainLabel: 'KERNEL & IOKIT',
    domainColor: '#818cf8',
    domainColorLight: '#4f46e5',
  },
  mobile: {
    title: '移动 SoC 与无线边界',
    subtitle: 'Device trees, KMI/ABI gates & Wi-Fi 7 research',
    domainLabel: 'MOBILE SOC',
    domainColor: '#2dd4bf',
    domainColorLight: '#0d9488',
  },
  'gpu-ai': {
    title: 'GPU 计算与 AI 工作流',
    subtitle: 'Metal-on-Vulkan, gateways & creative tooling',
    domainLabel: 'GPU & AGENT',
    domainColor: '#f59e0b',
    domainColorLight: '#d97706',
  },
};

export const PROJECTS: ProjectItem[] = [
  {
    name: 'vpp-pppoeclient',
    repo: 'https://github.com/Hi-Jiajun/vpp-pppoeclient',
    category: 'dataplane',
    language: 'C',
    status: 'Active',
    featured: true,
    summary: 'FD.io VPP 用户态 PPPoE Client 插件（整合 pppoeclient 与 pppox），完整实现 RFC 2516 发现/会话、PAP/CHAP-MD5、IPCP/IPv6CP、DHCPv6-PD 与 VLAN/QinQ 支持。',
    highlights: ['源码位于 master 分支与上游 feat/pr-pppoeclient 分支', '单进程驱动并发 PPPoE 会话并支持 TCP MSS clamping', '包含完整打包脚本与 CI 验证流程'],
  },
  {
    name: 'VectorOS',
    repo: 'https://github.com/Hi-Jiajun/VectorOS',
    category: 'dataplane',
    language: 'Rust / Svelte',
    status: 'Experimental',
    summary: '基于 FD.io VPP 的高性能开源路由器系统原型，结合 Rust 控制面服务与 Svelte Web 控制面板。',
    highlights: ['面向现代高性能软路由场景', '探索 Rust 控制面与 VPP 数据面协同'],
  },
  {
    name: 'AirportMtk-macOS',
    repo: 'https://github.com/Hi-Jiajun/AirportMtk-macOS',
    category: 'drivers',
    language: 'C++',
    status: 'macOS 15.x PoC',
    featured: true,
    summary: '面向 MediaTek MT7921/MT7922/RZ616 的 IO80211Family 原生 macOS Wi-Fi 驱动（对应 Intel 的 AirportItlwm 思路）。',
    highlights: ['macOS 15.8.1 实机完成关联、WPA2 四次握手、DHCP 与 IPv4/IPv6 通流并发布 AWDL', '吞吐优化与系统设置扫描列表待补齐', 'macOS 26 Skywalk 前端尚未实机部署加载'],
  },
  {
    name: 'ConnectX3-macOS',
    repo: 'https://github.com/Hi-Jiajun/ConnectX3-macOS',
    category: 'drivers',
    language: 'C++',
    status: 'HW Queue Verified',
    summary: '将 FreeBSD sys/dev/mlx4 硬件层移植到 IOKit 的 Mellanox ConnectX-3 Pro (15b3:1007) 原生 macOS 驱动。',
    highlights: ['实机完成 10 Gb/s 链路协商、固件移交与 RX/TX 队列路径验证', 'M4 接口层已编写并构建，尚未在真机加载验收'],
  },
  {
    name: 'MT7922-Bluetooth-macOS',
    repo: 'https://github.com/Hi-Jiajun/MT7922-Bluetooth-macOS',
    category: 'drivers',
    language: 'C++',
    status: 'Verified',
    summary: 'MediaTek MT7922 / RZ616 (0e8d:0616) macOS 蓝牙固件注入驱动，提供免 Xcode 构建链与 NVRAM 干预方案。',
    highlights: ['基于 linux-firmware 追踪最新固件', '已使用 AirPods Pro 3 完成真实设备连接验证'],
  },
  {
    name: 'AMD-Ryzen-9700X-macOS',
    repo: 'https://github.com/Hi-Jiajun/AMD-Ryzen-9700X-macOS',
    category: 'drivers',
    language: 'C / Python',
    status: 'Measured Notes',
    summary: 'AMD Ryzen 7 9700X (Zen 5) + MAXSUN B850BKB 运行 macOS 15.8.1 / 26.7.1 的单机实测适配档案与取证脚本。',
    highlights: ['明确区分 OpenCore 可修项、框架无 AMD 后端的硬边界及需自写驱动项', '配套 9700x-b850bkb-opencore-efi 脱敏配置矩阵'],
  },
  {
    name: 'dijun-kernel-devicetree',
    repo: 'https://github.com/Hi-Jiajun/dijun-kernel-devicetree',
    category: 'mobile',
    language: 'C / DTS',
    status: 'Verified (6.18.32-4k)',
    featured: true,
    summary: '小米 15S Pro（dijun / XRING O1）内核设备树与 GKI/KMI 构建底座，覆盖 4 套严格分层的 DTS 基线与外部模块 SDK。',
    highlights: ['OS4.0.4.0 DTB + 8 个 DTBO 无损还原，dtc 1.8.1 回编逐字节一致', '锁定 VERMAGIC 与 module_layout CRC 0x60801db3 门禁工具链', '提供 .dtso 增量叠加与多线内核 Profile'],
  },
  {
    name: 'mt6639-wifi7-dijun',
    repo: 'https://github.com/Hi-Jiajun/mt6639-wifi7-dijun',
    category: 'mobile',
    language: 'Python / C',
    status: 'Research Archive',
    summary: 'MediaTek MT6639 / 小米 15S Pro Wi-Fi 7 与蓝牙能力研究档案，提供只读巡检、取证矩阵与源码级辅助模块。',
    highlights: ['曾在特定版本与独立 6GHz 网络取得 6GHz / 320MHz EHT 双端关联证据', '严格边界声明：不打包提权链、原厂闭源固件或校准数据'],
  },
  {
    name: 'metal-api-emulator',
    repo: 'https://github.com/Hi-Jiajun/metal-api-emulator',
    category: 'gpu-ai',
    language: 'Rust',
    status: 'Prototype',
    featured: true,
    summary: '实验性宿主端 Metal 计算 API 原型（Rust 状态机 + Vulkan 执行器），用于快速对比 Metal 与 Vulkan 行为及精度差异。',
    highlights: ['覆盖 Device → Library → ComputePipeline → CommandBuffer → readback 链路', '集成 metal2vulkan 翻译 AIR 并支持 reims-vgpu 协同实验'],
  },
  {
    name: 'tavily-router',
    repo: 'https://github.com/Hi-Jiajun/tavily-router',
    category: 'gpu-ai',
    language: 'Python',
    status: 'In Use',
    summary: '把多把 Tavily API Key 汇成单一网关入口：同时暴露 MCP (Streamable HTTP) 与 REST 接口，支持按剩余额度选路和自动故障切换。',
    highlights: ['401/429/432/433 自动切换上游 Key 与响应缓存', '管理面仅限 loopback 访问，局域网内安全共享'],
  },
  {
    name: 'magpie-agent-varin',
    repo: 'https://github.com/Hi-Jiajun/magpie-agent-varin',
    category: 'gpu-ai',
    language: 'JavaScript',
    status: 'Tooling',
    summary: '面向 Magpie Agents 页面的扩展配置工具，支持选择对话模型并从 Library 注入指令、MCP 服务器与 Skills。',
    highlights: ['轻量级扩展工作流集成', '减少重复切换模型与工具集的手动操作'],
  },
  {
    name: 'nbmachina',
    repo: 'https://github.com/Hi-Jiajun/nbmachina',
    category: 'gpu-ai',
    language: 'JavaScript / Java',
    status: 'Published',
    summary: '将一首歌曲自动编译为可演奏的 Minecraft 音符盒机器：包含谱面/红石布局/数据包编译器与 Fabric 无损音频 mod。',
    highlights: ['自动化音符盒布局与数据包生成', '配套 Fabric 无损音频客户端辅助模组'],
  },
];
