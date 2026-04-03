var WEREAD_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABMlBMVEU4tP83tP8ysf8xsf8ysP8xsP8xr/8xrv8xrf8xrf4xrP8xrP4wrP4wq/4wqv4wqf4wqP4vqP4vp/4up/4rpv4rpf4tpv5Arf53xP6X0v6Fy/5Utv4upv4vpv4tpf5Utf7Q6v/8/v/////s9/+Mzf4wpv40p/7C5P/W7f+T0P7+/v/L6P+a0//z+v9lvP4rpP4vpf4tpP5Hr/7o9f/q9v/H5//+///k8//K6P8qo/4upP46qf7T7P/9/v94xP4vpP4so/52w/7v+P/B5P88qf4to/4uo/4tov6g1f7S6//d8P+X0f5Aq/4sov5DrP42pv4+qv43p/4rof4roP0roPwrof0uov4qoP0qoPyWzvmWzfmTzPlsu/ozo/z3+/73/P7t9v2IyPv0+v72+/7k8v31+v52qLiyAAAAAWJLR0QiXWVcrAAAAAd0SU1FB+QKERMSBxvkIzYAAAFFSURBVDjLhYqHUsJAFEWfcWMQNRQFayyxYsWuawk2ELsiKKFI/f9fcN9uZtgENGfuK3PmAvxFn3OVfoaiiAhcAhSFOJ5dQviWBRCiElVVCcGt4nYLGPDBv6D5AFogoGkifDSPgAAyyCPRERAcQoJOxJUFDCNBZ8RyCRjxgRV059X5o3sE6D5ACNFDHjoCQj5AWCbC4xIQQaKRzgnzd3QsFovjD9GexMcnJqemZ9gHhpso37Nz8wumubi0bBjegmBldS2xvrG5tb1jQLIHu3v7B4dHxydm4jTZs0DPzk3k4pIVLItSi0HxUkskdXWNhZvbOwvSHMpCnQfJ3Gcfso9Pz+m0U+ji5fXt/SPDHsghnzyMfKGQ5+Ir981FDoq2bRdx4SmVK5VySRJFG6oSP9VavV5jRwIaLpqtVtNtPIVGu934v9DFL75RivuAiiVCAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIwLTEwLTE3VDExOjI2OjE5KzA4OjAwmsnyVQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMC0xMC0xN1QxMToxODowNyswODowMPAqZ5gAAAAASUVORK5CYII=';

// 模糊相似度计算（0~1）
function calcSimilarity(s1, s2) {
  if (!s1 || !s2) return 0;
  s1 = s1.replace(/[\s\p{P}]/gu, '').toLowerCase();
  s2 = s2.replace(/[\s\p{P}]/gu, '').toLowerCase();
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;
  // 子串匹配
  if (s1.indexOf(s2) !== -1 || s2.indexOf(s1) !== -1) return 0.9;
  // 字符重合度
  var common = 0;
  var s2copy = s2;
  for (var i = 0; i < s1.length; i++) {
    var idx = s2copy.indexOf(s1[i]);
    if (idx !== -1) {
      common++;
      s2copy = s2copy.substring(0, idx) + s2copy.substring(idx + 1);
    }
  }
  return (2 * common) / (s1.length + s2.length);
}

function tryMatch() {
  try {
    if (!window.location.pathname.match(/^\/book\/\d+/)) {
      return;
    }

    var bookTitle = '';
    var bookAuthor = '';
    var metaTitle = document.querySelector('meta[property="og:novel:book_name"]');
    if (metaTitle && metaTitle.content) {
      bookTitle = metaTitle.content.trim();
    }
    var metaAuthor = document.querySelector('meta[property="og:novel:author"]');
    if (metaAuthor && metaAuthor.content) {
      bookAuthor = metaAuthor.content.trim();
    }
    if (!bookTitle) {
      var h1 = document.querySelector('h1');
      if (h1 && h1.textContent.trim().length > 2) {
        bookTitle = h1.textContent.trim();
      }
    }
    if (!bookTitle) {
      return;
    }

    _matchSent = true; // 防止重复请求

    chrome.runtime.sendMessage(
      { action: 'searchWeread', keyword: bookTitle, author: bookAuthor },
      function(response) {
        if (chrome.runtime.lastError || !response || !response.results || response.results.length === 0) {
          return;
        }

        var results = response.results;
        var bestMatch = null;
        var bestScore = 0;

        for (var i = 0; i < results.length; i++) {
          var r = results[i];
          var titleScore = calcSimilarity(r.title, bookTitle);
          // 书名相似度必须 >= 0.35，否则直接跳过（避免只靠作者名匹配到其他书）
          if (titleScore < 0.35) continue;
          var authorScore = bookAuthor ? calcSimilarity(r.author, bookAuthor) : 0.5;
          var totalScore = titleScore * 0.5 + authorScore * 0.5;

          if (totalScore > bestScore) {
            bestScore = totalScore;
            bestMatch = r;
          }
        }

        if (!bestMatch) {
          return;
        }

        var wereadUrl = 'https://weread.qq.com/web/bookDetail/' + bestMatch.bookId;

        // 找到书名元素
        var titleEl = document.querySelector('h1');
        if (!titleEl) {
          return;
        }

        // 创建 shadow host，inline 插入 h1 内部末尾
        var host = document.createElement('span');
        host.style.cssText = 'display:inline-block; vertical-align:middle; margin-left:10px;';
        titleEl.appendChild(host);

        // 用 Shadow DOM 隔离样式
        var shadow = host.attachShadow({ mode: 'closed' });

        var link = document.createElement('a');
        link.href = wereadUrl;
        link.target = '_blank';
        link.title = '去微信读书阅读 · ' + bestMatch.title;
        link.style.cssText =
          'display:inline-flex; align-items:center; gap:4px;' +
          'color:#07c160; text-decoration:none;' +
          'font-size:13px; font-weight:500; cursor:pointer;' +
          'white-space:nowrap; line-height:18px;' +
          'font-family:-apple-system,BlinkMacSystemFont,sans-serif;' +
          'transition:opacity 0.15s;';
        link.onmouseover = function() { this.style.opacity = '0.7'; };
        link.onmouseout = function() { this.style.opacity = '1'; };

        var logo = document.createElement('img');
        logo.src = WEREAD_ICON;
        logo.style.cssText = 'width:16px;height:16px;border-radius:50%;border:none;vertical-align:middle;';

        var text = document.createElement('span');
        text.textContent = '微信读书';

        link.appendChild(logo);
        link.appendChild(text);
        shadow.appendChild(link);
      }
    );
  } catch (e) {}
}

var _matchSent = false;

// 立即尝试，如果 meta 标签已存在则直接执行
tryMatch();

// 如果首次未获取到书名，用 MutationObserver 监听 DOM 变化
var observer = new MutationObserver(function() {
  if (_matchSent) {
    observer.disconnect();
    return;
  }
  var meta = document.querySelector('meta[property="og:novel:book_name"]');
  var h1 = document.querySelector('h1');
  if ((meta && meta.content) || (h1 && h1.textContent.trim().length > 2)) {
    tryMatch();
    if (_matchSent) {
      observer.disconnect();
    }
  }
});
observer.observe(document.documentElement, { childList: true, subtree: true });

// 安全兜底：3秒后强制停止监听
setTimeout(function() {
  observer.disconnect();
}, 3000);
