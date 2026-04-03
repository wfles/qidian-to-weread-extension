# 图标文件说明

此插件需要三个尺寸的图标文件：
- icon16.png (16x16)
- icon48.png (48x48)
- icon128.png (128x128)

## 创建图标的方法

### 方法1: 使用在线工具
访问 https://www.favicon-generator.org/ 或类似网站，上传图片并生成多尺寸图标。

### 方法2: 使用本地工具（推荐）

如果你有 ImageMagick：
```bash
# 创建一个简单的图标
convert -size 128x128 xc:none -fill '#667eea' -draw 'roundrectangle 10,10 118,118 20,20' -gravity center -pointsize 60 -fill white -annotate +0+0 '读' icon128.png
convert icon128.png -resize 48x48 icon48.png
convert icon128.png -resize 16x16 icon16.png
```

### 方法3: 使用占位图标

暂时可以使用任意PNG图片，只需重命名即可。插件仍可正常工作，只是图标显示不同。

## 临时解决方案

如果你暂时没有图标文件，可以：
1. 从 manifest.json 中删除 icons 部分
2. 或者使用任意图片重命名为对应的图标文件名

插件功能不受影响，只是在扩展管理页面会显示默认图标。
