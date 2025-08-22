---
layout: post_notitle
title: JarkViwer看图
header-style: text
comments: false
excerpt: JarkViwer看图软件介绍
---

<div align="center">
<img src = "/images/jarkviewer/ico.png" style="height:80px"/>
<br>
<font size="6"><strong>{{ page.title }}</strong></font>
<br>
</div>

[Github](https://github.com/jark006/jarkViewer) |
[夸克网盘](https://pan.quark.cn/s/074579d89b47)|
[百度云盘 提取码：6666](https://pan.baidu.com/s/1ka7p__WVw2du3mnOfqWceQ?pwd=6666)

![预览](/images/jarkviewer/preview.png)

## ✨ 操作方式

1. **⏭ 切换图片**：窗口左右边缘 `单击/滚轮` / `左/右` 方向键
1. **🔍 放大缩小**：窗口中间滚轮 / `上/下`方向键
1. **🔄 旋转图片**：窗口左上角或右上角 `单击/滚轮` / `Q/E` 键
1. **🖱️ 平移图片**：鼠标拖动 / `W/A/S/D` 键
1. **ℹ️ 图像信息**：点击滚轮 / `I` 键
1. **🖥️ 切换全屏**：双击窗口 / `F11` 键
1. **📋 复制图像**：`Ctrl + C`
1. **🖨 打印图像**：窗口左下角 `单击` / `Ctrl + P`
1. **🎞️ 逐帧浏览**：窗口顶部控制栏 / `J:上帧` `K:暂停/继续` `L:下帧`
1. **⌨️ 空格按键**：若当前是静态图则切换下一张，若是动图则暂停/播放
1. **❌ 快捷退出**：右键单击 / `ESC` 键

---

## 📂 支持的图像格式

- **静态**：`apng avif avifs bmp bpg dib exr gif hdr heic heif ico icon jfif jp2 jpe jpeg jpg jxl jxr livp pbm pfm pgm pic png pnm ppm psd pxm qoi ras sr svg tga tif tiff webp wp2`
- **动态**：`gif webp png apng jxl bpg`
- **实况**：`livp(IOS LivePhoto) jpg/heic/heif(Android MicroVideo/MotionPhoto)`
- **RAW**：`3fr ari arw bay cap cr2 cr3 crw dcr dcs dng drf eip erf fff gpr iiq k25 kdc mdc mef mos mrw nef nrw orf pef ptx r3d raf raw rw2 rwl rwz sr2 srf srw x3f`

---

## 🖨 打印/编辑

进入打印功能可以简单调整图像的 `对比度`、`亮度`、`是否反色` 等等，然后再决定 **另存为** 其他图像文件或 **继续打印**。

还可以选择颜色模式：`彩色`、`黑白`、`黑白文档`、`黑白点阵`。

1. **黑白文档**: 均衡全图亮度，突出字迹，避免局部阴影的观感影响，适合打印拍摄的文字纸张图像。
1. **黑白点阵**: 使用纯黑像素的分布密度模拟像素灰度值。此模式适合针式打印机和热敏打印机，也能打印出较好的图像效果。

![printerPreview](/images/jarkviewer/printerPreview.png)

## 🗃️ 其他

1. 🍀 全静态链接编译，原生绿色单文件
1. ✅ 自动记忆上次窗口位置/尺寸
1. ♟️ 图片透明区域使用国际象棋棋盘背景
1. 📖 支持读取AI生成图像（如 Stable-Diffusion、Flux、ComfyUI）的提示词等信息【前提是图片中包含了提示词信息，不是所有的文生图图片都包含提示词信息的】

## 🔧 缺失 *dll* 解决方式

若启动时提示缺失 `MSVCP140.dll` 等，请下载并安装 VC++运行库: 

[下载 Microsoft Visual C++ 2015-2022 Redistributable (x64)](https://aka.ms/vs/17/release/vc_redist.x64.exe)
