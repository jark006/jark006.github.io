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
[Github Releases](https://github.com/jark006/jarkViewer/releases) |
[夸克网盘](https://pan.quark.cn/s/074579d89b47)|
[百度云盘 提取码：6666](https://pan.baidu.com/s/1ka7p__WVw2du3mnOfqWceQ?pwd=6666)

![预览](/images/jarkviewer/preview.png)

## ✨ 操作方式

1. **⏭ 切换图片**：窗口左右边缘 `单击/滚轮` / `左/右` 方向键 / `空格` 键
1. **🔍 放大缩小**：窗口中间滚轮 / `上/下`方向键
1. **🔄 旋转图片**：窗口左上角或右上角 `单击/滚轮` / `Q/E` 键
1. **🖱️ 平移图片**：鼠标拖动 / `W/A/S/D` 键
1. **ℹ️ 图像信息**：点击滚轮 / `I` 键
1. **🖥️ 切换全屏**：双击窗口 / `F11` 键
1. **❌ 快捷退出**：右键单击 / `ESC` 键

---

## ⚙️ 其他功能  

1. ✅ 自动记忆上次窗口位置/尺寸  
2. 📖 支持读取AI生成图像（如 Stable-Diffusion、Flux）的提示词等信息【前提是图片中包含了提示词信息，不是所有的文生图图片都包含提示词信息的】

---

## 📂 支持的图像格式

- **静态图像**：`avif avifs bmp bpg dib exr gif hdr heic heif ico icon jfif jp2 jpe jpeg jpg jxl jxr pbm pfm pgm pic png pnm ppm psd pxm ras sr svg tga tif tiff webp wp2` 等
- **动态图像**：`gif webp png apng jxl bpg`  
- **RAW格式**：`crw pef sr2 cr2 cr3 nef arw 3fr srf orf rw2 dng raf raw kdc x3f mrw` 等  

## ⚓ 关联文件格式

将脚本 `associate_images.bat` （[下载](https://github.com/jark006/jarkViewer/releases/download/v1.22/associate_images.bat)） 放置到 `jarkViewer.exe` 同一目录下，右键管理员身份运行即可关联图片格式。

## 🚫 取消关联文件格式

将脚本 `associate_images_uninstall.bat` （[下载](https://github.com/jark006/jarkViewer/releases/download/v1.22/associate_images_uninstall.bat)） 右键管理员身份运行即可取消 `jarkViewer` 的关联。

---

## 🔧 DLL 缺失解决方案

请下载并安装 [Microsoft Visual C++ 2015-2022 Redistributable (x64)](https://aka.ms/vs/17/release/vc_redist.x64.exe)。
