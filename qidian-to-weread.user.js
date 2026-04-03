// ==UserScript==
// @name         起点转微信读书助手
// @namespace    https://github.com
// @version      1.3.0
// @description  在起点中文网页面自动检索该书是否在微信读书上架，并提供跳转按钮
// @author       书荒菌
// @match        https://www.qidian.com/book/*
// @grant        GM_xmlhttpRequest
// @connect      api.youdianzishu.com
// @run-at       document-idle
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    try {
        console.log('[起点助手] 脚本已加载！');

        // API 服务器地址
        const REST_URL = 'https://api.youdianzishu.com/v2';

        // 从起点页面获取书籍信息
        function getBookInfoFromQidian() {
            try {
                console.log('[起点助手] 开始获取书籍信息...');

                // 获取书名
                const titleSelectors = [
                    'h1.book-info-title',
                    '.book-info-title',
                    'h1',
                    '.book-title'
                ];

                let bookTitle = '';
                for (const selector of titleSelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.textContent.trim()) {
                        bookTitle = element.textContent.trim();
                        if (bookTitle.length > 2 && bookTitle.length < 50) {
                            console.log('[起点助手] 书名: ' + bookTitle);
                            break;
                        }
                    }
                }

                // 获取作者
                const authorSelectors = [
                    '.book-info-author',
                    '.author',
                    '[data-book-author]'
                ];

                let bookAuthor = '';
                for (const selector of authorSelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.textContent.trim()) {
                        let authorText = element.textContent.trim();
                        // 清理前缀
                        authorText = authorText
                            .replace(/^(作者|著|作)[：:：\s]*/, '')
                            .replace(/^[：:：\s]+/, '')
                            .trim();

                        if (authorText.length > 1 && authorText.length < 30) {
                            bookAuthor = authorText;
                            console.log('[起点助手] 作者: ' + bookAuthor);
                            break;
                        }
                    }
                }

                if (!bookTitle || !bookAuthor) {
                    console.error('[起点助手] 无法获取书名或作者');
                    return null;
                }

                return {
                    title: bookTitle,
                    author: bookAuthor
                };
            } catch (error) {
                console.error('[起点助手] 获取书籍信息失败:', error);
                return null;
            }
        }

        // 查询微信读书
        function queryWeread(bookInfo, callback) {
            var url = REST_URL + '/weread?title=' + encodeURIComponent(bookInfo.title) + '&author=' + encodeURIComponent(bookInfo.author) + '&version=1.0.0&r=' + Math.random();

            console.log('[起点助手] ===== 查询微信读书 =====');
            console.log('[起点助手] URL: ' + url);

            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                headers: {
                    'User-agent': navigator.userAgent,
                    'Accept': 'application/json'
                },
                onload: function(response) {
                    console.log('[起点助手] ===== API 响应 =====');
                    console.log('[起点助手] 状态码: ' + response.status);
                    console.log('[起点助手] 响应: ' + response.responseText);

                    try {
                        var result = JSON.parse(response.responseText);
                        callback(result);
                    } catch (e) {
                        console.error('[起点助手] 解析失败:', e);
                        callback({ errmsg: '解析失败' });
                    }
                },
                onerror: function(error) {
                    console.error('[起点助手] 请求失败:', error);
                    callback({ errmsg: '网络请求失败' });
                },
                timeout: 10000,
                ontimeout: function() {
                    console.error('[起点助手] 请求超时');
                    callback({ errmsg: '请求超时' });
                }
            });
        }

        // 创建按钮
        function createButton(url, isSearch, title, author) {
            var button = document.createElement('a');
            button.className = 'qidian-to-weread-btn';

            if (isSearch) {
                button.href = 'https://weread.qq.com/web/search/books?keyword=' + encodeURIComponent(title + ' ' + author);
                button.textContent = '🔍 去微信读书搜索';
                button.style.background = 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)';
                button.style.color = '#333';
            } else {
                button.href = url;
                button.target = '_blank';
                button.textContent = '📖 去微信读书阅读';
                button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                button.style.color = 'white';
            }

            button.style.display = 'inline-flex';
            button.style.alignItems = 'center';
            button.style.gap = '6px';
            button.style.padding = '10px 20px';
            button.style.textDecoration = 'none';
            button.style.borderRadius = '4px';
            button.style.fontSize = '14px';
            button.style.fontWeight = '500';
            button.style.cursor = 'pointer';
            button.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
            button.style.border = 'none';
            button.style.marginLeft = '10px';

            return button;
        }

        // 插入按钮
        function insertButton(button) {
            var positions = ['.book-info-actions', '.book-info', '.detail-wrap'];

            for (var i = 0; i < positions.length; i++) {
                var element = document.querySelector(positions[i]);
                if (element) {
                    element.appendChild(button);
                    return true;
                }
            }

            return false;
        }

        // 主函数
        function main() {
            console.log('[起点助手] ===== 开始执行 =====');

            // 获取书籍信息
            var bookInfo = getBookInfoFromQidian();

            if (!bookInfo) {
                console.error('[起点助手] 无法获取书籍信息');
                return;
            }

            console.log('[起点助手] 书籍信息:', bookInfo);

            // 查询微信读书
            queryWeread(bookInfo, function(result) {
                console.log('[起点助手] ===== 查询结果 =====');
                console.log('[起点助手] 结果:', result);

                var button;
                if (result.errmsg === '' && result.data && result.data.url) {
                    console.log('[起点助手] ✅ 找到书籍！');
                    button = createButton(result.data.url, false, '', '');
                } else {
                    console.log('[起点助手] ❌ 未找到书籍');
                    button = createButton(null, true, bookInfo.title, bookInfo.author);
                }

                var inserted = insertButton(button);
                if (inserted) {
                    console.log('[起点助手] ✅ 按钮添加成功');
                } else {
                    console.log('[起点助手] ⚠️ 使用固定定位');
                    document.body.appendChild(button);
                    button.style.position = 'fixed';
                    button.style.top = '20px';
                    button.style.right = '20px';
                    button.style.zIndex = '999999';
                }
            });
        }

        // 延迟执行
        setTimeout(function() {
            try {
                main();
            } catch (e) {
                console.error('[起点助手] 主函数执行失败:', e);
            }
        }, 2000);

        console.log('[起点助手] 脚本初始化完成，2秒后开始执行');

    } catch (e) {
        console.error('[起点助手] 脚本初始化失败:', e);
    }

})();
