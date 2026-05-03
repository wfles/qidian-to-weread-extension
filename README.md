# 起点转微信读书助手

一个 Chrome 浏览器扩展，在起点中文网书籍详情页自动检测该书是否在微信读书上架。

[**安装 Chrome 扩展**](https://chromewebstore.google.com/detail/%E8%B5%B7%E7%82%B9%E8%BD%AC%E5%BE%AE%E4%BF%A1%E8%AF%BB%E4%B9%A6%E5%8A%A9%E6%89%8B/okkipbkofbldjalgcdoeoppcdjkkagja)

## 功能

- 打开起点书籍页面时，自动搜索微信读书
- 书名 + 作者名交叉模糊匹配，精准定位对应书籍
- 匹配成功：在书名右侧显示「微信读书」跳转链接
- 匹配失败：不显示任何内容，页面无感知
- 使用 Shadow DOM 隔离样式，不影响起点页面原有排版

## 安装

1. 下载或克隆本项目到本地
2. 打开 Chrome，地址栏输入 `chrome://extensions` 回车
3. 右上角打开「开发者模式」
4. 点击「加载已解压的扩展程序」，选择本项目文件夹
5. 安装完成

## 使用

正常浏览起点中文网即可。打开任意书籍详情页（如 `qidian.com/book/1035420986/`），扩展自动检测：

- **匹配成功** — 书名右侧出现绿色的「微信读书」链接，点击跳转至微信读书对应书籍
- **匹配失败** — 页面无任何变化

## 技术实现

- **Manifest V3** Chrome 扩展
- **Background Service Worker** 代理请求，绕过 CORS 限制
- **MutationObserver** 监听 DOM 变化，尽早获取书名信息
- **Shadow DOM** 隔离扩展样式，避免与页面样式冲突
- **模糊匹配** 书名 + 作者双维度交叉匹配，支持子串匹配与字符相似度计算

## 文件说明

| 文件 | 说明 |
|------|------|
| `manifest.json` | 扩展配置 |
| `content.js` | 内容脚本，提取书名、匹配逻辑、UI 插入 |
| `background.js` | 后台服务，搜索微信读书并解析结果 |

## 版本历史

### v2.0

- 书名 + 作者交叉模糊匹配，避免误匹配同作者的其他书籍
- 书名右侧 inline 显示，Shadow DOM 隔离样式
- MutationObserver 替代固定延迟，加快加载速度

### v1.0

- 初始版本

## 许可

MIT
